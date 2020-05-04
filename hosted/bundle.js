"use strict";

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// holds client's chat log
var chatLog = []; // initialize socket

var socket = io(); // holds csrf token during game

var CsrfWindow = function CsrfWindow(props) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }));
}; // renders lobby select window


var LobbySelectWindow = function LobbySelectWindow(props) {
  if (props.rooms === null) return /*#__PURE__*/React.createElement("div", null);
  if (props.rooms.length <= 0) return /*#__PURE__*/React.createElement("div", {
    id: "lobbyList"
  }, /*#__PURE__*/React.createElement("h2", null, "No games found!"));
  var lobbySelectHTML = props.rooms.map(function (room) {
    return /*#__PURE__*/React.createElement("div", {
      className: "lobby"
    }, /*#__PURE__*/React.createElement("h3", null, room.roomName), /*#__PURE__*/React.createElement("p", null, "Players: ", Object.keys(room.playerList).length, "/", room.maxConnections), /*#__PURE__*/React.createElement("input", {
      type: "submit",
      className: "formSubmit",
      onClick: function onClick() {
        return joinLobby(room.roomKey);
      },
      value: "Join Game"
    }));
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Available Games"), /*#__PURE__*/React.createElement("div", {
    id: "lobbyList"
  }, lobbySelectHTML));
}; // renders lobby create window


var LobbyCreateWindow = function LobbyCreateWindow(props) {
  if (!props.showWindow) return /*#__PURE__*/React.createElement("div", null);
  return /*#__PURE__*/React.createElement("div", {
    className: "mainForm"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "roomNameText"
  }, "Lobby Name: "), /*#__PURE__*/React.createElement("input", {
    id: "roomNameText",
    type: "text",
    name: "roomNameText",
    placeholder: "(must be under 20 characters)"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "maxPlayerSelect"
  }, "Max Players: "), /*#__PURE__*/React.createElement("select", {
    id: "maxPlayerSelect",
    name: "maxPlayerSelect"
  }, /*#__PURE__*/React.createElement("option", {
    value: "2",
    selected: "selected"
  }, "2"), /*#__PURE__*/React.createElement("option", {
    value: "3"
  }, "3"), /*#__PURE__*/React.createElement("option", {
    value: "4"
  }, "4"), /*#__PURE__*/React.createElement("option", {
    value: "5"
  }, "5")), /*#__PURE__*/React.createElement("label", {
    htmlFor: "roundSelect"
  }, "Number of rounds: "), /*#__PURE__*/React.createElement("select", {
    id: "roundSelect",
    name: "roundSelect"
  }, /*#__PURE__*/React.createElement("option", {
    value: "5",
    selected: "selected"
  }, "5"), /*#__PURE__*/React.createElement("option", {
    value: "10"
  }, "10"), /*#__PURE__*/React.createElement("option", {
    value: "15"
  }, "15"), /*#__PURE__*/React.createElement("option", {
    value: "20"
  }, "20")), /*#__PURE__*/React.createElement("input", {
    type: "submit",
    className: "formSubmit",
    onClick: createLobby,
    value: "Create Lobby"
  }));
}; // renders countdown window


var CountdownWindow = function CountdownWindow(props) {
  if (props.timeLeft === null) return /*#__PURE__*/React.createElement("div", null);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Time Left: ", props.timeLeft));
}; // renders game window


var GameWindow = function GameWindow(props) {
  if (props.question === null) return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Waiting for players..."), /*#__PURE__*/React.createElement("h3", null, "(The game will start when max players have been reached)"));
  return /*#__PURE__*/React.createElement("div", {
    id: "gameWindow"
  }, /*#__PURE__*/React.createElement("div", {
    id: "question"
  }, /*#__PURE__*/React.createElement("h2", {
    id: "questionText"
  }, props.question, "?")), /*#__PURE__*/React.createElement("div", {
    id: "answers"
  }, /*#__PURE__*/React.createElement("div", {
    id: "topAnswers"
  }, /*#__PURE__*/React.createElement("input", {
    type: "submit",
    className: "formSubmit",
    value: props.answer1
  }), /*#__PURE__*/React.createElement("input", {
    type: "submit",
    className: "formSubmit",
    value: props.answer2
  })), /*#__PURE__*/React.createElement("div", {
    id: "bottomAnswers"
  }, /*#__PURE__*/React.createElement("input", {
    type: "submit",
    className: "formSubmit",
    value: props.answer3
  }), /*#__PURE__*/React.createElement("input", {
    type: "submit",
    className: "formSubmit",
    value: props.answer4
  }))));
}; // renders chat window


