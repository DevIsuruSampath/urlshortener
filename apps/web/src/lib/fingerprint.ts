export function lightweightFingerprint() {
  const ua = navigator.userAgent || "";
  const lang = navigator.language || "";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  return btoa(`${ua}|${lang}|${tz}`);
}
