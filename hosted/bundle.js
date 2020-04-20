"use strict";

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var testQuestion = "Which is the hottest planet";
var answer1 = "Saturn";
var answer2 = "Venus";
var answer3 = "Mercury";
var answer4 = "Jupiter"; // holds clients chat log

var chatLog = []; // initialize socket

var socket = io(); // renders game window

var GameWindow = function GameWindow(props) {
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
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, props.answer1)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, props.answer2))), /*#__PURE__*/React.createElement("div", {
    id: "bottomAnswers"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, props.answer3)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, props.answer4)))));
}; // renders chat window


var ChatWindow = function ChatWindow(props) {
  var chatHTML = chatLog.map(function (message) {
    return /*#__PURE__*/React.createElement("li", null, message);
  });
  return /*#__PURE__*/React.createElement("ul", {
    id: "chatList"
  }, chatHTML);
}; // displays user's score


var ScoreWindow = function ScoreWindow(props) {
  return /*#__PURE__*/React.createElement("div", {
    id: "scoreWindow"
  }, /*#__PURE__*/React.createElement("h3", null, "Score: ", props.score), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }));
}; // Renders to page


var setup = function setup(csrf) {
  ReactDOM.render( /*#__PURE__*/React.createElement(ScoreWindow, {
    score: "0",
    csrf: csrf
  }), document.querySelector("#scores"));
  ReactDOM.render( /*#__PURE__*/React.createElement(ChatWindow, {
    chat: chatLog
  }), document.querySelector("#chat"));
}; // Submits answer to socket


var submitAnswer = function submitAnswer(e) {
  socket.emit('questionAnswered', {
    question: questionText.textContent.substring(0, questionText.textContent.length - 1),
    playerAnswer: e.target.textContent
  }); // remove events from buttons until next question

  var answerButtons = document.querySelectorAll("#answers div div");

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
}; // Renders game window


var loadGameWindow = function loadGameWindow() {
  ReactDOM.render( /*#__PURE__*/React.createElement(GameWindow, {
    question: testQuestion,
    answer1: answer1,
    answer2: answer2,
    answer3: answer3,
    answer4: answer4
  }), document.querySelector("#game")); // tie click events to answer buttons

  var answerButtons = document.querySelectorAll("#answers div div");

  var _iterator2 = _createForOfIteratorHelper(answerButtons),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var button = _step2.value;
      button.onclick = submitAnswer;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
}; // Rerenders chat window


var loadChats = function loadChats() {
  ReactDOM.render( /*#__PURE__*/React.createElement(ChatWindow, {
    chat: chatLog
  }), document.querySelector("#chat")); // Keeps chat window scrolled all the way down
  // code taken from Jeremy Ruten here: https://stackoverflow.com/questions/270612/scroll-to-bottom-of-div

  chat.scrollTop = chat.scrollHeight;
}; // Gets client csrf token


var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
}; // Handle message to client


var handleMessage = function handleMessage(msg) {
  chatLog.push(msg);
  loadChats();
}; // Listen for players connecting


socket.on('playerConnected', function (object) {
  handleMessage(object.msg);

  if (object.numConnections == 2) {
    loadGameWindow();
  }
});
socket.on('answer processed', function (object) {
  handleMessage(object.msg);
}); // Listen for players disconnectiong

socket.on('socket disconnect', function (object) {
  handleMessage(object.msg);
}); // Loads components on page load

$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
  console.log(message);
  $("#errorMessage").text(message);
  $("#error").animate({
    width: 'hide'
  }, 350);
  $("#error").animate({
    width: 'toggle'
  }, 350);
};

var redirect = function redirect(response) {
  $("#error").animate({
    width: 'hide'
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
