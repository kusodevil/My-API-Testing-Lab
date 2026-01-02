# 🍪 自動更新 Cookie 設定指南

## 問題說明
因為公司網站使用 IAP (Identity-Aware Proxy)，Cookie 會定期過期，需要自動更新以確保 API 測試正常運作。

## 解決方案
使用 Puppeteer 自動登入並取得最新的 Cookie。

---

## 📋 設定步驟

### 1. 在 GitHub 新增 Secrets

前往您的 GitHub Repository：
1. 點擊 **Settings** → **Secrets and variables** → **Actions**
2. 點擊 **New repository secret**
3. 新增以下兩個 secrets：

| Secret Name | Value |
|-------------|-------|
| `COMPANY_EMAIL` | 您的公司登入帳號（email） |
| `COMPANY_PASSWORD` | 您的公司登入密碼 |

⚠️ **注意**：這些 secrets 只有在 GitHub Actions 中可見，其他人無法看到。

---

### 2. 本地測試（可選）

如果想在本地測試自動更新功能：

```bash
# 安裝依賴
npm install

# 設定環境變數
export COMPANY_EMAIL="your-email@company.com"
export COMPANY_PASSWORD="your-password"

# 執行更新
npm run update-cookie
```

成功後會看到：
```
✅ Cookie 已更新到 STG-Env.postman_environment.json
```

---

## 🔧 如何調整登入流程

如果自動登入失敗，可能需要調整 `update-cookie.js` 中的 selector。

### 檢查登入頁面的欄位

1. 打開瀏覽器開發者工具（F12）
2. 前往登入頁面
3. 檢查 email 和 password 輸入框的 selector
4. 修改 `update-cookie.js` 第 30-32 行：

```javascript
await page.type('input[type="email"]', process.env.COMPANY_EMAIL);
await page.type('input[type="password"]', process.env.COMPANY_PASSWORD);
await page.click('button[type="submit"]');
```

### 如果使用 Google 登入

腳本已經包含 Google IAP 登入的處理邏輯（第 34-54 行）。

---

## 🚀 GitHub Actions 自動化流程

每次執行測試時，會自動：

1. ✅ 安裝 Puppeteer
2. ✅ 執行 `update-cookie.js` 自動登入
3. ✅ 取得最新 Cookie 並更新環境檔案
4. ✅ 使用最新 Cookie 執行 API 測試

---

## 🐛 除錯

如果登入失敗，GitHub Actions 會：
- 輸出錯誤訊息
- 截圖儲存為 `error-screenshot.png`（可在 Artifacts 下載）

查看錯誤：
1. 前往 GitHub Actions 執行記錄
2. 展開 "Update Company Cookie" 步驟
3. 查看詳細錯誤訊息

---

## 📝 檔案說明

| 檔案 | 用途 |
|------|------|
| `update-cookie.js` | 自動登入腳本 |
| `STG-Env.postman_environment.json` | Postman 環境變數（會被自動更新） |
| `.github/workflows/api-test.yml` | GitHub Actions 設定 |

---

## ⚠️ 安全注意事項

1. **絕對不要** commit 含有真實 Cookie 或密碼的檔案
2. **絕對不要** 在程式碼中硬編碼帳號密碼
3. **建議** 使用測試專用帳號，而非個人帳號
4. **建議** 定期更換測試帳號密碼

---

## 💡 常見問題

### Q: Cookie 還是過期怎麼辦？
A: 檢查登入流程是否成功，查看 GitHub Actions 的 "Update Company Cookie" 步驟日誌。

### Q: 可以在本地開發時也自動更新嗎？
A: 可以！在本地設定環境變數後執行 `npm run update-cookie`。

### Q: 會不會影響手動測試？
A: 不會。手動測試時仍可以手動更新 `STG-Env.postman_environment.json`。

### Q: 需要多久更新一次？
A: 每次 GitHub Actions 執行測試前都會自動更新，無需手動操作。
