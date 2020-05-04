// handles user login
const handleLogin = (e) => {
	e.preventDefault();
	
	$("#error").animate({height: 'hide'}, 350);
	
	if($("#user").val() == '' || $("#pass").val() == '') {
		handleError("Username or password is empty");
		return false;
	}
	
	sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);
	
	return false;
};

// handles new user sign up
const handleSignup = (e) => {
	e.preventDefault();
	
	$("#error").animate({height: 'hide'}, 350);
	
	if($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
		handleError("All fields are required");
		return false;
	}
	
	if($("#pass").val() !== $("#pass2").val()) {
		handleError("Passwords do not match");
		return false;
	}
	
	sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);
	
	return false;
};

// renders login window
const LoginWindow = (props) => {
	return (
		<form id="loginForm" name="loginForm" onSubmit={handleLogin} action="/login" method="POST" className="mainForm">
			<label htmlFor="username">Username: </label>
			<input id="user" type="text" name="username" placeholder="username" />
			<label htmlFor="pass">Password: </label>
			<input id="pass" type="password" name="pass" placeholder="password" />
			<input type="hidden" name="_csrf" value={props.csrf} />
			<input className="formSubmit" type="submit" value="Sign In" />
		</form>
	);
};

// renders sign up window
const SignupWindow = (props) => {
	return (
		<form id="signupForm" name="signupForm" onSubmit={handleSignup} action="/signup" method="POST" className="mainForm">
			<label htmlFor="username">Username: </label>
			<input id="user" type="text" name="username" placeholder="username" />
			<label htmlFor="pass">Password: </label>
			<input id="pass" type="password" name="pass" placeholder="password" />
			<label htmlFor="pass2">Password: </label>
			<input id="pass2" type="password" name="pass2" placeholder="retype password" />
			<input type="hidden" name="_csrf" value={props.csrf} />
			<input className="formSubmit" type="submit" value="Sign Up" />
		</form>
	);
};

// load login window
const createLoginWindow = (csrf) => {
	ReactDOM.render(
		<LoginWindow csrf={csrf} />,
		document.querySelector("#content")
	);
};

// load sign up window
const createSignupWindow = (csrf) => {
	ReactDOM.render(
		<SignupWindow csrf={csrf} />,
		document.querySelector("#content")
	);
};

// setup page
const setup = (csrf) => {
	createLoginWindow(csrf);
	
	const loginButton = document.querySelector("#loginButton");
	const signupButton = document.querySelector("#signupButton");
	
	signupButton.addEventListener("click", (e) => {
		e.preventDefault();
		createSignupWindow(csrf);
		return false;
	});
	
	loginButton.addEventListener("click", (e) => {
		e.preventDefault();
		createLoginWindow(csrf);
		return false;
	});
};

// get csrf token
const getToken = () => {
	sendAjax('GET', '/getToken', null, (result) => {
		setup(result.csrfToken);
	});
};

// setup on page load
$(document).ready(function() {
	getToken();
});