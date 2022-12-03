// Defining game attributes.
const game = {
  // Defining the game cards.
  cards: document.querySelectorAll(".card"),

  // Defining game cards data.
  matchingCards: [
    {
      imagePath: "assets/imgs/Character-1.png",
      positions: [0, 0],
    },
    {
      imagePath: "assets/imgs/Character-2.png",
      positions: [0, 0],
    },
    {
      imagePath: "assets/imgs/Character-3.png",
      positions: [0, 0],
    },
    {
      imagePath: "assets/imgs/Character-4.png",
      positions: [0, 0],
    },
    {
      imagePath: "assets/imgs/Character-5.png",
      positions: [0, 0],
    },
    {
      imagePath: "assets/imgs/Character-6.png",
      positions: [0, 0],
    },
    {
      imagePath: "assets/imgs/Character-7.png",
      positions: [0, 0],
    },
    {
      imagePath: "assets/imgs/Character-8.png",
      positions: [0, 0],
    },
  ],

  // Defining game players.
  players: {
    // Defining player 1.
    1: {
      score: 0, // Player 1 score.
      name: window.prompt("Type the name of the first player:"), // Player 1 name.
      domElement: document.querySelector("#player-1"), // Player 1 DOM element.
    },

    // Defining player 2.
    2: {
      score: 0, // Player 2 score.
      name: window.prompt("Type the name of the second player:"), // Player 2 name.
      domElement: document.querySelector("#player-2"), // Player 2 DOM element.
    },
  },

  // Defining game MQTT connection attributes and topics.
  mqtt: {
    HOST: "broker.hivemq.com", // MQTT broker host.
    PORT: 8000, // MQTT broker port.
    CLIENT_ID: "558391cc-cecc-4d70-bd1d-731d17e7f7cf", // MQTT client ID.
    KEY_PRESSED: "JogoDaMemoria/TeclaPressionada", // Topic to receive the pressed key from the keypad.
    PLAY_BUZZER: "JogoDaMemoria/TocarBuzzer", // Topic to send the play buzzer message.
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
};

// Creating an MQTT client instance.
let client = new Paho.MQTT.Client(
  game.mqtt.HOST,
  game.mqtt.PORT,
  game.mqtt.CLIENT_ID
);

// Instancing a function to be called when the game needs a sleep time.
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  if (message.destinationName == game.mqtt.KEY_PRESSED) {
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
  const onConnectHandler = { onSuccess: onConnect };

  // Connecting to the server.
  client.connect(onConnectHandler);

  // Setting up the game title.
  document.querySelector("#title").innerHTML = game.constants.title;

  // Setting up the game's players and their scores.
  for (let player in game.players) {
    // Setting up the player's name.
    game.players[player].domElement.children[0].innerHTML =
      game.players[player].name;

    // Setting up the player's score.
    game.players[
      player
    ].domElement.children[2].children[0].children[0].innerHTML =
      game.players[player].score;

    // Setting up the player's turn message.
    if (player == game.whoseTurnIsIt) {
      game.players[player].domElement.children[1].innerHTML =
        game.constants.yourTurn;
    } else {
      game.players[player].domElement.children[1].innerHTML =
        game.constants.waiting;
    }
  }
}

// Instancing a function to shuffle the cards.
function shuffle(matchingCards) {
  // Instancing a variable to store the quantity of shuffled cards.
  let quantityOfShuffledImages = 0;

  // Instancing a variable to store the unavauilable positions.
  let unavailablePositions = [];

  // While the quantity of shuffled images is less than the quantity of images.
  while (quantityOfShuffledImages != 8) {
    // Instancing a variable to store the quantity of generated random numbers.
    let quantityOfGeneratedRandomNumbers = 0;

    // While the quantity of generated random numbers is less than a pair of cards.
    while (quantityOfGeneratedRandomNumbers != 2) {
      // Instancing a variable to store the generated random number.
      let generatedNumber = Math.floor(Math.random() * 16) + 1;

      // If the generated random number is not in the unavailable positions array.
      if (!unavailablePositions.includes(generatedNumber)) {
        // Adding the generated random number to the unavailable positions array.
        unavailablePositions.push(generatedNumber);

        // Adding the quantity of generated random numbers by one.
        quantityOfGeneratedRandomNumbers++;

        // Setting the card position to the generated random number.
        matchingCards[quantityOfShuffledImages].positions[
          quantityOfGeneratedRandomNumbers - 1
        ] = generatedNumber;
      }
    }

    // Adding the quantity of shuffled images by one.
    quantityOfShuffledImages++;
  }
}

// Instancing a function to map the cards.
function mapCards(matchingCards) {
  // Instancing a variable to store the quantity of mapped cards.
  let quantityOfPairOfCardsMapped = 0;

  // While the quantity of pair of cards mapped is less than the quantity of pair of cards...
  while (quantityOfPairOfCardsMapped != 8) {
    // Instancing a variable to store the quantity of cards of the pair mapped.
    let quantityOfCardsOfThePairMapped = 0;

    // Mapping the pair of cards...
    while (quantityOfCardsOfThePairMapped != 2) {
      // Instancing a variable to store the target card.
      let card =
        game.cards[
          matchingCards[quantityOfPairOfCardsMapped].positions[
            quantityOfCardsOfThePairMapped
          ] - 1
        ];

      // Setting the card's image.
      card.children[0].children[1].children[0].src =
        matchingCards[quantityOfPairOfCardsMapped].imagePath;

      // Setting the card's character id.
      card.setAttribute("character", quantityOfPairOfCardsMapped);

      // Adding the quantity of cards of the pair mapped by one.
      quantityOfCardsOfThePairMapped++;
    }

    // Adding the quantity of pair of cards mapped by one.
    quantityOfPairOfCardsMapped++;
  }
}

// Instancing a function to flip a card.
function flipCard(card) {
  // Defining the card to be flipped.
  let cardToFlip = game.cards[card - 1];

  // If the game is on a sleep time return.
  if (game.isOnASleepTime) return;

  // If the card is already flipped return.
  if (cardToFlip.getAttribute("isAvailable") == "false") return;

  // Flipping the card according to the current card degree.
  if (cardToFlip.children[0].style.transform == "rotateY(180deg)") {
    // If the card is already flipped, alerting a message.
    window.alert("👀 You can't flip the same card twice!");
  } else {
    // Adding the card to the opened cards array.
    game.openCards.push(card);

    // Flipping the card.
    cardToFlip.children[0].style.transform = "rotateY(180deg)";
  }

  // If the quantity of opened cards is equal to two...
  if (game.openCards.length == 2) {
    // Checking cards.
    checkCards();
  }
}

// Instancing a function to check the open cards.
async function checkCards() {
  // Getting all opened cards.
  let firstOpenedCard = game.cards[game.openCards[0] - 1];
  let secondOpenedCard = game.cards[game.openCards[1] - 1];

  // Setting the game to be on a sleep time to avoid the user to flip more than two cards.
  game.isOnASleepTime = true;

  // Sleeping for 1 second.
  await sleep(1000);

  // Setting the game to be not on a sleep time.
  game.isOnASleepTime = false;

  // Checking if the image inside the card is the same.
  if (
    firstOpenedCard.getAttribute("character") ==
    secondOpenedCard.getAttribute("character")
  ) {
    // Adding the quantity of distributed points by one.
    game.distributedPoints++;

    // Setting the cards to be unavailable.
    firstOpenedCard.setAttribute("isAvailable", "false");
    secondOpenedCard.setAttribute("isAvailable", "false");

    // Adding the score of the player by one.
    game.players[game.whoseTurnIsIt].score += 1;
    game.players[
      game.whoseTurnIsIt
    ].domElement.children[2].children[0].children[0].innerHTML =
      game.players[game.whoseTurnIsIt].score;

    // Emptying the open cards array.
    game.openCards.length = 0;

    // Checking if the game has ended.
    checkGameOver();
  } else {
    // If the images are different, flipping the cards back.
    closeCards(game.openCards[0], game.openCards[1]);

    // Emptying the open cards array.
    game.openCards = [];

    // Changing the turn.
    changeTurn();
  }
}

// Instancing a function to close a pair of cards.
function closeCards(firstCard, secondCard) {
  // Closing the cards.
  game.cards[firstCard - 1].children[0].style.transform = "rotateY(0deg)";
  game.cards[secondCard - 1].children[0].style.transform = "rotateY(0deg)";
}

// Instancing a function to change the turn.
function changeTurn() {
  // If the current turn is the first player's turn...
  if (game.whoseTurnIsIt == 1) {
    // Setting the current turn to be the second player's turn.
    document.querySelector("#player-1").children[1].innerHTML =
      game.constants.waiting;
    game.whoseTurnIsIt = 2;
    document.querySelector("#player-2").children[1].innerHTML =
      game.constants.yourTurn;
  } else {
    // Setting the current turn to be the first player's turn.
    document.querySelector("#player-2").children[1].innerHTML =
      game.constants.waiting;
    game.whoseTurnIsIt = 1;
    document.querySelector("#player-1").children[1].innerHTML =
      game.constants.yourTurn;
  }
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
async function checkGameOver() {
  // If the quantity of distributed points is equal to eight...
  if (game.distributedPoints == 8) {
    // Sleeping for 1 second.
    await sleep(500);

    // Playing the buzzer.
    playBuzzer("gameover");

    // If the first player's score is greater than the second player's score...
    if (game.players[1].score > game.players[2].score) {
      // Alerting the first player's victory.
      alert(`🎉 Congratulations ${game.players[1].name}! You won the game!`);
    } else if (game.players[2].score > game.players[1].score) {
      // Alerting the second player's victory.
      alert(`🎉 Congratulations ${game.players[2].name}! You won the game!`);
    } else {
      // Alerting a draw.
      alert("🤝 It's a tie!");
    }

    // Reloading the page.
    location.reload();
  }
}

// Setupping the game.
setupGame();

// Shuffling the game cards.
shuffle(game.matchingCards);

// Mapping the cards with the images and its matching codes.
mapCards(game.matchingCards);
