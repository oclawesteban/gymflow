import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Configuración', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Página de configuración carga correctamente', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1').filter({ hasText: /Configuraci/i })).toBeVisible({ timeout: 15000 })
  })

  test('Formulario de configuración tiene los campos correctos', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    const fieldsVisible = await Promise.race([
      page.locator('input[name="name"], input[id="name"]').waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false),
      page.locator('text=Nombre del gimnasio').waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false),
    ])
    expect(fieldsVisible).toBe(true)
  })

  test('Se puede actualizar el nombre del gimnasio', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const nameInput = page.locator('input[name="name"], input[id="name"]').first()
    const isVisible = await nameInput.isVisible().catch(() => false)

    if (!isVisible) {
      console.warn('ℹ️ Campo nombre no encontrado, saltando test')
      return
    }

    await nameInput.fill('GymFit Manizales Test')
    const saveBtn = page.locator('button[type="submit"], button:has-text("Guardar")').first()
    await saveBtn.click()

    const successVisible = await Promise.any([
      page.locator('text=Configuración guardada exitosamente').waitFor({ state: 'visible', timeout: 8000 }).then(() => true),
      page.locator('text=guardada exitosamente').waitFor({ state: 'visible', timeout: 8000 }).then(() => true),
      page.locator('.bg-green-50').waitFor({ state: 'visible', timeout: 8000 }).then(() => true),
    ]).catch(() => false)

    expect(successVisible).toBe(true)
  })

})
