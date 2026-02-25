/**
 * Genera un código de gimnasio: 3 letras del nombre + 3 dígitos aleatorios
 * Ej: "GymFit Manizales" → "GYM" + "847" → "GYM847"
 */
export function generateGymCode(gymName: string): string {
  const letters = gymName
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3)
    .padEnd(3, "X")

  const digits = Math.floor(Math.random() * 900 + 100).toString() // 100–999

  return `${letters}${digits}`
}

/**
 * Genera un código completamente aleatorio (fallback)
 */
export function generateRandomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // sin I, O, 0, 1 (confusos)
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
