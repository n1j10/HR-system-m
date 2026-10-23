import { Label } from "@/components/ui/label";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
};

/** A label on top of an input, with an optional small hint below it. */
export function FormField({ label, htmlFor, children, hint }: FormFieldProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}
