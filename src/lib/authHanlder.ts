let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

export function performLogout() {
  if (logoutCallback) logoutCallback();
  // Redirigir al login
  window.location.href = "/login";
}