/**
 * Static marketing content that never lived in the database:
 * stats, training programmes and certifications. Catalogue data (products,
 * categories, hero slides, reviews) lives in /content (see lib/content.ts).
 */

export interface StatItem {
  label: string;
  value: number;
  suffix?: string;
}

export const stats: StatItem[] = [
  { label: "Happy Customers", value: 12000, suffix: "+" },
  { label: "Kg Harvested Monthly", value: 8500, suffix: "kg" },
  { label: "Restaurant Partners", value: 320, suffix: "+" },
  { label: "Years of Experience", value: 9, suffix: "" },
];

export interface TrainingProgram {
  id: string;
  slug: string;
  title: string;
  duration: string;
  fee: number;
  trainer: string;
  startDate: string;
  seatsLeft: number;
  image: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  modules: string[];
  description: string;
}

export const trainingPrograms: TrainingProgram[] = [
  {
    id: "t1",
    slug: "oyster-mushroom-crash-course",
    title: "Oyster Mushroom Crash Course",
    duration: "1 Day",
    fee: 1500,
    trainer: "Mathesh",
    startDate: "2026-07-18",
    seatsLeft: 6,
    level: "Beginner",
    image:
      "https://images.unsplash.com/photo-1574316071802-0d684efa7ea5?q=80&w=1000&auto=format&fit=crop",
    modules: ["Spawn selection", "Substrate preparation", "Bag cultivation", "Harvesting basics"],
    description:
      "A hands-on, single-day introduction to oyster mushroom farming — perfect for beginners looking to start a small home setup.",
  },
  {
    id: "t2",
    slug: "commercial-mushroom-cultivation",
    title: "Commercial Mushroom Cultivation",
    duration: "2 Weeks",
    fee: 8500,
    trainer: "Dr. Kavitha Raman",
    startDate: "2026-08-03",
    seatsLeft: 12,
    level: "Intermediate",
    image:
      "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=1000&auto=format&fit=crop",
    modules: ["Farm setup & climate control", "Multi-variety cultivation", "Pest & disease management", "Market linkages"],
    description:
      "Our flagship comprehensive program covering everything needed to start and scale a commercial mushroom farming business.",
  },
  {
    id: "t3",
    slug: "value-added-products-workshop",
    title: "Value-Added Products Workshop",
    duration: "3 Days",
    fee: 3200,
    trainer: "Lakshmi Narayanan",
    startDate: "2026-07-28",
    seatsLeft: 9,
    level: "Advanced",
    image:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1000&auto=format&fit=crop",
    modules: ["Pickling & preservation", "Dehydration techniques", "Packaging & branding", "Selling online"],
    description:
      "Learn to turn fresh harvest into shelf-stable, sellable products like pickles, powders, and dried mushrooms.",
  },
];

export function getTrainingBySlug(slug: string) {
  return trainingPrograms.find((t) => t.slug === slug);
}

export const certifications = [
  { name: "FSSAI Registered", icon: "ShieldCheck" },
  { name: "Farm Quality Checked", icon: "BadgeCheck" },
  { name: "Naturally Grown", icon: "Leaf" },
  { name: "Carefully Packed", icon: "FlaskConical" },
];
