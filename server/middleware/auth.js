const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      console.log('❌ No Authorization header');
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing'
      });
    }

    // Extract token
    let token = authHeader;
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    console.log('=================================');
    console.log('🔑 Received Token:');
    console.log(token);
    console.log('=================================');

    // ✅ CRITICAL: Use the SAME JWT_SECRET as in authController
    const JWT_SECRET = process.env.JWT_SECRET || 'bismilla_chicken_center_2026_super_secret_key';
    
    console.log('=================================');
    console.log('🔑 VERIFY SECRET:', JWT_SECRET);
    console.log('=================================');

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    console.log('✅ Token decoded:', decoded);

    // Set req.user with the decoded data
    req.user = {
      id: decoded.id,
      phone: decoded.phone,
      role: decoded.role,
      name: decoded.name
    };

    // Also keep these for backward compatibility
    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();

  } catch (error) {
    console.error('❌ JWT Verification Error:', error.message);
    
    // Different error messages for different JWT errors
    let message = 'Invalid token';
    if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token format';
    } else if (error.name === 'TokenExpiredError') {
      message = 'Token expired. Please login again.';
    } else if (error.name === 'NotBeforeError') {
      message = 'Token not active yet';
    }

    return res.status(401).json({
      success: false,
      message: message,
      error: error.message
    });
  }
};

module.exports = authMiddleware;