/**
 * VÉLORA seed script — idempotent via upsert.
 *
 * Seeds ONLY structural data: categories, merchants, site settings,
 * and (optionally) a first admin user.
 *
 * NO products, NO articles, NO fake data — those are added via the admin panel.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

type SubDef = { slug: string; name: string; tagline: string; gender: "WOMEN" | "MEN" | "UNISEX" };

const TOP_LEVEL: Array<{
  slug: string;
  name: string;
  tagline: string;
  gender: "WOMEN" | "MEN" | "UNISEX";
  image: string | null;
  subs: SubDef[];
}> = [
  {
    slug: "women",
    name: "Women",
    tagline: "Training essentials curated for her.",
    gender: "WOMEN",
    image: "/images/womens-fitness.png",
    subs: [
      { slug: "pilates", name: "Pilates", tagline: "Reformers, rings, bands & studio staples.", gender: "WOMEN" },
      { slug: "yoga", name: "Yoga", tagline: "Mats, blocks & flow essentials.", gender: "WOMEN" },
      { slug: "home-workouts", name: "Home Workouts", tagline: "Everything for training at home.", gender: "WOMEN" },
      { slug: "strength-training", name: "Strength Training", tagline: "Dumbbells, kettlebells & lifting gear.", gender: "WOMEN" },
      { slug: "glute-training", name: "Glute Training", tagline: "Bands, hip thrusters & booty builders.", gender: "WOMEN" },
      { slug: "cardio", name: "Cardio", tagline: "Conditioning equipment & accessories.", gender: "WOMEN" },
      { slug: "walking", name: "Walking", tagline: "Walking pads & low-impact movement.", gender: "WOMEN" },
      { slug: "mobility", name: "Mobility", tagline: "Stretching, flexibility & joint care.", gender: "WOMEN" },
      { slug: "fitness-accessories", name: "Fitness Accessories", tagline: "The little things that elevate training.", gender: "WOMEN" },
      { slug: "home-gym", name: "Home Gym", tagline: "Compact setups for small spaces.", gender: "WOMEN" },
      { slug: "activewear", name: "Activewear", tagline: "Performance pieces worth living in.", gender: "WOMEN" },
      { slug: "fitness-lifestyle", name: "Fitness Lifestyle", tagline: "Beyond the workout.", gender: "WOMEN" },
    ],
  },
  {
    slug: "men",
    name: "Men",
    tagline: "Serious training gear for him.",
    gender: "MEN",
    image: "/images/mens-fitness.png",
    subs: [
      { slug: "men-strength-training", name: "Strength Training", tagline: "Racks, weights & lifting essentials.", gender: "MEN" },
      { slug: "men-home-gym", name: "Home Gym", tagline: "Build the garage gym.", gender: "MEN" },
      { slug: "men-cardio", name: "Cardio", tagline: "Conditioning & endurance gear.", gender: "MEN" },
      { slug: "men-workout-equipment", name: "Workout Equipment", tagline: "Bars, benches & training tools.", gender: "MEN" },
      { slug: "men-fitness-accessories", name: "Fitness Accessories", tagline: "Belts, gloves & training aids.", gender: "MEN" },
      { slug: "men-activewear", name: "Activewear", tagline: "Built for the grind.", gender: "MEN" },
    ],
  },
  {
    slug: "equipment",
    name: "Equipment",
    tagline: "The gear behind the results.",
    gender: "UNISEX",
    image: "/images/equipment.png",
    subs: [],
  },
  {
    slug: "workouts",
    name: "Workouts",
    tagline: "Programs & training by goal.",
    gender: "UNISEX",
    image: null,
    subs: [],
  },
  {
    slug: "recovery",
    name: "Recovery",
    tagline: "Recover harder than you train.",
    gender: "UNISEX",
    image: "/images/recovery.png",
    subs: [
      { slug: "muscle-recovery", name: "Muscle Recovery", tagline: "Massage guns, compression & relief.", gender: "UNISEX" },
      { slug: "sleep", name: "Sleep", tagline: "Wind-down & sleep optimization.", gender: "UNISEX" },
      { slug: "mobility-tools", name: "Mobility Tools", tagline: "Foam rollers, balls & release tools.", gender: "UNISEX" },
    ],
  },
];

const MERCHANTS = [
  { slug: "amazon", name: "Amazon", website: "https://www.amazon.com", priority: 1 },
  { slug: "temu", name: "Temu", website: "https://www.temu.com", priority: 2 },
  { slug: "aliexpress", name: "AliExpress", website: "https://www.aliexpress.com", priority: 3 },
];

const SETTINGS: Array<{ key: string; value: string }> = [
  { key: "site_name", value: "VÉLORA" },
  { key: "site_tagline", value: "Premium Fitness & Lifestyle Product Discovery" },
  {
    key: "affiliate_disclosure_short",
    value:
      "VÉLORA may earn a commission when you buy through links on this page. This supports our independent curation at no extra cost to you.",
  },
];

async function main() {
  // Categories (parents first, then children via parent self-relation).
  let sortOrder = 0;
  for (const top of TOP_LEVEL) {
    const parent = await db.category.upsert({
      where: { slug: top.slug },
      update: {
        name: top.name,
        tagline: top.tagline,
        gender: top.gender,
        image: top.image,
        showInNav: true,
        sortOrder,
      },
      create: {
        slug: top.slug,
        name: top.name,
        tagline: top.tagline,
        gender: top.gender,
        image: top.image,
        showInNav: true,
        sortOrder,
      },
    });
    sortOrder += 1;

    let subOrder = 0;
    for (const sub of top.subs) {
      await db.category.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name,
          tagline: sub.tagline,
          gender: sub.gender,
          parentId: parent.id,
          showInNav: false,
          sortOrder: subOrder,
        },
        create: {
          slug: sub.slug,
          name: sub.name,
          tagline: sub.tagline,
          gender: sub.gender,
          parentId: parent.id,
          showInNav: false,
          sortOrder: subOrder,
        },
      });
      subOrder += 1;
    }
  }

  // Merchants.
  for (const m of MERCHANTS) {
    await db.merchant.upsert({
      where: { slug: m.slug },
      update: { name: m.name, website: m.website, priority: m.priority, status: "ACTIVE" },
      create: {
        slug: m.slug,
        name: m.name,
        website: m.website,
        priority: m.priority,
        status: "ACTIVE",
      },
    });
  }

  // Site settings.
  for (const s of SETTINGS) {
    await db.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  // Optional first admin user.
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (adminEmail && adminPasswordHash) {
    const existing = await db.adminUser.count();
    if (existing === 0) {
      await db.adminUser.create({
        data: { email: adminEmail, passwordHash: adminPasswordHash },
      });
      console.log(`Admin user created: ${adminEmail}`);
    } else {
      console.log("Admin user(s) already exist — skipping creation.");
    }
  } else {
    console.warn(
      "WARNING: ADMIN_EMAIL and/or ADMIN_PASSWORD_HASH are not set. " +
        "No admin user was created. Set both env vars and re-run the seed to create one."
    );
  }

  const counts = await db.$transaction([
    db.category.count(),
    db.merchant.count(),
    db.siteSetting.count(),
    db.adminUser.count(),
  ]);
  console.log(`Seeded ${counts[0]} categories, ${counts[1]} merchants, ${counts[2]} site settings, ${counts[3]} admin users.`);
  console.log("0 products seeded (by design — add via admin).");
  console.log("0 articles seeded (by design — add via admin).");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
