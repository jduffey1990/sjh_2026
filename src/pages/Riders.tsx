import { Avatar } from "../components/RiderPicker";
import SyncBadge from "../components/SyncBadge";
import { useSnapshot, useCompatibility, store } from "../lib/useStore";
import { hasBackend } from "../lib/supabase";
import { RIDERS } from "../data/trip";
import type { DbRider } from "../lib/types";

const FIELDS: {
  key: keyof DbRider;
  label: string;
  placeholder: string;
  hint?: string;
}[] = [
  { key: "bike", label: "Bike", placeholder: "Trek Fuel EX 8" },
  {
    key: "chain_speed",
    label: "Chain",
    placeholder: "SRAM 12sp",
    hint: "Power Links must match every chain in the group",
  },
  {
    key: "hanger_model",
    label: "Derailleur hanger",
    placeholder: "Trek #333",
    hint: "Hangers are not interchangeable between bikes",
  },
  { key: "tire_size", label: "Tire size", placeholder: "29 x 2.4" },
  { key: "brake_pad_type", label: "Brake pads", placeholder: "Shimano B01S" },
];

export default function Riders() {
  const snap = useSnapshot();
  const warnings = useCompatibility();

  // Without a backend, still show the roster from static data.
  if (!hasBackend || snap.riders.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-black tracking-tight text-slate-50">
          Riders
        </h1>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {RIDERS.map((r) => (
            <div
              key={r.name}
              className="flex items-center gap-3 rounded-xl border border-ink-800 bg-ink-900/50 p-3.5"
            >
              <Avatar initials={r.initials} color={r.color} />
              <span className="text-slate-200">{r.name}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs text-slate-600">
          Bike specs need the Supabase connection — see the Packing board.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="topo overflow-hidden rounded-2xl border border-ink-800 p-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-50 sm:text-3xl">
          Riders
        </h1>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-400">
          Bike specs drive the compatibility checks on the packing board. Anyone
          can fill in anyone's — chase your friends.
        </p>
        <div className="mt-4">
          <SyncBadge />
        </div>
      </header>

      <p className="rounded-xl border border-ink-800 bg-ink-900/40 p-3 text-[11px] leading-relaxed text-slate-500">
        Deliberately no phone numbers or emergency contacts here. This site is
        public and the database is open to anyone with the link — keep personal
        details in the group chat.
      </p>

      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w) => (
            <div
              key={w.key}
              className="rounded-xl border border-aspen-500/40 bg-aspen-500/[0.07] p-3.5"
            >
              <h2 className="text-[13px] font-bold text-aspen-400">
                ⚠ {w.title}
              </h2>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-300">
                {w.detail}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {snap.riders.map((r) => (
          <section
            key={r.id}
            className="overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/50"
          >
            <div className="flex items-center gap-3 border-b border-ink-800/70 px-4 py-3">
              <Avatar initials={r.initials} color={r.color} />
              <h2 className="font-bold text-slate-100">{r.name}</h2>
              {(!r.chain_speed || !r.hanger_model) && (
                <span className="ml-auto rounded-full border border-aspen-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-aspen-500">
                  incomplete
                </span>
              )}
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {FIELDS.map((f) => (
                <label key={String(f.key)} className="block">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500">
                    {f.label}
                  </span>
                  <input
                    defaultValue={(r[f.key] as string) ?? ""}
                    placeholder={f.placeholder}
                    onBlur={(e) =>
                      store.updateRider(r.id, {
                        [f.key]: e.target.value.trim() || null,
                      } as Partial<DbRider>)
                    }
                    className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-950 px-2.5 py-2 text-sm text-slate-200 placeholder:text-slate-700"
                  />
                  {f.hint && (
                    <span className="mt-1 block text-[10px] leading-tight text-slate-600">
                      {f.hint}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
