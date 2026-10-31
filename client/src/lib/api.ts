export type ApiResult = { ok: true; message: string; mode?: string } | { ok: false; error: string };

/**
 * Posts JSON to our own API. The custom header plus same-origin request lets the
 * server reject cross-site (CSRF) submissions. No cookies or tokens are sent.
 */
export async function postJson(path: "/api/demo-call" | "/api/contact", body: unknown): Promise<ApiResult> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Requested-With": "rimarc-web" },
      credentials: "omit",
      cache: "no-store",
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
    const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string; mode?: string };
    if (res.ok) return { ok: true, message: data.message ?? "Done.", mode: data.mode };
    return { ok: false, error: data.error ?? "Something went wrong. Please try again." };
  } catch {
    return { ok: false, error: "Network problem. Please check your connection and try again." };
  }
}

/** Measures how long the form was open; the server rejects instant (bot) submissions. */
export function formTimer() {
  const start = performance.now();
  return () => Math.round(performance.now() - start);
}
