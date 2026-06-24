"use client";

import { useState, useCallback, useEffect } from "react";
import { useAlertPreferences, useAlertChannels } from "@/hooks/use-alerts";
import { useChannelConfig } from "@/hooks/use-channel-config";
import { pushSupported, enablePush, disablePush } from "@/lib/push";
import { ChannelSetupForm } from "@/components/alerts/channel-setup-forms";

const TIER_LABELS: Record<number, string> = {
  1: "High priority only",
  2: "High + Medium",
  3: "All priorities",
};

const CHANNEL_META: Record<
  string,
  { label: string; description: string; needsSetup: boolean }
> = {
  email: {
    label: "Email",
    description: "Alerts sent to your account email",
    needsSetup: false,
  },
  push: {
    label: "Browser Push",
    description: "Instant alerts on this device",
    needsSetup: false,
  },
  sms: {
    label: "SMS",
    description: "Text message alerts to your phone",
    needsSetup: true,
  },
  telegram: {
    label: "Telegram",
    description: "Alerts via Telegram bot",
    needsSetup: true,
  },
  discord: {
    label: "Discord",
    description: "Alerts posted to a Discord channel",
    needsSetup: true,
  },
  slack: {
    label: "Slack",
    description: "Alerts posted to a Slack channel",
    needsSetup: true,
  },
  whatsapp: {
    label: "WhatsApp",
    description: "Alerts via WhatsApp message",
    needsSetup: true,
  },
  webhook: {
    label: "Webhook",
    description: "POST events to your own endpoint",
    needsSetup: true,
  },
};

/* ------------------------------------------------------------------ */
/*  Per-channel row with inline setup                                  */
/* ------------------------------------------------------------------ */

function ChannelRow({
  channel,
  enabled,
  saving,
  onToggle,
  pushBusy,
}: {
  channel: string;
  enabled: boolean;
  saving: boolean;
  onToggle: (channel: string) => void;
  pushBusy: boolean;
}) {
  const meta = CHANNEL_META[channel] ?? {
    label: channel,
    description: "",
    needsSetup: false,
  };
  const [expanded, setExpanded] = useState(false);

  // For channels that need setup, track config state
  const needsSetup = meta.needsSetup;

  if (!needsSetup) {
    // Simple channel (email, push) -- just a toggle row
    return (
      <div className="bg-white dark:bg-[#0a0a12] border border-slate-200 dark:border-white/[0.06] rounded-lg">
        <label className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:border-slate-400 dark:hover:border-white/[0.12]">
          <div>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {meta.label}
            </span>
            <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {meta.description}
            </span>
          </div>
          <input
            type="checkbox"
            checked={enabled}
            onChange={() => onToggle(channel)}
            disabled={saving || (channel === "push" && pushBusy)}
            className="rounded border-slate-300 dark:border-white/[0.1] bg-slate-100 dark:bg-[#12121e] text-violet-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
          />
        </label>
      </div>
    );
  }

  // Channel that needs setup
  return (
    <SetupChannelRow
      channel={channel}
      meta={meta}
      enabled={enabled}
      saving={saving}
      onToggle={onToggle}
      expanded={expanded}
      setExpanded={setExpanded}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Setup channel row — uses useChannelConfig internally               */
/* ------------------------------------------------------------------ */

function SetupChannelRow({
  channel,
  meta,
  enabled,
  saving,
  onToggle,
  expanded,
  setExpanded,
}: {
  channel: string;
  meta: { label: string; description: string };
  enabled: boolean;
  saving: boolean;
  onToggle: (channel: string) => void;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
}) {
  const { config, verified, loading, refetch } = useChannelConfig(channel);
  const isConnected = config !== null;
  const [setupPrompt, setSetupPrompt] = useState(false);

  // Reset setup prompt when connection status changes
  useEffect(() => {
    if (isConnected) setSetupPrompt(false);
  }, [isConnected]);

  const handleToggle = useCallback(() => {
    if (!isConnected && !enabled) {
      // Can't enable without setup — show prompt and expand
      setSetupPrompt(true);
      setExpanded(true);
      return;
    }
    onToggle(channel);
  }, [isConnected, enabled, onToggle, channel, setExpanded]);

  const handleConnected = useCallback(() => {
    refetch();
    setExpanded(false);
  }, [refetch, setExpanded]);

  const handleDisconnect = useCallback(() => {
    // Disable the channel preference when disconnecting
    if (enabled) {
      onToggle(channel);
    }
    refetch();
    setExpanded(false);
  }, [enabled, onToggle, channel, refetch, setExpanded]);

  return (
    <div className="bg-white dark:bg-[#0a0a12] border border-slate-200 dark:border-white/[0.06] rounded-lg">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {meta.label}
            </span>
            {isConnected && (
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Connected
              </span>
            )}
            {loading && (
              <span className="text-xs text-slate-500">Loading...</span>
            )}
          </div>
          <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {meta.description}
          </span>
          {setupPrompt && !isConnected && (
            <span className="block text-xs text-amber-400 mt-1">
              Set up this channel before enabling it.
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          {isConnected ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-slate-400 hover:text-slate-300 px-2 py-1 rounded transition-colors"
            >
              {expanded ? "Hide" : "Manage"}
            </button>
          ) : (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-violet-400 hover:text-violet-300 px-2 py-1 rounded border border-violet-500/20 hover:border-violet-500/40 transition-colors"
            >
              {expanded ? "Cancel" : "Set up"}
            </button>
          )}
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggle}
            disabled={saving}
            className="rounded border-slate-300 dark:border-white/[0.1] bg-slate-100 dark:bg-[#12121e] text-violet-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
          />
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-3 border-t border-white/[0.04]">
          <ChannelSetupForm
            channelName={channel}
            onConnected={handleConnected}
            onDisconnect={handleDisconnect}
          />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main panel                                                         */
/* ------------------------------------------------------------------ */

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
          err instanceof Error
            ? err.message
            : "Couldn't enable push notifications."
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

  // Build the channel list: use the channels from the API, plus ensure all
  // known channels from CHANNEL_META are shown (they may not be returned yet
  // if the backend hasn't enabled them).
  const channelList = Array.from(
    new Set([...channels, ...Object.keys(CHANNEL_META)])
  ).filter((ch) => ch !== "push" || pushSupported());

  return (
    <div className="bg-slate-100 dark:bg-[#12121e] border border-slate-200 dark:border-white/[0.06] rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-900 dark:text-white font-medium">
            Alert Notifications
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Get notified when new filing events match your criteria.
          </p>
        </div>
        <button
          onClick={() => update({ enabled: !preferences.enabled })}
          disabled={saving}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            preferences.enabled
              ? "bg-violet-600"
              : "bg-slate-300 dark:bg-white/[0.1]"
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
              {channelList.map((channel) => (
                <ChannelRow
                  key={channel}
                  channel={channel}
                  enabled={preferences.channels[channel] ?? false}
                  saving={saving}
                  onToggle={toggleChannel}
                  pushBusy={pushBusy}
                />
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
