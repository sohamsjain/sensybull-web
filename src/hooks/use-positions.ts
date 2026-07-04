"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Position,
  PositionsResponse,
  PositionResponse,
  ThesisAssessment,
  AssessmentsResponse,
  ThesisStatus,
} from "@/types/api";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

export interface OpenPositionInput {
  company_id: string;
  direction?: "long" | "short";
  shares?: string | null;
  cost_basis?: string | null;
  thesis?: string | null;
  notes?: string | null;
}

// Recent assessments are polled (no per-page socket owner yet), mirroring
// the movers hook's cadence.
const ASSESSMENTS_REFRESH_MS = 120_000;

export function usePositions() {
  const { user } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [assessments, setAssessments] = useState<ThesisAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  // State is only ever set after an await (never synchronously), so these
  // are safe to call from an effect without triggering cascading renders.
  const fetchPositions = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api<PositionsResponse>("/positions/");
      setPositions(data.positions || []);
    } catch {}
  }, [user]);

  const fetchAssessments = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api<AssessmentsResponse>("/positions/assessments?limit=50");
      setAssessments(data.assessments || []);
    } catch {}
  }, [user]);

  // Inline fetches (state set only inside promise callbacks) so the effect
  // never sets state synchronously — mirrors use-movers.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadPositions = () =>
      api<PositionsResponse>("/positions/")
        .then((d) => {
          if (!cancelled) setPositions(d.positions || []);
        })
        .catch(() => {});
    const loadAssessments = () =>
      api<AssessmentsResponse>("/positions/assessments?limit=50")
        .then((d) => {
          if (!cancelled) setAssessments(d.assessments || []);
        })
        .catch(() => {});

    Promise.all([loadPositions(), loadAssessments()]).finally(() => {
      if (!cancelled) setLoading(false);
    });
    const timer = setInterval(loadAssessments, ASSESSMENTS_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [user]);

  const open = useCallback(
    async (input: OpenPositionInput) => {
      const data = await api<PositionResponse>("/positions/", {
        method: "POST",
        body: JSON.stringify(input),
      });
      await fetchPositions();
      return data.position;
    },
    [fetchPositions]
  );

  const update = useCallback(
    async (id: string, patch: Partial<OpenPositionInput> & { thesis_status?: ThesisStatus }) => {
      const data = await api<PositionResponse>(`/positions/${id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      await fetchPositions();
      return data.position;
    },
    [fetchPositions]
  );

  const remove = useCallback(
    async (id: string) => {
      await api(`/positions/${id}`, { method: "DELETE" });
      await fetchPositions();
    },
    [fetchPositions]
  );

  return {
    positions,
    assessments,
    loading,
    open,
    update,
    remove,
    refetch: fetchPositions,
    refetchAssessments: fetchAssessments,
  };
}

/** Assessment history for a single position, loaded on demand. */
export function usePositionAssessments(positionId: string | null) {
  const [assessments, setAssessments] = useState<ThesisAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!positionId) return;
    let cancelled = false;
    api<AssessmentsResponse>(`/positions/${positionId}/assessments`)
      .then((data) => {
        if (!cancelled) setAssessments(data.assessments || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [positionId]);

  return { assessments, loading };
}
