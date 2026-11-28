/**
 * B1/B2 共同认可的重试耗尽事件合同（PR #45 P0 接线）。
 *
 * B1 负责在状态持久化成功后发出该事件；B2 负责把它映射为 P2 retry_exhausted 告警。
 * 事件不携带原始客户 PII：publicNumber 是脱敏后的业务编号，detail 只允许错误码类 token。
 */
export type RetryExhaustedEvent = {
  /** 业务公开编号，不是客户邮箱/电话/姓名。 */
  publicNumber: string;
  /** ISO 8601 时间戳。 */
  occurredAt: string;
  /** 可选错误码或简短原因；进入告警前仍会经过 alert-message 脱敏。 */
  detail?: string;
};
