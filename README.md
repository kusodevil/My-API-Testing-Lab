![API Test Status](https://github.com/kusodevil/My-API-Testing-Lab/actions/workflows/api-test.yml/badge.svg)

# My API Testing Lab

自動化 API 測試專案，使用 Newman 和 Postman 進行持續整合測試，並自動更新 IAP 認證 Cookie。

## 📊 功能特色

- ✅ **自動化 API 測試**：使用 Newman CLI 執行 Postman collection
- 🍪 **自動 Cookie 更新**：透過 Puppeteer 自動登入並更新過期的 IAP Cookie
- 📈 **測試報告**：自動生成 HTML 測試報告並部署到 GitHub Pages
- 💬 **Slack 通知**：測試完成後自動發送結果通知到 Slack
- 🔄 **定時執行**：每日自動執行測試（台灣時間早上 9:00）
- 🚀 **CI/CD 整合**：完整的 GitHub Actions 工作流程

## 📁 專案結構

```
.
├── .github/workflows/
│   └── api-test.yml           # GitHub Actions 工作流程
├── Kolr.postman_collection.json     # 公司 API 測試集
├── Swagger Petstore.postman_collection.json  # 範例測試集
├── STG-Env.postman_environment.json # STG 環境變數
├── pet-data.json              # 測試資料
├── update-cookie.js           # 自動更新 Cookie 腳本
├── get-cookie-helper.js       # 手動輔助取得 Cookie
├── COOKIE-SETUP.md            # Cookie 設定說明文件
└── package.json               # Node.js 專案設定
```

## 🚀 快速開始

### 本地執行測試

```bash
# 安裝依賴
npm install

# 執行 Petstore API 測試
npm run test:api

# 更新 Cookie（需設定環境變數）
npm run update-cookie

# 手動取得 Cookie（開啟瀏覽器協助）
npm run get-cookie
```

### 環境變數設定

本地開發需要設定以下環境變數：

```bash
export IAP_EMAIL="your-google-email@company.com"
export IAP_PASSWORD="your-google-password"
export COMPANY_EMAIL="your-company-email"
export COMPANY_PASSWORD="your-company-password"
```

## 📊 即時測試報告

測試報告會自動部署到 GitHub Pages：
🔗 https://kusodevil.github.io/My-API-Testing-Lab/

## 🔧 GitHub Actions 設定

需要在 GitHub Repository Settings 中設定以下 Secrets：

- `IAP_EMAIL` - Google IAP 登入帳號
- `IAP_PASSWORD` - Google IAP 登入密碼
- `COMPANY_EMAIL` - 公司系統登入帳號
- `COMPANY_PASSWORD` - 公司系統登入密碼
- `COMPANY_COOKIE` - 備用 Cookie（可選）
- `MY_SECRET_KEY` - Petstore API Key
- `SLACK_WEBHOOK_URL` - Slack Webhook 網址

詳細設定請參考 [COOKIE-SETUP.md](COOKIE-SETUP.md)

## 📅 自動執行排程

- **每日定時**：台灣時間早上 9:00（UTC 1:00）
- **Push 觸發**：推送到 main 分支時
- **手動觸發**：在 GitHub Actions 頁面手動執行

## 📬 Slack 通知格式

測試完成後會收到包含以下資訊的 Slack 通知：

- ✅/❌ 測試結果狀態
- 📋 掃描的工作區數量
- 🏢 所有工作區名稱列表
- 📊 即時測試報告連結

## 🛠️ 技術棧

- **測試工具**：Newman (Postman CLI)
- **自動化**：Puppeteer
- **CI/CD**：GitHub Actions
- **報告**：newman-reporter-htmlextra
- **通知**：Slack (rtCamp/action-slack-notify)
- **部署**：GitHub Pages