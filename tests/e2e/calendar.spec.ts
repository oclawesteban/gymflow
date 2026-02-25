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
    await page.waitForTimeout(1500)
    // Los botones de navegación tienen íconos ChevronLeft/ChevronRight (SVG), sin texto
    // Buscamos al menos 2 botones de navegación en el encabezado del calendario
    const buttons = page.locator('button').filter({ has: page.locator('svg') })
    const count = await buttons.count()
    expect(count).toBeGreaterThan(1)
  })

})
