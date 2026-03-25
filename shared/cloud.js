import { createClient } from "@supabase/supabase-js";
import { STORAGE_MODE_KEY } from "./constants.js";
import { normalizeCalendarColor, normalizeCurrency, normalizeMoneyValue, sanitizeWorkHours } from "./format.js";
import {
  normalizeFeeMode,
  normalizeFxRateSnapshot,
  normalizeOrder,
  normalizePaymentStatus,
  normalizeStageTimeline,
  normalizeUsageType,
  normalizeUsageRate,
} from "./orders.js";

export const CLOUD_TABLES = {
  orders: "commission_orders",
  businessPresets: "business_presets",
  businessTemplates: "business_templates",
};

const BUSINESS_TEMPLATE_SELECT =
  "project_name,business_type,production_stage,source,fee_mode,fee_rate,usage_type,usage_rate,currency,fx_rate_snapshot,priority,priority_rate,amount,received_amount,payment_status,work_hours,status,exception_type,notes,calendar_color,mhs_project_quoted_amount,updated_at";

export function hasCloudConfig(runtime) {
  return Boolean(runtime?.supabaseUrl && runtime?.supabaseAnonKey);
}

export function normalizeStorageMode(value, runtime) {
  if (value === "cloud" && hasCloudConfig(runtime)) {
    return "cloud";
  }
  return "local";
}

export function loadPreferredStorageMode(runtime, fallback = "local") {
  if (!hasCloudConfig(runtime)) {
    return "local";
  }

  try {
    const saved = normalizeStorageMode(window.localStorage.getItem(STORAGE_MODE_KEY), runtime);
    if (saved === "cloud") {
      return "cloud";
    }
  } catch {}

  return runtime?.defaultStorageMode || fallback;
}

export function savePreferredStorageMode(mode, runtime) {
  try {
    window.localStorage.setItem(STORAGE_MODE_KEY, normalizeStorageMode(mode, runtime));
  } catch {}
}

