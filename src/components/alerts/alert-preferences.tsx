"use client";

import { useState, useCallback, useEffect } from "react";
import { useAlertPreferences, useAlertChannels } from "@/hooks/use-alerts";
import { useChannelConfig } from "@/hooks/use-channel-config";
import { pushSupported, enablePush, disablePush } from "@/lib/push";
import { ChannelSetupForm } from "@/components/alerts/channel-setup-forms";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

// Two plain choices mapped onto the API's tier threshold: important-only
// alerts (tier 1) or every filing (tier 3).
const SENSITIVITY_OPTIONS: { tier: 1 | 3; label: string; hint: string }[] = [
  { tier: 1, label: "Important only", hint: "Only events that typically move the stock" },
  { tier: 3, label: "Everything", hint: "Every filing from companies you follow" },
];

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
      <div className="flex items-center justify-between gap-3 border-b border-line-subtle py-2.5 last:border-0">
        <div className="min-w-0">
          <span className="text-label text-ink">{meta.label}</span>
          <span className="mt-0.5 block text-meta text-ink-faint">
            {meta.description}
          </span>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={() => onToggle(channel)}
          disabled={saving || (channel === "push" && pushBusy)}
          aria-label={meta.label}
        />
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
    <div className="border-b border-line-subtle py-2.5 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-label text-ink">{meta.label}</span>
            {isConnected && <Badge tone="success">Connected</Badge>}
            {loading && (
              <span className="text-meta text-ink-faint">Loading…</span>
            )}
          </div>
          <span className="mt-0.5 block text-meta text-ink-faint">
            {meta.description}
          </span>
          {setupPrompt && !isConnected && (
            <span className="mt-1 block text-meta text-warning">
              Set up this channel before enabling it.
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            size="xs"
            variant={isConnected ? "ghost" : "outline"}
            onClick={() => setExpanded(!expanded)}
          >
            {isConnected
              ? expanded
                ? "Hide"
                : "Manage"
              : expanded
                ? "Cancel"
                : "Set up"}
          </Button>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={saving}
            aria-label={meta.label}
          />
        </div>
      </div>
      {expanded && (
        <div className="mt-2.5 border-t border-line-subtle pt-2.5">
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
      <div className="space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 border-b border-line-subtle pb-4">
        <div>
          <h2 className="text-title font-medium text-ink">Alerts</h2>
          <p className="mt-0.5 text-label text-ink-faint">
            Get notified when a new filing matches what you follow.
          </p>
        </div>
        <Switch
          checked={preferences.enabled}
          onCheckedChange={(enabled) => update({ enabled })}
          disabled={saving}
          aria-label="Enable alerts"
          className="mt-1"
        />
      </div>

      {preferences.enabled && (
        <>
          {/* Tier selection */}
          <Section title="Sensitivity">
            <div className="flex items-center gap-3">
              <SegmentedControl
                label="How much to be alerted about"
                value={preferences.max_tier === 1 ? "important" : "all"}
                onChange={(value) =>
                  update({ max_tier: value === "important" ? 1 : 3 })
                }
                options={[
                  { value: "important", label: "Important only" },
                  { value: "all", label: "Everything" },
                ]}
              />
              <p className="text-meta text-ink-faint">
                {preferences.max_tier === 1
                  ? SENSITIVITY_OPTIONS[0].hint
                  : SENSITIVITY_OPTIONS[1].hint}
              </p>
            </div>
          </Section>

          {/* Channel toggles */}
          <Section title="Channels">
            <div>
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
              <p className="mt-2 text-meta text-danger">{pushError}</p>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
