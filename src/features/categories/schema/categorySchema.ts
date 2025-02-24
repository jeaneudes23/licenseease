import { licenseCategories } from "@/features/licenses/schema/licenseSchema";

export const categories = licenseCategories.map(category => category.name).map(category => ({
  name: category,
  description: category
}))