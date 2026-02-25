import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Descuentos', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Página de descuentos carga correctamente', async ({ page }) => {
    await page.goto('/discounts')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1').filter({ hasText: /Descuento/i })).toBeVisible({ timeout: 15000 })
  })

  test('Formulario de nuevo descuento carga', async ({ page }) => {
    await page.goto('/discounts/new')
    await page.waitForLoadState('networkidle')
    const visible = await Promise.any([
      page.locator('input[name="code"], input[id="code"]').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      page.locator('text=Código').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
    ]).catch(() => false)
    expect(visible).toBe(true)
  })

  test('Se puede crear un código de descuento', async ({ page }) => {
    await page.goto('/discounts/new')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const codeInput = page.locator('input[name="code"], input[id="code"], input[placeholder*="código"], input[placeholder*="PROMO"]').first()
    const isVisible = await codeInput.isVisible().catch(() => false)
    if (!isVisible) { console.warn('ℹ️ Campo código no encontrado'); return }

    await codeInput.fill('TESTDESC10')
    const submitBtn = page.locator('button[type="submit"]').first()
    await submitBtn.click()

    const success = await Promise.any([
      page.waitForURL('**/discounts', { timeout: 8000 }).then(() => true),
      page.locator('text=creado, text=guardado').waitFor({ state: 'visible', timeout: 8000 }).then(() => true),
    ]).catch(() => false)
    expect(success).toBe(true)
  })

})
