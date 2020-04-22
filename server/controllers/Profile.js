const models = require('../models');

const { Account, Question } = models;

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

// returns user name of player who gets request
const getUsername = (req, res) => res.json({ username: req.session.account.username });

// ADDS A QUESTION TO DB
const submitQuestion = (request, response) => {
  const req = request;
  const res = response;

  // cast to string for security reasons
  req.body.questionText = `${req.body.questionText}`;
  req.body.answerChoice1 = `${req.body.answerChoice1}`;
  req.body.answerChoice2 = `${req.body.answerChoice2}`;
  req.body.answerChoice3 = `${req.body.answerChoice3}`;
  req.body.answerChoice4 = `${req.body.answerChoice4}`;
  req.body.correctAnswer = `${req.body.correctAnswer}`;

  if (!req.body.questionText || !req.body.answerChoice1
|| !req.body.answerChoice2 || !req.body.answerChoice3
|| !req.body.answerChoice4 || !req.body.correctAnswer) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if ((req.body.correctAnswer !== req.body.answerChoice1)
&& (req.body.correctAnswer !== req.body.answerChoice2)
&& (req.body.correctAnswer !== req.body.answerChoice3)
&& (req.body.correctAnswer !== req.body.answerChoice4)) {
    return res.status(400).json({ error: 'Correct answer has to match one of the answer options' });
  }

  const questionData = {
    question: req.body.questionText,
    answer1: req.body.answerChoice1,
    answer2: req.body.answerChoice2,
    answer3: req.body.answerChoice3,
    answer4: req.body.answerChoice4,
    correctAnswer: req.body.correctAnswer,
  };

  const newQuestion = new Question.QuestionModel(questionData);

  const savePromise = newQuestion.save();

  savePromise.then(() => {
    console.log('question submitted');
    return res.json({ message: 'Question submitted successfully!' });
  });

  savePromise.catch((err) => {
    console.log(err);

    if (err.code === 11000) {
      return res.status(400).json({ error: 'Question already exists' });
    }

    return res.status(400).json({ error: 'Question submission failed' });
  });

  return savePromise;
};

module.exports.profilePage = profilePage;
module.exports.getProfile = getProfile;
module.exports.getUsername = getUsername;
module.exports.submitQuestion = submitQuestion;
