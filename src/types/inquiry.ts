/** 与任务书 cta_key 一致 */
export type CtaKey =
  | "quote"
  | "drawing"
  | "sample"
  | "datasheet"
  | "catalog"
  | "fast_quote"
  | "engineer";

export type InquiryType =
  | "rfq"
  | "sample_request"
  | "drawing_submission"
  | "technical_inquiry";

/** 提交 API / CRM 的载荷（字段 snake_case） */
export type InquirySubmission = {
  name: string;
  company: string;
  email: string;
  phone_or_whatsapp: string | null;
  country: string;
  /** 单轨：应用场景/行业线索 */
  application_interest: string | null;
  motor_type: string | null;
  power: string | null;
  shaft_diameter: string | null;
  estimated_quantity: string | null;
  /** 单轨：Split / Solid / Custom 或 slug */
  product_interest: string | null;
  /** 上传后的 URL，或先占位 */
  drawing_file_url: string | null;
  /** 客户端所选文件名（未上传成功前） */
  drawing_file_name: string | null;
  message: string | null;
  inquiry_type: InquiryType;
  /** 来源渠道标识，如 "website_jsvolsun" */
  source_channel_standard?: string;
  /** 线索内容描述，如 "download: Volsun Product Catalog" */
  inquiry_content?: string;
  page_source: string;
  cta_source: string;
  cta_key: CtaKey | null;
  submitted_at: string;
};

export type InquiryDeliveryStatus = "pending" | "smtp_success" | "smtp_failed" | "smtp_skipped";

export type InquiryPersistRecord = {
  request_id: string;
  created_at: string;
  payload: InquirySubmission;
  delivery_status: InquiryDeliveryStatus;
  smtp_error: string | null;
};
