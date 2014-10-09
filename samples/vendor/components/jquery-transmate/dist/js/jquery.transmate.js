/*!
 * jquery-transmate - v0.1.0 - 
 * build: 2014-10-09
 */

(function() { if (typeof CSSMatrix == 'undefined') { 
var module = {};
 (function (module) {

"use strict";

// a CSSMatrix shim
// http://www.w3.org/TR/css3-3d-transforms/#cssmatrix-interface
// http://www.w3.org/TR/css3-2d-transforms/#cssmatrix-interface

/**
 * CSSMatrix Shim
 * @constructor
 */
var CSSMatrix = function(){
	var a = [].slice.call(arguments),
		m = this;
	if (a.length) for (var i = a.length; i--;){
		if (Math.abs(a[i]) < CSSMatrix.SMALL_NUMBER) a[i] = 0;
	}
	m.setIdentity();
	if (a.length == 16){
		m.m11 = m.a = a[0];  m.m12 = m.b = a[1];  m.m13 = a[2];  m.m14 = a[3];
		m.m21 = m.c = a[4];  m.m22 = m.d = a[5];  m.m23 = a[6];  m.m24 = a[7];
		m.m31 = a[8];  m.m32 = a[9];  m.m33 = a[10]; m.m34 = a[11];
		m.m41 = m.e = a[12]; m.m42 = m.f = a[13]; m.m43 = a[14]; m.m44 = a[15];
	} else if (a.length == 6) {
		this.affine = true;
		m.m11 = m.a = a[0]; m.m12 = m.b = a[1]; m.m14 = m.e = a[4];
		m.m21 = m.c = a[2]; m.m22 = m.d = a[3]; m.m24 = m.f = a[5];
	} else if (a.length === 1 && typeof a[0] == 'string') {
		m.setMatrixValue(a[0]);
	} else if (a.length > 0) {
		throw new TypeError('Invalid Matrix Value');
	}
};

// decimal values in WebKitCSSMatrix.prototype.toString are truncated to 6 digits
CSSMatrix.SMALL_NUMBER = 1e-6;

// Transformations

// http://en.wikipedia.org/wiki/Rotation_matrix
CSSMatrix.Rotate = function(rx, ry, rz){
	rx *= Math.PI / 180;
	ry *= Math.PI / 180;
	rz *= Math.PI / 180;
	// minus sin() because of right-handed system
	var cosx = Math.cos(rx), sinx = - Math.sin(rx);
	var cosy = Math.cos(ry), siny = - Math.sin(ry);
	var cosz = Math.cos(rz), sinz = - Math.sin(rz);
	var m = new CSSMatrix();

	m.m11 = m.a = cosy * cosz;
	m.m12 = m.b = - cosy * sinz;
	m.m13 = siny;

	m.m21 = m.c = sinx * siny * cosz + cosx * sinz;
	m.m22 = m.d = cosx * cosz - sinx * siny * sinz;
	m.m23 = - sinx * cosy;

	m.m31 = sinx * sinz - cosx * siny * cosz;
	m.m32 = sinx * cosz + cosx * siny * sinz;
	m.m33 = cosx * cosy;

	return m;
};

CSSMatrix.RotateAxisAngle = function(x, y, z, angle){
	angle *= Math.PI / 360;

	var sinA = Math.sin(angle), cosA = Math.cos(angle), sinA2 = sinA * sinA;
	var length = Math.sqrt(x * x + y * y + z * z);

	if (length === 0){
		// bad vector length, use something reasonable
		x = 0;
		y = 0;
		z = 1;
	} else {
		x /= length;
		y /= length;
		z /= length;
	}

	var x2 = x * x, y2 = y * y, z2 = z * z;

	var m = new CSSMatrix();
	m.m11 = m.a = 1 - 2 * (y2 + z2) * sinA2;
	m.m12 = m.b = 2 * (x * y * sinA2 + z * sinA * cosA);
	m.m13 = 2 * (x * z * sinA2 - y * sinA * cosA);
	m.m21 = m.c = 2 * (y * x * sinA2 - z * sinA * cosA);
	m.m22 = m.d = 1 - 2 * (z2 + x2) * sinA2;
	m.m23 = 2 * (y * z * sinA2 + x * sinA * cosA);
	m.m31 = 2 * (z * x * sinA2 + y * sinA * cosA);
	m.m32 = 2 * (z * y * sinA2 - x * sinA * cosA);
	m.m33 = 1 - 2 * (x2 + y2) * sinA2;
	m.m14 = m.m24 = m.m34 = 0;
	m.m41 = m.e = m.m42 = m.f = m.m43 = 0;
	m.m44 = 1;

	return m;
};

CSSMatrix.ScaleX = function(x){
	var m = new CSSMatrix();
	m.m11 = m.a = x;
	return m;
};

CSSMatrix.ScaleY = function(y){
	var m = new CSSMatrix();
	m.m22 = m.d = y;
	return m;
};

CSSMatrix.ScaleZ = function(z){
	var m = new CSSMatrix();
	m.m33 = z;
	return m;
};

CSSMatrix.Scale = function(x, y, z){
	var m = new CSSMatrix();
	m.m11 = m.a = x;
	m.m22 = m.d = y;
	m.m33 = z;
	return m;
};

CSSMatrix.SkewX = function(angle){
	angle *= Math.PI / 180;
	var m = new CSSMatrix();
	m.m21 = m.c = Math.tan(angle);
	return m;
};

CSSMatrix.SkewY = function(angle){
	angle *= Math.PI / 180;
	var m = new CSSMatrix();
	m.m12 = m.b = Math.tan(angle);
	return m;
};

CSSMatrix.Translate = function(x, y, z){
	var m = new CSSMatrix();
	m.m41 = m.e = x;
	m.m42 = m.f = y;
	m.m43 = z;
	return m;
};

CSSMatrix.multiply = function(m1, m2){

	var m11 = m2.m11 * m1.m11 + m2.m12 * m1.m21 + m2.m13 * m1.m31 + m2.m14 * m1.m41,
		m12 = m2.m11 * m1.m12 + m2.m12 * m1.m22 + m2.m13 * m1.m32 + m2.m14 * m1.m42,
		m13 = m2.m11 * m1.m13 + m2.m12 * m1.m23 + m2.m13 * m1.m33 + m2.m14 * m1.m43,
		m14 = m2.m11 * m1.m14 + m2.m12 * m1.m24 + m2.m13 * m1.m34 + m2.m14 * m1.m44,

		m21 = m2.m21 * m1.m11 + m2.m22 * m1.m21 + m2.m23 * m1.m31 + m2.m24 * m1.m41,
		m22 = m2.m21 * m1.m12 + m2.m22 * m1.m22 + m2.m23 * m1.m32 + m2.m24 * m1.m42,
		m23 = m2.m21 * m1.m13 + m2.m22 * m1.m23 + m2.m23 * m1.m33 + m2.m24 * m1.m43,
		m24 = m2.m21 * m1.m14 + m2.m22 * m1.m24 + m2.m23 * m1.m34 + m2.m24 * m1.m44,

		m31 = m2.m31 * m1.m11 + m2.m32 * m1.m21 + m2.m33 * m1.m31 + m2.m34 * m1.m41,
		m32 = m2.m31 * m1.m12 + m2.m32 * m1.m22 + m2.m33 * m1.m32 + m2.m34 * m1.m42,
		m33 = m2.m31 * m1.m13 + m2.m32 * m1.m23 + m2.m33 * m1.m33 + m2.m34 * m1.m43,
		m34 = m2.m31 * m1.m14 + m2.m32 * m1.m24 + m2.m33 * m1.m34 + m2.m34 * m1.m44,

		m41 = m2.m41 * m1.m11 + m2.m42 * m1.m21 + m2.m43 * m1.m31 + m2.m44 * m1.m41,
		m42 = m2.m41 * m1.m12 + m2.m42 * m1.m22 + m2.m43 * m1.m32 + m2.m44 * m1.m42,
		m43 = m2.m41 * m1.m13 + m2.m42 * m1.m23 + m2.m43 * m1.m33 + m2.m44 * m1.m43,
		m44 = m2.m41 * m1.m14 + m2.m42 * m1.m24 + m2.m43 * m1.m34 + m2.m44 * m1.m44;

	return new CSSMatrix(
		m11, m12, m13, m14,
		m21, m22, m23, m24,
		m31, m32, m33, m34,
		m41, m42, m43, m44
	);
};

// w3c defined methods

/**
 * The setMatrixValue method replaces the existing matrix with one computed
 * from parsing the passed string as though it had been assigned to the
 * transform property in a CSS style rule.
 * @param {String} string The string to parse.
 */
CSSMatrix.prototype.setMatrixValue = function(string){
	string = String(string).trim();
	var m = this;
	m.setIdentity();
	if (string == 'none') return m;
	var type = string.slice(0, string.indexOf('(')), parts, i;
	if (type == 'matrix3d'){
		parts = string.slice(9, -1).split(',');
		for (i = parts.length; i--;) parts[i] = parseFloat(parts[i]);
		m.m11 = m.a = parts[0]; m.m12 = m.b = parts[1]; m.m13 = parts[2];  m.m14 = parts[3];
		m.m21 = m.c = parts[4]; m.m22 = m.d = parts[5]; m.m23 = parts[6];  m.m24 = parts[7];
		m.m31 = parts[8]; m.m32 = parts[9]; m.m33 = parts[10]; m.m34 = parts[11];
		m.m41 = m.e = parts[12]; m.m42 = m.f = parts[13]; m.m43 = parts[14]; m.m44 = parts[15];
	} else if (type == 'matrix'){
		m.affine = true;
		parts = string.slice(7, -1).split(',');
		for (i = parts.length; i--;) parts[i] = parseFloat(parts[i]);
		m.m11 = m.a = parts[0]; m.m12 = m.b = parts[2]; m.m41 = m.e = parts[4];
		m.m21 = m.c = parts[1]; m.m22 = m.d = parts[3]; m.m42 = m.f = parts[5];
	} else {
		throw new TypeError('Invalid Matrix Value');
	}
	return m;
};

/**
 * The multiply method returns a new CSSMatrix which is the result of this
 * matrix multiplied by the passed matrix, with the passed matrix to the right.
 * This matrix is not modified.
 *
 * @param {CSSMatrix} m2
 * @return {CSSMatrix} The result matrix.
 */
CSSMatrix.prototype.multiply = function(m2){
	return CSSMatrix.multiply(this, m2);
};

/**
 * The inverse method returns a new matrix which is the inverse of this matrix.
 * This matrix is not modified.
 *
 * method not implemented yet
 */
CSSMatrix.prototype.inverse = function(){
	throw new Error('the inverse() method is not implemented (yet).');
};

/**
 * The translate method returns a new matrix which is this matrix post
 * multiplied by a translation matrix containing the passed values. If the z
 * component is undefined, a 0 value is used in its place. This matrix is not
 * modified.
 *
 * @param {number} x X component of the translation value.
 * @param {number} y Y component of the translation value.
 * @param {number=} z Z component of the translation value.
 * @return {CSSMatrix} The result matrix
 */
CSSMatrix.prototype.translate = function(x, y, z){
	if (z == null) z = 0;
	return CSSMatrix.multiply(this, CSSMatrix.Translate(x, y, z));
};

/**
 * The scale method returns a new matrix which is this matrix post multiplied by
 * a scale matrix containing the passed values. If the z component is undefined,
 * a 1 value is used in its place. If the y component is undefined, the x
 * component value is used in its place. This matrix is not modified.
 *
 * @param {number} x The X component of the scale value.
 * @param {number=} y The Y component of the scale value.
 * @param {number=} z The Z component of the scale value.
 * @return {CSSMatrix} The result matrix
 */
CSSMatrix.prototype.scale = function(x, y, z){
	if (y == null) y = x;
	if (z == null) z = 1;
	return CSSMatrix.multiply(this, CSSMatrix.Scale(x, y, z));
};

/**
 * The rotate method returns a new matrix which is this matrix post multiplied
 * by each of 3 rotation matrices about the major axes, first X, then Y, then Z.
 * If the y and z components are undefined, the x value is used to rotate the
 * object about the z axis, as though the vector (0,0,x) were passed. All
 * rotation values are in degrees. This matrix is not modified.
 *
 * @param {number} rx The X component of the rotation value, or the Z component if the rotY and rotZ parameters are undefined.
 * @param {number=} ry The (optional) Y component of the rotation value.
 * @param {number=} rz The (optional) Z component of the rotation value.
 * @return {CSSMatrix} The result matrix
 */
CSSMatrix.prototype.rotate = function(rx, ry, rz){
	if (ry == null) ry = rx;
	if (rz == null) rz = rx;
	return CSSMatrix.multiply(this, CSSMatrix.Rotate(rx, ry, rz));
};

/**
 * The rotateAxisAngle method returns a new matrix which is this matrix post
 * multiplied by a rotation matrix with the given axis and angle. The right-hand
 * rule is used to determine the direction of rotation. All rotation values are
 * in degrees. This matrix is not modified.
 *
 * @param {number} x The X component of the axis vector.
 * @param {number=} y The Y component of the axis vector.
 * @param {number=} z The Z component of the axis vector.
 * @param {number} angle The angle of rotation about the axis vector, in degrees.
 * @return {CSSMatrix} The result matrix
 */
CSSMatrix.prototype.rotateAxisAngle = function(x, y, z, angle){
	if (y == null) y = x;
	if (z == null) z = x;
	return CSSMatrix.multiply(this, CSSMatrix.RotateAxisAngle(x, y, z, angle));
};

// Defined in WebKitCSSMatrix, but not in the w3c draft

/**
 * Specifies a skew transformation along the x-axis by the given angle.
 *
 * @param {number} angle The angle amount in degrees to skew.
 * @return {CSSMatrix} The result matrix
 */
CSSMatrix.prototype.skewX = function(angle){
	return CSSMatrix.multiply(this, CSSMatrix.SkewX(angle));
};

/**
 * Specifies a skew transformation along the x-axis by the given angle.
 *
 * @param {number} angle The angle amount in degrees to skew.
 * @return {CSSMatrix} The result matrix
 */
CSSMatrix.prototype.skewY = function(angle){
	return CSSMatrix.multiply(this, CSSMatrix.SkewY(angle));
};

/**
 * Returns a string representation of the matrix.
 * @return {string}
 */
CSSMatrix.prototype.toString = function(){
	var m = this;

	if (this.affine){
		return  'matrix(' + [
			m.a, m.b,
			m.c, m.d,
			m.e, m.f
		].join(', ') + ')';
	}
	// note: the elements here are transposed
	return  'matrix3d(' + [
		m.m11, m.m12, m.m13, m.m14,
		m.m21, m.m22, m.m23, m.m24,
		m.m31, m.m32, m.m33, m.m34,
		m.m41, m.m42, m.m43, m.m44
	].join(', ') + ')';
};


// Additional methods

/**
 * Set the current matrix to the identity form
 *
 * @return {CSSMatrix} this matrix
 */
CSSMatrix.prototype.setIdentity = function(){
	var m = this;
	m.m11 = m.a = 1; m.m12 = m.b = 0; m.m13 = 0; m.m14 = 0;
	m.m21 = m.c = 0; m.m22 = m.d = 1; m.m23 = 0; m.m24 = 0;
	m.m31 = 0; m.m32 = 0; m.m33 = 1; m.m34 = 0;
	m.m41 = m.e = 0; m.m42 = m.f = 0; m.m43 = 0; m.m44 = 1;
	return this;
};

/**
 * Transform a tuple (3d point) with this CSSMatrix
 *
 * @param {Tuple} an object with x, y, z and w properties
 * @return {Tuple} the passed tuple
 */
CSSMatrix.prototype.transform = function(t /* tuple */ ){
	var m = this;

	var x = m.m11 * t.x + m.m12 * t.y + m.m13 * t.z + m.m14 * t.w,
		y = m.m21 * t.x + m.m22 * t.y + m.m23 * t.z + m.m24 * t.w,
		z = m.m31 * t.x + m.m32 * t.y + m.m33 * t.z + m.m34 * t.w,
		w = m.m41 * t.x + m.m42 * t.y + m.m43 * t.z + m.m44 * t.w;

	t.x = x / w;
	t.y = y / w;
	t.z = z / w;

	return t;
};

CSSMatrix.prototype.toFullString = function(){
	var m = this;
	return [
		[m.m11, m.m12, m.m13, m.m14].join(', '),
		[m.m21, m.m22, m.m23, m.m24].join(', '),
		[m.m31, m.m32, m.m33, m.m34].join(', '),
		[m.m41, m.m42, m.m43, m.m44].join(', ')
	].join('\n');
};

//module.exports = CSSMatrix;


})(module); 
window.CSSMatrix = module.exports; }
})();
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
