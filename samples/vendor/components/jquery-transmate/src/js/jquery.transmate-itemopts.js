/*!
 * jquery.transmate-itemopts.js
 * provides support for item-specific options in jquery-transmate
 */
(function($, window) {
  
  var pluginName = "transmateItemOpts";
  
  function ItemOpts(properties, opts) {
    
    var elems = this.toArray();
    var items = null;
    
    function computeOptions(index, options) {
      var result = {};
      for (var opt in options) {
        var val = options[opt];
        if (typeof val == 'object') {
          result[opt] = computeOptions(index, val);
        } else if (typeof val == 'number') {
          result[opt] = val * index;
        }
      }
      return result;
    }
    
    function init() {
      if (items) {
        return;
      }
      
      items = [];
      
      // setup items
      for (var i = 0, elem; elem = elems[i]; i++) {
        var item = items[i] = items[i] || {
          elem: elem, 
          opts: $.extend({}, opts, computeOptions(i, opts.item))
        };
      }
    } 
    
    return {
      get: function(elem) {
        init();
        var index = $.inArray(elem, elems);
        if (index >= 0) {
          var item = items[index];
          if (item) {
            return {
              opts: item.opts
            };
          }
        }
        return null;
      }
    };
    
  }
  
  // register the plugin
  $.fn.transmate.collectionPrefilters.push(ItemOpts);
  
})(jQuery, window);
