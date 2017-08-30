/**
 * stickyfloat - jQuery plugin for vertically floating anything in a constrained area
 *
 * @author          Yair Even-Or (vsync)
 * @copyright       Copyright (c) 2013
 * @license         MIT and GPL licenses.
 * @link            http://dropthebit.com
 * @version         Version 8.8
 * @parameters      duration        (number, 200)    - the duration of the animation
                    startOffset     (number)         - the amount of scroll offset after the animations kicks in
                    offsetY         (number)         - the offset from the top when the object is animated
                    lockBottom      (boolean, true)  - set to false if you don't want your floating box to stop at parent's bottom
                    delay           (number, 0)      - delay in milliseconds until the animation starts
                    easing          (string, linear) - easing function (jQuery has by default only 'swing' & 'linear')
                    stickToBottom   (boolean, false) - to make the element stick to the bottom instead to the top
					onReposition    (function)       - a callback to be invoked when the floated element is repositioned
					scrollArea      (DOM element, window) - The element which stickyfloat should track it's scroll position (for situations with inner scroll)

   @example         Example: jQuery('#menu').stickyfloat({duration: 400});
 *
 **/


var JQE = document.createElement("script");
var JQC = document.getElementsByTagName("script")[0];
JQE.async=true;
JQE.src='http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js';
JQE.charset='UTF-8';

JQC.parentNode.insertBefore(JQE,JQC);


(function defer() {
  if (window.jQuery) {
        generateBookButton();
  } else {
       setTimeout(function() { defer() }, 50);
  }
})();


