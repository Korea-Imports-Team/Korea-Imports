const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// ─── Token Refresh Interceptor ──────────────────────────────────────────────
let isRefreshing = false;
const refreshQueue = [];

function onRefreshed(token) {
  refreshQueue.forEach(({ resolve }) => resolve(token));
  refreshQueue.length = 0;
}

function onRefreshFailed() {
  refreshQueue.forEach(({ reject }) => reject(new ApiError('Token expirado', 401)));
  refreshQueue.length = 0;
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new ApiError('Sem refresh token', 401);
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Refresh-Token': refreshToken,
      },
    });

    if (!res.ok) {
      throw new ApiError('Refresh falhou', res.status);
    }

    const data = await res.json();
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    return data.accessToken;
  } catch (err) {
    // Limpar tokens e redirecionar
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authUser');
    window.location.href = '/entrar';
    throw err;
  }
}

async function request(path, { method = 'GET', body, auth = true, headers: customHeaders = {} } = {}) {
  const headers = body instanceof FormData 
    ? {} 
    : { 'Content-Type': 'application/json', ...customHeaders };
  
  if (auth) {
    const token = localStorage.getItem('accessToken');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const finalBody = body instanceof FormData 
    ? body 
    : body ? JSON.stringify(body) : undefined;

  let res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: finalBody,
  });

  // ─── Interceptar 401 e tentar refresh ───────────────────────────────────
  if (res.status === 401 && auth && path !== '/auth/refresh') {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onRefreshed(newToken);

        // Retenter requisição original com novo token
        headers.Authorization = `Bearer ${newToken}`;
        res = await fetch(`${BASE_URL}${path}`, {
          method,
          headers,
          body: finalBody,
        });
      } catch (err) {
        isRefreshing = false;
        onRefreshFailed();
        throw err;
      }
    } else {
      // Está fazendo refresh, fila a requisição
      const newToken = await new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });

      // Retenter com novo token
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: finalBody,
      });
    }
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.message || 'Erro inesperado', res.status);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};