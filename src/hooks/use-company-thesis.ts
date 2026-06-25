"use client";

import { useState, useEffect, useCallback } from "react";
import type { CompanyThesis } from "@/types/events";
import { api } from "@/lib/api-client";

interface ThesisState {
  companyId: string | null;
  thesis: CompanyThesis | null;
}

/**
 * The evolving investment thesis for one company. Refetches when `revalidateKey`
 * changes (pass the newest filing id so a fresh material update — which appends
 * a thesis revision on the backend — pulls the updated story).
 *
 * Keyed by companyId so switching companies never flashes the previous one's
 * thesis: the returned value is null (and `loading` true) until the matching
 * fetch resolves. Revalidations for the same company refresh silently.
 */
export function useCompanyThesis(
  companyId: string | null,
  revalidateKey?: string | null
) {
  const [state, setState] = useState<ThesisState>({ companyId: null, thesis: null });

  const fetchThesis = useCallback(() => {
    if (!companyId) return;
    api<CompanyThesis>(`/companies/${companyId}/thesis`)
      .then((data) => setState({ companyId, thesis: data }))
      .catch(() => setState({ companyId, thesis: null }));
  }, [companyId]);

  useEffect(() => {
    fetchThesis();
  }, [fetchThesis, revalidateKey]);

  const matched = state.companyId === companyId;
  return {
    thesis: matched ? state.thesis : null,
    loading: !!companyId && !matched,
    refetch: fetchThesis,
  };
}
