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

var me = {
  //Merge two objects
  merge: function (a, b) {
    if (!a || !b) return a || b;    
    Object.keys(b).forEach(function (bk) {
     if (me.isNull(b[bk]) || me.isBasic(b[bk])) {
        a[bk] = b[bk];
     } else if (me.isArr(b[bk])) {
       
       a[bk] = [];
       
       b[bk].forEach(function (i) {
         if (me.isNull(i) || me.isBasic(i)) {
           a[bk].push(i);
         } else {
           a[bk].push(me.merge({}, i));
         }
       });
       
     } else {
        a[bk] = me.merge({}, b[bk]);
      }
    });    
    return a;
  },

  //Return true if what is null or undefined
  isNull: function (what) {
    return (typeof what === 'undefined' || what == null);
  },
  
  //Returns true if what is a string
  isStr: function (what) {
    return (typeof what === 'string' || what instanceof String);
  },
  
  //Returns true if what is a number
  isNum: function(what) {
    return !isNaN(parseFloat(what)) && isFinite(what);
  },
  
  //Returns true if what is a function
  isFn: function (what) {
    return (what && (typeof what === 'function') || (what instanceof Function));
  },
  
  //Returns true if what is an array
  isArr: function (what) {
    return (!me.isNull(what) && what.constructor.toString().indexOf("Array") > -1);
  },

  //Returns true if what is a bool
  isBool: function (what) {
    return (what === true || what === false);
  },
  
  //Returns true if what is a basic type 
  isBasic: function (what) {
    return !me.isArr(what) && (me.isStr(what) || me.isNum(what) || me.isBool(what) || me.isFn(what));
  },

  //Linear interpolation
  lerp: function(a, b, f) {
    return (a * (1 - f)) + (b * f);
  }
};