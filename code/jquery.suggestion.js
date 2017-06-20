/**
 * jquery.suggestion.js 1.3
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
    $.fn.suggestion = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
            url:'',                          //请求的接口地址
            suggestionCls:'suggestion',      //提示框的内容class
            activeCls:'active',              //列表项选中class
            dynamic:true,                    //动态
            FieldName:'word',                //当前input表单项在请求接口时的字段名
            dataType:'jsonp',              //请求的格式
            parameter:{},                    //其他与接口有关参数
            jsonp:'callback',                //传递自定义回调函数
            jsonpCallback:'',                //自定义回调函数
            autoSubmit:true,                 //点击确定是否自动提交表单
            beforeSend:function(){},         //发送前动作：传入准备提交的表单项目，返回false终止提交
            onCallback:function(){},         //获得数据后触发：target表示被建议列表对象,data表示请求到的数据
            onChange:function(item){         //用户按键盘切换时触发
                item.input.val(item.target.text());
            },
            onSelect: function(item) {       //选中搜索建议列表项触发：传入一个对象，target表示当前选中列表项,input表示当前input表单项
                item.input.val(item.target.text());
            }
        };
        var options = $.extend({}, defaults, parameter);
        var $window = $(window);
        var $document = $(document);
        return this.each(function() {
            //对象定义
            var _api = {};
            var that = this;
            var $this = $(this);
            var $form = $this.parents('form')||$this.parent();
            var $box = $this.parent();
            var $suggestion = $("<div class='"+options.suggestionCls+"'><ul></ul></div>").appendTo($box);
            var $list = $suggestion.find('ul');
            var $item = $list.find('li');
            var _height = $this.outerHeight(false);
            var _width = $this.outerWidth(false);
            var _text = null;
            var _hander = 0;
            var _index = -1;
            var isShow = false;
            var hasData = false;
            //节点样式
            $form.css({
                'position':'relative'
            });
            var _top = $this.position().top;
            var _left = $this.position().left;
            $this.prop({
                'autocomplete':'off',
                'disableautocomplete':true
            });
            $suggestion.css({
                'position':'absolute',
                'display':'none'
            });
            //方法定义
            //位置调整
            var reset = function(){
                _height = $this.outerHeight(false);
                _width = $this.outerWidth(false);
                _top = $this.position().top;
                _left = $this.position().left;
                $suggestion.css({
                    'top':_top+_height+'px',
                    'left':_left+'px',
                    'width':_width+'px'
                });
            };
            //按键按下
            var down = function(e){
                e.isPropagationStopped();
                switch(e.keyCode){
                    case 13:
                        _api.hide();
                        if(!options.autoSubmit){
                            e.preventDefault();
                        }
                    break;
                    case 38:
                        if(isShow){
                            if(_index>0){
                                _index--;
                                $items.eq(_index).addClass(options.activeCls).siblings().removeClass(options.activeCls);
                                change();
                            }else{
                                _index = -1;
                                $items.removeClass(options.activeCls);
                                $this.val(_text);
                            }
                            e.preventDefault();
                        }
                    break;
                    case 40:
                        if(isShow){
                            if(_index<$items.length-1){
                                _index++;
                                $items.eq(_index).addClass(options.activeCls).siblings().removeClass(options.activeCls);
                                change();
                            }
                            e.preventDefault();
                        }
                    break;
                }
            };
            //鼠标经过
            var hover = function(e){
                e.isPropagationStopped();
                var $target = $(this);
                _index = $target.index();
                $target.addClass(options.activeCls).siblings().removeClass(options.activeCls);
            };
            //选中表单项
            var change = function(){
                var $target = $list.find('li.'+options.activeCls);
                var status = {
                    'target':$target,
                    'input':$this
                };
                options.onChange(status);
            };
            //成功后的回调函数
            var success = function(data){
                options.onCallback($list,data);
                $items = $suggestion.find('li');
                hasData = $items.length>0;        //根据列表长度判断有没有值
                if(hasData){
                    $suggestion.show();
                }else{
                    _api.hide();
                }
            };
            /* 公有方法 */
            //显示表单项
            _api.show = function(){
                _hander&&clearTimeout(_hander);
                _hander = setTimeout(function(){
                    var value = $.trim($this.val());
                    if(options.dynamic){
                        if(value != _text){ //缓存上次输入
                            _index = -1;
                            options.parameter[options.FieldName] = _text = value;
                            if(options.beforeSend(options.parameter)!=false){
                                var param = {
                                    type:'get',
                                    async: false,
                                    url :options.url,
                                    data:options.parameter,
                                    dataType:options.dataType,
                                    jsonp:options.jsonp,
                                    success:success
                                };
                                if(options.jsonpCallback){
                                    param['jsonpCallback'] = options.jsonpCallback;
                                }
                                $.ajax(param);
                            }
                        }else{
                            if(hasData){
                                $suggestion.show();
                            }else{
                                _api.hide();
                            }
                        }
                    }else{
                        success();
                    }
                    isShow = true;
                },500);
            };
            //隐藏表单项
            _api.hide = function(){
                _hander&&clearTimeout(_hander);
                _hander = setTimeout(function(){
                    if(isShow){
                        $suggestion.hide();
                        isShow = false;
                    }
                },200);
            };
            //事件绑定
            $this.on('keydown',down);
            $this.on('input propertychange focus',_api.show);
            $this.on('blur',_api.hide);            
            $list.on('click','li',function(){
                var $target = $(this);
                var status = {
                    'target':$target,
                    'input':$this
                };
                options.onSelect(status);
                if(options.autoSubmit){
                    $form.submit();
                }
            }).on('mouseenter','li',hover);
            $window.resize(reset);
            //初始化
            reset();
            getApi(_api);
        });
    };
}));
