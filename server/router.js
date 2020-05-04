const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/app', mid.requiresLogin, controllers.App.gamePage);
  app.get('/getProfile', mid.requiresSecure, mid.requiresLogin, controllers.Profile.getProfile);
  app.get('/getUsername', mid.requiresSecure, mid.requiresLogin, controllers.Profile.getUsername);
  app.post('/passChange', mid.requiresSecure, mid.requiresLogin, controllers.Profile.changePassword);
  app.post('/qSubmit', mid.requiresSecure, mid.requiresLogin, controllers.Profile.submitQuestion);
  app.get('/profile', mid.requiresLogin, controllers.Profile.profilePage);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('*', controllers.App.getNotFound);
};

module.exports = router;
