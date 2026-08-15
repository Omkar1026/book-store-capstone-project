import jsonServer from 'json-server';
import cors from 'cors';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

const PORT = 3000;

// json-server.create() is required — plain express() breaks the lowdb router context
const app = jsonServer.create();

// Initialize router and db
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const db = (router as any).db;
const middlewares = jsonServer.defaults({ logger: false });

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(jsonServer.bodyParser);
app.use(middlewares);

// ── Custom routes (must come BEFORE json-server router middleware) ─────────

// Auth — login
app.post('/auth/login', (req: Request, res: Response) => {
  const users: any[] = db.get('users').value() || [];
  const { email, password } = req.body;
  const user = users.find((u: any) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const { password: _pw, ...safeUser } = user;
  return res.json({ user: safeUser, token: `mock-jwt-${user.id}` });
});

// Auth — register
app.post('/auth/register', (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' });
  }
  const users = db.get('users');
  const existingUser = users.find({ email }).value();
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }
  const newUser = {
    id: `user-${Date.now()}`,
    email,
    password,
    name,
    addresses: [],
    giftPointsBalance: 0,
    orderHistory: [],
    createdAt: new Date().toISOString()
  };
  users.push(newUser).write();

  // Create an empty cart for the new user
  const newCart = {
    id: `cart-${Date.now()}`,
    userId: newUser.id,
    items: [],
    updatedAt: new Date().toISOString()
  };
  db.get('carts').push(newCart).write();

  const { password: _pw, ...safeUser } = newUser;
  return res.json({ user: safeUser, token: `mock-jwt-${newUser.id}` });
});

// Payment — simulate (1.5 s delay, always success)
const handlePayment = (_req: Request, res: Response) => {
  setTimeout(() => {
    res.json({ success: true, transactionId: `txn-${Date.now()}` });
  }, 1500);
};
app.post('/payments', handlePayment);
app.post('/payments/initiate', handlePayment);

// Gift-points — redeem
app.post('/gift-points/redeem', (req: Request, res: Response) => {
  const { userId, amount } = req.body;
  if (!userId || typeof amount !== 'number') {
    return res.status(400).json({ message: 'userId and amount (number) are required' });
  }
  const user = db.get('users').find({ id: userId }).value();
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (user.giftPointsBalance < amount) {
    return res.status(400).json({ message: 'Insufficient points balance' });
  }

  // Update in user table
  user.giftPointsBalance -= amount;

  // Also update in separate giftPointsBalances table if exists
  const gpBalance = db.get('giftPointsBalances').find({ userId }).value();
  if (gpBalance) {
    gpBalance.balance = user.giftPointsBalance;
    gpBalance.updatedAt = new Date().toISOString();
  }

  db.write(); // persists changes to db.json
  return res.json({ success: true, newBalance: user.giftPointsBalance });
});

// Delivery date estimation
app.get('/delivery/estimate', (req: Request, res: Response) => {
  const stock = parseInt(req.query['stock'] as string, 10);
  const days = isNaN(stock) || stock > 0
    ? (Math.floor(Math.random() * 2) + 2) // 2-3 days
    : (Math.floor(Math.random() * 3) + 7); // 7-9 days
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + days);
  res.json({
    estimatedDate: deliveryDate.toISOString(),
    estimatedDelivery: deliveryDate.toISOString(),
    days
  });
});

// ── json-server router (standard CRUD for all resources) ───────────────────
app.use(router);

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
