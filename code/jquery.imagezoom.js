/**
 * jquery.imagezoom.js 1.0
 * http://jquerywidget.com
 */
;(function (factory) {
    if (typeof define === "function" && (define.amd || define.cmd)) {
        // AMD或CMD
        define([ "jquery" ], factory);
    } else {
        // 全局模式
        factory(jQuery);
    }
}(function ($) {
    $.fn.imagezoom = function(parameter) {
        parameter = parameter || {};
        var defaults = {
            width: null,        //图片外层宽度
            height: null,       //图片外层宽度
            resizeable: true,   //窗口大小改变时是否重新调整图片位置
            effect:'out',       //图片处理
            condition: 'img',   //默认筛选条件
            hoverEvent:false,   //鼠标悬浮时是否放大
            hoverRatio:1.2,     //鼠标悬浮时放大比例
            duration:300        //鼠标悬浮时放大动画时长
        };
        var options = $.extend({}, defaults, parameter);
        var $window = $(window);
        return this.each(function(index) {
            var $this = $(this).css("overflow", "hidden");
            var _duration = options.duration;
            var _hoverRatio = options.hoverRatio;
            var _outer_width = parameter.width||$this.width();
            var _outer_height = parameter.height||$this.height();
            $this.find(options.condition).each(function() {
                var $img = $(this);
                $img.css('display','block').removeAttr('width').removeAttr('height');
                var  _width = this.width;
                var  _height =this.height;
                var _ratio = 1;
                if(this.complete&&_width){ //防止图片未加载时就开始计算
                    getRatio();
                }else{
                    this.onload = function(){
                        _width = this.width;
                        _height = this.height;
                        getRatio();
                    }
                }
                //私有方法
                function getRatio(){
                    //数值计算
                    if(options.effect=='out'){ //在不放大图片失真的情况下，最大面积地展示图片
                        if(_width>_height){
                            if(_height>_outer_height){
                                _ratio = Math.max(_outer_width/_width,_outer_height/_height);
                            }
                        }else{
                            if(_width>_outer_width){
                                _ratio = Math.max(_outer_width/_width,_outer_height/_height);
                            }
                        }
                    }else if(options.effect=='in'){ //在不放大图片失真的情况下，最大清晰度地展示完整图片
                        if(_width>_outer_width||_height>_outer_height){
                            _ratio = Math.min(_outer_width/_width,_outer_height/_height);
                        }
                    }
                    zoom(_ratio);
                };
                //缩放动画
                function zoom(ratio,isAnimate){ //ratio：放大比例，isAnamate：是否动画（默认不动画）
                    var obj = {
                        'width':Math.ceil(_width*ratio),
                        'height':Math.ceil(_height*ratio),
                        'margin-left':Math.ceil((_outer_width-_width*ratio)/2),
                        'margin-top':Math.ceil((_outer_height-_height*ratio)/2)
                    };
                    if(isAnimate){
                        $img.stop().animate(obj,_duration);
                    }else{
                        $img.css(obj);
                    }
                };
                //事件绑定
                if(options.hoverEvent){
                    $this.on({
                        'mouseenter':function(){
                            zoom(_ratio*_hoverRatio,true);
                        },
                        'mouseleave':function(){
                            zoom(_ratio,true);
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