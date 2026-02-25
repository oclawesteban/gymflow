import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {

  test('Landing page carga correctamente', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1, h2').filter({ hasText: /GymFlow|gimnasio/i }).first()).toBeVisible({ timeout: 15000 })
  })

  test('Botón de registro visible en la landing', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const registerBtn = page.locator('a[href="/register"], button:has-text("Empieza"), a:has-text("Empieza"), a:has-text("gratis")').first()
    await expect(registerBtn).toBeVisible({ timeout: 10000 })
  })

  test('Botón de login visible en la landing', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loginBtn = page.locator('a[href="/login"], a:has-text("Iniciar"), button:has-text("Iniciar")').first()
    await expect(loginBtn).toBeVisible({ timeout: 10000 })
  })

  test('Sección de features/características visible', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Scroll hacia abajo para asegurar que el contenido esté visible
    await page.evaluate(() => window.scrollBy(0, 400))
    await page.waitForTimeout(500)

    const anyFeature = await Promise.any([
      page.locator('h3:has-text("Miembros")').waitFor({ state: 'visible', timeout: 8000 }).then(() => true),
      page.locator('h3:has-text("Membresías")').waitFor({ state: 'visible', timeout: 8000 }).then(() => true),
      page.locator('h3:has-text("Reportes")').waitFor({ state: 'visible', timeout: 8000 }).then(() => true),
      page.locator('text=gestiona todos tus socios').waitFor({ state: 'visible', timeout: 8000 }).then(() => true),
    ]).catch(() => false)

    expect(anyFeature).toBe(true)
  })

  test('Sección de pricing visible', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Scroll al final de la página donde está el pricing
    await page.evaluate(() => window.scrollBy(0, 1200))
    await page.waitForTimeout(500)

    const pricingVisible = await Promise.any([
      page.locator('text=99.000').waitFor({ state: 'visible', timeout: 8000 }).then(() => true),
      page.locator('text=Plan Pro').waitFor({ state: 'visible', timeout: 8000 }).then(() => true),
      page.locator('text=Sin tarjeta').waitFor({ state: 'visible', timeout: 8000 }).then(() => true),
    ]).catch(() => false)

    expect(pricingVisible).toBe(true)
  })

})
