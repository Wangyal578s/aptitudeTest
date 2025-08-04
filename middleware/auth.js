const requireLogin = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    next();
  };
  
  const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.type !== 'admin') {
      return res.status(403).send('Admin access only');
    }
    next();
  };
  
  module.exports = { requireLogin, requireAdmin };
  