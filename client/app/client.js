// holds client's chat log
const chatLog = [];

// initialize socket
const socket = io();

// holds csrf token during game
const CsrfWindow = (props) => {
	return (
		<div>
			<input type="hidden" name="_csrf" value={props.csrf} />
		</div>
	);
};

// renders lobby select window
const LobbySelectWindow = (props) => {
	if(props.rooms === null) return (<div></div>);
	if(props.rooms.length <= 0) return (<div id="lobbyList"><h2>No games found!</h2></div>);
		
	const lobbySelectHTML = props.rooms.map((room) => {
		return (
			<div className="lobby">
				<h3>{room.roomName}</h3>
				<p>Players: {Object.keys(room.playerList).length}/{room.maxConnections}</p>
				<input type="submit" className="formSubmit" onClick={() => joinLobby(room.roomKey)} value="Join Game" />
			</div>
		);
	});
	
	return (
		<div>
			<h2>Available Games</h2>
			<div id="lobbyList">
				{lobbySelectHTML}
			</div>
		</div>
	);
};

// renders lobby create window
const LobbyCreateWindow = (props) => {
	if(!props.showWindow) return (<div></div>);
	
	return (
		<div className="mainForm">
			<label htmlFor="roomNameText">Lobby Name: </label>
			<input id="roomNameText" type="text" name="roomNameText" placeholder="(must be under 20 characters)" />
			
			<label htmlFor="maxPlayerSelect">Max Players: </label>
			<select id="maxPlayerSelect" name="maxPlayerSelect">
				<option value="2" selected="selected">2</option>
				<option value="3">3</option>
				<option value="4">4</option>
				<option value="5">5</option>
			</select>
			
			<label htmlFor="roundSelect">Number of rounds: </label>
			<select id="roundSelect" name="roundSelect">
				<option value="5" selected="selected">5</option>
				<option value="10">10</option>
				<option value="15">15</option>
				<option value="20">20</option>
			</select>
			
			<input type="submit" className="formSubmit" onClick={createLobby} value="Create Lobby" />
		</div>
	);
};

// renders countdown window
const CountdownWindow = (props) => {
	if(props.timeLeft === null) return (<div></div>);
	
	return (
		<div>
			<h2>Time Left: {props.timeLeft}</h2>
		</div>
	);
};

// renders game window
const GameWindow = (props) => {
	if(props.question === null) return (<div><h2>Waiting for players...</h2><h3>(The game will start when max players have been reached)</h3></div>);
		
	return (
		<div id="gameWindow">
			<div id="question">
				<h2 id="questionText">{props.question}?</h2>
			</div>
			<div id="answers">
				<div id="topAnswers">
					<input type="submit" className="formSubmit" value={props.answer1} />
					<input type="submit" className="formSubmit" value={props.answer2} />
				</div>
				<div id="bottomAnswers">
					<input type="submit" className="formSubmit" value={props.answer3} />
					<input type="submit" className="formSubmit" value={props.answer4} />
				</div>
			</div>
		</div>
	);
};

