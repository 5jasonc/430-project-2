// load user's account details and authorization level
const loadAccount = () => {
	sendAjax('GET', '/getProfile', null, (data) => {
		ReactDOM.render(
			<ProfileWindow username={data.account.username} 
						   score={data.account.score} 
						   gamesWon={data.account.gamesWon} />,
			document.querySelector("#content")
		);
		
		// if user is admin display question submit window
		if(data.account.isAdmin) {
			$("#questionSubmit").show();
			loadQuestionSubmitWindow(data.csrfToken);
		} else {
			$("#passwordChange").css({'margin-right': '0'});
		}
	});
};

// handles question submit for admin users
const handleQuestionSubmit = (e) => {
	e.preventDefault();
	
	$("#error").animate({height: 'hide'}, 350);
	
	const q = $("#questionText").val();
	const aChoice1 = $("#answerChoice1").val();
	const aChoice2 = $("#answerChoice2").val();
	const aChoice3 = $("#answerChoice3").val();
	const aChoice4 = $("#answerChoice4").val();
	const correctAnswer = $("#correctAnswer").val();
	
	if(q == '' || aChoice1 == '' || aChoice2 == '' || aChoice3 == '' || aChoice4 == '' || correctAnswer == '') {
		handleError("All fields are required");
		return false;
	}
	
	if((correctAnswer !== aChoice1) && 
	   (correctAnswer !== aChoice2) &&
	   (correctAnswer !== aChoice3) &&
	   (correctAnswer !== aChoice4)) {
		handleError("Correct answer needs to match one of the answer options");
		return false;
	}
	
	sendAjax('POST', $("#qSubmitForm").attr("action"), $("#qSubmitForm").serialize(), (message) => {
		$("#questionText").val('');
		$("#answerChoice1").val('');
		$("#answerChoice2").val('');
		$("#answerChoice3").val('');
		$("#answerChoice4").val('');
		$("#correctAnswer").val('');
		handleError(message.message);
	});
	
	return false;
};

// handles user password change
const handlePassChange = (e) => {
	e.preventDefault();
	
	$("#error").animate({height: 'hide'}, 350);
	
	if($("#currentPass").val() == '' || $("#newPass").val() == '' || $("#newPass2").val() == '') {
		handleError("All fields are required");
		return false;
	}
	
	if($("#newPass").val() !== $("#newPass2").val()) {
		handleError("New passwords do not match");
		return false;
	}
	
	sendAjax('POST', $("#passChangeForm").attr("action"), $("#passChangeForm").serialize(), () => handleError('Password changed successfully'));
	
	return false;
};

// renders client's username, score, and games won
const ProfileWindow = (props) => {
	return (
		<div id="profileWindow">
			<div id="profileStats">
				<h2 id="profileName">{props.username}</h2>
				<h4 className="profileScore">Score: {props.score}</h4>
				<h4 className="profileScore">Games Won: {props.gamesWon}</h4>
			</div>
		</div>
	);
};

// renders password change window
const PasswordChangeWindow = (props) => {
	return (
		<form id="passChangeForm" name="passChangeForm" onSubmit={handlePassChange} action="/passChange" method="POST" className="mainForm">
			<label htmlFor="currentPass">Current Password: </label>
			<input id="currentPass" type="password" name="currentPass" placeholder="current password" />
			<label htmlFor="newPass">New Password: </label>
			<input id="newPass" type="password" name="newPass" placeholder="new password" />
			<label htmlFor="newPass2">Re-type New Password: </label>
			<input id="newPass2" type="password" name="newPass2" placeholder="new password" />

			<input type="hidden" name="_csrf" value={props.csrf} />
			
			<input className="formSubmit" type="submit" value="Change Password" />
		</form>
	);
};

// renders if admin to allow question submission
const QuestionSubmitWindow = (props) => {
	return (
		<form id="qSubmitForm" name="qSubmitForm" onSubmit={handleQuestionSubmit} action="/qSubmit" method="POST" className="mainForm">
			<label htmlFor="questionText">Question: </label>
			<input id="questionText" type="text" name="questionText" placeholder="question to submit" />
			
			<label htmlFor="answerChoice1">Answer Choice #1: </label>
			<input id="answerChoice1" type="text" name="answerChoice1" placeholder="answer option to submit" />
			
			<label htmlFor="answerChoice2">Answer Choice #2: </label>
			<input id="answerChoice2" type="text" name="answerChoice2" placeholder="answer option to submit" />
			
			<label htmlFor="answerChoice3">Answer Choice #3: </label>
			<input id="answerChoice3" type="text" name="answerChoice3" placeholder="answer option to submit" />
			
			<label htmlFor="answerChoice4">Answer Choice #4: </label>
			<input id="answerChoice4" type="text" name="answerChoice4" placeholder="answer option to submit" />
			
			<label htmlFor="correctAnswer">Correct Answer: </label>
			<input id="correctAnswer" type="text" name="correctAnswer" placeholder="copy and paste correct answer choice" />
			<input type="hidden" name="_csrf" value={props.csrf} />
			<input className="formSubmit" type="submit" value="Submit Question" />
		</form>
	);
};

// load password change window
const loadPassChangeWindow = (csrf) => {
	ReactDOM.render(
		<PasswordChangeWindow csrf={csrf} />,
		document.querySelector("#passwordChange")
	);
};

// load question submit window
const loadQuestionSubmitWindow = (csrf) => {
	ReactDOM.render(
		<QuestionSubmitWindow csrf={csrf} />,
		document.querySelector("#questionSubmit")
	);
};

// load components
const setup = (csrf) => {
	loadPassChangeWindow(csrf);
	loadAccount();
};

// get csrf token
const getToken = () => {
	sendAjax('GET', '/getToken', null, (result) => {
		setup(result.csrfToken);
	});
};

// when page loads get csrf token
$(document).ready(function() {
	$("#questionSubmit").hide();
	getToken();
});