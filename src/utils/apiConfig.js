/**
 * API Configuration Helper
 * Centralized API URLs for all forms - Node.js REST API Version
 */

/**
 * Internal helper to get the base API URL
 */
function getBaseUrl(store) {
  const hostname = window.location.hostname;
  const www = (store && store.getters) ? store.getters.myWWW : false;

  // Production Check
  const isProduction = hostname === 'icp.sif.or.th' || hostname === '10.2.0.6';

  if (isProduction || www) {
    return "https://icp.sif.or.th/api";
  }

  // Development Mode
  const backendMode = process.env.BACKEND_MODE || 'local';
  const remoteServer = "10.2.0.6";
  const localServer = "localhost";
  const targetHost = (backendMode === 'remote') ? remoteServer : localServer;
  const port = process.env.BACKEND_PORT || 3000;

  return `http://${targetHost}:${port}/api`;
}

/**
 * Get REST API base URL
 */
export function getRestApiUrl(store) {
  return getBaseUrl(store);
}

/**
 * Get AI Chat Service URL
 */
export function getChatUrl(store) {
  return `${getBaseUrl(store)}/chat`;
}

/**
 * Alias for backward compatibility if needed, though getRestApiUrl is preferred
 */
export function getApiBaseUrl(store) {
  return getBaseUrl(store);
}
