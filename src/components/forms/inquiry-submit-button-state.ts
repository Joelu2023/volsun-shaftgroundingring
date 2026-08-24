export type InquirySubmitStatus = "idle" | "loading" | "success" | "dev-success" | "error";

export function getInquirySubmitButtonState(status: InquirySubmitStatus): {
  disabled: boolean;
  labelKey: "submit" | "submitting" | "submitted";
} {
  if (status === "loading") {
    return { disabled: true, labelKey: "submitting" };
  }
  if (status === "success") {
    return { disabled: true, labelKey: "submitted" };
  }
  return { disabled: false, labelKey: "submit" };
}
