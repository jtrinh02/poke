/**
 * Name: Justin Trinh
 * Date: 11.09.2022
 * Section: CSE 154 AD
 * This is the pokedex.js page
 */
"use strict";

(function() {

  window.addEventListener("load", init);

  /**
   * Sets up event listeners for the buttons.
   */
  function init() {
    makeRequest();
  }

  /**
   * "Fetch" data from a url
   */
  function makeRequest() {
    let pokedex = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php";
    fetch(pokedex + "?pokedex=all")
      .then(statusCheck)
      .then(resp => resp.text())
      .then(processData)
      .catch(console.error); // define a user-friendly error-message function
  }

  /**
   * Step 2: Implement a function to process the data. You may want to break this apart
   *  into multiple functions.
   * @param {something} responseData - The attributes of the pokemon.
   */
  function processData(responseData) {
    // Do something with your responseData! (build DOM, display messages, etc.)
    responseData = responseData.trim().split('\n');
    for (let i = 0; i < responseData.length; i++) {
      let row = responseData[i];
      responseData[i] = row.substring(row.indexOf(":") + 1);
      populatePoke(responseData[i]);
    }
  }

  /**
   * Step 3. Include the statusCheck function
   * @param {something} res - ?????????????????????????
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /* --- CSE 154 HELPER FUNCTIONS --- */

  /**
   * Populates the pokedex view with the a sprite image of the given pokemon
   * @param {string} shortname Identifier for a specific pokemon.
   */
  function populatePoke(shortname) {
    const imgURL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/sprites/";
    let img = document.createElement('img');
    img.src = imgURL + shortname + ".png";
    img.alt = "Sprite icon of " + shortname;
    img.setAttribute("id", shortname);
    img.classList.add("sprite");
    if (shortname === "bulbasaur" || shortname === "charmander" || shortname === "squirtle") {
      found(img);
    }

    let container = id("pokedex-view");
    container.appendChild(img);
  }

  /**
   * Toggles the state of a pokemon in the pokedex to be found.
   * @param {Element} pokemon img element in the pokedex to be found.
   */
  function found(pokemon) {
    pokemon.classList.add("found");
    pokemon.addEventListener("click", () => {
      loadCard(pokemon.id);
    });
  }

  /**
   * Loads the player's card containing the pokemons information and moves.
   * @param {String} pokemon shortname
   */
  function loadCard(pokemon) {
    let pokedex = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php";
    fetch(pokedex + "?pokemon=" + pokemon)
      .then(statusCheck)
      .then(resp => resp.json())
      .then((responseData) => {
        let card = qs("#p1 .card");
        textToCard(responseData, card);
        imgsToCard(responseData, card);

        const buttons = qsa("#p1 .moves button");
        movesToCard(responseData, buttons);
        qs("#start-btn").classList.remove("hidden");
        qs("#start-btn").addEventListener("click", () => {
          makeGameRequest(pokemon);
        }, {once: true});
      })
      .catch(console.error);
  }

  /**
   * Loads the text information of the pokemon on the card.
   * @param {object} responseData with the specific pokemon information.
   * @param {element} card element to append new text to.
   */
  function textToCard(responseData, card) {
    let cardName = card.querySelector(".name");
    let h2 = document.createElement("h2");
    h2.classList.add("name");
    h2.appendChild(document.createTextNode(responseData.name));
    card.replaceChild(h2, cardName);

    let hp = card.querySelector(".hp");
    let newHP = document.createElement("span");
    newHP.appendChild(document.createTextNode(responseData.hp + "HP"));
    newHP.classList.add("hp");
    hp.parentNode.replaceChild(newHP, hp);

    let description = card.querySelector(".info");
    let newDes = document.createElement("p");
    newDes.appendChild(document.createTextNode(responseData.info.description));
    newDes.classList.add("info");
    description.parentNode.replaceChild(newDes, description);
  }

  /**
   * Loads images of the pokemon, it's weakness, and it's type.
   * @param {object} responseData with the specific pokemon information.
   * @param {element} card element to append new images to.
   */
  function imgsToCard(responseData, card) {
    let url = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/";

    let pokepic = card.querySelector("img.pokepic");
    let newPokepic = document.createElement("img");
    newPokepic.src = url + responseData.images.photo;
    newPokepic.alt = responseData.name;
    newPokepic.classList.add("pokepic");
    pokepic.parentNode.replaceChild(newPokepic, pokepic);

    let type = card.querySelector("img.type");
    let newType = document.createElement("img");
    newType.src = url + responseData.images.typeIcon;
    newType.alt = responseData.type;
    newType.classList.add("type");
    type.parentNode.replaceChild(newType, type);

    let weakness = card.querySelector("img.weakness");
    let newWeakness = document.createElement("img");
    newWeakness.src = url + responseData.images.weaknessIcon;
    newWeakness.alt = responseData.weakness;
    newWeakness.classList.add("weakness");
    weakness.parentNode.replaceChild(newWeakness, weakness);
  }

  /**
   * Loads moves of the pokemon onto the card.
   * @param {object} responseData with the specific pokemon information.
   * @param {element} movesBox four element buttons to replace.
   */
  function movesToCard(responseData, movesBox) {
    let url = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/";
    let moves = responseData.moves;
    for (let i = 0; i < movesBox.length; i++) {
      let button = movesBox[i];
      let newButton = document.createElement("button");

      // Hide the extra empty move buttons and replace old ones.
      if (i > (moves.length - 1)) {
        newButton.classList.add("hidden");
      } else {
        let data = moves[i];

        // Create the button
        newButton.disabled = true;

        // Insert the move name
        let newName = document.createElement("span");
        newName.appendChild(document.createTextNode(data.name));
        newName.classList.add("move");
        newButton.appendChild(newName);

        // Insert damage points
        let newDp = document.createElement("span");
        if (Object.hasOwn(data, "dp")) {
          newDp.appendChild(document.createTextNode(data.dp + " DP"));
        }
        newDp.classList.add("dp");
        newButton.appendChild(newDp);

        // Insert move type
        let newImg = document.createElement("img");
        newImg.src = url + "icons/" + data.type + ".jpg";
        newImg.alt = responseData.name;
        newButton.appendChild(newImg);

        // Replace placeholder button with new move
        button.parentNode.replaceChild(newButton, button);
      }
    }
  }

  /**
   * Initializes the start of a game and shows the game view to the player.
   * @param {string} shortname of the players pokemon.
   */
  function startGame() {
    for (let i = 0; i < 2; i++) {
      let elem = "p" + (i + 1); // Select #p1 or #p2 and reset values
      let bar = qs("#" + elem + " .health-bar");
      bar.style["width"] = "100%";
      bar.classList.remove("low-health");
      let results = qs("#" + elem + "-turn-results");
      let newResults = document.createElement("p");
      newResults.id = elem + "-turn-results";
      results.parentNode.replaceChild(newResults, results);
    }

    qs("#pokedex-view").classList.add("hidden");
    qs("#p2").classList.remove("hidden");
    qs("#p1 .hp-info").classList.remove("hidden");
    qs("#results-container").classList.remove("hidden");
    qs("#start-btn").classList.add("hidden");
    qs("#flee-btn").classList.remove("hidden");

    let battle = document.createElement("h1");
    battle.appendChild(document.createTextNode("Pokemon Battle!"));
    qs("h1").parentNode.replaceChild(battle, qs("h1"));
  }

  /**
   * Makes a POST request to populate the card with a pokemon to
   * battle, and reacts to players choices.
   * @param {string} shortname of the players pokemon.
   */
  function makeGameRequest(shortname) {
    const GAME_API = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/game.php";
    let data = new FormData();
    data.append("mypokemon", shortname);
    data.append("startgame", "true");

    fetch(GAME_API, {method: "POST", body: data})
      .then(statusCheck)
      .then(resp => resp.json())
      .then((responseData) => {
        // First load data
        let card = qs("#p2 .card");
        textToCard(responseData.p2, card);
        imgsToCard(responseData.p2, card);
        const buttons = qsa("#p2 .moves button");
        movesToCard(responseData.p2, buttons);

        // Make player 1's buttons interactable with the game
        enableButtons(responseData);
        startGame();
      })
      .catch(console.error);

  }

  /**
   * Enables ONLY the VISIBLE buttons WITHOUT the "hidden" class to be used in the game.
   * @param {element} responseData containting game info to send if a button is clicked.
   */
  function enableButtons(responseData) {
    // Flee button case
    let flee = qs("#flee-btn");
    flee.disabled = false;
    flee.addEventListener("click", () => {
      requestMove(responseData.pid, responseData.guid, "flee", flee);
    }, {once: true});

    let buttons = qsa("#p1 .moves button");
    let moves = responseData.p1["moves"];
    for (let i = 0; i < buttons.length; i++) {
      let button = buttons[i];
      let movename = button.querySelector(".move").textContent;
      if (i < moves.length) {
        button.disabled = false;
        button.addEventListener("click", () => {
          requestMove(responseData.pid, responseData.guid, movename, button);
        });
      }
    }
  }

  /**
   * Make a POST request to update the state of the game after a move is chosen.
   * @param {String} pid for player identification.
   * @param {String} guid for game identification.
   * @param {String} movename for move identification.
   * @param {Element} button containing the move
   */
  function requestMove(pid, guid, movename, button) {
    qs("#loading").classList.remove("hidden");
    const GAME_API = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/game.php";
    let data = new FormData();
    data.append("guid", guid);
    data.append("pid", pid);
    data.append("movename", movename);

    fetch(GAME_API, {method: "POST", body: data})
      .then(statusCheck)
      .then(resp => resp.json())
      .then(updateGame)
      .catch(console.error);
  }

  /**
   * Updates the state of the game after both players have moved.
   * @param {Object} responseData game results of a move chosen.
   */
  function updateGame(responseData) {
    updateHp(responseData);
    updateResults(responseData);

    if ((responseData.p1["current-hp"] === 0) ||
    (responseData.p2["current-hp"] === 0) ||
    (responseData.results["p1-move"] === "flee")) {
      endGame(responseData);
    }

    qs("#loading").classList.add("hidden"); // Dissapear loading animation
  }

  /**
   * Updates the pokemon HP and state of the game after both players have moved.
   * @param {Object} responseData game results of a move chosen.
   */
  function updateHp(responseData) {
    const FULL = 100;
    const lowHealthThresh = 20;

    const two = [responseData.p1, responseData.p2];
    for (let i = 0; i < two.length; i++) {
      let data = two[i];
      let card;
      if (i < 1) {
        card = "#p1";
      } else {
        card = "#p2";
      }

      let currentHp = data["current-hp"];
      let hp = data["hp"];
      let percentage = Math.trunc(FULL * (currentHp / hp));
      let percentageS = Math.trunc(percentage) + "%";
      let healthBar = qs(card + " .health-bar");
      healthBar.style["width"] = percentageS;
      if (percentage < lowHealthThresh) {
        healthBar.classList.add("low-health");
      }

      let oldHpText = qs(card + " .card .hp");
      let hpText = document.createElement("span");
      hpText.classList.add("hp");
      hpText.appendChild(document.createTextNode(data["current-hp"] + "HP"));
      oldHpText.parentNode.replaceChild(hpText, oldHpText);
    }
  }

  /**
   * Updates the results box with a message of the move and the response.
   * @param {Object} responseData containing the POST data of the results of a turn.
   */
  function updateResults(responseData) {
    let container = id("results-container");

    let p1 = id("p1-turn-results");
    let p2 = id("p2-turn-results");
    let resultOne = document.createElement("p");
    let resultTwo = document.createElement("p");
    let message1 = "Player 1 played " + responseData.results["p1-move"] + " and " +
    responseData.results["p1-result"] + "!";
    let message2 = "Player 2 played " + responseData.results["p2-move"] + " and " +
    responseData.results["p2-result"] + "!";
    resultOne.appendChild(document.createTextNode(message1));
    resultTwo.appendChild(document.createTextNode(message2));
    resultOne.id = "p1-turn-results";
    resultTwo.id = "p2-turn-results";

    container.replaceChild(resultOne, p1);
    if ((responseData.p2["current-hp"] === 0) ||
    (responseData.results["p1-move"] === "flee")) {
      p2.classList.add("hidden");
    } else {
      container.replaceChild(resultTwo, p2);
    }
    p2.classList.add("hidden");
  }

  /**
   * End the game, allowing the user to go back to main.
   * Two cases: End by KO, or by flee
   * @param {Object} responseData results of the game
   */
  function endGame(responseData) {
    let btns = [];
    let moves = qsa("#p1 .moves button");
    for (let i = 0; i < moves; i++) {
      btns.push(moves[i]);
    }
    btns.push(qs("#flee-btn"));
    for (let i = 0; i < btns.length; i++) {
      let btn = btns[i];
      let newBtn = btn.cloneNode(true);
      newBtn.disabled = true;
      btn.parentNode.replaceChild(newBtn, btn);
    }

    // Allow the user to click the back button to pokedex
    qs("#endgame").classList.remove("hidden");
    qs("#endgame").addEventListener("click", () => {
      back(responseData.p1.shortname);
    }, {once: true});
    let newFlee = qs("#flee-btn").cloneNode(true);
    newFlee.classList.add("hidden");
    qs("#flee-btn").parentNode.replaceChild(newFlee, qs("#flee-btn"));

    let heading = qs("h1");
    let newH1 = document.createElement("h1");
    let string;
    if (responseData.p1["current-hp"] === 0) {
      string = "You lost!";
    } else if (responseData.p2["current-hp"] === 0) {
      string = "You won!";
      let poke = qs("#pokedex-view #" + responseData.p2["shortname"]);
      if (!poke.classList.contains("sprite found")) {
        found(poke);
      }
    }
    newH1.appendChild(document.createTextNode(string));
    heading.parentNode.replaceChild(newH1, heading);
  }

  /**
   * Clicking the "Back to Pokedex" button triggers this.
   * Toggles on the pokedex view.
   * @param {String} shortname of the most recently chose pokemon.
   */
  function back(shortname) {
    loadCard(shortname);
    qs("#endgame").classList.add("hidden");
    qs("#results-container").classList.add("hidden");
    qs("#p2").classList.add("hidden");
    qs("#p1 .hp-info").classList.add("hidden");
    qs("#pokedex-view").classList.remove("hidden");
    qs("#start-btn").classList.remove("hidden");

    let h1 = qs("h1");
    let newH1 = document.createElement("h1");
    newH1.appendChild(document.createTextNode("Your Pokedex"));
    h1.parentNode.replaceChild(newH1, h1);
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} selector - CSS query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }
})();