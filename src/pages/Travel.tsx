import { useEffect, useMemo, useRef, useState } from "react";
import { LOGISTICS } from "../data/travel";
import { TRIP } from "../data/trip";
import Decisions from "../components/Decisions";
import Comments from "../components/Comments";
import SyncBadge from "../components/SyncBadge";
import { hasBackend } from "../lib/supabase";
import { useSnapshot, useDbRider, useUnread, store } from "../lib/useStore";
import type { LogisticsField, LogisticsSection } from "../lib/types";

/** An editable label/value pair. Anyone can fill one in; everyone sees it. */
function Field({ f, editing }: { f: LogisticsField; editing: boolean }) {
  const snap = useSnapshot();
  const me = useDbRider();
  const by = f.updated_by
    ? snap.riders.find((r) => r.id === f.updated_by)
    : null;
  const unset = !f.value || /TBD/i.test(f.value);

  return (
    <div className="bg-ink-900/70 px-5 py-3">
      <dt className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500">
        {editing ? (
          <input
            defaultValue={f.label}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (me && v && v !== f.label) {
                store.updateField(f.id, { label: v }, me.id);
              }
            }}
            className="w-full rounded border border-ink-700 bg-ink-950 px-1.5 py-0.5 text-[11px] uppercase tracking-wider text-slate-300"
          />
        ) : (
          f.label
        )}
        {editing && (
          <button
            onClick={() => store.deleteField(f.id)}
            className="shrink-0 text-slate-700 hover:text-rock-400"
            title={`Remove "${f.label}"`}
          >
            ×
          </button>
        )}
      </dt>
      <dd>
        <input
          defaultValue={f.value ?? ""}
          placeholder={me ? "—" : "pick your name to edit"}
          disabled={!me}
          onBlur={(e) => {
            const v = e.target.value.trim();
            // Never write an unattributed edit -- `me` is briefly null while
            // the roster loads, and a value with no author is worse than none.
            if (me && v !== (f.value ?? "")) {
              store.setLogisticsField(f.id, v, me.id);
            }
          }}
          className={[
            "mt-0.5 -mx-1 w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-sm",
            "hover:border-ink-700 focus:border-aspen-500/50 focus:bg-ink-950 focus:outline-none",
            unset ? "text-aspen-500/80" : "text-slate-200",
          ].join(" ")}
        />
        {by && (
          <span className="mt-0.5 block text-[10px] text-slate-600">
            {by.name.split(" ")[0]} ·{" "}
            {new Date(f.updated_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </dd>
    </div>
  );
}

function SectionCard({
  section,
  newCount,
}: {
  section: LogisticsSection;
  newCount: number;
}) {
  const snap = useSnapshot();
  const me = useDbRider();
  const [editing, setEditing] = useState(false);
  const [addingField, setAddingField] = useState(false);
  const [label, setLabel] = useState("");

  const fields = snap.logisticsFields
    .filter((f) => f.section_id === section.slug)
    .sort((a, b) => a.sort_order - b.sort_order);

  const open = snap.decisions.filter(
    (d) =>
      d.scope === "logistics" &&
      d.scope_id === section.slug &&
      d.status === "open",
  ).length;

  const deletable = store.canDeleteSection(section.slug);

  return (
    <section className="overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/50">
      <div className="flex flex-wrap items-center gap-3 border-b border-ink-800/70 px-5 py-3.5">
        {editing ? (
          <input
            defaultValue={section.title}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== section.title) {
                store.updateSection(section.id, { title: v });
              }
            }}
            className="min-w-0 flex-1 rounded border border-ink-700 bg-ink-950 px-2 py-1 font-bold text-slate-100"
          />
        ) : (
          <h2 className="font-bold text-slate-100">{section.title}</h2>
        )}

        <span className="ml-auto flex items-center gap-2">
          {newCount > 0 && (
            <span className="rounded-full bg-aspen-500/25 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-aspen-300">
              {newCount} new
            </span>
          )}
          {open > 0 && (
            <span className="rounded-full border border-aspen-500/50 bg-aspen-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-aspen-400">
              {open} open
            </span>
          )}
          <button
            onClick={() => setEditing((v) => !v)}
            disabled={!me}
            className="text-[11px] text-slate-600 underline hover:text-slate-300 disabled:no-underline disabled:opacity-40"
          >
            {editing ? "done" : "edit"}
          </button>
        </span>
      </div>

      <div className="space-y-3 px-5 py-4">
        {editing ? (
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              Description — blank line between paragraphs
            </span>
            <textarea
              defaultValue={section.body.join("\n\n")}
              rows={Math.max(3, section.body.length * 3)}
              onBlur={(e) =>
                store.updateSection(section.id, {
                  body: e.target.value
                    .split(/\n\s*\n/)
                    .map((p) => p.trim())
                    .filter(Boolean),
                })
              }
              className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm leading-relaxed text-slate-200"
            />
          </label>
        ) : (
          section.body.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-slate-300">
              {p}
            </p>
          ))
        )}
      </div>

      {fields.length > 0 && (
        <dl className="grid gap-px border-t border-ink-800/70 bg-ink-800/40 sm:grid-cols-2">
          {fields.map((f) => (
            <Field key={f.id} f={f} editing={editing} />
          ))}
        </dl>
      )}

      {editing && (
        <div className="border-t border-ink-800/70 px-5 py-3">
          {addingField ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const v = label.trim();
                if (!v || !me) return;
                store.addField(section.slug, v, me.id);
                setLabel("");
                setAddingField(false);
              }}
              className="flex gap-2"
            >
              <input
                autoFocus
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Field name, e.g. Confirmation number"
                className="min-w-0 flex-1 rounded-lg border border-ink-700 bg-ink-950 px-3 py-1.5 text-[13px] text-slate-200"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-aspen-500 px-3 text-[13px] font-bold text-ink-950"
              >
                Add
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAddingField(true)}
                className="text-[12px] text-slate-400 underline hover:text-slate-200"
              >
                + Add a field
              </button>
              <button
                onClick={() => store.deleteSection(section.id)}
                disabled={!deletable}
                title={
                  deletable
                    ? "Delete this section and its fields"
                    : "Has decisions or comments — clear those first"
                }
                className="ml-auto text-[12px] text-slate-700 underline hover:text-rock-400 disabled:no-underline disabled:opacity-40"
              >
                Delete section
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4 border-t border-ink-800/70 p-5">
        <Decisions scope="logistics" scopeId={section.slug} />
        <div>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Notes
          </h3>
          <Comments scope="logistics" scopeId={section.slug} compact />
        </div>
      </div>
    </section>
  );
}

