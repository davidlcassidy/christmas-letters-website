import { getCookieKeyValue, sha256 } from './utils';
import localizationJson from '../configs/localization.json';

/**
 * Middleware flow:
 * 1. Error handling wraps all requests.
 * 2. Handle login only for POST /login.
 * 3. Authentication for all other paths.
 */
export const onRequest = [errorHandling, handleLogin, authenticationCheck];

// Constants
const AUTH_COOKIE_KEY = 'Christmas-Letters-Auth-Key';
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours
const LOGIN_PATH = '/login';

// Middleware 1: Error Handling
async function errorHandling(context: { request: Request; next: () => Promise<Response> }) {
  try {
    return await context.next();
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 });
  }
}

// Middleware 2: Handle Login
async function handleLogin(context: { request: Request; env: { WEBSITE_PASSWORD?: string } }) {
  const { request, env } = context;
  const { pathname } = new URL(request.url);

  if (request.method === 'POST' && pathname === LOGIN_PATH) {
    const body = await request.formData();
    const { password, redirect } = Object.fromEntries(body);
    const hashedPassword = await sha256(password.toString());
    const hashedCfpPassword = await sha256(env.WEBSITE_PASSWORD);
    const redirectPath = redirect?.toString() || '/';

    if (hashedPassword === hashedCfpPassword) {
      const cookieKeyValue = await getCookieKeyValue(AUTH_COOKIE_KEY, env.WEBSITE_PASSWORD);

      return new Response('', {
        status: 302,
        headers: {
          'Set-Cookie': `${cookieKeyValue}; Max-Age=${AUTH_COOKIE_MAX_AGE}; Path=/; HttpOnly; Secure`,
          'Cache-Control': 'no-cache',
          Location: redirectPath,
        },
      });
    } else {
      return new Response('', {
        status: 302,
        headers: {
          'Cache-Control': 'no-cache',
          Location: `${redirectPath}?error=1`,
        },
      });
    }
  }

  return context.next();
}

// Middleware 3: Authentication Check
async function authenticationCheck(context: {
  request: Request;
  next: () => Promise<Response>;
  env: { WEBSITE_PASSWORD?: string };
}) {
  const { request, next, env } = context;
  const { pathname, searchParams } = new URL(request.url);
  const cookie = request.headers.get('cookie') || '';
  const cookieKeyValue = await getCookieKeyValue(AUTH_COOKIE_KEY, env.WEBSITE_PASSWORD);
  const browserLanguage = request.headers.get('accept-language')?.split(',')[0] || 'en';
  const { error } = Object.fromEntries(searchParams);

  if (cookie.includes(cookieKeyValue)) {
    return next();
  }

  const lang = browserLanguage.split('-')[0] || 'en';
  const html = getLoginTemplate({
    redirectPath: pathname,
    withError: error === '1',
    lang,
  });

  return new Response(html, {
    headers: { 'content-type': 'text/html' },
  });
}

// Login Template Function
function getLoginTemplate({
  redirectPath,
  withError,
  lang,
}: {
  redirectPath: string;
  withError: boolean;
  lang: string;
}): string {
  const t = localizationJson.translations[lang] || localizationJson.translations.en;
  return `
  <!doctype html>
  <html lang="${lang}" data-theme="dark">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${t.loginPageTitle}</title>
      <meta name="description" content="${t.loginPageDescription}">
      <link rel="stylesheet" href="https://unpkg.com/@picocss/pico@latest/css/pico.min.css">
      <style>
        body > main {
          display: flex;
          margin: auto;
          flex-direction: column;
          justify-content: center;
          min-height: calc(100vh - 7rem);
          padding: 1rem 0;
          max-width: 600px;
        }
        article {
          max-width: 95%;
          margin: auto;
          width: 800px;
        }
        .error {
          color: red;
        }
        h2 { color: var(--color-h2); }
      </style>
    </head>
    <body>
      <main>
        <article>
          <hgroup>
            <h1>${t.passwordLabel}</h1>
            <h2>${t.passwordPrompt}</h2>
          </hgroup>
          <form method="post" action="${LOGIN_PATH}">
            <input type="hidden" name="redirect" value="${redirectPath}" />
            <input
              type="password"
              name="password"
              placeholder="${t.passwordPlaceholder}"
              aria-label="${t.passwordPlaceholder}"
              autocomplete="current-password"
              required
              autofocus
              oninvalid="this.setCustomValidity('${t.requiredFieldMessage}')"
              oninput="this.setCustomValidity('')"
            >
            <button type="submit" class="contrast">${t.loginButton}</button>
          </form>
          ${withError ? `<p class="error">${t.loginErrorMessage}</p>` : ''}
        </article>
      </main>
    </body>
  </html>
  `;
}