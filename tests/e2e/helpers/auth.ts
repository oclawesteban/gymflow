import { Page } from '@playwright/test'

export const TEST_EMAIL = 'admin@gymflow.co'
export const TEST_PASSWORD = 'gymflow123'

/**
 * Realiza el login y espera la redirección al dashboard
 */
export async function login(page: Page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  // Esperar redirección al dashboard
  await page.waitForURL('**/dashboard', { timeout: 20000 })
}

/**
 * Verifica que el usuario está logueado, si no lo está, hace login
 */
export async function ensureLoggedIn(page: Page) {
  const url = page.url()
  if (!url.includes('/dashboard') && !url.includes('/members') && !url.includes('/plans') &&
      !url.includes('/memberships') && !url.includes('/payments') && !url.includes('/attendance')) {
    await login(page)
  }
}
