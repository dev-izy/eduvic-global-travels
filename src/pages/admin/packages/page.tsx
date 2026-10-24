import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../../lib/supabase";
import Reveal from "../../../components/features/Reveal";
import ImageUpload from "../../../components/features/ImageUpload";
import {
  DURATION_UNITS,
  formatDuration,
  normalizeUnit,
  type DurationUnit,
} from "../../../lib/duration";

const IMAGE_BUCKET = "package-images";

interface PackageRow {
  id: string;
  title: string;
  destination: string;
  price: number;
  duration_days: number;
  duration_unit: string | null;
  description: string;
  image_url: string;
  tags: string[] | null;
  inclusions: string[] | null;
  is_active: boolean;
  created_at?: string;
}

type Draft = {
  id: string | null;
  title: string;
  destination: string;
  price: string;
  duration_days: string;
  duration_unit: DurationUnit;
  description: string;
  image_url: string;
  tags: string;
  inclusions: string;
  is_active: boolean;
};

const emptyDraft: Draft = {
  id: null,
  title: "",
  destination: "",
  price: "",
  duration_days: "7",
  duration_unit: "days",
  description: "",
  image_url: "",
  tags: "",
  inclusions: "",
  is_active: true,
};

const formatPrice = (p: number) => `₦${Number(p || 0).toLocaleString()}`;

/** Pulls the object path back out of a public storage URL, or null if the
 *  image lives somewhere else (a pasted stock photo link, say). */
function storagePathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const at = url.indexOf(marker);
  return at === -1 ? null : decodeURIComponent(url.slice(at + marker.length));
}

