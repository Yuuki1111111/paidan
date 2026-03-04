import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const STORAGE_KEY = "artist-commission-desk-v1";
const LAST_TEMPLATE_KEY = "artist-commission-last-template-v1";
const TABLE_NAME = "commission_orders";

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
const SOURCES = ["米画师", "画加", "私单", "橱窗", "熟人转介绍", "社媒引流"];
const SOURCE_OPTIONS = [
  { value: "米画师", label: "米画师企划邀请" },
  { value: "画加", label: "画加" },
  { value: "私单", label: "私单" },
  { value: "橱窗", label: "米画师橱窗" },
  { value: "熟人转介绍", label: "熟人转介绍" },
  { value: "社媒引流", label: "社媒引流" },
];
const FEE_MODES = [
  { value: "standard", label: "默认按比例" },
  { value: "mhs_project", label: "米画师企划邀请（按到手价）" },
  { value: "mhs_window", label: "米画师橱窗（满20减1）" },
];
const PRIORITIES = ["普通", "加急", "特快"];
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
  私单: 0,
  橱窗: 0,
  熟人转介绍: 0,
  社媒引流: 0,
};

const DEMO_ORDERS = [
  {
    projectName: "圆框 34",
    clientName: "老板-A17",
    businessType: "头像",
    source: "米画师",
    feeMode: "mhs_project",
    priority: "特快",
    amount: 180,
    receivedAmount: 180,
    paymentStatus: "已结清",
    feeRate: 0.05,
    dueDate: "2026-03-04",
    completedDate: "2026-03-04",
    status: "已付款",
    productionStage: "完稿",
    exceptionType: "无",
    notes: "双人头像，晚上交稿。",
  },
  {
    projectName: "学院 OC 设定",
    clientName: "老板-K21",
    businessType: "OC设计",
    source: "私单",
    feeMode: "standard",
    priority: "普通",
    amount: 680,
    receivedAmount: 200,
    paymentStatus: "已收定金",
    feeRate: 0,
    dueDate: "2026-03-09",
    completedDate: "",
    status: "进行中",
    productionStage: "细化",
    exceptionType: "无",
    notes: "要含三视图配色说明。",
  },
  {
    projectName: "草服设 12",
    clientName: "老板-M88",
    businessType: "服设",
    source: "画加",
    feeMode: "standard",
    priority: "普通",
    amount: 320,
    receivedAmount: 0,
    paymentStatus: "未收款",
    feeRate: 0.0525,
    dueDate: "2026-03-12",
    completedDate: "",
    status: "排期中",
    productionStage: "草稿",
    exceptionType: "无",
    notes: "先出黑白草图。",
  },
  {
    projectName: "半身插图",
    clientName: "老板-L02",
    businessType: "插画",
    source: "熟人转介绍",
    feeMode: "standard",
    priority: "加急",
    amount: 450,
    receivedAmount: 200,
    paymentStatus: "已收定金",
    feeRate: 0,
    dueDate: "2026-03-15",
    completedDate: "",
    status: "待交付",
    productionStage: "铺色",
    exceptionType: "无",
    notes: "修两次内。",
  },
  {
    projectName: "直播间橱窗图",
    clientName: "工作室-31",
    businessType: "橱窗",
    source: "橱窗",
    feeMode: "mhs_window",
    priority: "普通",
    amount: 260,
    receivedAmount: 0,
    paymentStatus: "未收款",
    feeRate: 0.05,
    dueDate: "2026-03-18",
    completedDate: "",
    status: "已处理",
    productionStage: "草稿",
    exceptionType: "金主异常",
    notes: "尺寸 3:4。",
  },
  {
    projectName: "立绘加背景",
    clientName: "老板-R09",
    businessType: "立绘",
    source: "米画师",
    feeMode: "mhs_project",
    priority: "加急",
    amount: 1280,
    receivedAmount: 600,
    paymentStatus: "已收定金",
    feeRate: 0.05,
    dueDate: "2026-03-25",
    completedDate: "",
    status: "排期中",
    productionStage: "线稿",
    exceptionType: "无",
    notes: "可拆分尾款。",
  },
];

const rawConfig = window.APP_CONFIG || {};
const config = {
  supabaseUrl: rawConfig.SUPABASE_URL || "",
  supabaseAnonKey: rawConfig.SUPABASE_ANON_KEY || "",
};

