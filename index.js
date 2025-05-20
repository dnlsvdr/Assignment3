const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=1500';
const BACK_IMG = 'back.webp';
let allPokemon = [];
let cardData = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let clicks = 0;
let matchedPairs = 0;
let totalPairs = 0;
let remainingTime = 0;
let timerInterval = null;

const settings = {
  easy: { pairs: 3, time: 60 },
  medium: { pairs: 6, time: 120 },
  hard: { pairs: 12, time: 180 }
};

// Utility to shuffle an array
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Load full Pokémon list once
async function loadPokemonList() {
  const res = await fetch(API_URL);
  const data = await res.json();
  allPokemon = data.results;
}

// Initialize the game based on current settings
async function initGame() {
  clearInterval(timerInterval);
  const diff = document.getElementById('difficulty').value;
  const { pairs, time } = settings[diff];

  clicks = 0;
  matchedPairs = 0;
  totalPairs = pairs;
  remainingTime = time;
  lockBoard = false;

  updateStatus();
  setupGrid(pairs);
  startTimer();
}

// Update status header
function updateStatus() {
  document.getElementById('timer').textContent = remainingTime;
  document.getElementById('clicks').textContent = clicks;
  document.getElementById('matched').textContent = matchedPairs;
  document.getElementById('total').textContent = totalPairs;
}

// Create and render cards
async function setupGrid(pairs) {
  const grid = document.getElementById('gameGrid');
  grid.innerHTML = '';

  const selection = shuffle(allPokemon).slice(0, pairs);
  cardData = [];

  for (const p of selection) {
    const detail = await fetch(p.url).then(r => r.json());
    const imgUrl = detail.sprites.other['official-artwork'].front_default;
    cardData.push({ name: p.name, img: imgUrl });
    cardData.push({ name: p.name, img: imgUrl });
  }

  shuffle(cardData);

  cardData.forEach(({ name, img }) => {
    const col = document.createElement('div');
    col.className = 'col-4 col-sm-3 col-md-2';

    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.name = name;
    card.innerHTML = `
      <img class="front_face" src="${img}" alt="${name}" />
      <img class="back_face" src="${BACK_IMG}" alt="back" />
    `;

    card.addEventListener('click', flipCard);
    col.appendChild(card);
    grid.appendChild(col);
  });
}

// Handle flipping logic
function flipCard() {
  if (lockBoard || this.classList.contains('flipped')) return;
  this.classList.add('flipped');
  clicks++;
  updateStatus();

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  lockBoard = true;

  if (firstCard.dataset.name === secondCard.dataset.name) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

function handleMatch() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  matchedPairs++;
  updateStatus();
  resetFlipState();
  if (matchedPairs === totalPairs) showWin();
}

function handleMismatch() {
  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetFlipState();
  }, 1000);
}

function resetFlipState() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function startTimer() {
  timerInterval = setInterval(() => {
    remainingTime--;
    updateStatus();
    if (remainingTime <= 0) showGameOver();
  }, 1000);
}

function showWin() {
  clearInterval(timerInterval);
  lockBoard = true;
  alert('You Win!');
}

function showGameOver() {
  clearInterval(timerInterval);
  lockBoard = true;
  alert('Game Over');
}

// Reset entire game state
function resetGame() {
  clearInterval(timerInterval);
  document.getElementById('gameGrid').innerHTML = '';
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
  clicks = 0;
  matchedPairs = 0;
  remainingTime = 0;
  totalPairs = 0;
  updateStatus();
}

// Toggle light/dark theme
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
}

// Power-up: briefly reveal all cards
function powerUp() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(c => c.classList.add('flipped'));
  setTimeout(() => {
    cards.forEach(c => !c.classList.contains('matched') && c.classList.remove('flipped'));
  }, 2000);
}

// Event listeners
window.addEventListener('DOMContentLoaded', () => {
  loadPokemonList();
  document.getElementById('startBtn').addEventListener('click', initGame);
  document.getElementById('resetBtn').addEventListener('click', resetGame);
  document.getElementById('difficulty').addEventListener('change', resetGame);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('powerUpBtn').addEventListener('click', powerUp);
});