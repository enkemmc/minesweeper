import init, {
  Minesweeper,
  

} from './pkg/minesweeper_wasm.js';

async function main() {
  const _instance = await init('./pkg/minesweeper_wasm_bg.wasm');
  let gameState = {
    game: null,
    timer: null,
    difficulty: 'easy',
  }
  initHandlers({ gameState });
  newGame({ gameState });
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

  easy.addEventListener('click', () => {
    gameState.difficulty = 'easy';
    updateCustomFields({ gameState });
  })
  medium.addEventListener('click', () => {
    gameState.difficulty = 'medium';
    updateCustomFields({ gameState });
  })
  hard.addEventListener('click', () => {
    gameState.difficulty = 'hard';
    updateCustomFields({ gameState });
  })
  custom.addEventListener('click', () => {
    gameState.difficulty = 'custom';
  })
  reset.addEventListener('click', () => {
    resetGame();
  })
  solve.addEventListener('click', () => {
    solveGame();
  })
  newGameButton.addEventListener('click', () => {
    newGame({ gameState });
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



function resetGame() {

}

function solveGame() {

}

function updateBoardSize({ gameState}) {
  const board = document.getElementById('board');
  Array.from(board.childNodes).forEach(child => child.remove());
  const { edgeSize } = getGameSettings({ gameState });
  console.log(`updatingBoardSize with ${edgeSize}`)
  board.style.gridTemplateColumns = `repeat(${edgeSize}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${edgeSize}, 1fr)`;
}

class Timer {
  constructor() {
    this.start = new Date().getTime();
  }

  stop() {
    clearInterval(this.interval);
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
    gameState.game.free();
  }

  const timeText = document.getElementById('status-time');
  gameState.timer = new Timer();
  gameState.timer.interval = setInterval(() => {
    timeText.innerText = gameState.timer.getElapsedSeconds();
  }, 1000);

  const { edgeSize, mineCount } = getGameSettings({ gameState });
  const board = document.getElementById('board');
  updateBoardSize({ gameState })
  const sqr_templ = document.createElement('div');
  sqr_templ.classList.add('cell');

  // initialize game
  // create 10x10 board with 10 mines
  // set up onclick handlers
  const game = new Minesweeper(edgeSize, edgeSize, mineCount);
  gameState.game = game;
  let y = 0;
  for (let i = 0; i < (edgeSize * edgeSize); i++) {
    y = Math.floor(i / edgeSize);
    const square = sqr_templ.cloneNode(true)

    // add data attributes
    square.dataset.y = y;
    square.dataset.x = i % edgeSize; 
    // left click
    square.addEventListener('click', () => {
      const x = square.dataset.x;
      const y = square.dataset.y;
      if (game.getIcon(x, y) === '💣') {
        handleGameOver({gameState, edgeSize});
        return;
      }

      const rerenderList = game.open(x, y);
      for (const pair of rerenderList) {
        const x = pair[0];
        const y = pair[1];
        const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        addIconToCell(cell, game);
      }

      if (game.isWon()) {
        handleGameOver(game);
      }
    })

    square.addEventListener('contextmenu', event => {
      event.preventDefault();
      console.log('right click detected')
      const x = square.dataset.x;
      const y = square.dataset.y;
      game.toggleFlag(x, y);
      addIconToCell(square, game);
    })
    // right click
    // todo
    board.appendChild(square);
  }
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

const handleGameOver = ({ gameState, edgeSize }) => {
  console.log('game over')
  const status = document.getElementById('status');
  if (game.isWon()) {
    status.textContent = 'You won!';
  } else {
    status.textContent = 'You lost!';

    console.log('edge size', edgeSize)
    // reveal all bombs
    for (let i = 0; i < edgeSize * edgeSize; i++) {
      console.log(i)
      const y = Math.floor(i / edgeSize);
      const x = i % edgeSize;
      const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
      if (game.getIcon(x, y) === '💣') {
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
    cell.classList.add('closed');
  } else if (icon === '💣') {
    cell.classList.add('bomb');
    cell.textContent = '💣';
  } else if (icon === '🚩') {
    cell.classList.add('flag');
    cell.textContent = '🚩';
  } else if (icon === '') {
    cell.classList.add('empty');
  } else {
    cell.classList.add('number');
    cell.textContent = icon;
  }
}



main()
