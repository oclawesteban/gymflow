'use client'

import { buildWhatsAppReminderUrl } from '@/lib/utils/whatsapp'
import { WhatsAppReminderButton } from './whatsapp-reminder-button'

interface ExpiringMembership {
  id: string
  endDate: Date | string
  status: string
  member: {
    name: string
    phone: string | null
  }
  plan: {
    name: string
  }
  gymName: string
}

interface ExpiringSectionProps {
  memberships: ExpiringMembership[]
}

export function ExpiringSection({ memberships }: ExpiringSectionProps) {
  const withPhone = memberships.filter((m) => !!m.member.phone)

  const handleNotifyAll = () => {
    withPhone.forEach((m, i) => {
      setTimeout(() => {
        const url = buildWhatsAppReminderUrl({
          phone: m.member.phone!,
          memberName: m.member.name,
          gymName: m.gymName,
          planName: m.plan.name,
          expiresAt: new Date(m.endDate),
        })
        window.open(url, '_blank')
      }, i * 800) // 800ms delay between each to avoid popup blockers
    })
  }

  if (memberships.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-gray-700">
          Membresías por vencer o vencidas ({memberships.length})
        </h3>
        {withPhone.length > 1 && (
          <button
            onClick={handleNotifyAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}
            title="Abrir WhatsApp para cada miembro con número registrado"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Notificar a todos ({withPhone.length})
          </button>
        )}
      </div>

      <div className="space-y-2">
        {memberships.map((m) => {
          const now = Date.now()
          const msLeft = new Date(m.endDate).getTime() - now
          const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24))
          const isExpired = m.status === 'EXPIRED' || daysLeft <= 0

          return (
            <div
              key={m.id}
              className="flex items-center justify-between gap-2 py-2 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold text-sm flex-shrink-0">
                  {m.member.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{m.member.name}</p>
                  <p className="text-xs text-gray-500">
                    {isExpired
                      ? `Venció hace ${Math.abs(daysLeft)} día${Math.abs(daysLeft) !== 1 ? 's' : ''}`
                      : daysLeft === 1
                      ? 'Vence mañana'
                      : `Vence en ${daysLeft} días`}
                  </p>
                </div>
              </div>
              {m.member.phone ? (
                <WhatsAppReminderButton
                  phone={m.member.phone}
                  memberName={m.member.name}
                  gymName={m.gymName}
                  planName={m.plan.name}
                  expiresAt={new Date(m.endDate)}
                />
              ) : (
                <span className="text-xs text-gray-400 italic">Sin teléfono</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
