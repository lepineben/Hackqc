
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('EnergiaDemo_2025-05-06', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:3000');

    // Navigate to URL
    await page.goto('http://localhost:3000');

    // Take screenshot
    await page.screenshot({ path: 'home-screen.png', { fullPage: true } });

    // Click element
    await page.click('text=Capture');

    // Click element
    await page.click('text="Capture"');

    // Click element
    await page.click('button:has-text("Capture")');

    // Take screenshot
    await page.screenshot({ path: 'capture-page.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:3000/capture');

    // Take screenshot
    await page.screenshot({ path: 'capture-screen.png', { fullPage: true } });

    // Click element
    await page.click('button:has-text("Télécharger une image")');

    // Navigate to URL
    await page.goto('http://localhost:3000/capture');

    // Take screenshot
    await page.screenshot({ path: 'demo-mode-active.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:3000/analysis');

    // Navigate to URL
    await page.goto('http://localhost:3000/analysis/');

    // Take screenshot
    await page.screenshot({ path: 'analysis-view.png', { fullPage: true } });

    // Take screenshot
    await page.screenshot({ path: 'analysis-results.png', { fullPage: true } });

    // Take screenshot
    await page.screenshot({ path: 'analysis-results-after-wait.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:3000/future/');
});