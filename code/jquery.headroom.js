/**
 * jquery.headroom.js 1.0
 * http://jquerywidget.com
 */
;(function (factory) {
    if (typeof define === "function" && (define.amd || define.cmd) && !jQuery) {
        // AMD或CMD
        define([ "jquery" ],factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function( root, jQuery ) {
            if ( jQuery === undefined ) {
                if ( typeof window !== 'undefined' ) {
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
    $.fn.headroom = function(parameter){
        parameter = parameter || {};
        var defaults = {
            hiddenTop:0,                //滚动隐藏的位置
            fixedTop:0,                 //显示的位置
            duration:500,               //动画时长
            autoHide:true
        };
        var options = $.extend({}, defaults, parameter);
        var $document = $(document);
        var $window  = $(window);
        return this.each(function() {
            //对象定义
            var $this = $(this);
            var _top = $this.offset().top;
            var _width = $this.width();
            var _height = $this.outerHeight();
            var _scroll_top = 0;
            var _transition = 'all '+(options.duration/1e3)+'s ease';
            var last_up = false;
            var last_scroll_top = _scroll_top;
            var isFixed = false;
            $this.width(_width).wrap('<div style="height:'+_height+'px"></div>');
            //私有方法
            var scroll = function(){
                var scroll_top = $document.scrollTop()+options.fixedTop;
                var up = scroll_top - _scroll_top<0;
                var ismove = Math.abs(scroll_top-_scroll_top)>10;
                var hide_top = Math.max(options.hiddenTop,_top+_height);
                if(options.autoHide&&scroll_top>hide_top){ //滚动距离大于菜单下边缘
                    $this.css({'transition':_transition});
                    if(ismove){
                        if(up){
                            $this.css({'position':'fixed','top':options.fixedTop+'px'});
                        }else{
                            $this.css({'position':'fixed','top':options.fixedTop-_height+'px'});
                        }
                        _scroll_top = scroll_top;
                        isFixed = true;
                    }
                }else if(scroll_top>_top){ //滚动距离介于菜单上边缘和下边缘之间
                    if(isFixed){
                        $this.css({'transition':_transition,'position':'fixed','top':options.fixedTop+'px'});
                    }else{
                        $this.css({'transition':'','position':'','top':''});
                    }
                    _scroll_top = scroll_top;
                    isFixed = true;
                }else{ //滚动距离小于菜单上边缘
                    $this.css({'transition':'','position':'','top':''});
                    _scroll_top = scroll_top;
                    isFixed = false;
                }
                last_up = up;
                last_scroll_top = scroll_top;
            };
            $window.scroll(scroll);
            scroll();
        });
    };
}));
