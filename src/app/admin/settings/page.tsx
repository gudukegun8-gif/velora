import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Card,
  PageHeader,
  EmptyState,
  Field,
  inputCls,
  btnPrimaryCls,
  btnDangerCls,
} from "@/components/admin/ui";
import { siteSettingSchema } from "@/lib/admin-schemas";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings — VÉLORA Admin",
};

async function saveSetting(formData: FormData) {
  "use server";
  await requireAdmin();

  const parsed = siteSettingSchema.safeParse({
    key: formData.get("key"),
    value: formData.get("value"),
  });
  if (!parsed.success) return;

  await db.siteSetting.upsert({
    where: { key: parsed.data.key },
    create: { key: parsed.data.key, value: parsed.data.value },
    update: { value: parsed.data.value },
  });

  revalidatePath("/admin/settings");
}

async function deleteSetting(formData: FormData) {
  "use server";
  await requireAdmin();
  const key = String(formData.get("key") ?? "");
  if (!key) return;
  await db.siteSetting.delete({ where: { key } });
  revalidatePath("/admin/settings");
}

export default async function AdminSettingsPage() {
  await requireAdmin();

  const settings = await db.siteSetting.findMany({ orderBy: { key: "asc" } });

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Site-wide key/value configuration used by the storefront."
      />

      <Card className="mb-6 p-6">
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">Add / Update Setting</h2>
        <form action={saveSetting} className="grid gap-4 sm:grid-cols-[240px_1fr_auto]">
          <Field label="Key" htmlFor="key">
            <input
              id="key"
              name="key"
              required
              className={inputCls}
              placeholder="hero_banner_text"
              pattern="[a-zA-Z0-9_.-]+"
              title="Letters, numbers, dots, dashes or underscores"
            />
          </Field>
          <Field label="Value" htmlFor="value">
            <input id="value" name="value" required className={inputCls} placeholder="Setting value" />
          </Field>
          <div className="flex items-end">
            <button type="submit" className={btnPrimaryCls}>
              Save
            </button>
          </div>
        </form>
      </Card>

      {settings.length === 0 ? (
        <EmptyState
          title="No settings yet"
          hint="Add your first site setting with the form above."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-sand bg-stone-50 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th className="px-4 py-3 font-semibold">Key</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/60">
                {settings.map((s) => (
                  <tr key={s.key} className="hover:bg-stone-50/60">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-ink">
                      {s.key}
                    </td>
                    <td className="max-w-md truncate px-4 py-3 text-ink/70">{s.value}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink/60">
                      {s.updatedAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <form action={deleteSetting} className="inline">
                        <input type="hidden" name="key" value={s.key} />
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
