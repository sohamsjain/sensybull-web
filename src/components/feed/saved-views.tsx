"use client";

import { useState } from "react";
import Link from "next/link";

import type { FeedView } from "@/types/api";
import {
  filtersFromView,
  hasAnyFilter,
  sameFilters,
  type FeedFilters,
  type FeedScope,
} from "@/lib/feed-filters";
import { viewErrorMessage, type FeedViews } from "@/hooks/use-feed-views";
import { toast } from "@/components/ui/app-toaster";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BellIcon, CheckIcon, PlusIcon, RemoveIcon, SavedViewIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** The saved view the feed is showing right now, if any. */
export function currentView(
  views: FeedView[],
  scope: FeedScope,
  filters: FeedFilters
): FeedView | null {
  return (
    views.find((v) => {
      const view = filtersFromView(v.filters);
      return view.scope === scope && sameFilters(view.filters, filters);
    }) ?? null
  );
}

/** A view can be saved once it narrows something — scope counts. */
export function canSaveView(scope: FeedScope, filters: FeedFilters): boolean {
  return hasAnyFilter(filters) || scope === "mine";
}

/**
 * What the reader just signed up for, in their terms. The API sends the
 * view's matches per day over the last week; a view that would have sent
 * fifty alerts a day says so now rather than in tomorrow's inbox.
 */
function alertRateLine(view: FeedView): string | undefined {
  const rate = view.alert_rate;
  if (rate == null) return undefined;
  if (rate === 0) return "Nothing matched it last week — you'll hear when something does.";
  if (rate < 1) {
    const week = Math.max(1, Math.round(rate * 7));
    return `About ${week} alert${week === 1 ? "" : "s"} a week, going by last week.`;
  }
  const n = Math.round(rate);
  const line = `About ${n} alert${n === 1 ? "" : "s"} a day, going by last week.`;
  return n > 25 ? `${line} Narrow it if that's too many.` : line;
}

export function alertToast(view: FeedView) {
  toast({
    title: view.alerts ? `Alerts on for “${view.name}”` : `Alerts off for “${view.name}”`,
    description: view.alerts
      ? alertRateLine(view)
      : "It stays saved; you just won't be notified.",
  });
}

/**
 * Named filter sets with optional alerts — the left rail's top section.
 *
 * Each row opens its view; the bell beside it turns alerts on or off for
 * that view (sent through the reader's alert channels, like the alerts for
 * companies they follow). Under the list, one button saves whatever is on
 * screen; once the reader edits the filters away from the view they
 * opened, it offers to update that view instead of silently diverging.
 */
