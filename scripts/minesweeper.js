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

gameContainer.innerHTML = ''; //Clear container
//creates grid for the DOM
gameContainer.insertAdjacentHTML('afterbegin', gameGrid().join(''));

const uncover = (target) => {
  //okay, need to uncover square here...
  console.log(target);
};

gameContainer.onclick = function(event) {
  let target = event.target; // where was the click?
  if (!target.classList.contains('hidden')) return; // not on TD? Then we're not interested
  uncover(target);
};
