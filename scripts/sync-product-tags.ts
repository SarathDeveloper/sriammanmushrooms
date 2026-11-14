import "dotenv/config";
import { products } from "../lib/data";
import { prisma } from "../lib/prisma";

async function main() {
  for (const product of products) {
    const result = await prisma.product.updateMany({
      where: { slug: product.slug },
      data: {
        highlights: product.highlights,
        tag: product.tag ?? null,
      },
    });
    console.log(`${product.slug}: highlights synced (${result.count})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
