import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

export type SelectOption = { value: string; label: string };

type OptionSelectProps = {
  id: string;
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  /** Adds an empty first option, e.g. "Select a department". */
  placeholder?: string;
  required?: boolean;
  className?: string;
};

/** A dropdown for database rows (departments, employees, ...). */
export function OptionSelect({ options, placeholder, className = "w-full", ...selectProps }: OptionSelectProps) {
  return (
    <NativeSelect className={className} {...selectProps}>
      {placeholder !== undefined && <NativeSelectOption value="">{placeholder}</NativeSelectOption>}
      {options.map((option) => (
        <NativeSelectOption key={option.value} value={option.value}>
          {option.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}

/** ["Laptop", "Phone"] -> [{ value: "Laptop", label: "Laptop" }, ...] */
export function toSelectOptions(values: string[]): SelectOption[] {
  return values.map((value) => ({ value, label: value }));
}
