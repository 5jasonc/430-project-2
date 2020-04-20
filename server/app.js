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

const game = require('./controllers/App.js');

let numConnections = 0;
let numUsersAnswered = 0;

// On socket connect
const onConnection = (socket) => {
  numConnections++;

  const message = `Guest${numConnections} has connected.`;

  io.sockets.emit('playerConnected', {
    msg: message,
    numConnections,
  });

  // On socket disconnect
  socket.on('disconnect', () => {
    console.log(`Guest${numConnections} has disconnected.`);

    io.sockets.emit('socket disconnect', {
      msg: `Guest${numConnections} has disconnected.`,
    });

    numConnections--;
  });

  // On submitted answer
  socket.on('questionAnswered', (object) => {
    numUsersAnswered++;
    if (numUsersAnswered >= numConnections) numUsersAnswered = 0;

    game.getResult(object.question, object.playerAnswer, (result) => {
      if (result) {
        socket.emit('answer processed', {
          msg: `The answer ${object.playerAnswer} was correct!`,
        });
      } else {
        socket.emit('answer processed', {
          msg: `The answer ${object.playerAnswer} was incorrect!`,
        });
      }
    });
  });

  console.log(message);
};

// LISTEN FOR CONNECTIONS AND MESSAGES
io.sockets.on('connection', onConnection);

/*   socket.on('answer submitted', (answer) => {
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
  }); */
