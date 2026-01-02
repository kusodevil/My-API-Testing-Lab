const puppeteer = require('puppeteer');

/**
 * Cookie 輔助工具 - 手動登入模式
 * 開啟瀏覽器讓您手動登入，登入完成後自動提取 Cookie
 */
(async () => {
    console.log('🚀 啟動瀏覽器...');
    console.log('⚠️  請在瀏覽器視窗中手動完成登入（包含 2FA 等驗證）');
    console.log('');

    const browser = await puppeteer.launch({
        headless: false,  // 顯示瀏覽器視窗
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // 前往登入頁面
        console.log('📱 正在開啟登入頁面...');
        await page.goto('https://app.stg.kolr.ai/login', {
            waitUntil: 'networkidle2'
        });

        console.log('');
        console.log('════════════════════════════════════════════════');
        console.log('👉 請在開啟的瀏覽器視窗中完成登入');
        console.log('   （包含輸入帳密、2FA 驗證等所有步驟）');
        console.log('');
        console.log('✅ 登入完成後，請在此終端機按 Enter 繼續');
        console.log('════════════════════════════════════════════════');
        console.log('');

        // 等待使用者按 Enter
        await new Promise((resolve) => {
            process.stdin.once('data', () => {
                resolve();
            });
        });

        console.log('🍪 正在提取 Cookies...');
        const cookies = await page.cookies();
        const cookieString = cookies
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');

        console.log(`✅ 成功取得 ${cookies.length} 個 cookies`);
        console.log('');
        console.log('════════════════════════════════════════════════');
        console.log('📋 請複製以下 Cookie 字串：');
        console.log('════════════════════════════════════════════════');
        console.log('');
        console.log(cookieString);
        console.log('');
        console.log('════════════════════════════════════════════════');
        console.log('');
        console.log('📝 接下來的步驟：');
        console.log('1. 複製上面的 Cookie 字串');
        console.log('2. 前往 GitHub Repository Settings');
        console.log('3. 更新 COMPANY_COOKIE secret');
        console.log('');
        console.log('🔗 直接前往設定頁面：');
        console.log('   https://github.com/kusodevil/My-API-Testing-Lab/settings/secrets/actions');
        console.log('');

    } catch (error) {
        console.error('❌ 發生錯誤:', error.message);
        process.exit(1);
    } finally {
        await browser.close();
        console.log('🔒 瀏覽器已關閉');
        process.exit(0);
    }
})();
