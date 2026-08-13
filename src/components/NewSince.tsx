/**
 * Shown after a day is marked seen, so the badge can clear while you can
 * still tell what arrived since your last visit.
 */
export default function NewSince({ count }: { count: number | null }) {
  if (!count) return null;
  return (
    <p className="mt-8 rounded-xl border border-aspen-500/40 bg-aspen-500/10 px-4 py-2.5 text-[12px] text-aspen-300">
      ● {count} new since you last looked — now marked as seen.
    </p>
  );
}
