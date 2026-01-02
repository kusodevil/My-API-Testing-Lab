# 🍪 Cookie 更新指南

## 問題說明
因為公司網站使用 IAP (Identity-Aware Proxy) 並啟用 2FA，Cookie 會定期過期，需要定期更新以確保 API 測試正常運作。

## 解決方案
使用輔助工具開啟瀏覽器，手動完成登入（包含 2FA），然後自動提取 Cookie。

---

## 📋 更新 Cookie 步驟

### 方法：使用輔助工具半自動更新

當 Cookie 過期時（通常 API 測試會開始失敗），執行以下步驟：

```bash
# 1. 安裝依賴（第一次執行時）
npm install

# 2. 執行 Cookie 輔助工具
npm run get-cookie
```

**工具會做什麼：**
1. 開啟瀏覽器並前往登入頁面
2. 等待您手動完成登入（包含 2FA 驗證）
3. 您按下 Enter 後，自動提取所有 Cookies
4. 顯示 Cookie 字串供您複製

**接著：**
1. 複製工具輸出的 Cookie 字串
2. 前往 GitHub: https://github.com/kusodevil/My-API-Testing-Lab/settings/secrets/actions
3. 更新 `COMPANY_COOKIE` secret
4. 完成！下次測試就會使用新的 Cookie

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
