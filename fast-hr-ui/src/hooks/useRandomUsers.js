import { useCallback, useEffect, useRef, useState } from "react";

export default function useRandomUsers(options = {}) {
  const {
    results = 10,
    nat = "", // e.g. "us,gb,rs"
    seed = "", // optional stable seed
    include = "", // optional include fields
    exclude = "", // optional exclude fields
    enabled = true,
  } = options;

  const abortRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("results", String(results));

    if (nat) params.set("nat", nat);
    if (seed) params.set("seed", seed);
    if (include) params.set("inc", include);
    if (exclude) params.set("exc", exclude);

    return `https://randomuser.me/api/?${params.toString()}`;
  }, [results, nat, seed, include, exclude]);

  const cancel = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = null;
  }, []);

  const load = useCallback(async () => {
    cancel();

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const url = buildUrl();
      const res = await fetch(url, { signal: controller.signal });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const data = await res.json();
      setUsers(Array.isArray(data?.results) ? data.results : []);
    } catch (e) {
      if (e?.name !== "AbortError") {
        setUsers([]);
        setError(e?.message || "Failed to load random users.");
      }
    } finally {
      setLoading(false);
    }
  }, [buildUrl, cancel]);

  useEffect(() => {
    if (!enabled) return;
    load();
    return cancel;
  }, [enabled, load, cancel]);

  return {
    users,
    loading,
    error,
    reload: load,
    cancel,
  };
}
