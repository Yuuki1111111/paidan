import { APP_RUNTIME, getAuthRedirectUrl } from "../runtime.js";
import {
  createSupabaseBrowserClient,
  deleteRemoteBusinessPreset,
  deleteRemoteBusinessTemplate,
  fetchRemoteBusinessPresets,
  fetchRemoteBusinessTemplates,
  fetchRemoteOrders,
  hasCloudConfig,
  loadPreferredStorageMode,
  replaceRemoteOrders,
  savePreferredStorageMode,
  upsertRemoteBusinessPresets,
  upsertRemoteBusinessTemplates,
  upsertRemoteOrders,
} from "../shared/cloud.js";
import {
  DEFAULT_VIP_THRESHOLD,
  BUILT_IN_BUSINESS_TYPES,
  BUILT_IN_PRODUCTION_STAGES,
  BUSINESS_PRESET_KEY,
  BUSINESS_TEMPLATE_KEY,
  CURRENCY_OPTIONS,
  DISALLOWED_ABNORMAL_STATUSES,
  EXCEPTION_RESOLUTIONS,
  EXCEPTION_TYPES,
  FEE_MODES,
  FX_SETTINGS_KEY,
  LAST_TEMPLATE_KEY,
  MOBILE_TABS,
  PAYMENT_STATUSES,
  PRIORITIES,
  SOURCES,
  SOURCE_OPTIONS,
  STORAGE_KEY,
  STATUSES,
  SUPPORTED_CURRENCIES,
  USAGE_TYPES,
} from "../shared/constants.js";
import {
  formatHours,
  formatHourlyRate,
  formatCnyMoney,
  formatDateInput,
  normalizeCurrency,
  normalizeDateKey,
  normalizeMoneyValue,
  sanitizeWorkHours,
} from "../shared/format.js";
import { readJsonStorage, writeJsonStorage } from "../shared/storage.js";
import {
  calculateAdjustedNetAmount,
  calculateAdjustedNetAmountCny,
  calculateEffectiveAmount,
  calculateEffectiveAmountCny,
  calculateEffectiveReceived,
  calculateEffectiveReceivedCny,
  calculateGrossAmount,
  calculateGrossAmountCny,
  calculateHourlyRate,
  calculateRefundAmount,
  calculateUsageSurcharge,
  convertMoneyToCny,
  getDefaultFeeRate,
  getFeeModeLabel,
  getSourceColor,
  getSourceLabel,
  isAbnormal,
  isClosed,
  normalizeBusinessTypeValue,
  normalizeFeeMode,
  normalizeFxSettings,
  normalizeOrder,
  normalizePaymentStatus,
  normalizeProductionStageValue,
  normalizeStageTimeline,
  normalizeUsageType,
  canQuickEditWorkHours,
} from "../shared/orders.js";

const root = document.querySelector("#mobile-app");
const importJsonInput = document.querySelector("#mobile-import-json");

const SHEET_TEMPLATE = "template";
const SHEET_BUSINESS = "business";
const SHEET_EXCEPTION = "exception";
const SHEET_WORK_HOURS = "workHours";
const CALENDAR_MODE_TAGS = "tags";
const CALENDAR_MODE_TIMELINE = "timeline";
const TIMELINE_CREATE_THRESHOLD_PX = 10;
const TIMELINE_MOVE_THRESHOLD_PX = 10;
const TIMELINE_DRAG_CLICK_SUPPRESS_MS = 240;
const CLIENT_INSIGHT_SETTINGS_KEY = "artist-commission-client-insight-settings-v1";
const CALENDAR_DAY_MARKS_KEY = "artist-commission-calendar-day-marks-v1";
const CALENDAR_DAY_MARK_REST = "rest";
const CALENDAR_DAY_MARK_WORK = "work";
const CALENDAR_DAY_MARK_TYPES = [CALENDAR_DAY_MARK_REST, CALENDAR_DAY_MARK_WORK];
const AUTH_COOLDOWN_KEY = "artist-commission-auth-cooldowns-v1";
const initialAuthFlowType = detectFlowType();

let timelineCreateRangeSession = null;
let timelineMoveSession = null;
let timelineGlobalEventsBound = false;
let timelineDragSuppressClickUntil = 0;
let cloudRestorePromise = null;
let cloudWriteQueue = Promise.resolve();
let mobileTurnstileScriptPromise = null;
let authCooldownTicker = null;

const state = {
  tab: "orders",
  orderScope: "today",
  orderQuery: "",
  orderStatusFilter: "全部",
  orderSourceFilter: "全部",
  orderBusinessFilter: "全部",
  orderSortBy: "due",
  calendarMode: CALENDAR_MODE_TAGS,
  selectedCalendarDate: formatDateInput(new Date()),
  ordersFeedbackMessage: "",
  ordersFeedbackTone: "",
  createContextNote: "",
  createFeedbackMessage: "",
  createFeedbackTone: "",
  month: new Date(),
  orders: [],
  selectedOrderIds: new Set(),
  batchExceptionType: EXCEPTION_TYPES.find((value) => value !== "无") || EXCEPTION_TYPES[0],
  mode: "local",
  fxSettings: normalizeFxSettings({}),
  clientInsightSettings: loadLocalClientInsightSettings(),
  calendarDayMarks: loadLocalCalendarDayMarks(),
  clientInsightBusy: false,
  calendarDayMarksBusy: false,
  createDraft: null,
  editingOrderId: "",
  confirmDeleteOrderId: "",
  customBusinessTypes: [],
  businessTemplates: {},
  lastTemplate: null,
  activeSheet: "",
  templateSheetMode: "apply",
  templateDraftName: "",
  expandedTemplateKey: "",
  confirmDeleteTemplateKey: "",
  businessEditMode: false,
  businessAddOpen: false,
  businessDraftName: "",
  businessEditingValue: "",
  businessEditingDraft: "",
  workHoursEditorOrderId: "",
  workHoursEditorValue: "",
  expandedOrderId: "",
  exceptionEditorOrderId: "",
  exceptionEditorHandled: false,
  exceptionEditorResolution: EXCEPTION_RESOLUTIONS[0] || "",
  exceptionEditorRefundAmount: "",
  exceptionEditorNote: "",
  exceptionEditorMessage: "",
  authEmail: "",
  authPassword: "",
  authResetPassword: "",
  authResetPasswordConfirm: "",
  recoveryMode: initialAuthFlowType === "recovery",
  authCooldowns: loadAuthCooldowns(),
  turnstileStatus: APP_RUNTIME.turnstileSiteKey ? "idle" : "missing",
  turnstileToken: "",
  turnstileWidgetId: null,
  turnstileErrorCode: "",
  supabase: null,
  session: null,
  user: null,
  busy: false,
  usingLocalBackup: false,
  settingsFeedbackMessage: "",
  settingsFeedbackTone: "",
};

const TAB_ICONS = {
  orders: "◫",
  calendar: "▦",
  create: "＋",
  stats: "◔",
  settings: "⚙︎",
};

if (initialAuthFlowType) {
  savePreferredStorageMode("cloud", APP_RUNTIME);
}

refreshLocalData();
render();
bindTimelineGlobalEvents();
bindStaticInputs();
syncAuthCooldownTicker();
void initializeCloudWorkspace();
window.addEventListener("storage", () => {
  refreshLocalData();
  render();
});

function render() {
  root.innerHTML = `
    <div class="mobile-shell">
      ${renderHeader()}
      <main class="mobile-content">${renderCurrentTab()}</main>
    </div>
    ${renderSheetOverlay()}
    ${renderTabbar()}
  `;

  bindEvents();
  void mountTurnstileIfNeeded();
}

function isCloudModeEnabled() {
  return state.mode === "cloud";
}

function hasSignedInUser() {
  return Boolean(state.user);
}

function isCloudSyncActive() {
  return isCloudModeEnabled() && hasSignedInUser() && Boolean(state.supabase);
}

function enqueueCloudWrite(task) {
  cloudWriteQueue = cloudWriteQueue.catch(() => {}).then(task);
  return cloudWriteQueue;
}

function setBusy(nextBusy) {
  state.busy = Boolean(nextBusy);
  render();
}

function ensureSupabaseClient() {
  if (!hasCloudConfig(APP_RUNTIME)) {
    return null;
  }

  if (state.supabase) {
    return state.supabase;
  }

  state.supabase = createSupabaseBrowserClient(APP_RUNTIME);
  state.supabase.auth.onAuthStateChange((event, session) => {
    state.session = session;
    state.user = session?.user ?? null;
    if (event === "PASSWORD_RECOVERY") {
      state.recoveryMode = true;
      persistMode("cloud");
      setSettingsFeedback("已进入重置密码流程，请输入新密码。");
      render();
      return;
    }
    void handleCloudSessionChanged();
  });
  return state.supabase;
}

async function initializeCloudWorkspace() {
  const client = ensureSupabaseClient();
  if (!client) {
    render();
    return;
  }

  try {
    const { data, error } = await client.auth.getSession();
    if (error) {
      throw error;
    }
    state.session = data.session;
    state.user = data.session?.user ?? null;
    if (initialAuthFlowType) {
      persistMode("cloud");
    }
    if (isCloudModeEnabled() && state.user) {
      await syncCloudWorkspaceOnLogin({ silent: !initialAuthFlowType });
      return;
    }
    if (state.recoveryMode) {
      setSettingsFeedback("已打开重置密码链接，请输入新密码。");
    } else if (detectFlowType() === "signup") {
      setSettingsFeedback("邮箱验证链接已打开，请继续登录或等待自动恢复会话。");
    }
  } catch (error) {
    setSettingsFeedback(`恢复账号状态失败：${mapAuthError(error)}`, "error");
  }

  render();
}

async function handleCloudSessionChanged() {
  if (!isCloudModeEnabled() || !state.user) {
    state.usingLocalBackup = false;
    if (!state.user && detectFlowType() === "signup") {
      setSettingsFeedback("邮箱验证链接已打开，请返回登录状态继续使用。");
      clearAuthRedirect();
    }
    render();
    return;
  }

  await syncCloudWorkspaceOnLogin();
}

async function syncCloudWorkspaceOnLogin({ silent = false } = {}) {
  if (!state.supabase || !state.user) {
    return;
  }

  if (cloudRestorePromise) {
    return cloudRestorePromise;
  }

  cloudRestorePromise = (async () => {
    const localOrders = loadOrders(state.fxSettings);
    const localBusinessTypes = loadLocalBusinessPresets();
    const localTemplates = loadLocalBusinessTemplates(state.fxSettings);

    const remoteOrders = await fetchRemoteOrders(state.supabase, state.user.id, {
      fxSettings: state.fxSettings,
    });
    const remoteBusinessTypes = normalizeBusinessPresetList(
      await fetchRemoteBusinessPresets(state.supabase, state.user.id),
    );
    const remoteTemplates = normalizeBusinessTemplateMap(
      await fetchRemoteBusinessTemplates(state.supabase, state.user.id, (value) =>
        normalizeBusinessTemplate(value, state.fxSettings),
      ),
      state.fxSettings,
    );

    if (!remoteOrders.length && localOrders.length) {
      state.usingLocalBackup = true;
      persistLocalOrders(localOrders, state.fxSettings);
    } else {
      state.usingLocalBackup = false;
      persistLocalOrders(remoteOrders, state.fxSettings);
    }

    const mergedTemplates = {};
    const templateKeys = new Set([...Object.keys(localTemplates), ...Object.keys(remoteTemplates)]);
    templateKeys.forEach((businessType) => {
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

    persistLocalBusinessTemplates(mergedTemplates, state.fxSettings);

    const mergedBusinessTypes = normalizeBusinessPresetList([
      ...localBusinessTypes,
      ...remoteBusinessTypes,
      ...Object.keys(mergedTemplates).filter((value) => value && !BUILT_IN_BUSINESS_TYPES.includes(value)),
    ]);
    persistLocalBusinessPresets(mergedBusinessTypes);

    const missingRemoteBusinessTypes = mergedBusinessTypes.filter((value) => !remoteBusinessTypes.includes(value));
    if (missingRemoteBusinessTypes.length) {
      await upsertRemoteBusinessPresets(state.supabase, state.user.id, missingRemoteBusinessTypes);
    }

    const templatesToPush = Object.values(mergedTemplates).filter((template) => {
      const remoteTemplate = remoteTemplates[template.businessType];
      return !remoteTemplate || getSettingsTimestamp(template.updatedAt) > getSettingsTimestamp(remoteTemplate.updatedAt);
    });
    if (templatesToPush.length) {
      const persistedTemplates = await upsertRemoteBusinessTemplates(
        state.supabase,
        state.user.id,
        templatesToPush,
        (value) => normalizeBusinessTemplate(value, state.fxSettings),
      );
      persistLocalBusinessTemplates(
        {
          ...mergedTemplates,
          ...normalizeBusinessTemplateMap(persistedTemplates, state.fxSettings),
        },
        state.fxSettings,
      );
    }

    await syncClientInsightSettingsOnLogin();
    await syncCalendarDayMarksOnLogin();

    refreshLocalData();
    if (!silent) {
      if (state.recoveryMode) {
        setSettingsFeedback("已通过重置链接返回，请输入新密码。");
      } else if (detectFlowType() === "signup") {
        setSettingsFeedback("邮箱验证成功，已经为你登录。");
        clearAuthRedirect();
      } else {
        setSettingsFeedback(
          state.usingLocalBackup
            ? `已登录 ${state.user.email || ""}。云端还没有数据，当前继续用这台设备里的本地记录；你后续保存时会自动推到云端。`
            : `已登录 ${state.user.email || ""}，当前稿件、业务和模板都会继续同步到云端。`,
        );
      }
    }
    render();
  })()
    .catch((error) => {
      setSettingsFeedback(`同步云端数据失败：${mapAuthError(error)}`, "error");
      render();
    })
    .finally(() => {
      cloudRestorePromise = null;
    });

  return cloudRestorePromise;
}

async function setStorageMode(nextMode) {
  if (nextMode === state.mode) {
    return;
  }

  if (nextMode === "cloud" && !hasCloudConfig(APP_RUNTIME)) {
    setSettingsFeedback("当前还没配置 Supabase 环境变量，暂时不能切到账号同步。", "error");
    render();
    return;
  }

  persistMode(nextMode);
  refreshLocalData();

  if (nextMode === "cloud") {
    await initializeCloudWorkspace();
    if (!state.user) {
      setSettingsFeedback("已切到账号同步。登录后会先拉取云端数据；未登录前仍继续显示本地记录。");
      render();
    } else {
      setSettingsFeedback("已切到账号同步，当前会继续使用并同步云端数据。");
      render();
    }
    return;
  }

  state.usingLocalBackup = false;
  setSettingsFeedback("已切回本地使用。当前录单、模板和排期只保存在这台设备。");
  render();
}

function getRequiredTurnstileToken(actionLabel) {
  if (!hasTurnstileConfig()) {
    setSettingsFeedback(`当前项目还没开启人机验证，移动端暂时不能${actionLabel}。请先去网页端完成。`, "error");
    render();
    return "";
  }

  const captchaToken = String(state.turnstileToken || "").trim();
  if (captchaToken) {
    return captchaToken;
  }

  setSettingsFeedback(
    state.turnstileStatus === "error" ? getMobileTurnstileErrorMessage() : `请先完成人机验证，再${actionLabel}。`,
    "error",
  );
  render();
  return "";
}

async function signUpWithPasswordMobile() {
  const client = ensureSupabaseClient();
  if (!client) {
    setSettingsFeedback("当前还没配置 Supabase 环境变量，暂时不能注册。", "error");
    render();
    return;
  }

  const email = String(state.authEmail || "").trim();
  const password = String(state.authPassword || "").trim();
  if (!email || !password) {
    setSettingsFeedback("先填写邮箱和密码。", "error");
    render();
    return;
  }
  if (hasAuthCooldown("signup", email)) {
    setSettingsFeedback(getAuthCooldownMessage("signup", email), "error");
    render();
    return;
  }

  const captchaToken = getRequiredTurnstileToken("注册");
  if (!captchaToken) {
    return;
  }

  setBusy(true);
  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(currentSiteUrl()),
        captchaToken,
      },
    });
    if (error) {
      throw error;
    }
    state.authPassword = "";
    if (data.session) {
      setSettingsFeedback("注册成功，已自动登录。");
    } else {
      startAuthCooldown("signup", email);
      startAuthCooldown("resendSignup", email);
      setSettingsFeedback("注册成功，请去邮箱点验证链接。60 秒内先别重复点注册；没收到再点“重发验证邮件”。");
    }
  } catch (error) {
    handleAuthActionError(error, { action: "signup", email });
  } finally {
    resetMobileTurnstile();
    setBusy(false);
  }
}

async function resendSignupEmailMobile() {
  const client = ensureSupabaseClient();
  if (!client) {
    setSettingsFeedback("当前还没配置 Supabase 环境变量，暂时不能重发验证邮件。", "error");
    render();
    return;
  }

  const email = String(state.authEmail || "").trim();
  if (!email) {
    setSettingsFeedback("先填写要验证的邮箱。", "error");
    render();
    return;
  }
  if (hasAuthCooldown("resendSignup", email)) {
    setSettingsFeedback(getAuthCooldownMessage("resendSignup", email), "error");
    render();
    return;
  }

  const captchaToken = getRequiredTurnstileToken("重发验证邮件");
  if (!captchaToken) {
    return;
  }

  setBusy(true);
  try {
    const { error } = await client.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: getAuthRedirectUrl(currentSiteUrl()),
        captchaToken,
      },
    });
    if (error) {
      throw error;
    }
    startAuthCooldown("signup", email);
    startAuthCooldown("resendSignup", email);
    setSettingsFeedback("验证邮件已重新发送，请检查邮箱。60 秒内先别重复点。");
  } catch (error) {
    handleAuthActionError(error, { action: "resendSignup", email });
  } finally {
    resetMobileTurnstile();
    setBusy(false);
  }
}

async function requestPasswordResetMobile() {
  const client = ensureSupabaseClient();
  if (!client) {
    setSettingsFeedback("当前还没配置 Supabase 环境变量，暂时不能重置密码。", "error");
    render();
    return;
  }

  const email = String(state.authEmail || "").trim();
  if (!email) {
    setSettingsFeedback("先填写注册邮箱，我才能发重置邮件。", "error");
    render();
    return;
  }
  if (hasAuthCooldown("forgotPassword", email)) {
    setSettingsFeedback(getAuthCooldownMessage("forgotPassword", email), "error");
    render();
    return;
  }

  const captchaToken = getRequiredTurnstileToken("发送重置邮件");
  if (!captchaToken) {
    return;
  }

  setBusy(true);
  try {
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(currentSiteUrl()),
      captchaToken,
    });
    if (error) {
      throw error;
    }
    startAuthCooldown("forgotPassword", email);
    setSettingsFeedback("重置密码邮件已发送，请去邮箱点开链接后回到当前页面。60 秒内先别重复点。");
  } catch (error) {
    handleAuthActionError(error, { action: "forgotPassword", email });
  } finally {
    resetMobileTurnstile();
    setBusy(false);
  }
}

async function completePasswordResetMobile() {
  const client = ensureSupabaseClient();
  if (!client || !state.recoveryMode) {
    setSettingsFeedback("当前不在重置密码流程里。", "error");
    render();
    return;
  }

  const password = String(state.authResetPassword || "").trim();
  const confirmPassword = String(state.authResetPasswordConfirm || "").trim();
  if (password.length < 6) {
    setSettingsFeedback("新密码至少 6 位。", "error");
    render();
    return;
  }
  if (password !== confirmPassword) {
    setSettingsFeedback("两次输入的新密码不一致。", "error");
    render();
    return;
  }

  setBusy(true);
  try {
    const { error } = await client.auth.updateUser({ password });
    if (error) {
      throw error;
    }
    state.recoveryMode = false;
    state.authResetPassword = "";
    state.authResetPasswordConfirm = "";
    clearAuthRedirect();
    setSettingsFeedback("密码已更新，可以直接继续使用。");
  } catch (error) {
    setSettingsFeedback(mapAuthError(error), "error");
  } finally {
    setBusy(false);
  }
}

