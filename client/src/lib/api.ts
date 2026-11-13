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

/**
 * Where the forms are saved. On the static site (GitHub Pages) this is the Google Apps Script web app
 * that writes to the leads sheet; it is set at build time (VITE_LEADS_URL). Without it, the forms
 * post to our own Node API instead.
 */
const LEADS_URL = import.meta.env.VITE_LEADS_URL as string | undefined;

export async function submitForm(kind: "demo" | "contact", body: Record<string, unknown>): Promise<ApiResult> {
  if (!LEADS_URL) return postJson(kind === "demo" ? "/api/demo-call" : "/api/contact", body);
  try {
    // text/plain keeps this a "simple" request, which Apps Script accepts from a browser.
    const res = await fetch(LEADS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ type: kind, ...body }),
      credentials: "omit",
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; error?: string };
    if (res.ok && data.ok) return { ok: true, message: data.message ?? "Thanks! We've received your details." };
    return { ok: false, error: data.error ?? "Something went wrong. Please try again." };
  } catch {
    return { ok: false, error: "Network problem. Please check your connection and try again." };
  }
}
