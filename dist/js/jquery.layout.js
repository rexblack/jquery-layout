(function($, window) {
  
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
  
  jQuery.fn.extend({
    
    layout: function(options) {
      
      options = $.extend({}, {
        // defaults
        textAlign: 'left', 
        key: '', 
        sort: true, 
        stack: true,  
        orientation: 'horizontal', 
        stackOffset: 'auto', 
        style: 'transform'
      }, options);
      
      // filter options
      var opts = $.extend({}, options, {
        // override
        style: (function(style) {
          if (style == 'transform' && !transformStyle) {
            return 'absolute';
          };
          return style;
        })(options.style), 
        sort: (function(sort) {
          if ( typeof sort == 'function' ) return sort;
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
              var av = $.inArray(a, array);
              var bv = $.inArray(b, array);
              return naturalSorter(av, bv);
            };
          }
          return function(a, b) {
            return 0;
          };
        })(options.sort), 
        columns: typeof options.columns == 'function' || typeof options.columns == 'number' ? options.columns : 0, 
        stack: (function(stack) {
          if (typeof stack == 'boolean' && stack) {
            stack = 'center bottom';
          }
          if (typeof stack == 'object') {
            stack.textAlign = typeof stack.textAlign == 'number' ? stack.textAlign : stack.textAlign.match(/center/) ? 0.5 : stack.textAlign.match(/right/) ? 1 : 0;
            stack.verticalAlign = typeof stack.verticalAlign == 'number' ? stack.verticalAlign : stack.verticalAlign.match(/middle/) ? 0.5 : stack.verticalAlign.match(/bottom/) ? 1 : 0;
          }
          if (typeof stack == 'string') {
            var aligns = stack.split(/\s+/);
            stack = {
              textAlign: $.inArray('center', aligns) >= 0 ? 0.5 : $.inArray('right', aligns) >= 0 ? 1 : 0, 
              verticalAlign: $.inArray('middle', aligns) >= 0 ? 0.5 : $.inArray('bottom', aligns) >= 0 ? 1 : 0
            };
          }
          return stack;
        })(options.stack), 
        stackOffset: (function(stackOffset) {
          if ( typeof stackOffset == 'function' ) return stackOffset;
          if ( typeof stackOffset == 'object' ) {
            return function(index, length) {
              return {top: stackOffset.top * index, left: stackOffset.left * index};
            };
          }
          return 'auto';
        })(options.stackOffset), 
        itemOffset: (function(itemOffset) {
          if ( typeof itemOffset == 'function' ) return itemOffset;
          if ( typeof itemOffset == 'object' ) {
            return function(index, length) {
              return {top: itemOffset.top * index, left: itemOffset.left * index};
            };
          }
          return 'auto';
        })(options.itemOffset), 
        textAlign: (function(textAlign) {
          if ( typeof textAlign == 'number' ) return textAlign;
          if ( typeof textAlign == 'string' ) {
            return textAlign.match(/center/) ? 0.5 : textAlign.match(/right/) ? 1 : 0;
          }
          return 0;
        })(options.textAlign),
        verticalAlign: (function(verticalAlign) {
          if ( typeof verticalAlign == 'number' ) return verticalAlign;
          if ( typeof verticalAlign == 'string' ) {
            return verticalAlign.match(/middle/) ? 0.5 : verticalAlign.match(/bottom/) ? 1 : 0;
          }
          return 0;
        })(options.verticalAlign),  
      });

      //console.log("------> OPTS: ", JSON.stringify(opts, null, "  "));
      
      // sort items
      var sorted = this.toArray();
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
            left: "0px", 
            top: "0px"
          });
          
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
          
          var newSet = !opts.stack && index < elems.length - 1 || index > 0 && options.sort && (opts.sort(elem, nextElem) != 0);
          if (newSet || index == elems.length - 1) {
            currentRow.width+= currentSet.width;
            var newRow = index > 0 && (columnCount > 0 && currentRow.sets.length + 1 > columnCount || columnCount == 0 && currentRow.width > parentWidth); 
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
          if (newSet) {
            // new set
            currentSet = {
              width: elemWidth, 
              height: 0, 
              left: currentRow.width,
              top: totalHeight, 
              elems: []
            };
            sets.push(currentSet);
            currentRow.sets.push(currentSet);
          }
          
        });
        
        //console.log("------> ROWS: ", JSON.stringify(rows, null, "  "));
        
        for (var rowIndex = 0, row; row = rows[rowIndex]; rowIndex++) {
          
          row.height = 0;
          
          for (var setIndex = 0, set; set = row.sets[setIndex]; setIndex++) {
            
            var offset = {
              left: 0, 
              top: 0
            };
            
            for (var stackIndex = 0, elemData; elemData = set.elems[stackIndex]; stackIndex++) {
              
              var elem = elemData.elem;
              var elemWidth = elemData.height;
              var elemHeight = elemData.height;
              
              var computedOffset = typeof opts.stackOffset == 'function';
              offset = computedOffset ? opts.stackOffset.call(elem, stackIndex, elems.length, offset) : offset;

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
        
        //console.log("------> ROWS: ", JSON.stringify(rows, null, "  "));
        
        for (var rowIndex = 0, row; row = rows[rowIndex]; rowIndex++) {
          for (var setIndex = 0, set; set = row.sets[setIndex]; setIndex++) {
            for (var stackIndex = 0, elemData; elemData = set.elems[stackIndex]; stackIndex++) {

              var elem = elemData.elem;
              var elemWidth = elemData.height;
              var elemHeight = elemData.height;
              
              var ha = (parentWidth >= 0 ? Math.max((parentWidth - row.width) * opts.textAlign, 0) : 0);
              var va = (parentHeight >= 0 ? Math.max((parentHeight - totalHeight) * opts.verticalAlign, 0) : 0);
              
              var left = ha + set.left;
              var top = va + set.top + (row.height - set.height) * (opts.stack.verticalAlign ? opts.stack.verticalAlign : 0);
              
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
          console.log("sort: ", a, b);
          if (a.set == b.set) {
            // same set, order by stack-index
            console.log("order by stack-index");
            return sets.length - a.stackIndex - sets.length - b.stackIndex;
          }
          return (a.offset.top - b.offset.top) * (a.offset.left - b.offset.left);
        });
        
        $(elemDatas).each(function(index, elemData) {
          
          var left = elemData.left;
          var top = elemData.top;
          
          var css = {
            position: 'absolute', 
            zIndex: elemDatas.length - index
          };
          
          if (opts.style == 'transform') {
            css[transformStyle] = 'translate(' + left + "px, " + top + "px)";
          } else {
            css.left = left + "px";
            css.top = top + "px";
          }
          
          $(elemData.elem).css(css);
          
        });
        
        
        if (isAutoHeight(offsetParent)) {
          $offsetParent.css('height', totalHeight);
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