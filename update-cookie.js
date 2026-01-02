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

        // 等待登入表單載入
        // 注意：您可能需要根據實際的登入頁面調整 selector
        console.log('⌨️  輸入帳號密碼...');

        // 如果是 Google IAP，可能需要點擊 Google 登入按鈕
        // 這裡提供兩種情境的程式碼

        // Google IAP 登入流程
        console.log('📧 開始 Google IAP 登入流程...');

        // 等待並輸入 email
        await page.waitForSelector('input[type="email"]', { timeout: 30000 });
        await page.type('input[type="email"]', process.env.COMPANY_EMAIL, { delay: 100 });
        console.log('✅ 已輸入 email');

        // 點擊"下一步"按鈕（Google 登入第一步）
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.keyboard.press('Enter');
        console.log('⏭️  已點擊下一步');

        // 等待密碼輸入框出現（可能需要較長時間）
        try {
            await page.waitForSelector('input[type="password"]', { visible: true, timeout: 30000 });
            await new Promise(resolve => setTimeout(resolve, 1000));
            await page.type('input[type="password"]', process.env.COMPANY_PASSWORD, { delay: 100 });
            console.log('✅ 已輸入密碼');

            // 點擊登入
            await new Promise(resolve => setTimeout(resolve, 1000));
            await page.keyboard.press('Enter');
            console.log('🔐 已送出登入');
        } catch (passwordError) {
            console.log('⚠️  密碼輸入框未出現，可能已經登入或需要其他驗證方式');
            // 有些情況下可能已經有 session，直接繼續
        }

        console.log('⏳ 等待登入完成...');
        // 等待登入成功後跳轉到主頁面
        await page.waitForNavigation({
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        console.log('🍪 正在提取 Cookies...');
        // 取得所有 cookies
        const cookies = await page.cookies();

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
        // 截圖以便除錯
        try {
            await page.screenshot({ path: 'error-screenshot.png' });
            console.log('📸 錯誤截圖已儲存: error-screenshot.png');
        } catch (screenshotError) {
            console.error('無法儲存截圖:', screenshotError.message);
        }
        process.exit(1);
    } finally {
        await browser.close();
        console.log('🔒 瀏覽器已關閉');
    }
})();
