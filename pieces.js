import {WIDTH, HEIGHT, GRID_SIZE, drawTile, RED, GREEN, ORANGE, YELLOW, BLUE, PURPLE, CYAN, LEFT, RIGHT, DOWN} from "./constants.js";
import {gridLeftOffset, gridTopOffset} from "./grid.js";
class Piece {
  constructor(row, col) {
    this.row = row; //top left
    this.col = col;
    this.frame = 0;
    this.curOrientation = null;
    this.lastMove = null; //for t spins
  }
  clockwiseRotate(grid) {
    this.frame = (this.frame + 1) % this.frames.length; //each object has 4 frames-- rotations cycle through aformentioned frames
    this.curOrientation = this.frames[this.frame];
    switch (this.frame) { //each frame has a unique list of translations applied in order to make a good rotation (SRS)
    //(for instance, this allows for rotation against walls)
    //if, after having applied all translations, no valid positions are found, it resets back
      case (0):
        if (!this.collision(grid)) {
          this.col--;
          if (!this.collision(grid)) {
            this.row++;
            if (!this.collision(grid)) {
              this.col++; this.row-=3;
              if (!this.collision(grid)) {
                this.col--;
                if (!this.collision(grid)) {
                  this.col++; this.row+=2;
                  this.counterClockwiseRotate(grid);
                }
              }
            }
          }
        }
        break;
      case (1):
        if (!this.collision(grid)) {
          this.col--;
          if (!this.collision(grid)) {
            this.row--;
            if (!this.collision(grid)) {
              this.col++; this.row+=3;
              if (!this.collision(grid)) {
                this.col--;
                if (!this.collision(grid)) {
                  this.col++; this.row-=2;
                  this.counterClockwiseRotate(grid);
                }
              }
            }
          }
        }
        break;
      case (2):
        if (!this.collision(grid)) {
          this.col++;
          if (!this.collision(grid)) {
            this.row++;
            if (!this.collision(grid)) {
              this.col--; this.row-=3;
              if (!this.collision(grid)) {
                this.col++;
                if (!this.collision(grid)) {
                  this.col--; this.row+=2;
                  this.counterClockwiseRotate(grid);
                }
              }
            }
          }
        }
        break;
      case (3):
        if (!this.collision(grid)) {
          this.col++;
          if (!this.collision(grid)) {
            this.row--;
            if (!this.collision(grid)) {
              this.col--; this.row+=3;
              if (!this.collision(grid)) {
                this.col++;
                if (!this.collision(grid)) {
                  this.col--; this.row-=2;
                  this.counterClockwiseRotate(grid);
                }
              }
            }
          }
        }
        break;
    }
  }
  counterClockwiseRotate(grid) {
    this.frame = ((this.frame - 1) + this.frames.length) % this.frames.length;
    this.curOrientation = this.frames[this.frame];
    switch (this.frame) { //same logic as above.
      case (0):
        if (!this.collision(grid)) {
          this.col++;
          if (!this.collision(grid)) {
            this.row++;
            if (!this.collision(grid)) {
              this.col--; this.row-=3;
              if (!this.collision(grid)) {
                this.col++;
                if (!this.collision(grid)) {
                  this.col--; this.row+=2;
                  this.clockwiseRotate(grid);
                }
              }
            }
          }
        }
        break;
      case (1):
        if (!this.collision(grid)) {
          this.col--;
          if (!this.collision(grid)) {
            this.row++;
            if (!this.collision(grid)) {
              this.col++; this.row-=3;
              if (!this.collision(grid)) {
                this.col--;
                if (!this.collision(grid)) {
                  this.col++; this.row+=2;
                  this.clockwiseRotate(grid);
                }
              }
            }
          }
        }
        break;
      case (2):
        if (!this.collision(grid)) {
          this.col--;
          if (!this.collision(grid)) {
            this.row++;
            if (!this.collision(grid)) {
              this.col++; this.row-=3;
              if (!this.collision(grid)) {
                this.col--;
                if (!this.collision(grid)) {
                  this.col++; this.row+=2;
                  this.clockwiseRotate(grid);
                }
              }
            }
          }
        }
        break;
      case (3):
        if (!this.collision(grid)) {
          this.col++;
          if (!this.collision(grid)) {
            this.row--;
            if (!this.collision(grid)) {
              this.col--; this.row+=3;
              if (!this.collision(grid)) {
                this.col++;
                if (!this.collision(grid)) {
                  this.col--; this.row-=2;
                  this. clockwiseRotate(grid);
                }
              }
            }
          }
        }
        break;
    }
  }
  move(dir, grid) { //returns true when it should be placed, false otherwise
    switch (dir) {
      case (LEFT):
        this.col--;
        if (!this.collision(grid)) this.col++;
        return false;
      case (RIGHT):
        this.col++;
        if (!this.collision(grid)) this.col--;
        return false;
      case (DOWN):
        this.row++;
        if (!this.collision(grid)) {
          this.row--;
          return true;
        }
        break;
      
    }
    return false;
  }
  collision(grid) {
    for (let i = this.row; i < this.row + this.curOrientation.length; i++) {
      for (let j = this.col; j < this.col + this.curOrientation[0].length; j++) {
        if (this.curOrientation[i - this.row][j - this.col] &&
        (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j])) return false; //checks out of bounds and filled grid
      }
    }
    return true;
  }
  draw(style, _GRID_SIZE, ghost) {
    let size = (_GRID_SIZE) ? _GRID_SIZE : GRID_SIZE;
    let ctx = document.getElementById("main").getContext("2d");
    this.curOrientation.forEach((row, i) => {
      row.forEach((elem, j) => {
        if (elem) {
          drawTile(ctx, elem, gridLeftOffset + (j + this.col)*size, gridTopOffset + (i + this.row)*size, style, null, size, ghost);
        }
      });
    });
  }
  reset() { //used for when holding a piece
    this.frame = 0;
    this.curOrientation = this.frames[this.frame];
    this.row = 0;
    this.col = WIDTH / 2 - 2;
  }
  static duplicate(piece) { //used for generating a hold piece. really just a cop out to avoid pointer issues
    let dupPiece = null;
    switch (piece.constructor.name) {
      case ("IPiece"):  dupPiece = new IPiece(piece.row, piece.col); break;
      case ("Square"):  dupPiece = new Square(piece.row, piece.col); break;
      case ("JPiece"):  dupPiece = new JPiece(piece.row, piece.col); break;
      case ("LPiece"):  dupPiece = new LPiece(piece.row, piece.col); break;
      case ("SPiece"):  dupPiece = new SPiece(piece.row, piece.col); break;
      case ("TPiece"):  dupPiece = new TPiece(piece.row, piece.col); break;
      case ("ZPiece"):  dupPiece = new ZPiece(piece.row, piece.col); break;
    }
    dupPiece.frame = piece.frame;
    dupPiece.curOrientation = dupPiece.frames[dupPiece.frame];
    return dupPiece;
  }
}
export class IPiece extends Piece {
  constructor(row, col) {
    super(row, col);
    this.frames = [
      [[null, null, null, null],
       [CYAN, CYAN, CYAN, CYAN],
       [null, null, null, null],
       [null, null, null, null]],
       
      [[null, null, CYAN, null],
       [null, null, CYAN, null],
       [null, null, CYAN, null],
       [null, null, CYAN, null]],
       
      [[null, null, null, null],
       [null, null, null, null],
       [CYAN, CYAN, CYAN, CYAN],
       [null, null, null, null]],
       
      [[null, CYAN, null, null],
       [null, CYAN, null, null],
       [null, CYAN, null, null],
       [null, CYAN, null, null]],
       
    ];
    this.curOrientation = this.frames[0];
  }
  clockwiseRotate(grid) { //I-Pieces have their own rotation system
    this.frame = (this.frame + 1) % this.frames.length;
    this.curOrientation = this.frames[this.frame];
    switch (this.frame) {
      case (0):
        if (!this.collision(grid)) {
          this.col++;
          if (!this.collision(grid)) {
            this.col-=3;
            if (!this.collision(grid)) {
              this.col+=3; this.row+=2;
              if (!this.collision(grid)) {
                this.col-=3; this.row-=3;
                if (!this.collision(grid)) {
                  this.col+=2; this.row++;
                  this.counterClockwiseRotate(grid);
                }
              }
            }
          }
        }
        break;
      case (1):
        if (!this.collision(grid)) {
          this.col-=2;
          if (!this.collision(grid)) {
            this.col+=3;
            if (!this.collision(grid)) {
              this.col-=3; this.row+=1;
              if (!this.collision(grid)) {
                this.col+=3; this.row-=3;
                if (!this.collision(grid)) {
                  this.col-=1; this.row+=2;
                  this.counterClockwiseRotate(grid);
                }
              }
            }
          }
        }
        break;
      case (2):
        if (!this.collision(grid)) {
          this.col--;
          if (!this.collision(grid)) {
            this.col+=3;
            if (!this.collision(grid)) {
              this.col-=3; this.row-=2;
              if (!this.collision(grid)) {
                this.col+=3; this.row+=3;
                if (!this.collision(grid)) {
                  this.col-=2; this.row--;
                  this.counterClockwiseRotate(grid);
                }
              }
            }
          }
        }
        break;
      case (3):
        if (!this.collision(grid)) {
          this.col+=2;
          if (!this.collision(grid)) {
            this.col-=3;
            if (!this.collision(grid)) {
              this.col+=3; this.row-=1;
              if (!this.collision(grid)) {
                this.col-=3; this.row+=3;
                if (!this.collision(grid)) {
                  this.col+=1; this.row-=2;
                  this.counterClockwiseRotate(grid);
                }
              }
            }
          }
        }
        break;
    }
  }
  counterClockwiseRotate(grid) {
    this.frame = ((this.frame - 1) + this.frames.length) % this.frames.length;
    this.curOrientation = this.frames[this.frame];
    switch (this.frame) {
      case (0):
        if (!this.collision(grid)) {
          this.col+=2;
          if (!this.collision(grid)) {
            this.col-=3;
            if (!this.collision(grid)) {
              this.col+=3; this.row-=1;
              if (!this.collision(grid)) {
                this.col-=3; this.row+=3;
                if (!this.collision(grid)) {
                  this.col+=1; this.row-=2;
                  this.clockwiseRotate(grid);
                }
              }
            }
          }
        }
        break;
      case (1):
        if (!this.collision(grid)) {
          this.col++;
          if (!this.collision(grid)) {
            this.col-=3;
            if (!this.collision(grid)) {
              this.col+=3; this.row+=2;
              if (!this.collision(grid)) {
                this.col-=3; this.row-=3;
                if (!this.collision(grid)) {
                  this.col+=2; this.row++;
                  this.clockwiseRotate(grid);
                }
              }
            }
          }
        }
        break;
      case (2):
        if (!this.collision(grid)) {
          this.col-=2;
          if (!this.collision(grid)) {
            this.col+=3;
            if (!this.collision(grid)) {
              this.col-=3; this.row+=1;
              if (!this.collision(grid)) {
                this.col+=3; this.row-=3;
                if (!this.collision(grid)) {
                  this.col-=1; this.row+=2;
                  this.clockwiseRotate(grid);
                }
              }
            }
          }
        }
        break;
      case (3):
        if (!this.collision(grid)) {
          this.col--;
          if (!this.collision(grid)) {
            this.col+=3;
            if (!this.collision(grid)) {
              this.col-=3; this.row-=2;
              if (!this.collision(grid)) {
                this.col+=3; this.row+=3;
                if (!this.collision(grid)) {
                  this.col-=2; this.row--;
                  this.clockwiseRotate(grid);
                }
              }
            }
          }
        }
        break;
    }
  }
} 
export class Square extends Piece {
  constructor(row, col) {
    super(row, col);
    this.frames = [
      [[null, YELLOW, YELLOW, null],
       [null, YELLOW, YELLOW, null],
       [null, null,   null,   null],
       [null, null,   null,   null]]
    ];
    this.curOrientation = this.frames[0];
  }
}
export class JPiece extends Piece {
  constructor(row, col) {
    super(row, col);
    this.frames = [
      [[BLUE, null, null],
       [BLUE, BLUE, BLUE],
       [null, null, null]],
       
      [[null, BLUE, BLUE],
       [null, BLUE, null],
       [null, BLUE, null]],
       
      [[null, null, null],
       [BLUE, BLUE, BLUE],
       [null, null, BLUE]],
       
      [[null, BLUE, null],
       [null, BLUE, null],
       [BLUE, BLUE, null]]
    ];
    this.curOrientation = this.frames[0];
  }
}

