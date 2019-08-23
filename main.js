import {WIDTH, HEIGHT, LEFT, RIGHT, DOWN, drawTile, GRID_SIZE, RED, GREEN, ORANGE, YELLOW, BLUE, PURPLE, CYAN, createCookie, getCookie} from "./constants.js";
import {IPiece, JPiece, Square, TPiece, SPiece, ZPiece, LPiece} from "./pieces.js";
import {Grid, gridLeftOffset, gridTopOffset} from "./grid.js";
/*TODO
* add sprint mode
*/
let dumbconsole = function(obj) { //debugging purposes
    console.log(JSON.parse(JSON.stringify(obj)));
};

let pieceBag = repopulateBag(); //used in getting randomized piece
let pieceQueue = [getRandomPiece(), getRandomPiece(), getRandomPiece(), getRandomPiece(), getRandomPiece()];
let curPiece = pieceQueue.shift(); pieceQueue.push(getRandomPiece());
let grid = new Grid();
let heldPiece = null; 
let held = false; //to avoid infinite holds
let gameOver = false;
let pause = [false, false, false]; //first screen, style, controls
let autoDropDelay = determineAutoDropSpeed(); //in frames
let lockInDelay = 1000; //****IN MS NOT FRAMES!!!!****the delay between when a block should be placed and is actually placed. Allows for spins and such. 
//I purposfully did not implement lock-in reset during drops as to prevent infinite rotations.

