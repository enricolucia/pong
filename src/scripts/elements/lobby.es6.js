var
	_io = null,
	doc = document;

export class Lobby {
	constructor(io) {
		_io = io;
		this._socketReady = false;

		this.handleEvents();
		this.setupSocket();
	}

	hide() {
		doc.querySelector('.lobby').classList.add('hidden');
	}

	handleEvents() {
		doc.querySelector('.choice-screen .btn.join').addEventListener(
				'click',this.onJoinChoice.bind(this));
		doc.querySelector('.choice-screen .btn.create').addEventListener(
				'click', this.onCreateChoice.bind(this));
		doc.querySelector('.join-screen .btn').addEventListener(
				'click',this.onTokenSend.bind(this));
	}

	setupSocket() {
		_io.on('game:player-connected', this.onPlayerConnected.bind(this));
		_io.on('game:token-created', this.onTokenCreated.bind(this));
		_io.on('game:error', this.onGameError.bind(this));
		_io.on('game:error', this.onGameError.bind(this));
	}

	onPlayerConnected(/*data*/) {
		this._socketReady = true;
	}

	onJoinChoice() {
		if (this._socketReady) {
			doc.querySelector('.join-screen').classList.add('onscreen');
			sessionStorage.setItem('player', 'right');
		}
	}

	onCreateChoice() {
		if (this._socketReady) {
			sessionStorage.setItem('player', 'left');
			var sendCanvas = {
				height : window.innerHeight,
				width : window.innerWidth
			};
			_io.emit('player:create-session', sendCanvas);
		}
	}

	onTokenCreated(data) {
		doc.querySelector('.create-screen .token').textContent = data.token;
		doc.querySelector('.create-screen').classList.add('onscreen');
	}

	onTokenSend() {
		var sendCanvas = {
			height : window.innerHeight,
			width : window.innerWidth
		};
		_io.emit('player:joining', {
			token: doc.querySelector('.join-screen input').value.toUpperCase(),
			canvasOpponent : sendCanvas
		});
	}

	onGameError(data) {
		var notifier = doc.querySelector('.notifier');
		if (notifier.classList.contains('visible')) {
			return;
		}
		notifier.textContent = data.message;
		notifier.classList.add('visible');
		setTimeout(() => {
			notifier.classList.remove('visible');
		}, 2500);
	}
}
