const ALLOWED_HOSTS = new Set([
  "www.profitableratecpm.com",
  "otieu.com",
  "monetag.com",
]);

export function safeLoadAdScript(src: string, id: string): boolean {
  try {
    const url = new URL(src);
    if (!ALLOWED_HOSTS.has(url.hostname)) {
      return false;
    }
    if (document.getElementById(id)) return true;

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.referrerPolicy = "no-referrer-when-downgrade";
    document.body.appendChild(script);
    return true;
  } catch {
    return false;
  }
}
