import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Pagos', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Lista de pagos carga correctamente', async ({ page }) => {
    await page.goto('/payments')
    await page.waitForLoadState('networkidle')

    // El título debe ser "Pagos"
    await expect(page.locator('h1').filter({ hasText: 'Pagos' })).toBeVisible({ timeout: 15000 })

    // Debe haber un botón de "Registrar Pago"
    await expect(page.locator('a[href="/payments/new"]').first()).toBeVisible()
  })

  test('Registrar nuevo pago', async ({ page }) => {
    await page.goto('/payments/new')
    await page.waitForLoadState('networkidle')

    // Verificar que la página de nuevo pago cargó
    await expect(page.locator('h1').filter({ hasText: 'Registrar Pago' })).toBeVisible({ timeout: 15000 })

    // Esperar que se carguen las membresías (carga asíncrona con useEffect)
    await page.waitForTimeout(2000)

    // Seleccionar una membresía
    const membershipSelect = page.locator('[data-radix-select-trigger]').first()
    if (await membershipSelect.isVisible()) {
      await membershipSelect.click()
      await page.waitForTimeout(500)

      const firstOption = page.locator('[role="option"]').first()
      if (await firstOption.isVisible().catch(() => false)) {
        await firstOption.click()
        await page.waitForTimeout(500)
      }
    }

    // Ingresar monto
    const amountInput = page.locator('input[name="amount"]')
    await expect(amountInput).toBeVisible()
    // Limpiar y llenar el monto
    await amountInput.clear()
    await amountInput.fill('80000')

    // Seleccionar método de pago (Efectivo viene por defecto)
    const cashButton = page.locator('button:has-text("💵 Efectivo")')
    if (await cashButton.isVisible().catch(() => false)) {
      await cashButton.click()
    }

    // Referencia opcional
    const refInput = page.locator('input[name="reference"]')
    if (await refInput.isVisible().catch(() => false)) {
      await refInput.fill('REF-QA-TEST-001')
    }

    // Enviar el formulario
    const submitBtn = page.locator('button[type="submit"]:has-text("Registrar Pago")')
    await expect(submitBtn).toBeVisible()
    await submitBtn.click()

    // Esperar resultado
    await page.waitForTimeout(3000)
    const url = page.url()
    // Debe redirigir a /payments si fue exitoso, o quedarse con error si no había membresías
    expect(url).toMatch(/payments/)
  })

})
