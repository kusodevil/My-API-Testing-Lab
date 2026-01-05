const puppeteer = require('puppeteer');
const fs = require('fs');

/**
 * 自動登入公司網站並更新 Cookie
 * 用於解決 IAP (Identity-Aware Proxy) Cookie 過期問題
 */
(async () => {
    console.log('🚀 開始自動登入流程...');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // 設定較長的超時時間，因為 IAP 登入可能較慢
        page.setDefaultTimeout(60000);

        console.log('📝 正在導向登入頁面...');
        await page.goto('https://app.stg.kolr.ai/login', {
            waitUntil: 'networkidle2'
        });

        // ============================================
        // 第一階段：Google IAP 登入
        // ============================================
        console.log('🔐 第一階段：Google IAP 登入');

        // 等待並輸入 Google email
        await page.waitForSelector('input[type="email"]', { timeout: 30000 });
        const emailSelector = 'input[type="email"]';
        await page.type(emailSelector, process.env.IAP_EMAIL, { delay: 100 });
        console.log('✅ 已輸入 IAP Email:', process.env.IAP_EMAIL);

        // 點擊"下一步"
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.keyboard.press('Enter');
        console.log('⏭️  已點擊下一步');

        // 等待並輸入 Google 密碼
        console.log('⏳ 等待密碼輸入框出現...');
        try {
            // 嘗試多種選擇器，因為 Google 登入頁面可能有不同的結構
            const passwordInput = await Promise.race([
                page.waitForSelector('input[type="password"]', { visible: true, timeout: 30000 }),
                page.waitForSelector('input[name="password"]', { visible: true, timeout: 30000 }),
                page.waitForSelector('#password', { visible: true, timeout: 30000 })
            ]);

            await new Promise(resolve => setTimeout(resolve, 1000));
            await passwordInput.type(process.env.IAP_PASSWORD, { delay: 100 });
            console.log('✅ 已輸入 IAP 密碼');

            // 送出 IAP 登入
            await new Promise(resolve => setTimeout(resolve, 1000));
            await page.keyboard.press('Enter');
            console.log('🔐 已送出 IAP 登入');

        } catch (waitError) {
            console.log('⚠️  找不到密碼輸入框，可能已經自動登入或頁面結構改變');
            const currentUrl = await page.url();
            console.log('📍 當前 URL:', currentUrl);

            await page.screenshot({ path: 'password-page-debug.png', fullPage: true });
            console.log('📸 截圖已儲存: password-page-debug.png');

            // 檢查是否已經跳過密碼頁面（可能已登入）
            if (currentUrl.includes('app.stg.kolr.ai')) {
                console.log('ℹ️  似乎已經自動登入，繼續後續流程...');
            } else {
                throw new Error('等待密碼輸入框超時，請檢查截圖');
            }
        }

        // 等待 IAP 驗證完成
        console.log('⏳ 等待 IAP 驗證...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // ============================================
        // 第二階段：公司網站登入
        // ============================================
        console.log('🏢 第二階段：公司網站登入');

        // 等待公司登入頁面的 email 輸入框
        try {
            await page.waitForSelector('input[type="email"], input[name="email"], input[name="username"]', { timeout: 30000 });
            const emailInput = await page.$('input[type="email"], input[name="email"], input[name="username"]');

            if (emailInput) {
                await emailInput.type(process.env.COMPANY_EMAIL, { delay: 100 });
                console.log('✅ 已輸入公司帳號');

                // 輸入公司密碼
                await new Promise(resolve => setTimeout(resolve, 500));
                const passwordInput = await page.$('input[type="password"], input[name="password"]');

                if (passwordInput) {
                    await passwordInput.type(process.env.COMPANY_PASSWORD, { delay: 100 });
                    console.log('✅ 已輸入公司密碼');

                    // 送出登入
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await page.keyboard.press('Enter');
                    console.log('🔐 已送出公司登入');

                    // 等待登入完成
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        } catch (secondLoginError) {
            console.log('ℹ️  未偵測到第二階段登入頁面，可能 IAP 後直接進入系統');
        }

        console.log('⏳ 等待頁面載入完成...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        const currentUrl = page.url();
        console.log('當前 URL:', currentUrl);

        console.log('🍪 正在提取 Cookies...');
        // 取得所有 cookies (使用 CDP session 獲取)
        const client = await page.createCDPSession();
        const { cookies } = await client.send('Network.getAllCookies');

        // 將 cookies 組合成字串格式
        const cookieString = cookies
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');

        console.log(`✅ 成功取得 ${cookies.length} 個 cookies`);

        // 更新環境檔案
        const envFilePath = './STG-Env.postman_environment.json';
        const envFile = JSON.parse(fs.readFileSync(envFilePath, 'utf8'));

        // 找到 company_cookie 並更新
        const cookieVar = envFile.values.find(v => v.key === 'company_cookie');
        if (cookieVar) {
            cookieVar.value = cookieString;
            fs.writeFileSync(envFilePath, JSON.stringify(envFile, null, '\t'));
            console.log('✅ Cookie 已更新到 STG-Env.postman_environment.json');
        } else {
            console.error('❌ 找不到 company_cookie 變數');
            process.exit(1);
        }

        // 將 cookie 也輸出到環境變數（供 GitHub Actions 使用）
        if (process.env.GITHUB_OUTPUT) {
            fs.appendFileSync(
                process.env.GITHUB_OUTPUT,
                `company_cookie=${cookieString}\n`
            );
            console.log('✅ Cookie 已輸出到 GitHub Actions');
        }

    } catch (error) {
        console.error('❌ 發生錯誤:', error.message);

        // 嘗試截圖以便除錯
        try {
            if (page) {
                const currentUrl = await page.url();
                console.log('📍 錯誤發生時的 URL:', currentUrl);

                await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
                console.log('📸 錯誤截圖已儲存: error-screenshot.png');
            }
        } catch (screenshotError) {
            console.error('⚠️  無法儲存截圖:', screenshotError.message);
        }

        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
            console.log('🔒 瀏覽器已關閉');
        }
    }
})();
