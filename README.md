# jQuery Eye

Version 1.1.0

## Summary

jQuery.eye is a jQuery plugin for monitoring changes made to elements' DOM or CSS properties as well as monitoring changes of the returned results from jQuery methods ran on a given element. When a change is detected a callback function is fired. Additionally provided are methods for pausing a watch, starting a watch, and retrieving a watch status associated with an element.

## Author

Wil Neeley ( [@wilneeley](http://twitter.com/wilneeley) / [puppetlabs.com](http://www.puppetlabs.com) / [github.com](https://github.com/Xaxis) )

## Usage

Include `jquery.eye.min.js` after jQuery in your header or elsewhere in your page.

### Initialize Watches w/ jQuery.eye

```javascript
// Register element(s) to watch DOM and CSS properties
$('.some-element').eye({
  'clientWidth': function( oldVal, newVal, elm ) {
    $(elm).html('clientHeight changed from ' + oldVal + ' to ' + newVal);
  },
  'background-color': function( oldVal, newVal, elm ) {
    $(elm).html('background-color changed from ' + oldVal + ' to ' + newVal);
  },
  'border-color': {
      onChange: function( oldVal, newVal, elm, args ) {
          console.log('Border Color Changed!');
      },
      onInterval: function( currValue, elm, args ) {

          // Execute any code you want EVERY interval of the watch
          $(elm).css('border-color', '#' + Math.floor(Math.random()*16777215).toString(16));
      }
  }
}, 100);


// Register the element to watch and the properties to watch
$('.some-div').eye({
    'width()': function( oldVal, newVal, elm ) {
        $(elm).prepend('<div>DIV\'s jQuery.width() return value changed from <strong>' + oldVal + '</strong> to <strong>' + newVal + '</strong></div>');
    },
    'attr()': {
        args: ['border'],
        onChange: function( oldVal, newVal, elm ) {
            $(elm).prepend('<div>DIV\'s jQuery.attr(\'border\') return value changed from <strong>' + oldVal + '</strong> to <strong>' + newVal + '</strong></div>');
        }
    }
}, 300);


// Watch for the addition of the class 'some-class' to the DIV
$('.some-div').eye({
    speed: 250,
    'hasClass()': {
        args: ['some-class'],
        onChange: function( oldVal, newVal, elm, args ) {
            $(elm).prepend('<div>DIV\'s hasClass(\'some-class\') return value changed from <strong>' + oldVal + '</strong> to <strong>' + newVal + '</strong></div>');
        }
    }
});


// Run a callback immediately on registration
$('.some-div').eye({
    load: true,
    'width()': function( oldVal, newVal, elm ) {
        $(elm).prepend('<div>DIV\'s jQuery.width() return value changed from <strong>' + oldVal + '</strong> to <strong>' + newVal + '</strong></div>');
    }
}, 300);
```

### Using Eye Methods

```javascript
// Pause a watch
$('.some-div').eye('pause');

// Re-start a paused watch
$('.some-div').eye('start');

// Return the status of a watched element
$('.some-div').eye('status');

// Remove a watched property from a watch
$('.some-div').eye('unwatch', 'border-color');
```

### Caveats

The jQuery.eye plugin uses JavaScript's setInterval method to monitor registered property values of DOM elements. While tests will vary from environment to environment, it is always wise to consider performance issues when registering a "large number" of watches.

## Requirements/Browsers

Tested with jQuery 1.4.x+.

Works in IE6+, Chrome 14+, Safari 4+, Firefox 3.0+, Opera 10+.

## Examples

See `example.html` in examples folder.

### Changelog

#### Version 1.0.0

* initial version

#### Version 1.1.0

* gave registered callbacks the ability to run once upon registration
