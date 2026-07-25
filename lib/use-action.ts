"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

/** Client-side helper for calling app/api/action against a whitelisted backend method. */
export function useAction() {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (key: string, method: string, args?: Record<string, unknown>, opts?: { refresh?: boolean }) => {
      setBusyKey(key);
      setError(null);
      try {
        const res = await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method, args }),
        });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error || "Action failed");
          return null;
        }
        if (opts?.refresh !== false) router.refresh();
        return json.data;
      } catch {
        setError("Could not reach the server.");
        return null;
      } finally {
        setBusyKey(null);
      }
    },
    [router],
  );

  return { run, busyKey, error, setError };
}
