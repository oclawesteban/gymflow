import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { addDays, subDays } from "date-fns"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed...")

  // Clean up
  await prisma.attendance.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.membership.deleteMany()
  await prisma.member.deleteMany()
  await prisma.plan.deleteMany()
  await prisma.gym.deleteMany()
  await prisma.user.deleteMany()

  // Create gym owner
  const hashedPassword = await bcrypt.hash("gymflow123", 12)
  const owner = await prisma.user.create({
    data: {
      name: "Carlos Administrador",
      email: "admin@gymflow.co",
      password: hashedPassword,
      role: "OWNER",
    },
  })

  // Create gym
  const gym = await prisma.gym.create({
    data: {
      name: "GymFit Manizales",
      address: "Calle 50 #25-40, Centro, Manizales",
      phone: "3157890123",
      ownerId: owner.id,
    },
  })

  console.log("✅ Gimnasio creado:", gym.name)

  // Create plans
  const plans = await Promise.all([
    prisma.plan.create({
      data: {
        name: "Plan Mensual",
        description: "Acceso completo por 1 mes",
        price: 80000,
        durationDays: 30,
        gymId: gym.id,
      },
    }),
    prisma.plan.create({
      data: {
        name: "Plan Trimestral",
        description: "Acceso completo por 3 meses. ¡Ahorra un 15%!",
        price: 200000,
        durationDays: 90,
        gymId: gym.id,
      },
    }),
    prisma.plan.create({
      data: {
        name: "Plan Estudiante",
        description: "Para estudiantes con carné vigente. 1 mes.",
        price: 60000,
        durationDays: 30,
        gymId: gym.id,
      },
    }),
    prisma.plan.create({
      data: {
        name: "Plan Semestral",
        description: "La mejor inversión. 6 meses de entrenamiento.",
        price: 380000,
        durationDays: 180,
        gymId: gym.id,
      },
    }),
  ])

  console.log("✅ Planes creados:", plans.length)

  // Create members
  const membersData = [
    { name: "Juan Pérez García", phone: "3001234567", email: "juan.perez@gmail.com", emergencyContact: "María García", emergencyPhone: "3009876543" },
    { name: "Sofía Martínez López", phone: "3112345678", email: "sofia.martinez@gmail.com" },
    { name: "Andrés Torres Ríos", phone: "3223456789", email: "andres.torres@gmail.com", emergencyContact: "Carmen Torres", emergencyPhone: "3218765432" },
    { name: "Valentina Gómez Cruz", phone: "3334567890", email: "valentina.gomez@gmail.com" },
    { name: "Diego Sánchez Vargas", phone: "3445678901", email: "diego.sanchez@gmail.com" },
    { name: "Camila Rodríguez Mora", phone: "3156789012", email: "camila.rodriguez@gmail.com" },
    { name: "Felipe Castro Herrera", phone: "3267890123", email: "felipe.castro@gmail.com", notes: "Lesión en rodilla derecha — evitar sentadillas profundas" },
    { name: "Isabella Jiménez Ruiz", phone: "3378901234", email: "isabella.jimenez@gmail.com" },
    { name: "Mateo Álvarez Pinto", phone: "3189012345", email: "mateo.alvarez@gmail.com" },
    { name: "Luciana Moreno Silva", phone: "3290123456", email: "luciana.moreno@gmail.com" },
  ]

  const members = await Promise.all(
    membersData.map(data => prisma.member.create({ data: { ...data, gymId: gym.id } }))
  )

  console.log("✅ Miembros creados:", members.length)

  const now = new Date()

  // Memberships: mix of active, expired, expiring soon
  const membershipConfigs = [
    { memberIdx: 0, planIdx: 0, daysAgo: 15 },  // active, 15 days left
    { memberIdx: 1, planIdx: 1, daysAgo: 10 },  // active, 80 days left
    { memberIdx: 2, planIdx: 0, daysAgo: 25 },  // active, 5 days left (expiring soon!)
    { memberIdx: 3, planIdx: 2, daysAgo: 32 },  // expired
    { memberIdx: 4, planIdx: 0, daysAgo: 0 },   // active, new
    { memberIdx: 5, planIdx: 3, daysAgo: 5 },   // active, long
    { memberIdx: 6, planIdx: 0, daysAgo: 35 },  // expired
    { memberIdx: 7, planIdx: 1, daysAgo: 28 },  // active, 62 days left
    { memberIdx: 8, planIdx: 2, daysAgo: 3 },   // active, 27 days left
    { memberIdx: 9, planIdx: 0, daysAgo: 29 },  // expiring very soon
  ]

  const memberships = []
  for (const config of membershipConfigs) {
    const plan = plans[config.planIdx]
    const startDate = subDays(now, config.daysAgo)
    const endDate = addDays(startDate, plan.durationDays)
    const isExpired = endDate < now
    const membership = await prisma.membership.create({
      data: {
        memberId: members[config.memberIdx].id,
        planId: plan.id,
        startDate,
        endDate,
        status: isExpired ? "EXPIRED" : "ACTIVE",
      },
    })
    memberships.push(membership)
  }

  console.log("✅ Membresías creadas:", memberships.length)

  // Payments
  const paymentMethods = ["CASH", "NEQUI", "DAVIPLATA", "TRANSFER", "CASH", "CARD"] as const
  for (let i = 0; i < memberships.length; i++) {
    await prisma.payment.create({
      data: {
        membershipId: memberships[i].id,
        amount: plans[membershipConfigs[i].planIdx].price,
        method: paymentMethods[i % paymentMethods.length],
        paidAt: subDays(now, membershipConfigs[i].daysAgo),
      },
    })
  }

  console.log("✅ Pagos creados:", memberships.length)

  // Attendance: last 7 days
  for (let daysBack = 0; daysBack < 7; daysBack++) {
    const attendanceDate = subDays(now, daysBack)
    attendanceDate.setHours(7 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60))

    // 3-6 members per day
    const count = 3 + Math.floor(Math.random() * 4)
    const shuffled = [...members].sort(() => 0.5 - Math.random()).slice(0, count)

    for (const member of shuffled) {
      await prisma.attendance.create({
        data: { memberId: member.id, checkedIn: attendanceDate },
      })
    }
  }

  console.log("✅ Asistencia registrada (7 días)")

  console.log("\n🎉 Seed completado exitosamente!")
  console.log("📧 Email: admin@gymflow.co")
  console.log("🔑 Contraseña: gymflow123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
