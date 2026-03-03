import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const STORAGE_KEY = "artist-commission-desk-v1";
const LAST_TEMPLATE_KEY = "artist-commission-last-template-v1";
const TABLE_NAME = "commission_orders";

const BUSINESS_TYPES = ["头像", "半身", "立绘", "OC设计", "服设", "橱窗", "加项"];
const SOURCES = ["米画师", "画加", "私单", "橱窗", "熟人转介绍", "社媒引流"];
const PRIORITIES = ["普通", "加急", "特快"];
const STATUSES = ["待沟通", "排期中", "进行中", "待交付", "已完成", "已付款", "已处理"];
const PAYMENT_STATUSES = ["未收款", "已收定金", "已结清"];
const EXCEPTION_TYPES = ["无", "金主退稿", "金主退部分稿", "金主异常"];
const ABNORMAL_EXCEPTION_TYPES = new Set(EXCEPTION_TYPES.filter((type) => type !== "无"));
const CLOSED_STATUSES = new Set(["已完成", "已付款", "已处理"]);
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
    priority: "特快",
    amount: 180,
    receivedAmount: 180,
    paymentStatus: "已结清",
    feeRate: 0.05,
    dueDate: "2026-03-04",
    completedDate: "2026-03-04",
    status: "已付款",
    exceptionType: "无",
    notes: "双人头像，晚上交稿。",
  },
  {
    projectName: "学院 OC 设定",
    clientName: "老板-K21",
    businessType: "OC设计",
    source: "私单",
    priority: "普通",
    amount: 680,
    receivedAmount: 200,
    paymentStatus: "已收定金",
    feeRate: 0,
    dueDate: "2026-03-09",
    completedDate: "",
    status: "进行中",
    exceptionType: "无",
    notes: "要含三视图配色说明。",
  },
  {
    projectName: "草服设 12",
    clientName: "老板-M88",
    businessType: "服设",
    source: "画加",
    priority: "普通",
    amount: 320,
    receivedAmount: 0,
    paymentStatus: "未收款",
    feeRate: 0.0525,
    dueDate: "2026-03-12",
    completedDate: "",
    status: "排期中",
    exceptionType: "无",
    notes: "先出黑白草图。",
  },
  {
    projectName: "半身插图",
    clientName: "老板-L02",
    businessType: "半身",
    source: "熟人转介绍",
    priority: "加急",
    amount: 450,
    receivedAmount: 200,
    paymentStatus: "已收定金",
    feeRate: 0,
    dueDate: "2026-03-15",
    completedDate: "",
    status: "待交付",
    exceptionType: "无",
    notes: "修两次内。",
  },
  {
    projectName: "直播间橱窗图",
    clientName: "工作室-31",
    businessType: "橱窗",
    source: "橱窗",
    priority: "普通",
    amount: 260,
    receivedAmount: 0,
    paymentStatus: "未收款",
    feeRate: 0,
    dueDate: "2026-03-18",
    completedDate: "",
    status: "已处理",
    exceptionType: "金主异常",
    notes: "尺寸 3:4。",
  },
  {
    projectName: "立绘加背景",
    clientName: "老板-R09",
    businessType: "立绘",
    source: "米画师",
    priority: "加急",
    amount: 1280,
    receivedAmount: 600,
    paymentStatus: "已收定金",
    feeRate: 0.05,
    dueDate: "2026-03-25",
    completedDate: "",
    status: "排期中",
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
};

