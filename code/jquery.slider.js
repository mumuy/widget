/*
    轮播 v1.12
    BY:le
*/
(function($){
    $.fn.slider = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
            /* 节点绑定 */
            contentCls: "content",      //轮播内容列表的class
            navCls: "nav",              //轮播导航列表的class
            prevBtnCls: "prev",         //向前一步的class
            nextBtnCls: "next",         //向后一步的class
            /* 动画相关 */
            activeTriggerCls: "active", //导航选中时的class
            disableBtnCls: "disable",   //按键不可用时的class
            hoverCls: "hover",          //当鼠标移至相应区域时获得的class
            step: 1,                    //移动帧数,'auto'自动移动至下个没有显示完整的帧
            direction: "x",             //轮播的方向
            inEndEffect: "switch",      //"switch"表示来回切换,"cycle"表示循环,"none"表示无效果
            hasTriggers: true,          //是否含有导航触发点
            triggerCondition:"*",       //触发点的条件(有时需排除一些节点)
            triggerType: "mouse",       //导航触发事件:"mouse"表鼠标移入时触发,"click"表示鼠标点击时触发
            activeIndex: 0,             //默认选中帧的索引
            pointerType: "click",       //左右箭头的触发事件
            auto: false,                //是否自动播放
            animate: true,              //是否使用动画滑动
            delay: 3000,                //自动播放时停顿的时间间隔
            duration: 500,              //轮播的动画时长
            easing:"easeIn",            //切换时的动画效果
            keyboardAble:false,         //是否允许键盘按键控制
            touchable: true,            //是否允许触碰
            sensitivity: 0.4,           //触摸屏的敏感度,滑动当前帧的百分比移动该帧，该值越小越敏感
            scrollable:false,           //是否允许滚动滚动轴时换屏
            /* 对外事件接口 */
            beforeEvent: function() {    //移动前执行,返回flase时不移动;传入一个对象,包含：index事件发生前索引,count帧长度,destination方向(prev向前,next向后,数字为相应的索引);
            },
            afterEvent: function() {     //移动后执行;传入一个对象,包含：index事件发生前索引,count帧长度
            }
        };
        var options = $.extend({}, defaults, parameter);
        var $window = $(window);    //窗口对象
        return this.each(function() {
            //对象定义
            var $this = $(this);
            var $list1 = $this.find("." + options.contentCls);
            var $lists = $list1;
            var $prev = $this.find("." + options.prevBtnCls);
            var $next = $this.find("." + options.nextBtnCls);
            var $nav_list = $();
            //全局变量
            var _self = this;
            var _api = {};              //对外的函数接口
            var _distance = [];         //单帧距离起始帧位置
            var _size = $list1.children().length;   //帧数
            var _index = options.activeIndex<0?_size + options.activeIndex:options.activeIndex; //当前选中帧
            var _outer = 0;             //组件的尺寸
            var _inner = 0;
            var _start = {};            //触碰的起点坐标
            var _position = [];         //当前触碰点坐标
            var _startTime = 0;         //移动起始时间
            var _touch_direction = null;//手势移动方向
            var _move = 0;              //移动向量(正负方向)
            var _hander = null;         //自动播放的函数句柄
            var _param = options.direction=='x'?'left':'top';   //移动控制参数,方向为x控制left,方向为y控制top 
            var $outer = $list1.css('position','absolute').parent();
            if($outer.css('position')=='static'){
                $outer.css('position','relative');
            }
            if (options.inEndEffect === "cycle") {
                var $list2 = $list1.clone().insertAfter($list1);
                $lists = $list1.add($list2);
            }
            var $items = $lists.children();
            //节点添加
            if (options.hasTriggers) {  //是否存在导航
                if (!$this.find("."+options.navCls).length) {   //使用children找不到
                    var list_str = "";
                    for (var i = 1; i <= _size ; i++) {
                        list_str += "<li>" + i + "</li>";
                    }
                    $this.append("<ul class='" + options.navCls + "'>" + list_str + "</ul>")
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
                    if(options.beforeEvent(status) !== false){
                        _index = index;
                        slide(options.animate);                        
                    }
                });
            }
            /****** 共有方法 ******/
            //上一帧
            _api.prev = function(e) {
                var status = {
                    index: _index,
                    count: _size,
                    destination: "prev",
                    event:e
                };
                if ($lists.is(':animated')) { //如正在动画中则不进行下一步
                    return false;
                }
                if (options.beforeEvent(status) !== false) {
                    var step = options.step;
                    if(step=='auto'){
                        for(step=1;_distance[_index+_size]-_distance[_index+_size-step-1]<=_outer;step++);
                    }
                    switch (options.inEndEffect) {
                        case "switch":
                            if (_index) {
                                _index -= Math.min(step,_index);
                            } else {
                                _index = _size - 1;
                            }
                            break;
                        case "cycle":
                            if (_index - step < 0) {
                                $list2.css(_param,- _distance[_size]-_distance[_index] + 'px');
                                $list1 = [$list2, $list2 = $list1][0]; //两列表身份互换
                                _index += _size - step;
                            } else {
                                _index -= step;
                            }
                            break;
                        default:
                            if (_index) {
                                _index -= Math.min(step,_index);
                            }
                    }
                    slide(options.animate);
                }
            };
            //下一帧
           _api.next = function(e){
                var status = {
                    index: _index,
                    count: _size,
                    destination: "next",
                    event:e
                };
                if ($lists.is(':animated')) { //如正在动画中则不进行下一步
                    return false;
                }
                if (options.beforeEvent(status) !== false) {
                    var step = options.step;
                    if(step=='auto'){
                        for(var i=_index;i<2*_size&&_distance[i+1]-_distance[_index]<=_outer;i++);
                        _index = i;
                    }else{
                        var lastindex = _size - _index - 1;
                        switch (options.inEndEffect) {
                            case "switch":
                                if (_distance[_size]-_distance[_index]>_outer) {
                                    _index += Math.min(step,lastindex);
                                } else {
                                    _index = 0;
                                }
                                break;
                            case "cycle":
                                _index += step; //索引值计算
                                break;
                            default:
                                if (_distance[_size]-_distance[_index]>_outer) {
                                    _index += Math.min(step,lastindex);
                                }
                        }
                    }
                    slide(options.animate);
                }
            };
            //开始播放
            _api.start = function(){
                _api.stop();
                _hander = setInterval(_api.next, options.delay);
            };
            //停止播放
            _api.stop = function(){
                if (_hander) {
                    clearInterval(_hander);
                }
            };
            //设置当前帧
            _api.setIndex = function(index,isAnimate){
                _index = index%_size;
                slide(isAnimate);
            };  
            //设置移动帧数
            _api.setStep = function(step){
                options.step = step;
            };
            //设置动画停顿时间间隔
            _api.setDelay = function(delay){
                options.delay = delay;
            };
            //设置动画时长
            _api.setDuration = function(duration){
                options.duration = duration;
            };
            //获取当前帧
            _api.getIndex = function(){
                return _index;
            };
            //窗口变化
            _api.resize = function(){
                _distance = [];
                _inner = 0;
                if(options.direction=='x'){
                    $lists.css('width','');
                    $items.css('width','');
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
                        _inner /=2
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
            /****** 私有方法 ******/
            //移动
            function slide(isAnimate,s_duration) {
                if(_inner>=_outer){ //只有在内层超过外层时移动
                    var duration = isAnimate !=false ? (s_duration||options.duration):0; //判断滑块是否需要移动动画
                    var params = {};
                    switch(options.inEndEffect){
                        case "switch":
                            _index %= _size;    //索引范围检测
                            if(_distance[_size]-_distance[_index]<_outer){
                                params = _param=="left"?{'left': _outer-_inner}:{'top': _outer-_inner};
                                for(_index=_size;_index&&_distance[_size]-_distance[_index-1]<=_outer;_index--);
                            }else{
                                params = _param=="left"?{'left': - _distance[_index]}:{'top': - _distance[_index]};
                            }
                            $nav_list.removeClass(options.activeTriggerCls).eq(_index).addClass(options.activeTriggerCls);   //导航选中
                            $list1.stop().animate(params,{easing:options.easing, duration: duration, complete:function() {
                                var status = {
                                    index: _index,
                                    count: _size
                                };
                                options.afterEvent(status);
                            }});
                        break;
                        case "cycle":
                            $nav_list.removeClass(options.activeTriggerCls).eq(_index % _size).addClass(options.activeTriggerCls);   //导航选中
                            params = _param=="left"?{'left': - _distance[_index]}:{'top': - _distance[_index]};
                            $list1.stop().animate(params,{easing:options.easing, duration: duration, complete:function() {
                                var status = {
                                    index: _index%_size,
                                    count: _size
                                };          
                                options.afterEvent(status);
                            }});
                            params = _param=="left"?{'left':_distance[_size]-_distance[_index]}:{'top':_distance[_size]-_distance[_index]};
                            $list2.stop().animate(params,{easing:options.easing, duration: duration, complete:function(){
                                if (_index >= _size) {
                                    _index %= _size;
                                    $list1.css(_param, _distance[_size]-_distance[_index]+ 'px');
                                    $list1 = [$list2, $list2 = $list1][0]; //两列表身份互换
                                }
                            }});
                        break;
                        default:
                            _index = Math.min(_index,_size-1);    //索引范围检测
                            $nav_list.removeClass(options.activeTriggerCls).eq(_index).addClass(options.activeTriggerCls);   //导航选中
                            $prev.toggleClass(options.disableBtnCls,_index==0);
                            $next.toggleClass(options.disableBtnCls,_index==_size-1);                           
                            if(_distance[_size]-_distance[_index]<_outer){
                                params = _param=="left"?{'left': _outer-_inner}:{'top': _outer-_inner};
                                for(_index=_size;_index&&_distance[_size]-_distance[_index-1]<=_outer;_index--);
                            }else{
                                params = _param=="left"?{'left': - _distance[_index]}:{'top': - _distance[_index]};
                            }
                            $list1.stop().animate(params,{easing:options.easing, duration: duration, complete:function() {
                                var status = {
                                    index: _index,
                                    count: _size
                                };          
                                options.afterEvent(status);
                            }});
                    }
                }
            };
            //滚动轴
            function scroll(e){              
                if(!$list1.is(':animated')){ //防止滚动太快动画没完成
                    var delta = -e.wheelDelta/120||e.detail/3;
                    delta>0?_api.next(e):_api.prev(e);                      
                }
                return false;         
            }       
            //触摸开始
            function touchStart(e) {
                _touch_direction = null;
                _startTime = new Date();
                _api.stop();
                _start = {  //iphone bug，touchstart和touchmove同一个对象
                    pageX:e.originalEvent.changedTouches[0].pageX,
                    pageY:e.originalEvent.changedTouches[0].pageY
                };
                _position[0] = $list1.position()[_param];
                if (options.inEndEffect == "cycle") {   
                    _position[1] = $list2.position()[_param];
                }
            }
            //触碰移动
            function touchMove(e) {
                e.stopPropagation();
                var current = {  //iphone bug，touchstart和touchmove同一个对象
                    pageX:e.originalEvent.changedTouches[0].pageX,
                    pageY:e.originalEvent.changedTouches[0].pageY
                };
                var delta = {
                    'x': current.pageX - _start.pageX,
                    'y':current.pageY - _start.pageY
                }
                _move = delta[options.direction];  //移动距离触发点的距离
                if(!_touch_direction){                //根据第一次移动向量判断方向
                    _touch_direction = Math.abs(delta.y) < Math.abs(delta.x)?'x':'y';
                }
                var direction = Math.abs(delta.y) < Math.abs(delta.x)?'x':'y';
                if(direction==_touch_direction&&_inner>=_outer){    //过滤非移动方向上的量,防止抖动;内容小于外框时不移动
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
            }
            //触碰结束
            function touchEnd(e) {
                if (options.auto) {
                    _api.start();
                }
                var endTime = new Date();
                var distance = _distance[_index+1]-_distance[_index]; //帧长
                var move = 0;                                        //当前帧移动距离
                var isMove = false;                                   //点击或移动判断
                if(_move>0){
                    move = _distance[_index+1]+_position[0];
                    isMove = move/distance>options.sensitivity||endTime-_startTime<250&&Math.abs(move)>10;
                    if(!isMove){
                        _index++;
                    }
                }else{
                    move = -_distance[_index]-_position[0];
                    isMove = move/distance>options.sensitivity||endTime-_startTime<250&&Math.abs(move)>10;
                    if(isMove){
                        _index++;
                    }                    
                }
                if(options.inEndEffect != "cycle"){
                    _index = Math.min(_size-1,_index);
                }
                slide(true,300);
            }
            //键盘处理
            function keyboard(e){
                if(options.direction=='y'){
                    e.which -= 1;
                }
                switch (e.which) {
                    case 37:
                        _api.prev(e);
                        break;
                    case 39:
                        _api.next(e);
                        break;
                }
            }
            //是否自动播放
            if (options.auto) {
                _api.start();
                $this.hover(_api.stop, _api.start);
            }
            //鼠标悬停
            $this.hover(function(){
                $this.addClass(options.hoverCls);
            },function(){
                $this.removeClass(options.hoverCls);
            });
            //事件绑定-向前向后导航
            if(options.pointerType === "click"){
                $prev.on("click",_api.prev);
                $next.on("click",_api.next);         
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
                        _s = e.originalEvent.changedTouches[0];
                    }
                    function touchE(e){
                        var current = e.originalEvent.changedTouches[0];
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
            $window.resize(_api.resize); //当窗体大小改变时，重新计算相关参数
            //键盘控制
            if(options.keyboardAble){
                $window.keydown(keyboard);
            }
            //鼠标中轴控制
            if(options.scrollable){
                if(document.addEventListener){
                    _self.addEventListener('DOMMouseScroll',scroll,false);
                }
                _self.onmousewheel = scroll;                
            }
            //初始化  
            _api.resize();
            getApi(_api);
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
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        },
        elasout: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
        },
        elasinout: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
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
                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
        },
        bounceinout: function (x, t, b, c, d) {
            if (t < d/2) return $.easing.bouncein (x, t*2, 0, c, d) * .5 + b;
            return $.easing.bounceout(x, t*2-d, 0, c, d) * .5 + c*.5 + b;
        }
    });
})(jQuery);