// Talks to the Google Apps Script web app (backend/Code.gs).
// POST with text/plain avoids the CORS pre-flight that Apps Script cannot answer.

const URL_ = import.meta.env.VITE_API_URL;

export async function remoteCall(action, payload = {}) {
  let res;
  try {
    res = await fetch(URL_, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
      redirect: 'follow',
    });
  } catch {
    throw new Error('Cannot reach the server. Check your internet connection and try again.');
  }
  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('The server sent an unexpected response. Is the Apps Script deployed for "Anyone"?');
  }
  if (!json.ok) throw new Error(json.error || 'Something went wrong.');
  return json.data;
}
