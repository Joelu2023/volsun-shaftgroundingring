/**
 * 企业微信告警构造与脱敏（P0-3 内核）
 *
 * 纯逻辑模块：分级、脱敏、消息体构造。不发送、不接通道。
 * 设计依据：WECHAT_ALERT_DESIGN.md
 *
 * 红线：客户敏感字段（email/phone/name/company/正文）禁止进入群消息。
 * 通道未完成配置与授权前，本模块不代表告警已上线。
 */

export type AlertLevel = "P1" | "P2" | "P3";

export type AlertInput = {
  /** 询盘公开编号，如 INQ-20261125-XXXX */
  publicNumber: string;
  /** 异常时间（ISO 字符串） */
  occurredAt: string;
  /** 异常类型代码 */
  type: AlertType;
  /** 可选补充上下文（必须为已脱敏的非敏感值） */
  detail?: string;
};

export type AlertType =
  | "db_unavailable"
  | "inquiry_submit_failed"
  | "retry_exhausted"
  | "pending_backlog"
  | "email_failed_once"
  | "config_missing";

const TYPE_LEVEL: Record<AlertType, AlertLevel> = {
  db_unavailable: "P1",
  inquiry_submit_failed: "P1",
  retry_exhausted: "P2",
  pending_backlog: "P2",
  email_failed_once: "P3",
  config_missing: "P3",
};

const TYPE_LABEL: Record<AlertType, string> = {
  db_unavailable: "数据库故障",
  inquiry_submit_failed: "询盘提交失败",
  retry_exhausted: "邮件重试耗尽",
  pending_backlog: "待通知积压",
  email_failed_once: "单次通知失败",
  config_missing: "配置异常",
};

/** 责任岗位（Owner 已定分工；只写岗位，不写虚构姓名）。 */
const TYPE_OWNER: Record<AlertType, string> = {
  db_unavailable: "IT负责人",
  inquiry_submit_failed: "IT负责人",
  retry_exhausted: "销售运营负责人 + IT负责人",
  pending_backlog: "销售运营负责人",
  email_failed_once: "IT负责人",
  config_missing: "IT负责人",
};

export function classifyAlertLevel(type: AlertType): AlertLevel {
  return TYPE_LEVEL[type];
}

/** 敏感字段样本 —— 仅用于测试断言，确保这些值不出现在消息体中。 */
export const SENSITIVE_FIELD_KEYS = [
  "email",
  "phone_or_whatsapp",
  "phone",
  "name",
  "company",
  "message",
  "drawing_file_url",
] as const;

/**
 * 脱敏（fail-closed）：detail 只接受"安全 token"——全大写错误码 / 数字计数 /
 * 少量分隔符。任何含小写字母（自然语言，可能是姓名/公司/正文）或 @ 等特殊字符的
 * 输入整体替换为占位符，绝不透传。
 *
 * 这样即使调用方误把客户 PII 塞进 detail，也不会进入群消息。
 */
export function sanitizeDetail(raw: string | undefined): string {
  if (!raw) return "";
  const value = raw.trim().slice(0, 200);
  if (!value) return "";
  // 安全字符集：大写字母、数字、下划线、连字符、冒号、斜杠、空格、逗号。
  // 小写字母 / @ / < / > / + 等一律视为不安全 → 整体脱敏。
  if (/[^A-Z0-9_\-:/ ,]/.test(value)) return "[redacted-detail]";
  return value;
}

export type SanitizedAlert = {
  level: AlertLevel;
  publicNumber: string;
  occurredAt: string;
  type: AlertType;
  typeLabel: string;
  ownerRole: string;
  handoffUrl: string;
  detail: string;
};

/** 构造脱敏告警对象。所有字段均为非敏感。 */
export function buildSanitizedAlert(
  input: AlertInput,
  baseUrl = "https://www.volsunsgr.com",
): SanitizedAlert {
  const publicNumber = normalizeErrorCodeSafe(input.publicNumber);
  return {
    level: classifyAlertLevel(input.type),
    publicNumber,
    occurredAt: input.occurredAt,
    type: input.type,
    typeLabel: TYPE_LABEL[input.type],
    ownerRole: TYPE_OWNER[input.type],
    handoffUrl: `${baseUrl}/admin/inquiries?number=${encodeURIComponent(publicNumber)}`,
    detail: sanitizeDetail(input.detail),
  };
}

/** 编号清洗：仅保留安全的编号字符，避免注入。 */
function normalizeErrorCodeSafe(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64) || "UNKNOWN";
}

/** 渲染为企业微信群消息文本（仅岗位，无姓名，无客户信息）。 */
export function renderAlertText(alert: SanitizedAlert): string {
  const lines = [
    `[${alert.level}][询盘告警] ${alert.typeLabel}`,
    `编号：${alert.publicNumber}`,
    `时间：${alert.occurredAt}`,
    `类型：${alert.type}`,
    `责任岗位：${alert.ownerRole}`,
    `处理入口：${alert.handoffUrl}`,
  ];
  if (alert.detail) lines.push(`说明：${alert.detail}`);
  return lines.join("\n");
}
