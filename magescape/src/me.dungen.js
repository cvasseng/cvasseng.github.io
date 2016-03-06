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
      for (var i = -1; i <= hx="" +="" 2;="" i++)="" {="" map.data.set(fx="" i,="" fy="" ,="" placeholdera);="" 1,="" }="" now="" go="" the="" rest="" of="" way="" at="" ty="" for="" (var="" i="0;" <="hx" 1;="" from="" halfway="" x="" and="" up="" to="" -="" fy;="" if="" (map.data.get(fx="" hx,="" i)="" !="=" placeholdera)="" placeholderb);="" var="" c="map.canvas.getContext('2d');" c.strokestyle="#AA3333" ;="" c.beginpath();="" c.moveto(fx="" *="" map.properties.drawsize,="" map.properties.drawsize);="" c.lineto(tx="" c.closepath();="" c.stroke();="" function="" generate()="" ra="0," seed="1," casters="0," melee="0," i;="" (children.length="=" 2)="" children.foreach(function="" (child)="" child.generate();="" });="" connectchildren();="" else="" console.log('final="" room="" size',="" width,="" height);="" roomwidth="width" (math.round(math.random()="" (width="" 2)))="" roomheight="height" (height="" top="" bottom="" i++){="" map.data.set(px="" py="" walltile);="" py,="" 2);="" roomheight,="" left="" right="" map.data.set(px,="" roomwidth,="" (parent.children[1]="==" exports)="" connectchildren(parent.children[0],="" parent.children[1]);="" calculate="" area="" this="" will="" be="" used="" figure="" out="" how="" many="" enemies="" place="" roomheight;="" (ra=""> 60) {
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
        if (Math.random() </=>