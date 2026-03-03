import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SITE_CONTENT } from "./site-content.js";

const FEEDBACK_TABLE = "feedback";
const FEEDBACK_COOLDOWN_KEY = "hualeme-feedback-last-submit-at";
const FEEDBACK_COOLDOWN_MS = 60 * 1000;
const FEEDBACK_CATEGORIES = ["Bug", "功能建议", "体验问题", "其他"];

const rawConfig = window.APP_CONFIG || {};
const config = {
  supabaseUrl: rawConfig.SUPABASE_URL || "",
  supabaseAnonKey: rawConfig.SUPABASE_ANON_KEY || "",
};

const elements = {
  appName: document.querySelectorAll("[data-site-name]"),
  appSubtitle: document.querySelector("#landing-subtitle"),
  supportMessage: document.querySelector("#support-message"),
  sponsorAfdian: document.querySelector("#sponsor-afdian"),
  sponsorMethods: document.querySelector("#sponsor-methods"),
  betaThanks: document.querySelector("#beta-thanks-list"),
  supporterThanks: document.querySelector("#supporter-thanks-list"),
  feedbackForm: document.querySelector("#feedback-form"),
  feedbackNickname: document.querySelector("#feedback-nickname"),
  feedbackContact: document.querySelector("#feedback-contact"),
  feedbackCategory: document.querySelector("#feedback-category"),
  feedbackContent: document.querySelector("#feedback-content"),
  feedbackWebsite: document.querySelector("#feedback-website"),
  feedbackMessage: document.querySelector("#feedback-message"),
  feedbackSubmit: document.querySelector("#feedback-submit"),
};

const supabase =
  config.supabaseUrl && config.supabaseAnonKey
    ? createClient(config.supabaseUrl, config.supabaseAnonKey)
    : null;

bootstrap();

function bootstrap() {
  renderContent();
  bindEvents();
}

function renderContent() {
  document.title = `${SITE_CONTENT.appName} | 小画师接稿排单台`;
  elements.appName.forEach((node) => {
    node.textContent = SITE_CONTENT.appName;
  });

  if (elements.appSubtitle) {
    elements.appSubtitle.textContent = SITE_CONTENT.appSubtitle;
  }
  if (elements.supportMessage) {
    elements.supportMessage.textContent = SITE_CONTENT.supportMessage;
  }
  if (elements.sponsorAfdian) {
    elements.sponsorAfdian.href = SITE_CONTENT.sponsor.afdianUrl || "#";
    elements.sponsorAfdian.textContent = SITE_CONTENT.sponsor.afdianLabel;
  }
  if (elements.feedbackCategory) {
    FEEDBACK_CATEGORIES.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      elements.feedbackCategory.append(option);
    });
  }

  renderSponsorMethods();
  renderThanksList(elements.betaThanks, SITE_CONTENT.betaThanks, "内测名单待补充");
  renderThanksList(elements.supporterThanks, SITE_CONTENT.supporterThanks, "赞助鸣谢待补充");
}

function renderSponsorMethods() {
  if (!elements.sponsorMethods) return;

  const methods = [
    {
      title: "爱发电",
      body: `
        ${
          SITE_CONTENT.sponsor.afdianPoster
            ? `<img src="${escapeHtml(SITE_CONTENT.sponsor.afdianPoster)}" alt="爱发电主页海报" class="afdian-poster" />`
            : ""
        }
        <p class="support-copy-inline">如果你用得顺手，想支持画了么继续慢慢更新，可以在这里请我喝杯奶茶。</p>
      `,
      action: `<a class="landing-button secondary" href="${escapeHtml(
        SITE_CONTENT.sponsor.afdianUrl || "#",
      )}" target="_blank" rel="noreferrer">${escapeHtml(
        SITE_CONTENT.sponsor.afdianLabel || "去爱发电支持Yuuki！",
      )}</a>`,
    },
    {
      title: "微信赞赏码",
      body: SITE_CONTENT.sponsor.wechatQr
        ? `<img src="${escapeHtml(SITE_CONTENT.sponsor.wechatQr)}" alt="微信赞赏码" class="qr-image" />`
        : "微信赞赏码准备中。",
      action: "",
    },
    {
      title: "支付宝赞赏码",
      body: SITE_CONTENT.sponsor.alipayQr
        ? `<img src="${escapeHtml(SITE_CONTENT.sponsor.alipayQr)}" alt="支付宝赞赏码" class="qr-image" />`
        : "支付宝赞赏码准备中。",
      action: "",
    },
  ];

  elements.sponsorMethods.innerHTML = methods
    .map(
      (item) => `
        <article class="support-card">
          <h3>${escapeHtml(item.title)}</h3>
          <div class="support-card-body">${item.body}</div>
          ${item.action}
        </article>
      `,
    )
    .join("");
}

