import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')
  
  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      plan: 'STARTER',
    },
  })
  
  console.log(`Created user with id: ${user.id}`)

  // Create a test brand
  const brand = await prisma.brand.create({
    data: {
      name: 'Test Brand',
      userId: user.id,
      status: 'ACTIVE',
      brain: {
        create: {
          toneDescriptors: ['professional', 'innovative'],
          primaryColors: ['#000000', '#ffffff'],
        }
      }
    }
  })

  console.log(`Created brand with id: ${brand.id}`)

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
