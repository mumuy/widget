/**
 * jquery.headroom.js 1.0
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
    $.fn.headroom = function(parameter,callback){
        var parameter = parameter || {};
        var callback = callback || function(){};
        var defaults = {
            hiddenTop:0,                // 滚动隐藏的位置
            fixedTop:0,                 // 显示的位置
            duration:500,               // 动画时长
            autoFixed:true,             // 自动浮动
            autoHide:true,              // 自动隐藏
            scrollOffset:0,             // 移动时的偏移量
            zIndex:9999,                // zindex
            isScrollActive:true,        // 滚动是改变选中状态
            activeIndex:0,              // 默认选中菜单
            activeCls:'active',         // 选中效果
            fixedCls:'fixed',           // 浮动
            background:'',
            onResize:function(){}
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
            $this.wrap('<div></div>');
            var $fixed = $this.parent();
            $fixed.wrap('<div></div>');
            var $outer = $fixed.parent();
            var _width = $this.outerWidth();
            var _height = $this.outerHeight();
            var backgroundColor = $this.css('background-color');
            $fixed.css({
                'width':_width+'px',
                'background':backgroundColor!='rgba(0, 0, 0, 0)'?backgroundColor:'#ffffff'
            });
            if(options.background){
                $fixed.css({
                    'background':options.background
                });
            }
            var $links = $this.find('a[href*="#"]');
            var $list = [];
            $links.each(function(){
                var $link = $(this);
                var url = $link.attr('href');
                if(url.match(/^#\S/)){                
                    var $item = $(url);
                    if($item.length){
                        $list.push($item);
                    }
                }
            });
             // 对外接口
            var _api = {};
            _api.setOptions = function(parameter){
                options = $.extend({}, options, parameter);
            };
            // 私有方法
            var _window_width;
            var scroll = function(){
                _top = $outer.offset().top;
                var scroll_top = $document.scrollTop()+options.fixedTop;
                var up = scroll_top - _scroll_top<0;
                var ismove = Math.abs(scroll_top-_scroll_top)>10;
                var hide_top = Math.max(options.hiddenTop,_top+_height);
                if(options.autoFixed){
                    if(options.autoHide&&scroll_top>hide_top){ //滚动距离大于菜单下边缘
                        $fixed.css({'transition':_transition});
                        if(ismove){
                            if(up){
                                $fixed.addClass(options.fixedCls).css({'position':'fixed','top':options.fixedTop+'px','z-index':options.zIndex});
                            }else{
                                $fixed.addClass(options.fixedCls).css({'position':'fixed','top':options.fixedTop-_height+'px','z-index':options.zIndex});
                            }
                            _scroll_top = scroll_top;
                            isFixed = true;
                        }
                    }else if(scroll_top>=_top){ //滚动距离介于菜单上边缘和下边缘之间
                        if(isFixed){
                            $fixed.addClass(options.fixedCls).css({'transition':_transition,'position':'fixed','top':options.fixedTop+'px','z-index':options.zIndex});
                        }else{
                            $fixed.removeClass(options.fixedCls).css({'transition':'','position':'','top':'','z-index':0});
                        }
                        _scroll_top = scroll_top;
                        isFixed = true;
                    }else{ //滚动距离小于菜单上边缘
                        $fixed.removeClass(options.fixedCls).css({'transition':'','position':'','top':'','z-index':0});
                        _scroll_top = scroll_top;
                        isFixed = false;
                    }
                }
                last_up = up;
                last_scroll_top = scroll_top;
                if(options.isScrollActive){                
                    var id='';
                    for(var i=0;i<$list.length;i++){
                        var top = $list[i].offset().top-options.scrollOffset;
                        if(Math.floor(top)<=scroll_top){
                            id = $list[i].attr('id');
                        }
                    }
                    if(id&&!isAnimate){
                        $links.removeClass(options.activeCls);
                        $links.filter('[href="#'+id+'"]').addClass(options.activeCls);
                    }
                }
            };
            var resize = function(){
                options.onResize(_api);
                last_scroll_top = _scroll_top = 0;
                _window_width = $document.width();
                $outer.attr('style','');
                _width = $outer.width();
                $fixed.css({
                    'width':_window_width==_width?'100%':_width
                });
                var heightAuto = function(){
                    _height = $this.outerHeight();
                    $outer.css({
                        'height':_height
                    });
                };
                heightAuto();
                setTimeout(heightAuto,500);
            };
           
            $window.scroll(scroll);
            $window.resize(resize);
            $links.on('click',function(){
                var $this = $(this);
                var hash = $this.attr('href');
                var $panel = $(hash);
                if($panel.length){
                    var top = $panel.offset().top-options.scrollOffset;
                    $links.removeClass(options.activeCls);
                    $this.addClass(options.activeCls);
                    isAnimate = true;
                    $('html,body').animate({scrollTop:top},500,function(){
                        isAnimate = false;
                        scroll();
                    });
                }
                return false;
            });
            //初始化
            resize();
            scroll();
            if(parameter['activeIndex']){
                $links.eq(parameter.activeIndex).click();
            }
            callback(_api);
        });
    };
}));