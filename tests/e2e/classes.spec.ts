import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Clases grupales', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Página de clases carga correctamente', async ({ page }) => {
    await page.goto('/classes')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1').filter({ hasText: /Clase/i })).toBeVisible({ timeout: 15000 })
  })

  test('Formulario de nueva clase carga', async ({ page }) => {
    await page.goto('/classes/new')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    const visible = await Promise.any([
      page.locator('input[id="nombre"]').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      page.locator('input[placeholder*="CrossFit"]').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      page.locator('label:has-text("Nombre")').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
    ]).catch(() => false)
    expect(visible).toBe(true)
  })

})
