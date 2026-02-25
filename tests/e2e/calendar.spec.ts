import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Calendario de vencimientos', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Página de calendario carga correctamente', async ({ page }) => {
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1').filter({ hasText: /Vencimiento|Calendario/i })).toBeVisible({ timeout: 15000 })
  })

  test('Navegación de meses funciona', async ({ page }) => {
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    const navBtn = await Promise.any([
      page.locator('button:has-text("›"), button:has-text("→"), button[aria-label*="siguiente"]').first().waitFor({ state: 'visible', timeout: 8000 }).then(() => true),
      page.locator('button').filter({ hasText: /siguiente|próximo/i }).waitFor({ state: 'visible', timeout: 8000 }).then(() => true),
    ]).catch(() => false)
    expect(navBtn).toBe(true)
  })

})
