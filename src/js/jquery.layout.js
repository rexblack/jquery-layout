(function($, window) {
  
  function shuffle(o) {
    for( var j, x, i = o.length; i; j = Math.floor(Math.random() * i ), x = o[--i], o[i] = o[j], o[j] = x); return o;
  };
  
  // http://stackoverflow.com/questions/19247495/alphanumeric-sorting-an-array-in-javascript
  // Added: handle numeric type
  function naturalSorter(as, bs) {
    if (typeof as == 'number' && typeof bs == 'number') {
      return as - bs;
    }
    if (!as && !bs) {
      return 0;
    }
    if (!as && bs) {
      return 1;
    }
    if (as && !bs) {
      return -1;
    }
    var a, b, a1, b1, i= 0, n, L, rx=/(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
    if ( as=== bs ) return 0;
    a = as.toLowerCase().match( rx );
    b = bs.toLowerCase().match( rx );
    L = a.length;
    while ( i < L ){
      if ( !b[i] ) return 1;
      a1 = a[i],
      b1 = b[i++];
      if ( a1 !== b1 ){
          n = a1 - b1;
          if ( !isNaN(n) ) return n;
          return a1 > b1 ? 1 : -1;
      }
    }
    return b[i] ? -1 : 0;
  }
  
  // retrieves a position relative to a parent
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
      if (matrix) {
        // include transform scale
        x = x * matrix.a;
        y = y * matrix.d;
      }
      //var transformValue = $(element).css(transformStyle);
      //var matrix = getTransformMatrix(transformValue);
      x+= element.offsetLeft;
      y+= element.offsetTop;
      element = element.offsetParent;
    }
    return {
      left: x, top: y
    };
  };
  
  function isAutoHeight(elem) {
    var clone = elem.cloneNode();
    clone.style.height = "";
    elem.parentNode.insertBefore(clone, elem);
    var originalHeight = $(clone).height();
    $(clone).css('font-size', '12px').html('test');
    var contentHeight = $(clone).height();
    elem.parentNode.removeChild(clone);
    return originalHeight != contentHeight;
  }
  
  var transformStyle = (function(prop, prefixes) {
    var elem = document.createElement('div');
    var capitalized = prop.charAt(0).toUpperCase() + prop.slice(1);
    for (var i = 0; i < prefixes.length; i++) if (typeof elem.style[prefixes[i] + capitalized] != "undefined") return prefixes[i] + capitalized;
    return null;
  })('transform', ['', 'Moz', 'Webkit', 'O', 'Ms']);

  function parseAlign(string, priorities) {
    priorities = priorities instanceof Array ? priorities : ['left', 'top'];
    var result = {};
    if (typeof string == 'number') {
      result.left = string; 
    }
    if( typeof string == 'string' ) {
      var aligns = string.split(/\s+/);
      if ($.inArray('left', priorities) >= 0) {
        var left = $.inArray('left', aligns) >= 0 ? 0 : $.inArray('center', aligns) >= 0 ? 0.5 : $.inArray('right', aligns) >= 0 ? 1 : -1;
        if (left >= 0) {
          result.left = left;
        }
      }
      if ($.inArray('top', priorities) >= 0) {
        var top = $.inArray('top', aligns) >= 0 ? 0 : $.inArray('middle', aligns) >= 0 ? 0.5 : $.inArray('bottom', aligns) >= 0 ? 1 : -1;
        if (top >= 0) {
          result.top = top;
        }
      }
      for (var i = 0, align; align = aligns[i]; i++) {
        var match = align.match(/([\+-]?\d+(?:\.\d+)?)(\%|px)?/);
        if (match) {
          var value = parseFloat(match[1]), unit = match[2], alignValue = -1;
          if (unit == '%') {
            alignValue = Math.max(0, Math.min(value / 100, 1));
            alignValue = value / 100;
          }
          if (alignValue >= 0) {
            if (typeof result[priorities[0]] == 'undefined') {
              result[priorities[0]] = alignValue;
            } else if (typeof result[priorities[1]] == 'undefined') {
              result[priorities[1]] = alignValue;
            }
          }
        }
      }
    }
    return result;
  }
        
  function sortPrefilter(sort) {
    if ( typeof sort == 'function' ) return sort;
    if ( sort == 'shuffle' ) {
      sort = this.toArray();
      sort = shuffle(sort);
      console.log("shuffle array", sort);
    }
    if ( typeof sort == 'string' ) {
      return function(a, b) {
        var av = $(a).data(sort);
        av = typeof av == 'undefined' ? '' : av;
        var bv = $(b).data(sort);
        bv = typeof bv == 'undefined' ? '' : bv;
        return naturalSorter(av, bv);
      };
    }
    if ( sort instanceof Array ) {
      return function(a, b) {
        var av = $.inArray(a, sort);
        var bv = $.inArray(b, sort);
        return naturalSorter(av, bv);
      };
    }
    return function(a, b) {
      return 0;
    };
  }
  
  function optionPrefilter(options) {
    var opts = $.extend({}, options, {
      // override
      align: $.extend({left: 0, top: 0}, parseAlign(options.align), parseAlign(options.textAlign, ['left']), parseAlign(options.verticalAlign, ['top'])), 
      style: (function(style) {
        if (style == 'transform' && !transformStyle) {
          return 'absolute';
        };
        return style;
      })(options.style), 
      sort: sortPrefilter.call(this, options.sort), 
      columns: typeof options.columns == 'function' || typeof options.columns == 'number' ? options.columns : 0, 
      stack: (function(stack) {
        if ( typeof stack == 'boolean' && stack ) {
          stack = 'center bottom';
        }
        if ( typeof stack == 'string' ) {
          stack = {
            align: stack
          };
        }
        if ( typeof stack == 'object' ) {
          stack.align = $.extend({left: 0.5, top: 1}, parseAlign(stack.align), parseAlign(stack.textAlign, ['left']), parseAlign(stack.verticalAlign, ['top'])); 
          stack.sort = stack.sort ? sortPrefilter.call(this, stack.sort) : null;
          stack.offset = (function(stackOffset) {
            if ( typeof stackOffset == 'function' ) return stackOffset;
            if ( typeof stackOffset == 'object' ) {
              return function(index, length) {
                return {top: stackOffset.top * index, left: stackOffset.left * index};
              };
            }
            return 'auto';
          })(stack.offset);
        }
        return stack;
      })(options.stack), 
      item: (function(item) {
        if (typeof item == 'function') return item;
        return $.extend({}, {offset: {top: 0, left: 0}}, options.item);
      })(options.item)
    });
    return opts;
  }
  
  jQuery.fn.extend({
    
    layout: function(options) {
      
      options = $.extend({}, {
        // defaults
        sort: false, 
        stack: false,  
        style: 'absolute', 
        item: {
          offset: {
            left: 0, top: 0
          }
        }
      }, options);
      
      // filter options
      var opts = optionPrefilter.call(this, options);

      //console.log("------> OPTS: ", opts, JSON.stringify(opts, null, "  "));
      
      var collection = this;
      // sort items
      var sorted = collection.toArray();
      sorted.sort(opts.sort);
      
      // get parents / children
      var parents = [], children = [];
      $(sorted).each(function(index, elem) {
        var offsetParent = $(elem).offsetParent()[0];
        var parentIndex = $.inArray(offsetParent, parents);
        if (parentIndex < 0) {
          parents.push(offsetParent);
          parentIndex = parents.length - 1;
        }
        var elems = children[parentIndex] = children[parentIndex] || [];
        elems.push(elem);
      });
      
      $(parents).each(function(index, elem) {
        
        var offsetParent = this, $offsetParent = $(this);
        
        $offsetParent.css('height', '');
        
        var parentWidth = $offsetParent.innerWidth();
        var parentHeight = $offsetParent.innerHeight();
        
        var elems = $(children[index]);
        var elemDatas = [];
        var currentSet = {elems: [], left: 0, top: 0, width: 0, height: 0};
        var sets = [currentSet];
        var totalWidth = 0;
        var totalHeight = 0;
        var rows = [{width: 0, height: 0, sets: [currentSet]}];
        var currentRow = rows[0];
        var columnCount = typeof opts.columns == 'function' ? opts.columns.call(this, 0) : opts.columns;
        var currentWidth = 0;
        
        $(elems).each(function(index, elem) {
          
          var $elem = $(elem);
          $elem.css({
            position: 'relative', 
            left: "", 
            top: "", 
          });
          if (transformStyle) {
            $elem.css(transformStyle, "");
          }
          
          var nextElem = sorted[index + 1];
          var elemWidth = $elem.outerWidth(true);
          var elemHeight = $elem.outerHeight(true);
          var elemData = {
            width: elemWidth, 
            height: elemHeight,   
            elem: this
          };
          elemDatas.push(elemData);
          
          currentSet.elems.push(elemData);
          currentSet.width = Math.max(currentSet.width, elemWidth);
          
          var newRow = false;
          var sort = opts.stack && opts.stack.sort ? opts.stack.sort : opts.sort;
          var newSet = !opts.stack && index < elems.length - 1 || sort && (sort.call(collection, elem, nextElem) != 0);
          
          if (newSet) {
            
            newRow = index > 0 && (columnCount > 0 && currentRow.sets.length + 1 > columnCount || columnCount == 0 && currentSet.left + currentSet.width + elemWidth >= parentWidth); 
            
            if (newRow) {
              // new row
              currentRow = {
                width: 0, 
                height: 0, 
                sets: []
              };
              rows.push(currentRow);
              columnCount = typeof opts.columns == 'function' ? opts.columns.call(this, rows.length - 1) : opts.columns;
            }
            
          }
          
          
          if (newSet && index < elems.length - 1) {
            // new set
            currentSet = {
              width: elemWidth, 
              height: 0, 
              left: newRow ? 0 : currentSet.left + currentSet.width,
              top: totalHeight, 
              elems: []
            };
            sets.push(currentSet);
            currentRow.sets.push(currentSet);
          }
          
          currentRow.width = currentSet.left + currentSet.width;
          
          
        });
        
        for (var rowIndex = 0, row; row = rows[rowIndex]; rowIndex++) {
          
          row.height = 0;
          
          for (var setIndex = 0, set; set = row.sets[setIndex]; setIndex++) {
            
            set.offset = typeof opts.item.offset == 'function' ? opts.item.offset.call($(set.elems), setIndex, row.sets.length) : {top: opts.item.offset.top * setIndex, left: opts.item.offset.left * setIndex};

            var offset = {
              left: 0, 
              top: 0
            };
            
            for (var stackIndex = 0, elemData; elemData = set.elems[stackIndex]; stackIndex++) {
              
              var elem = elemData.elem;
              var elemWidth = elemData.height;
              var elemHeight = elemData.height;
              
              var computedOffset = opts.stack && typeof opts.stack.offset == 'function';
              offset = computedOffset ? opts.stack.offset.call(elem, stackIndex, elems.length, offset) : offset;

              elemData.offset = {
                left: offset.left, 
                top: offset.top
              };
              
              if (!computedOffset) {
                offset.top+= $(elem).height();
              }
              
            }
            
            // sort after position
            set.elems.sort(function(a, b) {
              return a.offset.top - b.offset.top;
            });
            
            set.height =  set.elems[set.elems.length - 1].offset.top + set.elems[set.elems.length - 1].height;
            row.height = Math.max(row.height, set.height);
            
            set.top = totalHeight;
          }
          totalHeight+= row.height;
        }
        
        
        
        for (var rowIndex = 0, row; row = rows[rowIndex]; rowIndex++) {
          for (var setIndex = 0, set; set = row.sets[setIndex]; setIndex++) {
            for (var stackIndex = 0, elemData; elemData = set.elems[stackIndex]; stackIndex++) {

              var elem = elemData.elem;
              var elemWidth = elemData.height;
              var elemHeight = elemData.height;
              
              var ha = (parentWidth >= 0 ? Math.max((parentWidth - row.width) * opts.align.left, 0) : 0);
              var va = (parentHeight >= 0 ? Math.max((parentHeight - totalHeight) * opts.align.top, 0) : 0);
              
              var left = ha + set.left;
              var top = va + set.top;
              
              left+= set.offset.left;
              top+= set.offset.top;
              
              if (opts.stack) {
                top+= (row.height - set.height) * (opts.stack.align.top ? opts.stack.align.top : 0);
              } 
              
              elemData.stackIndex = stackIndex;
              elemData.set = set;
              
              left+= elemData.offset.left;
              top+= elemData.offset.top;
              
              elemData.left = left;
              elemData.top = top;
              
            }
          }
        }
        
        // sort by positions and stack-index
        elemDatas.sort(function(a, b) {
          var pos = (a.set.top - b.set.top) * (a.set.left - b.set.left);
          if (pos == 0) {
            return a.stackIndex - b.stackIndex;
          }
        });
        
        $(elemDatas).each(function(index, elemData) {
          
          var left = elemData.left;
          var top = elemData.top;
          var zIndex = elemDatas.length - index;
          
          var css = {};
          
          if (opts.style == 'transform') {
            // transform
            css[transformStyle] = 'translate(' + left + "px, " + top + "px)";
            css.position = 'absolute';
            css.zIndex = zIndex;
          } else if (opts.style == 'absolute') {
            // absolute
            css.position = 'absolute';
            css.left = left + "px";
            css.top = top + "px";
            css.zIndex = zIndex;
          } else {
            // static
            
          }
          
          $(elemData.elem).css(css);
          
        });
        
        
        if (isAutoHeight(offsetParent)) {
          $offsetParent.css({
            height: totalHeight, 
            position: 'relative'
          });
        }
        
        return;
        
        for (var rowIndex = 0, row; row = rows[rowIndex]; rowIndex++) {
          for (var setIndex = 0, set; set = row.sets[setIndex]; setIndex++) {
            var elems = set.elems;
            $(elems).each(function(stackIndex, elem) {
              var $elem = $(elem);
              var isRelative = opts.style == 'relative' && stackIndex == elems.length - 1;
              if (isRelative) {
                var pos = set.positions[stackIndex];
                var elemPos = $elem.position();
                var left = pos.left + set.left - elemPos.left;
                var top = pos.top + set.top - elemPos.top;
                $(this).css({
                  left: left + "px", 
                  top: top + "px", 
                  zIndex: stackIndex
                });
              }
            });
          }
        }
      });
      
    }
  });
  
  
})(jQuery, window);