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

// list of rooms
const roomList = {};

// Adds room to room list object
const addRoom = (room) => {
  roomList[room.roomKey] = {
    roomKey: room.roomKey,
    roomName: room.roomName,
    maxConnections: room.maxConnections,
    questionNum: 0,
    maxQuestions: room.maxQuestions,
    numUsersAnswered: 0,
    playerList: {},
    questionCountdown: null,
    isAvailable: true,
  };
};

// Gets a random question from database as JSON object
const getQuestionObj = (callback) => {
  game.getQuestion((object) => {
    if (!object) return {};

    return callback(object);
  });
};

// starts the timer
const startTimer = (roomKey) => {
  let counter = 10;

  if (roomList[roomKey].questionCountdown === null) {
    roomList[roomKey].questionCountdown = setInterval(() => {
      io.to(roomKey).emit('countdownTick', counter);
      counter--;

      // if (counter < 0 || numUsersAnswered >= numConnections) {
      // clearInterval(roomList[roomKey].questionCountdown);
      // roomList[roomKey].questionCountdown = null;
      // }
    }, 1000);
  }
};

const updateLobbyList = () => {
  const lobbyList = Object.values(roomList).filter((room) => room.isAvailable);
  io.to('lobby').emit('lobbyList', Object.values(lobbyList));
};

// SET UP SERVER SIDE LISTENING FOR EACH SOCKET ON CONNECT
const onConnection = (socket) => {
// ping user with room list when they join
  socket.join('lobby');
  updateLobbyList();


  // when user joins room ping user
  socket.on('roomJoined', (connectData) => {
    socket.leave('lobby');
    socket.join(connectData.roomKey);

    roomList[connectData.roomKey].playerList[socket.id] = connectData.player;

    if (Object.keys(roomList[connectData.roomKey].playerList).length
>= roomList[connectData.roomKey].maxConnections) {
      roomList[connectData.roomKey].isAvailable = false;
    }

    updateLobbyList();

    io.to(connectData.roomKey).emit('pingPlayers', {
      room: roomList[connectData.roomKey],
      player: connectData.player,
    });
  });

  // when user creates their own room add to room list
  socket.on('roomCreated', (room) => addRoom(room));

  // when max players have been reached start game and sends 1st question if player limit is reached
  socket.on('startGame', (room) => {
    getQuestionObj((question) => {
      startTimer(room.roomKey);
      io.to(room.roomKey).emit('nextQuestion', question);
    });
  });

  // on socket disconnect take out of playerList in room and ping other players
  socket.on('disconnect', () => {
    Object.keys(roomList).forEach((room) => {
      if (roomList[room].playerList[socket.id]) {
        const disconnectingPlayer = roomList[room].playerList[socket.id];
        delete roomList[room].playerList[socket.id];

        updateLobbyList();

        io.to(room).emit('socketDisconnect', {
          player: disconnectingPlayer,
          playerList: roomList[room].playerList,
        });
      }
    });
  });

  // on submitted answer
  socket.on('questionAnswered', (object) => {
    roomList[object.roomKey].numUsersAnswered++;

    // get whether answer was correct or not and inform user
    game.getResult(object.question, object.playerAnswer, (result) => {
      if (result) { // if player is right
        roomList[object.roomKey].playerList[socket.id].score += 100;
        socket.emit('answerProcessed', `The answer ${object.playerAnswer} was correct!`);
      } else if (result === null) { // if player runs out of time
        socket.emit('answerProcessed', 'You ran out of time!');
      } else { // if player is wrong
        socket.emit('answerProcessed', `The answer ${object.playerAnswer} was incorrect!`);
      }

      // ping back playerList with updated scores to update players' UI
      io.to(object.roomKey).emit('playerAnswered', roomList[object.roomKey].playerList);

      // if every user connected has answered go to next question
      if (roomList[object.roomKey].numUsersAnswered
>= Object.keys(roomList[object.roomKey].playerList).length) {
        roomList[object.roomKey].numUsersAnswered = 0;
        roomList[object.roomKey].questionNum++;

        // if number of rounds in game has reached max end game
        if (roomList[object.roomKey].questionNum >= roomList[object.roomKey].maxQuestions) {
          // sort playerList based on highest score
          // code from here: https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
          const playerList = Object.values(roomList[object.roomKey].playerList).map((p) => p);
          playerList.sort((a, b) => ((a.score < b.score) ? 1 : -1));

          clearInterval(roomList[object.roomKey].questionCountdown);
          roomList[object.roomKey].questionCountdown = null;
          io.to(object.roomKey).emit('countdownTick', null);
          io.to(object.roomKey).emit('gameOver', playerList);
          roomList[object.roomKey].questionNum = 0;
        } else { // otherwise send next question to players
          getQuestionObj((qObject) => {
            clearInterval(roomList[object.roomKey].questionCountdown);
            roomList[object.roomKey].questionCountdown = null;
            startTimer(object.roomKey);
            io.to(object.roomKey).emit('nextQuestion', qObject);
          });
        }
      }
    });
  });
};

// LISTEN FOR CONNECTIONS
io.sockets.on('connection', onConnection);