export default function AdminPackages() {
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<PackageRow | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  const load = async () => {
    const { data, error: err } = await supabase
      .from("travel_offers")
      .select(
        "id,title,destination,price,duration_days,duration_unit,description,image_url,tags,inclusions,is_active,created_at"
      )
      .order("created_at", { ascending: false });

    if (err) setError(err.message);
    else setPackages((data || []) as PackageRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setDraft(emptyDraft);
    setError("");
    setEditorOpen(true);
  };

  const openEdit = (pkg: PackageRow) => {
    setDraft({
      id: pkg.id,
      title: pkg.title,
      destination: pkg.destination,
      price: String(pkg.price ?? ""),
      duration_days: String(pkg.duration_days ?? ""),
      duration_unit: normalizeUnit(pkg.duration_unit),
      description: pkg.description || "",
      image_url: pkg.image_url || "",
      tags: (pkg.tags || []).join(", "),
      inclusions: (pkg.inclusions || []).join("\n"),
      is_active: pkg.is_active,
    });
    setError("");
    setEditorOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!draft.title.trim() || !draft.destination.trim()) {
      setError("A package needs a title and a destination.");
      return;
    }
    if (!draft.price || Number(draft.price) <= 0) {
      setError("Set a price above zero.");
      return;
    }
    if (!draft.duration_days || Number(draft.duration_days) <= 0) {
      setError("Set how long the package runs.");
      return;
    }

    const record = {
      title: draft.title.trim(),
      destination: draft.destination.trim(),
      price: Number(draft.price),
      duration_days: Number(draft.duration_days),
      duration_unit: draft.duration_unit,
      description: draft.description.trim(),
      image_url:
        draft.image_url.trim() ||
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80",
      tags: draft.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      inclusions: draft.inclusions
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean),
      is_active: draft.is_active,
    };

    setSaving(true);

    const { error: err } = draft.id
      ? await supabase.from("travel_offers").update(record).eq("id", draft.id)
      : await supabase.from("travel_offers").insert(record);

    setSaving(false);

    if (err) {
      setError(err.message);
      return;
    }

    setEditorOpen(false);
    showToast(draft.id ? "Package updated" : "Package published");
    await load();
  };

  const togglePublished = async (pkg: PackageRow) => {
    const next = !pkg.is_active;
    setPackages((prev) =>
      prev.map((p) => (p.id === pkg.id ? { ...p, is_active: next } : p))
    );

    const { error: err } = await supabase
      .from("travel_offers")
      .update({ is_active: next })
      .eq("id", pkg.id);

    if (err) {
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, is_active: !next } : p))
      );
      showToast("That didn't save. Try again.");
      return;
    }
    showToast(next ? "Package is live on the site" : "Package hidden from the site");
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setConfirmDelete(null);

    const { error: err } = await supabase.from("travel_offers").delete().eq("id", target.id);

    if (err) {
      showToast(err.message);
      return;
    }

    // Take the uploaded cover with it so storage doesn't fill with orphans.
    const path = storagePathFromUrl(target.image_url);
    if (path) await supabase.storage.from(IMAGE_BUCKET).remove([path]);

    setPackages((prev) => prev.filter((p) => p.id !== target.id));
    showToast("Package deleted");
  };

  const field =
    "w-full px-3.5 py-2.5 text-sm bg-background-50 border border-background-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/15 text-foreground-950 placeholder:text-foreground-400 transition-all";
  const label = "block text-sm font-medium text-foreground-700 mb-1.5";

  return (
    <div className="max-w-6xl mx-auto page-enter">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">
            Travel packages
          </h1>
          <p className="text-sm text-foreground-500 mt-1">
            Anything published here shows on the public packages page.
          </p>
        </div>
        <button
          onClick={openNew}
          className="px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-500/25 flex items-center gap-2"
        >
          <i className="ri-add-line" />
          New package
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl skeleton" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-background-50 border border-dashed border-background-300 rounded-xl px-6 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-background-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-suitcase-3-line text-2xl text-foreground-400" />
          </div>
          <p className="text-sm font-medium text-foreground-700">No packages yet</p>
          <p className="text-xs text-foreground-500 mt-1 mb-5">
            Add your first trip and it will appear on the site right away.
          </p>
          <button
            onClick={openNew}
            className="px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Add a package
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {packages.map((pkg, i) => (
            <Reveal key={pkg.id} delay={Math.min(i * 50, 250)}>
              <div className="bg-background-50 border border-background-200 rounded-xl overflow-hidden hover-lift hover:shadow-md flex flex-col sm:flex-row">
                <div className="sm:w-44 h-36 sm:h-auto bg-background-100 shrink-0 overflow-hidden">
                  {pkg.image_url ? (
                    <img
                      src={pkg.image_url}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : null}
                </div>

                <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          pkg.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-background-200 text-foreground-500"
                        }`}
                      >
                        {pkg.is_active ? "Live" : "Hidden"}
                      </span>
                      <span className="text-xs text-foreground-500">{pkg.destination}</span>
                    </div>
                    <h3 className="font-heading font-semibold text-foreground-950 truncate">
                      {pkg.title}
                    </h3>
                    <p className="text-sm text-foreground-500 line-clamp-1 mt-0.5">
                      {pkg.description}
                    </p>
                    <p className="text-sm font-semibold text-foreground-800 mt-2">
                      {formatPrice(pkg.price)}
                      <span className="text-xs font-normal text-foreground-500">
                        {" "}
                        · {formatDuration(pkg.duration_days, pkg.duration_unit)}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => togglePublished(pkg)}
                      className="px-3 py-2 rounded-lg border border-background-200 text-xs font-medium text-foreground-600 hover:bg-background-100 transition-colors whitespace-nowrap"
                    >
                      {pkg.is_active ? "Hide" : "Publish"}
                    </button>
                    <button
                      onClick={() => openEdit(pkg)}
                      className="px-3 py-2 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(pkg)}
                      className="w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center"
                      aria-label={`Delete ${pkg.title}`}
                    >
                      <i className="ri-delete-bin-line" />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {/* Editor */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto custom-scrollbar bg-foreground-950/50 animate-fade-in p-4 md:p-8">
          <div className="w-full max-w-2xl bg-background-50 rounded-xl shadow-2xl animate-scale-in my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-background-200">
              <h2 className="font-heading font-semibold text-lg text-foreground-950">
                {draft.id ? "Edit package" : "New package"}
              </h2>
              <button
                onClick={() => setEditorOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-background-100 text-foreground-500 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-5">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg animate-scale-in">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <i className="ri-error-warning-line" />
                    {error}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={label} htmlFor="pkg-title">
                    Title
                  </label>
                  <input
                    id="pkg-title"
                    className={field}
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="Seven nights in Zanzibar"
                  />
                </div>

                <div>
                  <label className={label} htmlFor="pkg-destination">
                    Destination
                  </label>
                  <input
                    id="pkg-destination"
                    className={field}
                    value={draft.destination}
                    onChange={(e) => setDraft({ ...draft, destination: e.target.value })}
                    placeholder="Tanzania"
                  />
                </div>

                <div>
                  <label className={label} htmlFor="pkg-duration">
                    Duration
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="pkg-duration"
                      type="number"
                      min={1}
                      className={`${field} flex-1`}
                      value={draft.duration_days}
                      onChange={(e) => setDraft({ ...draft, duration_days: e.target.value })}
                    />
                    <select
                      aria-label="Duration unit"
                      className={`${field} w-32 shrink-0`}
                      value={draft.duration_unit}
                      onChange={(e) =>
                        setDraft({ ...draft, duration_unit: e.target.value as DurationUnit })
                      }
                    >
                      {DURATION_UNITS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-foreground-400 mt-1">
                    Shows as “{formatDuration(draft.duration_days || 0, draft.duration_unit)}”
                  </p>
                </div>

                <div>
                  <label className={label} htmlFor="pkg-price">
                    Price per person (₦)
                  </label>
                  <input
                    id="pkg-price"
                    type="number"
                    min={0}
                    className={field}
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                    placeholder="1850000"
                  />
                </div>

                <div>
                  <label className={label} htmlFor="pkg-tags">
                    Tags
                  </label>
                  <input
                    id="pkg-tags"
                    className={field}
                    value={draft.tags}
                    onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
                    placeholder="Beach, Family, All inclusive"
                  />
                  <p className="text-xs text-foreground-400 mt-1">Separate with commas</p>
                </div>

                <div className="sm:col-span-2">
                  <span className={label}>Cover image</span>
                  <ImageUpload
                    value={draft.image_url}
                    onChange={(url) => setDraft((d) => ({ ...d, image_url: url }))}
                    disabled={saving}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={label} htmlFor="pkg-description">
                    Description
                  </label>
                  <textarea
                    id="pkg-description"
                    rows={4}
                    className={field}
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    placeholder="What the trip covers, who it suits, what makes it worth it."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={label} htmlFor="pkg-inclusions">
                    What's included
                  </label>
                  <textarea
                    id="pkg-inclusions"
                    rows={4}
                    className={field}
                    value={draft.inclusions}
                    onChange={(e) => setDraft({ ...draft, inclusions: e.target.value })}
                    placeholder={"Return flights\nFour-star hotel\nAirport transfers"}
                  />
                  <p className="text-xs text-foreground-400 mt-1">One item per line</p>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.is_active}
                  onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-background-300 text-primary-500 focus:ring-primary-400"
                />
                <span className="text-sm text-foreground-700">
                  Show this package on the public site
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-background-200">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-foreground-600 hover:bg-background-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 flex items-center gap-2"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {draft.id ? "Save changes" : "Publish package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-950/50 animate-fade-in p-4">
          <div className="w-full max-w-sm bg-background-50 rounded-xl shadow-2xl p-6 animate-scale-in">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <i className="ri-delete-bin-line text-xl" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-foreground-950 mb-2">
              Delete this package?
            </h3>
            <p className="text-sm text-foreground-500 mb-6">
              <strong className="text-foreground-700">{confirmDelete.title}</strong> will be
              removed from the site and can't be recovered. Hide it instead if you might use
              it again.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2.5 text-sm font-medium text-foreground-600 hover:bg-background-100 rounded-lg transition-colors"
              >
                Keep it
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-foreground-950 text-white text-sm rounded-lg shadow-xl animate-fade-up">
          {toast}
        </div>
      )}
    </div>
  );
}