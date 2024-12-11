const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/google');
};

const ensureGuest = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    return next();
  }
};

module.exports = {
  ensureAuth,
  ensureGuest
};