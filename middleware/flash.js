const flash = (req, res, next) => {
  res.locals.session = req.session;               
  res.locals.success = req.session.success;
  res.locals.error = req.session.error;

  // Clear flash messages after passing them to the view
  delete req.session.success;
  delete req.session.error;

  next();
};

module.exports = flash;
