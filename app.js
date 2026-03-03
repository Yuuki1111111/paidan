import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const STORAGE_KEY = "artist-commission-desk-v1";
const TABLE_NAME = "commission_orders";

const BUSINESS_TYPES = ["头像", "半身", "立绘", "OC设计", "服设", "橱窗", "加项"];
const SOURCES = ["米画师", "画加", "私单", "橱窗", "熟人转介绍", "社媒引流"];
const PRIORITIES = ["普通", "加急", "特快"];
const STATUSES = ["待沟通", "排期中", "进行中", "待交付", "已完成", "已付款"];
const PAYMENT_STATUSES = ["未收款", "已收定金", "已结清"];

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
    dueDate: "2026-03-04",
    completedDate: "2026-03-04",
    status: "已付款",
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
    dueDate: "2026-03-09",
    completedDate: "",
    status: "进行中",
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
    dueDate: "2026-03-12",
    completedDate: "",
    status: "排期中",
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
    dueDate: "2026-03-15",
    completedDate: "",
    status: "待交付",
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
    dueDate: "2026-03-18",
    completedDate: "",
    status: "待沟通",
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
    dueDate: "2026-03-25",
    completedDate: "",
    status: "排期中",
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
};

const elements = {
  monthFilter: document.querySelector("#month-filter"),
  statusFilter: document.querySelector("#status-filter"),
  sourceFilter: document.querySelector("#source-filter"),
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
  priority: document.querySelector("#priority"),
  amount: document.querySelector("#amount"),
  receivedAmount: document.querySelector("#received-amount"),
  paymentStatus: document.querySelector("#payment-status"),
  dueDate: document.querySelector("#due-date"),
  completedDate: document.querySelector("#completed-date"),
  status: document.querySelector("#status"),
  notes: document.querySelector("#notes"),
  seedDemo: document.querySelector("#seed-demo"),
  exportJson: document.querySelector("#export-json"),
  importJson: document.querySelector("#import-json"),
  exportCsv: document.querySelector("#export-csv"),
  prevMonth: document.querySelector("#prev-month"),
  nextMonth: document.querySelector("#next-month"),
  resetForm: document.querySelector("#reset-form"),
  statTemplate: document.querySelector("#stat-card-template"),
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
  fillSelect(elements.paymentStatus, PAYMENT_STATUSES);
  fillSelect(elements.statusFilter, STATUSES, true);
  fillSelect(elements.sourceFilter, SOURCES, true);
  fillSelect(elements.paymentFilter, PAYMENT_STATUSES, true);

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

  elements.paymentFilter.addEventListener("change", (event) => {
    state.filters.payment = event.target.value;
    render();
  });

  elements.searchFilter.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    render();
  });

  elements.form.addEventListener("submit", handleSubmit);
  elements.resetForm.addEventListener("click", resetForm);
  elements.seedDemo.addEventListener("click", () => replaceAllOrders(DEMO_ORDERS));
  elements.exportJson.addEventListener("click", exportJson);
  elements.exportCsv.addEventListener("click", exportCsv);
  elements.importJson.addEventListener("change", importJson);

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
    priority: elements.priority.value,
    amount: Number(elements.amount.value),
    receivedAmount: Number(elements.receivedAmount.value),
    paymentStatus: elements.paymentStatus.value,
    dueDate,
    completedDate: elements.completedDate.value,
    status: elements.status.value,
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
    await replaceRemoteOrders(nextOrders);
    state.usingLocalBackup = false;
    return;
  }

  const payload = orderToRow(order, state.user.id);

  if (state.editingId) {
    const { error } = await state.supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq("id", order.id)
      .eq("user_id", state.user.id);
    if (error) throw error;
  } else {
    const { error } = await state.supabase.from(TABLE_NAME).insert(payload);
    if (error) throw error;
  }

  await loadRemoteOrders();
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
  const { error: deleteError } = await state.supabase
    .from(TABLE_NAME)
    .delete()
    .eq("user_id", state.user.id);
  if (deleteError) throw deleteError;

  if (orders.length) {
    const payload = orders.map((item) => orderToRow(item, state.user.id));
    const { error: insertError } = await state.supabase.from(TABLE_NAME).insert(payload);
    if (insertError) throw insertError;
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
  elements.priority.value = PRIORITIES[0];
  elements.receivedAmount.value = "0";
  elements.paymentStatus.value = PAYMENT_STATUSES[0];
  elements.status.value = STATUSES[0];
  elements.dueDate.value = "";
}

function render() {
  const orders = filteredOrders();
  renderSyncPanel();
  renderStats(orders);
  renderBreakdown(orders);
  renderCalendar(orders);
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
}