export default function Travel() {
  const snap = useSnapshot();
  const me = useDbRider();
  const unread = useUnread();
  const [addingSection, setAddingSection] = useState(false);
  const [title, setTitle] = useState("");

  const sections = snap.logisticsSections;

  // Every section is visible at once here, so opening the page counts as
  // seeing all of them. Freeze the counts first so the badges survive the
  // render that clears them.
  const [arrived, setArrived] = useState<Map<string, number>>(new Map());
  const marked = useRef(false);

  useEffect(() => {
    if (!me || marked.current || sections.length === 0) return;
    marked.current = true;
    const frozen = new Map<string, number>();
    for (const s of sections) {
      const u = unread.get(`logistics::${s.slug}`);
      if (u?.total) frozen.set(s.slug, u.total);
      store.markSeen(me.id, "logistics", s.slug);
    }
    setArrived(frozen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, sections.length]);

  const totalOpen = useMemo(
    () =>
      snap.decisions.filter(
        (d) => d.scope === "logistics" && d.status === "open",
      ).length,
    [snap.decisions],
  );

  return (
    <div className="mx-auto max-w-3xl">
      <header className="topo overflow-hidden rounded-2xl border border-ink-800 p-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-50 sm:text-3xl">
          Travel &amp; logistics
        </h1>
        <p className="mt-2 text-slate-400">
          Everything that is not riding.{" "}
          {hasBackend && totalOpen > 0 && (
            <span className="text-aspen-400">
              {totalOpen} decision{totalOpen === 1 ? "" : "s"} still open.
            </span>
          )}
        </p>
        {hasBackend && (
          <>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
              Everything here is yours to change — values, field names, section
              text, and the sections themselves.
            </p>
            <div className="mt-4">
              <SyncBadge />
            </div>
          </>
        )}
      </header>

      {/* No backend: fall back to the static copy so the page still reads. */}
      {!hasBackend ? (
        <div className="mt-6 space-y-4">
          {LOGISTICS.map((s) => (
            <section
              key={s.id}
              className="overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/50"
            >
              <div className="border-b border-ink-800/70 px-5 py-3.5">
                <h2 className="font-bold text-slate-100">{s.title}</h2>
              </div>
              <div className="space-y-3 px-5 py-4">
                {s.body.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-slate-300">
                    {p}
                  </p>
                ))}
              </div>
              {s.items && (
                <dl className="grid gap-px border-t border-ink-800/70 bg-ink-800/40 sm:grid-cols-2">
                  {s.items.map((it) => (
                    <div key={it.label} className="bg-ink-900/70 px-5 py-3">
                      <dt className="text-[10px] uppercase tracking-wider text-slate-500">
                        {it.label}
                      </dt>
                      <dd className="mt-0.5 text-sm text-slate-200">
                        {it.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {sections.map((s) => (
            <SectionCard
              key={s.id}
              section={s}
              newCount={arrived.get(s.slug) ?? 0}
            />
          ))}

          {addingSection ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const t = title.trim();
                if (!t || !me) return;
                store.addSection(t, me.id);
                setTitle("");
                setAddingSection(false);
              }}
              className="flex gap-2 rounded-2xl border border-ink-800 bg-ink-900/50 p-4"
            >
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Section title, e.g. Food & resupply"
                className="min-w-0 flex-1 rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-slate-200"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-aspen-500 px-4 text-sm font-bold text-ink-950"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setAddingSection(false)}
                className="shrink-0 rounded-lg border border-ink-700 px-3 text-sm text-slate-400"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setAddingSection(true)}
              disabled={!me}
              className="w-full rounded-2xl border border-dashed border-ink-700 py-4 text-sm text-slate-500 hover:border-ink-600 hover:text-slate-300 disabled:opacity-40"
            >
              + Add a section
            </button>
          )}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-slate-600">
        Operator: {TRIP.operator.name} ·{" "}
        <a href={`tel:${TRIP.operator.phone}`} className="underline">
          {TRIP.operator.phone}
        </a>
      </p>
    </div>
  );
}
