const models = require('../models');

const { Question, Account } = models;

// Renders game screen
const gamePage = (req, res) => {
  res.render('app', { csrfToken: req.csrfToken() });
};

// Renders 404 page
const getNotFound = (req, res) => {
  res.render('notFound');
};

// Adds score to user account
const addScore = (username, scoreAmt, callback) => {
  Account.AccountModel.increaseScore(username, scoreAmt, (err, doc) => {
    if (err || !doc) return callback(false);
    return callback(true);
  });
};

// adds a game to the total of games won for user account
const gameWon = (username, callback) => {
  Account.AccountModel.gameWon(username, (err, doc) => {
    if (err || !doc) return callback(false);
    return callback(true);
  });
};

// Returns if player answer matches correct answer for question
// Returns true or false
const getResult = (question, playerAnswer, callback) => {
  Question.QuestionModel.findByQuestion(question, (err, doc) => {
    if (playerAnswer === doc.correctAnswer) {
      return callback(true);
    }
    if (playerAnswer === null) {
      return callback(null);
    }
    return callback(false);
  });
};

// Gets random question from database
const getQuestion = (callback) => {
  Question.QuestionModel.getRandomQuestion((err, docs) => {
    if (err) {
      return callback();
    }
    return callback(docs[0]);
  });
};

module.exports.gamePage = gamePage;
module.exports.getResult = getResult;
module.exports.getQuestion = getQuestion;
module.exports.getNotFound = getNotFound;
module.exports.addScore = addScore;
module.exports.gameWon = gameWon;
