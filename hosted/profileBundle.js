"use strict";

var loadAccount = function loadAccount() {
  sendAjax('GET', '/getProfile', null, function (data) {
    ReactDOM.render( /*#__PURE__*/React.createElement(ProfileWindow, {
      csrf: data.csrfToken,
      username: data.account.username,
      score: data.account.score,
      gamesWon: data.account.gamesWon
    }), document.querySelector("#content"));
  });
};

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
};

var setup = function setup(csrf) {
  ReactDOM.render( /*#__PURE__*/React.createElement(ProfileWindow, {
    csrf: csrf
  }), document.querySelector("#content"));
  loadAccount();
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

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
