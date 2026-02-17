import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const brandCount = await prisma.brand.count()
    const campaignCount = await prisma.campaign.count()
    const generationCount = await prisma.generation.count()
    const userCount = await prisma.user.count()

    console.log({
        brandCount,
        campaignCount,
        generationCount,
        userCount
    })

    if (brandCount > 0) {
        const brands = await prisma.brand.findMany({
            include: { _count: { select: { generations: true } } }
        })
        console.log('Brands:', brands.map(b => ({ name: b.name, genCount: b._count.generations })))
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
