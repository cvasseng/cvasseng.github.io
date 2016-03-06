/*

Magescape - 7DRL contribution, 2016

Copyright (c) 2016, Chris V - chris@tinkerer.xyz
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

me.Tileset = function (filename) {
  var img = new Image(),
      canvas = document.createElement('canvas'),
      events = me.Events(),

      tiles = [
        //Ground tiles: 0
        [0, 1, 2, 3, 4, 5],
        //Wall tiles: 1
        //[29, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 60, 61, 62, 63],
        [29, 40, 44, 61, 41, 46, 49, 63, 42, 47, 43, 48, 45, 60, 62],
        //Wall shadows: 2
        [21, 22, 23],
        //Death effects: 3
        [58],
        //Non-visible: 4
        [102],
        //Caster type: 5
        [156],
        //Melee type: 6
        [137, 138, 150, 153, 154],
        //Mixed type: 7
        [173, 174, 175]

      ]
  ;


  //It's slightly faster to blit from a canvas
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;

    canvas.getContext('2d').drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      0,
      0,
      img.width,
      img.height
    );

    events.emit('Load');
  };

  /////////////////////////////////////////////////////////////////////////////

  function floor(i) {
    if (i) return tiles[0][i];
    return tiles[0][Math.floor(Math.random() * (tiles[0].length - 1))];
  }

  function wall(i) {
    if (i) return tiles[1][i];
    return tiles[1][Math.floor(Math.random() * (tiles[1].length - 1))];
  }

  function wallShadow(i) {
    if (i) return tiles[2][i];
    return tiles[2][Math.floor(Math.random() * (tiles[2].length - 1))];
  }

  function getTile(i, j) {
    if (typeof i === 'undefined' || typeof tiles[i] === 'undefined') {
      console.log('Tried to access tile unknown tile', i);
      return 0;
    }
    if (typeof j !== 'undefined') {
      if (typeof tiles[i][j] !== 'undefined') {
        return tiles[i][j];
      }
      console.log('unable to find nested', i, j);
    }
    return tiles[i][Math.floor(Math.random() * (tiles[i].length - 1))];
  }

  function isNSensitive(i) {
    if (typeof i === 'undefined' || typeof tiles[i] === 'undefined') {
      return false;
    }
    return tiles[i].length === 15;
  }

  function isWall(index) {

    return index === 1 || index === 2;

    var res = false;

    tiles[1].some(function (w) {
      if (index === w) {
        res = true;
        return true;
      }
    });

    if (res) return true;

    tiles[2].some(function (w) {
      if (index === w) {
        res = true;
        return true;
      }
    });

    return res;
  }

  //Blit a tile
  function blit(tcanvas, index, x, y, tileSize, width, height) {
    var ctx = tcanvas.getContext('2d'),
        tileSizeX = tileSize || 32,
        tileSizeY = tileSize || 32,
        tw,
        sy,
        sx
    ;

    tw = Math.floor(canvas.width / tileSizeX);
    sy = Math.floor(index / tw);
    sx = index - (sy * tw);  

    sx = sx * tileSizeX;
    sy = sy * tileSizeY;   
    
    if (sy < canvas.height && sx < canvas.width && sx >= 0 && sy >= 0) {
      ctx.drawImage(  
        canvas, 
        sx, sy, tileSizeX, tileSizeY, 
        x, y, 
        width || tileSizeX, 
        height || tileSizeY
      );
    }
    
  }

  //Load tileset
  function load(filename) {
    img.src = filename;
  }

  /////////////////////////////////////////////////////////////////////////////

  if (typeof filename !== 'undefined') {
    load(filename);
  }

  return {
    floor: floor,
    wall: wall,
    isNSensitive: isNSensitive,
    wallShadow: wallShadow,
    getTile: getTile,
    isWall: isWall,
    on: events.on,
    blit: blit,
    load: load
  }
};