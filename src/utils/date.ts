import { format, formatDistanceToNow as dateFnsFormatDistanceToNow, isValid, parseISO } from "date-fns";

export function formatDate(date: Date | string | number | null | undefined, formatStr = "MMM d, yyyy"): string {
  if (!date) return "";
  
  const parsedDate = typeof date === "string" ? parseISO(date) : new Date(date);
  
  if (!isValid(parsedDate)) return "";
  return format(parsedDate, formatStr);
}

export function formatDateTime(date: Date | string | number | null | undefined): string {
  return formatDate(date, "MMM d, yyyy h:mm a");
}

export function formatRelativeTime(date: Date | string | number | null | undefined): string {
  if (!date) return "";
  
  const parsedDate = typeof date === "string" ? parseISO(date) : new Date(date);
  if (!isValid(parsedDate)) return "";
  
  return dateFnsFormatDistanceToNow(parsedDate, { addSuffix: true });
}
