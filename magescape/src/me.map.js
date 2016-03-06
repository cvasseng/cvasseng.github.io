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

me.Map = function (attributes, tileset) {
  var properties = me.merge({
        tileSize: 24,
        drawSize: 64,
        width: 50,
        height: 50,
        wallTile: 27,
        enableDrawing: false,
        viewBox: {
          x: 0,
          y: 0,
          w: 1000,
          h: 1000
        }
      }, attributes),
      events = me.Events(),
      data = [],      
      canvas = document.createElement('canvas'),

      backgroundLayer = document.createElement('canvas'),
      spriteLayer = document.createElement('canvas'),
      projectileLayer = document.createElement('canvas'),
      indicatorLayer = document.createElement('canvas'),
      trapLayer = document.createElement('canvas'),
      bloodLayer = document.createElement('canvas'),
      fogLayer = document.createElement('canvas'),

      enableIndicators = false,

      ctx = canvas.getContext('2d'),
      sctx = spriteLayer.getContext('2d'),
      pctx = projectileLayer.getContext('2d'),
      actors = [],
      projectiles = [],
      traps = [],
      player = false,
      exports = {}
  ;

  /////////////////////////////////////////////////////////////////////////////

  //Start drawing functions

  function clear(pos, target) {
    var c = (target || canvas).getContext('2d');
    c.clearRect(
      pos.x * properties.drawSize,
      pos.y * properties.drawSize,
      properties.drawSize,
      properties.drawSize
    );
  }

  function indicatorsEnable(flag) {
    if (enableIndicators && flag === false) {
      indicatorLayer.getContext('2d').clearRect(0, 0, indicatorLayer.width, indicatorLayer.height);
      assemble();
    } 
    enableIndicators = flag;
  }

  function drawDirectionLine(from, to) {
    var c = indicatorLayer.getContext('2d');
    c.clearRect(0, 0, indicatorLayer.width, indicatorLayer.height);
    c.strokeStyle = '#AA3333';
    c.beginPath();
    c.moveTo(from.x * properties.drawSize, from.y  * properties.drawSize);
    c.lineTo(to.x  * properties.drawSize, to.y  * properties.drawSize);
    c.closePath();
    c.stroke();
    assemble();
  }

  function blitThing(thing, target) {
    if (tileset) {
      tileset.blit(
        target || canvas, 
        thing.properties.tileIndex, 
        thing.pos().x * properties.drawSize, 
        thing.pos().y * properties.drawSize, 
        properties.tileSize, 
        properties.drawSize, 
        properties.drawSize
      );
    }
  }

  function blitRaw(pos, tile, target) {
    if (tileset) {
      tileset.blit(
        target || canvas, 
        tile, 
        pos.x * properties.drawSize, 
        pos.y * properties.drawSize, 
        properties.tileSize, 
        properties.drawSize, 
        properties.drawSize
      );
    }
  }

  function redrawActors() {
    sctx.clearRect(0, 0, spriteLayer.width, spriteLayer.height);
    actors = actors.filter(function (actor) {
      var ft = actor.frozen();
      if (actor.isAlive()) {
        blitThing(actor, spriteLayer);
        if (ft > 0) {        
          sctx.fillStyle = '#FFF';
          sctx.strokeStyle = '#FFF';
          sctx.font = "14px 'Patrick Hand', serif";

          sctx.fillText (
            'Jelly ' + ft, 
            (actor.pos().x * properties.drawSize) + (properties.drawSize - (properties.drawSize / 2)) - 15, 
            (actor.pos().y * properties.drawSize) + 4
          );
        }
        return true;
      }
      return false;
    });
  }

   //Copy tile from one layer to the main layer
  function cpyTile(x, y, source) {
    ctx.drawImage(
      source,

      x * properties.drawSize,
      y * properties.drawSize,
      properties.drawSize,
      properties.drawSize,

      x * properties.drawSize,
      y * properties.drawSize,
      properties.drawSize,
      properties.drawSize
    );
  }

  //Copy current cullbox 
  function cpyBox(source) {
    ctx.drawImage(
      source,

      0,
      0,
      canvas.width,
      canvas.height,

      0,
      0,
      canvas.width,
      canvas.height

      // properties.viewBox.x,
      // properties.viewBox.y,
      // properties.viewBox.w,
      // properties.viewBox.h,

      // properties.viewBox.x,
      // properties.viewBox.y,
      // properties.viewBox.w,
      // properties.viewBox.h
    );
  }

  //Assemble the layers
  function assemble() {
    if (!properties.enableDrawing) {
      return;
    }

    ctx.clearRect(0, 0, indicatorLayer.width, indicatorLayer.height);
    cpyBox(backgroundLayer);
    if (enableIndicators) {
      cpyBox(indicatorLayer);      
    }
    cpyBox(bloodLayer);
    cpyBox(trapLayer);
    cpyBox(spriteLayer);
    if (projectiles.length > 0) {
      cpyBox(projectileLayer);
    }
  }

  //End drawing functions

  /////////////////////////////////////////////////////////////////////////////

  //Convert x,y to x + y * width
  function convert(x, y, fn) {
    if (x >= 0 && x < properties.width && y >= 0 && y < properties.height) {
      return fn(x + y * properties.width); 
    }
    return false;
  }

  //Get the tile index at a given coordinate
  function getTile(x, y) {
    return convert(x, y, function (index) {
      return data[index];
    });
  }

  //Set the tile index at a given coordinate
  function setTile(x, y, value) {
    convert(x, y, function (index) {
      data[index] = value;
      
      redraw(x, y, true);

      if (tileset.isNSensitive(value)) {
        //Update adjacent
        redraw(x - 1, y, true);
        redraw(x + 1, y, true);
        redraw(x, y - 1, true);
        redraw(x, y + 1, true);
      }
    });
  }

  function calcTileIndex(r, above, left, below, right) {
    var sum = 0;
    
    if (above === r) {
      sum += 1;
    } 
    
    if (left === r) {
      sum += 2;
    }
    
    if (below === r) {
      sum += 4;
    }

    if (right === r) {
      sum += 8;
    }

    return tileset.getTile(r, sum);
  };

  //Redraw a single tile
  function redraw(x, y, includeBgUpdate) {
    if (!properties.enableDrawing) {
      return;
    }

    if (!y && x && x.x && x.y) {
      y = x.y;
      x = x.x;
    }

    if (x < 0 || x >= properties.width || y < 0 || y >= properties.height) {
      return;
    }

    // if (x < properties.viewBox.x || 
    //     x > properties.viewBox.x + properties.viewBox.w ||
    //     y < properties.viewBox.y ||
    //     y > properties.viewBox.y + properties.viewBox.h
    // ) {
    //   return;
    // }

    //Blit to the background layer
    if (includeBgUpdate) {      
      convert(x, y, function (index) {
        var i = data[index],
            t
        ;

        if (tileset.isNSensitive(i)) {
          t = calcTileIndex(i, 
            data[x + (y - 1) * properties.width],
            data[(x - 1) + y * properties.width],
            data[x + (y + 1) * properties.width],
            data[(x + 1) + y * properties.width]
          );
        } else {
          t = tileset.getTile(i);
        }

        if (tileset) {
          tileset.blit(
            backgroundLayer, 
            t, 
            x * properties.drawSize, 
            y * properties.drawSize, 
            properties.tileSize, 
            properties.drawSize, 
            properties.drawSize
          );
        }
      });
    }

    //Blit background to the main layer
    cpyTile(x, y, backgroundLayer);

    cpyTile(x, y, bloodLayer);


    if (enableIndicators) {
      //Blit the indicator layer
      cpyTile(x, y, indicatorLayer);      
    }

    //Blit trap layer
    cpyTile(x, y, trapLayer);

    //Blit the sprite layer
    cpyTile(x, y, spriteLayer);

    if (projectiles.length > 0) {
      //Blit the projectile layer
      cpyTile(x, y, projectileLayer);      
    }

  }

  //Check for collision
  function collision(x, y) {
    //return false;
    return !convert(x, y, function (index) {
      return !tileset.isWall(data[index]);
    });
  }

  //Check for actor collision
  function actorCollision(x, y) {
    var res = false;
    actors.some(function (actor) {
      if (actor.pos().x === x && actor.pos().y === y) {
        res = actor;
        return true;
      }
    });

    return res;
  }

  function addPlayer(actor) {
    player = actor;
    return addActor(actor);
  }

  //Add actor
  function addActor(actor) {
    function redrawActor() {
      var ft = actor.frozen();

      //redrawActors();
      
      // if (actor.isAlive() && ft > 0) {        
      //   sctx.fillStyle = '#FFF';
      //   sctx.strokeStyle = '#FFF';
      //   sctx.font = "14px 'Patrick Hand', serif";

      //   sctx.fillText (
      //     'Frozen ' + ft, 
      //     (actor.pos().x * properties.drawSize) + (properties.drawSize - (properties.drawSize / 2)), 
      //     (actor.pos().y * properties.drawSize) - 12
      //   );
      // }

      //Draw the actor
      //clear(actor.opos(), spriteLayer);
      //blitThing(actor, spriteLayer);

      // redraw(actor.opos());
      // redraw(actor.pos());
    
     // assemble();
    }

    actor.on('Move', redrawActor);
    actor.on('Frozen', redrawActor);
    
    actor.on('Kill', function () {
      //Draw some blood
      blitRaw(actor.pos(), tileset.getTile(3), bloodLayer);
      //clear(actor.pos(), spriteLayer);
      redrawActors();
      //redraw(actor.pos());
      assemble();
    });

    actors.push(actor);
    redrawActor();
  }

  function fireProjectile(attr, originator) {
    var p = me.Projectile(attr, exports, originator);
    
    p.on('Step', function () {
      //Blit it
      clear(p.opos(), projectileLayer);
      clear(p.pos(), projectileLayer);
      
      blitThing(p, projectileLayer);
      
      redraw(p.opos().x, p.opos().y);
      redraw(p.pos().x, p.pos().y);
    });

    p.on('Kill', function () {
      clear(p.pos(), projectileLayer);
      clear(p.opos(), projectileLayer);
      redraw(p.pos().x, p.pos().y);
      redraw(p.opos().x, p.opos().y);
    });

    blitThing(p, projectileLayer);
    redraw(p.pos().x, p.pos().y);
    
    projectiles.push(p);
    return p;
  }

  function addTrap(owner, attributes) {
    var t = me.Trap(me.merge({
              pos: {
                x: owner.pos().x,
                y: owner.pos().y
              }
            }, attributes), 
            exports, 
            owner
        );

    function drawTrap() {
      var tctx = trapLayer.getContext('2d');

      clear(t.properties.pos, trapLayer);
      blitThing(t, trapLayer);

      tctx.fillStyle = '#FFF';
      tctx.strokeStyle = '#FFF';
      tctx.font = "14px 'Patrick Hand', serif";

      tctx.fillText (
        'Trap ' + t.properties.duration, 
        (t.pos().x * properties.drawSize) + (properties.drawSize - (properties.drawSize / 2)) - 15, 
        (t.pos().y * properties.drawSize) + (properties.drawSize - 24)
      );

      redraw(t.properties.pos.x, t.properties.pos.y);
    }

    t.on('Turn', drawTrap);

    t.on('Kill', function () {
      clear(t.properties.pos, trapLayer);
      redraw(t.properties.pos.x, t.properties.pos.y);
    });

    drawTrap();

    traps.push(t);
  }

  function processTurn() {
    var start = (new Date()).getTime();
    //Update projectiles
    projectiles = projectiles.filter(function (p) {
      return p.processTurn();
    });
    
    actors.forEach(function (actor) {
      actor.processTurn();
    });

    redrawActors();
    assemble();


    traps = traps.filter(function (t) {
      return t.processTurn();
    });

    console.log('Turn time:', ((new Date()).getTime() - start) / 1000 + 's');

  }

  /////////////////////////////////////////////////////////////////////////////

  //Init everything
  bloodLayer.width = trapLayer.width = projectileLayer.width = backgroundLayer.width = indicatorLayer.width = spriteLayer.width = canvas.width = properties.width * properties.drawSize;
  bloodLayer.height = trapLayer.height = projectileLayer.height = backgroundLayer.height = indicatorLayer.height = spriteLayer.height = canvas.height = properties.height * properties.drawSize;

  bloodLayer.getContext('2d').imageSmoothingEnabled = false;
  backgroundLayer.getContext('2d').imageSmoothingEnabled = false;
  projectileLayer.getContext('2d').imageSmoothingEnabled = false;
  spriteLayer.getContext('2d').imageSmoothingEnabled = false;
  trapLayer.getContext('2d').imageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  for (var i = 0; i < properties.width * properties.height; i++) {
    data.push(4);
  }

  exports = {
    canvas: canvas,
    on: events.on,
    properties: properties,
    clear: clear,
    processTurn: processTurn,
    indicators: {
      draw: drawDirectionLine,
      enable: indicatorsEnable
    },
    actors: {
      addPlayer: addPlayer,
      add: addActor,
      collision: actorCollision
    },
    data: {
      dirty: redraw,
      get: getTile,
      set: setTile,
      collision: collision
    },
    projectiles: {
      fire: fireProjectile
    },
    traps: {
      add: addTrap
    },
    tileset: function () { return tileset; },
    player: function () { return player; }
  };

  return exports;
};
