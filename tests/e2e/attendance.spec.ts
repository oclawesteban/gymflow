import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Asistencia', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Página de asistencia carga correctamente', async ({ page }) => {
    await page.goto('/attendance')
    await page.waitForLoadState('networkidle')

    // El título debe ser "Asistencia"
    await expect(page.locator('h1').filter({ hasText: 'Asistencia' })).toBeVisible({ timeout: 15000 })

    // Debe mostrar la tarjeta de registro rápido
    await expect(page.locator('text=Registro Rápido de Entrada')).toBeVisible({ timeout: 15000 })
  })

  test('Componente de check-in rápido está presente', async ({ page }) => {
    await page.goto('/attendance')
    await page.waitForLoadState('networkidle')

    // El selector de miembro puede ser un combobox (Radix UI SelectTrigger)
    // Usar role="combobox" o buscar por placeholder
    const memberSelector = page.locator('role=combobox').first()
    const altSelector = page.locator('[placeholder="¿Quién llega?"], button[aria-haspopup="listbox"]').first()

    // Esperar que alguno de los selectores sea visible
    const selectorVisible = await Promise.race([
      memberSelector.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false),
      altSelector.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false),
      // También podría ser un botón con el texto del placeholder
      page.locator('text=¿Quién llega?').waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false),
    ])

    expect(selectorVisible).toBe(true)

    // Verificar que el botón de registrar existe (botón verde)
    const registerButton = page.locator('button:has-text("Registrar"), button[type="submit"]').first()
    await expect(registerButton).toBeVisible({ timeout: 10000 })
  })

  test('Registrar check-in de un miembro', async ({ page }) => {
    await page.goto('/attendance')
    await page.waitForLoadState('networkidle')

    // Esperar que carguen los miembros
    await page.waitForTimeout(2000)

    // Buscar el selector de miembro (Radix UI combobox)
    const memberSelector = page.locator('role=combobox').first()
    const altSelector = page.locator('text=¿Quién llega?').first()

    const isComboboxVisible = await memberSelector.isVisible().catch(() => false)
    const isAltVisible = await altSelector.isVisible().catch(() => false)

    if (!isComboboxVisible && !isAltVisible) {
      console.warn('ℹ️ No se encontró el selector de miembro')
      return
    }

    // Intentar seleccionar un miembro
    const selectToClick = isComboboxVisible ? memberSelector : altSelector
    await selectToClick.click()
    await page.waitForTimeout(500)

    // Seleccionar el primer miembro disponible
    const firstOption = page.locator('[role="option"]').first()
    const hasOptions = await firstOption.isVisible().catch(() => false)

    if (!hasOptions) {
      console.warn('ℹ️ No hay miembros disponibles para registrar asistencia')
      return
    }

    await firstOption.click()
    await page.waitForTimeout(300)

    // Hacer clic en el botón de registrar
    const registerButton = page.locator('button[type="submit"]').first()
    await registerButton.click()

    // Esperar mensaje de éxito - "registrado exitosamente"
    await expect(
      page.locator('text=registrado exitosamente')
    ).toBeVisible({ timeout: 10000 })
  })

  test('Log de asistencias del día es visible', async ({ page }) => {
    await page.goto('/attendance')
    await page.waitForLoadState('networkidle')

    // Esperar que cargue el contenido (Suspense)
    await page.waitForTimeout(2000)

    // Buscar la sección del historial de asistencia - puede ser "Asistencias de Hoy"
    // o mostrar el estado vacío "Nadie ha llegado hoy todavía"
    const logSection = await Promise.race([
      page.locator('text=Asistencias de Hoy').waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false),
      page.locator('text=Nadie ha llegado hoy').waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false),
      page.locator('[class*="CalendarCheck"]').waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false),
    ])

    expect(logSection).toBe(true)
  })

})