var ChatWindow = function ChatWindow(props) {
  var chatHTML = props.chats.map(function (message) {
    return /*#__PURE__*/React.createElement("li", null, message);
  });
  return /*#__PURE__*/React.createElement("ul", {
    id: "chatList"
  }, chatHTML);
}; // displays user's score


var ScoreWindow = function ScoreWindow(props) {
  if (props.players === null) return /*#__PURE__*/React.createElement("div", null);
  var scoreHTML = props.players.map(function (player) {
    return /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("h3", null, player.username), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("h4", null, "Score: ", player.score))));
  });
  return /*#__PURE__*/React.createElement("ul", {
    id: "scoreList"
  }, scoreHTML);
}; // displays winners of game


var GameOverWindow = function GameOverWindow(props) {
  var i = 0;
  var gameOverHTML = props.players.map(function (player) {
    var suffix;
    i++;
    if (i == 1) suffix = "st";
    if (i == 2) suffix = "nd";
    if (i == 3) suffix = "rd";
    if (i >= 4) suffix = "th";
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, i + suffix, " Place"), /*#__PURE__*/React.createElement("h3", null, player.username), /*#__PURE__*/React.createElement("h4", null, "Score: ", player.score));
  });
  return /*#__PURE__*/React.createElement("div", {
    id: "winnerList"
  }, gameOverHTML);
}; // sends the socket information to create new lobby


var createLobby = function createLobby() {
  if (roomNameText.value === '') return handleError('Room name is required');
  if (roomNameText.value.length >= 20) return handleError('Room name too long');
  var newRoom = {
    // room key creation taken from Xuejia Chen here: https://gist.github.com/6174/6062387
    roomKey: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    roomName: roomNameText.value.replace(/[^a-z0-9 ]/gim, "").trim(),
    maxConnections: parseInt(maxPlayerSelect.options[maxPlayerSelect.selectedIndex].value),
    maxQuestions: parseInt(roundSelect.options[roundSelect.selectedIndex].value)
  };
  socket.emit('roomCreated', newRoom);
  joinLobby(newRoom.roomKey);
}; // connect client to socket of lobby and send server player connect info


var joinLobby = function joinLobby(roomKey) {
  $("#game").show();
  $("#chat").show();
  $("#lobbySelect").hide();
  $("#lobbyCreate").hide();
  sendAjax('GET', '/getUsername', null, function (result) {
    socket.emit('roomJoined', {
      roomKey: roomKey,
      player: {
        username: result.username,
        score: 0,
        socketid: socket.id
      }
    });
    roomKeyInput.value = roomKey;
    loadGameWindow(null, null, null, null, null);
    loadLobbyWindow(null);
    loadLobbyCreateWindow(false);
  });
}; // load lobby window


var loadLobbyWindow = function loadLobbyWindow(rooms) {
  ReactDOM.render( /*#__PURE__*/React.createElement(LobbySelectWindow, {
    rooms: rooms
  }), document.querySelector("#lobbySelect"));
}; // load lobby create window


var loadLobbyCreateWindow = function loadLobbyCreateWindow(showWindow) {
  ReactDOM.render( /*#__PURE__*/React.createElement(LobbyCreateWindow, {
    showWindow: showWindow
  }), document.querySelector("#lobbyCreate"));
}; // Submits answer to socket


var submitAnswer = function submitAnswer(playerAnswer) {
  sendAjax('GET', '/getUsername', null, function (result) {
    socket.emit('questionAnswered', {
      question: questionText.textContent.substring(0, questionText.textContent.length - 1),
      playerAnswer: playerAnswer,
      username: result.username,
      roomKey: roomKeyInput.value
    });
  });
}; // Handles when answer button is clicked


var handleAnswer = function handleAnswer(e) {
  submitAnswer(e.target.value); // remove events from buttons until next question

  var answerButtons = document.querySelectorAll("#answers .formSubmit");

  var _iterator = _createForOfIteratorHelper(answerButtons),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var button = _step.value;

      button.onclick = function () {};
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}; // Load game window


