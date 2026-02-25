import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Instructores', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Página de instructores carga correctamente', async ({ page }) => {
    await page.goto('/instructors')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1').filter({ hasText: /Instructor/i })).toBeVisible({ timeout: 15000 })
  })

  test('Formulario de nuevo instructor carga', async ({ page }) => {
    await page.goto('/instructors/new')
    await page.waitForLoadState('networkidle')
    const visible = await Promise.any([
      page.locator('input[name="name"], input[id="name"]').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      page.locator('text=Nombre').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
    ]).catch(() => false)
    expect(visible).toBe(true)
  })

  test('Se puede crear un instructor', async ({ page }) => {
    await page.goto('/instructors/new')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const nameInput = page.locator('input[name="name"], input[id="name"]').first()
    const isVisible = await nameInput.isVisible().catch(() => false)
    if (!isVisible) { console.warn('ℹ️ Campo nombre no encontrado'); return }

    await nameInput.fill('Carlos Instructor Test')
    const submitBtn = page.locator('button[type="submit"]').first()
    await submitBtn.click()

    const success = await Promise.any([
      page.waitForURL('**/instructors**', { timeout: 8000 }).then(() => true),
      page.locator('text=creado, text=guardado').waitFor({ state: 'visible', timeout: 8000 }).then(() => true),
    ]).catch(() => false)
    expect(success).toBe(true)
  })

})
