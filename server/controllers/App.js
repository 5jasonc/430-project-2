const models = require('../models');

const { Question } = models;

// Renders game screen
const gamePage = (req, res) => {
  res.render('app', { csrfToken: req.csrfToken() });
};

// Returns is player answer matches correct answer for question
// Returns true or false
const getResult = (question, playerAnswer, callback) => {
  Question.QuestionModel.findByQuestion(question, (err, doc) => {
    if (playerAnswer === doc.correctAnswer) {
      return callback(true);
    }
    return callback(false);
  });
};

module.exports.gamePage = gamePage;
module.exports.getResult = getResult;
