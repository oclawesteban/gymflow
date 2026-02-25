import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Perfil de usuario', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Página de perfil carga correctamente', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1').filter({ hasText: /Perfil|Mi perfil/i })).toBeVisible({ timeout: 15000 })
  })

  test('Formulario de perfil tiene campos editables', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    const nameField = await Promise.race([
      page.locator('input[name="name"], input[id="name"]').waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false),
      page.locator('text=Nombre').waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false),
    ])
    expect(nameField).toBe(true)
  })

  test('Sección de cambio de contraseña es visible', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    const pwSection = await Promise.any([
      page.locator('text=Cambiar Contraseña').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      page.locator('text=Contraseña actual').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      page.locator('input[id="currentPassword"]').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
    ]).catch(() => false)
    expect(pwSection).toBe(true)
  })

  test('Página de recuperar contraseña carga', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')
    const visible = await Promise.any([
      page.locator('text=contraseña').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
    ]).catch(() => false)
    expect(visible).toBe(true)
  })

})
