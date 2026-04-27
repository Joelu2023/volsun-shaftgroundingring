import nodemailer from "nodemailer";

const COMPANY_SIGNATURE = "Volsun Team\nVolsun Shaft Grounding Rings";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.INQUIRY_EMAIL_FROM?.trim() || user;

  if (!host || !portRaw || !user || !pass || !from) {
    return null;
  }

  const port = Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) {
    return null;
  }

  return {
    host,
    port,
    user,
    pass,
    from,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
  };
}

export async function sendResourceDownloadEmail(input: {
  to: string;
  resourceTitle: string;
  downloadUrl: string;
}) {
  const smtp = getSmtpConfig();
  if (!smtp) {
    throw new Error("SMTP config missing or invalid");
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  const subject = `Thank you for downloading - ${input.resourceTitle}`;
  const text = [
    "Thank you for downloading.",
    "",
    `Resource: ${input.resourceTitle}`,
    `Download link: ${input.downloadUrl}`,
    "",
    COMPANY_SIGNATURE,
  ].join("\n");

  const html = [
    "<p>Thank you for downloading.</p>",
    `<p><strong>Resource:</strong> ${input.resourceTitle}</p>`,
    `<p><strong>Download link:</strong> <a href="${input.downloadUrl}">${input.downloadUrl}</a></p>`,
    `<p>${COMPANY_SIGNATURE.replace(/\n/g, "<br/>")}</p>`,
  ].join("");

  await transporter.sendMail({
    from: smtp.from,
    to: input.to,
    subject,
    text,
    html,
  });
}