const state = {
  orders: [],
  localBackupOrders: loadLocalOrders(),
  filters: {
    month: currentMonthKey(),
    status: "all",
    stage: "all",
    source: "all",
    exception: "all",
    payment: "all",
    search: "",
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
  selectedOrderIds: new Set(),
  lastTemplate: loadLastTemplate(),
  exceptionDialogOrderId: null,
  stageDialogOrderId: null,
  stageDialogDraft: "",
};

const elements = {
  monthFilter: document.querySelector("#month-filter"),
  statusFilter: document.querySelector("#status-filter"),
  stageFilter: document.querySelector("#stage-filter"),
  sourceFilter: document.querySelector("#source-filter"),
  exceptionFilter: document.querySelector("#exception-filter"),
  paymentFilter: document.querySelector("#payment-filter"),
  searchFilter: document.querySelector("#search-filter"),
  statsGrid: document.querySelector("#stats-grid"),
  breakdownList: document.querySelector("#breakdown-list"),
  calendarGrid: document.querySelector("#calendar-grid"),
  calendarTitle: document.querySelector("#calendar-title"),
  tableBody: document.querySelector("#orders-table-body"),
  tableSummary: document.querySelector("#table-summary"),
  form: document.querySelector("#order-form"),
  formTitle: document.querySelector("#form-title"),
  hiddenId: document.querySelector("#order-id"),
  projectName: document.querySelector("#project-name"),
  clientName: document.querySelector("#client-name"),
  businessType: document.querySelector("#business-type"),
  businessTypeOptions: document.querySelector("#business-type-options"),
  productionStage: document.querySelector("#production-stage"),
  productionStageOptions: document.querySelector("#production-stage-options"),
  source: document.querySelector("#source"),
  feeMode: document.querySelector("#fee-mode"),
  feeRate: document.querySelector("#fee-rate"),
  amountLabel: document.querySelector("#amount-label"),
  priority: document.querySelector("#priority"),
  amount: document.querySelector("#amount"),
  receivedAmount: document.querySelector("#received-amount"),
  paymentStatus: document.querySelector("#payment-status"),
  dueDate: document.querySelector("#due-date"),
  completedDate: document.querySelector("#completed-date"),
  status: document.querySelector("#status"),
  exceptionType: document.querySelector("#exception-type"),
  notes: document.querySelector("#notes"),
  seedDemo: document.querySelector("#seed-demo"),
  exportJson: document.querySelector("#export-json"),
  importJson: document.querySelector("#import-json"),
  exportCsv: document.querySelector("#export-csv"),
  prevMonth: document.querySelector("#prev-month"),
  nextMonth: document.querySelector("#next-month"),
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
  stageDialog: document.querySelector("#stage-dialog"),
  stageDialogClose: document.querySelector("#stage-dialog-close"),
  stageDialogTitle: document.querySelector("#stage-dialog-title"),
  stageDialogProject: document.querySelector("#stage-dialog-project"),
  stageDialogClient: document.querySelector("#stage-dialog-client"),
  stageDialogStatus: document.querySelector("#stage-dialog-status"),
  stageOptionList: document.querySelector("#stage-option-list"),
  stageCustomInput: document.querySelector("#stage-custom-input"),
  stageDialogMessage: document.querySelector("#stage-dialog-message"),
  saveStage: document.querySelector("#save-stage"),
  clearStage: document.querySelector("#clear-stage"),
  cancelStage: document.querySelector("#cancel-stage"),
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
  syncModeLabel: document.querySelector("#sync-mode-label"),
  syncModeNote: document.querySelector("#sync-mode-note"),
  syncUser: document.querySelector("#sync-user"),
};

await bootstrap();

async function bootstrap() {
  renderBusinessTypeOptions();
  renderProductionStageOptions();
  fillSelectWithItems(elements.source, SOURCE_OPTIONS);
  fillSelectWithItems(elements.feeMode, FEE_MODES);
  fillSelect(elements.priority, PRIORITIES);
  fillSelect(elements.status, STATUSES);
  fillSelect(elements.exceptionType, EXCEPTION_TYPES);
  fillSelect(elements.paymentStatus, PAYMENT_STATUSES);
  fillSelect(elements.exceptionResolution, EXCEPTION_RESOLUTIONS, false, "请选择");
  fillSelect(elements.statusFilter, STATUSES, true);
  fillSelect(elements.exceptionFilter, EXCEPTION_TYPES, true);
  fillSelectWithItems(elements.sourceFilter, SOURCE_OPTIONS, true);
  fillSelect(elements.paymentFilter, PAYMENT_STATUSES, true);
  fillSelect(
    elements.batchExceptionType,
    EXCEPTION_TYPES.filter((type) => type !== "无"),
  );

  bindEvents();
  resetForm();
  render();

  if (state.mode === "cloud") {
    initializeSupabase();
    await restoreSession();
  } else {
    state.orders = state.localBackupOrders;
    updateAuthUi("当前是本地模式。未配置 Supabase 时，数据只保存在浏览器。");
  }

  render();
}

function bindEvents() {
  elements.monthFilter.value = state.filters.month;

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
    state.filters.source = event.target.value;
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

  elements.form.addEventListener("submit", handleSubmit);
  elements.duplicateLast.addEventListener("click", duplicatePreviousOrder);
  elements.resetForm.addEventListener("click", resetForm);
  elements.businessType.addEventListener("blur", () => {
    elements.businessType.value = normalizeBusinessTypeValue(elements.businessType.value);
  });
  elements.productionStage.addEventListener("blur", () => {
    elements.productionStage.value = normalizeProductionStageValue(elements.productionStage.value);
  });
  elements.source.addEventListener("change", (event) => {
    if (shouldAutoApplySourceFee()) {
      const nextFeeMode = getSuggestedFeeMode(event.target.value);
      elements.feeMode.value = nextFeeMode;
      elements.feeRate.value = formatFeeRatePercent(
        getDefaultFeeRate(event.target.value, nextFeeMode),
      );
    }
    updateFeeModeUi();
  });
  elements.feeMode.addEventListener("change", () => {
    elements.feeRate.value = formatFeeRatePercent(
      getDefaultFeeRate(elements.source.value, elements.feeMode.value),
    );
    updateFeeModeUi();
  });
  elements.seedDemo.addEventListener("click", () => replaceAllOrders(DEMO_ORDERS));
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
}

function initializeSupabase() {
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
}

async function applyAuthSessionState() {
  if (state.user) {
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
    state.orders = [];
    if (detectFlowType() === "signup") {
      updateAuthUi("邮箱验证链接已打开，请返回登录状态继续使用。");
      clearAuthRedirect();
    } else {
      updateAuthUi("云端模式已开启。登录后每个画师只会看到自己的数据。");
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
    updateAuthUi("云端模式已开启。登录后每个画师只会看到自己的数据。");
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

  setBusy(true);
  const { data, error } = await state.supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: currentSiteUrl(),
    },
  });
  setBusy(false);

  if (error) {
    updateAuthUi(mapAuthError(error));
    return;
  }

  if (data.session) {
    updateAuthUi("注册成功，已自动登录。");
  } else {
    updateAuthUi("注册成功，请去邮箱点验证链接。没收到可以点“重发验证邮件”。");
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

  setBusy(true);
  const { error } = await state.supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: currentSiteUrl(),
    },
  });
  setBusy(false);

  if (error) {
    updateAuthUi(mapAuthError(error));
  } else {
    updateAuthUi("验证邮件已重新发送，请检查邮箱。");
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

  setBusy(true);
  const { error } = await state.supabase.auth.resetPasswordForEmail(email, {
    redirectTo: currentSiteUrl(),
  });
  setBusy(false);

  if (error) {
    updateAuthUi(mapAuthError(error));
  } else {
    updateAuthUi("重置密码邮件已发送，请去邮箱点开链接后回到当前页面。");
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

  setBusy(true);
  const { error } = await state.supabase.auth.signInWithPassword({ email, password });
  setBusy(false);

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

async function handleSubmit(event) {
  event.preventDefault();
  const dueDate = elements.dueDate.value;
  const previousOrder = state.editingId
    ? state.orders.find((item) => item.id === state.editingId) || null
    : null;

  const order = normalizeOrder({
    id: state.editingId,
    projectName: elements.projectName.value.trim(),
    clientName: elements.clientName.value.trim(),
    businessType: elements.businessType.value,
    productionStage: elements.productionStage.value,
    source: elements.source.value,
    feeMode: elements.feeMode.value,
    feeRate: parseFeeRateInput(elements.feeRate.value),
    priority: elements.priority.value,
    amount: Number(elements.amount.value),
    receivedAmount: Number(elements.receivedAmount.value),
    paymentStatus: elements.paymentStatus.value,
    dueDate,
    completedDate: elements.completedDate.value,
    status: elements.status.value,
    exceptionType: elements.exceptionType.value,
    exceptionResolution: previousOrder?.exceptionResolution,
    exceptionNote: previousOrder?.exceptionNote,
    refundAmount: previousOrder?.refundAmount,
    exceptionPreviousStatus: previousOrder?.exceptionPreviousStatus,
    notes: elements.notes.value.trim(),
  });

  if (!order.projectName || !order.clientName || !dueDate) {
    updateAuthUi("项目名、客户和截稿日期不能为空。");
    return;
  }
  if (!order.businessType) {
    updateAuthUi("业务分类不能为空。");
    return;
  }
  if (isAbnormal(order) && DISALLOWED_ABNORMAL_STATUSES.has(order.status)) {
    updateAuthUi("异常单请先完成异常处理，不能直接设为已完成或已付款。");
    return;
  }

  setBusy(true);
  try {
    if (state.mode === "cloud") {
      await saveRemoteOrder(order);
    } else {
      saveLocalOrder(order);
    }
    saveLastTemplate(order);
    resetForm();
    updateAuthUi(state.mode === "cloud" ? "云端数据已保存。" : "本地数据已保存。");
  } catch (error) {
    updateAuthUi(mapAuthError(error));
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
    updateAuthUi("云端模式下需要先登录，才能写入演示数据。");
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
  elements.form.reset();
  elements.formTitle.textContent = "新建稿件";
  elements.hiddenId.value = "";
  elements.businessType.value = BUILT_IN_BUSINESS_TYPES[0];
  elements.source.value = SOURCES[0];
  elements.feeMode.value = getSuggestedFeeMode(elements.source.value);
  elements.feeRate.value = formatFeeRatePercent(
    getDefaultFeeRate(elements.source.value, elements.feeMode.value),
  );
  elements.priority.value = PRIORITIES[0];
  elements.receivedAmount.value = "0";
  elements.paymentStatus.value = PAYMENT_STATUSES[0];
  elements.status.value = STATUSES[0];
  elements.productionStage.value = "";
  elements.exceptionType.value = EXCEPTION_TYPES[0];
  elements.dueDate.value = "";
  updateFeeModeUi();
}

function render() {
  renderProductionStageOptions();
  const orders = filteredOrders();
  renderBusinessTypeOptions();
  syncSelectionToVisible(orders);
  renderSyncPanel();
  renderStats(orders);
  renderBreakdown(orders);
  renderCalendar(orders);
  renderBatchActions(orders);
  renderTable(orders);
}

function renderSyncPanel() {
  const canEditOrders = state.mode === "local" || Boolean(state.user);
  const hasActiveUser = Boolean(state.user);

  if (state.mode === "cloud") {
    elements.syncModeLabel.textContent = state.user ? "云端同步已连接" : "云端同步待登录";
    elements.syncModeNote.textContent = state.user
      ? state.usingLocalBackup
        ? "云端账号已经登录，但当前云端还没有数据，正在显示这台设备里的旧记录。"
        : "当前账号的数据会实时读写 Supabase。"
      : "配置已经就绪，登录后每个画师只会看到自己的数据。";
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
  elements.signUp.disabled = authDisabled || state.recoveryMode || hasActiveUser;
  elements.resendSignup.disabled = authDisabled || state.recoveryMode || hasActiveUser;
  elements.forgotPassword.disabled = authDisabled || state.recoveryMode || hasActiveUser;
  elements.signOut.disabled = state.mode !== "cloud" || !state.user || state.busy;
  elements.resetPassword.disabled = state.mode !== "cloud" || !state.recoveryMode || state.busy;
  elements.resetPasswordConfirm.disabled =
    state.mode !== "cloud" || !state.recoveryMode || state.busy;
  elements.updatePassword.disabled = state.mode !== "cloud" || !state.recoveryMode || state.busy;

  elements.form.querySelectorAll("input, select, textarea, button").forEach((field) => {
    field.disabled = !canEditOrders || state.busy;
  });
  elements.seedDemo.disabled = !canEditOrders || state.busy;
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
  if (elements.exceptionDialog?.open) {
    syncExceptionDialogRefundUi();
  }
}

function filteredOrders() {
  const { month, status, stage, source, exception, payment, search } = state.filters;

  return [...state.orders]
    .filter((order) => {
      const dueDate = String(order.dueDate || "");
      return !month || dueDate.startsWith(month);
    })
    .filter((order) => status === "all" || order.status === status)
    .filter((order) => stage === "all" || order.productionStage === stage)
    .filter((order) => source === "all" || order.source === source)
    .filter((order) => exception === "all" || order.exceptionType === exception)
    .filter((order) => payment === "all" || normalizePaymentStatus(order) === payment)
    .filter((order) => {
      if (!search) return true;
      const haystack = [order.projectName, order.clientName, order.productionStage, order.notes]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    })
    .sort((left, right) => String(left.dueDate || "").localeCompare(String(right.dueDate || "")));
}

function renderStats(orders) {
  const totalRefund = sumRefundAmounts(orders);
  const totalFee = sumAdjustedFeeAmounts(orders);
  const totalNet = sumAdjustedNetAmounts(orders);
  const totalEffectiveAmount = sumEffectiveAmounts(orders);
  const totalEffectiveReceived = sumEffectiveReceivedAmounts(orders);
  const unhandledAbnormalCount = orders.filter(isUnhandledAbnormal).length;
  const stats = [
    {
      label: "本月稿件数",
      value: `${orders.length}`,
      note: "按当前筛选统计",
    },
    {
      label: "本月结算收入",
      value: `¥${totalEffectiveAmount}`,
      note: totalRefund > 0 ? `含退款 ¥${totalRefund}` : "按当前结算口径统计",
    },
    {
      label: "已收净额",
      value: `¥${totalEffectiveReceived}`,
      note: `待收 ¥${Math.max(totalEffectiveAmount - totalEffectiveReceived, 0)}`,
    },
    {
      label: "预计实得",
      value: `¥${totalNet}`,
      note: `平台费 / 加价 ¥${totalFee}`,
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
          <span>${item.count} 单 / ¥${item.amount}</span>
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
  elements.calendarTitle.textContent = monthKey;
  elements.calendarGrid.innerHTML = "";

  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const start = new Date(firstDay);
  start.setDate(start.getDate() - firstDay.getDay());

  const end = new Date(lastDay);
  end.setDate(end.getDate() + (6 - lastDay.getDay()));

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const current = new Date(date);
    const cell = document.createElement("article");
    const isOutside = current.getMonth() !== monthDate.getMonth();
    cell.className = `calendar-cell${isOutside ? " is-outside" : ""}`;

    const dayOrders = orders.filter((order) => String(order.dueDate || "") === formatDateInput(current));
    cell.innerHTML = `
      <span class="calendar-day">${current.getDate()}</span>
      <div class="calendar-items">
        ${
          dayOrders.length
            ? dayOrders
                .map(
                  (order) =>
                    `<div class="calendar-item">${escapeHtml(order.projectName)} · ¥${order.amount}</div>`,
                )
                .join("")
            : ""
        }
      </div>
    `;
    elements.calendarGrid.append(cell);
  }
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

function renderTable(orders) {
  elements.tableBody.innerHTML = "";
  const grossAmount = sumBy(orders, "amount");
  const effectiveAmount = sumEffectiveAmounts(orders);
  const effectiveReceived = sumEffectiveReceivedAmounts(orders);
  const netAmount = sumAdjustedNetAmounts(orders);
  const totalFee = sumAdjustedFeeAmounts(orders);
  const totalRefund = sumRefundAmounts(orders);
  elements.tableSummary.textContent =
    totalRefund > 0
      ? `共 ${orders.length} 单，结算收入 ¥${effectiveAmount}（退款 ¥${totalRefund}，实得 ¥${netAmount}），已收净额 ¥${effectiveReceived}`
      : totalFee > 0
        ? `共 ${orders.length} 单，收入 ¥${grossAmount}（平台费 / 加价 ¥${totalFee}，实得 ¥${netAmount}），已收 ¥${effectiveReceived}`
        : `共 ${orders.length} 单，收入 ¥${grossAmount}，已收 ¥${effectiveReceived}`;

  if (!orders.length) {
    const emptyMessage =
      state.mode === "cloud" && !state.user
        ? "登录后就会显示你自己的云端稿件。"
        : "当前筛选没有稿件，先加一条记录。";
    elements.tableBody.innerHTML = `<tr><td colspan="11" class="empty-state">${emptyMessage}</td></tr>`;
    const selectAllEmpty = document.querySelector("#select-all-orders");
    if (selectAllEmpty) {
      selectAllEmpty.checked = false;
      selectAllEmpty.indeterminate = false;
      selectAllEmpty.disabled = true;
    }
    return;
  }

  const selectAll = document.querySelector("#select-all-orders");
  if (selectAll) {
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
    row.innerHTML = `
      <td class="checkbox-col">
        <input type="checkbox" data-action="select" data-id="${escapeHtml(order.id)}" ${selected ? "checked" : ""} ${state.busy ? "disabled" : ""} aria-label="选择 ${escapeHtml(order.projectName)}" />
      </td>
      <td>${escapeHtml(order.dueDate || "-")}</td>
      <td>${escapeHtml(order.clientName)}</td>
      <td>
        <strong>${escapeHtml(order.projectName)}</strong>
        ${order.notes ? `<div class="legend-row">${escapeHtml(order.notes)}</div>` : ""}
      </td>
      <td><div class="chip-group"><span class="chip business">${escapeHtml(order.businessType)}</span></div></td>
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
    elements.tableBody.append(row);
  });

  elements.tableBody.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const { action, id } = event.currentTarget.dataset;
      if (action === "complete") {
        updateOrderStatus(id, "已完成");
      } else if (action === "paid") {
        updateOrderStatus(id, "已付款");
      } else if (action === "handled") {
        updateOrderStatus(id, "已处理");
      } else if (action === "stage") {
        openStageDialog(id);
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

  elements.tableBody.querySelectorAll('input[type="checkbox"][data-action="select"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      const { id } = event.currentTarget.dataset;
      toggleSelection(id, event.currentTarget.checked);
    });
  });
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

function fillFormFromOrder(order, title, isEditing = false) {
  state.editingId = isEditing ? order.id || null : null;
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
  elements.priority.value = order.priority || PRIORITIES[0];
  elements.amount.value = order.amount ?? "";
  elements.receivedAmount.value = order.receivedAmount ?? 0;
  elements.paymentStatus.value = normalizePaymentStatus(order);
  elements.dueDate.value = order.dueDate || "";
  elements.completedDate.value = order.completedDate || "";
  elements.status.value = order.status || STATUSES[0];
  elements.exceptionType.value = order.exceptionType || EXCEPTION_TYPES[0];
  elements.notes.value = order.notes || "";
  updateFeeModeUi();
  elements.projectName.scrollIntoView({ behavior: "smooth", block: "center" });
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
    priority: order.priority,
    amount: order.amount,
    receivedAmount: 0,
    paymentStatus: PAYMENT_STATUSES[0],
    dueDate: "",
    completedDate: "",
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
      next.receivedAmount = Number(next.amount || 0);
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
  if (order && canQuickEditStage(order)) {
    return `<button type="button" class="chip stage clickable" data-action="stage" data-id="${escapeHtml(
      order.id,
    )}" ${state.busy ? "disabled" : ""}>${escapeHtml(stage)}</button>`;
  }
  return `<span class="chip stage">${escapeHtml(stage)}</span>`;
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
  const effectiveAmount = calculateEffectiveAmount(order);
  const refundAmount = calculateRefundAmount(order);
  const feeAmount = calculateAdjustedFeeAmount(order);
  const netAmount = calculateAdjustedNetAmount(order);

  const rows = [];
  if (feeMode === "mhs_project") {
    rows.push(
      `<strong>${refundAmount > 0 ? `原到手 ¥${order.amount}` : `到手稿费 ¥${order.amount}`}</strong>`,
    );
  } else if (feeMode === "mhs_window") {
    rows.push(
      `<strong>${refundAmount > 0 ? `原标价 ¥${order.amount}` : `橱窗标价 ¥${order.amount}`}</strong>`,
    );
  } else {
    rows.push(`<strong>${refundAmount > 0 ? `原稿费 ¥${order.amount}` : `¥${order.amount}`}</strong>`);
  }

  if (refundAmount > 0) {
    rows.push(`<div class="legend-row warning-text">退款 ¥${refundAmount}</div>`);
    rows.push(
      `<div class="legend-row">${
        feeMode === "mhs_project" ? `结算到手 ¥${effectiveAmount}` : `结算 ¥${effectiveAmount}`
      }</div>`,
    );
  }

  if (feeMode === "mhs_project" && order.feeRate > 0) {
    rows.push(`<div class="legend-row">企划报价 ¥${calculateQuotedAmount(order)}</div>`);
    rows.push(`<div class="legend-row">平台加价 ¥${feeAmount}</div>`);
  } else if (feeMode === "mhs_window" && order.feeRate > 0) {
    rows.push(`<div class="legend-row">平台费 ¥${feeAmount}</div>`);
    rows.push(`<div class="legend-row">预计实得 ¥${netAmount}</div>`);
  } else if (order.feeRate > 0 || refundAmount > 0) {
    rows.push(`<div class="legend-row">预计实得 ¥${netAmount}</div>`);
  }
  return rows.join("");
}

function renderPaymentContent(order) {
  const paymentStatus = normalizePaymentStatus(order);
  const effectiveReceived = calculateEffectiveReceived(order);
  const effectiveAmount = calculateEffectiveAmount(order);
  const refundAmount = calculateRefundAmount(order);
  const outstandingAmount = Math.max(effectiveAmount - effectiveReceived, 0);
  const className =
    effectiveAmount > 0 && effectiveReceived >= effectiveAmount
      ? "paid"
      : effectiveReceived > 0
        ? "partial"
        : "";
  const label = refundAmount > 0 ? `已收净额 ¥${effectiveReceived}` : `${paymentStatus} · 已收 ¥${effectiveReceived}`;
  return `
    <div class="chip-group">
      <span class="chip payment ${className}">${escapeHtml(label)}${outstandingAmount ? ` / 待收 ¥${outstandingAmount}` : ""}</span>
    </div>
    ${
      refundAmount > 0
        ? `<div class="legend-row">原已收 ¥${Number(order.receivedAmount || 0)} / 已退款 ¥${refundAmount}</div>`
        : ""
    }
  `;
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
    "手续费方式",
    "平台抽成(%)",
    "紧急程度",
    "稿费",
    "退款金额",
    "结算收入",
    "预计实得",
    "已收金额",
    "已收净额",
    "收款状态",
    "截稿日期",
    "完成日期",
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
    getFeeModeLabel(normalizeFeeMode(item.feeMode)),
    formatFeeRatePercent(item.feeRate),
    item.priority,
    item.amount,
    calculateRefundAmount(item),
    calculateEffectiveAmount(item),
    calculateAdjustedNetAmount(item),
    item.receivedAmount ?? 0,
    calculateEffectiveReceived(item),
    normalizePaymentStatus(item),
    item.dueDate,
    item.completedDate,
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
        if (record.dueDate != null && record.dueDate !== "" && !datePattern.test(record.dueDate)) return false;
        if (record.completedDate != null && record.completedDate !== "" && !datePattern.test(record.completedDate)) return false;
        if (record.feeRate != null) {
          const feeRate = Number(record.feeRate);
          if (!isFinite(feeRate) || feeRate < 0 || feeRate > 1) return false;
        }
        if (record.feeMode != null && !FEE_MODES.some((item) => item.value === record.feeMode)) {
          return false;
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

function renderBusinessTypeOptions() {
  if (!elements.businessTypeOptions) return;
  elements.businessTypeOptions.innerHTML = "";
  getKnownBusinessTypes().forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    elements.businessTypeOptions.append(option);
  });
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
  const builtIn = [...BUILT_IN_BUSINESS_TYPES];
  const seen = new Set(builtIn);
  const dynamic = [];

  state.orders.forEach((order) => {
    const normalized = normalizeBusinessTypeValue(order.businessType);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      dynamic.push(normalized);
    }
  });

  return [...builtIn, ...dynamic];
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

function normalizeProductionStageValue(value) {
  return String(value || "").trim().slice(0, 20);
}

function normalizeFeeMode(value) {
  return FEE_MODES.some((item) => item.value === value) ? value : "standard";
}

function getSuggestedFeeMode(source) {
  if (source === "米画师") return "mhs_project";
  if (source === "橱窗") return "mhs_window";
  return "standard";
}

function getFeeModeLabel(feeMode) {
  return FEE_MODES.find((item) => item.value === feeMode)?.label || "默认按比例";
}

function getSourceLabel(source) {
  return SOURCE_OPTIONS.find((item) => item.value === source)?.label || source;
}

function updateFeeModeUi() {
  if (!elements.amountLabel || !elements.feeMode) return;
  const feeMode = normalizeFeeMode(elements.feeMode.value);
  elements.amountLabel.textContent =
    feeMode === "mhs_project" ? "到手稿费" : feeMode === "mhs_window" ? "橱窗标价" : "总稿费";
}

function normalizeOrder(input = {}) {
  const source = input.source || SOURCES[0];
  const feeMode = normalizeFeeMode(input.feeMode);
  const amount = Number(input.amount || 0);
  const receivedAmount = Number(input.receivedAmount || 0);
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
  const refundAmount = Math.max(Number(input.refundAmount || 0), 0);
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
    priority: input.priority || PRIORITIES[0],
    amount,
    receivedAmount,
    paymentStatus: input.paymentStatus || inferPaymentStatus({ amount, receivedAmount }),
    feeRate: normalizedFeeRate,
    dueDate: input.dueDate || "",
    completedDate: input.completedDate || "",
    status,
    exceptionType,
    exceptionResolution: exceptionType === "无" ? "" : exceptionResolution,
    exceptionNote: exceptionType === "无" ? "" : String(input.exceptionNote || ""),
    refundAmount: exceptionType === "无" ? 0 : refundAmount,
    exceptionPreviousStatus: exceptionType === "无" ? null : exceptionPreviousStatus,
    notes: input.notes || "",
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
    priority: row.priority,
    amount: row.amount,
    receivedAmount: row.received_amount,
    paymentStatus: row.payment_status,
    feeRate: row.fee_rate,
    dueDate: row.due_date,
    completedDate: row.completed_date || "",
    status: row.status,
    exceptionType: row.exception_type,
    exceptionResolution: row.exception_resolution,
    exceptionNote: row.exception_note,
    refundAmount: row.refund_amount,
    exceptionPreviousStatus: row.exception_previous_status,
    notes: row.notes || "",
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
    priority: order.priority,
    amount: Number(order.amount || 0),
    received_amount: Number(order.receivedAmount || 0),
    payment_status: normalizePaymentStatus(order),
    fee_rate: Number(order.feeRate || 0),
    due_date: order.dueDate,
    completed_date: order.completedDate || null,
    status: order.status,
    exception_type: order.exceptionType || "无",
    exception_resolution: order.exceptionResolution || "",
    exception_note: order.exceptionNote || "",
    refund_amount: Number(order.refundAmount || 0),
    exception_previous_status: order.exceptionPreviousStatus || null,
    notes: order.notes || "",
  };
}

function updateAuthUi(message) {
  elements.authMessage.textContent = message;
}

function setBusy(nextBusy) {
  state.busy = nextBusy;
  renderSyncPanel();
}

function hasCloudConfig() {
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
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
  const amount = Number(order.amount || 0);
  const receivedAmount = Number(order.receivedAmount || 0);
  if (amount > 0 && receivedAmount >= amount) return "已结清";
  if (receivedAmount > 0) return "已收定金";
  return "未收款";
}

function getDefaultFeeRate(source, feeMode = "standard") {
  const normalizedFeeMode = normalizeFeeMode(feeMode);
  if (normalizedFeeMode === "mhs_project" || normalizedFeeMode === "mhs_window") {
    return 0.05;
  }
  return SOURCE_FEE_RATES[source] ?? 0;
}

function parseFeeRateInput(value) {
  const parsed = Number(value || 0);
  if (!isFinite(parsed) || parsed <= 0) return 0;
  return Math.min(parsed / 100, 1);
}

function formatFeeRatePercent(rate) {
  const percent = Number(rate || 0) * 100;
  return percent.toFixed(2).replace(/\.?0+$/, "");
}

function calculateFeeAmount(order) {
  return calculateAdjustedFeeAmount(order);
}

function calculateNetAmount(order) {
  return calculateAdjustedNetAmount(order);
}

function calculateRefundAmount(order) {
  return Math.max(Number(order.refundAmount || 0), 0);
}

function calculateEffectiveAmount(order) {
  if (order.exceptionResolution === "协商退全款") return 0;
  return Math.max(Number(order.amount || 0) - calculateRefundAmount(order), 0);
}

function calculateEffectiveReceived(order) {
  return Math.max(Number(order.receivedAmount || 0) - calculateRefundAmount(order), 0);
}

function calculateAdjustedFeeAmount(order) {
  const effectiveAmount = calculateEffectiveAmount(order);
  const rate = Number(order.feeRate || 0);
  const feeMode = normalizeFeeMode(order.feeMode);

  if (feeMode === "mhs_project") {
    return Math.ceil(effectiveAmount * rate);
  }
  if (feeMode === "mhs_window") {
    return Math.floor(effectiveAmount * rate);
  }
  return Math.round(effectiveAmount * rate);
}

function calculateAdjustedNetAmount(order) {
  const effectiveAmount = calculateEffectiveAmount(order);
  if (normalizeFeeMode(order.feeMode) === "mhs_project") {
    return effectiveAmount;
  }
  return Math.max(effectiveAmount - calculateAdjustedFeeAmount(order), 0);
}

function calculateQuotedAmount(order) {
  if (normalizeFeeMode(order.feeMode) === "mhs_project") {
    return calculateEffectiveAmount(order) + calculateAdjustedFeeAmount(order);
  }
  return calculateEffectiveAmount(order);
}

function sumFeeAmounts(list) {
  return list.reduce((total, item) => total + calculateFeeAmount(item), 0);
}

function sumNetAmounts(list) {
  return list.reduce((total, item) => total + calculateNetAmount(item), 0);
}

function sumRefundAmounts(list) {
  return list.reduce((total, item) => total + calculateRefundAmount(item), 0);
}

function sumEffectiveAmounts(list) {
  return list.reduce((total, item) => total + calculateEffectiveAmount(item), 0);
}

function sumEffectiveReceivedAmounts(list) {
  return list.reduce((total, item) => total + calculateEffectiveReceived(item), 0);
}

function sumAdjustedFeeAmounts(list) {
  return list.reduce((total, item) => total + calculateAdjustedFeeAmount(item), 0);
}

function sumAdjustedNetAmounts(list) {
  return list.reduce((total, item) => total + calculateAdjustedNetAmount(item), 0);
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

function mapAuthError(error) {
  const message = String(error?.message || error || "操作失败。");
  if (message.includes("email rate limit exceeded")) {
    return "邮件发送太频繁，被 Supabase 限流了。先等一会儿再试，别连续点发送。";
  }
  if (message.includes("only request this after")) {
    return "请求太频繁，Supabase 暂时不再发邮件。等一会儿再重试。";
  }
  if (message.includes("Email link is invalid") || message.includes("expired")) {
    return "这个邮件链接已经失效了，请重新发送一封新的验证或重置邮件。";
  }
  return message;
}

function isOverdue(order) {
  if (!order.dueDate) return false;
  const today = formatDateInput(new Date());
  return order.dueDate < today && !isClosed(order) && !isAbnormal(order);
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
  elements.stageDialog.showModal();
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
    const fullRefund = String(Number(order.receivedAmount || 0));
    elements.exceptionRefundAmount.disabled = true;
    elements.exceptionRefundAmount.value = fullRefund;
    elements.refundAmountNote.textContent = "退全款会按当前已收金额自动填写。";
    return;
  }

  elements.exceptionRefundAmount.disabled = state.busy;
  elements.refundAmountNote.textContent = `退款金额需大于 0，且不能超过已收 ¥${Number(order.receivedAmount || 0)}。`;
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
    refundAmount = Number(order.receivedAmount || 0);
  } else if (resolution === "协商退部分款") {
    refundAmount = Number(elements.exceptionRefundAmount.value || 0);
    if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
      elements.exceptionDialogMessage.textContent = "退部分款时，请填写大于 0 的退款金额。";
      return;
    }
    if (refundAmount > Number(order.receivedAmount || 0)) {
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
  const nextOrder = normalizeOrder({
    ...order,
    productionStage: nextStage,
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
