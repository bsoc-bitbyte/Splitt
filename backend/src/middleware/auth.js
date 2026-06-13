const { prisma } = require('../lib/prisma');

async function attachUser(req, _res, next) {
  const userId = req.cookies?.splitt_session;
  if (!userId) return next();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      picture: true,
      phone: true,
      thumbsUp: true,
      thumbsDown: true,
    },
  });
  if (user) req.user = user;
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not signed in' });
  }
  next();
}

module.exports = { attachUser, requireAuth };
