import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

const MEMBER_NAME = `Test QA ${Date.now()}`
const MEMBER_PHONE = '3001234567'
const MEMBER_EMAIL = `qa${Date.now()}@test.com`

test.describe('Miembros', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Lista de miembros carga correctamente', async ({ page }) => {
    await page.goto('/members')
    await page.waitForLoadState('networkidle')

    // El título de la página debe ser "Miembros"
    await expect(page.locator('h1').filter({ hasText: 'Miembros' })).toBeVisible({ timeout: 15000 })

    // Debe haber un botón de "Nuevo Miembro"
    await expect(page.locator('a[href="/members/new"]').first()).toBeVisible()
  })

  test('Crear nuevo miembro con todos los campos', async ({ page }) => {
    await page.goto('/members/new')
    await page.waitForLoadState('networkidle')

    // Verificar que la página de nuevo miembro cargó
    await expect(page.locator('h1').filter({ hasText: 'Nuevo Miembro' })).toBeVisible({ timeout: 15000 })

    // Llenar el formulario
    await page.fill('input[name="name"]', MEMBER_NAME)
    await page.fill('input[name="phone"]', MEMBER_PHONE)
    await page.fill('input[name="email"]', MEMBER_EMAIL)
    await page.fill('input[name="emergencyContact"]', 'Contacto Emergencia Test')
    await page.fill('input[name="emergencyPhone"]', '3009876543')

    // Buscar el textarea de notas
    const notesTextarea = page.locator('textarea[name="notes"], textarea[id="notes"]')
    if (await notesTextarea.isVisible()) {
      await notesTextarea.fill('Miembro de prueba creado por QA E2E')
    }

    // Enviar el formulario
    await page.click('button[type="submit"]:has-text("Guardar Miembro")')

    // Debe redirigir al detalle del miembro
    await page.waitForURL('**/members/**', { timeout: 20000 })
    await expect(page).toHaveURL(/\/members\/[a-z0-9]+/)
  })

  test('Ver detalle de un miembro', async ({ page }) => {
    await page.goto('/members')
    await page.waitForLoadState('networkidle')

    // Hacer clic en el primer miembro de la lista
    const memberCard = page.locator('a[href^="/members/"]').first()
    await expect(memberCard).toBeVisible({ timeout: 15000 })
    await memberCard.click()

    // Verificar que se cargó la página de detalle
    await page.waitForURL('**/members/**')
    await expect(page).toHaveURL(/\/members\/[a-z0-9]+/)
  })

  test('Buscar/filtrar miembros en la lista', async ({ page }) => {
    await page.goto('/members')
    await page.waitForLoadState('networkidle')

    // Verificar que la página cargó
    await expect(page.locator('h1').filter({ hasText: 'Miembros' })).toBeVisible({ timeout: 15000 })

    // Verificar que existe el campo de búsqueda
    const searchInput = page.locator('input[type="search"]')
    await expect(searchInput).toBeVisible({ timeout: 10000 })

    // Escribir en el campo de búsqueda
    await searchInput.fill('Test')

    // Esperar que se aplique el filtro (debounce de 400ms + navegación)
    await page.waitForTimeout(600)
    await page.waitForLoadState('networkidle')

    // La URL debe tener el parámetro q=Test
    await expect(page).toHaveURL(/q=Test/)
  })

})
