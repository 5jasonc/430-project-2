const crypto = require('crypto');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let AccountModel = {};
const iterations = 10000;
const saltLength = 64;
const keyLength = 64;

// DECLARE SCHEMA
const AccountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  salt: {
    type: Buffer,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    min: 0,
    required: true,
    default: 0,
  },
  gamesWon: {
    type: Number,
    min: 0,
    required: true,
    default: 0,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// RETURN ACCOUNT DATA
AccountSchema.statics.toAPI = (doc) => ({
  username: doc.username,
  _id: doc._id,
  score: doc.score,
  gamesWon: doc.gamesWon,
});

// VALIDATE INPUTTED PASSWORD
const validatePassword = (doc, password, callback) => {
  const pass = doc.password;

  return crypto.pbkdf2(password, doc.salt, iterations, keyLength, 'RSA-SHA512', (err, hash) => {
    if (hash.toString('hex') !== pass) {
      return callback(false);
    }
    return callback(true);
  });
};

// RETURNS ACCOUNT WHOS USERNAME MATCHES NAME ARGUMENT
AccountSchema.statics.findByUsername = (name, callback) => {
  const search = {
    username: name,
  };

  return AccountModel.findOne(search, callback);
};

// RETURNS ACCCOUNT WHOS _id MATCHES ARGUMENT
AccountSchema.statics.findById = (id, callback) => {
  const search = {
    _id: id,
  };

  return AccountModel.findOne(search, callback);
};

// ENCRYPT PASSWORD
AccountSchema.statics.generateHash = (password, callback) => {
  const salt = crypto.randomBytes(saltLength);

  crypto.pbkdf2(password, salt, iterations, keyLength, 'RSA-SHA512', (err, hash) => callback(salt, hash.toString('hex')));
};

// VALIDATES USERNAME AND PASSWORD ON LOGIN
AccountSchema.statics.authenticate = (username, password, callback) => {
  AccountModel.findByUsername(username, (err, doc) => {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback();
    }

    return validatePassword(doc, password, (result) => {
      if (result === true) {
        return callback(null, doc);
      }

      return callback();
    });
  });
};

AccountModel = mongoose.model('Account', AccountSchema);

module.exports.AccountModel = AccountModel;
module.exports.AccountSchema = AccountSchema;
