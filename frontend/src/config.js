const defaultApiBase = import.meta.env.DEV ? '' : 'https://audit-tool-kmgv.onrender.com';
export const API_BASE = (import.meta.env.VITE_API_BASE || defaultApiBase).replace(/\/$/, '');
