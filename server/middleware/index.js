// ensures user is logged in, otherwise redirects them to homepage
const requiresLogin = (req, res, next) => {
  if (!req.session.account) return res.redirect('/');
  return next();
};

// ensures user is logged out, otherwise redirects them to profile page
const requiresLogout = (req, res, next) => {
  if (req.session.account) return res.redirect('/profile');
  return next();
};

// ensures user is over https connection, otherwise reconnect with https
const requiresSecure = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') return res.redirect(`https://${req.hostname}${req.url}`);
  return next();
};

// bypass https requirement for local development
const bypassSecure = (req, res, next) => {
  next();
};

module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;

if (process.env.NODE_ENV === 'production') {
  module.exports.requiresSecure = requiresSecure;
} else {
  module.exports.requiresSecure = bypassSecure;
}
