import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdminPage } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Add Product · Admin",
};

export default async function NewProductPage() {
  await requireAdminPage();

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return <ProductForm categories={categories} mode="create" />;
}
