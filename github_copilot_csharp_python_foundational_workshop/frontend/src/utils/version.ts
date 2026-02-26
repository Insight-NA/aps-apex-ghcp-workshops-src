// Version information injected at build time
export const APP_VERSION = '1.2.0';
export const BUILD_TIMESTAMP = import.meta.env.VITE_BUILD_TIMESTAMP || new Date().toISOString();

export function getVersionInfo(): string {
  const date = new Date(BUILD_TIMESTAMP);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  
  return `v${APP_VERSION} (Built: ${formattedDate} ${formattedTime})`;
}

export function getVersionShort(): string {
  return `v${APP_VERSION}`;
}
