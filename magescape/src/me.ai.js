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


me.AI = function (map, attributes) {
  var actor = me.Actor(map, me.merge({
        tileIndex: map.tileset().getTile(5),
        type: 'ranged'
      }, attributes)),
      sleeping = true,
      otile = actor.properties.tileIndex
  ;

  if (actor.properties.type === 'ranged') {
    actor.properties.tileIndex = map.tileset().getTile(5);
  } else if (actor.properties.type === 'melee') {
    actor.properties.tileIndex = map.tileset().getTile(6);
  } else {
    actor.properties.tileIndex = map.tileset().getTile(7)
  }

  function fire() {
    var p = map.projectiles.fire({
          pos: actor.pos(),
          dir: {
            x: actor.dir.x,
            y: actor.dir.y
          },
          speed: 1,
          tileIndex: 121
        }, actor)
    ;
    p.on('Hit', function (other) {
      if (other === map.player()) {
        other.kill();        
      }
    });
  }

  function dist() {
    var xd = map.player().pos().x - actor.pos().x;
    var yd = map.player().pos().y - actor.pos().y;
    return Math.sqrt(xd * xd + yd * yd);
  }

  function turnTowardsPlayer() {
    var pp = map.player().pos();

    actor.dir.x = pp.x - actor.pos().x;
    actor.dir.y = pp.y - actor.pos().y;


    if (actor.dir.x > 1) actor.dir.x = 1;
    if (actor.dir.x < -1) actor.dir.x = -1;
    if (actor.dir.y > 1) actor.dir.y = 1;
    if (actor.dir.y < -1) actor.dir.y = -1;

    console.log(actor.dir);

  }

  actor.on('Turn', function () {

    var mroll = Math.round(Math.random() * 100),
        droll = Math.random(),
        pp = map.player().pos(),
        p = actor.pos(),
        facingWall,
        facingTile,
        ranged = actor.properties.type != 'melee'
    ;

    if (sleeping) {
      //Check if we should wake up
      if (dist() < 10) {
        sleeping = false;
      }
      return;
    }

    //If the player is in range, wake up from slumber.
    turnTowardsPlayer();
    facingTile = map.data.get(p.x + actor.dir.x, p.y + actor.dir.y);
    facingWall = facingTile == 1 || facingTile == 2;

    //Move into firing position

    //Ranged AI
    if (mroll < 80) {    
      if (actor.properties.type !== 'ranged' && dist() === 1 && mroll < 80) {
        //console.log('Mellee killed the player');
        map.player().kill();
      } else if (ranged && !facingWall && (pp.x == p.x || pp.y == p.y) && mroll < 20) {
        fire();
      } else if (droll < 0.5 && (actor.properties.type !== 'ranged' || pp.y != p.y)) {
        if (pp.x > p.x) actor.moveRight();
        else if (pp.x < p.x) actor.moveLeft();        
      } else if (droll > 0.5 && (actor.properties.type !== 'ranged' || pp.x != p.x)) {
        if (pp.y > p.y) actor.moveDown();
        else if (pp.y < p.y) actor.moveUp();        
      }
    }

  });

  actor.on('Frozen', function () {
    actor.properties.tileIndex = 179;
  });

  actor.on('UnFrozen', function () {
    actor.properties.tileIndex = otile;
  });


  return actor;
};