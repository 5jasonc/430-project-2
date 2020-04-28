// IMPORT LIBRARIES
const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const url = require('url');
const redis = require('redis');
const csrf = require('csurf');

// INITIALIZE PORT AND DB URL
const port = process.env.PORT || process.env.NODE_PORT || 3000;
const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/TriviaMadness';

// INITIALIZE MONGOOSE OPTIONS TO USE NEWER FUNCTIONALITY
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// CONNECT TO MONGO DB
mongoose.connect(dbURL, mongooseOptions, (err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

// CONNECT TO REDIS CLOUD DB
let redisURL = {
  hostname: 'redis-16000.c61.us-east-1-3.ec2.cloud.redislabs.com',
  port: '16000',
};
let redisPASS = '2JniZgTFfmqh6SUFYlplyafxwgykBVPJ';

if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  [, redisPASS] = redisURL.auth.split(':');
}

const redisClient = redis.createClient({
  host: redisURL.hostname,
  port: redisURL.port,
  password: redisPASS,
});

// PULL IN OUR ROUTES
const router = require('./router.js');

// INITIALIZE AND CONFIGURE APP
const app = express();

app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
app.use(cookieParser());
app.use(compression());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(session({
  key: 'sessionid',
  store: new RedisStore({
    client: redisClient,
  }),
  secret: 'Not Finished Yet',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
}));
app.use(csrf());

app.disable('x-powered-by');

app.engine('handlebars', expressHandlebars({ defaultLayout: 'main' }));

app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);

// SET OUR ROUTES
router(app);

// START THE SERVER
const server = app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});

// CONFIGURE SOCKET IO AND GAME SETTINGS
const io = socketIO(server);

// import app controller to get some functions
const game = require('./controllers/App.js');

// required game variables
let numConnections = 0;
let questionNum = 0;
let numUsersAnswered = 0;
const maxPlayers = 2;
const maxQuestions = 5;
let playerList = [];

let questionCountdown;

// Gets a random question from database as JSON object
const getQuestionObj = (callback) => {
  game.getQuestion((object) => {
    if (!object) return {};

    return callback(object);
  });
};

// starts the timer
const startTimer = () => {
  let counter = 10;

  if (questionCountdown === undefined) {
    questionCountdown = setInterval(() => {
      io.sockets.emit('countdownTick', { timeLeft: counter });
      counter--;

      /* if (counter < 0 || numUsersAnswered >= numConnections) {
        clearInterval(questionCountdown);
        questionCountdown = undefined;
      } */
    }, 1000);
  }
};


// SET UP SERVER SIDE LISTENING FOR EACH SOCKET ON CONNECT
const onConnection = (socket) => {
  numConnections++;

  // Ping user
  socket.emit('pingUser', {
    numConnections,
  });

  // If user pings back, update all user's screens
  socket.on('userConnected', (object) => {
    playerList.push(object);
    io.sockets.emit('pingPlayers', { playerList });
  });

  // starts game and sends 1st question if player limit is reached
  if (numConnections >= maxPlayers) {
    getQuestionObj((object) => {
      io.sockets.emit('nextQuestion', object);
      startTimer();
    });
  }

  // On socket disconnect
  socket.on('disconnect', () => {
    let playerUsername;

    // delete disconnecting player from player list, save username
    playerList = playerList.filter((player) => {
      if (player.socketid === socket.id) {
        playerUsername = player.username;
        return false;
      }
      return true;
    });

    // ping other players when a user disconnects
    io.sockets.emit('socket disconnect', {
      msg: `${playerUsername} has disconnected.`,
      playerList,
    });

    numConnections--;
  });

  // On submitted answer
  socket.on('questionAnswered', (object) => {
    numUsersAnswered++;

    // get whether answer was correct or not and inform user
    game.getResult(object.question, object.playerAnswer, (result) => {
      if (result) { // if player is right
        for (let i = 0; i < playerList.length; i++) {
          if (playerList[i].username === object.username) {
            playerList[i].score += 100;

            socket.emit('answer processed', {
              msg: `The answer ${object.playerAnswer} was correct!`,
            });
          }
        }
      } else if (result === null) { // if player runs out of time
        socket.emit('answer processed', {
          msg: 'You ran out of time!',
        });
      } else { // if player is wrong
        socket.emit('answer processed', {
          msg: `The answer ${object.playerAnswer} was incorrect!`,
        });
      }

      // ping back playerList with updated scores to update players' UI
      io.sockets.emit('playerAnswered', { playerList });

      // if every user connected has answered go to next question
      if (numUsersAnswered >= numConnections) {
        numUsersAnswered = 0;
        questionNum++;

        // if number of rounds in game has reached max end game
        if (questionNum >= maxQuestions) {
          // sort playerList based on highest score
          // code taken from here: https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
          playerList.sort((a, b) => ((a.score < b.score) ? 1 : -1));

          io.sockets.emit('gameOver', {
            playerList,
          });
          clearInterval(questionCountdown);
          questionCountdown = undefined;
          questionNum = 0;
        } else { // otherwise send next question to players
          getQuestionObj((qObject) => {
            io.sockets.emit('nextQuestion', qObject);
            clearInterval(questionCountdown);
            questionCountdown = undefined;
            startTimer();
          });
        }
      }
    });
  });
};

// LISTEN FOR CONNECTIONS
io.sockets.on('connection', onConnection);
