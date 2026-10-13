"use client";

import { useState } from "react";

import type { FeedView } from "@/types/api";
import {
  filtersFromView,
  type FeedFilters,
  type FeedScope,
} from "@/lib/feed-filters";
import { viewErrorMessage, type FeedViews } from "@/hooks/use-feed-views";
import { toast } from "@/components/ui/app-toaster";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BellIcon,
  CheckIcon,
  ChevronDownIcon,
  RemoveIcon,
  SavedViewIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import {
  SaveViewDialog,
  alertToast,
  canSaveView,
  currentView,
} from "./saved-views";

interface FeedViewsMenuProps {
  views: FeedViews;
  scope: FeedScope;
  filters: FeedFilters;
  onApply: (scope: FeedScope, filters: FeedFilters) => void;
}

/**
 * Saved views below `lg`, where there is no left rail to list them: one
 * menu in the toolbar. The trigger names the view being shown, so a
 * filtered feed always says which lens it is; once the reader edits the
 * filters away from a saved view, the menu offers to update it.
 *
 * Every row action (alerts, delete) is visible without hover — on a phone
 * there is no hover to reveal it.
 */
export function FeedViewsMenu({
  views,
  scope,
  filters,
  onApply,
}: FeedViewsMenuProps) {
  const [saving, setSaving] = useState(false);

  const active = currentView(views.views, scope, filters);
  const lastOpened =
    views.views.find((v) => v.id === views.lastOpenedId) ?? null;
  const drifted = !active && lastOpened ? lastOpened : null;
  const canSave = canSaveView(scope, filters);

  const run = async (fn: () => Promise<unknown>, failure: string) => {
    try {
      await fn();
    } catch (err) {
      toast({
        title: failure,
        description: viewErrorMessage(err),
        tone: "danger",
      });
    }
  };

  const rowAction = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className={cn(
                "inline-flex h-9 max-w-44 shrink-0 items-center gap-1.5 rounded-sm px-2.5 text-meta font-medium transition-colors",
                active
                  ? "bg-brand-soft text-brand-ink"
                  : "text-ink-muted hover:bg-surface-hover hover:text-ink",
              )}
            />
          }
        >
          <SavedViewIcon
            className={cn("size-4 shrink-0", active && "fill-current")}
          />
          {/* A phone's toolbar has room for the icon only; it fills in
              while a saved view is on screen */}
          <span className="hidden truncate sm:inline">
            {active ? active.name : "Views"}
          </span>
          <span className="sr-only sm:hidden">
            {active ? `View: ${active.name}` : "Saved views"}
          </span>
          {active?.alerts && (
            <BellIcon
              className="size-3 shrink-0 fill-current"
              aria-label="alerts on"
            />
          )}
          <ChevronDownIcon className="hidden size-3.5 shrink-0 sm:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-72">
          {views.views.length > 0 && (
            <>
              {/* Base UI throws without the group around a label — this
                  menu took the whole page down once a view existed */}
              <DropdownMenuGroup>
                <DropdownMenuLabel>Saved views</DropdownMenuLabel>
                {views.views.map((v: FeedView) => {
                  const isActive = active?.id === v.id;
                  return (
                    <DropdownMenuItem
                      key={v.id}
                      onClick={() => {
                        const next = filtersFromView(v.filters);
                        views.setLastOpenedId(v.id);
                        onApply(next.scope, next.filters);
                      }}
                      className="gap-2 pr-1"
                    >
                      <CheckIcon
                        className={cn(
                          "size-3.5",
                          isActive ? "text-brand-ink" : "invisible",
                        )}
                      />
                      <span className="min-w-0 flex-1 truncate">{v.name}</span>
                      <span
                        role="button"
                        tabIndex={-1}
                        aria-pressed={v.alerts}
                        aria-label={
                          v.alerts
                            ? `Turn off alerts for ${v.name}`
                            : `Alert me about ${v.name}`
                        }
                        onClick={(e) => {
                          rowAction(e);
                          void run(
                            async () =>
                              alertToast(
                                await views.setAlerts(v.id, !v.alerts),
                              ),
                            "Couldn't change that view's alerts",
                          );
                        }}
                        className={cn(
                          "inline-flex size-8 items-center justify-center rounded-xs transition-colors hover:bg-surface-active",
                          v.alerts
                            ? "text-brand-ink"
                            : "text-ink-faint hover:text-ink",
                        )}
                      >
                        <BellIcon
                          className={cn("size-3.5", v.alerts && "fill-current")}
                        />
                      </span>
                      <span
                        role="button"
                        tabIndex={-1}
                        aria-label={`Delete ${v.name}`}
                        onClick={(e) => {
                          rowAction(e);
                          void run(
                            () => views.remove(v.id),
                            "Couldn't delete that view",
                          );
                        }}
                        className="inline-flex size-8 items-center justify-center rounded-xs text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
                      >
                        <RemoveIcon className="size-3.5" />
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}
          {drifted && (
            <DropdownMenuItem
              onClick={() =>
                void run(async () => {
                  await views.update(drifted.id, scope, filters);
                  toast({ title: `Updated “${drifted.name}”` });
                }, "Couldn't update that view")
              }
            >
              Update “{drifted.name}” to these filters
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            disabled={!canSave || !!active}
            onClick={() => setSaving(true)}
          >
            {active ? "This view is saved" : "Save these filters as a view…"}
          </DropdownMenuItem>
          {views.views.length === 0 && (
            <p className="px-2 pt-1 pb-2 text-micro text-ink-faint">
              Set up filters, then save them to come back to that slice of the
              market in one click — and get alerts on new matches.
            </p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <SaveViewDialog
        open={saving}
        onOpenChange={setSaving}
        onSave={(name, alerts) => views.create(name, scope, filters, alerts)}
      />
    </>
  );
}
