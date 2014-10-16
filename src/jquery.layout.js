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
  
  function isAutoWidth(elem) {
    var clone = elem.cloneNode();
    clone.style.height = "";
    elem.parentNode.insertBefore(clone, elem);
    var originalWidth = $(clone).width();
    $(clone).css('font-size', '12px').html('test');
    var contentWidth = $(clone).width();
    elem.parentNode.removeChild(clone);
    return originalWidth != contentWidth;
  }
  
  
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
  
  var isStyleSupported = function(prop) {
    return typeof getVendorStyle(prop) != 'undefined'; 
  };
  
  var isFlexSupported = (function() {
    var cache;
    return function() {
      return typeof cache != 'undefined' ? cache : cache = (function() {
        var elem = document.createElement('div');
        elem.style.display = "flex";
        return elem.style.display === 'flex';
      })();
    };
  })();

  function parseAlign(string, priorities, def) {
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
    result.left = typeof def != 'undefined' && typeof result.left == 'undefined' ? def : result.left;
    result.top = typeof def != 'undefined' && typeof result.top == 'undefined' ? def : result.top;
    return result;
  }
        
  function sortPrefilter(sort) {
    if ( typeof sort == 'function' ) return sort;
    if ( sort == 'shuffle' ) {
      sort = this.toArray();
      sort = shuffle(sort);
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
    //console.log("OPTION PREFILTER: ", this, options, options.align, options.textAlign);
    var opts = $.extend({}, options, {
      // override
      align: $.extend({}, parseAlign(options.align), parseAlign(options.textAlign, ['left']), parseAlign(options.verticalAlign, ['top'])), 
      style: (function(style) {
        if (typeof style == 'string') {
          style = style.split(/\s+/);
        }
        $.grep(style, function(style, index) {
          return $.inArray(style, styles) >= 0;
        });
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
        if (typeof item == 'string') {
          item = {
            selector: item
          };
        }
        return $.extend({}, {selector: " > *", offset: {top: 0, left: 0}}, item);
      })(options.item)
    });
    return opts;
  }
  
  function runtimePrefilter(opts) {
    // align
    opts.align = opts.align || {};
    opts.align.left = typeof opts.align.left != 'undefined' && opts.align.left != 'auto' ? opts.align.left : parseAlign(this.css('textAlign'), ['left'], 0).left;
    opts.align.top = typeof opts.align.top != 'undefined' && opts.align.top != 'auto' ? opts.align.top : parseAlign(this.css('verticalAlign'), ['top'], 0).top;
    // gutter
    opts.gutter = opts.gutter || {};
    opts.gutter.left = typeof opts.gutter.left != 'undefined' && opts.gutter.left != 'auto' ? opts.gutter.left : parseFloat(this.css('marginLeft'));
    opts.gutter.top = typeof opts.gutter.top != 'undefined' && opts.gutter.top != 'auto'  ? opts.gutter.top : parseFloat(this.css('marginTop'));
    opts.gutter.right = typeof opts.gutter.right != 'undefined' && opts.gutter.right != 'auto'  ? opts.gutter.right : parseFloat(this.css('marginRight'));
    opts.gutter.bottom = typeof opts.gutter.bottom != 'undefined' && opts.gutter.bottom != 'auto'  ? opts.gutter.bottom : parseFloat(this.css('marginBottom'));
    return opts;
  }
  
  var pluginName = "layout";
  var defaults = {
    align: 'auto', 
    bindResize: true, 
    sort: false, 
    style: 'absolute'
  };
  
  // setup styles
  var styles = (function(styles) {
    return $.grep(styles, function(style, index) {
      if (style == 'transform' && !getVendorStyle('transform')) {
        return false;
      }
      if (style == 'flex' && !isFlexSupported()) {
        return false;
      }
      return true;
    });
  })(['flex', 'transform', 'absolute', 'static']);
  
  function Layout(elem, options) {
    
    var instance = this, $elem = $(elem);
    this.elem = elem;
    var transformStyle = getVendorStyle('transform');
    
    var elems = [], elemDatas = [];
    
    // get restore data
    var restore = {
      css: {
        fontSize: elem.style.fontSize, 
        textAlign: elem.style.textAlign, 
        verticalAlign: elem.style.verticalAlign,
        width: elem.style.width,  
        height: elem.style.height  
      }, 
      wrappers: []
    };
    // flex
    restore.css[getVendorStyle('flex-wrap')] = elem.style[getVendorStyle('flex-wrap')];
    restore.css[getVendorStyle('align-items')] = elem.style[getVendorStyle('align-items')];
    
    function resizeHandler(e) {
      instance.render();
    }
    
    this.render = function(options) {
      
      // measure time
      var startTime = new Date().getTime();
      
      
      
      // options
      this.options = $.extend({}, defaults, this && this.options, options);
      
      var opts = this.options;
      
      // option prefilter
      opts = optionPrefilter.call($elem, opts);
      
      // find and sort elems
      var items = $elem.find(opts.item.selector).not("br").toArray();
      
      items.sort(opts.sort);
      
      // runtime prefilter
      opts = runtimePrefilter.call($elem, opts);
      
      // resize handler
      $(window).off('resize', resizeHandler);
      if (opts.bindResize) {
        $(window).on('resize', resizeHandler);
      }

      var 
        style = opts.style[0], 
        elems = $.grep(items, function(elem, index) {
          return $(elem).is(":visible");
        }), 
        elemDatas = [];
        
        
      var 
        contentWidth = 0, 
        contentHeight = 0; 
        
      
      // setup item data
      var 
        currentColumn = {elems: [], left: 0, top: 0, width: 0, height: 0}, 
        rows = [{width: 0, height: 0, columns: [currentColumn], elems: []}], 
        currentRow = rows[0], 
        columnCount = typeof opts.columns == 'function' ? opts.columns.call(this, 0) : opts.columns, 
        currentWidth = 0;
      
      $(elems).each(function(index, elem) {
        var $elem = $(elem);
        var nextElem = elems[index + 1];
        var elemWidth = $elem.outerWidth(true);
        var elemHeight = $elem.outerHeight(true);
        var elemData = {
          elem: elem, 
          width: elemWidth, 
          height: elemHeight  
        };
        elemDatas.push(elemData);
        currentColumn.elems.push(elemData);
        currentColumn.width = Math.max(currentColumn.width, elemWidth);
        currentRow.elems.push(elem);
        var sort = opts.stack && opts.stack.sort ? opts.stack.sort : opts.sort;
        var newRow = false;
        var newColumn = !opts.stack && index < elems.length - 1 || sort && (sort.call(elems, elem, nextElem) != 0);
        if (newColumn) {
          var isBreak = index > 0 && (columnCount > 0 && currentRow.columns.length + 1 > columnCount); 
          var isWrap = index < elems.length - 1 && currentColumn.left + currentColumn.width + elemWidth >= parentWidth;
          currentRow.isBreak = currentColumn.isBreak = isBreak;
          currentRow.isWrap = currentColumn.isWrap = isWrap;
          newRow = isBreak || isWrap;
          if (newRow) {
            // new row
            currentRow = {
              width: 0, 
              height: 0, 
              elems: [], 
              columns: []
            };
            rows.push(currentRow);
            columnCount = typeof opts.columns == 'function' ? opts.columns.call(this, rows.length - 1) : opts.columns;
          }
        }
        if (newColumn && index < elems.length - 1) {
          // new column
          currentColumn = {
            width: elemWidth, 
            height: 0, 
            left: newRow ? 0 : currentColumn.left + currentColumn.width,
            top: 0, //contentHeight?
            elems: []
          };
          currentRow.columns.push(currentColumn);
        }
        currentRow.width = currentColumn.left + currentColumn.width;
      });
        
      // setup heights
      for (var rowIndex = 0, row; row = rows[rowIndex]; rowIndex++) {
        row.height = 0;
        for (var columnIndex = 0, column; column = row.columns[columnIndex]; columnIndex++) {
          column.offset = typeof opts.item.offset == 'function' ? opts.item.offset.call($(column.elems), columnIndex, row.columns.length) : {top: opts.item.offset.top * columnIndex, left: opts.item.offset.left * columnIndex};
          var offset = {
            left: 0, 
            top: 0
          };
          for (var stackIndex = 0, elemData; elemData = column.elems[stackIndex]; stackIndex++) {
            var elem = elemData.elem;
            var elemWidth = elemData.height;
            var elemHeight = elemData.height;
            var computedOffset = opts.stack && typeof opts.stack.offset == 'function';
            offset = computedOffset ? opts.stack.offset.call(elem, stackIndex, elems.length, offset) : opts.stack.offset;
            elemData.offset = {
              left: offset.left, 
              top: offset.top
            };
            if (!computedOffset) {
              offset.top+= $(elem).height();
            }
          }
          // sort after position
          column.elems.sort(function(a, b) {
            return a.offset.top - b.offset.top;
          });
          column.height =  column.elems.length > 0 ? column.elems[column.elems.length - 1].offset.top + column.elems[column.elems.length - 1].height : 0;
          row.height = Math.max(row.height, column.height);
          column.top = contentHeight;
        }
        contentWidth = Math.max(row.width, contentWidth);
        contentHeight+= row.height;
      }
      
      
      
      
      var 
        parent = this.elem, 
        $parent = $elem;
        
        // reset size
        $parent.css({
          width: '', 
          height: ''
        });
        
      var 
        parentWidth = $parent.innerWidth(), 
        parentHeight = $parent.innerHeight(),
        parentPadding = {
          left: parseFloat($parent.css('paddingLeft')), 
          top: parseFloat($parent.css('paddingTop')), 
          right: parseFloat($parent.css('paddingRight')),
          bottom: parseFloat($parent.css('paddingBottom'))
        }, 
        parentContentWidth = parentWidth - parentPadding.left - parentPadding.right, 
        parentContentHeight = parentHeight - parentPadding.top - parentPadding.bottom;
        
      var totalWidth = parentPadding.left + parentPadding.right + contentWidth;
      var totalHeight = parentPadding.top + parentPadding.bottom + contentHeight; 
      
      // setup positions
      for (var rowIndex = 0, row; row = rows[rowIndex]; rowIndex++) {
        for (var columnIndex = 0, column; column = row.columns[columnIndex]; columnIndex++) {
          for (var stackIndex = 0, elemData; elemData = column.elems[stackIndex]; stackIndex++) {

            var elem = elemData.elem;
            var elemWidth = elemData.height;
            var elemHeight = elemData.height;
            
            var ha = (parentContentWidth >= 0 ? Math.max((parentContentWidth - row.width) * opts.align.left, 0) : 0);
            var va = (parentContentHeight >= 0 ? Math.max((parentContentHeight - contentHeight) * opts.align.top, 0) : 0);
            
            var left = parentPadding.left;
            var top = parentPadding.top;
            
            left+= ha + column.left;
            top+= va + column.top;
            
            left+= column.offset.left;
            top+= column.offset.top;
            
            if (opts.stack) {
              top+= (row.height - column.height) * (opts.stack.align.top ? opts.stack.align.top : 0);
            } 
            
            elemData.row = row;
            elemData.rowIndex = rowIndex;
            
            elemData.column = column;
            elemData.columnIndex = columnIndex;
            elemData.stackIndex = stackIndex;
            
            left+= elemData.offset.left;
            top+= elemData.offset.top;
            
            elemData.left = left;
            elemData.top = top;
            
            elemData.isBreak = stackIndex == column.elems.length - 1 ? column.isBreak : false;
            elemData.isWrap = stackIndex == column.elems.length - 1 ? column.isWrap : false;
          }
        }
      }
      
      
      // sort by positions and stack-index
      /*
      elemDatas.sort(function(a, b) {
        var pos = (a.column.top - b.column.top) * (a.column.left - b.column.left);
        if (pos == 0) {
          return a.stackIndex - b.stackIndex;
        }
      });*/
      
      // update elems
      elems = $.map(elemDatas, function(elemData, index) {
        return elemData.elem;
      });
      
      // setup elems
      var $elemDatas = $(elemDatas);
      
      if (style == 'absolute') {
        
        // absolute
        
        $elemDatas.each(function(index, elemData) {

          var css = {
            position: 'absolute', 
            left: elemData.left + "px", 
            top: elemData.top + "px", 
            zIndex: elemData.column.elems.length - elemData.stackIndex,
            //zIndex: stackIndex,  
            display: 'block'
          };
          css[transformStyle] = '';
          
          $(elemData.elem).css(css);
        
        });
        
        
      } else if (style == 'transform') {
        
        // transform
        
        $elemDatas.each(function(index, elemData) {
          
          var css = {
            position: 'absolute', 
            left: "0px", 
            top: "0px", 
            zIndex: elemData.column.elems.length - elemData.stackIndex,
            //zIndex: stackIndex,   
            display: 'block', 
            fontSize: ''
          };
          css[transformStyle] = "translate(" + elemData.left + "px, " + elemData.top + "px)";
          
          $(elemData.elem).css(css);
        
        });
      
      } else if (style == 'static') {
        
        // static
        
        $parent.css('font-size', '');
        var parentFontSize = $parent.css('font-size');
        
        // readd ordered items
        if (opts.sort) {
          $parent.append(elems);
        }
        
        $elemDatas.each(function(index, elemData) {
          
          var css = {
            position: 'static', 
            display: 'inline-block', 
          };
          var fontSize = $(elem).css('fontSize');
          if (fontSize == parentFontSize) {
            css.fontSize = parentFontSize;
          }
          css[transformStyle] = '';
          $(elemData.elem).css(css);
          
        });
        
      } else if (style == 'flex') {
        
        // flex
        
        $elemDatas.each(function(index, elemData) {
          
          var css = {
            position: 'static', 
            display: 'block', 
            fontSize: ''
          };
          css[getVendorStyle('order')] = index;
          css[transformStyle] = '';
          $(elemData.elem).css(css);
          
        });
        
      } else {
        // restore
        $elemDatas.each(function(index, elemData) {
          
          var css = {
            position: '', 
            display: '', 
            fontSize: '', 
            zIndex: '', 
            top: '', 
            left: ''
          };
          
          css[getVendorStyle('order')] = '';
          css[transformStyle] = '';
          $(elemData.elem).css(css);
          
        });
      }
      
      
      // parent
      
      // restore
      var css = {
        position: '', 
        width: '', 
        height: '', 
        textAlign: '', 
        verticalAlign: '', 
        display: '', 
        fontSize: ''
      };
      
      css[getVendorStyle('flex-wrap')] = '';
      css[getVendorStyle('justify-content')] = '';
      css[getVendorStyle('flex-direction')] = '';
      
      if (style == 'absolute' || style == 'transform') {
        
        // auto-height
        
        var positionStyle = $parent.css('position');
        if (positionStyle == 'static') {
          css.position = 'relative';
        }
        
        if (isAutoHeight(parent)) {
          css.height = totalHeight;
        }
        
        if (isAutoWidth(parent)) {
          css.width = totalWidth;
        }
        
        
        
      }
      
      if (style == 'static' || style == 'flex') {
        
        css.fontSize = "0";
        css.textAlign = opts.align.left == 0.5 ? 'center' : opts.align.left == 1 ? 'right' : 'left';
        css.verticalAlign = opts.align.top == 0.5 ? 'middle' : opts.align.top == 1 ? 'bottom' : 'bottom';
        css.height = "auto";
        
        // setup breaks
        var wrappers = restore.wrappers = (function(old) {
          var elemsToWrap = [], wrappers = [];
          for (var index = 0, elemData; elemData = elemDatas[index]; index++) {
            elemsToWrap.push(elemData.elem);
            if (elemData.isBreak || wrappers.length && index == elemDatas.length - 1) {
              // create container
              var wrapper = old[i] || document.createElement('div');
              $(wrapper).append(elemsToWrap);
              wrappers.push(wrapper);
              elemsToWrap = [];;
            }
          }
          for (var i = wrappers.length; i < old.length; i++) {
            // remove unneeded
            $(old[i]).remove();
          }
          return wrappers;
        })(restore.wrappers);
        
        if (style == 'flex') {
          
          var flexCss = {};
          flexCss.display = "flex";
          flexCss[getVendorStyle('flex-wrap')] = 'wrap';
          flexCss[getVendorStyle('justify-content')] = opts.align.left == 0.5 ? 'center' : opts.align.left == 1 ? 'flex-end' : 'flex-start';
          flexCss[getVendorStyle('flex-direction')] = 'row';
          
          if (wrappers.length) {
            $.each(wrappers, function(index, elem) {
              $(elem).css(flexCss);
            });
          } else {
            $.extend(css, flexCss);
          }
        }
        
        $parent.append(wrappers);
        
        
      } else {
        
        // remove wrappers
        $(restore.wrappers).each(function() {
          $(this).remove();
        });
        restore.wrappers = [];
        $parent.append(elems);
      }
      
      $parent.css(css);
      
      var execTime = new Date().getTime() - startTime;
      
      // callback
      if (typeof opts.render == 'function') {
        opts.render.call($parent, opts, execTime);
      }
        
    };
    
    this.render(options);
    
  };
  
  var pluginClass = Layout;
  jQuery.fn[pluginName] = function(options) {
    return this.each(function() {
      var instance = $(this).data(pluginName);
      if (!instance) {
        instance = $(this).data(pluginName, new Layout(this, options));
      } else {
        instance.render(options);
      }
      return $(this);
    });
  };
  
})(jQuery, window);