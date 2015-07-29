/* ALERT
 *
 * This is a function for creating good-looking alerts.
 *
 * Here's an example:
 * Alert({
 *     message: 'Do you want to see another alert?',
 *     callback: seeMoreAlerts,
 *     opts: [
 *         {txt: "yes", val: true},
 *         {txt: "no", val: false, esc: true}
 *     ]
 * });
 *
 * With the default configuration, this call will create this HTML:
 * <div id="alert-scr">
 *   <div id="alert-win">
 *     <div id="alert-msg">Do you want to see another alert?</div>
 *     <div id="alert-btns-wrap">
 *       <div class="alert-btn" value="0" style="width: 50%;">yes</div>
 *       <div class="alert-btn" value="1" style="width: 50%;">no</div>
 *     </div>
 *   </div>
 * </div>
 * and appended it to `document.body`. If the user clicks one of the
 * buttons, the true/false value associated with that button will be
 * passed to the callback function `seeMoreAlerts`. But if the user
 * clicks the area outside the `alert-win` element or hits the escape
 * key, then "false" will be sent to `seeMoreAlerts`.
 *
 * Definitions of terms:
 * - The "screen" element will contain the "window". It is the
 *   background to the element that contains the alert's message and
 *   button(s).
 * - The "window" is the element that contains the alert's message
 *   and its button(s).
 * - The "message" is the message.
 * - The "buttons" element contains at least one "button" element
 *   that the user can click. You can control the number of buttons
 *   and the values associated with each via the `opts` array in the
 *   parameter. If no `opts` are passed, a button will be created
 *   using default values.
 *
 * To make your alert look good, you need to use CSS. The relevant
 * CSS entries are included in the `this.defaults` object, and are:
 * - screen: ID (`id`) and class name (`cssClass`)
 * - window: ID and class name
 * - message: ID and class name
 * - buttons: ID and class name
 * - button: class name, a boolean indicating whether the buttons
 *   should have equal widths, and the default button text if no
 *   options are passed
 *
 * The IDs and class names are both optional, but at least one
 * should be given. These should match CSS IDs and classes.
 *
 * The `screen` object can also have a `toggleClass` key. If this is
 * set, then that value will be added to the screen element after
 * it is appended to the target element and then removed before the
 * screen is removed. This is useful for triggering CSS transitions.
 *
 * The other configuration options are:
 * - target: the element that will receive the alert element.
 *   This defaults to `document.body`.
 * - values: defaultOk, which is the default value returned when the
 *   user clicks the default OK button (created if no `opts` are
 *   passed), and defaultEsc, which is the default value returned
 *   when the escape key is pressed.
 * - dismissDelay: the number of milliseconds to wait before
 *   removing the screen element from the target. This is useful for
 *   triggering CSS transitions.
 *
 * All configuration options are in the `this.defaults` object.
 *
 * To create a new alert, call `Alert` with an object as the
 * parameter. The parameter should contain these keys:
 * - message (required): the text/HTML body of the alert.
 * - opts (optional): an array of objects, each with these keys:
 *   - txt (required): the text displayed on the button.
 *   - val (required): the value associated with the button.
 *   - esc (optional): a boolean indicating whether to use this
 *     value as the parameter to the callback if the user hits
 *     the escape key.
 *   If no `opts` are passed, then a button will be created that
 *   displays the text in `this.defaults.button.defaultOk`. If a
 *   callback is given, then this value will be passed to that,
 *   unless the user escapes, in which case it will be passed the
 *   value in `this.conf.values.defaultEsc`.
 * - callback (optional): a function to call when dismissing the
 *   alert.
 *
 * There can be any number of objects in the `opts` array. The `val`
 * of the button clicked will be passed to the callback.
 *
 * If the `esc` value is set to true on one of the `opts`, then that
 * value will be passed to the callback when the user dismisses the
 * alert by hitting escape or by clicking the "screen" outside the
 * "window".
 */


