"use client";

import { useAlertPreferences, useAlertChannels } from "@/hooks/use-alerts";

const TIER_LABELS: Record<number, string> = {
  1: "High priority only",
  2: "High + Medium",
  3: "All priorities",
};

export function AlertPreferencesPanel() {
  const { preferences, loading, saving, update } = useAlertPreferences();
  const channels = useAlertChannels();

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-1/3" />
          <div className="h-8 bg-slate-700 rounded w-full" />
          <div className="h-8 bg-slate-700 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium">Alert Notifications</h3>
          <p className="text-slate-400 text-sm mt-1">
            Get notified when new filing events match your criteria.
          </p>
        </div>
        <button
          onClick={() => update({ enabled: !preferences.enabled })}
          disabled={saving}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            preferences.enabled ? "bg-blue-600" : "bg-slate-600"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              preferences.enabled ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {preferences.enabled && (
        <>
          {/* Tier selection */}
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-2">
              Alert sensitivity
            </label>
            <div className="space-y-2">
              {([1, 2, 3] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => update({ max_tier: tier })}
                  disabled={saving}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors border ${
                    preferences.max_tier === tier
                      ? "bg-blue-500/15 border-blue-500/40 text-blue-400"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <span className="font-medium">Tier {tier}</span>
                  <span className="text-slate-500 ml-2">
                    &mdash; {TIER_LABELS[tier]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Channel toggles */}
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-2">
              Notification channels
            </label>
            <div className="space-y-2">
              {channels.map((channel) => (
                <label
                  key={channel}
                  className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg cursor-pointer hover:border-slate-500"
                >
                  <span className="text-sm text-slate-300 capitalize">
                    {channel}
                  </span>
                  <input
                    type="checkbox"
                    checked={preferences.channels[channel] ?? false}
                    onChange={() =>
                      update({
                        channels: {
                          ...preferences.channels,
                          [channel]: !preferences.channels[channel],
                        },
                      })
                    }
                    disabled={saving}
                    className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
