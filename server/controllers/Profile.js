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

// CHANGES CURRENT USERS PASSWORD
const changePassword = (request, response) => {
  const req = request;
  const res = response;

  // cast to string for security reasons
  req.body.currentPass = `${req.body.currentPass}`;
  req.body.newPass = `${req.body.newPass}`;
  req.body.newPass2 = `${req.body.newPass2}`;

  if (!req.body.currentPass || !req.body.newPass || !req.body.newPass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (req.body.newPass !== req.body.newPass2) {
    return res.status(400).json({ error: 'New passwords must match' });
  }

  // make sure user's password is again
  return Account.AccountModel.authenticate(req.session.account.username,
    req.body.currentPass,
    (err, doc) => {
      if (err || !doc) return res.status(401).json({ error: 'Wrong password' });

      // generate a new hash for user's new password
      return Account.AccountModel.generateHash(req.body.newPass, (salt, hash) => {
        if (!salt || !hash) return res.status(500).json({ error: 'Server failed to generate hash' });

        // changes the user's password
        return Account.AccountModel.changePassword(doc, hash, salt, (error, acc) => {
          if (error || !acc) return res.status(500).json({ error: 'Server failed to update password' });
          return res.status(204).json();
        });
      });
    });
};

// RETURNS USERNAME OF USER WHO ISSUES REQUEST
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

  savePromise.then(() => res.status(201).json({ message: 'Question submitted successfully!' }));

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
module.exports.changePassword = changePassword;
module.exports.submitQuestion = submitQuestion;