var loadGameWindow = function loadGameWindow(q, a1, a2, a3, a4) {
  $("#error").animate({
    height: 'hide'
  }, 350);
  ReactDOM.render( /*#__PURE__*/React.createElement(GameWindow, {
    question: q,
    answer1: a1,
    answer2: a2,
    answer3: a3,
    answer4: a4
  }), document.querySelector("#game")); // tie click events to answer buttons

  var answerButtons = document.querySelectorAll("#answers .formSubmit");

  var _iterator2 = _createForOfIteratorHelper(answerButtons),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var button = _step2.value;
      button.onclick = handleAnswer;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
}; // Load countdown window


var loadCountdownWindow = function loadCountdownWindow(timeLeft) {
  ReactDOM.render( /*#__PURE__*/React.createElement(CountdownWindow, {
    timeLeft: timeLeft
  }), document.querySelector("#countdown"));
}; // Load scores window


var loadScoresWindow = function loadScoresWindow(players) {
  ReactDOM.render( /*#__PURE__*/React.createElement(ScoreWindow, {
    players: players
  }), document.querySelector("#scores"));
}; // Load chat window


var loadChats = function loadChats() {
  ReactDOM.render( /*#__PURE__*/React.createElement(ChatWindow, {
    chats: chatLog
  }), document.querySelector("#chat")); // Keeps chat window scrolled all the way down
  // code taken from Jeremy Ruten here: https://stackoverflow.com/questions/270612/scroll-to-bottom-of-div

  chat.scrollTop = chat.scrollHeight;
}; // Gets and loads client csrf token


var getToken = function getToken() {
  $("#game").hide();
  $("#chat").hide();
  $("#scores").hide();
  $("#lobbySelect").show();
  $("#lobbyCreate").show();
  sendAjax('GET', '/getToken', null, function (result) {
    ReactDOM.render( /*#__PURE__*/React.createElement(CsrfWindow, {
      csrf: result.csrfToken
    }), document.querySelector("#csrfWindow"));
    loadLobbyCreateWindow(true);
  });
}; // Handle message to client


var handleMessage = function handleMessage(msg) {
  chatLog.push(msg);
  loadChats();
}; // logs message to chat whenever message/error sent back from the server


socket.on('message', function (message) {
  return handleMessage(message);
}); // loads and renders lobby list when users connects to socket

socket.on('lobbyList', function (roomList) {
  return loadLobbyWindow(roomList);
}); // Listen for other players connecting

socket.on('pingPlayers', function (connectData) {
  // tell user if they or another player connects
  if (connectData.player.socketid === socket.id) handleMessage("You have connected!");else {
    handleMessage(connectData.player.username + " has connected!");
  } // start game if max connections reached

  if (Object.keys(connectData.room.playerList).length >= connectData.room.maxConnections) {
    loadScoresWindow(Object.values(connectData.room.playerList));
    $("#scores").show();
    socket.emit('startGame', connectData.room);
  }
}); // renders questions when needed

socket.on('nextQuestion', function (q) {
  return loadGameWindow(q.question, q.answer1, q.answer2, q.answer3, q.answer4);
}); // updates countdown timer
// if timer out tell server player ran out of time

socket.on('countdownTick', function (counter) {
  loadCountdownWindow(counter);
  if (counter <= 0 && counter !== null) submitAnswer(null);
}); // update user score when answer is processed

socket.on('answerProcessed', function (msg) {
  return handleMessage(msg);
}); // update other scores when any person answers a question

socket.on('playerAnswered', function (playerList) {
  return loadScoresWindow(Object.values(playerList));
}); // render winners when game ends

socket.on('gameOver', function (playerList) {
  loadScoresWindow(null);
  $("#scores").hide();
  $("#chat").hide();
  ReactDOM.render( /*#__PURE__*/React.createElement(GameOverWindow, {
    players: playerList
  }), document.querySelector("#game"));
}); // Listen for players disconnectiong

socket.on('socketDisconnect', function (dcData) {
  handleMessage("".concat(dcData.player.username, " has disconnected."));
  loadScoresWindow(Object.values(dcData.playerList));
}); // Loads components on page load

$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
  $("#error").animate({
    height: 'hide'
  }, 350);
  $("#error").animate({
    height: 'toggle'
  }, 350);
};

var serverResponse = function serverResponse(response) {
  $("#errorMessage").text(response.message);
  $("#error").animate({
    height: 'hide'
  }, 350);
  $("#error").animate({
    height: 'toggle'
  }, 350);
};

var redirect = function redirect(response) {
  $("#error").animate({
    height: 'hide'
  }, 350);
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
