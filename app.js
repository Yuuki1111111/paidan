import { SITE_CONTENT } from "./site-content.js";

const STORAGE_KEY = "artist-commission-desk-v1";
const LAST_TEMPLATE_KEY = "artist-commission-last-template-v1";
const AUTH_COOLDOWN_KEY = "artist-commission-auth-cooldowns-v1";
const BUSINESS_PRESET_KEY = "artist-commission-business-presets-v1";
const BUSINESS_TEMPLATE_KEY = "artist-commission-business-templates-v1";
const BACKGROUND_THEME_KEY = "artist-commission-bg-theme-v1";
const CLIENT_INSIGHT_SETTINGS_KEY = "artist-commission-client-insight-settings-v1";
const CALENDAR_DAY_MARKS_KEY = "artist-commission-calendar-day-marks-v1";
const FX_SETTINGS_KEY = "artist-commission-fx-settings-v1";
const UI_LAYOUT_PREFS_KEY = "artist-commission-layout-prefs-v1";
const TABLE_NAME = "commission_orders";
const BUSINESS_PRESET_TABLE = "business_presets";
const BUSINESS_TEMPLATE_TABLE = "business_templates";
const USER_PREFERENCES_TABLE = "user_preferences";
const DEFAULT_BACKGROUND_HEX = "#f7efe4";
const DEFAULT_VIP_THRESHOLD = 3000;
const DEFAULT_USD_CNY_RATE = 7.2;
const DEFAULT_JPY_CNY_RATE = 0.048;
const DEFAULT_TWD_CNY_RATE = 0.22;
const DEFAULT_HKD_CNY_RATE = 0.92;
const SUPPORTED_CURRENCIES = ["CNY", "USD", "JPY", "TWD", "HKD"];
const SUPABASE_BROWSER_BUNDLE_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const BUILT_IN_BUSINESS_TYPES = [
  "头像",
  "胸插",
  "QQ人",
  "摸鱼页",
  "摸鱼稿",
  "半身",
  "半身插",
  "全身插",
  "氛围插",
  "插画",
  "正比",
  "双人",
  "眼睛条",
  "拍立得",
  "小零食",
  "服设",
  "立绘",
  "人设",
  "OC设计",
  "橱窗",
  "加项",
];
const BUILT_IN_PRODUCTION_STAGES = ["草稿", "线稿", "铺色", "细化", "完稿"];
const SOURCES = ["米画师", "画加", "临界", "群拍", "私单", "橱窗", "熟人转介绍", "社媒引流"];
const SOURCE_OPTIONS = [
  { value: "米画师", label: "米画师企划邀请" },
  { value: "画加", label: "画加" },
  { value: "临界", label: "临界" },
  { value: "群拍", label: "群拍（设拍 / 稿拍）" },
  { value: "私单", label: "私单" },
  { value: "橱窗", label: "米画师橱窗" },
  { value: "熟人转介绍", label: "熟人转介绍" },
  { value: "社媒引流", label: "社媒引流" },
];
const CURRENCY_OPTIONS = [
  { value: "CNY", label: "人民币 CNY" },
  { value: "USD", label: "美元 USD" },
  { value: "JPY", label: "日元 JPY" },
  { value: "TWD", label: "新台币 TWD" },
  { value: "HKD", label: "港币 HKD" },
];
const FEE_MODES = [
  { value: "standard", label: "默认按比例" },
  { value: "mhs_project", label: "米画师企划邀请（按到手价）" },
  { value: "mhs_window", label: "米画师橱窗（满20减1）" },
];
const PRIORITIES = ["普通", "加急", "特快"];
const USAGE_TYPES = ["私用", "商用", "买断"];
const STATUSES = ["待沟通", "排期中", "进行中", "待交付", "已完成", "已付款", "已处理"];
const PAYMENT_STATUSES = ["未收款", "已收定金", "已结清"];
const EXCEPTION_TYPES = ["无", "金主退稿", "金主退部分稿", "金主异常"];
const EXCEPTION_RESOLUTIONS = ["协商退全款", "协商退部分款", "协商延期", "补偿约定", "拒绝沟通", "其他"];
const ABNORMAL_EXCEPTION_TYPES = new Set(EXCEPTION_TYPES.filter((type) => type !== "无"));
const CLOSED_STATUSES = new Set(["已完成", "已付款", "已处理"]);
const DISALLOWED_ABNORMAL_STATUSES = new Set(["已完成", "已付款"]);
const STAGE_EDITABLE_STATUSES = new Set(["排期中", "进行中", "待交付"]);
const SOURCE_FEE_RATES = {
  米画师: 0.05,
  画加: 0.0525,
  临界: 0,
  群拍: 0,
  私单: 0,
  橱窗: 0,
  熟人转介绍: 0,
  社媒引流: 0,
};
const SOURCE_COLORS = {
  米画师: "#6f9d9c",
  画加: "#5d7ea6",
  临界: "#8a7ad1",
  群拍: "#8f7d63",
  私单: "#d86b2d",
  橱窗: "#b89f6b",
  熟人转介绍: "#6d8f57",
  社媒引流: "#8c79ad",
};
const VIEW_MODE_SCHEDULE = "schedule";
const VIEW_MODE_INSIGHTS = "insights";
const VIEW_MODES = [VIEW_MODE_SCHEDULE, VIEW_MODE_INSIGHTS];
const CALENDAR_DISPLAY_TAGS = "tags";
const CALENDAR_DISPLAY_TIMELINE = "timeline";
const CALENDAR_DISPLAY_MODES = [CALENDAR_DISPLAY_TAGS, CALENDAR_DISPLAY_TIMELINE];
const CALENDAR_DAY_MARK_REST = "rest";
const CALENDAR_DAY_MARK_WORK = "work";
const CALENDAR_DAY_MARK_TYPES = [CALENDAR_DAY_MARK_REST, CALENDAR_DAY_MARK_WORK];
const VIEW_SECTION_GROUPS = {
  common: ["sync", "filters"],
  schedule: ["form", "calendar", "active-list", "done-list"],
  insights: ["stats-panel", "motivation", "analysis", "clients"],
};
const DEFAULT_COMMON_SECTION_ORDER = [...VIEW_SECTION_GROUPS.common];
const DEFAULT_SCHEDULE_SECTION_ORDER = [...VIEW_SECTION_GROUPS.schedule];
const DEFAULT_INSIGHTS_SECTION_ORDER = [...VIEW_SECTION_GROUPS.insights];
const LAYOUT_PANEL_IDS = [
  ...new Set([...DEFAULT_COMMON_SECTION_ORDER, ...DEFAULT_SCHEDULE_SECTION_ORDER, ...DEFAULT_INSIGHTS_SECTION_ORDER]),
];
const QUICK_NAV_SECTION_META = {
  sync: { id: "sync", label: "同步" },
  filters: { id: "filters", label: "筛选" },
  "stats-panel": { id: "stats-panel", label: "统计" },
  motivation: { id: "motivation", label: "激励" },
  clients: { id: "clients", label: "客户" },
  form: { id: "form", label: "录入" },
  analysis: { id: "analysis", label: "分析" },
  calendar: { id: "calendar", label: "月历" },
  "active-list": { id: "active-list", label: "进行中" },
  "done-list": { id: "done-list", label: "完成" },
};
const QUICK_NAV_PIN_DURATION_MS = 900;

const rawConfig = window.APP_CONFIG || {};
const config = {
  supabaseUrl: rawConfig.SUPABASE_URL || "",
  supabaseAnonKey: rawConfig.SUPABASE_ANON_KEY || "",
  turnstileSiteKey: rawConfig.TURNSTILE_SITE_KEY || "",
};
const initialLayoutPrefs = loadLayoutPrefs();
const initialActiveSectionId = getInitialActiveSectionId(initialLayoutPrefs);

const state = {
  orders: [],
  localBackupOrders: loadLocalOrders(),
  customBusinessTypes: loadLocalBusinessPresets(),
  clientInsightSettings: loadLocalClientInsightSettings(),
  calendarDayMarks: loadLocalCalendarDayMarks(),
  fxSettings: loadLocalFxSettings(),
  viewMode: initialLayoutPrefs.viewMode,
  calendarDisplayMode: initialLayoutPrefs.calendarDisplayMode,
  scheduleLayoutEditMode: initialLayoutPrefs.scheduleLayoutEditMode,
  commonSectionOrder: initialLayoutPrefs.commonSectionOrder,
  scheduleSectionOrder: initialLayoutPrefs.scheduleSectionOrder,
  insightsSectionOrder: initialLayoutPrefs.insightsSectionOrder,
  collapsedPanels: initialLayoutPrefs.collapsedPanels,
  filters: {
    month: currentMonthKey(),
    status: "all",
    stage: "all",
    source: "all",
    exception: "all",
    payment: "all",
    search: "",
  },
  listFilters: {
    active: {
      business: "all",
      query: "",
    },
    completed: {
      business: "all",
      query: "",
    },
  },
  calendarMonth: currentMonthDate(),
  editingId: null,
  mode: hasCloudConfig() ? "cloud" : "local",
  supabase: null,
  session: null,
  user: null,
  busy: false,
  recoveryMode: detectFlowType() === "recovery",
  usingLocalBackup: false,
  authCooldowns: loadAuthCooldowns(),
  turnstileStatus: hasTurnstileConfig() ? "idle" : "missing",
  turnstileRequested: false,
  turnstilePendingAction: "",
  turnstileToken: "",
  turnstileWidgetId: null,
  turnstileAutoRetries: 0,
  activeSectionId: initialActiveSectionId,
  quickNavOpen: false,
  quickNavPinnedSectionId: "",
  quickNavPinnedUntil: 0,
  selectedOrderIds: new Set(),
  lastTemplate: loadLastTemplate(),
  businessTemplates: loadLocalBusinessTemplates(),
  exceptionDialogOrderId: null,
  stageDialogOrderId: null,
  stageDialogDraft: "",
  workHoursDialogOrderId: null,
  calendarDayDialogDate: "",
  calendarDayEntriesByDate: new Map(),
  calendarContextMenuDate: "",
  selectedCalendarDate: formatDateInput(new Date()),
  calendarCreateMode: false,
  calendarCreateStartDate: "",
  pendingTimelineDraft: null,
  pendingTimelineDraftColor: null,
  pendingTimelineDraftPopoverOpen: false,
  incomeTrendAnchoredMonth: "",
  businessPresetBusy: false,
  clientInsightBusy: false,
  calendarDayMarksBusy: false,
  fxSettingsBusy: false,
  backgroundColor: loadBackgroundTheme(),
};

let authCooldownTicker = null;
let turnstileScriptPromise = null;
let highlightedOrderRow = null;
let quickNavObserver = null;
let quickNavFallbackHandler = null;
let quickNavGlobalHandlersBound = false;
let supabaseFactoryPromise = null;
let supabaseCreateClientFactory = null;
let timelineDragSession = null;
let timelineCreateRangeSession = null;
let timelineDragSuppressClickUntil = 0;
const TIMELINE_DRAG_PX_THRESHOLD = 8;
const TIMELINE_DRAG_TIME_THRESHOLD_MS = 120;
const TIMELINE_DRAG_CLICK_SUPPRESS_MS = 300;
const TIMELINE_DRAFT_ID = "__timeline_draft__";

const elements = {
  dashboard: document.querySelector(".dashboard"),
  viewModeSchedule: document.querySelector("#view-mode-schedule"),
  viewModeInsights: document.querySelector("#view-mode-insights"),
  scheduleLayoutToggle: document.querySelector("#schedule-layout-toggle"),
  monthFilter: document.querySelector("#month-filter"),
  statusFilter: document.querySelector("#status-filter"),
  stageFilter: document.querySelector("#stage-filter"),
  sourceFilter: document.querySelector("#source-filter"),
  exceptionFilter: document.querySelector("#exception-filter"),
  paymentFilter: document.querySelector("#payment-filter"),
  searchFilter: document.querySelector("#search-filter"),
  activeBusinessFilter: document.querySelector("#active-business-filter"),
  activeSearchFilter: document.querySelector("#active-search-filter"),
  completedBusinessFilter: document.querySelector("#completed-business-filter"),
  completedSearchFilter: document.querySelector("#completed-search-filter"),
  statsGrid: document.querySelector("#stats"),
  statsPanel: document.querySelector("#stats-panel"),
  motivationMonthLabel: document.querySelector("#motivation-month-label"),
  incomeTrendSummary: document.querySelector("#income-trend-summary"),
  incomeTrendBars: document.querySelector("#income-trend-bars"),
  incomeTrendLegend: document.querySelector("#income-trend-legend"),
  dailyProgressTitle: document.querySelector("#daily-progress-title"),
  dailyProgressSummary: document.querySelector("#daily-progress-summary"),
  dailyProgressGrid: document.querySelector("#daily-progress-grid"),
  vipThresholdInput: document.querySelector("#vip-threshold-input"),
  fxEnabledInput: document.querySelector("#fx-enabled-input"),
  usdCnyRateInput: document.querySelector("#usd-cny-rate-input"),
  jpyCnyRateInput: document.querySelector("#jpy-cny-rate-input"),
  twdCnyRateInput: document.querySelector("#twd-cny-rate-input"),
  hkdCnyRateInput: document.querySelector("#hkd-cny-rate-input"),
  fxSettingsSummary: document.querySelector("#fx-settings-summary"),
  clientsSection: document.querySelector("#clients"),
  toggleClientsPanel: document.querySelector("#toggle-clients-panel"),
  clientsPanelBody: document.querySelector("#clients-panel-body"),
  clientInsightSummary: document.querySelector("#client-insight-summary"),
  clientInsightList: document.querySelector("#client-insight-list"),
  breakdownList: document.querySelector("#breakdown-list"),
  contentSlot: document.querySelector("#content-slot"),
  calendarGrid: document.querySelector("#calendar-grid"),
  calendarTimeline: document.querySelector("#calendar-timeline"),
  calendarWeekdays: document.querySelector("#calendar-weekdays"),
  calendarTitle: document.querySelector("#calendar-title"),
  calendarHint: document.querySelector("#calendar-hint"),
  calendarJumpToday: document.querySelector("#calendar-jump-today"),
  calendarCreateRange: document.querySelector("#calendar-create-range"),
  calendarCancelRange: document.querySelector("#calendar-cancel-range"),
  calendarCreateStatus: document.querySelector("#calendar-create-status"),
  calendarModeTags: document.querySelector("#calendar-mode-tags"),
  calendarModeTimeline: document.querySelector("#calendar-mode-timeline"),
  calendarContextMenu: document.querySelector("#calendar-context-menu"),
  timelineDraftPopover: document.querySelector("#timeline-draft-popover"),
  timelineDraftPopoverClose: document.querySelector("#timeline-draft-popover-close"),
  timelineDraftRangeSummary: document.querySelector("#timeline-draft-range-summary"),
  timelineDraftProjectInput: document.querySelector("#timeline-draft-project-input"),
  timelineDraftClientInput: document.querySelector("#timeline-draft-client-input"),
  timelineDraftBusinessInput: document.querySelector("#timeline-draft-business-input"),
  timelineDraftSourceInput: document.querySelector("#timeline-draft-source-input"),
  timelineDraftPriorityInput: document.querySelector("#timeline-draft-priority-input"),
  timelineDraftStatusInput: document.querySelector("#timeline-draft-status-input"),
  timelineDraftCompletedDateRow: document.querySelector("#timeline-draft-completed-date-row"),
  timelineDraftCompletedDateInput: document.querySelector("#timeline-draft-completed-date-input"),
  timelineDraftAmountInput: document.querySelector("#timeline-draft-amount-input"),
  timelineDraftColorInput: document.querySelector("#timeline-draft-color-input"),
  timelineDraftSave: document.querySelector("#timeline-draft-save"),
  timelineDraftOpenForm: document.querySelector("#timeline-draft-open-form"),
  calendarFocusTitle: document.querySelector("#calendar-focus-title"),
  calendarFocusSummary: document.querySelector("#calendar-focus-summary"),
  calendarFocusMeta: document.querySelector("#calendar-focus-meta"),
  calendarFocusOpen: document.querySelector("#calendar-focus-open"),
  calendarFocusMarkRest: document.querySelector("#calendar-focus-mark-rest"),
  calendarFocusMarkWork: document.querySelector("#calendar-focus-mark-work"),
  calendarFocusClearMark: document.querySelector("#calendar-focus-clear-mark"),
  calendarFocusList: document.querySelector("#calendar-focus-list"),
  calendarDayDialog: document.querySelector("#calendar-day-dialog"),
  calendarDayDialogTitle: document.querySelector("#calendar-day-dialog-title"),
  calendarDayDialogSummary: document.querySelector("#calendar-day-dialog-summary"),
  calendarDayDialogList: document.querySelector("#calendar-day-dialog-list"),
  calendarDayDialogClose: document.querySelector("#calendar-day-dialog-close"),
  calendarDayDialogDone: document.querySelector("#calendar-day-dialog-done"),
  activeTableBody: document.querySelector("#active-orders-table-body"),
  activeTableSummary: document.querySelector("#active-table-summary"),
  completedTableBody: document.querySelector("#completed-orders-table-body"),
  completedTableSummary: document.querySelector("#completed-table-summary"),
  form: document.querySelector("#order-form"),
  formTitle: document.querySelector("#form-title"),
  hiddenId: document.querySelector("#order-id"),
  projectName: document.querySelector("#project-name"),
  clientName: document.querySelector("#client-name"),
  backgroundColorInput: document.querySelector("#background-color-input"),
  resetBackgroundColor: document.querySelector("#reset-background-color"),
  appQqEntry: document.querySelector("#app-qq-entry"),
  appQqNumber: document.querySelector("#app-qq-number"),
  appQqHint: document.querySelector("#app-qq-hint"),
  appQqMessage: document.querySelector("#app-qq-message"),
  appCopyQq: document.querySelector("#app-copy-qq"),
  businessType: document.querySelector("#business-type"),
  businessTypeOptions: document.querySelector("#business-type-options"),
  businessShortcutList: document.querySelector("#business-shortcut-list"),
  openBusinessPresetDialog: document.querySelector("#open-business-preset-dialog"),
  productionStage: document.querySelector("#production-stage"),
  productionStageOptions: document.querySelector("#production-stage-options"),
  source: document.querySelector("#source"),
  sourceOptions: document.querySelector("#source-options"),
  feeMode: document.querySelector("#fee-mode"),
  feeRate: document.querySelector("#fee-rate"),
  amountLabel: document.querySelector("#amount-label"),
  usageType: document.querySelector("#usage-type"),
  usageRate: document.querySelector("#usage-rate"),
  usageRateNote: document.querySelector("#usage-rate-note"),
  currency: document.querySelector("#currency"),
  currencyNote: document.querySelector("#currency-note"),
  workHoursLabel: document.querySelector("#work-hours-label"),
  priority: document.querySelector("#priority"),
  amount: document.querySelector("#amount"),
  receivedAmount: document.querySelector("#received-amount"),
  paymentStatus: document.querySelector("#payment-status"),
  startDate: document.querySelector("#start-date"),
  dueDate: document.querySelector("#due-date"),
  completedDate: document.querySelector("#completed-date"),
  calendarColor: document.querySelector("#calendar-color"),
  resetCalendarColor: document.querySelector("#reset-calendar-color"),
  workHours: document.querySelector("#work-hours"),
  workHoursNote: document.querySelector("#work-hours-note"),
  status: document.querySelector("#status"),
  exceptionType: document.querySelector("#exception-type"),
  notes: document.querySelector("#notes"),
  exportJson: document.querySelector("#export-json"),
  importJson: document.querySelector("#import-json"),
  exportCsv: document.querySelector("#export-csv"),
  prevMonth: document.querySelector("#prev-month"),
  nextMonth: document.querySelector("#next-month"),
  saveBusinessTemplate: document.querySelector("#save-business-template"),
  duplicateLast: document.querySelector("#duplicate-last"),
  resetForm: document.querySelector("#reset-form"),
  statTemplate: document.querySelector("#stat-card-template"),
  batchActions: document.querySelector("#batch-actions"),
  batchSummary: document.querySelector("#batch-summary"),
  batchMarkDone: document.querySelector("#batch-mark-done"),
  batchMarkPaid: document.querySelector("#batch-mark-paid"),
  batchMarkHandled: document.querySelector("#batch-mark-handled"),
  batchExceptionType: document.querySelector("#batch-exception-type"),
  applyBatchException: document.querySelector("#apply-batch-exception"),
  clearSelection: document.querySelector("#clear-selection"),
  exceptionDialog: document.querySelector("#exception-dialog"),
  exceptionDialogClose: document.querySelector("#exception-dialog-close"),
  exceptionDialogTitle: document.querySelector("#exception-dialog-title"),
  exceptionDialogProject: document.querySelector("#exception-dialog-project"),
  exceptionDialogClient: document.querySelector("#exception-dialog-client"),
  exceptionDialogType: document.querySelector("#exception-dialog-type"),
  exceptionHandledNo: document.querySelector("#exception-handled-no"),
  exceptionHandledYes: document.querySelector("#exception-handled-yes"),
  exceptionResolution: document.querySelector("#exception-resolution"),
  refundAmountRow: document.querySelector("#refund-amount-row"),
  refundAmountNote: document.querySelector("#refund-amount-note"),
  exceptionRefundAmount: document.querySelector("#exception-refund-amount"),
  exceptionNote: document.querySelector("#exception-note"),
  exceptionDialogMessage: document.querySelector("#exception-dialog-message"),
  saveExceptionHandling: document.querySelector("#save-exception-handling"),
  cancelExceptionHandling: document.querySelector("#cancel-exception-handling"),
  businessPresetDialog: document.querySelector("#business-preset-dialog"),
  businessPresetDialogClose: document.querySelector("#business-preset-dialog-close"),
  businessPresetDialogDone: document.querySelector("#business-preset-dialog-done"),
  businessPresetInput: document.querySelector("#business-preset-input"),
  addBusinessPreset: document.querySelector("#add-business-preset"),
  businessPresetBuiltInList: document.querySelector("#business-preset-built-in-list"),
  businessPresetCustomList: document.querySelector("#business-preset-custom-list"),
  businessPresetDialogMessage: document.querySelector("#business-preset-dialog-message"),
  stageDialog: document.querySelector("#stage-dialog"),
  stageDialogClose: document.querySelector("#stage-dialog-close"),
  stageDialogTitle: document.querySelector("#stage-dialog-title"),
  stageDialogProject: document.querySelector("#stage-dialog-project"),
  stageDialogClient: document.querySelector("#stage-dialog-client"),
  stageDialogStatus: document.querySelector("#stage-dialog-status"),
  stageOptionList: document.querySelector("#stage-option-list"),
  stageCustomInput: document.querySelector("#stage-custom-input"),
  stageDialogMessage: document.querySelector("#stage-dialog-message"),
  stageTimelineSection: document.querySelector("#stage-timeline-section"),
  stageTimelineList: document.querySelector("#stage-timeline-list"),
  saveStage: document.querySelector("#save-stage"),
  clearStage: document.querySelector("#clear-stage"),
  cancelStage: document.querySelector("#cancel-stage"),
  workHoursDialog: document.querySelector("#work-hours-dialog"),
  workHoursDialogClose: document.querySelector("#work-hours-dialog-close"),
  workHoursDialogTitle: document.querySelector("#work-hours-dialog-title"),
  workHoursDialogProject: document.querySelector("#work-hours-dialog-project"),
  workHoursDialogClient: document.querySelector("#work-hours-dialog-client"),
  workHoursDialogStatus: document.querySelector("#work-hours-dialog-status"),
  workHoursDialogInput: document.querySelector("#work-hours-dialog-input"),
  workHoursDialogHint: document.querySelector("#work-hours-dialog-hint"),
  workHoursDialogMessage: document.querySelector("#work-hours-dialog-message"),
  saveWorkHours: document.querySelector("#save-work-hours"),
  clearWorkHours: document.querySelector("#clear-work-hours"),
  cancelWorkHours: document.querySelector("#cancel-work-hours"),
  authEmail: document.querySelector("#auth-email"),
  authPassword: document.querySelector("#auth-password"),
  signIn: document.querySelector("#sign-in"),
  signUp: document.querySelector("#sign-up"),
  resendSignup: document.querySelector("#resend-signup"),
  forgotPassword: document.querySelector("#forgot-password"),
  signOut: document.querySelector("#sign-out"),
  recoveryPanel: document.querySelector("#recovery-panel"),
  resetPassword: document.querySelector("#reset-password"),
  resetPasswordConfirm: document.querySelector("#reset-password-confirm"),
  updatePassword: document.querySelector("#update-password"),
  authMessage: document.querySelector("#auth-message"),
  turnstilePanel: document.querySelector("#turnstile-panel"),
  turnstileWidget: document.querySelector("#turnstile-widget"),
  turnstileNote: document.querySelector("#turnstile-note"),
  retryTurnstile: document.querySelector("#retry-turnstile"),
  syncModeLabel: document.querySelector("#sync-mode-label"),
  syncModeNote: document.querySelector("#sync-mode-note"),
  syncUser: document.querySelector("#sync-user"),
  quickNav: document.querySelector("#quick-nav"),
  quickNavMobile: document.querySelector("#quick-nav-mobile"),
};

void bootstrap().catch((error) => {
  console.error("bootstrap failed", error);
  const message = error instanceof Error ? error.message : "页面初始化失败，请刷新重试。";
  if (elements.authMessage) {
    elements.authMessage.textContent = `页面初始化失败：${message}`;
  }
  if (elements.calendarTitle && !elements.calendarTitle.textContent) {
    elements.calendarTitle.textContent = "加载失败";
  }
});

function initWidgetMode() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("widget") !== "1") return;
  document.body.classList.add("widget-mode");
  const titlebar = document.getElementById("widget-titlebar");
  if (titlebar) {
    titlebar.hidden = false;
    const pinBtn = document.getElementById("widget-pin");
    const minBtn = document.getElementById("widget-minimize");
    const closeBtn = document.getElementById("widget-close");
    if (closeBtn) closeBtn.addEventListener("click", () => window.electronAPI?.close());
    if (minBtn) minBtn.addEventListener("click", () => window.electronAPI?.minimize());
    if (pinBtn) pinBtn.addEventListener("click", () => window.electronAPI?.toggleAlwaysOnTop());
  }
}

async function bootstrap() {
  initWidgetMode();
  syncViewportModeClass();
  applyBackgroundTheme(state.backgroundColor);
  renderQqGroupEntry();
  renderBusinessTypeOptions();
  renderBusinessShortcutList();
  renderBusinessPresetDialog();
  renderProductionStageOptions();
  renderSourceOptions();
  fillSelectWithItems(elements.feeMode, FEE_MODES);
  fillSelectWithItems(elements.currency, CURRENCY_OPTIONS);
  fillSelect(elements.priority, PRIORITIES);
  fillSelect(elements.usageType, USAGE_TYPES);
  fillSelect(elements.status, STATUSES);
  fillSelect(elements.exceptionType, EXCEPTION_TYPES);
  fillSelect(elements.paymentStatus, PAYMENT_STATUSES);
  fillSelect(elements.exceptionResolution, EXCEPTION_RESOLUTIONS, false, "请选择");
  fillSelect(elements.statusFilter, STATUSES, true);
  fillSelect(elements.exceptionFilter, EXCEPTION_TYPES, true);
  fillSelect(elements.paymentFilter, PAYMENT_STATUSES, true);
  fillSelect(
    elements.batchExceptionType,
    EXCEPTION_TYPES.filter((type) => type !== "无"),
  );

  bindEvents();
  applyViewVisibility();
  initQuickNav();
  syncAuthCooldownTicker();
  resetForm();
  render();

  if (state.mode === "cloud") {
    const supabaseReady = await initializeSupabase();
    if (supabaseReady) {
      await restoreSession();
    } else {
      state.orders = state.localBackupOrders;
    }
  } else {
    state.orders = state.localBackupOrders;
    updateAuthUi("当前是本地模式。未配置 Supabase 时，数据只保存在浏览器。");
  }
  cleanupLegacyDemoData();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }

  render();
}

function bindEvents() {
  window.addEventListener("resize", syncViewportModeClass, { passive: true });
  window.addEventListener("orientationchange", syncViewportModeClass, { passive: true });
  elements.monthFilter.value = state.filters.month;
  bindQqGroupActions();
  if (elements.backgroundColorInput) {
    elements.backgroundColorInput.value = state.backgroundColor;
    elements.backgroundColorInput.addEventListener("input", (event) => {
      const nextColor = normalizeHexColor(event.target.value, DEFAULT_BACKGROUND_HEX);
      applyBackgroundTheme(nextColor);
      persistBackgroundTheme(nextColor);
    });
  }
  elements.resetBackgroundColor?.addEventListener("click", () => {
    applyBackgroundTheme(DEFAULT_BACKGROUND_HEX);
    persistBackgroundTheme(DEFAULT_BACKGROUND_HEX);
  });

  elements.authEmail.addEventListener("input", () => {
    renderSyncPanel();
  });
  elements.viewModeSchedule?.addEventListener("click", () => {
    setViewMode(VIEW_MODE_SCHEDULE);
  });
  elements.viewModeInsights?.addEventListener("click", () => {
    setViewMode(VIEW_MODE_INSIGHTS);
  });
  elements.scheduleLayoutToggle?.addEventListener("click", () => {
    toggleScheduleLayoutEditMode();
  });
  elements.calendarModeTags?.addEventListener("click", () => {
    setCalendarDisplayMode(CALENDAR_DISPLAY_TAGS);
  });
  elements.calendarModeTimeline?.addEventListener("click", () => {
    setCalendarDisplayMode(CALENDAR_DISPLAY_TIMELINE);
  });
  elements.toggleClientsPanel?.addEventListener("click", () => {
    togglePanelCollapsed("clients");
  });

  elements.monthFilter.addEventListener("input", (event) => {
    state.filters.month = event.target.value;
    state.calendarMonth = parseMonthInput(event.target.value);
    render();
  });

  elements.statusFilter.addEventListener("change", (event) => {
    state.filters.status = event.target.value;
    render();
  });

  elements.stageFilter.addEventListener("change", (event) => {
    state.filters.stage = event.target.value;
    render();
  });

  elements.sourceFilter.addEventListener("change", (event) => {
    state.filters.source = normalizeSourceValue(event.target.value) || "all";
    render();
  });

  elements.exceptionFilter.addEventListener("change", (event) => {
    state.filters.exception = event.target.value;
    render();
  });

  elements.paymentFilter.addEventListener("change", (event) => {
    state.filters.payment = event.target.value;
    render();
  });

  elements.searchFilter.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    render();
  });
  elements.activeBusinessFilter?.addEventListener("change", (event) => {
    state.listFilters.active.business = normalizeBusinessTypeValue(event.target.value) || "all";
    render();
  });
  elements.completedBusinessFilter?.addEventListener("change", (event) => {
    state.listFilters.completed.business = normalizeBusinessTypeValue(event.target.value) || "all";
    render();
  });
  elements.activeSearchFilter?.addEventListener("input", (event) => {
    state.listFilters.active.query = normalizeListFilterQuery(event.target.value);
    render();
  });
  elements.completedSearchFilter?.addEventListener("input", (event) => {
    state.listFilters.completed.query = normalizeListFilterQuery(event.target.value);
    render();
  });
  elements.vipThresholdInput?.addEventListener("input", (event) => {
    const nextThreshold = parseVipThresholdInput(event.target.value);
    if (nextThreshold == null) return;
    state.clientInsightSettings = normalizeClientInsightSettings({
      ...state.clientInsightSettings,
      vipThreshold: nextThreshold,
    });
    renderClientInsights(state.orders);
  });
  elements.vipThresholdInput?.addEventListener("blur", () => {
    void persistClientInsightSettingsFromInput();
  });
  elements.fxEnabledInput?.addEventListener("change", (event) => {
    state.fxSettings = normalizeFxSettings({
      ...state.fxSettings,
      enabled: Boolean(event.target.checked),
    });
    if (!state.fxSettings.enabled && elements.currency) {
      elements.currency.value = "CNY";
    }
    syncCurrencyUi();
    render();
    void persistFxSettingsFromInput();
  });
  elements.usdCnyRateInput?.addEventListener("input", (event) => {
    const nextRate = parseFxRateInput(event.target.value);
    if (nextRate == null) return;
    state.fxSettings = normalizeFxSettings({
      ...state.fxSettings,
      usdCnyRate: nextRate,
    });
    renderFxSettingsSummary();
    render();
  });
  elements.jpyCnyRateInput?.addEventListener("input", (event) => {
    const nextRate = parseFxRateInput(event.target.value);
    if (nextRate == null) return;
    state.fxSettings = normalizeFxSettings({
      ...state.fxSettings,
      jpyCnyRate: nextRate,
    });
    renderFxSettingsSummary();
    render();
  });
  elements.twdCnyRateInput?.addEventListener("input", (event) => {
    const nextRate = parseFxRateInput(event.target.value);
    if (nextRate == null) return;
    state.fxSettings = normalizeFxSettings({
      ...state.fxSettings,
      twdCnyRate: nextRate,
    });
    renderFxSettingsSummary();
    render();
  });
  elements.hkdCnyRateInput?.addEventListener("input", (event) => {
    const nextRate = parseFxRateInput(event.target.value);
    if (nextRate == null) return;
    state.fxSettings = normalizeFxSettings({
      ...state.fxSettings,
      hkdCnyRate: nextRate,
    });
    renderFxSettingsSummary();
    render();
  });
  elements.usdCnyRateInput?.addEventListener("blur", () => {
    void persistFxSettingsFromInput();
  });
  elements.jpyCnyRateInput?.addEventListener("blur", () => {
    void persistFxSettingsFromInput();
  });
  elements.twdCnyRateInput?.addEventListener("blur", () => {
    void persistFxSettingsFromInput();
  });
  elements.hkdCnyRateInput?.addEventListener("blur", () => {
    void persistFxSettingsFromInput();
  });

  elements.form.addEventListener("submit", handleSubmit);
  elements.form.addEventListener("input", () => renderWorkHoursPreview());
  elements.form.addEventListener("change", () => {
    renderWorkHoursPreview();
    refreshPendingTimelineDraftFromForm();
  });
  elements.saveBusinessTemplate.addEventListener("click", () => {
    void saveBusinessTemplateFromForm();
  });
  elements.duplicateLast.addEventListener("click", duplicatePreviousOrder);
  elements.resetForm.addEventListener("click", () => {
    resetForm();
    render();
  });
  elements.openBusinessPresetDialog.addEventListener("click", openBusinessPresetDialog);
  elements.businessShortcutList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-business-shortcut]");
    if (!button) return;
    const value = normalizeBusinessTypeValue(button.dataset.businessShortcut);
    if (!value) return;
    const template = getBusinessTemplate(value);
    if (template) {
      applyBusinessTemplateToForm(template);
      updateAuthUi(`已套用「${value}」模板：覆盖项目与业务字段，保留老板名和动工/截稿/完成日期。`);
    } else {
      elements.businessType.value = value;
      renderBusinessShortcutList();
      refreshPendingTimelineDraftFromForm();
    }
    elements.businessType.focus();
  });
  elements.businessPresetDialogClose.addEventListener("click", closeBusinessPresetDialog);
  elements.businessPresetDialogDone.addEventListener("click", closeBusinessPresetDialog);
  elements.addBusinessPreset.addEventListener("click", () => {
    void addBusinessPresetFromDialog();
  });
  elements.businessPresetInput.addEventListener("input", (event) => {
    if (elements.businessPresetDialogMessage) {
      elements.businessPresetDialogMessage.textContent = "";
    }
    event.target.value = normalizeBusinessTypeValue(event.target.value);
  });
  elements.businessPresetInput.addEventListener("blur", () => {
    elements.businessPresetInput.value = normalizeBusinessTypeValue(elements.businessPresetInput.value);
  });
  elements.businessPresetInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void addBusinessPresetFromDialog();
  });
  elements.businessPresetBuiltInList.addEventListener("click", (event) => {
    const templateButton = event.target.closest("[data-remove-business-template]");
    if (!templateButton) return;
    const name = normalizeBusinessTypeValue(templateButton.dataset.removeBusinessTemplate);
    if (!name) return;
    void removeBusinessTemplateFromDialog(name);
  });
  elements.businessPresetCustomList.addEventListener("click", (event) => {
    const templateButton = event.target.closest("[data-remove-business-template]");
    if (templateButton) {
      const templateName = normalizeBusinessTypeValue(templateButton.dataset.removeBusinessTemplate);
      if (!templateName) return;
      void removeBusinessTemplateFromDialog(templateName);
      return;
    }
    const button = event.target.closest("[data-remove-business-preset]");
    if (!button) return;
    const name = normalizeBusinessTypeValue(button.dataset.removeBusinessPreset);
    if (!name) return;
    void removeBusinessPresetFromDialog(name);
  });
  elements.businessPresetDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeBusinessPresetDialog();
  });
  elements.businessPresetDialog?.addEventListener("close", () => {
    if (elements.businessPresetDialogMessage) {
      elements.businessPresetDialogMessage.textContent = "";
    }
    if (elements.businessPresetInput) {
      elements.businessPresetInput.value = "";
    }
  });
  elements.businessType.addEventListener("blur", () => {
    elements.businessType.value = normalizeBusinessTypeValue(elements.businessType.value);
    renderBusinessShortcutList();
  });
  elements.businessType.addEventListener("input", () => {
    renderBusinessShortcutList();
  });
  elements.productionStage.addEventListener("blur", () => {
    elements.productionStage.value = normalizeProductionStageValue(elements.productionStage.value);
  });
  elements.workHours.addEventListener("blur", () => {
    elements.workHours.value = elements.workHours.value ? formatHours(elements.workHours.value) : "";
    renderWorkHoursPreview();
  });
  elements.source.addEventListener("change", (event) => {
    const normalizedSource = normalizeSourceValue(event.target.value) || SOURCES[0];
    event.target.value = normalizedSource;
    if (shouldAutoApplySourceFee()) {
      const nextFeeMode = getSuggestedFeeMode(normalizedSource);
      elements.feeMode.value = nextFeeMode;
      elements.feeRate.value = formatFeeRatePercent(
        getDefaultFeeRate(normalizedSource, nextFeeMode),
      );
    }
    renderSourceOptions();
    syncCalendarColorInputWithSource();
    updateFeeModeUi();
    renderWorkHoursPreview();
  });
  elements.source.addEventListener("blur", () => {
    const normalizedSource = normalizeSourceValue(elements.source.value) || SOURCES[0];
    elements.source.value = normalizedSource;
    syncCalendarColorInputWithSource();
  });
  elements.calendarColor?.addEventListener("input", (event) => {
    setCalendarColorInputMode(true);
    event.target.value = normalizeHexColor(event.target.value, getSourceColor(elements.source.value));
    if (state.pendingTimelineDraft) {
      updatePendingTimelineDraftColor(event.target.value, { syncForm: false });
      return;
    }
    refreshPendingTimelineDraftFromForm();
  });
  elements.resetCalendarColor?.addEventListener("click", () => {
    setCalendarColorInputMode(false);
    syncCalendarColorInputWithSource();
    if (state.pendingTimelineDraft) {
      state.pendingTimelineDraftColor = "";
      refreshPendingTimelineDraftFromForm();
      return;
    }
    refreshPendingTimelineDraftFromForm();
  });
  elements.feeMode.addEventListener("change", () => {
    elements.feeRate.value = formatFeeRatePercent(
      getDefaultFeeRate(elements.source.value, elements.feeMode.value),
    );
    updateFeeModeUi();
    renderWorkHoursPreview();
  });
  elements.usageType.addEventListener("change", () => {
    updateFeeModeUi();
    syncUsageRateUi();
    renderWorkHoursPreview();
  });
  elements.usageRate.addEventListener("input", () => {
    syncUsageRateUi({ previewOnly: true });
    renderWorkHoursPreview();
  });
  elements.usageRate.addEventListener("blur", () => {
    elements.usageRate.value = formatUsageRatePercent(parseUsageRateInput(elements.usageRate.value));
    syncUsageRateUi();
    renderWorkHoursPreview();
  });
  elements.amount.addEventListener("input", () => {
    syncUsageRateUi({ previewOnly: true });
  });
  elements.amount.addEventListener("blur", () => {
    syncUsageRateUi();
  });
  elements.currency.addEventListener("change", () => {
    syncCurrencyUi();
    updateFeeModeUi();
    renderWorkHoursPreview();
    syncUsageRateUi({ previewOnly: true });
  });
  elements.exportJson.addEventListener("click", exportJson);
  elements.exportCsv.addEventListener("click", exportCsv);
  elements.importJson.addEventListener("change", importJson);
  elements.batchMarkDone.addEventListener("click", () => applyBatchStatus("已完成"));
  elements.batchMarkPaid.addEventListener("click", () => applyBatchStatus("已付款"));
  elements.batchMarkHandled.addEventListener("click", () => applyBatchStatus("已处理"));
  elements.applyBatchException.addEventListener("click", () => {
    applyBatchExceptionType(elements.batchExceptionType.value);
  });
  elements.clearSelection.addEventListener("click", clearSelection);
  elements.exceptionHandledNo.addEventListener("change", syncExceptionDialogRefundUi);
  elements.exceptionHandledYes.addEventListener("change", syncExceptionDialogRefundUi);
  elements.exceptionResolution.addEventListener("change", syncExceptionDialogRefundUi);
  elements.exceptionDialogClose.addEventListener("click", closeExceptionDialog);
  elements.cancelExceptionHandling.addEventListener("click", closeExceptionDialog);
  elements.saveExceptionHandling.addEventListener("click", () => {
    void saveExceptionHandling();
  });
  elements.exceptionDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeExceptionDialog();
  });
  elements.stageDialogClose.addEventListener("click", closeStageDialog);
  elements.cancelStage.addEventListener("click", closeStageDialog);
  elements.clearStage.addEventListener("click", () => {
    state.stageDialogDraft = "";
    elements.stageCustomInput.value = "";
    renderStageOptionList();
  });
  elements.saveStage.addEventListener("click", () => {
    void saveProductionStage();
  });
  elements.stageCustomInput.addEventListener("input", (event) => {
    state.stageDialogDraft = normalizeProductionStageValue(event.target.value);
    renderStageOptionList();
  });
  elements.stageCustomInput.addEventListener("blur", () => {
    elements.stageCustomInput.value = normalizeProductionStageValue(elements.stageCustomInput.value);
    state.stageDialogDraft = elements.stageCustomInput.value;
    renderStageOptionList();
  });
  elements.stageDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeStageDialog();
  });
  elements.workHoursDialogClose.addEventListener("click", closeWorkHoursDialog);
  elements.cancelWorkHours.addEventListener("click", closeWorkHoursDialog);
  elements.clearWorkHours.addEventListener("click", () => {
    elements.workHoursDialogInput.value = "";
    syncWorkHoursDialogHint();
  });
  elements.saveWorkHours.addEventListener("click", () => {
    void saveWorkHours();
  });
  elements.workHoursDialogInput.addEventListener("input", () => {
    syncWorkHoursDialogHint();
  });
  elements.workHoursDialogInput.addEventListener("blur", () => {
    elements.workHoursDialogInput.value = elements.workHoursDialogInput.value
      ? formatHours(elements.workHoursDialogInput.value)
      : "";
    syncWorkHoursDialogHint();
  });
  elements.workHoursDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeWorkHoursDialog();
  });
  elements.calendarGrid?.addEventListener("click", (event) => {
    const itemButton = event.target.closest('[data-action="jumpOrder"]');
    if (itemButton) {
      const id = String(itemButton.dataset.id || "");
      if (!id) return;
      jumpToOrder(id);
      return;
    }
    const detailButton = event.target.closest('[data-action="openCalendarDay"]');
    if (detailButton) {
      const dateKey = String(detailButton.dataset.date || "");
      if (!dateKey) return;
      openCalendarDayDialog(dateKey, state.calendarDayEntriesByDate.get(dateKey) || []);
      return;
    }
    const selectButton = event.target.closest('[data-action="selectCalendarDate"]');
    if (!selectButton) return;
    const dateKey = String(selectButton.dataset.date || "");
    if (!dateKey) return;
    handleCalendarDateSelection(dateKey);
  });
  elements.calendarGrid?.addEventListener("contextmenu", (event) => {
    handleCalendarContextMenuRequest(event);
  });
  elements.calendarDayDialogClose?.addEventListener("click", closeCalendarDayDialog);
  elements.calendarDayDialogDone?.addEventListener("click", closeCalendarDayDialog);
  elements.calendarDayDialogList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-calendar-day-jump]");
    if (!button) return;
    const id = String(button.dataset.calendarDayJump || "");
    if (!id) return;
    closeCalendarDayDialog();
    jumpToOrder(id);
  });
  elements.calendarDayDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeCalendarDayDialog();
  });
  elements.calendarContextMenu?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const dateKey = String(elements.calendarContextMenu.dataset.date || state.calendarContextMenuDate || "");
    if (!dateKey) return;
    const action = String(button.dataset.action || "");
    if (action === "openCalendarDay") {
      closeCalendarContextMenu();
      openCalendarDayDialog(dateKey, state.calendarDayEntriesByDate.get(dateKey) || []);
      return;
    }
    if (action === "setCalendarDayMark") {
      closeCalendarContextMenu();
      void persistCalendarDayMark(dateKey, button.dataset.mark || "");
    }
  });
  elements.calendarJumpToday?.addEventListener("click", () => {
    const today = formatDateInput(new Date());
    state.calendarMonth = currentMonthDate();
    state.selectedCalendarDate = today;
    syncMonthFilter();
    render();
  });
  elements.calendarCreateRange?.addEventListener("click", (event) => {
    event.stopPropagation();
    if (state.pendingTimelineDraft && !state.calendarCreateMode) {
      focusPendingTimelineDraft();
      return;
    }
    startCalendarCreateMode();
  });
  elements.calendarCancelRange?.addEventListener("click", (event) => {
    event.stopPropagation();
    if (state.pendingTimelineDraft && !state.calendarCreateMode) {
      discardPendingTimelineDraft();
      return;
    }
    cancelCalendarCreateMode();
  });
  elements.calendarFocusOpen?.addEventListener("click", () => {
    const dateKey = state.selectedCalendarDate;
    if (!dateKey) return;
    openCalendarDayDialog(dateKey, state.calendarDayEntriesByDate.get(dateKey) || []);
  });
  elements.calendarFocusMarkRest?.addEventListener("click", () => {
    if (!state.selectedCalendarDate) return;
    void persistCalendarDayMark(
      state.selectedCalendarDate,
      getCalendarDayMarkType(state.selectedCalendarDate) === CALENDAR_DAY_MARK_REST ? "" : CALENDAR_DAY_MARK_REST,
    );
  });
  elements.calendarFocusMarkWork?.addEventListener("click", () => {
    if (!state.selectedCalendarDate) return;
    void persistCalendarDayMark(
      state.selectedCalendarDate,
      getCalendarDayMarkType(state.selectedCalendarDate) === CALENDAR_DAY_MARK_WORK ? "" : CALENDAR_DAY_MARK_WORK,
    );
  });
  elements.calendarFocusClearMark?.addEventListener("click", () => {
    if (!state.selectedCalendarDate) return;
    void persistCalendarDayMark(state.selectedCalendarDate, "");
  });
  elements.dashboard?.addEventListener("click", (event) => {
    const moveButton = event.target.closest("[data-panel-move]");
    if (moveButton) {
      movePanel(String(moveButton.dataset.panelId || ""), String(moveButton.dataset.panelMove || ""));
      return;
    }
    const collapseButton = event.target.closest("[data-panel-collapse]");
    if (collapseButton) {
      togglePanelCollapsed(String(collapseButton.dataset.panelId || ""));
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !state.calendarCreateMode) return;
    cancelCalendarCreateMode();
  });
  elements.calendarFocusList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-calendar-day-jump]");
    if (!button) return;
    const id = String(button.dataset.calendarDayJump || "");
    if (!id) return;
    jumpToOrder(id);
  });
  elements.calendarTimeline?.addEventListener("click", (event) => {
    if (Date.now() < timelineDragSuppressClickUntil) return;

    const draftButton = event.target.closest("[data-action='focusTimelineDraft']");
    if (draftButton) {
      openPendingTimelineDraftPopover(draftButton.closest("[data-timeline-bar]"));
      return;
    }
    const dayButton = event.target.closest('[data-action="openCalendarDay"]');
    if (dayButton) {
      const dateKey = String(dayButton.dataset.date || "");
      if (!dateKey) return;
      openCalendarDayDialog(dateKey, state.calendarDayEntriesByDate.get(dateKey) || []);
      return;
    }
    const resetButton = event.target.closest("[data-action='resetTimelineColor']");
    if (resetButton) {
      const orderId = String(resetButton.dataset.id || "");
      if (!orderId) return;
      void persistTimelineColor(orderId, "");
      return;
    }
    if (event.target.closest("[data-drag-handle]")) return;
    const bar = event.target.closest("[data-action='jumpOrder']");
    if (bar) {
      const id = String(bar.dataset.id || "");
      if (!id) return;
      const order = state.orders.find((o) => o.id === id);
      highlightTimelineBar(bar.closest("[data-timeline-bar]"));
      if (order) {
        const dateKey = normalizeDateKey(order.startDate || order.dueDate);
        if (dateKey) {
          state.selectedCalendarDate = dateKey;
          render();
          updateAuthUi(`已选中「${order.projectName}」，可在右侧查看当天详情；点列表项可跳到清单。`);
          return;
        }
      }
      jumpToOrder(id);
      return;
    }
    if (event.target.closest("[data-timeline-bar]")) return;
    const selectButton = event.target.closest('[data-action="selectCalendarDate"]');
    if (!selectButton) return;
    const dateKey = String(selectButton.dataset.date || "");
    if (!dateKey) return;
    handleCalendarDateSelection(dateKey);
  });
  elements.calendarTimeline?.addEventListener("contextmenu", (event) => {
    handleCalendarContextMenuRequest(event);
  });
  elements.calendarTimeline?.addEventListener("change", (event) => {
    const picker = event.target.closest("[data-action='setTimelineColor']");
    if (!picker) return;
    const id = String(picker.dataset.id || "");
    if (!id) return;
    void persistTimelineColor(id, picker.value);
  });
  elements.timelineDraftProjectInput?.addEventListener("input", (event) => {
    elements.projectName.value = String(event.target.value || "").trimStart();
    refreshPendingTimelineDraftFromForm();
  });
  elements.timelineDraftClientInput?.addEventListener("input", (event) => {
    elements.clientName.value = String(event.target.value || "").trimStart();
    refreshPendingTimelineDraftFromForm();
  });
  elements.timelineDraftBusinessInput?.addEventListener("input", (event) => {
    elements.businessType.value = normalizeBusinessTypeValue(String(event.target.value || ""));
    renderBusinessShortcutList();
    refreshPendingTimelineDraftFromForm();
  });
  elements.timelineDraftBusinessInput?.addEventListener("blur", () => {
    elements.businessType.value = normalizeBusinessTypeValue(elements.businessType.value);
    if (elements.timelineDraftBusinessInput) {
      elements.timelineDraftBusinessInput.value = elements.businessType.value;
    }
    renderBusinessShortcutList();
    refreshPendingTimelineDraftFromForm();
  });
  elements.timelineDraftSourceInput?.addEventListener("input", (event) => {
    elements.source.value = String(event.target.value || "").trim();
    refreshPendingTimelineDraftFromForm();
  });
  elements.timelineDraftSourceInput?.addEventListener("blur", () => {
    const normalizedSource = normalizeSourceValue(elements.source.value) || SOURCES[0];
    elements.source.value = normalizedSource;
    if (shouldAutoApplySourceFee()) {
      const nextFeeMode = getSuggestedFeeMode(normalizedSource);
      elements.feeMode.value = nextFeeMode;
      elements.feeRate.value = formatFeeRatePercent(getDefaultFeeRate(normalizedSource, nextFeeMode));
    }
    if (elements.timelineDraftSourceInput) {
      elements.timelineDraftSourceInput.value = normalizedSource;
    }
    renderSourceOptions();
    syncCalendarColorInputWithSource();
    updateFeeModeUi();
    renderWorkHoursPreview();
    refreshPendingTimelineDraftFromForm();
  });
  elements.timelineDraftPriorityInput?.addEventListener("change", (event) => {
    elements.priority.value = String(event.target.value || PRIORITIES[0]);
    refreshPendingTimelineDraftFromForm();
  });
  elements.timelineDraftStatusInput?.addEventListener("change", (event) => {
    const nextStatus = String(event.target.value || STATUSES[0]);
    elements.status.value = nextStatus;
    if (CLOSED_STATUSES.has(nextStatus)) {
      elements.completedDate.value = elements.completedDate.value || elements.dueDate.value || formatDateInput(new Date());
    } else {
      elements.completedDate.value = "";
    }
    syncTimelineDraftCompletionUi();
    renderWorkHoursPreview();
    refreshPendingTimelineDraftFromForm();
  });
  elements.timelineDraftCompletedDateInput?.addEventListener("input", (event) => {
    elements.completedDate.value = String(event.target.value || "");
    renderWorkHoursPreview();
    refreshPendingTimelineDraftFromForm();
  });
  elements.timelineDraftAmountInput?.addEventListener("input", (event) => {
    const rawValue = String(event.target.value || "");
    elements.amount.value = rawValue;
    refreshPendingTimelineDraftFromForm();
  });
  elements.timelineDraftColorInput?.addEventListener("input", (event) => {
    updatePendingTimelineDraftColor(String(event.target.value || ""));
  });
  elements.timelineDraftPopoverClose?.addEventListener("click", closePendingTimelineDraftPopover);
  elements.timelineDraftSave?.addEventListener("click", () => {
    void saveOrderFromCurrentForm({ closeDraftPopover: true });
  });
  elements.timelineDraftOpenForm?.addEventListener("click", () => {
    closePendingTimelineDraftPopover();
    pinQuickNavSection("form");
    scrollToSection("form");
    const nextFocus = elements.projectName.value.trim() ? elements.clientName : elements.projectName;
    nextFocus?.focus?.();
  });
  elements.calendarTimeline?.addEventListener("pointerdown", (event) => {
    beginTimelineCreateRangeDrag(event);
    beginTimelineDrag(event);
  });

  elements.prevMonth.addEventListener("click", () => {
    state.calendarMonth = shiftMonth(state.calendarMonth, -1);
    syncMonthFilter();
    render();
  });

  elements.nextMonth.addEventListener("click", () => {
    state.calendarMonth = shiftMonth(state.calendarMonth, 1);
    syncMonthFilter();
    render();
  });

  elements.signIn.addEventListener("click", () => signInWithEmail());
  elements.signUp.addEventListener("click", () => signUpWithEmail());
  elements.resendSignup.addEventListener("click", () => resendSignupEmail());
  elements.forgotPassword.addEventListener("click", () => requestPasswordReset());
  elements.signOut.addEventListener("click", () => signOut());
  elements.updatePassword.addEventListener("click", () => completePasswordReset());
  elements.retryTurnstile?.addEventListener("click", () => {
    state.turnstileAutoRetries = 0;
    retryTurnstile();
  });
  window.addEventListener("pointermove", handleTimelineDragMove);
  window.addEventListener("pointermove", handleTimelineCreateRangeMove);
  window.addEventListener("pointerup", handleTimelineDragEnd);
  window.addEventListener("pointerup", handleTimelineCreateRangeEnd);
  window.addEventListener("pointercancel", handleTimelineDragEnd);
  window.addEventListener("pointercancel", handleTimelineCreateRangeEnd);
  window.addEventListener("resize", closeCalendarContextMenu, { passive: true });
  window.addEventListener("scroll", closeCalendarContextMenu, { passive: true });
  document.addEventListener("click", (event) => {
    if (!elements.calendarContextMenu || elements.calendarContextMenu.hidden) return;
    if (elements.calendarContextMenu.contains(event.target)) return;
    closeCalendarContextMenu();
  });
  document.addEventListener("click", (event) => {
    if (!elements.timelineDraftPopover || elements.timelineDraftPopover.hidden) return;
    if (elements.timelineDraftPopover.contains(event.target)) return;
    if (event.target.closest("[data-action='focusTimelineDraft']")) return;
    if (event.target.closest("#calendar-create-range")) return;
    if (event.target.closest("#calendar-cancel-range")) return;
    closePendingTimelineDraftPopover();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeCalendarContextMenu();
    closePendingTimelineDraftPopover();
  });
}

function shouldForceMobileLayoutMode() {
  const touchPoints = Number(navigator.maxTouchPoints || 0);
  const screenWidth = Number(window.screen?.width || 0);
  const innerWidth = Number(window.innerWidth || 0);
  if (touchPoints <= 0 || !screenWidth || !innerWidth) return false;
  return innerWidth / screenWidth >= 1.6;
}

function syncViewportModeClass() {
  const root = document.documentElement;
  if (!root) return;
  root.classList.toggle("mobile-desktop-mode", shouldForceMobileLayoutMode());
}

function renderQqGroupEntry() {
  const qqGroupNumber = String(SITE_CONTENT.qqGroupNumber || "").trim();
  const qqGroupLabel = SITE_CONTENT.qqGroupLabel || "反馈QQ群";
  const qqGroupHint = SITE_CONTENT.qqGroupHint || "加群反馈问题 / 看更新通知";

  if (elements.appQqNumber) {
    elements.appQqNumber.textContent = qqGroupNumber;
  }
  if (elements.appQqHint) {
    elements.appQqHint.textContent = qqGroupHint;
  }
  if (elements.appQqEntry) {
    const label = elements.appQqEntry.querySelector(".qq-entry-label");
    if (label) {
      label.textContent = qqGroupLabel;
    }
  }
}

function bindQqGroupActions() {
  elements.appCopyQq?.addEventListener("click", () => {
    void copyQqGroupNumber();
  });
}

async function copyQqGroupNumber() {
  const qqGroupNumber = String(SITE_CONTENT.qqGroupNumber || "").trim();
  if (!qqGroupNumber) {
    setAppQqCopyMessage("群号未配置，请稍后再试。");
    return;
  }

  const copied = await copyTextToClipboard(qqGroupNumber);
  if (copied) {
    setAppQqCopyMessage(`已复制群号 ${qqGroupNumber}`, true);
    return;
  }
  setAppQqCopyMessage(`复制失败，请手动复制：${qqGroupNumber}`);
}

function setAppQqCopyMessage(message, success = false) {
  if (!elements.appQqMessage) return;
  elements.appQqMessage.textContent = message;
  elements.appQqMessage.dataset.state = success ? "success" : "default";
}

async function ensureSupabaseClientFactory() {
  if (supabaseCreateClientFactory) {
    return supabaseCreateClientFactory;
  }
  if (!supabaseFactoryPromise) {
    supabaseFactoryPromise = import(SUPABASE_BROWSER_BUNDLE_URL)
      .then((module) => {
        if (typeof module?.createClient !== "function") {
          throw new Error("Supabase SDK missing createClient.");
        }
        supabaseCreateClientFactory = module.createClient;
        return supabaseCreateClientFactory;
      })
      .catch((error) => {
        supabaseFactoryPromise = null;
        throw error;
      });
  }
  return supabaseFactoryPromise;
}

async function initializeSupabase() {
  let createClient;
  try {
    createClient = await ensureSupabaseClientFactory();
  } catch (_error) {
    state.supabase = null;
    state.session = null;
    state.user = null;
    state.mode = "local";
    state.turnstileRequested = false;
    state.turnstilePendingAction = "";
    state.turnstileStatus = "idle";
    state.turnstileToken = "";
    updateAuthUi("云端 SDK 加载失败，已自动切换到本地模式。请检查网络后刷新重试。");
    return false;
  }

  state.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  state.supabase.auth.onAuthStateChange((event, session) => {
    state.session = session;
    state.user = session?.user ?? null;

    if (event === "PASSWORD_RECOVERY") {
      state.recoveryMode = true;
      updateAuthUi("已进入重置密码流程，请输入新密码。");
      render();
      return;
    }

    window.setTimeout(() => {
      void applyAuthSessionState();
    }, 0);
  });

  return true;
}

function getTurnstileActionLabel(actionKey) {
  if (actionKey === "signIn") return "登录";
  if (actionKey === "signUp") return "注册";
  if (actionKey === "resendSignup") return "重发验证邮件";
  if (actionKey === "forgotPassword") return "发送重置邮件";
  return "继续";
}

function requestTurnstileChallenge(actionKey = "") {
  if (!hasTurnstileConfig()) {
    return;
  }

  state.turnstileRequested = true;
  if (actionKey) {
    state.turnstilePendingAction = actionKey;
  }

  if (state.turnstileWidgetId === null && state.turnstileStatus === "idle") {
    void initializeTurnstile();
    return;
  }

  renderSyncPanel();
}

async function runPendingTurnstileAction() {
  if (state.busy || !state.turnstileToken || !state.turnstilePendingAction) {
    return;
  }

  const actionKey = state.turnstilePendingAction;
  state.turnstilePendingAction = "";

  if (actionKey === "signIn") {
    await signInWithEmail();
    return;
  }
  if (actionKey === "signUp") {
    await signUpWithEmail();
    return;
  }
  if (actionKey === "resendSignup") {
    await resendSignupEmail();
    return;
  }
  if (actionKey === "forgotPassword") {
    await requestPasswordReset();
  }
}

async function initializeTurnstile() {
  if (state.mode !== "cloud") {
    state.turnstileStatus = hasTurnstileConfig() ? "idle" : "missing";
    state.turnstileToken = "";
    renderSyncPanel();
    return;
  }

  if (!hasTurnstileConfig()) {
    state.turnstileStatus = "missing";
    state.turnstileToken = "";
    renderSyncPanel();
    return;
  }

  try {
    await ensureTurnstileScript();
    mountTurnstileWidget();
    if (!state.turnstileToken) {
      state.turnstileStatus = "ready";
    }
  } catch {
    state.turnstileStatus = "error";
    state.turnstileToken = "";
    if (state.turnstileAutoRetries < 2) {
      state.turnstileAutoRetries += 1;
      setTimeout(() => {
        if (state.turnstileStatus === "error") {
          retryTurnstile();
        }
      }, 2000 * state.turnstileAutoRetries);
    }
  }

  renderSyncPanel();
}

function ensureTurnstileScript() {
  if (window.turnstile?.render) {
    return Promise.resolve(window.turnstile);
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  state.turnstileStatus = "loading";
  renderSyncPanel();

  turnstileScriptPromise = new Promise((resolve, reject) => {
    let existingScript = document.querySelector('script[data-turnstile-script="true"]');
    const handleLoad = () => {
      if (existingScript) {
        existingScript.dataset.turnstileLoadState = "loaded";
      }
      resolve(window.turnstile);
    };
    const handleError = () => {
      if (existingScript) {
        existingScript.dataset.turnstileLoadState = "error";
      }
      reject(new Error("Turnstile failed to load."));
    };

    if (existingScript) {
      const loadState = existingScript.dataset.turnstileLoadState || "";
      if (loadState === "loaded" && window.turnstile?.render) {
        resolve(window.turnstile);
        return;
      }
      if (loadState === "error") {
        existingScript.remove();
        existingScript = null;
      }
    }

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.turnstileScript = "true";
    script.dataset.turnstileLoadState = "loading";
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.append(script);
    existingScript = script;
  }).catch((error) => {
    turnstileScriptPromise = null;
    throw error;
  });

  return turnstileScriptPromise;
}

function mountTurnstileWidget() {
  if (!elements.turnstileWidget || state.turnstileWidgetId !== null || !window.turnstile?.render) {
    return;
  }

  elements.turnstileWidget.innerHTML = "";
  state.turnstileWidgetId = window.turnstile.render(elements.turnstileWidget, {
    sitekey: config.turnstileSiteKey,
    theme: "light",
    size: "flexible",
    action: "auth_email",
    callback(token) {
      state.turnstileAutoRetries = 0;
      state.turnstileToken = token;
      state.turnstileStatus = "verified";
      renderSyncPanel();
      window.setTimeout(() => {
        void runPendingTurnstileAction();
      }, 0);
    },
    "expired-callback"() {
      state.turnstileToken = "";
      state.turnstileStatus = "expired";
      renderSyncPanel();
    },
    "error-callback"() {
      state.turnstileToken = "";
      state.turnstileStatus = "error";
      renderSyncPanel();
      if (state.turnstileAutoRetries < 2) {
        state.turnstileAutoRetries += 1;
        setTimeout(() => {
          if (state.turnstileStatus === "error") {
            retryTurnstile();
          }
        }, 2000 * state.turnstileAutoRetries);
      }
    },
  });
  state.turnstileAutoRetries = 0;
}

async function getTurnstileToken() {
  if (!hasTurnstileConfig()) {
    updateAuthUi(getTurnstileActionMessage());
    renderSyncPanel();
    return null;
  }

  requestTurnstileChallenge();

  if (!window.turnstile?.render || state.turnstileWidgetId === null) {
    await initializeTurnstile();
  }

  if (!state.turnstileToken) {
    updateAuthUi(getTurnstileActionMessage());
    renderSyncPanel();
    return null;
  }

  state.turnstilePendingAction = "";
  return state.turnstileToken;
}

function refreshTurnstileToken() {
  if (state.turnstileWidgetId === null || !window.turnstile?.reset) {
    return;
  }

  state.turnstileToken = "";
  state.turnstileStatus = "ready";
  window.turnstile.reset(state.turnstileWidgetId);
  renderSyncPanel();
}

function retryTurnstile() {
  state.turnstileRequested = true;
  if (state.turnstileWidgetId !== null && window.turnstile?.remove) {
    try {
      window.turnstile.remove(state.turnstileWidgetId);
    } catch {}
  }
  document.querySelectorAll('script[data-turnstile-script="true"]').forEach((script) => {
    script.remove();
  });
  state.turnstileWidgetId = null;
  state.turnstileToken = "";
  state.turnstileStatus = "idle";
  turnstileScriptPromise = null;
  renderSyncPanel();
  void initializeTurnstile();
}

async function applyAuthSessionState() {
  if (state.user) {
    state.turnstileRequested = false;
    state.turnstilePendingAction = "";
    await syncBusinessPresetsOnLogin();
    await syncBusinessTemplatesOnLogin();
    await syncClientInsightSettingsOnLogin();
    await syncCalendarDayMarksOnLogin();
    await syncFxSettingsOnLogin();
    await loadRemoteOrders();
    if (detectFlowType() === "signup") {
      updateAuthUi("邮箱验证成功，已经为你登录。");
      clearAuthRedirect();
    } else if (state.usingLocalBackup) {
      updateAuthUi(
        `已登录 ${state.user.email}。当前云端还没有数据，先显示这台设备里的旧记录；你后续新增、编辑或删除时会自动同步到云端。`,
      );
    } else if (!state.recoveryMode) {
      updateAuthUi(`已登录 ${state.user.email}，当前数据走 Supabase 云端同步。`);
    }
  } else if (!state.recoveryMode) {
    state.turnstileRequested = false;
    state.turnstilePendingAction = "";
    state.orders = [];
    state.customBusinessTypes = loadLocalBusinessPresets();
    state.businessTemplates = loadLocalBusinessTemplates();
    state.clientInsightSettings = loadLocalClientInsightSettings();
    state.calendarDayMarks = loadLocalCalendarDayMarks();
    state.fxSettings = loadLocalFxSettings();
    if (detectFlowType() === "signup") {
      updateAuthUi("邮箱验证链接已打开，请返回登录状态继续使用。");
      clearAuthRedirect();
    } else {
      updateAuthUi(getLoggedOutAuthMessage());
    }
  }

  render();
}

async function restoreSession() {
  const { data, error } = await state.supabase.auth.getSession();
  if (error) {
    updateAuthUi(mapAuthError(error));
    return;
  }

  state.session = data.session;
  state.user = data.session?.user ?? null;

  if (state.user) {
    await syncBusinessPresetsOnLogin();
    await syncBusinessTemplatesOnLogin();
    await syncClientInsightSettingsOnLogin();
    await syncCalendarDayMarksOnLogin();
    await syncFxSettingsOnLogin();
    await loadRemoteOrders();
    if (state.recoveryMode) {
      updateAuthUi("已通过重置链接返回，请输入新密码。");
    } else if (detectFlowType() === "signup") {
      updateAuthUi("邮箱验证成功，已经为你登录。");
      clearAuthRedirect();
    } else if (state.usingLocalBackup) {
      updateAuthUi(
        `已登录 ${state.user.email}。当前云端还没有数据，先显示这台设备里的旧记录；你后续新增、编辑或删除时会自动同步到云端。`,
      );
    } else {
      updateAuthUi(`已登录 ${state.user.email}，当前数据走 Supabase 云端同步。`);
    }
  } else if (state.recoveryMode) {
    updateAuthUi("已打开重置密码链接，请输入新密码。");
  } else {
    state.orders = [];
    state.customBusinessTypes = loadLocalBusinessPresets();
    state.businessTemplates = loadLocalBusinessTemplates();
    state.clientInsightSettings = loadLocalClientInsightSettings();
    state.fxSettings = loadLocalFxSettings();
    updateAuthUi(getLoggedOutAuthMessage());
  }
}

async function signUpWithEmail() {
  if (!state.supabase) {
    updateAuthUi("未配置 Supabase 环境变量，暂时不能注册。");
    return;
  }

  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value.trim();
  if (!email || !password) {
    updateAuthUi("先填写邮箱和密码。");
    return;
  }
  if (hasAuthCooldown("signup", email)) {
    updateAuthUi(getAuthCooldownMessage("signup", email));
    renderSyncPanel();
    return;
  }
  requestTurnstileChallenge("signUp");
  const captchaToken = await getTurnstileToken();
  if (!captchaToken) {
    return;
  }

  setBusy(true);
  const { data, error } = await state.supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: currentSiteUrl(),
      captchaToken,
    },
  });
  setBusy(false);
  refreshTurnstileToken();

  if (error) {
    handleAuthActionError(error, { action: "signup", email });
    return;
  }

  if (data.session) {
    updateAuthUi("注册成功，已自动登录。");
  } else {
    startAuthCooldown("signup", email);
    startAuthCooldown("resendSignup", email);
    updateAuthUi("注册成功，请去邮箱点验证链接。60 秒内不要重复点注册；没收到再点“重发验证邮件”。");
  }
}

async function resendSignupEmail() {
  if (!state.supabase) {
    updateAuthUi("未配置 Supabase 环境变量，暂时不能重发验证邮件。");
    return;
  }

  const email = elements.authEmail.value.trim();
  if (!email) {
    updateAuthUi("先填写要验证的邮箱。");
    return;
  }
  if (hasAuthCooldown("resendSignup", email)) {
    updateAuthUi(getAuthCooldownMessage("resendSignup", email));
    renderSyncPanel();
    return;
  }
  requestTurnstileChallenge("resendSignup");
  const captchaToken = await getTurnstileToken();
  if (!captchaToken) {
    return;
  }

  setBusy(true);
  const { error } = await state.supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: currentSiteUrl(),
      captchaToken,
    },
  });
  setBusy(false);
  refreshTurnstileToken();

  if (error) {
    handleAuthActionError(error, { action: "resendSignup", email });
  } else {
    startAuthCooldown("signup", email);
    startAuthCooldown("resendSignup", email);
    updateAuthUi("验证邮件已重新发送，请检查邮箱。60 秒内先别重复点。");
  }
}

async function requestPasswordReset() {
  if (!state.supabase) {
    updateAuthUi("未配置 Supabase 环境变量，暂时不能重置密码。");
    return;
  }

  const email = elements.authEmail.value.trim();
  if (!email) {
    updateAuthUi("先填写注册邮箱，我才能发重置邮件。");
    return;
  }
  if (hasAuthCooldown("forgotPassword", email)) {
    updateAuthUi(getAuthCooldownMessage("forgotPassword", email));
    renderSyncPanel();
    return;
  }
  requestTurnstileChallenge("forgotPassword");
  const captchaToken = await getTurnstileToken();
  if (!captchaToken) {
    return;
  }

  setBusy(true);
  const { error } = await state.supabase.auth.resetPasswordForEmail(email, {
    redirectTo: currentSiteUrl(),
    captchaToken,
  });
  setBusy(false);
  refreshTurnstileToken();

  if (error) {
    handleAuthActionError(error, { action: "forgotPassword", email });
  } else {
    startAuthCooldown("forgotPassword", email);
    updateAuthUi("重置密码邮件已发送，请去邮箱点开链接后回到当前页面。60 秒内先别重复点。");
  }
}

async function completePasswordReset() {
  if (!state.supabase || !state.recoveryMode) {
    updateAuthUi("当前不在重置密码流程里。");
    return;
  }

  const password = elements.resetPassword.value.trim();
  const confirmPassword = elements.resetPasswordConfirm.value.trim();

  if (password.length < 6) {
    updateAuthUi("新密码至少 6 位。");
    return;
  }

  if (password !== confirmPassword) {
    updateAuthUi("两次输入的新密码不一致。");
    return;
  }

  setBusy(true);
  const { error } = await state.supabase.auth.updateUser({ password });
  setBusy(false);

  if (error) {
    updateAuthUi(mapAuthError(error));
    return;
  }

  state.recoveryMode = false;
  elements.resetPassword.value = "";
  elements.resetPasswordConfirm.value = "";
  clearAuthRedirect();
  updateAuthUi("密码已更新，可以直接继续使用。");
  render();
}

async function signInWithEmail() {
  if (!state.supabase) {
    updateAuthUi("未配置 Supabase 环境变量，暂时不能登录。");
    return;
  }

  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value.trim();
  if (!email || !password) {
    updateAuthUi("先填写邮箱和密码。");
    return;
  }

  let captchaToken = null;
  if (hasTurnstileConfig()) {
    requestTurnstileChallenge("signIn");
    captchaToken = await getTurnstileToken();
    if (!captchaToken) {
      return;
    }
  }

  setBusy(true);
  const { error } = await state.supabase.auth.signInWithPassword({
    email,
    password,
    ...(captchaToken
      ? {
          options: {
            captchaToken,
          },
        }
      : {}),
  });
  setBusy(false);
  refreshTurnstileToken();

  if (error) {
    updateAuthUi(mapAuthError(error));
  } else {
    updateAuthUi("登录成功，正在同步数据。");
  }
}

async function signOut() {
  if (!state.supabase || !state.user) {
    updateAuthUi(state.mode === "cloud" ? "当前还没有登录账号。" : "本地模式不需要退出登录。");
    return;
  }

  setBusy(true);
  const { error } = await state.supabase.auth.signOut();
  setBusy(false);

  if (error) {
    updateAuthUi(mapAuthError(error));
  } else {
    state.turnstileRequested = false;
    state.turnstilePendingAction = "";
    state.turnstileToken = "";
    state.turnstileStatus = hasTurnstileConfig() ? "idle" : "missing";
    state.recoveryMode = false;
    clearAuthRedirect();
    updateAuthUi("已退出登录。");
  }
}

async function loadRemoteOrders() {
  if (!state.supabase || !state.user) return;

  const { data, error } = await state.supabase
    .from(TABLE_NAME)
    .select("*")
    .order("due_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    updateAuthUi(`读取云端数据失败：${mapAuthError(error)}`);
    return;
  }

  const remoteOrders = data.map(rowToOrder);
  state.localBackupOrders = loadLocalOrders();

  if (!remoteOrders.length && state.localBackupOrders.length) {
    state.orders = state.localBackupOrders;
    state.usingLocalBackup = true;
    return;
  }

  state.orders = remoteOrders;
  state.usingLocalBackup = false;
}

async function loadRemoteBusinessPresets() {
  if (!state.supabase || !state.user) return [];

  const { data, error } = await state.supabase
    .from(BUSINESS_PRESET_TABLE)
    .select("name")
    .eq("user_id", state.user.id)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return normalizeBusinessPresetList((data || []).map((item) => item.name));
}

async function upsertRemoteBusinessPresets(names) {
  assertCloudUser();
  const normalizedList = normalizeBusinessPresetList(names);
  if (!normalizedList.length) return;

  const payload = normalizedList.map((name) => ({
    user_id: state.user.id,
    name,
  }));
  const { error } = await state.supabase
    .from(BUSINESS_PRESET_TABLE)
    .upsert(payload, { onConflict: "user_id,name" });
  if (error) throw error;
}

async function deleteRemoteBusinessPreset(name) {
  assertCloudUser();
  const normalized = normalizeBusinessTypeValue(name);
  if (!normalized) return;
  const { error } = await state.supabase
    .from(BUSINESS_PRESET_TABLE)
    .delete()
    .eq("user_id", state.user.id)
    .eq("name", normalized);
  if (error) throw error;
}

async function syncBusinessPresetsOnLogin() {
  if (!state.supabase || !state.user) return;

  try {
    const remoteBusinessTypes = await loadRemoteBusinessPresets();
    const localBusinessTypes = normalizeBusinessPresetList(state.customBusinessTypes);
    const merged = normalizeBusinessPresetList([...remoteBusinessTypes, ...localBusinessTypes]);
    persistLocalBusinessPresets(merged);

    const remoteSet = new Set(remoteBusinessTypes);
    const missingRemote = merged.filter((value) => !remoteSet.has(value));
    if (missingRemote.length) {
      await upsertRemoteBusinessPresets(missingRemote);
    }
  } catch (_error) {
    state.customBusinessTypes = loadLocalBusinessPresets();
  }
}

async function loadRemoteBusinessTemplates() {
  if (!state.supabase || !state.user) return {};

  const { data, error } = await state.supabase
    .from(BUSINESS_TEMPLATE_TABLE)
    .select(
      "project_name,business_type,production_stage,source,fee_mode,fee_rate,usage_type,usage_rate,currency,fx_rate_snapshot,priority,amount,received_amount,payment_status,work_hours,status,exception_type,notes,updated_at",
    )
    .eq("user_id", state.user.id);
  if (error) throw error;

  return normalizeBusinessTemplateMap(
    Object.fromEntries(
      (data || [])
        .map((item) => businessTemplateRowToRecord(item))
        .filter(Boolean)
        .map((item) => [item.businessType, item]),
    ),
  );
}

async function upsertRemoteBusinessTemplates(templates) {
  assertCloudUser();
  const normalizedTemplates = normalizeBusinessTemplateMap(templates);
  const records = Object.values(normalizedTemplates);
  if (!records.length) return normalizedTemplates;

  const payload = records.map((template) => businessTemplateToRow(template, state.user.id));
  const { data, error } = await state.supabase
    .from(BUSINESS_TEMPLATE_TABLE)
    .upsert(payload, { onConflict: "user_id,business_type" })
    .select(
      "project_name,business_type,production_stage,source,fee_mode,fee_rate,usage_type,usage_rate,currency,fx_rate_snapshot,priority,amount,received_amount,payment_status,work_hours,status,exception_type,notes,updated_at",
    );
  if (error) throw error;

  return normalizeBusinessTemplateMap(
    Object.fromEntries(
      (data || [])
        .map((item) => businessTemplateRowToRecord(item))
        .filter(Boolean)
        .map((item) => [item.businessType, item]),
    ),
  );
}

async function deleteRemoteBusinessTemplate(value) {
  assertCloudUser();
  const normalized = normalizeBusinessTypeValue(value);
  if (!normalized) return;
  const { error } = await state.supabase
    .from(BUSINESS_TEMPLATE_TABLE)
    .delete()
    .eq("user_id", state.user.id)
    .eq("business_type", normalized);
  if (error) throw error;
}

async function syncBusinessTemplatesOnLogin() {
  if (!state.supabase || !state.user) return;

  try {
    const localTemplates = normalizeBusinessTemplateMap(state.businessTemplates);
    const remoteTemplates = await loadRemoteBusinessTemplates();
    const mergedTemplates = {};
    const businessTypes = new Set([...Object.keys(localTemplates), ...Object.keys(remoteTemplates)]);

    businessTypes.forEach((businessType) => {
      const localTemplate = localTemplates[businessType];
      const remoteTemplate = remoteTemplates[businessType];
      if (!localTemplate) {
        mergedTemplates[businessType] = remoteTemplate;
        return;
      }
      if (!remoteTemplate) {
        mergedTemplates[businessType] = localTemplate;
        return;
      }
      mergedTemplates[businessType] =
        getSettingsTimestamp(remoteTemplate.updatedAt) >= getSettingsTimestamp(localTemplate.updatedAt)
          ? remoteTemplate
          : localTemplate;
    });

    persistLocalBusinessTemplates(mergedTemplates);

    const templatePresetTypes = Object.keys(mergedTemplates).filter(
      (item) => item && !BUILT_IN_BUSINESS_TYPES.includes(item),
    );
    if (templatePresetTypes.length) {
      const mergedBusinessTypes = normalizeBusinessPresetList([...state.customBusinessTypes, ...templatePresetTypes]);
      persistLocalBusinessPresets(mergedBusinessTypes);
    }

    const templatesToPush = Object.values(mergedTemplates).filter((template) => {
      const remoteTemplate = remoteTemplates[template.businessType];
      return !remoteTemplate || getSettingsTimestamp(template.updatedAt) > getSettingsTimestamp(remoteTemplate.updatedAt);
    });

    if (templatesToPush.length) {
      const persistedRemote = await upsertRemoteBusinessTemplates(templatesToPush);
      persistLocalBusinessTemplates({
        ...state.businessTemplates,
        ...persistedRemote,
      });
    }
  } catch (_error) {
    state.businessTemplates = loadLocalBusinessTemplates();
  }
}

async function loadRemoteClientInsightSettings() {
  if (!state.supabase || !state.user) return null;

  const { data, error } = await state.supabase
    .from(USER_PREFERENCES_TABLE)
    .select("vip_threshold,updated_at")
    .eq("user_id", state.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return normalizeClientInsightSettings({
    vipThreshold: data.vip_threshold,
    updatedAt: data.updated_at,
  });
}

async function upsertRemoteClientInsightSettings(settings) {
  assertCloudUser();
  const normalized = normalizeClientInsightSettings(settings);
  const payload = {
    user_id: state.user.id,
    vip_threshold: normalized.vipThreshold,
  };
  const { data, error } = await state.supabase
    .from(USER_PREFERENCES_TABLE)
    .upsert(payload, { onConflict: "user_id" })
    .select("vip_threshold,updated_at")
    .single();
  if (error) throw error;

  return normalizeClientInsightSettings({
    vipThreshold: data.vip_threshold,
    updatedAt: data.updated_at,
  });
}

async function syncClientInsightSettingsOnLogin() {
  if (!state.supabase || !state.user) return;

  try {
    const localSettings = normalizeClientInsightSettings(state.clientInsightSettings);
    const remoteSettings = await loadRemoteClientInsightSettings();
    let mergedSettings = localSettings;
    let shouldPushRemote = false;

    if (remoteSettings) {
      if (getSettingsTimestamp(remoteSettings.updatedAt) >= getSettingsTimestamp(localSettings.updatedAt)) {
        mergedSettings = remoteSettings;
      } else {
        mergedSettings = localSettings;
        shouldPushRemote = true;
      }
    } else {
      mergedSettings = localSettings;
      shouldPushRemote = true;
    }

    persistLocalClientInsightSettings(mergedSettings);

    if (shouldPushRemote) {
      const persistedRemote = await upsertRemoteClientInsightSettings(mergedSettings);
      persistLocalClientInsightSettings(persistedRemote);
    }
  } catch (_error) {
    state.clientInsightSettings = loadLocalClientInsightSettings();
  }
}

async function loadRemoteCalendarDayMarks() {
  if (!state.supabase || !state.user) return null;

  const { data, error } = await state.supabase
    .from(USER_PREFERENCES_TABLE)
    .select("calendar_day_marks,calendar_day_marks_updated_at")
    .eq("user_id", state.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return normalizeCalendarDayMarks({
    marks: data.calendar_day_marks,
    updatedAt: data.calendar_day_marks_updated_at,
  });
}

async function upsertRemoteCalendarDayMarks(settings) {
  assertCloudUser();
  const normalized = normalizeCalendarDayMarks(settings);
  const nextUpdatedAt = normalized.updatedAt || new Date().toISOString();
  const payload = {
    user_id: state.user.id,
    calendar_day_marks: normalized.marks,
    calendar_day_marks_updated_at: nextUpdatedAt,
  };
  const { data, error } = await state.supabase
    .from(USER_PREFERENCES_TABLE)
    .upsert(payload, { onConflict: "user_id" })
    .select("calendar_day_marks,calendar_day_marks_updated_at")
    .single();
  if (error) throw error;

  return normalizeCalendarDayMarks({
    marks: data.calendar_day_marks,
    updatedAt: data.calendar_day_marks_updated_at || nextUpdatedAt,
  });
}

async function syncCalendarDayMarksOnLogin() {
  if (!state.supabase || !state.user) return;

  try {
    const localSettings = normalizeCalendarDayMarks(state.calendarDayMarks);
    const remoteSettings = await loadRemoteCalendarDayMarks();
    let mergedSettings = localSettings;
    let shouldPushRemote = false;

    if (remoteSettings) {
      if (getSettingsTimestamp(remoteSettings.updatedAt) >= getSettingsTimestamp(localSettings.updatedAt)) {
        mergedSettings = remoteSettings;
      } else {
        mergedSettings = localSettings;
        shouldPushRemote = true;
      }
    } else {
      mergedSettings = localSettings;
      shouldPushRemote = true;
    }

    persistLocalCalendarDayMarks(mergedSettings);

    if (shouldPushRemote) {
      const persistedRemote = await upsertRemoteCalendarDayMarks(mergedSettings);
      persistLocalCalendarDayMarks(persistedRemote);
    }
  } catch (_error) {
    state.calendarDayMarks = loadLocalCalendarDayMarks();
  }
}

async function persistCalendarDayMark(dateKey, nextType) {
  const safeDate = normalizeDateKey(dateKey);
  if (!safeDate) return;
  if (!canEditOrdersNow()) {
    updateAuthUi("登录后才能保存日期标记。");
    return;
  }
  const normalizedType = normalizeCalendarDayMarkType(nextType);
  const currentType = getCalendarDayMarkType(safeDate);
  if (currentType === normalizedType) return;

  const nextMarks = { ...normalizeCalendarDayMarks(state.calendarDayMarks).marks };
  if (normalizedType) {
    nextMarks[safeDate] = normalizedType;
  } else {
    delete nextMarks[safeDate];
  }

  const nextSettings = normalizeCalendarDayMarks({
    marks: nextMarks,
    updatedAt: new Date().toISOString(),
  });
  persistLocalCalendarDayMarks(nextSettings);
  render();

  const label = normalizedType === CALENDAR_DAY_MARK_REST
    ? "休息日"
    : normalizedType === CALENDAR_DAY_MARK_WORK
      ? "工作日"
      : "";
  updateAuthUi(label ? `已把 ${safeDate} 标记为${label}。` : `已清除 ${safeDate} 的日期标记。`);

  if (state.mode !== "cloud" || !state.user) {
    return;
  }

  state.calendarDayMarksBusy = true;
  try {
    const persistedRemote = await upsertRemoteCalendarDayMarks(nextSettings);
    persistLocalCalendarDayMarks(persistedRemote);
  } catch (error) {
    updateAuthUi(`日期标记已保存在本地，但云端同步失败：${mapAuthError(error)}`);
  } finally {
    state.calendarDayMarksBusy = false;
    render();
  }
}

async function loadRemoteFxSettings() {
  if (!state.supabase || !state.user) return null;

  const { data, error } = await state.supabase
    .from(USER_PREFERENCES_TABLE)
    .select("fx_enabled,usd_cny_rate,jpy_cny_rate,twd_cny_rate,hkd_cny_rate,fx_settings_updated_at")
    .eq("user_id", state.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return normalizeFxSettings({
    enabled: data.fx_enabled,
    usdCnyRate: data.usd_cny_rate,
    jpyCnyRate: data.jpy_cny_rate,
    twdCnyRate: data.twd_cny_rate,
    hkdCnyRate: data.hkd_cny_rate,
    updatedAt: data.fx_settings_updated_at,
  });
}

async function upsertRemoteFxSettings(settings) {
  assertCloudUser();
  const normalized = normalizeFxSettings(settings);
  const nextUpdatedAt = normalized.updatedAt || new Date().toISOString();
  const payload = {
    user_id: state.user.id,
    fx_enabled: normalized.enabled,
    usd_cny_rate: normalized.usdCnyRate,
    jpy_cny_rate: normalized.jpyCnyRate,
    twd_cny_rate: normalized.twdCnyRate,
    hkd_cny_rate: normalized.hkdCnyRate,
    fx_settings_updated_at: nextUpdatedAt,
  };
  const { data, error } = await state.supabase
    .from(USER_PREFERENCES_TABLE)
    .upsert(payload, { onConflict: "user_id" })
    .select("fx_enabled,usd_cny_rate,jpy_cny_rate,twd_cny_rate,hkd_cny_rate,fx_settings_updated_at")
    .single();
  if (error) throw error;

  return normalizeFxSettings({
    enabled: data.fx_enabled,
    usdCnyRate: data.usd_cny_rate,
    jpyCnyRate: data.jpy_cny_rate,
    twdCnyRate: data.twd_cny_rate,
    hkdCnyRate: data.hkd_cny_rate,
    updatedAt: data.fx_settings_updated_at || nextUpdatedAt,
  });
}

async function syncFxSettingsOnLogin() {
  if (!state.supabase || !state.user) return;

  try {
    const localSettings = normalizeFxSettings(state.fxSettings);
    const remoteSettings = await loadRemoteFxSettings();
    let mergedSettings = localSettings;
    let shouldPushRemote = false;

    if (remoteSettings) {
      if (getSettingsTimestamp(remoteSettings.updatedAt) >= getSettingsTimestamp(localSettings.updatedAt)) {
        mergedSettings = remoteSettings;
      } else {
        mergedSettings = localSettings;
        shouldPushRemote = true;
      }
    } else {
      mergedSettings = localSettings;
      shouldPushRemote = true;
    }

    persistLocalFxSettings(mergedSettings);

    if (shouldPushRemote) {
      const persistedRemote = await upsertRemoteFxSettings(mergedSettings);
      persistLocalFxSettings(persistedRemote);
    }
  } catch (_error) {
    state.fxSettings = loadLocalFxSettings();
  }
}

function renderFxSettingsSummary() {
  if (!elements.fxSettingsSummary) return;
  const settings = normalizeFxSettings(state.fxSettings);
  elements.fxSettingsSummary.textContent = settings.enabled
    ? `已开启固定汇率：USD/CNY ${formatFxRate(settings.usdCnyRate)}，JPY/CNY ${formatFxRate(settings.jpyCnyRate)}，TWD/CNY ${formatFxRate(settings.twdCnyRate)}，HKD/CNY ${formatFxRate(settings.hkdCnyRate)}。`
    : "关闭时按人民币录入与统计。";
}

async function persistFxSettingsFromInput() {
  if (
    !elements.fxEnabledInput ||
    !elements.usdCnyRateInput ||
    !elements.jpyCnyRateInput ||
    !elements.twdCnyRateInput ||
    !elements.hkdCnyRateInput
  ) {
    return;
  }

  const nextUsdRate = parseFxRateInput(elements.usdCnyRateInput.value);
  const nextJpyRate = parseFxRateInput(elements.jpyCnyRateInput.value);
  const nextTwdRate = parseFxRateInput(elements.twdCnyRateInput.value);
  const nextHkdRate = parseFxRateInput(elements.hkdCnyRateInput.value);
  if (nextUsdRate == null || nextJpyRate == null || nextTwdRate == null || nextHkdRate == null) {
    const restored = normalizeFxSettings(state.fxSettings);
    elements.usdCnyRateInput.value = formatFxRate(restored.usdCnyRate);
    elements.jpyCnyRateInput.value = formatFxRate(restored.jpyCnyRate);
    elements.twdCnyRateInput.value = formatFxRate(restored.twdCnyRate);
    elements.hkdCnyRateInput.value = formatFxRate(restored.hkdCnyRate);
    renderFxSettingsSummary();
    return;
  }

  const persistedSettings = loadLocalFxSettings();
  const candidate = normalizeFxSettings({
    ...state.fxSettings,
    enabled: Boolean(elements.fxEnabledInput.checked),
    usdCnyRate: nextUsdRate,
    jpyCnyRate: nextJpyRate,
    twdCnyRate: nextTwdRate,
    hkdCnyRate: nextHkdRate,
  });
  state.fxSettings = candidate;
  syncCurrencyUi();
  renderFxSettingsSummary();

  const unchanged =
    candidate.enabled === persistedSettings.enabled &&
    candidate.usdCnyRate === persistedSettings.usdCnyRate &&
    candidate.jpyCnyRate === persistedSettings.jpyCnyRate &&
    candidate.twdCnyRate === persistedSettings.twdCnyRate &&
    candidate.hkdCnyRate === persistedSettings.hkdCnyRate;
  if (unchanged) {
    render();
    return;
  }

  const nextSettings = normalizeFxSettings({
    ...candidate,
    updatedAt: new Date().toISOString(),
  });
  persistLocalFxSettings(nextSettings);
  render();

  if (state.mode !== "cloud" || !state.user) {
    return;
  }

  state.fxSettingsBusy = true;
  renderSyncPanel();
  try {
    const persistedRemote = await upsertRemoteFxSettings(nextSettings);
    persistLocalFxSettings(persistedRemote);
  } catch (error) {
    updateAuthUi(`汇率设置已保存在本地，但云端同步失败：${mapAuthError(error)}`);
  } finally {
    state.fxSettingsBusy = false;
    render();
  }
}

async function persistClientInsightSettingsFromInput() {
  if (!elements.vipThresholdInput) return;

  const nextThreshold = parseVipThresholdInput(elements.vipThresholdInput.value);
  if (nextThreshold == null) {
    elements.vipThresholdInput.value = String(state.clientInsightSettings.vipThreshold);
    renderClientInsights(state.orders);
    return;
  }

  const persistedSettings = loadLocalClientInsightSettings();
  state.clientInsightSettings = normalizeClientInsightSettings({
    ...state.clientInsightSettings,
    vipThreshold: nextThreshold,
  });
  elements.vipThresholdInput.value = String(nextThreshold);
  if (nextThreshold === persistedSettings.vipThreshold) {
    renderClientInsights(state.orders);
    return;
  }

  const nextSettings = normalizeClientInsightSettings({
    ...state.clientInsightSettings,
    vipThreshold: nextThreshold,
    updatedAt: new Date().toISOString(),
  });
  persistLocalClientInsightSettings(nextSettings);
  renderClientInsights(state.orders);

  if (state.mode !== "cloud" || !state.user) {
    return;
  }

  state.clientInsightBusy = true;
  renderSyncPanel();
  try {
    const persistedRemote = await upsertRemoteClientInsightSettings(nextSettings);
    persistLocalClientInsightSettings(persistedRemote);
  } catch (error) {
    updateAuthUi(`重点客户阈值已保存在本地，但云端同步失败：${mapAuthError(error)}`);
  } finally {
    state.clientInsightBusy = false;
    render();
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  await saveOrderFromCurrentForm();
}

function buildOrderFromCurrentForm() {
  const dueDate = elements.dueDate.value;
  const previousOrder = state.editingId
    ? state.orders.find((item) => item.id === state.editingId) || null
    : null;

  const nextStage = elements.productionStage.value;
  const prevTimeline = previousOrder?.stageTimeline || {};
  const updatedTimeline = recordStageTimestamp(prevTimeline, previousOrder?.productionStage || "", nextStage);

  let order = normalizeOrder({
    id: state.editingId,
    projectName: elements.projectName.value.trim(),
    clientName: elements.clientName.value.trim(),
    businessType: elements.businessType.value,
    productionStage: nextStage,
    source: elements.source.value,
    feeMode: elements.feeMode.value,
    feeRate: parseFeeRateInput(elements.feeRate.value),
    usageType: elements.usageType.value,
    usageRate: parseUsageRateInput(elements.usageRate.value),
    currency: elements.currency.value,
    fxRateSnapshot: previousOrder?.fxRateSnapshot,
    priority: elements.priority.value,
    amount: Number(elements.amount.value),
    receivedAmount: Number(elements.receivedAmount.value),
    paymentStatus: elements.paymentStatus.value,
    startDate: elements.startDate.value,
    dueDate,
    completedDate: elements.completedDate.value,
    calendarColor: getCalendarColorInputValue(),
    workHours: elements.workHours.value,
    status: elements.status.value,
    exceptionType: elements.exceptionType.value,
    exceptionResolution: previousOrder?.exceptionResolution,
    exceptionNote: previousOrder?.exceptionNote,
    refundAmount: previousOrder?.refundAmount,
    exceptionPreviousStatus: previousOrder?.exceptionPreviousStatus,
    notes: elements.notes.value.trim(),
    stageTimeline: updatedTimeline,
  });
  return applyOrderFxSnapshot(order);
}

function getOrderSubmitValidationMessage(order) {
  if (!order.projectName || !order.clientName || !order.dueDate) {
    return "项目名、客户和截稿日期不能为空。";
  }
  if (!order.businessType) {
    return "业务分类不能为空。";
  }
  if (order.startDate && order.startDate > order.dueDate) {
    return "动工日期不能晚于截稿日期。";
  }
  if (isAbnormal(order) && DISALLOWED_ABNORMAL_STATUSES.has(order.status)) {
    return "异常单请先完成异常处理，不能直接设为已完成或已付款。";
  }
  return "";
}

async function saveOrderFromCurrentForm({ closeDraftPopover = false } = {}) {
  const order = buildOrderFromCurrentForm();
  const validationMessage = getOrderSubmitValidationMessage(order);
  if (validationMessage) {
    updateAuthUi(validationMessage);
    if (closeDraftPopover) {
      if (!order.projectName) {
        elements.timelineDraftProjectInput?.focus?.();
      } else if (!order.clientName) {
        elements.timelineDraftClientInput?.focus?.();
      } else if (!order.businessType) {
        elements.timelineDraftBusinessInput?.focus?.();
      }
    }
    return false;
  }

  setBusy(true);
  try {
    let presetSyncError = null;
    if (state.mode === "cloud") {
      await saveRemoteOrder(order);
    } else {
      saveLocalOrder(order);
    }
    try {
      const presetSyncResult = await ensureBusinessPresetExists(order.businessType);
      presetSyncError = presetSyncResult?.remoteError || null;
    } catch (error) {
      presetSyncError = error;
    }
    saveLastTemplate(order);
    if (closeDraftPopover) {
      closePendingTimelineDraftPopover();
    }
    resetForm();
    const successMessage = state.mode === "cloud" ? "云端数据已保存。" : "本地数据已保存。";
    updateAuthUi(
      presetSyncError
        ? `${successMessage} 但常用业务同步失败：${mapAuthError(presetSyncError)}`
        : successMessage,
    );
    return true;
  } catch (error) {
    updateAuthUi(mapAuthError(error));
    return false;
  } finally {
    setBusy(false);
    render();
  }
}

function saveLocalOrder(order) {
  if (state.editingId) {
    state.orders = state.orders.map((item) => (item.id === state.editingId ? order : item));
  } else {
    state.orders = [order, ...state.orders];
  }
  persistLocalOrders(state.orders);
}

async function saveRemoteOrder(order) {
  assertCloudUser();

  if (state.usingLocalBackup) {
    const nextOrders = state.editingId
      ? state.orders.map((item) => (item.id === state.editingId ? order : item))
      : [order, ...state.orders];
    state.orders = nextOrders;
    await replaceRemoteOrders(nextOrders);
    state.usingLocalBackup = false;
    return;
  }

  await upsertRemoteOrders([order]);
}

async function replaceAllOrders(inputOrders) {
  if (state.mode === "cloud" && !state.user) {
    updateAuthUi("云端模式下需要先登录，才能覆盖数据。");
    return;
  }

  const confirmed = window.confirm("这会用新的数据覆盖当前列表，确认继续吗？");
  if (!confirmed) return;

  const normalized = inputOrders.map((item) => normalizeOrder(item));

  setBusy(true);
  try {
    if (state.mode === "cloud") {
      await replaceRemoteOrders(normalized);
      updateAuthUi("云端数据已覆盖。");
    } else {
      state.orders = normalized;
      persistLocalOrders(state.orders);
      updateAuthUi("本地数据已覆盖。");
    }
    clearSelection(false);
    resetForm();
    render();
  } catch (error) {
    updateAuthUi(mapAuthError(error));
    render();
  } finally {
    setBusy(false);
  }
}

async function replaceRemoteOrders(orders) {
  assertCloudUser();

  const { data: oldRows, error: fetchError } = await state.supabase
    .from(TABLE_NAME)
    .select("id")
    .eq("user_id", state.user.id);
  if (fetchError) throw fetchError;

  const oldIds = new Set((oldRows || []).map((row) => row.id));
  const nextIds = new Set(orders.map((order) => order.id));
  const staleIds = [...oldIds].filter((id) => !nextIds.has(id));

  if (orders.length) {
    await upsertRemoteOrders(orders, { refresh: false });
  }

  if (staleIds.length) {
    const { error: deleteError } = await state.supabase
      .from(TABLE_NAME)
      .delete()
      .in("id", staleIds)
      .eq("user_id", state.user.id);
    if (deleteError) throw deleteError;
  }

  await loadRemoteOrders();
}

function resetForm() {
  state.editingId = null;
  clearPendingTimelineDraft();
  elements.form.reset();
  elements.formTitle.textContent = "新建稿件";
  elements.hiddenId.value = "";
  elements.businessType.value = BUILT_IN_BUSINESS_TYPES[0];
  elements.source.value = SOURCES[0];
  elements.feeMode.value = getSuggestedFeeMode(elements.source.value);
  elements.feeRate.value = formatFeeRatePercent(
    getDefaultFeeRate(elements.source.value, elements.feeMode.value),
  );
  elements.usageType.value = USAGE_TYPES[0];
  elements.usageRate.value = "0";
  elements.currency.value = "CNY";
  elements.priority.value = PRIORITIES[0];
  elements.receivedAmount.value = "0";
  elements.paymentStatus.value = PAYMENT_STATUSES[0];
  elements.status.value = STATUSES[0];
  elements.productionStage.value = "";
  elements.exceptionType.value = EXCEPTION_TYPES[0];
  elements.startDate.value = "";
  elements.dueDate.value = "";
  setCalendarColorInputMode(false);
  syncCalendarColorInputWithSource();
  updateFeeModeUi();
  syncCurrencyUi();
  syncUsageRateUi();
  renderWorkHoursPreview();
  renderBusinessShortcutList();
}

function setCalendarColorInputMode(custom = false) {
  if (!elements.calendarColor) return;
  elements.calendarColor.dataset.custom = custom ? "true" : "false";
  elements.calendarColor.classList.toggle("is-using-default", !custom);
}

function syncCalendarColorInputWithSource() {
  if (!elements.calendarColor) return;
  const isCustom = elements.calendarColor.dataset.custom === "true";
  if (isCustom) return;
  elements.calendarColor.value = getSourceColor(elements.source?.value);
}

function syncCalendarColorInputWithOrder(order) {
  if (!elements.calendarColor) return;
  const customColor = normalizeCalendarColor(order?.calendarColor);
  if (customColor) {
    setCalendarColorInputMode(true);
    elements.calendarColor.value = customColor;
    return;
  }
  setCalendarColorInputMode(false);
  elements.calendarColor.value = getSourceColor(order?.source || elements.source?.value);
}

function getCalendarColorInputValue() {
  if (!elements.calendarColor) return "";
  return elements.calendarColor.dataset.custom === "true" ? normalizeCalendarColor(elements.calendarColor.value) : "";
}

function getPendingTimelineDraftInitialColor() {
  return getCalendarColorInputValue() || getSourceColor(elements.source?.value);
}

function getPendingTimelineDraftColor() {
  if (state.pendingTimelineDraftColor === "") {
    return getPendingTimelineDraftInitialColor();
  }
  return normalizeCalendarColor(state.pendingTimelineDraftColor) || getPendingTimelineDraftInitialColor();
}

function updatePendingTimelineDraftColor(color, { syncForm = true } = {}) {
  const nextColor = normalizeHexColor(color, getPendingTimelineDraftInitialColor());
  state.pendingTimelineDraftColor = nextColor;
  if (syncForm && elements.calendarColor) {
    setCalendarColorInputMode(true);
    elements.calendarColor.value = nextColor;
  }
  if (state.pendingTimelineDraft) {
    refreshPendingTimelineDraft();
    render();
  }
}

function getPanelGroup(panelId) {
  const safeId = String(panelId || "");
  if (DEFAULT_COMMON_SECTION_ORDER.includes(safeId)) return "common";
  if (DEFAULT_SCHEDULE_SECTION_ORDER.includes(safeId)) return "schedule";
  if (DEFAULT_INSIGHTS_SECTION_ORDER.includes(safeId)) return "insights";
  return "";
}

function getPanelOrder(group) {
  if (group === "common") return normalizeSectionOrder(state.commonSectionOrder, DEFAULT_COMMON_SECTION_ORDER);
  if (group === "schedule") return normalizeSectionOrder(state.scheduleSectionOrder, DEFAULT_SCHEDULE_SECTION_ORDER);
  if (group === "insights") return normalizeSectionOrder(state.insightsSectionOrder, DEFAULT_INSIGHTS_SECTION_ORDER);
  return [];
}

function setPanelOrder(group, order) {
  const normalized =
    group === "common"
      ? normalizeSectionOrder(order, DEFAULT_COMMON_SECTION_ORDER)
      : group === "schedule"
        ? normalizeSectionOrder(order, DEFAULT_SCHEDULE_SECTION_ORDER)
        : group === "insights"
          ? normalizeSectionOrder(order, DEFAULT_INSIGHTS_SECTION_ORDER)
          : [];
  if (!normalized.length) return;
  if (group === "common") state.commonSectionOrder = normalized;
  if (group === "schedule") state.scheduleSectionOrder = normalized;
  if (group === "insights") state.insightsSectionOrder = normalized;
}

function movePanel(panelId, direction) {
  const safeId = String(panelId || "");
  const normalizedDirection = direction === "up" ? "up" : direction === "down" ? "down" : "";
  const group = getPanelGroup(safeId);
  if (!group || !normalizedDirection) return;
  const nextOrder = getPanelOrder(group);
  const currentIndex = nextOrder.indexOf(safeId);
  if (currentIndex < 0) return;
  const targetIndex = normalizedDirection === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= nextOrder.length) return;
  [nextOrder[currentIndex], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[currentIndex]];
  setPanelOrder(group, nextOrder);
  persistLayoutPrefs();
  render();
  setActiveSectionByViewport();
}

function togglePanelCollapsed(panelId) {
  const safeId = String(panelId || "");
  if (!LAYOUT_PANEL_IDS.includes(safeId)) return;
  state.collapsedPanels = normalizeCollapsedPanels({
    ...state.collapsedPanels,
    [safeId]: !state.collapsedPanels?.[safeId],
  });
  persistLayoutPrefs();
  render();
}

function applyPanelLayout() {
  const commonOrder = getPanelOrder("common");
  const scheduleOrder = getPanelOrder("schedule");
  const insightsOrder = getPanelOrder("insights");
  const commonOrderMap = new Map(commonOrder.map((id, index) => [id, index + 1]));
  const orderOffset = commonOrder.length;
  const scheduleOrderMap = new Map(scheduleOrder.map((id, index) => [id, orderOffset + index + 1]));
  const insightsOrderMap = new Map(insightsOrder.map((id, index) => [id, orderOffset + index + 1]));

  DEFAULT_COMMON_SECTION_ORDER.forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.style.order = String(commonOrderMap.get(id) || DEFAULT_COMMON_SECTION_ORDER.indexOf(id) + 1);
  });

  if (elements.contentSlot) {
    const slotOrder =
      state.viewMode === VIEW_MODE_SCHEDULE
        ? scheduleOrderMap.get("form") || 1
        : insightsOrderMap.get("analysis") || DEFAULT_INSIGHTS_SECTION_ORDER.indexOf("analysis") + 1;
    elements.contentSlot.style.order = String(slotOrder);
  }

  DEFAULT_SCHEDULE_SECTION_ORDER.filter((id) => id !== "form").forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.style.order = String(scheduleOrderMap.get(id) || DEFAULT_SCHEDULE_SECTION_ORDER.indexOf(id) + 1);
  });

  DEFAULT_INSIGHTS_SECTION_ORDER.filter((id) => id !== "analysis").forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.style.order = String(insightsOrderMap.get(id) || DEFAULT_INSIGHTS_SECTION_ORDER.indexOf(id) + 1);
  });

  LAYOUT_PANEL_IDS.forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.classList.toggle("panel-collapsed", Boolean(state.collapsedPanels?.[id]));
  });
}

function renderPanelControls() {
  document.querySelectorAll("[data-panel-move]").forEach((button) => {
    const panelId = String(button.dataset.panelId || "");
    const order = getPanelOrder(getPanelGroup(panelId));
    const panelIndex = order.indexOf(panelId);
    const direction = String(button.dataset.panelMove || "");
    button.disabled =
      panelIndex < 0 ||
      state.busy ||
      (direction === "up" && panelIndex === 0) ||
      (direction === "down" && panelIndex === order.length - 1);
  });
  document.querySelectorAll("[data-panel-collapse]").forEach((button) => {
    const panelId = String(button.dataset.panelId || "");
    const isCollapsed = Boolean(state.collapsedPanels?.[panelId]);
    button.textContent = isCollapsed ? "展开" : "折叠";
    button.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
    button.disabled = state.busy;
  });
}

function setViewMode(mode) {
  const nextMode = normalizeViewMode(mode, VIEW_MODE_SCHEDULE);
  if (nextMode === state.viewMode) return;
  if (nextMode !== VIEW_MODE_SCHEDULE) {
    cancelCalendarCreateMode({ silent: true });
  }
  state.viewMode = nextMode;
  state.quickNavOpen = false;
  state.quickNavPinnedSectionId = "";
  state.quickNavPinnedUntil = 0;
  state.activeSectionId = getQuickNavSectionsByView(nextMode)[0]?.id || "sync";
  persistLayoutPrefs();
  render();
  setActiveSectionByViewport();
}

function setCalendarDisplayMode(mode) {
  const nextMode = normalizeCalendarDisplayMode(mode, CALENDAR_DISPLAY_TAGS);
  if (nextMode === state.calendarDisplayMode) return;
  state.calendarDisplayMode = nextMode;
  persistLayoutPrefs();
  render();
}

function toggleScheduleLayoutEditMode() {
  state.scheduleLayoutEditMode = !state.scheduleLayoutEditMode;
  persistLayoutPrefs();
  applyViewVisibility();
}

function getInitialActiveSectionId(layoutPrefs = initialLayoutPrefs) {
  const mode = normalizeViewMode(layoutPrefs?.viewMode, VIEW_MODE_SCHEDULE);
  const commonIds = normalizeSectionOrder(layoutPrefs?.commonSectionOrder, DEFAULT_COMMON_SECTION_ORDER);
  const modeIds =
    mode === VIEW_MODE_SCHEDULE
      ? normalizeSectionOrder(layoutPrefs?.scheduleSectionOrder, DEFAULT_SCHEDULE_SECTION_ORDER)
      : normalizeSectionOrder(layoutPrefs?.insightsSectionOrder, DEFAULT_INSIGHTS_SECTION_ORDER);
  const ids = [...commonIds, ...modeIds];
  return ids.find((id) => QUICK_NAV_SECTION_META[id]) || "sync";
}

function applyViewVisibility() {
  const mode = normalizeViewMode(state.viewMode, VIEW_MODE_SCHEDULE);
  const visibleGroups = new Set(["common", mode]);
  document.querySelectorAll("[data-view-group]").forEach((node) => {
    node.hidden = !visibleGroups.has(node.dataset.viewGroup);
  });

  if (elements.dashboard) {
    elements.dashboard.dataset.viewMode = mode;
    elements.dashboard.dataset.layoutEditing = state.scheduleLayoutEditMode ? "true" : "false";
  }
  if (elements.viewModeSchedule) {
    const active = mode === VIEW_MODE_SCHEDULE;
    elements.viewModeSchedule.classList.toggle("is-active", active);
    elements.viewModeSchedule.setAttribute("aria-pressed", active ? "true" : "false");
  }
  if (elements.viewModeInsights) {
    const active = mode === VIEW_MODE_INSIGHTS;
    elements.viewModeInsights.classList.toggle("is-active", active);
    elements.viewModeInsights.setAttribute("aria-pressed", active ? "true" : "false");
  }
  if (elements.scheduleLayoutToggle) {
    elements.scheduleLayoutToggle.textContent = state.scheduleLayoutEditMode ? "完成布局" : "整理布局";
    elements.scheduleLayoutToggle.classList.toggle("is-active", state.scheduleLayoutEditMode);
    elements.scheduleLayoutToggle.setAttribute("aria-pressed", state.scheduleLayoutEditMode ? "true" : "false");
  }
  if (elements.clientsSection) {
    elements.clientsSection.classList.toggle("panel-collapsed", Boolean(state.collapsedPanels?.clients));
  }
  if (elements.clientsPanelBody) {
    elements.clientsPanelBody.classList.toggle("panel-body-collapsed", Boolean(state.collapsedPanels?.clients));
  }
  if (elements.toggleClientsPanel) {
    const collapsed = Boolean(state.collapsedPanels?.clients);
    elements.toggleClientsPanel.textContent = collapsed ? "展开客户统计" : "收起客户统计";
    elements.toggleClientsPanel.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }
  applyPanelLayout();
  renderPanelControls();
}

function render() {
  applyViewVisibility();
  closeCalendarContextMenu();
  renderProductionStageOptions();
  renderSourceOptions();
  const orders = filteredOrders();
  const incomeOrders = getIncomeScopedOrders(orders);
  const activeOrders = orders.filter((order) => !isClosed(order));
  const completedOrders = orders.filter(isClosed);
  const dueMonthIncomeScope = Boolean(state.filters.month);
  renderBusinessTypeOptions();
  renderListFilterOptions();
  const activeVisibleOrders = applyListPanelFilters(activeOrders, "active");
  const completedVisibleOrders = applyListPanelFilters(completedOrders, "completed");
  const activeIncomeOrders = getIncomeScopedOrders(activeVisibleOrders);
  const completedIncomeOrders = getIncomeScopedOrders(completedVisibleOrders);
  renderBusinessShortcutList();
  renderBusinessPresetDialog();
  syncSelectionToVisible(activeVisibleOrders);
  renderSyncPanel();
  renderStats(orders, incomeOrders);
  renderMotivationPanel(state.orders);
  renderClientInsights(state.orders);
  renderFxSettingsSummary();
  syncCurrencyUi();
  renderQuickNav();
  renderCalendarCreateControls();
  renderBreakdown(incomeOrders);
  renderCalendar(orders);
  renderPendingTimelineDraftPopover();
  renderBatchActions(activeVisibleOrders);
  renderTable(activeVisibleOrders, {
    body: elements.activeTableBody,
    summary: elements.activeTableSummary,
    emptyMessage:
      state.mode === "cloud" && !state.user
        ? "登录后就会显示你自己的云端稿件。"
        : "当前筛选下没有进行中的稿件。",
    selectable: true,
    showBatchSummary: true,
    summaryOrders: activeIncomeOrders,
    incomeScopedByDueMonth: dueMonthIncomeScope,
  });
  renderTable(completedVisibleOrders, {
    body: elements.completedTableBody,
    summary: elements.completedTableSummary,
    emptyMessage: "当前筛选下还没有已完成稿件。",
    selectable: false,
    showBatchSummary: false,
    summaryOrders: completedIncomeOrders,
    incomeScopedByDueMonth: dueMonthIncomeScope,
  });
  renderWorkHoursPreview();
}

function getQuickNavSectionsByView(mode = state.viewMode) {
  const normalizedMode = normalizeViewMode(mode, VIEW_MODE_SCHEDULE);
  const commonIds = normalizeSectionOrder(state.commonSectionOrder, DEFAULT_COMMON_SECTION_ORDER);
  const modeIds =
    normalizedMode === VIEW_MODE_SCHEDULE
      ? normalizeSectionOrder(state.scheduleSectionOrder, DEFAULT_SCHEDULE_SECTION_ORDER)
      : normalizeSectionOrder(state.insightsSectionOrder, DEFAULT_INSIGHTS_SECTION_ORDER);
  const ids = [...commonIds, ...modeIds];
  return ids.map((id) => QUICK_NAV_SECTION_META[id]).filter(Boolean);
}

function initQuickNav() {
  if (!elements.quickNav && !elements.quickNavMobile) return;
  if (!state.activeSectionId) {
    state.activeSectionId = getQuickNavSectionsByView(state.viewMode)[0]?.id || "sync";
  }
  bindQuickNavEvents();
  renderQuickNav();
  setActiveSectionByViewport();
}

function renderQuickNav() {
  if (!elements.quickNav && !elements.quickNavMobile) return;
  const sections = getQuickNavSectionsByView(state.viewMode);
  if (!sections.length) return;
  if (!sections.some((item) => item.id === state.activeSectionId)) {
    state.activeSectionId = sections[0].id;
  }
  const markup = sections.map((item) => {
    const isActive = item.id === state.activeSectionId;
    return `<button
      type="button"
      class="quick-nav-link${isActive ? " is-active" : ""}"
      data-quick-nav-target="${escapeHtml(item.id)}"
      ${isActive ? 'aria-current="true"' : ""}
    >${escapeHtml(item.label)}</button>`;
  }).join("");

  if (elements.quickNav) {
    elements.quickNav.classList.toggle("is-open", state.quickNavOpen);
    elements.quickNav.innerHTML = `
      <button
        type="button"
        class="quick-nav-toggle"
        data-quick-nav-toggle
        aria-expanded="${state.quickNavOpen ? "true" : "false"}"
        aria-label="${state.quickNavOpen ? "收起页面快速导航" : "展开页面快速导航"}"
      >导航</button>
      <div class="quick-nav-body" ${state.quickNavOpen ? "" : 'aria-hidden="true"'}>
        ${markup}
      </div>
    `;
  }
  if (elements.quickNavMobile) {
    elements.quickNavMobile.innerHTML = markup;
  }
}

function bindQuickNavEvents() {
  [elements.quickNav, elements.quickNavMobile].forEach((container) => {
    if (!container || container.dataset.boundQuickNav === "true") return;
    container.dataset.boundQuickNav = "true";
    container.addEventListener("click", (event) => {
      if (container === elements.quickNav) {
        event.stopPropagation();
      }
      const toggle = event.target.closest("[data-quick-nav-toggle]");
      if (toggle) {
        state.quickNavOpen = !state.quickNavOpen;
        renderQuickNav();
        return;
      }
      const button = event.target.closest("[data-quick-nav-target]");
      if (!button) return;
      scrollToSection(button.dataset.quickNavTarget);
    });
  });

  if (!quickNavGlobalHandlersBound) {
    quickNavGlobalHandlersBound = true;
    document.addEventListener("click", (event) => {
      if (!state.quickNavOpen || !elements.quickNav) return;
      if (elements.quickNav.contains(event.target)) return;
      state.quickNavOpen = false;
      renderQuickNav();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !state.quickNavOpen) return;
      state.quickNavOpen = false;
      renderQuickNav();
    });
  }
}

function pinQuickNavSection(sectionId, durationMs = QUICK_NAV_PIN_DURATION_MS) {
  const safeId = String(sectionId || "");
  if (!safeId) return;
  const duration = Math.max(0, Number(durationMs) || 0);
  state.quickNavPinnedSectionId = safeId;
  state.quickNavPinnedUntil = Date.now() + duration;
}

function getPinnedQuickNavSection() {
  if (!state.quickNavPinnedSectionId) return "";
  if (Date.now() <= state.quickNavPinnedUntil) {
    return state.quickNavPinnedSectionId;
  }
  state.quickNavPinnedSectionId = "";
  state.quickNavPinnedUntil = 0;
  return "";
}

function scrollToSection(id) {
  const target = document.getElementById(String(id || ""));
  if (!target) return;
  pinQuickNavSection(target.id);
  let shouldRender = false;
  if (state.activeSectionId !== target.id) {
    state.activeSectionId = target.id;
    shouldRender = true;
  }
  if (state.quickNavOpen) {
    state.quickNavOpen = false;
    shouldRender = true;
  }
  if (shouldRender) {
    renderQuickNav();
  }
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setActiveSectionByViewport() {
  const targets = getQuickNavSectionsByView(state.viewMode)
    .map((item) => document.getElementById(item.id))
    .filter((node) => node && !node.hidden);
  if (!targets.length) return;

  if (quickNavObserver) {
    quickNavObserver.disconnect();
    quickNavObserver = null;
  }
  if (quickNavFallbackHandler) {
    window.removeEventListener("scroll", quickNavFallbackHandler);
    window.removeEventListener("resize", quickNavFallbackHandler);
    quickNavFallbackHandler = null;
  }

  if ("IntersectionObserver" in window) {
    quickNavObserver = new IntersectionObserver(
      () => {
        const pinnedId = getPinnedQuickNavSection();
        if (pinnedId && targets.some((target) => target.id === pinnedId)) {
          if (pinnedId !== state.activeSectionId) {
            state.activeSectionId = pinnedId;
            renderQuickNav();
          }
          return;
        }
        const nextId = pickActiveSectionByPosition(targets);
        if (nextId && nextId !== state.activeSectionId) {
          state.activeSectionId = nextId;
          renderQuickNav();
        }
      },
      {
        threshold: [0.15, 0.35, 0.6, 0.85],
        rootMargin: "-12% 0px -62% 0px",
      },
    );
    targets.forEach((target) => quickNavObserver.observe(target));
    const initialId = pickActiveSectionByPosition(targets);
    if (initialId && initialId !== state.activeSectionId) {
      state.activeSectionId = initialId;
      renderQuickNav();
    }
    return;
  }

  quickNavFallbackHandler = () => {
    const pinnedId = getPinnedQuickNavSection();
    if (pinnedId && targets.some((target) => target.id === pinnedId)) {
      if (pinnedId !== state.activeSectionId) {
        state.activeSectionId = pinnedId;
        renderQuickNav();
      }
      return;
    }
    const nextId = pickActiveSectionByPosition(targets);
    if (nextId && nextId !== state.activeSectionId) {
      state.activeSectionId = nextId;
      renderQuickNav();
    }
  };
  window.addEventListener("scroll", quickNavFallbackHandler, { passive: true });
  window.addEventListener("resize", quickNavFallbackHandler);
  quickNavFallbackHandler();
}

function pickActiveSectionByPosition(targets) {
  const list = targets?.length
    ? targets
    : getQuickNavSectionsByView(state.viewMode)
        .map((item) => document.getElementById(item.id))
        .filter((node) => node && !node.hidden);
  if (!list.length) return getQuickNavSectionsByView(state.viewMode)[0]?.id || "sync";
  const pinnedId = getPinnedQuickNavSection();
  if (pinnedId && list.some((target) => target.id === pinnedId)) {
    return pinnedId;
  }

  const probeY = window.scrollY + Math.max(window.innerHeight * 0.32, 120);
  let candidate = list[0].id;
  list.forEach((target) => {
    if (target.offsetTop <= probeY) {
      candidate = target.id;
    }
  });
  return candidate;
}

function renderSyncPanel() {
  const canEditOrders = state.mode === "local" || Boolean(state.user);
  const hasActiveUser = Boolean(state.user);
  const authEmail = elements.authEmail.value.trim();
  const signupCooldown = getAuthCooldownRemaining("signup", authEmail);
  const resendCooldown = getAuthCooldownRemaining("resendSignup", authEmail);
  const forgotPasswordCooldown = getAuthCooldownRemaining("forgotPassword", authEmail);
  const showTurnstilePanel =
    state.mode === "cloud" &&
    !state.recoveryMode &&
    !hasActiveUser &&
    hasTurnstileConfig() &&
    state.turnstileRequested;

  if (state.mode === "cloud") {
    elements.syncModeLabel.textContent = state.user ? "云端同步已连接" : "云端同步待登录";
    elements.syncModeNote.textContent = state.user
      ? state.usingLocalBackup
        ? "云端账号已经登录，但当前云端还没有数据，正在显示这台设备里的旧记录。"
        : "当前账号的数据会实时读写 Supabase。"
      : hasTurnstileConfig()
        ? "配置已经就绪，登录后每个画师只会看到自己的数据。"
        : "云端配置已就绪，但还没配置 Cloudflare Turnstile；当前只能登录，不能注册、重发验证邮件或找回密码。";
    elements.syncUser.innerHTML = state.user
      ? `<span class="chip status done">${escapeHtml(state.user.email)}</span>`
      : '<span class="chip status waiting">未登录</span>';
  } else {
    elements.syncModeLabel.textContent = "本地模式";
    elements.syncModeNote.textContent =
      "还没有注入 Supabase 环境变量，所以当前数据只保存在浏览器。";
    elements.syncUser.innerHTML = '<span class="chip priority">localStorage</span>';
  }

  elements.recoveryPanel.classList.toggle("is-hidden", !state.recoveryMode);

  const authDisabled = state.mode !== "cloud" || state.busy;
  elements.authEmail.disabled = authDisabled || state.recoveryMode || hasActiveUser;
  elements.authPassword.disabled = authDisabled || state.recoveryMode || hasActiveUser;
  elements.signIn.disabled = authDisabled || state.recoveryMode || hasActiveUser;
  elements.signUp.disabled = authDisabled || state.recoveryMode || hasActiveUser || signupCooldown > 0;
  elements.resendSignup.disabled =
    authDisabled || state.recoveryMode || hasActiveUser || resendCooldown > 0;
  elements.forgotPassword.disabled =
    authDisabled || state.recoveryMode || hasActiveUser || forgotPasswordCooldown > 0;
  elements.signOut.disabled = state.mode !== "cloud" || !state.user || state.busy;
  elements.resetPassword.disabled = state.mode !== "cloud" || !state.recoveryMode || state.busy;
  elements.resetPasswordConfirm.disabled =
    state.mode !== "cloud" || !state.recoveryMode || state.busy;
  elements.updatePassword.disabled = state.mode !== "cloud" || !state.recoveryMode || state.busy;
  elements.signUp.textContent = getAuthActionLabel("signup", signupCooldown);
  elements.resendSignup.textContent = getAuthActionLabel("resendSignup", resendCooldown);
  elements.forgotPassword.textContent = getAuthActionLabel("forgotPassword", forgotPasswordCooldown);
  elements.turnstilePanel.classList.toggle("is-hidden", !showTurnstilePanel);
  elements.turnstileWidget.classList.toggle(
    "is-hidden",
    !showTurnstilePanel || !hasTurnstileConfig() || state.turnstileStatus === "error",
  );
  elements.turnstileNote.textContent = getTurnstileNote();
  elements.retryTurnstile?.classList.toggle(
    "is-hidden",
    state.turnstileStatus !== "error" && state.turnstileStatus !== "expired",
  );

  elements.form.querySelectorAll("input, select, textarea, button").forEach((field) => {
    field.disabled = !canEditOrders || state.busy;
  });
  elements.openBusinessPresetDialog.disabled = !canEditOrders || state.busy || state.businessPresetBusy;
  elements.saveBusinessTemplate.disabled = !canEditOrders || state.busy || state.businessPresetBusy;
  elements.businessShortcutList.querySelectorAll("button").forEach((button) => {
    button.disabled = !canEditOrders || state.busy || state.businessPresetBusy;
  });
  elements.importJson.disabled = !canEditOrders || state.busy;
  elements.batchMarkDone.disabled = !canEditOrders || state.busy;
  elements.batchMarkPaid.disabled = !canEditOrders || state.busy;
  elements.batchMarkHandled.disabled = !canEditOrders || state.busy;
  elements.applyBatchException.disabled = !canEditOrders || state.busy;
  elements.batchExceptionType.disabled = !canEditOrders || state.busy;
  elements.clearSelection.disabled = state.busy;
  elements.exceptionHandledNo.disabled = state.busy;
  elements.exceptionHandledYes.disabled = state.busy;
  elements.exceptionResolution.disabled = state.busy;
  elements.exceptionNote.disabled = state.busy;
  elements.saveExceptionHandling.disabled = state.busy;
  elements.cancelExceptionHandling.disabled = state.busy;
  elements.exceptionDialogClose.disabled = state.busy;
  elements.stageDialogClose.disabled = state.busy;
  elements.stageCustomInput.disabled = state.busy;
  elements.saveStage.disabled = state.busy;
  elements.clearStage.disabled = state.busy;
  elements.cancelStage.disabled = state.busy;
  elements.workHoursDialogClose.disabled = state.busy;
  elements.workHoursDialogInput.disabled = state.busy;
  elements.saveWorkHours.disabled = state.busy;
  elements.clearWorkHours.disabled = state.busy;
  elements.cancelWorkHours.disabled = state.busy;
  const presetControlsDisabled = !canEditOrders || state.busy || state.businessPresetBusy;
  elements.businessPresetDialogClose.disabled = presetControlsDisabled;
  elements.businessPresetDialogDone.disabled = presetControlsDisabled;
  elements.businessPresetInput.disabled = presetControlsDisabled;
  elements.addBusinessPreset.disabled = presetControlsDisabled;
  if (elements.vipThresholdInput) {
    elements.vipThresholdInput.disabled = state.busy || state.clientInsightBusy;
  }
  const fxControlsDisabled = state.busy || state.fxSettingsBusy;
  if (elements.fxEnabledInput) {
    elements.fxEnabledInput.disabled = fxControlsDisabled;
  }
  if (elements.usdCnyRateInput) {
    elements.usdCnyRateInput.disabled = fxControlsDisabled;
  }
  if (elements.jpyCnyRateInput) {
    elements.jpyCnyRateInput.disabled = fxControlsDisabled;
  }
  if (elements.twdCnyRateInput) {
    elements.twdCnyRateInput.disabled = fxControlsDisabled;
  }
  if (elements.hkdCnyRateInput) {
    elements.hkdCnyRateInput.disabled = fxControlsDisabled;
  }
  if (elements.exceptionDialog?.open) {
    syncExceptionDialogRefundUi();
  }
  if (elements.workHoursDialog?.open) {
    syncWorkHoursDialogHint();
  }
  if (elements.businessPresetDialog?.open) {
    renderBusinessPresetDialog();
  }
  syncUsageRateUi();
}

function filteredOrders() {
  const { month, status, stage, source, exception, payment, search } = state.filters;

  return [...state.orders]
    .filter((order) => matchesMonthFilter(order, month))
    .filter((order) => status === "all" || order.status === status)
    .filter((order) => stage === "all" || order.productionStage === stage)
    .filter((order) => source === "all" || order.source === source)
    .filter((order) => exception === "all" || order.exceptionType === exception)
    .filter((order) => payment === "all" || normalizePaymentStatus(order) === payment)
    .filter((order) => {
      if (!search) return true;
      const haystack = [
        order.projectName,
        order.clientName,
        order.productionStage,
        order.notes,
        order.startDate,
        order.dueDate,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    })
    .sort(compareOrdersForDisplay);
}

function normalizeListFilterQuery(value) {
  return String(value || "").trim();
}

function buildListFilterHaystack(order) {
  return [order.businessType, order.clientName].join(" ").toLowerCase();
}

function applyListPanelFilters(orders, panelKey) {
  const panelFilters = state.listFilters[panelKey] || { business: "all", query: "" };
  const businessValue = normalizeBusinessTypeValue(panelFilters.business) || "all";
  const query = normalizeListFilterQuery(panelFilters.query).toLowerCase();
  return orders.filter((order) => {
    const businessMatched = businessValue === "all" || order.businessType === businessValue;
    if (!businessMatched) return false;
    if (!query) return true;
    return buildListFilterHaystack(order).includes(query);
  });
}

function matchesMonthFilter(order, month) {
  if (!month) return true;

  const dueMonth = String(order.dueDate || "").slice(0, 7);
  const startMonth = String(order.startDate || "").slice(0, 7);
  if (!startMonth) {
    return dueMonth === month;
  }

  return startMonth <= month && dueMonth >= month;
}

function matchesIncomeMonth(order, month) {
  if (!month) return true;
  return getIncomeReferenceDate(order).slice(0, 7) === month;
}

function getIncomeScopedOrders(orders, month = state.filters.month) {
  if (!month) return orders;
  return orders.filter((order) => matchesIncomeMonth(order, month));
}

function compareOrdersForDisplay(left, right) {
  if (isClosed(left) !== isClosed(right)) {
    return isClosed(left) ? 1 : -1;
  }

  if (isClosed(left) && isClosed(right)) {
    return String(right.completedDate || right.dueDate || "").localeCompare(
      String(left.completedDate || left.dueDate || ""),
    );
  }

  return String(left.startDate || left.dueDate || "").localeCompare(
    String(right.startDate || right.dueDate || ""),
  ) || String(left.dueDate || "").localeCompare(String(right.dueDate || ""));
}

function renderStats(orders, incomeOrders = orders) {
  const totalRefund = sumRefundAmounts(incomeOrders);
  const totalFee = sumAdjustedFeeAmounts(incomeOrders);
  const totalNet = sumAdjustedNetAmounts(incomeOrders);
  const totalEffectiveAmount = sumEffectiveAmounts(incomeOrders);
  const totalEffectiveReceived = sumEffectiveReceivedAmounts(incomeOrders);
  const unhandledAbnormalCount = orders.filter(isUnhandledAbnormal).length;
  const workHoursSummary = summarizeWorkHours(incomeOrders);
  const incomeScopeNote = state.filters.month ? "按完成月归属统计" : "按当前结算口径统计";
  const stats = [
    {
      label: "本月稿件数",
      value: `${orders.length}`,
      note: "按当前筛选统计（排期可跨月）",
    },
    {
      label: "本月结算收入",
      value: formatCnyMoney(totalEffectiveAmount),
      note: totalRefund > 0 ? `${incomeScopeNote}，含退款 ${formatCnyMoney(totalRefund)}` : incomeScopeNote,
    },
    {
      label: "已收净额",
      value: formatCnyMoney(totalEffectiveReceived),
      note: `待收 ${formatCnyMoney(Math.max(totalEffectiveAmount - totalEffectiveReceived, 0))}`,
    },
    {
      label: "预计实得",
      value: formatCnyMoney(totalNet),
      note: `平台费 / 加价 ${formatCnyMoney(totalFee)}`,
    },
    {
      label: "已完稿参考时薪",
      value:
        workHoursSummary.averageRate != null
          ? `${formatCnyMoney(workHoursSummary.averageRate)}/h`
          : "--",
      note:
        workHoursSummary.count > 0
          ? `按已填工时的 ${workHoursSummary.count} 单 / ${formatHours(workHoursSummary.totalHours)} 小时计算`
          : "完成后补工时，才会进入这张统计卡",
    },
    {
      label: "逾期稿件",
      value: `${orders.filter(isOverdue).length}`,
      note: "已过截稿且未关闭",
    },
    {
      label: "待处理稿件",
      value: `${orders.filter((item) => isUnhandledAbnormal(item) || (!isAbnormal(item) && !isClosed(item))).length}`,
      note: unhandledAbnormalCount > 0 ? `含异常未处理 ${unhandledAbnormalCount} 单` : "流程还没结束",
    },
  ];

  elements.statsGrid.innerHTML = "";

  stats.forEach((item) => {
    const node = elements.statTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".stat-label").textContent = item.label;
    node.querySelector(".stat-value").textContent = item.value;
    node.querySelector(".stat-note").textContent = item.note;
    elements.statsGrid.append(node);
  });
}

function renderMotivationPanel(allOrders) {
  if (
    !elements.motivationMonthLabel ||
    !elements.incomeTrendSummary ||
    !elements.incomeTrendBars ||
    !elements.incomeTrendLegend ||
    !elements.dailyProgressTitle ||
    !elements.dailyProgressSummary ||
    !elements.dailyProgressGrid
  ) {
    return;
  }

  const selectedMonthDate = parseMonthKeySafely(state.filters.month);
  const selectedMonthLabel = `${selectedMonthDate.getFullYear()}年${selectedMonthDate.getMonth() + 1}月`;
  elements.motivationMonthLabel.textContent = `当前统计月：${selectedMonthLabel}`;
  renderIncomeTrendChart(allOrders, selectedMonthDate);
  renderDailyProgressChart(allOrders, selectedMonthDate);
}

function renderClientInsights(allOrders) {
  if (!elements.clientInsightSummary || !elements.clientInsightList || !elements.vipThresholdInput) {
    return;
  }

  const threshold = normalizeVipThreshold(state.clientInsightSettings.vipThreshold, DEFAULT_VIP_THRESHOLD);
  if (elements.vipThresholdInput.value !== String(threshold)) {
    elements.vipThresholdInput.value = String(threshold);
  }

  const aggregates = buildClientAggregates(allOrders);
  const vipCount = aggregates.filter((item) => item.totalAmount >= threshold).length;
  elements.clientInsightSummary.textContent = aggregates.length
    ? `共 ${aggregates.length} 位客户，达到重点客户阈值 ${vipCount} 位（当前阈值 ${formatCnyMoney(threshold)}）。`
    : "当前还没有客户累计数据，先录几单就会看到排行。";

  if (!aggregates.length) {
    elements.clientInsightList.innerHTML = '<p class="empty-state">暂无客户累计数据。</p>';
    return;
  }

  elements.clientInsightList.innerHTML = aggregates
    .map((item) => {
      const isVip = item.totalAmount >= threshold;
      return `
        <article class="client-insight-item">
          <div>
            <strong>${escapeHtml(item.clientName)}</strong>
            <div class="legend-row">最近一单 ${escapeHtml(item.lastOrderDate || "-")}</div>
          </div>
          <div class="client-insight-meta">
            <span class="legend-row">${item.orderCount} 单</span>
            <strong>${formatCnyMoney(item.totalAmount)}</strong>
            <span class="chip ${isVip ? "client-vip-chip" : "client-normal-chip"}">${isVip ? "重点客户" : "累计中"}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function buildClientAggregates(orders) {
  const grouped = new Map();
  orders.forEach((order) => {
    const clientName = String(order.clientName || "");
    if (!clientName) return;
    const amount = calculateGrossAmountCny(order);
    const latestDate = getClientReferenceDate(order);
    const current = grouped.get(clientName) || {
      clientName,
      totalAmount: 0,
      orderCount: 0,
      lastOrderDate: "",
    };
    current.totalAmount += amount;
    current.orderCount += 1;
    if (latestDate && (!current.lastOrderDate || latestDate > current.lastOrderDate)) {
      current.lastOrderDate = latestDate;
    }
    grouped.set(clientName, current);
  });

  return [...grouped.values()].sort(
    (left, right) =>
      right.totalAmount - left.totalAmount ||
      right.orderCount - left.orderCount ||
      left.clientName.localeCompare(right.clientName, "zh-CN"),
  );
}

function getClientReferenceDate(order) {
  return String(order.completedDate || order.dueDate || order.startDate || "");
}

function renderIncomeTrendChart(allOrders, selectedMonthDate) {
  const sourceList = getAllKnownSources(allOrders);
  const monthSeries = Array.from({ length: 6 }, (_, index) => shiftMonth(selectedMonthDate, index - 5));
  const monthRows = monthSeries.map((monthDate) => {
    const monthKey = formatMonthKey(monthDate);
    const monthOrders = allOrders.filter((order) => getIncomeReferenceDate(order).slice(0, 7) === monthKey);
    const perSource = sourceList.map((source) => ({
      source,
      amount: monthOrders
        .filter((order) => order.source === source)
        .reduce((total, order) => total + calculateEffectiveReceivedCny(order), 0),
    }));
    return {
      monthDate,
      perSource,
      total: perSource.reduce((total, item) => total + item.amount, 0),
    };
  });

  const sixMonthTotal = monthRows.reduce((total, item) => total + item.total, 0);
  const currentMonthRow = monthRows[monthRows.length - 1];
  elements.incomeTrendSummary.textContent =
    sixMonthTotal > 0
      ? `近 6 个月已收 ${formatCnyMoney(sixMonthTotal)}，${selectedMonthDate.getMonth() + 1} 月已收 ${formatCnyMoney(currentMonthRow.total)}`
      : "还没有已收数据，先录几单并填已收金额就会看到柱状趋势。";

  const maxTotal = Math.max(...monthRows.map((item) => item.total), 0);
  if (maxTotal <= 0) {
    elements.incomeTrendBars.innerHTML = '<p class="income-trend-empty">暂时没有可展示的已收数据。</p>';
    elements.incomeTrendLegend.innerHTML = "";
    state.incomeTrendAnchoredMonth = "";
    return;
  }

  elements.incomeTrendBars.innerHTML = monthRows
    .map((item, index) => {
      const isCurrentMonth = index === monthRows.length - 1;
      const segments = item.perSource
        .filter((entry) => entry.amount > 0)
        .map(
          (entry) =>
            `<span class="income-trend-segment" style="height:${(entry.amount / maxTotal) * 100}%;background:${getSourceColor(
              entry.source,
            )};" title="${escapeHtml(getSourceLabel(entry.source))} ${formatCnyMoney(entry.amount)}"></span>`,
        )
        .join("");
      const label = item.monthDate.getMonth() === 0
        ? `${item.monthDate.getFullYear()}年1月`
        : `${item.monthDate.getMonth() + 1}月`;
      return `
        <article class="income-trend-col">
          <span class="income-trend-value">${item.total > 0 ? formatCnyMoney(item.total) : "—"}</span>
          <div class="income-trend-track ${isCurrentMonth ? "is-current-month" : ""}">
            ${segments}
          </div>
          <span class="income-trend-label">${label}</span>
        </article>
      `;
    })
    .join("");

  const anchorMonthKey = formatMonthKey(currentMonthRow.monthDate);
  if (state.incomeTrendAnchoredMonth !== anchorMonthKey) {
    state.incomeTrendAnchoredMonth = anchorMonthKey;
    window.requestAnimationFrame(() => {
      if (!elements.incomeTrendBars) return;
      elements.incomeTrendBars.scrollLeft = elements.incomeTrendBars.scrollWidth;
    });
  }

  const legendRows = sourceList
    .map((source) => {
      const amount = monthRows.reduce(
        (total, row) => total + row.perSource.find((entry) => entry.source === source).amount,
        0,
      );
      return {
        source,
        amount,
      };
    })
    .filter((entry) => entry.amount > 0);

  elements.incomeTrendLegend.innerHTML = legendRows
    .map((entry) => {
      const currentAmount = currentMonthRow.perSource.find((item) => item.source === entry.source).amount;
      const share = currentMonthRow.total > 0 ? Math.round((currentAmount / currentMonthRow.total) * 100) : 0;
      return `
        <span class="income-trend-legend-item">
          <span class="income-trend-legend-dot" style="background:${getSourceColor(entry.source)};"></span>
          ${escapeHtml(getSourceLabel(entry.source))} ${share > 0 ? `${share}%` : ""}
        </span>
      `;
    })
    .join("");
}

function renderDailyProgressChart(allOrders, selectedMonthDate) {
  const monthKey = formatMonthKey(selectedMonthDate);
  const daysInMonth = new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth() + 1, 0).getDate();
  const dailyRows = Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    income: 0,
    hours: 0,
  }));

  allOrders.forEach((order) => {
    const date = getIncomeReferenceDate(order);
    if (date.slice(0, 7) !== monthKey) return;
    const day = Number(date.slice(8, 10));
    if (!Number.isInteger(day) || day < 1 || day > daysInMonth) return;
    const row = dailyRows[day - 1];
    row.income += calculateEffectiveReceivedCny(order);
    row.hours += sanitizeWorkHours(order.workHours);
  });

  const totalIncome = dailyRows.reduce((total, row) => total + row.income, 0);
  const totalHours = dailyRows.reduce((total, row) => total + row.hours, 0);
  const activeDays = dailyRows.filter((row) => row.income > 0 || row.hours > 0).length;
  const maxDailyIncome = Math.max(...dailyRows.map((row) => row.income), 0);

  elements.dailyProgressTitle.textContent = `${selectedMonthDate.getMonth() + 1} 月每日已收与工时`;
  elements.dailyProgressSummary.textContent =
    activeDays > 0
      ? `已收 ${formatCnyMoney(totalIncome)}，工时 ${formatHours(totalHours) || "0"} 小时，记录 ${activeDays} 天`
      : "这个月还没有已收/工时记录。";

  const firstDay = new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth(), 1).getDay();
  const leadingBlanks = Array.from({ length: firstDay }, () => '<div class="daily-progress-cell is-empty"></div>');
  const dayCells = dailyRows.map((row) => {
    const ratio = maxDailyIncome > 0 ? row.income / maxDailyIncome : 0;
    return `
      <article class="daily-progress-cell ${row.income <= 0 && row.hours <= 0 ? "is-empty" : ""}" style="--income-ratio:${ratio};">
        <strong class="daily-progress-day">${row.day}</strong>
        <span class="daily-progress-line daily-progress-line-key">已收</span>
        <span class="daily-progress-line daily-progress-line-value">${
          row.income > 0 ? formatCnyMoney(row.income) : "-"
        }</span>
        <span class="daily-progress-line daily-progress-line-hours">${
          row.hours > 0 ? `工时 ${formatHours(row.hours)} 小时` : "工时 -"
        }</span>
      </article>
    `;
  });
  const totalCells = firstDay + daysInMonth;
  const trailingCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const trailingBlanks = Array.from({ length: trailingCount }, () => '<div class="daily-progress-cell is-empty"></div>');

  elements.dailyProgressGrid.innerHTML = [...leadingBlanks, ...dayCells, ...trailingBlanks].join("");
}

function getIncomeReferenceDate(order) {
  return String(order.completedDate || order.dueDate || order.startDate || "");
}

function getAllKnownSources(allOrders) {
  const sources = [];
  const seen = new Set();
  SOURCE_OPTIONS.forEach((item) => {
    const normalized = normalizeSourceValue(item.value);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    sources.push(normalized);
  });
  allOrders.forEach((order) => {
    const source = normalizeSourceValue(order.source);
    if (!source || seen.has(source)) return;
    seen.add(source);
    sources.push(source);
  });
  return sources;
}

function getSourceColor(source) {
  return SOURCE_COLORS[normalizeSourceValue(source)] || "#9ba6ab";
}

function formatMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function parseMonthKeySafely(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}$/.test(value)) {
    return parseMonthInput(value);
  }
  return currentMonthDate();
}

function renderBreakdown(orders) {
  const totals = getVisibleBusinessTypes(orders).map((name) => ({
    name,
    count: orders.filter((item) => item.businessType === name).length,
    amount: sumEffectiveAmounts(
      orders.filter((item) => item.businessType === name),
    ),
  })).filter((item) => item.count > 0);

  const maxAmount = Math.max(...totals.map((item) => item.amount), 1);
  elements.breakdownList.innerHTML = "";

  if (!totals.length) {
    elements.breakdownList.innerHTML =
      '<p class="empty-state">当前筛选下还没有数据，先录几单就能看到分类走势。</p>';
    return;
  }

  totals
    .sort((left, right) => right.amount - left.amount)
    .forEach((item) => {
      const row = document.createElement("article");
      row.className = "breakdown-item";
      row.innerHTML = `
        <div class="breakdown-head">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${item.count} 单 / ${formatCnyMoney(item.amount)}</span>
        </div>
        <div class="breakdown-bar">
          <div class="breakdown-fill" style="width: ${(item.amount / maxAmount) * 100}%"></div>
        </div>
      `;
      elements.breakdownList.append(row);
    });
}

function renderCalendar(orders) {
  const monthDate = state.calendarMonth;
  const monthKey = `${monthDate.getFullYear()}年 ${monthDate.getMonth() + 1}月`;
  const displayMode = normalizeCalendarDisplayMode(state.calendarDisplayMode, CALENDAR_DISPLAY_TAGS);
  const range = buildCalendarRange(monthDate);
  const dayEntriesByDate = collectCalendarDayEntries(orders, range.startKey, range.endKey);
  state.calendarDisplayMode = displayMode;
  elements.calendarTitle.textContent = monthKey;

  if (elements.calendarModeTags) {
    const active = displayMode === CALENDAR_DISPLAY_TAGS;
    elements.calendarModeTags.classList.toggle("is-active", active);
    elements.calendarModeTags.setAttribute("aria-pressed", active ? "true" : "false");
  }
  if (elements.calendarModeTimeline) {
    const active = displayMode === CALENDAR_DISPLAY_TIMELINE;
    elements.calendarModeTimeline.classList.toggle("is-active", active);
    elements.calendarModeTimeline.setAttribute("aria-pressed", active ? "true" : "false");
  }
  if (elements.calendarHint) {
    elements.calendarHint.textContent = state.calendarCreateMode
      ? state.calendarCreateStartDate
        ? `新建稿件第 2 步：已选 ${formatCalendarDialogDate(state.calendarCreateStartDate)} 作为动工日，再点一个日期作为截稿日${displayMode === CALENDAR_DISPLAY_TIMELINE ? "；也可以在条状排期空白处直接拖出区间。" : "。"}`
        : `新建稿件第 1 步：先点动工日期，再点截稿日期${displayMode === CALENDAR_DISPLAY_TIMELINE ? "；条状排期空白处也能直接拖出区间。" : "。"}`
      : displayMode === CALENDAR_DISPLAY_TIMELINE
        ? "点日期先选中当天；右键日期可标记休息日 / 工作日；拖左右把手可改动工 / 截稿。"
        : "点日期先选中当天；右键日期可标记休息日 / 工作日；已完成稿件会划线。";
  }
  syncSelectedCalendarDate(range, monthDate);
  state.calendarDayEntriesByDate = dayEntriesByDate;
  const timelineMode = displayMode === CALENDAR_DISPLAY_TIMELINE;
  if (elements.calendarWeekdays) {
    elements.calendarWeekdays.hidden = timelineMode;
    elements.calendarWeekdays.classList.toggle("is-hidden", timelineMode);
  }
  if (elements.calendarGrid) {
    elements.calendarGrid.hidden = timelineMode;
    elements.calendarGrid.classList.toggle("is-hidden", timelineMode);
    if (timelineMode) elements.calendarGrid.innerHTML = "";
  }
  if (elements.calendarTimeline) {
    elements.calendarTimeline.hidden = !timelineMode;
    elements.calendarTimeline.classList.toggle("is-hidden", !timelineMode);
    if (!timelineMode) elements.calendarTimeline.innerHTML = "";
  }

  if (timelineMode) {
    renderCalendarTimeline(orders, monthDate, range, dayEntriesByDate);
  } else {
    renderCalendarTags(orders, monthDate, range, dayEntriesByDate);
  }
  renderCalendarFocusPanel(monthDate, range, dayEntriesByDate);
}

function handleCalendarContextMenuRequest(event) {
  const dateKey = getCalendarDateFromTarget(event.target);
  if (!dateKey) return;
  event.preventDefault();
  openCalendarContextMenu(dateKey, event.clientX, event.clientY);
}

function getCalendarDateFromTarget(target) {
  const node = target?.closest?.("[data-date],[data-calendar-date]");
  if (!node) return "";
  return normalizeDateKey(node.dataset.date || node.dataset.calendarDate || "");
}

function selectCalendarDate(dateKey, { syncMonth = false } = {}) {
  const safeDate = normalizeDateKey(dateKey);
  if (!safeDate) return;
  state.selectedCalendarDate = safeDate;
  if (syncMonth) {
    const selectedDate = parseDateKey(safeDate);
    if (selectedDate) {
      const monthChanged =
        selectedDate.getFullYear() !== state.calendarMonth.getFullYear() ||
        selectedDate.getMonth() !== state.calendarMonth.getMonth();
      if (monthChanged) {
        state.calendarMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        syncMonthFilter();
      }
    }
  }
  render();
}

function handleCalendarDateSelection(dateKey) {
  const safeDate = normalizeDateKey(dateKey);
  if (!safeDate) return;
  if (state.calendarCreateMode) {
    handleCalendarCreateDatePick(safeDate);
    return;
  }
  selectCalendarDate(safeDate, { syncMonth: true });
}

function startCalendarCreateMode() {
  if (!canEditOrdersNow()) {
    updateAuthUi("登录后才能通过月历快速新建稿件。");
    return;
  }
  state.calendarCreateMode = true;
  state.calendarCreateStartDate = "";
  updateAuthUi("已进入新建稿件：第 1 步选动工日期，第 2 步选截稿日期。");
  closeCalendarContextMenu();
  render();
}

function cancelCalendarCreateMode({ silent = false } = {}) {
  if (!state.calendarCreateMode && !state.calendarCreateStartDate) return;
  state.calendarCreateMode = false;
  state.calendarCreateStartDate = "";
  clearTimelineCreateRangePreview();
  if (!silent) {
    updateAuthUi("已退出新建稿件选日期。");
  }
  render();
}

function discardPendingTimelineDraft({ silent = false } = {}) {
  const hadDraft = Boolean(state.pendingTimelineDraft);
  closePendingTimelineDraftPopover();
  clearPendingTimelineDraft();
  clearTimelineCreateRangePreview();
  if (hadDraft && !silent) {
    updateAuthUi("已放弃这条待保存排期。");
  }
  render();
}

function handleCalendarCreateDatePick(dateKey) {
  const safeDate = normalizeDateKey(dateKey);
  if (!safeDate) return;
  if (!state.calendarCreateStartDate) {
    state.calendarCreateStartDate = safeDate;
    state.selectedCalendarDate = safeDate;
    render();
    updateAuthUi(`已选 ${formatCalendarDialogDate(safeDate)} 作为动工日期。第 2 步再点一个日期作为截稿日期。`);
    return;
  }
  const nextRange = getOrderedDateRange(state.calendarCreateStartDate, safeDate);
  state.selectedCalendarDate = nextRange.dueDate;
  prefillFormFromCalendarRange(nextRange.startDate, nextRange.dueDate);
}

function prefillFormFromCalendarRange(startDate, dueDate) {
  const nextRange = getOrderedDateRange(startDate, dueDate);
  if (!nextRange.startDate || !nextRange.dueDate || !elements.startDate || !elements.dueDate) return;
  if (!canEditOrdersNow()) {
    updateAuthUi("登录后才能把日期写入主表单。");
    return;
  }

  closeCalendarContextMenu();
  state.calendarCreateMode = false;
  state.calendarCreateStartDate = "";
  elements.startDate.value = nextRange.startDate;
  elements.dueDate.value = nextRange.dueDate;
  refreshPendingTimelineDraft(nextRange.startDate, nextRange.dueDate);
  const timelineMode =
    normalizeCalendarDisplayMode(state.calendarDisplayMode, CALENDAR_DISPLAY_TAGS) === CALENDAR_DISPLAY_TIMELINE;
  state.pendingTimelineDraftPopoverOpen = timelineMode;
  renderWorkHoursPreview();
  if (state.viewMode !== VIEW_MODE_SCHEDULE) {
    setViewMode(VIEW_MODE_SCHEDULE);
  }
  render();
  const nextStepMessage = timelineMode ? "可直接在月历里补信息并保存。" : "切到条状排期后可继续在时间线上补信息。";
  updateAuthUi(
    `已选 ${formatCalendarDialogDate(nextRange.startDate)} 至 ${formatCalendarDialogDate(
      nextRange.dueDate,
    )}，已生成一条待保存排期；${nextStepMessage}`,
  );
}

function buildPendingTimelineDraftOrder(startDate, dueDate) {
  const nextRange = getOrderedDateRange(startDate, dueDate);
  if (!nextRange.startDate || !nextRange.dueDate) return null;
  const baseStatus = elements.status?.value || "排期中";
  const draftColor = getPendingTimelineDraftColor();
  return normalizeOrder({
    id: TIMELINE_DRAFT_ID,
    projectName: elements.projectName?.value.trim() || "待保存稿件",
    clientName: elements.clientName?.value.trim() || "待填写客户",
    businessType: elements.businessType?.value || BUILT_IN_BUSINESS_TYPES[0],
    productionStage: elements.productionStage?.value || "",
    source: elements.source?.value || SOURCES[0],
    feeMode: elements.feeMode?.value || "standard",
    feeRate: parseFeeRateInput(elements.feeRate?.value),
    usageType: elements.usageType?.value || USAGE_TYPES[0],
    usageRate: parseUsageRateInput(elements.usageRate?.value),
    currency: elements.currency?.value || "CNY",
    fxRateSnapshot:
      normalizeCurrency(elements.currency?.value) === "CNY" ? null : getConfiguredFxRate(elements.currency?.value),
    priority: elements.priority?.value || PRIORITIES[0],
    amount: Number(elements.amount?.value || 0),
    receivedAmount: Number(elements.receivedAmount?.value || 0),
    paymentStatus: elements.paymentStatus?.value || PAYMENT_STATUSES[0],
    startDate: nextRange.startDate,
    dueDate: nextRange.dueDate,
    completedDate: elements.completedDate?.value || "",
    calendarColor: draftColor,
    workHours: elements.workHours?.value || "",
    status: baseStatus,
    exceptionType: EXCEPTION_TYPES[0],
    notes: elements.notes?.value.trim() || "",
  });
}

function refreshPendingTimelineDraft(startDate = elements.startDate?.value, dueDate = elements.dueDate?.value) {
  if (state.editingId) {
    clearPendingTimelineDraft();
    return null;
  }
  const nextRange = getOrderedDateRange(startDate, dueDate);
  if (!nextRange.startDate || !nextRange.dueDate) {
    clearPendingTimelineDraft();
    return null;
  }
  if (state.pendingTimelineDraftColor == null) {
    state.pendingTimelineDraftColor = getPendingTimelineDraftInitialColor();
  }
  const draftOrder = buildPendingTimelineDraftOrder(startDate, dueDate);
  state.pendingTimelineDraft = draftOrder;
  return draftOrder;
}

function refreshPendingTimelineDraftFromForm() {
  if (!state.pendingTimelineDraft) return;
  refreshPendingTimelineDraft();
  render();
}

function clearPendingTimelineDraft() {
  state.pendingTimelineDraft = null;
  state.pendingTimelineDraftColor = null;
  state.pendingTimelineDraftPopoverOpen = false;
}

function getPendingTimelineDraftBarElement() {
  return elements.calendarTimeline?.querySelector(`[data-timeline-order-id="${TIMELINE_DRAFT_ID}"]`) || null;
}

function focusPendingTimelineDraft() {
  if (!state.pendingTimelineDraft) return;
  if (state.viewMode !== VIEW_MODE_SCHEDULE) {
    setViewMode(VIEW_MODE_SCHEDULE);
  }
  if (normalizeCalendarDisplayMode(state.calendarDisplayMode, CALENDAR_DISPLAY_TAGS) !== CALENDAR_DISPLAY_TIMELINE) {
    state.calendarDisplayMode = CALENDAR_DISPLAY_TIMELINE;
    persistLayoutPrefs();
    render();
  }
  window.requestAnimationFrame(() => {
    openPendingTimelineDraftPopover(getPendingTimelineDraftBarElement());
  });
}

function getOrderedDateRange(startDate, dueDate) {
  const safeStart = normalizeDateKey(startDate);
  const safeDue = normalizeDateKey(dueDate);
  if (!safeStart || !safeDue) {
    return { startDate: "", dueDate: "" };
  }
  return safeStart <= safeDue
    ? { startDate: safeStart, dueDate: safeDue }
    : { startDate: safeDue, dueDate: safeStart };
}

function getCalendarCreateRangeState(dateKey) {
  const safeDate = normalizeDateKey(dateKey);
  if (!state.calendarCreateMode || !state.calendarCreateStartDate || !safeDate) {
    return { isAnchor: false, isInRange: false };
  }
  const previewRange = getOrderedDateRange(
    state.calendarCreateStartDate,
    state.selectedCalendarDate || state.calendarCreateStartDate,
  );
  return {
    isAnchor: safeDate === state.calendarCreateStartDate,
    isInRange:
      Boolean(previewRange.startDate) &&
      safeDate >= previewRange.startDate &&
      safeDate <= previewRange.dueDate,
  };
}

function renderCalendarCreateControls() {
  if (!elements.calendarCreateRange || !elements.calendarCancelRange || !elements.calendarCreateStatus) return;
  const cannotCreate = !canEditOrdersNow() || state.busy;
  const timelineMode =
    normalizeCalendarDisplayMode(state.calendarDisplayMode, CALENDAR_DISPLAY_TAGS) === CALENDAR_DISPLAY_TIMELINE;
  const hasPendingDraft = Boolean(state.pendingTimelineDraft);
  const isSelectingRange = state.calendarCreateMode;

  elements.calendarCreateRange.hidden = false;
  elements.calendarCreateRange.disabled = cannotCreate;

  if (isSelectingRange) {
    elements.calendarCreateRange.textContent = "新建稿件";
    elements.calendarCancelRange.hidden = false;
    elements.calendarCancelRange.textContent = "取消选日期";
    elements.calendarCancelRange.disabled = state.busy;
  } else if (hasPendingDraft) {
    elements.calendarCreateRange.textContent = "编辑草稿";
    elements.calendarCancelRange.hidden = false;
    elements.calendarCancelRange.textContent = "放弃草稿";
    elements.calendarCancelRange.disabled = state.busy;
  } else {
    elements.calendarCreateRange.textContent = "新建稿件";
    elements.calendarCancelRange.hidden = true;
    elements.calendarCancelRange.disabled = state.busy;
  }

  elements.calendarCreateStatus.textContent = isSelectingRange
    ? state.calendarCreateStartDate
      ? `第 2 步：已选动工 ${formatCalendarDialogDate(state.calendarCreateStartDate)}，继续选截稿日期${timelineMode ? "，也可以在条状排期空白处直接拖出区间。" : "。"}`
      : timelineMode
        ? "第 1 步：先选动工日期；也可以在条状排期空白处直接拖出区间。"
        : "第 1 步：先选动工日期，再选截稿日期。"
    : hasPendingDraft
      ? timelineMode
        ? "已生成一条待保存排期。点“编辑草稿”继续填，或“放弃草稿”重新选日期。"
        : "已生成一条待保存排期。切到条状排期后点“编辑草稿”继续填，或放弃草稿重新选日期。"
    : timelineMode
      ? "先点“新建稿件”，再在月历里选日期；条状排期也支持直接拖出区间。"
      : "先点“新建稿件”，再选动工和截稿日期。";
}

function openCalendarContextMenu(dateKey, clientX, clientY) {
  if (!elements.calendarContextMenu) return;
  const safeDate = normalizeDateKey(dateKey);
  if (!safeDate) return;
  state.calendarContextMenuDate = safeDate;
  elements.calendarContextMenu.dataset.date = safeDate;
  const currentMark = getCalendarDayMarkType(safeDate);
  const canEditDaySettings = canEditOrdersNow() && !state.busy && !state.calendarDayMarksBusy;
  elements.calendarContextMenu.innerHTML = `
    <p class="calendar-context-menu-title">${escapeHtml(formatCalendarDialogDate(safeDate))}</p>
    <button type="button" class="calendar-context-menu-btn" data-action="openCalendarDay">查看当天列表</button>
    <div class="calendar-context-menu-divider"></div>
    <button type="button" class="calendar-context-menu-btn${currentMark === CALENDAR_DAY_MARK_REST ? " is-active" : ""}" data-action="setCalendarDayMark" data-mark="${CALENDAR_DAY_MARK_REST}" ${canEditDaySettings ? "" : "disabled"}>标为休息日</button>
    <button type="button" class="calendar-context-menu-btn${currentMark === CALENDAR_DAY_MARK_WORK ? " is-active" : ""}" data-action="setCalendarDayMark" data-mark="${CALENDAR_DAY_MARK_WORK}" ${canEditDaySettings ? "" : "disabled"}>标为工作日</button>
    <button type="button" class="calendar-context-menu-btn" data-action="setCalendarDayMark" data-mark="" ${canEditDaySettings ? "" : "disabled"}>清除日期标记</button>
  `;
  elements.calendarContextMenu.hidden = false;
  const maxLeft = Math.max(12, window.innerWidth - 232);
  const maxTop = Math.max(12, window.innerHeight - 260);
  elements.calendarContextMenu.style.left = `${Math.min(clientX, maxLeft)}px`;
  elements.calendarContextMenu.style.top = `${Math.min(clientY, maxTop)}px`;
}

function closeCalendarContextMenu() {
  if (!elements.calendarContextMenu) return;
  state.calendarContextMenuDate = "";
  elements.calendarContextMenu.dataset.date = "";
  elements.calendarContextMenu.hidden = true;
}

function getCalendarDayMarkType(dateKey) {
  const safeDate = normalizeDateKey(dateKey);
  if (!safeDate) return "";
  return normalizeCalendarDayMarkType(state.calendarDayMarks?.marks?.[safeDate]);
}

function renderCalendarDayMark(type) {
  const safeType = normalizeCalendarDayMarkType(type);
  if (!safeType) return "";
  return `<span class="calendar-day-mark ${escapeHtml(safeType)}">${escapeHtml(
    safeType === CALENDAR_DAY_MARK_REST ? "休" : "班",
  )}</span>`;
}

function syncSelectedCalendarDate(range, monthDate) {
  const safeSelected = normalizeDateKey(state.selectedCalendarDate);
  if (safeSelected && range.dateKeys.includes(safeSelected)) {
    state.selectedCalendarDate = safeSelected;
    return safeSelected;
  }
  const todayKey = range.todayKey;
  if (range.dateKeys.includes(todayKey)) {
    state.selectedCalendarDate = todayKey;
    return todayKey;
  }
  const firstCurrentMonthDate = range.dateKeys.find((dateKey) => {
    const current = parseDateKey(dateKey);
    return current && current.getMonth() === monthDate.getMonth();
  });
  state.selectedCalendarDate = firstCurrentMonthDate || range.dateKeys[0] || "";
  return state.selectedCalendarDate;
}

function renderCalendarFocusPanel(monthDate, range, dayEntriesByDate) {
  if (
    !elements.calendarFocusTitle ||
    !elements.calendarFocusSummary ||
    !elements.calendarFocusMeta ||
    !elements.calendarFocusList
  ) {
    return;
  }
  const dateKey = syncSelectedCalendarDate(range, monthDate);
  const current = parseDateKey(dateKey);
  if (!current) return;
  const entries = dayEntriesByDate.get(dateKey) || [];
  const weekdayLabel = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][current.getDay()];
  const dayMarkType = getCalendarDayMarkType(dateKey);
  const isToday = dateKey === range.todayKey;
  const isWeekend = current.getDay() === 0 || current.getDay() === 6;

  elements.calendarFocusTitle.textContent = `${current.getMonth() + 1}月${current.getDate()}日 · ${weekdayLabel}`;
  elements.calendarFocusSummary.textContent = entries.length
    ? `当天共有 ${entries.length} 条动工 / 截稿 / 完成记录。`
    : dayMarkType === CALENDAR_DAY_MARK_REST
      ? "已标记为休息日。"
      : dayMarkType === CALENDAR_DAY_MARK_WORK
        ? "已标记为工作日。"
        : state.calendarCreateMode
          ? state.calendarCreateStartDate
            ? "再点一个日期作为截稿日。"
            : "点上方日期作为动工日。"
          : "空白的一天。";
  elements.calendarFocusMeta.innerHTML = [
    isToday ? '<span class="calendar-focus-chip is-today">今天</span>' : "",
    isWeekend ? '<span class="calendar-focus-chip">周末</span>' : "",
    dayMarkType === CALENDAR_DAY_MARK_REST
      ? '<span class="calendar-focus-chip is-rest">休息日</span>'
      : "",
    dayMarkType === CALENDAR_DAY_MARK_WORK
      ? '<span class="calendar-focus-chip is-work">工作日</span>'
      : "",
    current.getMonth() !== monthDate.getMonth()
      ? '<span class="calendar-focus-chip">跨月</span>'
      : "",
  ]
    .filter(Boolean)
    .join("");
  elements.calendarFocusList.innerHTML = entries.length
    ? entries.map((entry) => renderCalendarDayDialogItem(entry)).join("")
    : `<article class="calendar-focus-empty">
        <p class="legend-row">${
          state.calendarCreateMode
            ? state.calendarCreateStartDate
              ? "点上方日期设为截稿日。"
              : "点上方日期设为动工日；可先标记休息日 / 工作日。"
            : "点上方「新建稿件」再选日期。"
        }</p>
      </article>`;
  if (elements.calendarFocusOpen) {
    elements.calendarFocusOpen.hidden = !entries.length;
    elements.calendarFocusOpen.disabled = !entries.length;
  }
  if (elements.calendarFocusMarkRest) {
    elements.calendarFocusMarkRest.disabled = !canEditOrdersNow() || state.busy || state.calendarDayMarksBusy;
    elements.calendarFocusMarkRest.classList.toggle("is-active", dayMarkType === CALENDAR_DAY_MARK_REST);
  }
  if (elements.calendarFocusMarkWork) {
    elements.calendarFocusMarkWork.disabled = !canEditOrdersNow() || state.busy || state.calendarDayMarksBusy;
    elements.calendarFocusMarkWork.classList.toggle("is-active", dayMarkType === CALENDAR_DAY_MARK_WORK);
  }
  if (elements.calendarFocusClearMark) {
    elements.calendarFocusClearMark.disabled = !canEditOrdersNow() || state.busy || state.calendarDayMarksBusy || !dayMarkType;
  }
}

function renderCalendarTags(orders, monthDate, range, dayEntriesByDate) {
  const useCompactLabel = shouldUseCompactCalendarLabel();
  elements.calendarGrid.innerHTML = "";

  range.dateKeys.forEach((currentDate) => {
    const current = parseDateKey(currentDate);
    if (!current) return;
    const cell = document.createElement("article");
    const isOutside = current.getMonth() !== monthDate.getMonth();
    const isToday = currentDate === range.todayKey;
    const isWeekend = current.getDay() === 0 || current.getDay() === 6;
    const dayMarkType = getCalendarDayMarkType(currentDate);
    const isSelected = currentDate === state.selectedCalendarDate;
    const rangeState = getCalendarCreateRangeState(currentDate);
    const dayEntries = dayEntriesByDate.get(currentDate) || [];
    const visibleEntries = dayEntries.slice(0, 3);
    const hiddenCount = Math.max(0, dayEntries.length - visibleEntries.length);
    cell.className = `calendar-cell${isOutside ? " is-outside" : ""}${isToday ? " is-today" : ""}${isWeekend ? " is-weekend" : ""}${dayMarkType ? ` is-${dayMarkType}-day` : ""}${isSelected ? " is-selected" : ""}${rangeState.isAnchor ? " is-range-anchor" : ""}${rangeState.isInRange ? " is-range-preview" : ""}`;
    cell.dataset.calendarDate = currentDate;
    cell.dataset.action = "selectCalendarDate";
    cell.dataset.date = currentDate;
    cell.innerHTML = `
      <div class="calendar-cell-head">
        <button
          type="button"
          class="calendar-day-button${isSelected ? " is-selected" : ""}"
          data-action="selectCalendarDate"
          data-date="${escapeHtml(currentDate)}"
          aria-label="选中 ${current.getMonth() + 1} 月 ${current.getDate()} 日"
        >
          <span class="calendar-day-number">${current.getDate()}</span>
          ${renderCalendarDayMark(dayMarkType)}
        </button>
        ${
          dayEntries.length
            ? `<button
                type="button"
                class="calendar-day-detail"
                data-action="openCalendarDay"
                data-date="${escapeHtml(currentDate)}"
                aria-label="查看 ${current.getMonth() + 1} 月 ${current.getDate()} 日详情"
              >${dayEntries.length} 项</button>`
            : ""
        }
      </div>
      <div class="calendar-items">
        ${
          visibleEntries.length
            ? visibleEntries
                .map(
                  (entry) =>
                    `<button
                      type="button"
                      class="calendar-item ${escapeHtml(entry.type)}${entry.done ? " is-done" : ""}${
                        useCompactLabel ? " compact" : " full"
                      }"
                      data-action="jumpOrder"
                      data-id="${escapeHtml(entry.order.id)}"
                      title="${escapeHtml(entry.label)}"
                      aria-label="${escapeHtml(entry.label)}"
                    >${
                      useCompactLabel
                        ? `<span class="calendar-item-compact"><span class="calendar-item-type">${escapeHtml(
                            entry.compactTypeLabel,
                          )}</span><span class="calendar-item-project">${escapeHtml(
                            entry.compactProjectLabel,
                          )}</span></span>`
                        : escapeHtml(entry.label)
                    }</button>`,
                )
                .join("")
            : ""
        }
        ${
          hiddenCount
            ? `<button type="button" class="calendar-item more" data-action="openCalendarDay" data-date="${escapeHtml(
                currentDate,
              )}" aria-label="查看 ${hiddenCount} 条更多记录">+${hiddenCount} 条</button>`
            : ""
        }
      </div>
    `;
    elements.calendarGrid.append(cell);
  });
}

function renderCalendarTimeline(orders, monthDate, range, dayEntriesByDate) {
  if (!elements.calendarTimeline) return;
  const canEditOrders = canEditOrdersNow();
  const weekSegmentsList = buildTimelineWeekSegments(orders, range.weeks, range.startKey, range.endKey);
  appendPendingTimelineDraftSegments(weekSegmentsList, range.weeks, range.startKey, range.endKey);
  assignTimelineSegmentLanes(weekSegmentsList);

  elements.calendarTimeline.innerHTML = range.weeks
    .map((weekDates, weekIndex) => {
      const weekSegments = weekSegmentsList[weekIndex] || [];
      const laneCount = weekSegments.length
        ? weekSegments.reduce((maxLane, segment) => Math.max(maxLane, segment.lane + 1), 0)
        : 0;
      const dayCells = weekDates
        .map((dateKey) => {
          const current = parseDateKey(dateKey);
          if (!current) return "";
          const isOutside = current.getMonth() !== monthDate.getMonth();
          const isToday = dateKey === range.todayKey;
          const isWeekend = current.getDay() === 0 || current.getDay() === 6;
          const dayMarkType = getCalendarDayMarkType(dateKey);
          const isSelected = dateKey === state.selectedCalendarDate;
          const rangeState = getCalendarCreateRangeState(dateKey);
          const entryCount = (dayEntriesByDate.get(dateKey) || []).length;
          return `<div
              class="timeline-day-card${isOutside ? " is-outside" : ""}${isToday ? " is-today" : ""}${entryCount > 0 ? " has-entries" : ""}${isWeekend ? " is-weekend" : ""}${dayMarkType ? ` is-${dayMarkType}-day` : ""}${isSelected ? " is-selected" : ""}${rangeState.isAnchor ? " is-range-anchor" : ""}${rangeState.isInRange ? " is-range-preview" : ""}"
              data-calendar-date="${escapeHtml(dateKey)}"
              data-action="selectCalendarDate"
              data-date="${escapeHtml(dateKey)}"
            >
              <button
                type="button"
                class="timeline-day-button"
                data-action="selectCalendarDate"
                data-date="${escapeHtml(dateKey)}"
                aria-label="选中 ${current.getMonth() + 1} 月 ${current.getDate()} 日"
              >
                <span class="timeline-day-number-row">
                  <span class="timeline-day-number">${current.getDate()}</span>
                  ${renderCalendarDayMark(dayMarkType)}
                </span>
              </button>
              ${
                entryCount > 0
                  ? `<button
                      type="button"
                      class="timeline-day-detail"
                      data-action="openCalendarDay"
                      data-date="${escapeHtml(dateKey)}"
                      aria-label="查看 ${current.getMonth() + 1} 月 ${current.getDate()} 日详情（${entryCount} 条）"
                    >${entryCount} 项</button>`
                  : ""
              }
            </div>`;
        })
        .join("");
      const bars = weekSegments.map((segment) => renderTimelineBar(segment, canEditOrders)).join("");
      return `<section class="calendar-timeline-week">
        <div class="calendar-timeline-days">${dayCells}</div>
        <div
          class="calendar-timeline-track${state.calendarCreateMode ? " is-create-armed" : ""}"
          data-week-track
          data-week-start="${escapeHtml(weekDates[0])}"
          data-week-end="${escapeHtml(weekDates[6])}"
          style="--timeline-lane-count:${laneCount};"
        >
          ${bars}
        </div>
      </section>`;
    })
    .join("");
}

function buildCalendarRange(monthDate) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const start = new Date(firstDay);
  start.setDate(start.getDate() - firstDay.getDay());
  const end = new Date(lastDay);
  end.setDate(end.getDate() + (6 - lastDay.getDay()));

  const weeks = [];
  const dateKeys = [];
  let currentWeek = [];
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const key = formatDateInput(date);
    currentWeek.push(key);
    dateKeys.push(key);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  return {
    startKey: formatDateInput(start),
    endKey: formatDateInput(end),
    todayKey: formatDateInput(new Date()),
    weeks,
    dateKeys,
  };
}

function collectCalendarDayEntries(orders, startKey, endKey) {
  const map = new Map();
  const startDate = parseDateKey(startKey);
  const endDate = parseDateKey(endKey);
  if (!startDate || !endDate) return map;

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const key = formatDateInput(date);
    map.set(
      key,
      orders.flatMap((order) => getCalendarEntriesForOrder(order, key)),
    );
  }
  return map;
}

function buildTimelineWeekSegments(orders, weeks, viewStartKey, viewEndKey) {
  const segmentsByWeek = weeks.map(() => []);
  orders.forEach((order) => {
    appendTimelineSegmentsForOrder(segmentsByWeek, order, weeks, viewStartKey, viewEndKey);
  });
  assignTimelineSegmentLanes(segmentsByWeek);

  return segmentsByWeek;
}

function appendTimelineSegmentsForOrder(segmentsByWeek, order, weeks, viewStartKey, viewEndKey, extra = {}) {
  const displayRange = getTimelineDisplayRange(order);
  const dragStartKey = normalizeDateKey(order.startDate || order.dueDate);
  const dragDueKey = normalizeDateKey(order.dueDate);
  if (!displayRange || !dragStartKey || !dragDueKey) return;

  const visibleStart = maxDateKey(displayRange.startKey, viewStartKey);
  const visibleEnd = minDateKey(displayRange.endKey, viewEndKey);
  if (!visibleStart || !visibleEnd || visibleStart > visibleEnd) return;

  weeks.forEach((weekDates, weekIndex) => {
    const weekStartKey = weekDates[0];
    const weekEndKey = weekDates[6];
    const segmentStart = maxDateKey(visibleStart, weekStartKey);
    const segmentEnd = minDateKey(visibleEnd, weekEndKey);
    if (!segmentStart || !segmentEnd || segmentStart > segmentEnd) return;
    const startCol = daysBetweenDateKeys(weekStartKey, segmentStart);
    const endCol = daysBetweenDateKeys(weekStartKey, segmentEnd);
    if (!Number.isInteger(startCol) || !Number.isInteger(endCol)) return;

    segmentsByWeek[weekIndex].push({
      order,
      startCol: Math.max(0, Math.min(6, startCol)),
      endCol: Math.max(0, Math.min(6, endCol)),
      segmentStartKey: segmentStart,
      segmentEndKey: segmentEnd,
      dragStartKey,
      dragDueKey,
      lane: 0,
      ...extra,
    });
  });
}

function appendPendingTimelineDraftSegments(segmentsByWeek, weeks, viewStartKey, viewEndKey) {
  if (!state.pendingTimelineDraft) return;
  appendTimelineSegmentsForOrder(
    segmentsByWeek,
    state.pendingTimelineDraft,
    weeks,
    viewStartKey,
    viewEndKey,
    { isDraft: true },
  );
}

function assignTimelineSegmentLanes(segmentsByWeek) {
  segmentsByWeek.forEach((segments) => {
    segments.sort((left, right) => {
      if (left.startCol !== right.startCol) return left.startCol - right.startCol;
      if (left.endCol !== right.endCol) return right.endCol - left.endCol;
      if (Boolean(left.isDraft) !== Boolean(right.isDraft)) return left.isDraft ? -1 : 1;
      return String(left.order.projectName || "").localeCompare(String(right.order.projectName || ""));
    });
    const laneEndCols = [];
    segments.forEach((segment) => {
      let lane = laneEndCols.findIndex((endCol) => segment.startCol > endCol);
      if (lane === -1) {
        lane = laneEndCols.length;
        laneEndCols.push(segment.endCol);
      } else {
        laneEndCols[lane] = segment.endCol;
      }
      segment.lane = lane;
    });
  });
}

function renderTimelineBar(segment, canEditOrders) {
  const order = segment.order;
  const isDraft = Boolean(segment.isDraft);
  const resolvedColor = getOrderCalendarColor(order);
  const palette = getTimelineBarPalette(resolvedColor);
  const isCustomColor = !isDraft && Boolean(normalizeCalendarColor(order.calendarColor));
  const colorControlEnabled = !isDraft && canEditOrders && !state.busy;
  const draggable = !isDraft && colorControlEnabled && !isClosed(order);
  const closed = !isDraft && isClosed(order);
  const span = Math.max(1, segment.endCol - segment.startCol + 1);
  const left = (segment.startCol / 7) * 100;
  const width = (span / 7) * 100;
  const top = 6 + segment.lane * 30;
  const label = isDraft ? buildTimelineDraftBarLabel(order) : buildTimelineBarLabel(order, span);
  const action = isDraft ? "focusTimelineDraft" : "jumpOrder";

  return `<article
      class="timeline-bar${draggable ? " is-draggable" : " is-readonly"}${closed ? " is-closed" : ""}${isDraft ? " is-draft" : ""}"
      data-timeline-bar
      data-timeline-order-id="${escapeHtml(order.id)}"
      data-timeline-drag-start="${escapeHtml(segment.dragStartKey)}"
      data-timeline-drag-due="${escapeHtml(segment.dragDueKey)}"
      data-timeline-draggable="${draggable ? "true" : "false"}"
      style="left:${left}%;width:${width}%;top:${top}px;--timeline-bar-bg:${palette.background};--timeline-bar-border:${palette.border};--timeline-bar-text:${palette.text};"
      title="${escapeHtml(label)}"
    >
      ${draggable ? '<span class="timeline-bar-handle start" data-drag-handle="start" aria-hidden="true"></span>' : ""}
      <button type="button" class="timeline-bar-main" data-action="${action}"${isDraft ? "" : ` data-id="${escapeHtml(order.id)}"`}>
        <span class="timeline-bar-title">${escapeHtml(label)}</span>
      </button>
      ${
        isDraft
          ? ""
          : `<div class="timeline-bar-tools">
              <label class="timeline-bar-color" title="修改条颜色">
                <input
                  type="color"
                  data-action="setTimelineColor"
                  data-id="${escapeHtml(order.id)}"
                  value="${escapeHtml(resolvedColor)}"
                  ${colorControlEnabled ? "" : "disabled"}
                  aria-label="设置 ${escapeHtml(order.projectName || "稿件")} 的条颜色"
                />
              </label>
              ${
                isCustomColor
                  ? `<button
                      type="button"
                      class="timeline-bar-reset"
                      data-action="resetTimelineColor"
                      data-id="${escapeHtml(order.id)}"
                      ${colorControlEnabled ? "" : "disabled"}
                    >默认</button>`
                  : ""
              }
            </div>`
      }
      ${draggable ? '<span class="timeline-bar-handle end" data-drag-handle="end" aria-hidden="true"></span>' : ""}
    </article>`;
}

function getTimelineDisplayRange(order) {
  const startKey = normalizeDateKey(order.startDate || order.dueDate);
  const endKey = normalizeDateKey(order.completedDate || order.dueDate);
  if (!startKey || !endKey) return null;
  if (startKey <= endKey) {
    return { startKey, endKey };
  }
  return { startKey: endKey, endKey: startKey };
}

function getTimelineStatusShortLabel(order) {
  const rawStatus = String(order.status || "").trim();
  if (!rawStatus) return "未知状态";
  const shortStatusMap = {
    待: "待沟通",
    排: "排期中",
    进: "进行中",
    交: "待交付",
    完: "已完成",
    付: "已付款",
    处: "已处理",
  };
  return shortStatusMap[rawStatus] || rawStatus;
}

function buildTimelineBarLabel(order, span = 1) {
  const status = getTimelineStatusShortLabel(order);
  const project = String(order.projectName || "未命名").trim() || "未命名";
  if (span >= 5) return `${project}（${status}）`;
  if (span >= 3) return `${project} · ${status}`;
  return project;
}

function buildTimelineDraftBarLabel(order) {
  const project = String(order.projectName || "").trim();
  return project && project !== "待保存稿件" ? `待保存 · ${project}` : "待保存稿件";
}

function canEditOrdersNow() {
  return state.mode === "local" || Boolean(state.user);
}

function getOrderCalendarColor(order) {
  const custom = normalizeCalendarColor(order?.calendarColor);
  if (custom) return custom;
  return getSourceColor(order?.source);
}

function getTimelineBarPalette(color) {
  const normalized = normalizeHexColor(color, "#9ba6ab");
  const rgb = hexToRgb(normalized);
  return {
    background: rgbToRgba(rgb, 0.26),
    border: rgbToRgba(rgb, 0.62),
    text: "#1f242b",
  };
}

function highlightTimelineBar(barEl) {
  if (!barEl) return;
  const prev = elements.calendarTimeline?.querySelector(".timeline-bar.is-selected");
  if (prev && prev !== barEl) prev.classList.remove("is-selected");
  barEl.classList.add("is-selected");
}

function clearTimelineBarHighlight() {
  elements.calendarTimeline?.querySelector(".timeline-bar.is-selected")?.classList.remove("is-selected");
}

function syncTimelineDraftCompletionUi() {
  const isClosedStatus = CLOSED_STATUSES.has(elements.status?.value);
  if (isClosedStatus && elements.completedDate && !elements.completedDate.value) {
    elements.completedDate.value = elements.dueDate?.value || formatDateInput(new Date());
  }
  if (elements.timelineDraftCompletedDateRow) {
    elements.timelineDraftCompletedDateRow.classList.toggle("is-hidden", !isClosedStatus);
  }
  if (elements.timelineDraftCompletedDateInput && elements.timelineDraftCompletedDateInput !== document.activeElement) {
    elements.timelineDraftCompletedDateInput.value = isClosedStatus ? elements.completedDate?.value || "" : "";
  }
}

function openPendingTimelineDraftPopover(barEl) {
  if (!state.pendingTimelineDraft || !elements.timelineDraftPopover) return;
  highlightTimelineBar(barEl);
  state.pendingTimelineDraftPopoverOpen = true;
  renderPendingTimelineDraftPopover();
  window.requestAnimationFrame(() => {
    const nextFocus = !elements.projectName?.value.trim()
      ? elements.timelineDraftProjectInput
      : !elements.clientName?.value.trim()
        ? elements.timelineDraftClientInput
        : !elements.businessType?.value.trim()
          ? elements.timelineDraftBusinessInput
          : elements.timelineDraftAmountInput;
    nextFocus?.focus?.();
  });
}

function closePendingTimelineDraftPopover() {
  state.pendingTimelineDraftPopoverOpen = false;
  if (elements.timelineDraftPopover) {
    elements.timelineDraftPopover.hidden = true;
    elements.timelineDraftPopover.style.removeProperty("visibility");
    elements.timelineDraftPopover.style.removeProperty("left");
    elements.timelineDraftPopover.style.removeProperty("top");
  }
  clearTimelineBarHighlight();
}

function renderPendingTimelineDraftPopover() {
  if (!elements.timelineDraftPopover) return;
  const shouldShow =
    Boolean(state.pendingTimelineDraftPopoverOpen && state.pendingTimelineDraft) &&
    state.viewMode === VIEW_MODE_SCHEDULE &&
    normalizeCalendarDisplayMode(state.calendarDisplayMode, CALENDAR_DISPLAY_TAGS) === CALENDAR_DISPLAY_TIMELINE;
  if (!shouldShow) {
    elements.timelineDraftPopover.hidden = true;
    return;
  }
  highlightTimelineBar(getPendingTimelineDraftBarElement());

  const projectName = elements.projectName?.value.trim() || "";
  const clientName = elements.clientName?.value.trim() || "";
  const businessType = elements.businessType?.value || "";
  const source = elements.source?.value || SOURCES[0];
  const priority = elements.priority?.value || PRIORITIES[0];
  const status = elements.status?.value || STATUSES[0];
  const amount = elements.amount?.value || "";
  const draftColor = getPendingTimelineDraftColor();
  const draftOrder = state.pendingTimelineDraft;
  if (elements.timelineDraftRangeSummary && draftOrder) {
    elements.timelineDraftRangeSummary.textContent = `${formatCalendarDialogDate(draftOrder.startDate)} - ${formatCalendarDialogDate(draftOrder.dueDate)}`;
  }
  if (elements.timelineDraftProjectInput && elements.timelineDraftProjectInput !== document.activeElement) {
    elements.timelineDraftProjectInput.value = projectName;
  }
  if (elements.timelineDraftClientInput && elements.timelineDraftClientInput !== document.activeElement) {
    elements.timelineDraftClientInput.value = clientName;
  }
  if (elements.timelineDraftBusinessInput && elements.timelineDraftBusinessInput !== document.activeElement) {
    elements.timelineDraftBusinessInput.value = businessType;
  }
  if (elements.timelineDraftSourceInput && elements.timelineDraftSourceInput !== document.activeElement) {
    elements.timelineDraftSourceInput.value = source;
  }
  if (elements.timelineDraftPriorityInput && elements.timelineDraftPriorityInput !== document.activeElement) {
    elements.timelineDraftPriorityInput.value = priority;
  }
  if (elements.timelineDraftStatusInput && elements.timelineDraftStatusInput !== document.activeElement) {
    elements.timelineDraftStatusInput.value = status;
  }
  if (elements.timelineDraftAmountInput && elements.timelineDraftAmountInput !== document.activeElement) {
    elements.timelineDraftAmountInput.value = amount;
  }
  if (elements.timelineDraftColorInput && elements.timelineDraftColorInput !== document.activeElement) {
    elements.timelineDraftColorInput.value = draftColor;
  }
  syncTimelineDraftCompletionUi();
  if (elements.timelineDraftSave) {
    elements.timelineDraftSave.disabled = state.busy;
  }
  if (elements.timelineDraftOpenForm) {
    elements.timelineDraftOpenForm.disabled = state.busy;
  }
  if (elements.timelineDraftPopoverClose) {
    elements.timelineDraftPopoverClose.disabled = state.busy;
  }

  elements.timelineDraftPopover.hidden = false;
  elements.timelineDraftPopover.style.removeProperty("visibility");
  elements.timelineDraftPopover.style.removeProperty("left");
  elements.timelineDraftPopover.style.removeProperty("top");
}

function beginTimelineDrag(event) {
  if (state.calendarDisplayMode !== CALENDAR_DISPLAY_TIMELINE) return;
  if (state.calendarCreateMode) return;
  if (!canEditOrdersNow() || state.busy) return;
  if (event.button !== 0) return;
  if (event.target.closest("[data-action='setTimelineColor']")) return;
  if (event.target.closest("[data-action='resetTimelineColor']")) return;
  if (event.target.closest(".timeline-bar-tools")) return;

  const bar = event.target.closest("[data-timeline-bar]");
  if (!bar || bar.dataset.timelineDraggable !== "true") return;
  const track = bar.closest("[data-week-track]");
  if (!track) return;

  const orderId = String(bar.dataset.timelineOrderId || "");
  const baseStart = normalizeDateKey(bar.dataset.timelineDragStart);
  const baseDue = normalizeDateKey(bar.dataset.timelineDragDue);
  if (!orderId || !baseStart || !baseDue) return;

  const trackRect = track.getBoundingClientRect();
  if (!trackRect.width) return;
  const barRect = bar.getBoundingClientRect();
  const colWidth = trackRect.width / 7;

  let handle = "move";
  const handleEl = event.target.closest("[data-drag-handle]");
  if (handleEl) {
    const barWidth = barRect.width;
    if (barWidth > colWidth * 1.4) {
      handle = handleEl.dataset.dragHandle || "move";
    }
  }

  timelineDragSession = {
    pointerId: event.pointerId,
    bar,
    track,
    handle,
    orderId,
    startX: event.clientX,
    startTime: Date.now(),
    dayDelta: 0,
    moved: false,
    colWidth,
    initialLeft: barRect.left - trackRect.left,
    initialWidth: barRect.width,
    baseStart,
    baseDue,
  };
}

function beginTimelineCreateRangeDrag(event) {
  if (state.calendarDisplayMode !== CALENDAR_DISPLAY_TIMELINE) return;
  if (!state.calendarCreateMode || !canEditOrdersNow() || state.busy) return;
  if (event.button !== 0) return;
  if (event.target.closest("[data-timeline-bar]")) return;
  if (event.target.closest("[data-action='openCalendarDay']")) return;
  if (event.target.closest("[data-action='selectCalendarDate']")) return;

  const track = event.target.closest("[data-week-track]");
  if (!track) return;
  const hit = getTimelineTrackDateHit(track, event.clientX);
  if (!hit) return;

  timelineCreateRangeSession = {
    pointerId: event.pointerId,
    track,
    startX: event.clientX,
    startTime: Date.now(),
    startCol: hit.col,
    endCol: hit.col,
    startDate: hit.dateKey,
    endDate: hit.dateKey,
    moved: false,
  };
  clearTimelineCreateRangePreview(track);
  event.preventDefault();
}

function getTimelineTrackDateHit(track, clientX) {
  const weekStartKey = normalizeDateKey(track?.dataset?.weekStart);
  const rect = track?.getBoundingClientRect?.();
  if (!weekStartKey || !rect?.width) return null;
  const relativeX = Math.max(0, Math.min(rect.width - 1, clientX - rect.left));
  const col = Math.max(0, Math.min(6, Math.floor(relativeX / (rect.width / 7))));
  return {
    col,
    dateKey: addDaysToDateKey(weekStartKey, col),
  };
}

function handleTimelineCreateRangeMove(event) {
  if (!timelineCreateRangeSession || event.pointerId !== timelineCreateRangeSession.pointerId) return;
  const session = timelineCreateRangeSession;
  const hit = getTimelineTrackDateHit(session.track, event.clientX);
  if (!hit) return;
  session.endCol = hit.col;
  session.endDate = hit.dateKey;

  if (!session.moved) {
    const elapsed = Date.now() - session.startTime;
    const deltaPx = event.clientX - session.startX;
    if (Math.abs(deltaPx) > TIMELINE_DRAG_PX_THRESHOLD && elapsed >= TIMELINE_DRAG_TIME_THRESHOLD_MS) {
      session.moved = true;
      session.track.classList.add("is-create-dragging");
      session.track.setPointerCapture?.(session.pointerId);
    } else {
      return;
    }
  }
  renderTimelineCreateRangePreview(session);
}

function renderTimelineCreateRangePreview(session) {
  const track = session?.track;
  if (!track) return;
  const preview = ensureTimelineCreateRangePreview(track);
  const startCol = Math.min(session.startCol, session.endCol);
  const endCol = Math.max(session.startCol, session.endCol);
  preview.hidden = false;
  preview.style.left = `${(startCol / 7) * 100}%`;
  preview.style.width = `${((endCol - startCol + 1) / 7) * 100}%`;
}

function ensureTimelineCreateRangePreview(track) {
  let preview = track.querySelector(".timeline-create-preview");
  if (!preview) {
    preview = document.createElement("div");
    preview.className = "timeline-create-preview";
    preview.hidden = true;
    track.append(preview);
  }
  return preview;
}

function clearTimelineCreateRangePreview(track = null) {
  const targets = track ? [track] : Array.from(document.querySelectorAll("[data-week-track]"));
  targets.forEach((node) => {
    node.classList.remove("is-create-dragging");
    const preview = node.querySelector(".timeline-create-preview");
    if (preview) preview.remove();
  });
}

function handleTimelineCreateRangeEnd(event) {
  if (!timelineCreateRangeSession || event.pointerId !== timelineCreateRangeSession.pointerId) return;
  const session = timelineCreateRangeSession;
  timelineCreateRangeSession = null;
  session.track.classList.remove("is-create-dragging");
  clearTimelineCreateRangePreview(session.track);
  session.track.releasePointerCapture?.(event.pointerId);

  if (!session.moved) {
    handleCalendarCreateDatePick(session.startDate);
    return;
  }

  timelineDragSuppressClickUntil = Date.now() + TIMELINE_DRAG_CLICK_SUPPRESS_MS;
  const nextRange = getOrderedDateRange(session.startDate, session.endDate);
  if (!nextRange.startDate || !nextRange.dueDate) return;
  state.selectedCalendarDate = nextRange.dueDate;
  prefillFormFromCalendarRange(nextRange.startDate, nextRange.dueDate);
}

function handleTimelineDragMove(event) {
  if (!timelineDragSession || event.pointerId !== timelineDragSession.pointerId) return;
  const session = timelineDragSession;
  const deltaPx = event.clientX - session.startX;
  const deltaDays = Math.round(deltaPx / session.colWidth);
  session.dayDelta = deltaDays;

  if (!session.moved) {
    const elapsed = Date.now() - session.startTime;
    if (Math.abs(deltaPx) > TIMELINE_DRAG_PX_THRESHOLD && elapsed >= TIMELINE_DRAG_TIME_THRESHOLD_MS) {
      session.moved = true;
      session.bar.classList.add("is-dragging");
      session.bar.setPointerCapture?.(session.pointerId);
    } else {
      return;
    }
  }
  renderTimelineDragPreview(session);
}

function renderTimelineDragPreview(session) {
  const bar = session.bar;
  if (!bar) return;
  const trackWidth = session.colWidth * 7;
  const deltaPx = session.dayDelta * session.colWidth;
  if (session.handle === "move") {
    const minOffset = -session.initialLeft;
    const maxOffset = trackWidth - session.initialLeft - session.initialWidth;
    const clamped = Math.max(minOffset, Math.min(maxOffset, deltaPx));
    bar.style.transform = `translateX(${clamped}px)`;
    return;
  }
  if (session.handle === "start") {
    const maxWidth = session.initialWidth + session.initialLeft;
    const nextWidth = Math.max(session.colWidth, Math.min(session.initialWidth - deltaPx, maxWidth));
    const leftPx = session.initialWidth - nextWidth;
    bar.style.transform = `translateX(${leftPx}px)`;
    bar.style.width = `${nextWidth}px`;
    return;
  }
  const maxGrow = trackWidth - session.initialLeft - session.initialWidth;
  const nextWidth = Math.max(session.colWidth, Math.min(session.initialWidth + deltaPx, session.initialWidth + maxGrow));
  bar.style.width = `${nextWidth}px`;
}

function handleTimelineDragEnd(event) {
  if (!timelineDragSession || event.pointerId !== timelineDragSession.pointerId) return;
  const session = timelineDragSession;
  timelineDragSession = null;

  if (session.bar) {
    session.bar.classList.remove("is-dragging");
    session.bar.style.transform = "";
    session.bar.style.width = "";
    session.bar.releasePointerCapture?.(event.pointerId);
  }

  if (!session.moved) return;

  timelineDragSuppressClickUntil = Date.now() + TIMELINE_DRAG_CLICK_SUPPRESS_MS;

  if (session.dayDelta === 0) return;
  const nextRange = calculateTimelineDragRange(
    session.baseStart,
    session.baseDue,
    session.handle,
    session.dayDelta,
  );
  if (!nextRange) return;
  if (nextRange.startDate === session.baseStart && nextRange.dueDate === session.baseDue) return;
  void persistTimelineDateRange(session.orderId, nextRange.startDate, nextRange.dueDate);
}

function calculateTimelineDragRange(baseStart, baseDue, handle, deltaDays) {
  const safeStart = normalizeDateKey(baseStart);
  const safeDue = normalizeDateKey(baseDue);
  const delta = Number.isInteger(deltaDays) ? deltaDays : 0;
  if (!safeStart || !safeDue) return null;

  let nextStart = safeStart;
  let nextDue = safeDue;
  if (handle === "move") {
    nextStart = addDaysToDateKey(safeStart, delta);
    nextDue = addDaysToDateKey(safeDue, delta);
  } else if (handle === "start") {
    nextStart = addDaysToDateKey(safeStart, delta);
    if (nextStart > nextDue) nextStart = nextDue;
  } else {
    nextDue = addDaysToDateKey(safeDue, delta);
    if (nextDue < nextStart) nextDue = nextStart;
  }
  return { startDate: nextStart, dueDate: nextDue };
}

async function persistTimelineDateRange(orderId, startDate, dueDate) {
  if (!canEditOrdersNow() || state.busy) return;
  const target = state.orders.find((item) => item.id === orderId);
  if (!target || isClosed(target)) return;
  const safeStart = normalizeDateKey(startDate);
  const safeDue = normalizeDateKey(dueDate);
  if (!safeStart || !safeDue || safeStart > safeDue) return;

  const nextOrder = normalizeOrder({
    ...target,
    startDate: safeStart,
    dueDate: safeDue,
  });
  const nextOrders = state.orders.map((item) => (item.id === orderId ? nextOrder : item));
  setBusy(true);
  try {
    await persistOrders(nextOrders, [orderId]);
    if (state.editingId === orderId) {
      fillFormFromOrder(nextOrder, elements.formTitle.textContent || "编辑稿件", true, false);
    }
    updateAuthUi(`排期已更新：动工 ${safeStart}，截稿 ${safeDue}。`);
  } catch (error) {
    updateAuthUi(mapAuthError(error));
  } finally {
    setBusy(false);
    render();
  }
}

async function persistTimelineColor(orderId, color) {
  if (!canEditOrdersNow() || state.busy) return;
  const target = state.orders.find((item) => item.id === orderId);
  if (!target) return;
  const nextColor = normalizeCalendarColor(color);
  if (normalizeCalendarColor(target.calendarColor) === nextColor) return;

  const nextOrder = normalizeOrder({
    ...target,
    calendarColor: nextColor,
  });
  const nextOrders = state.orders.map((item) => (item.id === orderId ? nextOrder : item));
  setBusy(true);
  try {
    await persistOrders(nextOrders, [orderId]);
    if (state.editingId === orderId) {
      fillFormFromOrder(nextOrder, elements.formTitle.textContent || "编辑稿件", true, false);
    }
    updateAuthUi(nextColor ? "排期条颜色已更新。" : "排期条颜色已恢复为来源默认色。");
  } catch (error) {
    updateAuthUi(mapAuthError(error));
  } finally {
    setBusy(false);
    render();
  }
}

function getCalendarEntriesForOrder(order, currentDate) {
  const done = isCalendarDone(order);
  const isStart = Boolean(order.startDate) && order.startDate === currentDate;
  const isDue = String(order.dueDate || "") === currentDate;
  const isCompletedDay = Boolean(order.completedDate) && order.completedDate === currentDate;

  const entries = [];
  if (isStart || isDue) {
    const type = isStart && isDue ? "both" : isStart ? "start" : "due";
    const prefix = type === "both" ? "动工/截稿" : type === "start" ? "动工" : "截稿";
    const markDone = done && (type === "due" || type === "both");
    entries.push({
      order,
      type,
      done: markDone,
      label: `${prefix}${markDone ? " ✓" : ""} · ${order.projectName}`,
      shortLabel: getCalendarEntryShortLabel(type, markDone, order.projectName),
      compactTypeLabel: getCalendarTypeCompactLabel(type, markDone),
      compactProjectLabel: getCalendarProjectCompactLabel(order.projectName),
      typeLabel: getCalendarTypeShortLabel(type, markDone),
    });
  }

  if (done && isCompletedDay && order.completedDate !== order.dueDate) {
    entries.push({
      order,
      type: "done",
      done: true,
      label: `完成 ✓ · ${order.projectName}`,
      shortLabel: getCalendarEntryShortLabel("done", true, order.projectName),
      compactTypeLabel: getCalendarTypeCompactLabel("done", true),
      compactProjectLabel: getCalendarProjectCompactLabel(order.projectName),
      typeLabel: getCalendarTypeShortLabel("done", true),
    });
  }

  return entries;
}

function getCalendarEntryShortLabel(type, done = false, projectName = "") {
  const typeTag = getCalendarTypeTinyLabel(type, done);
  const projectTag = getCalendarProjectTinyLabel(projectName);
  return `${typeTag}·${projectTag}`;
}

function getCalendarTypeTinyLabel(type, done = false) {
  if (type === "both") return done ? "动截✓" : "动截";
  if (type === "start") return "动";
  if (type === "due") return done ? "截✓" : "截";
  return "完✓";
}

function getCalendarTypeCompactLabel(type, done = false) {
  if (type === "both") return done ? "动/截✓" : "动/截";
  if (type === "start") return "动工";
  if (type === "due") return done ? "截稿✓" : "截稿";
  return "完成✓";
}

function getCalendarProjectTinyLabel(projectName = "") {
  const normalized = String(projectName || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "未命名";
  const chars = Array.from(normalized);
  const hasCjk = /[\u3400-\u9fff]/.test(normalized);
  const limit = hasCjk ? 4 : 8;
  if (chars.length <= limit) return normalized;
  return `${chars.slice(0, limit).join("")}…`;
}

function getCalendarProjectCompactLabel(projectName = "") {
  const normalized = String(projectName || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "未命名";
  const chars = Array.from(normalized);
  const hasCjk = /[\u3400-\u9fff]/.test(normalized);
  const limit = hasCjk ? 7 : 12;
  if (chars.length <= limit) return normalized;
  return `${chars.slice(0, limit).join("")}…`;
}

function getCalendarTypeShortLabel(type, done = false) {
  const base = type === "both" ? "动工/截稿" : type === "start" ? "动工" : type === "due" ? "截稿" : "完成";
  return done ? `${base} ✓` : base;
}

function shouldUseCompactCalendarLabel() {
  const root = document.documentElement;
  if (root?.classList.contains("mobile-desktop-mode")) return true;
  return window.matchMedia?.("(max-width: 760px)").matches ?? false;
}

function openCalendarDayDialog(dateKey, entries) {
  if (!elements.calendarDayDialog || !elements.calendarDayDialogTitle || !elements.calendarDayDialogList) return;
  const safeDate = String(dateKey || "").trim();
  if (!safeDate) return;

  closeCalendarContextMenu();
  const dayEntries = Array.isArray(entries) ? entries.filter(Boolean) : [];
  state.calendarDayDialogDate = safeDate;
  elements.calendarDayDialogTitle.textContent = `${formatCalendarDialogDate(safeDate)} · 当天列表`;
  elements.calendarDayDialogSummary.textContent = dayEntries.length
    ? `当天共 ${dayEntries.length} 条动工/截稿/完成记录。`
    : "当天没有动工/截稿/完成记录。";
  elements.calendarDayDialogList.innerHTML = dayEntries.length
    ? dayEntries.map((entry) => renderCalendarDayDialogItem(entry)).join("")
    : '<p class="empty-state">这一天没有可查看的稿件记录。</p>';

  if (!elements.calendarDayDialog.open) {
    elements.calendarDayDialog.showModal();
  }
}

function renderCalendarDayDialogItem(entry) {
  const order = entry.order;
  const detailLine = [
    `动工 ${formatScheduleDate(order.startDate)}`,
    `截稿 ${formatScheduleDate(order.dueDate)}`,
    order.completedDate ? `完成 ${formatScheduleDate(order.completedDate)}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return `<article class="calendar-day-entry">
    <div class="calendar-day-entry-head">
      <div class="chip-group">
        <span class="chip calendar-day-type ${escapeHtml(entry.type)}${entry.done ? " is-done" : ""}">${escapeHtml(
          entry.typeLabel || getCalendarTypeShortLabel(entry.type, entry.done),
        )}</span>
        ${renderStaticStatusChip(order.status)}
      </div>
      <button type="button" class="ghost-button small-button" data-calendar-day-jump="${escapeHtml(
        order.id,
      )}">跳到稿件</button>
    </div>
    <p class="calendar-day-entry-title${entry.done ? " is-done" : ""}">${escapeHtml(order.projectName)}</p>
    <p class="legend-row">客户：${escapeHtml(order.clientName || "未填写")} · 业务：${escapeHtml(
      order.businessType || "未分类",
    )}</p>
    <p class="legend-row">${escapeHtml(detailLine)}</p>
  </article>`;
}

function closeCalendarDayDialog() {
  state.calendarDayDialogDate = "";
  if (elements.calendarDayDialogSummary) {
    elements.calendarDayDialogSummary.textContent = "";
  }
  if (elements.calendarDayDialogList) {
    elements.calendarDayDialogList.innerHTML = "";
  }
  if (elements.calendarDayDialog?.open) {
    elements.calendarDayDialog.close();
  }
}

function formatCalendarDialogDate(dateKey) {
  const [year, month, day] = String(dateKey || "").split("-").map(Number);
  if (!year || !month || !day) return "当天";
  return `${year}年${month}月${day}日`;
}

function isCalendarDone(order) {
  return isClosed(order);
}

function jumpToOrder(id) {
  const order = state.orders.find((item) => item.id === id);
  if (!order) return;

  if (state.viewMode !== VIEW_MODE_SCHEDULE) {
    setViewMode(VIEW_MODE_SCHEDULE);
  }

  let row = document.querySelector(`[data-order-row-id="${CSS.escape(id)}"]`);
  if (!row) {
    state.listFilters.active.business = "all";
    state.listFilters.active.query = "";
    state.listFilters.completed.business = "all";
    state.listFilters.completed.query = "";
    render();
    row = document.querySelector(`[data-order-row-id="${CSS.escape(id)}"]`);
  }
  if (!row) {
    updateAuthUi(`已找到「${order.projectName}」，但当前筛选下不可见。`);
    return;
  }

  row.scrollIntoView({ behavior: "smooth", block: "center" });
  flashOrderRow(row);
  updateAuthUi(`已定位到「${order.projectName}」的具体信息。`);
}

function flashOrderRow(row) {
  if (highlightedOrderRow && highlightedOrderRow !== row) {
    highlightedOrderRow.classList.remove("is-row-highlight");
  }
  highlightedOrderRow = row;
  row.classList.add("is-row-highlight");
  window.clearTimeout(row._highlightTimeoutId);
  row._highlightTimeoutId = window.setTimeout(() => {
    row.classList.remove("is-row-highlight");
    if (highlightedOrderRow === row) {
      highlightedOrderRow = null;
    }
  }, 1800);
}

function renderBatchActions(orders) {
  const selectedIds = getSelectedVisibleIds(orders);
  const selectedCount = selectedIds.length;
  const canEditOrders = state.mode === "local" || Boolean(state.user);
  const selectedOrders = orders.filter((order) => selectedIds.includes(order.id));
  const hasAbnormalSelection = selectedOrders.some(isAbnormal);
  const hasNormalSelection = selectedOrders.some((order) => !isAbnormal(order));

  elements.batchActions.classList.toggle("is-hidden", selectedCount === 0);
  elements.batchSummary.textContent =
    selectedCount > 0 ? `已选 ${selectedCount} 单，可以直接批量改状态。` : "";
  elements.batchMarkDone.disabled =
    !canEditOrders || state.busy || selectedCount === 0 || hasAbnormalSelection;
  elements.batchMarkPaid.disabled =
    !canEditOrders || state.busy || selectedCount === 0 || hasAbnormalSelection;
  elements.batchMarkHandled.disabled =
    !canEditOrders || state.busy || selectedCount === 0 || hasNormalSelection;
  elements.batchExceptionType.disabled = !canEditOrders || state.busy || selectedCount === 0;
  elements.applyBatchException.disabled = !canEditOrders || state.busy || selectedCount === 0;
  elements.clearSelection.disabled = state.busy || selectedCount === 0;
}

function renderTable(
  orders,
  {
    body,
    summary,
    emptyMessage,
    selectable = false,
    showBatchSummary = false,
    summaryOrders = orders,
    incomeScopedByDueMonth = false,
  } = {},
) {
  if (!body || !summary) return;

  body.innerHTML = "";
  const grossAmount = sumGrossAmounts(summaryOrders);
  const effectiveAmount = sumEffectiveAmounts(summaryOrders);
  const effectiveReceived = sumEffectiveReceivedAmounts(summaryOrders);
  const netAmount = sumAdjustedNetAmounts(summaryOrders);
  const totalFee = sumAdjustedFeeAmounts(summaryOrders);
  const totalRefund = sumRefundAmounts(summaryOrders);
  const workHoursSummary = summarizeWorkHours(summaryOrders);
  const scopePrefix = incomeScopedByDueMonth ? "（收入按完成月统计）" : "";
  summary.textContent =
    totalRefund > 0
      ? `共 ${orders.length} 单${scopePrefix}，结算收入 ${formatCnyMoney(effectiveAmount)}（退款 ${formatCnyMoney(totalRefund)}，实得 ${formatCnyMoney(netAmount)}），已收净额 ${formatCnyMoney(effectiveReceived)}`
      : totalFee > 0
        ? `共 ${orders.length} 单${scopePrefix}，收入 ${formatCnyMoney(grossAmount)}（平台费 / 加价 ${formatCnyMoney(totalFee)}，实得 ${formatCnyMoney(netAmount)}），已收 ${formatCnyMoney(effectiveReceived)}`
        : `共 ${orders.length} 单${scopePrefix}，收入 ${formatCnyMoney(grossAmount)}，已收 ${formatCnyMoney(effectiveReceived)}`;
  if (showBatchSummary && workHoursSummary.count > 0) {
    summary.textContent +=
      workHoursSummary.averageRate != null
        ? `；已记录工时 ${formatHours(workHoursSummary.totalHours)} 小时（${workHoursSummary.count} 单，按已完稿统计），参考时薪 ${formatCnyMoney(workHoursSummary.averageRate)}/小时`
        : `；已记录工时 ${formatHours(workHoursSummary.totalHours)} 小时（${workHoursSummary.count} 单，按已完稿统计）`;
  }

  if (!orders.length) {
    body.innerHTML = `<tr><td colspan="${selectable ? 11 : 10}" class="empty-state">${emptyMessage}</td></tr>`;
    const selectAllEmpty = document.querySelector("#select-all-orders");
    if (selectable && selectAllEmpty) {
      selectAllEmpty.checked = false;
      selectAllEmpty.indeterminate = false;
      selectAllEmpty.disabled = true;
    }
    return;
  }

  const selectAll = document.querySelector("#select-all-orders");
  if (selectable && selectAll) {
    const selectedIds = getSelectedVisibleIds(orders);
    selectAll.disabled = state.busy;
    selectAll.checked = selectedIds.length > 0 && selectedIds.length === orders.length;
    selectAll.indeterminate = selectedIds.length > 0 && selectedIds.length < orders.length;
    selectAll.onchange = (event) => {
      toggleSelectAllVisible(orders, event.currentTarget.checked);
    };
  }

  orders.forEach((order) => {
    const selected = state.selectedOrderIds.has(order.id);
    const row = document.createElement("tr");
    row.dataset.orderRowId = order.id;
    row.innerHTML = `
      ${
        selectable
          ? `<td class="checkbox-col">
        <input type="checkbox" data-action="select" data-id="${escapeHtml(order.id)}" ${selected ? "checked" : ""} ${state.busy ? "disabled" : ""} aria-label="选择 ${escapeHtml(order.projectName)}" />
      </td>`
          : ""
      }
      <td class="schedule-col">${renderScheduleContent(order)}</td>
      <td>${escapeHtml(order.clientName)}</td>
      <td>
        <strong>${escapeHtml(order.projectName)}</strong>
        ${order.notes ? `<div class="legend-row">${escapeHtml(order.notes)}</div>` : ""}
      </td>
      <td>
        <div class="chip-group">
          <span class="chip business">${escapeHtml(order.businessType)}</span>
          ${renderUsageChip(order)}
        </div>
      </td>
      <td><span class="chip source">${escapeHtml(getSourceLabel(order.source))}</span></td>
      <td><span class="chip priority">${escapeHtml(order.priority)}</span></td>
      <td>${renderAmountContent(order)}</td>
      <td>${renderPaymentContent(order)}</td>
      <td>
        <div class="chip-group">
          ${renderStatusChip(order)}
          ${order.productionStage ? renderProductionStageChip(order.productionStage, order) : ""}
          ${isAbnormal(order) ? renderExceptionChip(order) : ""}
          ${isOverdue(order) ? '<span class="chip overdue">逾期</span>' : ""}
        </div>
        ${order.exceptionResolution ? `<div class="legend-row">${escapeHtml(order.exceptionResolution)}</div>` : ""}
      </td>
      <td>
        <div class="row-actions">
          ${renderQuickActionButtons(order)}
          <button class="link-button" data-action="copy" data-id="${escapeHtml(order.id)}" ${state.busy ? "disabled" : ""}>复制</button>
          <button class="link-button" data-action="edit" data-id="${escapeHtml(order.id)}" ${state.busy ? "disabled" : ""}>编辑</button>
          <button class="link-button" data-action="delete" data-id="${escapeHtml(order.id)}" ${state.busy ? "disabled" : ""}>删除</button>
        </div>
      </td>
    `;
    body.append(row);
  });

  body.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const { action, id } = event.currentTarget.dataset;
      if (action === "complete") {
        updateOrderStatus(id, "已完成");
      } else if (action === "paid") {
        updateOrderStatus(id, "已付款");
      } else if (action === "revertToActive") {
        revertOrderToActive(id);
      } else if (action === "handled") {
        updateOrderStatus(id, "已处理");
      } else if (action === "stage") {
        openStageDialog(id);
      } else if (action === "workHours") {
        openWorkHoursDialog(id);
      } else if (action === "exception") {
        openExceptionDialog(id);
      } else if (action === "copy") {
        duplicateOrderFromList(id);
      } else if (action === "edit") {
        startEdit(id);
      } else if (action === "delete") {
        deleteOrder(id);
      }
    });
  });

  if (selectable) {
    body.querySelectorAll('input[type="checkbox"][data-action="select"]').forEach((input) => {
      input.addEventListener("change", (event) => {
        const { id } = event.currentTarget.dataset;
        toggleSelection(id, event.currentTarget.checked);
      });
    });
  }
}

function startEdit(id) {
  const order = state.orders.find((item) => item.id === id);
  if (!order) return;

  fillFormFromOrder(order, `编辑稿件：${order.projectName}`, true);
}

function duplicatePreviousOrder() {
  const source = state.lastTemplate || state.orders[0];
  if (!source) {
    updateAuthUi("还没有可重复的上一单，先保存一条稿件。");
    return;
  }

  fillFormFromOrder(makeDuplicateTemplate(source), "新建稿件（重复上一单）");
  updateAuthUi("已经带出上一单的常用信息，改一下项目名和截稿日期就能继续录。");
}

function duplicateOrderFromList(id) {
  const source = state.orders.find((item) => item.id === id);
  if (!source) return;

  const template = makeDuplicateTemplate(source);
  saveLastTemplate(source);
  fillFormFromOrder(template, `新建稿件（复制：${source.projectName}）`);
  updateAuthUi("已复制当前稿件到表单，可直接改项目名、日期或金额。");
}

function fillFormFromOrder(order, title, isEditing = false, scrollToForm = true) {
  state.editingId = isEditing ? order.id || null : null;
  clearPendingTimelineDraft();
  elements.formTitle.textContent = title;
  elements.hiddenId.value = isEditing ? order.id || "" : "";
  elements.projectName.value = order.projectName || "";
  elements.clientName.value = order.clientName || "";
  elements.businessType.value = order.businessType || BUILT_IN_BUSINESS_TYPES[0];
  elements.productionStage.value = order.productionStage || "";
  elements.source.value = order.source || SOURCES[0];
  elements.feeMode.value = normalizeFeeMode(order.feeMode);
  elements.feeRate.value = formatFeeRatePercent(
    order.feeRate ?? getDefaultFeeRate(elements.source.value, elements.feeMode.value),
  );
  elements.usageType.value = normalizeUsageType(order.usageType);
  elements.usageRate.value = formatUsageRatePercent(order.usageRate);
  elements.currency.value = normalizeCurrency(order.currency);
  elements.priority.value = order.priority || PRIORITIES[0];
  elements.amount.value = order.amount ?? "";
  elements.receivedAmount.value = order.receivedAmount ?? 0;
  elements.paymentStatus.value = normalizePaymentStatus(order);
  elements.startDate.value = order.startDate || "";
  elements.dueDate.value = order.dueDate || "";
  elements.completedDate.value = order.completedDate || "";
  syncCalendarColorInputWithOrder(order);
  elements.workHours.value = order.workHours > 0 ? formatHours(order.workHours) : "";
  elements.status.value = order.status || STATUSES[0];
  elements.exceptionType.value = order.exceptionType || EXCEPTION_TYPES[0];
  elements.notes.value = order.notes || "";
  updateFeeModeUi();
  syncCurrencyUi();
  syncUsageRateUi();
  renderWorkHoursPreview();
  renderBusinessShortcutList();
  render();
  if (scrollToForm) {
    elements.projectName.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function makeDuplicateTemplate(order) {
  return {
    projectName: order.projectName,
    clientName: order.clientName,
    businessType: order.businessType,
    productionStage: order.productionStage || "",
    source: order.source,
    feeMode: normalizeFeeMode(order.feeMode),
    feeRate: order.feeRate ?? getDefaultFeeRate(order.source, order.feeMode),
    usageType: normalizeUsageType(order.usageType),
    usageRate: normalizeUsageRate(order.usageRate, order.usageType),
    currency: normalizeCurrency(order.currency),
    fxRateSnapshot: Number(order.fxRateSnapshot) > 0 ? Number(order.fxRateSnapshot) : null,
    priority: order.priority,
    amount: order.amount,
    receivedAmount: 0,
    paymentStatus: PAYMENT_STATUSES[0],
    startDate: order.startDate || "",
    dueDate: "",
    completedDate: "",
    calendarColor: normalizeCalendarColor(order.calendarColor),
    workHours: 0,
    status: STATUSES[0],
    exceptionType: EXCEPTION_TYPES[0],
    exceptionResolution: "",
    exceptionNote: "",
    refundAmount: 0,
    exceptionPreviousStatus: null,
    notes: order.notes || "",
  };
}

async function deleteOrder(id) {
  const target = state.orders.find((item) => item.id === id);
  if (!target) return;

  const confirmed = window.confirm(`确认删除「${target.projectName}」吗？`);
  if (!confirmed) return;

  setBusy(true);
  try {
    if (state.mode === "cloud") {
      assertCloudUser();
      if (state.usingLocalBackup) {
        const nextOrders = state.orders.filter((item) => item.id !== id);
        await replaceRemoteOrders(nextOrders);
        state.usingLocalBackup = false;
      } else {
        const { error } = await state.supabase
          .from(TABLE_NAME)
          .delete()
          .eq("id", id)
          .eq("user_id", state.user.id);
        if (error) throw error;
        await loadRemoteOrders();
      }
    } else {
      state.orders = state.orders.filter((item) => item.id !== id);
      persistLocalOrders(state.orders);
    }

    if (state.editingId === id) {
      resetForm();
    }
    state.selectedOrderIds.delete(id);
    updateAuthUi("稿件已删除。");
  } catch (error) {
    updateAuthUi(mapAuthError(error));
  } finally {
    setBusy(false);
    render();
  }
}

function renderQuickActionButtons(order) {
  const escapedId = escapeHtml(order.id);
  const disabled = state.busy ? "disabled" : "";
  const actions = [];

  if (isAbnormal(order)) {
    if (order.status !== "已处理") {
      actions.push(
        `<button class="link-button" data-action="handled" data-id="${escapedId}" ${disabled}>已处理</button>`,
      );
    }
    return actions.join("");
  }

  if (!isClosed(order)) {
    actions.push(
      `<button class="link-button" data-action="complete" data-id="${escapedId}" ${disabled}>完成</button>`,
    );
  }
  if (order.status !== "已付款" && order.status !== "已处理") {
    actions.push(
      `<button class="link-button" data-action="paid" data-id="${escapedId}" ${disabled}>已付款</button>`,
    );
  }
  if (isClosed(order) && order.status !== "已处理") {
    actions.push(
      `<button class="link-button" data-action="revertToActive" data-id="${escapedId}" ${disabled}>改回进行中</button>`,
    );
  }
  return actions.join("");
}

function toggleSelection(id, checked) {
  if (checked) {
    state.selectedOrderIds.add(id);
  } else {
    state.selectedOrderIds.delete(id);
  }
  render();
}

function toggleSelectAllVisible(orders, checked) {
  orders.forEach((order) => {
    if (checked) {
      state.selectedOrderIds.add(order.id);
    } else {
      state.selectedOrderIds.delete(order.id);
    }
  });
  render();
}

function clearSelection(shouldRender = true) {
  state.selectedOrderIds.clear();
  if (shouldRender) {
    render();
  }
}

function syncSelectionToVisible(orders) {
  const visibleIds = new Set(orders.map((order) => order.id));
  state.selectedOrderIds = new Set(
    [...state.selectedOrderIds].filter((id) => visibleIds.has(id)),
  );
}

function getSelectedVisibleIds(orders) {
  return orders.filter((order) => state.selectedOrderIds.has(order.id)).map((order) => order.id);
}

async function applyBatchStatus(status) {
  const visibleOrders = filteredOrders();
  const targetIds = getSelectedVisibleIds(visibleOrders);
  if (!targetIds.length) {
    updateAuthUi("先勾选要批量处理的稿件。");
    return;
  }
  const targetOrders = visibleOrders.filter((order) => targetIds.includes(order.id));
  if ((status === "已完成" || status === "已付款") && targetOrders.some(isAbnormal)) {
    updateAuthUi("选中的稿件里有异常单，请先处理异常后再批量标记完成或已付款。");
    return;
  }
  if (status === "已处理" && targetOrders.some((order) => !isAbnormal(order))) {
    updateAuthUi("批量已处理只适用于异常单。");
    return;
  }

  const success = await updateOrdersStatus(targetIds, status, `已批量更新 ${targetIds.length} 条稿件。`);
  if (success) {
    clearSelection();
  }
}

async function applyBatchExceptionType(exceptionType) {
  const targetIds = getSelectedVisibleIds(filteredOrders());
  if (!targetIds.length) {
    updateAuthUi("先勾选要批量设置异常的稿件。");
    return;
  }

  if (!ABNORMAL_EXCEPTION_TYPES.has(exceptionType)) {
    updateAuthUi("先选择要批量设置的异常类型。");
    return;
  }

  const updatedOrders = state.orders.map((item) => {
    if (!targetIds.includes(item.id)) return item;
    const shouldRestoreWorkingState = item.status === "已处理" || DISALLOWED_ABNORMAL_STATUSES.has(item.status);
    return normalizeOrder({
      ...item,
      status: shouldRestoreWorkingState ? item.exceptionPreviousStatus || "进行中" : item.status,
      exceptionType,
      exceptionResolution: "",
      exceptionNote: "",
      refundAmount: 0,
      exceptionPreviousStatus: null,
    });
  });

  setBusy(true);
  try {
    await persistOrders(updatedOrders, targetIds);
    clearSelection(false);
    updateAuthUi(`已批量设置 ${targetIds.length} 条稿件为「${exceptionType}」。`);
  } catch (error) {
    updateAuthUi(mapAuthError(error));
  } finally {
    setBusy(false);
    render();
  }
}

async function updateOrderStatus(id, status) {
  await updateOrdersStatus([id], status, "稿件状态已更新。");
}

async function revertOrderToActive(id) {
  const order = state.orders.find((o) => o.id === id);
  if (!order) return;
  if (!isClosed(order) || order.status === "已处理") {
    updateAuthUi("只有已完成或已付款的稿件可以改回进行中。");
    return;
  }
  const updatedOrders = state.orders.map((item) => {
    if (item.id !== id) return item;
    return normalizeOrder({
      ...item,
      status: "进行中",
      completedDate: "",
    });
  });
  setBusy(true);
  try {
    await persistOrders(updatedOrders, [id]);
    if (state.editingId === id) resetForm();
    updateAuthUi("已改回进行中。");
  } catch (error) {
    updateAuthUi(mapAuthError(error));
  } finally {
    setBusy(false);
    render();
  }
}

async function updateOrdersStatus(ids, status, successMessage) {
  if (!ids.length) return false;
  const affectedOrders = state.orders.filter((item) => ids.includes(item.id));
  if ((status === "已完成" || status === "已付款") && affectedOrders.some(isAbnormal)) {
    updateAuthUi("异常单请先完成异常处理，不能直接设为已完成或已付款。");
    return false;
  }
  if (status === "已处理" && affectedOrders.some((item) => !isAbnormal(item))) {
    updateAuthUi("已处理状态只适用于异常单。");
    return false;
  }

  const today = formatDateInput(new Date());
  const updatedOrders = state.orders.map((item) => {
    if (!ids.includes(item.id)) return item;

    const next = { ...item, status };
    if (status === "已完成" || status === "已处理") {
      next.completedDate = next.completedDate || today;
    }
    if (status === "已付款") {
      next.completedDate = next.completedDate || today;
      next.receivedAmount = calculateGrossAmount(next);
      next.paymentStatus = "已结清";
    }
    if (status === "已处理") {
      next.exceptionPreviousStatus =
        item.status === "已处理" ? item.exceptionPreviousStatus || "进行中" : item.status;
    }
    return normalizeOrder(next);
  });

  setBusy(true);
  try {
    await persistOrders(updatedOrders, ids);
    if (state.editingId && ids.includes(state.editingId)) {
      resetForm();
    }
    updateAuthUi(successMessage);
    return true;
  } catch (error) {
    updateAuthUi(mapAuthError(error));
    return false;
  } finally {
    setBusy(false);
    render();
  }
}

async function persistOrders(nextOrders, changedIds = []) {
  if (state.mode === "cloud") {
    assertCloudUser();

    if (state.usingLocalBackup) {
      state.orders = nextOrders;
      await replaceRemoteOrders(nextOrders);
      state.usingLocalBackup = false;
      return;
    }

    if (!changedIds.length) {
      state.orders = nextOrders;
      await replaceRemoteOrders(nextOrders);
      return;
    }

    const changedOrders = nextOrders.filter((item) => changedIds.includes(item.id));
    await upsertRemoteOrders(changedOrders);
    return;
  }

  state.orders = nextOrders;
  persistLocalOrders(state.orders);
}

async function upsertRemoteOrders(orders, { refresh = true } = {}) {
  assertCloudUser();
  const payload = orders.map((item) => orderToRow(item, state.user.id));
  const { error } = await state.supabase.from(TABLE_NAME).upsert(payload, { onConflict: "id" });
  if (error) throw error;
  if (refresh) {
    await loadRemoteOrders();
  }
}

function statusChipClassName(status) {
  return status === "已完成" || status === "已付款"
    ? "done"
    : status === "已处理"
      ? "handled"
      : status === "待沟通"
        ? "waiting"
        : "";
}

function renderStaticStatusChip(status) {
  return `<span class="chip status ${statusChipClassName(status)}">${escapeHtml(status)}</span>`;
}

function renderStatusChip(order) {
  const status = order.status;
  const className =
    status === "已完成" || status === "已付款"
      ? "done"
      : status === "已处理"
        ? "handled"
        : status === "待沟通"
          ? "waiting"
          : "";
  if (canQuickEditStage(order)) {
    return `<button type="button" class="chip status ${className} clickable" data-action="stage" data-id="${escapeHtml(
      order.id,
    )}" ${state.busy ? "disabled" : ""}>${escapeHtml(status)}</button>`;
  }
  return renderStaticStatusChip(status);
}

function renderProductionStageChip(stage, order = null) {
  const stageDate = order?.stageTimeline?.[stage] || "";
  const tooltipAttr = stageDate ? ` title="进入时间：${escapeHtml(stageDate)}"` : "";
  if (order && canQuickEditStage(order)) {
    return `<button type="button" class="chip stage clickable" data-action="stage" data-id="${escapeHtml(
      order.id,
    )}"${tooltipAttr} ${state.busy ? "disabled" : ""}>${escapeHtml(stage)}</button>`;
  }
  return `<span class="chip stage"${tooltipAttr}>${escapeHtml(stage)}</span>`;
}

function renderWorkHoursChip(order) {
  const workHours = sanitizeWorkHours(order.workHours);
  const label = canQuickEditWorkHours(order)
    ? workHours
      ? `实际工时 ${formatHours(workHours)} 小时`
      : "补实际工时"
    : workHours
      ? `预计工时 ${formatHours(workHours)} 小时`
      : "";

  if (!label) return "";

  if (canQuickEditWorkHours(order)) {
    return `<button type="button" class="chip hours clickable" data-action="workHours" data-id="${escapeHtml(
      order.id,
    )}" ${state.busy ? "disabled" : ""}>${escapeHtml(label)}</button>`;
  }

  return `<span class="chip hours">${escapeHtml(label)}</span>`;
}

function renderUsageChip(order) {
  const usageType = normalizeUsageType(order.usageType);
  if (usageType === "私用") return "";
  const usageRate = normalizeUsageRate(order.usageRate, usageType);
  const suffix = usageRate > 0 ? ` +${formatUsageRatePercent(usageRate)}%` : "";
  return `<span class="chip usage">${escapeHtml(`${usageType}${suffix}`)}</span>`;
}

function renderExceptionChip(order) {
  if (!isAbnormal(order)) return "";
  const tone = isUnhandledAbnormal(order) ? "pending" : "resolved";
  return `<button type="button" class="chip exception ${tone} clickable" data-action="exception" data-id="${escapeHtml(
    order.id,
  )}" ${state.busy ? "disabled" : ""}>${escapeHtml(order.exceptionType)}</button>`;
}

function renderAmountContent(order) {
  const feeMode = normalizeFeeMode(order.feeMode);
  const currency = normalizeCurrency(order.currency);
  const baseAmount = normalizeMoneyValue(order.amount);
  const usageType = normalizeUsageType(order.usageType);
  const usageRate = normalizeUsageRate(order.usageRate, usageType);
  const usageSurcharge = calculateUsageSurcharge(order);
  const grossAmount = calculateGrossAmount(order);
  const grossAmountCny = calculateGrossAmountCny(order);
  const effectiveAmount = calculateEffectiveAmount(order);
  const effectiveAmountCny = calculateEffectiveAmountCny(order);
  const refundAmount = calculateRefundAmount(order);
  const refundAmountCny = calculateRefundAmountCny(order);
  const feeAmount = calculateAdjustedFeeAmount(order);
  const feeAmountCny = calculateAdjustedFeeAmountCny(order);
  const netAmount = calculateAdjustedNetAmount(order);
  const netAmountCny = calculateAdjustedNetAmountCny(order);
  const baseAmountCny = convertMoneyToCny(baseAmount, order);
  const usageSurchargeCny = convertMoneyToCny(usageSurcharge, order);

  const rows = [];
  if (feeMode === "mhs_project") {
    rows.push(
      `<strong>${
        refundAmount > 0
          ? `原到手 ${formatMoneyWithOriginal(grossAmountCny, grossAmount, currency)}`
          : `到手稿费 ${formatMoneyWithOriginal(grossAmountCny, grossAmount, currency)}`
      }</strong>`,
    );
  } else if (feeMode === "mhs_window") {
    rows.push(
      `<strong>${
        refundAmount > 0
          ? `原标价 ${formatMoneyWithOriginal(grossAmountCny, grossAmount, currency)}`
          : `橱窗标价 ${formatMoneyWithOriginal(grossAmountCny, grossAmount, currency)}`
      }</strong>`,
    );
  } else {
    rows.push(
      `<strong>${
        refundAmount > 0
          ? `原稿费 ${formatMoneyWithOriginal(grossAmountCny, grossAmount, currency)}`
          : formatMoneyWithOriginal(grossAmountCny, grossAmount, currency)
      }</strong>`,
    );
  }

  if (usageType !== "私用") {
    rows.push(
      `<div class="legend-row">${escapeHtml(usageType)}加价 ${formatUsageRatePercent(usageRate)}%（+${formatMoneyWithOriginal(
        usageSurchargeCny,
        usageSurcharge,
        currency,
      )}，基价 ${formatMoneyWithOriginal(baseAmountCny, baseAmount, currency)}）</div>`,
    );
  }

  if (refundAmount > 0) {
    rows.push(`<div class="legend-row warning-text">退款 ${formatMoneyWithOriginal(refundAmountCny, refundAmount, currency)}</div>`);
    rows.push(
      `<div class="legend-row">${
        feeMode === "mhs_project"
          ? `结算到手 ${formatMoneyWithOriginal(effectiveAmountCny, effectiveAmount, currency)}`
          : `结算 ${formatMoneyWithOriginal(effectiveAmountCny, effectiveAmount, currency)}`
      }</div>`,
    );
  }

  if (feeMode === "mhs_project" && order.feeRate > 0) {
    rows.push(
      `<div class="legend-row">企划报价 ${formatMoneyWithOriginal(
        calculateQuotedAmountCny(order),
        calculateQuotedAmount(order),
        currency,
      )}</div>`,
    );
    rows.push(`<div class="legend-row">平台加价 ${formatMoneyWithOriginal(feeAmountCny, feeAmount, currency)}</div>`);
  } else if (feeMode === "mhs_window" && order.feeRate > 0) {
    rows.push(`<div class="legend-row">平台费 ${formatMoneyWithOriginal(feeAmountCny, feeAmount, currency)}</div>`);
    rows.push(`<div class="legend-row">预计实得 ${formatMoneyWithOriginal(netAmountCny, netAmount, currency)}</div>`);
  } else if (order.feeRate > 0 || refundAmount > 0) {
    rows.push(`<div class="legend-row">预计实得 ${formatMoneyWithOriginal(netAmountCny, netAmount, currency)}</div>`);
  }
  const workHoursChip = renderWorkHoursChip(order);
  if (workHoursChip) {
    rows.push(`<div class="chip-group">${workHoursChip}</div>`);
  }
  const hourlyRate = calculateHourlyRate(order);
  if (hourlyRate != null) {
    rows.push(`<div class="legend-row">参考时薪 ${formatCnyMoney(hourlyRate)}/小时</div>`);
  }
  return rows.join("");
}

function renderScheduleContent(order) {
  const dueText = formatScheduleDate(order.dueDate);
  const startText = formatScheduleDate(order.startDate);
  const doneText = formatScheduleDate(order.completedDate);
  const { plannedDays, actualDays } = calculateScheduleDurations(order);
  const pills = [
    buildSchedulePill("start", `动工 ${startText}`, { muted: !order.startDate }),
    buildSchedulePill("due", `截稿 ${dueText}`, { muted: !order.dueDate }),
    buildSchedulePill("done", `完成 ${doneText}`, { muted: !order.completedDate }),
  ];
  if (order.completedDate) {
    if (plannedDays != null) {
      pills.push(buildSchedulePill("plan", `排期 ${plannedDays} 天`));
    }
    if (actualDays != null) {
      pills.push(buildSchedulePill("actual", `实际 ${actualDays} 天`));
    }
  } else if (plannedDays != null) {
    pills.push(buildSchedulePill("duration", `工期 ${plannedDays} 天`));
  }
  const headClass = order.dueDate ? "schedule-head" : "schedule-head muted";

  return `
    <div class="schedule-cell">
      <strong class="${headClass}">截稿 ${escapeHtml(dueText)}</strong>
      <div class="schedule-pill-row">${pills.join("")}</div>
    </div>
  `;
}

function formatScheduleDate(date) {
  const text = String(date || "").trim();
  return text || "未设";
}

function buildSchedulePill(kind, value, { muted = false } = {}) {
  const classNames = ["schedule-pill", kind];
  if (muted) {
    classNames.push("muted");
  }
  return `<span class="${classNames.join(" ")}">${escapeHtml(value)}</span>`;
}

function renderPaymentContent(order) {
  const currency = normalizeCurrency(order.currency);
  const paymentStatus = normalizePaymentStatus(order);
  const effectiveReceived = calculateEffectiveReceived(order);
  const effectiveReceivedCny = calculateEffectiveReceivedCny(order);
  const effectiveAmount = calculateEffectiveAmount(order);
  const effectiveAmountCny = calculateEffectiveAmountCny(order);
  const refundAmount = calculateRefundAmount(order);
  const refundAmountCny = calculateRefundAmountCny(order);
  const outstandingAmount = Math.max(effectiveAmount - effectiveReceived, 0);
  const outstandingAmountCny = convertMoneyToCny(outstandingAmount, order);
  const className =
    effectiveAmount > 0 && effectiveReceived >= effectiveAmount
      ? "paid"
      : effectiveReceived > 0
        ? "partial"
        : "";

  const chipClass = className ? `chip payment ${className}` : "chip payment";
  const rows = [];
  if (refundAmount > 0) {
    rows.push(`<div class="chip-group"><span class="${chipClass}">${escapeHtml(paymentStatus)}</span></div>`);
    rows.push(`<div class="legend-row">已收净额 ${formatMoneyWithOriginal(effectiveReceivedCny, effectiveReceived, currency)}</div>`);
    rows.push(
      `<div class="legend-row">原已收 ${formatMoneyWithOriginal(
        convertMoneyToCny(normalizeMoneyValue(order.receivedAmount), order),
        normalizeMoneyValue(order.receivedAmount),
        currency,
      )} / 已退款 ${formatMoneyWithOriginal(refundAmountCny, refundAmount, currency)}</div>`,
    );
  } else {
    rows.push(`<div class="chip-group"><span class="${chipClass}">${escapeHtml(paymentStatus)}</span></div>`);
    rows.push(`<div class="legend-row">已收 ${formatMoneyWithOriginal(effectiveReceivedCny, effectiveReceived, currency)}</div>`);
    if (outstandingAmount) {
      rows.push(
        `<div class="legend-row">待收 ${formatMoneyWithOriginal(outstandingAmountCny, outstandingAmount, currency)}</div>`,
      );
    }
  }
  return rows.join("");
}

function exportJson() {
  downloadFile(
    JSON.stringify(filteredOrders(), null, 2),
    `artist-commission-desk-${state.filters.month || "all"}.json`,
    "application/json",
  );
}

function exportCsv() {
  const headers = [
    "项目名",
    "客户",
    "业务分类",
    "制作阶段",
    "来源",
    "用途类型",
    "用途加价(%)",
    "币种",
    "汇率快照",
    "手续费方式",
    "平台抽成(%)",
    "紧急程度",
    "基价稿费(原币)",
    "用途加价金额(原币)",
    "稿费(含用途加价,原币)",
    "退款金额(原币)",
    "结算收入(原币)",
    "预计实得(原币)",
    "已收金额(原币)",
    "已收净额(原币)",
    "稿费(含用途加价,CNY)",
    "退款金额(CNY)",
    "结算收入(CNY)",
    "预计实得(CNY)",
    "已收金额(CNY)",
    "已收净额(CNY)",
    "收款状态",
    "动工日期",
    "截稿日期",
    "完成日期",
    "排期条颜色",
    "工时(小时)",
    "参考时薪(按预计实得)",
    "状态",
    "异常类型",
    "异常处理结果",
    "异常备注",
    "备注",
  ];
  const rows = filteredOrders().map((item) => [
    item.projectName,
    item.clientName,
    item.businessType,
    item.productionStage,
    getSourceLabel(item.source),
    normalizeUsageType(item.usageType),
    formatUsageRatePercent(item.usageRate),
    normalizeCurrency(item.currency),
    item.fxRateSnapshot ?? "",
    getFeeModeLabel(normalizeFeeMode(item.feeMode)),
    formatFeeRatePercent(item.feeRate),
    item.priority,
    normalizeMoneyValue(item.amount),
    calculateUsageSurcharge(item),
    calculateGrossAmount(item),
    calculateRefundAmount(item),
    calculateEffectiveAmount(item),
    calculateAdjustedNetAmount(item),
    normalizeMoneyValue(item.receivedAmount),
    calculateEffectiveReceived(item),
    calculateGrossAmountCny(item),
    calculateRefundAmountCny(item),
    calculateEffectiveAmountCny(item),
    calculateAdjustedNetAmountCny(item),
    convertMoneyToCny(normalizeMoneyValue(item.receivedAmount), item),
    calculateEffectiveReceivedCny(item),
    normalizePaymentStatus(item),
    item.startDate,
    item.dueDate,
    item.completedDate,
    normalizeCalendarColor(item.calendarColor),
    formatHours(item.workHours),
    formatHourlyRate(calculateHourlyRate(item)),
    item.status,
    item.exceptionType,
    item.exceptionResolution,
    item.exceptionNote,
    item.notes,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");
  downloadFile(csv, `artist-commission-desk-${state.filters.month || "all"}.csv`, "text/csv");
}

function importJson(event) {
  const [file] = event.target.files || [];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) {
        throw new Error("导入文件格式不对。");
      }

      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      const valid = parsed.filter((record) => {
        if (typeof record.projectName !== "string" || !record.projectName.trim()) return false;
        if (typeof record.clientName !== "string" || !record.clientName.trim()) return false;
        if (typeof record.businessType !== "string" || !record.businessType.trim()) return false;
        if (record.productionStage != null && typeof record.productionStage !== "string") return false;
        if (record.amount != null && (typeof record.amount !== "number" || !isFinite(record.amount))) return false;
        if (record.currency != null && !SUPPORTED_CURRENCIES.includes(record.currency)) return false;
        if (record.fxRateSnapshot != null && record.fxRateSnapshot !== "") {
          const snapshot = Number(record.fxRateSnapshot);
          if (!isFinite(snapshot) || snapshot <= 0) return false;
        }
        if (record.currency === "CNY" && record.fxRateSnapshot != null && Number(record.fxRateSnapshot) > 0) {
          return false;
        }
        if (
          record.currency &&
          record.currency !== "CNY" &&
          record.fxRateSnapshot != null &&
          Number(record.fxRateSnapshot) <= 0
        ) {
          return false;
        }
        if (record.startDate != null && record.startDate !== "" && !datePattern.test(record.startDate)) return false;
        if (record.dueDate != null && record.dueDate !== "" && !datePattern.test(record.dueDate)) return false;
        if (record.completedDate != null && record.completedDate !== "" && !datePattern.test(record.completedDate)) return false;
        if (
          record.calendarColor != null &&
          record.calendarColor !== "" &&
          !/^#[0-9a-fA-F]{6}$/.test(String(record.calendarColor))
        ) {
          return false;
        }
        if (record.startDate && record.dueDate && record.startDate > record.dueDate) return false;
        if (record.workHours != null) {
          const workHours = Number(record.workHours);
          if (!isFinite(workHours) || workHours < 0) return false;
        }
        if (record.feeRate != null) {
          const feeRate = Number(record.feeRate);
          if (!isFinite(feeRate) || feeRate < 0 || feeRate > 1) return false;
        }
        if (record.feeMode != null && !FEE_MODES.some((item) => item.value === record.feeMode)) {
          return false;
        }
        if (record.usageType != null && !USAGE_TYPES.includes(record.usageType)) {
          return false;
        }
        if (record.usageRate != null) {
          const usageRate = Number(record.usageRate);
          if (!isFinite(usageRate) || usageRate < 0 || usageRate > 5) return false;
        }
        if (record.exceptionType != null && !EXCEPTION_TYPES.includes(record.exceptionType)) {
          return false;
        }
        if (record.exceptionResolution != null && record.exceptionResolution !== "" && !EXCEPTION_RESOLUTIONS.includes(record.exceptionResolution)) {
          return false;
        }
        if (record.refundAmount != null) {
          const refundAmount = Number(record.refundAmount);
          if (!isFinite(refundAmount) || refundAmount < 0) return false;
          const receivedAmount = Number(record.receivedAmount || 0);
          if (refundAmount > receivedAmount) return false;
        }
        return true;
      });

      if (!valid.length) {
        throw new Error("导入的记录全部不合法，请检查 projectName、clientName、amount、dueDate 等字段。");
      }
      if (valid.length < parsed.length) {
        updateAuthUi(`已过滤 ${parsed.length - valid.length} 条不合法记录，导入 ${valid.length} 条。`);
      }

      await replaceAllOrders(valid);
    } catch (error) {
      updateAuthUi(error.message || "导入失败，请确认文件是本工具导出的 JSON。");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function fillSelect(select, values, includeAll = false, placeholder = "") {
  select.innerHTML = includeAll ? '<option value="all">全部</option>' : "";
  if (!includeAll && placeholder) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = placeholder;
    select.append(option);
  }
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function fillSelectWithItems(select, items, includeAll = false, placeholder = "") {
  if (!select) return;
  select.innerHTML = includeAll ? '<option value="all">全部</option>' : "";
  if (placeholder) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = placeholder;
    select.append(option);
  }
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.label;
    select.append(option);
  });
}

function renderSourceOptions() {
  const knownSources = getKnownSources();
  if (elements.sourceOptions) {
    elements.sourceOptions.innerHTML = "";
    knownSources.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      const label = getSourceLabel(value);
      if (label && label !== value) {
        option.label = label;
      }
      elements.sourceOptions.append(option);
    });
  }
  if (elements.source && document.activeElement !== elements.source) {
    const normalized = normalizeSourceValue(elements.source.value);
    elements.source.value = normalized || SOURCES[0];
  }
  renderSourceFilterOptions(knownSources);
}

function renderSourceFilterOptions(knownSources = getKnownSources()) {
  if (!elements.sourceFilter) return;
  elements.sourceFilter.innerHTML = '<option value="all">全部</option>';
  knownSources.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = getSourceLabel(value);
    elements.sourceFilter.append(option);
  });
  const currentValue = normalizeSourceValue(state.filters.source) || "all";
  if (currentValue === "all" || knownSources.includes(currentValue)) {
    elements.sourceFilter.value = currentValue;
    return;
  }
  state.filters.source = "all";
  elements.sourceFilter.value = "all";
}

function renderBusinessTypeOptions() {
  if (!elements.businessTypeOptions) return;
  elements.businessTypeOptions.innerHTML = "";
  getKnownBusinessTypes().forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    elements.businessTypeOptions.append(option);
  });
}

function renderListFilterOptions() {
  const businessTypes = getKnownBusinessTypes();
  const panelMappings = [
    { key: "active", select: elements.activeBusinessFilter, search: elements.activeSearchFilter },
    { key: "completed", select: elements.completedBusinessFilter, search: elements.completedSearchFilter },
  ];
  panelMappings.forEach(({ key, select, search }) => {
    if (select) {
      const currentValue = normalizeBusinessTypeValue(state.listFilters[key]?.business) || "all";
      fillSelect(select, businessTypes, true);
      if (currentValue === "all" || businessTypes.includes(currentValue)) {
        select.value = currentValue;
      } else {
        state.listFilters[key].business = "all";
        select.value = "all";
      }
    }
    if (search) {
      const query = normalizeListFilterQuery(state.listFilters[key]?.query);
      if (search.value !== query) {
        search.value = query;
      }
    }
  });
}

function renderBusinessShortcutList() {
  if (!elements.businessShortcutList) return;
  const selectedValue = normalizeBusinessTypeValue(elements.businessType?.value);
  const canEditOrders = state.mode === "local" || Boolean(state.user);
  const disabled = !canEditOrders || state.busy || state.businessPresetBusy;
  elements.businessShortcutList.innerHTML = getShortcutBusinessTypes()
    .map((value) => {
      const selected = value === selectedValue ? "is-selected" : "";
      return `<button type="button" class="business-shortcut ${selected}" data-business-shortcut="${escapeHtml(
        value,
      )}" ${disabled ? "disabled" : ""}>${escapeHtml(value)}</button>`;
    })
    .join("");
}

function renderBusinessPresetItem(value, { removableBusiness = false, controlsDisabled = false } = {}) {
  const normalized = normalizeBusinessTypeValue(value);
  if (!normalized) return "";
  const template = getBusinessTemplate(normalized);
  const templateExists = Boolean(template);
  const templateSummary = getBusinessTemplateSummary(template);

  return `
    <div class="business-preset-item">
      <div class="business-preset-name">
        <strong>${escapeHtml(normalized)}</strong>
      </div>
      <div class="business-preset-summary" title="${escapeHtml(templateSummary)}">
        ${escapeHtml(templateSummary)}
      </div>
      <div class="business-preset-tags">
        <span class="business-template-status ${templateExists ? "" : "is-empty"}">
          ${templateExists ? "已设模板" : "未设模板"}
        </span>
        <span class="chip business">${removableBusiness ? "自定义业务" : "内置业务"}</span>
      </div>
      <div class="business-preset-actions">
        ${
          templateExists
            ? `<button
                type="button"
                class="ghost-button small-button"
                data-remove-business-template="${escapeHtml(normalized)}"
                ${controlsDisabled ? "disabled" : ""}
              >
                删除模板
              </button>`
            : ""
        }
        ${
          removableBusiness
            ? `<button
                type="button"
                class="ghost-button small-button"
                data-remove-business-preset="${escapeHtml(normalized)}"
                ${controlsDisabled ? "disabled" : ""}
              >
                删除业务
              </button>`
            : ""
        }
      </div>
    </div>
  `;
}

function renderBusinessPresetDialog() {
  if (!elements.businessPresetBuiltInList || !elements.businessPresetCustomList) return;
  const canEditOrders = state.mode === "local" || Boolean(state.user);
  const controlsDisabled = !canEditOrders || state.busy || state.businessPresetBusy;

  elements.businessPresetBuiltInList.innerHTML = BUILT_IN_BUSINESS_TYPES
    .map((value) =>
      renderBusinessPresetItem(value, {
        controlsDisabled,
      }),
    )
    .join("");

  if (!state.customBusinessTypes.length) {
    elements.businessPresetCustomList.innerHTML =
      '<div class="business-preset-empty"><p class="legend-row">还没有自定义业务。先在上面加一个你常接的业务，之后就能给它单独存模板。</p></div>';
  } else {
    elements.businessPresetCustomList.innerHTML = state.customBusinessTypes
      .map(
        (value) =>
          renderBusinessPresetItem(value, {
            removableBusiness: true,
            controlsDisabled,
          }),
      )
      .join("");
  }
}

function getBusinessTemplateSummary(template) {
  const normalized = normalizeBusinessTemplate(template);
  if (!normalized) return "来源 - · 阶段 - · 金额 - · 状态 - · 更新 -";

  const sourceLabel = normalized.source || "-";
  const stageLabel = normalized.productionStage || "-";
  const amountLabel =
    normalizeMoneyValue(normalized.amount) > 0
      ? formatOriginalMoney(normalized.amount, normalized.currency)
      : "-";
  const statusLabel = normalized.status || "-";
  const updatedAtLabel = formatTemplateTimestamp(normalized.updatedAt);
  return `来源 ${sourceLabel} · 阶段 ${stageLabel} · 金额 ${amountLabel} · 状态 ${statusLabel} · 更新 ${updatedAtLabel}`;
}

function formatTemplateTimestamp(value) {
  const timestamp = getSettingsTimestamp(value);
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}

function renderProductionStageOptions() {
  if (elements.productionStageOptions) {
    elements.productionStageOptions.innerHTML = "";
    getKnownProductionStages().forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      elements.productionStageOptions.append(option);
    });
  }

  if (elements.stageFilter) {
    const currentValue = state.filters.stage;
    fillSelect(elements.stageFilter, getKnownProductionStages(), true);
    if (
      currentValue === "all" ||
      getKnownProductionStages().includes(currentValue)
    ) {
      elements.stageFilter.value = currentValue;
    } else {
      state.filters.stage = "all";
      elements.stageFilter.value = "all";
    }
  }
}

function getKnownBusinessTypes() {
  return mergeBusinessTypeGroups(
    BUILT_IN_BUSINESS_TYPES,
    state.customBusinessTypes,
    Object.keys(state.businessTemplates || {}),
    state.orders.map((order) => order.businessType),
  );
}

function getShortcutBusinessTypes() {
  return mergeBusinessTypeGroups(BUILT_IN_BUSINESS_TYPES, state.customBusinessTypes, Object.keys(state.businessTemplates || {}));
}

function getKnownSources() {
  return getAllKnownSources(state.orders);
}

function mergeBusinessTypeGroups(...groups) {
  const seen = new Set();
  const list = [];
  groups.flat().forEach((value) => {
    const normalized = normalizeBusinessTypeValue(value);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    list.push(normalized);
  });
  return list;
}

function normalizeBusinessPresetList(list) {
  const seen = new Set();
  const normalizedList = [];
  (list || []).forEach((item) => {
    const normalized = normalizeBusinessTypeValue(item);
    if (!normalized || BUILT_IN_BUSINESS_TYPES.includes(normalized) || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    normalizedList.push(normalized);
  });
  return normalizedList;
}

function normalizeBusinessTemplate(input = {}) {
  if (!input || typeof input !== "object") return null;
  const businessType = normalizeBusinessTypeValue(input.businessType);
  if (!businessType) return null;
  const normalizedOrder = normalizeOrder({
    projectName: String(input.projectName || ""),
    clientName: "",
    businessType,
    productionStage: input.productionStage,
    source: input.source,
    feeMode: input.feeMode,
    feeRate: input.feeRate,
    usageType: input.usageType,
    usageRate: input.usageRate,
    currency: input.currency,
    fxRateSnapshot: input.fxRateSnapshot,
    priority: input.priority,
    amount: input.amount,
    receivedAmount: input.receivedAmount,
    paymentStatus: input.paymentStatus,
    startDate: "",
    dueDate: "",
    completedDate: "",
    workHours: input.workHours,
    status: input.status,
    exceptionType: input.exceptionType,
    notes: input.notes,
  });

  return {
    businessType,
    projectName: normalizedOrder.projectName,
    productionStage: normalizedOrder.productionStage,
    source: normalizedOrder.source,
    feeMode: normalizedOrder.feeMode,
    feeRate: normalizedOrder.feeRate,
    usageType: normalizedOrder.usageType,
    usageRate: normalizedOrder.usageRate,
    currency: normalizedOrder.currency,
    fxRateSnapshot: normalizedOrder.fxRateSnapshot,
    priority: normalizedOrder.priority,
    amount: normalizedOrder.amount,
    receivedAmount: normalizedOrder.receivedAmount,
    paymentStatus: normalizePaymentStatus(normalizedOrder),
    workHours: normalizedOrder.workHours,
    status: normalizedOrder.status,
    exceptionType: normalizedOrder.exceptionType,
    notes: normalizedOrder.notes,
    updatedAt: normalizeIsoTimestamp(input.updatedAt),
  };
}

function normalizeBusinessTemplateMap(input = {}) {
  const sourceEntries = Array.isArray(input) ? input : Object.values(input || {});
  return sourceEntries.reduce((accumulator, item) => {
    const normalized = normalizeBusinessTemplate(item);
    if (!normalized) return accumulator;
    accumulator[normalized.businessType] = normalized;
    return accumulator;
  }, {});
}

function getBusinessTemplate(value) {
  const normalized = normalizeBusinessTypeValue(value);
  if (!normalized) return null;
  return state.businessTemplates[normalized] || null;
}

function hasBusinessTemplate(value) {
  return Boolean(getBusinessTemplate(value));
}

function buildBusinessTemplateFromForm() {
  const businessType = normalizeBusinessTypeValue(elements.businessType?.value);
  if (!businessType) return null;

  return normalizeBusinessTemplate({
    projectName: elements.projectName?.value.trim(),
    businessType,
    productionStage: elements.productionStage?.value,
    source: elements.source?.value,
    feeMode: elements.feeMode?.value,
    feeRate: parseFeeRateInput(elements.feeRate?.value),
    usageType: elements.usageType?.value,
    usageRate: parseUsageRateInput(elements.usageRate?.value),
    currency: elements.currency?.value,
    fxRateSnapshot:
      normalizeCurrency(elements.currency?.value) === "CNY"
        ? null
        : getConfiguredFxRate(elements.currency?.value),
    priority: elements.priority?.value,
    amount: Number(elements.amount?.value),
    receivedAmount: Number(elements.receivedAmount?.value),
    paymentStatus: elements.paymentStatus?.value,
    workHours: elements.workHours?.value,
    status: elements.status?.value,
    exceptionType: elements.exceptionType?.value,
    notes: elements.notes?.value.trim(),
    updatedAt: new Date().toISOString(),
  });
}

function applyBusinessTemplateToForm(template) {
  const normalized = normalizeBusinessTemplate(template);
  if (!normalized) return false;

  elements.projectName.value = normalized.projectName || "";
  elements.businessType.value = normalized.businessType;
  elements.productionStage.value = normalized.productionStage || "";
  elements.source.value = normalized.source;
  elements.feeMode.value = normalized.feeMode;
  elements.feeRate.value = formatFeeRatePercent(normalized.feeRate);
  elements.usageType.value = normalized.usageType;
  elements.usageRate.value = formatUsageRatePercent(normalized.usageRate);
  elements.currency.value = normalized.currency;
  elements.priority.value = normalized.priority;
  elements.amount.value = normalized.amount > 0 ? formatMoney(normalized.amount) : "";
  elements.receivedAmount.value = formatMoney(normalized.receivedAmount);
  elements.paymentStatus.value = normalized.paymentStatus;
  elements.workHours.value = normalized.workHours > 0 ? formatHours(normalized.workHours) : "";
  elements.status.value = normalized.status;
  elements.exceptionType.value = normalized.exceptionType || EXCEPTION_TYPES[0];
  elements.notes.value = normalized.notes;
  syncCalendarColorInputWithSource();
  updateFeeModeUi();
  syncCurrencyUi();
  syncUsageRateUi();
  renderWorkHoursPreview();
  renderBusinessShortcutList();
  refreshPendingTimelineDraftFromForm();
  return true;
}

async function ensureBusinessPresetExists(value) {
  const normalized = normalizeBusinessTypeValue(value);
  if (
    !normalized ||
    BUILT_IN_BUSINESS_TYPES.includes(normalized) ||
    state.customBusinessTypes.includes(normalized)
  ) {
    return { added: false, remoteError: null };
  }
  return addBusinessPreset(normalized);
}

async function addBusinessPreset(value) {
  const normalized = normalizeBusinessTypeValue(value);
  if (
    !normalized ||
    BUILT_IN_BUSINESS_TYPES.includes(normalized) ||
    state.customBusinessTypes.includes(normalized)
  ) {
    return { added: false, remoteError: null };
  }

  const nextCustomTypes = normalizeBusinessPresetList([...state.customBusinessTypes, normalized]);
  persistLocalBusinessPresets(nextCustomTypes);

  let remoteError = null;
  if (state.mode === "cloud" && state.user) {
    try {
      await upsertRemoteBusinessPresets([normalized]);
    } catch (error) {
      remoteError = error;
    }
  }

  renderBusinessTypeOptions();
  renderBusinessShortcutList();
  renderBusinessPresetDialog();

  return {
    added: true,
    remoteError,
  };
}

async function removeBusinessTemplate(value) {
  const normalized = normalizeBusinessTypeValue(value);
  if (!normalized || !getBusinessTemplate(normalized)) {
    return { removed: false, remoteError: null };
  }

  const nextTemplates = { ...state.businessTemplates };
  delete nextTemplates[normalized];
  persistLocalBusinessTemplates(nextTemplates);

  let remoteError = null;
  if (state.mode === "cloud" && state.user) {
    try {
      await deleteRemoteBusinessTemplate(normalized);
    } catch (error) {
      remoteError = error;
    }
  }

  renderBusinessShortcutList();
  renderBusinessPresetDialog();

  return {
    removed: true,
    remoteError,
  };
}

async function removeBusinessPreset(value) {
  const normalized = normalizeBusinessTypeValue(value);
  if (!normalized || !state.customBusinessTypes.includes(normalized)) {
    return { removed: false, presetRemoteError: null, templateRemoteError: null };
  }

  persistLocalBusinessPresets(state.customBusinessTypes.filter((item) => item !== normalized));
  const nextTemplates = { ...state.businessTemplates };
  const hasTemplate = Boolean(nextTemplates[normalized]);
  if (hasTemplate) {
    delete nextTemplates[normalized];
    persistLocalBusinessTemplates(nextTemplates);
  }

  let presetRemoteError = null;
  let templateRemoteError = null;
  if (state.mode === "cloud" && state.user) {
    try {
      await deleteRemoteBusinessPreset(normalized);
    } catch (error) {
      presetRemoteError = error;
    }
    if (hasTemplate) {
      try {
        await deleteRemoteBusinessTemplate(normalized);
      } catch (error) {
        templateRemoteError = error;
      }
    }
  }

  renderBusinessTypeOptions();
  renderBusinessShortcutList();
  renderBusinessPresetDialog();

  return {
    removed: true,
    presetRemoteError,
    templateRemoteError,
  };
}

function getKnownProductionStages() {
  const builtIn = [...BUILT_IN_PRODUCTION_STAGES];
  const seen = new Set(builtIn);
  const dynamic = [];

  state.orders.forEach((order) => {
    const normalized = normalizeProductionStageValue(order.productionStage);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      dynamic.push(normalized);
    }
  });

  return [...builtIn, ...dynamic];
}

function getVisibleBusinessTypes(orders) {
  const seen = new Set();
  const names = [];
  orders.forEach((order) => {
    const normalized = normalizeBusinessTypeValue(order.businessType);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      names.push(normalized);
    }
  });
  return names;
}

function normalizeBusinessTypeValue(value) {
  return String(value || "").trim().slice(0, 20);
}

function normalizeSourceValue(value) {
  return String(value || "").trim().slice(0, 20);
}

function normalizeProductionStageValue(value) {
  return String(value || "").trim().slice(0, 20);
}

function normalizeStageTimeline(input) {
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

function recordStageTimestamp(currentTimeline, previousStage, nextStage) {
  const timeline = { ...normalizeStageTimeline(currentTimeline) };
  const normalizedNext = normalizeProductionStageValue(nextStage);
  if (normalizedNext && !timeline[normalizedNext]) {
    timeline[normalizedNext] = formatDateInput(new Date());
  }
  return timeline;
}

function getStageTimelineSummary(timeline, stages = BUILT_IN_PRODUCTION_STAGES) {
  const normalized = normalizeStageTimeline(timeline);
  const entries = stages
    .map((stage) => ({ stage, date: normalized[stage] || null }))
    .filter((entry) => entry.date);
  const customEntries = Object.entries(normalized)
    .filter(([stage]) => !stages.includes(stage))
    .map(([stage, date]) => ({ stage, date }));
  return [...entries, ...customEntries];
}

function calculateStageDuration(timeline, fromStage, toStage) {
  const normalized = normalizeStageTimeline(timeline);
  const fromDate = normalized[fromStage];
  const toDate = normalized[toStage];
  if (!fromDate || !toDate) return null;
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);
  const diff = Math.round((to - from) / (24 * 60 * 60 * 1000));
  return Number.isFinite(diff) && diff >= 0 ? diff : null;
}

function normalizeFeeMode(value) {
  return FEE_MODES.some((item) => item.value === value) ? value : "standard";
}

function getSuggestedFeeMode(source) {
  const normalizedSource = normalizeSourceValue(source);
  if (normalizedSource === "米画师") return "mhs_project";
  if (normalizedSource === "橱窗") return "mhs_window";
  return "standard";
}

function getFeeModeLabel(feeMode) {
  return FEE_MODES.find((item) => item.value === feeMode)?.label || "默认按比例";
}

function getSourceLabel(source) {
  const normalizedSource = normalizeSourceValue(source);
  return (
    SOURCE_OPTIONS.find((item) => normalizeSourceValue(item.value) === normalizedSource)?.label ||
    normalizedSource
  );
}

function syncCurrencyUi() {
  if (!elements.currency) return;
  const settings = normalizeFxSettings(state.fxSettings);
  const fxEnabled = settings.enabled;
  const selectedCurrency = normalizeCurrency(elements.currency.value);

  if (elements.fxEnabledInput && elements.fxEnabledInput.checked !== fxEnabled) {
    elements.fxEnabledInput.checked = fxEnabled;
  }
  if (elements.usdCnyRateInput && document.activeElement !== elements.usdCnyRateInput) {
    elements.usdCnyRateInput.value = formatFxRate(settings.usdCnyRate);
  }
  if (elements.jpyCnyRateInput && document.activeElement !== elements.jpyCnyRateInput) {
    elements.jpyCnyRateInput.value = formatFxRate(settings.jpyCnyRate);
  }
  if (elements.twdCnyRateInput && document.activeElement !== elements.twdCnyRateInput) {
    elements.twdCnyRateInput.value = formatFxRate(settings.twdCnyRate);
  }
  if (elements.hkdCnyRateInput && document.activeElement !== elements.hkdCnyRateInput) {
    elements.hkdCnyRateInput.value = formatFxRate(settings.hkdCnyRate);
  }

  elements.currency.querySelectorAll("option").forEach((option) => {
    option.disabled = !fxEnabled && option.value !== "CNY";
  });

  if (!fxEnabled && selectedCurrency !== "CNY") {
    elements.currency.value = "CNY";
  } else {
    elements.currency.value = selectedCurrency;
  }

  if (elements.currencyNote) {
    const currentCurrency = normalizeCurrency(elements.currency.value);
    if (!fxEnabled) {
      elements.currencyNote.textContent = "固定汇率关闭时仅允许人民币。";
    } else if (currentCurrency === "USD") {
      elements.currencyNote.textContent = `当前按 USD/CNY ${formatFxRate(settings.usdCnyRate)} 折算人民币统计。`;
    } else if (currentCurrency === "JPY") {
      elements.currencyNote.textContent = `当前按 JPY/CNY ${formatFxRate(settings.jpyCnyRate)} 折算人民币统计。`;
    } else if (currentCurrency === "TWD") {
      elements.currencyNote.textContent = `当前按 TWD/CNY ${formatFxRate(settings.twdCnyRate)} 折算人民币统计。`;
    } else if (currentCurrency === "HKD") {
      elements.currencyNote.textContent = `当前按 HKD/CNY ${formatFxRate(settings.hkdCnyRate)} 折算人民币统计。`;
    } else {
      elements.currencyNote.textContent = "人民币订单按原值统计。";
    }
  }

  updateFeeModeUi();
}

function applyOrderFxSnapshot(order) {
  const settings = normalizeFxSettings(state.fxSettings);
  const currency = normalizeCurrency(order.currency);
  if (!settings.enabled) {
    return normalizeOrder({
      ...order,
      currency: "CNY",
      fxRateSnapshot: null,
    });
  }
  if (currency === "CNY") {
    return normalizeOrder({
      ...order,
      currency,
      fxRateSnapshot: null,
    });
  }
  return normalizeOrder({
    ...order,
    currency,
    fxRateSnapshot: getConfiguredFxRate(currency, settings),
  });
}

function updateFeeModeUi() {
  if (!elements.amountLabel || !elements.feeMode) return;
  const feeMode = normalizeFeeMode(elements.feeMode.value);
  const usageType = normalizeUsageType(elements.usageType?.value);
  const currency = normalizeCurrency(elements.currency?.value);
  const suffixParts = [];
  if (usageType !== "私用") suffixParts.push("基价");
  if (currency !== "CNY") suffixParts.push("原币");
  const suffix = suffixParts.length ? `（${suffixParts.join("，")}）` : "";
  elements.amountLabel.textContent =
    feeMode === "mhs_project"
      ? `到手稿费${suffix}`
      : feeMode === "mhs_window"
        ? `橱窗标价${suffix}`
        : `总稿费${suffix}`;
}

function syncUsageRateUi({ previewOnly = false } = {}) {
  if (!elements.usageType || !elements.usageRate || !elements.usageRateNote) return;

  const usageType = normalizeUsageType(elements.usageType.value);
  const usageRate = normalizeUsageRate(parseUsageRateInput(elements.usageRate.value), usageType);
  const privateUse = usageType === "私用";
  const canEditOrders = state.mode === "local" || Boolean(state.user);

  if (!previewOnly) {
    elements.usageType.value = usageType;
    elements.usageRate.value = formatUsageRatePercent(usageRate);
  }

  elements.usageRate.disabled = !canEditOrders || privateUse || state.busy;
  if (privateUse) {
    elements.usageRateNote.textContent = "私用默认不加价。";
    return;
  }

  const currency = normalizeCurrency(elements.currency?.value);
  const amount = normalizeMoneyValue(elements.amount?.value);
  const surcharge = roundMoney(amount * usageRate);
  const total = roundMoney(amount + surcharge);
  const previewOrder = normalizeOrder({
    currency,
    fxRateSnapshot:
      normalizeFxSettings(state.fxSettings).enabled && currency !== "CNY"
        ? getConfiguredFxRate(currency)
        : null,
  });
  const surchargeText = formatMoneyWithOriginal(convertMoneyToCny(surcharge, previewOrder), surcharge, currency);
  const totalText = formatMoneyWithOriginal(convertMoneyToCny(total, previewOrder), total, currency);
  elements.usageRateNote.textContent =
    surcharge > 0
      ? `${usageType}加价约 ${surchargeText}，当前结算基数约 ${totalText}。`
      : `${usageType}可填写加价比例，自动计入结算收入。`;
}

function renderWorkHoursPreview() {
  if (!elements.workHoursNote) return;

  const finished = Boolean(elements.completedDate?.value) || CLOSED_STATUSES.has(elements.status?.value);
  if (elements.workHoursLabel) {
    elements.workHoursLabel.textContent = finished ? "实际工时（小时，可选）" : "预计工时（小时，可选）";
  }

  const workHours = sanitizeWorkHours(elements.workHours?.value);
  if (!workHours) {
    elements.workHoursNote.textContent = finished
      ? "这里填实际花掉的总工时；如果是完稿后补录，也可以直接去列表里点工时标签修改。"
      : "先填大概会花多久；完稿后再到列表里点工时标签，把它改成实际工时。";
    return;
  }

  const previewSource = normalizeSourceValue(elements.source?.value) || SOURCES[0];
  const previewFeeMode = elements.feeMode?.value || "standard";
  const previewCurrency = normalizeCurrency(elements.currency?.value);
  const fxEnabled = normalizeFxSettings(state.fxSettings).enabled;
  const previewOrder = normalizeOrder({
    source: previewSource,
    feeMode: previewFeeMode,
    currency: previewCurrency,
    fxRateSnapshot:
      fxEnabled && previewCurrency !== "CNY"
        ? getConfiguredFxRate(previewCurrency)
        : null,
    amount: Number(elements.amount?.value || 0),
    usageType: elements.usageType?.value || USAGE_TYPES[0],
    usageRate: parseUsageRateInput(elements.usageRate?.value),
    feeRate:
      elements.feeRate?.value === ""
        ? getDefaultFeeRate(previewSource, previewFeeMode)
        : parseFeeRateInput(elements.feeRate?.value),
    workHours,
  });
  const hourlyRate = calculateHourlyRate(previewOrder);

  if (hourlyRate == null) {
    elements.workHoursNote.textContent = finished
      ? `已记录实际工时 ${formatHours(workHours)} 小时，但当前预计实得为 ¥0.00，暂时算不出参考时薪。`
      : `当前先按预计工时 ${formatHours(workHours)} 小时估算；完稿后再改成实际工时会更准。`;
    return;
  }

  elements.workHoursNote.textContent = finished
    ? `已记录实际工时 ${formatHours(workHours)} 小时，按预计实得计算，参考时薪约 ${formatCnyMoney(hourlyRate)}/小时。`
    : `当前先按预计工时 ${formatHours(workHours)} 小时估算，参考时薪约 ${formatCnyMoney(hourlyRate)}/小时；完稿后记得改成实际工时。`;
}

function normalizeOrder(input = {}) {
  const source = normalizeSourceValue(input.source) || SOURCES[0];
  const feeMode = normalizeFeeMode(input.feeMode);
  const amount = normalizeMoneyValue(input.amount);
  const receivedAmount = normalizeMoneyValue(input.receivedAmount);
  const usageType = normalizeUsageType(input.usageType);
  const usageRate = normalizeUsageRate(input.usageRate, usageType);
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
  const fxRateSnapshot = normalizeFxRateSnapshot(input.fxRateSnapshot, currency);
  const calendarColor = normalizeCalendarColor(input.calendarColor);
  const exceptionPreviousStatus = input.exceptionPreviousStatus || null;
  const baseStatus = input.status || STATUSES[0];
  const status =
    exceptionType === "无" && baseStatus === "已处理"
      ? exceptionPreviousStatus || "进行中"
      : baseStatus;

  return {
    id: input.id || crypto.randomUUID(),
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
    priority: input.priority || PRIORITIES[0],
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

function rowToOrder(row) {
  return normalizeOrder({
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
    amount: row.amount,
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
  });
}

function orderToRow(order, userId) {
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
    amount: normalizeMoneyValue(order.amount),
    received_amount: normalizeMoneyValue(order.receivedAmount),
    payment_status: normalizePaymentStatus(order),
    fee_rate: Number(order.feeRate || 0),
    start_date: order.startDate || null,
    due_date: order.dueDate,
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

function businessTemplateRowToRecord(row) {
  return normalizeBusinessTemplate({
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
    amount: row.amount,
    receivedAmount: row.received_amount,
    paymentStatus: row.payment_status,
    workHours: row.work_hours,
    status: row.status,
    exceptionType: row.exception_type,
    notes: row.notes,
    updatedAt: row.updated_at,
  });
}

function businessTemplateToRow(template, userId) {
  const normalized = normalizeBusinessTemplate(template);
  return {
    user_id: userId,
    project_name: normalized.projectName,
    business_type: normalized.businessType,
    production_stage: normalized.productionStage,
    source: normalized.source,
    fee_mode: normalized.feeMode,
    fee_rate: normalized.feeRate,
    usage_type: normalized.usageType,
    usage_rate: normalized.usageRate,
    currency: normalized.currency,
    fx_rate_snapshot: normalizeFxRateSnapshot(normalized.fxRateSnapshot, normalized.currency),
    priority: normalized.priority,
    amount: normalizeMoneyValue(normalized.amount),
    received_amount: normalizeMoneyValue(normalized.receivedAmount),
    payment_status: normalized.paymentStatus,
    work_hours: sanitizeWorkHours(normalized.workHours),
    status: normalized.status,
    exception_type: normalized.exceptionType || "无",
    notes: normalized.notes,
    updated_at: normalized.updatedAt || new Date().toISOString(),
  };
}

function updateAuthUi(message) {
  elements.authMessage.textContent = message;
}

function setBusy(nextBusy) {
  state.busy = nextBusy;
  renderSyncPanel();
}

function hasTurnstileConfig() {
  return Boolean(config.turnstileSiteKey);
}

function hasCloudConfig() {
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}

function getTurnstileNote() {
  if (!hasTurnstileConfig()) {
    return "管理员还没配置 Cloudflare Turnstile，当前不能注册、登录、重发验证邮件或找回密码。";
  }
  if (!state.turnstileRequested) {
    return "点登录、注册、重发验证邮件或忘记密码后，才会按需加载人机验证。";
  }
  if (state.turnstileStatus === "loading") {
    return "人机验证正在加载，等一下就能继续登录或发送认证邮件。";
  }
  if (state.turnstileStatus === "error") {
    return "人机验证加载失败，请点击\u201c重新加载验证\u201d重试；如果持续失败，请检查网络或刷新页面。";
  }
  if (state.turnstileStatus === "verified") {
    return "人机验证已通过，现在可以登录、注册、重发验证邮件或发送重置邮件。";
  }
  if (state.turnstileStatus === "expired") {
    return "刚才的人机验证已经过期了，请重新完成一次验证。";
  }
  return "登录、注册、重发验证邮件和忘记密码前需要先完成人机验证。";
}

function getTurnstileActionMessage() {
  if (!hasTurnstileConfig()) {
    return "管理员还没配置 Cloudflare Turnstile，当前不能注册、登录、重发验证邮件或找回密码。";
  }
  if (state.turnstileStatus === "loading") {
    return "人机验证还在加载，等一下再试。";
  }
  if (state.turnstileStatus === "error") {
    return "人机验证加载失败，请点击\u201c重新加载验证\u201d重试。";
  }
  return `请先完成人机验证，再${getTurnstileActionLabel(state.turnstilePendingAction)}。`;
}

function assertCloudUser() {
  if (!state.user) {
    throw new Error("当前还没有登录账号。");
  }
}

function normalizePaymentStatus(order) {
  if (order.paymentStatus) return order.paymentStatus;
  return inferPaymentStatus(order);
}

function inferPaymentStatus(order) {
  const amount = calculateGrossAmount(order);
  const receivedAmount = normalizeMoneyValue(order.receivedAmount);
  if (amount > 0 && receivedAmount >= amount) return "已结清";
  if (receivedAmount > 0) return "已收定金";
  return "未收款";
}

function getDefaultFeeRate(source, feeMode = "standard") {
  const normalizedSource = normalizeSourceValue(source);
  const normalizedFeeMode = normalizeFeeMode(feeMode);
  if (normalizedFeeMode === "mhs_project" || normalizedFeeMode === "mhs_window") {
    return 0.05;
  }
  return SOURCE_FEE_RATES[normalizedSource] ?? 0;
}

function parseFeeRateInput(value) {
  const parsed = Number(value || 0);
  if (!isFinite(parsed) || parsed <= 0) return 0;
  return Math.min(parsed / 100, 1);
}

function normalizeUsageType(value) {
  return USAGE_TYPES.includes(value) ? value : USAGE_TYPES[0];
}

function normalizeCurrency(value) {
  return SUPPORTED_CURRENCIES.includes(value) ? value : "CNY";
}

function normalizeUsageRate(value, usageType = USAGE_TYPES[0]) {
  if (normalizeUsageType(usageType) === "私用") return 0;
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.min(parsed, 5);
}

function parseUsageRateInput(value) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.min(parsed / 100, 5);
}

function roundMoney(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
}

function normalizeMoneyValue(value) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return roundMoney(parsed, 2);
}

function formatMoney(value) {
  return normalizeMoneyValue(value).toFixed(2);
}

function formatCnyMoney(value) {
  return `¥${formatMoney(value)}`;
}

function formatOriginalMoney(value, currency = "CNY") {
  const normalizedCurrency = normalizeCurrency(currency);
  if (normalizedCurrency === "CNY") {
    return formatCnyMoney(value);
  }
  return `${normalizedCurrency} ${formatMoney(value)}`;
}

function formatMoneyWithOriginal(cnyValue, originalValue, currency = "CNY") {
  const normalizedCurrency = normalizeCurrency(currency);
  const cnyText = formatCnyMoney(cnyValue);
  if (normalizedCurrency === "CNY") {
    return cnyText;
  }
  return `${cnyText}（${formatOriginalMoney(originalValue, normalizedCurrency)}）`;
}

function normalizeFxRateSnapshot(value, currency = "CNY") {
  const normalizedCurrency = normalizeCurrency(currency);
  if (normalizedCurrency === "CNY") return null;
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) return roundMoney(parsed, 6);
  return roundMoney(getConfiguredFxRate(normalizedCurrency), 6);
}

function getConfiguredFxRate(currency, settings = state.fxSettings) {
  const normalizedCurrency = normalizeCurrency(currency);
  const normalizedSettings = normalizeFxSettings(settings);
  if (normalizedCurrency === "USD") return normalizedSettings.usdCnyRate;
  if (normalizedCurrency === "JPY") return normalizedSettings.jpyCnyRate;
  if (normalizedCurrency === "TWD") return normalizedSettings.twdCnyRate;
  if (normalizedCurrency === "HKD") return normalizedSettings.hkdCnyRate;
  return 1;
}

function getOrderFxRate(order) {
  const currency = normalizeCurrency(order?.currency);
  if (currency === "CNY") return 1;
  const snapshot = Number(order?.fxRateSnapshot);
  if (Number.isFinite(snapshot) && snapshot > 0) {
    return roundMoney(snapshot, 6);
  }
  return getConfiguredFxRate(currency);
}

function convertMoneyToCny(value, order) {
  const amount = normalizeMoneyValue(value);
  if (!amount) return 0;
  return roundMoney(amount * getOrderFxRate(order), 2);
}

function formatFeeRatePercent(rate) {
  const percent = Number(rate || 0) * 100;
  return percent.toFixed(2).replace(/\.?0+$/, "");
}

function formatUsageRatePercent(rate) {
  const percent = Math.max(Number(rate || 0), 0) * 100;
  return percent.toFixed(2).replace(/\.?0+$/, "");
}

function sanitizeWorkHours(value) {
  const parsed = Number(value || 0);
  if (!isFinite(parsed) || parsed <= 0) return 0;
  return Math.round(parsed * 1000) / 1000;
}

function formatHours(value) {
  const hours = sanitizeWorkHours(value);
  return hours ? hours.toFixed(3).replace(/\.?0+$/, "") : "";
}

function formatHourlyRate(rate) {
  const parsed = Number(rate);
  if (!isFinite(parsed) || parsed <= 0) return "";
  return parsed.toFixed(2).replace(/\.?0+$/, "");
}

function calculateFeeAmount(order) {
  return calculateAdjustedFeeAmount(order);
}

function calculateNetAmount(order) {
  return calculateAdjustedNetAmount(order);
}

function calculateRefundAmount(order) {
  return normalizeMoneyValue(order.refundAmount);
}

function calculateUsageSurcharge(order) {
  const usageType = normalizeUsageType(order.usageType);
  const usageRate = normalizeUsageRate(order.usageRate, usageType);
  if (usageType === "私用" || usageRate <= 0) return 0;
  return roundMoney(normalizeMoneyValue(order.amount) * usageRate, 2);
}

function calculateGrossAmount(order) {
  return roundMoney(normalizeMoneyValue(order.amount) + calculateUsageSurcharge(order), 2);
}

function calculateEffectiveAmount(order) {
  if (order.exceptionResolution === "协商退全款") return 0;
  return roundMoney(Math.max(calculateGrossAmount(order) - calculateRefundAmount(order), 0), 2);
}

function calculateEffectiveReceived(order) {
  return roundMoney(Math.max(normalizeMoneyValue(order.receivedAmount) - calculateRefundAmount(order), 0), 2);
}

function calculateAdjustedFeeAmount(order) {
  const effectiveAmount = calculateEffectiveAmount(order);
  const rate = Number(order.feeRate || 0);
  const feeMode = normalizeFeeMode(order.feeMode);

  if (feeMode === "mhs_project") {
    return roundMoney(Math.ceil(effectiveAmount * rate), 2);
  }
  if (feeMode === "mhs_window") {
    return roundMoney(Math.floor(effectiveAmount * rate), 2);
  }
  return roundMoney(effectiveAmount * rate, 2);
}

function calculateAdjustedNetAmount(order) {
  const effectiveAmount = calculateEffectiveAmount(order);
  if (normalizeFeeMode(order.feeMode) === "mhs_project") {
    return roundMoney(effectiveAmount, 2);
  }
  return roundMoney(Math.max(effectiveAmount - calculateAdjustedFeeAmount(order), 0), 2);
}

function calculateQuotedAmount(order) {
  if (normalizeFeeMode(order.feeMode) === "mhs_project") {
    return roundMoney(calculateEffectiveAmount(order) + calculateAdjustedFeeAmount(order), 2);
  }
  return roundMoney(calculateEffectiveAmount(order), 2);
}

function calculateGrossAmountCny(order) {
  return convertMoneyToCny(calculateGrossAmount(order), order);
}

function calculateRefundAmountCny(order) {
  return convertMoneyToCny(calculateRefundAmount(order), order);
}

function calculateEffectiveAmountCny(order) {
  return convertMoneyToCny(calculateEffectiveAmount(order), order);
}

function calculateEffectiveReceivedCny(order) {
  return convertMoneyToCny(calculateEffectiveReceived(order), order);
}

function calculateAdjustedFeeAmountCny(order) {
  return convertMoneyToCny(calculateAdjustedFeeAmount(order), order);
}

function calculateAdjustedNetAmountCny(order) {
  return convertMoneyToCny(calculateAdjustedNetAmount(order), order);
}

function calculateQuotedAmountCny(order) {
  return convertMoneyToCny(calculateQuotedAmount(order), order);
}

function calculateDateSpanDays(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diff = Math.round((end - start) / (24 * 60 * 60 * 1000));
  if (!Number.isFinite(diff) || diff < 0) return null;
  return diff + 1;
}

function calculateScheduleDurations(order) {
  return {
    plannedDays: calculateDateSpanDays(order.startDate, order.dueDate),
    actualDays: calculateDateSpanDays(order.startDate, order.completedDate),
  };
}

function calculateHourlyRate(order) {
  const workHours = sanitizeWorkHours(order.workHours);
  if (!workHours) return null;
  const netAmount = calculateAdjustedNetAmountCny(order);
  if (netAmount <= 0) return null;
  return netAmount / workHours;
}

function summarizeWorkHours(list) {
  const ordersWithHours = list.filter(
    (item) => sanitizeWorkHours(item.workHours) > 0 && (Boolean(item.completedDate) || isClosed(item)),
  );
  const totalHours = ordersWithHours.reduce(
    (total, item) => total + sanitizeWorkHours(item.workHours),
    0,
  );
  const totalNet = ordersWithHours.reduce((total, item) => total + calculateAdjustedNetAmountCny(item), 0);
  return {
    count: ordersWithHours.length,
    totalHours,
    averageRate: totalHours > 0 && totalNet > 0 ? totalNet / totalHours : null,
  };
}

function sumGrossAmounts(list) {
  return roundMoney(list.reduce((total, item) => total + calculateGrossAmountCny(item), 0), 2);
}

function sumFeeAmounts(list) {
  return roundMoney(list.reduce((total, item) => total + calculateAdjustedFeeAmountCny(item), 0), 2);
}

function sumNetAmounts(list) {
  return roundMoney(list.reduce((total, item) => total + calculateAdjustedNetAmountCny(item), 0), 2);
}

function sumRefundAmounts(list) {
  return roundMoney(list.reduce((total, item) => total + calculateRefundAmountCny(item), 0), 2);
}

function sumEffectiveAmounts(list) {
  return roundMoney(list.reduce((total, item) => total + calculateEffectiveAmountCny(item), 0), 2);
}

function sumEffectiveReceivedAmounts(list) {
  return roundMoney(list.reduce((total, item) => total + calculateEffectiveReceivedCny(item), 0), 2);
}

function sumAdjustedFeeAmounts(list) {
  return roundMoney(list.reduce((total, item) => total + calculateAdjustedFeeAmountCny(item), 0), 2);
}

function sumAdjustedNetAmounts(list) {
  return roundMoney(list.reduce((total, item) => total + calculateAdjustedNetAmountCny(item), 0), 2);
}

function isAbnormal(order) {
  return ABNORMAL_EXCEPTION_TYPES.has(order.exceptionType);
}

function isUnhandledAbnormal(order) {
  return isAbnormal(order) && order.status !== "已处理";
}

function isHandledAbnormal(order) {
  return isAbnormal(order) && order.status === "已处理";
}

function isClosed(order) {
  return CLOSED_STATUSES.has(order.status);
}

function canQuickEditStage(order) {
  return !isAbnormal(order) && STAGE_EDITABLE_STATUSES.has(order.status);
}

function canQuickEditWorkHours(order) {
  return Boolean(order.completedDate) || isClosed(order);
}

function shouldAutoApplySourceFee() {
  return !state.editingId;
}

function detectFlowType() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return search.get("type") || hash.get("type") || "";
}

function clearAuthRedirect() {
  window.history.replaceState({}, document.title, window.location.pathname);
}

function currentSiteUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

function getLoggedOutAuthMessage() {
  if (hasTurnstileConfig()) {
    return "云端模式已开启。登录后每个画师只会看到自己的数据。";
  }
  return "云端模式已开启，但还没配置 Cloudflare Turnstile；当前只能登录，不能注册、重发验证邮件或找回密码。";
}

function mapAuthError(error) {
  return normalizeAuthError(error).message;
}

function normalizeAuthError(error) {
  const message = String(error?.message || error || "操作失败。");
  const lowerMessage = message.toLowerCase();
  const retryAfterSeconds = parseRetryAfterSeconds(message);
  if (lowerMessage.includes("invalid login credentials")) {
    return {
      kind: "invalid_credentials",
      retryAfterSeconds: 0,
      message:
        "邮箱或密码不对。若这个邮箱之前注册过、后来又重复点过注册，新密码不一定会覆盖旧密码；直接点“忘记密码”重设一次最稳。",
    };
  }
  if (lowerMessage.includes("email not confirmed")) {
    return {
      kind: "email_not_confirmed",
      retryAfterSeconds: 0,
      message: "这个邮箱还没完成验证。先去邮件里点验证链接，验证完成后再用邮箱和密码登录。",
    };
  }
  if (lowerMessage.includes("email rate limit exceeded")) {
    return {
      kind: "rate_limit",
      retryAfterSeconds,
      message: retryAfterSeconds
        ? `邮件发送太频繁，被 Supabase 限流了。请 ${formatDurationSeconds(retryAfterSeconds)} 后再试。`
        : "邮件发送太频繁，被 Supabase 限流了。先等一会儿再试，别连续点发送。",
    };
  }
  if (lowerMessage.includes("only request this after")) {
    return {
      kind: "rate_limit",
      retryAfterSeconds,
      message: retryAfterSeconds
        ? `请求太频繁，Supabase 暂时不再发邮件。请 ${formatDurationSeconds(retryAfterSeconds)} 后重试。`
        : "请求太频繁，Supabase 暂时不再发邮件。等一会儿再重试。",
    };
  }
  if (message.includes("Email link is invalid") || lowerMessage.includes("expired")) {
    return {
      kind: "expired_link",
      retryAfterSeconds: 0,
      message: "这个邮件链接已经失效了，请重新发送一封新的验证或重置邮件。",
    };
  }
  if (lowerMessage.includes("captcha") || lowerMessage.includes("turnstile")) {
    return {
      kind: "captcha",
      retryAfterSeconds: 0,
      message: "人机验证失败，请重新完成验证后再试；如果持续失败，请点击“重新加载验证”或更换浏览器、网络后重试。",
    };
  }
  return {
    kind: "generic",
    retryAfterSeconds: 0,
    message,
  };
}

function handleAuthActionError(error, { action, email }) {
  const normalizedError = normalizeAuthError(error);
  if (normalizedError.kind === "rate_limit") {
    const retryAfterSeconds = normalizedError.retryAfterSeconds || 60;
    startAuthCooldown(action, email, retryAfterSeconds);
    if (action === "signup" || action === "resendSignup") {
      startAuthCooldown("signup", email, retryAfterSeconds);
      startAuthCooldown("resendSignup", email, retryAfterSeconds);
    }
    updateAuthUi(getAuthRateLimitMessage(action, retryAfterSeconds));
    return;
  }
  updateAuthUi(normalizedError.message);
}

function parseRetryAfterSeconds(message) {
  const secondMatch = message.match(/after\s+(\d+)\s+seconds?/i);
  if (secondMatch) {
    return Number(secondMatch[1]);
  }
  const minuteMatch = message.match(/after\s+(\d+)\s+minutes?/i);
  if (minuteMatch) {
    return Number(minuteMatch[1]) * 60;
  }
  return 0;
}

function formatDurationSeconds(totalSeconds) {
  const seconds = Math.max(0, Math.ceil(Number(totalSeconds) || 0));
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  if (!minutes) {
    return `${restSeconds} 秒`;
  }
  if (!restSeconds) {
    return `${minutes} 分钟`;
  }
  return `${minutes} 分 ${restSeconds} 秒`;
}

function normalizeAuthEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function loadAuthCooldowns() {
  try {
    const raw = window.localStorage.getItem(AUTH_COOLDOWN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return pruneExpiredAuthCooldowns(parsed);
  } catch {
    return {};
  }
}

function saveAuthCooldowns() {
  state.authCooldowns = pruneExpiredAuthCooldowns(state.authCooldowns);
  try {
    window.localStorage.setItem(AUTH_COOLDOWN_KEY, JSON.stringify(state.authCooldowns));
  } catch {
    // Ignore storage failures and keep the in-memory cooldown state.
  }
}

function pruneExpiredAuthCooldowns(cooldowns) {
  const now = Date.now();
  return Object.fromEntries(
    Object.entries(cooldowns || {}).filter(([, endsAt]) => Number(endsAt) > now),
  );
}

function getAuthCooldownStorageKey(action, email) {
  const normalizedEmail = normalizeAuthEmail(email);
  return normalizedEmail ? `${action}:${normalizedEmail}` : "";
}

function getAuthCooldownRemaining(action, email) {
  const key = getAuthCooldownStorageKey(action, email);
  if (!key) return 0;
  const endsAt = Number(state.authCooldowns[key] || 0);
  const remainingMilliseconds = endsAt - Date.now();
  if (remainingMilliseconds <= 0) {
    if (state.authCooldowns[key]) {
      delete state.authCooldowns[key];
      saveAuthCooldowns();
    }
    return 0;
  }
  return Math.ceil(remainingMilliseconds / 1000);
}

function hasAuthCooldown(action, email) {
  return getAuthCooldownRemaining(action, email) > 0;
}

function startAuthCooldown(action, email, seconds = 60) {
  const key = getAuthCooldownStorageKey(action, email);
  if (!key) return;
  state.authCooldowns[key] = Date.now() + Math.max(1, Number(seconds) || 60) * 1000;
  saveAuthCooldowns();
  syncAuthCooldownTicker();
  renderSyncPanel();
}

function syncAuthCooldownTicker() {
  const hasCooldown = Object.keys(pruneExpiredAuthCooldowns(state.authCooldowns)).length > 0;
  if (hasCooldown && !authCooldownTicker) {
    authCooldownTicker = window.setInterval(() => {
      const nextCooldowns = pruneExpiredAuthCooldowns(state.authCooldowns);
      const changed =
        Object.keys(nextCooldowns).length !== Object.keys(state.authCooldowns).length ||
        Object.keys(nextCooldowns).some((key) => nextCooldowns[key] !== state.authCooldowns[key]);
      state.authCooldowns = nextCooldowns;
      if (changed) {
        saveAuthCooldowns();
      }
      renderSyncPanel();
      if (!Object.keys(state.authCooldowns).length) {
        window.clearInterval(authCooldownTicker);
        authCooldownTicker = null;
      }
    }, 1000);
    return;
  }
  if (!hasCooldown && authCooldownTicker) {
    window.clearInterval(authCooldownTicker);
    authCooldownTicker = null;
  }
}

function getAuthActionLabel(action, remainingSeconds) {
  const label = {
    signup: "注册",
    resendSignup: "重发验证邮件",
    forgotPassword: "忘记密码",
  }[action];
  if (!remainingSeconds) return label;
  return `${label}（${formatDurationSeconds(remainingSeconds)}）`;
}

function getAuthCooldownMessage(action, email) {
  const remainingSeconds = getAuthCooldownRemaining(action, email);
  if (!remainingSeconds) {
    return "";
  }
  return getAuthRateLimitMessage(action, remainingSeconds);
}

function getAuthRateLimitMessage(action, remainingSeconds) {
  const wait = formatDurationSeconds(remainingSeconds);
  if (action === "forgotPassword") {
    return `重置密码邮件发得太快了，请 ${wait} 后再试，先别连续点“忘记密码”。`;
  }
  return `当前邮箱的验证邮件发得太快了，请 ${wait} 后再试。先别连续点“注册”或“重发验证邮件”；如果你之前已经注册过，直接试“登录”或“忘记密码”。`;
}

function isOverdue(order) {
  if (!order.dueDate) return false;
  const today = formatDateInput(new Date());
  return order.dueDate < today && !isClosed(order) && !isAbnormal(order);
}

function openBusinessPresetDialog() {
  if (!elements.businessPresetDialog) return;
  const canEditOrders = state.mode === "local" || Boolean(state.user);
  if (!canEditOrders || state.busy || state.businessPresetBusy) return;
  elements.businessPresetDialogMessage.textContent = "";
  elements.businessPresetInput.value = "";
  renderBusinessPresetDialog();
  elements.businessPresetDialog.showModal();
}

function closeBusinessPresetDialog() {
  if (elements.businessPresetDialog?.open) {
    elements.businessPresetDialog.close();
  }
}

async function addBusinessPresetFromDialog() {
  if (state.busy || state.businessPresetBusy) return;
  const inputValue = elements.businessPresetInput.value;
  const normalized = normalizeBusinessTypeValue(inputValue);
  if (!normalized) {
    elements.businessPresetDialogMessage.textContent = "先输入业务名称。";
    return;
  }
  if (BUILT_IN_BUSINESS_TYPES.includes(normalized)) {
    elements.businessPresetDialogMessage.textContent = `「${normalized}」已经是内置业务，不用重复添加。`;
    return;
  }
  if (state.customBusinessTypes.includes(normalized)) {
    elements.businessPresetDialogMessage.textContent = `「${normalized}」已经在你的常用业务里了。`;
    return;
  }

  state.businessPresetBusy = true;
  renderSyncPanel();
  try {
    const result = await addBusinessPreset(normalized);
    elements.businessPresetInput.value = "";
    elements.businessPresetDialogMessage.textContent = result.remoteError
      ? `已添加「${normalized}」，但云端同步失败：${mapAuthError(result.remoteError)}`
      : `已添加「${normalized}」。`;
  } finally {
    state.businessPresetBusy = false;
    render();
  }
}

async function saveBusinessTemplateFromForm() {
  if (state.busy || state.businessPresetBusy) return;
  const template = buildBusinessTemplateFromForm();
  if (!template?.businessType) {
    updateAuthUi("先填写业务分类，再保存业务模板。");
    return;
  }

  state.businessPresetBusy = true;
  renderSyncPanel();
  try {
    const presetResult = await ensureBusinessPresetExists(template.businessType);
    const nextTemplates = {
      ...state.businessTemplates,
      [template.businessType]: template,
    };
    persistLocalBusinessTemplates(nextTemplates);

    let templateRemoteError = null;
    if (state.mode === "cloud" && state.user) {
      try {
        const persistedRemote = await upsertRemoteBusinessTemplates([template]);
        persistLocalBusinessTemplates({
          ...state.businessTemplates,
          ...persistedRemote,
        });
      } catch (error) {
        templateRemoteError = error;
      }
    }

    renderBusinessTypeOptions();
    renderBusinessShortcutList();
    renderBusinessPresetDialog();

    const syncErrors = [
      presetResult?.remoteError ? `常用业务：${mapAuthError(presetResult.remoteError)}` : "",
      templateRemoteError ? `模板：${mapAuthError(templateRemoteError)}` : "",
    ].filter(Boolean);
    updateAuthUi(
      syncErrors.length
        ? `已保存「${template.businessType}」模板，但云端同步失败：${syncErrors.join("；")}`
        : `已保存「${template.businessType}」模板。`,
    );
  } finally {
    state.businessPresetBusy = false;
    render();
  }
}

async function removeBusinessPresetFromDialog(value) {
  if (state.busy || state.businessPresetBusy) return;
  const normalized = normalizeBusinessTypeValue(value);
  if (!normalized || !state.customBusinessTypes.includes(normalized)) return;

  state.businessPresetBusy = true;
  renderSyncPanel();
  try {
    const result = await removeBusinessPreset(normalized);
    const syncErrors = [
      result.presetRemoteError ? `常用业务：${mapAuthError(result.presetRemoteError)}` : "",
      result.templateRemoteError ? `模板：${mapAuthError(result.templateRemoteError)}` : "",
    ].filter(Boolean);
    elements.businessPresetDialogMessage.textContent = syncErrors.length
      ? `已删除「${normalized}」，但云端同步失败：${syncErrors.join("；")}`
      : `已删除「${normalized}」。`;
  } finally {
    state.businessPresetBusy = false;
    render();
  }
}

async function removeBusinessTemplateFromDialog(value) {
  if (state.busy || state.businessPresetBusy) return;
  const normalized = normalizeBusinessTypeValue(value);
  if (!normalized || !getBusinessTemplate(normalized)) return;

  state.businessPresetBusy = true;
  renderSyncPanel();
  try {
    const result = await removeBusinessTemplate(normalized);
    elements.businessPresetDialogMessage.textContent = result.remoteError
      ? `已删除「${normalized}」模板，但云端同步失败：${mapAuthError(result.remoteError)}`
      : `已删除「${normalized}」模板。`;
  } finally {
    state.businessPresetBusy = false;
    render();
  }
}

function openExceptionDialog(id) {
  const order = state.orders.find((item) => item.id === id);
  if (!order || !isAbnormal(order) || !elements.exceptionDialog) return;

  state.exceptionDialogOrderId = id;
  elements.exceptionDialogTitle.textContent = `处理异常：${order.projectName}`;
  elements.exceptionDialogProject.textContent = order.projectName;
  elements.exceptionDialogClient.textContent = order.clientName;
  elements.exceptionDialogType.innerHTML = `<span class="chip exception ${isUnhandledAbnormal(order) ? "pending" : "resolved"}">${escapeHtml(
    order.exceptionType,
  )}</span>`;
  elements.exceptionHandledYes.checked = order.status === "已处理";
  elements.exceptionHandledNo.checked = order.status !== "已处理";
  elements.exceptionResolution.value = order.exceptionResolution || "";
  elements.exceptionRefundAmount.value =
    calculateRefundAmount(order) > 0 ? String(calculateRefundAmount(order)) : "";
  elements.exceptionNote.value = order.exceptionNote || "";
  elements.exceptionDialogMessage.textContent = "";
  syncExceptionDialogRefundUi();
  elements.exceptionDialog.showModal();
}

function openStageDialog(id) {
  const order = state.orders.find((item) => item.id === id);
  if (!order || !elements.stageDialog || !canQuickEditStage(order)) return;

  state.stageDialogOrderId = id;
  state.stageDialogDraft = order.productionStage || "";
  elements.stageDialogTitle.textContent = `切换阶段：${order.projectName}`;
  elements.stageDialogProject.textContent = order.projectName;
  elements.stageDialogClient.textContent = order.clientName;
  elements.stageDialogStatus.innerHTML = renderStaticStatusChip(order.status);
  elements.stageCustomInput.value = state.stageDialogDraft;
  elements.stageDialogMessage.textContent = "";
  renderStageOptionList();
  renderStageTimeline(order);
  elements.stageDialog.showModal();
}

function openWorkHoursDialog(id) {
  const order = state.orders.find((item) => item.id === id);
  if (!order || !elements.workHoursDialog || !canQuickEditWorkHours(order)) return;

  state.workHoursDialogOrderId = id;
  elements.workHoursDialogTitle.textContent = `${sanitizeWorkHours(order.workHours) > 0 ? "修改" : "补录"}实际工时`;
  elements.workHoursDialogProject.textContent = order.projectName;
  elements.workHoursDialogClient.textContent = order.clientName;
  elements.workHoursDialogStatus.innerHTML = renderStaticStatusChip(order.status);
  elements.workHoursDialogInput.value =
    sanitizeWorkHours(order.workHours) > 0 ? formatHours(order.workHours) : "";
  elements.workHoursDialogMessage.textContent = "";
  syncWorkHoursDialogHint();
  elements.workHoursDialog.showModal();
}

function closeExceptionDialog() {
  state.exceptionDialogOrderId = null;
  elements.exceptionDialogMessage.textContent = "";
  if (elements.exceptionDialog?.open) {
    elements.exceptionDialog.close();
  }
}

function closeStageDialog() {
  state.stageDialogOrderId = null;
  state.stageDialogDraft = "";
  elements.stageDialogMessage.textContent = "";
  if (elements.stageDialog?.open) {
    elements.stageDialog.close();
  }
}

function closeWorkHoursDialog() {
  state.workHoursDialogOrderId = null;
  elements.workHoursDialogMessage.textContent = "";
  if (elements.workHoursDialog?.open) {
    elements.workHoursDialog.close();
  }
}

function renderStageOptionList() {
  if (!elements.stageOptionList) return;
  const current = state.stageDialogDraft;
  elements.stageOptionList.innerHTML = getKnownProductionStages()
    .map((stage) => {
      const selected = stage === current ? "is-selected" : "";
      return `<button type="button" class="stage-option ${selected}" data-stage-option="${escapeHtml(
        stage,
      )}" ${state.busy ? "disabled" : ""}>${escapeHtml(stage)}</button>`;
    })
    .join("");

  elements.stageOptionList.querySelectorAll("[data-stage-option]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const value = normalizeProductionStageValue(event.currentTarget.dataset.stageOption);
      state.stageDialogDraft = value;
      elements.stageCustomInput.value = value;
      renderStageOptionList();
    });
  });
}

function renderStageTimeline(order) {
  if (!elements.stageTimelineSection || !elements.stageTimelineList) return;
  const summary = getStageTimelineSummary(order?.stageTimeline);
  if (summary.length === 0) {
    elements.stageTimelineSection.classList.add("is-hidden");
    elements.stageTimelineList.innerHTML = "";
    return;
  }
  elements.stageTimelineSection.classList.remove("is-hidden");
  const currentStage = normalizeProductionStageValue(order?.productionStage);
  elements.stageTimelineList.innerHTML = summary
    .map((entry, index) => {
      const isCurrent = entry.stage === currentStage;
      const durationText =
        index > 0
          ? (() => {
              const days = calculateStageDuration(order.stageTimeline, summary[index - 1].stage, entry.stage);
              return days != null ? `${days}天` : "";
            })()
          : "";
      return `<div class="stage-timeline-item${isCurrent ? " is-current" : ""}">
        <div class="stage-timeline-dot"></div>
        <div class="stage-timeline-content">
          <span class="stage-timeline-name">${escapeHtml(entry.stage)}</span>
          <span class="stage-timeline-date">${escapeHtml(entry.date)}</span>
          ${durationText ? `<span class="stage-timeline-duration">+${escapeHtml(durationText)}</span>` : ""}
        </div>
      </div>`;
    })
    .join("");
}

function syncWorkHoursDialogHint() {
  const order = state.orders.find((item) => item.id === state.workHoursDialogOrderId);
  if (!order || !elements.workHoursDialogHint) return;
  const hours = sanitizeWorkHours(elements.workHoursDialogInput?.value);
  if (!hours) {
    elements.workHoursDialogHint.textContent =
      "这里填实际花掉的总工时。保存后会自动重算参考时薪。";
    return;
  }

  const previewOrder = normalizeOrder({
    ...order,
    workHours: hours,
  });
  const hourlyRate = calculateHourlyRate(previewOrder);
  elements.workHoursDialogHint.textContent =
    hourlyRate != null
      ? `按 ${formatHours(hours)} 小时计算，参考时薪约 ${formatCnyMoney(hourlyRate)}/小时。`
      : `已填写 ${formatHours(hours)} 小时，但当前预计实得为 ¥0.00，暂时算不出参考时薪。`;
}

function syncExceptionDialogRefundUi() {
  const resolution = elements.exceptionResolution.value;
  const order = state.orders.find((item) => item.id === state.exceptionDialogOrderId);
  const handled = elements.exceptionHandledYes.checked;
  const showRefund = resolution === "协商退全款" || resolution === "协商退部分款";
  elements.exceptionResolution.disabled = state.busy || !handled;
  elements.refundAmountRow.classList.toggle("is-hidden", !showRefund);

  if (!handled) {
    elements.refundAmountRow.classList.add("is-hidden");
    elements.exceptionRefundAmount.disabled = true;
    elements.refundAmountNote.textContent = "";
    return;
  }

  if (!showRefund || !order) {
    elements.exceptionRefundAmount.disabled = true;
    elements.exceptionRefundAmount.value = "";
    elements.refundAmountNote.textContent = "";
    return;
  }

  if (resolution === "协商退全款") {
    const fullRefund = String(normalizeMoneyValue(order.receivedAmount));
    elements.exceptionRefundAmount.disabled = true;
    elements.exceptionRefundAmount.value = fullRefund;
    elements.refundAmountNote.textContent = "退全款会按当前已收金额自动填写。";
    return;
  }

  elements.exceptionRefundAmount.disabled = state.busy;
  elements.refundAmountNote.textContent = `退款金额需大于 0，且不能超过已收 ${formatMoneyWithOriginal(
    convertMoneyToCny(normalizeMoneyValue(order.receivedAmount), order),
    normalizeMoneyValue(order.receivedAmount),
    normalizeCurrency(order.currency),
  )}。`;
}

async function saveExceptionHandling() {
  const order = state.orders.find((item) => item.id === state.exceptionDialogOrderId);
  if (!order) return;

  const handled = elements.exceptionHandledYes.checked;
  const resolution = handled ? elements.exceptionResolution.value : "";
  const note = elements.exceptionNote.value.trim();
  const today = formatDateInput(new Date());
  let refundAmount = 0;

  if (handled && !EXCEPTION_RESOLUTIONS.includes(resolution)) {
    elements.exceptionDialogMessage.textContent = "标记为已处理时，先选择一个处理结果。";
    return;
  }

  if (resolution === "协商退全款") {
    refundAmount = normalizeMoneyValue(order.receivedAmount);
  } else if (resolution === "协商退部分款") {
    refundAmount = Number(elements.exceptionRefundAmount.value || 0);
    if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
      elements.exceptionDialogMessage.textContent = "退部分款时，请填写大于 0 的退款金额。";
      return;
    }
    if (refundAmount > normalizeMoneyValue(order.receivedAmount)) {
      elements.exceptionDialogMessage.textContent = "退款金额不能超过当前已收金额。";
      return;
    }
  }

  const nextOrder = normalizeOrder({
    ...order,
    status: handled ? "已处理" : order.status === "已处理" ? order.exceptionPreviousStatus || "进行中" : order.status,
    completedDate: handled ? order.completedDate || today : order.completedDate,
    exceptionResolution: handled ? resolution : "",
    exceptionNote: note,
    refundAmount: handled ? refundAmount : 0,
    exceptionPreviousStatus: handled
      ? order.status === "已处理"
        ? order.exceptionPreviousStatus || "进行中"
        : order.status
      : null,
  });

  setBusy(true);
  try {
    await persistOrders(
      state.orders.map((item) => (item.id === order.id ? nextOrder : item)),
      [order.id],
    );
    updateAuthUi("异常处理已保存。");
    closeExceptionDialog();
  } catch (error) {
    elements.exceptionDialogMessage.textContent = mapAuthError(error);
  } finally {
    setBusy(false);
    render();
  }
}

async function saveProductionStage() {
  const order = state.orders.find((item) => item.id === state.stageDialogOrderId);
  if (!order) return;

  const nextStage = normalizeProductionStageValue(elements.stageCustomInput.value || state.stageDialogDraft);
  const updatedTimeline = recordStageTimestamp(order.stageTimeline, order.productionStage, nextStage);
  const nextOrder = normalizeOrder({
    ...order,
    productionStage: nextStage,
    stageTimeline: updatedTimeline,
  });

  setBusy(true);
  try {
    await persistOrders(
      state.orders.map((item) => (item.id === order.id ? nextOrder : item)),
      [order.id],
    );
    updateAuthUi(nextStage ? `制作阶段已更新为「${nextStage}」。` : "制作阶段已清空。");
    closeStageDialog();
  } catch (error) {
    elements.stageDialogMessage.textContent = mapAuthError(error);
  } finally {
    setBusy(false);
    render();
  }
}

async function saveWorkHours() {
  const order = state.orders.find((item) => item.id === state.workHoursDialogOrderId);
  if (!order) return;

  const nextHours = sanitizeWorkHours(elements.workHoursDialogInput.value);
  const nextOrder = normalizeOrder({
    ...order,
    workHours: nextHours,
  });

  setBusy(true);
  try {
    await persistOrders(
      state.orders.map((item) => (item.id === order.id ? nextOrder : item)),
      [order.id],
    );
    updateAuthUi(nextHours > 0 ? "实际工时已更新。" : "实际工时已清空。");
    closeWorkHoursDialog();
  } catch (error) {
    elements.workHoursDialogMessage.textContent = mapAuthError(error);
  } finally {
    setBusy(false);
    render();
  }
}

function loadLocalOrders() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeOrder) : [];
  } catch (_error) {
    return [];
  }
}

function persistLocalOrders(orders) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  state.localBackupOrders = orders.map((item) => normalizeOrder(item));
}

function cleanupLegacyDemoData() {
  try {
    window.localStorage.removeItem("artist-commission-demo-undo-backup-v1");
  } catch (_error) {}
}

function loadLayoutPrefs() {
  try {
    const raw = window.localStorage.getItem(UI_LAYOUT_PREFS_KEY);
    if (!raw) return normalizeLayoutPrefs();
    return normalizeLayoutPrefs(JSON.parse(raw));
  } catch (_error) {
    return normalizeLayoutPrefs();
  }
}

function persistLayoutPrefs() {
  const normalized = normalizeLayoutPrefs({
    viewMode: state.viewMode,
    calendarDisplayMode: state.calendarDisplayMode,
    scheduleLayoutEditMode: state.scheduleLayoutEditMode,
    commonSectionOrder: state.commonSectionOrder,
    scheduleSectionOrder: state.scheduleSectionOrder,
    insightsSectionOrder: state.insightsSectionOrder,
    collapsedPanels: state.collapsedPanels,
    updatedAt: new Date().toISOString(),
  });
  state.viewMode = normalized.viewMode;
  state.calendarDisplayMode = normalized.calendarDisplayMode;
  state.scheduleLayoutEditMode = normalized.scheduleLayoutEditMode;
  state.commonSectionOrder = normalized.commonSectionOrder;
  state.scheduleSectionOrder = normalized.scheduleSectionOrder;
  state.insightsSectionOrder = normalized.insightsSectionOrder;
  state.collapsedPanels = normalized.collapsedPanels;
  try {
    window.localStorage.setItem(UI_LAYOUT_PREFS_KEY, JSON.stringify(normalized));
  } catch (_error) {
    // Ignore storage failures and keep in-memory settings.
  }
  return normalized;
}

function loadLocalBusinessPresets() {
  try {
    const raw = window.localStorage.getItem(BUSINESS_PRESET_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalizeBusinessPresetList(Array.isArray(parsed) ? parsed : []);
  } catch (_error) {
    return [];
  }
}

function persistLocalBusinessPresets(list) {
  const normalized = normalizeBusinessPresetList(list);
  state.customBusinessTypes = normalized;
  window.localStorage.setItem(BUSINESS_PRESET_KEY, JSON.stringify(normalized));
}

function loadLocalBusinessTemplates() {
  try {
    const raw = window.localStorage.getItem(BUSINESS_TEMPLATE_KEY);
    if (!raw) return {};
    return normalizeBusinessTemplateMap(JSON.parse(raw));
  } catch (_error) {
    return {};
  }
}

function persistLocalBusinessTemplates(templates) {
  const normalized = normalizeBusinessTemplateMap(templates);
  state.businessTemplates = normalized;
  window.localStorage.setItem(BUSINESS_TEMPLATE_KEY, JSON.stringify(normalized));
  return normalized;
}

function loadLocalClientInsightSettings() {
  try {
    const raw = window.localStorage.getItem(CLIENT_INSIGHT_SETTINGS_KEY);
    if (!raw) return normalizeClientInsightSettings();
    return normalizeClientInsightSettings(JSON.parse(raw));
  } catch (_error) {
    return normalizeClientInsightSettings();
  }
}

function loadLocalCalendarDayMarks() {
  try {
    const raw = window.localStorage.getItem(CALENDAR_DAY_MARKS_KEY);
    if (!raw) return normalizeCalendarDayMarks();
    return normalizeCalendarDayMarks(JSON.parse(raw));
  } catch (_error) {
    return normalizeCalendarDayMarks();
  }
}

function loadLocalFxSettings() {
  try {
    const raw = window.localStorage.getItem(FX_SETTINGS_KEY);
    if (!raw) return normalizeFxSettings();
    return normalizeFxSettings(JSON.parse(raw));
  } catch (_error) {
    return normalizeFxSettings();
  }
}

function persistLocalFxSettings(settings) {
  const normalized = normalizeFxSettings(settings);
  state.fxSettings = normalized;
  try {
    window.localStorage.setItem(FX_SETTINGS_KEY, JSON.stringify(normalized));
  } catch (_error) {
    // Ignore storage failures and keep in-memory settings.
  }
}

function persistLocalClientInsightSettings(settings) {
  const normalized = normalizeClientInsightSettings(settings);
  state.clientInsightSettings = normalized;
  try {
    window.localStorage.setItem(CLIENT_INSIGHT_SETTINGS_KEY, JSON.stringify(normalized));
  } catch (_error) {
    // Ignore storage failures and keep in-memory settings.
  }
}

function persistLocalCalendarDayMarks(settings) {
  const normalized = normalizeCalendarDayMarks(settings);
  state.calendarDayMarks = normalized;
  try {
    window.localStorage.setItem(CALENDAR_DAY_MARKS_KEY, JSON.stringify(normalized));
  } catch (_error) {
    // Ignore storage failures and keep in-memory settings.
  }
  return normalized;
}

function normalizeLayoutPrefs(input = {}) {
  const legacyCollapsedPanels = {
    ...(input.scheduleCollapsedPanels || {}),
    ...(typeof input.clientsCollapsed === "boolean" ? { clients: input.clientsCollapsed } : {}),
  };
  return {
    viewMode: normalizeViewMode(input.viewMode, VIEW_MODE_SCHEDULE),
    calendarDisplayMode: normalizeCalendarDisplayMode(input.calendarDisplayMode, CALENDAR_DISPLAY_TAGS),
    scheduleLayoutEditMode: typeof input.scheduleLayoutEditMode === "boolean" ? input.scheduleLayoutEditMode : false,
    commonSectionOrder: normalizeSectionOrder(input.commonSectionOrder, DEFAULT_COMMON_SECTION_ORDER),
    scheduleSectionOrder: normalizeSectionOrder(input.scheduleSectionOrder, DEFAULT_SCHEDULE_SECTION_ORDER),
    insightsSectionOrder: normalizeSectionOrder(input.insightsSectionOrder, DEFAULT_INSIGHTS_SECTION_ORDER),
    collapsedPanels: normalizeCollapsedPanels(input.collapsedPanels || legacyCollapsedPanels),
    updatedAt: normalizeIsoTimestamp(input.updatedAt),
  };
}

function normalizeSectionOrder(input, defaultOrder = []) {
  const values = Array.isArray(input) ? input.filter((value) => defaultOrder.includes(value)) : [];
  const unique = [];
  values.forEach((value) => {
    if (!unique.includes(value)) unique.push(value);
  });
  defaultOrder.forEach((value) => {
    if (!unique.includes(value)) unique.push(value);
  });
  return unique;
}

function normalizeCollapsedPanels(input = {}) {
  const normalized = {};
  LAYOUT_PANEL_IDS.forEach((id) => {
    normalized[id] = Boolean(input?.[id]);
  });
  return normalized;
}

function normalizeViewMode(value, fallback = VIEW_MODE_SCHEDULE) {
  return VIEW_MODES.includes(value) ? value : fallback;
}

function normalizeCalendarDisplayMode(value, fallback = CALENDAR_DISPLAY_TAGS) {
  return CALENDAR_DISPLAY_MODES.includes(value) ? value : fallback;
}

function normalizeClientInsightSettings(input = {}) {
  return {
    vipThreshold: normalizeVipThreshold(input.vipThreshold, DEFAULT_VIP_THRESHOLD),
    updatedAt: normalizeIsoTimestamp(input.updatedAt),
  };
}

function normalizeCalendarDayMarkType(value) {
  return CALENDAR_DAY_MARK_TYPES.includes(value) ? value : "";
}

function normalizeCalendarDayMarks(input = {}) {
  const rawMarks =
    input && typeof input.marks === "object" && input.marks && !Array.isArray(input.marks)
      ? input.marks
      : input;
  const marks = {};
  if (rawMarks && typeof rawMarks === "object" && !Array.isArray(rawMarks)) {
    Object.entries(rawMarks).forEach(([dateKey, value]) => {
      const safeDate = normalizeDateKey(dateKey);
      const type = normalizeCalendarDayMarkType(typeof value === "string" ? value : value?.type);
      if (!safeDate || !type) return;
      marks[safeDate] = type;
    });
  }
  return {
    marks,
    updatedAt: normalizeIsoTimestamp(input.updatedAt || input.calendarDayMarksUpdatedAt),
  };
}

function normalizeFxSettings(input = {}) {
  return {
    enabled: Boolean(input.enabled),
    usdCnyRate: normalizeFxRate(input.usdCnyRate, DEFAULT_USD_CNY_RATE),
    jpyCnyRate: normalizeFxRate(input.jpyCnyRate, DEFAULT_JPY_CNY_RATE),
    twdCnyRate: normalizeFxRate(input.twdCnyRate, DEFAULT_TWD_CNY_RATE),
    hkdCnyRate: normalizeFxRate(input.hkdCnyRate, DEFAULT_HKD_CNY_RATE),
    updatedAt: normalizeIsoTimestamp(input.updatedAt),
  };
}

function parseFxRateInput(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return roundMoney(parsed, 6);
}

function normalizeFxRate(value, fallback) {
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

function formatFxRate(value) {
  const normalized = normalizeFxRate(value, 1);
  return normalized.toFixed(6).replace(/\.?0+$/, "");
}

function parseVipThresholdInput(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed);
}

function normalizeVipThreshold(value, fallback = DEFAULT_VIP_THRESHOLD) {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return Math.round(parsed);
  }
  const fallbackParsed = Number(fallback);
  if (Number.isFinite(fallbackParsed) && fallbackParsed >= 0) {
    return Math.round(fallbackParsed);
  }
  return DEFAULT_VIP_THRESHOLD;
}

function normalizeIsoTimestamp(value) {
  const parsed = Date.parse(String(value || ""));
  if (!Number.isFinite(parsed)) return "";
  return new Date(parsed).toISOString();
}

function getSettingsTimestamp(value) {
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function loadBackgroundTheme() {
  try {
    return normalizeHexColor(window.localStorage.getItem(BACKGROUND_THEME_KEY), DEFAULT_BACKGROUND_HEX);
  } catch (_error) {
    return DEFAULT_BACKGROUND_HEX;
  }
}

function persistBackgroundTheme(color) {
  const normalized = normalizeHexColor(color, DEFAULT_BACKGROUND_HEX);
  state.backgroundColor = normalized;
  try {
    window.localStorage.setItem(BACKGROUND_THEME_KEY, normalized);
  } catch (_error) {
    // Ignore storage failures and keep current in-memory theme.
  }
}

function loadLastTemplate() {
  try {
    const raw = window.localStorage.getItem(LAST_TEMPLATE_KEY);
    if (!raw) return null;
    return normalizeOrder(JSON.parse(raw));
  } catch (_error) {
    return null;
  }
}

function saveLastTemplate(order) {
  state.lastTemplate = normalizeOrder(order);
  window.localStorage.setItem(LAST_TEMPLATE_KEY, JSON.stringify(state.lastTemplate));
}

function sumBy(list, key) {
  return list.reduce((total, item) => total + Number(item[key] || 0), 0);
}

function shiftMonth(date, offset) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function currentMonthDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function parseMonthInput(value) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function applyBackgroundTheme(color) {
  const normalized = normalizeHexColor(color, DEFAULT_BACKGROUND_HEX);
  const palette = buildBackgroundPalette(normalized);
  const root = document.documentElement;
  root.style.setProperty("--bg", normalized);
  root.style.setProperty("--bg-accent", palette.accent);
  root.style.setProperty("--bg-top", palette.top);
  root.style.setProperty("--bg-mid", palette.mid);
  root.style.setProperty("--bg-bottom", palette.bottom);
  root.style.setProperty("--bg-radial-warm", palette.radialWarm);
  root.style.setProperty("--bg-radial-cool", palette.radialCool);
  state.backgroundColor = normalized;
  if (elements.backgroundColorInput && elements.backgroundColorInput.value !== normalized) {
    elements.backgroundColorInput.value = normalized;
  }
}

function buildBackgroundPalette(hexColor) {
  const base = hexToRgb(hexColor);
  const white = { r: 255, g: 255, b: 255 };
  const warmAnchor = { r: 216, g: 107, b: 45 };
  const coolAnchor = { r: 111, g: 157, b: 156 };
  const accentRgb = mixRgb(base, warmAnchor, 0.2);
  const top = rgbToHex(mixRgb(base, white, 0.26));
  const mid = rgbToHex(mixRgb(base, white, 0.16));
  const bottom = rgbToHex(mixRgb(base, white, 0.3));
  const radialWarm = rgbToRgba(mixRgb(base, warmAnchor, 0.5), 0.2);
  const radialCool = rgbToRgba(mixRgb(base, coolAnchor, 0.5), 0.18);
  return {
    accent: rgbToHex(accentRgb),
    top,
    mid,
    bottom,
    radialWarm,
    radialCool,
  };
}

function normalizeHexColor(value, fallback = DEFAULT_BACKGROUND_HEX) {
  const raw = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
    return raw.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    const compact = raw.slice(1);
    return `#${compact[0]}${compact[0]}${compact[1]}${compact[1]}${compact[2]}${compact[2]}`.toLowerCase();
  }
  return fallback;
}

function hexToRgb(hexColor) {
  const normalized = normalizeHexColor(hexColor, DEFAULT_BACKGROUND_HEX).slice(1);
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function mixRgb(base, target, ratio) {
  const rate = Math.max(0, Math.min(1, Number(ratio) || 0));
  return {
    r: Math.round(base.r + (target.r - base.r) * rate),
    g: Math.round(base.g + (target.g - base.g) * rate),
    b: Math.round(base.b + (target.b - base.b) * rate),
  };
}

function rgbToHex(rgb) {
  const r = Math.max(0, Math.min(255, Math.round(rgb.r)));
  const g = Math.max(0, Math.min(255, Math.round(rgb.g)));
  const b = Math.max(0, Math.min(255, Math.round(rgb.b)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b
    .toString(16)
    .padStart(2, "0")}`;
}

function rgbToRgba(rgb, alpha) {
  const r = Math.max(0, Math.min(255, Math.round(rgb.r)));
  const g = Math.max(0, Math.min(255, Math.round(rgb.g)));
  const b = Math.max(0, Math.min(255, Math.round(rgb.b)));
  const a = Math.max(0, Math.min(1, Number(alpha) || 0));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function syncMonthFilter() {
  state.filters.month = `${state.calendarMonth.getFullYear()}-${String(
    state.calendarMonth.getMonth() + 1,
  ).padStart(2, "0")}`;
  elements.monthFilter.value = state.filters.month;
}

function formatDateInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function parseDateKey(value) {
  const safe = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(safe)) return null;
  const [year, month, day] = safe.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return formatDateInput(date) === safe ? date : null;
}

function normalizeDateKey(value) {
  const parsed = parseDateKey(value);
  return parsed ? formatDateInput(parsed) : "";
}

function addDaysToDateKey(value, offsetDays = 0) {
  const parsed = parseDateKey(value);
  if (!parsed) return "";
  const date = new Date(parsed);
  date.setDate(date.getDate() + (Number(offsetDays) || 0));
  return formatDateInput(date);
}

function daysBetweenDateKeys(startKey, endKey) {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  if (!start || !end) return null;
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / 86400000);
}

function maxDateKey(left, right) {
  const safeLeft = normalizeDateKey(left);
  const safeRight = normalizeDateKey(right);
  if (!safeLeft) return safeRight;
  if (!safeRight) return safeLeft;
  return safeLeft >= safeRight ? safeLeft : safeRight;
}

function minDateKey(left, right) {
  const safeLeft = normalizeDateKey(left);
  const safeRight = normalizeDateKey(right);
  if (!safeLeft) return safeRight;
  if (!safeRight) return safeLeft;
  return safeLeft <= safeRight ? safeLeft : safeRight;
}

function normalizeCalendarColor(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
    return raw.toLowerCase();
  }
  return "";
}

function downloadFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const safe = String(value ?? "");
  if (safe.includes(",") || safe.includes('"') || safe.includes("\n")) {
    return `"${safe.replaceAll('"', '""')}"`;
  }
  return safe;
}

async function copyTextToClipboard(value) {
  const text = String(value ?? "");
  if (!text) return false;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_error) {
      // Fallback to execCommand below.
    }
  }

  try {
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.top = "-9999px";
    document.body.append(input);
    input.select();
    input.setSelectionRange(0, input.value.length);
    const copied = document.execCommand("copy");
    input.remove();
    return copied;
  } catch (_error) {
    return false;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
