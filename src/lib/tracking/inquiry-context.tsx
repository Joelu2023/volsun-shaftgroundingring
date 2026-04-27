"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { CtaKey, InquiryType } from "@/types/inquiry";

export type InquiryContextValue = {
  pageSource: string;
  ctaSource: string;
  ctaKey: CtaKey | null;
  inquiryType: InquiryType | null;
  productInterest: string | null;
  applicationInterest: string | null;
  setCtaKey: (k: CtaKey | null) => void;
  setInquiryType: (t: InquiryType | null) => void;
  setProductInterest: (v: string | null) => void;
  setApplicationInterest: (v: string | null) => void;
};

const InquiryContext = createContext<InquiryContextValue | null>(null);

export function InquiryContextProvider({
  pageSource,
  ctaSource,
  children,
}: {
  pageSource: string;
  ctaSource: string;
  children: ReactNode;
}) {
  const [ctaKey, setCtaKey] = useState<CtaKey | null>(null);
  const [inquiryType, setInquiryType] = useState<InquiryType | null>(null);
  const [productInterest, setProductInterest] = useState<string | null>(null);
  const [applicationInterest, setApplicationInterest] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      pageSource,
      ctaSource,
      ctaKey,
      inquiryType,
      productInterest,
      applicationInterest,
      setCtaKey,
      setInquiryType,
      setProductInterest,
      setApplicationInterest,
    }),
    [pageSource, ctaSource, ctaKey, inquiryType, productInterest, applicationInterest],
  );

  return <InquiryContext.Provider value={value}>{children}</InquiryContext.Provider>;
}

export function useInquiryContext() {
  const ctx = useContext(InquiryContext);
  return ctx;
}
