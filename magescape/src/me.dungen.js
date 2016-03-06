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

//Simple BSP-style generator
me.DungeonGen = function (map, level) {
  var floorTile = 0,
      wallTile = 1,
      wallShadowTile = 2,
      placeHolderA = 100,
      placeHolderB = 101
  ;

  function Node (px, py, width, height, parent, splitType) {
    var children = [], 
        exports = {},
        roomWidth = width,
        roomHeight = height
    ;

    function random(min, max) {
      if (max < min) {
        return min;
      }
      return Math.floor(Math.random() * (max - min + 1) + min)
    }

    function subdivide() {
      var dir = Math.round(Math.random()),
          x = Math.round(Math.random() * (width / 2)),
          y = Math.round(Math.random() * (height / 2))              
      ;

      if (x < 10) x = 10;
      if (y < 10) y = 10;

      if (height < 35 && width < 35) {
        dir = 2;
      } else if (height < 30) {
        dir = 0;
      } else if (width < 30) {
        dir = 1;
      } 

      if (dir === 0) {
        //Split vertically
        children.push(Node(px, py, x, height, exports, dir).subdivide());
        children.push(Node(px + x, py, width - x, height, exports, dir).subdivide());
      
      } else if (dir === 1) {
        //Split horizontally
        children.push(Node(px, py, width, y, exports, dir).subdivide());
        children.push(Node(px, py + y, width, height - y, exports, dir).subdivide());
      }
      
      return exports;
    }

    function getRoomFromChildren() {
      var left, right;

      if (children.length === 2) {
        left = children[0].getRoomFromChildren();
        right = children[1].getRoomFromChildren();        
        return Math.random() > 0.5 ? left : right;
      } 

      return exports;      
    }

    function connectChildren(left, right) {
      var d, i, j, x, y, fc, lc, t, tl, fx, fy, tx, ty, hx, hy;

      if ((!left || !right) && children.length === 0) {
        return;
      }

      fc = left ? left : children[0].getRoomFromChildren();
      lc = right ? right : children[1].getRoomFromChildren();

     // if (fc.px < lc.px) {
        fx = Math.round(fc.px + (fc.roomWidth() / 2));
        tx = Math.round(lc.px + (lc.roomWidth() / 2));        
      // } else {
      //   fx = Math.round(lc.px + (lc.roomWidth() / 2));
      //   tx = Math.round(fc.px + (fc.roomWidth() / 2)); 
      // }

      // if (fc.py < lc.py) {
        fy = fc.py + Math.round(fc.roomHeight() / 2);      
        ty = lc.py + Math.round(lc.roomHeight() / 2);        
      // } else {
      //   fy = lc.py + Math.round(lc.roomHeight() / 2);      
      //   ty = fc.py + Math.round(fc.roomHeight() / 2);        
      // }

      // console.log('drew line', fx, fy, tx, ty);

  

      hx = Math.floor((tx - fx) / 2);

      //Go right first, until we're halfway there
      for (var i = -1; i <= hx + 2; i++) {
        map.data.set(fx + i, fy , placeHolderA);
        map.data.set(fx + i, fy + 1, placeHolderA);
      }

      //Now go the rest of the way at ty
      for (var i = 0; i <= hx + 1; i++) {
        map.data.set(fx + hx + i, ty , placeHolderA);
        map.data.set(fx + hx + i, ty + 1, placeHolderA);
      }

      //Now go from the halfway X and up to ty
      for (var i = 0; i <= ty - fy; i++) {
        if (map.data.get(fx + hx, fy + i) !== placeHolderA) {
          map.data.set(fx + hx, fy + i, placeHolderB);          
        }
      }

      //     var c = map.canvas.getContext('2d');
      // c.strokeStyle = '#AA3333';
      // c.beginPath();
      // c.moveTo(fx * map.properties.drawSize, fy * map.properties.drawSize);
      // c.lineTo(tx * map.properties.drawSize, ty * map.properties.drawSize);
      // c.closePath();
      // c.stroke();
    }

    function generate() {
      var ra = 0, seed = 1, casters = 0, melee = 0, i;

      if (children.length == 2) {
        children.forEach(function (child) {
          child.generate();
        });
        connectChildren();
      } else {        
       // console.log('Final room size', width, height);
        roomWidth = width - (Math.round(Math.random() * (width / 2))) - 2;
        roomHeight = height - (Math.round(Math.random() * (height / 2))) - 2;

        //Top + bottom
        for (var i = 0; i <= roomWidth; i++){
          map.data.set(px + i, py - 1, wallTile);
          map.data.set(px + i, py, 2);
          map.data.set(px + i, py + roomHeight, wallTile);
          map.data.set(px + i, py + roomHeight + 1, 2);
        }

        //Left + right 
        for (var i = 0; i <= roomHeight; i++){
          map.data.set(px, py + i, wallTile);
          map.data.set(px + roomWidth, py + i, wallTile);
        }

        if (parent.children[1] === exports) {
          connectChildren(parent.children[0], parent.children[1]);          
        }

        //Calculate area of room - this will be used to figure out how many enemies to place
        ra = roomWidth * roomHeight;

        if (ra > 60) {
          seed += 4;
        } else if (ra > 50) {
          seed += 3;
        } else if (ra > 40) {
          seed += 2;
        } else if (ra > 30) {
          seed += 2;
        } else if (ra > 20) {
          seed += 2;
        } else if (ra > 10) {
          seed += 1;
        } else {
          seed += 1;
        }

        casters = random(0, seed - 3);
        melee = random(1, seed);

        for (i = 0; i < casters; i++) {
          map.actors.add(me.AI(map, {
            pos: {
              x: px + random(1, roomWidth - 1),
              y: py + random(1, roomHeight - 1)
            },
            type: 'ranged'
          }));
        }

        for (i = 0; i < melee; i++) {
          map.actors.add(me.AI(map, {
            pos: {
              x: px + random(1, roomWidth - 1),
              y: py + random(1, roomHeight - 1)
            },
            type: 'melee'
          }));
        }

        //5% chance of spawning a real bastard
        if (Math.random() <= 0.05) {
          map.actors.add(me.AI(map, {
            pos: {
              x: px + random(1, roomWidth - 1),
              y: py + random(1, roomHeight - 1)
            },
            type: 'mixed'
          }));
        }

      }
    }

    function fillRoom(t) {
      if (children.length === 0) {
        for (var y = 1; y < roomHeight ; y++) {
          for (var x = 1; x < roomWidth ; x++) {
            map.data.set(px + x, py + y, t ? floorTile : 10);
          }
        }
      }
    }

    function fillRooms(t) {
      children.forEach(function (child) {
        child.fillRooms(t);
      });
      fillRoom(t);
    }

    function isWall(index) {
      return index != 3 && index != placeHolderA && index != placeHolderB;

      // var res = false;
      // wallTile.some(function (w) {
      //   if (index === w) {
      //     res = true;
      //     return true;
      //   }
      // });

      // return res;
    }

    function createWalls() {
      var t, bc;

      for (var y = 0; y < map.properties.width; y++) {
        for (var x = 0; x < map.properties.height; x++) {
          var t = map.data.get(x, y);

          if (t === placeHolderA || t === placeHolderB) {
            //Fill up and down if they're 0
            if (isWall(map.data.get(x, y + 1))) {
              map.data.set(x, y + 1, wallTile);
             // map.data.set(x, y + 2, 2);
            }

            if (isWall(map.data.get(x, y - 1))) {
              map.data.set(x, y - 1, wallTile);
              //map.data.set(x, y - 1, 2);
            }

            if (isWall(map.data.get(x + 1, y))) {
              map.data.set(x + 1, y, wallTile);
            }

            if (isWall(map.data.get(x - 1, y))) {
              map.data.set(x - 1, y, wallTile);
            }
          } 
        }
      }

      //And again..
      for (var y = 0; y < map.properties.width; y++) {
        for (var x = 0; x < map.properties.height; x++) {
          var t = map.data.get(x, y);

          if (t === placeHolderA || t === placeHolderB) {
            map.data.set(x, y, floorTile);
          } 
        }
      }

      fillRooms(true);

      map.properties.enableDrawing = true;

      for (var y = 0; y < map.properties.width; y++) {
        for (var x = 0; x < map.properties.height; x++) {
          bc = 0;

          t = map.data.get(x, y);

          //If there are 2 blanks and 2 walls adjacent, set t to 1
          

          map.data.set(x, y, t);
          //If this is a wall, and there's ground below, add shadow
          if (t === 1 && (map.data.get(x, y + 1) === 0 || map.data.get(x, y + 1) === 4)) {
            map.data.set(x, y + 1, 2);
          }
        }
      }
    }

    function decorate(allowed) {

    }

    exports = {
      decorate: decorate,
      createWalls: createWalls,
      splitType: splitType,
      px: px,
      py: py,
      fillRooms: fillRooms,
      children: children,      
      generate: generate,
      subdivide: subdivide,
      getRoomFromChildren: getRoomFromChildren,
      roomWidth: function () { return roomWidth; },
      roomHeight: function() { return roomHeight; }
    };

    return exports;
  }


  function generate() {
    var n = Node(1, 1, map.properties.width, map.properties.height).subdivide();

    map.properties.enableDrawing = false;


    n.generate(); 
    n.fillRooms();
    n.createWalls();
  }

  return {
    generate: generate
  }

};