export class LPiece extends Piece {
  constructor(row, col) {
    super(row, col);
    this.frames = [
      [[null,   null,   ORANGE],
       [ORANGE, ORANGE, ORANGE],
       [null,   null,   null]],
      
      [[null,   ORANGE,   null],
       [null,   ORANGE,   null],
       [null,   ORANGE,   ORANGE]],
       
      [[null,   null,   null],
       [ORANGE, ORANGE, ORANGE],
       [ORANGE, null,   null]],
       
      [[ORANGE, ORANGE,   null],
       [null,   ORANGE,   null],
       [null,   ORANGE,   null]]
    ];
    this.curOrientation = this.frames[0];
  }
}

export class SPiece extends Piece {
  constructor(row, col) {
    super(row, col);
    this.frames = [
      [[null,  GREEN, GREEN],
       [GREEN, GREEN, null],
       [null,   null, null]],
      
      [[null,  GREEN,  null],
       [null,  GREEN, GREEN],
       [null,  null,  GREEN]],
       
      [[null,  null,  null],
       [null,  GREEN, GREEN],
       [GREEN, GREEN, null]],
       
      [[GREEN,  null, null],
       [GREEN, GREEN, null],
       [null,  GREEN, null]],
    ];
    this.curOrientation = this.frames[0];
  }
}
export class TPiece extends Piece {
  constructor(row, col) {
    super(row, col);
    this.frames = [
      
      [[null,   PURPLE, null],
       [PURPLE, PURPLE, PURPLE],
       [null,   null,   null]],
       
      [[null,   PURPLE, null],
       [null,   PURPLE, PURPLE],
       [null,   PURPLE, null]],
       
      [[null,   null,   null],
       [PURPLE, PURPLE, PURPLE],
       [null,   PURPLE, null]],
      
      [[null,   PURPLE, null],
       [PURPLE, PURPLE, null],
       [null,   PURPLE, null]],
    ];
    this.curOrientation = this.frames[0];
  }
}
export class ZPiece extends Piece {
  constructor(row, col) {
    super(row, col);
    this.frames = [
      [[RED,  RED,  null],
       [null, RED,  RED],
       [null, null, null]],
       
      [[null, null, RED],
       [null, RED,  RED],
       [null, RED,  null]],
       
      [[null,  null, null],
       [RED,  RED,  null],
       [null, RED,  RED]],
      
      [[null, RED,  null],
       [RED,  RED,  null],
       [RED,  null, null]]
    ];
    this.curOrientation = this.frames[0];
  }
}
