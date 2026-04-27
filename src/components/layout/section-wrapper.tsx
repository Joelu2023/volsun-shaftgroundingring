import { cn } from "@/lib/utils/cn";

type SectionWrapperProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "bordered";
};

export function SectionWrapper({ id, children, className, variant = "default" }: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-14 md:py-20",
        variant === "muted" && "bg-slate-50",
        variant === "bordered" && "border-t border-slate-200",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-4">{children}</div>
    </section>
  );
}
