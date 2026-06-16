const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { prisma } = require('./lib/prisma');
const { attachUser } = require('./middleware/auth');
const { errorHandler } = require('./middleware/error-handler');

const authRoutes = require('./modules/auth/auth.routes');
const ridesRoutes = require('./modules/rides/rides.routes');
const intentsRoutes = require('./modules/intents/intents.routes');
const matchesRoutes = require('./modules/matches/matches.routes');
const ratingsRoutes = require('./modules/ratings/ratings.routes');
const usersRoutes = require('./modules/users/users.routes');
const eventsRoutes = require('./modules/events/events.routes');

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser(process.env.SESSION_SECRET));
  app.use(attachUser);

  app.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ ok: true, db: 'connected', uptime: process.uptime() });
    } catch {
      res.status(503).json({ ok: false, db: 'disconnected', uptime: process.uptime() });
    }
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/rides', ridesRoutes);
  app.use('/api/v1/intents', intentsRoutes);
  app.use('/api/v1/matches', matchesRoutes);
  app.use('/api/v1/ratings', ratingsRoutes);
  app.use('/api/v1/users', usersRoutes);
  app.use('/api/v1/events', eventsRoutes);

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
