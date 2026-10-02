import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// One-time Temu catalog import — batch 2 (12 more trending fitness products). Retired after use.
const SECRET = "vlr-temu-12-q8w4e2r6t1y7u3i5o9p";
const MERCHANT = { slug: "temu", name: "Temu", website: "https://www.temu.com" };

const PRODUCTS = [
    {
      key: "temu-merach-soft-kettlebell",
      name: "MERACH Soft Kettlebell, Non-Slip Wide Grip Handle, Soft Cushioned Horizontal Base, Filled with Fine Mineral Sand, Premium Kettle Bell for Safe Strength Training",
      price: 25.35,
      reviews: 0,
      image: "https://img.kwcdn.com/product/fancy/1c4a31c0-cfe3-4a15-80dc-f9a5f17d2181.jpg",
      aff: "https://temu.to/k/poparcqpqfd",
      cat: "strength-training",
      gender: "UNISEX",
    },
    {
      key: "temu-soges-pvc-kettlebell",
      name: "SOGES PVC Integrated Kettlebell, Wide Handle, Strength Training Kettlebell, Weights from 10 Lbs to 30 Lbs Optional, Suitable for Women of Different Fitness Levels, Iron Sand Filled Soft Kettlebell",
      price: 31.91,
      reviews: 0,
      image: "https://img.kwcdn.com/product/fancy/b1dd0735-4b78-44c3-a8a9-ba0202639bc9.jpg",
      aff: "https://temu.to/k/pnfmgzj22ki",
      cat: "strength-training",
      gender: "WOMEN",
    },
    {
      key: "temu-soft-kettlebell-cushioned-base",
      name: "Soft Kettlebell with Cushioned Base & Anti-Slip Non-Suitable for Home Gym Weight Training - Impact-Resistant Kettlebell Suitable for Women & Men, Strength Training Equipment with Non-Slip Gloves, Safe for Workouts",
      price: 21.7,
      reviews: 0,
      image: "https://img.kwcdn.com/product/fancy/16d6968e-d8fa-474f-8abc-0cfe18e7d99b.jpg",
      aff: "https://temu.to/k/pr084zudz61",
      cat: "strength-training",
      gender: "UNISEX",
    },
    {
      key: "temu-1100lb-dumbbell-rack",
      name: "1100LB Heavy-Duty Dumbbell Rack - 3-Tier Adjustable Weight Rack Suitable for Home Gyms, Space-Saving Dumbbell/Kettlebell Storage Cabinet, Industrial-Strength Steel Frame (Rack Only)",
      price: 68.39,
      reviews: 0,
      image: "https://img.kwcdn.com/product/open/ae323d3fef7d44ac81334722c538ad6e-goods.jpeg",
      aff: "https://temu.to/k/pbcwb28cs6p",
      cat: "home-gym",
      gender: "UNISEX",
    },
    {
      key: "temu-macyo-adjustable-kettlebell",
      name: "MACYO 1pc Adjustable Self-Filling Kettlebell for Women & Men - 1-6kg/2.2-13.2 Lbs, Water-filled Kettlebell, Durable EVA/PE Material, 3 Colors (Purple/Blue/Black) - Home Gym, Yoga & Strength Training Equipment",
      price: 28.24,
      reviews: 0,
      image: "https://img.kwcdn.com/product/fancy/50b9b832-fb56-4eb0-b490-9d61aa14256c.jpg",
      aff: "https://temu.to/k/plcw4ey0jvy",
      cat: "strength-training",
      gender: "UNISEX",
    },
    {
      key: "temu-womens-ribbed-tank-tops-4pcs",
      name: "4pcs Women's Ribbed Tank Tops with Built-in Bra, Slim Fit Sleeveless Scoop Neck Camisole Pack, Premium Comfort Basic Undershirts",
      price: 23.06,
      reviews: 0,
      image: "https://img.kwcdn.com/product/temu-avi/image-crop/14c644e4-3b21-40c1-8a45-954768365071.jpg",
      aff: "https://temu.to/k/pxb90sm1kce",
      cat: "activewear",
      gender: "WOMEN",
    },
    {
      key: "temu-44lb-adjustable-kettlebell",
      name: "44LB Adjustable Kettlebell Black/Pink",
      price: 114.93,
      reviews: 0,
      image: "https://img.kwcdn.com/product/fancy/53b4e6c4-247f-4337-8bd7-1dfee1a16dc0.jpg",
      aff: "https://temu.to/k/pcvqo3en9t7",
      cat: "strength-training",
      gender: "UNISEX",
    },
    {
      key: "temu-versatile-fitness-set",
      name: "Versatile Fitness Set: Water-Fillable Dumbbells & Kettlebells - PE Material, Multi-Weight Options for Home Gym & Yoga Workouts - Perfect Gift for All Occasions",
      price: 21.63,
      reviews: 0,
      image: "https://img.kwcdn.com/product/fancy/517b3e34-4ecb-432e-920a-3783588adea1.jpg",
      aff: "https://temu.to/k/pz3vbz6c5vk",
      cat: "strength-training",
      gender: "UNISEX",
    },
    {
      key: "temu-pink-gray-kettlebell-set",
      name: "Pink Gray Kettlebell Home Fitness Set, Home Fitness Indoor Kettlebell And Foot Pedal Puller Stretcher Suitable for Home Gym Butt, Arm, Leg Training And Indoor Home Fitness Supplies, Especially Suitable for Home Women And Non-Professional Fitness Men",
      price: 34.9,
      reviews: 0,
      image: "https://img.kwcdn.com/product/fancy/bef2e5dc-8685-4479-b7e8-9acec25fac80.jpg",
      aff: "https://temu.to/k/pkw3yw71ovp",
      cat: "strength-training",
      gender: "UNISEX",
    },
    {
      key: "temu-vevor-weighted-vest-30lb",
      name: "VEVOR Weighted Vest, 30 lbs Weight Vest with Reflective Stripe, Adjustable Buckle Body Weight Vest for Men Women, Workout Equipment for Strength Training, Running, Jogging, Fitness, and Weight Loss",
      price: 41.28,
      reviews: 0,
      image: "https://img.kwcdn.com/local-goods-image/2123a62d0c/242315e1-1f89-48a5-be3b-e26611bb9f79_1600x1600.jpeg",
      aff: "https://temu.to/k/pk3rm5dki3w",
      cat: "strength-training",
      gender: "UNISEX",
    },
    {
      key: "temu-hip-push-box",
      name: "Hip Push Box Multifunctional Fitness Training Equipment, Home Squat Machine, Leg Press, Core Strength Training Auxiliary Equipment, Hip Shaping And Muscle Building Fitness Equipment, Full Body Comprehensive Training Box",
      price: 75.35,
      reviews: 0,
      image: "https://img.kwcdn.com/product/fancy/fcf556ab-af15-4d8f-80d8-cbaad6c2ed06.jpg",
      aff: "https://temu.to/k/pwfhvjbyogv",
      cat: "home-gym",
      gender: "UNISEX",
    },
    {
      key: "temu-wetheny-dumbbell-rack",
      name: "Wetheny Dumbbell Rack Stand solely (Dumbbells Not Included), Compact A-Frame Weight Rack with Wooden Handle, for Home Gym Workout",
      price: 21.69,
      reviews: 0,
      image: "https://img.kwcdn.com/product/fancy/7596fd4a-93bc-4832-98e1-664922bbdc0d.jpg",
      aff: "https://temu.to/k/pywey6ngfct",
      cat: "home-gym",
      gender: "UNISEX",
    },
];

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== SECRET) return NextResponse.json({ error: "gone" }, { status: 410 });

  const existing = await db.product.count({ where: { slug: { in: PRODUCTS.map((p) => p.key) } } });
  if (existing > 0) {
    return NextResponse.json({ imported: false, reason: "already imported", count: existing });
  }

  const merchant = await db.merchant.upsert({
    where: { slug: MERCHANT.slug },
    update: {},
    create: { slug: MERCHANT.slug, name: MERCHANT.name, website: MERCHANT.website },
  });

  const cats = await db.category.findMany({ where: { slug: { in: Array.from(new Set(PRODUCTS.map((p) => p.cat))) } } });
  const catMap = new Map(cats.map((c) => [c.slug, c.id]));

  let created = 0;
  const skipped: string[] = [];
  for (const p of PRODUCTS) {
    const categoryId = catMap.get(p.cat);
    if (!categoryId) { skipped.push(p.key + ":no-cat"); continue; }
    try {
      await db.product.create({
        data: {
          slug: p.key,
          title: p.name,
          shortDescription: "Trending on Temu",
          price: p.price,
          currency: "USD",
          reviewCount: null,
          rating: null,
          merchantId: merchant.id,
          affiliateUrl: p.aff,
          categoryId: categoryId,
          gender: p.gender as "WOMEN" | "MEN" | "UNISEX",
          status: "PUBLISHED",
          dataSource: "EDITORIAL",
          trendStatus: "APPROVED",
          images: { create: [{ url: p.image, alt: p.name, sortOrder: 0 }] },
          tags: { create: [{ tag: "temu" }, { tag: "trending" }] },
        },
      });
      created++;
    } catch (e: any) {
      skipped.push(p.key + ":" + String(e?.code || "err"));
    }
  }
  return NextResponse.json({ imported: true, created, skipped });
}