let lockedIn = false;
//M
function cookieSetup(keyMapping, ogKeyDownTimer, keyDownTimer, initialDelay) { //fetches preference-related cookies if they exist.
  if (getCookie("style")) grid.style = +getCookie("style");
  else createCookie("style", "0");
  
  if (getCookie("controls")) {
    let tempArr = getCookie("controls").split(",");
    keyMapping.forEach((elem, i) => keyMapping[i] = tempArr[i]);
  } else createCookie("controls", keyMapping.join());
  
  if (getCookie("arr")) {
     let tempArr = getCookie("arr").split(",");
     tempArr.forEach((elem, i) => {
       ogKeyDownTimer[i] = +elem;
       keyDownTimer[i] = +elem;
     });
  } else createCookie("arr", ogKeyDownTimer.join());
  
  if (getCookie("das")) initialDelay[0] = +getCookie("das");
  else createCookie("das", initialDelay[0] + "");
}
function handlePiecePlace() {
  while (!curPiece.move(DOWN, grid.grid)); //drops the piece. Useful in case the lock-in kicks in whilst in a rotation that elevates the piece a bit (no floating pieces)
  gameOver = grid.placePiece(curPiece);
  curPiece = pieceQueue.shift();
  gameOver = gameOver || !curPiece.collision(grid.grid); 
  pieceQueue.push(getRandomPiece());
  held = false;
  lockedIn = false;
  autoDropDelay = determineAutoDropSpeed();
}
function hardDrop() {
  let points = 0;
  while (!curPiece.move(DOWN, grid.grid)) points += 2; //2 points for every line descended. 
  grid.score += points;
  handlePiecePlace();
}
function repopulateBag() {
  return [new IPiece(0, WIDTH / 2 - 2), new JPiece(0, WIDTH / 2 - 2), new Square(0, WIDTH / 2 - 2), new TPiece(0, WIDTH / 2 - 2), new SPiece(0, WIDTH / 2 - 2), new ZPiece(0, WIDTH / 2 - 2), new LPiece(0, WIDTH / 2 - 2)];
}
function getRandomPiece() {
  let index = Math.floor(Math.random() * pieceBag.length);
  let chosenPiece = pieceBag[index];
  pieceBag.splice(index, 1);
  if (pieceBag.length === 0) pieceBag = repopulateBag();
  return chosenPiece;
}
function holdPiece() {
  if (held) return; //we have already held a piece
  let dupCurPiece = IPiece.duplicate(curPiece); 
  lockedIn = false;
  held = true;
  if (heldPiece) { //there is a piece being held. If so, swap the two.
    curPiece = IPiece.duplicate(heldPiece);
    heldPiece = dupCurPiece;
    curPiece.reset(); heldPiece.reset();
    heldPiece.col = -5; //for drawing purposes
  } else { //otherwise fill the blank slot and pull from the queue
    curPiece = pieceQueue.shift();
    pieceQueue.push(getRandomPiece());
    heldPiece = dupCurPiece;
    heldPiece.reset();
    heldPiece.col = -5;
  }
  autoDropDelay = determineAutoDropSpeed();
}
function determineAutoDropSpeed() {
  if (grid.level >= 10) {
    return Math.max(10 - (grid.level - 10), 0);
  }
  return Math.max(60 - 5 * grid.level, 1);
}
window.requestAnimationFrame(function drop() {
  if (pause[0]) {
    window.requestAnimationFrame(drop);
    return;
  }
  grid.level = Math.floor(grid.linesCleared / 10) + 1; //for calculating points
  if (autoDropDelay <= 0) {
    if (curPiece.move(DOWN, grid.grid) && !lockedIn) { //if it collides downwards and hasn't triggered lock-in countdown
      lockedIn = true;
      setTimeout(() => {
        if (lockedIn) handlePiecePlace(); //prevents player from hard dropping during the countdown, making the next piece drop once the delay expires
      }, lockInDelay);
    }
    autoDropDelay = determineAutoDropSpeed();
  }
  autoDropDelay--;
  if (!gameOver) window.requestAnimationFrame(drop);
});
//V
function drawHeldPiece(ctx) {
  for (let i = 0; i < 4; i++) {
    for (let j = -5; j < -5 + 4; j++) {
      drawTile(ctx, null, gridLeftOffset + j*GRID_SIZE, gridTopOffset + i*GRID_SIZE, grid.style, "black"); //black strokeColour to make it look cleaner
    }
  }
  if (heldPiece) heldPiece.draw(grid.style);
}
function drawPieceQueue(ctx) {
  for (let i = 0; i < 4 * pieceQueue.length; i++) {
    for (let j = 0; j < 4; j++) {
      //black strokeColour for cleanliness, half-sized as to not pollute the screen
      drawTile(ctx, null, gridLeftOffset + (WIDTH + 1)*GRID_SIZE + j*GRID_SIZE*.5, gridTopOffset + i*GRID_SIZE*.5, grid.style, "black", GRID_SIZE * .5);
    }
  }
  pieceQueue.forEach((elem, index) => {//coordinates update
    elem.col = (WIDTH + 1)*2;
    elem.row = 4*index;
    elem.draw(grid.style, GRID_SIZE * .5);
    elem.row = 0;
    elem.col = WIDTH / 2 - 2;
  });
}
function drawGhostPiece(ctx) {
  let dupCurPiece = IPiece.duplicate(curPiece);
  while (!dupCurPiece.move(DOWN, grid.grid)); //hard drops the imaginary piece
  dupCurPiece.draw(grid.style, GRID_SIZE, true); //draws just the outline
}
function drawScoreAndLevels(ctx) {
  ctx.font = "20px Trebuchet MS";
  ctx.fillStyle = "black";
  ctx.fillText("Score", (WIDTH+1)*GRID_SIZE+gridLeftOffset, 11*GRID_SIZE + gridTopOffset);
  ctx.fillText(grid.score, (WIDTH+1)*GRID_SIZE+gridLeftOffset, 12*GRID_SIZE + gridTopOffset);
  ctx.fillText("Lines", (WIDTH+1)*GRID_SIZE+gridLeftOffset, 13*GRID_SIZE + gridTopOffset);
  ctx.fillText(grid.linesCleared, (WIDTH+1)*GRID_SIZE+gridLeftOffset, 14*GRID_SIZE + gridTopOffset);
  
}
function drawGameOverScreen() {
  let canvas = document.getElementById("main");
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; ctx.strokeStyle = "gray";
  ctx.roundRect(5, 5, (WIDTH + 4)*GRID_SIZE + gridLeftOffset, (HEIGHT + 2)*GRID_SIZE + gridTopOffset, 20).fill();
  ctx.roundRect(5, 5, (WIDTH + 4)*GRID_SIZE + gridLeftOffset, (HEIGHT + 2)*GRID_SIZE + gridTopOffset, 20).stroke();
  ctx.font = "40px Trebuchet MS";
  ctx.fillStyle = "white";
  ctx.fillText("Game Over!", gridLeftOffset + GRID_SIZE, ((HEIGHT + 2)*GRID_SIZE + gridTopOffset)*.3);
  
}
function drawPause() {
  let canvas = document.getElementById("main");
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)"; ctx.strokeStyle = "gray";
  ctx.roundRect(5, 5, (WIDTH + 4)*GRID_SIZE + gridLeftOffset, (HEIGHT + 2)*GRID_SIZE + gridTopOffset, 20).fill();
  ctx.roundRect(5, 5, (WIDTH + 4)*GRID_SIZE + gridLeftOffset, (HEIGHT + 2)*GRID_SIZE + gridTopOffset, 20).stroke();
  
  ctx.strokeStyle = "black";
  ctx.fillStyle = "rgb(210,210,210)";
  ctx.lineWidth = 5;
  ctx.roundRect(gridLeftOffset + GRID_SIZE, gridTopOffset + 4*GRID_SIZE, (WIDTH - 2)*GRID_SIZE, 10*GRID_SIZE, 20).fill();
  ctx.roundRect(gridLeftOffset + GRID_SIZE, gridTopOffset + 4*GRID_SIZE, (WIDTH - 2)*GRID_SIZE, 10*GRID_SIZE, 20).stroke();
  ctx.font = "30px Trebuchet MS";
  ctx.fillStyle = "black";
  ctx.lineWidth = 2;
  
  if (pause[1]) {//style
    ctx.fillText("Style", gridLeftOffset + 3.5*GRID_SIZE, gridTopOffset + 6*GRID_SIZE);
    ctx.font = "20px Trebuchet MS";
    let colours = [RED, GREEN, ORANGE, YELLOW, BLUE, PURPLE, CYAN];
    let numStyles = 5;
    for (let i = 0; i < numStyles; i++) {
      ctx.fillStyle = "black";
      ctx.fillText("Style " + (i + 1), gridLeftOffset + 2*GRID_SIZE, gridTopOffset + (8 + i)*GRID_SIZE);
      colours.forEach((elem, index) => { //draws each colour in the style specified at half size for a preview
        drawTile(ctx, elem, gridLeftOffset + (5 + 0.5*index)*GRID_SIZE, gridTopOffset + (7.5 + i)*GRID_SIZE, i, elem, GRID_SIZE * .5);
      });
    } 
    ctx.strokeStyle = "blue"; //for which one is selected
    ctx.roundRect(gridLeftOffset + 1.75*GRID_SIZE, gridTopOffset + (7.25 + grid.style)*GRID_SIZE, 7*GRID_SIZE, GRID_SIZE, 5).stroke();
  } else if (pause[2]) {//controls
    ctx.fillText("Controls", gridLeftOffset + 3.25*GRID_SIZE, gridTopOffset + 5*GRID_SIZE);
    ctx.font = "12px Trebuchet MS";
    ctx.fillText("Left", gridLeftOffset + 2*GRID_SIZE, gridTopOffset + 6*GRID_SIZE);
    ctx.fillText("Right", gridLeftOffset + 2*GRID_SIZE, gridTopOffset + 7*GRID_SIZE);
    ctx.fillText("SD", gridLeftOffset + 2*GRID_SIZE, gridTopOffset + 8*GRID_SIZE);
    ctx.fillText("CW Rot.", gridLeftOffset + 2*GRID_SIZE, gridTopOffset + 9*GRID_SIZE);
    ctx.fillText("CCW Rot.", gridLeftOffset + 2*GRID_SIZE, gridTopOffset + 10*GRID_SIZE);
    ctx.fillText("Hold", gridLeftOffset + 2*GRID_SIZE, gridTopOffset + 11*GRID_SIZE);
    ctx.fillText("HD", gridLeftOffset + 2*GRID_SIZE, gridTopOffset + 12*GRID_SIZE);
    ctx.fillText("Pause", gridLeftOffset + 2*GRID_SIZE, gridTopOffset + 13*GRID_SIZE);
    
    keyMapping.forEach((elem, index) => { //keyMapping is defined in the control section, but it goes in the order above
      ctx.roundRect(gridLeftOffset + 4*GRID_SIZE, gridTopOffset + (5.5 + index)*GRID_SIZE, 4*GRID_SIZE, GRID_SIZE, 10).stroke();
      ctx.fillText((elem === " ") ? "Space" : elem, gridLeftOffset + 5*GRID_SIZE, gridTopOffset + (6 + index)*GRID_SIZE + ctx.lineWidth);
    });
  } else {//first screen
    ctx.fillText("Paused", gridLeftOffset + 3.15*GRID_SIZE, gridTopOffset + 6*GRID_SIZE);
    ctx.font = "20px Trebuchet MS";
    ctx.fillText("DAS:", gridLeftOffset + 2*GRID_SIZE, gridTopOffset + 8*GRID_SIZE);
    ctx.roundRect(gridLeftOffset + 7*GRID_SIZE, gridTopOffset + 7.25*GRID_SIZE, GRID_SIZE, GRID_SIZE, 5).stroke();;
    ctx.fillText("ARR:", gridLeftOffset + 2*GRID_SIZE, gridTopOffset + 10*GRID_SIZE);
    
    for (let i = 0; i < 4; i++) {
      ctx.roundRect(gridLeftOffset + (4+i)*GRID_SIZE, gridTopOffset + 9.25*GRID_SIZE, GRID_SIZE, GRID_SIZE, 5).stroke();
    }
    //ogKeyDownTimer and initialDelay are defined in controls, but ogKeyDownTimer is just the number of frames between repated inputs
    //initialDelay is the number of frames until the auto-repeat kicks in (ogKeyDownTimer starts)
    //ogKeyDownTimer goes in the same order as keyMapping (so [2] is SD for instance)
    ctx.font = "12px Trebuchet MS"
    ctx.fillText("L/R", gridLeftOffset + 4*GRID_SIZE + ctx.lineWidth, gridTopOffset + 11*GRID_SIZE, GRID_SIZE, GRID_SIZE);
    ctx.fillText("SD", gridLeftOffset + 5*GRID_SIZE + ctx.lineWidth, gridTopOffset + 11*GRID_SIZE, GRID_SIZE, GRID_SIZE);
    ctx.fillText("Rot.", gridLeftOffset + 6*GRID_SIZE + ctx.lineWidth, gridTopOffset + 11*GRID_SIZE, GRID_SIZE, GRID_SIZE);
    ctx.fillText("HD", gridLeftOffset + 7*GRID_SIZE + ctx.lineWidth, gridTopOffset + 11*GRID_SIZE, GRID_SIZE, GRID_SIZE);
    ctx.fillText(initialDelay[0], gridLeftOffset + 7.25*GRID_SIZE, gridTopOffset + 8*GRID_SIZE);
    ctx.fillText(ogKeyDownTimer[0], gridLeftOffset + 4.25*GRID_SIZE, gridTopOffset + 10*GRID_SIZE);
    ctx.fillText(ogKeyDownTimer[2], gridLeftOffset + 5.25*GRID_SIZE, gridTopOffset + 10*GRID_SIZE);
    ctx.fillText(ogKeyDownTimer[3], gridLeftOffset + 6.25*GRID_SIZE, gridTopOffset + 10*GRID_SIZE);
    ctx.fillText(ogKeyDownTimer[6], gridLeftOffset + 7.25*GRID_SIZE, gridTopOffset + 10*GRID_SIZE);
    ctx.fillText("Note: Times are in frames", gridLeftOffset + 2*GRID_SIZE, gridTopOffset + 12*GRID_SIZE);
    
    ctx.roundRect(gridLeftOffset + 2*GRID_SIZE, gridTopOffset + 12.5*GRID_SIZE, 3*GRID_SIZE, GRID_SIZE, 5).stroke();
    ctx.fillText("Style", gridLeftOffset + 2*GRID_SIZE + 3*ctx.lineWidth, gridTopOffset + 13*GRID_SIZE + 2*ctx.lineWidth);
    ctx.roundRect(gridLeftOffset + 5*GRID_SIZE, gridTopOffset + 12.5*GRID_SIZE, 3*GRID_SIZE, GRID_SIZE, 5).stroke();
    ctx.fillText("Controls", gridLeftOffset + 5*GRID_SIZE + 3*ctx.lineWidth, gridTopOffset + 13*GRID_SIZE + 2*ctx.lineWidth);
  }
}
window.requestAnimationFrame(function callback() {
  let canvas = document.getElementById("main");
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  grid.draw(canvas);
  drawHeldPiece(ctx);
  drawGhostPiece(ctx);
  curPiece.draw(grid.style);
  drawPieceQueue(ctx);
  drawScoreAndLevels(ctx);
  if (pause[0]) {
    drawPause();
  }
  if (!gameOver) window.requestAnimationFrame(callback);
  else setTimeout(() => drawGameOverScreen(), 1000); //gives a delay between the drawGameOverScreen so the user can wallow in shame at losing
});
//C
let canvas = document.getElementById("main");
let keyMapping = ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "z", "c", " ", "Escape"]; //default key mapping. Gets overriden by cookies if applicable
let keyPressed = [null, null, null, null, null, null, null, null];
let initialDelay = [10, [false, false, false, false, false, false, false]]; //[1] is just [left, right, down ...]
let keyDownTimer = [1, 1, 1, 12, 12, 12, 12, 20]; //for pressing-and-holding
let ogKeyDownTimer = [1, 1, 1, 12, 12, 12, 12, 20]; //the reference value for restting keyDownTimer
let curTile = [[-1,-1],[-1, -1]]; //before after. Used for the pause menu. The "before after" is to allow for n-digit typing
canvas.addEventListener("keydown", function(event){ 
  let index = -1;
  if ((index = keyMapping.indexOf(event.key)) > -1) {
    keyPressed[index] = true;
    if (keyMapping[index] !== "ArrowDown" && !initialDelay[1][index]) { //instant movement
      performKeyAction(index);
      keyDownTimer[index] = initialDelay[0] + ogKeyDownTimer[index];
      initialDelay[1][index] = true; //shows that the press and hold is happening
    } else if (keyMapping[index] === "ArrowDown")  {
      performKeyAction(index);
    }
  }
  event.preventDefault();
});
canvas.addEventListener("keyup", (event) => {
  let index = -1;
  if ((index = keyMapping.indexOf(event.key)) > -1) {
    keyPressed[index] = false;
    initialDelay[1][index] = false;
  }
});
canvas.addEventListener("keydown", event => {
  if (event.key === "a") grid.linesCleared += 10;
})
canvas.addEventListener("click", function(event) {
  curTile[0][0] = curTile[1][0]; //advances the curtile
  curTile[0][1] = curTile[1][1];
  curTile[1] = [-1, -1];
  if (pause[0]) {
    let mouseX = event.clientX - parseInt(canvas.getBoundingClientRect().left);
    let mouseY = event.clientY - parseInt(canvas.getBoundingClientRect().top);
    if (pause[1]) { //styles
      if (gridLeftOffset + 1.75 * GRID_SIZE <= mouseX && mouseX <= gridLeftOffset + 8.75 * GRID_SIZE) { //the horizontal position at which they are drawn
        let styleSelected = Math.floor(((mouseY - gridTopOffset) / (GRID_SIZE)) - .25) - 7; //since they are drawn at 7.25*GRID_SIZE, 8.25*, 9.25...
        if (styleSelected >= 0 && styleSelected < 5) {
          grid.style = styleSelected;
          createCookie("style", grid.style + ""); //updates cookie
        } 
      }
    } else if (pause[2]) { //controls
      if (gridLeftOffset + 4*GRID_SIZE <= mouseX && mouseX <= gridLeftOffset + 8*GRID_SIZE) { //the horizontal position at which the control values are listed
        let ctrlSelected = Math.floor(((mouseY - gridTopOffset) / GRID_SIZE) - .5) - 5;//drawn at 5.5*GRID_SIZE, 6.5*GRID_SIZE....
        if (0 <= ctrlSelected && ctrlSelected < keyMapping.length) {
          curTile[1][0] = 2; //use to inform a later keydown listener which "class" of value to update (in this case, control)
          curTile[1][1] = ctrlSelected;
        }
      }
    } else { //normal screen
      if (gridTopOffset + 9.25*GRID_SIZE <= mouseY && mouseY <= gridTopOffset + 10.25*GRID_SIZE) { //checks ARR
        if (gridLeftOffset + 4*GRID_SIZE <= mouseX && mouseX <= gridLeftOffset + 8*GRID_SIZE) {
          curTile[1][1] = Math.floor((mouseX - gridLeftOffset)/GRID_SIZE) - 4; //which value in ARR to modify
          curTile[1][0] = 1; //ARR
        } 
      } else if (gridTopOffset + 7.25*GRID_SIZE <= mouseY && mouseY <= gridTopOffset + 8.25*GRID_SIZE) { //checks DAS
        if (gridLeftOffset + 7*GRID_SIZE <= mouseX && mouseX <= gridLeftOffset + 8*GRID_SIZE) {
          curTile[1][0] = 0; curTile[1][1] = 0;
        } 
      } else if (gridTopOffset + 12.5*GRID_SIZE <= mouseY && mouseY <= gridTopOffset + 13.5*GRID_SIZE && gridLeftOffset + 2*GRID_SIZE <= mouseX && mouseX <= gridLeftOffset + 5*GRID_SIZE) { //Styles
        pause[1] = true;
      } else if (gridTopOffset + 12.5*GRID_SIZE <= mouseY && mouseY <= gridTopOffset + 13.5*GRID_SIZE && gridLeftOffset + 5*GRID_SIZE <= mouseX && mouseX <= gridLeftOffset + 8*GRID_SIZE) { //Controls
        pause[2] = true;
      } 
    }
  }
});
canvas.addEventListener("keydown", function(event) {
  const DAS = 0; const ARR = 1; const CTRL = 2; const TRANS = 0; const SD = 1; const ROT = 2; const HD = 3;
  if (pause[2]) {
      if (curTile[1][0] === CTRL) { //TODO make sure duplicate mappings aren't possible...
        keyMapping[curTile[1][1]] = event.key;
        curTile[1] = [-1, -1]; //deselects tile
        createCookie("controls", keyMapping.join());
      }
  } else if (pause[0]) { //we are on first screen, which only accepts number vals
    if (isNaN(+event.key)) return;
    if (curTile[0][0] !== curTile[1][0] || curTile[0][1] !== curTile[1][1]) { //it isn't the same tile i.e. no n-digit input
      if (curTile[1][0] === DAS && curTile[1][1] === DAS) {
        initialDelay[0] = +event.key;
        curTile[0][0] = curTile[1][0]; curTile[0][1] = curTile[1][1]; //shifts back
      } else if (curTile[1][0] === ARR) {
        curTile[0][0] = curTile[1][0]; curTile[0][1] = curTile[1][1]; //shift back
        switch (curTile[1][1]) {
          case (TRANS):
            keyDownTimer[0] = keyDownTimer[1] = ogKeyDownTimer[0] = ogKeyDownTimer[1] = +event.key; break;
          case (SD):
            keyDownTimer[2] = ogKeyDownTimer[2] = +event.key; break;
          case (ROT):
            keyDownTimer[3] = keyDownTimer[4] = ogKeyDownTimer[3] = ogKeyDownTimer[4] = +event.key; break;
          case (HD):
            keyDownTimer[6] = ogKeyDownTimer[6] = +event.key; break;
          default:
             curTile[0] = [-1, -1]; //no valid tile selected
        }
      }
    } else { //it is the same tile. Add a digit instead of overwrite
      if (curTile[1][0] === DAS && curTile[1][1] === DAS) { //same logic overall
        initialDelay[0] = initialDelay[0]*10 + +event.key;
        curTile[0][0] = curTile[1][0]; curTile[0][1] = curTile[1][1];
      } else if (curTile[1][0] === ARR) {
        curTile[0][0] = curTile[1][0]; curTile[0][1] = curTile[1][1];
        switch (curTile[1][1]) {
          case (TRANS):
            keyDownTimer[0] = keyDownTimer[1] = ogKeyDownTimer[0] = ogKeyDownTimer[1] = ogKeyDownTimer[0]*10 + +event.key; break;
          case (SD):
            keyDownTimer[2] = ogKeyDownTimer[2] = ogKeyDownTimer[2]*10 + +event.key; break;
          case (ROT):
            keyDownTimer[3] = keyDownTimer[4] = ogKeyDownTimer[3] = ogKeyDownTimer[4] = ogKeyDownTimer[4]*10 + +event.key; break;
          case (HD):
            keyDownTimer[6] = ogKeyDownTimer[6] = ogKeyDownTimer[6]*10 + +event.key; break;
          default:
             curTile[0] = [-1, -1];
        }
      }
    }
    createCookie("das", initialDelay[0]);
    createCookie("arr", ogKeyDownTimer.join());
  }
});
function performKeyAction(_index) {
  if (!pause[0]) {
    if (keyPressed[0]) { //basically goes through keymapping... Chained ifs allow for simultaneous movements (e.g. translate and rotation)
      if (keyDownTimer[0] <= 0 || _index === 0) { 
        curPiece.move(LEFT, grid.grid);
        curPiece.lastMove = "translate";
        keyDownTimer[0] = ogKeyDownTimer[0];
      }
    } if (keyPressed[1]) {
      if (keyDownTimer[1] <= 0 || _index === 1) {
        curPiece.move(RIGHT, grid.grid);
        curPiece.lastMove = "translate";
        keyDownTimer[1] = ogKeyDownTimer[1];
      }
    } if (keyPressed[2]) {
      if (keyDownTimer[2] <= 0 || _index === 2) {
        if (curPiece.move(DOWN, grid.grid)) { //allows for lock-in when soft dropping as well
          if (!lockedIn) {
            lockedIn = true;
            curPiece.lastMove = "translate";
            setTimeout(() => {
              if (lockedIn) handlePiecePlace();
            }, lockInDelay);
          }
        } else grid.score += 1; //for every row traversed a point isadded
        keyDownTimer[2] = ogKeyDownTimer[2];
        autoDropDelay = determineAutoDropSpeed();
      }
    } if (keyPressed[3]) {
      if (keyDownTimer[3] <= 0 || _index === 3) {
        curPiece.clockwiseRotate(grid.grid);
        curPiece.lastMove = "rotate";
        keyDownTimer[3] = ogKeyDownTimer[3];
      }
    } if (keyPressed[4]) {
      if (keyDownTimer[4] <= 0 || _index === 4) {
        curPiece.counterClockwiseRotate(grid.grid);
        curPiece.lastMove = "rotate";
        keyDownTimer[4] = ogKeyDownTimer[4];
      }
    } if (keyPressed[5]) { 
      if (keyDownTimer[5] <= 0 || _index === 5) {
        keyDownTimer[5] = ogKeyDownTimer[5];
        holdPiece();
      }
    } if (keyPressed[6]) {
      if (keyDownTimer[6] <= 0 || _index === 6) {
        curPiece.lastMove = "translate";
        hardDrop();
        keyDownTimer[6] = ogKeyDownTimer[6];
      }
    }
  }
  if (keyPressed[7]) { //pause!
    if (keyDownTimer[7] <= 0 || _index === 7) {
        keyDownTimer[7] = ogKeyDownTimer[7];
        if (pause[0] && (pause[1] || pause[2])) { //we are on a pause-screen. Go back to "home screen" of pause
          pause[1] = false; pause[2] = false;
        } else {
          pause[0] = !pause[0]; //toggle pause
        }
    }
  }
}
window.requestAnimationFrame(function callback() { //reduce the delay countdown every frame
  keyDownTimer.forEach((elem, i) => {
    if (elem > 0) keyDownTimer[i]--;
  });
  performKeyAction();
  if (!gameOver) window.requestAnimationFrame(callback);
});
cookieSetup(keyMapping, ogKeyDownTimer, keyDownTimer, initialDelay);