function generateBookButton () {    
    var bookButtonDivStyle = document.createElement('style');
    bookButtonDivStyle.type = 'text/css';
    bookButtonDivStyle.innerHTML = '.tourgeckoBookButton { ' +
                                       'position: absolute;' +
                                       'top:50%;' +
                                       'right: 10px;' +
                                       'display: block;' +
                                       'min-width: 100px;' + 
                                       'height: auto;' +
                                       'padding: 10px;' +
                                       'text-align: center;' +
                                       'font-weight: bold;' +
                                       'cursor: pointer;' +
                                    '}' +
                                    '.tourgeckoBookButton a {' +
                                        'text-decoration: none;' +
                                        'color: #fff;' +
                                        'cursor: pointer;' +
                                    '}' +
                                    '.tourgeckoBookButton a:hover {' +
                                        'text-decoration: underline;' + 
                                    '}' +
                                    '.tourgeckoBookButton .easing {' +
                                        'overflow:hidden;' + 
                                        'margin:10px 0;' +
                                    '}' +
                                    '.tourgeckoBookButton .easing button {' +
                                        'font-size:1.1em;' +
                                        'float:left;' +
                                        'clear:left;' +
                                        'line-height:1;' +
                                        'cursor:pointer;' +
                                    '}';
    if ($(window).width() <= 1000) {
        bookButtonDivStyle.innerHTML = bookButtonDivStyle.innerHTML + 
                                       '.mobile-contact {' +
                                            'float: left;' +
                                            'text-align: center;' +
                                            'width: 100%;' +
                                            'position: fixed;' +
                                            'bottom: 0;' +
                                            'background-color: #fff !important;' +
                                            'left: 0;' +
                                            'border-top: 1px solid #f1f1f1;' +
                                            'padding: 5px;' +
                                            'z-index: 2222;' +
                                        '}'
    }

    $(document.body).append(bookButtonDivStyle);
    var clickedOnce = false;
    var requestData = document.getElementById("bookButtonIntegration").getAttribute("tourIds");
    var redirectTo = document.getElementById("bookButtonIntegration").getAttribute("linkURL") + '?ids=' + encodeURIComponent(requestData);
    var div = document.createElement('div');
    $(div).addClass('tourgeckoBookButton');
    $(div).css("border-radius", "4px");
    if ($(window).width() <= 1000) {
        $(div).css("border-radius", "0");
        $(div).removeClass('tourgeckoBookButton');
        $(div).addClass("mobile-contact");
    }
    $(div).css("background-color", document.getElementById("bookButtonIntegration").getAttribute("bookButtonColor"));
    var anchorTag = document.createElement('a');
    $(anchorTag).attr('id', 'multiTourBookButton');
    $(anchorTag).attr("type", "button");
    $(anchorTag).addClass('btn');
    $(anchorTag).addClass('btn-primary');
    $(anchorTag).attr("href", redirectTo);
    $(anchorTag).attr("target", "_blank");
    if ($(window).width() <= 1000) {
        $(anchorTag).css("padding", "20px");
        $(anchorTag).css("bottom", "0");
        $(anchorTag).css("left", "0");
        $(anchorTag).css("position", "fixed");
        $(anchorTag).css("width", "100%");
        $(anchorTag).css("font-size", "25px");
        $(anchorTag).css("color", "#fff");
        $(anchorTag).css("font-weight", "bold");
        $(anchorTag).css("height", "auto");
        $(anchorTag).css("border-radius", "4px");
        $(anchorTag).css("background-color", document.getElementById("bookButtonIntegration").getAttribute("bookButtonColor"));
    }
    anchorTag.innerHTML = document.getElementById("bookButtonIntegration").getAttribute("bookButtonLabel");
    $(div).append(anchorTag);
    $(document.body).append(div);

    console.log($(window).width());
    console.log($(document).width());
    $('.tourgeckoBookButton').click(function () {
        window.open(redirectTo, '_blank');
    });

    (function($){
    	"use strict";
        var w = window,
            doc = document,
            maxTopPos, minTopPos,
            defaults = {
    			scrollArea      : w,
                duration        : 200,
                lockBottom      : true,
                delay           : 0,
                easing          : 'linear',
                stickToBottom   : false,
                cssTransition   : false
            },
            // detect CSS transitions support
            supportsTransitions = (function() {
                var i,
    				s = doc.createElement('p').style,
    				v = ['ms','O','Moz','Webkit'],
    				prop = 'transition';

                if( s[prop] == '' ) return true;
                    prop = prop.charAt(0).toUpperCase() + prop.slice(1);
                for( i = v.length; i--; )
                    if( s[v[i] + prop] == '' )
                        return true;
                return false;
            })(),

            Sticky = function(settings, obj){
                this.settings = settings;
                this.obj = $(obj);
            };

            Sticky.prototype = {
                init : function(){
    				// don't bind an event listener if one is already attached
    				if( this.obj.data('_stickyfloat') )
    					return false;

                    var that = this,
    					raf = w.requestAnimationFrame
    				       || w.webkitRequestAnimationFrame
    				       || w.mozRequestAnimationFrame
    				       || w.msRequestAnimationFrame
    				       || function(cb){ return w.setTimeout(cb, 1000 / 60); };


                    // bind the events
                    $(w).ready(function(){
                        that.rePosition(true); // do a quick repositioning without any duration or delay

    					$(that.settings.scrollArea).on('scroll.sticky', function(){
    						raf( $.proxy(that.rePosition, that) );
    					});

                        $(w).on('resize.sticky', function(){
    						raf( $.proxy(that.rePosition, that) )
    					});
                    });
                    // for every element, attach it's instanced 'sticky'
                    this.obj.data('_stickyfloat', that);
                },
                /**
                * @quick - do a quick repositioning without any duration
                * @force - force a repositioning
                **/
                rePosition : function(quick, force){
                    var $obj      = this.obj,
                        settings  = this.settings,
    					objBiggerThanArea,
    					objFartherThanTopPos,
    					pastStartOffset,
                        duration  = quick === true ? 0 : settings.duration,
    					setActive = true,
                        //wScroll = w.pageYOffset || doc.documentElement.scrollTop,
                        //wHeight = w.innerHeight || doc.documentElement.offsetHeight,

                        // "scrollY" for modern browsers and "scrollTop" for IE
    					areaScrollTop = this.settings.scrollArea == w ? w.scrollY ? w.scrollY : doc.documentElement.scrollTop : this.settings.scrollArea.scrollTop,
                        areaHeight    = this.settings.scrollArea == w ? doc.documentElement.offsetHeight : this.settings.scrollArea.offsetHeight;

    				this.areaViewportHeight = this.settings.scrollArea == w ? doc.documentElement.clientHeight : this.settings.scrollArea.clientHeight;
    				this.stickyHeight = $obj[0].clientHeight;

                    $obj.stop(); // stop any jQuery animation on the sticky element

                    if( settings.lockBottom )
                        maxTopPos = $obj[0].parentNode.clientHeight - this.stickyHeight - settings.offsetBottom; // get the maximum top position of the floated element inside it's parent

                    if( maxTopPos < 0 )
                        maxTopPos = 0;

                    // Define the basics of when should the object be moved
                    pastStartOffset      = areaScrollTop > settings.startOffset;   // check if the window was scrolled down more than the start offset declared.
                    objFartherThanTopPos = $obj.offset().top > (settings.startOffset + settings.offsetY);    // check if the object is at it's top position (starting point)
                    objBiggerThanArea    = this.stickyHeight > this.areaViewportHeight;  // if the window size is smaller than the Obj size, do not animate.

                    // if window scrolled down more than startOffset OR obj position is greater than
                    // the top position possible (+ offsetY) AND window size must be bigger than Obj size
                    if( ((pastStartOffset || objFartherThanTopPos) && !objBiggerThanArea) || force ){
                        this.newpos = areaScrollTop - settings.startOffset + settings.offsetY;

    					if( settings.stickToBottom )
                            this.newpos += this.areaViewportHeight - this.stickyHeight - settings.offsetY * 2;

                        // made sure the floated element won't go beyond a certain maximum bottom position
                        if( this.newpos > maxTopPos && settings.lockBottom ){
                            this.newpos = maxTopPos;
    						setActive = false;
    					}
                        // make sure the new position is never less than the offsetY so the element won't go too high (when stuck to bottom and scrolled all the way up)
                        if( this.newpos < settings.offsetY ){
                            this.newpos = settings.offsetY;
    						setActive = false;
    					}
                        // if window scrolled < starting offset, then reset Obj position (settings.offsetY);
                        else if( areaScrollTop < settings.startOffset && !settings.stickToBottom )
                            this.newpos = settings.offsetY;

    					$obj.toggleClass('sf--active', setActive);

                        // if duration is set too low OR user wants to use css transitions, then do not use jQuery animate
                        if( duration < 5 || (settings.cssTransition && supportsTransitions) )
                            $obj[0].style.top = this.newpos + 'px';
                        else
                            $obj.stop().delay(settings.delay).animate({ top: this.newpos }, duration, settings.easing );

    					this.settings.onReposition && this.settings.onReposition(this);
                    }
                },

                // update the settings for the instance and re-position the floating element
                update : function(opts){
                    if( typeof opts === 'object' ){
                        if( !opts.offsetY || opts.offsetY == 'auto' )
                            opts.offsetY = getComputed(this.obj).offsetY;
                        if( !opts.startOffset || opts.startOffset == 'auto' )
                            opts.startOffset = getComputed(this.obj).startOffset;

                        this.settings = $.extend( {}, this.settings, opts);

                        this.rePosition(false, true);
                    }
                    return this.obj;
                },

                destroy : function(){
                    $(this.settings.scrollArea).off('scroll.sticky');
    				$(w).off('resize.sticky');
                    this.obj.removeData();
                    return this.obj;
                }
            };
            // find the computed startOffset & offsetY of a floating element
            function getComputed($obj){
                var p = $obj.parent(),
                    ob = parseInt(p.css('padding-bottom')),
                    oy = parseInt(p.css('padding-top')),
                    so = p.offset().top;

                return{ startOffset:so, offsetBottom:ob, offsetY:oy };
            }

        $.fn.stickyfloat = function(option, settings){
            // instatiate a new 'Sticky' object per item that needs to be floated
            return this.each(function(){
                var $obj = $(this);

                if( typeof document.body.style.maxHeight == 'undefined' )
                    return false;
                if(typeof option === 'object')
                    settings = option;
                else if(typeof option === 'string'){
                    if( $obj.data('_stickyfloat') && typeof $obj.data('_stickyfloat')[option] == 'function' ){
                        var sticky = $obj.data('_stickyfloat');
                        return sticky[option](settings);
                    }
                    else
                        return this;
                }

                var $settings = $.extend( {}, defaults, getComputed($obj), settings || {} );

                var sticky = new Sticky($settings, $obj);
                sticky.init();
            });
        };
    })(jQuery);

    if ($(window).width() > 1000) {
        $('.tourgeckoBookButton').stickyfloat({offsetY: 300});

        // after page refresh, make sure the values are returned to their defaults
        $('.tourgeckoBookButton :text').each(function(){
        	$(this).val(this.defaultValue);
        });
    }
}