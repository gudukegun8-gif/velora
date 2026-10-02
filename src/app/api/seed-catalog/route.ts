import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// One-time starter catalog seed. Delete this route after use.
// Protected by a random secret + idempotency (no-op if products exist).
const SEED_KEY = "vlr-seed-9f3k7q2x8m4p6t1w5z0ab8cd2ef4gh6";

type SeedProduct = {
  slug: string;
  title: string;
  shortDescription: string;
  categorySlug: string;
  gender: "WOMEN" | "MEN" | "UNISEX";
  merchantSlug: string;
  merchantName: string;
  merchantWebsite: string;
  price: number;
  affiliateUrl: string;
  trending?: boolean;
  featured?: boolean;
  trendScore?: number;
};

const MERCHANTS: Array<{ slug: string; name: string; website: string }> = [
  { slug: "nike", name: "Nike", website: "https://www.nike.com" },
  { slug: "manduka", name: "Manduka", website: "https://www.manduka.com" },
  { slug: "girlstrong", name: "Girlstrong", website: "https://www.girlstronginc.com" },
  { slug: "target", name: "Target", website: "https://www.target.com" },
  { slug: "shopmy", name: "ShopMy", website: "https://shopmy.us" },
  { slug: "stamina", name: "Stamina Products", website: "https://staminaproducts.com" },
  { slug: "rogue-fitness", name: "Rogue Fitness", website: "https://www.roguefitness.com" },
  { slug: "aer", name: "Aer", website: "https://aersf.com" },
  { slug: "therabody", name: "Therabody", website: "https://www.therabody.com" },
  { slug: "ringside", name: "Ringside", website: "https://www.ringside.com" },
];

