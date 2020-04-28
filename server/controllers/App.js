const models = require('../models');

const { Question } = models;

// Renders game screen
const gamePage = (req, res) => {
  res.render('app', { csrfToken: req.csrfToken() });
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
