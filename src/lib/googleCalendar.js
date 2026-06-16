const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPE = 'https://www.googleapis.com/auth/calendar.events';

let tokenClient = null;
let _token = null;
let _expiry = 0;

function loadGIS() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const existing = document.getElementById('_gis');
    if (existing) { existing.addEventListener('load', resolve); existing.addEventListener('error', reject); return; }
    const s = document.createElement('script');
    s.id = '_gis';
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(s);
  });
}

// Returns a valid access token, prompting OAuth if needed
export async function requestToken() {
  if (!CLIENT_ID) throw new Error('VITE_GOOGLE_CLIENT_ID is not set');
  await loadGIS();

  // Re-use cached token if still valid (with 60s buffer)
  if (_token && Date.now() < _expiry - 60_000) return _token;

  // Check sessionStorage (survives page refresh within same session)
  const stored = sessionStorage.getItem('gc_token');
  const storedExp = parseInt(sessionStorage.getItem('gc_expiry') || '0', 10);
  if (stored && Date.now() < storedExp - 60_000) {
    _token = stored;
    _expiry = storedExp;
    return _token;
  }

  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: (resp) => {
          if (resp.error) { reject(new Error(resp.error_description || resp.error)); return; }
          _token = resp.access_token;
          _expiry = Date.now() + resp.expires_in * 1000;
          sessionStorage.setItem('gc_token', _token);
          sessionStorage.setItem('gc_expiry', String(_expiry));
          resolve(_token);
        },
        error_callback: (err) => reject(new Error(err.message || 'OAuth error')),
      });
    }
    // prompt: '' reuses existing consent silently if already granted
    tokenClient.requestAccessToken({ prompt: '' });
  });
}

export function isConnected() {
  const stored = sessionStorage.getItem('gc_token');
  const exp = parseInt(sessionStorage.getItem('gc_expiry') || '0', 10);
  return !!stored && Date.now() < exp - 60_000;
}

export function disconnect() {
  _token = null;
  _expiry = 0;
  tokenClient = null;
  sessionStorage.removeItem('gc_token');
  sessionStorage.removeItem('gc_expiry');
}

// Add one hour to HH:MM string
function addOneHour(time) {
  const [h, m] = time.split(':').map(Number);
  return `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export async function sendToGoogleCalendar(event) {
  const token = await requestToken();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  let start, end;
  if (event.time) {
    start = { dateTime: `${event.date}T${event.time}:00`, timeZone: tz };
    end   = { dateTime: `${event.date}T${addOneHour(event.time)}:00`, timeZone: tz };
  } else {
    // All-day event — Google Calendar needs end date = next day
    const d = new Date(event.date);
    d.setDate(d.getDate() + 1);
    const nextDay = d.toISOString().slice(0, 10);
    start = { date: event.date };
    end   = { date: nextDay };
  }

  const descParts = [
    event.description,
    event.child_name   ? `Child: ${event.child_name}`   : '',
    event.added_by     ? `Added by: ${event.added_by}`  : '',
    event.event_type   ? `Type: ${event.event_type}`    : '',
    'Created via CoParent app',
  ].filter(Boolean);

  const body = {
    summary: event.title,
    description: descParts.join('\n'),
    start,
    end,
  };

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // Token may have been revoked — clear it so next attempt re-auths
    if (res.status === 401) disconnect();
    throw new Error(err?.error?.message || `Google Calendar error ${res.status}`);
  }

  return res.json(); // Returns the created Google Calendar event
}
