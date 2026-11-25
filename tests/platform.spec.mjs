import { expect, test } from '@playwright/test'

test('desktop browser loads the site and reaches the API through Caddy', async ({
  page,
}) => {
  const statusResponse = page.waitForResponse('**/api/v1/status')
  await page.goto('/')

  const response = await statusResponse
  expect(response.status()).toBe(200)
  expect(await response.json()).toEqual({ status: 'ready' })
  await expect(page.getByRole('heading', { name: 'InnoMafia' })).toBeVisible()
  await expect(page.getByRole('status')).toHaveText('API доступен')
})

test('Caddy distinguishes SPA navigation, assets and API routes', async ({
  page,
  request,
}) => {
  expect((await page.goto('/clubs'))?.status()).toBe(200)
  await expect(page.getByRole('heading', { name: 'InnoMafia' })).toBeVisible()
  expect((await request.get('/assets/does-not-exist.js')).status()).toBe(404)
  expect((await request.get('/api/v1/does-not-exist')).status()).toBe(404)
})

test('the browser can retry an unavailable API', async ({ page }) => {
  await page.route('**/api/v1/status', async (route) => {
    await route.fulfill({
      status: 503,
      json: { code: 14, message: 'database unavailable' },
    })
  })
  await page.goto('/')
  await expect(page.getByRole('status')).toHaveText('API недоступен')

  await page.unroute('**/api/v1/status')
  await page.getByRole('button', { name: 'Проверить снова' }).click()
  await expect(page.getByRole('status')).toHaveText('API доступен')
})