function filteredOrders() {
  const { month, status, source, payment, search } = state.filters;

  return [...state.orders]
    .filter((order) => {
      const dueDate = String(order.dueDate || "");
      return !month || dueDate.startsWith(month);
    })
    .filter((order) => status === "all" || order.status === status)
    .filter((order) => source === "all" || order.source === source)
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
      label: "逾期稿件",
      value: `${orders.filter(isOverdue).length}`,
      note: "已过排期且未完成",
    },
    {
      label: "已结清单数",
      value: `${orders.filter((item) => normalizePaymentStatus(item) === "已结清").length}`,
      note: "收款已经收完",
    },
    {
      label: "待处理稿件",
      value: `${orders.filter((item) => item.status !== "已付款" && item.status !== "已完成").length}`,
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

function renderTable(orders) {
  elements.tableBody.innerHTML = "";
  elements.tableSummary.textContent = `共 ${orders.length} 单，收入 ¥${sumBy(orders, "amount")}，已收 ¥${sumBy(orders, "receivedAmount")}`;

  if (!orders.length) {
    const emptyMessage =
      state.mode === "cloud" && !state.user
        ? "登录后就会显示你自己的云端稿件。"
        : "当前筛选没有稿件，先加一条记录。";
    elements.tableBody.innerHTML = `<tr><td colspan="10" class="empty-state">${emptyMessage}</td></tr>`;
    return;
  }

  orders.forEach((order) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.dueDate || "-"}</td>
      <td>${escapeHtml(order.clientName)}</td>
      <td>
        <strong>${escapeHtml(order.projectName)}</strong>
        ${order.notes ? `<div class="legend-row">${escapeHtml(order.notes)}</div>` : ""}
      </td>
      <td><div class="chip-group"><span class="chip business">${escapeHtml(order.businessType)}</span></div></td>
      <td><span class="chip source">${escapeHtml(order.source)}</span></td>
      <td><span class="chip priority">${escapeHtml(order.priority)}</span></td>
      <td>¥${order.amount}</td>
      <td>
        <div class="chip-group">
          ${renderPaymentChip(order)}
          ${isOverdue(order) ? '<span class="chip overdue">逾期</span>' : ""}
        </div>
      </td>
      <td>${renderStatusChip(order.status)}</td>
      <td>
        <div class="row-actions">
          <button class="link-button" data-action="edit" data-id="${order.id}">编辑</button>
          <button class="link-button" data-action="delete" data-id="${order.id}">删除</button>
        </div>
      </td>
    `;
    elements.tableBody.append(row);
  });

  elements.tableBody.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const { action, id } = event.currentTarget.dataset;
      if (action === "edit") {
        startEdit(id);
      } else if (action === "delete") {
        deleteOrder(id);
      }
    });
  });
}

function startEdit(id) {
  const order = state.orders.find((item) => item.id === id);
  if (!order) return;

  state.editingId = id;
  elements.formTitle.textContent = `编辑稿件：${order.projectName}`;
  elements.hiddenId.value = order.id;
  elements.projectName.value = order.projectName;
  elements.clientName.value = order.clientName;
  elements.businessType.value = order.businessType;
  elements.source.value = order.source;
  elements.priority.value = order.priority;
  elements.amount.value = order.amount;
  elements.receivedAmount.value = order.receivedAmount ?? 0;
  elements.paymentStatus.value = normalizePaymentStatus(order);
  elements.dueDate.value = order.dueDate;
  elements.completedDate.value = order.completedDate;
  elements.status.value = order.status;
  elements.notes.value = order.notes;
  elements.projectName.scrollIntoView({ behavior: "smooth", block: "center" });
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
    updateAuthUi("稿件已删除。");
  } catch (error) {
    updateAuthUi(mapAuthError(error));
  } finally {
    setBusy(false);
    render();
  }
}

function renderStatusChip(status) {
  const className =
    status === "已完成" || status === "已付款"
      ? "done"
      : status === "待沟通"
        ? "waiting"
        : "";
  return `<span class="chip status ${className}">${escapeHtml(status)}</span>`;
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
    JSON.stringify(state.orders, null, 2),
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
    "紧急程度",
    "稿费",
    "已收金额",
    "收款状态",
    "截稿日期",
    "完成日期",
    "状态",
    "备注",
  ];
  const rows = state.orders.map((item) => [
    item.projectName,
    item.clientName,
    item.businessType,
    item.source,
    item.priority,
    item.amount,
    item.receivedAmount ?? 0,
    normalizePaymentStatus(item),
    item.dueDate,
    item.completedDate,
    item.status,
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
      await replaceAllOrders(parsed);
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
  return {
    id: input.id || crypto.randomUUID(),
    projectName: input.projectName || "",
    clientName: input.clientName || "",
    businessType: input.businessType || BUSINESS_TYPES[0],
    source: input.source || SOURCES[0],
    priority: input.priority || PRIORITIES[0],
    amount: Number(input.amount || 0),
    receivedAmount: Number(input.receivedAmount || 0),
    paymentStatus: input.paymentStatus || inferPaymentStatus(input),
    dueDate: input.dueDate || "",
    completedDate: input.completedDate || "",
    status: input.status || STATUSES[0],
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
    dueDate: row.due_date,
    completedDate: row.completed_date || "",
    status: row.status,
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
    due_date: order.dueDate,
    completed_date: order.completedDate || null,
    status: order.status,
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
  return order.dueDate < today && order.status !== "已完成" && order.status !== "已付款";
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
