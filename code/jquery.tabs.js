/**
 * jquery.tabs.js 1.0
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
    $.fn.tabs = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
            /* 节点绑定 */
            contentCls: 'content',      //内容列表的class
            navCls: 'nav',              //导航列表的class
            prevBtnCls: 'prev',         //向前一步的class
            nextBtnCls: 'next',         //向后一步的class
            /* 其他 */
            activeCls: 'active',        //导航选中时的class
            effect:'none',              //切换的效果
            triggerType: 'mouse',       //切换时的触发事件
            triggerCondition: '*',      //导航项的条件
            activeIndex: 0,             //默认选中导航项的索引
            auto: false,                //是否自动播放
            delay: 3000,                //自动播放时停顿的时间间隔
            duration: 500,              //动画时长
            onChangeStart: function() {   //切换前执行,返回flase时不移动;传入一个对象,包含：index事件发生前索引,count帧长度,destination目标索引,event事件对象
            },
            onChangeEnd: function() {    //切换后执行;传入一个对象,包含：index事件发生前索引,count帧长度,destination目标索引,event事件对象
            }
        };
        var options = $.extend({}, defaults, parameter);
        return this.each(function() {
            //对象定义
            var $this = $(this);
            var $content = $this.find("." + options.contentCls);
            var $panels = $content.children();
            var $triggers = $this.find("." + options.navCls + ">" + options.triggerCondition);
            //全局变量
            var _api = {};
            var _size = $panels.length;
            var _index = options.activeIndex;
            var _hander = null;
            options.triggerType += options.triggerType === "mouse" ? "enter" : "";  //使用mouseenter防止事件冒泡
            //样式
            if(options.effect=='fade'){
                $content.css('position','relative');
                $panels.css('position','absolute');
                options.delay += 500;
            }
            //上一个
            var prev = function(e){
                var i = _index?_index-1:_size-1;
                var status = {
                    index: _index,
                    count: _size,
                    destination: i,
                    event:e
                };
                if(options.onChangeStart(status)!=false){
                    _api.setIndex(i);
                    options.onChangeEnd({index:i,count: _size});
                }
            };
            //下一个
            var next = function(e){
                var i = (_index + 1)%_size;
                var status = {
                    index: _index,
                    count: _size,
                    destination: i,
                    event:e
                };
                if(options.onChangeStart(status)!=false){
                    _api.setIndex(i);
                    options.onChangeEnd({index:i,count: _size});
                }
            };
            //停止播放
            _api.stop = function(){
                _hander&&clearInterval(_hander);
            };
            //播放
            _api.start = function(){
                _api.stop();
                _hander = setInterval(next,options.delay);
            };
            //选择某标签
            _api.setIndex = function(index){
                $triggers.removeClass(options.activeCls).eq(index).addClass(options.activeCls);
                switch(options.effect){
                    case 'fade':
                        if(_index!=index){
                            var $select = $panels.eq(_index).css('z-index',_size+1);
                            $panels.each(function(i){
                                if(i!=_index){
                                    $(this).css('z-index',(index+_size-i-1)%_size+1);
                                }
                            });
                            $select.fadeOut(options.duration,function(){
                                $select.css({
                                    'display':'block',
                                    'z-index':(index+_size-_index-1)%_size+1
                                });
                                _index = index;
                            });
                        }else{
                            $panels.each(function(i){
                                $(this).css('z-index',(index+_size-i-1)%_size+1);
                            });
                        }
                        break;
                    default:
                        $panels.hide().eq(index).show();
                        _index = index;
                }
            };
            //获取当前帧
            _api.getIndex = function(){
                return _index;
            };
            //获取帧数
            _api.getSize = function(){
                return _size;
            };
            //事件绑定-导航
            $this.find('.'+options.prevBtnCls).click(prev);
            $this.find('.'+options.nextBtnCls).click(next);
            $triggers.bind(options.triggerType, function(e) { //事件绑定
                var i = $triggers.index($(this));
                var status = {
                    index: _index,
                    count: _size,
                    destination: i,
                    event:e
                };
                if(options.onChangeStart(status)!=false){
                    _api.setIndex(i);
                    options.onChangeEnd({index:i,count: _size});
                }
            });
            //初始化
            _api.setIndex(_index);
            //是否自动播放
            if (options.auto) {
                $this.hover(_api.stop, _api.start);
                _api.start();
            }
            getApi(_api);
        });
    };
}));
