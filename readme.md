# ALERT

This is a library for creating good-looking, high-functioning
notifications and alerts. An alert and a notification are nearly
identical, so the motivation behind this library was to enable
easy management of both.

In this documenation, an "alert" will have one or more buttons,
and a "notification" will have zero. And "alert" will be used as
the generic term since it's shorter.

[Here's a little demo](http://richardmavis.info/misc/alert/test.html).


## Usage

This call:
```
Alert.new("Howdy, neighbor.");
```

will create HTML that looks something like this:
```
<div class="alert-scr alert-fade" killable="y" timestamp="alert-1446145337248">
  <div class="alert-win" killable="y">
    <div class="alert-msg" killable="y">Howdy, neighbor.</div>
  </div>
</div>
```

and append that element to the element ID'd `notifications-wrap`.

This call:
```
Alert.new(
  {
    message: "WHAT HATH BOG BROUGHT",
    opts: [
      {txt: 'nothing much', val: 'foo', esc: true},
      {txt: 'something cool', val: 'bar'},
      {txt: 'something lame', val: 'buz'},
      {txt: 'something decent', val: 'wat'}
    ]
  },
  {
    screen: {toggle_class: 'screen-whoopie'},
    message: {tag: 'h1', css_class: 'heads-up-message'},
    button: {css_class: 'rad-alert-buttons'},
    delay: {dismiss: 0},
    callback: Admin.howdy
  }
);
```

will create something like this:
```
<div class="alert-scr alert-fade" killable="y" timestamp="alert-1446145734142">
  <div class="alert-win">
    <h1 class="heads-up-message">WHAT HATH BOG BROUGHT</h1>
    <div class="alert-btns-wrap">
      <div class="rad-alert-buttons" style="width:25%" value="0" killable="y">nothing much</div>
      <div class="rad-alert-buttons" style="width:25%" value="1" killable="y">something cool</div>
      <div class="rad-alert-buttons" style="width:25%" value="2" killable="y">something lame</div>
      <div class="rad-alert-buttons" style="width:25%" value="3" killable="y">something decent</div>
    </div>
  </div>
</div>
```

and append it to the same element as before, since no new target
was ID'd. When one of the buttons are clicked, or when the user
hits the escape key, the callback function `Admin.howdy` will be
called, and passed either the `val` corresponding to the button
or the `val` of the `opt` with `esc: true`, so in this case
`foo`. If no `opt` was designated the `esc` value, then the
callback would be passed the `default_esc` value.

There are many configuration options. The defaults are specified
in the `getDefaultConfig` function. Each option is explained in
there.

Since this library is intended to be used for both alerts and
notifications, many of both can be created, and every one can
have its own settings. The user experience of each will depend on
your CSS.


## Dependencies
- [Utils.js](https://github.com/rmavis/utils.js) for utility functions.


## Details

Definitions of terms:
- The "message" element will contain the content of the alert.
  It can be a string or an element.
- The "buttons" element contains at least one "button" element
  that the user can click. You can control the number of buttons
  and the values associated with each via the `opts` array in the
  parameter. You can pass the boolean `true` instead of an array
  to use the default button. If no `opts` are passed, there will
  be no buttons.
- The "window" is the element that contains the alert's message
  and its button(s), if there are any.
- The "screen" element will contain the "window".

Those terms are used in the configuration object.

There are four public methods.

Use the `new` method to create a new alert. It accepts up to two
parameters. To create a notification, the first should be a
string. To create an alert, the first should be an object with up
to three keys:
- `message`, being the body of the alert. This is required.
- `callback`, being the function to call when dismissing this
  alert. This is optional.
- `opts`, being either the boolean `true` or an array of objects.
  The buttons will be built from those objects, and each must
  contain two keys: `txt`, being the text of the button, and
  `val`, being the value associated with the button, which will
  be passed to the callback if the user clicks the button. One of
  these can also have an `esc: true`. If one does, then that
  `val` will be passed to the callback when the user either
  clicks the "screen" or hits the escape key.

When an alert is created, event listeners are added to the
relevant elements. If there are `opts`, then each button will be
clickable. If not, then the message will be. And in both cases,
the "screen" will be clickable, and the window will listen for
keypresses. It will only react to the escape key, which will
dismiss the most recent alert.

`new` returns an object containing five keys:
- `id`, being the identifying attribute for the topmost element
- `elem`, being the alert element
- `opts`, being an object containing three keys:
  - `elem`, being the element containing the buttons, if there are
    any
  - `vals`, being the values corresponding to each button
  - `esc`, being the escape value
- `callback`, being the callback function
- `conf`, being the alert's configuration options

You can pass that object to the public `kill` method to kill the
alert.

You can change the session's configuration options by passing an
object with any subset of the structure of the default config
object to `setConf`. And you can revert to the defaults by
calling `resetConf`.
