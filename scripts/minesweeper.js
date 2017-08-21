'use strict';
const level = "easy";
const gameContainer = document.getElementById('game-container');
const coords = (coord) => `${coord.row},${coord.col}`;
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
const surroundingCoordinates = [
  [0, -1],
  [0, 1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [1, -1],
  [1, 0],
  [1, 1]
];
const MinesCoordinatesArray =[];
let gameArray;
let minesPosition = []; //temp

const uncover = (target) => {
  //okay, need to uncover square here...
  console.log(target);
};

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


gameContainer.onclick = function(event) {
  let target = event.target; 
  if (!target.classList.contains('hidden')) return;
  uncover(target);
};

const randomNumber = (max) => Math.floor(Math.random() * (max));

Array.prototype.SumArray = function(arr) {
  let sum = this.map( (num, index) => {
    return num + arr[index];
  });
  return sum;
}

const getNum = (testRow, testCol, grid) => {
  console.log(testRow + "    -> col " + testCol);
  try {
    if (grid[testRow][testCol] === undefined) {
      grid[testRow][testCol] = 1;
    } else if (typeof(grid[testRow][testCol]) === 'number') {
      grid[testRow][testCol] += 1;
    }
  } catch (e) {
    return;
  }
};

const fillNums = (grid, minesArray) => {
  let testRow;
  let testCol;
  let checkBox;
  minesArray.forEach( mine => {
    surroundingCoordinates.forEach( box => {
      checkBox = mine.SumArray(box);
      testRow = checkBox[0];
      testCol = checkBox[1];
      getNum(testRow, testCol, grid);
    });
  });
  return grid;
};


const createMines = (rows, cols) => {
  const totalMines = difficultyLevels[level].mines;
  const checkDups = mine => coords(mine) !== coords(newMine);
  let mines = [];
  let minesPlacement = {};
  let newMine;
  while (mines.length < totalMines) {
    newMine = {
      row: randomNumber(rows),
      col: randomNumber(cols)
    };

    if(mines.every(checkDups)) {
        mines.push(newMine);
        //Also a copy of our mines co-ordinates as an array
        MinesCoordinatesArray.push([newMine.row, newMine.col])
    };
  }
  console.log("mines at " + mines);
  return mines;
};

const insertMines = (mineGrid, mines) => {
  mines.forEach( (mine) => {
    mineGrid[mine.row][mine.col] = 'mine'
  });
}

const buildBoard = (rows, cols) => {
  //create empty grid
  let mineGrid = [...Array(rows).keys()].map(i => Array(cols));
  //create the cor-ordinates for the mines
  minesPosition = createMines(rows, cols)
  //insert the mines into mineGrid
  insertMines(mineGrid, minesPosition);
  //let finalGrid = createMineGrid(minesPosition, mineGrid);
  fillNums(mineGrid, MinesCoordinatesArray)
  return mineGrid;
};

const startGame = () => {
  renderGrid();
  const rows = difficultyLevels[level].rows;
  const columns = difficultyLevels[level].columns;
  gameArray = buildBoard(rows, columns);

}

// (global => {
  startGame();
// })(window);