
// load user's account details and authorization level
const loadAccount = () => {
	sendAjax('GET', '/getProfile', null, (data) => {
		ReactDOM.render(
			<ProfileWindow csrf={data.csrfToken}
						   username={data.account.username} 
						   score={data.account.score} 
						   gamesWon={data.account.gamesWon} />,
			document.querySelector("#content")
		);
		
		// if user is admin display question submit window
		if(data.account.isAdmin) {
			ReactDOM.render(
				<QuestionSubmitWindow csrf={data.csrfToken} />,
				document.querySelector("#questionSubmit")
			);
		}
	});
};

// handles question submit for admin users
const handleQuestionSubmit = (e) => {
	e.preventDefault();
	
	$("#error").animate({width: 'hide'}, 350);
	
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
	
	return true;
};

// renders client's username, score, and games won
const ProfileWindow = (props) => {
	return (
		<div id="profileWindow">
			<div id="profileStats">
				<h2 id="profileName">{props.username}</h2>
				<h4 class="profileScore">Score: {props.score}</h4>
				<h4 class="profileScore">Games Won: {props.gamesWon}</h4>
			</div>
			<input type="hidden" name="_csrf" value={props.csrf} />
		</div>
	);
};

// renders if admin to allow question submission
const QuestionSubmitWindow = (props) => {
	return (
		<form id="qSubmitForm" name="qSubmitForm" onSubmit={handleQuestionSubmit} action="/qSubmit" method="POST">
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

// load components
const setup = (csrf) => {
	ReactDOM.render(
		<ProfileWindow csrf={csrf} />,
		document.querySelector("#content")
	);
	
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
	getToken();
});