/**
 * jquery.imagezoom.js 1.1
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
    $.fn.imagezoom = function(parameter) {
        parameter = parameter || {};
        var defaults = {
            width: null,        //图片外层宽度
            height: null,       //图片外层宽度
            resizeable: true,   //窗口大小改变时是否重新调整图片位置
            effect:'default',   //图片处理
            data:'original',    //图片源（防止惰性加载插件）
            condition: 'img',   //默认筛选条件
            borderWidth: 0,     //图片边框宽度
            hoverEffect:false,  //鼠标悬浮时是否放大
            hoverRatio:1.2,     //鼠标悬浮时放大比例
            duration:300,       //鼠标悬浮时放大动画时长
            beforeHover:function(){},
            afterHover:function(){}
        };
        var options = $.extend({}, defaults, parameter);
        var $window = $(window);
        return this.each(function(index) {
            var _ = this;
            var $this = $(this).css("overflow", "hidden");
            var _duration = options.duration;
            var _hoverRatio = options.hoverRatio;
            var _outer_width = parameter.width||$this.width();
            var _outer_height = parameter.height||$this.height();
            $this.find(options.condition).each(function() {
                var $img = $(this).css({
                    'display':'block',
                    'max-width':'none',
                    'max-height':'none'
                });
                var temp = new Image();
                temp.src = $img.data(options.data)||$img.attr('src');
                var _width = temp.width,_height = temp.height,_ratio = 1;
                if(temp.complete&&_width){ //防止图片未加载时就开始计算
                    getRatio();
                }else{
                    temp.onload = function(){
                        _width = temp.width;
                        _height = temp.height;
                        getRatio();
                    };
                }
                //私有方法
                function getRatio(){
                    //数值计算
                    if(options.effect=='out'){ //在不放大图片失真的情况下，最大面积地展示图片并覆盖整个外框
                        if(_width>_height){
                            if(_height>_outer_height){
                                _ratio = Math.max(_outer_width/_width,_outer_height/_height);
                            }
                        }else{
                            if(_width>_outer_width){
                                _ratio = Math.max(_outer_width/_width,_outer_height/_height);
                            }
                        }
                    }else if(options.effect=='in'){
                        if(_width>_outer_width||_height>_outer_height){ //在不放大图片失真的情况下，最大清晰度地展示完整图片
                            _ratio = Math.min(_outer_width/_width,_outer_height/_height);
                        }
                    }else{  //任何条件下，最大面积地展示图片并覆盖整个外框
                        _ratio = Math.max(_outer_width/_width,_outer_height/_height);
                    }
                    zoom(_ratio);
                }
                //缩放动画
                function zoom(ratio,isAnimate){ //ratio：放大比例，isAnamate：是否动画（默认不动画）
                    var obj = {
                        'width':Math.ceil(_width*ratio)-options.borderWidth*2,
                        'height':Math.ceil(_height*ratio)-options.borderWidth*2,
                        'margin-left':Math.ceil((_outer_width-_width*ratio)/2),
                        'margin-top':Math.ceil((_outer_height-_height*ratio)/2)
                    };
                    if(isAnimate){
                        $img.stop().animate(obj,_duration);
                    }else{
                        $img.css(obj);
                    }
                }
                //事件绑定
                if(options.hoverEffect){
                    $this.on({
                        'mouseenter':function(){
                            if(options.beforeHover.call(_)!=false){
                                zoom(_ratio*_hoverRatio,true);
                            }
                        },
                        'mouseleave':function(){
                            if(options.afterHover.call(_)!=false){
                                zoom(_ratio,true);
                            }   
                        }
                    });
                }
                if(options.resizeable){
                    $window.resize(function(){
                        _outer_width = parameter.width||$this.width();
                        _outer_height = parameter.height||$this.height();
                        getRatio();
                    });
                }
            });
        });
    };
}));
