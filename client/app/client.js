const testQuestion = "What color is green";
const answer1 = "red";
const answer2 = "blue";
const answer3 = "purple";
const answer4 = "green";

const socket = io();

socket.on('questionAnswered', (msg) => {
	handleError(msg);
		
	//socket.emit('next question', 
});

const submitAnswer = (e) => {
	socket.emit('answer submitted', e.target.textContent);
};

const GameWindow = (props) => {
	return (
		<div id="gameWindow">
			<div id="question">
				<h2 id="profileName">{props.question}?</h2>
			</div>
			<div id="answers">
				<div onClick={submitAnswer}><h4>{props.answer1}</h4></div>
				<div onClick={submitAnswer}><h4>{props.answer2}</h4></div>
				<div onClick={submitAnswer}><h4>{props.answer3}</h4></div>
				<div onClick={submitAnswer}><h4>{props.answer4}</h4></div>
			</div>
			<input type="hidden" name="_csrf" value={props.csrf} />
		</div>
	);
};

const ScoreWindow = (props) => {
	return (
		<div id="scoreWindow">
			<h3>Score: {props.score}</h3>
		</div>
	);
};

const setup = (csrf) => {
	ReactDOM.render(
		<GameWindow csrf={csrf} question={testQuestion} answer1={answer1} answer2={answer2} answer3={answer3} answer4={answer4} />,
		document.querySelector("#content")
	);
	
	ReactDOM.render(
		<ScoreWindow score="0" />,
		document.querySelector("#content")
	);
};

const getToken = () => {
	sendAjax('GET', '/getToken', null, (result) => {
		setup(result.csrfToken);
	});
};

// Interacts with socket to run game


$(document).ready(function() {
	getToken();
});