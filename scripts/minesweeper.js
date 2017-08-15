'use strict';
const level = "easy";
const gameContainer = document.getElementById('game-container');
const difficultyLevels = {
  easy: {
    rows: 10,
    columns: 10,
    mines: 5
  },
  medium: {
    rows: 20,
    columns: 20,
    mines: 20
  },
  hard: {
    rows: 30,
    columns: 30,
    mines: 99
  }
}
let gameArray;


const gameGrid = () => {
  const grid = Array.apply(null, Array(difficultyLevels[level].columns)).map( (x, xIndex) => { 
    let row = Array.apply(null, Array(difficultyLevels[level].rows)).map( (y, yIndex) => {
      return `<button class="hidden game-square pos${ xIndex }-${ yIndex }" 
              data-x="${ xIndex }" data-y="${ yIndex }"></button>`;
    });
    return `<div class="row">${ row.join('') }</div>`;
  });
  return grid;
};

const renderGrid = () => {
  const grid = gameGrid().join('')
  gameContainer.innerHTML = ''; //Clear container
  gameContainer.insertAdjacentHTML('afterbegin', grid);
};

const uncover = (target) => {
  //okay, need to uncover square here...
  console.log(target);
};

gameContainer.onclick = function(event) {
  let target = event.target; 
  if (!target.classList.contains('hidden')) return;
  uncover(target);
};

const randomNumber = (max) => {
  return Math.floor(Math.random() * (max));
};

const createMines = (rows, cols) => {
  let mineGrid = [...Array(rows).keys()].map(i => Array(cols));
  let totalMines = difficultyLevels[level].mines;
  let randX;
  let randY;
  while (totalMines > 0) {
    randX = randomNumber(rows);
    randY = randomNumber(cols);
    if (mineGrid[randX][randY] === undefined) {
      mineGrid[randX][randY] = 'mine';
      totalMines -= 1;
    }
  }
  return mineGrid;
};

const startGame = () => {
  renderGrid();
  const rows = difficultyLevels[level].rows;
  const columns = difficultyLevels[level].columns;
  gameArray = createMines(rows, columns);

}

// (global => {
  startGame();
// })(window);