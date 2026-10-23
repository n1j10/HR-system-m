type SearchParamValue = string | string[] | undefined;

/** Reads one value from the URL search params. Empty values become undefined. */
export function getSearchParam(value: SearchParamValue): string | undefined {
  const singleValue = Array.isArray(value) ? value[0] : value;
  return singleValue?.trim() || undefined;
}

/** Reads ?page=3. Anything invalid becomes page 1. */
export function getPageNumber(value: SearchParamValue): number {
  const page = Number(getSearchParam(value));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/** Reads ?month=10&year=2026. Falls back to the current month. */
export function getMonthAndYear(monthValue: SearchParamValue, yearValue: SearchParamValue) {
  const now = new Date();
  const month = Number(getSearchParam(monthValue));
  const year = Number(getSearchParam(yearValue));

  return {
    month: month >= 1 && month <= 12 ? month : now.getMonth() + 1,
    year: year >= 2000 && year <= 2100 ? year : now.getFullYear(),
  };
}

/** Reads ?date=2026-10-21. Returns undefined when missing or not a real date. */
export function getDateParam(value: SearchParamValue): Date | undefined {
  const dateText = getSearchParam(value);
  if (!dateText || !/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return undefined;

  const date = new Date(dateText);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
