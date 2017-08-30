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
            autoHide:true,              //自动隐藏
            scrollOffset:0,             //移动时的偏移量
            activeCls:'active'
        };
        var options = $.extend({}, defaults, parameter);
        var $document = $(document);
        var $window  = $(window);
        return this.each(function() {
            //对象定义
            var $this = $(this);
            var _top = $this.offset().top;
            var _scroll_top = 0;
            var _transition = 'all '+(options.duration/1e3)+'s ease';
            var last_up = false;
            var last_scroll_top = _scroll_top;
            var isFixed = false;
            var isAnimate = false;
            $this.wrapInner('<div></div>');
            var $fixed = $this.children();
            var _width = $this.width();
            var _height = $this.outerHeight();
            $this.height(_height);
            $fixed.css({'background':$this.css('background-color')});
            var $links = $this.find('a[href*=#]');
            var $list = $.map($links,function(link){
                var $link = $(link);
                var hash = $link.attr('href');
                var $item = $(hash);
                if($item.length){
                    return $item;
                }
            });
            //私有方法
            var scroll = function(){
                var scroll_top = $document.scrollTop()+options.fixedTop;
                var up = scroll_top - _scroll_top<0;
                var ismove = Math.abs(scroll_top-_scroll_top)>10;
                var hide_top = Math.max(options.hiddenTop,_top+_height);
                if(options.autoHide&&scroll_top>hide_top){ //滚动距离大于菜单下边缘
                    $fixed.css({'transition':_transition});
                    if(ismove){
                        if(up){
                            $fixed.css({'position':'fixed','top':options.fixedTop+'px'});
                        }else{
                            $fixed.css({'position':'fixed','top':options.fixedTop-_height+'px'});
                        }
                        _scroll_top = scroll_top;
                        isFixed = true;
                    }
                }else if(scroll_top>_top){ //滚动距离介于菜单上边缘和下边缘之间
                    if(isFixed){
                        $fixed.css({'transition':_transition,'position':'fixed','top':options.fixedTop+'px'});
                    }else{
                        $fixed.css({'transition':'','position':'','top':''});
                    }
                    _scroll_top = scroll_top;
                    isFixed = true;
                }else{ //滚动距离小于菜单上边缘
                    $fixed.css({'transition':'','position':'','top':''});
                    _scroll_top = scroll_top;
                    isFixed = false;
                }
                last_up = up;
                last_scroll_top = scroll_top;

                var id='';
                for(var i=0;i<$list.length;i++){
                    var top = $list[i].offset().top-options.scrollOffset;
                    if(top<=scroll_top){
                        id = $list[i].attr('id');
                    }
                }
                if(id&&!isAnimate){
                    $links.removeClass(options.activeCls);
                    $links.filter('[href=#'+id+']').addClass(options.activeCls);
                }
            };
            var resize = function(){
                _width = $this.width();
                _height = $this.outerHeight();
                $fixed.css({
                    'width':_width,
                    'height':_height
                });
            };
            $window.scroll(scroll);
            $window.resize(resize);
            $links.on('click',function(){
                var $this = $(this);
                var hash = $this.attr('href');
                var $panel = $(hash);
                var top = $panel.offset().top-options.scrollOffset;
                $links.removeClass(options.activeCls);
                $this.addClass(options.activeCls);
                isAnimate = true;
                $('html,body').animate({scrollTop:top},500,function(){
                    isAnimate = false;
                });
                return false;
            });
            //初始化
            $links.eq(0).addClass(options.activeCls);
            resize();
            scroll();
        });
    };
}));
