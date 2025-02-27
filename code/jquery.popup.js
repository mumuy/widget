/**
 * jquery.popup.js 1.1
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
    $.fn.popup = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
            triggerType:'mouse',        // 触发事件类型
            trigger:'',                 // 触发的节点(选择器)
            node: '',                   // 弹出的节点(选择器)
            offset:[0,0],               // 偏移量
            points:['cb','ct'],         // 弹出层与参考节点的对齐方式
            onTrigger:function(){}
        };
        var options = $.extend({}, defaults, parameter);
        var $document = $(document);
        return this.each(function() {
            //对象定义
            var $this = $(this);
            var $trigger = $this.find(options.trigger);
            var $trigger_item = $trigger;
            var $node = $this.find(options.node).hide();
            //样式定义
            if($this.css('position')!='absolute'){
                $this.css('position','relative');
            }
            var isShow = false;
            var _hander = null;
            var _api = {
                'show':function(){
                    if(!isShow){
                        var _offset = $this.offset();
                        var _t = (function(){
                            var offset = $trigger_item.offset();
                            return {
                                'left':offset.left-_offset.left,
                                'top':offset.top-_offset.top,
                                'width':$trigger_item.outerWidth(),
                                'height':$trigger_item.outerHeight()
                            };
                        })();
                        var _n = {
                            'width':$node.outerWidth(),
                            'height':$node.outerHeight()
                        };
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
                $trigger.on({
                    'mouseenter':function(){
                        $trigger_item = $(this);
                        _api.show();
                    },
                    'mouseleave':_api.hide
                });
                $node.on({
                    'mouseenter':_api.show,
                    'mouseleave':_api.hide
                });
            }else{
                $trigger.on(options.triggerType,function(){
                    options.onTrigger.bind(this)(_api);
                    if(isShow){
                        _api.hide();
                        if($trigger_item[0]!=this){
                            $trigger_item = $(this);
                            _api.show();
                        }
                    }else{
                        $trigger_item = $(this);
                        _api.show();
                    }
                    return false;
                });
                $trigger.on('click',function(){
                    return false;
                });
                $document.on('click',function(e){
                    if($node.length&&!$.contains($node[0],e.target)){
                        if(isShow){
                            _api.hide();
                        }
                    }
                });
            }
        });
    };
}));