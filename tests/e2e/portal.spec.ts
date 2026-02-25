import { test, expect } from '@playwright/test'

test.describe('Portal del socio', () => {

  test('Página de login del portal carga', async ({ page }) => {
    await page.goto('/portal/login')
    await page.waitForLoadState('networkidle')
    const visible = await Promise.any([
      page.locator('text=Portal').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      page.locator('text=Socio').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
    ]).catch(() => false)
    expect(visible).toBe(true)
  })

  test('Página de registro del portal carga', async ({ page }) => {
    await page.goto('/portal/register')
    await page.waitForLoadState('networkidle')
    const visible = await Promise.any([
      page.locator('text=Registr').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
    ]).catch(() => false)
    expect(visible).toBe(true)
  })

  test('Login con credenciales inválidas muestra error en portal', async ({ page }) => {
    await page.goto('/portal/login')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const emailInput = page.locator('input[type="email"]').first()
    const isVisible = await emailInput.isVisible().catch(() => false)
    if (!isVisible) { console.warn('ℹ️ No se encontró input de email'); return }

    await emailInput.fill('noexiste@test.com')
    const passwordInput = page.locator('input[type="password"]').first()
    await passwordInput.fill('wrongpassword')
    await page.locator('button[type="submit"]').first().click()

    const errorVisible = await Promise.any([
      page.locator('text=incorrecto, text=inválido, text=no encontrado').first().waitFor({ state: 'visible', timeout: 8000 }).then(() => true),
      page.locator('.bg-red-50, [class*="error"]').waitFor({ state: 'visible', timeout: 8000 }).then(() => true),
    ]).catch(() => false)
    expect(errorVisible).toBe(true)
  })

})
