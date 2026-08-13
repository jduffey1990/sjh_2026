import { useEffect, useState } from "react";
import { TRIP } from "../data/trip";

const BASE = import.meta.env.BASE_URL;

const PHOTOS = [
  "95720190801_163401",
  "95820190804_104924",
  "959Action-60",
  "960Action-124",
  "961BD7084A3-6491-48E1-9F62-CF53034610AE",
  "962image_6483441-1",
  "963image_6483441-2",
  "964image_6483441",
  "965IMG_6226",
  "966IMG_6575-1",
  "967IMG_6578",
  "968Kris-Summer-2013-Promo-063",
  "969Kris-Summer-2013-Promo-120",
  "970MVIMG_20190801_092725140",
  "971San-Juan-Huts-Aimee-Gilchrist-Oct.2022-057",
  "972San-Juan-Huts-Aimee-Gilchrist-Oct.2022-064",
  "973San-Juan-Huts-Aimee-Gilchrist-Oct.2022-096",
  "974San-Juan-Huts-Aimee-Gilchrist-Oct.2022-106",
  "975TM2014KellyDan-19",
  "976TM2014KellyDan-97",
];

export default function Gallery() {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight")
        setOpen((i) => ((i ?? 0) + 1) % PHOTOS.length);
      if (e.key === "ArrowLeft")
        setOpen((i) => ((i ?? 0) - 1 + PHOTOS.length) % PHOTOS.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div>
      <header className="topo overflow-hidden rounded-2xl border border-ink-800 p-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-50 sm:text-3xl">
          The route
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Photos from the Telluride → Moab route. Several were shot in October,
          which is the closest anyone gets to showing what late September at
          altitude actually looks like.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {PHOTOS.map((p, i) => (
          <button
            key={p}
            onClick={() => setOpen(i)}
            className="group aspect-[345/170] overflow-hidden rounded-xl border border-ink-800 bg-ink-900"
          >
            <img
              src={`${BASE}photos/${p}.webp`}
              alt={`San Juan Huts Telluride to Moab route, photo ${i + 1}`}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-slate-600">
        All photos ©{" "}
        <a
          href={TRIP.operator.url}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-slate-400"
        >
          San Juan Huts
        </a>
        , used here for trip planning.
      </p>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal
        >
          <img
            src={`${BASE}photos/${PHOTOS[open]}.webp`}
            alt=""
            className="max-h-[85vh] w-auto max-w-full rounded-lg"
          />
          <button
            className="absolute right-4 top-4 tap-target text-2xl text-slate-400 hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
          <p className="absolute bottom-6 text-xs text-slate-500">
            {open + 1} / {PHOTOS.length}
          </p>
        </div>
      )}
    </div>
  );
}
