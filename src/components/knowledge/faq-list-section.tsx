import type { FaqItem } from "@/data/mock/faq";

type FaqDisplayItem = Pick<FaqItem, "id"> & { question: string; answer: string };

type Props = {
  items: FaqDisplayItem[];
};

export function FaqListSection({ items }: Props) {
  return (
    <dl className="mt-10 space-y-8">
      {items.map((f) => (
        <div key={f.id}>
          <dt className="text-lg font-semibold text-slate-900">{f.question}</dt>
          <dd className="mt-2 text-slate-600">{f.answer}</dd>
        </div>
      ))}
    </dl>
  );
}
