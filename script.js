// Select elements
const nameInput = document.getElementById("nameInput");
const initiativeInput = document.getElementById("initiativeInput");
const addButton = document.getElementById("addButton");
const initiativeList = document.getElementById("initiativeList");
const hpCards = document.getElementById("hp-cards");
const savePartyButton = document.getElementById("save-party");
const loadPartyButton = document.getElementById("load-party");
const addMonsterButton = document.getElementById("add-monster");
const clearAllButton = document.getElementById("clear-all");

// Array to hold character data
let characters = [];

// Load saved party from localStorage if available
function loadSavedParty() {
  const savedParty = localStorage.getItem("savedParty");
  if (savedParty) {
    return JSON.parse(savedParty);
  }
  return [];
}

// Save current party characters to localStorage
function saveCurrentParty() {
  // Only save player characters, not monsters
  const playersOnly = characters.filter((char) => !char.isMonster);
  if (playersOnly.length > 0) {
    localStorage.setItem("savedParty", JSON.stringify(playersOnly));
    alert("Party saved successfully!");
  } else {
    alert("No player characters to save!");
  }
}

// Add character to the list with initiative
addButton.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const initiative = parseInt(initiativeInput.value, 10);

  if (!name || isNaN(initiative)) {
    alert("Please provide both a name and an initiative value.");
    return;
  }

  // Check if the character already exists
  const existingCharIndex = characters.findIndex((char) => char.name === name);

  if (existingCharIndex !== -1) {
    // Update initiative for an existing character
    characters[existingCharIndex].initiative = initiative;

    // Update the initiative on the character's HP card
    updateCardInitiative(name, initiative);
  } else {
    // Add a new character
    alert("Character not found. Add an HP card for this character first.");
    return;
  }

  // Clear inputs
  nameInput.value = "";
  initiativeInput.value = "";

  // Sort and display characters
  updateInitiativeList();
});

// Update initiative on a character's HP card
function updateCardInitiative(name, initiative) {
  const cards = document.querySelectorAll(".card");

  for (const card of cards) {
    const cardName = card.querySelector("h4").textContent;
    if (cardName === name) {
      // Create or update initiative display
      let initiativeDisplay = card.querySelector(".initiative-display");

      if (!initiativeDisplay) {
        initiativeDisplay = document.createElement("div");
        initiativeDisplay.className = "initiative-display";
        card.insertBefore(initiativeDisplay, card.querySelector(".hp-label"));
      }

      initiativeDisplay.textContent = `Initiative: ${initiative}`;
      return true;
    }
  }

  return false;
}

