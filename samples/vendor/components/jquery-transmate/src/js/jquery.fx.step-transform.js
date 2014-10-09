/*!
 * jquery.fx.step-transform.js - 
 * transform step-support in jquery.fx
 */
(function($, window) {
        
  var transformStyle = (function(prop, prefixes) {
    var elem = document.createElement('div');
    var capitalized = prop.charAt(0).toUpperCase() + prop.slice(1);
    for (var i = 0; i < prefixes.length; i++) if (typeof elem.style[prefixes[i] + capitalized] != "undefined") return prefixes[i] + capitalized;
    return null;
  })('transform', ['', 'Moz', 'Webkit', 'O', 'Ms']);
  
  if (!transformStyle || typeof CSSMatrix == 'undefined') return;
  
  $.extend($.fx.step, {
    transform: function(tween) {            
      
      $(tween.elem).css(transformStyle, tween.start);
      var start = $(tween.elem).css(transformStyle);
      
      $(tween.elem).css(transformStyle, tween.end);
      var end = $(tween.elem).css(transformStyle);
      
      startMatrix = new CSSMatrix(start);
      endMatrix = new CSSMatrix(end);
      nowMatrix = new CSSMatrix();
      
      for (var param in endMatrix) {
        if (typeof endMatrix[param] == 'number') {
          nowMatrix[param] = ( endMatrix[param] - startMatrix[param] ) * tween.pos + startMatrix[param];
        }
      }
      
      console.error("transform step: ", tween.pos, tween.start, tween.end);
      
      tween.now = nowMatrix.toString();
      tween.elem.style[transformStyle] = tween.now;
    }
  });
  
})(jQuery, window);