async function signInWithPasswordMobile() {
  const client = ensureSupabaseClient();
  if (!client) {
    setSettingsFeedback("当前还没配置 Supabase 环境变量，暂时不能登录。", "error");
    render();
    return;
  }

  const email = String(state.authEmail || "").trim();
  const password = String(state.authPassword || "").trim();

  if (!email || !password) {
    setSettingsFeedback("先填写邮箱和密码。", "error");
    render();
    return;
  }

  const captchaToken = hasTurnstileConfig() ? state.turnstileToken : "";
  if (hasTurnstileConfig() && !captchaToken) {
    setSettingsFeedback(
      state.turnstileStatus === "error" ? getMobileTurnstileErrorMessage() : "请先完成人机验证，再继续登录。",
      "error",
    );
    render();
    return;
  }

  setBusy(true);
  try {
    const { error } = await client.auth.signInWithPassword({
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
    if (error) {
      throw error;
    }
    state.authPassword = "";
    state.recoveryMode = false;
    setSettingsFeedback(state.mode === "cloud" ? "登录成功，正在拉取云端数据。" : "登录成功。切到账号同步后会拉取云端数据。");
  } catch (error) {
    setSettingsFeedback(mapAuthError(error), "error");
  } finally {
    resetMobileTurnstile();
    setBusy(false);
  }
}

async function signOutMobile() {
  if (!state.supabase || !state.user) {
    setSettingsFeedback("当前还没有登录账号。", "error");
    render();
    return;
  }

  setBusy(true);
  try {
    const { error } = await state.supabase.auth.signOut();
    if (error) {
      throw error;
    }
    state.session = null;
    state.user = null;
    state.authPassword = "";
    state.authResetPassword = "";
    state.authResetPasswordConfirm = "";
    state.recoveryMode = false;
    state.usingLocalBackup = false;
    clearAuthRedirect();
    setSettingsFeedback("已退出账号。当前仍保留这台设备上的本地记录。");
  } catch (error) {
    setSettingsFeedback(mapAuthError(error), "error");
  } finally {
    setBusy(false);
  }
}

async function deleteAccountMobile() {
  if (!state.supabase || !state.user) {
    setSettingsFeedback("要先登录账号，才能删除账号和云端数据。", "error");
    render();
    return;
  }

  const confirmed = window.confirm("确认删除当前账号吗？这会删除云端稿件、模板、业务和登录账号，不能恢复。");
  if (!confirmed) {
    return;
  }

  setBusy(true);
  try {
    const { error } = await state.supabase.functions.invoke("delete-account", {
      body: {
        confirm: true,
      },
    });
    if (error) {
      throw error;
    }
    state.session = null;
    state.user = null;
    state.authPassword = "";
    state.authResetPassword = "";
    state.authResetPasswordConfirm = "";
    state.recoveryMode = false;
    state.usingLocalBackup = false;
    persistMode("local");
    clearAuthRedirect();
    refreshLocalData();
    setSettingsFeedback("账号和云端数据已删除，当前已切回本地使用。");
  } catch (error) {
    setSettingsFeedback(`删除账号失败：${mapAuthError(error)}。请确认 delete-account 已部署。`, "error");
  } finally {
    setBusy(false);
  }
}

async function syncOrdersAfterLocalChange(nextOrders, changedOrders = nextOrders) {
  if (!isCloudSyncActive()) {
    return false;
  }

  await enqueueCloudWrite(async () => {
    if (state.usingLocalBackup) {
      const persisted = await replaceRemoteOrders(state.supabase, state.user.id, nextOrders, {
        fxSettings: state.fxSettings,
      });
      state.usingLocalBackup = false;
      persistLocalOrders(persisted, state.fxSettings);
      return;
    }

    await upsertRemoteOrders(state.supabase, state.user.id, changedOrders, {
      refresh: false,
      fxSettings: state.fxSettings,
    });
  });

  return true;
}

async function syncCloudNow() {
  if (!isCloudSyncActive()) {
    setSettingsFeedback("要先切到账号同步并登录，才能手动同步。", "error");
    render();
    return;
  }

  setBusy(true);
  try {
    if (state.usingLocalBackup) {
      const persisted = await replaceRemoteOrders(state.supabase, state.user.id, loadOrders(state.fxSettings), {
        fxSettings: state.fxSettings,
      });
      state.usingLocalBackup = false;
      persistLocalOrders(persisted, state.fxSettings);
      setSettingsFeedback("已把当前本地记录上传到云端。");
    } else {
      await syncCloudWorkspaceOnLogin({ silent: true });
      setSettingsFeedback("已重新拉取云端数据。");
    }
  } catch (error) {
    setSettingsFeedback(`手动同步失败：${mapAuthError(error)}`, "error");
  } finally {
    setBusy(false);
  }
}

function hasTurnstileConfig() {
  return Boolean(APP_RUNTIME.turnstileSiteKey);
}

function shouldRenderTurnstile() {
  return state.tab === "settings" && !hasSignedInUser() && !state.recoveryMode && hasTurnstileConfig();
}

function getMobileTurnstileNote() {
  if (!hasTurnstileConfig()) {
    return "当前项目没有开启人机验证，移动端会直接尝试登录。";
  }
  if (state.turnstileStatus === "loading") {
    return "人机验证组件正在加载。";
  }
  if (state.turnstileStatus === "verified") {
    return "人机验证已通过，可以直接登录。";
  }
  if (state.turnstileStatus === "error") {
    return getMobileTurnstileErrorMessage();
  }
  return "登录前需要先完成人机验证。";
}

function getMobileTurnstileErrorMessage() {
  const errorCode = String(state.turnstileErrorCode || "").trim();
  const currentHost = window.location.hostname || "当前域名";

  if (errorCode === "110200") {
    return `${currentHost} 没有加入 Turnstile 的 Hostname 白名单，当前环境不能完成人机验证。请改用已授权域名，或把这个域名加进 Cloudflare 后再登录。`;
  }
  if (errorCode.startsWith("110")) {
    return `人机验证配置有误（${errorCode}），请检查 Turnstile 的域名白名单和 site key。`;
  }
  if (errorCode.startsWith("300")) {
    return `人机验证挑战失败（${errorCode}），请换普通浏览器/真机重试，或先用网页端登录。`;
  }
  if (errorCode) {
    return `人机验证加载失败（${errorCode}），请稍后再试或先用网页端登录。`;
  }
  return "人机验证加载失败，请稍后再试或先用网页端登录。";
}

function canRetryMobileTurnstile() {
  return state.turnstileStatus === "error" && String(state.turnstileErrorCode || "").trim() !== "110200";
}

function ensureTurnstileScript() {
  if (window.turnstile?.render) {
    return Promise.resolve(window.turnstile);
  }

  if (mobileTurnstileScriptPromise) {
    return mobileTurnstileScriptPromise;
  }

  mobileTurnstileScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-mobile-turnstile="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.turnstile), { once: true });
      existing.addEventListener("error", () => reject(new Error("Turnstile failed to load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.mobileTurnstile = "true";
    script.addEventListener("load", () => resolve(window.turnstile), { once: true });
    script.addEventListener("error", () => reject(new Error("Turnstile failed to load.")), { once: true });
    document.head.append(script);
  }).catch((error) => {
    mobileTurnstileScriptPromise = null;
    throw error;
  });

  return mobileTurnstileScriptPromise;
}

async function mountTurnstileIfNeeded() {
  if (
    !shouldRenderTurnstile()
    || state.turnstileStatus !== "idle"
    || state.turnstileToken
    || state.turnstileWidgetId !== null
  ) {
    return;
  }

  const slot = root.querySelector("[data-turnstile-slot]");
  if (!slot) {
    return;
  }

  state.turnstileStatus = "loading";
  try {
    await ensureTurnstileScript();
    const freshSlot = root.querySelector("[data-turnstile-slot]");
    if (!freshSlot || !window.turnstile?.render) {
      return;
    }
    state.turnstileStatus = "ready";
    state.turnstileWidgetId = window.turnstile.render(freshSlot, {
      sitekey: APP_RUNTIME.turnstileSiteKey,
      theme: "light",
      size: "flexible",
      action: "auth_email",
      callback(token) {
        state.turnstileErrorCode = "";
        state.turnstileToken = token;
        state.turnstileStatus = "verified";
        render();
      },
      "expired-callback"() {
        resetMobileTurnstile();
      },
      "error-callback"(errorCode) {
        state.turnstileWidgetId = null;
        state.turnstileToken = "";
        state.turnstileErrorCode = String(errorCode || "").trim();
        state.turnstileStatus = "error";
        render();
      },
    });
  } catch {
    state.turnstileWidgetId = null;
    state.turnstileToken = "";
    state.turnstileErrorCode = "";
    state.turnstileStatus = "error";
    render();
  }
}

function resetMobileTurnstile() {
  if (state.turnstileWidgetId !== null && window.turnstile?.remove) {
    try {
      window.turnstile.remove(state.turnstileWidgetId);
    } catch {}
  }
  state.turnstileWidgetId = null;
  state.turnstileToken = "";
  state.turnstileErrorCode = "";
  state.turnstileStatus = hasTurnstileConfig() ? "idle" : "missing";
  if (state.tab === "settings") {
    render();
  }
}

function renderMobileTurnstilePanel() {
  if (!hasTurnstileConfig()) {
    return "";
  }

  return `
    <div class="mobile-settings-turnstile">
      <div class="mobile-settings-turnstile-slot" data-turnstile-slot></div>
      <p class="mobile-settings-note">${escapeHtml(getMobileTurnstileNote())}</p>
      ${
        canRetryMobileTurnstile()
          ? `
            <button class="mobile-settings-action-button mobile-settings-secondary-button" type="button" data-action="retry-turnstile">
              重试人机验证
            </button>
          `
          : ""
      }
    </div>
  `;
}

function renderHeader() {
  const meta = {
    orders: {
      eyebrow: "Orders",
      title: "订单",
      subtitle: "把移动端先做成独立工作区，网页端继续保留原布局。",
      actions: `
        <button class="mobile-icon-button" type="button" data-action="refresh" aria-label="刷新数据">↻</button>
        <button class="mobile-icon-button" type="button" data-action="jump-create" aria-label="新建稿件">＋</button>
      `,
    },
    calendar: {
      eyebrow: "Calendar",
      title: "月历",
      subtitle: "标签月历和周分组条状排期共用一套数据，移动端优先保证排期可读性。",
      actions: `
        <button class="mobile-icon-button" type="button" data-action="month-prev" aria-label="上个月">‹</button>
        <button class="mobile-icon-button" type="button" data-action="month-next" aria-label="下个月">›</button>
      `,
    },
    create: {
      eyebrow: "Create",
      title: "新建",
      subtitle: "录单结构按 Figma 定稿保留，业务细节继续复用网页端真实字段和模板语义。",
      actions: `
        <button class="mobile-pill-button" type="button" disabled>保存稿件</button>
      `,
    },
    stats: {
      eyebrow: "Stats",
      title: "统计",
      subtitle: "先把结果页跑通，后续再叠更细的趋势和客户分析。",
      actions: `
        <button class="mobile-icon-button" type="button" data-action="refresh" aria-label="刷新数据">↻</button>
      `,
    },
    settings: {
      eyebrow: "Settings",
      title: "设置",
      subtitle: "同步、导入导出和支持全部收进设置，不回主工作区。",
      actions: "",
    },
  }[state.tab];

  return `
    <header class="mobile-header">
      <div class="mobile-title-wrap">
        <p class="mobile-eyebrow">${meta.eyebrow}</p>
        <h1 class="mobile-title">${meta.title}</h1>
        <p class="mobile-subtitle">${meta.subtitle}</p>
      </div>
      <div class="mobile-header-actions">${meta.actions}</div>
    </header>
  `;
}

function renderCurrentTab() {
  if (state.tab === "orders") return renderOrdersTab();
  if (state.tab === "calendar") return renderCalendarTab();
  if (state.tab === "create") return renderCreateTab();
  if (state.tab === "stats") return renderStatsTab();
  return renderSettingsTab();
}

function renderOrdersTab() {
  const scopedOrders = getScopedOrders();
  const abnormalOrders = getAbnormalOrders();
  const archivedOrders = getArchivedOrders();
  const visibleOrders = getVisibleOrderPool(scopedOrders, abnormalOrders, archivedOrders);
  syncSelectionToVisible(visibleOrders);
  const selectedVisibleIds = getSelectedVisibleIds(visibleOrders);
  const selectedVisibleOrders = visibleOrders.filter((order) => selectedVisibleIds.includes(order.id));
  const allVisibleSelected = visibleOrders.length > 0 && selectedVisibleIds.length === visibleOrders.length;
  const hasAbnormalSelection = selectedVisibleOrders.some(isAbnormal);
  const hasNormalSelection = selectedVisibleOrders.some((order) => !isAbnormal(order));
  const activeOrders = state.orders.filter((order) => !isClosed(order));
  const thisWeekDue = activeOrders.filter((order) => isDateInThisWeek(order.dueDate)).length;
  const pendingAmount = activeOrders.reduce((total, order) => {
    const gross = calculateAdjustedNetAmountCny(order, state.fxSettings);
    const received = calculateEffectiveReceivedCny(order, state.fxSettings);
    return total + Math.max(gross - received, 0);
  }, 0);

  return `
    <section class="mobile-card">
      <div class="mobile-segmented">
        ${renderScopeButton("today", "今天")}
        ${renderScopeButton("week", "本周")}
        ${renderScopeButton("all", "全部")}
      </div>
    </section>
    <section class="mobile-card">
      <div class="mobile-summary-grid">
        <article class="mobile-summary-item">
          <span class="mobile-summary-label">待处理</span>
          <strong class="mobile-summary-value is-accent">${scopedOrders.length}</strong>
        </article>
        <article class="mobile-summary-item">
          <span class="mobile-summary-label">本周到期</span>
          <strong class="mobile-summary-value">${thisWeekDue}</strong>
        </article>
        <article class="mobile-summary-item">
          <span class="mobile-summary-label">待收金额</span>
          <strong class="mobile-summary-value is-green">${formatCompactAmount(pendingAmount)}</strong>
        </article>
      </div>
    </section>
    <section class="mobile-card">
      <div class="mobile-orders-filter-grid">
        <label class="mobile-orders-search">
          <span class="mobile-form-label">搜索</span>
          <input
            class="mobile-form-input"
            type="search"
            placeholder="项目名 / 客户 / 备注"
            data-order-query
            value="${escapeAttribute(state.orderQuery)}"
          />
        </label>
        <label class="mobile-orders-filter">
          <span class="mobile-form-label">状态</span>
          <span class="mobile-form-select-wrap">
            <select class="mobile-form-select" data-order-status-filter>
              ${renderOrdersFilterOptions(["全部", ...STATUSES], state.orderStatusFilter)}
            </select>
          </span>
        </label>
        <label class="mobile-orders-filter">
          <span class="mobile-form-label">来源</span>
          <span class="mobile-form-select-wrap">
            <select class="mobile-form-select" data-order-source-filter>
              ${renderOrdersFilterOptions(["全部", ...SOURCES], state.orderSourceFilter, getSourceLabel)}
            </select>
          </span>
        </label>
        <label class="mobile-orders-filter">
          <span class="mobile-form-label">业务</span>
          <span class="mobile-form-select-wrap">
            <select class="mobile-form-select" data-order-business-filter>
              ${renderOrdersFilterOptions(["全部", ...getAllBusinessTypes()], state.orderBusinessFilter)}
            </select>
          </span>
        </label>
        <label class="mobile-orders-filter">
          <span class="mobile-form-label">排序</span>
          <span class="mobile-form-select-wrap">
            <select class="mobile-form-select" data-order-sort-by>
              <option value="due"${state.orderSortBy === "due" ? " selected" : ""}>截稿日期</option>
              <option value="amount"${state.orderSortBy === "amount" ? " selected" : ""}>金额</option>
              <option value="created"${state.orderSortBy === "created" ? " selected" : ""}>动工日期</option>
              <option value="client"${state.orderSortBy === "client" ? " selected" : ""}>客户名</option>
            </select>
          </span>
        </label>
      </div>
    </section>
    <section class="mobile-card">
      <div class="mobile-row-between">
        <div>
          <h2 class="mobile-section-title">批量操作</h2>
          <p class="mobile-form-hint">点卡片右上角的选择按钮后，就能批量改状态、记已结清或设异常。</p>
        </div>
        <span class="mobile-muted">${selectedVisibleIds.length} / ${visibleOrders.length || 0} 已选</span>
      </div>
      ${
        state.ordersFeedbackMessage
          ? `
            <div class="mobile-feedback-banner${state.ordersFeedbackTone === "error" ? " is-error" : " is-success"} mobile-orders-feedback">
              ${escapeHtml(state.ordersFeedbackMessage)}
            </div>
          `
          : ""
      }
      <div class="mobile-chip-row mobile-order-batch-toolbar">
        <button class="mobile-chip${allVisibleSelected ? " is-active" : ""}" type="button" data-action="${allVisibleSelected ? "clear-selection" : "select-all-visible"}"${
          visibleOrders.length ? "" : " disabled"
        }>${allVisibleSelected ? "取消全选" : "全选当前可见"}</button>
        <button class="mobile-chip" type="button" data-action="clear-selection"${selectedVisibleIds.length ? "" : " disabled"}>清空选择</button>
      </div>
      ${
        selectedVisibleIds.length
          ? `
            <div class="mobile-order-batch-grid">
              <button class="mobile-pill-button" type="button" data-action="batch-mark-done"${hasAbnormalSelection ? " disabled" : ""}>完结归档</button>
              <button class="mobile-pill-button" type="button" data-action="batch-mark-paid"${hasAbnormalSelection ? " disabled" : ""}>记为已结清</button>
              <button class="mobile-pill-button" type="button" data-action="batch-mark-handled"${hasNormalSelection ? " disabled" : ""}>批量已处理</button>
            </div>
            <div class="mobile-order-batch-exception">
              <span class="mobile-form-select-wrap">
                <select class="mobile-form-select" data-batch-exception-type>
                  ${EXCEPTION_TYPES.filter((value) => value !== "无")
                    .map(
                      (value) =>
                        `<option value="${escapeAttribute(value)}"${value === state.batchExceptionType ? " selected" : ""}>${escapeHtml(value)}</option>`,
                    )
                    .join("")}
                </select>
              </span>
              <button class="mobile-pill-button mobile-pill-button-accent" type="button" data-action="batch-apply-exception">批量设异常</button>
            </div>
          `
          : `<div class="mobile-empty">还没选中稿件。可以先选一单，再用这里做单条或批量处理。</div>`
      }
    </section>
    <section class="mobile-card">
      <h2 class="mobile-section-title">正在处理的稿件</h2>
      <div class="mobile-list">
        ${
          scopedOrders.length
            ? scopedOrders.map(renderOrderCard).join("")
            : `<div class="mobile-empty">当前条件下没有符合的稿件。</div>`
        }
      </div>
    </section>
    <section class="mobile-card">
      <div class="mobile-row-between">
        <h2 class="mobile-section-title">异常单</h2>
        <span class="mobile-muted">${abnormalOrders.length} 条</span>
      </div>
      <div class="mobile-list">
        ${
          abnormalOrders.length
            ? abnormalOrders.map((order) => renderOrderCard(order, { tone: "warning" })).join("")
            : `<div class="mobile-empty">当前筛选下没有异常单。</div>`
        }
      </div>
    </section>
    <section class="mobile-card">
      <div class="mobile-row-between">
        <h2 class="mobile-section-title">最近归档</h2>
        <span class="mobile-muted">${archivedOrders.length} 条</span>
      </div>
      <div class="mobile-list">
        ${
          archivedOrders.length
            ? archivedOrders.map((order) => renderOrderCard(order, { tone: "muted" })).join("")
            : `<div class="mobile-empty">最近还没有已完成或已处理的稿件。</div>`
        }
      </div>
    </section>
  `;
}

function renderCalendarTab() {
  const monthLabel = `${state.month.getFullYear()}年${state.month.getMonth() + 1}月`;
  const range = buildCalendarRange(state.month);
  const selectedDate = ensureSelectedCalendarDate(range);
  const selectedEntries = getCalendarEntriesForDate(selectedDate);
  const monthDue = state.orders
    .filter((order) => isSameMonth(order.dueDate || order.completedDate, state.month))
    .sort((left, right) => String(left.dueDate || "").localeCompare(String(right.dueDate || "")))
    .slice(0, 4);

  return `
    <section class="mobile-card">
      <div class="mobile-row-between">
        <h2 class="mobile-section-title">${monthLabel}</h2>
        <span class="mobile-muted">${monthDue.length} 条近期排期</span>
      </div>
      <div class="mobile-segmented mobile-calendar-segmented">
        <button type="button" data-calendar-mode="${CALENDAR_MODE_TAGS}" class="${state.calendarMode === CALENDAR_MODE_TAGS ? "is-active" : ""}">标签月历</button>
        <button type="button" data-calendar-mode="${CALENDAR_MODE_TIMELINE}" class="${state.calendarMode === CALENDAR_MODE_TIMELINE ? "is-active" : ""}">条状排期</button>
      </div>
    </section>
    ${
      state.calendarMode === CALENDAR_MODE_TAGS
        ? renderCalendarTagsView(range, selectedDate)
        : renderCalendarTimelineView(range)
    }
    <section class="mobile-card">
      <div class="mobile-row-between">
        <h2 class="mobile-section-title">${formatCalendarDialogDate(selectedDate)} · ${selectedEntries.length} 项</h2>
        <button class="mobile-primary-inline" type="button" data-action="jump-create">新建稿件</button>
      </div>
      <div class="mobile-chip-row mobile-calendar-mark-bar">
        <button class="mobile-chip${getCalendarDayMarkType(selectedDate) === CALENDAR_DAY_MARK_REST ? " is-active" : ""}" type="button" data-calendar-mark-rest="${escapeAttribute(selectedDate)}"${state.calendarDayMarksBusy ? " disabled" : ""}>标为休息日</button>
        <button class="mobile-chip${getCalendarDayMarkType(selectedDate) === CALENDAR_DAY_MARK_WORK ? " is-active" : ""}" type="button" data-calendar-mark-work="${escapeAttribute(selectedDate)}"${state.calendarDayMarksBusy ? " disabled" : ""}>标为工作日</button>
        ${getCalendarDayMarkType(selectedDate) ? `<button class="mobile-chip" type="button" data-calendar-mark-clear="${escapeAttribute(selectedDate)}"${state.calendarDayMarksBusy ? " disabled" : ""}>清除标记</button>` : ""}
      </div>
      <div class="mobile-list">
        ${
          selectedEntries.length
            ? selectedEntries.map(renderCalendarEntryCard).join("")
            : `<div class="mobile-empty">这一天还没有稿件。月历页内的新建入口后续会保留日期上下文语义。</div>`
        }
      </div>
    </section>
  `;
}

function renderCalendarTagsView(range, selectedDate) {
  const weekdayLabels = ["日", "一", "二", "三", "四", "五", "六"];
  return `
    <section class="mobile-card">
      <div class="mobile-calendar-weekday-row">
        ${weekdayLabels.map((label) => `<span>${label}</span>`).join("")}
      </div>
      <div class="mobile-calendar-grid">
        ${range.dateKeys
          .map((dateKey) => {
            const date = parseDateKey(dateKey);
            const inMonth = date?.getMonth() === state.month.getMonth();
            const isToday = dateKey === formatDateInput(new Date());
            const isSelected = dateKey === selectedDate;
            const markType = getCalendarDayMarkType(dateKey);
            const markLabel = markType === CALENDAR_DAY_MARK_REST ? "休" : markType === CALENDAR_DAY_MARK_WORK ? "班" : "";
            const dots = getCalendarEntriesForDate(dateKey)
              .slice(0, 4)
              .map((entry) => `<span class="mobile-calendar-dot" style="background:${getOrderCalendarColor(entry.order)}"></span>`)
              .join("");
            return `
              <button type="button" class="mobile-calendar-cell${inMonth ? "" : " is-outside"}${isToday ? " is-today" : ""}${isSelected ? " is-selected" : ""}${markType ? ` is-mark-${markType}` : ""}" data-calendar-date="${escapeAttribute(
                dateKey,
              )}">
                <span class="mobile-calendar-day">${date?.getDate() || ""}${markLabel ? `<span class="mobile-calendar-mark">${markLabel}</span>` : ""}</span>
                <div class="mobile-calendar-dots">${dots}</div>
              </button>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderCalendarTimelineView(range) {
  const weeks = buildMobileTimelineWeeks(state.orders, range);
  return `
    <section class="mobile-card">
      <div class="mobile-row-between">
        <h2 class="mobile-section-title">条状排期</h2>
        <button class="mobile-primary-inline" type="button" data-action="jump-create">新建稿件</button>
      </div>
      <div class="mobile-timeline-list">
        ${
          weeks.length
            ? weeks.map((week) => renderTimelineWeek(week)).join("")
            : `<div class="mobile-empty">当前月份没有可展示的排期条。</div>`
        }
      </div>
      <p class="mobile-fab-note">按周展示横向跨天条，和网页端一样以日期跨度而不是进度百分比排布。</p>
    </section>
  `;
}

function renderTimelineWeek(week) {
  return `
    <article class="mobile-timeline-week">
      <div class="mobile-timeline-week-label">${escapeHtml(week.label)}</div>
      <div class="mobile-timeline-days">
        ${week.days
          .map(
            (day) => `
              <button type="button" class="mobile-timeline-day${day.inMonth ? "" : " is-outside"}${day.isToday ? " is-today" : ""}${day.isSelected ? " is-selected" : ""}" data-calendar-date="${escapeAttribute(
                day.key,
              )}">
                <span class="mobile-timeline-weekday">${day.weekday}</span>
                <span class="mobile-timeline-date">${day.day}</span>
              </button>
            `,
          )
          .join("")}
      </div>
      <div class="mobile-timeline-track" data-timeline-track data-week-start="${escapeAttribute(week.weekStartKey)}" style="--lane-count:${Math.max(week.laneCount, 1)};">
        ${week.bars.length ? week.bars.map(renderTimelineWeekBar).join("") : `<div class="mobile-timeline-empty-range">拖拽日期范围创建稿件</div>`}
      </div>
    </article>
  `;
}

function renderTimelineWeekBar(segment) {
  const width = ((segment.endCol - segment.startCol + 1) / 7) * 100;
  const left = (segment.startCol / 7) * 100;
  const style = `left:${left}%;width:${width}%;top:${6 + segment.lane * 36}px;--bar-bg:${segment.palette.background};--bar-border:${segment.palette.border};--bar-text:${segment.palette.text};`;
  const labels = [];
  if (segment.order.productionStage) labels.push(segment.order.productionStage);
  if (normalizePaymentStatus(segment.order) !== PAYMENT_STATUSES[0]) labels.push(normalizePaymentStatus(segment.order));

  return `
    <article class="mobile-timeline-bar${segment.closed ? " is-closed" : ""}${segment.continuesBefore ? " continues-before" : ""}${segment.continuesAfter ? " continues-after" : ""}" data-timeline-bar data-timeline-order-id="${escapeAttribute(segment.order.id)}" data-focus-date="${escapeAttribute(segment.focusDateKey)}" style="${style}">
      <div class="mobile-timeline-bar-main">
        <strong class="mobile-timeline-bar-title">${escapeHtml(segment.label)}</strong>
        ${
          labels.length
            ? `<span class="mobile-timeline-bar-meta">${escapeHtml(labels.join(" · "))}</span>`
            : ""
        }
      </div>
    </article>
  `;
}

