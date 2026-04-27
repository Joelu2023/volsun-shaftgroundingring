"use client";

import type { InquiryType } from "@/types/inquiry";

type Props = {
  value: InquiryType;
  onChange: (v: InquiryType) => void;
  name?: string;
  options: { value: InquiryType; label: string }[];
  legend: string;
};

export function InquiryTypeSelector({ value, onChange, name = "inquiry_type", options, legend }: Props) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-800">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm ${
              value === opt.value ? "border-brand-orange bg-orange-50" : "border-slate-200"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
