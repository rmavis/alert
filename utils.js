/*

  These are scraps. A place for them might become apparent at some
  point, but currently they are floating.

  setCssTransform: function(elem, xpos, ypos) {
  elem.style.webkitTransform = 'translate(' + xpos +', ' + ypos + ')';
  elem.style.mozTransform = 'translate(' + xpos +', ' + ypos + ')';
  elem.style.msTransform = 'translate(' + xpos +', ' + ypos + ')';
  elem.style.transform = 'translate(' + xpos +', ' + ypos + ')';
  },



  isMouseOffTarget: function(evnt, trgt) {
  var ret = null,
  targ = null;

  if ((typeof evnt == 'object') && (trgt)) {
  if (evnt.type == 'mouseout') {
  targ = evnt.relatedTarget || evnt.fromElement;
  }
  else if (evnt.type == 'mouseover') {
  targ = evnt.target;
  }

  if (targ) {
  while ((targ != trgt) && (targ != document.body) && (targ != document)) {
  targ = targ.parentNode;
  }
  }
  ret = (targ == trgt) ? false : true;
  }

  return ret;
  },



  // From http://javascript.info/tutorial/animation
  animate: function(opts) {
  var start = new Date;

  var id = setInterval(function() {
  var timePassed = new Date - start;
  var progress = timePassed / opts.duration;

  if (progress > 1) {progress = 1;}

  var delta = opts.delta(progress);
  opts.step(delta);

  if (progress == 1) {clearInterval(id);}
  }, opts.delay || 10);    
  },


  quad: function(progress) {
  return Math.pow(progress, 4)
  },

*/


