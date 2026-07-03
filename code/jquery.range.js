/**
 * jquery.range.js 1.1
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
                let jQuery = require('jquery');
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
    $.fn.range = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        let defaults = {
            valueCls: 'value',		    // 当前有效值范围显示class
            handleCls: 'handle',	    // 拖动滑块class
            min: 0,					    // 变化范围的最小值
            max: 100,				    // 变化范围的最大值
            value: 1,				    // 默认显示的值
            steps: 1,				    // 每次移动的步长
            isRange:false,              // 是否为范围选择，true为范围选择，false为单值选择 
            type:'outer',               // outer进度计算以进度条宽为准，inner进度计算需扣除条滑块宽
            onSlide: function(){},	    // 当前值变化时触发的事件，传入对象:event为事件,value为当前值,obj为当前对象
            onChange: function(){}      // 当前值变化后触发的事件，传入对象:event为事件,value为当前值,obj为当前对象
        };
        let options = $.extend({},defaults,parameter);
        let $window = $(window);
        let $document = $(document);
        let $body = $("body");
        return this.each(function() {
            //对象定义
            let _self = this;
            let $this = $(this);
            let $value = $(`<div class='${options.valueCls}'></div>`).appendTo($this);
            let $startHandle = $(`<div class='${options.handleCls}'></div>`).appendTo($this);
            let $endHandle = $(`<div class='${options.handleCls}'></div>`).appendTo($this);
            if(!options.isRange){
                $startHandle.hide();
            }
            //全局变量
            let _api = {};
            let _value = options.value;
            let _startHandle_width = options.isRange?$startHandle.outerWidth():0;
            let _endHandle_width = $endHandle.outerWidth();
            let _offset = 0;
            let _width = options.type=='outer'?$this.width():$this.width() - (_startHandle_width + _endHandle_width)/2;
            let _length = _width/(options.max - options.min); 	//单元宽度
            let _cursor_position = $this.offset().left;			//鼠标位置
            let isMouseDown = '';

            // 对值进行兼容校验
            if(options.isRange){
                if(typeof _value!='object'){
                    _value = [options.min,options.max];
                }
            }else if(!options.isRange){
                if(typeof _value!='number'){
                    _value = options.max;
                }
            }

            //样式初始化
            $this.css({
                'position':'relative'
            });
            $value.css({
                'position':'absolute',
                'height':'100%'
            });
            $startHandle.css({
                'position':'absolute'
            });
            $endHandle.css({
                'position':'absolute'
            });

            /****** 共有方法 ******/
            //移动到指定值
            const formatValue = function(){
                let start = options.min;
                let end = options.max;
                if(options.isRange){
                    start = Math.min(_value[0],_value[1]);
                    end = Math.max(_value[0],_value[1]);
                    _value = [start,end];
                }else{
                    start = options.min;
                    end = _value;
                }
                const left = _startHandle_width/2;
                $value.css({
                    'left':(start - options.min) * _length + left,
                    'width':(end - start) * _length
                });
                $startHandle.css({
                    'left':(start - options.min) * _length + left - (_startHandle_width/2)
                });
                $endHandle.css({
                    'left':(end - options.min) * _length  + left - (_endHandle_width/2)
                });
            };
            _api.setValue = function(value){
                _value = value||_value;
                formatValue();
                options.onSlide({event:{},value:_value,obj:$this});
            };
            // 重置插件尺寸
            _api.resize = function(){
                _width = options.type=='outer'?$this.width():$this.width() - (_startHandle_width + _endHandle_width)/2;
                _length = _width/(options.max - options.min);
                formatValue();
            };

            /* 事件绑定 */
            $this.on('mouseup touchend',function(e){
                if(isMouseDown){
                    setSelectable($body,true);
                    const pageX = e.type=='mouseup'?e.pageX:e.changedTouches[0].pageX;
                    let move = pageX - _offset;
                    if(_cursor_position>0&&_cursor_position<(isMouseDown=='start'?_startHandle_width:_endHandle_width)){   //鼠标在手柄中位置，对值的修正
                        move -= _cursor_position;
                    }
                    const value = Math.round(move/(_length*options.steps))*options.steps + options.min;
                    if(options.isRange){
                        if(isMouseDown == 'start'){
                            _value[0] = value;
                        }else{
                            _value[1] = value;
                        }
                    }else{
                        _value = value;
                    }
                    formatValue();
                    options.onSlide({event:e,value:_value,obj:$this});
                    options.onChange({event:e,value:_value,obj:$this});
                    isMouseDown = '';
                }
            });
            $startHandle.on('mousedown touchstart',function(e){
                isMouseDown = 'start';
                _offset = $this.offset().left;
                const pageX = e.type=='mousedown'?e.pageX:e.changedTouches[0].pageX;
                _cursor_position = pageX - _offset-$startHandle.position().left;
                setSelectable($body,false);
            });
            $endHandle.on('mousedown touchstart',function(e){
                isMouseDown = 'end';
                _offset = $this.offset().left;
                const pageX = e.type=='mousedown'?e.pageX:e.changedTouches[0].pageX;
                _cursor_position = pageX-_offset-$endHandle.position().left;
                setSelectable($body,false);
            });
            $document.on('mousemove touchmove',function(e){
                if(isMouseDown){
                    const pageX = e.type=='mousemove'?e.pageX:e.changedTouches[0].pageX;
                    let move = pageX - _offset;
                    if(_cursor_position>0&&_cursor_position<(isMouseDown=='start'?_startHandle_width:_endHandle_width)){   //鼠标在手柄中位置，对值的修正
                        move -=_cursor_position;
                    }
                    move = Math.max(0,move);
                    move = Math.min(move,_width);
                    const value = Math.round(move/(_length*options.steps))*options.steps + options.min;
                    if(options.isRange){
                        if(isMouseDown == 'start'){
                            _value[0] = value;
                        }else{
                            _value[1] = value;
                        }
                    }else{
                        _value = value;
                    }
                    formatValue();
                    options.onSlide({event:e,value:_value,obj:$this});
                }
            }).on('mouseup touchend',function(e){
                if(isMouseDown){
                    isMouseDown = '';
                    setSelectable($body,true);
                    formatValue();
                    options.onChange({event:e,value:_value,obj:$this});
                }
            });
            $window.on('resize',_api.resize);
            //初始化
            _api.setValue(_value);
            getApi(_api);
        });
        //工具函数
        function stopBubble(e){
            if (e && e.stopPropagation) {
                e.stopPropagation();
            }else if (window.event) {
                window.event.cancelBubble = true;
            }
        }
        function stopDefault(e) {
            if ( e && e.preventDefault ){
                e.preventDefault();
            }else{
                 window.event.returnValue = false;
            }
            return false;
        }
        function setSelectable(obj, enabled) {
            if(enabled) {
                obj.removeAttr("unselectable").removeAttr("onselectstart").css("user-select", "");
            } else {
                obj.attr("unselectable", "on").attr("onselectstart", "return false;").css("user-select", "none");
            }
        }
    };
}));
