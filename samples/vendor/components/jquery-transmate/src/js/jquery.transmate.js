/*!
 * jquery-transmate - 
 * extends jquery.fx with css-transitions, css-transforms, animated code blocks and more...
 */
(function($, window) {
  
  var fn = {
    animate: $.fn.animate, 
    stop: $.fn.stop, 
    finish: $.fn.finish
  };
  
  var pluginName = 'transmate';
  var plugin = function( prop, speed, easing, callback ) {
    
    var empty = jQuery.isEmptyObject( prop ),
      optall = jQuery.speed( speed, easing, callback );
      
    var complete = optall.complete;
    var collection = this;
    var finished = [], started = [];
    
    
    var collectionPrefilters = arguments.callee.collectionPrefilters ? $.map(arguments.callee.collectionPrefilters, function(elem, index) {
      return elem.call(collection, prop, optall);
    }) : [];
    
    function getElemData(elem) {
      var data = { props: prop, opts: optall, meta: { depends: [] } };
      $.each(collectionPrefilters, function(index, filter) {
        var filterData = filter.get(elem);
        if (filterData) {
          $.extend(data.props, filterData.props);
          $.extend(data.opts, filterData.opts);
          $.extend(data.meta, filterData.meta);
        }
      });
      return data;
    }
    
    if ( optall.queueAll == true ) {
      optall.complete = function() {
        var args = arguments;
        finished.push(this);
        var all = collection.toArray();
        $.each(collection, function(index, elem) {
          // add depends
          var depends = getElemData(elem).meta.depends;
          all.push.apply(all, depends);
        });
        all = $.unique(all);
        if (finished.length == collection.length) {
          $.each(collection, function(index, elem) {
            complete.apply(elem, args);
          });
          console.log("queue: ", $(this).queue());
        }
      };
    }
    
    
    var doAnimation = function() {
      var elem = this;

      // get prefilter data
      var data = getElemData(elem);
      
      var newElems = $(data.meta.depends).filter(function() { return $.inArray(this, collection) < 0 && $.inArray(this, started) < 0;});
      if (newElems.length > 0) {
        // handle new elems
        if (optall.queue === false) {
          newElems.each( doAnimation );
        } else { 
          newElems.queue( optall.queue, doAnimation );
        }
      }
      // Operate on a copy of prop so per-property easing won't be lost
      var anim = jQuery.Animation( this, jQuery.extend( {}, data.props ), $.extend({}, optall) );
     
      // Empty animations, or finishing resolves immediately
      if ( $.isEmptyObject( data.props ) ) {
        // || data_priv.get( this, "finish" )
        anim.stop( true );
      } else {
        //console.warn("start animation: ", elem, data.props);
      }
      
      started.push(anim);
    };
    doAnimation.finish = doAnimation;
    
    return optall.queue === false ?
      this.each( doAnimation ) :
      this.queue( optall.queue, doAnimation );
  };
  
  plugin.collectionPrefilters = [];
  
  jQuery.fn.extend({
    animate: plugin, 
    transmate: plugin
  });
  

})(jQuery, window);