const elements = {
  monthFilter: document.querySelector("#month-filter"),
  statusFilter: document.querySelector("#status-filter"),
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
  source: document.querySelector("#source"),
  feeRate: document.querySelector("#fee-rate"),
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
  fillSelect(elements.businessType, BUSINESS_TYPES);
  fillSelect(elements.source, SOURCES);
  fillSelect(elements.priority, PRIORITIES);
  fillSelect(elements.status, STATUSES);
  fillSelect(elements.exceptionType, EXCEPTION_TYPES);
  fillSelect(elements.paymentStatus, PAYMENT_STATUSES);
  fillSelect(elements.statusFilter, STATUSES, true);
  fillSelect(elements.sourceFilter, SOURCES, true);
  fillSelect(elements.exceptionFilter, EXCEPTION_TYPES, true);
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
  elements.source.addEventListener("change", (event) => {
    if (shouldAutoApplySourceFee()) {
      elements.feeRate.value = formatFeeRatePercent(getDefaultFeeRate(event.target.value));
    }
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

  const order = normalizeOrder({
    id: state.editingId,
    projectName: elements.projectName.value.trim(),
    clientName: elements.clientName.value.trim(),
    businessType: elements.businessType.value,
    source: elements.source.value,
    feeRate: parseFeeRateInput(elements.feeRate.value),
    priority: elements.priority.value,
    amount: Number(elements.amount.value),
    receivedAmount: Number(elements.receivedAmount.value),
    paymentStatus: elements.paymentStatus.value,
    dueDate,
    completedDate: elements.completedDate.value,
    status: elements.status.value,
    exceptionType: elements.exceptionType.value,
    notes: elements.notes.value.trim(),
  });

  if (!order.projectName || !order.clientName || !dueDate) {
    updateAuthUi("项目名、客户和截稿日期不能为空。");
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
  elements.businessType.value = BUSINESS_TYPES[0];
  elements.source.value = SOURCES[0];
  elements.feeRate.value = formatFeeRatePercent(getDefaultFeeRate(elements.source.value));
  elements.priority.value = PRIORITIES[0];
  elements.receivedAmount.value = "0";
  elements.paymentStatus.value = PAYMENT_STATUSES[0];
  elements.status.value = STATUSES[0];
  elements.exceptionType.value = EXCEPTION_TYPES[0];
  elements.dueDate.value = "";
}

function render() {
  const orders = filteredOrders();
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
}

function filteredOrders() {
  const { month, status, source, exception, payment, search } = state.filters;

  return [...state.orders]
    .filter((order) => {
      const dueDate = String(order.dueDate || "");
      return !month || dueDate.startsWith(month);
    })
    .filter((order) => status === "all" || order.status === status)
    .filter((order) => source === "all" || order.source === source)
    .filter((order) => exception === "all" || order.exceptionType === exception)
    .filter((order) => payment === "all" || normalizePaymentStatus(order) === payment)
    .filter((order) => {
      if (!search) return true;
      const haystack = [order.projectName, order.clientName, order.notes]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    })
    .sort((left, right) => String(left.dueDate || "").localeCompare(String(right.dueDate || "")));
}

function renderStats(orders) {
  const totalFee = sumFeeAmounts(orders);
  const totalNet = sumNetAmounts(orders);
  const stats = [
    {
      label: "本月稿件数",
      value: `${orders.length}`,
      note: "按当前筛选统计",
    },
    {
      label: "本月总收入",
      value: `¥${sumBy(orders, "amount")}`,
      note: "全部稿费合计",
    },
    {
      label: "已收金额",
      value: `¥${sumBy(orders, "receivedAmount")}`,
      note: `待收 ¥${Math.max(sumBy(orders, "amount") - sumBy(orders, "receivedAmount"), 0)}`,
    },
    {
      label: "预计实得",
      value: `¥${totalNet}`,
      note: `扣除平台费 ¥${totalFee}`,
    },
    {
      label: "逾期稿件",
      value: `${orders.filter(isOverdue).length}`,
      note: "已过截稿且未关闭",
    },
    {
      label: "待处理稿件",
      value: `${orders.filter((item) => !isClosed(item) && !isAbnormal(item)).length}`,
      note: "流程还没结束",
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
  const totals = BUSINESS_TYPES.map((name) => ({
    name,
    count: orders.filter((item) => item.businessType === name).length,
    amount: sumBy(
      orders.filter((item) => item.businessType === name),
      "amount",
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

  elements.batchActions.classList.toggle("is-hidden", selectedCount === 0);
  elements.batchSummary.textContent =
    selectedCount > 0 ? `已选 ${selectedCount} 单，可以直接批量改状态。` : "";
  elements.batchExceptionType.disabled = selectedCount === 0 || state.busy;
  elements.applyBatchException.disabled = selectedCount === 0 || state.busy;
}

function renderTable(orders) {
  elements.tableBody.innerHTML = "";
  const grossAmount = sumBy(orders, "amount");
  const netAmount = sumNetAmounts(orders);
  const totalFee = sumFeeAmounts(orders);
  elements.tableSummary.textContent =
    totalFee > 0
      ? `共 ${orders.length} 单，收入 ¥${grossAmount}（实得 ¥${netAmount}），已收 ¥${sumBy(orders, "receivedAmount")}`
      : `共 ${orders.length} 单，收入 ¥${grossAmount}，已收 ¥${sumBy(orders, "receivedAmount")}`;

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
      <td><span class="chip source">${escapeHtml(order.source)}</span></td>
      <td><span class="chip priority">${escapeHtml(order.priority)}</span></td>
      <td>
        <strong>¥${order.amount}</strong>
        ${order.feeRate > 0 ? `<div class="legend-row">预计实得 ¥${calculateNetAmount(order)}</div>` : ""}
      </td>
      <td>
        <div class="chip-group">
          ${renderPaymentChip(order)}
          ${isOverdue(order) ? '<span class="chip overdue">逾期</span>' : ""}
        </div>
      </td>
      <td>
        <div class="chip-group">
          ${renderStatusChip(order.status)}
          ${isAbnormal(order) ? renderExceptionChip(order.exceptionType) : ""}
        </div>
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
  elements.businessType.value = order.businessType || BUSINESS_TYPES[0];
  elements.source.value = order.source || SOURCES[0];
  elements.feeRate.value = formatFeeRatePercent(order.feeRate ?? getDefaultFeeRate(elements.source.value));
  elements.priority.value = order.priority || PRIORITIES[0];
  elements.amount.value = order.amount ?? "";
  elements.receivedAmount.value = order.receivedAmount ?? 0;
  elements.paymentStatus.value = normalizePaymentStatus(order);
  elements.dueDate.value = order.dueDate || "";
  elements.completedDate.value = order.completedDate || "";
  elements.status.value = order.status || STATUSES[0];
  elements.exceptionType.value = order.exceptionType || EXCEPTION_TYPES[0];
  elements.notes.value = order.notes || "";
  elements.projectName.scrollIntoView({ behavior: "smooth", block: "center" });
}

function makeDuplicateTemplate(order) {
  return {
    projectName: order.projectName,
    clientName: order.clientName,
    businessType: order.businessType,
    source: order.source,
    feeRate: order.feeRate ?? getDefaultFeeRate(order.source),
    priority: order.priority,
    amount: order.amount,
    receivedAmount: 0,
    paymentStatus: PAYMENT_STATUSES[0],
    dueDate: "",
    completedDate: "",
    status: STATUSES[0],
    exceptionType: EXCEPTION_TYPES[0],
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
  const targetIds = getSelectedVisibleIds(filteredOrders());
  if (!targetIds.length) {
    updateAuthUi("先勾选要批量处理的稿件。");
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
    return normalizeOrder({ ...item, exceptionType });
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

function renderStatusChip(status) {
  const className =
    status === "已完成" || status === "已付款"
      ? "done"
      : status === "已处理"
        ? "handled"
      : status === "待沟通"
        ? "waiting"
        : "";
  return `<span class="chip status ${className}">${escapeHtml(status)}</span>`;
}

function renderExceptionChip(exceptionType) {
  if (!ABNORMAL_EXCEPTION_TYPES.has(exceptionType)) return "";
  return `<span class="chip exception abnormal">${escapeHtml(exceptionType)}</span>`;
}

function renderPaymentChip(order) {
  const paymentStatus = normalizePaymentStatus(order);
  const className =
    paymentStatus === "已结清" ? "paid" : paymentStatus === "已收定金" ? "partial" : "";
  const receivedAmount = Number(order.receivedAmount || 0);
  const outstandingAmount = Math.max(Number(order.amount || 0) - receivedAmount, 0);
  return `<span class="chip payment ${className}">${escapeHtml(paymentStatus)} · 已收 ¥${receivedAmount}${outstandingAmount ? ` / 待收 ¥${outstandingAmount}` : ""}</span>`;
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
    "来源",
    "平台抽成(%)",
    "紧急程度",
    "稿费",
    "预计实得",
    "已收金额",
    "收款状态",
    "截稿日期",
    "完成日期",
    "状态",
    "异常类型",
    "备注",
  ];
  const rows = filteredOrders().map((item) => [
    item.projectName,
    item.clientName,
    item.businessType,
    item.source,
    formatFeeRatePercent(item.feeRate),
    item.priority,
    item.amount,
    calculateNetAmount(item),
    item.receivedAmount ?? 0,
    normalizePaymentStatus(item),
    item.dueDate,
    item.completedDate,
    item.status,
    item.exceptionType,
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
        if (record.amount != null && (typeof record.amount !== "number" || !isFinite(record.amount))) return false;
        if (record.dueDate != null && record.dueDate !== "" && !datePattern.test(record.dueDate)) return false;
        if (record.completedDate != null && record.completedDate !== "" && !datePattern.test(record.completedDate)) return false;
        if (record.feeRate != null) {
          const feeRate = Number(record.feeRate);
          if (!isFinite(feeRate) || feeRate < 0 || feeRate > 1) return false;
        }
        if (record.exceptionType != null && !EXCEPTION_TYPES.includes(record.exceptionType)) {
          return false;
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

function fillSelect(select, values, includeAll = false) {
  select.innerHTML = includeAll ? '<option value="all">全部</option>' : "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function normalizeOrder(input = {}) {
  const source = input.source || SOURCES[0];
  const amount = Number(input.amount || 0);
  const receivedAmount = Number(input.receivedAmount || 0);
  const rawFeeRate = input.feeRate;
  const normalizedFeeRate =
    rawFeeRate == null || rawFeeRate === ""
      ? getDefaultFeeRate(source)
      : Math.min(Math.max(Number(rawFeeRate) || 0, 0), 1);
  const exceptionType = EXCEPTION_TYPES.includes(input.exceptionType) ? input.exceptionType : "无";

  return {
    id: input.id || crypto.randomUUID(),
    projectName: input.projectName || "",
    clientName: input.clientName || "",
    businessType: input.businessType || BUSINESS_TYPES[0],
    source,
    priority: input.priority || PRIORITIES[0],
    amount,
    receivedAmount,
    paymentStatus: input.paymentStatus || inferPaymentStatus({ amount, receivedAmount }),
    feeRate: normalizedFeeRate,
    dueDate: input.dueDate || "",
    completedDate: input.completedDate || "",
    status: input.status || STATUSES[0],
    exceptionType,
    notes: input.notes || "",
  };
}

function rowToOrder(row) {
  return normalizeOrder({
    id: row.id,
    projectName: row.project_name,
    clientName: row.client_name,
    businessType: row.business_type,
    source: row.source,
    priority: row.priority,
    amount: row.amount,
    receivedAmount: row.received_amount,
    paymentStatus: row.payment_status,
    feeRate: row.fee_rate,
    dueDate: row.due_date,
    completedDate: row.completed_date || "",
    status: row.status,
    exceptionType: row.exception_type,
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
    source: order.source,
    priority: order.priority,
    amount: Number(order.amount || 0),
    received_amount: Number(order.receivedAmount || 0),
    payment_status: normalizePaymentStatus(order),
    fee_rate: Number(order.feeRate || 0),
    due_date: order.dueDate,
    completed_date: order.completedDate || null,
    status: order.status,
    exception_type: order.exceptionType || "无",
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

function getDefaultFeeRate(source) {
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
  return Math.round(Number(order.amount || 0) * Number(order.feeRate || 0));
}

function calculateNetAmount(order) {
  return Math.max(Number(order.amount || 0) - calculateFeeAmount(order), 0);
}

function sumFeeAmounts(list) {
  return list.reduce((total, item) => total + calculateFeeAmount(item), 0);
}

function sumNetAmounts(list) {
  return list.reduce((total, item) => total + calculateNetAmount(item), 0);
}

function isAbnormal(order) {
  return ABNORMAL_EXCEPTION_TYPES.has(order.exceptionType);
}

function isClosed(order) {
  return CLOSED_STATUSES.has(order.status);
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
