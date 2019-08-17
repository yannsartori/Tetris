export const WIDTH = 10; //squares
export const HEIGHT = 20;
export const GRID_SIZE = 32; //px. Should be of the form 2^n, n >= 5 so the styles and piece queue don't get messed up

export const BLUE = "hsl(214,100%,61%)";
export const RED = "hsl(4,100%,57%)";
export const GREEN = "hsl(119,100%,50%)";
export const ORANGE = "hsl(25,100%,58%)";
export const CYAN = "hsl(182,100%,51%)";
export const YELLOW = "hsl(60,100%,64%)";
export const PURPLE = "hsl(278,100%,50%)";

export const LEFT = 0;
export const RIGHT = 1;
export const DOWN = 2;

//cookie functions credit to Lukas https://stackoverflow.com/questions/4825683/how-do-i-create-and-read-a-value-from-cookie/36763672#36763672
export function createCookie(name, value) {
  document.cookie = name + '=' + value + '; path=/';
}

export function getCookie(name) {
  if (document.cookie.length > 0) {
    let c_start = document.cookie.indexOf(name + '=');
    if (c_start !== -1) {
      c_start = c_start + name.length + 1;
      let c_end = document.cookie.indexOf(';', c_start);
      if (c_end === -1) {
        c_end = document.cookie.length;
      }
      return unescape(document.cookie.substring(c_start, c_end));
    }
  }
  return '';
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y,   x+w, y+h, r);
  this.arcTo(x+w, y+h, x,   y+h, r);
  this.arcTo(x,   y+h, x,   y,   r);
  this.arcTo(x,   y,   x+w, y,   r);
  this.closePath();
  return this;
}; //https://stackoverflow.com/a/7838871/11695068 credit to

export function drawTile(ctx, colour, x, y, style, strokeColour, _GRID_SIZE, ghost) {
  let size = (_GRID_SIZE) ? _GRID_SIZE : GRID_SIZE; //smaller sized used for pause menu and piece queue
  if (!colour) { //empty tile
    ctx.fillStyle = "black";
    ctx.strokeStyle = (strokeColour) ? strokeColour : "gray"; //strokeColour is black for hold and queue because it looks better
    ctx.fillRect(x, y, size, size);
    ctx.strokeRect(x, y, size, size);
    return;
  }
  let hsl = colour.split(",");
  let light = parseInt(hsl[2]);
  if (style === 0) { //as specified in the options
    ctx.fillStyle = hsl[0] + "," + hsl[1] + "," + light + "%)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x + size*.75, y + size*.25);
    ctx.lineTo(x + size*.25, y + size*.25);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = hsl[0] + "," + hsl[1] + "," + light * .85 + "%)";
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x + size*.25, y + size*.25);
    ctx.lineTo(x + size*.25, y + size*.75);
    ctx.lineTo(x, y + size);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = hsl[0] + "," + hsl[1] + "," + light * .70 + "%)";
    ctx.beginPath();
    ctx.moveTo(x + size*.25, y + size*.25);
    ctx.lineTo(x + size*.75, y + size*.25);
    ctx.lineTo(x + size*.75, y + size*.75);
    ctx.lineTo(x + size*.25, y + size*.75);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = hsl[0] + "," + hsl[1] + "," + light * .55 + "%)";
    ctx.beginPath();
    ctx.moveTo(x + size, y);
    ctx.lineTo(x + size*.75, y + size*.25);
    ctx.lineTo(x + size*.75, y + size*.75);
    ctx.lineTo(x + size, y + size);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = hsl[0] + "," + hsl[1] + "," + light * .40 + "%)";
    ctx.beginPath();
    ctx.moveTo(x, y + size);
    ctx.lineTo(x + size*.25, y + size*.75);
    ctx.lineTo(x + size*.75, y + size*.75);
    ctx.lineTo(x + size, y + size);
    ctx.closePath();
    ctx.fill();
  } else if (style === 1) {
    ctx.fillStyle = hsl[0] + "," + hsl[1] + "," + (light * .7)+ "%)";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = hsl[0] + "," + hsl[1] + "," + (light)+ "%)";
    ctx.fillRect(x + size / 8, y + size / 8, size - size / 4, size - size / 4);
  } else if (style === 2) {
    ctx.fillStyle = hsl[0] + "," + hsl[1] + "," + (100)+ "%)";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = hsl[0] + "," + hsl[1] + "," + (light * .7)+ "%)";
    ctx.fillRect(x, y + size - size / 8, size, size / 8);
    ctx.fillRect(x + size - size / 8, y, size / 8, size);
    ctx.fillStyle = hsl[0] + "," + hsl[1] + "," + (light)+ "%)";
    ctx.fillRect(x + size / 8, y + size / 8, size - size / 4, size - size / 4);
  } else if (style === 3) {
    ctx.save();
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = hsl[0] + "," + hsl[1] + "," + (light)+ "%)";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1
    ctx.roundRect(x, y, size, size, size / 4).fill();
    ctx.roundRect(x, y, size, size, size / 4).stroke();
    ctx.strokeRect(x + size / 4, y + size / 4, size / 2, size / 2);
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x + size / 4, y + size / 4);
    ctx.moveTo(x + size, y);
    ctx.lineTo(x + size - size / 4, y + size / 4);
    ctx.moveTo(x + size, y + size);
    ctx.lineTo(x + size - size / 4, y + size - size / 4);
    ctx.moveTo(x, y + size);
    ctx.lineTo(x + size / 4, y + size - size / 4);
    ctx.stroke();
    ctx.restore();
  } else if (style === 4) {
    ctx.save();
    ctx.fillStyle = hsl[0] + "," + parseInt(hsl[1])*.5 + "%," + (light)+ "%)"
    ctx.strokeStyle = "black";
    ctx.fillRect(x, y, size, size);
    ctx.strokeRect(x, y, size, size);
    ctx.beginPath();
    ctx.moveTo(x + size / 8, y + size - size / 8);
    ctx.lineTo(x + size - size / 8, y + size - size / 8);
    ctx.lineTo(x + size - size / 8, y + size / 8);
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.fillRect(x + size / 8, y + size / 8, size / 8, size / 8);
    ctx.restore();
  }
  if (ghost) { //if we should draw the ghost piece. option in pause menu. gives an outline
    ctx.fillStyle = "black";
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
  }
  
} 