export function SavedViewsSection({
  views,
  signedIn,
  scope,
  filters,
  onApply,
}: {
  views: FeedViews;
  signedIn: boolean;
  scope: FeedScope | null;
  filters: FeedFilters;
  onApply: (scope: FeedScope, filters: FeedFilters) => void;
}) {
  const [saving, setSaving] = useState(false);

  if (!signedIn) {
    return (
      <section>
        <h3 className="eyebrow mb-2">Saved views</h3>
        <p className="text-meta leading-snug text-ink-muted">
          Save a set of filters to come back to it in one click — and get an
          alert when a new update matches.
        </p>
        <Link
          href="/login"
          className="mt-2 inline-flex min-h-8 items-center text-meta font-medium text-brand-ink hover:underline"
        >
          Sign in to save views
        </Link>
      </section>
    );
  }
  if (!scope) return null;

  const active = currentView(views.views, scope, filters);
  const lastOpened = views.views.find((v) => v.id === views.lastOpenedId) ?? null;
  const drifted = !active && lastOpened ? lastOpened : null;
  const canSave = canSaveView(scope, filters) && !active;

  const toggleAlerts = async (view: FeedView) => {
    try {
      alertToast(await views.setAlerts(view.id, !view.alerts));
    } catch (err) {
      toast({
        title: "Couldn't change that view's alerts",
        description: viewErrorMessage(err),
        tone: "danger",
      });
    }
  };

  const remove = async (view: FeedView) => {
    try {
      await views.remove(view.id);
      toast({ title: `Deleted “${view.name}”` });
    } catch (err) {
      toast({ title: "Couldn't delete that view", description: viewErrorMessage(err), tone: "danger" });
    }
  };

  const update = async (view: FeedView) => {
    try {
      await views.update(view.id, scope, filters);
      toast({ title: `Updated “${view.name}”` });
    } catch (err) {
      toast({ title: "Couldn't update that view", description: viewErrorMessage(err), tone: "danger" });
    }
  };

  return (
    <section>
      <h3 className="eyebrow mb-2">Saved views</h3>

      {views.views.length > 0 ? (
        <ul className="-mx-2 flex flex-col">
          {views.views.map((v) => {
            const isActive = active?.id === v.id;
            return (
              <li key={v.id} className="group/view flex items-center">
                <button
                  type="button"
                  aria-current={isActive || undefined}
                  onClick={() => {
                    const next = filtersFromView(v.filters);
                    views.setLastOpenedId(v.id);
                    onApply(next.scope, next.filters);
                  }}
                  className={cn(
                    "flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-sm px-2 text-left text-meta font-medium transition-colors",
                    isActive
                      ? "bg-brand-soft text-brand-ink"
                      : "text-ink-muted hover:bg-surface-hover hover:text-ink"
                  )}
                >
                  <SavedViewIcon className="size-3.5 shrink-0" />
                  <span className="truncate">{v.name}</span>
                </button>
                <button
                  type="button"
                  aria-pressed={v.alerts}
                  aria-label={v.alerts ? `Turn off alerts for ${v.name}` : `Alert me about ${v.name}`}
                  title={v.alerts ? "Alerts on — click to turn off" : "Get alerts for this view"}
                  onClick={() => void toggleAlerts(v)}
                  className={cn(
                    "inline-flex size-8 shrink-0 items-center justify-center rounded-sm transition-colors",
                    v.alerts
                      ? "text-brand-ink hover:bg-surface-hover"
                      : "text-ink-faint hover:bg-surface-hover hover:text-ink [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/view:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
                  )}
                >
                  <BellIcon className={cn("size-3.5", v.alerts && "fill-current")} />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${v.name}`}
                  title="Delete view"
                  onClick={() => void remove(v)}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/view:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
                >
                  <RemoveIcon className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-meta leading-snug text-ink-faint">
          Set up filters, then save them here to come back to that slice of
          the market in one click — with alerts if you want them.
        </p>
      )}

      <div className="mt-2 flex flex-col gap-1.5">
        {drifted && (
          <Button variant="outline" size="sm" onClick={() => void update(drifted)} className="justify-start">
            <span className="truncate">Update “{drifted.name}”</span>
          </Button>
        )}
        <Button
          variant={canSave ? "secondary" : "ghost"}
          size="sm"
          disabled={!canSave}
          onClick={() => setSaving(true)}
          className="justify-start"
          title={active ? "These filters are already saved" : canSave ? undefined : "Pick a filter first"}
        >
          {active ? <CheckIcon /> : <PlusIcon />}
          {active ? "Saved" : "Save these filters"}
        </Button>
      </div>

      <SaveViewDialog
        open={saving}
        onOpenChange={setSaving}
        onSave={(name, alerts) => views.create(name, scope, filters, alerts)}
      />
    </section>
  );
}

/**
 * Name a view and, optionally, switch its alerts on in the same step —
 * the moment a reader has built a filter worth saving is the moment they
 * know whether they want to hear about it.
 */
export function SaveViewDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, alerts: boolean) => Promise<FeedView>;
}) {
  const [name, setName] = useState("");
  const [alerts, setAlerts] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      const view = await onSave(trimmed, alerts);
      onOpenChange(false);
      setName("");
      setAlerts(false);
      if (view.alerts) alertToast(view);
      else toast({ title: `Saved “${view.name}”` });
    } catch (err) {
      toast({ title: "Couldn't save that view", description: viewErrorMessage(err), tone: "danger" });
    }
    setBusy(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogTitle className="text-title">Save view</DialogTitle>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input
            autoFocus
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Small-cap biotech readouts"
            aria-label="View name"
          />
          <label className="flex cursor-pointer items-start justify-between gap-3">
            <span>
              <span className="block text-label font-medium text-ink">
                Alert me about new matches
              </span>
              <span className="block text-meta text-ink-faint">
                Sent the way your other alerts are.{" "}
                <Link href="/alerts" className="text-brand-ink hover:underline">
                  Choose channels
                </Link>
              </span>
            </span>
            <Switch checked={alerts} onCheckedChange={setAlerts} className="mt-1" />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || busy}>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
