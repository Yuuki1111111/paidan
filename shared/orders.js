import {
  ABNORMAL_EXCEPTION_TYPES,
  BUILT_IN_BUSINESS_TYPES,
  CLOSED_STATUSES,
  DEFAULT_HKD_CNY_RATE,
  DEFAULT_JPY_CNY_RATE,
  DEFAULT_TWD_CNY_RATE,
  DEFAULT_USD_CNY_RATE,
  EXCEPTION_RESOLUTIONS,
  EXCEPTION_TYPES,
  FEE_MODES,
  LEGACY_PAID_STATUS,
  MHS_PROJECT_AMOUNT_MODE_ARTIST,
  MHS_PROJECT_AMOUNT_MODES,
  PAYMENT_STATUSES,
  PRIORITIES,
  SOURCE_COLORS,
  SOURCE_FEE_RATES,
  SOURCES,
  SOURCE_OPTIONS,
  STAGE_EDITABLE_STATUSES,
  STATUSES,
  SUPPORTED_CURRENCIES,
  USAGE_TYPES,
} from "./constants.js";
import { normalizeCalendarColor, normalizeCurrency, normalizeMoneyValue, roundMoney, sanitizeWorkHours } from "./format.js";

export function normalizeBusinessTypeValue(value) {
  return String(value || "").trim().slice(0, 20);
}

export function normalizeSourceValue(value) {
  const normalized = String(value || "").trim().slice(0, 20);
  if (normalized === "米画师") return "米画师企划邀请";
  if (normalized === "橱窗") return "米画师橱窗";
  return normalized;
}

export function normalizeProductionStageValue(value) {
  return String(value || "").trim().slice(0, 20);
}

export function normalizeStageTimeline(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const result = {};
  for (const [stage, dateValue] of Object.entries(input)) {
    const normalizedStage = normalizeProductionStageValue(stage);
    if (!normalizedStage) continue;
    const dateStr = String(dateValue || "").trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      result[normalizedStage] = dateStr.slice(0, 10);
    }
  }
  return result;
}

export function normalizeWorkflowStatus(value, fallback = STATUSES[0]) {
  const safeValue = String(value || "").trim();
  if (!safeValue) return fallback;
  if (safeValue === LEGACY_PAID_STATUS) return "已完成";
  return STATUSES.includes(safeValue) ? safeValue : fallback;
}

export function normalizeFeeMode(value) {
  return FEE_MODES.some((item) => item.value === value) ? value : "standard";
}

export function getFeeModeLabel(feeMode) {
  return FEE_MODES.find((item) => item.value === feeMode)?.label || "默认按比例";
}

export function normalizeMhsProjectAmountMode(value) {
  return MHS_PROJECT_AMOUNT_MODES.includes(value) ? value : MHS_PROJECT_AMOUNT_MODE_ARTIST;
}

export function calculateMhsProjectNetFromQuotedAmount(quotedAmount, feeRate) {
  const quoted = normalizeMoneyValue(quotedAmount);
  const rate = Math.min(Math.max(Number(feeRate) || 0, 0), 1);
  if (!quoted) return 0;
  if (rate <= 0) return quoted;
  return roundMoney(Math.ceil(quoted / (1 + rate)), 2);
}

export function calculateMhsProjectQuotedAmountFromNet(netAmount, feeRate) {
  const net = normalizeMoneyValue(netAmount);
  const rate = Math.min(Math.max(Number(feeRate) || 0, 0), 1);
  if (!net) return 0;
  if (rate <= 0) return net;
  return roundMoney(Math.floor(net * (1 + rate)), 2);
}

export function calculateMhsWindowNetFromListAmount(listAmount, feeRate) {
  const list = normalizeMoneyValue(listAmount);
  const rate = Math.min(Math.max(Number(feeRate) || 0, 0), 1);
  if (!list) return 0;
  if (rate <= 0) return list;
  return roundMoney(Math.ceil(list * (1 - rate)), 2);
}

export function normalizeUsageType(value) {
  return USAGE_TYPES.includes(value) ? value : USAGE_TYPES[0];
}

export function normalizeUsageRate(value, usageType = USAGE_TYPES[0]) {
  if (normalizeUsageType(usageType) === "私用") return 0;
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.min(parsed, 5);
}

export function normalizePriorityRate(value, priority = PRIORITIES[0]) {
  if (priority === "普通") return 0;
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.min(parsed, 5);
}

