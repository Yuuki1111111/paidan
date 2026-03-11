export const STORAGE_KEY = "artist-commission-desk-v1";
export const STORAGE_MODE_KEY = "artist-commission-storage-mode-v1";
export const FX_SETTINGS_KEY = "artist-commission-fx-settings-v1";
export const LAST_TEMPLATE_KEY = "artist-commission-last-template-v1";
export const BUSINESS_PRESET_KEY = "artist-commission-business-presets-v1";
export const BUSINESS_TEMPLATE_KEY = "artist-commission-business-templates-v1";

export const DEFAULT_BACKGROUND_HEX = "#f7efe4";
export const DEFAULT_VIP_THRESHOLD = 3000;
export const DEFAULT_USD_CNY_RATE = 7.2;
export const DEFAULT_JPY_CNY_RATE = 0.048;
export const DEFAULT_TWD_CNY_RATE = 0.22;
export const DEFAULT_HKD_CNY_RATE = 0.92;

export const SUPPORTED_CURRENCIES = ["CNY", "USD", "JPY", "TWD", "HKD"];

export const BUILT_IN_BUSINESS_TYPES = [
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

export const BUILT_IN_PRODUCTION_STAGES = ["草稿", "线稿", "铺色", "细化", "完稿"];

export const SOURCES = ["米画师企划邀请", "画加", "临界", "群拍", "私单", "米画师橱窗", "熟人转介绍", "社媒引流"];

export const SOURCE_OPTIONS = [
  { value: "米画师企划邀请", label: "米画师企划邀请" },
  { value: "画加", label: "画加" },
  { value: "临界", label: "临界" },
  { value: "群拍", label: "群拍（设拍 / 稿拍）" },
  { value: "私单", label: "私单" },
  { value: "米画师橱窗", label: "米画师橱窗" },
  { value: "熟人转介绍", label: "熟人转介绍" },
  { value: "社媒引流", label: "社媒引流" },
];

export const CURRENCY_OPTIONS = [
  { value: "CNY", label: "人民币 CNY" },
  { value: "USD", label: "美元 USD" },
  { value: "JPY", label: "日元 JPY" },
  { value: "TWD", label: "新台币 TWD" },
  { value: "HKD", label: "港币 HKD" },
];

export const FEE_MODES = [
  { value: "standard", label: "默认按比例" },
  { value: "mhs_project", label: "米画师企划邀请（可切换到手/总价）" },
  { value: "mhs_window", label: "米画师橱窗（满20减1）" },
];

export const MHS_PROJECT_AMOUNT_MODE_ARTIST = "artist_net";
export const MHS_PROJECT_AMOUNT_MODE_CLIENT = "client_quote";
export const MHS_PROJECT_AMOUNT_MODES = [MHS_PROJECT_AMOUNT_MODE_ARTIST, MHS_PROJECT_AMOUNT_MODE_CLIENT];

export const AMOUNT_INPUT_VALUE_KIND_BASE = "base";
export const AMOUNT_INPUT_VALUE_KIND_QUOTED = "quoted";

export const PRIORITIES = ["普通", "加急", "特快"];
export const USAGE_TYPES = ["私用", "商用", "买断"];
export const LEGACY_PAID_STATUS = "已付款";
export const STATUSES = ["待沟通", "排期中", "进行中", "待交付", "已完成", "已处理"];
export const PAYMENT_STATUSES = ["未收款", "已收定金", "已结清"];
export const EXCEPTION_TYPES = ["无", "金主退稿", "金主退部分稿", "金主异常"];
export const EXCEPTION_RESOLUTIONS = ["协商退全款", "协商退部分款", "协商延期", "补偿约定", "拒绝沟通", "其他"];
export const ABNORMAL_EXCEPTION_TYPES = new Set(EXCEPTION_TYPES.filter((type) => type !== "无"));
export const CLOSED_STATUSES = new Set(["已完成", "已处理"]);
export const DISALLOWED_ABNORMAL_STATUSES = new Set(["已完成"]);
export const STAGE_EDITABLE_STATUSES = new Set(["排期中", "进行中", "待交付"]);

export const SOURCE_FEE_RATES = {
  米画师企划邀请: 0.05,
  画加: 0.0525,
  临界: 0,
  群拍: 0,
  私单: 0,
  米画师橱窗: 0,
  熟人转介绍: 0,
  社媒引流: 0,
};

export const SOURCE_COLORS = {
  米画师企划邀请: "#6f9d9c",
  画加: "#5d7ea6",
  临界: "#8a7ad1",
  群拍: "#8f7d63",
  私单: "#d86b2d",
  米画师橱窗: "#b89f6b",
  熟人转介绍: "#6d8f57",
  社媒引流: "#8c79ad",
};

export const CALENDAR_DISPLAY_TAGS = "tags";
export const CALENDAR_DISPLAY_TIMELINE = "timeline";

export const MOBILE_TABS = [
  { id: "orders", label: "订单" },
  { id: "calendar", label: "月历" },
  { id: "create", label: "新建" },
  { id: "stats", label: "统计" },
  { id: "settings", label: "设置" },
];