var Utils = (function () {

    function nestObject(keys, end_val) {
        var ret = { };

        if (keys.length == 1) {
            if (keys[0] in ret) {
                if (!(typeof end_val == 'undefined')) {
                    if (end_val.constructor == Object) {
                        ret[keys[0]] = merge(ret[keys[0]], end_val);
                    }
                    else {
                        ret[keys[0]] = end_val;
                    }
                }
            }
            else {
                ret[keys[0]] = (typeof end_val == 'undefined') ? { } : end_val;
            }
        }
        else {
            ret[keys[0]] = nestObject(keys.slice(1), end_val);
        }

        return ret;
    }



    function merge(obj1, obj2) {
        for (var key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                if ((obj1[key]) &&
                    (obj1[key].constructor == Object) &&
                    (obj2[key].constructor == Object)) {
                    obj1[key] = merge(obj1[key], obj2[key]);
                }
                else {
                    obj1[key] = obj2[key];
                }
            }
        }

        return obj1;
    }



    function sieveObjects(obj1, obj2) {
        var new_obj = { };

        for (var key in obj1) {
            if (obj1.hasOwnProperty(key)) {
                if (obj2.hasOwnProperty(key)) {
                    if (obj1[key] === null) {
                        new_obj[key] = obj2[key];
                    }

                    else if ((obj1[key].constructor == Object) &&
                             (obj2[key].constructor == Object)) {
                        new_obj[key] = sieveObjects(obj1[key], obj2[key]);
                    }

                    else {
                        new_obj[key] = obj2[key];
                    }
                }

                else {
                    new_obj[key] = obj1[key];
                }
            }
        }

        return new_obj;
    }



    function getElemsByAttrs(elem, attrs) {
        var elems = [ ];

        if (elem.tagName) {
            var inc = true;

            for (var key in attrs) {
                if (!(check = elem.getAttribute(key)) ||
                    (check != attrs[key])) {
                    inc = false;
                }
            }

            if (inc) {
                elems.push(elem);
            }
            else if (elem.childNodes) {
                var checks = elem.childNodes;
                for (var o = 0, m = checks.length; o < m; o++) {
                    elems = elems.concat(getElemsByAttrs(checks[o], attrs));
                }
            }
        }

        return elems;
    }





    /*
     * Public methods.
     */
    return {

        // This is a modified version of the procedure found here:
        // http://stackoverflow.com/questions/912596/how-to-turn-a-string-into-a-javascript-function-call
        // Rather than produce a callable function and then call it with supplied arguments,
        // this just returns the function.
        stringToFunction: function(functionName, context) {
            context = (typeof context == 'undefined') ? window : context;

            var namespaces = functionName.split('.');
            var func = namespaces.pop();

            for (var o = 0, m = namespaces.length; o < m; o++) {
                context = context[namespaces[o]];
            }

            if (typeof context[func] == 'function') {
                return context[func];
            }
            else {
                return false;
            }
        },



        buildNestedObject: function(keys, end_val) {
            return nestObject(keys, end_val);
        },



        mergeObjects: function(obj1, obj2) {
            return merge(obj1, obj2);
        },



        // Pass this two objects. It will return a copy of `obj1`
        // but with the values of matching keys from `obj2`.
        sieve: function(obj1, obj2) {
            return sieveObjects(obj1, obj2);
        },



        // Pass this an array of keys, an array of objects, a
        // function to perform on each member of the object array,
        // and a function to perform on the members of resulting
        // object before it's returned.
        makeDataObj: function(key_arr, obj_arr, obj_fx, key_fx) {
            obj_fx = (typeof obj_fx == 'function') ? obj_fx : false;
            key_fx = (typeof key_fx == 'function') ? key_fx : false;

            var ret = { };

            for (var o = 0, m = key_arr.length; o < m; o++) {
                var key = key_arr[o],
                    arr = [ ];

                for (var i = 0, n = obj_arr.length; i < n; i++) {
                    if (obj_arr[i].hasOwnProperty(key)) {
                        if (obj_fx) {
                            arr.push(obj_fx(obj_arr[i][key]));
                        }
                        else {
                            arr.push(obj_arr[i][key]);
                        }
                    }
                }

                ret[key] = (key_fx) ? key_fx(arr) : arr;
            }

            console.log("Made data object:");
            console.log(ret);

            return ret;
        },



        makeNumber: function(x) {
            var num = 0;

            // So we know it's not nothing.
            if (x) {
                if (typeof x == 'number') {
                    num = x;
                }

                else if (typeof x == 'string') {
                    if (x.match(/[, ]/)) {
                        num = x.replace(/[, ]/g, '');
                    }

                    num = (x.match(/\./))
                        ? parseFloat(x)
                        : parseInt(x);
                }

            }

            return num;
        },



        getNearestParentByTagname: function(source, tagname) {
            var elem = source;

            while ((!elem.tagName) ||
                   ((elem.tagName.toLowerCase() != tagname) &&
                    (elem != document.body))) {
                elem = elem.parentNode;
            }

            if (elem == document.body) {return false;}
            else {return elem;}
        },



        getNearestParentByClassname: function(source, check_class, attr_name) {
            if (typeof attr_name == 'undefined') {
                attr_name = 'class';
            }

            var elem = source,
                found = false;

            while ((!found) && (elem != document.body)) {
                if ((elem.hasAttribute(attr_name)) &&
                    (elem.getAttribute(attr_name).split(' ').indexOf(check_class) > -1)) {
                    found = true;
                }
                
                if (!found) {
                    elem = elem.parentNode;
                }
            }

            if (found) {
                return elem;
            }
            else {
                return found;
            }
        },



        getElementsByAttributes: function(elem, attrs) {
            return getElemsByAttrs(elem, attrs);
        },



        addListeners: function(elems, func, event_type) {
            event_type = (typeof event_type == 'undefined') ? 'click' : event_type;
            var m = elems.length;

            for (var o = 0; o < m; o++) {
                elems[o].addEventListener(event_type, func, false);
            }
        },



        // This ensures the given URL starts with `http://` or `https:/`.
        prefixUrl: function(url) {
            // http:// == 0-6
            if (url.substring(0, 6) == window.location.origin.substring(0, 6)) {
                return url;
            }
            else {
                if (url[0] == '/') {
                    return window.location.origin + url;
                }
                else {
                    return window.location.origin + '/' + url;
                }
            }
        },



        makeElement: function(tagname, attrs, content) {
            var elem = document.createElement(tagname);

            for (var key in attrs) {
                if (attrs.hasOwnProperty(key)) {
                    elem.setAttribute(key, attrs[key]);
                }
            }

            if ((typeof content !== 'undefined') && (content)) {
                if (typeof content == 'object') {
                    elem.appendChild(content);
                }
                else {
                    elem.innerHTML = content;
                }
            }

            return elem;
        },



        // From http://www.shamasis.net/2009/09/fast-algorithm-to-find-unique-items-in-javascript-array/
        unique: function(array) {
            var o = {}, i, l = array.length, r = [];
            for (i=0; i<l; i++) {o[array[i]] = array[i];}
            for (i in o) {r.push(o[i]);}
            return r;
        },



        average: function(array) {
            var m = 0,
                n = 0;

            for (var o = 0, x = array.length; o < x; o++) {
                if (typeof array[o] == 'number') {
                    n += array[o];
                    m += 1;
                }
            }

            return (n / m);
        }

    };

})();
