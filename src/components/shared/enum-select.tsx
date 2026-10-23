import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { formatEnum } from "@/lib/format";

type EnumSelectProps = {
  id: string;
  name: string;
  values: readonly string[];
  defaultValue?: string;
  /** Adds an empty first option, e.g. "All statuses". */
  placeholder?: string;
  required?: boolean;
  className?: string;
};

/** A dropdown for Prisma enums. Shows "On leave" but sends "ON_LEAVE". */
export function EnumSelect({ values, placeholder, className = "w-full", ...selectProps }: EnumSelectProps) {
  return (
    <NativeSelect className={className} {...selectProps}>
      {placeholder !== undefined && <NativeSelectOption value="">{placeholder}</NativeSelectOption>}
      {values.map((value) => (
        <NativeSelectOption key={value} value={value}>
          {formatEnum(value)}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}
