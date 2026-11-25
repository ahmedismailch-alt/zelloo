// Auto-print is a per-device preference: only the device that is connected to
// the receipt printer should print, so it is stored on the device itself.
const STORAGE_KEY = "zelloo_auto_print";

export function isAutoPrintEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAutoPrintEnabled(enabled: boolean) {
  try {
    if (enabled) {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage can be blocked (private mode); the toggle simply won't persist.
  }
}