export function calculatePrioritySurcharge(order) {
  const priority = order.priority || PRIORITIES[0];
  const priorityRate = normalizePriorityRate(order.priorityRate, priority);
  if (priority === "普通" || priorityRate <= 0) return 0;
  return roundMoney(normalizeMoneyValue(order.amount) * priorityRate, 2);
}

export function parseUsageRateInput(value) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.min(parsed / 100, 5);
}

export function normalizeFxRate(value, fallback) {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return roundMoney(parsed, 6);
  }
  const fallbackParsed = Number(fallback);
  if (Number.isFinite(fallbackParsed) && fallbackParsed > 0) {
    return roundMoney(fallbackParsed, 6);
  }
  return 1;
}

export function normalizeFxSettings(input = {}) {
  return {
    enabled: Boolean(input.enabled),
    usdCnyRate: normalizeFxRate(input.usdCnyRate, DEFAULT_USD_CNY_RATE),
    jpyCnyRate: normalizeFxRate(input.jpyCnyRate, DEFAULT_JPY_CNY_RATE),
    twdCnyRate: normalizeFxRate(input.twdCnyRate, DEFAULT_TWD_CNY_RATE),
    hkdCnyRate: normalizeFxRate(input.hkdCnyRate, DEFAULT_HKD_CNY_RATE),
  };
}

export function getConfiguredFxRate(currency, settings = {}) {
  const normalizedCurrency = normalizeCurrency(currency);
  const normalizedSettings = normalizeFxSettings(settings);
  if (normalizedCurrency === "USD") return normalizedSettings.usdCnyRate;
  if (normalizedCurrency === "JPY") return normalizedSettings.jpyCnyRate;
  if (normalizedCurrency === "TWD") return normalizedSettings.twdCnyRate;
  if (normalizedCurrency === "HKD") return normalizedSettings.hkdCnyRate;
  return 1;
}

export function normalizeFxRateSnapshot(value, currency = "CNY", settings = {}) {
  const normalizedCurrency = normalizeCurrency(currency);
  if (normalizedCurrency === "CNY") return null;
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) return roundMoney(parsed, 6);
  return roundMoney(getConfiguredFxRate(normalizedCurrency, settings), 6);
}

export function inferPaymentStatus(order) {
  const amount = calculateGrossAmount(order);
  const receivedAmount = normalizeMoneyValue(order.receivedAmount);
  if (amount > 0 && receivedAmount >= amount) return "已结清";
  if (receivedAmount > 0) return "已收定金";
  return "未收款";
}

export function normalizePaymentStatus(order) {
  if (PAYMENT_STATUSES.includes(order?.paymentStatus)) return order.paymentStatus;
  return inferPaymentStatus(order);
}

export function getDefaultFeeRate(source, feeMode = "standard") {
  const normalizedSource = normalizeSourceValue(source);
  const normalizedFeeMode = normalizeFeeMode(feeMode);
  if (normalizedFeeMode === "mhs_project" || normalizedFeeMode === "mhs_window") {
    return 0.05;
  }
  return SOURCE_FEE_RATES[normalizedSource] ?? 0;
}

export function getSourceLabel(source) {
  const normalizedSource = normalizeSourceValue(source);
  return (
    SOURCE_OPTIONS.find((item) => normalizeSourceValue(item.value) === normalizedSource)?.label ||
    normalizedSource
  );
}

export function getSourceColor(source) {
  return SOURCE_COLORS[normalizeSourceValue(source)] || "#9ba6ab";
}