function renderCreateTab() {
  const draft = state.createDraft;
  const sourceLabel = getSourceLabel(draft.source);
  const sourceColor = getSourceColor(draft.source);
  const feeRatePercent = formatRatePercent(draft.feeRate);
  const usageRatePercent = formatRatePercent(draft.usageRate);
  const feeSummary = buildFeeSummary(draft);
  const recentBusinessTypes = getRecentBusinessTypes();
  const editingOrder = state.editingOrderId ? state.orders.find((order) => order.id === state.editingOrderId) : null;
  const stageOptions = [draft.productionStage || BUILT_IN_PRODUCTION_STAGES[0], ...BUILT_IN_PRODUCTION_STAGES]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 5);
  const repeatReady = Boolean(getRepeatSource());

  return `
    <section class="mobile-card">
      <div class="mobile-form-toolbar">
        <button class="mobile-chip" type="button" data-action="repeat-last"${repeatReady ? "" : " disabled"}>复制上单</button>
        <button class="mobile-chip" type="button" data-action="open-template-sheet">业务模板</button>
        <button class="mobile-chip" type="button" data-action="open-business-sheet">管理业务</button>
        ${editingOrder ? `<button class="mobile-chip is-danger" type="button" data-action="cancel-edit-order">取消编辑</button>` : ""}
      </div>
      <p class="mobile-form-caption">模板、管理业务和复制上单保留独立入口；二级 sheet 和网页端使用同一套本地存储 key。</p>
    </section>
    ${
      state.createFeedbackMessage
        ? `
          <section class="mobile-card">
            <div class="mobile-feedback-banner${state.createFeedbackTone === "error" ? " is-error" : " is-success"}">
              ${escapeHtml(state.createFeedbackMessage)}
            </div>
          </section>
        `
        : ""
    }
    ${
      state.createContextNote
        ? `
          <section class="mobile-card">
            <div class="mobile-sheet-banner">
              ${escapeHtml(state.createContextNote)}
            </div>
          </section>
        `
        : ""
    }
    <section class="mobile-card">
      <div class="mobile-create-hero">
        <div class="mobile-create-hero-main">
          <p class="mobile-create-kicker">${editingOrder ? "编辑稿件" : "项目名称"}</p>
          <h2 class="mobile-create-title">${escapeHtml(draft.projectName || "给稿件起个名字，例如：角色立绘")}</h2>
          <p class="mobile-create-subtitle">
            来源：<span style="color:${sourceColor}">${escapeHtml(sourceLabel)}</span>${editingOrder ? "，保存后会覆盖当前稿件。" : "，保存后会写入本地排期与统计。"}
          </p>
        </div>
        <span class="mobile-badge is-accent">${escapeHtml(draft.priority)}</span>
      </div>
    </section>
    <section class="mobile-group mobile-form-group">
      <h3>基础信息</h3>
      ${renderEditableInputRow("项目名", "projectName", draft.projectName, "角色立绘 · 精3", {
        hint: "给稿件起个名字，后续列表和条状排期都用它。",
      })}
      ${renderEditableInputRow("客户 / 老板 ID", "clientName", draft.clientName, "甲方 / 米画师 / lofter", {
        hint: "老板名保留单独输入，不会被模板强行覆盖。",
      })}
      ${renderReadonlyFormRow("业务分类", draft.businessType, "支持内置业务与自定义业务分类。")}
      <div class="mobile-form-block">
        <span class="mobile-form-label">常用业务</span>
        <div class="mobile-chip-row">
          ${renderChipItems(recentBusinessTypes, draft.businessType)}
        </div>
        <span class="mobile-form-hint">最近业务、自定义业务和模板业务会一起出现在这里。</span>
      </div>
      ${renderEditableSelectRow(
        "来源",
        "source",
        draft.source,
        SOURCE_OPTIONS.map((item) => ({ value: item.value, label: item.label })),
        "来源会联动默认手续费和部分金额口径。",
      )}
    </section>
    <section class="mobile-group mobile-form-group">
      <h3>价格与结算</h3>
      ${renderEditableNumberRow("总稿费", "amount", draft.amount, "0.00", {
        hint: "显式支持 0 金额，用于无偿稿、作业稿和练习单。",
        prefix: "¥",
      })}
      ${renderEditableNumberRow("已收金额", "receivedAmount", draft.receivedAmount, "0.00", {
        hint: "已收金额允许 0，和网页端保持一致。",
        prefix: "¥",
      })}
      ${renderEditableSelectRow(
        "收款状态",
        "paymentStatus",
        normalizePaymentStatus(draft),
        PAYMENT_STATUSES.map((value) => ({ value, label: value })),
      )}
      <div class="mobile-detail-card">
        <div class="mobile-row-between">
          <div>
            <span class="mobile-form-label">结算明细</span>
            <span class="mobile-form-hint">先放进本页，后续可拆成独立 sheet。</span>
          </div>
          <span class="mobile-badge">${feeSummary}</span>
        </div>
        ${renderEditableSelectRow(
          "手续费方式",
          "feeMode",
          draft.feeMode,
          FEE_MODES.map((item) => ({ value: item.value, label: item.label })),
        )}
        ${renderEditableNumberRow("来源默认抽成", "feeRate", draft.feeRate * 100, "0", {
          hint: `当前来源 ${escapeHtml(sourceLabel)} 默认按 ${feeSummary} 处理。`,
          suffix: "%",
          kind: "percent",
        })}
        ${renderEditableSelectRow(
          "紧急程度",
          "priority",
          draft.priority,
          PRIORITIES.map((value) => ({ value, label: value })),
        )}
        ${renderEditableSelectRow(
          "用途类型",
          "usageType",
          draft.usageType,
          USAGE_TYPES.map((value) => ({ value, label: value })),
        )}
        ${renderEditableNumberRow("用途加价", "usageRate", draft.usageRate * 100, "0", {
          suffix: "%",
          kind: "percent",
        })}
        ${renderEditableSelectRow(
          "币种",
          "currency",
          draft.currency,
          CURRENCY_OPTIONS.map((item) => ({ value: item.value, label: item.value })),
        )}
        ${
          draft.source === "米画师企划邀请"
            ? renderReadonlyFormRow("企划金额口径", "按画师到手", "企划邀请保留手 / 总价切换，和网页端一致。")
            : ""
        }
      </div>
    </section>
    <section class="mobile-group mobile-form-group">
      <h3>时间与排期</h3>
      ${renderEditableDateRow("动工日期", "startDate", draft.startDate || formatDateInput(new Date()))}
      ${renderEditableDateRow("截稿日期", "dueDate", draft.dueDate)}
      ${renderEditableDateRow("完成日期", "completedDate", draft.completedDate)}
      ${renderEditableNumberRow("预计工时", "workHours", draft.workHours, "0", {
        suffix: "小时",
        kind: "hours",
      })}
      <div class="mobile-form-block">
        <span class="mobile-form-label">排期条颜色</span>
        <div class="mobile-color-row">
          ${renderColorChoices(draft.calendarColor)}
        </div>
        <span class="mobile-form-hint">留空时自动跟随来源色；这里只做结构示意，后续接真实选择器。</span>
      </div>
    </section>
    <section class="mobile-group mobile-form-group">
      <h3>进度与异常</h3>
      ${renderEditableSelectRow("订单状态", "status", draft.status, STATUSES.map((value) => ({ value, label: value })))}
      <div class="mobile-form-block">
        <span class="mobile-form-label">制作阶段</span>
        <div class="mobile-stage-track">
          ${renderStageItems(stageOptions, draft.productionStage || BUILT_IN_PRODUCTION_STAGES[0])}
        </div>
      </div>
      ${renderEditableSelectRow(
        "异常类型",
        "exceptionType",
        draft.exceptionType,
        EXCEPTION_TYPES.map((value) => ({ value, label: value })),
      )}
      ${renderEditableTextareaBlock("备注", "notes", draft.notes, "画面要求、分辨率、文件格式、特殊说明……")}
    </section>
    <section class="mobile-card mobile-create-footer">
      <div class="mobile-row-between">
        <div>
          <p class="mobile-create-kicker">保存后结果预览</p>
          <strong class="mobile-create-net">${formatCompactAmount(calculateAdjustedNetAmountCny(draft, state.fxSettings))}</strong>
          <p class="mobile-form-hint">按当前结算规则估算实得，保存后会写入本地排期和统计。</p>
        </div>
        <button class="mobile-pill-button mobile-pill-button-accent" type="button" data-action="save-create-order">${editingOrder ? "保存修改" : "保存稿件"}</button>
      </div>
    </section>
  `;
}

function renderStatsTab() {
  const monthOrders = state.orders.filter((order) => isSameMonth(order.completedDate || order.dueDate, state.month));
  const settledIncome = monthOrders.reduce((total, order) => total + calculateAdjustedNetAmountCny(order, state.fxSettings), 0);
  const received = monthOrders.reduce((total, order) => total + calculateEffectiveReceivedCny(order, state.fxSettings), 0);
  const pending = monthOrders.reduce((total, order) => {
    const gross = calculateAdjustedNetAmountCny(order, state.fxSettings);
    const receivedAmount = calculateEffectiveReceivedCny(order, state.fxSettings);
    return total + Math.max(gross - receivedAmount, 0);
  }, 0);
  const monthlyTrend = buildStatsMonthlyTrend(state.orders, state.month);
  const sourceBreakdown = buildStatsSourceBreakdown(monthOrders);
  const stageBreakdown = buildStatsStageBreakdown(monthOrders);
  const clientBreakdown = buildStatsClientBreakdown(state.orders);
  const vipThreshold = state.clientInsightSettings.vipThreshold;
  const vipCount = clientBreakdown.filter((item) => item.totalAmount >= vipThreshold).length;
  const bestMonth = monthlyTrend.reduce((best, item) => (item.settled > best.settled ? item : best), monthlyTrend[0]);
  const currentMonthIndex = monthlyTrend.length - 1;
  const previousMonth = monthlyTrend[currentMonthIndex - 1] || null;
  const currentMonth = monthlyTrend[currentMonthIndex] || null;
  const delta = currentMonth && previousMonth ? currentMonth.settled - previousMonth.settled : 0;

  return `
    <section class="mobile-card">
      <div class="mobile-metric-grid">
        <article class="mobile-metric-card">
          <h3>本月稿件数</h3>
          <strong>${monthOrders.length}</strong>
        </article>
        <article class="mobile-metric-card">
          <h3>本月结算收入</h3>
          <strong>${formatCompactAmount(settledIncome)}</strong>
        </article>
        <article class="mobile-metric-card">
          <h3>已收净额</h3>
          <strong>${formatCompactAmount(received)}</strong>
        </article>
        <article class="mobile-metric-card">
          <h3>待收金额</h3>
          <strong>${formatCompactAmount(pending)}</strong>
        </article>
      </div>
    </section>
    <section class="mobile-card">
      <div class="mobile-row-between">
        <h2 class="mobile-section-title">收入趋势</h2>
        <span class="mobile-muted">近 6 个月</span>
      </div>
      ${renderStatsTrendChart(monthlyTrend)}
      <div class="mobile-stats-caption-row">
        <span class="mobile-form-hint">按完成月归属统计；没有完成日期时回退到截稿月。</span>
        <span class="mobile-form-hint">
          ${
            previousMonth && currentMonth
              ? delta >= 0
                ? `较上月 +${formatCompactAmount(delta)}`
                : `较上月 ${formatCompactAmount(delta)}`
              : `最高月：${escapeHtml(bestMonth.label)}`
          }
        </span>
      </div>
    </section>
    <section class="mobile-card">
      <div class="mobile-stat-grid">
        <article class="mobile-stat-card">
          <div class="mobile-row-between">
            <h3>来源分布</h3>
            <span class="mobile-muted">按结算收入</span>
          </div>
          <div class="mobile-stat-list">
            ${
              sourceBreakdown.length
                ? sourceBreakdown.map(renderStatsBreakdownRow).join("")
                : `<div class="mobile-empty">本月还没有可统计的来源收入。</div>`
            }
          </div>
        </article>
        <article class="mobile-stat-card">
          <div class="mobile-row-between">
            <h3>阶段分布</h3>
            <span class="mobile-muted">按稿件数量</span>
          </div>
          <div class="mobile-stat-list">
            ${
              stageBreakdown.length
                ? stageBreakdown.map(renderStatsBreakdownRow).join("")
                : `<div class="mobile-empty">本月还没有可统计的阶段数据。</div>`
            }
          </div>
        </article>
      </div>
    </section>
    <section class="mobile-card">
      <div class="mobile-row-between">
        <h2 class="mobile-section-title">客户累计</h2>
        <span class="mobile-muted">重点阈值 ${formatCompactAmount(vipThreshold)}</span>
      </div>
      <p class="mobile-form-hint">共 ${clientBreakdown.length} 位客户，达到重点客户阈值 ${vipCount} 位。这里按累计结算收入排行。</p>
      <div class="mobile-client-list">
        ${
          clientBreakdown.length
            ? clientBreakdown.map(renderStatsClientRow).join("")
            : `<div class="mobile-empty">当前还没有客户累计数据，先录几单就会看到排行。</div>`
        }
      </div>
    </section>
  `;
}

function buildStatsMonthlyTrend(orders, monthDate, months = 6) {
  const series = [];
  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const bucketDate = new Date(monthDate.getFullYear(), monthDate.getMonth() - offset, 1);
    const bucketOrders = orders.filter((order) => isSameMonth(order.completedDate || order.dueDate, bucketDate));
    const settled = bucketOrders.reduce(
      (total, order) => total + calculateAdjustedNetAmountCny(order, state.fxSettings),
      0,
    );
    const received = bucketOrders.reduce(
      (total, order) => total + calculateEffectiveReceivedCny(order, state.fxSettings),
      0,
    );
    series.push({
      label: `${bucketDate.getMonth() + 1}月`,
      settled,
      received,
      count: bucketOrders.length,
    });
  }
  return series;
}

