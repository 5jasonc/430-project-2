const models = require('../models');

const { Account } = models;

// RENDERS PROFILE PAGE
const profilePage = (req, res) => {
  res.render('profile');
};

// RETURNS ACCOUNT TIED TO CURRENT SESSION
const getProfile = (request, response) => {
  const req = request;
  const res = response;

  return Account.AccountModel.findById(req.session.account._id, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ csrfToken: req.csrfToken(), account: doc });
  });
};

module.exports.profilePage = profilePage;
module.exports.getProfile = getProfile;
