// Instancing mqtt server info.
const MQTT_HOST = "broker.hivemq.com";
const MQTT_PORT = 8000;
const MQTT_CLIENT_ID = "558391cc-cecc-4d70-bd1d-731d17e7f7cf";
const MQTT_TOPIC_KEY_PRESSED = "JogoDaMemoria/TeclaPressionada";
const MQTT_TOPIC_PLAY_BUZZER = "JogoDaMemoria/TocarBuzzer";

// Mapping keys with cards.
const keyMap = {

	"A": 1,
	"B": 2,
	"C": 3,
	"D": 4,
	"E": 5,
	"F": 6,
	"G": 7,
	"H": 8,
	"I": 9,
	"J": 10,
	"K": 11,
	"L": 12,
	"M": 13,
	"N": 14,
	"O": 15,
	"P": 16,

}

// Instancing the current player.
let currentPlayer = "player1";

// Storing the player's scores.
const playerScores = {

	player1: [document.querySelector("#player1-score"), 0],
	player2: [document.querySelector("#player2-score"), 0],

}

// Checking if the game is on a sleep time.
let isBlocked = false;

// Creating a client instance.
let client = new Paho.MQTT.Client(MQTT_HOST, MQTT_PORT, MQTT_CLIENT_ID);

// Setting up callback handlers. 
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// Connecting to the server.
client.connect({

	onSuccess: onConnect

});

// Instancing a function to be called when the client connects.
function onConnect() {

	// Subscribe to the target topic.
	client.subscribe(MQTT_TOPIC_KEY_PRESSED);

}

// Instancing a function to be called when the client disconnects.
function onConnectionLost(responseObject) {

	// If connection lost, logging the error.
	if (responseObject.errorCode !== 0) {

	  console.log("⚠️ Conexão mqtt interrompida!");
	  console.error(responseObject.errorMessage);

	}

}

// Instancing a function to be called when a message arrives.
function onMessageArrived(message) {

	
	// When receiving a message from the target topic, flipping the card.
	if(message.destinationName == MQTT_TOPIC_KEY_PRESSED) {

		flipCard(keyMap[message.payloadString]);

	}

}

// Getting all cards.
let cards = document.querySelectorAll('.card');

let distributedPoints = 0;

// Storing all opened cards.
let openedCards = [];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function playBuzzer(song) {

	// Instancing a message to play the buzzer.
	let playbuzzermsg = new Paho.MQTT.Message(song);
			
	// Setting the topic.
	playbuzzermsg.destinationName = MQTT_TOPIC_PLAY_BUZZER;

	// Sending the instancied message to play the buzzer.
	client.send(playbuzzermsg);

}

function checkGameEnd() {

	if(distributedPoints == 8) {

		sleep(500);

		playBuzzer("gameend");

		if(playerScores["player1"][1] > playerScores["player2"][1]) {

			alert("O jogador 1 venceu!");

		} else if(playerScores["player2"][1] > playerScores["player1"][1]) {

			alert("O jogador 2 venceu!");

		} else {

			alert("Empate!");

		}


		location.reload();


	}

}


// Checking the opened cards.
async function checkCards() {

	// Getting all opened cards.
	let firstOpenedCard = cards[openedCards[0] - 1];
	let secondOpenedCard = cards[openedCards[1] - 1];

	isBlocked = true;

	// Sleeping for 1 second.
	await sleep(1000);

	isBlocked = false;

	// Checking if the image inside the card is the same.
	if(firstOpenedCard.getAttribute("character") == secondOpenedCard.getAttribute("character")) {

		firstOpenedCard.setAttribute("isAvailable", "false");
		secondOpenedCard.setAttribute("isAvailable", "false");

		// If the images are the same, adding 1 to the current player's score.
		distributedPoints++;
		playerScores[currentPlayer][1] += 1;
		playerScores[currentPlayer][0].innerHTML = playerScores[currentPlayer][1];
		openedCards = [];
		checkGameEnd();


	} else {

		// If the images are different, flipping the cards back.
		closeCards(openedCards[0], openedCards[1]);
		
		openedCards = [];

		if(currentPlayer == "player1") {

			document.querySelector("#player-1").children[1].innerHTML = "Aguarde...";
			currentPlayer = "player2";
			document.querySelector("#player-2").children[1].innerHTML = "Sua vez";
			
		} else {
			
			document.querySelector("#player-2").children[1].innerHTML = "Aguarde...";
			currentPlayer = "player1";
			document.querySelector("#player-1").children[1].innerHTML = "Sua vez";

		}

	}

}

function closeCards(id1, id2) {

		cards[id1 - 1].children[0].style.transform = "rotateY(0deg)";
		cards[id2 - 1].children[0].style.transform = "rotateY(0deg)";

}

// Flipping card.
function flipCard(id) {

	if(isBlocked) return;

	if(cards[id - 1].getAttribute("isAvailable") == "false") return;

	// Flipping the card according to the current card degree.
	if(cards[id-1].children[0].style.transform == "rotateY(180deg)") {

		// Removing the card from the opened cards array.
		openedCards = openedCards.filter(item => item !== id);

		// Flipping the card.
		cards[id-1].children[0].style.transform = "rotateY(0deg)";

	} else {

		// Adding the card to the opened cards array.
		openedCards.push(id);

		// Flipping the card.
		cards[id-1].children[0].style.transform = "rotateY(180deg)";

	}

	if(openedCards.length == 2) {

		checkCards();

	}

	return 0;

}

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


// Matching cards.
let matchingCards = [
	{

		imagePath: "assets/imgs/Character-1.png",
		positions: [1,16],
	
	},
	{

		imagePath: "assets/imgs/Character-2.png",
		positions: [2,15],
	
	},
	{

		imagePath: "assets/imgs/Character-3.png",
		positions: [3,14],
	
	},
	{

		imagePath: "assets/imgs/Character-4.png",
		positions: [4,13],
	
	},
	{

		imagePath: "assets/imgs/Character-5.png",
		positions: [5,12],
	
	},
	{

		imagePath: "assets/imgs/Character-6.png",
		positions: [6,11],
	
	},
	{

		imagePath: "assets/imgs/Character-7.png",
		positions: [7,10],
	
	},
	{

		imagePath: "assets/imgs/Character-8.png",
		positions: [8,9],
	
	}
]

shuffle(matchingCards);


// Mapping the cards with the images and its matching codes.
for(let i = 0; i < (cards.length); i++) {

	if(i < 8) {

		for(let j = 0; j < matchingCards[i].positions.length; j++) {
		
			cards[matchingCards[i].positions[0]-1].children[0].children[1].children[0].src = matchingCards[i].imagePath;
			cards[matchingCards[i].positions[0]-1].setAttribute('character', matchingCards[i].positions[0]);
			cards[matchingCards[i].positions[1]-1].children[0].children[1].children[0].src = matchingCards[i].imagePath;
			cards[matchingCards[i].positions[1]-1].setAttribute('character', matchingCards[i].positions[0]);

		}
		

	}

} 