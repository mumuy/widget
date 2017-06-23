/**
 * jquery.slider.js 1.0
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
    var Slider = function(element,options){
        //全局变量
        var _ = this,
            _distance = [],         //单帧距离起始帧位置
            _size,                  //帧数
            _index,                 //当前选中帧
            _outer,                 //组件的外尺寸
            _inner,                 //组件的内尺寸
            _start = {},            //触碰起点坐标:pageX横坐标,pageY纵坐标
            _position = [],         //当前帧坐标
            _touch_direction,       //手势移动方向
            _move,                  //移动向量(正负方向)
            _hander,                //自动播放的函数句柄
            _time = {},             //记录动画断点
            _auto,                  //是否自动播放
            _param;                 //移动控制参数,方向为x控制left,方向为y控制top
        //对象定义
        var $this = $(element),
            $list1 = $this.find("." + options.contentCls),
            $lists = $list1,
            $prev = $this.find("." + options.prevBtnCls),
            $next = $this.find("." + options.nextBtnCls),
            $nav_list = $(),
            $outer = $lists.parent(),
            $list2,
            $items,
            $window = $(window);    //窗口对象
        /****** 对象属性及方法 ******/
        this.element = element;
        //上一帧
        this.prev = function(e) {
            var status = {
                index: _index,
                count: _size,
                destination: "prev",
                event:e
            };
            if ($lists.is(':animated')) { //如正在动画中则不进行下一步
                return false;
            }
            _time['start'] = + new Date();
            if (options.onChangeStart.call(_.element,status) !== false) {
                var steps = options.steps;
                if(steps=='auto'){  //自动判定步数
                    for(steps=1;_distance[_index+_size]-_distance[_index+_size-steps-1]<=_outer;steps++);
                }
                switch (options.inEndEffect) {
                    case 'none':
                        if (_index) {
                            _index = Math.max(_index-steps,0);
                        }
                        break;
                    case 'cycle':
                        if (_index - steps < 0) {
                            $list2.css(_param,- _distance[_size]-_distance[_index] + 'px');
                            $list1 = [$list2, $list2 = $list1][0]; //两列表身份互换
                            _index += _size - steps;
                        } else {
                            _index -= steps;
                        }
                        break;
                    default:
                        if (_index) {
                            _index = Math.max(_index-steps,0);
                        } else {
                            _index = _size - 1;
                        }
                }
                slide(options.animate);
            }
        };
        //下一帧
        this.next = function(e){
            var status = {
                index: _index,
                count: _size,
                destination: "next",
                event:e
            };
            if ($lists.is(':animated')) { //如正在动画中则不进行下一步
                return false;
            }
            _time['start'] = + new Date();
            if (options.onChangeStart.call(_.element,status) !== false) {
                var steps = options.steps;
                if(steps=='auto'){  //自动判定步数
                    for(steps=1;_distance[_index+steps+1]-_distance[_index]<=_outer;steps++);
                }
                switch (options.inEndEffect) {
                    case 'none':
                        if (_distance[_size]-_distance[_index]>_outer) {
                            _index = Math.min(_index + steps,_size - 1);
                        }
                        break;
                    case 'cycle':
                        _index += steps; //索引值计算
                        break;
                    default:
                        if (_distance[_size]-_distance[_index]>_outer) {
                            _index = Math.min(_index + steps,_size - 1);
                        } else {
                            _index = 0;
                        }
                }
                slide(options.animate);
            }
        };
        //开始播放
        this.start = function(){
            _auto = true;
            var time = + new Date();
            var duration = Math.max(options.duration-_time['execute'],0);
            if(options.immediately&&duration){
                _time['start'] = time - _time['execute']; //时间镜像起点
                slide(options.animate,duration);
            }else{
                _hander = setTimeout((options.reverse?_.prev:_.next),options.delay);
            }
        };
        //停止播放
        this.stop = function(){
            _auto = false;
            _hander&&clearTimeout(_hander);
            if(options.immediately&&_time['start']){
                $lists.stop();
                var time = + new Date();
                _time['execute'] = time - _time['start']; //已执行动画时长
            }
        };
        //窗口变化
        this.reset = function(){
            _distance = [];
            _inner = 0;
            $items = $lists.children();
            if(options.direction=='x'){
                $lists.css('width','');
                $items.css({
                    'float':'left',
                    'width':''
                });
                _outer = $outer.width();
                $items.each(function(i){
                    var $li = $(this);
                    var width = Math.min($li.width(),_outer);
                    _distance.push(_inner);
                    $li.width(width);
                    _inner += Math.ceil($li.outerWidth(true));
                }).each(function(i){
                    _distance.push(_inner+_distance[i]);
                });
                if(options.inEndEffect=='cycle'){
                    _inner /=2;
                }
                $lists.css('width',_inner);
            }else{
                $items.css('height','');
                _outer = $outer.height();
                $items.each(function(i){
                    var $li = $(this);
                    var height = Math.min($li.height(),_outer);
                    _distance.push(_inner);
                    $li.height(height);
                    _inner += Math.ceil($li.outerHeight(true));
                }).each(function(i){
                    _distance.push(_inner+_distance[i]);
                });
            }
            slide(false);
        };
        //设置当前帧
        this.setIndex = function(index,isAnimate){
            index = index%_size;
            _index = index<0?_size + index:index;
            slide(isAnimate);
        };
        //设置移动帧数
        this.setSteps = function(steps){
            options.steps = steps;
        };
        //设置动画停顿时间间隔
        this.setDelay = function(delay){
            options.delay = delay;
        };
        //设置动画时长
        this.setDuration = function(duration){
            options.duration = duration;
        };
        //获取当前帧
        this.getIndex = function(){
            return _index;
        };
        //获取帧数
        this.getSize = function(){
            return _size;
        };
        //获取参数
        this.getOptions = function(){
            return options;
        };
        /****** 私有方法 ******/
        //移动
        var slide = function(isAnimate,s_duration) {
            if(_inner>=_outer){ //只有在内层超过外层时移动
                var duration = isAnimate !=false ? (s_duration||options.duration):0; //判断滑块是否需要移动动画
                var params = {};
                $lists.stop();
                switch(options.inEndEffect){
                    case 'cycle':
                        params[_param] = - _distance[_index];
                        $list1.animate(params,{easing:options.easing, duration: duration});
                        params[_param] = _distance[_size]-_distance[_index];
                        $list2.animate(params,{easing:options.easing, duration: duration, complete:function(){
                            if (_index >= _size) {
                                _index %= _size;
                                $list1.css(_param, _distance[_size]-_distance[_index]+ 'px');
                                $list1 = [$list2, $list2 = $list1][0]; //两列表身份互换
                            }
                        }});
                    break;
                    case 'none':
                        _index = Math.min(_index,_size-1);    //索引范围检测
                        $prev.toggleClass(options.disableBtnCls,_index==0);
                        $next.toggleClass(options.disableBtnCls,_distance[_size]-_distance[_index]<=_outer);
                    default:
                        _index %= _size;
                        if(_distance[_size]-_distance[_index]<_outer){
                            params[_param] = _outer-_inner;
                        }else{
                            params[_param] = - _distance[_index];
                        }
                        $list1.animate(params,{easing:options.easing, duration: duration});
                }
                $nav_list.removeClass(options.activeTriggerCls).eq(_index% _size).addClass(options.activeTriggerCls);   //导航选中
                $lists.promise().then(callback);
            }
        };
        //移动后回调
        var callback = function(){
            var status = {
                index: _index,
                count: _size
            };
            options.onChangeEnd.call(_.element,status);
            if(_auto){
                _hander&&clearTimeout(_hander);
                _hander = setTimeout((options.reverse?_.prev:_.next),options.delay);
            }
        };
        //滚动轴
        var scroll = function(e){
            e = e||window.event;
            if(!$lists.is(':animated')){ //防止滚动太快动画没完成
                var delta = -e.wheelDelta/120||e.detail/3;
                delta>0?_.next(e):_.prev(e);
            }
            return false;
        };
        //触摸开始
        var touchStart = function(e) {
            _touch_direction = null;
            _.stop();
            _time['start'] = + new Date();
            _start = {  //iphone bug，touchstart和touchmove同一个对象
                pageX: e.originalEvent.changedTouches[0].pageX,
                pageY: e.originalEvent.changedTouches[0].pageY
            };
            _position[0] = $list1.position()[_param];
            if (options.inEndEffect == "cycle") {
                _position[1] = $list2.position()[_param];
            }
        };
        //触碰移动
        var touchMove = function(e) {
            e.stopPropagation();
            var current = {  //iphone bug，touchstart和touchmove同一个对象
                pageX: e.originalEvent.changedTouches[0].pageX,
                pageY: e.originalEvent.changedTouches[0].pageY
            };
            var delta = {
                'x': current.pageX - _start.pageX,
                'y': current.pageY - _start.pageY
            };
            _move = delta[options.direction];  //移动距离触发点的距离
            var direction = Math.abs(delta.y) < Math.abs(delta.x)?'x':'y';
            _touch_direction = _touch_direction||direction; //根据第一次移动向量判断方向
            if(direction==_touch_direction&&_inner>=_outer){ //过滤非移动方向上的量,防止抖动;内容小于外框时不移动
                if (options.direction=='x'&&_touch_direction=='x'||options.direction=='y') {  //chrome移动版下，默认事件与自定义事件的冲突
                    e.preventDefault();
                    //计算
                    if (_move > 0) {  //手指向右滑
                        if (_position[0]>0) {   //是否置换
                            if(options.inEndEffect=="cycle"){
                                _index = _size-1;
                                _position[1] -= 2*_distance[_size];
                                $list2.css(_param,_position[1] + 'px');
                                $list1 = [$list2, $list2 = $list1][0]; //两列表身份互换
                                _position[0] = [_position[1], _position[1] = _position[0]][0];
                            }else{
                                _move *= 0.25;
                            }
                        }else if(Math.abs(_position[0])<_distance[_index]){
                            _index--;
                        }
                    } else {    //手指向左滑
                        if (_index == _size) {   //是否置换
                            if(options.inEndEffect=="cycle"){
                                _index = 0;
                                _position[0] += 2*_distance[_size];
                                $list1.css(_param, _position[0] + 'px');
                                $list1 = [$list2, $list2 = $list1][0]; //两列表身份互换
                                _position[0] = [_position[1], _position[1] = _position[0]][0];
                            }
                        }else if(Math.abs(_position[0])>=_distance[_index+1]){
                            _index++;
                        }
                        if(options.inEndEffect!="cycle"&&_distance[_size]-_distance[_index]<=_outer){
                            _move *= 0.25;
                        }
                    }
                    //移动
                    _position[0] += _move;
                    $list1.css(_param, _position[0]);
                    if (options.inEndEffect == "cycle") {
                        _position[1] += _move;
                        $list2.css(_param, _position[1]);
                    }
                    _start = current;       //实时更新坐标，解决list衔接处来回切换的问题
                }
            }
        };
        //触碰结束
        var touchEnd = function(e) {
            if (options.auto) {
                _.start();
            }
            var endTime = new Date();
            var distance = _distance[_index+1]-_distance[_index]; //帧长
            var move = 0;                                        //当前帧移动距离
            var isMove = false;                                   //点击或移动判断
            if(_move>0){
                move = _distance[_index+1]+_position[0];
                isMove = move/distance>options.sensitivity||endTime-_time['start']<250&&Math.abs(move)>10;
                if(!isMove){
                    _index++;
                }
            }else{
                move = -_distance[_index]-_position[0];
                isMove = move/distance>options.sensitivity||endTime-_time['start']<250&&Math.abs(move)>10;
                if(isMove){
                    _index++;
                }
            }
            if(options.inEndEffect != "cycle"){
                _index = Math.min(_size-1,_index);
            }
            slide(true,300);
        };
        //键盘处理
        var keyboard = function(e){
            if(options.direction=='y'){
                e.which -= 1;
            }
            switch (e.which) {
                case 37:
                    _.prev(e);
                    break;
                case 39:
                    _.next(e);
                    break;
            }
        };
        //初始化
        var init = function(){
            _size = $list1.children().length;
            options.activeIndex = options.activeIndex%_size;
            _index = options.activeIndex<0?_size + options.activeIndex:options.activeIndex;
            _param = options.direction=='x'?'left':'top';
            if($outer.css('position')=='static'){
                $outer.css('position','relative');
            }
            if (options.inEndEffect === "cycle") {
                $list2 = $list1.clone().insertAfter($list1);
                $lists = $list1.add($list2);
                $list2.css({
                    position:'absolute',
                    top:0
                });
            }
            $list1.css('position','relative');
            //节点添加
            if (options.hasTriggers) {  //是否存在导航
                if (!$this.find("."+options.navCls).length) {   //使用children找不到
                    var list_str = "";
                    for (var i = 1; i <= _size ; i++) {
                        list_str += "<li>" + i + "</li>";
                    }
                    $this.append("<ul class='" + options.navCls + "'>" + list_str + "</ul>");
                }
                options.triggerType += options.triggerType === "mouse" ? "enter" : "";  //使用mouseenter防止事件冒泡
                $nav_list = $this.find("."+options.navCls + " > " + options.triggerCondition).bind(options.triggerType, function(e) {
                    var index = $nav_list.index(this);
                    var status = {
                        index: _index,
                        count: _size,
                        destination: index,
                        event:e
                    };
                    if(options.onChangeStart.call(_.element,status) !== false){
                        _index = index;
                        _time['start'] = + new Date();
                        slide(options.animate,500);
                    }
                });
            }
            //是否自动播放
            if (options.auto) {
                $this.hover(_.stop, _.start);
                _.start();
            }
            //鼠标悬停
            $this.hover(function(){
                $this.addClass(options.hoverCls);
            },function(){
                $this.removeClass(options.hoverCls);
            });
            //事件绑定-向前向后导航
            if(options.pointerType === "click"){
                $prev.on("click",_.prev);
                $next.on("click",_.next);
            }else{
                $prev.on({
                    'mouseenter':function(){
                        _index = 0;
                        slide();
                    },
                    'mouseleave':function(){
                        var distance = -$list1.position().left;
                        for(_index=0;_index<_size&&_distance[_index+1]<=distance;_index++);
                        slide(true,options.duration/2);
                    }
                });
                $next.on({
                    'mouseenter':function(){
                        _index = _size - 1;
                        slide();
                    },
                    'mouseleave':function(){
                        var distance = -$list1.position().left;
                        for(_index=0;_index<_size&&_distance[_index]<=distance;_index++);
                        slide(true,options.duration/2);
                    }
                });
            }
            //手势操作
            if(options.touchable){
                (function(){  //导航在内容内部的触碰纠正
                    var _s = 0;
                    function touchS(e){
                        _s = {
                            'pageX':e.originalEvent.changedTouches[0].pageX,
                            'pageY':e.originalEvent.changedTouches[0].pageY
                        };
                    }
                    function touchE(e){
                        var current = {
                            'pageX':e.originalEvent.changedTouches[0].pageX,
                            'pageY':e.originalEvent.changedTouches[0].pageY
                        };
                        var d_x = Math.abs(current.pageX - _s.pageX);
                        var d_y = Math.abs(current.pageY - _s.pageY);
                        if(d_x<5&d_y<5){
                            e.stopPropagation();
                        }
                    }
                    $prev.on({
                        'touchstart':touchS,
                        'touchend':touchE
                    });
                    $next.on({
                        'touchstart':touchS,
                        'touchend':touchE
                    });
                })();
                $this.on({
                    'touchstart':touchStart,
                    'touchmove':touchMove,
                    'touchend':touchEnd
                });
            }
            $window.resize(function(){ //当窗体大小改变时，重新计算相关参数
                var time = + new Date();
                if(time-_time['start']>250&&options.delay<250||options.delay>=250){ //缓存防治连续变化多次触发
                    _.reset();
                }
                _time['start'] = time;
            });
            //键盘控制
            if(options.keyboardAble){
                $window.keydown(keyboard);
            }
            //鼠标中轴控制
            if(options.scrollable){
                if(document.addEventListener){
                    _.element.addEventListener('DOMMouseScroll',scroll,false);
                }
                _.element.onmousewheel = scroll;
            }
            _.reset();
        };
        /* 执行初始化 */
        init();
    };

    $.fn.slider = function(parameter,callback) {
        if(typeof parameter == 'function'){ //重载
            callback = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            callback = callback||function(){};
        }
        var defaults = {
            /* 节点绑定 */
            contentCls: 'content',      //轮播内容列表的class
            navCls: 'nav',              //轮播导航列表的class
            prevBtnCls: 'prev',         //向前一步的class
            nextBtnCls: 'next',         //向后一步的class
            /* 动画相关 */
            activeTriggerCls: 'active', //导航选中时的class
            disableBtnCls: 'disable',   //按键不可用时的class
            hoverCls: 'hover',          //当鼠标移至相应区域时获得的class
            steps: 1,                   //移动帧数,'auto'自动移动至下个没有显示完整的帧
            direction: 'x',             //轮播的方向
            reverse: false,             //是否反向自动播放
            inEndEffect: 'switch',      //"switch"表示来回切换,"cycle"表示循环,"none"表示无效果
            hasTriggers: true,          //是否含有导航触发点
            triggerCondition:'*',       //触发点的条件(有时需排除一些节点)
            triggerType: 'mouse',       //导航触发事件:"mouse"表鼠标移入时触发,"click"表示鼠标点击时触发
            activeIndex: 0,             //默认选中帧的索引
            pointerType: 'click',       //左右箭头的触发事件
            auto: false,                //是否自动播放
            immediately: false,         //悬浮是否立即停止
            animate: true,              //是否使用动画滑动
            delay: 3000,                //自动播放时停顿的时间间隔
            duration: 500,              //轮播的动画时长
            easing:'linear',            //切换时的动画效果
            keyboardAble:false,         //是否允许键盘按键控制
            touchable: true,            //是否允许触碰
            sensitivity: 0.4,           //触摸屏的敏感度,滑动当前帧的百分比移动该帧，该值越小越敏感
            scrollable:false,           //是否允许滚动滚动轴时换屏
            /* 对外事件接口 */
            onChangeStart: function() {    //移动前执行,返回flase时不移动;传入一个对象,包含：index事件发生前索引,count帧长度,destination方向(prev向前,next向后,数字为相应的索引);
            },
            onChangeEnd: function() {     //移动后执行;传入一个对象,包含：index事件发生前索引,count帧长度
            }
        };
        var options = $.extend({}, defaults, parameter);
        return this.each(function() {
            var $this = $(this);
            var o = $.meta ? $.extend({}, options, $this.data()) : options;
            var slider = new Slider(this,o);
            callback.call(this,slider);
        });
    };
    //jquery 动画扩展
    $.extend( $.easing,{
        def: 'easeIn',
        swing: function (x, t, b, c, d) {
            return $.easing[$.easing.def](x, t, b, c, d);
        },
        easeIn: function (x, t, b, c, d) {
            return c*(t/=d)*t + b;
        },
        easeOut: function (x, t, b, c, d) {
            return -c *(t/=d)*(t-2) + b;
        },
        expoin: function (x, t, b, c, d) {
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },
        expoout: function (x, t, b, c, d) {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },
        expoinout: function (x, t, b, c, d) {
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        elasin: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*0.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        },
        elasout: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*0.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
        },
        elasinout: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(0.3*1.5);
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -0.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
        },
        backin: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },
        backout: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },
        backinout: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
        },
        bouncein: function (x, t, b, c, d) {
            return c - $.easing.bounceout(x, d-t, 0, c, d) + b;
        },
        bounceout: function (x, t, b, c, d) {
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
            }
        },
        bounceinout: function (x, t, b, c, d) {
            if (t < d/2) return $.easing.bouncein (x, t*2, 0, c, d) * 0.5 + b;
            return $.easing.bounceout(x, t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
        }
    });
}));
