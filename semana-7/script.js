// Defining game attributes.
const game = {

	// Defining the game cards.
	cards: document.querySelectorAll('.card'),

	// Defining game cards data.
	matchingCards: [
		{
	
			imagePath: "assets/imgs/Character-1.png",
			positions: [0,0],
		
		},
		{
	
			imagePath: "assets/imgs/Character-2.png",
			positions: [0,0],
		
		},
		{
	
			imagePath: "assets/imgs/Character-3.png",
			positions: [0,0],
		
		},
		{
	
			imagePath: "assets/imgs/Character-4.png",
			positions: [0,0],
		
		},
		{
	
			imagePath: "assets/imgs/Character-5.png",
			positions: [0,0],
		
		},
		{
	
			imagePath: "assets/imgs/Character-6.png",
			positions: [0,0],
		
		},
		{
	
			imagePath: "assets/imgs/Character-7.png",
			positions: [0,0],
		
		},
		{
	
			imagePath: "assets/imgs/Character-8.png",
			positions: [0,0],
		
		}
	],

	// Defining game players.
	players: {

		// Defining player 1.
		1: {
			score: 0, // Player 1 score.
			name: "Jogador 1", // Player 1 name.
			domElement: document.querySelector("#player-1"), // Player 1 DOM element.
		},

		// Defining player 2.
		2: {
			score: 0, // Player 2 score.
			name: "Jogador 2", // Player 2 name.
			domElement: document.querySelector("#player-2"), // Player 2 DOM element.
		}
	
	},

	// Defining game MQTT connection attributes and topics.
	mqtt: {

		HOST: "broker.hivemq.com", // MQTT broker host.
		PORT: 8000, // MQTT broker port.
		CLIENT_ID: "558391cc-cecc-4d70-bd1d-731d17e7f7cf", // MQTT client ID.
		KEY_PRESSED: "JogoDaMemoria/TeclaPressionada", // Topic to receive the pressed key from the keypad.
		PLAY_BUZZER: "JogoDaMemoria/TocarBuzzer" // Topic to send the play buzzer message.
	
	},

	// Defining game keymap.
	keymap: {

		"1":  1, "2":  2, "3":  3, "A":  4,
		"4":  5, "5":  6, "6":  7, "B":  8,
		"7":  9, "8": 10, "9": 11, "C": 12,
		"*": 13, "0": 14, "#": 15, "D": 16,
	
	},

	// Defining game constants.
	constants: {

		title: "Memory Game", // Game title.
		yourTurn: "Your turn!", // Message to show when it's the player's turn.
		waiting: "Waiting...", // Message to show when it's not the player's turn.

	},

	// Number of distributed points.
	distributedPoints: 0,

	// 1 or 2.
	whoseTurnIsIt: 1,

	// Boolean to check if the game is on a sleep time.
	isOnASleepTime: false,

	// Array to store the open cards.
	openCards: [], 

}

// Creating an MQTT client instance.
let client = new Paho.MQTT.Client(game.mqtt.HOST, game.mqtt.PORT, game.mqtt.CLIENT_ID);

// Instancing a function to be called when the game needs a sleep time.
function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));
	
}

// Instancing a function to be called when the MQTT client connects.
function onConnect() {

	// Subscribing to the "KEY_PRESSED" topic.
	client.subscribe(game.mqtt.KEY_PRESSED);

}

// Instancing a function to be called when the MQTT client disconnects.
function onConnectionLost(responseObject) {

	// If connection lost loggin the error.
	if (responseObject.errorCode !== 0) {

		console.log("⚠️ MQTT connection lost:");
		console.error(responseObject.errorMessage);

	}

}

// Instancing a function to be called when a message arrives.
function onMessageArrived(message) {

	
	// When receiving a message from the "KEY_PRESSED" topic, flipping the received corresponding card.
	if(message.destinationName == game.mqtt.KEY_PRESSED) {

		flipCard(game.keymap[message.payloadString]);

	}

}

// Instancing a function to setup the game.
function setupGame() {

	// Setting up on connection lost handler. 
	client.onConnectionLost = onConnectionLost;

	// Setting up on message arrived handler.
	client.onMessageArrived = onMessageArrived;

	// Setting up on connect handler.
	const onConnectHandler = { onSuccess:  onConnect };

	// Connecting to the server.
	client.connect(onConnectHandler);

	// Setting up the game's players and their scores.
	for(let player in game.players) {

		// Setting up the player's name.
		game.players[player].domElement.children[0].innerHTML = game.players[player].name;

		// Setting up the player's score.
		game.players[player].domElement.children[2].children[0].children[0].innerHTML = game.players[player].score;

		// Setting up the player's turn message.
		if(player == game.whoseTurnIsIt) {

			game.players[player].domElement.children[1].innerHTML = game.constants.yourTurn;

		} else {

			game.players[player].domElement.children[1].innerHTML = game.constants.waiting;

		}

	}

}

