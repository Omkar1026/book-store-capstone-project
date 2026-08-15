import express from 'express';
import cors from 'cors';
import jsonServer from 'json-server';
import path from 'path';

const app = express();
const PORT = 3000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Custom routes (must come BEFORE json-server router) ─────────────────────

// Auth — login
app.post('/auth/login', (req, res) => {
  const db = jsonServer.router(path.join(__dirname, 'db.json')) as any;
  const users: any[] = (db as any).db.get('users').value();
  const { email, password } = req.body;
  const user = users.find((u: any) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const { password: _pw, ...safeUser } = user;
  return res.json({ user: safeUser, token: `mock-jwt-${user.id}` });
});

// Auth — register
app.post('/auth/register', (req, res) => {
  res.status(501).json({ message: 'Use json-server POST /users to register' });
});

// Payment — simulate (1.5 s delay, always success)
app.post('/payments/initiate', (_req, res) => {
  setTimeout(() => {
    res.json({ success: true, transactionId: `txn-${Date.now()}` });
  }, 1500);
});

// Delivery date estimation
app.get('/delivery/estimate', (req, res) => {
  const days = Math.floor(Math.random() * 5) + 3; // 3–7 days
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + days);
  res.json({ estimatedDelivery: deliveryDate.toISOString(), days });
});

// ── json-server router (standard CRUD for all resources) ───────────────────
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({ nolog: true });

app.use(middlewares);
app.use(router);

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
