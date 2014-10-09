/*!
 * jquery.fx.tweener-transitions.js
 * extends jquery with transition tweens
 */
(function($, window) {
  
  // shim layer with setTimeout fallback
  var requestAnimationFrame = (function() {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  
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
  
  
  var isPixelStyle = (function () {
    var cache = {}, doc = document, elem = doc.createElement('div'); 
    return function(prop) {
      prop = getVendorStyle(camelize(prop));
      return cache[prop] = typeof cache[prop] != 'undefined' ? cache[prop] : (function(prop) {
        doc.body.appendChild(elem);
        elem.style[prop] = "1px";
        var result = elem.style[prop].match(/^[\d\.]*px$/) != null;
        doc.body.removeChild(elem);
        return result;
      })(prop);
    };
  })();
  
  var isTransitionSupported = function(property, from, to, element) {
    var doc = document.documentElement, 
      camelized = getVendorStyle(property), 
      hyphenated = hyphenate(camelized), 
      style = doc.appendChild(document.createElement("style")),
      rule = [
              'capTest{',
                  '0%{',   hyphenated, ':', from, '}',
                  '100%{', hyphenated, ':', to,   '}',
              '}'
             ].join(''),
      prefixes = ' moz ms o webkit'.split(' '),
      prefixCount = prefixes.length,
      canAnimate = false;

    element = doc.appendChild(element ? element.cloneNode(false) : document.createElement('div'));

    // Detect invalid start value. (Webkit tries to use default.)
    element.style[camelized] = to;

    // Iterate through supported prefixes.
    for (var i = 0; i < prefixCount; i++) {

      // Variations on current prefix.
      var prefix  = prefixes[i],
          hPrefix = (prefix) ? '-' + prefix + '-' : '',
          uPrefix = (prefix) ? prefix.toUpperCase() + '_' : '';

      // Test for support.
      if (CSSRule[uPrefix + 'KEYFRAMES_RULE']) {

        // Rule supported; add keyframe rule to test stylesheet.
        var ruleString = '@'+ hPrefix + 'keyframes ' + rule;
        try {
          style.sheet.insertRule(ruleString, 0);

          // Apply animation.
          var animationProp = camelize(hPrefix + 'animation');
          element.style[animationProp] = 'capTest 1s 0s both';

          // Get initial computed style.
          var before = getComputedStyle(element)[camelized];
          
          // Skip to last frame of animation.
          // BUG: Firefox doesn't support reverse or update node style while attached.
          doc.removeChild(element);
          element.style[animationProp] = 'capTest 1s -1s alternate both';
          doc.appendChild(element);
          // BUG: Webkit doesn't update style when animation skipped ahead.
          element.style[animationProp] = 'capTest 1s 0 reverse both';

          // Get final computed style.
          var after = getComputedStyle(element)[camelized];
          
          // If before and after are different, property and values are animable.
          canAnimate = before !== after;
          //canAnimate = true;
          break;
        } catch (e) {
        }
        
      }
    }

    // Clean up the test elements.
    doc.removeChild(element);
    doc.removeChild(style);
    return canAnimate;
  };
  
  function splitCSS(string) {
    var match, split = [], current = "", literal;
    while( match = string.match(/\s*(,|\(|\))\s*/)) {
      current+= string.substring(0, match.index);
      var token = match[0];
      if (token == '(') {
        literal = true;
      } else if (token == ')') {
        current+= token;
        literal = null;
      }
      if (literal) {
        current+= token;
      } else if (current) {
        split.push(current);
        current = "";
      }
      string = string.substring(match.index + match[0].length);
    }
    return split;
  }
  
  var getStyle = function( el, prop ) {
    var inline = el.style[prop];
    if (typeof inline != '') {
      return inline;
    };
    return getComputedStyle(el, prop);
  };
  
  var transitionStyle = getVendorStyle('transition');
  var transitionEvents = ("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd").split(/\s+/);
  var transitionEasings = {
    //'swing': 'cubic-bezier(.02, .01, .47, 1)'
    'swing': 'ease-in-out'
  };
   
  function getTransitionStyles(elem, add, remove) {
    add = add instanceof Array ? add : [];
    remove = remove instanceof Array ? remove : [];
    remove = remove.concat($.map(add, function(obj) {
      return obj.name;
    }));
    var $elem = $(elem);
    var properties = $elem.css(transitionStyle + "Property").split(/[\s,]+/);
    var durations = $elem.css(transitionStyle + "Duration").split(/[\s,]+/);
    var delays = $elem.css(transitionStyle + "Delay").split(/[\s,]+/);
    var timingFunctions = splitCSS($elem.css(transitionStyle + "TimingFunction"));
    var transitions = $.map(properties, function(prop, index) {
      return {
        name: prop, 
        duration: durations[index], 
        delay: delays[index], 
        timingFunction: timingFunctions[index]
      };
    });
    // remove props
    transitions = $.map(transitions, function(obj, index) {
      if (obj.name == 'none' || obj.name == 'all' || $.inArray(obj.name, remove ) >= 0 ) {
        return null;
      }
      return obj;
    });
    // add props
    $.each(add, function(index, obj) {
      transitions.push(obj);
    });
    var css = {};
    css[transitionStyle + "Property"] = $.map(transitions, function(obj) { return obj.name; }).join(", ");
    css[transitionStyle + "Duration"] = $.map(transitions, function(obj) { return obj.duration; }).join(", ");
    css[transitionStyle + "Delay"] = $.map(transitions, function(obj) { return obj.delay; }).join(", ");
    css[transitionStyle + "TimingFunction"] = $.map(transitions, function(obj) { return obj.timingFunction; }).join(", ");
    return css;
  }
  

  var createTween = (function() {
    // constants:
    var 
      core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
      rfxtypes = /^(?:toggle|show|hide)$/,
      rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ); 
    
    return function ( prop, value ) {
      
      var pixelStyle = !jQuery.cssNumber[ prop ] && isPixelStyle(prop);
      
      var tween = this.createTween( prop, value );
      tween.unit = !pixelStyle ? "" : "px";
      
        target = tween.cur(),
        parts = rfxnum.exec( value ),
        unit = parts && parts[ 3 ] || ( !pixelStyle ? "" : "px" ),
    
        // Starting value computation is required for potential unit mismatches
        start = ( !pixelStyle || unit !== "px" && +target ) &&
          rfxnum.exec( jQuery.css( tween.elem, prop ) ),
        scale = 1,
        maxIterations = 20;
        
      if ( start && start[ 3 ] !== unit ) {
        // Trust units reported by jQuery.css
        unit = unit || start[ 3 ];
    
        // Make sure we update the tween properties later on
        parts = parts || [];
    
        // Iteratively approximate from a nonzero starting point
        start = +target || 1;
    
        do {
          // If previous iteration zeroed out, double until we get *something*
          // Use a string for doubling factor so we don't accidentally see scale as unchanged below
          scale = scale || ".5";
    
          // Adjust and apply
          start = start / scale;
          jQuery.style( tween.elem, prop, start + unit );
    
        // Update scale, tolerating zero or NaN from tween.cur()
        // And breaking the loop if scale is unchanged or perfect, or if we've just had enough
        } while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
      }
    
      // Update tween properties
      if ( parts ) {
        start = tween.start = +start || +target || 0;
        tween.unit = unit;
        // If a +=/-= token was provided, we're doing a relative animation
        tween.end = parts[ 1 ] ?
          start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
          +parts[ 2 ];
      }
      
      return tween;
    };
  })();
  
  
  
  function getDuration(tweens) {
    var duration = 0;
    $.each(tweens, function(index, tween) {
      duration = Math.max(duration, tween.delay + tween.duration); 
    });
    return duration;
  }
  
  var tweenRunner = function( anim, percent ) {
  
    var elem = anim.elem, $elem = $(elem);
    var tween = this;
    
    var s = this.delay / anim.duration;
    var e = (this.delay + this.duration) / anim.duration;
    var p = Math.min(Math.max(0, percent - s) / (e - s), 1);
    
    if (p == 0) {
      //console.log("run tween: ", tween.prop, tween.end + tween.unit);
    }
    
    if (p >= 0) {
      var eased,
        hooks = jQuery.Tween.propHooks[ this.prop ];
  
      if ( this.duration ) {
        this.pos = eased = jQuery.easing[ this.easing ](
          p, this.duration * p, 0, 1, this.duration
        );
      } else {
        this.pos = eased = p;
      }
      this.now = ( this.end - this.start ) * eased + this.start;
      
      
      
      if ( this.options.step ) {
        this.options.step.call( this.elem, this.now, this );
      }
  
      if ( hooks && hooks.set ) {
        hooks.set( this );
      } else {
        jQuery.Tween.propHooks._default.set( this );
      }
    }
    
    if (this.pos == 1 && !this.finished) {
      this.finished = true;
      tweenFinished.call(anim, this);
    }
    
    return this;
    
  };
  
  
  var transitionRunner = function( anim, percent ) {
  
    var tween = this;
    var elem = anim.elem, $elem = $(elem);
    
    function transitionEndHandler(event) {
      var vendorProp = event.originalEvent.propertyName;
      var tween = $.map(anim.tweens, function(tween, index) {
        return getVendorStyle(tween.prop, true) == vendorProp ? tween : null;
      })[0];
      
      if (tween && !tween.finished) {
        stopTween( true );
        tween.finished = true;
        tweenFinished.call(anim, tween);
        if (anim.finished) {
          $elem.off("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", arguments.callee);
        }
      }
    }
    
    function stopTween( gotoEnd ) {
      var css = getTransitionStyles(elem, null, [getVendorStyle(tween.prop, true)]);
      css[getVendorStyle(tween.prop)] = gotoEnd ? tween.end + tween.unit : tween.cur() + tween.unit;
      $elem.css(css);
    }
    
    $elem.promise().done(function() {
      if (!tween.finished) {
        stopTween();
      }
    });
    
    if (percent == 1) {
      stopTween( true );
    }
    
    if (percent == 0) {
      
      
      $elem.css(getVendorStyle(tween.prop), tween.start + tween.unit);
      
      var add = [
        {
          name: getVendorStyle(tween.prop, true), 
          duration: Number(tween.duration / 1000).toFixed(2) + "s", 
          delay: Number(tween.delay / 1000).toFixed(2) + "s", 
          timingFunction: 'linear'
        }
      ];

      $elem.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", transitionEndHandler);
      
      function step() {
        
        if ( tween.options.step ) {
          // read only when needed for step callback
          tween.now = tween.cur();
          tween.options.step.call( anim.elem, tween.now, tween );
        }
        if (!anim.finished) {
          window.requestAnimationFrame(step);
        }
      }
      
      $elem.css(getTransitionStyles(elem, add));
      
      window.requestAnimationFrame(function() {
        if (tween.finished) return;
        $elem.css(getVendorStyle(tween.prop), tween.end + tween.unit);
        console.log("run transition: ", tween.prop, tween.start + tween.unit + " -> " + tween.end + tween.unit, "duration: ", tween.duration, "delay: ", tween.delay, elem);
        step();
      });
    }
    
    return this;
    
  };
  
  function tweenFinished(tween) {
    var anim = this;
    if (!anim.finished && $.map(anim.tweens, function(tween, index) { return !tween.finished ? tween : null; }).length == 0) {
      anim.finished = true;
      anim.stop( true );
    }
    return false;
  }
  
  
  jQuery.Animation.tweener(function( prop, value ) {
    
    var anim = this;
    var tween = createTween.apply(anim, arguments);
    var elem = anim.elem, $elem = $(elem);
    var duration = typeof anim.opts.specialDuration == 'object' && typeof anim.opts.specialDuration[prop] != 'undefined' ? anim.opts.specialDuration[prop] : anim.opts.duration;
    var delay = typeof anim.opts.specialDelay == 'object' && typeof anim.opts.specialDelay[prop] != 'undefined' ? anim.opts.specialDelay[prop] : anim.opts.delay;
    var easing = typeof anim.opts.specialEasing == 'object' && typeof anim.opts.specialEasing[prop] != 'undefined' ? anim.opts.specialEasing[prop] : anim.opts.easing;
    
    duration = typeof duration == 'number' ? duration : 0;
    delay = typeof delay == 'number' ? delay : 0;
    easing = easing || 'swing';
    
    
    
    tween.delay = delay;
    tween.duration = duration;
    
    var isTransition = false;
    
    tween.run = function( percent ) {
      
      
      if (percent == 0) {
        isTransition = ( typeof anim.opts.cssTransitions != 'boolean' || anim.opts.cssTransitions != false ) && isTransitionSupported(getVendorStyle(prop), tween.start + tween.unit, tween.end + tween.unit);
      }
      if (isTransition) {
        transitionRunner.call(this, anim, percent);
      } else {
        tweenRunner.call(this, anim, percent);
      }
      return tween;
    };
    
    var duration = getDuration(anim.tweens);
    anim.duration = duration + 100000;
    
    return tween;
    
  });
  
  
})(jQuery, window);