// Instancing a function to shuffle the cards.
function shuffle(matchingCards) {

	let counter = 0;

	let unavailablePositions = [];

	while(unavailablePositions.length != 16) {

		let quantityOfGeneratedNumbers = 0;

		while(quantityOfGeneratedNumbers != 2) {

			generatedNumber = Math.floor(Math.random() * 16) + 1;
	
			if(!unavailablePositions.includes(generatedNumber)) {
	
				unavailablePositions.push(generatedNumber);

				quantityOfGeneratedNumbers++;

				if(quantityOfGeneratedNumbers == 1) {

					matchingCards[counter].positions[0] =  generatedNumber;

				} else if (quantityOfGeneratedNumbers == 2) {

					matchingCards[counter].positions[1] =  generatedNumber;

				}
				
	
			}

	
		}

		counter++;

	}

}

// Instancing a function to map the cards.
function mapCards(matchingCards) { 

	// Mapping the cards with the images and its matching codes.
	for(let i = 0; i < (game.cards.length); i++) {

		if(i < 8) {

			for(let j = 0; j < matchingCards[i].positions.length; j++) {
			
				game.cards[matchingCards[i].positions[0]-1].children[0].children[1].children[0].src = matchingCards[i].imagePath;
				game.cards[matchingCards[i].positions[0]-1].setAttribute('character', matchingCards[i].positions[0]);
				game.cards[matchingCards[i].positions[1]-1].children[0].children[1].children[0].src = matchingCards[i].imagePath;
				game.cards[matchingCards[i].positions[1]-1].setAttribute('character', matchingCards[i].positions[0]);

			}
			

		}

	} 

}

// Instancing a function to flip a card.
function flipCard(id) {

	if(game.isOnASleepTime) return;

	if(game.cards[id - 1].getAttribute("isAvailable") == "false") return;

	// Flipping the card according to the current card degree.
	if(game.cards[id-1].children[0].style.transform == "rotateY(180deg)") {

		// Removing the card from the opened cards array.
		game.openCards = game.openCards.filter(item => item !== id);

		// Flipping the card.
		game.cards[id-1].children[0].style.transform = "rotateY(0deg)";

	} else {

		// Adding the card to the opened cards array.
		game.openCards.push(id);

		// Flipping the card.
		game.cards[id-1].children[0].style.transform = "rotateY(180deg)";

	}

	if(game.openCards.length == 2) {

		checkCards();

	}

	return 0;

}

// Instancing a function to check the open cards.
async function checkCards() {

	// Getting all opened cards.
	let firstOpenedCard = game.cards[game.openCards[0] - 1];
	let secondOpenedCard = game.cards[game.openCards[1] - 1];

	game.isOnASleepTime = true;

	// Sleeping for 1 second.
	await sleep(1000);

	game.isOnASleepTime = false;

	// Checking if the image inside the card is the same.
	if(firstOpenedCard.getAttribute("character") == secondOpenedCard.getAttribute("character")) {

		firstOpenedCard.setAttribute("isAvailable", "false");
		secondOpenedCard.setAttribute("isAvailable", "false");

		// If the images are the same, adding 1 to the current player's score.
		game.distributedPoints++;


		game.players[game.whoseTurnIsIt].score += 1;

		game.players[game.whoseTurnIsIt].domElement.children[2].children[0].children[0].innerHTML = game.players[game.whoseTurnIsIt].score;

		// Emptying the opened cards array.
		game.openCards.length = 0;

		// Checking if the game has ended.
		checkGameOver();


	} else {

		// If the images are different, flipping the cards back.
		closeCards(game.openCards[0], game.openCards[1]);
		
		game.openCards = [];

		if(game.whoseTurnIsIt == 1) {

			document.querySelector("#player-1").children[1].innerHTML = game.constants.waiting;
			game.whoseTurnIsIt = 2;
			document.querySelector("#player-2").children[1].innerHTML = game.constants.yourTurn;
			
		} else {
			
			document.querySelector("#player-2").children[1].innerHTML = game.constants.waiting;
			game.whoseTurnIsIt = 1;
			document.querySelector("#player-1").children[1].innerHTML = game.constants.yourTurn;

		}

	}

}

// Instancing a function to close a pair of cards.
function closeCards(id1, id2) {

		game.cards[id1 - 1].children[0].style.transform = "rotateY(0deg)";
		game.cards[id2 - 1].children[0].style.transform = "rotateY(0deg)";

}

// Instancing a function to play the buzzer.
function playBuzzer(song) {

	// Instancing a message to play the buzzer.
	let playbuzzermsg = new Paho.MQTT.Message(song);
			
	// Setting the topic.
	playbuzzermsg.destinationName = game.mqtt.PLAY_BUZZER;

	// Sending the instancied message to play the buzzer.
	client.send(playbuzzermsg);

}

// Instancing a function to check if the game is over.
function checkGameOver() {

	if(game.distributedPoints == 8) {

		sleep(500);

		playBuzzer("gameend");

		if(game.players[1].score > game.players[2].score) {

			alert("O jogador 1 venceu!");

		} else if(game.players[2].score > game.players[1].score) {

			alert("O jogador 2 venceu!");

		} else {

			alert("Empate!");

		}


		location.reload();


	}

}

// Setupping the game.
setupGame();

// Shuffling the game cards.
shuffle(game.matchingCards);

// Mapping the cards with the images and its matching codes.
mapCards(game.matchingCards);
