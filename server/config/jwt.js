const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTConfig {
  constructor() {
    this.secret = process.env.JWT_SECRET || this.generateSecret();
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || this.generateSecret();
    this.accessTokenExpiry = process.env.JWT_EXPIRY || '1h';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ JWT_SECRET not found in environment variables. Using generated secret.');
      console.warn('⚠️ Please set JWT_SECRET in your .env file for production!');
    }
  }

  generateSecret() {
    return crypto.randomBytes(64).toString('hex');
  }

  generateTokens(payload) {
    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      this.secret,
      { 
        expiresIn: this.accessTokenExpiry,
        issuer: 'pressmart-app',
        audience: 'pressmart-users'
      }
    );

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      this.refreshSecret,
      { 
        expiresIn: this.refreshTokenExpiry,
        issuer: 'pressmart-app',
        audience: 'pressmart-users'
      }
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: 'pressmart-app',
        audience: 'pressmart-users'
      });
      
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      throw new Error(`Access token verification failed: ${error.message}`);
    }
  }

  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.refreshSecret, {
        issuer: 'pressmart-app',
        audience: 'pressmart-users'
      });
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      throw new Error(`Refresh token verification failed: ${error.message}`);
    }
  }

  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Invalid authorization header format');
    }

    return parts[1];
  }
}

module.exports = new JWTConfig();