function renderStatsTrendChart(series) {
  const values = series.map((item) => item.settled);
  const maxValue = Math.max(...values, 0);
  const width = 320;
  const height = 180;
  const leftPad = 10;
  const rightPad = 10;
  const topPad = 16;
  const bottomPad = 34;
  const chartWidth = width - leftPad - rightPad;
  const chartHeight = height - topPad - bottomPad;
  const safeMax = maxValue > 0 ? maxValue : 1;
  const stepX = series.length > 1 ? chartWidth / (series.length - 1) : chartWidth;
  const points = series.map((item, index) => {
    const x = leftPad + index * stepX;
    const y = topPad + chartHeight - (item.settled / safeMax) * chartHeight;
    return { ...item, x, y };
  });
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points.at(-1)?.x ?? leftPad} ${topPad + chartHeight} L ${leftPad} ${topPad + chartHeight} Z`;

  return `
    <div class="mobile-trend-chart">
      <svg viewBox="0 0 ${width} ${height}" class="mobile-trend-svg" aria-hidden="true">
        <defs>
          <linearGradient id="mobileTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(236, 122, 69, 0.28)" />
            <stop offset="100%" stop-color="rgba(236, 122, 69, 0)" />
          </linearGradient>
        </defs>
        ${[0.25, 0.5, 0.75, 1]
          .map((ratio) => {
            const y = topPad + chartHeight - chartHeight * ratio;
            return `<line x1="${leftPad}" y1="${y}" x2="${width - rightPad}" y2="${y}" class="mobile-trend-grid-line" />`;
          })
          .join("")}
        <path d="${areaPath}" class="mobile-trend-area" />
        <path d="${linePath}" class="mobile-trend-line" />
        ${points
          .map(
            (point) => `
              <circle cx="${point.x}" cy="${point.y}" r="4" class="mobile-trend-dot" />
            `,
          )
          .join("")}
        ${points
          .map(
            (point) => `
              <text x="${point.x}" y="${height - 10}" text-anchor="middle" class="mobile-trend-label">${escapeHtml(point.label)}</text>
            `,
          )
          .join("")}
      </svg>
      <div class="mobile-trend-summary">
        ${points
          .map(
            (point) => `
              <div class="mobile-trend-summary-item">
                <span>${escapeHtml(point.label)}</span>
                <strong>${formatCompactAmount(point.settled)}</strong>
              </div>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function buildStatsSourceBreakdown(orders) {
  const totals = new Map();
  orders.forEach((order) => {
    const key = getSourceLabel(order.source);
    const current = totals.get(key) || 0;
    totals.set(key, current + calculateAdjustedNetAmountCny(order, state.fxSettings));
  });

  const maxValue = Math.max(...totals.values(), 0);
  return [...totals.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([label, value]) => ({
      label,
      value,
      meta: formatCompactAmount(value),
      ratio: maxValue > 0 ? value / maxValue : 0,
    }));
}

function buildStatsStageBreakdown(orders) {
  const totals = new Map();
  orders.forEach((order) => {
    const key = String(order.productionStage || order.status || "未设置").trim() || "未设置";
    totals.set(key, (totals.get(key) || 0) + 1);
  });

  const maxValue = Math.max(...totals.values(), 0);
  return [...totals.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([label, value]) => ({
      label,
      value,
      meta: `${value} 项`,
      ratio: maxValue > 0 ? value / maxValue : 0,
    }));
}

function buildStatsClientBreakdown(orders) {
  const grouped = new Map();
  orders.forEach((order) => {
    const clientName = String(order.clientName || "").trim();
    if (!clientName) return;
    const current = grouped.get(clientName) || {
      clientName,
      orderCount: 0,
      totalAmount: 0,
      lastOrderDate: "",
    };
    current.orderCount += 1;
    current.totalAmount += calculateAdjustedNetAmountCny(order, state.fxSettings);
    const latestDate = String(order.completedDate || order.dueDate || order.startDate || "");
    if (latestDate && (!current.lastOrderDate || latestDate > current.lastOrderDate)) {
      current.lastOrderDate = latestDate;
    }
    grouped.set(clientName, current);
  });

  return [...grouped.values()]
    .sort(
      (left, right) =>
        right.totalAmount - left.totalAmount ||
        right.orderCount - left.orderCount ||
        left.clientName.localeCompare(right.clientName, "zh-CN"),
    )
    .slice(0, 8);
}

function renderStatsBreakdownRow(item) {
  return `
    <div class="mobile-stat-breakdown-row">
      <div class="mobile-row-between">
        <span class="mobile-stat-breakdown-label">${escapeHtml(item.label)}</span>
        <strong class="mobile-stat-breakdown-value">${escapeHtml(item.meta)}</strong>
      </div>
      <div class="mobile-stat-breakdown-track">
        <span class="mobile-stat-breakdown-fill" style="width:${Math.max(8, Math.round(item.ratio * 100))}%;"></span>
      </div>
    </div>
  `;
}

function renderStatsClientRow(item) {
  const isVip = item.totalAmount >= state.clientInsightSettings.vipThreshold;
  return `
    <article class="mobile-client-card">
      <div>
        <strong class="mobile-client-title">${escapeHtml(item.clientName)}</strong>
        <div class="mobile-client-meta">最近一单 ${escapeHtml(item.lastOrderDate || "-")} · ${item.orderCount} 单</div>
      </div>
      <div class="mobile-client-side">
        <strong class="mobile-client-amount">${formatCompactAmount(item.totalAmount)}</strong>
        <span class="mobile-badge${isVip ? " is-accent" : ""}">${isVip ? "重点客户" : "累计中"}</span>
      </div>
    </article>
  `;
}

function renderSettingsTab() {
  const cloudAvailable = hasCloudConfig(APP_RUNTIME);
  const cloudModeLabel = state.mode === "cloud" ? "账号同步" : "本地使用";
  const cloudStatusLabel = isCloudSyncActive()
    ? state.usingLocalBackup
      ? "本地记录待推送"
      : "云端同步中"
    : state.mode === "cloud"
      ? "等待登录"
      : "仅本地保存";
  const signupCooldown = getAuthCooldownRemaining("signup", state.authEmail);
  const resendCooldown = getAuthCooldownRemaining("resendSignup", state.authEmail);
  const forgotPasswordCooldown = getAuthCooldownRemaining("forgotPassword", state.authEmail);
  const emailActionDisabled = state.busy || !hasTurnstileConfig();
  const supportLink = APP_RUNTIME.supportUrl
    ? `<a class="mobile-settings-value" href="${APP_RUNTIME.supportUrl}" target="_blank" rel="noreferrer">打开</a>`
    : `<span class="mobile-settings-value">未配置</span>`;
  const authPanel = !cloudAvailable
    ? `
        <div class="mobile-settings-inline-note">
          当前还没配置 Supabase 环境变量，所以移动端只能先跑本地模式。
        </div>
      `
    : state.recoveryMode
      ? `
          <div class="mobile-settings-auth-grid">
            <label class="mobile-settings-field">
              <span class="mobile-form-label">新密码</span>
              <input
                class="mobile-form-input"
                type="password"
                autocomplete="new-password"
                placeholder="至少 6 位"
                data-auth-reset-password
                value="${escapeAttribute(state.authResetPassword)}"
                ${state.busy ? "disabled" : ""}
              />
            </label>
            <label class="mobile-settings-field">
              <span class="mobile-form-label">确认新密码</span>
              <input
                class="mobile-form-input"
                type="password"
                autocomplete="new-password"
                placeholder="再输入一次"
                data-auth-reset-password-confirm
                value="${escapeAttribute(state.authResetPasswordConfirm)}"
                ${state.busy ? "disabled" : ""}
              />
            </label>
          </div>
          <div class="mobile-settings-actions">
            <button class="mobile-settings-action-button" type="button" data-action="update-password"${state.busy ? " disabled" : ""}>
              ${state.busy ? "更新中…" : "更新密码"}
            </button>
          </div>
          <p class="mobile-settings-note">已打开重置密码流程。更新成功后会自动回到当前账号状态。</p>
        `
    : hasSignedInUser()
      ? `
          <div class="mobile-settings-list">
            <div class="mobile-settings-row">
              <span class="mobile-settings-label">当前账号</span>
              <span class="mobile-settings-value">${escapeHtml(state.user.email || "已登录")}</span>
            </div>
            <div class="mobile-settings-row">
              <span class="mobile-settings-label">同步状态</span>
              <span class="mobile-settings-value">${cloudStatusLabel}</span>
            </div>
          </div>
          <div class="mobile-settings-actions">
            <button class="mobile-settings-action-button" type="button" data-action="cloud-sync-now"${state.busy ? " disabled" : ""}>
              ${state.usingLocalBackup ? "上传当前本地记录" : "重新拉取云端"}
            </button>
            <button class="mobile-settings-action-button" type="button" data-action="sign-out"${state.busy ? " disabled" : ""}>
              退出登录
            </button>
            <button class="mobile-settings-action-button mobile-danger-button" type="button" data-action="delete-account"${state.busy ? " disabled" : ""}>
              删除账号
            </button>
          </div>
        `
      : `
          <div class="mobile-settings-auth-grid">
            <label class="mobile-settings-field">
              <span class="mobile-form-label">邮箱</span>
              <input
                class="mobile-form-input"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                data-auth-email
                value="${escapeAttribute(state.authEmail)}"
                ${state.busy ? "disabled" : ""}
              />
            </label>
            <label class="mobile-settings-field">
              <span class="mobile-form-label">密码</span>
              <input
                class="mobile-form-input"
                type="password"
                autocomplete="current-password"
                placeholder="至少 6 位"
                data-auth-password
                value="${escapeAttribute(state.authPassword)}"
                ${state.busy ? "disabled" : ""}
              />
            </label>
          </div>
          <div class="mobile-settings-actions">
            <button class="mobile-settings-action-button" type="button" data-action="sign-in"${state.busy ? " disabled" : ""}>
              ${state.busy ? "登录中…" : "登录账号"}
            </button>
            <button class="mobile-settings-action-button" type="button" data-action="sign-up"${emailActionDisabled || signupCooldown > 0 ? " disabled" : ""}>
              ${getAuthActionLabel("signup", signupCooldown)}
            </button>
            <button class="mobile-settings-action-button" type="button" data-action="resend-signup"${emailActionDisabled || resendCooldown > 0 ? " disabled" : ""}>
              ${getAuthActionLabel("resendSignup", resendCooldown)}
            </button>
            <button class="mobile-settings-action-button" type="button" data-action="forgot-password"${emailActionDisabled || forgotPasswordCooldown > 0 ? " disabled" : ""}>
              ${getAuthActionLabel("forgotPassword", forgotPasswordCooldown)}
            </button>
          </div>
          ${renderMobileTurnstilePanel()}
          <p class="mobile-settings-note">${
            hasTurnstileConfig()
              ? "移动端现在支持登录、注册、重发验证邮件和忘记密码；邮箱验证链接与重置密码链接会回到当前页面。"
              : "当前项目没有开启人机验证，所以移动端暂时只支持登录；注册、重发验证邮件和忘记密码仍请走网页端。"
          }</p>
        `;

  return `
    <section class="mobile-group">
      <h2 class="mobile-section-title">数据模式</h2>
      <div class="mobile-segmented mobile-settings-segmented">
        <button type="button" data-action="mode-local" class="${state.mode === "local" ? "is-active" : ""}"${state.busy || state.recoveryMode ? " disabled" : ""}>本地使用</button>
        <button type="button" data-action="mode-cloud" class="${state.mode === "cloud" ? "is-active" : ""}"${!cloudAvailable || state.busy || state.recoveryMode ? " disabled" : ""}>账号同步</button>
      </div>
      <div class="mobile-settings-list mobile-settings-list-tight">
        <div class="mobile-settings-row">
          <span class="mobile-settings-label">当前模式</span>
          <span class="mobile-settings-value">${cloudModeLabel}</span>
        </div>
        <div class="mobile-settings-row">
          <span class="mobile-settings-label">运行目标</span>
          <span class="mobile-settings-value">${APP_RUNTIME.target}</span>
        </div>
        <div class="mobile-settings-row">
          <span class="mobile-settings-label">当前状态</span>
          <span class="mobile-settings-value">${cloudStatusLabel}</span>
        </div>
      </div>
      <p class="mobile-settings-note">本地模式直接写当前设备；账号同步会在登录后沿用和网页端一致的 Supabase 数据表。</p>
    </section>
    <section class="mobile-group">
      <h2 class="mobile-section-title">账号</h2>
      ${authPanel}
    </section>
    <section class="mobile-group">
      <h2 class="mobile-section-title">数据</h2>
      <div class="mobile-settings-list">
        <div class="mobile-settings-row">
          <span class="mobile-settings-label">本地稿件数</span>
          <span class="mobile-settings-value">${state.orders.length}</span>
        </div>
        <div class="mobile-settings-row">
          <span class="mobile-settings-label">业务模板</span>
          <span class="mobile-settings-value">${getBusinessTemplateList().length} 个</span>
        </div>
        <div class="mobile-settings-row">
          <span class="mobile-settings-label">自定义业务</span>
          <span class="mobile-settings-value">${state.customBusinessTypes.length} 个</span>
        </div>
      </div>
      ${
        state.settingsFeedbackMessage
          ? `
            <div class="mobile-settings-feedback mobile-feedback-banner${state.settingsFeedbackTone === "error" ? " is-error" : " is-success"}">
              ${escapeHtml(state.settingsFeedbackMessage)}
            </div>
          `
          : ""
      }
      <div class="mobile-settings-actions">
        <button class="mobile-settings-action-button" type="button" data-action="export-json">导出 JSON</button>
        <button class="mobile-settings-action-button" type="button" data-action="trigger-import-json">导入 JSON</button>
        <button class="mobile-settings-action-button" type="button" data-action="export-csv">导出 CSV</button>
      </div>
      <p class="mobile-settings-note">先复用网页端 JSON / CSV 口径，后续再接 iOS 原生分享与 Files。</p>
    </section>
    <section class="mobile-group">
      <h2 class="mobile-section-title">客户洞察</h2>
      <div class="mobile-settings-list">
        <div class="mobile-settings-row">
          <span class="mobile-settings-label">VIP 客户阈值 (¥)</span>
          <input
            class="mobile-form-input mobile-settings-input-narrow"
            type="number"
            min="0"
            step="100"
            placeholder="${DEFAULT_VIP_THRESHOLD}"
            value="${state.clientInsightSettings.vipThreshold}"
            data-vip-threshold-input
            ${state.clientInsightBusy ? "disabled" : ""}
          />
        </div>
      </div>
      <p class="mobile-settings-note">累计金额达到此阈值的客户将在统计页标记为 VIP。</p>
    </section>
    <section class="mobile-group">
      <h2 class="mobile-section-title">支持</h2>
      <div class="mobile-settings-list">
        <div class="mobile-settings-row">
          <span class="mobile-settings-label">支持页面</span>
          ${supportLink}
        </div>
        <div class="mobile-settings-row">
          <span class="mobile-settings-label">当前数据口径</span>
          <span class="mobile-settings-value">与网页端一致</span>
        </div>
      </div>
    </section>
  `;
}

function renderTabbar() {
  return `
    <nav class="mobile-tabbar" aria-label="Mobile tabs">
      ${MOBILE_TABS.map(
        (tab) => `
          <div class="mobile-tab${tab.id === "create" ? " mobile-tab-center" : ""}">
            <button type="button" data-tab="${tab.id}" class="${tab.id === state.tab ? "is-active" : ""}"${tab.id === "create" ? ' aria-label="新建"' : ""}>
              <span class="mobile-tab-icon">${TAB_ICONS[tab.id] || "•"}</span>
              <span class="mobile-tab-label">${tab.label}</span>
            </button>
          </div>
        `,
      ).join("")}
    </nav>
  `;
}

function renderSheetOverlay() {
  if (state.activeSheet === SHEET_TEMPLATE) {
    return renderTemplateSheet();
  }
  if (state.activeSheet === SHEET_BUSINESS) {
    return renderBusinessSheet();
  }
  if (state.activeSheet === SHEET_EXCEPTION) {
    return renderExceptionSheet();
  }
  if (state.activeSheet === SHEET_WORK_HOURS) {
    return renderWorkHoursSheet();
  }
  return "";
}

function renderExceptionSheet() {
  const order = state.orders.find((item) => item.id === state.exceptionEditorOrderId);
  if (!order || !isAbnormal(order)) {
    closeExceptionEditor();
    return "";
  }

  const handled = state.exceptionEditorHandled;
  const resolution = state.exceptionEditorResolution || EXCEPTION_RESOLUTIONS[0] || "";
  const showRefund = handled && (resolution === "协商退全款" || resolution === "协商退部分款");
  const refundValue =
    resolution === "协商退全款" ? String(normalizeMoneyValue(order.receivedAmount)) : String(state.exceptionEditorRefundAmount || "");
  const refundHint =
    resolution === "协商退全款"
      ? "退全款会自动按当前已收金额填写。"
      : resolution === "协商退部分款"
        ? `退款金额需大于 0，且不能超过当前已收 ${formatCompactAmount(convertMoneyToCny(order.receivedAmount, order, state.fxSettings))}。`
        : "";

  return `
    <div class="mobile-sheet-shell">
      <button class="mobile-sheet-backdrop" type="button" data-action="close-sheet" aria-label="关闭弹层"></button>
      <section class="mobile-sheet-panel mobile-sheet-card">
        <div class="mobile-sheet-handle"></div>
        <div class="mobile-sheet-header">
          <button class="mobile-sheet-icon" type="button" data-action="close-sheet" aria-label="关闭">×</button>
          <strong>处理异常</strong>
          <span></span>
        </div>
        <div class="mobile-sheet-scroll">
          <section class="mobile-sheet-section">
            <div class="mobile-sheet-preview">
              <strong>${escapeHtml(order.projectName || "未命名稿件")}</strong>
              <span>${escapeHtml(order.clientName || "未填写客户")} · ${escapeHtml(order.businessType || "未分类")} · ${formatCompactAmount(
                calculateAdjustedNetAmountCny(order, state.fxSettings),
              )}</span>
              <div class="mobile-chip-row mobile-exception-chip-row">
                <span class="mobile-badge is-warning">${escapeHtml(order.exceptionType)}</span>
                <span class="mobile-badge">${escapeHtml(order.status || "进行中")}</span>
                <span class="mobile-badge is-green">已收 ${formatCompactAmount(convertMoneyToCny(order.receivedAmount, order, state.fxSettings))}</span>
              </div>
            </div>
          </section>
          <section class="mobile-sheet-section">
            <div class="mobile-sheet-section-head">
              <span>处理状态</span>
              <span>${handled ? "保存后会记为已处理" : "保存后仍保留为异常单"}</span>
            </div>
            <div class="mobile-chip-row">
              <button type="button" class="mobile-chip${handled ? "" : " is-active"}" data-exception-handled="no">暂未解决</button>
              <button type="button" class="mobile-chip${handled ? " is-active" : ""}" data-exception-handled="yes">已处理</button>
            </div>
          </section>
          <section class="mobile-sheet-section">
            <label class="mobile-sheet-input-block">
              <span>处理结果</span>
              <span class="mobile-form-select-wrap">
                <select class="mobile-form-select" data-exception-resolution${handled ? "" : " disabled"}>
                  ${EXCEPTION_RESOLUTIONS.map(
                    (value) =>
                      `<option value="${escapeAttribute(value)}"${value === resolution ? " selected" : ""}>${escapeHtml(value)}</option>`,
                  ).join("")}
                </select>
              </span>
            </label>
            ${
              showRefund
                ? `
                  <label class="mobile-sheet-input-block">
                    <span>退款金额</span>
                    <input class="mobile-sheet-input" type="number" inputmode="decimal" step="0.01" value="${escapeAttribute(
                      refundValue,
                    )}" data-exception-refund${resolution === "协商退全款" ? " disabled" : ""} />
                    <span class="mobile-form-hint">${escapeHtml(refundHint)}</span>
                  </label>
                `
                : ""
            }
            <label class="mobile-sheet-input-block">
              <span>异常备注</span>
              <textarea class="mobile-sheet-input mobile-sheet-textarea" rows="4" maxlength="200" placeholder="补充协商过程、延期约定、退款说明……" data-exception-note>${escapeHtml(
                state.exceptionEditorNote || "",
              )}</textarea>
            </label>
            ${
              state.exceptionEditorMessage
                ? `
                  <div class="mobile-feedback-banner is-error mobile-orders-feedback">
                    ${escapeHtml(state.exceptionEditorMessage)}
                  </div>
                `
                : ""
            }
          </section>
          <section class="mobile-sheet-section">
            <div class="mobile-sheet-inline-actions">
              <button type="button" class="mobile-sheet-secondary" data-action="close-sheet">取消</button>
              <button type="button" class="mobile-sheet-primary" data-action="save-exception-editor">保存处理</button>
            </div>
          </section>
        </div>
      </section>
    </div>
  `;
}

function renderWorkHoursSheet() {
  const order = state.orders.find((item) => item.id === state.workHoursEditorOrderId);
  if (!order) {
    state.activeSheet = "";
    return "";
  }
  const currentHours = sanitizeWorkHours(order.workHours);
  const hourlyRate = calculateHourlyRate(order, state.fxSettings);
  const hourlyRateLabel = hourlyRate > 0 ? `参考时薪 ${formatHourlyRate(hourlyRate)}/小时` : "";
  const isCompleted = Boolean(order.completedDate) || isClosed(order);
  const label = isCompleted ? "实际工时" : "预计工时";

  return `
    <div class="mobile-sheet-shell">
      <button class="mobile-sheet-backdrop" type="button" data-action="close-sheet" aria-label="关闭弹层"></button>
      <section class="mobile-sheet-panel mobile-sheet-card">
        <div class="mobile-sheet-handle"></div>
        <div class="mobile-sheet-header">
          <button class="mobile-sheet-icon" type="button" data-action="close-sheet" aria-label="关闭">×</button>
          <strong>${label}</strong>
          <button class="mobile-sheet-link" type="button" data-action="save-work-hours">保存</button>
        </div>
        <div class="mobile-sheet-scroll">
          <div class="mobile-sheet-section">
            <div class="mobile-sheet-section-head">
              <span>${escapeHtml(order.projectName || "未命名稿件")}</span>
              <span>${escapeHtml(order.clientName || "")}</span>
            </div>
            <label class="mobile-sheet-input-block">
              <span>${label}（小时）</span>
              <input class="mobile-sheet-input" type="number" min="0" step="0.01" placeholder="比如 0.5（30分钟）" value="${escapeAttribute(state.workHoursEditorValue)}" data-work-hours-input />
            </label>
            ${hourlyRateLabel ? `<p class="mobile-form-hint">${hourlyRateLabel}</p>` : ""}
            <div class="mobile-sheet-inline-actions">
              <button type="button" class="mobile-sheet-secondary" data-action="clear-work-hours">清空</button>
              <button type="button" class="mobile-sheet-primary" data-action="save-work-hours">保存</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderTemplateSheet() {
  const templates = getBusinessTemplateList();
  const repeatSource = getRepeatSource();
  return `
    <div class="mobile-sheet-shell">
      <button class="mobile-sheet-backdrop" type="button" data-action="close-sheet" aria-label="关闭弹层"></button>
      <section class="mobile-sheet-panel mobile-sheet-card">
        <div class="mobile-sheet-handle"></div>
        <div class="mobile-sheet-header">
          <button class="mobile-sheet-icon" type="button" data-action="close-sheet" aria-label="关闭">×</button>
          <strong>业务模板</strong>
          <span></span>
        </div>
        <div class="mobile-sheet-segmented">
          <button type="button" data-action="template-tab-apply" class="${state.templateSheetMode === "apply" ? "is-active" : ""}">套用模板</button>
          <button type="button" data-action="template-tab-save" class="${state.templateSheetMode === "save" ? "is-active" : ""}">保存模板</button>
        </div>
        <div class="mobile-sheet-scroll">
          ${
            state.templateSheetMode === "apply"
              ? renderTemplateApplyPane(templates, repeatSource)
              : renderTemplateSavePane()
          }
        </div>
      </section>
    </div>
  `;
}

function renderTemplateApplyPane(templates, repeatSource) {
  return `
    <div class="mobile-sheet-section">
      <button class="mobile-sheet-action-card${repeatSource ? "" : " is-disabled"}" type="button" data-action="repeat-last"${repeatSource ? "" : " disabled"}>
        <div class="mobile-sheet-action-copy">
          <div>
            <div class="mobile-sheet-card-title">重复上一单</div>
            <div class="mobile-sheet-card-subtitle">复用上一单的业务、来源和计价配置，客户与日期重新填写。</div>
          </div>
          <span class="mobile-sheet-badge">快捷</span>
        </div>
        ${
          repeatSource
            ? `
              <div class="mobile-sheet-preview">
                <strong>${escapeHtml(repeatSource.projectName || repeatSource.businessType || "最近一单")}</strong>
                <span>${escapeHtml(repeatSource.businessType || "未分类")} · ${escapeHtml(getSourceLabel(repeatSource.source))} · ${formatMoneyValue(repeatSource.amount)}</span>
              </div>
            `
            : `<div class="mobile-sheet-empty">还没有可重复的上一单，先在网页端或移动端保存一条稿件。</div>`
        }
      </button>
    </div>
    <div class="mobile-sheet-section">
      <div class="mobile-sheet-section-head">
        <span>已保存模板</span>
        <span>${templates.length} 个</span>
      </div>
      ${
        templates.length
          ? `<div class="mobile-sheet-list">${templates.map(renderTemplateCard).join("")}</div>`
          : `<div class="mobile-sheet-empty">还没有模板。你可以切到“保存模板”把当前表单保存为常用模板。</div>`
      }
    </div>
  `;
}

function renderTemplateCard(template) {
  const key = escapeAttribute(template.businessType);
  const isExpanded = state.expandedTemplateKey === template.businessType;
  const isConfirmingDelete = state.confirmDeleteTemplateKey === template.businessType;
  return `
    <article class="mobile-sheet-list-card">
      <button class="mobile-sheet-row mobile-sheet-row-button" type="button" data-template-expand="${key}">
        <div class="mobile-sheet-row-main">
          <strong>${escapeHtml(getTemplateDisplayName(template))}</strong>
          <span>${escapeHtml(template.businessType)} · ${escapeHtml(getSourceLabel(template.source))} · ${formatMoneyValue(template.amount)}</span>
        </div>
        <span class="mobile-sheet-expand">${isExpanded ? "▾" : "▸"}</span>
      </button>
      ${
        isExpanded
          ? `
            <div class="mobile-sheet-template-detail">
              <div class="mobile-sheet-meta-grid">
                <div><span>手续费</span><strong>${escapeHtml(getFeeModeLabel(template.feeMode))}</strong></div>
                <div><span>抽成</span><strong>${formatRatePercent(template.feeRate)}</strong></div>
                <div><span>用途</span><strong>${escapeHtml(template.usageType)}</strong></div>
                <div><span>工时</span><strong>${template.workHours ? `${template.workHours}h` : "—"}</strong></div>
                <div><span>阶段</span><strong>${escapeHtml(template.productionStage || "未设")}</strong></div>
                <div><span>币种</span><strong>${escapeHtml(template.currency)}</strong></div>
              </div>
              <div class="mobile-sheet-note">
                套用后会复用业务、来源、金额和排期配置；项目名、客户、日期与已收金额会重新填写。
              </div>
              <div class="mobile-sheet-inline-actions">
                ${
                  isConfirmingDelete
                    ? `
                      <button type="button" class="mobile-sheet-secondary" data-action="cancel-template-delete">取消</button>
                      <button type="button" class="mobile-sheet-danger-button" data-template-delete="${key}">确认删除</button>
                    `
                    : `
                      <button type="button" class="mobile-sheet-secondary" data-template-confirm-delete="${key}">删除模板</button>
                      <button type="button" class="mobile-sheet-primary" data-template-apply="${key}">套用模板</button>
                    `
                }
              </div>
            </div>
          `
          : ""
      }
    </article>
  `;
}

function renderTemplateSavePane() {
  const templateName = state.templateDraftName || buildDefaultTemplateName();
  const draft = state.createDraft;
  return `
    <div class="mobile-sheet-section">
      <div class="mobile-sheet-section-head">
        <span>保存当前为模板</span>
        <span>按业务类型覆盖</span>
      </div>
      <div class="mobile-sheet-list-card">
        <label class="mobile-sheet-input-block">
          <span>模板显示名</span>
          <input class="mobile-sheet-input" type="text" value="${escapeAttribute(templateName)}" data-template-name placeholder="例如：米画师立绘标准单" />
        </label>
        <div class="mobile-sheet-meta-grid">
          <div><span>业务分类</span><strong>${escapeHtml(draft.businessType)}</strong></div>
          <div><span>来源</span><strong>${escapeHtml(getSourceLabel(draft.source))}</strong></div>
          <div><span>总稿费</span><strong>${formatMoneyValue(draft.amount)}</strong></div>
          <div><span>手续费</span><strong>${escapeHtml(getFeeModeLabel(draft.feeMode))}</strong></div>
        </div>
        <div class="mobile-sheet-note">
          保存后会复用来源、金额、手续费、用途、阶段、工时和排期颜色。客户与日期不会写进模板。
        </div>
        <div class="mobile-sheet-inline-actions">
          <button type="button" class="mobile-sheet-primary" data-action="save-current-template">保存模板</button>
        </div>
      </div>
    </div>
  `;
}

function renderBusinessSheet() {
  const builtInRows = BUILT_IN_BUSINESS_TYPES.map((value) => renderBusinessRow(value, true)).join("");
  const customRows = state.customBusinessTypes.length
    ? state.customBusinessTypes.map((value) => renderBusinessRow(value, false)).join("")
    : `<div class="mobile-sheet-empty">还没有自定义业务，新增后会出现在“常用业务”和模板列表里。</div>`;

  return `
    <div class="mobile-sheet-shell">
      <button class="mobile-sheet-backdrop" type="button" data-action="close-sheet" aria-label="关闭弹层"></button>
      <section class="mobile-sheet-panel mobile-sheet-card">
        <div class="mobile-sheet-handle"></div>
        <div class="mobile-sheet-header">
          <button class="mobile-sheet-icon" type="button" data-action="close-sheet" aria-label="关闭">×</button>
          <strong>管理业务</strong>
          <button class="mobile-sheet-link" type="button" data-action="toggle-business-edit">${state.businessEditMode ? "完成" : "编辑"}</button>
        </div>
        <div class="mobile-sheet-scroll">
          <div class="mobile-sheet-banner">
            使用次数较多的业务会自动出现在新建页面的「常用业务」快捷区，方便下次快速选取。
          </div>
          <div class="mobile-sheet-section">
            <div class="mobile-sheet-section-head">
              <span>内置业务</span>
              <span>不可删除</span>
            </div>
            <div class="mobile-sheet-list">${builtInRows}</div>
          </div>
          <div class="mobile-sheet-section">
            <div class="mobile-sheet-section-head">
              <span>自定义业务</span>
              <span>${state.customBusinessTypes.length} 个</span>
            </div>
            <div class="mobile-sheet-list">${customRows}</div>
          </div>
          ${
            state.businessAddOpen
              ? `
                <div class="mobile-sheet-section">
                  <div class="mobile-sheet-list-card">
                    <label class="mobile-sheet-input-block">
                      <span>新增自定义业务</span>
                      <input class="mobile-sheet-input" type="text" value="${escapeAttribute(state.businessDraftName)}" data-business-name-input placeholder="例如：Live2D、三视图设定" />
                    </label>
                    <div class="mobile-sheet-inline-actions">
                      <button type="button" class="mobile-sheet-secondary" data-action="cancel-business-add">取消</button>
                      <button type="button" class="mobile-sheet-primary" data-action="save-business-add">添加</button>
                    </div>
                  </div>
                </div>
              `
              : `
                <div class="mobile-sheet-section">
                  <button class="mobile-sheet-add" type="button" data-action="open-business-add">添加自定义业务</button>
                </div>
              `
          }
        </div>
      </section>
    </div>
  `;
}

function renderBusinessRow(value, builtIn) {
  const usageCount = getBusinessUsageCount(value);
  const isSelected = state.createDraft.businessType === value;
  const isEditing = state.businessEditingValue === value;
  const encoded = escapeAttribute(value);

  if (isEditing) {
    return `
      <div class="mobile-sheet-list-card">
        <label class="mobile-sheet-input-block">
          <span>编辑业务名称</span>
          <input class="mobile-sheet-input" type="text" value="${escapeAttribute(state.businessEditingDraft)}" data-business-edit-input placeholder="业务名称" />
        </label>
        <div class="mobile-sheet-inline-actions">
          <button type="button" class="mobile-sheet-secondary" data-action="cancel-business-edit">取消</button>
          <button type="button" class="mobile-sheet-primary" data-business-save="${encoded}">保存</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="mobile-sheet-row">
      <div class="mobile-sheet-row-main">
        <strong>${escapeHtml(value)}</strong>
        <span>${usageCount} 次使用${hasBusinessTemplate(value) ? " · 已有模板" : ""}</span>
      </div>
      <div class="mobile-sheet-row-actions">
        ${
          state.businessEditMode && !builtIn
            ? `
              <button type="button" class="mobile-sheet-link" data-business-edit="${encoded}">编辑</button>
              <button type="button" class="mobile-sheet-link mobile-danger" data-business-delete="${encoded}">删除</button>
            `
            : `
              <button type="button" class="mobile-sheet-select${isSelected ? " is-active" : ""}" data-business-select="${encoded}">${isSelected ? "已选" : "选用"}</button>
            `
        }
      </div>
    </div>
  `;
}

function renderScopeButton(scope, label) {
  return `<button type="button" data-scope="${scope}" class="${state.orderScope === scope ? "is-active" : ""}">${label}</button>`;
}

function renderOrdersFilterOptions(options, selectedValue, labelResolver = (value) => value) {
  return options
    .map(
      (value) =>
        `<option value="${escapeAttribute(value)}"${value === selectedValue ? " selected" : ""}>${escapeHtml(labelResolver(value))}</option>`,
    )
    .join("");
}

function renderOrderCard(order, options = {}) {
  const amount = formatCompactAmount(normalizeMoneyValue(order.amount));
  const received = normalizeMoneyValue(order.receivedAmount) > 0 ? `已收 ${formatCompactAmount(order.receivedAmount)}` : "未收";
  const dueText = normalizeDateKey(order.dueDate) || "未排截稿";
  const sourceColor = getSourceColor(order.source);
  const cardToneClass = options.tone ? ` is-${options.tone}` : "";
  const isConfirmingDelete = state.confirmDeleteOrderId === order.id;
  const editLabel = state.editingOrderId === order.id ? "编辑中" : "编辑";
  const isSelected = state.selectedOrderIds.has(order.id);
  const isExpanded = state.expandedOrderId === order.id;
  const exceptionBadge = isAbnormal(order)
    ? `<button type="button" class="mobile-badge is-warning is-clickable" data-order-exception="${escapeAttribute(order.id)}">${escapeHtml(order.exceptionType)}</button>`
    : "";
  const resolutionBadge = order.exceptionResolution
    ? `<span class="mobile-badge is-warning-soft">${escapeHtml(order.exceptionResolution)}</span>`
    : "";
  const quickActions = renderOrderQuickActionButtons(order);
  const exceptionSummary = renderOrderExceptionSummary(order);
  const workHoursChip = renderWorkHoursChip(order);

  return `
    <article class="mobile-order-card${cardToneClass}" style="--order-source-color:${sourceColor}">
      <div class="mobile-order-top">
        <div>
          <h3 class="mobile-order-title">${escapeHtml(order.projectName || "未命名稿件")}</h3>
          <p class="mobile-order-client">${escapeHtml(order.clientName || "未填写客户")}</p>
        </div>
        <div class="mobile-order-top-side">
          <button type="button" class="mobile-chip${isSelected ? " is-active" : ""}" data-order-select="${escapeAttribute(order.id)}">${isSelected ? "已选" : "选择"}</button>
          <span class="mobile-badge mobile-badge-dot" style="color:${getStatusDotColor(order.status)};">${escapeHtml(order.status || "排期中")}</span>
        </div>
      </div>
      <div class="mobile-order-meta">
        <span class="mobile-badge">${escapeHtml(order.productionStage || "待推进")}</span>
        <span class="mobile-badge is-accent">${dueText}</span>
        <button type="button" class="mobile-badge is-green mobile-mono is-clickable" data-order-toggle-detail="${escapeAttribute(order.id)}">${received}</button>
        <button type="button" class="mobile-badge mobile-mono is-clickable" data-order-toggle-detail="${escapeAttribute(order.id)}">${amount} ${isExpanded ? "▴" : "▾"}</button>
        ${workHoursChip}
        ${exceptionBadge}
        ${resolutionBadge}
      </div>
      ${isExpanded ? renderAmountDetail(order) : ""}
      ${isExpanded ? renderStageTimeline(order) : ""}
      ${exceptionSummary ? `<div class="mobile-order-note">${exceptionSummary}</div>` : ""}
      ${quickActions ? `<div class="mobile-order-quick-actions">${quickActions}</div>` : ""}
      <div class="mobile-order-actions">
        <button type="button" class="mobile-order-action" data-order-edit="${escapeAttribute(order.id)}">${editLabel}</button>
        <button type="button" class="mobile-order-action" data-order-duplicate="${escapeAttribute(order.id)}">复制</button>
        ${
          isConfirmingDelete
            ? `
              <button type="button" class="mobile-order-action" data-order-cancel-delete="${escapeAttribute(order.id)}">取消</button>
              <button type="button" class="mobile-order-action is-danger" data-order-delete="${escapeAttribute(order.id)}">确认删除</button>
            `
            : `<button type="button" class="mobile-order-action is-danger" data-order-confirm-delete="${escapeAttribute(order.id)}">删除</button>`
        }
      </div>
    </article>
  `;
}

function renderWorkHoursChip(order) {
  const hours = sanitizeWorkHours(order.workHours);
  const isCompleted = Boolean(order.completedDate) || isClosed(order);
  const canQuickEdit = canQuickEditWorkHours(order);
  if (hours > 0) {
    const label = isCompleted ? `实际 ${formatHours(hours)}h` : `预计 ${formatHours(hours)}h`;
    return canQuickEdit
      ? `<button type="button" class="mobile-badge is-clickable" data-order-work-hours="${escapeAttribute(order.id)}">${label}</button>`
      : `<span class="mobile-badge">${label}</span>`;
  }
  if (canQuickEdit) {
    return `<button type="button" class="mobile-badge is-clickable" data-order-work-hours="${escapeAttribute(order.id)}">补工时</button>`;
  }
  return "";
}

function renderAmountDetail(order) {
  const grossCny = calculateGrossAmountCny(order, state.fxSettings);
  const netCny = calculateAdjustedNetAmountCny(order, state.fxSettings);
  const receivedCny = calculateEffectiveReceivedCny(order, state.fxSettings);
  const refund = calculateRefundAmount(order);
  const surcharge = calculateUsageSurcharge(order);
  const hourlyRate = calculateHourlyRate(order, state.fxSettings);
  const rows = [];

  rows.push(`<div class="mobile-detail-row"><span>稿费总额</span><span class="mobile-mono">${formatCnyMoney(grossCny)}</span></div>`);
  if (surcharge > 0) {
    rows.push(`<div class="mobile-detail-row"><span>${escapeHtml(order.usageType || "商用")}加价</span><span class="mobile-mono">+${formatCnyMoney(surcharge)}</span></div>`);
  }
  if (refund > 0) {
    rows.push(`<div class="mobile-detail-row is-warning"><span>退款</span><span class="mobile-mono">-${formatCnyMoney(refund)}</span></div>`);
  }
  if (Math.abs(netCny - grossCny) > 0.01) {
    rows.push(`<div class="mobile-detail-row"><span>预计实得</span><span class="mobile-mono">${formatCnyMoney(netCny)}</span></div>`);
  }
  rows.push(`<div class="mobile-detail-row"><span>已收</span><span class="mobile-mono is-green">${formatCnyMoney(receivedCny)}</span></div>`);
  if (hourlyRate > 0) {
    rows.push(`<div class="mobile-detail-row"><span>参考时薪</span><span class="mobile-mono">${formatHourlyRate(hourlyRate)}/h</span></div>`);
  }

  return `<div class="mobile-order-detail">${rows.join("")}</div>`;
}

function renderStageTimeline(order) {
  const summary = getStageTimelineSummary(order.stageTimeline);
  if (!summary.length) return "";

  const items = summary.map((entry, index) => {
    const isCurrent = entry.stage === order.productionStage;
    const nextEntry = summary[index + 1];
    const duration = nextEntry ? calculateStageDuration(order.stageTimeline, entry.stage, nextEntry.stage) : null;
    return `
      <div class="mobile-timeline-item${isCurrent ? " is-current" : ""}">
        <span class="mobile-timeline-dot"></span>
        <span class="mobile-timeline-name">${escapeHtml(entry.stage)}</span>
        <span class="mobile-timeline-date">${entry.date}</span>
        ${duration !== null && duration > 0 ? `<span class="mobile-timeline-duration">+${duration}天</span>` : ""}
      </div>
    `;
  });

  return `<div class="mobile-order-stage-timeline">${items.join("")}</div>`;
}

function recordStageTimestamp(currentTimeline, previousStage, nextStage) {
  const timeline = { ...normalizeStageTimeline(currentTimeline) };
  const normalizedNext = normalizeProductionStageValue(nextStage);
  if (normalizedNext && !timeline[normalizedNext]) {
    timeline[normalizedNext] = formatDateInput(new Date());
  }
  return timeline;
}

function getStageTimelineSummary(timeline) {
  const normalized = normalizeStageTimeline(timeline);
  const stages = BUILT_IN_PRODUCTION_STAGES;
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

function renderOrderQuickActionButtons(order) {
  const disabled = state.busy ? " disabled" : "";
  const id = escapeAttribute(order.id);
  const actions = [];

  if (isAbnormal(order)) {
    actions.push(`<button type="button" class="mobile-order-action" data-order-exception="${id}"${disabled}>处理异常</button>`);
    if (order.status !== "已处理") {
      actions.push(`<button type="button" class="mobile-order-action" data-order-quick-action="handled" data-order-id="${id}"${disabled}>已处理</button>`);
    }
    return actions.join("");
  }

  if (!isClosed(order)) {
    actions.push(`<button type="button" class="mobile-order-action" data-order-quick-action="complete" data-order-id="${id}"${disabled}>完结归档</button>`);
  }
  if (normalizePaymentStatus(order) !== "已结清" && order.status !== "已处理") {
    actions.push(`<button type="button" class="mobile-order-action" data-order-quick-action="settlePayment" data-order-id="${id}"${disabled}>记为已结清</button>`);
  }
  if (isClosed(order) && order.status !== "已处理") {
    actions.push(`<button type="button" class="mobile-order-action" data-order-quick-action="revertToActive" data-order-id="${id}"${disabled}>改回进行中</button>`);
  }
  return actions.join("");
}

function renderOrderExceptionSummary(order) {
  if (!isAbnormal(order)) return "";
  const lines = [];
  if (order.exceptionResolution) {
    lines.push(`处理结果：${order.exceptionResolution}`);
  } else {
    lines.push(order.status === "已处理" ? "当前已处理，但还没补录处理结果。" : "当前还是异常单，建议尽快补处理结果。");
  }
  if (normalizeMoneyValue(order.refundAmount) > 0) {
    lines.push(`退款 ${formatCompactAmount(convertMoneyToCny(order.refundAmount, order, state.fxSettings))}`);
  }
  if (order.exceptionNote) {
    lines.push(order.exceptionNote);
  }
  return escapeHtml(lines.join(" · "));
}

function renderCalendarEntryCard(entry) {
  const order = entry.order;
  const amount = formatCompactAmount(normalizeMoneyValue(order.amount));
  const typeLabel = entry.typeLabel || "稿件";
  const sourceColor = getOrderCalendarColor(order);
  return `
    <article class="mobile-order-card">
      <div class="mobile-order-top">
        <div>
          <h3 class="mobile-order-title">${escapeHtml(order.projectName || "未命名稿件")}</h3>
          <p class="mobile-order-client">${escapeHtml(order.clientName || "未填写客户")}</p>
        </div>
        <span class="mobile-badge" style="border-color:${sourceColor}33;color:${sourceColor};">${escapeHtml(typeLabel)}</span>
      </div>
      <div class="mobile-order-meta">
        <span class="mobile-badge">${escapeHtml(order.productionStage || "待推进")}</span>
        <span class="mobile-badge is-accent">${escapeHtml(normalizeDateKey(order.dueDate) || "未排截稿")}</span>
        <span class="mobile-badge">${amount}</span>
      </div>
      <div class="mobile-order-actions">
        <button type="button" class="mobile-order-action" data-order-edit="${escapeAttribute(order.id)}">编辑</button>
        <button type="button" class="mobile-order-action" data-order-duplicate="${escapeAttribute(order.id)}">复制</button>
      </div>
    </article>
  `;
}

function renderReadonlyFormRow(label, value, hint = "") {
  return `
    <div class="mobile-form-row">
      <div>
        <span class="mobile-form-label">${label}</span>
        ${hint ? `<span class="mobile-form-hint">${hint}</span>` : ""}
      </div>
      <span class="mobile-form-value">${escapeHtml(value)}</span>
    </div>
  `;
}

function renderEditableInputRow(label, field, value, placeholder = "", options = {}) {
  const type = options.type || "text";
  return `
    <label class="mobile-form-row">
      <div>
        <span class="mobile-form-label">${label}</span>
        ${options.hint ? `<span class="mobile-form-hint">${options.hint}</span>` : ""}
      </div>
      <input class="mobile-form-input" type="${type}" value="${escapeAttribute(value || "")}" placeholder="${escapeAttribute(placeholder)}" data-create-input="${field}" />
    </label>
  `;
}

function renderEditableNumberRow(label, field, value, placeholder = "", options = {}) {
  const displayValue = value == null ? "" : String(value);
  return `
    <label class="mobile-form-row">
      <div>
        <span class="mobile-form-label">${label}</span>
        ${options.hint ? `<span class="mobile-form-hint">${options.hint}</span>` : ""}
      </div>
      <div class="mobile-form-inline-field">
        ${options.prefix ? `<span class="mobile-form-affix">${escapeHtml(options.prefix)}</span>` : ""}
        <input class="mobile-form-input is-numeric" type="number" inputmode="decimal" step="0.01" value="${escapeAttribute(displayValue)}" placeholder="${escapeAttribute(placeholder)}" data-create-number="${field}" data-number-kind="${escapeAttribute(options.kind || "money")}" />
        ${options.suffix ? `<span class="mobile-form-affix">${escapeHtml(options.suffix)}</span>` : ""}
      </div>
    </label>
  `;
}

function renderEditableDateRow(label, field, value = "", hint = "") {
  return `
    <label class="mobile-form-row">
      <div>
        <span class="mobile-form-label">${label}</span>
        ${hint ? `<span class="mobile-form-hint">${hint}</span>` : ""}
      </div>
      <input class="mobile-form-input is-date" type="date" value="${escapeAttribute(value || "")}" data-create-date="${field}" />
    </label>
  `;
}

function renderEditableSelectRow(label, field, value, options, hint = "") {
  return `
    <label class="mobile-form-row">
      <div>
        <span class="mobile-form-label">${label}</span>
        ${hint ? `<span class="mobile-form-hint">${hint}</span>` : ""}
      </div>
      <span class="mobile-form-select-wrap">
        <select class="mobile-form-select" data-create-select="${field}">
          ${options
            .map(
              (option) =>
                `<option value="${escapeAttribute(option.value)}"${option.value === value ? " selected" : ""}>${escapeHtml(option.label)}</option>`,
            )
            .join("")}
        </select>
      </span>
    </label>
  `;
}

function renderEditableTextareaBlock(label, field, value = "", placeholder = "") {
  return `
    <label class="mobile-form-block">
      <span class="mobile-form-label">${label}</span>
      <textarea class="mobile-form-textarea" rows="4" maxlength="200" placeholder="${escapeAttribute(placeholder)}" data-create-textarea="${field}">${escapeHtml(value || "")}</textarea>
      <span class="mobile-form-hint">${Math.max(0, 200 - String(value || "").length)} / 200</span>
    </label>
  `;
}

function bindEvents() {
  const immediateActions = new Set(["save-create-order", "cancel-edit-order"]);
  root.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.tab = button.dataset.tab || "orders";
      render();
    });
  });

  root.querySelectorAll("[data-scope]").forEach((button) => {
    button.addEventListener("click", () => {
      state.orderScope = button.dataset.scope || "all";
      render();
    });
  });

  root.querySelector("[data-order-query]")?.addEventListener("input", (event) => {
    state.orderQuery = String(event.target.value || "");
    render();
  });

  root.querySelector("[data-order-status-filter]")?.addEventListener("change", (event) => {
    state.orderStatusFilter = String(event.target.value || "全部");
    render();
  });

  root.querySelector("[data-order-source-filter]")?.addEventListener("change", (event) => {
    state.orderSourceFilter = String(event.target.value || "全部");
    render();
  });

  root.querySelector("[data-order-business-filter]")?.addEventListener("change", (event) => {
    state.orderBusinessFilter = String(event.target.value || "全部");
    render();
  });

  root.querySelector("[data-order-sort-by]")?.addEventListener("change", (event) => {
    state.orderSortBy = String(event.target.value || "due");
    render();
  });

  root.querySelector("[data-batch-exception-type]")?.addEventListener("change", (event) => {
    state.batchExceptionType = String(event.target.value || state.batchExceptionType);
  });

  root.querySelectorAll("[data-calendar-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.calendarMode = button.dataset.calendarMode || CALENDAR_MODE_TAGS;
      render();
    });
  });

  root.querySelectorAll("[data-calendar-date]").forEach((button) => {
    button.addEventListener("click", () => {
      const dateKey = normalizeDateKey(button.dataset.calendarDate);
      if (!dateKey) return;
      state.selectedCalendarDate = dateKey;
      render();
    });
  });

  root.querySelectorAll("[data-calendar-mark-rest]").forEach((button) => {
    button.addEventListener("click", () => {
      const dateKey = button.dataset.calendarMarkRest;
      const current = getCalendarDayMarkType(dateKey);
      persistCalendarDayMark(dateKey, current === CALENDAR_DAY_MARK_REST ? "" : CALENDAR_DAY_MARK_REST);
    });
  });

  root.querySelectorAll("[data-calendar-mark-work]").forEach((button) => {
    button.addEventListener("click", () => {
      const dateKey = button.dataset.calendarMarkWork;
      const current = getCalendarDayMarkType(dateKey);
      persistCalendarDayMark(dateKey, current === CALENDAR_DAY_MARK_WORK ? "" : CALENDAR_DAY_MARK_WORK);
    });
  });

  root.querySelectorAll("[data-calendar-mark-clear]").forEach((button) => {
    button.addEventListener("click", () => {
      persistCalendarDayMark(button.dataset.calendarMarkClear, "");
    });
  });

  root.querySelectorAll("[data-timeline-order-id]").forEach((bar) => {
    bar.addEventListener("pointerdown", beginTimelineMove);
    bar.addEventListener("click", () => {
      if (Date.now() < timelineDragSuppressClickUntil) return;
      const focusDate = normalizeDateKey(bar.dataset.focusDate);
      if (!focusDate) return;
      state.selectedCalendarDate = focusDate;
      render();
    });
  });

  root.querySelectorAll("[data-timeline-track]").forEach((track) => {
    track.addEventListener("pointerdown", beginTimelineCreateRange);
  });

  root.querySelectorAll("[data-action]").forEach((button) => {
    const action = button.dataset.action || "";
    if (immediateActions.has(action)) {
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        void handleAction(action);
      });
      return;
    }
    button.addEventListener("click", () => {
      void handleAction(action);
    });
  });

  root.querySelectorAll("[data-order-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      startEditOrder(button.dataset.orderEdit || "");
    });
  });

  root.querySelectorAll("[data-order-select]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleSelection(button.dataset.orderSelect || "");
    });
  });

  root.querySelectorAll("[data-order-duplicate]").forEach((button) => {
    button.addEventListener("click", () => {
      duplicateOrderFromList(button.dataset.orderDuplicate || "");
    });
  });

  root.querySelectorAll("[data-order-toggle-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.orderToggleDetail || "";
      state.expandedOrderId = state.expandedOrderId === id ? "" : id;
      render();
    });
  });

  root.querySelectorAll("[data-order-work-hours]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.orderWorkHours || "";
      const order = state.orders.find((item) => item.id === id);
      if (!order) return;
      state.workHoursEditorOrderId = id;
      state.workHoursEditorValue = sanitizeWorkHours(order.workHours) > 0 ? String(order.workHours) : "";
      state.activeSheet = SHEET_WORK_HOURS;
      render();
    });
  });

  root.querySelector("[data-work-hours-input]")?.addEventListener("input", (event) => {
    state.workHoursEditorValue = event.target.value;
  });

  root.querySelectorAll("[data-order-quick-action]").forEach((button) => {
    button.addEventListener("click", () => {
      void handleOrderQuickAction(button.dataset.orderQuickAction || "", button.dataset.orderId || "");
    });
  });

  root.querySelectorAll("[data-order-exception]").forEach((button) => {
    button.addEventListener("click", () => {
      openExceptionEditor(button.dataset.orderException || "");
    });
  });

  root.querySelectorAll("[data-order-confirm-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      state.confirmDeleteOrderId = button.dataset.orderConfirmDelete || "";
      render();
    });
  });

  root.querySelectorAll("[data-order-cancel-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.confirmDeleteOrderId === (button.dataset.orderCancelDelete || "")) {
        state.confirmDeleteOrderId = "";
      }
      render();
    });
  });

  root.querySelectorAll("[data-order-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      void deleteOrderMobile(button.dataset.orderDelete || "");
    });
  });

  root.querySelectorAll("[data-exception-handled]").forEach((button) => {
    button.addEventListener("click", () => {
      state.exceptionEditorHandled = button.dataset.exceptionHandled === "yes";
      if (state.exceptionEditorHandled && !state.exceptionEditorResolution) {
        state.exceptionEditorResolution = EXCEPTION_RESOLUTIONS[0] || "";
      }
      state.exceptionEditorMessage = "";
      render();
    });
  });

  root.querySelector("[data-exception-resolution]")?.addEventListener("change", (event) => {
    state.exceptionEditorResolution = String(event.target.value || EXCEPTION_RESOLUTIONS[0] || "");
    state.exceptionEditorMessage = "";
    render();
  });

  root.querySelector("[data-exception-refund]")?.addEventListener("input", (event) => {
    state.exceptionEditorRefundAmount = String(event.target.value || "");
    state.exceptionEditorMessage = "";
  });

  root.querySelector("[data-exception-note]")?.addEventListener("input", (event) => {
    state.exceptionEditorNote = String(event.target.value || "");
  });

  root.querySelectorAll("[data-business-shortcut]").forEach((button) => {
    button.addEventListener("click", () => {
      updateCreateDraft({ businessType: button.dataset.businessShortcut || state.createDraft.businessType });
      render();
    });
  });

  root.querySelectorAll("[data-stage-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      updateCreateDraft({ productionStage: button.dataset.stageChoice || state.createDraft.productionStage });
      render();
    });
  });

  root.querySelectorAll("[data-color-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      updateCreateDraft({ calendarColor: button.dataset.colorChoice || state.createDraft.calendarColor });
      render();
    });
  });

  root.querySelectorAll("[data-template-expand]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.templateExpand || "";
      state.expandedTemplateKey = state.expandedTemplateKey === key ? "" : key;
      state.confirmDeleteTemplateKey = "";
      render();
    });
  });

  root.querySelectorAll("[data-template-apply]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.templateApply || "";
      applyBusinessTemplateToDraft(getBusinessTemplate(key));
    });
  });

  root.querySelectorAll("[data-template-confirm-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      state.confirmDeleteTemplateKey = button.dataset.templateConfirmDelete || "";
      render();
    });
  });

  root.querySelectorAll("[data-template-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      void removeBusinessTemplate(button.dataset.templateDelete || "");
    });
  });

  root.querySelector("[data-template-name]")?.addEventListener("input", (event) => {
    state.templateDraftName = event.target.value;
  });

  root.querySelectorAll("[data-business-select]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.businessSelect || "";
      if (!value) return;
      updateCreateDraft({ businessType: value });
      closeActiveSheet();
      render();
    });
  });

  root.querySelectorAll("[data-business-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      void removeBusinessPreset(button.dataset.businessDelete || "");
    });
  });

  root.querySelectorAll("[data-business-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      startBusinessEdit(button.dataset.businessEdit || "");
    });
  });

  root.querySelector("[data-business-name-input]")?.addEventListener("input", (event) => {
    state.businessDraftName = event.target.value;
  });

  root.querySelector("[data-business-edit-input]")?.addEventListener("input", (event) => {
    state.businessEditingDraft = event.target.value;
  });

  root.querySelectorAll("[data-business-save]").forEach((button) => {
    button.addEventListener("click", () => {
      void renameBusinessPreset(button.dataset.businessSave || "");
    });
  });

  root.querySelector("[data-vip-threshold-input]")?.addEventListener("input", (event) => {
    const parsed = Number(event.target.value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      state.clientInsightSettings = normalizeClientInsightSettings({
        ...state.clientInsightSettings,
        vipThreshold: Math.round(parsed),
      });
    }
  });

  root.querySelector("[data-vip-threshold-input]")?.addEventListener("blur", () => {
    persistClientInsightSettingsFromUi();
  });

  root.querySelector("[data-auth-email]")?.addEventListener("input", (event) => {
    state.authEmail = event.target.value;
  });

  root.querySelector("[data-auth-password]")?.addEventListener("input", (event) => {
    state.authPassword = event.target.value;
  });

  root.querySelector("[data-auth-reset-password]")?.addEventListener("input", (event) => {
    state.authResetPassword = event.target.value;
  });

  root.querySelector("[data-auth-reset-password-confirm]")?.addEventListener("input", (event) => {
    state.authResetPasswordConfirm = event.target.value;
  });

  root.querySelectorAll("[data-create-input]").forEach((input) => {
    input.addEventListener("input", (event) => {
      updateCreateDraft({
        [event.target.dataset.createInput]: event.target.value,
      });
    });
    input.addEventListener("change", () => {
      state.createFeedbackMessage = "";
      render();
    });
  });

  root.querySelectorAll("[data-create-number]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const field = event.target.dataset.createNumber;
      const kind = event.target.dataset.numberKind || "money";
      const raw = event.target.value;
      const nextValue =
        kind === "hours"
          ? sanitizeWorkHours(raw)
          : kind === "percent"
            ? Math.max(0, Number(raw || 0)) / 100
            : normalizeMoneyValue(raw);
      updateCreateDraft({ [field]: nextValue });
    });
    input.addEventListener("change", () => {
      state.createFeedbackMessage = "";
      render();
    });
  });

  root.querySelectorAll("[data-create-date]").forEach((input) => {
    input.addEventListener("change", (event) => {
      updateCreateDraft({
        [event.target.dataset.createDate]: normalizeDateKey(event.target.value),
      });
      state.createFeedbackMessage = "";
      render();
    });
  });

  root.querySelectorAll("[data-create-select]").forEach((select) => {
    select.addEventListener("change", (event) => {
      updateDraftSelectField(event.target.dataset.createSelect, event.target.value);
      state.createFeedbackMessage = "";
      render();
    });
  });

  root.querySelectorAll("[data-create-textarea]").forEach((textarea) => {
    textarea.addEventListener("input", (event) => {
      updateCreateDraft({
        [event.target.dataset.createTextarea]: event.target.value.slice(0, 200),
      });
    });
    textarea.addEventListener("change", () => {
      state.createFeedbackMessage = "";
      render();
    });
  });
}

