/**
 * Local Cookie-based Database Utility
 * Implements a chunked cookie-storage adapter to handle data persistence
 * within strict 4KB browser cookie constraints.
 */

// Helper to write a cookie
export function setCookie(name: string, value: string, days = 365) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  
  // Set with SameSite=Lax and Secure if HTTPS
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/" + secure + "; SameSite=Lax";
}

// Helper to get a cookie
export function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

// Helper to delete a cookie
export function eraseCookie(name: string) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
}

/**
 * Saves arbitrary data into cookies, automatically splitting it into chunks
 * if it exceeds 3KB to stay safely under the 4KB browser limit.
 */
export function saveToCookieDb(key: string, data: any): boolean {
  try {
    const stringified = JSON.stringify(data);
    
    // Clear old chunks first to avoid stale fragments
    clearCookieDb(key);

    const CHUNK_SIZE = 3000; // ~3KB safe limit per cookie
    if (stringified.length <= CHUNK_SIZE) {
      setCookie(key, stringified);
      setCookie(`${key}_meta`, JSON.stringify({ chunks: 1, length: stringified.length }));
    } else {
      const numChunks = Math.ceil(stringified.length / CHUNK_SIZE);
      for (let i = 0; i < numChunks; i++) {
        const start = i * CHUNK_SIZE;
        const chunk = stringified.substring(start, start + CHUNK_SIZE);
        setCookie(`${key}_chunk_${i}`, chunk);
      }
      setCookie(`${key}_meta`, JSON.stringify({ chunks: numChunks, length: stringified.length }));
    }
    return true;
  } catch (error) {
    console.error("Cookie Database Write Error:", error);
    return false;
  }
}

/**
 * Reads and reassembles data from the chunked cookie database.
 */
export function loadFromCookieDb(key: string): any | null {
  try {
    // Check if there's non-chunked legacy data
    const directData = getCookie(key);
    if (directData && !getCookie(`${key}_meta`)) {
      return JSON.parse(directData);
    }

    const metaStr = getCookie(`${key}_meta`);
    if (!metaStr) return null;

    const meta = JSON.parse(metaStr);
    if (meta.chunks === 1) {
      const data = getCookie(key);
      return data ? JSON.parse(data) : null;
    }

    let assembled = '';
    for (let i = 0; i < meta.chunks; i++) {
      const chunk = getCookie(`${key}_chunk_${i}`);
      if (!chunk) {
        throw new Error(`Missing cookie chunk ${i} for key ${key}`);
      }
      assembled += chunk;
    }

    return JSON.parse(assembled);
  } catch (error) {
    console.error("Cookie Database Read Error:", error);
    return null;
  }
}

/**
 * Erases cookie records associated with the specified key.
 */
export function clearCookieDb(key: string) {
  eraseCookie(key);
  const metaStr = getCookie(`${key}_meta`);
  if (metaStr) {
    try {
      const meta = JSON.parse(metaStr);
      for (let i = 0; i < meta.chunks; i++) {
        eraseCookie(`${key}_chunk_${i}`);
      }
    } catch (e) {
      // Ignored
    }
    eraseCookie(`${key}_meta`);
  }
}
