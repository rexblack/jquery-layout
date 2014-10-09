/*!
 * jquery.transmate-blocks.js
 * provides support for animated code blocks in jquery-transmate
 */
(function($, window) {

  var pluginName = "transmateBlocks";
  
  function camelize(string) {
    return string.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
  }
  
  function hyphenate(string) {
    return string.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
  }
  
  // retrieves a the vendor prefixed style name for the given property
  var getVendorStyle = (function() {
    var cache = {};
    var vendorPrefixes = ['Webkit', 'Moz', 'O', 'Ms'], elem = document.createElement('div');
    return function (styleName, hyphenated) {
      var camelized = camelize(styleName);
      hyphenated = typeof hyphenated == 'boolean' ? hyphenated : false;
      var result = cache[camelized] = typeof cache[camelized] != 'undefined' ? cache[camelized] : (function(camelized) {
        var result = null;
        document.documentElement.appendChild(elem);
        if (typeof (elem.style[camelized]) == 'string') result = camelized;
        if (!result) {
          var capitalized = camelized.substring(0, 1).toUpperCase() + camelized.substring(1);
          for (var i = 0; i < vendorPrefixes.length; i++) {
            var prop = vendorPrefixes[i] + capitalized;
            if (typeof elem.style[prop] == 'string') {
              result = prop;
              break;
            }
          }
        }
        elem.parentNode.removeChild(elem);
        return result;
      })(camelized);
      if (result && hyphenated) {
        result = hyphenate(result);
      }
      return result;
    };
  })();
  
  function getStyleObject(element) {
    var dom = element;
    var style;
    var returns = {};
    if (window.getComputedStyle) {
      style = window.getComputedStyle(dom, null);
      for(var i = 0, l = style.length; i < l; i++){
        var prop = style[i];
        //var camel = camelize(prop);
        var val = style.getPropertyValue(prop);
        returns[prop] = val;
      };
      return returns;
    };
    if (style = dom.currentStyle){
      for (var prop in style){
        returns[prop] = style[prop];
      };
      return returns;
    };
    return $(element).css();
  }
  
  // retrieves a position relative to a parent
  
  function getPosition(elem) {
    if (!elem.offsetParent) {
      return null;
    }
    var rect = elem.getBoundingClientRect();
    return {
      left: rect.left, 
      top: rect.top
    };
  }
  
  // retrieves a position relative to a parent
  /*
  function getPosition(element, parent) {
    var transformStyle = getVendorStyle('transform'); 
    parent = typeof parent != 'undefined' ? parent : document.body;
    if (element == document.body) {
      return {left: 0, top: 0};
    }
    if (!element.offsetParent) {
      return null;
    }
    var x = 0;
    var y = 0;
    while (element && element != parent) {
      x+= element.offsetLeft;
      y+= element.offsetTop;
      element = element.offsetParent;
    }
    return {
      left: x, top: y
    };
  };*/

  function getCommonOffsetParent(elem1, elem2) {
    var elem = elem1;
    while (elem = elem.offsetParent) {
      var isCommonParent = true;
      for (var i = 1, argElem; argElem = arguments[i]; i++) {
        if ($(elem).has(argElem).length == 0) {
          isCommonParent = false;
        }
      }
      if (isCommonParent) {
        return elem;
      }
    }
    return document.body;
  }
  
  function isClassStyle(elem, prop) {
    var computedValue = $.css(elem, prop);
    var inlineValue = $.style(elem, prop);
    return computedValue != inlineValue;
  }
  
  var c = 0;
  
  function elemSelector(elems) {
    var result = elems.find("*").andSelf();
    //result = result.add(result.siblings());
    return result;
  }
  
  function AnimatedBlocks(properties, opts) {
    var array = this.toArray();
    
    // add children
    var elems = [];
    
    //.add(this.parent().children()).unique().toArray();
    // add children to collection
    //this.push.apply(this, this.find("*"));
    
   // var elems = this.toArray();
    //var depends = elems.filter(function( elem, index ) { return $.inArray(elem, array) < 0;});
    var items = null;
    var collection = this;
    var complete = opts.complete;
    
    opts = $.extend({cssTransforms: true}, opts);
    opts.complete = function() {
      var item = $(this).data(pluginName);
      if (item && item.meta && item.meta.restore) {
        for (var prop in item.meta.restore) {
          console.warn("RESTORE");
          item.elem.style[prop] = item.meta.restore[prop];
        }
      }
      $(this).data(pluginName, "");
      if (typeof complete == 'function') {
        complete.apply(this, arguments);
      }
    };
    var transformStyle = opts.cssTransforms && getVendorStyle('transform');
    
    function init() {
      
      if (items) {
        return;
      }
      
      elems = elemSelector.call(collection, collection);
      
      var exclude = [
        'bottom', 'right', 'position', 'display', 'font-family', 'perspective-origin', 'transform-origin'
      ];
      
      items = [];
      
      // setup items
      for (var i = 0, elem; elem = elems[i]; i++) {
        var $elem = $(elem);
        var item = items[i] = items[i] || {
          elem: elem, 
          from: {}, 
          to: {}, 
          top: {}, 
          before: {}, 
          after: {}, 
          meta: {
            depends: $.inArray(elem, collection) >= 0 ? elemSelector.call(collection, $elem).filter(function() { return this != elem; }) : [], 
            restore: {}, 
          }, 
          old: $(elem).data(pluginName), 
          opts: opts
        };
      }
      
      if (typeof properties == 'function') {
        
        var func = properties;
        var commonOffsetParent = document.body;
        
        // capture positions
        for (var i = 0, item; item = items[i]; i++) {
          item.before.position = getPosition(item.elem);
        }
        
        // capture styles
        for (var i = 0, item; item = items[i]; i++) {
          item.before.css = getStyleObject(item.elem);
        }
        
        // reset transitions
        var transitionStyle = getVendorStyle('transition');
        for (var i = 0, item; item = items[i]; i++) {
          item.transitionValue = item.elem.style[transitionStyle];
          item.elem.style[transitionStyle] = "none";
          item.meta.restore[transitionStyle] = item.transitionValue;
        }
        
        // restore styles
        for (var i = 0, item; item = items[i]; i++) {
          if (item.old && item.old.meta) {
            for (var prop in item.old.meta.restore) {
              item.elem.style[prop] =  item.old.meta.restore[prop];
            }
          }
        }
        
        func.call(collection);
        
        // capture styles after
        for (var i = 0, item; item = items[i]; i++) {
          item.after = {
            css: getStyleObject(item.elem)
          };
        }
        
        // clean styles
        for (var i = 0, item; item = items[i]; i++) {
          for (var prop in item.after.css) {
            if (prop.indexOf('transition') < 0 && exclude.indexOf(prop) < 0 && item.before.css[prop] != item.after.css[prop] && (!item.old || item.old.to[prop] != item.after.css[prop])) {
              item.from[prop] = item.before.css[prop];
              item.to[prop] = item.after.css[prop];
            }
          }
        }
        
        // capture positions after
        for (var i = 0, item; item = items[i]; i++) {
          item.after.position = getPosition(item.elem);
        }
        
        // reset transitions
        for (var i = 0, item; item = items[i]; i++) {
          //item.elem.style[transitionStyle] = item.transitionValue;
        }
        
        // collect meta-data
        for (var i = 0, item; item = items[i]; i++) {
          for (var prop in item.to) {
            if (isClassStyle(item.elem, getVendorStyle(prop))) {
              item.meta.restore[getVendorStyle(prop)] = "";
            } else {
              // not a class-style
            }
          }
        }
        
        
        
        // get diff
        for (var i = 0, item; item = items[i]; i++) {
          
          var pos1 = item.before.position;
          var pos2 = item.after.position;
          
          if (pos1 == null && pos2 == null) {
            // elem is not added
            
          } else if (pos2 && pos1 == null) {
            // show
            /*item.from = {
              display: 'none'
            };
            
            item.to = {
              opacity: 'show'
            };*/
            
          } else if (pos1 && pos2 == null) {
            
            // hide
            /*item.to = {
              opacity: 'hide'
            };*/
            
          } else {
            
            // move
            var diff = {left: pos2.left - pos1.left, top: pos2.top - pos1.top};
            
            
            if (diff.left != 0 || diff.top != 0) {
            
              // transforms
              if (transformStyle && CSSMatrix) {
                
                var currentValue = $(item.elem).css(transformStyle);
                var nowMatrix = new CSSMatrix(currentValue);
                var left = nowMatrix.d, top = nowMatrix.e;
                var translateMatrix = nowMatrix.translate(-diff.left, -diff.top);
                item.from[transformStyle] = translateMatrix.toString();
                item.to[transformStyle] = nowMatrix.toString();
                item.meta.restore[transformStyle] = (left != 0 || top != 0) && currentValue != 'none' ? currentValue : "";
                item.elem.style[transformStyle] = item.from[transformStyle];
                /*
                item.from[getVendorStyle('transform')] = "translate(" + -diff.left + "px," + -diff.top + "px)";
                item.to[getVendorStyle('transform')] = "translate(0,0)";
                */
              } else {
                
                // positioning left / top
                if (diff.left != 0) {
                  var leftStyleValue = $.css(item.elem, 'left');
                  var left = parseFloat(leftStyleValue);
                  item.from['left'] = left + (- diff.left) + "px";
                  item.to['left'] = left;
                  item.meta.restore['left'] = left != 0 ? leftStyleValue : "";
                  item.elem.style['left'] = left + (- diff.left) + "px";
                }
                
                if (diff.top) {
                  var topStyleValue = $.css(item.elem, 'top');
                  var top = parseFloat(topStyleValue);
                  item.from['top'] = top + (- diff.top) + "px";
                  item.to['top'] = top;
                  item.meta.restore['top'] = top != 0 ? topStyleValue : "";
                  item.elem.style['top'] = top + (- diff.top) + "px";
                }
              }
            }
            
          }
          
        }
        
        
        // remove old item and set data
        for (var i = 0, item; item = items[i]; i++) {
          delete item.old;
          $(item.elem).css(item.from); 
          $(item.elem).data(pluginName, item);
          //$(item.elem).css(item.from); 
        }
      }

    }
    
    return {
      get: function(elem) {
        if (!items) {
          init();
        }
        var index = $.inArray(elem, elems);
        if (index >= 0) {
          var item = items[index];
          //throw 'god'
          if (item) {
            return {
              props: item.to, 
              opts: $.extend({}, opts, {
                easing: 'linear'
              }),  
              meta: {
                depends: item.meta.depends
              }
            };
          }
        }
        return null;
      }
    };
    
  }
  
  
  
  // register the plugin
  $.fn.transmate.collectionPrefilters.push(AnimatedBlocks);
  
  
  
})(jQuery, window);
