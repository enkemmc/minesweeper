import init, {
  Minesweeper,
} from './pkg/minesweeper_wasm.js';

async function main() {
  const _instance = await init('./pkg/minesweeper_wasm_bg.wasm');
  let gameState = {
    game: null,
    timer: null,
    difficulty: 'easy',
    flagMode: false
  }
  initHandlers({ gameState });
  newGame({ gameState });
}

function handleDifficultyChange({ gameState }) {
  const easy = document.getElementById('easy');
  const medium = document.getElementById('medium');
  const hard = document.getElementById('hard');
  const custom = document.getElementById('custom');
  const edgeSize = document.getElementById('custom-edge-size');
  const mineCount = document.getElementById('custom-mine-count');

  switch (gameState.difficulty) {
    case 'easy':
      easy.classList.add('selected');
      medium.classList.remove('selected');
      hard.classList.remove('selected');
      custom.classList.remove('selected');
      disableCustomFields(true);
      break;
    case 'medium':
      easy.classList.remove('selected');
      medium.classList.add('selected');
      hard.classList.remove('selected');
      custom.classList.remove('selected');
      disableCustomFields(true);
      break;
    case 'hard':
      easy.classList.remove('selected');
      medium.classList.remove('selected');
      hard.classList.add('selected');
      custom.classList.remove('selected');
      disableCustomFields(true);
      break;
    case 'custom':
      easy.classList.remove('selected');
      medium.classList.remove('selected');
      hard.classList.remove('selected');
      custom.classList.add('selected');
      disableCustomFields(false);
      break;
  }
}

function disableCustomFields(disabled) {
  const edgeSize = document.getElementById('custom-edge-size');
  const mineCount = document.getElementById('custom-mine-count');
  if (disabled){
    edgeSize.setAttribute('disabled', 'true');
    mineCount.setAttribute('disabled', 'true');
  } else {
    edgeSize.removeAttribute('disabled');
    mineCount.removeAttribute('disabled');
  }
}

function initHandlers({ gameState }) {
  const edgeSize = document.getElementById('custom-edge-size');
  const mineCount = document.getElementById('custom-mine-count');
  const reset = document.getElementById('reset-game');
  const solve = document.getElementById('solve-game');
  const newGameButton = document.getElementById('new-game');
  const easy = document.getElementById('easy');
  const medium = document.getElementById('medium');
  const hard = document.getElementById('hard');
  const custom = document.getElementById('custom');
  const flagmode = document.getElementById('flag-mode');

  easy.addEventListener('click', () => {
    gameState.difficulty = 'easy';
    handleDifficultyChange({ gameState });
    updateCustomFields({ gameState });
  })
  medium.addEventListener('click', () => {
    gameState.difficulty = 'medium';
    handleDifficultyChange({ gameState });
    updateCustomFields({ gameState });
  })
  hard.addEventListener('click', () => {
    gameState.difficulty = 'hard';
    handleDifficultyChange({ gameState });
    updateCustomFields({ gameState });
  })
  custom.addEventListener('click', () => {
    gameState.difficulty = 'custom';
    handleDifficultyChange({ gameState });
  })
  solve.addEventListener('click', () => {
    solveGame({ gameState });
  })
  newGameButton.addEventListener('click', () => {
    newGame({ gameState });
  })
  flagmode.addEventListener('click', () => {
    gameState.flagMode = !gameState.flagMode;
    if (gameState.flagMode) {
      flagmode.classList.add('selected');
    } else {
      flagmode.classList.remove('selected');
    }
  })

  edgeSize.addEventListener('change', () => {
    const { edgeSize, mineCount } = getGameSettings({ gameState });
    if (edgeSize * edgeSize < mineCount) {
      mineCount.value = edgeSize * edgeSize;
    }
    custom.click()
  })

  mineCount.addEventListener('change', () => {
    const { edgeSize, mineCount } = getGameSettings({ gameState });
    if (edgeSize * edgeSize < mineCount) {
      edgeSize.value = Math.floor(mineCount / 2);
    }
    custom.click()
  })
}

function solveGame({ gameState }) {
  if (gameState.game === null) {
    return
  }
  const { edgeSize } = getGameSettings({ gameState });
  const board = document.getElementById('board');
  console.log(edgeSize)
  let i = 0;
  while (i < edgeSize * edgeSize) {
    const cell = board.childNodes[i];
    const x = i % edgeSize;
    const y = Math.floor(i / edgeSize);
    console.log(i)
    console.log(x,y)
    if (gameState.game.isBomb(x, y)) {
      cell.innerText = '💣';
      cell.classList.add('bomb');
    } else {
      cell.classList.add('visible');
    }
    i++
  }
  gameState.timer.stop();
  gameState.game.free();
  gameState.game = null;
}

function updateBoardSize({ gameState}) {
  const board = document.getElementById('board');
  Array.from(board.childNodes).forEach(child => child.remove());
  const { edgeSize } = getGameSettings({ gameState });
  const cellWidth = window.innerWidth / edgeSize;
  const cellHeight = (.8 * window.innerHeight) / edgeSize;
  const target = Math.min(cellWidth, cellHeight);
  board.style.gridTemplateColumns = `repeat(${edgeSize}, ${target}px)`;
  board.style.fontSize = `${target * .7}px`;
}

class Timer {
  constructor(element) {
    this.start = new Date().getTime();
    this.element = element;
  }

  stop() {
    clearInterval(this.interval);
  }

  reset() {
    this.start = new Date().getTime();
  }

