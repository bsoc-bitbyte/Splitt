const express = require('express');
const { prisma } = require('../../lib/prisma');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

router.post('/logout', (_req, res) => {
  res.clearCookie('splitt_session');
  res.json({ ok: true });
});

// DEV-ONLY. Disabled in production.
router.post('/dev-login', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  const email = req.body?.email || 'dev@iiitdmj.ac.in';
  const name = req.body?.name || 'Dev User';

  const user = await prisma.user.upsert({
    where: { email },
    update: { lastSeenAt: new Date() },
    create: { email, name },
  });

  res.cookie('splitt_session', user.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({ id: user.id, email: user.email, name: user.name });
});

// Verifies the GIS ID token via Google's public tokeninfo endpoint — no client secret needed.
router.post('/google/token', async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing credential' });
    }

    const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const info = await infoRes.json();

    if (!infoRes.ok || info.error_description) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && info.aud !== clientId) {
      return res.status(401).json({ error: 'Token audience mismatch' });
    }

    const domain = process.env.ALLOWED_EMAIL_DOMAIN || 'iiitdmj.ac.in';
    if (!info.email?.endsWith(`@${domain}`)) {
      return res.status(403).json({ error: `Only @${domain} accounts are allowed.` });
    }

    const user = await prisma.user.upsert({
      where: { email: info.email },
      update: { name: info.name, picture: info.picture ?? null, lastSeenAt: new Date() },
      create: { email: info.email, name: info.name, picture: info.picture ?? null },
    });

    res.cookie('splitt_session', user.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