var MakeAlert = (function () {

    var defaults = {
        target: {
            target: document.body
        },

        screen: {
            cssClass: 'alert-scr',
            toggleClass: 'alert-fade'
        },

        window: {
            cssClass: 'alert-win'
        },

        message: {
            cssClass: 'alert-msg'
        },

        buttons: {
            cssClass: 'alert-btns-wrap',
        },

        button: {
            cssClass: 'alert-btn',
            equalWidths: true,
            defaultOk: 'okay'
        },

        values: {
            defaultOk: true,
            defaultEsc: false
        },

        dismissDelay: 200
    };


    var act = {
        text: null,
        callback: null,
        opts: null
    };


    var vals = {
        opts: null,
        esc: null
    };


    var elems = {
        screen: null,
        window: null,
        message: null,
        buttons: null
    };


    var conf = null,
        caller = null;



    function make(obj) {
console.log(obj);
console.log(defaults);
        if ((typeof obj == 'object') && ('text' in obj)) {
            initObjs(obj);
            buildParts();
            addListeners();
            displayAlert();
        }
    };



    function initObjs(confobj) {
        act = fillObj(act, confobj);
console.log("Act is now:");
console.log(act);
console.log(defaults);
        conf = fillObj(defaults, confobj);
console.log("Conf is now:");
console.log(conf);
    }



    function clearObjs() {
        act = fillObj(act);
        conf = fillObj(conf);
    }



    function fillObj(obj, refobj) {
        var ret = obj;
console.log("Filling object:");
console.log(obj);
console.log("With reference:");
console.log(refobj);
        if (typeof refobj == 'undefined') {
console.log("Undefined reference object");
            for (var key in ret) {
                if (ret.hasOwnProperty(key)) {
                    if (typeof ret[key] == 'object') {
                        ret[key] = fillObj(ret[key]);
                    } else {
                        ret[key] = null;
                    }
                }
            }
        }

        else {
            for (var key in ret) {
                if ((ret.hasOwnProperty(key)) &&
                    (refobj.hasOwnProperty(key))) {
console.log("Filling key: " + key);
                    if (typeof refobj[key] == 'object') {
                        ret[key] = fillObj(ret[key], refobj[key]);
                    } else {
                        ret[key] = refobj[key];
                    }
                }
            }
        }

        return ret;
    }



    function buildParts() {
        for (var key in elems) {
            if (elems.hasOwnProperty(key)) {
                elems[key] = applyCssParts(document.createElement('div'),
                                           conf[key]);
            }
        }

        elems.message.innerHTML = act.text;

        buildOpts();
    };



    function applyCssParts(elem, obj) {
        if (obj.cssClass) {elem.className = obj.cssClass;}
        if (obj.id) {elem.id = obj.id;}
        return elem;
    };



    function buildOpts() {
        if (!act.opts) {
            act.opts = [
                {txt: conf.button.defaultOk,
                 val: conf.values.defaultOk}
            ];
        }

        vals.esc = conf.values.defaultEsc;
        vals.opts = [ ];

        var btnsCount = act.opts.length;
        var btnWidth = (conf.button.equalWidths)
            ? equalButtonWidthPercent()
            : 'auto';

        for (var o = 0; o < btnsCount; o++) {
            var btn = document.createElement('div');

            btn.className = conf.button.cssClass;
            btn.innerHTML = act.opts[o].txt;
            btn.setAttribute('value', o);
            btn.style.width = btnWidth;

            elems.buttons.appendChild(btn);
            vals.opts.push(act.opts[o].val);

            if (act.opts[o].esc) {
                vals.esc = act.opts[o].val;
            }
        }
    };



    function displayAlert() {
        elems.window.appendChild(elems.message);
        elems.window.appendChild(elems.buttons);
        elems.screen.appendChild(elems.window);
        conf.target.appendChild(elems.screen);

        if (conf.screen.toggleClass) {
            window.setTimeout(alertApplyScreenToggleClass,
                              0,
                              elems.screen,
                              conf.screen.toggleClass);
        }
    };



    function alertApplyScreenToggleClass(elem, classname) {
        elem.className += ' ' + classname;
    }



    function addListeners() {
        var btns = elems.buttons.childNodes;
        for (var o = 0, n = btns.length; o < n; o++) {
            btns[o].addEventListener('click', handleAlertEvent, false);
        }

        elems.screen.addEventListener('click', handleAlertEvent, false);
        window.addEventListener('keydown', handleAlertEvent, false);
    };



    function removeListeners() {
        // The other listeners don't need to be removed
        // because the elements will be removed.
        window.removeEventListener('keydown', this);
    };



    function handleAlertEvent(evt) {
        if (!evt) {var evt = window.event;}

        evt.stopPropagation();

        var eventType = evt.type,
            caller = false,
            dismiss = false,
            isEsc = false;

        if (eventType == 'click') {
            caller = getCallerFromEvent(evt);
            if (caller) {
                isEsc = (caller == elems.screen) ? true : false;
                dismiss = true;
            }
            else {
                // console.log("Couldn't get caller from click event.");
            }
        }
        else if (eventType == 'keydown') {
            if (evt.keyCode == 27) {  // The esc key.
                dismiss = true;
                isEsc = true;
            }
        }
        else {
            console.log("Unhandled event type: " + eventType);
        }

        if (dismiss) {
            if (isEsc) {sendToCallback(vals.esc);}
            else {sendToCallback(getButtonValue(caller));}
            removeAlert();
        }
    }



    function getCallerFromEvent(event) {
        caller = (event.target) ? event.target : event.scrElement;

        if (caller == elems.screen) {
            return caller;
        }
        else {
            // If the use clicks, eg, the message, then this
            // will bubble all the way to the document.body.
            while ((caller != document.body) &&
                   (caller.className != conf.button.cssClass)) {
                caller = caller.parentNode;
            }

            // And if that's true, the event handler shouldn't respond.
            if (caller == document.body) {return false;}
            else {return caller;}
        }
    }



    function getButtonValue(button) {
        return vals.opts[parseInt(button.getAttribute('value'))];
    }



    function sendToCallback(val) {
        if (act.callback) {
            act.callback(val);
        }
    };



    function removeAlert() {
        // This triggers the CSS transition.
        if (conf.screen.toggleClass) {
            applyCssParts(elems.screen, conf.screen);
        }

        window.setTimeout(removeAlertScreenFromTarget,
                          conf.dismissDelay);
    };



    function removeAlertScreenFromTarget() {
        conf.target.removeChild(elems.screen);
        reset();
    }



    function reset() {
        clearObjs();
        removeListeners();
    };



    function equalButtonWidthPercent() {
        if (act.opts) {
            return (100 / act.opts.length) + '%';
        } else {
            return '100%';
        }
    };





    /*
     * Public methods.
     */
    return {
        message: function(msg) {
            return make({text: msg});
        },

        with: function(conf) {
            return make(conf);
        }
    };
})();




function Alert(params) {
    if (typeof params == 'string') {
        return MakeAlert.message(params);
    }
    else {
        return MakeAlert.with(params);
    }
}
