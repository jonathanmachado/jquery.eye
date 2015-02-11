/**
 * jQuery.eye()
 *
 * (a) Wil Neeley
 * (c) Code may be freely distributed under the MIT license.
 */
;(function ( $, window, document, undefined ) {


  var

      // The plugin's name
      plugin_name = 'eye',

      // Ref to plugin itself
      plugin_ref = null,

      // The plugin's defaults
      defaults = {
        speed: 100,
        load: false
      },

      // The plugin's globals
      globals = {

        // A place to store references to eyeed elements
        registry: {},

        // A starting unique ID
        guid: 0
      };

  // Plugin constructor
  function Plugin( element, options, speed ) {
    this.element = element;
    this.options = $.extend( {}, defaults, options);
    this._defaults = defaults;
    this._name = plugin_name;
    this._speed = speed;
    this._load = this.options.load
    this.init();
  }

  Plugin.prototype.init = function() {
    var plugin = this;

    // A place to reference our properties to watch and our watching interval
    var watched_props = {
      _interval: null,
      _interval_func: null,
      _element: plugin.element,
      _speed: plugin._speed || plugin.options.speed,
      _load: plugin.options.load,
      _status: 'active'
    };

    // Build an object containing the properties to watch
    $.each(plugin.options, function(index, value) {
      if (index != 'speed' && index != 'load') {
        var prop_object = {
          orig_object: value,
          orig_value: '',
          elm_ref: plugin.element
        };

        // Are we returning a jQuery function value?
        if (index.match(/\)/g)) {
          var j_func = index.replace(/\(\)/g, "");

          // Are there arguments to pass to the function
          if ($.isPlainObject(value) && 'args' in value) {

            // If function is method of jQuery
            if (j_func in $) {
              value.args.unshift(plugin.element);
              prop_object.orig_value = $[j_func].apply(j_func, value.args);

            // Assume function is method of jQuery.fn
            } else {
              prop_object.orig_value = $.fn[j_func].apply($(plugin.element), value.args);
            }
          } else {

            // If function is method of jQuery
            if (j_func in $) {
              prop_object.orig_value = $(plugin.element)[j_func]();

            // Assume function is method of jQuery.fn
            } else {
              prop_object.orig_value = $.fn[j_func].apply($(plugin.element));
            }
          }

        // Are we watching a property of the DOM element
        } else if (index in plugin.element) {
          prop_object.orig_value = plugin.element[index];

        // Assume we are watching a CSS property?
        } else {
          var index_before = index;

          // Convert comma separated CSS property to its camel case equivalent
          index = index.replace(/-[a-zA-Z0-9]{1}/g, function(txt) {
            return txt.charAt(1).toUpperCase();
          });

          // Assign the element style property
          if (index in plugin.element.style) {
            prop_object.orig_value = plugin.element.style[index];

          // If this test fails, we can report that the property also does not exist on the element
          } else {
             console.log('Invalid Element Property: \'' + index_before + '\' does not exist.');
          }
        }

        // Register the watched properties
        watched_props[index] = prop_object;
      }
    });

    // Reference the interval function
    var intervalFunc = function() {
      $.each(watched_props, function(index, value) {
        if (index != '_interval' && index != '_interval_func' && index != '_element' && index != '_speed' && index != '_status' && index != '_load') {
          var new_value = value.orig_value;

          // Are we returning a jQuery function value?
          if (index.match(/\)/g)) {
            var j_func = index.replace(/\(\)/g, "");

            // Do we have arguments to pass to the function
            if ($.isPlainObject(value) && 'args' in value.orig_object) {

              // If function is method of jQuery
              if (j_func in $) {
                new_value = $[j_func].apply(j_func, value.orig_object.args);

              // Assume function is method of jQuery.fn
              } else {
                new_value = $.fn[j_func].apply($(plugin.element), value.orig_object.args);
              }
            } else {

              // If function is method of jQuery
              if (j_func in $) {
                new_value = $(plugin.element)[j_func]();

              // Assume function is method of jQuery.fn
              } else {
                new_value = $.fn[j_func].apply($(plugin.element));
              }
            }

          // Are we watching a property of the DOM element
          } else if (index in plugin.element) {
            new_value = plugin.element[index];

          // Are we watching a CSS property?
          } else {
            new_value = plugin.element.style[index];
          }
        }

        // Execute the interval callback when present
        if ($.isPlainObject(value.orig_object)) {
          if ('onInterval' in value.orig_object) {
            value.orig_object.onInterval( value.orig_value, value.elm_ref);
          }
        }

        // When the currently calculated value differs from the original, execute callback
        if (new_value != value.orig_value || plugin._load) {
          if ($.isFunction(value.orig_object)) {
            plugin._load = false;
            value.orig_object( value.orig_value, new_value, value.elm_ref );
          } else if ($.isPlainObject(value.orig_object)) {
            plugin._load = false;
            value.orig_object.onChange( value.orig_value, new_value, value.elm_ref, 'args' in value.orig_object ? value.orig_object.args : [] );
          }

          // Update the original value with the new value
          value.orig_value = new_value;
        }
      });
    };

    // Now register a watching interval on the properties of the element
    watched_props._interval = setInterval(intervalFunc, watched_props._speed);
    watched_props._interval_func = intervalFunc;

    // Reference the current unique ID
    var unique_id = globals.guid;

    // Update the unique IDs associated with the current element(s)
    if (!$.data(plugin.element, 'uids')) {
      $.data(plugin.element, 'uids', [unique_id]);
    } else {
      var uids = $.data(plugin.element, 'uids');
      uids.push(unique_id);
      $.data(plugin.element, 'uids', uids);
    }

    // Increment the unique ID, keeping it unique for next watch registration
    globals.guid++;

    // Add this batch of properties to watch to the registry
    globals.registry[unique_id] = watched_props;
  };

  // Public methods
  var public_methods = {

    /**
     * Returns a string indicative of the status of a watch attached to an element/object. Will return 'active',
     * 'paused', or 'none' depending on watch status.
     * @param elm
     * @returns {string}
     */
    status: function( elm ) {
      var uids = elm.data('uids');
      if (uids) {
        var ret = '';
        $.each(uids, function(index, value) {
          var prop_object = globals.registry[value];
          ret = prop_object._status;
          return false;
        });
        return ret;
      } else {
        return 'none';
      }
    },

    /**
     * Pauses a watch of any registered watches on elements/objects.
     * @param elm
     */
    pause: function( elm ) {
      var uids = elm.data('uids');
      if (uids) {
        $.each(uids, function(index, value) {
          var prop_object = globals.registry[value];
          prop_object._status = 'paused';
          clearInterval(prop_object._interval);
        });
      }
      return plugin_ref;
    },

    /**
     * Re-starts a watch of any registered watched on elements/objects.
     * @param elm
     */
    start: function( elm ) {
      var uids = elm.data('uids');
      if (uids) {
        $.each(uids, function(index, value) {
          var prop_object = globals.registry[value];
          if (prop_object._status == 'paused') {
            prop_object._interval = setInterval(prop_object._interval_func, prop_object._speed);
          }
          prop_object._status = 'active';
        });
      }
      return plugin_ref;
    },

    /**
     * Removes a registered/watched property on an element
     */
    unwatch: function( elm, prop ) {

      // Convert targeted CSS property to its camel case equivalent
      prop = prop.replace(/-[a-zA-Z0-9]{1}/g, function(txt) {
        return txt.charAt(1).toUpperCase();
      });

      var uids = elm.data('uids');
      if (uids) {
        $.each(uids, function(index, value) {
          var prop_object = globals.registry[value];

          // Remove the property from the watched properties object
          delete prop_object[prop];
        });
      }
      return plugin_ref;
    }
  };

  // Plugin wrapper around constructor
  $.fn[plugin_name] = function ( options, speed ) {

    // Reference the plugin globally
    plugin_ref = this;

    // Call methods or init plugin as appropriate
    if (typeof options == 'string') {
      var method_name = options;
      var args = $(arguments).toArray();
      args.shift();
      args.unshift(this);
      return public_methods[method_name].apply(this, args);
    } else {
      return this.each(function () {
        $.data(this, 'plugin_' + plugin_name, new Plugin( this, options, speed ));
      });
    }
  };

})( jQuery, window, document );
