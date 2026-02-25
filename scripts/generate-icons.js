// Script para generar iconos PNG para la PWA de GymFlow
const sharp = require('sharp')
const path = require('path')

// SVG del ícono de GymFlow
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="96" fill="#2563eb"/>
  <!-- Mancuerna (dumbbell) dibujada con paths -->
  <g fill="white">
    <!-- Barra central -->
    <rect x="176" y="236" width="160" height="40" rx="8"/>
    <!-- Peso izquierdo exterior -->
    <rect x="100" y="200" width="40" height="112" rx="12"/>
    <!-- Peso izquierdo interior -->
    <rect x="140" y="216" width="36" height="80" rx="6"/>
    <!-- Peso derecho interior -->
    <rect x="336" y="216" width="36" height="80" rx="6"/>
    <!-- Peso derecho exterior -->
    <rect x="372" y="200" width="40" height="112" rx="12"/>
  </g>
</svg>`

async function generarIconos() {
  const iconoBuffer = Buffer.from(svgIcon)
  const publicDir = path.join(__dirname, '..', 'public')

  // Generar 192x192
  await sharp(iconoBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'))
  console.log('✅ icon-192.png generado')

  // Generar 512x512
  await sharp(iconoBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'))
  console.log('✅ icon-512.png generado')

  console.log('🎉 Iconos PWA generados exitosamente')
}

generarIconos().catch(console.error)
