import {WIDTH, HEIGHT, GRID_SIZE, drawTile, RED, GREEN, ORANGE, YELLOW, BLUE, PURPLE, CYAN} from "./constants.js";
export const gridLeftOffset = GRID_SIZE*6 + 5; //due to piece hold
export const gridTopOffset = GRID_SIZE + 5; 
export class Grid {
  constructor() {
    this.grid = []; //board representation
    this.level = 1; //level augments every 10 lines
    this.linesCleared = 0;
    this.score = 0;
    for (let i = 0; i < HEIGHT; i++) {
      this.grid.push([]);
      for (let j = 0; j < WIDTH; j++) {
        this.grid[i].push(null);
      }
    }
    this.lastMove = null; //used for tspins. Can be translation or rotation
    this.b2bLastMove = false; //for back to back special moves
    this.combo = 0;
    this.style = 0; //for drawing
  }
  draw(canvas) {
    let ctx = canvas.getContext("2d");
    //draws outline
    ctx.fillStyle = "lightBlue";
    ctx.strokeStyle = "grey";
    ctx.lineWidth = 5;
    ctx.roundRect(5, 5, (WIDTH + 4)*GRID_SIZE + gridLeftOffset, (HEIGHT + 2)*GRID_SIZE + gridTopOffset, 20).fill();
    ctx.roundRect(5, 5, (WIDTH + 4)*GRID_SIZE + gridLeftOffset, (HEIGHT + 2)*GRID_SIZE + gridTopOffset, 20).stroke();
    ctx.lineWidth = 1;
    //draws placed bricks
    this.grid.forEach((row, i) => {
       row.forEach((elem, j) => {
        drawTile(ctx, elem, gridLeftOffset + j*GRID_SIZE, gridTopOffset + i*GRID_SIZE, this.style);
      });
    });
  }
  placePiece(piece) {
    let gameOver = false;
    for (let i = piece.row; i < piece.row + piece.curOrientation.length; i++) {
      for (let j = piece.col; j < piece.col + piece.curOrientation[0].length; j++) {
        if (piece.curOrientation[i - piece.row][j - piece.col]) {
          if (this.grid[i][j]) gameOver = true; //if there is overlap when it is placed. Due to how movement is handled, this case is *hopefully* only hit on spawning i.e. gameove
          this.grid[i][j] = piece.curOrientation[i - piece.row][j - piece.col];
        }
      }
    }
    this.score += this.checkClear(piece);
    return gameOver;
  }
  checkClear(piece) {
    let rowsCleared = 0;
    let count = 0;
    
    let tSpin = (piece.constructor.name === "TPiece" && piece.lastMove === "rotate");
    if (tSpin) {
      let cornerCount = 0; //3 out of the 4 corners of the T must be filled for it to be valid
      if (this.grid[piece.row][piece.col]) cornerCount++;
      if (this.grid[piece.row][piece.col + 2]) cornerCount++;
      if (this.grid[piece.row + 2] && this.grid[piece.row + 2][piece.col]) cornerCount++;
      if (this.grid[piece.row + 2] && this.grid[piece.row + 2][piece.col + 2]) cornerCount++;
      tSpin = cornerCount >= 3;
    }
    
    for (let i = piece.row; i < piece.row + piece.curOrientation.length; i++) {
      for (let j = 0; j < WIDTH; j++) {
        if (this.grid[i] && this.grid[i][j]) count++;
      }
      if (count === WIDTH) { //row is filled
        rowsCleared++;
        this.grid.splice(i, 1); //removes and places new row at the top
        let newRow = []; newRow.length = WIDTH;
        this.grid.unshift((newRow.fill(null)));
        i--;
      }
      count = 0;
    }
    this.linesCleared += rowsCleared;
    let pc = this.checkPerfectClear(); //filled with null
    let points = 0;
    if (tSpin) {
      switch (rowsCleared) {
        case (0): points = 0; break;
        case (1): points = ((pc) ? (800 + 800) * this.level: 800 * this.level); break;
        case (2): points =  ((pc) ? (1200 + 1000) * this.level: 1200 * this.level); break;
        case (3): points =  ((pc) ? (1600 + 1800) * this.level: 1600 * this.level); break;
      }
    } else {
      switch (rowsCleared) {
        case (0): points = 0; break;
        case (1): points =  ((pc) ? (100 + 800) * this.level: 100 * this.level); break;
        case (2): points =  ((pc) ? (300 + 1000) * this.level: 300 * this.level); break;
        case (3): points =  ((pc) ? (500 + 1800) * this.level: 500 * this.level); break;
        case (4): points = ((pc) ? (800 + 2000) * this.level: 800 * this.level); break;
      }
    }
    if (tSpin || rowsCleared === 4) { //a "good" clear
      if (this.b2bLastMove) points *= 1.5; //the last clear was good
      this.b2bLastMove = true;
    } else if (rowsCleared > 0) this.b2bLastMove = false;
    
    if (rowsCleared === 0) this.combo = 0; //resets combo
    else {
      points += this.combo * this.level * 50; //50 100 150... 
      this.combo = Math.min(20, (this.combo + 1));
    }
    return points;
    
  }
  checkPerfectClear() {
    for (let i = HEIGHT - 1; i >= 0; i--) {
      for (let j = 0; j < WIDTH; j++) {
        if (this.grid[i][j]) return false;
      }
    }
    return true;
  }
}