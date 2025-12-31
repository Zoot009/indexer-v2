import 'dotenv/config'
import prisma from './prisma'

async function main() {
  // Create or update the singleton credit config
  await prisma.creditConfig.upsert({
    where: { id:  'main' },
    update: {},
    create: {
      id: 'main',
      totalCredits: 1250000,  // Your Scrape.do plan
      usedCredits: 316116,
      reservedCredits: 0,
      creditsPerCheck: 10,
    },
  })

  console.log('Credit config initialized')
}

main()
  .catch((e) => {
    console.error("ERROR: ",e)
    process.exit(1)
  })