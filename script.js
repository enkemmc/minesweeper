import init, {
  Minesweeper,
  

} from './pkg/minesweeper_wasm.js';

async function main() {
  const _instance = await init('./pkg/minesweeper_wasm_bg.wasm');
  const board = document.getElementById('board');
  const sqr_templ = document.createElement('div');
  sqr_templ.classList.add('cell');

  // initialize game
  // create 10x10 board with 10 mines
  // set up onclick handlers
  const game = new Minesweeper(10, 10, 10);
  let y = 0;
  for (let i = 0; i < 100; i++) {
    y = Math.floor(i / 10);
    const square = sqr_templ.cloneNode(true)

    // add data attributes
    square.dataset.y = y;
    square.dataset.x = i % 10
    // left click
    square.addEventListener('click', () => {
      const x = square.dataset.x;
      const y = square.dataset.y;
      if (game.getIcon(x, y) === '💣') {
        handleGameOver(game);
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

const handleGameOver = (game) => {
  console.log('game over')
  const body = document.getElementsByTagName('body')[0];
  const gameOver = document.createElement('div');
  gameOver.classList.add('game-over');
  if (game.isWon()) {
    gameOver.textContent = 'You won!';
  } else {
    gameOver.textContent = 'You lost!';

    // reveal all bombs
    for (let i = 0; i < 100; i++) {
      const y = Math.floor(i / 10);
      const x = i % 10;
      const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
      if (game.getIcon(x, y) === '💣') {
        cell.classList.add('bomb');
        cell.textContent = '💣';
      }
    }

  }
  body.appendChild(gameOver);
  game.free();
}





const addIconToCell = (cell, game) => {
  const x = cell.dataset.x;
  const y = cell.dataset.y;
  const icon = game.getIcon(x, y);
  console.log(`adding icon ${icon} to ${x}, ${y}`)
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
    console.log(`adding number ${icon} to ${x}, ${y}`)
    cell.textContent = icon;
  }
}



main()
