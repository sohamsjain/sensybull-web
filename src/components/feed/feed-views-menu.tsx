"use client";

import { useState } from "react";

import type { FeedView } from "@/types/api";
import {
  filtersFromView,
  hasAnyFilter,
  sameFilters,
  type FeedFilters,
  type FeedScope,
} from "@/lib/feed-filters";
import { viewErrorMessage } from "@/hooks/use-feed-views";
import { toast } from "@/components/ui/app-toaster";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckIcon, ChevronDownIcon, RemoveIcon, SavedViewIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FeedViewsMenuProps {
  views: FeedView[];
  scope: FeedScope;
  filters: FeedFilters;
  onApply: (scope: FeedScope, filters: FeedFilters) => void;
  onCreate: (name: string) => Promise<FeedView>;
  onUpdate: (id: string) => Promise<FeedView>;
  onRemove: (id: string) => Promise<void>;
}

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

/**
 * Saved views: named filter sets ("Small-cap biotech readouts") a reader
 * returns to, stored on their account so they follow them across devices.
 *
 * The trigger names the view being shown, so a filtered feed always says
 * which lens it is; once the reader edits the filters away from a saved
 * view, the menu offers to update it instead of silently diverging.
 */
export function FeedViewsMenu({
  views,
  scope,
  filters,
  onApply,
  onCreate,
  onUpdate,
  onRemove,
}: FeedViewsMenuProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  // The view the reader last opened, so edits can be saved back into it
  const [lastOpenedId, setLastOpenedId] = useState<string | null>(null);

  const active = currentView(views, scope, filters);
  const lastOpened = views.find((v) => v.id === lastOpenedId) ?? null;
  const drifted = !active && lastOpened;
  const canSave = hasAnyFilter(filters) || scope === "mine";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      const view = await onCreate(trimmed);
      setLastOpenedId(view.id);
      setSaving(false);
      setName("");
      toast({ title: `Saved “${view.name}”` });
    } catch (err) {
      toast({ title: "Couldn't save that view", description: viewErrorMessage(err), tone: "danger" });
    }
    setBusy(false);
  };

  const update = async (view: FeedView) => {
    try {
      await onUpdate(view.id);
      toast({ title: `Updated “${view.name}”` });
    } catch (err) {
      toast({ title: "Couldn't update that view", description: viewErrorMessage(err), tone: "danger" });
    }
  };

  const remove = async (view: FeedView) => {
    try {
      await onRemove(view.id);
      if (lastOpenedId === view.id) setLastOpenedId(null);
    } catch (err) {
      toast({ title: "Couldn't delete that view", description: viewErrorMessage(err), tone: "danger" });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className={cn(
                "inline-flex h-8 max-w-48 shrink-0 items-center gap-1.5 rounded-sm px-2 text-meta font-medium transition-colors",
                active
                  ? "bg-brand-soft text-brand-ink"
                  : "text-ink-muted hover:bg-surface-hover hover:text-ink"
              )}
            />
          }
        >
          <SavedViewIcon className="size-3.5 shrink-0" />
          <span className="truncate">{active ? active.name : "Views"}</span>
          <ChevronDownIcon className="size-3.5 shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-64">
          {views.length > 0 && (
            <>
              <DropdownMenuLabel>Saved views</DropdownMenuLabel>
              {views.map((v) => {
                const isActive = active?.id === v.id;
                return (
                  <DropdownMenuItem
                    key={v.id}
                    onClick={() => {
                      const next = filtersFromView(v.filters);
                      setLastOpenedId(v.id);
                      onApply(next.scope, next.filters);
                    }}
                    className="group/view gap-2"
                  >
                    <CheckIcon
                      className={cn("size-3.5", isActive ? "text-brand-ink" : "invisible")}
                    />
                    <span className="min-w-0 flex-1 truncate">{v.name}</span>
                    <span
                      role="button"
                      tabIndex={-1}
                      aria-label={`Delete ${v.name}`}
                      title="Delete view"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        void remove(v);
                      }}
                      className="-mr-1 inline-flex size-7 items-center justify-center rounded-xs text-ink-faint opacity-0 transition-colors group-hover/view:opacity-100 group-focus/view:opacity-100 hover:bg-danger-soft hover:text-danger"
                    >
                      <RemoveIcon className="size-3.5" />
                    </span>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
            </>
          )}
          {drifted && (
            <DropdownMenuItem onClick={() => void update(lastOpened)}>
              Update “{lastOpened.name}” to these filters
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            disabled={!canSave || !!active}
            onClick={() => setSaving(true)}
          >
            {active ? "This view is saved" : "Save these filters as a view…"}
          </DropdownMenuItem>
          {views.length === 0 && (
            <p className="px-2 pt-1 pb-2 text-micro text-ink-faint">
              Set up filters, then save them to come back to that slice of
              the market in one click.
            </p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={saving} onOpenChange={setSaving}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="text-title">Save view</DialogTitle>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <Input
              autoFocus
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Small-cap biotech readouts"
              aria-label="View name"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setSaving(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim() || busy}>
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
