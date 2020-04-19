const fs = require('fs');
const socketIO = require('socket.io');

const models = require('../models');
const app = require('../app.js');

const { Account } = models;

const questionKey = 'question1';

const io = socketIO.listen(app.server);

// Loads our JSON data of questions (TEMPORARY: WILL MOVE QUESTIONS DATA TO MONGODB)
const rawQuestionData = fs.readFileSync(`${__dirname}/../questions.json`);
const questionData = JSON.parse(rawQuestionData);

// Main game logic


// RENDERS GAME SCREEN
const gamePage = (req, res) => {
  res.render('app', { csrfToken: req.csrfToken() });

  io.sockets.on('connection', (socket) => {
    console.log('User has connected');

    socket.on('answer submitted', (answer) => {
      console.log(`User submitted the answer: ${answer}`);

      // If answer correct
      if (answer === questionData[questionKey].correctAnswer) {
        const account = Account.AccountModel.findByUsername(req.session.account.username, () => {
          account.score += 10;

          const savePromise = account.save();

          savePromise.then(() => {
            socket.emit('correctAnswer', 'Correct!');
          });

          savePromise.catch((err) => {
            console.log(err);

            return res.status(400).json({ error: 'Error submitting answer' });
          });
        });
      } else {
        console.log(questionData[questionKey].correctAnswer);

        socket.emit('wrongAnswer', 'Wrong Answer!');
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};

module.exports.gamePage = gamePage;
