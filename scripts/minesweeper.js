'use strict';
const gameContainer = document.getElementById('game-container');
const difficultyButtons = document.getElementById('levels-container');
const difficultyLevels = {
  easy: {
    rows: 9,
    columns: 9,
    mines: 10
  },
  medium: {
    rows: 16,
    columns: 16,
    mines: 40
  },
  hard: {
    rows: 16,
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
  'mine': 'mine'
};
let minesCoordinatesArray =[];
let level = "easy";
let gameArray;
let minesPosition = [];
let flagsPosition = [];
let won = false;

const randomNumber = (max) => Math.floor(Math.random() * (max));

const coords = (coord) => `${coord.row},${coord.col}`;

const xCoordinate = (arr) => arr[0];

const yCoordinate = (arr) => arr[1];

const hasClass = (el, className) => {
  return el.classList ? el.classList.contains(className) : new RegExp('\\b'+ className+'\\b').test(el.className);
};
	
const addClass = (el, className) => {
  console.log(el);
  if (el.classList) el.classList.add(className);
  else if (!hasClass(el, className)) el.className += ' ' + className;
};

const targetElement = (x, y) => {
  return document.querySelector(`.pos${ x }-${ y }`);
};

const uncover = (x, y) => {
  //okay, need to uncover square here...
  const target = targetElement(x, y);
  if (target && hasClass(target, 'hidden')) {
    const value = gameArray[x][y];
    const classToAdd = numberToWord[value];
    addClass(target, classToAdd);
    target.classList.toggle('hidden'); //remove hidden class
  };
};

//add SumArray to Array protoype so we can get each mines surrounding boxes
Array.prototype.SumArray = function(arr) {
  let sum = this.map( (num, index) => {
    return num + arr[index];
  });
  return sum;
}

//Our array is the stack of co-ordinates to uncover
Array.prototype.CompareArrays = function(arr) {
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
  //now flattened to true if both are identical, otherwise false
  return flattenedResults;
}

const hasSameCoordinates = (stack, newBox) => {
  //compares both elements in the array and is true if both are true
  const arrayComparison = stack.CompareArrays(newBox);
  return arrayComparison.includes(true);
};

const clickPostionToArray = (target) => {
  const xPosition = parseInt(target.getAttribute("data-x"));
  const yPosition = parseInt(target.getAttribute("data-y"));
  return [xPosition, yPosition];
};

const findSquaresToUncover = (target, clickPosition) => {
  let uncoverStack = [];
  const notAlreadyQueued = box => !hasSameCoordinates(uncoverStack, box);
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
          // console.log(e); //for development only
        }
      });
    }
  };
  uncoverStack.push(clickPosition); //uncover the box we clicked
  buildUncoverstack(clickPosition); //now start looking at surrounding boxes, uncover if they are 0
  uncoverStack.forEach( ( position ) => {
    //reveal all the boxes in the stack
    uncover(xCoordinate(position), yCoordinate(position));
  });
};

const gameGrid = () => {
  //the grid to be inserted into the DOM
  const grid = Array.apply(null, Array(difficultyLevels[level].rows)).map( (x, xIndex) => { 
    let row = Array.apply(null, Array(difficultyLevels[level].columns)).map( (y, yIndex) => {
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

const uncoverMines =  classToAdd => {
  //for when we win we add flags to all mines, lose and we display the mines
  minesCoordinatesArray.forEach( position  => {
    const x = xCoordinate(position);
    const y = yCoordinate(position);
    const target = targetElement(x, y);
    addClass(target, classToAdd);
  });
}

const uncoverNumbers = () => {
  const hiddenSquares = document.querySelectorAll('.hidden');
  hiddenSquares.forEach( box => {
    const position = clickPostionToArray(box);
    uncover(xCoordinate(position),yCoordinate(position));
  });
};

const checkForWin = () => {
  const isWinner = () => {
  let results = flagsPosition.map( eachFlag => {
    const comparison = minesCoordinatesArray.CompareArrays(eachFlag);
    return comparison.includes(true);
  });
    const mines = difficultyLevels[level].mines;
    const correctAmount = (mines === results.length);
    const allCorrectPosition = !results.includes(false);
    const hiddenElements = document.querySelectorAll('.hidden').length;
    const flagged = flagsPosition.length
    const onlyMinesHidden = ((mines - hiddenElements - flagged) === 0);
    return (correctAmount && allCorrectPosition) || onlyMinesHidden;
    /*we have the same amount of flags as mines && All the flags are placed over the mines
    OR the only square left uncovered are mines (*/
  }
  if (isWinner()) {
    uncoverMines('flagged')
    uncoverNumbers();
    won = true; //stops the click events in the gameContainer
  }
};

const removeFlaggedMineArray = (clickPosition) => {
  const findIdentical = flagsPosition.CompareArrays(clickPosition);
  const index = findIdentical.findIndex( element => {
    return element === true;
  });
  flagsPosition.splice(index, 1);
};

const isFlaggedOrHidden = target => {
  const squareHidden = hasClass(target, 'hidden');
  const squareFlagged = hasClass(target, 'flagged');
  return squareHidden || squareFlagged;
};

const rightClick = (event) => {
  if (won) return; //disable click on grid after winning
  const target = event.target;
  const clickPosition = clickPostionToArray(target);
  if (!isFlaggedOrHidden(target)) return; //only toggle flag if the square is already flagged or is still hidden
  if (hasSameCoordinates(flagsPosition, clickPosition)) {
    removeFlaggedMineArray(clickPosition); //remove the flag position from the flagsPosition array
  } else {
    flagsPosition.push(clickPosition);
  }
  target.classList.toggle('flagged');
  target.classList.toggle('hidden');
  checkForWin();
}

const leftClick = (event) => {
  if (won) return; //disable click on grid after winning
  const target = event.target; 
  if (!target.classList.contains('hidden')) return;
  const clickPosition = clickPostionToArray(target);
  const positionIsMine = minesCoordinatesArray.CompareArrays(clickPosition).includes(true);
  if (positionIsMine) {
    addClass(target, 'red');
    uncoverMines('mine');
    won = true;
    return; //to stop checkForWin() from running 
  }
  findSquaresToUncover(target, clickPosition);
  checkForWin();
};

difficultyButtons.onclick = (event) => {
  const target = event.target;
  level = target.getAttribute('data-level');
  won = false;
  minesCoordinatesArray =[];
  gameArray = [];
  minesPosition = [];
  flagsPosition = [];
  startGame();
};

const setNum = (testRow, testCol, grid) => {
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
      setNum(testRow, testCol, grid);
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
        minesCoordinatesArray.push([newMine.row, newMine.col])
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
  console.log(`rows ${ rows }`)
  console.log(`columns ${ cols }`)
  let mineGrid = [...Array(rows).keys()].map(i => Array(cols).fill(0));
  //create the cor-ordinates for the mines
  minesPosition = createMines(rows, cols)
  //insert the mines into mineGrid
  insertMines(mineGrid, minesPosition);
  //number around each mine
  fillNums(mineGrid, minesCoordinatesArray)
  return mineGrid;
};

const startGame = () => {
  renderGrid();
  const rows = difficultyLevels[level].rows;
  const columns = difficultyLevels[level].columns;
  gameArray = buildBoard(rows, columns);
  gameContainer.onclick = (event) => {
    leftClick(event)
  }
  window.oncontextmenu = (event) => {
    rightClick(event);
  }
};

startGame();