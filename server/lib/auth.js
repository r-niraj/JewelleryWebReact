const { SignJWT, jwtVerify } = require('jose');

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'change-this-to-a-random-secret-in-production') {
    throw new Error('JWT_SECRET environment variable is not set or is still the default value');
  }
  return new TextEncoder().encode(secret);
}

async function signToken(admin) {
  return new SignJWT({ adminId: admin.adminId, email: admin.email, role: admin.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecret());
}

async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

module.exports = { signToken, verifyToken };
