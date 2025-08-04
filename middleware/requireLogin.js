module.exports = (req, res, next) => {
    if (!req.session.user) {
      req.session.error = 'Sign up to view the answer.';
      return res.redirect('/login');
    }
    next();
  };
  