// Update and render the initiative list
function updateInitiativeList() {
  // Sort characters by initiative (descending)
  characters.sort((a, b) => b.initiative - a.initiative);

  // Clear the list
  initiativeList.innerHTML = "";

  // Add sorted characters to the list
  characters.forEach((char, index) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <span>${char.name} (${char.initiative})</span>
      <button onclick="removeCharacter(${index})">Remove</button>
    `;
    initiativeList.appendChild(listItem);
  });

  // Reorder HP cards based on initiative
  reorderHPCards();
}

// Reorder HP cards to match initiative order
function reorderHPCards() {
  const cardContainer = document.getElementById("hp-cards");

  // Create a new ordered container
  const orderedContainer = document.createElement("div");
  orderedContainer.id = "hp-cards";
  orderedContainer.className = cardContainer.className;

  // Add cards in initiative order
  characters.forEach((char) => {
    const cards = document.querySelectorAll(".card");
    for (const card of cards) {
      const cardName = card.querySelector("h4").textContent;
      if (cardName === char.name) {
        orderedContainer.appendChild(card.cloneNode(true));
        break;
      }
    }
  });

  // Replace old container with new ordered one
  cardContainer.parentNode.replaceChild(orderedContainer, cardContainer);

  // Reattach event listeners
  attachCardEventListeners();
}

// Attach event listeners to all HP card buttons
function attachCardEventListeners() {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    // Damage button
    const decrementButton = card.querySelector(".damage");
    if (decrementButton) {
      const hpInput = card.querySelector("input[type='number']");
      decrementButton.addEventListener("click", () =>
        updateHP(card, -parseInt(hpInput.value || 1, 10))
      );
    }

    // Heal button
    const incrementButton = card.querySelector(".heal");
    if (incrementButton) {
      const hpInput = card.querySelector("input[type='number']");
      incrementButton.addEventListener("click", () =>
        updateHP(card, parseInt(hpInput.value || 1, 10))
      );
    }

    // Max HP button
    const maxButton = card.querySelector(".max-hp");
    if (maxButton) {
      maxButton.addEventListener("click", () => updateToMaxHP(card));
    }

    // Temp HP button
    const tempButton = card.querySelector(".temp-hp");
    if (tempButton) {
      const tempInput = card.querySelector("input[placeholder='Temp']");
      tempButton.addEventListener("click", () =>
        addTempHP(card, parseInt(tempInput.value || 0, 10))
      );
    }

    // Edit button
    const editButton = card.querySelector(".edit-hp");
    if (editButton) {
      editButton.addEventListener("click", () => editMaxHP(card));
    }
  });
}

// Remove a character from the list and remove their card
function removeCharacter(index) {
  const characterName = characters[index].name;

  // Remove from characters array
  characters.splice(index, 1);

  // Remove their HP card if it exists
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    const cardName = card.querySelector("h4").textContent;
    if (cardName === characterName) {
      card.remove();
    }
  });

  updateInitiativeList();
}

// Add a new player character HP card
document.getElementById("add-player").addEventListener("click", () => {
  createNewCard(false);
});

// Add a new monster HP card
document.getElementById("add-monster").addEventListener("click", () => {
  createNewCard(true);
});

// Create a new HP card (shared function for both players and monsters)
function createNewCard(isMonster) {
  const container = document.getElementById("hp-cards");

  const card = document.createElement("div");
  card.className = isMonster ? "card monster-card" : "card player-card";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = isMonster ? "Monster Name" : "Player Name";

  const hpInput = document.createElement("input");
  hpInput.type = "number";
  hpInput.placeholder = "Max HP";

  const addButton = document.createElement("button");
  addButton.textContent = "Set HP";
  addButton.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const maxHp = parseInt(hpInput.value, 10);

    if (name && !isNaN(maxHp)) {
      // Check if this name already exists
      if (characters.some((char) => char.name === name)) {
        alert("Character with this name already exists!");
        return;
      }

      // Add to characters array without initiative yet
      characters.push({
        name: name,
        maxHp: maxHp,
        currentHp: maxHp,
        initiative: 0, // Default initiative
        isMonster: isMonster,
      });

      card.innerHTML = ""; // Clear initial inputs
      createHealthCard(card, name, maxHp, isMonster);

      // If it's a monster, prompt for initiative immediately
      if (isMonster) {
        const monsterInitiative = prompt(`Enter initiative for ${name}:`, "10");
        if (monsterInitiative !== null) {
          const initiative = parseInt(monsterInitiative, 10);
          if (!isNaN(initiative)) {
            // Find the character and update initiative
            const charIndex = characters.findIndex(
              (char) => char.name === name
            );
            if (charIndex !== -1) {
              characters[charIndex].initiative = initiative;
              updateCardInitiative(name, initiative);
              updateInitiativeList();
            }
          }
        }
      }
    }
  });

  card.appendChild(nameInput);
  card.appendChild(hpInput);
  card.appendChild(addButton);

  container.appendChild(card);
}

// Create a health tracker card with all controls
function createHealthCard(card, name, maxHp, isMonster = false) {
  card.dataset.maxHp = maxHp;
  card.dataset.currentHp = maxHp;
  card.className = isMonster ? "card monster-card" : "card player-card";

  const nameLabel = document.createElement("h4");
  nameLabel.textContent = name;

  const hpLabel = document.createElement("span");
  hpLabel.textContent = `HP: ${maxHp}/${maxHp}`;
  hpLabel.className = "hp-label";

  const adjustContainer = document.createElement("div");
  adjustContainer.style.marginTop = "10px";

  const decrementButton = document.createElement("button");
  decrementButton.textContent = "-";
  decrementButton.className = "damage";
  decrementButton.addEventListener("click", () =>
    updateHP(card, -parseInt(hpInput.value || 1, 10))
  );

  const incrementButton = document.createElement("button");
  incrementButton.textContent = "+";
  incrementButton.className = "heal";
  incrementButton.addEventListener("click", () =>
    updateHP(card, parseInt(hpInput.value || 1, 10))
  );

  const hpInput = document.createElement("input");
  hpInput.type = "number";
  hpInput.value = 1;
  hpInput.min = 1;
  hpInput.style.width = "50px";
  hpInput.style.textAlign = "center";

  adjustContainer.appendChild(decrementButton);
  adjustContainer.appendChild(hpInput);
  adjustContainer.appendChild(incrementButton);

  const extraContainer = document.createElement("div");
  extraContainer.style.marginTop = "10px";

  const maxButton = document.createElement("button");
  maxButton.textContent = "Max";
  maxButton.className = "max-hp";
  maxButton.addEventListener("click", () => updateToMaxHP(card));

  const tempButton = document.createElement("button");
  tempButton.textContent = "Temp";
  tempButton.className = "temp-hp";
  tempButton.addEventListener("click", () =>
    addTempHP(card, parseInt(tempInput.value || 0, 10))
  );

  const tempInput = document.createElement("input");
  tempInput.type = "number";
  tempInput.value = 0;
  tempInput.min = 0;
  tempInput.placeholder = "Temp";
  tempInput.style.width = "50px";
  tempInput.style.textAlign = "center";

  extraContainer.appendChild(maxButton);
  extraContainer.appendChild(tempInput);
  extraContainer.appendChild(tempButton);

  // Add edit max HP button
  const editContainer = document.createElement("div");
  editContainer.style.marginTop = "10px";

  const editButton = document.createElement("button");
  editButton.textContent = "Edit Max HP";
  editButton.className = "edit-hp";
  editButton.addEventListener("click", () => editMaxHP(card));

  editContainer.appendChild(editButton);

  card.appendChild(nameLabel);
  card.appendChild(hpLabel);
  card.appendChild(adjustContainer);
  card.appendChild(extraContainer);
  card.appendChild(editContainer);
}

// Edit max HP function
function editMaxHP(card) {
  const name = card.querySelector("h4").textContent;
  const currentMaxHP = parseInt(card.dataset.maxHp, 10);
  const currentHP = parseInt(card.dataset.currentHp, 10);

  // Prompt for new max HP
  const newMaxHPStr = prompt(
    `Edit max HP for ${name} (current: ${currentMaxHP}):`,
    currentMaxHP
  );

  if (newMaxHPStr === null) {
    return; // User cancelled
  }

  const newMaxHP = parseInt(newMaxHPStr, 10);

  if (isNaN(newMaxHP) || newMaxHP <= 0) {
    alert("Please enter a valid number greater than 0");
    return;
  }

  // Update the character's max HP
  card.dataset.maxHp = newMaxHP;

  // Find character in array and update
  const charIndex = characters.findIndex((char) => char.name === name);
  if (charIndex !== -1) {
    characters[charIndex].maxHp = newMaxHP;

    // Ask if current HP should also be updated
    if (confirm("Do you want to update current HP to the new maximum?")) {
      characters[charIndex].currentHp = newMaxHP;
      card.dataset.currentHp = newMaxHP;
    } else {
      // Keep current HP if it's valid, otherwise set to new max
      if (currentHP > newMaxHP) {
        characters[charIndex].currentHp = newMaxHP;
        card.dataset.currentHp = newMaxHP;
      }
    }
  }

  // Update the display
  const hpLabel = card.querySelector(".hp-label");
  hpLabel.textContent = `HP: ${card.dataset.currentHp}/${newMaxHP}`;
}

// Existing function: Update health points
function updateHP(card, change) {
  const hpLabel = card.querySelector(".hp-label");
  const currentHp = parseInt(card.dataset.currentHp, 10);
  const maxHp = parseInt(card.dataset.maxHp, 10);

  const newHp = Math.max(0, Math.min(currentHp + change, maxHp));
  card.dataset.currentHp = newHp;

  hpLabel.textContent = `HP: ${newHp}/${maxHp}`;

  // Update the character in the array too
  const name = card.querySelector("h4").textContent;
  const charIndex = characters.findIndex((char) => char.name === name);
  if (charIndex !== -1) {
    characters[charIndex].currentHp = newHp;
  }
}

// Update current HP to Max HP
function updateToMaxHP(card) {
  const maxHp = parseInt(card.dataset.maxHp, 10);
  card.dataset.currentHp = maxHp;

  const hpLabel = card.querySelector(".hp-label");
  hpLabel.textContent = `HP: ${maxHp}/${maxHp}`;

  // Update the character in the array too
  const name = card.querySelector("h4").textContent;
  const charIndex = characters.findIndex((char) => char.name === name);
  if (charIndex !== -1) {
    characters[charIndex].currentHp = maxHp;
  }
}

// Add Temporary HP
function addTempHP(card, tempHp) {
  if (!isNaN(tempHp) && tempHp > 0) {
    const currentHp = parseInt(card.dataset.currentHp, 10);
    const maxHp = parseInt(card.dataset.maxHp, 10);

    const newHp = currentHp + tempHp; // Temp HP can exceed maxHp
    card.dataset.currentHp = newHp;

    const hpLabel = card.querySelector(".hp-label");
    hpLabel.textContent = `HP: ${newHp}/${maxHp}`;

    // Update the character in the array too
    const name = card.querySelector("h4").textContent;
    const charIndex = characters.findIndex((char) => char.name === name);
    if (charIndex !== -1) {
      characters[charIndex].currentHp = newHp;
    }
  }
}

// Save current party
savePartyButton.addEventListener("click", saveCurrentParty);

// Load saved party
loadPartyButton.addEventListener("click", () => {
  const savedParty = loadSavedParty();

  if (savedParty.length === 0) {
    alert("No saved party found!");
    return;
  }

  // Ask if they want to clear current characters first
  if (characters.length > 0) {
    if (
      !confirm("Load saved party? This will add to your current characters.")
    ) {
      return;
    }
  }

  // Add saved characters
  savedParty.forEach((char) => {
    // Check if character already exists
    if (!characters.some((c) => c.name === char.name)) {
      characters.push(char);

      // Create HP card
      const container = document.getElementById("hp-cards");
      const card = document.createElement("div");
      createHealthCard(card, char.name, char.maxHp, char.isMonster);
      container.appendChild(card);

      // Add initiative if available
      if (char.initiative) {
        updateCardInitiative(char.name, char.initiative);
      }
    }
  });

  updateInitiativeList();
  alert("Party loaded successfully!");
});

// Clear all characters and cards
clearAllButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all characters?")) {
    characters = [];
    hpCards.innerHTML = "";
    updateInitiativeList();
  }
});

// Initialize any saved characters on page load
document.addEventListener("DOMContentLoaded", () => {
  // Note: We don't auto-load saved characters on page load,
  // users need to click the Load Party button explicitly
});
