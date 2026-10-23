import { EmployeeStatus } from "@prisma/client";
import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnumSelect } from "@/components/shared/enum-select";
import { OptionSelect, type SelectOption } from "@/components/shared/option-select";

type EmployeeFiltersProps = {
  departmentOptions: SelectOption[];
  currentFilters: { search?: string; departmentId?: string; status?: string };
};

/** A plain GET form: submitting it puts the filters in the URL (?search=...&status=...). */
export function EmployeeFilters({ departmentOptions, currentFilters }: EmployeeFiltersProps) {
  return (
    <form method="GET" className="mb-4 flex flex-wrap gap-2">
      <Input name="search" placeholder="Search name, email or number" defaultValue={currentFilters.search} className="w-64" />
      <OptionSelect id="departmentId" name="departmentId" options={departmentOptions} defaultValue={currentFilters.departmentId ?? ""} placeholder="All departments" className="w-48" />
      <EnumSelect id="status" name="status" values={Object.values(EmployeeStatus)} defaultValue={currentFilters.status ?? ""} placeholder="All statuses" className="w-40" />
      <Button type="submit" variant="secondary">
        <SearchIcon /> Filter
      </Button>
    </form>
  );
}