function renderThanksList(container, list, fallback) {
  if (!container) return;
  const names = Array.isArray(list) ? list.filter(Boolean) : [];
  container.innerHTML = names.length
    ? names.map((name) => `<li class="thanks-pill">${escapeHtml(name)}</li>`).join("")
    : `<li class="thanks-empty">${escapeHtml(fallback)}</li>`;
}

function bindEvents() {
  elements.feedbackForm?.addEventListener("submit", (event) => {
    void submitFeedback(event);
  });
}

async function submitFeedback(event) {
  event.preventDefault();

  const nickname = elements.feedbackNickname.value.trim();
  const contact = elements.feedbackContact.value.trim();
  const category = elements.feedbackCategory.value;
  const content = elements.feedbackContent.value.trim();
  const website = elements.feedbackWebsite.value.trim();

  if (website) {
    setFeedbackMessage("提交失败，请刷新页面后再试。");
    return;
  }
  if (!FEEDBACK_CATEGORIES.includes(category)) {
    setFeedbackMessage("先选择一个反馈类型。");
    return;
  }
  if (content.length < 5) {
    setFeedbackMessage("反馈内容至少写 5 个字。");
    return;
  }
  if (content.length > 500) {
    setFeedbackMessage("反馈内容最多 500 个字。");
    return;
  }

  const cooldown = getRemainingCooldown();
  if (cooldown > 0) {
    setFeedbackMessage(`刚提交过一次，${cooldown} 秒后再发更稳。`);
    return;
  }

  if (!supabase) {
    setFeedbackMessage(`当前站点还没接通反馈服务。${SITE_CONTENT.feedbackFallback}`);
    return;
  }

  setFeedbackPending(true);
  const { error } = await supabase.from(FEEDBACK_TABLE).insert({
    nickname,
    contact,
    category,
    content,
    page_context: window.location.pathname.startsWith("/app") ? "app" : "landing",
  });
  setFeedbackPending(false);

  if (error) {
    setFeedbackMessage(`提交失败：${String(error.message || error)}。${SITE_CONTENT.feedbackFallback}`);
    return;
  }

  window.localStorage.setItem(FEEDBACK_COOLDOWN_KEY, String(Date.now()));
  elements.feedbackForm.reset();
  setFeedbackMessage("反馈已收到，感谢你帮我继续把画了么打磨得更顺手。", true);
}

function setFeedbackPending(pending) {
  if (elements.feedbackSubmit) {
    elements.feedbackSubmit.disabled = pending;
    elements.feedbackSubmit.textContent = pending ? "提交中..." : "提交反馈";
  }
}

function setFeedbackMessage(message, success = false) {
  if (!elements.feedbackMessage) return;
  elements.feedbackMessage.textContent = message;
  elements.feedbackMessage.dataset.state = success ? "success" : "default";
}

function getRemainingCooldown() {
  try {
    const raw = window.localStorage.getItem(FEEDBACK_COOLDOWN_KEY);
    if (!raw) return 0;
    const elapsed = Date.now() - Number(raw);
    if (!Number.isFinite(elapsed) || elapsed >= FEEDBACK_COOLDOWN_MS) return 0;
    return Math.ceil((FEEDBACK_COOLDOWN_MS - elapsed) / 1000);
  } catch (_error) {
    return 0;
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
