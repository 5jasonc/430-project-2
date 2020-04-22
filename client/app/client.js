const testQuestion = "Which is the hottest planet";
const answer1 = "Saturn";
const answer2 = "Venus";
const answer3 = "Mercury";
const answer4 = "Jupiter";

// holds clients chat log
const chatLog = [];

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
	const scoreHTML = props.players.map((player) => {
		return (
			<li>
				<h3>{player.username}</h3>
				<ul>
					<li><h4>Score: {player.score}</h4></li>
				</ul>
			</li>
		);
	});
	
	return (
		<div id="scores">
			<ul id="scoreList">
				{scoreHTML}
			</ul>
			<input type="hidden" name="_csrf" value={props.csrf} />
		</div>
	);
};

// displays winners of game
const GameOverWindow = (props) => {
	let i = 0;
	const gameOverHTML = props.players.map((player) => {
		let suffix;
		i++;
		
		if(i == 1) suffix = "st";
		if(i == 2) suffix = "nd";
		if(i == 3) suffix = "rd";
		
		return (
			<div>
				<h2>{i + suffix} Place</h2>
				<h3>{player.username}</h3>
				<h4>Score: {player.score}</h4>
			</div>
		);
	});
	
	return (
		<div id="winnerList">
			{gameOverHTML}
		</div>
	);
};

// Renders to page
const setup = (csrf) => {	
	ReactDOM.render(
		<ScoreWindow score={[]} csrf={csrf} />,
		document.querySelector("#scores")
	);
	
	ReactDOM.render(
		<ChatWindow chat={chatLog} />,
		document.querySelector("#chat")
	);
};

// Submits answer to socket
const submitAnswer = (e) => {
	sendAjax('GET', '/getUsername', null, (result) => {
		
		socket.emit('questionAnswered', {
		  question: questionText.textContent.substring(0, questionText.textContent.length - 1),
		  playerAnswer: e.target.textContent,
		  username: result.username,
	    });
	});
	
	// remove events from buttons until next question
	let answerButtons = document.querySelectorAll("#answers div div");
	
	for(let button of answerButtons) {
		button.onclick = () => {};
	}
};

// Renders game window
const loadGameWindow = (q, a1, a2, a3, a4) => {
	ReactDOM.render(
		<GameWindow question={q} answer1={a1} answer2={a2} answer3={a3} answer4={a4} />,
		document.querySelector("#game")
	);
	
	// tie click events to answer buttons
	let answerButtons = document.querySelectorAll("#answers div div");
	
	for(let button of answerButtons) {
		button.onclick = submitAnswer;
	}
};

// Rerenders scores window
const loadScoresWindow = (players) => {
	sendAjax('GET', '/getToken', null, (result) => {
		ReactDOM.render(
			<ScoreWindow players={players} csrf={result.csrfToken} />,
			document.querySelector("#scores")
		);
	});
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

// if server pins player send back username
socket.on('pingUser', (obj) => {
	sendAjax('GET', '/getUsername', null, (result) => {
		socket.emit('userConnected', { 
			username: result.username,
			score: 0,
			socketid: socket.id,
		});
		
		handleMessage("You have connected!");
	});
});

// Listen for other players connecting
socket.on('pingPlayers', (obj) => {
	loadScoresWindow(obj.playerList);
	
	const lastPlayerConnected = obj.playerList[obj.playerList.length - 1];
	
	if(lastPlayerConnected.socketid !== socket.id) handleMessage(lastPlayerConnected.username + " has connected!");	
});

// renders questions when needed
socket.on('nextQuestion', (q) => {
	loadGameWindow(q.question, q.answer1, q.answer2, q.answer3, q.answer4);
});

// update user score when answer is processed
socket.on('answer processed', (object) => {
	handleMessage(object.msg);
	
	if(object.playerList) {
		loadScoresWindow(object.playerList);
	}
});

// update other scores when any person answers a question
socket.on('playerAnswered', (object) => {
	loadScoresWindow(object.playerList);
});

// render winners when game ends
socket.on('gameOver', (object) => {
	loadScoresWindow(object.playerList);
	
	ReactDOM.render(
		<GameOverWindow players={object.playerList} />,
		document.querySelector("#game")
	);
});

// Listen for players disconnectiong
socket.on('socket disconnect', (object) => {
    handleMessage(object.msg);
	loadScoresWindow(object.playerList);
});

// Loads components on page load
$(document).ready(function() {
	getToken();
});