import { SUPPORTED_CURRENCIES } from "./constants.js";

export function roundMoney(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
}

export function normalizeMoneyValue(value) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return roundMoney(parsed, 2);
}

export function formatMoney(value) {
  return normalizeMoneyValue(value).toFixed(2);
}

export function formatCnyMoney(value) {
  return `¥${formatMoney(value)}`;
}

export function formatOriginalMoney(value, currency = "CNY") {
  const normalizedCurrency = normalizeCurrency(currency);
  if (normalizedCurrency === "CNY") {
    return formatCnyMoney(value);
  }
  return `${normalizedCurrency} ${formatMoney(value)}`;
}

export function formatMoneyWithOriginal(cnyValue, originalValue, currency = "CNY") {
  const normalizedCurrency = normalizeCurrency(currency);
  const cnyText = formatCnyMoney(cnyValue);
  if (normalizedCurrency === "CNY") {
    return cnyText;
  }
  return `${cnyText}（${formatOriginalMoney(originalValue, normalizedCurrency)}）`;
}

export function normalizeCurrency(value) {
  return SUPPORTED_CURRENCIES.includes(value) ? value : "CNY";
}

export function sanitizeWorkHours(value) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.round(parsed * 1000) / 1000;
}

export function formatHours(value) {
  const hours = sanitizeWorkHours(value);
  return hours ? hours.toFixed(3).replace(/\.?0+$/, "") : "";
}

export function formatHourlyRate(rate) {
  const parsed = Number(rate);
  if (!Number.isFinite(parsed) || parsed <= 0) return "";
  return parsed.toFixed(2).replace(/\.?0+$/, "");
}

export function formatDateInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function parseDateKey(value) {
  const safe = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(safe)) return null;
  const [year, month, day] = safe.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return formatDateInput(date) === safe ? date : null;
}

export function normalizeDateKey(value) {
  const parsed = parseDateKey(value);
  return parsed ? formatDateInput(parsed) : "";
}

export function addDaysToDateKey(value, offsetDays = 0) {
  const parsed = parseDateKey(value);
  if (!parsed) return "";
  const date = new Date(parsed);
  date.setDate(date.getDate() + (Number(offsetDays) || 0));
  return formatDateInput(date);
}

export function daysBetweenDateKeys(startKey, endKey) {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  if (!start || !end) return null;
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / 86400000);
}

export function maxDateKey(left, right) {
  const safeLeft = normalizeDateKey(left);
  const safeRight = normalizeDateKey(right);
  if (!safeLeft) return safeRight;
  if (!safeRight) return safeLeft;
  return safeLeft >= safeRight ? safeLeft : safeRight;
}

export function minDateKey(left, right) {
  const safeLeft = normalizeDateKey(left);
  const safeRight = normalizeDateKey(right);
  if (!safeLeft) return safeRight;
  if (!safeRight) return safeLeft;
  return safeLeft <= safeRight ? safeLeft : safeRight;
}

export function normalizeCalendarColor(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
    return raw.toLowerCase();
  }
  return "";
}