export function createOrderId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `order-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizeOrder(input = {}, { fxSettings = {} } = {}) {
  const source = normalizeSourceValue(input.source) || SOURCES[0];
  const feeMode = normalizeFeeMode(input.feeMode);
  const amount = normalizeMoneyValue(input.amount);
  const receivedAmount = normalizeMoneyValue(input.receivedAmount);
  const usageType = normalizeUsageType(input.usageType);
  const usageRate = normalizeUsageRate(input.usageRate, usageType);
  const priority = PRIORITIES.includes(input.priority) ? input.priority : PRIORITIES[0];
  const priorityRate = normalizePriorityRate(input.priorityRate, priority);
  const currency = normalizeCurrency(input.currency);
  const workHours = sanitizeWorkHours(input.workHours);
  const rawFeeRate = input.feeRate;
  const normalizedFeeRate =
    rawFeeRate == null || rawFeeRate === ""
      ? getDefaultFeeRate(source, feeMode)
      : Math.min(Math.max(Number(rawFeeRate) || 0, 0), 1);
  const exceptionType = EXCEPTION_TYPES.includes(input.exceptionType) ? input.exceptionType : "无";
  const normalizedBusinessType = normalizeBusinessTypeValue(input.businessType);
  const normalizedProductionStage = normalizeProductionStageValue(input.productionStage);
  const exceptionResolution =
    input.exceptionResolution && EXCEPTION_RESOLUTIONS.includes(input.exceptionResolution)
      ? input.exceptionResolution
      : "";
  const refundAmount = normalizeMoneyValue(input.refundAmount);
  const fxRateSnapshot = normalizeFxRateSnapshot(input.fxRateSnapshot, currency, fxSettings);
  const calendarColor = normalizeCalendarColor(input.calendarColor);
  const mhsProjectQuotedAmount =
    feeMode === "mhs_project" ? normalizeMoneyValue(input.mhsProjectQuotedAmount) : 0;
  const exceptionPreviousStatus = input.exceptionPreviousStatus || null;
  const baseStatus = normalizeWorkflowStatus(input.status, STATUSES[0]);
  const status =
    exceptionType === "无" && baseStatus === "已处理"
      ? normalizeWorkflowStatus(exceptionPreviousStatus, "进行中")
      : baseStatus;

  return {
    id: input.id || createOrderId(),
    projectName: input.projectName || "",
    clientName: input.clientName || "",
    businessType: normalizedBusinessType || BUILT_IN_BUSINESS_TYPES[0],
    productionStage: normalizedProductionStage,
    source,
    feeMode,
    usageType,
    usageRate,
    currency,
    fxRateSnapshot,
    calendarColor,
    mhsProjectQuotedAmount,
    priority,
    priorityRate,
    amount,
    receivedAmount,
    workHours,
    paymentStatus: input.paymentStatus || inferPaymentStatus({ amount, receivedAmount, usageType, usageRate }),
    feeRate: normalizedFeeRate,
    startDate: input.startDate || "",
    dueDate: input.dueDate || "",
    completedDate: input.completedDate || "",
    status,
    exceptionType,
    exceptionResolution: exceptionType === "无" ? "" : exceptionResolution,
    exceptionNote: exceptionType === "无" ? "" : String(input.exceptionNote || ""),
    refundAmount: exceptionType === "无" ? 0 : refundAmount,
    exceptionPreviousStatus: exceptionType === "无" ? null : exceptionPreviousStatus,
    notes: input.notes || "",
    stageTimeline: normalizeStageTimeline(input.stageTimeline),
  };
}

export function calculateRefundAmount(order) {
  return normalizeMoneyValue(order.refundAmount);
}

export function calculateUsageSurcharge(order) {
  const usageType = normalizeUsageType(order.usageType);
  const usageRate = normalizeUsageRate(order.usageRate, usageType);
  if (usageType === "私用" || usageRate <= 0) return 0;
  return roundMoney(normalizeMoneyValue(order.amount) * usageRate, 2);
}

export function calculateGrossAmount(order) {
  return roundMoney(normalizeMoneyValue(order.amount) + calculateUsageSurcharge(order) + calculatePrioritySurcharge(order), 2);
}

export function calculateEffectiveAmount(order) {
  if (order.exceptionResolution === "协商退全款") return 0;
  return roundMoney(Math.max(calculateGrossAmount(order) - calculateRefundAmount(order), 0), 2);
}

export function calculateEffectiveReceived(order) {
  return roundMoney(Math.max(normalizeMoneyValue(order.receivedAmount) - calculateRefundAmount(order), 0), 2);
}

export function calculateAdjustedFeeAmount(order) {
  const effectiveAmount = calculateEffectiveAmount(order);
  const rate = Number(order.feeRate || 0);
  const feeMode = normalizeFeeMode(order.feeMode);

  if (feeMode === "mhs_project") {
    const storedQuoted = normalizeMoneyValue(order?.mhsProjectQuotedAmount);
    const quotedAmount =
      storedQuoted > 0 &&
      Math.abs(calculateMhsProjectNetFromQuotedAmount(storedQuoted, rate) - effectiveAmount) < 0.000001
        ? storedQuoted
        : calculateMhsProjectQuotedAmountFromNet(effectiveAmount, rate);
    return roundMoney(Math.max(quotedAmount - effectiveAmount, 0), 2);
  }
  if (feeMode === "mhs_window") {
    return roundMoney(Math.max(effectiveAmount - calculateMhsWindowNetFromListAmount(effectiveAmount, rate), 0), 2);
  }
  return roundMoney(effectiveAmount * rate, 2);
}

export function calculateAdjustedNetAmount(order) {
  const effectiveAmount = calculateEffectiveAmount(order);
  const feeMode = normalizeFeeMode(order.feeMode);
  if (feeMode === "mhs_project") {
    return roundMoney(effectiveAmount, 2);
  }
  if (feeMode === "mhs_window") {
    return calculateMhsWindowNetFromListAmount(effectiveAmount, Number(order.feeRate || 0));
  }
  return roundMoney(Math.max(effectiveAmount - calculateAdjustedFeeAmount(order), 0), 2);
}

export function calculateQuotedAmount(order) {
  const feeMode = normalizeFeeMode(order.feeMode);
  const effectiveAmount = calculateEffectiveAmount(order);
  if (feeMode === "mhs_project") {
    const rate = Number(order.feeRate || 0);
    const storedQuoted = normalizeMoneyValue(order?.mhsProjectQuotedAmount);
    if (
      storedQuoted > 0 &&
      Math.abs(calculateMhsProjectNetFromQuotedAmount(storedQuoted, rate) - effectiveAmount) < 0.000001
    ) {
      return storedQuoted;
    }
    return calculateMhsProjectQuotedAmountFromNet(effectiveAmount, rate);
  }
  return roundMoney(effectiveAmount, 2);
}

export function getOrderFxRate(order, settings = {}) {
  const currency = normalizeCurrency(order?.currency);
  if (currency === "CNY") return 1;
  const snapshot = Number(order?.fxRateSnapshot);
  if (Number.isFinite(snapshot) && snapshot > 0) {
    return roundMoney(snapshot, 6);
  }
  return getConfiguredFxRate(currency, settings);
}

export function convertMoneyToCny(value, order, settings = {}) {
  const amount = normalizeMoneyValue(value);
  if (!amount) return 0;
  return roundMoney(amount * getOrderFxRate(order, settings), 2);
}

export function calculateGrossAmountCny(order, settings = {}) {
  return convertMoneyToCny(calculateGrossAmount(order), order, settings);
}

export function calculateEffectiveAmountCny(order, settings = {}) {
  return convertMoneyToCny(calculateEffectiveAmount(order), order, settings);
}

export function calculateEffectiveReceivedCny(order, settings = {}) {
  return convertMoneyToCny(calculateEffectiveReceived(order), order, settings);
}

export function calculateAdjustedFeeAmountCny(order, settings = {}) {
  return convertMoneyToCny(calculateAdjustedFeeAmount(order), order, settings);
}

export function calculateAdjustedNetAmountCny(order, settings = {}) {
  return convertMoneyToCny(calculateAdjustedNetAmount(order), order, settings);
}

export function calculateQuotedAmountCny(order, settings = {}) {
  return convertMoneyToCny(calculateQuotedAmount(order), order, settings);
}

export function calculateDateSpanDays(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diff = Math.round((end - start) / (24 * 60 * 60 * 1000));
  if (!Number.isFinite(diff) || diff < 0) return null;
  return diff + 1;
}

export function calculateScheduleDurations(order) {
  return {
    plannedDays: calculateDateSpanDays(order.startDate, order.dueDate),
    actualDays: calculateDateSpanDays(order.startDate, order.completedDate),
  };
}

export function calculateHourlyRate(order, settings = {}) {
  const workHours = sanitizeWorkHours(order.workHours);
  if (!workHours) return null;
  const netAmount = calculateAdjustedNetAmountCny(order, settings);
  if (netAmount <= 0) return null;
  return netAmount / workHours;
}

export function isAbnormal(order) {
  return ABNORMAL_EXCEPTION_TYPES.has(order.exceptionType);
}

export function isUnhandledAbnormal(order) {
  return isAbnormal(order) && order.status !== "已处理";
}

export function isHandledAbnormal(order) {
  return isAbnormal(order) && order.status === "已处理";
}

export function isClosed(order) {
  return CLOSED_STATUSES.has(order.status);
}

export function canQuickEditStage(order) {
  return !isAbnormal(order) && STAGE_EDITABLE_STATUSES.has(order.status);
}

export function canQuickEditWorkHours(order) {
  return Boolean(order.completedDate) || isClosed(order);
}