function bindStaticInputs() {
  importJsonInput?.addEventListener("change", importMobileJson);
}

async function handleAction(action) {
  if (action === "refresh") {
    if (isCloudSyncActive()) {
      await syncCloudWorkspaceOnLogin({ silent: true });
      return;
    }
    refreshLocalData();
    render();
    return;
  }
  if (action === "mode-local") {
    await setStorageMode("local");
    return;
  }
  if (action === "mode-cloud") {
    await setStorageMode("cloud");
    return;
  }
  if (action === "sign-in") {
    await signInWithPasswordMobile();
    return;
  }
  if (action === "sign-up") {
    await signUpWithPasswordMobile();
    return;
  }
  if (action === "resend-signup") {
    await resendSignupEmailMobile();
    return;
  }
  if (action === "forgot-password") {
    await requestPasswordResetMobile();
    return;
  }
  if (action === "update-password") {
    await completePasswordResetMobile();
    return;
  }
  if (action === "retry-turnstile") {
    resetMobileTurnstile();
    return;
  }
  if (action === "sign-out") {
    await signOutMobile();
    return;
  }
  if (action === "delete-account") {
    await deleteAccountMobile();
    return;
  }
  if (action === "cloud-sync-now") {
    await syncCloudNow();
    return;
  }
  if (action === "jump-create") {
    if (state.tab === "calendar") {
      openCreateWithDateContext(state.selectedCalendarDate, state.selectedCalendarDate, "已按当前选中日期预填排期。");
      return;
    }
    state.editingOrderId = "";
    state.confirmDeleteOrderId = "";
    state.createDraft = buildCreateDraft();
    state.createContextNote = "";
    state.tab = "create";
    render();
    return;
  }
  if (action === "month-prev") {
    state.month = shiftMonth(state.month, -1);
    render();
    return;
  }
  if (action === "month-next") {
    state.month = shiftMonth(state.month, 1);
    render();
    return;
  }
  if (action === "open-template-sheet") {
    state.activeSheet = SHEET_TEMPLATE;
    state.templateSheetMode = "apply";
    state.templateDraftName = buildDefaultTemplateName();
    state.expandedTemplateKey = "";
    state.confirmDeleteTemplateKey = "";
    render();
    return;
  }
  if (action === "open-business-sheet") {
    state.activeSheet = SHEET_BUSINESS;
    state.businessEditMode = false;
    state.businessAddOpen = false;
    state.businessDraftName = "";
    state.businessEditingValue = "";
    state.businessEditingDraft = "";
    render();
    return;
  }
  if (action === "close-sheet") {
    closeActiveSheet();
    render();
    return;
  }
  if (action === "template-tab-apply") {
    state.templateSheetMode = "apply";
    render();
    return;
  }
  if (action === "template-tab-save") {
    state.templateSheetMode = "save";
    state.templateDraftName = buildDefaultTemplateName();
    render();
    return;
  }
  if (action === "save-current-template") {
    await saveCurrentTemplate();
    return;
  }
  if (action === "cancel-edit-order") {
    resetCreateComposer();
    state.tab = "orders";
    render();
    return;
  }
  if (action === "save-create-order") {
    await saveCreateOrder();
    return;
  }
  if (action === "save-work-hours") {
    await saveWorkHours();
    return;
  }
  if (action === "clear-work-hours") {
    state.workHoursEditorValue = "";
    await saveWorkHours();
    return;
  }
  if (action === "select-all-visible") {
    toggleSelectAllVisible(getVisibleOrderPool(), true);
    return;
  }
  if (action === "clear-selection") {
    clearSelection();
    return;
  }
  if (action === "batch-mark-done") {
    await applyBatchStatusMobile("已完成");
    return;
  }
  if (action === "batch-mark-paid") {
    await applyBatchSettlePaymentMobile();
    return;
  }
  if (action === "batch-mark-handled") {
    await applyBatchStatusMobile("已处理");
    return;
  }
  if (action === "batch-apply-exception") {
    await applyBatchExceptionTypeMobile(state.batchExceptionType);
    return;
  }
  if (action === "save-exception-editor") {
    await saveExceptionEditor();
    return;
  }
  if (action === "export-json") {
    exportMobileJson();
    return;
  }
  if (action === "export-csv") {
    exportMobileCsv();
    return;
  }
  if (action === "trigger-import-json") {
    triggerMobileImportJson();
    return;
  }
  if (action === "repeat-last") {
    duplicatePreviousOrder();
    return;
  }
  if (action === "cancel-template-delete") {
    state.confirmDeleteTemplateKey = "";
    render();
    return;
  }
  if (action === "toggle-business-edit") {
    state.businessEditMode = !state.businessEditMode;
    state.businessEditingValue = "";
    state.businessEditingDraft = "";
    render();
    return;
  }
  if (action === "open-business-add") {
    state.businessAddOpen = true;
    state.businessDraftName = "";
    render();
    return;
  }
  if (action === "cancel-business-add") {
    state.businessAddOpen = false;
    state.businessDraftName = "";
    render();
    return;
  }
  if (action === "save-business-add") {
    await addBusinessPreset(state.businessDraftName);
    return;
  }
  if (action === "cancel-business-edit") {
    state.businessEditingValue = "";
    state.businessEditingDraft = "";
    render();
  }
}

function refreshLocalData() {
  state.fxSettings = loadFxSettings();
  state.orders = loadOrders(state.fxSettings);
  state.selectedOrderIds = new Set([...state.selectedOrderIds].filter((id) => state.orders.some((order) => order.id === id)));
  state.mode = loadMode();
  state.customBusinessTypes = loadLocalBusinessPresets();
  state.businessTemplates = loadLocalBusinessTemplates(state.fxSettings);
  state.lastTemplate = loadLastTemplate(state.fxSettings);
  state.clientInsightSettings = loadLocalClientInsightSettings();
  state.calendarDayMarks = loadLocalCalendarDayMarks();
  if (state.editingOrderId) {
    const editingOrder = state.orders.find((order) => order.id === state.editingOrderId);
    if (editingOrder) {
      state.createDraft = buildEditableDraft(editingOrder);
    } else {
      state.editingOrderId = "";
      state.createDraft = buildCreateDraft();
    }
  } else {
    state.createDraft = buildCreateDraft();
  }
  if (state.exceptionEditorOrderId && !state.orders.some((order) => order.id === state.exceptionEditorOrderId)) {
    closeExceptionEditor();
  }
  if (!state.createContextNote) state.createContextNote = "";
}

function loadOrders(fxSettings = state.fxSettings) {
  const raw = readJsonStorage(STORAGE_KEY, []);
  return Array.isArray(raw)
    ? raw
        .filter((item) => item && typeof item === "object")
        .map((item) => normalizeOrder(item, { fxSettings }))
    : [];
}

function persistLocalOrders(orders, fxSettings = state.fxSettings) {
  const normalized = Array.isArray(orders)
    ? orders.map((item) => normalizeOrder(item, { fxSettings }))
    : [];
  state.orders = normalized;
  writeJsonStorage(STORAGE_KEY, normalized);
  return normalized;
}

function loadMode() {
  if (state.recoveryMode || detectFlowType()) {
    return "cloud";
  }
  return loadPreferredStorageMode(APP_RUNTIME, "local");
}

function persistMode(mode) {
  state.mode = mode;
  savePreferredStorageMode(mode, APP_RUNTIME);
}

function loadFxSettings() {
  return normalizeFxSettings(readJsonStorage(FX_SETTINGS_KEY, {}));
}

function loadLocalBusinessPresets() {
  return normalizeBusinessPresetList(readJsonStorage(BUSINESS_PRESET_KEY, []));
}

function persistLocalBusinessPresets(list) {
  const normalized = normalizeBusinessPresetList(list);
  state.customBusinessTypes = normalized;
  writeJsonStorage(BUSINESS_PRESET_KEY, normalized);
  return normalized;
}

function loadLocalBusinessTemplates(fxSettings = state.fxSettings) {
  return normalizeBusinessTemplateMap(readJsonStorage(BUSINESS_TEMPLATE_KEY, {}), fxSettings);
}

