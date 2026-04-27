import type { InquiryType } from "@/types/inquiry";
import type { AppLocale } from "@/lib/i18n/locales";

export const inquiryTypeOptions: { value: InquiryType; label: string }[] = [
  { value: "rfq", label: "RFQ" },
  { value: "sample_request", label: "Sample Request" },
  { value: "drawing_submission", label: "Drawing Submission" },
  { value: "technical_inquiry", label: "Technical Inquiry" },
];

const labelsByLocale: Record<AppLocale, Record<InquiryType, string>> = {
  en: {
    rfq: "RFQ",
    sample_request: "Sample Request",
    drawing_submission: "Drawing Submission",
    technical_inquiry: "Technical Inquiry",
  },
  zh: {
    rfq: "询盘（RFQ）",
    sample_request: "样品申请",
    drawing_submission: "图纸提交",
    technical_inquiry: "技术咨询",
  },
};

export function getInquiryTypeOptions(locale: AppLocale): { value: InquiryType; label: string }[] {
  const L = labelsByLocale[locale];
  return inquiryTypeOptions.map((o) => ({ ...o, label: L[o.value] }));
}