export function createSupabaseBrowserClient(runtime) {
  if (!hasCloudConfig(runtime)) {
    throw new Error("Supabase runtime is not configured.");
  }

  return createClient(runtime.supabaseUrl, runtime.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export function rowToOrder(row, { fxSettings } = {}) {
  return normalizeOrder(
    {
      id: row.id,
      projectName: row.project_name,
      clientName: row.client_name,
      businessType: row.business_type,
      productionStage: row.production_stage,
      source: row.source,
      feeMode: row.fee_mode,
      usageType: row.usage_type,
      usageRate: row.usage_rate,
      currency: row.currency,
      fxRateSnapshot: row.fx_rate_snapshot,
      calendarColor: row.calendar_color,
      priority: row.priority,
      priorityRate: row.priority_rate,
      amount: row.amount,
      mhsProjectQuotedAmount: row.mhs_project_quoted_amount,
      receivedAmount: row.received_amount,
      paymentStatus: row.payment_status,
      feeRate: row.fee_rate,
      startDate: row.start_date || "",
      dueDate: row.due_date,
      completedDate: row.completed_date || "",
      workHours: row.work_hours,
      status: row.status,
      exceptionType: row.exception_type,
      exceptionResolution: row.exception_resolution,
      exceptionNote: row.exception_note,
      refundAmount: row.refund_amount,
      exceptionPreviousStatus: row.exception_previous_status,
      notes: row.notes || "",
      stageTimeline: row.stage_timeline || {},
    },
    { fxSettings },
  );
}

export function orderToRow(order, userId) {
  return {
    id: order.id,
    user_id: userId,
    project_name: order.projectName,
    client_name: order.clientName,
    business_type: order.businessType,
    production_stage: order.productionStage || "",
    source: order.source,
    fee_mode: normalizeFeeMode(order.feeMode),
    usage_type: normalizeUsageType(order.usageType),
    usage_rate: normalizeUsageRate(order.usageRate, order.usageType),
    currency: normalizeCurrency(order.currency),
    fx_rate_snapshot: normalizeFxRateSnapshot(order.fxRateSnapshot, normalizeCurrency(order.currency)),
    calendar_color: normalizeCalendarColor(order.calendarColor),
    priority: order.priority,
    priority_rate: Number(order.priorityRate || 0),
    amount: normalizeMoneyValue(order.amount),
    mhs_project_quoted_amount: normalizeMoneyValue(order.mhsProjectQuotedAmount),
    received_amount: normalizeMoneyValue(order.receivedAmount),
    payment_status: normalizePaymentStatus(order),
    fee_rate: Number(order.feeRate || 0),
    start_date: order.startDate || null,
    due_date: order.dueDate || null,
    completed_date: order.completedDate || null,
    work_hours: sanitizeWorkHours(order.workHours),
    status: order.status,
    exception_type: order.exceptionType || "无",
    exception_resolution: order.exceptionResolution || "",
    exception_note: order.exceptionNote || "",
    refund_amount: normalizeMoneyValue(order.refundAmount),
    exception_previous_status: order.exceptionPreviousStatus || null,
    notes: order.notes || "",
    stage_timeline: normalizeStageTimeline(order.stageTimeline),
  };
}

export function businessTemplateRowToRecord(row, normalizeTemplate = (value) => value) {
  return normalizeTemplate({
    projectName: row.project_name,
    businessType: row.business_type,
    productionStage: row.production_stage,
    source: row.source,
    feeMode: row.fee_mode,
    feeRate: row.fee_rate,
    usageType: row.usage_type,
    usageRate: row.usage_rate,
    currency: row.currency,
    fxRateSnapshot: row.fx_rate_snapshot,
    priority: row.priority,
    priorityRate: row.priority_rate,
    amount: row.amount,
    mhsProjectQuotedAmount: row.mhs_project_quoted_amount,
    receivedAmount: row.received_amount,
    paymentStatus: row.payment_status,
    workHours: row.work_hours,
    status: row.status,
    exceptionType: row.exception_type,
    notes: row.notes,
    calendarColor: row.calendar_color,
    updatedAt: row.updated_at,
  });
}

export function businessTemplateToRow(template, userId) {
  return {
    user_id: userId,
    project_name: String(template.projectName || ""),
    business_type: template.businessType,
    production_stage: String(template.productionStage || ""),
    source: template.source,
    fee_mode: normalizeFeeMode(template.feeMode),
    fee_rate: Number(template.feeRate || 0),
    usage_type: normalizeUsageType(template.usageType),
    usage_rate: normalizeUsageRate(template.usageRate, template.usageType),
    currency: normalizeCurrency(template.currency),
    fx_rate_snapshot: normalizeFxRateSnapshot(template.fxRateSnapshot, normalizeCurrency(template.currency)),
    calendar_color: normalizeCalendarColor(template.calendarColor),
    priority: template.priority,
    priority_rate: Number(template.priorityRate || 0),
    amount: normalizeMoneyValue(template.amount),
    mhs_project_quoted_amount: normalizeMoneyValue(template.mhsProjectQuotedAmount),
    received_amount: normalizeMoneyValue(template.receivedAmount),
    payment_status: normalizePaymentStatus(template),
    work_hours: sanitizeWorkHours(template.workHours),
    status: template.status,
    exception_type: template.exceptionType || "无",
    notes: template.notes || "",
    updated_at: template.updatedAt || new Date().toISOString(),
  };
}

export async function fetchRemoteOrders(client, userId, { fxSettings } = {}) {
  const { data, error } = await client
    .from(CLOUD_TABLES.orders)
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map((row) => rowToOrder(row, { fxSettings }));
}

export async function upsertRemoteOrders(client, userId, orders, { refresh = false, fxSettings } = {}) {
  const payload = orders.map((item) => orderToRow(item, userId));
  const { error } = await client.from(CLOUD_TABLES.orders).upsert(payload, { onConflict: "id" });
  if (error) {
    throw error;
  }

  if (refresh) {
    return fetchRemoteOrders(client, userId, { fxSettings });
  }

  return orders;
}

export async function replaceRemoteOrders(client, userId, orders, { fxSettings } = {}) {
  const { data: oldRows, error: fetchError } = await client
    .from(CLOUD_TABLES.orders)
    .select("id")
    .eq("user_id", userId);
  if (fetchError) {
    throw fetchError;
  }

  const nextIds = new Set(orders.map((order) => order.id));
  const staleIds = (oldRows || []).map((row) => row.id).filter((id) => !nextIds.has(id));

  if (orders.length) {
    await upsertRemoteOrders(client, userId, orders, { refresh: false, fxSettings });
  }

  if (staleIds.length) {
    const { error: deleteError } = await client
      .from(CLOUD_TABLES.orders)
      .delete()
      .in("id", staleIds)
      .eq("user_id", userId);
    if (deleteError) {
      throw deleteError;
    }
  }

  return fetchRemoteOrders(client, userId, { fxSettings });
}

export async function fetchRemoteBusinessPresets(client, userId) {
  const { data, error } = await client
    .from(CLOUD_TABLES.businessPresets)
    .select("name")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) {
    throw error;
  }

  return (data || []).map((item) => item.name);
}

export async function upsertRemoteBusinessPresets(client, userId, names) {
  const payload = names.map((name) => ({
    user_id: userId,
    name,
  }));
  const { error } = await client
    .from(CLOUD_TABLES.businessPresets)
    .upsert(payload, { onConflict: "user_id,name" });
  if (error) {
    throw error;
  }
}

export async function deleteRemoteBusinessPreset(client, userId, name) {
  const { error } = await client
    .from(CLOUD_TABLES.businessPresets)
    .delete()
    .eq("user_id", userId)
    .eq("name", name);
  if (error) {
    throw error;
  }
}

export async function fetchRemoteBusinessTemplates(client, userId, normalizeTemplate = (value) => value) {
  const { data, error } = await client
    .from(CLOUD_TABLES.businessTemplates)
    .select(BUSINESS_TEMPLATE_SELECT)
    .eq("user_id", userId);
  if (error) {
    throw error;
  }

  return (data || [])
    .map((row) => businessTemplateRowToRecord(row, normalizeTemplate))
    .filter(Boolean);
}

export async function upsertRemoteBusinessTemplates(client, userId, templates, normalizeTemplate = (value) => value) {
  const payload = templates.map((template) => businessTemplateToRow(template, userId));
  const { data, error } = await client
    .from(CLOUD_TABLES.businessTemplates)
    .upsert(payload, { onConflict: "user_id,business_type" })
    .select(BUSINESS_TEMPLATE_SELECT);
  if (error) {
    throw error;
  }

  return (data || [])
    .map((row) => businessTemplateRowToRecord(row, normalizeTemplate))
    .filter(Boolean);
}

export async function deleteRemoteBusinessTemplate(client, userId, businessType) {
  const { error } = await client
    .from(CLOUD_TABLES.businessTemplates)
    .delete()
    .eq("user_id", userId)
    .eq("business_type", businessType);
  if (error) {
    throw error;
  }
}
