/**
 * jquery.popup.js 1.0
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
    $.fn.popup = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
            triggerType:'mouse',        //触发事件类型
            trigger:'',                 //触发的节点(选择器)
            node: '',                   //弹出的节点(选择器)
            offset:[0,0],               //偏移量
            points:['cb','ct']          //弹出层与参考节点的对齐方式
        };
        var options = $.extend({}, defaults, parameter);
        return this.each(function() {
            //对象定义
            var $this = $(this);
            var $trigger = $this.find(options.trigger);
            var $node = $this.find(options.node).hide();
            var _offset = $this.offset();
            var _t = (function(){
                var offset = $trigger.offset();
                return {
                    'left':offset.left-_offset.left,
                    'top':offset.top-_offset.top,
                    'width':$trigger.width(),
                    'height':$trigger.height()
                };
            })();
            var _n = {
                'width':$node.width(),
                'height':$node.height()
            };
            //样式定义
            if($this.css('position')!='absolute'){
                $this.css('position','relative');
            }
            var times = {
                'l':0,
                't':0,
                'c':0.5,
                'r':1,
                'b':1
            };
            var _left = _t['left'] + _t['width']*times[options.points[0].charAt(0)]-_n['width']*times[options.points[1].charAt(0)];
            var _top = _t['top'] + _t['height']*times[options.points[0].charAt(1)]-_n['height']*times[options.points[1].charAt(1)];
            $node.css({
                'position':'absolute',
                'left':_left+options.offset[0]+'px',
                'top':_top+options.offset[1]+'px',
                'z-index':999
            });
            var isShow = false;
            var _hander = null;
            var _node = {
                'show':function(){
                    if(!isShow){
                        _hander&&clearTimeout(_hander);
                        _hander = setTimeout(function(){
                            $node.show();
                        },100);
                        isShow = true;
                    }
                },
                'hide':function(){
                    if(isShow){
                        _hander&&clearTimeout(_hander);
                        _hander = setTimeout(function(){
                            $node.hide();
                        },100);
                        isShow = false;
                    }
                }
            };
            //事件绑定
            if(options.triggerType === 'mouse'){
                var o = $trigger.add($node).on({
                    'mouseenter':_node.show,
                    'mouseleave':_node.hide
                });
            }else{
                $trigger.on('click',function(){
                    if(isShow){
                        _node.hide();
                    }else{
                        _node.show();
                    }
                });
            }
        });
    };
}));
