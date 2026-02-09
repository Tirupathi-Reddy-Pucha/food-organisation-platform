import fetch from 'node-fetch';

const BASE = `${process.env.BASE_URL}/api/auth` || 'http://localhost:5000/api/auth';

async function test() {
  // register
  let res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: 'olduser@example.com', password: 'password123', role: 'Donor' })
  });
  console.log('register status', res.status);
  const data = await res.json().catch(() => ({}));
  console.log('register body', data);

  // login
  res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'olduser@example.com', password: 'password123' })
  });
  console.log('login status', res.status);
  const loginBody = await res.json().catch(() => ({}));
  console.log('login body', loginBody);
}

test().catch(err => console.error(err));
