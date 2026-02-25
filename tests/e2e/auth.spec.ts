import { test, expect } from '@playwright/test'
import { login, TEST_EMAIL, TEST_PASSWORD } from './helpers/auth'

test.describe('Autenticación', () => {

  test('Login con credenciales válidas redirige al dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Verificar que la página de login cargó
    await expect(page.locator('h2')).toContainText('Iniciar Sesión')

    // Ingresar credenciales válidas
    await page.fill('input[name="email"]', TEST_EMAIL)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')

    // Debe redirigir al dashboard
    await page.waitForURL('**/dashboard', { timeout: 20000 })
    await expect(page).toHaveURL(/dashboard/)
  })

  test('Login con credenciales inválidas muestra error', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Ingresar credenciales incorrectas
    await page.fill('input[name="email"]', 'invalido@correo.com')
    await page.fill('input[name="password"]', 'contraseña_incorrecta')
    await page.click('button[type="submit"]')

    // Esperar mensaje de error
    await expect(page.locator('text=Correo o contraseña incorrectos')).toBeVisible({ timeout: 10000 })

    // Debe permanecer en la página de login
    await expect(page).toHaveURL(/login/)
  })

  test('Logout redirige a la página de login', async ({ page }) => {
    // Primero hacer login
    await login(page)

    // Verificar que estamos en el dashboard
    await expect(page).toHaveURL(/dashboard/)

    // Hacer logout (botón en el sidebar desktop)
    await page.click('button:has-text("Cerrar sesión")')

    // Debe redirigir al login
    await page.waitForURL('**/login', { timeout: 10000 })
    await expect(page).toHaveURL(/login/)
  })

})
