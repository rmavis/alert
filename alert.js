/* ALERT
 * This is a function for creating good-looking alerts.
 *
 * All configuration options are in the `this.conf` object.
 *
 * To make the alert look good, you need to use CSS. The relevant
 * CSS entries are included in `this.conf`, and are:
 * - screenId: the ID of the screen element, which is the
 *   container for the "window" element.
 * - windowId: not the `window` object, but the ID of the
 *   element that will contain the message and the button(s).
 * - message.id: the ID of the element that will contain the
 *   message.
 * - buttonWrapId: the ID of the element that will contain
 *   the buttons. At least one button will exist.
 * - buttonClass: the class name for the buttons.
 *
 * The other configuration options are:
 * - target: the element that will receive the alert element.
 *   This defaults to `document.body`.
 * - okbuttonText: if no `opts` are passed at initialization,
 *   then this string will be used for the button that dismisses
 *   the alert.
 * - equalButtonWidths: a boolean determining whether to specify
 *   the widths of the buttons inline. The width will be a
 *   percentage, the result of dividing 100 by the number of
 *   options.
 * - defaultReturnValue: if a callback is specified at init but
 *   there are no options, then this value will be passed to
 *   the callback function.
 * - defaultEscReturnVal: identical to `defaultReturnValue` but
 *   this value will be passed to the callback if the user hits
 *   the escape key.
 *
 * To create a new alert, call `new Alert` with an object as
 * the parameter. The parameter can contain these keys:
 * - message (required): the text/HTML body of the alert.
 * - callback (optional): a function to call when dismissing the
 *   alert, either when one of the buttons is clicked or when
 *   the escape key it hit.
 * - opts (optional): an array of objects, each with these keys:
 *   - txt (required): the text displayed on the button.
 *   - val (required): the value associated with the button.
 *   - esc (optional): a boolean indicating whether to use this
 *     value as the parameter to the callback if the user hits
 *     the escape key.
 *
 * There can be any number of objects in the `opts` array. The
 * `val` of the button clicked will be passed to the callback.
 *
 * So the result from this initialization:
 * new Alert({
 *     message: 'Do you want to remove this item from your cart?',
 *     callback: this.removeItemFromCart.bind(this),
 *     opts: [
 *         {txt: "keep", val: false},
 *         {txt: "remove", val: true}
 *     ]
 * });
 * with this config:
 * this.conf = {
 *     target: document.body,
 *     screenId: 'alert-scr',
 *     windowId: 'alert-win',
 *     message.id: 'alert-msg',
 *     buttonWrapId: 'alert-btns-wrap',
 *     buttonClass: 'alert-btn',
 *     okButtonText: 'okay',
 *     equalButtonWidths: true,
 *     defaultReturnValue: true
 * };
 * will be this element:
 * <div id="alert-scr">
 *   <div id="alert-win">
 *     <div id="alert-msg">Do you want to remove this item from your cart?</div>
 *     <div id="alert-btns-wrap">
 *       <div class="alert-btn" value="1" style="width: 50%;">keep</div>
 *       <div class="alert-btn" value="0" style="width: 50%;">remove</div>
 *     </div>
 *   </div>
 * </div>
 * appended to `document.body`.
 *
 * If the user clicks the `keep` button, then the bound function
 * `removeItemFromCart` will be called with `true` as the parameter.
 * 
 * If the user hits the escape key, then no callback will be triggered.
 * However, if one change is made:
 * {txt: "keep", val: false, esc: true},
 * then `removeItemFromCart` will be called with `false` as the parameter.
 */