function persistLocalBusinessTemplates(templates, fxSettings = state.fxSettings) {
  const normalized = normalizeBusinessTemplateMap(templates, fxSettings);
  state.businessTemplates = normalized;
  writeJsonStorage(BUSINESS_TEMPLATE_KEY, normalized);
  return normalized;
}

function loadLastTemplate(fxSettings = state.fxSettings) {
  const raw = readJsonStorage(LAST_TEMPLATE_KEY, null);
  return raw ? normalizeOrder(raw, { fxSettings }) : null;
}

function saveLastTemplate(order) {
  state.lastTemplate = normalizeOrder(order, { fxSettings: state.fxSettings });
  writeJsonStorage(LAST_TEMPLATE_KEY, state.lastTemplate);
}

function getScopedOrders() {
  return getFilteredOrders("active").slice(0, 20);
}

function getAbnormalOrders() {
  return getFilteredOrders("abnormal").slice(0, 8);
}

function getArchivedOrders() {
  return getFilteredOrders("archived").slice(0, 8);
}

function getFilteredOrders(mode = "active") {
  const sorted = [...state.orders].sort((left, right) => getOrderSortDate(right).localeCompare(getOrderSortDate(left)));
  const filtered = sorted.filter((order) => {
    if (mode === "active" && (isClosed(order) || isAbnormal(order))) return false;
    if (mode === "abnormal" && !isAbnormal(order)) return false;
    if (mode === "archived" && !isClosed(order)) return false;
    if (!matchesOrderScope(order, mode)) return false;
    if (!matchesOrderQuery(order)) return false;
    if (!matchesOrderStatusFilter(order)) return false;
    if (!matchesOrderSourceFilter(order)) return false;
    if (!matchesOrderBusinessFilter(order)) return false;
    return true;
  });
  return filtered.sort(compareOrdersForSort);
}

function compareOrdersForSort(left, right) {
  switch (state.orderSortBy) {
    case "amount":
      return normalizeMoneyValue(right.amount) - normalizeMoneyValue(left.amount);
    case "created":
      return String(right.startDate || "").localeCompare(String(left.startDate || ""));
    case "client":
      return String(left.clientName || "").localeCompare(String(right.clientName || ""));
    case "due":
    default:
      return String(left.dueDate || "").localeCompare(String(right.dueDate || ""));
  }
}

function matchesOrderScope(order, mode = "active") {
  if (mode === "archived") return true;
  const referenceDate = normalizeDateKey(order.dueDate || order.completedDate || order.startDate);
  if (!referenceDate) return state.orderScope === "all";
  if (state.orderScope === "today") {
    return referenceDate === formatDateInput(new Date());
  }
  if (state.orderScope === "week") {
    return isDateInThisWeek(referenceDate);
  }
  return true;
}

function matchesOrderQuery(order) {
  const query = String(state.orderQuery || "").trim().toLowerCase();
  if (!query) return true;
  return [order.projectName, order.clientName, order.notes]
    .map((value) => String(value || "").toLowerCase())
    .some((value) => value.includes(query));
}

function matchesOrderStatusFilter(order) {
  return state.orderStatusFilter === "全部" || String(order.status || "").trim() === state.orderStatusFilter;
}

function matchesOrderSourceFilter(order) {
  return state.orderSourceFilter === "全部" || String(order.source || "").trim() === state.orderSourceFilter;
}

function matchesOrderBusinessFilter(order) {
  if (state.orderBusinessFilter === "全部") return true;
  return normalizeBusinessTypeValue(order.businessType) === normalizeBusinessTypeValue(state.orderBusinessFilter);
}

function getAllBusinessTypes() {
  const all = [
    ...BUILT_IN_BUSINESS_TYPES,
    ...state.customBusinessTypes,
    ...state.orders.map((order) => order.businessType),
  ]
    .map((value) => normalizeBusinessTypeValue(value))
    .filter(Boolean);
  return all.filter((value, index, array) => array.indexOf(value) === index);
}

function getOrderSortDate(order) {
  return String(order.completedDate || order.dueDate || order.startDate || "");
}

function getVisibleOrderPool(activeOrders = getScopedOrders(), abnormalOrders = getAbnormalOrders(), archivedOrders = getArchivedOrders()) {
  const seen = new Set();
  return [...activeOrders, ...abnormalOrders, ...archivedOrders].filter((order) => {
    if (!order?.id || seen.has(order.id)) return false;
    seen.add(order.id);
    return true;
  });
}

function toggleSelection(id, checked = !state.selectedOrderIds.has(id)) {
  if (!id) return;
  if (checked) {
    state.selectedOrderIds.add(id);
  } else {
    state.selectedOrderIds.delete(id);
  }
  render();
}

function toggleSelectAllVisible(orders, checked) {
  const targetOrders = Array.isArray(orders) ? orders : [];
  targetOrders.forEach((order) => {
    if (!order?.id) return;
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
  const visibleIds = new Set((orders || []).map((order) => order.id));
  state.selectedOrderIds = new Set([...state.selectedOrderIds].filter((id) => visibleIds.has(id)));
}

function getSelectedVisibleIds(orders) {
  return (orders || []).filter((order) => state.selectedOrderIds.has(order.id)).map((order) => order.id);
}

function isDateInThisWeek(value) {
  const safe = normalizeDateKey(value);
  if (!safe) return false;
  const date = new Date(`${safe}T00:00:00`);
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(today.getDate() - today.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return date >= start && date < end;
}

function isSameMonth(value, monthDate) {
  const safe = normalizeDateKey(value);
  if (!safe) return false;
  const date = new Date(`${safe}T00:00:00`);
  return date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth();
}

function getOrdersForDate(dateKey) {
  const safe = normalizeDateKey(dateKey);
  if (!safe) return [];
  return state.orders.filter((order) => {
    return normalizeDateKey(order.startDate) === safe || normalizeDateKey(order.dueDate) === safe || normalizeDateKey(order.completedDate) === safe;
  });
}

function getCalendarEntriesForDate(dateKey) {
  const safe = normalizeDateKey(dateKey);
  if (!safe) return [];
  return state.orders.flatMap((order) => getCalendarEntriesForOrder(order, safe));
}

function buildCreateDraft() {
  const latestOrder = state.orders.at(-1);
  const latestTemplate = getLatestTemplate();
  const seed = latestTemplate || latestOrder || {};
  const source = seed.source || SOURCES[0];
  const feeMode = suggestFeeMode(source, seed.feeMode);
  const businessType = normalizeBusinessTypeValue(seed.businessType) || BUILT_IN_BUSINESS_TYPES[0];
  const productionStage = seed.productionStage || BUILT_IN_PRODUCTION_STAGES[0];
  const startDate = formatDateInput(new Date());
  const calendarColor = seed.calendarColor || getSourceColor(source);
  return {
    projectName: "",
    clientName: "",
    businessType,
    source,
    feeMode,
    feeRate: getDefaultFeeRate(source, feeMode),
    priority: seed.priority || PRIORITIES[0],
    usageType: seed.usageType || USAGE_TYPES[0],
    usageRate: seed.usageRate || 0,
    currency: seed.currency || CURRENCY_OPTIONS[0].value,
    amount: 0,
    receivedAmount: 0,
    paymentStatus: PAYMENT_STATUSES[0],
    startDate,
    dueDate: "",
    completedDate: "",
    workHours: seed.workHours || 0,
    calendarColor,
    status: seed.status || "进行中",
    productionStage,
    exceptionType: EXCEPTION_TYPES[0],
    notes: "",
  };
}

function bindTimelineGlobalEvents() {
  if (timelineGlobalEventsBound) return;
  timelineGlobalEventsBound = true;
  window.addEventListener("pointermove", handleTimelineCreateRangeMove);
  window.addEventListener("pointerup", handleTimelineCreateRangeEnd);
  window.addEventListener("pointercancel", handleTimelineCreateRangeCancel);
  window.addEventListener("pointermove", handleTimelineMoveDrag);
  window.addEventListener("pointerup", handleTimelineMoveEnd);
  window.addEventListener("pointercancel", handleTimelineMoveCancel);
}

function updateCreateDraft(patch) {
  state.createDraft = {
    ...state.createDraft,
    ...patch,
  };
}

function updateDraftSelectField(field, value) {
  if (field === "source") {
    const nextSource = value || state.createDraft.source;
    const nextFeeMode = suggestFeeMode(nextSource, state.createDraft.feeMode);
    const nextPatch = {
      source: nextSource,
      feeMode: nextFeeMode,
      feeRate: getDefaultFeeRate(nextSource, nextFeeMode),
    };
    const currentSourceColor = getSourceColor(state.createDraft.source);
    if (!state.createDraft.calendarColor || state.createDraft.calendarColor === currentSourceColor) {
      nextPatch.calendarColor = getSourceColor(nextSource);
    }
    updateCreateDraft(nextPatch);
    return;
  }
  updateCreateDraft({ [field]: value });
}

function suggestFeeMode(source, fallback = "standard") {
  if (source === "米画师企划邀请") return "mhs_project";
  if (source === "米画师橱窗") return "mhs_window";
  return FEE_MODES.some((item) => item.value === fallback) ? fallback : "standard";
}

function getRecentBusinessTypes() {
  const recent = [
    state.createDraft.businessType,
    ...state.customBusinessTypes,
    ...Object.keys(state.businessTemplates || {}),
    ...state.orders.map((order) => order.businessType),
    ...BUILT_IN_BUSINESS_TYPES,
  ]
    .map((value) => normalizeBusinessTypeValue(value))
    .filter(Boolean);
  return recent.filter((value, index, array) => array.indexOf(value) === index).slice(0, 10);
}

function buildMonthCells(monthDate) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstWeekday = first.getDay();
  const start = new Date(first);
  start.setDate(first.getDate() - firstWeekday);

  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      key: formatDateInput(date),
      day: date.getDate(),
      inMonth: date.getMonth() === monthDate.getMonth(),
    };
  });
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

function shiftMonth(monthDate, delta) {
  return new Date(monthDate.getFullYear(), monthDate.getMonth() + delta, 1);
}

function ensureSelectedCalendarDate(range) {
  const normalized = normalizeDateKey(state.selectedCalendarDate);
  if (normalized && range.dateKeys.includes(normalized)) return normalized;
  const today = formatDateInput(new Date());
  if (range.dateKeys.includes(today)) {
    state.selectedCalendarDate = today;
    return today;
  }
  state.selectedCalendarDate = range.dateKeys[0];
  return state.selectedCalendarDate;
}

function formatCompactAmount(value) {
  return formatCnyMoney(value).replace(".00", "");
}

function getCalendarEntriesForOrder(order, currentDate) {
  const done = isClosed(order);
  const isStart = Boolean(order.startDate) && normalizeDateKey(order.startDate) === currentDate;
  const isDue = Boolean(order.dueDate) && normalizeDateKey(order.dueDate) === currentDate;
  const isCompletedDay = Boolean(order.completedDate) && normalizeDateKey(order.completedDate) === currentDate;
  const entries = [];

  if (isStart || isDue) {
    const type = isStart && isDue ? "both" : isStart ? "start" : "due";
    const typeLabel = type === "both" ? "动工/截稿" : type === "start" ? "动工" : "截稿";
    entries.push({
      order,
      type,
      typeLabel: done ? `${typeLabel} ✓` : typeLabel,
    });
  }

  if (done && isCompletedDay && normalizeDateKey(order.completedDate) !== normalizeDateKey(order.dueDate)) {
    entries.push({
      order,
      type: "done",
      typeLabel: "完成 ✓",
    });
  }

  return entries;
}

function formatMoneyValue(value) {
  return formatCnyMoney(normalizeMoneyValue(value));
}

function formatRatePercent(value) {
  const numeric = Number(value || 0);
  return `${Math.round(numeric * 10000) / 100}%`;
}

function buildFeeSummary(draft) {
  const feeRatePercent = formatRatePercent(draft.feeRate);
  if (draft.feeMode === "mhs_project") return `企划邀请 · ${feeRatePercent}`;
  if (draft.feeMode === "mhs_window") return `米画师橱窗 · ${feeRatePercent}`;
  return `默认按比例 · ${feeRatePercent}`;
}

function renderChipItems(items, activeValue) {
  return items
    .map(
      (item) => `
        <button class="mobile-chip${item === activeValue ? " is-active" : ""}" type="button" data-business-shortcut="${escapeAttribute(item)}">${escapeHtml(item)}</button>
      `,
    )
    .join("");
}

function renderColorChoices(activeColor) {
  const colors = ["#ec7a45", "#f2a31c", "#2f9b74", "#4a7df2", "#8a63ff", "#df5fa8", "#e85454", "#86807c"];
  return colors
    .map(
      (color) => `
        <button class="mobile-color-choice${color === activeColor ? " is-active" : ""}" type="button" data-color-choice="${color}">
          <span class="mobile-color-dot" style="background:${color}"></span>
        </button>
      `,
    )
    .join("");
}

function renderStageItems(stages, activeStage) {
  return stages
    .map(
      (stage) => `
        <button class="mobile-stage-item${stage === activeStage ? " is-active" : ""}" type="button" data-stage-choice="${escapeAttribute(stage)}">
          ${escapeHtml(stage)}
        </button>
      `,
    )
    .join("");
}

function buildMobileTimelineWeeks(orders, range) {
  const activeMonth = state.month.getMonth();
  const segmentsByWeek = range.weeks.map(() => []);
  const weekData = range.weeks.map((weekDates) => ({
    label: `${formatWeekLabel(weekDates[0])} - ${formatWeekLabel(weekDates[6])}`,
    weekStartKey: weekDates[0],
    days: weekDates.map((dateKey) => {
      const date = parseDateKey(dateKey);
      return {
        key: dateKey,
        day: date?.getDate() || "",
        weekday: ["日", "一", "二", "三", "四", "五", "六"][date?.getDay() || 0],
        inMonth: date?.getMonth() === activeMonth,
        isToday: dateKey === range.todayKey,
        isSelected: dateKey === state.selectedCalendarDate,
      };
    }),
    bars: [],
    laneCount: 0,
  }));

  orders.forEach((order) => {
    appendTimelineSegmentsForOrder(segmentsByWeek, order, range.weeks, range.startKey, range.endKey);
  });

  assignTimelineSegmentLanes(segmentsByWeek);

  segmentsByWeek.forEach((segments, weekIndex) => {
    weekData[weekIndex].bars = segments.map((segment) => {
      const color = getOrderCalendarColor(segment.order);
      return {
        ...segment,
        closed: isClosed(segment.order),
        label: buildTimelineBarLabel(segment.order, segment.endCol - segment.startCol + 1),
        palette: getTimelineBarPalette(color),
        continuesBefore: segment.segmentStartKey > segment.displayRange.startKey,
        continuesAfter: segment.segmentEndKey < segment.displayRange.endKey,
        focusDateKey: resolveTimelineFocusDate(segment),
      };
    });
    weekData[weekIndex].laneCount = segments.reduce((maxLane, segment) => Math.max(maxLane, segment.lane + 1), 0);
  });

  return weekData;
}

function appendTimelineSegmentsForOrder(segmentsByWeek, order, weeks, viewStartKey, viewEndKey) {
  const displayRange = getTimelineDisplayRange(order);
  if (!displayRange) return;

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
      displayRange,
      lane: 0,
    });
  });
}