  getElapsed() {
    return new Date().getTime() - this.start;
  }

  getElapsedSeconds() {
    return Math.floor(this.getElapsed() / 1000);
  }
}

function newGame({ gameState }) {
  if (gameState.game) {
    gameState.timer.stop()
    gameState.timer.element.innerText = '0';
    gameState.game.free();
  }
  const status = document.getElementById('status-text');
  status.innerText = 'Playing';
  const timeText = document.getElementById('status-time');
  gameState.timer = new Timer(timeText);
  gameState.timer.interval = setInterval(() => {
    timeText.innerText = gameState.timer.getElapsedSeconds();
  }, 1000);

  const { edgeSize, mineCount } = getGameSettings({ gameState });
  const board = document.getElementById('board');
  updateBoardSize({ gameState })
  const sqr_templ = document.createElement('div');
  sqr_templ.classList.add('cell');

  const game = new Minesweeper(edgeSize, mineCount);
  gameState.game = game;
  let y = 0;
  for (let i = 0; i < (edgeSize * edgeSize); i++) {
    y = Math.floor(i / edgeSize);
    const square = sqr_templ.cloneNode(true)

    // add data attributes
    square.dataset.y = y;
    square.dataset.x = i % edgeSize; 
    if (window.ontouchstart === undefined) { // desktop
      square.addEventListener('click', event => {
        openCell({square, gameState});
      })
      square.addEventListener('contextmenu', event => {
        event.preventDefault();
        addFlagToCell({square, gameState});
      })
    } else { // mobile
      square.addEventListener('touchstart', event => {
        square.dataset.timeStamp = event.timeStamp;
        const interval = setInterval(() => {
          addFlagToCell({square, gameState});
        }
        , 750);

        const end = event => {
          // if the touch lased less than 500ms, open the cell
          if (event.timeStamp - square.dataset.timeStamp < 750) {
            openCell({square, gameState});
          }
          clearInterval(interval);
        }
 
        square.addEventListener('touchend', end);
        square.addEventListener('touchcancel', end);
        // our touchstart handling causes conflicts with mobile's default behavior
        // for contextmenu
        square.addEventListener('contextmenu', event => {
          event.preventDefault();
        })
      })
      // our touchstart handling causes conflicts with mobile's default behavior
      // for contextmenu
      square.addEventListener('contextmenu', event => {
        event.preventDefault();
      })
    }

    board.appendChild(square);
  }
}

function openCell({square, gameState}) {
  const x = square.dataset.x;
  const y = square.dataset.y;
  const { game, edgeSize } = gameState
  if (game.isBomb(x, y)) {
    handleGameOver({gameState, edgeSize});
    return;
  }

  const rerenderList = game.open(x, y);
  for (const pair of rerenderList) {
    const x = pair[0];
    const y = pair[1];
    const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    cell.classList.add('visible');
    addIconToCell(cell, game);
  }

  if (game.isFinished()) {
    handleGameOver({gameState, edgeSize});
  }
}

function addFlagToCell({square, gameState}) {
  const x = square.dataset.x;
  const y = square.dataset.y;
  gameState.game.toggleFlag(x, y);
  addIconToCell(square, gameState.game);
}

const getGameSettings = ({ gameState }) => {
  if (gameState.difficulty === 'custom') {
    const edgeSize = document.getElementById('custom-edge-size').value;
    const mineCount = document.getElementById('custom-mine-count').value;
    return {
      edgeSize,
      mineCount,
    }
  } else if (gameState.difficulty === 'easy') {

    return {
      edgeSize: 10,
      mineCount: 10,
    }
  } else if (gameState.difficulty === 'medium') {
    return {
      edgeSize: 16,
      mineCount: 40,
    }
  } else if (gameState.difficulty === 'hard') {
    return {
      edgeSize: 20,
      mineCount: 55 
    }
  } else {
    throw new Error('invalid difficulty');
  }
}

const updateCustomFields = ({ gameState }) => {
  const { edgeSize, mineCount } = getGameSettings({ gameState });
  const customEdgeSize = document.getElementById('custom-edge-size');
  const customMineCount = document.getElementById('custom-mine-count');
  if (edgeSize) {
    customEdgeSize.value = edgeSize;
  }
  if (mineCount) {
    customMineCount.value = mineCount;
  }
}

const handleGameOver = ({ gameState }) => {
  const status = document.getElementById('status-text');
  const game = gameState.game;
  gameState.timer.stop();
  const { edgeSize } = getGameSettings({ gameState });

  if (game.isWon()) {
    status.textContent = 'Victory!';
  } else {
    status.textContent = 'Game Over';
    // reveal all bombs
    for (let i = 0; i < edgeSize * edgeSize; i++) {
      const y = Math.floor(i / edgeSize);
      const x = i % edgeSize;
      const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
      if (game.isBomb(x, y)) {
        cell.classList.add('bomb');
        cell.textContent = '💣';
      }
    }
  }

  gameState.game.free();
  gameState.game = null;
}

const addIconToCell = (cell, game) => {
  const x = cell.dataset.x;
  const y = cell.dataset.y;
  const icon = game.getIcon(x, y);
  if (icon === '🟦') {
    cell.classList.remove('flag');
    cell.textContent = '';
  } else if (icon === '💣') {
    cell.classList.add('bomb');
    cell.textContent = '💣';
  } else if (icon === '🚩') {
    cell.classList.add('flag');
    cell.textContent = '🚩';
  } else {
    cell.textContent = icon;
  }
}

main()
