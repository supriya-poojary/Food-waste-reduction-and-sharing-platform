import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io for real-time notifications
export const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
});

const PORT = process.env.PORT || 3001;
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ── Inject io into request so handlers can emit events ─────────────────────
app.use((req, _res, next) => {
  req.io = io;
  next();
});

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Generic route handler ──────────────────────────────────────────────────
const handle = async (req, res, filePath) => {
  try {
    // Clear module cache in dev so changes are picked up without restart
    const modPath = new URL(`./api/${filePath}`, import.meta.url).href;
    const module = await import(modPath + '?t=' + Date.now());
    await module.default(req, res);
  } catch (error) {
    console.error(`[API ERROR] ${filePath}:`, error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }
};

// ── Auth routes ────────────────────────────────────────────────────────────
app.post('/api/auth/login',    (req, res) => handle(req, res, 'auth/login.js'));
app.post('/api/auth/register', (req, res) => handle(req, res, 'auth/register.js'));
app.get('/api/auth/me',        (req, res) => handle(req, res, 'auth/me.js'));

// ── Food routes ────────────────────────────────────────────────────────────
app.get('/api/food/matches',   (req, res) => handle(req, res, 'food/matches.js'));
app.get('/api/food',           (req, res) => handle(req, res, 'food/index.js'));
app.post('/api/food',          async (req, res) => {
  // After posting, emit to connected clients
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    if (data && data._id) {
      io.emit('new-food', {
        id: data._id.toString(),
        title: data.title,
        location: data.location,
        urgency: data.urgency || 'LOW',
        category: data.category,
        postedAt: data.postedAt,
      });
    }
    return originalJson(data);
  };
  handle(req, res, 'food/index.js');
});
app.get('/api/food/:id',       (req, res) => {
  req.query.id = req.params.id;
  handle(req, res, 'food/[id].js');
});

// ── Claims routes ──────────────────────────────────────────────────────────
app.get('/api/claims',         (req, res) => handle(req, res, 'claims/index.js'));
app.post('/api/claims',        async (req, res) => {
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    if (data && data.claim) {
      io.emit('food-claimed', { foodId: req.body.foodId });
    }
    return originalJson(data);
  };
  handle(req, res, 'claims/index.js');
});
app.put('/api/claims/:id',     (req, res) => {
  req.query.id = req.params.id;
  handle(req, res, 'claims/[id].js');
});

// ── Requests routes ────────────────────────────────────────────────────────
app.get('/api/requests',       (req, res) => handle(req, res, 'requests/index.js'));
app.post('/api/requests',      (req, res) => handle(req, res, 'requests/index.js'));

// ── Users routes ───────────────────────────────────────────────────────────
app.get('/api/users/:id',      (req, res) => {
  req.query.id = req.params.id;
  handle(req, res, 'users/[id].js');
});
app.put('/api/users/:id',      (req, res) => {
  req.query.id = req.params.id;
  handle(req, res, 'users/[id].js');
});

// ── Seed route (dev only) ──────────────────────────────────────────────────
app.post('/api/seed',          (req, res) => handle(req, res, 'seed.js'));

// ── Socket.io connection ───────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`❌ Client disconnected: ${socket.id}`));
  // Client can join location-based rooms
  socket.on('join-area', (area) => socket.join(area));
});

httpServer.listen(PORT, () => {
  console.log(`\n🚀 FoodShare API running at http://localhost:${PORT}`);
  console.log(`⚡ Socket.io enabled for real-time notifications`);
  console.log(`📦 MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'No URI set!'}\n`);
});
