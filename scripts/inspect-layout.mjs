import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
for (const path of ['/meu-espaco', '/desapego', '/anunciar', '/verificar']) {
  await page.goto(`http://localhost:5173${path}`);
  await page.evaluate(() => document.fonts.ready);
  console.log(path, await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, overflow: [...document.querySelectorAll('body *')].map(e => ({ tag: e.tagName, class: e.className, right: e.getBoundingClientRect().right, width: e.getBoundingClientRect().width })).filter(e => e.right > innerWidth + 1 && e.width > 0).slice(0, 15) })));
  await page.screenshot({ path: `test-results/inspect-${path.slice(1)}.png`, fullPage: true });
}
await browser.close();
