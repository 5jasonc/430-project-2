"use strict";

// load user's account details and authorization level
var loadAccount = function loadAccount() {
  sendAjax('GET', '/getProfile', null, function (data) {
    ReactDOM.render( /*#__PURE__*/React.createElement(ProfileWindow, {
      username: data.account.username,
      score: data.account.score,
      gamesWon: data.account.gamesWon
    }), document.querySelector("#content")); // if user is admin display question submit window

    if (data.account.isAdmin) {
      $("#questionSubmit").show();
      loadQuestionSubmitWindow(data.csrfToken);
    } else {
      $("#passwordChange").css({
        'margin-right': '0'
      });
    }
  });
}; // handles question submit for admin users


var handleQuestionSubmit = function handleQuestionSubmit(e) {
  e.preventDefault();
  $("#error").animate({
    height: 'hide'
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
  return false;
}; // handles user password change


var handlePassChange = function handlePassChange(e) {
  e.preventDefault();
  $("#error").animate({
    height: 'hide'
  }, 350);

  if ($("#currentPass").val() == '' || $("#newPass").val() == '' || $("#newPass2").val() == '') {
    handleError("All fields are required");
    return false;
  }

  if ($("#newPass").val() !== $("#newPass2").val()) {
    handleError("New passwords do not match");
    return false;
  }

  sendAjax('POST', $("#passChangeForm").attr("action"), $("#passChangeForm").serialize(), function () {
    return handleError('Password changed successfully');
  });
  return false;
}; // renders client's username, score, and games won


var ProfileWindow = function ProfileWindow(props) {
  return /*#__PURE__*/React.createElement("div", {
    id: "profileWindow"
  }, /*#__PURE__*/React.createElement("div", {
    id: "profileStats"
  }, /*#__PURE__*/React.createElement("h2", {
    id: "profileName"
  }, props.username), /*#__PURE__*/React.createElement("h4", {
    className: "profileScore"
  }, "Score: ", props.score), /*#__PURE__*/React.createElement("h4", {
    className: "profileScore"
  }, "Games Won: ", props.gamesWon)));
}; // renders password change window


var PasswordChangeWindow = function PasswordChangeWindow(props) {
  return /*#__PURE__*/React.createElement("form", {
    id: "passChangeForm",
    name: "passChangeForm",
    onSubmit: handlePassChange,
    action: "/passChange",
    method: "POST",
    className: "mainForm"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "currentPass"
  }, "Current Password: "), /*#__PURE__*/React.createElement("input", {
    id: "currentPass",
    type: "password",
    name: "currentPass",
    placeholder: "current password"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "newPass"
  }, "New Password: "), /*#__PURE__*/React.createElement("input", {
    id: "newPass",
    type: "password",
    name: "newPass",
    placeholder: "new password"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "newPass2"
  }, "Re-type New Password: "), /*#__PURE__*/React.createElement("input", {
    id: "newPass2",
    type: "password",
    name: "newPass2",
    placeholder: "new password"
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Change Password"
  }));
}; // renders if admin to allow question submission


var QuestionSubmitWindow = function QuestionSubmitWindow(props) {
  return /*#__PURE__*/React.createElement("form", {
    id: "qSubmitForm",
    name: "qSubmitForm",
    onSubmit: handleQuestionSubmit,
    action: "/qSubmit",
    method: "POST",
    className: "mainForm"
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
}; // load password change window


var loadPassChangeWindow = function loadPassChangeWindow(csrf) {
  ReactDOM.render( /*#__PURE__*/React.createElement(PasswordChangeWindow, {
    csrf: csrf
  }), document.querySelector("#passwordChange"));
}; // load question submit window


var loadQuestionSubmitWindow = function loadQuestionSubmitWindow(csrf) {
  ReactDOM.render( /*#__PURE__*/React.createElement(QuestionSubmitWindow, {
    csrf: csrf
  }), document.querySelector("#questionSubmit"));
}; // load components


var setup = function setup(csrf) {
  loadPassChangeWindow(csrf);
  loadAccount();
}; // get csrf token


var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
}; // when page loads get csrf token


$(document).ready(function () {
  $("#questionSubmit").hide();
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
