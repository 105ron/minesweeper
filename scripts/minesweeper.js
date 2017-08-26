'use strict';
const level = "easy";
const gameContainer = document.getElementById('game-container');
const difficultyLevels = {
  easy: {
    rows: 15,
    columns: 15,
    mines: 20
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
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, -1],
  [0, 1]
];

const numberToWord = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  //temp
  'mine': 'eight'
};
const MinesCoordinatesArray =[];
let gameArray;
let minesPosition = []; //temp

const randomNumber = (max) => Math.floor(Math.random() * (max));

const coords = (coord) => `${coord.row},${coord.col}`;

const xCoordinate = (arr) => arr[0];

const yCoordinate = (arr) => arr[1];

const isValidPosition = (position) => {
  const rows = difficultyLevels[level].rows;
  const columns = difficultyLevels[level].columns;
  const isValidRow = (0 <= xCoordinate(position) && xCoordinate(position) < rows);
  const isValidCol = (0 <= yCoordinate(position) && yCoordinate(position) < columns);
  return isValidRow && isValidCol;
};

const hasClass = (el, className) => {
  return el.classList ? el.classList.contains(className) : new RegExp('\\b'+ className+'\\b').test(el.className);
};
	
const addClass = (el, className) => {
  if (el.classList) el.classList.add(className);
  else if (!hasClass(el, className)) el.className += ' ' + className;
};

const notUncovered = (el, className) => {
  const notUncovered = hasClass(el, className);
  return notUncovered;
};

const uncover = (x, y) => {
  //okay, need to uncover square here...
  if (x === 1) {
    console.log(`in the 1 row with y being ${ y }`)
  }
  const target = document.querySelector(`.pos${ x }-${ y }`);
  if (target && notUncovered(target, 'hidden')) {
    const value = gameArray[x][y];
    const classToAdd = numberToWord[value];
    target.classList.toggle(classToAdd);
    target.classList.toggle('hidden');
  };
};

//add SumArray to Array protoype so we can get each mines surrounding boxes
Array.prototype.SumArray = function(arr) {
  let sum = this.map( (num, index) => {
    return num + arr[index];
  });
  return sum;
  //if it's not valid just return the original array
  //return isValidPosition(sum) ? sum : arr;
}

//Our array is the stack of co-ordinates to uncover
Array.prototype.ContainsIdenticalArray = function(arr) {
  const results = this.map( arrays => {
    return arrays.map( (num, index) => {
      return num === arr[index];
    });
  });
  //results is now an array of arrays with true/false for each position
  const flattenedResults = results.map( x => {
    return x.reduce( (accumulator, currentValue) => {
      return accumulator && currentValue
    },true);
  });
  //now flattened to true if both are identical
  return !flattenedResults.includes(true);
  //we return false if it found any matches in the stack
}

const findSquaresToUncover = (target) => {
  let uncoverStack = [];
  const xPosition = parseInt(target.getAttribute("data-x"));
  const yPosition = parseInt(target.getAttribute("data-y"));
  const notAlreadyQueued = box => uncoverStack.ContainsIdenticalArray(box);
  const buildUncoverstack = (thisBox) => {
    let value = gameArray[xCoordinate(thisBox)][yCoordinate(thisBox)];
    if (value === 0) {
      surroundingCoordinates.forEach( (box) => {
        let surroundingBox = box.SumArray(thisBox);
        try {
          if (notAlreadyQueued(surroundingBox)) {
            uncoverStack.push(surroundingBox);
            buildUncoverstack(surroundingBox);
          }
        } catch (e) {
          console.log(e);
        }
      });
    }
  };
  uncoverStack.push([xPosition, yPosition]);
  buildUncoverstack([xPosition, yPosition]);
  uncoverStack.forEach( ( position ) => {
    uncover(xCoordinate(position), yCoordinate(position));
  });
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
  findSquaresToUncover(target);
};

const getNum = (testRow, testCol, grid) => {
  //nest if statements to check for grid being between 0 <= testCol < difficultlyLevels[level].mines
  //instead of try -> catch?
  try {
    if (typeof(grid[testRow][testCol]) === 'number') {
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
      checkBox = mine.SumArray(box); //add the mines co-ordinates to the 8 surrounding boxes by relative co-ordinates
      testRow = xCoordinate(checkBox);
      testCol = yCoordinate(checkBox);
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
  return mines;
};

const insertMines = (mineGrid, mines) => {
  mines.forEach( (mine) => {
    mineGrid[mine.row][mine.col] = 'mine'
  });
}

const buildBoard = (rows, cols) => {
  //create empty grid
  let mineGrid = [...Array(rows).keys()].map(i => Array(cols).fill(0));
  //create the cor-ordinates for the mines
  minesPosition = createMines(rows, cols)
  //insert the mines into mineGrid
  insertMines(mineGrid, minesPosition);
  //number around each mine
  fillNums(mineGrid, MinesCoordinatesArray)
  return mineGrid;
};

const startGame = () => {
  renderGrid();
  const rows = difficultyLevels[level].rows;
  const columns = difficultyLevels[level].columns;
  gameArray = buildBoard(rows, columns);
};

// (global => {
  startGame();
// })(window);