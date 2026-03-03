# 画师排单台

一个适合小画师记录接稿、截稿、收入和来源的网页工具。

现在支持两种模式：

- 本地模式：不开数据库，数据保存在浏览器
- 云端模式：接入 Supabase，支持注册 / 登录 / 验证邮箱 / 重发验证邮件 / 忘记密码 / 每个画师各自保存自己的数据

## 功能

- 录入稿件：项目名、客户、业务分类、来源、平台抽成、优先级、稿费、截稿日期、状态、异常类型、备注
- 重复录单：支持“重复上一单”和按行复制，减少反复手填
- 收款管理：记录已收金额、区分未收款 / 已收定金 / 已结清
- 快捷处理：列表里直接点完成 / 已付款 / 已处理，也支持多选批量改状态和批量设置异常
- 异常流程：支持金主退稿 / 金主退部分稿 / 金主异常，并单独标记已处理
- 月度统计：总单量、总收入、已收金额、预计实得、逾期稿件、待处理稿件
- 分类分析：按业务分类看哪类单更赚钱
- 月历视图：按截稿日期直观看到每个月的工作量和排单密度
- 本地存储：数据默认保存在浏览器 `localStorage`
- 数据导入导出：支持 JSON 导入导出，支持 CSV 导出
- 云端同步：接入 Supabase 后支持邮箱注册登录、验证邮箱、重发验证邮件、忘记密码和个人数据隔离

## 本地打开

不开云端时，双击打开 [index.html](/Users/yuuki/codeproject/paidan/index.html) 就能用。

如果你想本地起一个简单服务，也可以在当前目录执行：

```bash
python3 -m http.server 8000
```

然后访问 `http://localhost:8000`

## Supabase 配置

如果你要给别人真正上线使用，建议直接开云端模式。

### 1. 创建 Supabase 项目

在 [Supabase Dashboard](https://supabase.com/dashboard) 创建一个新项目。

### 2. 建表和权限

打开 SQL Editor，执行 [supabase/schema.sql](/Users/yuuki/codeproject/paidan/supabase/schema.sql) 里的 SQL。

这会创建：

- `commission_orders` 表
- `updated_at` 自动更新时间触发器
- 只允许用户操作自己数据的 RLS 策略

如果你之前已经上线过旧版表结构，这次要重新执行一次 [supabase/schema.sql](/Users/yuuki/codeproject/paidan/supabase/schema.sql)，让数据库补上：

- `exception_type`
- `fee_rate`

这两个新字段分别用于异常流程和平台抽成 / 预计实得计算。

### 3. 获取前端需要的两个值

在 Supabase 项目里找到：

- `Project URL`
- `anon` / `publishable` key

### 4. 在 Netlify 配环境变量

Netlify 项目里添加：

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 4.1 在 Supabase 配 Auth URL

到 `Authentication -> URL Configuration` 里确认：

- `Site URL` 是你的 Netlify 正式地址
- `Redirect URLs` 里至少包含
  - 你的 Netlify 正式地址
  - 本地调试地址，比如 `http://localhost:8000`

否则邮箱验证和重置密码链接回跳时，前端可能拿不到正确的认证上下文。

### 5. 部署

这个仓库现在会在构建时把环境变量写进 `dist/env.js`，然后发布 `dist` 目录。

## 部署到 Netlify

### 方式 1：直接拖拽部署

1. 打开 Netlify 后台
2. 选择 `Add new site`
3. 选择 `Deploy manually`
4. 把整个 `/Users/yuuki/codeproject/paidan` 文件夹拖进去

### 方式 2：连接 Git 仓库

1. 把这个目录初始化成 git 仓库并推到 GitHub
2. 在 Netlify 里选择 `Import from Git`
3. 选择这个仓库
4. 构建设置保持默认即可
   - Build command: `node build.js`
   - Publish directory: `dist`

## 登录说明

- 注册后如果你在 Supabase 里开启了邮箱验证，用户需要先去邮箱点确认链接
- 如果没开邮箱验证，注册后通常会直接登录
- 登录后每个用户只能看到自己的稿件
- 用户可以直接点“重发验证邮件”
- 用户可以直接点“忘记密码”，收邮件后回到站点完成密码重置
- 如果提示 `email rate limit exceeded`，说明认证邮件发得太频繁，被 Supabase 暂时限流了，等一会儿再发

## 后续可继续加的功能

- 多标签业务，例如同时标记“头像 + 特快”
- 收款进度细化成定金 / 中期 / 尾款
- 分享报价单或委托单页面
- 管理员后台和订阅付费
