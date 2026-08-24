"use client";

import { useState } from "react";
import { useChannelConfig, useTelegramLink } from "@/hooks/use-channel-config";

interface SetupFormProps {
  channelName: string;
  onConnected: () => void;
  onDisconnect: () => void;
}

/* ------------------------------------------------------------------ */
/*  Shared styles                                                      */
/* ------------------------------------------------------------------ */

const inputClass =
  "w-full rounded-md border border-line-subtle bg-canvas-sunken px-2.5 py-1.5 text-label text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand/60";

const btnPrimaryClass =
  "inline-flex h-7 items-center rounded-md bg-brand px-2.5 text-label font-medium text-brand-on transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50";

const btnDangerClass =
  "inline-flex h-7 items-center rounded-md bg-danger-soft px-2.5 text-label font-medium text-danger transition-colors hover:bg-danger/20 disabled:cursor-not-allowed disabled:opacity-50";

const helperClass = "mt-1 text-meta text-ink-faint";
const errorClass = "mt-1 text-meta text-danger";

/* ------------------------------------------------------------------ */
/*  SMS                                                                */
/* ------------------------------------------------------------------ */

export function ChannelSetupSms({ channelName, onConnected, onDisconnect }: SetupFormProps) {
  const { config, verified, saving, error, save, remove } =
    useChannelConfig(channelName);
  const [phone, setPhone] = useState(config?.phone ?? "");
  const isConnected = config !== null;

  const handleSave = async () => {
    if (!phone.trim()) return;
    try {
      await save({ phone: phone.trim() });
      onConnected();
    } catch {}
  };

  const handleDisconnect = async () => {
    try {
      await remove();
      setPhone("");
      onDisconnect();
    } catch {}
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-3 pt-2">
        <span className="text-label text-ink-muted">
          {config.phone}
        </span>
        {verified && (
          <span className="rounded-xs bg-success-soft px-1.5 py-0.5 text-micro font-medium text-success">
            Verified
          </span>
        )}
        <button onClick={handleDisconnect} disabled={saving} className={btnDangerClass}>
          {saving ? "Removing..." : "Disconnect"}
        </button>
        {error && <span className={errorClass}>{error}</span>}
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center gap-2">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555 123 4567"
          className={inputClass + " max-w-xs"}
        />
        <button onClick={handleSave} disabled={saving || !phone.trim()} className={btnPrimaryClass}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <p className={helperClass}>Enter your phone number with country code.</p>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Telegram                                                           */
/* ------------------------------------------------------------------ */

export function ChannelSetupTelegram({ channelName, onConnected, onDisconnect }: SetupFormProps) {
  const { config, verified, saving, error: configError, remove } =
    useChannelConfig(channelName);
  const { link, loading: linkLoading, error: linkError } = useTelegramLink();
  const [linkData, setLinkData] = useState<{ code: string; bot_username: string } | null>(null);
  const isConnected = config !== null;

  const handleConnect = async () => {
    try {
      const data = await link();
      setLinkData(data);
    } catch {}
  };

  const handleDisconnect = async () => {
    try {
      await remove();
      setLinkData(null);
      onDisconnect();
    } catch {}
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-3 pt-2">
        <span className="text-label text-ink-muted">Telegram connected</span>
        {verified && (
          <span className="rounded-xs bg-success-soft px-1.5 py-0.5 text-micro font-medium text-success">
            Verified
          </span>
        )}
        <button onClick={handleDisconnect} disabled={saving} className={btnDangerClass}>
          {saving ? "Removing..." : "Disconnect"}
        </button>
        {configError && <span className={errorClass}>{configError}</span>}
      </div>
    );
  }

  if (linkData) {
    return (
      <div className="space-y-2 pt-2">
        <p className="text-label text-ink-muted">
          Send this code to{" "}
          <a
            href={`https://t.me/${linkData.bot_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-ink underline underline-offset-2"
          >
            @{linkData.bot_username}
          </a>{" "}
          on Telegram:
        </p>
        <code className="block rounded-md border border-line-subtle bg-canvas-sunken px-3 py-2 font-mono text-label tracking-widest text-ink">
          {linkData.code}
        </code>
        <p className={helperClass}>
          After sending the code, refresh to see your connection status.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      <button onClick={handleConnect} disabled={linkLoading} className={btnPrimaryClass}>
        {linkLoading ? "Generating..." : "Connect Telegram"}
      </button>
      <p className={helperClass}>
        You&apos;ll get a code to send to our Telegram bot.
      </p>
      {linkError && <p className={errorClass}>{linkError}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Discord                                                            */
/* ------------------------------------------------------------------ */

export function ChannelSetupDiscord({ channelName, onConnected, onDisconnect }: SetupFormProps) {
  const { config, verified, saving, error, save, remove } =
    useChannelConfig(channelName);
  const [webhookUrl, setWebhookUrl] = useState(config?.webhook_url ?? "");
  const isConnected = config !== null;

  const handleSave = async () => {
    if (!webhookUrl.trim()) return;
    try {
      await save({ webhook_url: webhookUrl.trim() });
      onConnected();
    } catch {}
  };

  const handleDisconnect = async () => {
    try {
      await remove();
      setWebhookUrl("");
      onDisconnect();
    } catch {}
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-3 pt-2">
        <span className="text-label text-ink-muted truncate max-w-xs">
          {config.webhook_url}
        </span>
        {verified && (
          <span className="rounded-xs bg-success-soft px-1.5 py-0.5 text-micro font-medium text-success">
            Verified
          </span>
        )}
        <button onClick={handleDisconnect} disabled={saving} className={btnDangerClass}>
          {saving ? "Removing..." : "Disconnect"}
        </button>
        {error && <span className={errorClass}>{error}</span>}
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center gap-2">
        <input
          type="url"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://discord.com/api/webhooks/..."
          className={inputClass + " max-w-md"}
        />
        <button onClick={handleSave} disabled={saving || !webhookUrl.trim()} className={btnPrimaryClass}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <p className={helperClass}>
        In Discord, go to Channel Settings &rarr; Integrations &rarr; Webhooks &rarr; New Webhook, then paste the URL here.
      </p>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Slack                                                              */
/* ------------------------------------------------------------------ */

export function ChannelSetupSlack({ channelName, onConnected, onDisconnect }: SetupFormProps) {
  const { config, verified, saving, error, save, remove } =
    useChannelConfig(channelName);
  const [webhookUrl, setWebhookUrl] = useState(config?.webhook_url ?? "");
  const isConnected = config !== null;

  const handleSave = async () => {
    if (!webhookUrl.trim()) return;
    try {
      await save({ webhook_url: webhookUrl.trim() });
      onConnected();
    } catch {}
  };

  const handleDisconnect = async () => {
    try {
      await remove();
      setWebhookUrl("");
      onDisconnect();
    } catch {}
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-3 pt-2">
        <span className="text-label text-ink-muted truncate max-w-xs">
          {config.webhook_url}
        </span>
        {verified && (
          <span className="rounded-xs bg-success-soft px-1.5 py-0.5 text-micro font-medium text-success">
            Verified
          </span>
        )}
        <button onClick={handleDisconnect} disabled={saving} className={btnDangerClass}>
          {saving ? "Removing..." : "Disconnect"}
        </button>
        {error && <span className={errorClass}>{error}</span>}
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center gap-2">
        <input
          type="url"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://hooks.slack.com/services/..."
          className={inputClass + " max-w-md"}
        />
        <button onClick={handleSave} disabled={saving || !webhookUrl.trim()} className={btnPrimaryClass}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <p className={helperClass}>
        Create an Incoming Webhook in your Slack workspace settings, then paste the URL here.
      </p>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  WhatsApp                                                           */
/* ------------------------------------------------------------------ */

export function ChannelSetupWhatsapp({ channelName, onConnected, onDisconnect }: SetupFormProps) {
  const { config, verified, saving, error, save, remove } =
    useChannelConfig(channelName);
  const [phone, setPhone] = useState(config?.phone ?? "");
  const isConnected = config !== null;

  const handleSave = async () => {
    if (!phone.trim()) return;
    try {
      await save({ phone: phone.trim() });
      onConnected();
    } catch {}
  };

  const handleDisconnect = async () => {
    try {
      await remove();
      setPhone("");
      onDisconnect();
    } catch {}
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-3 pt-2">
        <span className="text-label text-ink-muted">
          {config.phone}
        </span>
        {verified && (
          <span className="rounded-xs bg-success-soft px-1.5 py-0.5 text-micro font-medium text-success">
            Verified
          </span>
        )}
        <button onClick={handleDisconnect} disabled={saving} className={btnDangerClass}>
          {saving ? "Removing..." : "Disconnect"}
        </button>
        {error && <span className={errorClass}>{error}</span>}
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center gap-2">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555 123 4567"
          className={inputClass + " max-w-xs"}
        />
        <button onClick={handleSave} disabled={saving || !phone.trim()} className={btnPrimaryClass}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <p className={helperClass}>Enter your WhatsApp phone number with country code.</p>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Webhook                                                            */
/* ------------------------------------------------------------------ */

export function ChannelSetupWebhook({ channelName, onConnected, onDisconnect }: SetupFormProps) {
  const { config, verified, saving, error, save, remove } =
    useChannelConfig(channelName);
  const [url, setUrl] = useState(config?.url ?? "");
  const [secret, setSecret] = useState(config?.secret ?? "");
  const isConnected = config !== null;

  const handleSave = async () => {
    if (!url.trim()) return;
    const data: Record<string, string> = { url: url.trim() };
    if (secret.trim()) data.secret = secret.trim();
    try {
      await save(data);
      onConnected();
    } catch {}
  };

  const handleDisconnect = async () => {
    try {
      await remove();
      setUrl("");
      setSecret("");
      onDisconnect();
    } catch {}
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-3 pt-2">
        <span className="text-label text-ink-muted truncate max-w-xs">
          {config.url}
        </span>
        {verified && (
          <span className="rounded-xs bg-success-soft px-1.5 py-0.5 text-micro font-medium text-success">
            Verified
          </span>
        )}
        <button onClick={handleDisconnect} disabled={saving} className={btnDangerClass}>
          {saving ? "Removing..." : "Disconnect"}
        </button>
        {error && <span className={errorClass}>{error}</span>}
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-server.com/webhook"
          className={inputClass + " max-w-md"}
        />
        <button onClick={handleSave} disabled={saving || !url.trim()} className={btnPrimaryClass}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Signing secret (optional)"
          className={inputClass + " max-w-xs"}
        />
      </div>
      <p className={helperClass}>
        Events are POSTed as JSON. If a secret is set, payloads are signed with HMAC-SHA256 in the X-Sensybull-Signature header.
      </p>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Render the right form by channel name                              */
/* ------------------------------------------------------------------ */

export function ChannelSetupForm({
  channelName,
  onConnected,
  onDisconnect,
}: SetupFormProps) {
  const props = { channelName, onConnected, onDisconnect };

  switch (channelName) {
    case "sms":
      return <ChannelSetupSms {...props} />;
    case "telegram":
      return <ChannelSetupTelegram {...props} />;
    case "discord":
      return <ChannelSetupDiscord {...props} />;
    case "slack":
      return <ChannelSetupSlack {...props} />;
    case "whatsapp":
      return <ChannelSetupWhatsapp {...props} />;
    case "webhook":
      return <ChannelSetupWebhook {...props} />;
    default:
      return null;
  }
}
