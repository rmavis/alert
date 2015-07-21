/* ALERT
 * This is a function for creating good-looking alerts.
 *
 * All configuration options are in the `this.config` object.
 *
 * To make the alert look good, you need to use CSS. The relevant
 * CSS entries are included in `this.config`, and are:
 * - screenId: the ID of the screen element, which is the
 *   container for the "window" element.
 * - windowId: not the `window` object, but the ID of the
 *   element that will contain the message and the button(s).
 * - messageId: the ID of the element that will contain the
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
 * this.config = {
 *     target: document.body,
 *     screenId: 'alert-scr',
 *     windowId: 'alert-win',
 *     messageId: 'alert-msg',
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

    this.config = {
        target: document.body,
        screenId: 'alert-scr',
        windowId: 'alert-win',
        messageId: 'alert-msg',
        buttonWrapId: 'alert-btns-wrap',
        buttonClass: 'alert-btn',
        okButtonText: 'okay',
        equalButtonWidths: true,
        defaultReturnValue: true,
        defaultEscReturnVal: false
    };



    this.init = function(pobj) {
        this.callback = ('callback' in pobj) ? pobj.callback : null;
        this.message = ('message' in pobj) ? pobj.message : null;
        this.opts = ('opts' in pobj) ? pobj.opts : null;

        if (this.message) {
            this.reset();
            this.makeItHappen();
        }
    };



    this.reset = function() {
        this.removeListeners();
        this.divScreen = null;
        this.divWindow = null;
        this.divMessage = null;
        this.divOpts = null;
        this.optVals = null;
        this.caller = null;
        this.escReturnVal = null;
        this.evt = null;
    };



    this.makeItHappen = function() {
        this.buildParts();
        this.addListeners();
        this.displayAlert();
    };



    this.buildParts = function() {
        var screen = document.createElement('div');
        screen.id = this.config.screenId;
        this.divScreen = screen;

        var win = document.createElement('div');
        win.id = this.config.windowId;
        this.divWindow = win;

        var msg = document.createElement('div');
        msg.id = this.config.messageId;
        msg.innerHTML = this.message;
        this.divMessage = msg;

        var optsBox = document.createElement('div');
        optsBox.id = this.config.buttonWrapId;
        this.divOpts = optsBox;

        this.buildOpts();
    };



    this.buildOpts = function() {
        this.optVals = [ ];

        if (this.opts) {
            var btnsCount = this.opts.length;
            var btnWidth = (this.config.equalButtonWidths)
                ? this.equalButtonWidthPercent()
                : 'auto';

            for (var o = 0; o < btnsCount; o++) {
                var btn = document.createElement('div');

                btn.className = this.config.buttonClass;
                btn.innerHTML = this.opts[o].txt;
                btn.setAttribute('value', o);
                btn.style.width = btnWidth;

                this.divOpts.appendChild(btn);
                this.optVals.push(this.opts[o].val);

                if (this.opts[o].esc) {
                    this.escReturnVal = this.opts[o].val;
                }
            }
        }

        else {
            var btn = document.createElement('div');

            btn.className = this.config.buttonClass;
            btn.innerHTML = this.config.okButtonText;
            btn.setAttribute('value', 0);

            this.divOpts.appendChild(btn);
            this.optVals.push(this.config.defaultReturnValue);
            this.escReturnVal = this.config.defaultEscReturnVal;
        }
    };



    this.addListeners = function() {
        var n = this.divOpts.childNodes.length;
        for (var o = 0; o < n; o++) {
            this.divOpts.childNodes[o].addEventListener('click', this, false);
        }

        window.addEventListener('keydown', this, false);
    };



    this.removeListeners = function() {
        // The other listeners don't need to be removed
        // because the object gets removed.
        window.removeEventListener('keydown', this);
    };



    this.displayAlert = function() {
        this.divWindow.appendChild(this.divMessage);
        this.divWindow.appendChild(this.divOpts);
        this.divScreen.appendChild(this.divWindow);
        this.config.target.appendChild(this.divScreen);
    };



    this.handleEvent = function(evt) {
        if (!evt) {var evt = window.event;}
        this.evt = evt;

console.log(evt);
console.log(window.event);
console.log(this.evt);

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
               (!this.caller.className == this.config.buttonClass)) {
            this.caller = this.caller.parentNode;
        }

        var ret = (this.caller == document.body) ? false : true;
        return ret;
    };



    this.handleReturn = function() {
        if (this.callback) {
            var pos = parseInt(this.caller.getAttribute('value')),
                cnt = this.optVals.length,
                val = null;

            out:
            for (var o = 0; o < cnt; o++) {
                if (o == pos) {
                    val = this.optVals[o];
                    break out;
                }
            }

            this.callback(val);
        }
    };



    this.escapeReturn = function() {
        if ((this.callback) && (this.escReturnVal != null)) {
            this.callback(this.escReturnVal);
        }
    };



    this.removeAlert = function() {
        this.config.target.removeChild(this.divScreen);
        this.reset();
    };



    this.equalButtonWidthPercent = function() {
        if (this.opts) {
            return (100 / this.opts.length) + '%';
        }
        else {
            return '100%';
        }
    };



    // This needs to stay down here.
    if (typeof params == 'object') {this.init(params);}
    else {this.init({});}
}
