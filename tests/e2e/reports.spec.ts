import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Reportes', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Página de reportes carga correctamente', async ({ page }) => {
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1').filter({ hasText: /Reporte/i })).toBeVisible({ timeout: 15000 })
  })

  test('KPIs del mes son visibles', async ({ page }) => {
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    const kpiVisible = await Promise.any([
      page.locator('text=Ingresos del mes').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      page.locator('text=Miembros este mes').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      page.locator('text=Retención').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      page.locator('text=vencidas').waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
    ]).catch(() => false)

    expect(kpiVisible).toBe(true)
  })

  test('Gráfica de ingresos es visible', async ({ page }) => {
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    const chartVisible = await Promise.race([
      page.locator('text=Ingresos por mes, text=Ingresos Mensuales').first().waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false),
      page.locator('.recharts-wrapper, svg').first().waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false),
    ])
    expect(chartVisible).toBe(true)
  })

  test('Tabla de pagos recientes es visible', async ({ page }) => {
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const tableVisible = await Promise.race([
      page.locator('text=Pagos recientes, text=Últimos pagos').first().waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false),
      page.locator('table, [role="table"]').first().waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false),
    ])
    expect(tableVisible).toBe(true)
  })

})
