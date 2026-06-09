export function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
      />
      <span className="text-slate-500 text-xs">
        {connected ? "Live" : "Connecting..."}
      </span>
    </div>
  );
}
