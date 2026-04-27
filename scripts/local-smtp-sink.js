"use strict";

const fs = require("node:fs");
const path = require("node:path");
const net = require("node:net");

const port = Number(process.env.SMTP_SINK_PORT || 2525);
const host = process.env.SMTP_SINK_HOST || "127.0.0.1";
const logDir = path.join(process.cwd(), ".data", "smtp-sink");
const logPath = path.join(logDir, "messages.log");

fs.mkdirSync(logDir, { recursive: true });

function appendLog(message) {
  fs.appendFileSync(logPath, `${message}\n`, "utf8");
}

const server = net.createServer((socket) => {
  socket.setEncoding("utf8");

  let buffer = "";
  let inData = false;
  let authLoginPending = false;
  let authLoginUsernamePending = false;
  let dataLines = [];

  const respond = (line) => socket.write(`${line}\r\n`);

  respond("220 local-smtp-sink ready");

  socket.on("data", (chunk) => {
    buffer += chunk;

    while (buffer.includes("\r\n")) {
      const index = buffer.indexOf("\r\n");
      const line = buffer.slice(0, index);
      buffer = buffer.slice(index + 2);

      if (inData) {
        if (line === ".") {
          inData = false;
          appendLog(`--- ${new Date().toISOString()} ---\n${dataLines.join("\n")}\n`);
          dataLines = [];
          respond("250 Message accepted");
          continue;
        }
        dataLines.push(line);
        continue;
      }

      const upper = line.toUpperCase();

      if (authLoginPending) {
        authLoginPending = false;
        authLoginUsernamePending = true;
        respond("334 UGFzc3dvcmQ6");
        continue;
      }

      if (authLoginUsernamePending) {
        authLoginUsernamePending = false;
        respond("235 Authentication successful");
        continue;
      }

      if (upper.startsWith("EHLO") || upper.startsWith("HELO")) {
        socket.write("250-local-smtp-sink\r\n250-AUTH LOGIN PLAIN\r\n250 OK\r\n");
        continue;
      }

      if (upper.startsWith("AUTH PLAIN")) {
        respond("235 Authentication successful");
        continue;
      }

      if (upper === "AUTH LOGIN" || upper.startsWith("AUTH LOGIN ")) {
        if (upper === "AUTH LOGIN") {
          authLoginPending = true;
          respond("334 VXNlcm5hbWU6");
        } else {
          authLoginUsernamePending = true;
          respond("334 UGFzc3dvcmQ6");
        }
        continue;
      }

      if (upper.startsWith("MAIL FROM:")) {
        respond("250 OK");
        continue;
      }

      if (upper.startsWith("RCPT TO:")) {
        respond("250 OK");
        continue;
      }

      if (upper === "DATA") {
        inData = true;
        dataLines = [];
        respond("354 End data with <CR><LF>.<CR><LF>");
        continue;
      }

      if (upper === "QUIT") {
        respond("221 Bye");
        socket.end();
        continue;
      }

      respond("250 OK");
    }
  });

  socket.on("error", (error) => {
    appendLog(`[socket-error] ${error.message}`);
  });
});

server.listen(port, host, () => {
  appendLog(`[server-started] ${host}:${port}`);
  console.log(`local-smtp-sink listening on ${host}:${port}`);
});
