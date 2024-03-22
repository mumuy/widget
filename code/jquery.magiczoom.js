/**
 * jquery.magiczoom.js 1.0
 * http://jquerywidget.com
 */
;(function (factory) {
    if (typeof define === "function" && define.amd){
		// AMD
        if (typeof jQuery === 'undefined') {
			define(['jquery'],factory);
        }else{
	        define(function(){
	            factory(jQuery);
	        });
        }
	}else if (typeof define === "function" && define.cmd){
		// CMD
        if (typeof jQuery === 'undefined') {
			define(function(require){
				var jQuery = require('jquery');
	            factory(jQuery);
	        });
        }else{
	        define(function(){
	            factory(jQuery);
	        });
        }
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function( root, jQuery ) {
            if (typeof jQuery === 'undefined') {
                if (typeof window !== 'undefined' ) {
                    jQuery = require('jquery');
                } else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        //Browser globals
        factory(jQuery);
    }
}(function ($) {
    $.fn.magiczoom = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
            'viewSize':300
        };
        var options = $.extend({}, defaults, parameter);
        var $document = $(document);
        var $body = $('body');
        var imageDownLoad = function(url,callback){
            callback = callback || function(){};
            var image = new Image();
            image.src = url;
            image.onload = callback(image);
        };
        return this.each(function() {
            var image = this;
            var src = image.src;
            var $this = $(image);
            var $outer_box = $this.parent();
            var $hover_box = $('<div></div>').appendTo($outer_box);
            var $view_box = $('<div></div>').appendTo($body);
            $outer_box.css({
                'position':'relative'
            });
            $view_box.css({
                'display':'none',
                'width':'200px',
                'height':'200px',
                'background':'#fff',
                'border': '1px solid #e8e8e8',
                'overflow': 'hidden'
            });
            var $view_image = $('<img src="'+src+'"/>').appendTo($view_box);
            imageDownLoad(src,function(original){
                var lastTime = 0;
                $outer_box.css('cursor','move');
                $outer_box.on('mouseenter',function(){
                    $hover_box.show();
                    $view_box.css({
                        'display':'block',
                        'position':'absolute',
                        'top':$outer_box.offset().top,
                        'left':$outer_box.offset().left + $outer_box.outerWidth() + 3,
                        'z-index':9,
                        'width': options.viewSize+'px',
                        'height':options.viewSize+'px',
                    });
                });
                $outer_box.on('mouseleave',function(){
                    $hover_box.hide();
                    $view_box.hide();
                });
                $outer_box.on('mousemove',function(event){
                    var ratio = original.naturalWidth/image.width;
                    var hover_ratio = original.naturalWidth/options.viewSize;
                    var hover_size = image.width/hover_ratio;
                    var positionX = event.pageX - $outer_box.offset().left - hover_size/2;
                    var positionY = event.pageY - $outer_box.offset().top - hover_size/2;
                    positionX = Math.max(positionX,image.offsetLeft);
                    positionX = Math.min(positionX,image.offsetLeft+image.width-hover_size);
                    positionY = Math.max(positionY,image.offsetTop);
                    positionY = Math.min(positionY,image.offsetTop+image.height-hover_size);

                    var imageX = (positionX - image.offsetLeft)*ratio;
                    var imageY = (positionY - image.offsetTop)*ratio;
                    $hover_box.css({
                        'position':'absolute',
                        'left':positionX,
                        'top':positionY,
                        'width':hover_size+'px',
                        'height':hover_size+'px',
                        'background':'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QkY1MTc1NEJFNENDMTFFNTg1RkZFODBBNDY0MDM1MjkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QkY1MTc1NENFNENDMTFFNTg1RkZFODBBNDY0MDM1MjkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCRjUxNzU0OUU0Q0MxMUU1ODVGRkU4MEE0NjQwMzUyOSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCRjUxNzU0QUU0Q0MxMUU1ODVGRkU4MEE0NjQwMzUyOSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnHGyH8AAAAVSURBVHjaYoiY+B8EGBhBBAgABBgAZK0I4wvsoUUAAAAASUVORK5CYII=) 0 0 repeat'
                    });
                    $view_image.css({
                        'position':'relative',
                        'left':-imageX,
                        'top':-imageY
                    });
                });
            });
        });
    };
}));