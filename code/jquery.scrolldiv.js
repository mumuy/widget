/**
 * jquery.scrolldiv.js 1.0
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
    $.fn.scrolldiv = function(parameter) {
        parameter = parameter || {};
        var defaults = {
            list: [],   //栏目列表
            steps: 100  //滚动速度
        };
        var options = $.extend({}, defaults, parameter);
        var $window = $(window);
        var $document = $(document);
        return this.each(function() {
            var $this = $(this);
            var $list = $this.find(options.list.join(","));
            var _position_top = $this.position().top;
            var _window_height = $window.height();
            var _maxheight = 0;
            $list.css("position","relative").each(function(i){
                _maxheight = Math.max(_maxheight,$list.eq(i).height());
            });
            //私有方法
            function scroll(e) {
                e = e || window.event;
                stopBubble(e);
                stopDefault(e);
                var window_top = $window.scrollTop();
                var delta = -e.wheelDelta / 120 || e.detail / 3;
                var move = delta * options.steps;
                slide(window_top + move);
                $document.scrollTop(window_top + move);
            }
            function slide(top){
                var top = top || $document.scrollTop();
                var scroll_height = top - _position_top;
                var distance = _maxheight-_window_height;
                if (scroll_height < 0) {
                    $list.css("top", "0px");
                } else if(scroll_height>distance) {
                    $list.each(function(i){
                        $list.eq(i).css("top",_maxheight-$list.eq(i).height()+'px');
                    });
                }else{
                    var times = scroll_height /distance;
                    $list.each(function(i){
                        $list.eq(i).css("top",(_maxheight - $list.eq(i).height()) * times + "px");
                    });
                }
            }
            //事件绑定
            //鼠标滚轴
            if (document.addEventListener) {
                document.addEventListener('DOMMouseScroll', scroll, false);
            }
            window.onmousewheel = document.onmousewheel = scroll;
            //滚动条
            $window.scroll(function(){
                slide();
            });
            //窗体改变
            $window.resize(function() {
                _window_height = $window.height();
                slide();
            });
            slide();
        });
    };
    //工具函数
    function stopBubble(e) {
        if (e && e.stopPropagation) {
            e.stopPropagation();
        } else if (window.event) {
            window.event.cancelBubble = true;
        }
    }
    function stopDefault(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        } else {
            window.event.returnValue = false;
        }
        return false;
    }
}));
