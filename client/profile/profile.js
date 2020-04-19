const loadAccount = () => {
	sendAjax('GET', '/getProfile', null, (data) => {
		ReactDOM.render(
			<ProfileWindow csrf={data.csrfToken}
						   username={data.account.username} 
						   score={data.account.score} 
						   gamesWon={data.account.gamesWon} />,
			document.querySelector("#content")
		);
	});
};

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

const setup = (csrf) => {
	ReactDOM.render(
		<ProfileWindow csrf={csrf} />,
		document.querySelector("#content")
	);
	
	loadAccount();
};

const getToken = () => {
	sendAjax('GET', '/getToken', null, (result) => {
		setup(result.csrfToken);
	});
};

$(document).ready(function() {
	getToken();
});