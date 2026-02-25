import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Dashboard carga correctamente después de login', async ({ page }) => {
    await expect(page).toHaveURL(/dashboard/)
    // El dashboard debe tener el heading de bienvenida
    await expect(page.locator('h1').filter({ hasText: /Bienvenido|bienvenido/i })).toBeVisible({ timeout: 15000 })
  })

  test('Muestra las tarjetas de estadísticas', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Verificar que existen tarjetas de estadísticas
    await expect(page.locator('text=Miembros Activos')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('text=Membresías Vencidas')).toBeVisible()
    await expect(page.locator('text=Vencen Esta Semana')).toBeVisible()
    await expect(page.locator('text=Ingresos del Mes')).toBeVisible()
    await expect(page.locator('text=Asistencias Hoy')).toBeVisible()
    await expect(page.locator('text=Total Miembros')).toBeVisible()
  })

  test('Sección de últimos pagos y asistencia reciente son visibles', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Debe mostrar la sección de últimos pagos
    await expect(page.locator('text=Últimos Pagos')).toBeVisible({ timeout: 15000 })

    // Debe mostrar la sección de asistencia reciente
    await expect(page.locator('text=Asistencia Reciente')).toBeVisible()
  })

  test('Accesos rápidos (quick actions) están presentes', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Verificar botones de acción rápida
    await expect(page.locator('text=Registrar Asistencia')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('text=Nuevo Miembro')).toBeVisible()
    await expect(page.locator('text=Registrar Pago')).toBeVisible()
  })

})
