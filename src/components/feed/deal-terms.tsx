export function DealTerms({ terms }: { terms: Record<string, string> }) {
  const entries = Object.entries(terms);
  if (entries.length === 0) return null;

  return (
    <div className="mt-2 pt-2 border-t border-slate-700/50">
      <p className="text-slate-500 text-xs uppercase tracking-wide font-semibold mb-1">
        Deal Terms
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {entries.map(([key, value]) => (
          <div key={key} className="flex gap-2 text-xs">
            <span className="text-slate-500 uppercase">
              {key.replace(/_/g, " ")}
            </span>
            <span className="text-slate-300 font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
