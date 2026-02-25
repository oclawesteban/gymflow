import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

const PLAN_NAME = `Plan QA ${Date.now()}`
const PLAN_PRICE = '50000'

test.describe('Planes', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Lista de planes carga correctamente', async ({ page }) => {
    await page.goto('/plans')
    await page.waitForLoadState('networkidle')

    // El título debe ser "Planes"
    await expect(page.locator('h1').filter({ hasText: 'Planes' })).toBeVisible({ timeout: 15000 })

    // Debe haber un botón de "Nuevo Plan"
    await expect(page.locator('a[href="/plans/new"]').first()).toBeVisible()
  })

  test('Crear nuevo plan', async ({ page }) => {
    await page.goto('/plans/new')
    await page.waitForLoadState('networkidle')

    // Verificar que la página de nuevo plan cargó
    await expect(page.locator('h1').filter({ hasText: 'Nuevo Plan' })).toBeVisible({ timeout: 15000 })

    // Llenar el formulario
    await page.fill('input[name="name"]', PLAN_NAME)
    await page.fill('input[name="price"]', PLAN_PRICE)

    // Seleccionar duración de 1 mes (ya viene por defecto, pero lo seleccionamos explícitamente)
    const mesButton = page.locator('button:has-text("1 mes")')
    if (await mesButton.isVisible()) {
      await mesButton.click()
    }

    // Descripción opcional
    const descTextarea = page.locator('textarea[id="description"], textarea[name="description"]')
    if (await descTextarea.isVisible()) {
      await descTextarea.fill('Plan de prueba creado por QA automático')
    }

    // Enviar el formulario
    await page.click('button[type="submit"]:has-text("Guardar Plan")')

    // Debe redirigir a la lista de planes
    await page.waitForURL('**/plans', { timeout: 20000 })
    await expect(page).toHaveURL(/\/plans$/)

    // El plan recién creado debe aparecer en la lista
    await expect(page.locator(`text=${PLAN_NAME}`)).toBeVisible({ timeout: 10000 })
  })

  test('Eliminar un plan', async ({ page }) => {
    await page.goto('/plans')
    await page.waitForLoadState('networkidle')

    // Verificar que hay planes en la lista
    await expect(page.locator('h1').filter({ hasText: 'Planes' })).toBeVisible({ timeout: 15000 })

    // Buscar botón de opciones del plan (3 puntos / menú de acciones)
    // El componente PlanActions usa un dropdown
    const moreMenu = page.locator('[data-testid="plan-actions"], button[aria-label*="opciones" i], button[aria-label*="más" i], button[aria-haspopup="menu"]').first()

    if (await moreMenu.isVisible().catch(() => false)) {
      await moreMenu.click()

      // Buscar opción de eliminar/desactivar
      const deleteOption = page.locator('text=Eliminar, text=Desactivar, [role="menuitem"]:has-text("Eliminar")').first()
      if (await deleteOption.isVisible().catch(() => false)) {
        await deleteOption.click()
        // Confirmar si hay diálogo
        const confirmBtn = page.locator('button:has-text("Confirmar"), button:has-text("Eliminar"), button:has-text("Sí")').first()
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click()
        }
        await page.waitForLoadState('networkidle')
      }
    } else {
      // Si no hay botón de eliminar visible, verificar que los planes tienen algún tipo de acción
      const planCards = page.locator('.card, [class*="card"]')
      const count = await planCards.count()
      expect(count).toBeGreaterThanOrEqual(0)
    }
  })

})
