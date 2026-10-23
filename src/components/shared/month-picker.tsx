import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { MONTH_NAMES } from "@/lib/format";

/** A GET form that puts ?month=10&year=2026 in the URL. */
export function MonthPicker({ month, year }: { month: number; year: number }) {
  return (
    <form method="GET" className="mb-4 flex flex-wrap gap-2">
      <NativeSelect name="month" defaultValue={String(month)} className="w-40">
        {MONTH_NAMES.map((monthName, index) => (
          <NativeSelectOption key={monthName} value={String(index + 1)}>
            {monthName}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <Input name="year" type="number" min={2000} max={2100} defaultValue={year} className="w-24" />
      <Button type="submit" variant="secondary"><SearchIcon /> Show</Button>
    </form>
  );
}
