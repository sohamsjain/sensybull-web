"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  AnalystMessage,
  AnalystResponse,
  Position,
  PositionsResponse,
  PositionResponse,
  Scorecard,
  ScorecardResponse,
  ThesisAssessment,
  AssessmentsResponse,
  ThesisDraft,
  ThesisDraftResponse,
  ThesisStatus,
  ThesisStructured,
  ThesisVersionEntry,
  ThesisVersionsResponse,
} from "@/types/api";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/context/socket-provider";

export interface OpenPositionInput {
  company_id: string;
  direction?: "long" | "short";
  shares?: string | null;
  cost_basis?: string | null;
  thesis?: string | null;
  thesis_structured?: ThesisStructured | null;
  /** Who produced this thesis revision: typed vs accepted from the assistant. */
  thesis_source?: "user" | "assist";
  notes?: string | null;
}

/** AI drafting assistant: raw investor notes → structured falsifiable thesis. */
export async function draftThesis(
  rawText: string,
  companyId?: string | null,
  direction: "long" | "short" = "long"
): Promise<ThesisDraft> {
  const data = await api<ThesisDraftResponse>("/positions/draft-thesis", {
    method: "POST",
    body: JSON.stringify({
      raw_text: rawText,
      company_id: companyId ?? null,
      direction,
    }),
  });
  return data.draft;
}

/** One turn of the per-position analyst chat; the caller owns the history. */
export async function askAnalyst(
  positionId: string,
  messages: AnalystMessage[]
): Promise<AnalystResponse> {
  return api<AnalystResponse>(`/positions/${positionId}/analyst`, {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
}

// Recent assessments are polled (no per-page socket owner yet), mirroring
// the movers hook's cadence.
const ASSESSMENTS_REFRESH_MS = 120_000;

export function usePositions() {
  const { user } = useAuth();
  const { lastThesisAlert } = useSocket();
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

  // A live thesis_alert means a held thesis just moved — refresh immediately
  // instead of waiting for the poll (state set only in promise callbacks).
  useEffect(() => {
    if (!lastThesisAlert || !user) return;
    let cancelled = false;
    api<PositionsResponse>("/positions/")
      .then((d) => {
        if (!cancelled) setPositions(d.positions || []);
      })
      .catch(() => {});
    api<AssessmentsResponse>("/positions/assessments?limit=50")
      .then((d) => {
        if (!cancelled) setAssessments(d.assessments || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lastThesisAlert, user]);

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

/** Thesis revision history for a single position, loaded on demand. */
export function usePositionVersions(positionId: string | null) {
  const [versions, setVersions] = useState<ThesisVersionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!positionId) return;
    let cancelled = false;
    api<ThesisVersionsResponse>(`/positions/${positionId}/versions`)
      .then((data) => {
        if (!cancelled) setVersions(data.versions || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [positionId]);

  return { versions, loading };
}

/** Track record: the user's verdicts vs the tape (refreshed with alerts). */
export function useScorecard() {
  const { user } = useAuth();
  const { lastThesisAlert } = useSocket();
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api<ScorecardResponse>("/positions/scorecard")
      .then((d) => {
        if (!cancelled) setScorecard(d.scorecard);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, lastThesisAlert]);

  return scorecard;
}
