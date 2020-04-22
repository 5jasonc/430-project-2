"use strict";

// load user's account details and authorization level
var loadAccount = function loadAccount() {
  sendAjax('GET', '/getProfile', null, function (data) {
    ReactDOM.render( /*#__PURE__*/React.createElement(ProfileWindow, {
      csrf: data.csrfToken,
      username: data.account.username,
      score: data.account.score,
      gamesWon: data.account.gamesWon
    }), document.querySelector("#content")); // if user is admin display question submit window

    if (data.account.isAdmin) {
      ReactDOM.render( /*#__PURE__*/React.createElement(QuestionSubmitWindow, {
        csrf: data.csrfToken
      }), document.querySelector("#questionSubmit"));
    }
  });
}; // handles question submit for admin users


var handleQuestionSubmit = function handleQuestionSubmit(e) {
  e.preventDefault();
  $("#error").animate({
    width: 'hide'
  }, 350);
  var q = $("#questionText").val();
  var aChoice1 = $("#answerChoice1").val();
  var aChoice2 = $("#answerChoice2").val();
  var aChoice3 = $("#answerChoice3").val();
  var aChoice4 = $("#answerChoice4").val();
  var correctAnswer = $("#correctAnswer").val();

  if (q == '' || aChoice1 == '' || aChoice2 == '' || aChoice3 == '' || aChoice4 == '' || correctAnswer == '') {
    handleError("All fields are required");
    return false;
  }

  if (correctAnswer !== aChoice1 && correctAnswer !== aChoice2 && correctAnswer !== aChoice3 && correctAnswer !== aChoice4) {
    handleError("Correct answer needs to match one of the answer options");
    return false;
  }

  sendAjax('POST', $("#qSubmitForm").attr("action"), $("#qSubmitForm").serialize(), function (message) {
    $("#questionText").val('');
    $("#answerChoice1").val('');
    $("#answerChoice2").val('');
    $("#answerChoice3").val('');
    $("#answerChoice4").val('');
    $("#correctAnswer").val('');
    handleError(message.message);
  });
  return true;
}; // renders client's username, score, and games won


var ProfileWindow = function ProfileWindow(props) {
  return /*#__PURE__*/React.createElement("div", {
    id: "profileWindow"
  }, /*#__PURE__*/React.createElement("div", {
    id: "profileStats"
  }, /*#__PURE__*/React.createElement("h2", {
    id: "profileName"
  }, props.username), /*#__PURE__*/React.createElement("h4", {
    "class": "profileScore"
  }, "Score: ", props.score), /*#__PURE__*/React.createElement("h4", {
    "class": "profileScore"
  }, "Games Won: ", props.gamesWon)), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }));
}; // renders if admin to allow question submission


var QuestionSubmitWindow = function QuestionSubmitWindow(props) {
  return /*#__PURE__*/React.createElement("form", {
    id: "qSubmitForm",
    name: "qSubmitForm",
    onSubmit: handleQuestionSubmit,
    action: "/qSubmit",
    method: "POST"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "questionText"
  }, "Question: "), /*#__PURE__*/React.createElement("input", {
    id: "questionText",
    type: "text",
    name: "questionText",
    placeholder: "question to submit"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "answerChoice1"
  }, "Answer Choice #1: "), /*#__PURE__*/React.createElement("input", {
    id: "answerChoice1",
    type: "text",
    name: "answerChoice1",
    placeholder: "answer option to submit"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "answerChoice2"
  }, "Answer Choice #2: "), /*#__PURE__*/React.createElement("input", {
    id: "answerChoice2",
    type: "text",
    name: "answerChoice2",
    placeholder: "answer option to submit"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "answerChoice3"
  }, "Answer Choice #3: "), /*#__PURE__*/React.createElement("input", {
    id: "answerChoice3",
    type: "text",
    name: "answerChoice3",
    placeholder: "answer option to submit"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "answerChoice4"
  }, "Answer Choice #4: "), /*#__PURE__*/React.createElement("input", {
    id: "answerChoice4",
    type: "text",
    name: "answerChoice4",
    placeholder: "answer option to submit"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "correctAnswer"
  }, "Correct Answer: "), /*#__PURE__*/React.createElement("input", {
    id: "correctAnswer",
    type: "text",
    name: "correctAnswer",
    placeholder: "copy and paste correct answer choice"
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Submit Question"
  }));
}; // load components


var setup = function setup(csrf) {
  ReactDOM.render( /*#__PURE__*/React.createElement(ProfileWindow, {
    csrf: csrf
  }), document.querySelector("#content"));
  loadAccount();
}; // get csrf token


var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
}; // when page loads get csrf token


$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
  $("#error").animate({
    width: 'hide'
  }, 350);
  $("#error").animate({
    width: 'toggle'
  }, 350);
};

var serverResponse = function serverResponse(response) {
  console.log(response.message);
  $("#errorMessage").text(response.message);
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
