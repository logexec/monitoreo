let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

export function performLogout() {
  if (logoutCallback) logoutCallback();
  window.location.href = "/login";
}