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


function Alert(params) {

    this.defaults = {
        target: document.body,

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



    this.initAction = function() {
        this.act = {
            message: null,
            callback: null,
            opts: null
        };

        this.vals = {
            opts: null,
            esc: null
        };

        this.elems = {
            screen: null,
            window: null,
            message: null,
            buttons: null
        };

        this.conf = null;
        this.caller = null;
        this.evt = null;
    };



    this.init = function(obj) {
        if ('message' in obj) {
            this.initAction();
            this.initConf(obj);

            this.act.message = obj.message;
            this.act.callback = ('callback' in obj) ? obj.callback : null;
            this.act.opts = ('opts' in obj) ? obj.opts : null;

            this.makeItHappen();
        }
    };



    this.initConf = function(obj) {
        this.conf = this.defaults;

        for (var key in obj) {
            if ((obj.hasOwnProperty(key)) &&
                (this.conf.hasOwnProperty(key)) &&
                (!this.act.hasOwnProperty(key))) {
                this.conf[key] = obj[key];
            }
        }
    };



    this.makeItHappen = function() {
        this.buildParts();
        this.addListeners();
        this.displayAlert();
    };



    this.buildParts = function() {
        for (var key in this.elems) {
            if (this.elems.hasOwnProperty(key)) {
                this.elems[key] = document.createElement('div');
                this.applyCssParts(this.elems[key], this.conf[key]);
            }
        }

        this.elems.message.innerHTML = this.act.message;

        this.buildOpts();
    };



    this.applyCssParts = function(elem, obj) {
        if (obj.cssClass) {elem.className = obj.cssClass;}
        if (obj.id) {elem.id = obj.id;}
    };



    this.buildOpts = function() {
        if (!this.act.opts) {
            this.act.opts = [
                {txt: this.conf.button.defaultOk,
                 val: this.conf.values.defaultOk}
            ];
        }

        this.vals.esc = this.conf.values.defaultEsc;
        this.vals.opts = [ ];

        var btnsCount = this.act.opts.length;
        var btnWidth = (this.conf.button.equalWidths)
            ? this.equalButtonWidthPercent()
            : 'auto';

        for (var o = 0; o < btnsCount; o++) {
            var btn = document.createElement('div');

            btn.className = this.conf.button.cssClass;
            btn.innerHTML = this.act.opts[o].txt;
            btn.setAttribute('value', o);
            btn.style.width = btnWidth;

            this.elems.buttons.appendChild(btn);
            this.vals.opts.push(this.act.opts[o].val);

            if (this.act.opts[o].esc) {
                this.vals.esc = this.act.opts[o].val;
            }
        }
    };



    this.displayAlert = function() {
        this.elems.window.appendChild(this.elems.message);
        this.elems.window.appendChild(this.elems.buttons);
        this.elems.screen.appendChild(this.elems.window);
        this.conf.target.appendChild(this.elems.screen);

        if (this.conf.screen.toggleClass) {
            // To trigger the transition.
            function alertApplyScreenToggleClass(elem, classname) {
                elem.className += ' ' + classname;
            }
            window.setTimeout(alertApplyScreenToggleClass,
                              0,
                              this.elems.screen,
                              this.conf.screen.toggleClass);
        }
    };



    this.addListeners = function() {
        var btns = this.elems.buttons.childNodes;
        for (var o = 0, n = btns.length; o < n; o++) {
            btns[o].addEventListener('click', this, false);
        }

        this.elems.screen.addEventListener('click', this, false);
        window.addEventListener('keydown', this, false);
    };



    this.removeListeners = function() {
        // The other listeners don't need to be removed
        // because the elements will be removed.
        window.removeEventListener('keydown', this);
    };



    this.handleEvent = function(evt) {
        if (!evt) {var evt = window.event;}
        this.evt = evt;

        this.evt.stopPropagation();
        // this.evt.preventDefault();

        var eventType = this.evt.type,
            dismiss = false,
            isEsc = false;

        if (eventType == 'click') {
            if (this.getCallerFromEvent()) {
                isEsc = (this.caller == this.elems.screen) ? true : false;
                dismiss = true;
            }
            else {
                // console.log("Couldn't get caller from click event.");
            }
        }
        else if (eventType == 'keydown') {
            if (this.evt.keyCode == 27) {  // The esc key.
                dismiss = true;
                isEsc = true;
            }
        }
        else {
            console.log("Unhandled event type: " + eventType);
        }

        if (dismiss) {
            if (isEsc) {this.escapeReturn();}
            else {this.valueReturn();}
            this.removeAlert();
        }
    };



    this.getCallerFromEvent = function() {
        this.caller = (this.evt.target) ? this.evt.target : this.evt.scrElement;

        if (this.caller == this.elems.screen) {
            return true;
        }
        else {
            // If the use clicks, eg, the message, then this
            // will bubble all the way to the document.body.
            while ((this.caller != document.body) &&
                   (this.caller.className != this.conf.button.cssClass)) {
                this.caller = this.caller.parentNode;
            }

            // And if that's true, the event handler shouldn't respond.
            if (this.caller == document.body) {return false;}
            else {return true;}
        }
    };



    this.valueReturn = function() {
        if (this.act.callback) {
            var pos = parseInt(this.caller.getAttribute('value')),
                val = this.vals.opts[pos];
            this.act.callback(val);
        }
    };



    this.escapeReturn = function() {
        if (this.act.callback) {
            this.act.callback(this.vals.esc);
        }
    };



    this.removeAlert = function() {
        // This triggers the CSS transition.
        if (this.conf.screen.toggleClass) {
            this.applyCssParts(this.elems.screen,
                               this.conf.screen);
        }

        // This removes the Alert element from the DOM.
        function alertRemoveScreenFromTarget(wrap, alert, done) {
            wrap.removeChild(alert);
            done();
        }

        window.setTimeout(alertRemoveScreenFromTarget,
                          this.conf.dismissDelay,
                          this.conf.target,
                          this.elems.screen,
                          this.reset.bind(this));
    };



    this.reset = function() {
        this.initAction();
        this.removeListeners();
    };



    this.equalButtonWidthPercent = function() {
        if (this.act.opts) {
            return (100 / this.act.opts.length) + '%';
        } else {
            return '100%';
        }
    };



    // This needs to stay down here.
    if (typeof params == 'object') {this.init(params);}
}