function Alert(params) {

    this.conf = {
        // The element that will receive the screen element.
        target: document.body,

        // The screen element, which will contain the window.
        screen: {
            id: 'alert-scr',
            cssClass: 'alert-on'
        },

        // The element that will contain the message and the buttons.
        window: {
            id: 'alert-win',
            cssClass: 'alert-on'
        },

        // The ID of the element that will contain the message.
        message: {
            id: 'alert-msg'
        },

        buttons: {
            wrapElemId: 'alert-btns-wrap',
            cssClass: 'alert-btn',
            equalWidths: true,
            okText: 'okay'
        },

        values: {
            // The value returned by the default "ok" button.
            defaultOk: true,
            // The value returned when the user doesn't click a button.
            defaultEsc: false
        },

        // The milliseconds to delay before removing the screen from the target.
        dismissDelay: 500
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

        this.caller = null;
        this.evt = null;
    };



    this.init = function(pobj) {
        if ('message' in pobj) {
            this.initAction();

            this.act.message = pobj.message;
            this.act.callback = ('callback' in pobj) ? pobj.callback : null;
            this.act.opts = ('opts' in pobj) ? pobj.opts : null;

            this.makeItHappen();
        }
    };



    this.reset = function() {
        this.initAction();
        this.removeListeners();
        // this.elems.screen = null;
        // this.elems.window = null;
        // this.elems.message = null;
        // this.elems.buttons = null;
        // this.vals.opts = null;
        // this.caller = null;
        // this.vals.esc = null;
        // this.evt = null;
    };



    this.makeItHappen = function() {
        this.buildParts();
        this.addListeners();
        this.displayAlert();
    };



    this.buildParts = function() {
        var screen = document.createElement('div');
        screen.id = this.conf.screen.id;
        this.elems.screen = screen;

        var win = document.createElement('div');
        win.id = this.conf.window.id;
        this.elems.window = win;

        var msg = document.createElement('div');
        msg.id = this.conf.message.id;
        msg.innerHTML = this.act.message;
        this.elems.message = msg;

        var optsBox = document.createElement('div');
        optsBox.id = this.conf.buttons.wrapElemId;
        this.elems.buttons = optsBox;

        this.buildOpts();
    };



    this.buildOpts = function() {
        if (!this.act.opts) {
            this.act.opts = [
                {txt: this.conf.buttons.okText,
                 val: this.conf.values.defaultOk}
            ];
        }

        var btnsCount = this.act.opts.length;
        var btnWidth = (this.conf.buttons.equalWidths)
            ? this.equalButtonWidthPercent()
            : 'auto';

        this.vals.opts = [ ];

        for (var o = 0; o < btnsCount; o++) {
            var btn = document.createElement('div');

            btn.className = this.conf.buttons.cssClass;
            btn.innerHTML = this.act.opts[o].txt;
            btn.setAttribute('value', o);
            btn.style.width = btnWidth;

            this.elems.buttons.appendChild(btn);
            this.vals.opts.push(this.act.opts[o].val);

            if (this.act.opts[o].esc) {
                this.vals.esc = this.act.opts[o].val;
            }
        }

        this.vals.esc = this.conf.values.defaultEsc;
    };



    this.displayAlert = function() {
        this.elems.window.appendChild(this.elems.message);
        this.elems.window.appendChild(this.elems.buttons);
        this.elems.screen.appendChild(this.elems.window);
        this.conf.target.appendChild(this.elems.screen);
        this.elems.screen.className = this.conf.screen.cssClass;
    };



    this.addListeners = function() {
        for (var o = 0, n = this.elems.buttons.childNodes.length; o < n; o++) {
            this.elems.buttons.childNodes[o].addEventListener('click', this, false);
        }

        window.addEventListener('keydown', this, false);
    };



    this.removeListeners = function() {
        // The other listeners don't need to be removed
        // because the object gets removed.
        window.removeEventListener('keydown', this);
    };



    this.handleEvent = function(evt) {
        if (!evt) {var evt = window.event;}
        this.evt = evt;

        this.evt.stopPropagation();
        // this.evt.preventDefault();

        var eventType = this.evt.type;

        if (eventType == 'click') {
            if (this.getCallerFromEvent()) {
                this.handleReturn();
                this.removeAlert();
            }
            else {
                console.log("Couldn't get caller from click event.");
            }
        }

        else if (eventType == 'keydown') {
            if (this.evt.keyCode == 27) {  // The esc key.
                this.escapeReturn();
                this.removeAlert();
            }
        }

        else {
            console.log("Unhandled event type: " + eventType);
        }
    };



    this.getCallerFromEvent = function() {
        this.caller = (this.evt.target) ? this.evt.target : this.evt.scrElement;

        while ((this.caller !== document.body) &&
               (!this.caller.className == this.conf.buttons.cssClass)) {
            this.caller = this.caller.parentNode;
        }

        var ret = (this.caller == document.body) ? false : true;
        return ret;
    };



    this.handleReturn = function() {
        if (this.act.callback) {
            var pos = parseInt(this.caller.getAttribute('value')),
                cnt = this.vals.opts.length,
                val = null;

            out:
            for (var o = 0; o < cnt; o++) {
                if (o == pos) {
                    val = this.vals.opts[o];
                    break out;
                }
            }

            this.act.callback(val);
        }
    };



    this.escapeReturn = function() {
        if ((this.act.callback) && (this.vals.esc != null)) {
            this.act.callback(this.vals.esc);
        }
    };



    this.removeAlert = function() {
        function dismiss(par, chi, out) {
            par.removeChild(chi);
            out();
        }

        this.elems.screen.className = '';

        window.setTimeout(dismiss,
                          this.conf.dismissDelay,
                          this.conf.target,
                          this.elems.screen,
                          this.reset);
    };



    this.equalButtonWidthPercent = function() {
        if (this.act.opts) {
            return (100 / this.act.opts.length) + '%';
        }
        else {
            return '100%';
        }
    };



    // This needs to stay down here.
    if (typeof params == 'object') {this.init(params);}
    else {this.init({});}
}