function assignTimelineSegmentLanes(segmentsByWeek) {
  segmentsByWeek.forEach((segments) => {
    segments.sort((left, right) => {
      if (left.startCol !== right.startCol) return left.startCol - right.startCol;
      if (left.endCol !== right.endCol) return right.endCol - left.endCol;
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

function getTimelineDisplayRange(order) {
  const startKey = normalizeDateKey(order.startDate || order.dueDate);
  const endKey = normalizeDateKey(order.completedDate || order.dueDate);
  if (!startKey || !endKey) return null;
  return startKey <= endKey ? { startKey, endKey } : { startKey: endKey, endKey: startKey };
}

function buildTimelineBarLabel(order, span = 1) {
  const project = String(order.projectName || "未命名").trim() || "未命名";
  const stage = String(order.productionStage || "").trim();
  if (span >= 5) return stage ? `${project}（${stage}）` : project;
  if (span >= 3) return stage ? `${project} · ${stage}` : project;
  return project;
}

function resolveTimelineFocusDate(segment) {
  const due = normalizeDateKey(segment.order.dueDate);
  if (due && due >= segment.segmentStartKey && due <= segment.segmentEndKey) return due;
  const start = normalizeDateKey(segment.order.startDate);
  if (start && start >= segment.segmentStartKey && start <= segment.segmentEndKey) return start;
  return segment.segmentStartKey;
}

function getOrderCalendarColor(order) {
  return order?.calendarColor || getSourceColor(order?.source);
}

function getTimelineBarPalette(color) {
  const normalized = normalizeHexColor(color, "#9ba6ab");
  const rgb = hexToRgb(normalized);
  return {
    background: rgbToRgba(rgb, 0.2),
    border: rgbToRgba(rgb, 0.5),
    text: "#1f242b",
  };
}

function parseDateKey(value) {
  const safe = normalizeDateKey(value);
  return safe ? new Date(`${safe}T00:00:00`) : null;
}

function daysBetweenDateKeys(startKey, endKey) {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  if (!start || !end) return null;
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function maxDateKey(left, right) {
  const safeLeft = normalizeDateKey(left);
  const safeRight = normalizeDateKey(right);
  if (!safeLeft) return safeRight;
  if (!safeRight) return safeLeft;
  return safeLeft > safeRight ? safeLeft : safeRight;
}

function minDateKey(left, right) {
  const safeLeft = normalizeDateKey(left);
  const safeRight = normalizeDateKey(right);
  if (!safeLeft) return safeRight;
  if (!safeRight) return safeLeft;
  return safeLeft < safeRight ? safeLeft : safeRight;
}

function formatWeekLabel(dateKey) {
  const date = parseDateKey(dateKey);
  return date ? `${date.getMonth() + 1}/${date.getDate()}` : "";
}

function formatCalendarDialogDate(dateKey) {
  const date = parseDateKey(dateKey);
  if (!date) return "未选日期";
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${date.getMonth() + 1}月${date.getDate()}日 · ${weekdays[date.getDay()]}`;
}

function normalizeHexColor(value, fallback = "#9ba6ab") {
  const text = String(value || "").trim();
  if (/^#([0-9a-f]{6})$/i.test(text)) return text;
  return fallback;
}

function hexToRgb(value) {
  const safe = normalizeHexColor(value).slice(1);
  return {
    r: Number.parseInt(safe.slice(0, 2), 16),
    g: Number.parseInt(safe.slice(2, 4), 16),
    b: Number.parseInt(safe.slice(4, 6), 16),
  };
}

function rgbToRgba(rgb, alpha) {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function beginTimelineCreateRange(event) {
  if (state.tab !== "calendar" || state.calendarMode !== CALENDAR_MODE_TIMELINE) return;
  if (event.button !== 0) return;
  if (event.target.closest("[data-timeline-bar]")) return;
  const track = event.currentTarget;
  const hit = getTimelineTrackDateHit(track, event.clientX);
  if (!hit) return;
  timelineCreateRangeSession = {
    pointerId: event.pointerId,
    track,
    startX: event.clientX,
    startCol: hit.col,
    endCol: hit.col,
    startDate: hit.dateKey,
    endDate: hit.dateKey,
    moved: false,
  };
  clearTimelineCreateRangePreview(track);
  track.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

function beginTimelineMove(event) {
  if (state.tab !== "calendar" || state.calendarMode !== CALENDAR_MODE_TIMELINE) return;
  if (event.button !== 0) return;
  const bar = event.currentTarget;
  const orderId = String(bar?.dataset?.timelineOrderId || "");
  const target = state.orders.find((item) => item.id === orderId);
  if (!target || isClosed(target)) return;
  const displayRange = getTimelineDisplayRange(target);
  const track = bar.closest("[data-timeline-track]");
  if (!track || !displayRange) return;
  const trackRect = track.getBoundingClientRect();
  if (!trackRect.width) return;

  timelineMoveSession = {
    pointerId: event.pointerId,
    bar,
    track,
    orderId,
    startX: event.clientX,
    colWidth: trackRect.width / 7,
    trackWidth: trackRect.width,
    initialLeft: bar.offsetLeft,
    baseStartDate: normalizeDateKey(target.startDate),
    baseDueDate: normalizeDateKey(target.dueDate),
    baseCompletedDate: normalizeDateKey(target.completedDate),
    baseSelectedDate: normalizeDateKey(state.selectedCalendarDate),
    dayDelta: 0,
    moved: false,
  };

  event.preventDefault();
}

function handleTimelineCreateRangeMove(event) {
  if (!timelineCreateRangeSession || event.pointerId !== timelineCreateRangeSession.pointerId) return;
  const hit = getTimelineTrackDateHit(timelineCreateRangeSession.track, event.clientX);
  if (!hit) return;
  timelineCreateRangeSession.endCol = hit.col;
  timelineCreateRangeSession.endDate = hit.dateKey;
  if (!timelineCreateRangeSession.moved) {
    if (Math.abs(event.clientX - timelineCreateRangeSession.startX) < TIMELINE_CREATE_THRESHOLD_PX) return;
    timelineCreateRangeSession.moved = true;
    timelineCreateRangeSession.track.classList.add("is-dragging");
  }
  renderTimelineCreateRangePreview(timelineCreateRangeSession);
}

function handleTimelineCreateRangeEnd(event) {
  if (!timelineCreateRangeSession || event.pointerId !== timelineCreateRangeSession.pointerId) return;
  const session = timelineCreateRangeSession;
  timelineCreateRangeSession = null;
  session.track.classList.remove("is-dragging");
  session.track.releasePointerCapture?.(event.pointerId);
  clearTimelineCreateRangePreview(session.track);

  if (!session.moved) {
    state.selectedCalendarDate = session.startDate;
    render();
    return;
  }

  const startDate = minDateKey(session.startDate, session.endDate);
  const dueDate = maxDateKey(session.startDate, session.endDate);
  openCreateWithDateContext(startDate, dueDate, `已按 ${formatCalendarShortDate(startDate)} - ${formatCalendarShortDate(dueDate)} 预填排期。`);
}

function handleTimelineCreateRangeCancel(event) {
  if (!timelineCreateRangeSession || event.pointerId !== timelineCreateRangeSession.pointerId) return;
  const session = timelineCreateRangeSession;
  timelineCreateRangeSession = null;
  session.track.classList.remove("is-dragging");
  clearTimelineCreateRangePreview(session.track);
}

function handleTimelineMoveDrag(event) {
  if (!timelineMoveSession || event.pointerId !== timelineMoveSession.pointerId) return;
  const session = timelineMoveSession;
  const deltaPx = event.clientX - session.startX;
  const deltaDays = Math.round(deltaPx / session.colWidth);
  session.dayDelta = deltaDays;

  if (!session.moved) {
    if (Math.abs(deltaPx) < TIMELINE_MOVE_THRESHOLD_PX) return;
    session.moved = true;
    session.bar.classList.add("is-dragging");
    session.track.classList.add("is-dragging-bar");
    session.bar.setPointerCapture?.(session.pointerId);
  }

  const clamped = Math.max(-session.trackWidth, Math.min(session.trackWidth, deltaDays * session.colWidth));
  session.bar.style.transform = `translateX(${clamped}px)`;
}

function handleTimelineMoveEnd(event) {
  if (!timelineMoveSession || event.pointerId !== timelineMoveSession.pointerId) return;
  const session = timelineMoveSession;
  timelineMoveSession = null;

  session.bar.classList.remove("is-dragging");
  session.track.classList.remove("is-dragging-bar");
  session.bar.style.transform = "";
  session.bar.releasePointerCapture?.(event.pointerId);

  if (!session.moved) return;
  timelineDragSuppressClickUntil = Date.now() + TIMELINE_DRAG_CLICK_SUPPRESS_MS;
  if (!session.dayDelta) return;

  void persistTimelineMove(session.orderId, session.dayDelta, {
    selectedDate: session.baseSelectedDate,
    completedDate: session.baseCompletedDate,
  });
}

function handleTimelineMoveCancel(event) {
  if (!timelineMoveSession || event.pointerId !== timelineMoveSession.pointerId) return;
  const session = timelineMoveSession;
  timelineMoveSession = null;
  session.bar.classList.remove("is-dragging");
  session.track.classList.remove("is-dragging-bar");
  session.bar.style.transform = "";
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

function renderTimelineCreateRangePreview(session) {
  const track = session.track;
  const preview = ensureTimelineCreateRangePreview(track);
  const startCol = Math.min(session.startCol, session.endCol);
  const endCol = Math.max(session.startCol, session.endCol);
  preview.hidden = false;
  preview.style.left = `${(startCol / 7) * 100}%`;
  preview.style.width = `${((endCol - startCol + 1) / 7) * 100}%`;
}

function ensureTimelineCreateRangePreview(track) {
  let preview = track.querySelector(".mobile-timeline-preview");
  if (!preview) {
    preview = document.createElement("div");
    preview.className = "mobile-timeline-preview";
    preview.hidden = true;
    track.append(preview);
  }
  return preview;
}

function clearTimelineCreateRangePreview(track) {
  if (!track) return;
  track.querySelector(".mobile-timeline-preview")?.remove();
}

function openCreateWithDateContext(startDate, dueDate, note = "") {
  if (state.editingOrderId) {
    state.createDraft = buildCreateDraft();
  }
  state.editingOrderId = "";
  state.confirmDeleteOrderId = "";
  updateCreateDraft({
    startDate: normalizeDateKey(startDate) || state.createDraft.startDate,
    dueDate: normalizeDateKey(dueDate) || state.createDraft.dueDate,
    completedDate: "",
  });
  state.selectedCalendarDate = normalizeDateKey(startDate) || state.selectedCalendarDate;
  state.createContextNote = note;
  state.tab = "create";
  render();
}

function resetCreateComposer() {
  state.editingOrderId = "";
  state.confirmDeleteOrderId = "";
  state.createDraft = buildCreateDraft();
  state.createContextNote = "";
  state.createFeedbackMessage = "";
  state.createFeedbackTone = "";
}

async function saveCreateOrder() {
  const projectName = String(state.createDraft.projectName || "").trim();
  const clientName = String(state.createDraft.clientName || "").trim();
  const dueDate = normalizeDateKey(state.createDraft.dueDate);
  const editingOrder = state.editingOrderId ? state.orders.find((order) => order.id === state.editingOrderId) : null;

  if (!projectName || !clientName || !dueDate) {
    state.createFeedbackTone = "error";
    state.createFeedbackMessage = "项目名、客户 / 老板 ID 和截稿日期是必填项。";
    render();
    return;
  }

  const previousStage = editingOrder ? editingOrder.productionStage : "";
  const nextStage = state.createDraft.productionStage || "";
  const currentTimeline = editingOrder ? editingOrder.stageTimeline : {};
  const stageTimeline = previousStage !== nextStage || !editingOrder
    ? recordStageTimestamp(currentTimeline, previousStage, nextStage)
    : currentTimeline;

  const order = normalizeOrder(
    {
      ...(editingOrder || {}),
      ...state.createDraft,
      ...(editingOrder ? { id: editingOrder.id } : {}),
      projectName,
      clientName,
      dueDate,
      paymentStatus: state.createDraft.paymentStatus,
      stageTimeline,
    },
    { fxSettings: state.fxSettings },
  );
  const nextOrders = editingOrder
    ? state.orders.map((item) => (item.id === editingOrder.id ? order : item))
    : [...state.orders, order];
  persistLocalOrders(nextOrders, state.fxSettings);
  saveLastTemplate(order);
  let cloudSaved = false;
  let presetCloudError = null;
  let cloudError = null;
  try {
    await ensureBusinessPresetExists(order.businessType);
  } catch (error) {
    presetCloudError = error;
  }
  try {
    cloudSaved = await syncOrdersAfterLocalChange(nextOrders, [order]);
  } catch (error) {
    cloudError = error;
  }
  state.editingOrderId = "";
  state.confirmDeleteOrderId = "";
  refreshLocalData();
  state.createDraft = buildDraftFromSeed(order);
  state.createContextNote = "";
  state.createFeedbackTone = cloudError || presetCloudError ? "error" : "success";
  state.createFeedbackMessage = cloudError
    ? `已${editingOrder ? "更新" : "保存"}到本地，但云端同步失败：${mapAuthError(cloudError)}`
    : presetCloudError
      ? `稿件已${editingOrder ? "更新" : "保存"}，但常用业务云端同步失败：${mapAuthError(presetCloudError)}`
    : cloudSaved
      ? `已${editingOrder ? "更新" : "保存"}稿件：${order.projectName}，并同步到云端。`
      : isCloudModeEnabled() && !hasSignedInUser()
        ? `已${editingOrder ? "更新" : "保存"}稿件：${order.projectName}。登录后会继续同步到云端。`
        : `已${editingOrder ? "更新" : "保存"}稿件：${order.projectName}。`;
  state.selectedCalendarDate = normalizeDateKey(order.dueDate || order.startDate) || state.selectedCalendarDate;
  render();
}

async function saveWorkHours() {
  const order = state.orders.find((item) => item.id === state.workHoursEditorOrderId);
  if (!order) return;
  const nextHours = sanitizeWorkHours(state.workHoursEditorValue);
  const updated = normalizeOrder(
    { ...order, workHours: nextHours },
    { fxSettings: state.fxSettings },
  );
  const nextOrders = state.orders.map((item) => (item.id === updated.id ? updated : item));
  persistLocalOrders(nextOrders, state.fxSettings);
  try {
    await syncOrdersAfterLocalChange(nextOrders, [updated]);
  } catch (_) {
    // silent — local is already saved
  }
  closeActiveSheet();
  state.workHoursEditorOrderId = "";
  state.workHoursEditorValue = "";
  refreshLocalData();
  render();
}

async function deleteOrderMobile(id) {
  const target = state.orders.find((order) => order.id === id);
  if (!target) return;

  const nextOrders = state.orders.filter((order) => order.id !== id);
  persistLocalOrders(nextOrders, state.fxSettings);

  let cloudError = null;
  try {
    if (isCloudSyncActive()) {
      await enqueueCloudWrite(async () => {
        const persisted = await replaceRemoteOrders(state.supabase, state.user.id, nextOrders, {
          fxSettings: state.fxSettings,
        });
        state.usingLocalBackup = false;
        persistLocalOrders(persisted, state.fxSettings);
      });
    }
  } catch (error) {
    cloudError = error;
  }

  if (state.editingOrderId === id) {
    resetCreateComposer();
  }
  state.selectedOrderIds.delete(id);
  state.confirmDeleteOrderId = "";
  refreshLocalData();
  setOrdersFeedback(
    cloudError
      ? `稿件已从本地删除，但云端同步失败：${mapAuthError(cloudError)}`
      : `已删除稿件：${target.projectName || "未命名稿件"}。`,
    cloudError ? "error" : "success",
  );
  if (state.tab === "settings") {
    setSettingsFeedback(
      cloudError
        ? `稿件已从本地删除，但云端同步失败：${mapAuthError(cloudError)}`
        : `已删除稿件：${target.projectName || "未命名稿件"}。`,
      cloudError ? "error" : "success",
    );
    render();
    return;
  }
  render();
}

async function handleOrderQuickAction(action, id) {
  if (!id || !action) return;
  if (action === "complete") {
    await updateOrdersStatusMobile([id], "已完成", "已完结归档当前稿件。");
    return;
  }
  if (action === "settlePayment") {
    await settleOrdersPaymentMobile([id], "已将当前稿件记为已结清。");
    return;
  }
  if (action === "revertToActive") {
    await revertOrderToActiveMobile(id);
    return;
  }
  if (action === "handled") {
    await updateOrdersStatusMobile([id], "已处理", "已将异常稿件记为已处理。");
  }
}

function openExceptionEditor(id) {
  const order = state.orders.find((item) => item.id === id);
  if (!order || !isAbnormal(order)) return;
  state.activeSheet = SHEET_EXCEPTION;
  state.exceptionEditorOrderId = id;
  state.exceptionEditorHandled = order.status === "已处理";
  state.exceptionEditorResolution = order.exceptionResolution || EXCEPTION_RESOLUTIONS[0] || "";
  state.exceptionEditorRefundAmount = calculateRefundAmount(order) > 0 ? String(calculateRefundAmount(order)) : "";
  state.exceptionEditorNote = order.exceptionNote || "";
  state.exceptionEditorMessage = "";
  render();
}

function closeExceptionEditor() {
  if (state.activeSheet === SHEET_EXCEPTION) {
    state.activeSheet = "";
  }
  state.exceptionEditorOrderId = "";
  state.exceptionEditorHandled = false;
  state.exceptionEditorResolution = EXCEPTION_RESOLUTIONS[0] || "";
  state.exceptionEditorRefundAmount = "";
  state.exceptionEditorNote = "";
  state.exceptionEditorMessage = "";
}

function resolveClosedTransitionCompletedDate(currentStatus, existingCompletedDate, fallbackDate) {
  if (!isClosed({ status: currentStatus })) {
    return fallbackDate;
  }
  return existingCompletedDate || fallbackDate;
}

async function persistOrderMutation(nextOrders, changedOrders = nextOrders) {
  persistLocalOrders(nextOrders, state.fxSettings);
  let cloudSaved = false;
  let cloudError = null;
  try {
    cloudSaved = await syncOrdersAfterLocalChange(nextOrders, changedOrders);
  } catch (error) {
    cloudError = error;
  }
  refreshLocalData();
  return { cloudSaved, cloudError };
}

function composeOrderSyncFeedback(successMessage, cloudSaved, cloudError) {
  if (cloudError) {
    return `${successMessage} 但云端同步失败：${mapAuthError(cloudError)}`;
  }
  if (cloudSaved) {
    return `${successMessage} 并同步到云端。`;
  }
  if (isCloudModeEnabled() && !hasSignedInUser()) {
    return `${successMessage} 登录后会继续同步到云端。`;
  }
  return successMessage;
}

async function applyBatchStatusMobile(status) {
  const visibleOrders = getVisibleOrderPool();
  const targetIds = getSelectedVisibleIds(visibleOrders);
  if (!targetIds.length) {
    setOrdersFeedback("先选中要批量处理的稿件。", "error");
    render();
    return;
  }
  const targetOrders = visibleOrders.filter((order) => targetIds.includes(order.id));
  if (status === "已完成" && targetOrders.some(isAbnormal)) {
    setOrdersFeedback("选中的稿件里有异常单，请先处理异常后再批量完结归档。", "error");
    render();
    return;
  }
  if (status === "已处理" && targetOrders.some((order) => !isAbnormal(order))) {
    setOrdersFeedback("批量已处理只适用于异常单。", "error");
    render();
    return;
  }

  const successMessage = status === "已完成" ? `已批量完结归档 ${targetIds.length} 条稿件。` : `已批量更新 ${targetIds.length} 条稿件。`;
  const success = await updateOrdersStatusMobile(targetIds, status, successMessage);
  if (success) {
    clearSelection(false);
    render();
  }
}

async function applyBatchSettlePaymentMobile() {
  const visibleOrders = getVisibleOrderPool();
  const targetIds = getSelectedVisibleIds(visibleOrders);
  if (!targetIds.length) {
    setOrdersFeedback("先选中要批量处理的稿件。", "error");
    render();
    return;
  }
  const success = await settleOrdersPaymentMobile(targetIds, `已将 ${targetIds.length} 条稿件记为已结清。`);
  if (success) {
    clearSelection(false);
    render();
  }
}

async function applyBatchExceptionTypeMobile(exceptionType) {
  const visibleOrders = getVisibleOrderPool();
  const targetIds = getSelectedVisibleIds(visibleOrders);
  if (!targetIds.length) {
    setOrdersFeedback("先选中要批量设置异常的稿件。", "error");
    render();
    return;
  }
  if (!EXCEPTION_TYPES.includes(exceptionType) || exceptionType === "无") {
    setOrdersFeedback("先选择要批量设置的异常类型。", "error");
    render();
    return;
  }

  const nextOrders = state.orders.map((item) => {
    if (!targetIds.includes(item.id)) return item;
    const shouldRestoreWorkingState = item.status === "已处理" || DISALLOWED_ABNORMAL_STATUSES.has(item.status);
    return normalizeOrder(
      {
        ...item,
        status: shouldRestoreWorkingState ? item.exceptionPreviousStatus || "进行中" : item.status,
        exceptionType,
        exceptionResolution: "",
        exceptionNote: "",
        refundAmount: 0,
        exceptionPreviousStatus: null,
      },
      { fxSettings: state.fxSettings },
    );
  });

  setBusy(true);
  try {
    const changedOrders = nextOrders.filter((item) => targetIds.includes(item.id));
    const { cloudSaved, cloudError } = await persistOrderMutation(nextOrders, changedOrders);
    clearSelection(false);
    setOrdersFeedback(
      composeOrderSyncFeedback(`已批量设置 ${targetIds.length} 条稿件为「${exceptionType}」。`, cloudSaved, cloudError),
      cloudError ? "error" : "success",
    );
  } finally {
    setBusy(false);
  }
}

async function settleOrdersPaymentMobile(ids, successMessage) {
  if (!ids.length) return false;
  const affectedOrders = state.orders.filter((item) => ids.includes(item.id));
  if (affectedOrders.some(isAbnormal)) {
    setOrdersFeedback("异常单请先完成异常处理，再手动确认是否已结清。", "error");
    render();
    return false;
  }

  const nextOrders = state.orders.map((item) => {
    if (!ids.includes(item.id)) return item;
    return normalizeOrder(
      {
        ...item,
        receivedAmount: calculateGrossAmount(item),
        paymentStatus: "已结清",
      },
      { fxSettings: state.fxSettings },
    );
  });

  setBusy(true);
  try {
    const changedOrders = nextOrders.filter((item) => ids.includes(item.id));
    const { cloudSaved, cloudError } = await persistOrderMutation(nextOrders, changedOrders);
    setOrdersFeedback(composeOrderSyncFeedback(successMessage, cloudSaved, cloudError), cloudError ? "error" : "success");
    return true;
  } finally {
    setBusy(false);
  }
}

async function updateOrdersStatusMobile(ids, status, successMessage) {
  if (!ids.length) return false;
  const affectedOrders = state.orders.filter((item) => ids.includes(item.id));
  if (status === "已完成" && affectedOrders.some(isAbnormal)) {
    setOrdersFeedback("异常单请先完成异常处理，不能直接完结归档。", "error");
    render();
    return false;
  }
  if (status === "已处理" && affectedOrders.some((item) => !isAbnormal(item))) {
    setOrdersFeedback("已处理状态只适用于异常单。", "error");
    render();
    return false;
  }

  const today = formatDateInput(new Date());
  const nextOrders = state.orders.map((item) => {
    if (!ids.includes(item.id)) return item;
    const next = {
      ...item,
      status,
    };
    if (status === "已完成" || status === "已处理") {
      next.completedDate = resolveClosedTransitionCompletedDate(item.status, item.completedDate, today);
    }
    if (status === "已处理") {
      next.exceptionPreviousStatus = item.status === "已处理" ? item.exceptionPreviousStatus || "进行中" : item.status;
    }
    return normalizeOrder(next, { fxSettings: state.fxSettings });
  });

  setBusy(true);
  try {
    const changedOrders = nextOrders.filter((item) => ids.includes(item.id));
    const { cloudSaved, cloudError } = await persistOrderMutation(nextOrders, changedOrders);
    if (state.editingOrderId && ids.includes(state.editingOrderId)) {
      resetCreateComposer();
    }
    setOrdersFeedback(composeOrderSyncFeedback(successMessage, cloudSaved, cloudError), cloudError ? "error" : "success");
    return true;
  } finally {
    setBusy(false);
  }
}

async function revertOrderToActiveMobile(id) {
  const order = state.orders.find((item) => item.id === id);
  if (!order) return;
  if (!isClosed(order) || order.status === "已处理") {
    setOrdersFeedback("只有已完结归档的稿件可以改回进行中。", "error");
    render();
    return;
  }

  const nextOrders = state.orders.map((item) => {
    if (item.id !== id) return item;
    return normalizeOrder(
      {
        ...item,
        status: "进行中",
        completedDate: "",
      },
      { fxSettings: state.fxSettings },
    );
  });

  setBusy(true);
  try {
    const changedOrders = nextOrders.filter((item) => item.id === id);
    const { cloudSaved, cloudError } = await persistOrderMutation(nextOrders, changedOrders);
    if (state.editingOrderId === id) {
      resetCreateComposer();
    }
    setOrdersFeedback(composeOrderSyncFeedback("已改回进行中。", cloudSaved, cloudError), cloudError ? "error" : "success");
  } finally {
    setBusy(false);
  }
}

async function saveExceptionEditor() {
  const order = state.orders.find((item) => item.id === state.exceptionEditorOrderId);
  if (!order || !isAbnormal(order)) return;

  const handled = state.exceptionEditorHandled;
  const resolution = handled ? state.exceptionEditorResolution : "";
  const note = String(state.exceptionEditorNote || "").trim();
  const today = formatDateInput(new Date());
  let refundAmount = 0;

  if (handled && !EXCEPTION_RESOLUTIONS.includes(resolution)) {
    state.exceptionEditorMessage = "标记为已处理时，先选择一个处理结果。";
    render();
    return;
  }

  if (resolution === "协商退全款") {
    refundAmount = normalizeMoneyValue(order.receivedAmount);
  } else if (resolution === "协商退部分款") {
    refundAmount = Number(state.exceptionEditorRefundAmount || 0);
    if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
      state.exceptionEditorMessage = "退部分款时，请填写大于 0 的退款金额。";
      render();
      return;
    }
    if (refundAmount > normalizeMoneyValue(order.receivedAmount)) {
      state.exceptionEditorMessage = "退款金额不能超过当前已收金额。";
      render();
      return;
    }
  }

  const nextOrder = normalizeOrder(
    {
      ...order,
      status: handled ? "已处理" : order.status === "已处理" ? order.exceptionPreviousStatus || "进行中" : order.status,
      completedDate: handled ? resolveClosedTransitionCompletedDate(order.status, order.completedDate, today) : order.completedDate,
      exceptionResolution: handled ? resolution : "",
      exceptionNote: note,
      refundAmount: handled ? refundAmount : 0,
      exceptionPreviousStatus: handled ? (order.status === "已处理" ? order.exceptionPreviousStatus || "进行中" : order.status) : null,
    },
    { fxSettings: state.fxSettings },
  );

  const nextOrders = state.orders.map((item) => (item.id === order.id ? nextOrder : item));
  setBusy(true);
  try {
    const { cloudSaved, cloudError } = await persistOrderMutation(nextOrders, [nextOrder]);
    closeExceptionEditor();
    setOrdersFeedback(composeOrderSyncFeedback("异常处理已保存。", cloudSaved, cloudError), cloudError ? "error" : "success");
    render();
  } finally {
    setBusy(false);
  }
}

async function exportMobileJson() {
  const content = JSON.stringify(state.orders, null, 2);
  const fileName = buildExportFileName("json");
  const shared = await shareTextFile(content, fileName, "application/json");
  if (!shared) {
    downloadTextFile(content, fileName, "application/json");
  }
  setSettingsFeedback(`已准备 ${fileName}。${shared ? "系统分享面板已打开。" : "已触发浏览器下载。"} `);
  if (state.tab === "settings") render();
}

async function exportMobileCsv() {
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

  const rows = state.orders.map((item) => [
    item.projectName,
    item.clientName,
    item.businessType,
    item.productionStage,
    getSourceLabel(item.source),
    normalizeUsageType(item.usageType),
    formatRatePercent(item.usageRate),
    normalizeCurrency(item.currency),
    item.fxRateSnapshot ?? "",
    getFeeModeLabel(normalizeFeeMode(item.feeMode)),
    formatRatePercent(item.feeRate),
    item.priority,
    normalizeMoneyValue(item.amount),
    calculateUsageSurcharge(item),
    calculateGrossAmount(item),
    calculateRefundAmount(item),
    calculateEffectiveAmount(item),
    calculateAdjustedNetAmount(item),
    normalizeMoneyValue(item.receivedAmount),
    calculateEffectiveReceived(item),
    calculateGrossAmountCny(item, state.fxSettings),
    convertMoneyToCny(calculateRefundAmount(item), item, state.fxSettings),
    calculateEffectiveAmountCny(item, state.fxSettings),
    calculateAdjustedNetAmountCny(item, state.fxSettings),
    convertMoneyToCny(normalizeMoneyValue(item.receivedAmount), item, state.fxSettings),
    calculateEffectiveReceivedCny(item, state.fxSettings),
    normalizePaymentStatus(item),
    item.startDate,
    item.dueDate,
    item.completedDate,
    item.calendarColor,
    formatHours(item.workHours),
    formatHourlyRate(calculateHourlyRate(item, state.fxSettings)),
    item.status,
    item.exceptionType,
    item.exceptionResolution,
    item.exceptionNote,
    item.notes,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");
  const fileName = buildExportFileName("csv");
  const shared = await shareTextFile(csv, fileName, "text/csv");
  if (!shared) {
    downloadTextFile(csv, fileName, "text/csv");
  }
  setSettingsFeedback(`已准备 ${fileName}。${shared ? "系统分享面板已打开。" : "已触发浏览器下载。"} `);
  if (state.tab === "settings") render();
}

function triggerMobileImportJson() {
  importJsonInput?.click();
}

function importMobileJson(event) {
  const [file] = event.target.files || [];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) {
        throw new Error("导入文件格式不对。");
      }

      const valid = parsed
        .filter(isValidImportedOrder)
        .map((record) => normalizeOrder(record, { fxSettings: state.fxSettings }));

      if (!valid.length) {
        throw new Error("导入的记录全部不合法，请检查项目名、客户、业务分类和日期字段。");
      }

      persistLocalOrders(valid, state.fxSettings);
      let cloudSaved = false;
      if (isCloudSyncActive()) {
        await enqueueCloudWrite(async () => {
          const persisted = await replaceRemoteOrders(state.supabase, state.user.id, valid, {
            fxSettings: state.fxSettings,
          });
          state.usingLocalBackup = false;
          persistLocalOrders(persisted, state.fxSettings);
        });
        cloudSaved = true;
      }
      refreshLocalData();
      setSettingsFeedback(
        valid.length < parsed.length
          ? `已过滤 ${parsed.length - valid.length} 条不合法记录，导入 ${valid.length} 条。${cloudSaved ? " 云端也已覆盖。" : ""}`
          : `已导入 ${valid.length} 条稿件。${cloudSaved ? " 云端也已覆盖。" : ""}`,
      );
      render();
    } catch (error) {
      setSettingsFeedback(error.message || "导入失败，请确认文件是本工具导出的 JSON。", "error");
      render();
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

async function persistTimelineMove(orderId, deltaDays, context = {}) {
  const numericDelta = Number(deltaDays || 0);
  if (!numericDelta) return;

  let changed = false;
  const nextOrders = state.orders.map((item) => {
    if (!item || typeof item !== "object" || item.id !== orderId) return item;
    changed = true;
    return normalizeOrder(shiftOrderScheduleDates(item, numericDelta), { fxSettings: state.fxSettings });
  });
  if (!changed) return;

  persistLocalOrders(nextOrders, state.fxSettings);
  try {
    await syncOrdersAfterLocalChange(nextOrders, nextOrders.filter((item) => item.id === orderId));
  } catch (error) {
    setSettingsFeedback(`排期已更新到本地，但云端同步失败：${mapAuthError(error)}`, "error");
  }
  refreshLocalData();

  const nextSelected = normalizeDateKey(context.selectedDate)
    ? addDaysToDateKey(context.selectedDate, numericDelta)
    : state.selectedCalendarDate;
  state.selectedCalendarDate = normalizeDateKey(nextSelected) || state.selectedCalendarDate;
  render();
}

function shiftOrderScheduleDates(order, deltaDays) {
  const next = {
    ...order,
    startDate: shiftDateField(order.startDate, deltaDays),
    dueDate: shiftDateField(order.dueDate, deltaDays),
    completedDate: shiftDateField(order.completedDate, deltaDays),
  };
  if (order.stageTimeline && typeof order.stageTimeline === "object" && !Array.isArray(order.stageTimeline)) {
    next.stageTimeline = Object.fromEntries(
      Object.entries(order.stageTimeline).map(([stage, dateValue]) => [stage, shiftDateField(dateValue, deltaDays)]),
    );
  }
  return next;
}

function shiftDateField(value, deltaDays) {
  const safe = normalizeDateKey(value);
  if (!safe) return value || "";
  return addDaysToDateKey(safe, deltaDays);
}

function addDaysToDateKey(dateKey, days) {
  const date = parseDateKey(dateKey);
  if (!date) return "";
  date.setDate(date.getDate() + Number(days || 0));
  return formatDateInput(date);
}

function formatCalendarShortDate(dateKey) {
  const date = parseDateKey(dateKey);
  return date ? `${date.getMonth() + 1}/${date.getDate()}` : "";
}

function normalizeBusinessPresetList(list) {
  const seen = new Set();
  const normalizedList = [];
  (list || []).forEach((item) => {
    const normalized = normalizeBusinessTypeValue(item);
    if (!normalized || BUILT_IN_BUSINESS_TYPES.includes(normalized) || seen.has(normalized)) return;
    seen.add(normalized);
    normalizedList.push(normalized);
  });
  return normalizedList;
}

function normalizeBusinessTemplate(input = {}, fxSettings = state.fxSettings) {
  if (!input || typeof input !== "object") return null;
  const businessType = normalizeBusinessTypeValue(input.businessType);
  if (!businessType) return null;
  const normalizedOrder = normalizeOrder(
    {
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
      calendarColor: input.calendarColor,
    },
    { fxSettings },
  );

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
    calendarColor: normalizedOrder.calendarColor || getSourceColor(normalizedOrder.source),
    updatedAt: normalizeIsoTimestamp(input.updatedAt),
  };
}

function normalizeBusinessTemplateMap(input = {}, fxSettings = state.fxSettings) {
  const sourceEntries = Array.isArray(input) ? input : Object.values(input || {});
  return sourceEntries.reduce((accumulator, item) => {
    const normalized = normalizeBusinessTemplate(item, fxSettings);
    if (!normalized) return accumulator;
    accumulator[normalized.businessType] = normalized;
    return accumulator;
  }, {});
}

function getBusinessTemplate(value) {
  const normalized = normalizeBusinessTypeValue(value);
  return normalized ? state.businessTemplates[normalized] || null : null;
}

function hasBusinessTemplate(value) {
  return Boolean(getBusinessTemplate(value));
}

function getBusinessTemplateList() {
  return Object.values(state.businessTemplates || {}).sort((left, right) => {
    return getSettingsTimestamp(right.updatedAt) - getSettingsTimestamp(left.updatedAt);
  });
}

function getLatestTemplate() {
  return getBusinessTemplateList()[0] || null;
}

function buildBusinessTemplateFromDraft(draft, displayName = "") {
  return normalizeBusinessTemplate(
    {
      projectName: displayName || draft.projectName || `${draft.businessType}标准单`,
      businessType: draft.businessType,
      productionStage: draft.productionStage,
      source: draft.source,
      feeMode: draft.feeMode,
      feeRate: draft.feeRate,
      usageType: draft.usageType,
      usageRate: draft.usageRate,
      currency: draft.currency,
      priority: draft.priority,
      amount: draft.amount,
      receivedAmount: draft.receivedAmount,
      paymentStatus: draft.paymentStatus,
      workHours: draft.workHours,
      status: draft.status,
      exceptionType: draft.exceptionType,
      notes: draft.notes,
      calendarColor: draft.calendarColor,
      updatedAt: new Date().toISOString(),
    },
    state.fxSettings,
  );
}

function buildDefaultTemplateName() {
  const existing = getBusinessTemplate(state.createDraft.businessType);
  return existing?.projectName || state.createDraft.projectName || `${state.createDraft.businessType}标准单`;
}

function getTemplateDisplayName(template) {
  return template.projectName || `${template.businessType}模板`;
}

function getRepeatSource() {
  return state.lastTemplate || state.orders.at(-1) || null;
}

function buildEditableDraft(seed = {}) {
  const normalized = normalizeOrder(seed, { fxSettings: state.fxSettings });
  return {
    ...normalized,
    projectName: normalized.projectName || "",
    clientName: normalized.clientName || "",
    businessType: normalized.businessType || BUILT_IN_BUSINESS_TYPES[0],
    source: normalized.source || SOURCES[0],
    feeMode: normalized.feeMode || suggestFeeMode(normalized.source),
    feeRate: normalized.feeRate ?? getDefaultFeeRate(normalized.source, normalized.feeMode),
    priority: normalized.priority || PRIORITIES[0],
    usageType: normalized.usageType || USAGE_TYPES[0],
    usageRate: normalized.usageRate || 0,
    currency: normalized.currency || CURRENCY_OPTIONS[0].value,
    amount: normalized.amount,
    receivedAmount: normalized.receivedAmount,
    paymentStatus: normalizePaymentStatus(normalized),
    startDate: normalized.startDate || formatDateInput(new Date()),
    dueDate: normalized.dueDate || "",
    completedDate: normalized.completedDate || "",
    workHours: normalized.workHours || 0,
    calendarColor: normalized.calendarColor || getSourceColor(normalized.source),
    status: normalized.status || "进行中",
    productionStage: normalized.productionStage || BUILT_IN_PRODUCTION_STAGES[0],
    exceptionType: normalized.exceptionType || EXCEPTION_TYPES[0],
    notes: normalized.notes || "",
  };
}

function buildDraftFromSeed(seed = {}) {
  const normalized = normalizeOrder(seed, { fxSettings: state.fxSettings });
  return {
    ...state.createDraft,
    projectName: "",
    clientName: "",
    businessType: normalized.businessType,
    source: normalized.source,
    feeMode: normalized.feeMode,
    feeRate: normalized.feeRate,
    priority: normalized.priority,
    usageType: normalized.usageType,
    usageRate: normalized.usageRate,
    currency: normalized.currency,
    amount: normalized.amount,
    receivedAmount: 0,
    paymentStatus: PAYMENT_STATUSES[0],
    startDate: formatDateInput(new Date()),
    dueDate: "",
    completedDate: "",
    workHours: normalized.workHours,
    calendarColor: normalized.calendarColor || getSourceColor(normalized.source),
    status: normalized.status || "进行中",
    productionStage: normalized.productionStage || BUILT_IN_PRODUCTION_STAGES[0],
    exceptionType: EXCEPTION_TYPES[0],
    notes: normalized.notes || "",
  };
}

function buildDuplicateDraft(source = {}) {
  const normalized = normalizeOrder(source, { fxSettings: state.fxSettings });
  return {
    ...buildEditableDraft(normalized),
    projectName: normalized.projectName || "",
    clientName: normalized.clientName || "",
    receivedAmount: 0,
    paymentStatus: PAYMENT_STATUSES[0],
    dueDate: "",
    completedDate: "",
    workHours: 0,
    status: STATUSES[0],
    exceptionType: EXCEPTION_TYPES[0],
    exceptionResolution: "",
    exceptionNote: "",
    refundAmount: 0,
    exceptionPreviousStatus: null,
  };
}

function applyBusinessTemplateToDraft(template) {
  const normalized = normalizeBusinessTemplate(template, state.fxSettings);
  if (!normalized) return;
  state.editingOrderId = "";
  state.createDraft = buildDraftFromSeed(normalized);
  state.createContextNote = "";
  closeActiveSheet();
  render();
}

function duplicatePreviousOrder() {
  const source = getRepeatSource();
  if (!source) return;
  state.editingOrderId = "";
  state.createDraft = buildDuplicateDraft(source);
  state.tab = "create";
  state.createContextNote = "已复制上一单，改一下项目名和日期就能继续录。";
  saveLastTemplate(source);
  closeActiveSheet();
  render();
}

function duplicateOrderFromList(id) {
  const source = state.orders.find((order) => order.id === id);
  if (!source) return;
  state.confirmDeleteOrderId = "";
  state.editingOrderId = "";
  state.createDraft = buildDuplicateDraft(source);
  state.createContextNote = `已复制「${source.projectName || source.businessType || "当前稿件"}」，可以直接改项目名、日期或金额。`;
  state.tab = "create";
  saveLastTemplate(source);
  render();
}

function startEditOrder(id) {
  const target = state.orders.find((order) => order.id === id);
  if (!target) return;
  state.confirmDeleteOrderId = "";
  state.editingOrderId = target.id;
  state.createDraft = buildEditableDraft(target);
  state.createContextNote = `正在编辑「${target.projectName || target.businessType || "当前稿件"}」。`;
  state.createFeedbackMessage = "";
  state.createFeedbackTone = "";
  state.tab = "create";
  render();
}

function isValidImportedOrder(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) return false;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (typeof record.projectName !== "string" || !record.projectName.trim()) return false;
  if (typeof record.clientName !== "string" || !record.clientName.trim()) return false;
  if (typeof record.businessType !== "string" || !record.businessType.trim()) return false;
  if (record.productionStage != null && typeof record.productionStage !== "string") return false;
  if (record.amount != null && (!Number.isFinite(Number(record.amount)) || Number(record.amount) < 0)) return false;
  if (record.currency != null && !SUPPORTED_CURRENCIES.includes(record.currency)) return false;

  if (record.fxRateSnapshot != null && record.fxRateSnapshot !== "") {
    const snapshot = Number(record.fxRateSnapshot);
    if (!Number.isFinite(snapshot) || snapshot <= 0) return false;
  }

  if (record.currency === "CNY" && record.fxRateSnapshot != null && Number(record.fxRateSnapshot) > 0) {
    return false;
  }
  if (record.currency && record.currency !== "CNY" && record.fxRateSnapshot != null && Number(record.fxRateSnapshot) <= 0) {
    return false;
  }

  if (record.startDate != null && record.startDate !== "" && !datePattern.test(record.startDate)) return false;
  if (record.dueDate != null && record.dueDate !== "" && !datePattern.test(record.dueDate)) return false;
  if (record.completedDate != null && record.completedDate !== "" && !datePattern.test(record.completedDate)) return false;
  if (record.startDate && record.dueDate && record.startDate > record.dueDate) return false;

  if (record.calendarColor != null && record.calendarColor !== "" && !/^#[0-9a-fA-F]{6}$/.test(String(record.calendarColor))) {
    return false;
  }

  if (record.workHours != null) {
    const workHours = Number(record.workHours);
    if (!Number.isFinite(workHours) || workHours < 0) return false;
  }

  if (record.feeRate != null) {
    const feeRate = Number(record.feeRate);
    if (!Number.isFinite(feeRate) || feeRate < 0 || feeRate > 1) return false;
  }

  if (record.feeMode != null && !FEE_MODES.some((item) => item.value === record.feeMode)) return false;
  if (record.usageType != null && !USAGE_TYPES.includes(record.usageType)) return false;

  if (record.usageRate != null) {
    const usageRate = Number(record.usageRate);
    if (!Number.isFinite(usageRate) || usageRate < 0 || usageRate > 5) return false;
  }

  if (record.exceptionType != null && !EXCEPTION_TYPES.includes(record.exceptionType)) return false;
  if (record.exceptionResolution != null && record.exceptionResolution !== "" && !EXCEPTION_RESOLUTIONS.includes(record.exceptionResolution)) {
    return false;
  }

  if (record.refundAmount != null) {
    const refundAmount = Number(record.refundAmount);
    if (!Number.isFinite(refundAmount) || refundAmount < 0) return false;
    const receivedAmount = Number(record.receivedAmount || 0);
    if (refundAmount > receivedAmount) return false;
  }

  return true;
}

async function saveCurrentTemplate() {
  const template = buildBusinessTemplateFromDraft(state.createDraft, state.templateDraftName.trim());
  if (!template) return;
  persistLocalBusinessTemplates(
    {
      ...state.businessTemplates,
      [template.businessType]: template,
    },
    state.fxSettings,
  );
  try {
    await ensureBusinessPresetExists(template.businessType);
    if (isCloudSyncActive()) {
      await enqueueCloudWrite(async () => {
        const persistedTemplates = await upsertRemoteBusinessTemplates(
          state.supabase,
          state.user.id,
          [template],
          (value) => normalizeBusinessTemplate(value, state.fxSettings),
        );
        persistLocalBusinessTemplates(
          {
            ...state.businessTemplates,
            ...normalizeBusinessTemplateMap(persistedTemplates, state.fxSettings),
          },
          state.fxSettings,
        );
      });
    }
  } catch (error) {
    setSettingsFeedback(`模板已保存在本地，但云端同步失败：${mapAuthError(error)}`, "error");
  }
  state.templateSheetMode = "apply";
  state.templateDraftName = "";
  state.expandedTemplateKey = template.businessType;
  state.confirmDeleteTemplateKey = "";
  render();
}

async function removeBusinessTemplate(value) {
  const normalized = normalizeBusinessTypeValue(value);
  if (!normalized) return;
  const next = { ...state.businessTemplates };
  delete next[normalized];
  persistLocalBusinessTemplates(next, state.fxSettings);
  try {
    if (isCloudSyncActive()) {
      await enqueueCloudWrite(() => deleteRemoteBusinessTemplate(state.supabase, state.user.id, normalized));
    }
  } catch (error) {
    setSettingsFeedback(`模板已从本地删除，但云端同步失败：${mapAuthError(error)}`, "error");
  }
  state.confirmDeleteTemplateKey = "";
  if (state.expandedTemplateKey === normalized) {
    state.expandedTemplateKey = "";
  }
  render();
}

async function ensureBusinessPresetExists(value) {
  const normalized = normalizeBusinessTypeValue(value);
  if (!normalized || BUILT_IN_BUSINESS_TYPES.includes(normalized) || state.customBusinessTypes.includes(normalized)) {
    return false;
  }
  persistLocalBusinessPresets([...state.customBusinessTypes, normalized]);
  if (isCloudSyncActive()) {
    await enqueueCloudWrite(() => upsertRemoteBusinessPresets(state.supabase, state.user.id, [normalized]));
  }
  return true;
}

function getBusinessUsageCount(value) {
  const normalized = normalizeBusinessTypeValue(value);
  return state.orders.filter((order) => normalizeBusinessTypeValue(order.businessType) === normalized).length;
}

async function addBusinessPreset(value) {
  const normalized = normalizeBusinessTypeValue(value);
  if (!normalized) return;
  if (BUILT_IN_BUSINESS_TYPES.includes(normalized) || state.customBusinessTypes.includes(normalized)) {
    state.businessAddOpen = false;
    state.businessDraftName = "";
    render();
    return;
  }
  persistLocalBusinessPresets([...state.customBusinessTypes, normalized]);
  try {
    if (isCloudSyncActive()) {
      await enqueueCloudWrite(() => upsertRemoteBusinessPresets(state.supabase, state.user.id, [normalized]));
    }
  } catch (error) {
    setSettingsFeedback(`业务已保存在本地，但云端同步失败：${mapAuthError(error)}`, "error");
  }
  updateCreateDraft({ businessType: normalized });
  state.businessAddOpen = false;
  state.businessDraftName = "";
  render();
}

function startBusinessEdit(value) {
  const normalized = normalizeBusinessTypeValue(value);
  if (!normalized) return;
  state.businessEditingValue = normalized;
  state.businessEditingDraft = normalized;
  render();
}

async function renameBusinessPreset(value) {
  const original = normalizeBusinessTypeValue(value);
  const renamed = normalizeBusinessTypeValue(state.businessEditingDraft);
  if (!original || !renamed) return;
  const hadTemplate = Boolean(state.businessTemplates[original]);
  const nextCustomTypes = normalizeBusinessPresetList(
    state.customBusinessTypes.map((item) => (item === original ? renamed : item)),
  );
  persistLocalBusinessPresets(nextCustomTypes);

  let nextTemplates = state.businessTemplates;
  if (state.businessTemplates[original] && original !== renamed) {
    nextTemplates = { ...state.businessTemplates };
    nextTemplates[renamed] = normalizeBusinessTemplate(
      {
        ...nextTemplates[original],
        businessType: renamed,
      },
      state.fxSettings,
    );
    delete nextTemplates[original];
    persistLocalBusinessTemplates(nextTemplates, state.fxSettings);
  }

  try {
    if (isCloudSyncActive() && original !== renamed) {
      await enqueueCloudWrite(async () => {
        await deleteRemoteBusinessPreset(state.supabase, state.user.id, original);
        await upsertRemoteBusinessPresets(state.supabase, state.user.id, [renamed]);
        if (hadTemplate) {
          await deleteRemoteBusinessTemplate(state.supabase, state.user.id, original);
          await upsertRemoteBusinessTemplates(
            state.supabase,
            state.user.id,
            [nextTemplates[renamed]],
            (item) => normalizeBusinessTemplate(item, state.fxSettings),
          );
        }
      });
    }
  } catch (error) {
    setSettingsFeedback(`业务名称已改到本地，但云端同步失败：${mapAuthError(error)}`, "error");
  }

  if (state.createDraft.businessType === original) {
    updateCreateDraft({ businessType: renamed });
  }

  state.businessEditingValue = "";
  state.businessEditingDraft = "";
  render();
}

async function removeBusinessPreset(value) {
  const normalized = normalizeBusinessTypeValue(value);
  if (!normalized) return;
  const hadTemplate = Boolean(state.businessTemplates[normalized]);
  persistLocalBusinessPresets(state.customBusinessTypes.filter((item) => item !== normalized));
  if (state.businessTemplates[normalized]) {
    const nextTemplates = { ...state.businessTemplates };
    delete nextTemplates[normalized];
    persistLocalBusinessTemplates(nextTemplates, state.fxSettings);
  }
  try {
    if (isCloudSyncActive()) {
      await enqueueCloudWrite(async () => {
        await deleteRemoteBusinessPreset(state.supabase, state.user.id, normalized);
        if (hadTemplate) {
          await deleteRemoteBusinessTemplate(state.supabase, state.user.id, normalized);
        }
      });
    }
  } catch (error) {
    setSettingsFeedback(`业务已从本地删除，但云端同步失败：${mapAuthError(error)}`, "error");
  }
  if (state.createDraft.businessType === normalized) {
    updateCreateDraft({ businessType: BUILT_IN_BUSINESS_TYPES[0] });
  }
  render();
}

function closeActiveSheet() {
  closeExceptionEditor();
  state.activeSheet = "";
  state.templateDraftName = "";
  state.expandedTemplateKey = "";
  state.confirmDeleteTemplateKey = "";
  state.businessEditMode = false;
  state.businessAddOpen = false;
  state.businessDraftName = "";
  state.businessEditingValue = "";
  state.businessEditingDraft = "";
  state.workHoursEditorOrderId = "";
  state.workHoursEditorValue = "";
}

function setOrdersFeedback(message, tone = "success") {
  state.ordersFeedbackMessage = String(message || "").trim();
  state.ordersFeedbackTone = tone === "error" ? "error" : "success";
}

function setSettingsFeedback(message, tone = "success") {
  state.settingsFeedbackMessage = String(message || "").trim();
  state.settingsFeedbackTone = tone === "error" ? "error" : "success";
}

function getSettingsTimestamp(value) {
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeIsoTimestamp(value) {
  const parsed = Date.parse(String(value || ""));
  if (!Number.isFinite(parsed)) return new Date().toISOString();
  return new Date(parsed).toISOString();
}

// ─── Client Insight Settings ───

function normalizeVipThreshold(value, fallback = DEFAULT_VIP_THRESHOLD) {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed >= 0) return Math.round(parsed);
  const fallbackParsed = Number(fallback);
  if (Number.isFinite(fallbackParsed) && fallbackParsed >= 0) return Math.round(fallbackParsed);
  return DEFAULT_VIP_THRESHOLD;
}

function normalizeClientInsightSettings(input = {}) {
  return {
    vipThreshold: normalizeVipThreshold(input.vipThreshold, DEFAULT_VIP_THRESHOLD),
    updatedAt: normalizeIsoTimestamp(input.updatedAt),
  };
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

function persistLocalClientInsightSettings(settings) {
  const normalized = normalizeClientInsightSettings(settings);
  state.clientInsightSettings = normalized;
  try {
    window.localStorage.setItem(CLIENT_INSIGHT_SETTINGS_KEY, JSON.stringify(normalized));
  } catch (_error) { /* ignore */ }
}

async function loadRemoteClientInsightSettings() {
  if (!state.supabase || !state.user) return null;
  const { data, error } = await state.supabase
    .from("user_preferences")
    .select("vip_threshold,vip_threshold_updated_at")
    .eq("user_id", state.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return normalizeClientInsightSettings({ vipThreshold: data.vip_threshold, updatedAt: data.vip_threshold_updated_at });
}

async function upsertRemoteClientInsightSettings(settings) {
  const normalized = normalizeClientInsightSettings(settings);
  const { data, error } = await state.supabase
    .from("user_preferences")
    .upsert({ user_id: state.user.id, vip_threshold: normalized.vipThreshold, vip_threshold_updated_at: normalized.updatedAt || new Date().toISOString() }, { onConflict: "user_id" })
    .select("vip_threshold,vip_threshold_updated_at")
    .single();
  if (error) throw error;
  return normalizeClientInsightSettings({ vipThreshold: data.vip_threshold, updatedAt: data.vip_threshold_updated_at });
}

async function syncClientInsightSettingsOnLogin() {
  if (!state.supabase || !state.user) return;
  try {
    const localSettings = normalizeClientInsightSettings(state.clientInsightSettings);
    const remoteSettings = await loadRemoteClientInsightSettings();
    let merged = localSettings;
    let shouldPush = false;
    if (remoteSettings) {
      if (getSettingsTimestamp(remoteSettings.updatedAt) >= getSettingsTimestamp(localSettings.updatedAt)) {
        merged = remoteSettings;
      } else {
        shouldPush = true;
      }
    } else {
      shouldPush = true;
    }
    persistLocalClientInsightSettings(merged);
    if (shouldPush) {
      const persisted = await upsertRemoteClientInsightSettings(merged);
      persistLocalClientInsightSettings(persisted);
    }
  } catch (_error) {
    state.clientInsightSettings = loadLocalClientInsightSettings();
  }
}

async function persistClientInsightSettingsFromUi() {
  const next = normalizeClientInsightSettings({
    ...state.clientInsightSettings,
    updatedAt: new Date().toISOString(),
  });
  persistLocalClientInsightSettings(next);
  render();
  if (state.mode !== "cloud" || !state.user) return;
  state.clientInsightBusy = true;
  try {
    const persisted = await upsertRemoteClientInsightSettings(next);
    persistLocalClientInsightSettings(persisted);
  } catch (error) {
    setSettingsFeedback(`VIP 阈值已保存到本地，但云端同步失败：${mapAuthError(error)}`, "error");
  } finally {
    state.clientInsightBusy = false;
    render();
  }
}

// ─── Calendar Day Marks ───

function normalizeCalendarDayMarkType(value) {
  return CALENDAR_DAY_MARK_TYPES.includes(value) ? value : "";
}

function normalizeCalendarDayMarks(input = {}) {
  const rawMarks =
    input && typeof input.marks === "object" && input.marks && !Array.isArray(input.marks) ? input.marks : input;
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

function loadLocalCalendarDayMarks() {
  try {
    const raw = window.localStorage.getItem(CALENDAR_DAY_MARKS_KEY);
    if (!raw) return normalizeCalendarDayMarks();
    return normalizeCalendarDayMarks(JSON.parse(raw));
  } catch (_error) {
    return normalizeCalendarDayMarks();
  }
}

function persistLocalCalendarDayMarks(settings) {
  const normalized = normalizeCalendarDayMarks(settings);
  state.calendarDayMarks = normalized;
  try {
    window.localStorage.setItem(CALENDAR_DAY_MARKS_KEY, JSON.stringify(normalized));
  } catch (_error) { /* ignore */ }
  return normalized;
}

async function loadRemoteCalendarDayMarks() {
  if (!state.supabase || !state.user) return null;
  const { data, error } = await state.supabase
    .from("user_preferences")
    .select("calendar_day_marks,calendar_day_marks_updated_at")
    .eq("user_id", state.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return normalizeCalendarDayMarks({ marks: data.calendar_day_marks, updatedAt: data.calendar_day_marks_updated_at });
}

async function upsertRemoteCalendarDayMarks(settings) {
  const normalized = normalizeCalendarDayMarks(settings);
  const nextUpdatedAt = normalized.updatedAt || new Date().toISOString();
  const { data, error } = await state.supabase
    .from("user_preferences")
    .upsert(
      { user_id: state.user.id, calendar_day_marks: normalized.marks, calendar_day_marks_updated_at: nextUpdatedAt },
      { onConflict: "user_id" },
    )
    .select("calendar_day_marks,calendar_day_marks_updated_at")
    .single();
  if (error) throw error;
  return normalizeCalendarDayMarks({ marks: data.calendar_day_marks, updatedAt: data.calendar_day_marks_updated_at || nextUpdatedAt });
}

async function syncCalendarDayMarksOnLogin() {
  if (!state.supabase || !state.user) return;
  try {
    const localSettings = normalizeCalendarDayMarks(state.calendarDayMarks);
    const remoteSettings = await loadRemoteCalendarDayMarks();
    let merged = localSettings;
    let shouldPush = false;
    if (remoteSettings) {
      if (getSettingsTimestamp(remoteSettings.updatedAt) >= getSettingsTimestamp(localSettings.updatedAt)) {
        merged = remoteSettings;
      } else {
        shouldPush = true;
      }
    } else {
      shouldPush = true;
    }
    persistLocalCalendarDayMarks(merged);
    if (shouldPush) {
      const persisted = await upsertRemoteCalendarDayMarks(merged);
      persistLocalCalendarDayMarks(persisted);
    }
  } catch (_error) {
    state.calendarDayMarks = loadLocalCalendarDayMarks();
  }
}

function getCalendarDayMarkType(dateKey) {
  const safeDate = normalizeDateKey(dateKey);
  return normalizeCalendarDayMarkType(state.calendarDayMarks?.marks?.[safeDate]);
}

async function persistCalendarDayMark(dateKey, nextType) {
  const safeDate = normalizeDateKey(dateKey);
  if (!safeDate) return;
  const normalizedType = normalizeCalendarDayMarkType(nextType);
  const currentType = getCalendarDayMarkType(safeDate);
  if (currentType === normalizedType) return;

  const nextMarks = { ...normalizeCalendarDayMarks(state.calendarDayMarks).marks };
  if (normalizedType) {
    nextMarks[safeDate] = normalizedType;
  } else {
    delete nextMarks[safeDate];
  }

  const nextSettings = normalizeCalendarDayMarks({ marks: nextMarks, updatedAt: new Date().toISOString() });
  persistLocalCalendarDayMarks(nextSettings);
  render();

  if (state.mode !== "cloud" || !state.user) return;
  state.calendarDayMarksBusy = true;
  try {
    const persisted = await upsertRemoteCalendarDayMarks(nextSettings);
    persistLocalCalendarDayMarks(persisted);
  } catch (_error) { /* silent */ }
  finally {
    state.calendarDayMarksBusy = false;
    render();
  }
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
  if (lowerMessage.includes("refresh token")) {
    return {
      kind: "refresh_token",
      retryAfterSeconds: 0,
      message: "登录状态已失效，请重新登录。",
    };
  }
  if (lowerMessage.includes("network") || lowerMessage.includes("failed to fetch")) {
    return {
      kind: "network",
      retryAfterSeconds: 0,
      message: "网络请求失败，请检查网络后重试。",
    };
  }
  if (lowerMessage.includes("captcha") || lowerMessage.includes("turnstile")) {
    return {
      kind: "captcha",
      retryAfterSeconds: 0,
      message: "人机验证失败，请重新完成验证后再试；如果持续失败，请点击“重试人机验证”或更换浏览器、网络后重试。",
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
    setSettingsFeedback(getAuthRateLimitMessage(action, retryAfterSeconds), "error");
    return;
  }
  setSettingsFeedback(normalizedError.message, "error");
}

function parseRetryAfterSeconds(message) {
  const secondMatch = String(message || "").match(/after\s+(\d+)\s+seconds?/i);
  if (secondMatch) {
    return Number(secondMatch[1]);
  }
  const minuteMatch = String(message || "").match(/after\s+(\d+)\s+minutes?/i);
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
  } catch {}
}

function pruneExpiredAuthCooldowns(cooldowns) {
  const now = Date.now();
  return Object.fromEntries(Object.entries(cooldowns || {}).filter(([, endsAt]) => Number(endsAt) > now));
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
  render();
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
      render();
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

function getStatusDotColor(status) {
  switch (status) {
    case "待沟通": return "#a8a29e";
    case "排期中": return "#78716c";
    case "进行中": return "#2563eb";
    case "待交付": return "#d97706";
    case "已完成": return "#2f9b74";
    case "已处理": return "#6b7280";
    default:      return "#78716c";
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}

function buildExportFileName(extension) {
  const stamp = formatDateInput(new Date());
  return `artist-commission-desk-${stamp}.${extension}`;
}

async function shareTextFile(content, fileName, contentType) {
  try {
    if (!navigator.share || typeof File === "undefined") return false;
    const file = new File([content], fileName, { type: contentType });
    if (navigator.canShare && !navigator.canShare({ files: [file] })) return false;
    await navigator.share({ files: [file], title: fileName });
    return true;
  } catch (_error) {
    return false;
  }
}

function downloadTextFile(content, fileName, contentType) {
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
