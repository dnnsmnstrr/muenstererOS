import { dev } from '$app/environment';

// we need JS on this page for i18n
export const csr = true;

// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true;