const PRODUCTS: SeedProduct[] = [
  {
    slug: "nike-metcon-10-womens",
    title: "Nike Metcon 10 Women's Training Shoes",
    shortDescription: "Stable lifting platform with responsive cushioning for training days.",
    categorySlug: "strength-training",
    gender: "WOMEN",
    merchantSlug: "nike",
    merchantName: "Nike",
    merchantWebsite: "https://www.nike.com",
    price: 155,
    affiliateUrl: "https://www.nike.com/t/metcon-10-womens-training-shoes-EGL2tQMt/HQ2620-102",
    trending: true,
    featured: true,
    trendScore: 95,
  },
  {
    slug: "manduka-pro-yoga-mat-6mm",
    title: "Manduka PRO Yoga Mat (6mm)",
    shortDescription: "Dense 6mm cushioning that's kind to joints, built to last for years.",
    categorySlug: "yoga",
    gender: "WOMEN",
    merchantSlug: "manduka",
    merchantName: "Manduka",
    merchantWebsite: "https://www.manduka.com",
    price: 144,
    affiliateUrl: "https://www.manduka.com/products/manduka-pro-yoga-mat",
    trending: true,
    trendScore: 92,
  },
  {
    slug: "girlstrong-high-waistband-legging",
    title: "Girlstrong High-Waistband Legging",
    shortDescription: "High-waisted training legging with a sculpting, stay-put fit.",
    categorySlug: "activewear",
    gender: "WOMEN",
    merchantSlug: "girlstrong",
    merchantName: "Girlstrong",
    merchantWebsite: "https://www.girlstronginc.com",
    price: 83,
    affiliateUrl: "https://www.girlstronginc.com/products/the-perfect-high-waistband-legging-white",
  },
  {
    slug: "bala-bangles-3lb-set",
    title: "Bala Bangles 3lb Wrist & Ankle Weight Set",
    shortDescription: "Wearable 3 lb weights for wrists or ankles — low-impact training, elevated.",
    categorySlug: "fitness-accessories",
    gender: "WOMEN",
    merchantSlug: "target",
    merchantName: "Target",
    merchantWebsite: "https://www.target.com",
    price: 79,
    affiliateUrl: "https://www.target.com/p/bala-3lb-bangles-charcoal/-/A-94680316",
  },
  {
    slug: "bowflex-selecttech-552",
    title: "Bowflex SelectTech 552 Adjustable Dumbbells (Pair)",
    shortDescription: "Adjustable dumbbells replacing 15 sets of weights, 5 to 52.5 lbs each.",
    categorySlug: "strength-training",
    gender: "WOMEN",
    merchantSlug: "shopmy",
    merchantName: "ShopMy",
    merchantWebsite: "https://shopmy.us",
    price: 399,
    affiliateUrl: "https://shopmy.us/shop/product/975394",
  },
  {
    slug: "aeropilates-magic-circle",
    title: "AeroPilates Magic Circle (14-inch)",
    shortDescription: "Resistance ring for Pilates toning work — arms, thighs, and core.",
    categorySlug: "pilates",
    gender: "WOMEN",
    merchantSlug: "stamina",
    merchantName: "Stamina Products",
    merchantWebsite: "https://staminaproducts.com",
    price: 44.99,
    affiliateUrl: "https://staminaproducts.com/products/aeropilates-magic-circle-2",
  },
  {
    slug: "nike-metcon-10-mens",
    title: "Nike Metcon 10 Men's Workout Shoes",
    shortDescription: "Stable lifting platform with responsive cushioning for training days.",
    categorySlug: "men-strength-training",
    gender: "MEN",
    merchantSlug: "nike",
    merchantName: "Nike",
    merchantWebsite: "https://www.nike.com",
    price: 119.97,
    affiliateUrl: "https://www.nike.com/t/metcon-10-mens-workout-shoes-WWGl2m1D/HJ1875-500",
    trending: true,
    featured: true,
    trendScore: 94,
  },
  {
    slug: "rogue-kettlebell-e-coat",
    title: "Rogue Kettlebell – E-Coat",
    shortDescription: "E-coat cast-iron kettlebell for swings, presses, and carries.",
    categorySlug: "men-strength-training",
    gender: "MEN",
    merchantSlug: "rogue-fitness",
    merchantName: "Rogue Fitness",
    merchantWebsite: "https://www.roguefitness.com",
    price: 48,
    affiliateUrl: "https://www.roguefitness.com/rogue-kettlebell-e-coat",
  },
  {
    slug: "rogue-jammer-pull-up-bar",
    title: "Rogue Jammer Pull-Up Bar",
    shortDescription: "Doorway-mounted pull-up bar for serious home training.",
    categorySlug: "men-workout-equipment",
    gender: "MEN",
    merchantSlug: "rogue-fitness",
    merchantName: "Rogue Fitness",
    merchantWebsite: "https://www.roguefitness.com",
    price: 150,
    affiliateUrl: "https://www.roguefitness.com/rogue-jammer-pull-up-bar",
  },
  {
    slug: "aer-gym-duffel-3",
    title: "Aer Gym Duffel 3",
    shortDescription: "Structured everyday gym duffel from Aer — built for daily training.",
    categorySlug: "men-fitness-accessories",
    gender: "MEN",
    merchantSlug: "aer",
    merchantName: "Aer",
    merchantWebsite: "https://aersf.com",
    price: 169,
    affiliateUrl: "https://aersf.com/products/gym-duffel-3",
  },
  {
    slug: "theragun-relief",
    title: "Theragun Relief",
    shortDescription: "Percussive massage device for post-training muscle recovery.",
    categorySlug: "muscle-recovery",
    gender: "UNISEX",
    merchantSlug: "therabody",
    merchantName: "Therabody",
    merchantWebsite: "https://www.therabody.com",
    price: 159.99,
    affiliateUrl: "https://www.therabody.com/products/theragun-relief-charcoal",
    trending: true,
    trendScore: 90,
  },
  {
    slug: "trx-commercial-suspension-trainer",
    title: "TRX Commercial Suspension Trainer",
    shortDescription: "Commercial-grade suspension straps for full-body training anywhere.",
    categorySlug: "men-home-gym",
    gender: "MEN",
    merchantSlug: "ringside",
    merchantName: "Ringside",
    merchantWebsite: "https://www.ringside.com",
    price: 249.95,
    affiliateUrl: "https://www.ringside.com/trx-commercial-suspension-trainer.html",
  },
];

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("key") !== SEED_KEY) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existing = await db.product.count();
  if (existing > 0) {
    return NextResponse.json({ seeded: false, reason: "products already exist", count: existing });
  }

  // Upsert merchants.
  const merchantIds: Record<string, string> = {};
  for (const m of MERCHANTS) {
    const rec = await db.merchant.upsert({
      where: { slug: m.slug },
      update: { name: m.name, website: m.website, status: "ACTIVE" },
      create: { slug: m.slug, name: m.name, website: m.website, status: "ACTIVE", priority: 10 },
    });
    merchantIds[m.slug] = rec.id;
  }

  // Resolve categories.
  const categories = await db.category.findMany({
    where: { slug: { in: PRODUCTS.map((p) => p.categorySlug) } },
    select: { id: true, slug: true },
  });
  const categoryIds: Record<string, string> = {};
  for (const c of categories) categoryIds[c.slug] = c.id;

  const missing = PRODUCTS.filter((p) => !categoryIds[p.categorySlug]).map((p) => p.categorySlug);
  if (missing.length > 0) {
    return NextResponse.json({ error: "missing categories", missing }, { status: 500 });
  }

  // Create products.
  let created = 0;
  for (const p of PRODUCTS) {
    await db.product.create({
      data: {
        slug: p.slug,
        title: p.title,
        shortDescription: p.shortDescription,
        categoryId: categoryIds[p.categorySlug],
        gender: p.gender,
        merchantId: merchantIds[p.merchantSlug],
        price: p.price,
        currency: "USD",
        affiliateUrl: p.affiliateUrl,
        originalUrl: p.affiliateUrl,
        status: "PUBLISHED",
        isFeatured: p.featured ?? false,
        trendStatus: p.trending ? "PUBLISHED" : "DISCOVERED",
        trendScore: p.trendScore ?? 0,
        dataSource: "EDITORIAL",
      },
    });
    created += 1;
  }

  return NextResponse.json({ seeded: true, created });
}
