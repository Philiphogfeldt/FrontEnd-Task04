const { test, expect } = require('@playwright/test');


test('Test localstorage ID', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/');

  await page.fill('#stop-input', 'Länsmanna');

  await page.click('#updateButton');

  await page.evaluate(() => {
    localStorage.setItem('stopId', '9021014004637000');
  });
  await page.goto('http://127.0.0.1:5500/');

  const storedValue = await page.evaluate(() => {
    return localStorage.getItem('stopId');
  });

  expect(storedValue).toBe('9021014004637000');

  ;
});


test('Test for checking correct listOne header', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/');

  await page.fill('#stop-input', 'Sexdrega');

  await page.click('#updateButton');

  await page.waitForSelector('ul');

  const listOneHeader = await page.$eval('#listOne', x => x.textContent.trim());
  expect(listOneHeader).toBe('Sexdrega, Svenljunga');

  ;
});

test('testButton', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/');

  await page.fill('#stop-input', 'Sexdrega');

  await page.click('#favoritButton');

  await page.waitForSelector('div');

  const listOneText = await page.$eval('#buttonContainer', el => el.textContent.trim());
  expect(listOneText).toBe('SexdregaX');

  ;
});

test('Test localstorage list', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/');

  await page.fill('#stop-input', 'Länsmanna');

  await page.click('#updateButton');

  await page.evaluate(() => {
    localStorage.setItem('departures', '5');
  });
  await page.goto('http://127.0.0.1:5500/');

  const storedValue = await page.evaluate(() => {
    return localStorage.getItem('departures');
  });

  expect(storedValue).toBe('5');

  ;
});



