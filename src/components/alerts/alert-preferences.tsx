"use client";

import { useState } from "react";
import { useAlertPreferences, useAlertChannels } from "@/hooks/use-alerts";
import { pushSupported, enablePush, disablePush } from "@/lib/push";

const TIER_LABELS: Record<number, string> = {
  1: "High priority only",
  2: "High + Medium",
  3: "All priorities",
};

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  push: "Browser push",
};

export function AlertPreferencesPanel() {
  const { preferences, loading, saving, update } = useAlertPreferences();
  const channels = useAlertChannels();
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushBusy, setPushBusy] = useState(false);

  const toggleChannel = async (channel: string) => {
    if (!preferences) return;
    const turningOn = !preferences.channels[channel];

    if (channel === "push") {
      setPushError(null);
      setPushBusy(true);
      try {
        if (turningOn) await enablePush();
        else await disablePush();
      } catch (err) {
        setPushError(
          err instanceof Error ? err.message : "Couldn't enable push notifications."
        );
        setPushBusy(false);
        return;
      }
      setPushBusy(false);
    }

    update({
      channels: { ...preferences.channels, [channel]: turningOn },
    });
  };

  if (loading) {
    return (
      <div className="bg-slate-100 dark:bg-[#12121e] border border-slate-200 dark:border-white/[0.06] rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-white/[0.06] rounded w-1/3" />
          <div className="h-8 bg-slate-200 dark:bg-white/[0.06] rounded w-full" />
          <div className="h-8 bg-slate-200 dark:bg-white/[0.06] rounded w-full" />
        </div>
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className="bg-slate-100 dark:bg-[#12121e] border border-slate-200 dark:border-white/[0.06] rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-900 dark:text-white font-medium">Alert Notifications</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Get notified when new filing events match your criteria.
          </p>
        </div>
        <button
          onClick={() => update({ enabled: !preferences.enabled })}
          disabled={saving}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            preferences.enabled ? "bg-violet-600" : "bg-slate-300 dark:bg-white/[0.1]"
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
            <label className="text-slate-600 dark:text-slate-300 text-sm font-medium block mb-2">
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
                      ? "bg-violet-500/15 border-violet-500/40 text-violet-400"
                      : "bg-white dark:bg-[#0a0a12] border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-white/[0.12]"
                  }`}
                >
                  <span className="font-medium">Tier {tier}</span>
                  <span className="text-slate-400 dark:text-slate-500 ml-2">
                    &mdash; {TIER_LABELS[tier]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Channel toggles */}
          <div>
            <label className="text-slate-600 dark:text-slate-300 text-sm font-medium block mb-2">
              Notification channels
            </label>
            <div className="space-y-2">
              {channels
                .filter((channel) => channel !== "push" || pushSupported())
                .map((channel) => (
                  <label
                    key={channel}
                    className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#0a0a12] border border-slate-200 dark:border-white/[0.06] rounded-lg cursor-pointer hover:border-slate-400 dark:hover:border-white/[0.12]"
                  >
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {CHANNEL_LABELS[channel] || channel}
                      {channel === "push" && (
                        <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          Instant alerts on this device, even with the tab closed
                        </span>
                      )}
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.channels[channel] ?? false}
                      onChange={() => toggleChannel(channel)}
                      disabled={saving || (channel === "push" && pushBusy)}
                      className="rounded border-slate-300 dark:border-white/[0.1] bg-slate-100 dark:bg-[#12121e] text-violet-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                    />
                  </label>
                ))}
            </div>
            {pushError && (
              <p className="text-red-400 text-xs mt-2">{pushError}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
