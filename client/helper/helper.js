const handleError = (message) => {
	console.log(message);
	$("#errorMessage").text(message);
	$("#error").animate({width: 'hide'}, 350);
	$("#error").animate({width: 'toggle'}, 350);
};

const redirect = (response) => {
	$("#error").animate({width: 'hide'}, 350);
	window.location = response.redirect;
};

const sendAjax = (type, action, data, success) => {
	$.ajax({
		cache: false,
		type: type,
		url: action,
		data: data,
		dataType: "json",
		success: success,
		error: function(xhr, status, error) {
			var messageObj = JSON.parse(xhr.responseText);
			handleError(messageObj.error);
		}
	});
};