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

me.Projectile = function (attrs, map, originator) {
  var properties = me.merge({
        dir: {
          x: 0, 
          y: 0
        },
        pos: {x: 0, y: 0},
        speed: 2,
        range: 3,
        tileIndex: 29
      }, attrs),
      pos = {
        x: properties.pos.x,// + properties.dir.x,
        y: properties.pos.y// + properties.dir.y
      },
      opos = {
        x: pos.x, 
        y: pos.y
      },
      events = me.Events()
  ;

  /////////////////////////////////////////////////////////////////////////////

  //Process the projectile - return false if inactive
  function processTurn() {
    var nx, ny, ac, s;

    s = properties.speed;

    while (s > 0) {      
      nx = pos.x + properties.dir.x;
      ny = pos.y + properties.dir.y;
      ac = map.actors.collision(nx, ny);
      

      if (ac !== false && ac.properties.id !== originator.properties.id) {        
        events.emit('Hit', ac);      
        events.emit('Kill', ac); 
        return false;
      }

      if (map.data.collision(nx, ny)) {
        events.emit('Kill', ac); 
        return false;
      }

      pos.x = nx;
      pos.y = ny;
      
      events.emit('Step');

      opos.x = pos.x;
      opos.y = pos.y;
      
      s--;
    }

    return true;
  }

  /////////////////////////////////////////////////////////////////////////////
  
  return {
    on: events.on,
    processTurn: processTurn,
    properties: properties,
    pos: function() { return pos; },
    opos: function () { return opos; }
  }
};