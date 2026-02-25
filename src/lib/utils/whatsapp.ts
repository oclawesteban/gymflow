export function buildWhatsAppReminderUrl(params: {
  phone: string
  memberName: string
  gymName: string
  planName: string
  expiresAt: Date
}): string {
  // Clean phone: remove spaces, dashes, +57 prefix, add 57 country code
  const cleanPhone = '57' + params.phone.replace(/\D/g, '').replace(/^57/, '')

  const daysLeft = Math.ceil((params.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  let message: string
  if (daysLeft <= 0) {
    message = `Hola ${params.memberName} 👋, te recordamos que tu membresía *${params.planName}* en *${params.gymName}* ya venció. ¡Renuévala hoy y sigue entrenando! 💪`
  } else if (daysLeft === 1) {
    message = `Hola ${params.memberName} 👋, tu membresía *${params.planName}* en *${params.gymName}* vence *mañana*. ¡No pierdas tu acceso, renuévala hoy! 💪`
  } else {
    message = `Hola ${params.memberName} 👋, tu membresía *${params.planName}* en *${params.gymName}* vence en *${daysLeft} días*. ¡Renuévala a tiempo y sigue entrenando sin interrupciones! 💪`
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}
