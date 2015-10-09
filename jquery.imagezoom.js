/*
    图片缩放居中 v1.2
    BY:le
*/
(function($) {
    $.fn.imagezoom = function(parameter) {
        parameter = parameter || {};
        var defaults = {
            width: null, //图片外层宽度
            height: null, //图片外层宽度
            resizeable: true, //窗口大小改变时是否重新调整图片位置
            effect:'scale', //图片处理
            condition: "img" //默认筛选条件
        };
        var options = $.extend({}, defaults, parameter);
        var $window = $(window);
        return this.each(function() {
            var $this = $(this);
            $this.css("overflow", "hidden");
            $this.find(options.condition).each(function() {
                var $img = $(this).css('display','block'); //防止外框text-align:center,图片居中错位
                var _width = this.width;
                var _height = this.height;
                if(this.complete&&_width){ //防止图片未加载时就开始计算
                    zoom();
                }else{     
                    this.onload = function(){
                        _width = this.width;
                        _height = this.height;
                        zoom();
                    }  
                }
                //私有方法
                function zoom(){
                    var obj = {};
                    var ratio = 1;
                    options.width = parameter.width||$this.width();
                    options.height = parameter.height||$this.height();
                    if(options.effect=='scale'){
                        //数值计算
                        if(_width>_height){
                            if(_height>options.height){
                                ratio = Math.max(options.width/_width,options.height/_height);
                            }
                        }else{
                            if(_width>options.width){
                                ratio = Math.max(options.width/_width,options.height/_height);
                            }
                        }
                        //样式修改
                        obj = {
                            'width':Math.ceil(_width*ratio),
                            'height':Math.ceil(_height*ratio),
                            'margin-left':Math.ceil((options.width-_width*ratio)/2),
                            'margin-top':Math.ceil((options.height-_height*ratio)/2)
                        };                      
                    }
                    $img.css(obj);
                }
                //事件绑定
                if(options.resizeable){
                    $window.resize(zoom);
                }
            });
        });
    };
})(jQuery);