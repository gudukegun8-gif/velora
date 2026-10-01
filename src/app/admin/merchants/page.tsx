import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Card,
  PageHeader,
  Badge,
  EmptyState,
  Field,
  inputCls,
  btnPrimaryCls,
  btnGhostCls,
  btnDangerCls,
} from "@/components/admin/ui";
import { merchantSchema, merchantPatchSchema } from "@/lib/admin-schemas";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Merchants — VÉLORA Admin",
};

async function upsertMerchant(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = String(formData.get("id") ?? "") || undefined;
  const raw = {
    slug: formData.get("slug"),
    name: formData.get("name"),
    logo: formData.get("logo"),
    website: formData.get("website"),
    affiliateNetwork: formData.get("affiliateNetwork"),
    status: formData.get("status"),
    priority: formData.get("priority"),
  };

  if (id) {
    const parsed = merchantPatchSchema.safeParse(raw);
    if (!parsed.success) return;
    // Merchant.status is non-nullable: an empty status field (null) means "leave unchanged".
    const { status, ...rest } = parsed.data;
    await db.merchant.update({
      where: { id },
      data: { ...rest, status: status ?? undefined },
    });
  } else {
    const parsed = merchantSchema.safeParse(raw);
    if (!parsed.success) return;
    await db.merchant.create({
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
        logo: parsed.data.logo,
        website: parsed.data.website,
        affiliateNetwork: parsed.data.affiliateNetwork,
        status: parsed.data.status ?? "ACTIVE",
        priority: parsed.data.priority,
      },
    });
  }

  revalidatePath("/admin/merchants");
}

async function deleteMerchant(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.clickEvent.updateMany({ where: { merchantId: id }, data: { merchantId: null } });
  await db.merchant.delete({ where: { id } });
  revalidatePath("/admin/merchants");
}

export default async function AdminMerchantsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireAdmin();

  const editId = (() => {
    const v = searchParams.edit;
    return Array.isArray(v) ? v[0] : v;
  })();

  const [merchants, editing] = await Promise.all([
    db.merchant.findMany({
      orderBy: [{ priority: "desc" }, { name: "asc" }],
      include: { _count: { select: { products: true } } },
    }),
    editId ? db.merchant.findUnique({ where: { id: editId } }) : Promise.resolve(null),
  ]);

  return (
    <div>
      <PageHeader
        title="Merchants"
        subtitle="Affiliate partners. Tracking configuration is managed via environment variables, never stored here."
      />

      <Card className="mb-6 p-6">
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">
          {editing ? "Edit Merchant" : "Add Merchant"}
        </h2>
        <form action={upsertMerchant} className="grid gap-4 sm:grid-cols-2">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Name">
            <input
              name="name"
              required
              defaultValue={editing?.name ?? ""}
              className={inputCls}
              placeholder="Merchant name"
            />
          </Field>
          <Field label="Slug">
            <input
              name="slug"
              required
              defaultValue={editing?.slug ?? ""}
              className={inputCls}
              placeholder="merchant-slug"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              title="Lowercase letters, numbers and dashes"
            />
          </Field>
          <Field label="Website" hint="Full http(s) URL">
            <input
              name="website"
              required
              defaultValue={editing?.website ?? ""}
              className={inputCls}
              placeholder="https://merchant.com"
              inputMode="url"
            />
          </Field>
          <Field label="Logo URL">
            <input
              name="logo"
              defaultValue={editing?.logo ?? ""}
              className={inputCls}
              placeholder="https://…"
              inputMode="url"
            />
          </Field>
          <Field label="Affiliate network">
            <input
              name="affiliateNetwork"
              defaultValue={editing?.affiliateNetwork ?? ""}
              className={inputCls}
              placeholder="e.g. Awin, ShareASale"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <select name="status" defaultValue={editing?.status ?? "ACTIVE"} className={inputCls}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PAUSED">PAUSED</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </Field>
            <Field label="Priority">
              <input
                name="priority"
                type="number"
                min={0}
                defaultValue={editing?.priority ?? 0}
                className={inputCls}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <p className="rounded-md bg-stone-100 px-4 py-3 text-xs text-ink/60">
              Tracking secrets are configured via environment variables and are never displayed
              or editable here.
            </p>
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" className={btnPrimaryCls}>
              {editing ? "Save Changes" : "Add Merchant"}
            </button>
            {editing ? (
              <Link href="/admin/merchants" className={btnGhostCls}>
                Cancel
              </Link>
            ) : null}
          </div>
        </form>
      </Card>

      {merchants.length === 0 ? (
        <EmptyState
          title="No merchants yet"
          hint="Add your first affiliate merchant using the form above."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-sand bg-stone-50 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th className="px-4 py-3 font-semibold">Merchant</th>
                  <th className="px-4 py-3 font-semibold">Website</th>
                  <th className="px-4 py-3 font-semibold">Network</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Products</th>
                  <th className="px-4 py-3 font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/60">
                {merchants.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink">{m.name}</span>
                      <p className="text-xs text-ink/50">
                        {m.slug} · priority {m.priority}
                      </p>
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-ink/70">
                      <a
                        href={m.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-golddeep"
                      >
                        {m.website}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-ink/70">{m.affiliateNetwork ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={m.status === "ACTIVE" ? "green" : "neutral"}>{m.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-ink/70">{m._count.products}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/admin/merchants?edit=${m.id}`}
                        className={btnGhostCls + " mr-2 px-3 py-1.5"}
                      >
                        Edit
                      </Link>
                      <form action={deleteMerchant} className="inline">
                        <input type="hidden" name="id" value={m.id} />
                        <button type="submit" className={btnDangerCls + " px-3 py-1.5"}>
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
