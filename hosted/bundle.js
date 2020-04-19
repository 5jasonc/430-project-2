"use strict";

var testQuestion = "What color is green";
var answer1 = "red";
var answer2 = "blue";
var answer3 = "purple";
var answer4 = "green";
var socket = io();
socket.on('questionAnswered', function (msg) {
  handleError(msg); //socket.emit('next question', 
});

var submitAnswer = function submitAnswer(e) {
  socket.emit('answer submitted', e.target.textContent);
};

var GameWindow = function GameWindow(props) {
  return /*#__PURE__*/React.createElement("div", {
    id: "gameWindow"
  }, /*#__PURE__*/React.createElement("div", {
    id: "question"
  }, /*#__PURE__*/React.createElement("h2", {
    id: "profileName"
  }, props.question, "?")), /*#__PURE__*/React.createElement("div", {
    id: "answers"
  }, /*#__PURE__*/React.createElement("div", {
    onClick: submitAnswer
  }, /*#__PURE__*/React.createElement("h4", null, props.answer1)), /*#__PURE__*/React.createElement("div", {
    onClick: submitAnswer
  }, /*#__PURE__*/React.createElement("h4", null, props.answer2)), /*#__PURE__*/React.createElement("div", {
    onClick: submitAnswer
  }, /*#__PURE__*/React.createElement("h4", null, props.answer3)), /*#__PURE__*/React.createElement("div", {
    onClick: submitAnswer
  }, /*#__PURE__*/React.createElement("h4", null, props.answer4))), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }));
};

var ScoreWindow = function ScoreWindow(props) {
  return /*#__PURE__*/React.createElement("div", {
    id: "scoreWindow"
  }, /*#__PURE__*/React.createElement("h3", null, "Score: ", props.score));
};

var setup = function setup(csrf) {
  ReactDOM.render( /*#__PURE__*/React.createElement(GameWindow, {
    csrf: csrf,
    question: testQuestion,
    answer1: answer1,
    answer2: answer2,
    answer3: answer3,
    answer4: answer4
  }), document.querySelector("#content"));
  ReactDOM.render( /*#__PURE__*/React.createElement(ScoreWindow, {
    score: "0"
  }), document.querySelector("#content"));
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
}; // Interacts with socket to run game


$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
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