// renders chat window
const ChatWindow = (props) => {
	const chatHTML = props.chats.map((message) => {
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
	if(props.players === null) return (<div></div>);
	
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
		<ul id="scoreList">
			{scoreHTML}
		</ul>
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
		if(i >= 4) suffix = "th";
		
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

// sends the socket information to create new lobby
const createLobby = () => {
	if(roomNameText.value === '') return handleError('Room name is required');
	if(roomNameText.value.length >= 20) return handleError('Room name too long');
	
	const newRoom = { // room key creation taken from Xuejia Chen here: https://gist.github.com/6174/6062387
		roomKey: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
		roomName: roomNameText.value.replace(/[^a-z0-9 ]/gim, "").trim(),
		maxConnections: parseInt(maxPlayerSelect.options[maxPlayerSelect.selectedIndex].value),
		maxQuestions: parseInt(roundSelect.options[roundSelect.selectedIndex].value),
	};
	
	socket.emit('roomCreated', newRoom);
	joinLobby(newRoom.roomKey);
};

// connect client to socket of lobby and send server player connect info
const joinLobby = (roomKey) => {
	$("#game").show();
	$("#chat").show();
	$("#lobbySelect").hide();
	$("#lobbyCreate").hide();
	sendAjax('GET', '/getUsername', null, (result) => {		
		socket.emit('roomJoined', {
			roomKey: roomKey,
			player: {
				username: result.username,
				score: 0,
				socketid: socket.id,
			},
		});
		roomKeyInput.value = roomKey;
		loadGameWindow(null, null, null, null, null);
		loadLobbyWindow(null);
		loadLobbyCreateWindow(false);
	});
};

// load lobby window
const loadLobbyWindow = (rooms) => {	
	ReactDOM.render(
		<LobbySelectWindow rooms={rooms} />,
		document.querySelector("#lobbySelect")
	);
};

// load lobby create window
const loadLobbyCreateWindow = (showWindow) => {
	ReactDOM.render(
		<LobbyCreateWindow showWindow={showWindow} />,
		document.querySelector("#lobbyCreate")
	);
};

// Submits answer to socket
const submitAnswer = (playerAnswer) => {
	sendAjax('GET', '/getUsername', null, (result) => {
		socket.emit('questionAnswered', {
		  question: questionText.textContent.substring(0, questionText.textContent.length - 1),
		  playerAnswer: playerAnswer,
		  username: result.username,
		  roomKey: roomKeyInput.value,
	    });
	});
};

// Handles when answer button is clicked
const handleAnswer = (e) => {
	submitAnswer(e.target.value);
	
	// remove events from buttons until next question
	let answerButtons = document.querySelectorAll("#answers .formSubmit");
	
	for(let button of answerButtons) {
		button.onclick = () => {};
	}
};

// Load game window
const loadGameWindow = (q, a1, a2, a3, a4) => {
	$("#error").animate({height: 'hide'}, 350);
	ReactDOM.render(
		<GameWindow question={q} answer1={a1} answer2={a2} answer3={a3} answer4={a4} />,
		document.querySelector("#game")
	);
	
	// tie click events to answer buttons
	let answerButtons = document.querySelectorAll("#answers .formSubmit");
	
	for(let button of answerButtons) {
		button.onclick = handleAnswer;
	}
};

// Load countdown window
const loadCountdownWindow = (timeLeft) => {
	ReactDOM.render(
		<CountdownWindow timeLeft={timeLeft} />,
		document.querySelector("#countdown")
	);
};

// Load scores window
const loadScoresWindow = (players) => {
	ReactDOM.render(
		<ScoreWindow players={players} />,
		document.querySelector("#scores")
	);
};

// Load chat window
const loadChats = () => {
	ReactDOM.render(
		<ChatWindow chats={chatLog} />,
		document.querySelector("#chat")
	);
	
	// Keeps chat window scrolled all the way down
	// code taken from Jeremy Ruten here: https://stackoverflow.com/questions/270612/scroll-to-bottom-of-div
	chat.scrollTop = chat.scrollHeight;
};

// Gets and loads client csrf token
const getToken = () => {
	$("#game").hide();
	$("#chat").hide();
	$("#scores").hide();
	$("#lobbySelect").show();
	$("#lobbyCreate").show();
	sendAjax('GET', '/getToken', null, (result) => {
		ReactDOM.render(
			<CsrfWindow csrf={result.csrfToken} />,
			document.querySelector("#csrfWindow")
		);
		
		loadLobbyCreateWindow(true);
	});
};

// Handle message to client
const handleMessage = (msg) => {
	chatLog.push(msg);
	loadChats();
}

// logs message to chat whenever message/error sent back from the server
socket.on('message', (message) => handleMessage(message));

// loads and renders lobby list when users connects to socket
socket.on('lobbyList', (roomList) => loadLobbyWindow(roomList));

// Listen for other players connecting
socket.on('pingPlayers', (connectData) => {
	// tell user if they or another player connects
	if(connectData.player.socketid === socket.id) handleMessage("You have connected!");
	else { handleMessage(connectData.player.username + " has connected!"); }
	
	// start game if max connections reached
	if(Object.keys(connectData.room.playerList).length >= connectData.room.maxConnections) {
		loadScoresWindow(Object.values(connectData.room.playerList));
		$("#scores").show();
		socket.emit('startGame', connectData.room);
	}
});

// renders questions when needed
socket.on('nextQuestion', (q) => loadGameWindow(q.question, q.answer1, q.answer2, q.answer3, q.answer4));

// updates countdown timer
// if timer out tell server player ran out of time
socket.on('countdownTick', (counter) => {
	loadCountdownWindow(counter);
	
	if(counter <= 0 && counter !== null) submitAnswer(null);
});

// update user score when answer is processed
socket.on('answerProcessed', (msg) => handleMessage(msg));

// update other scores when any person answers a question
socket.on('playerAnswered', (playerList) => loadScoresWindow(Object.values(playerList)));

// render winners when game ends
socket.on('gameOver', (playerList) => {
	loadScoresWindow(null);
	$("#scores").hide();
	$("#chat").hide();
	ReactDOM.render(
		<GameOverWindow players={playerList} />,
		document.querySelector("#game")
	);
});

// Listen for players disconnectiong
socket.on('socketDisconnect', (dcData) => {
    handleMessage(`${dcData.player.username} has disconnected.`);
	loadScoresWindow(Object.values(dcData.playerList));
});

// Loads components on page load
$(document).ready(function() {
	getToken();
});