const testQuestion = "Which is the hottest planet";
const answer1 = "Saturn";
const answer2 = "Venus";
const answer3 = "Mercury";
const answer4 = "Jupiter";

// holds clients chat log
let chatLog = [];

// initialize socket
const socket = io();

// renders game window
const GameWindow = (props) => {
	return (
		<div id="gameWindow">
			<div id="question">
				<h2 id="questionText">{props.question}?</h2>
			</div>
			<div id="answers">
				<div id="topAnswers">
					<div><h4>{props.answer1}</h4></div>
					<div><h4>{props.answer2}</h4></div>
				</div>
				<div id="bottomAnswers">
					<div><h4>{props.answer3}</h4></div>
					<div><h4>{props.answer4}</h4></div>
				</div>
			</div>
		</div>
	);
};

// renders chat window
const ChatWindow = (props) => {
	const chatHTML = chatLog.map((message) => {
		return (<li>{message}</li>);
	});
	
	return (
		<ul id="chatList">
			{chatHTML}
		</ul>
	);
};

// displays user's score
const ScoreWindow = (props) => {
	return (
		<div id="scoreWindow">
			<h3>Score: {props.score}</h3>
			<input type="hidden" name="_csrf" value={props.csrf} />
		</div>
	);
};

// Renders to page
const setup = (csrf) => {	
	ReactDOM.render(
		<ScoreWindow score="0" csrf={csrf} />,
		document.querySelector("#scores")
	);
	
	ReactDOM.render(
		<ChatWindow chat={chatLog} />,
		document.querySelector("#chat")
	);
};

// Submits answer to socket
const submitAnswer = (e) => {
	socket.emit('questionAnswered', {
		question: questionText.textContent.substring(0, questionText.textContent.length - 1),
		playerAnswer: e.target.textContent,
	});
	
	// remove events from buttons until next question
	let answerButtons = document.querySelectorAll("#answers div div");
	
	for(let button of answerButtons) {
		button.onclick = () => {};
	}
};

// Renders game window
const loadGameWindow = () => {
	ReactDOM.render(
		<GameWindow question={testQuestion} answer1={answer1} answer2={answer2} answer3={answer3} answer4={answer4} />,
		document.querySelector("#game")
	);
	
	// tie click events to answer buttons
	let answerButtons = document.querySelectorAll("#answers div div");
	
	for(let button of answerButtons) {
		button.onclick = submitAnswer;
	}
};

// Rerenders chat window
const loadChats = () => {
	ReactDOM.render(
		<ChatWindow chat={chatLog} />,
		document.querySelector("#chat")
	);
	
	// Keeps chat window scrolled all the way down
	// code taken from Jeremy Ruten here: https://stackoverflow.com/questions/270612/scroll-to-bottom-of-div
	chat.scrollTop = chat.scrollHeight;
};

// Gets client csrf token
const getToken = () => {
	sendAjax('GET', '/getToken', null, (result) => {
		setup(result.csrfToken);
	});
};

// Handle message to client
const handleMessage = (msg) => {
	chatLog.push(msg);
	loadChats();
}

// Listen for players connecting
socket.on('playerConnected', (object) => {
	handleMessage(object.msg);
	
	if(object.numConnections == 2) {
		loadGameWindow();
	}
});

socket.on('answer processed', (object) => {
	handleMessage(object.msg);
});

// Listen for players disconnectiong
socket.on('socket disconnect', (object) => {
    handleMessage(object.msg);
});

// Loads components on page load
$(document).ready(function() {
	getToken();
});