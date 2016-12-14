/**
 * zepto.slider.js 1.0
 * http://jquerywidget.com
 */
;(function($, window, document, undefined) {
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
            steps: 1,                   //一步跳的帧数
            view: 0,                    //可见区域的帧数
            direction: "x",             //轮播的方向
            inEndEffect: "switch",      //"switch"表示来回切换,"cycle"表示循环,"none"表示无效果
            hasTriggers: true,          //是否含有导航触发点
            triggerCondition:"*",       //触发点的条件(有时需排除一些节点)
            triggerType: "mouse",       //导航触发事件:"mouse"表鼠标移入时触发,"click"表示鼠标点击时触发
            activeTriggerCls: "active", //导航选中时的class
            activeIndex: 0,             //默认选中帧的索引
            activeLastIndex:0,          //默认选中的逆索引
            disableBtnCls: "disable",   //按键不可用时的class
            auto: false,                //是否自动播放
            animate: true,              //是否使用动画滑动
            delay: 3000,                //自动播放时停顿的时间间隔
            duration: 500,              //轮播的动画时长
            touchable: true,            //是否允许触碰
            sensitivity: 0.25,          //触摸屏的敏感度,滑动当前帧的百分比移动该帧，该值越小越敏感
            easing:'linear',            //动画函数
            /* 针对手机特别添加 */
            fullScreen:true,            //是否全屏
            isStopDefault:false,        //是否取消默认行为
            /* 对外接口 */
            beforeMove: function() {    //移动前执行,返回flase时不移动
            },
            afterMove: function() {     //移动后执行
            }
        };
        var options = $.extend({}, defaults, parameter);
        var $window = $(window);    //窗口对象
        return this.each(function() {
            //对象定义
            var $this = $(this);
            var $list1 = $this.find("." + options.contentCls);
            var $item = $list1.children();
            var $prev = $this.find("." + options.prevBtnCls);
            var $next = $this.find("." + options.nextBtnCls);
            var $nav_list = $();
            //全局变量
            var _distance = 0;//一帧的移动距离
            var _api = {};
            var _size = $item.length;   //帧数
            var _index = parameter.activeLastIndex?_size + options.activeLastIndex:options.activeIndex; //当前选中帧
            var _outer = options.direction=='x'?$this.width():$this.height(); //组件的外尺寸
            var _view = options.view || parseInt(_outer / _distance);   //可视的帧数
            var _start = {};    //触碰的起点坐标
            var _position = {}; //当前触碰点坐标
            var _startTime = 0; //移动起始时间
            var _touch_direction = null;//手势移动方向
            var _hander = null; //自动播放的函数句柄
            var _param = options.direction=='x'?'left':'top';   //移动控制参数,方向为x控制left,方向为y控制top
            var _isAnimated = [];
            //样式初始化
            var $outer = $list1.css('position','relative').parent();
            if($outer.css('position')=='static'){
                $outer.css('position','relative');
            }
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
                $nav_list = $this.find("." + options.navCls + " > "+options.triggerCondition).bind(options.triggerType, function(e) {
                    var index = $nav_list.index(this);
                    if (options.inEndEffect === "cycle") {
                        _index = index;
                    } else {
                        _index = index > _size - _view ? _size - _view : index;
                    }
                    slide(options.animate);
                });
            }
            if (options.inEndEffect === "cycle") {
                var $list2 = $list1.clone().insertAfter($list1);
                var $item = $list1.add($list2).children();
                $list2.css({
                    position:'absolute',
                    top:0
                });
            }
            var $lists = $this.find("." + options.contentCls);
            /****** 共有方法 ******/
            //返回上一帧
            _api.prev = function() {
                var status = {
                    index: _index,
                    count: _size,
                    destination: "prev"
                };
                if(_isAnimated[0]||_isAnimated[1]){
                    return false;
                }
                if (options.beforeMove(status) !== false) {
                    switch (options.inEndEffect) {
                        case "switch":
                            if (_index) {
                                _index -= _index > options.steps ? options.steps : _index;
                            } else {
                                _index = _size - _view;
                            }
                            break;
                        case "cycle":
                            if (_index - options.steps < 0) {
                                $list2.css(_param,- (_size+_index) * _distance + 'px');
                                $list1 = [$list2, $list2 = $list1][0]; //两列表身份互换
                                _index += _size - options.steps;
                            } else {
                                _index -= options.steps;
                            }
                            break;
                        default:
                            if (_index) {
                                _index -= _index > options.steps ? options.steps : _index;
                            }
                    }
                    slide(options.animate);
                }
            };
            //返回下一帧
            _api.next = function() {
                var status = {
                    index: _index,
                    count: _size,
                    destination: "next"
                };
                if(_isAnimated[0]||_isAnimated[1]){
                    return false;
                }
                if (options.beforeMove(status) !== false) {
                    switch (options.inEndEffect) {
                        case "switch":
                            var lastindex = _size - _index - _view;
                            if (lastindex) {
                                _index += lastindex > options.steps ? options.steps : lastindex;
                            } else {
                                _index = 0;
                            }
                            break;
                        case "cycle":
                            _index += options.steps; //索引值计算
                            break;
                        default:
                            var lastindex = _size - _index - _view;
                            if (lastindex) {
                                _index += lastindex > options.steps ? options.steps : lastindex;
                            }
                    }
                    slide(options.animate);
                }
            };
            //开始播放
            _api.start = function() {
                _api.stop();
                _hander = setInterval(_api.next, options.delay);
            };
            //停止播放
            _api.stop = function() {
                if (_hander) {
                    clearInterval(_hander);
                }
            };
            //设置当前帧
            _api.setIndex = function(index,isAnimate){
                _index = index%_size;
                slide(isAnimate);
            };
            //获取当前帧
            _api.getIndex = function(){
                return _index;
            };
            //获取帧数
            _api.getSize = function(){
                return _size;
            };
            //窗口变化
            _api.resize = function(){
                if(options.fullScreen){
                    $item.width(parseInt($this.css('width')));
                }
                if(options.direction=="x"){
                    _distance = $item.width() + parseInt($item.css('margin-left')) + parseInt($item.css('margin-right')) + parseInt($item.css('padding-left')) + parseInt($item.css('padding-right'))+parseInt($item.css('border-left-width'))+parseInt($item.css('border-right-width'));
                }else{
                    _distance = $item.height() + parseInt($item.css('margin-top')) + parseInt($item.css('margin-bottom')) + parseInt($item.css('padding-top')) + parseInt($item.css('padding-bottom'))+parseInt($item.css('border-top-width'))+parseInt($item.css('border-bottom-width'));
                }
                _inner = _size * _distance;
                _outer = options.direction=='x'?$this.width():$this.height();
                _view = options.view || parseInt(_outer / _distance)||1;   //可视的帧数
                if(_param=="left"){
                    $lists.css('width',_size * _distance);
                }
                slide(false);
            };
            /****** 私有方法 ******/
            //触摸开始
            function touchStart(e) {
                _touch_direction = null;
                _startTime = new Date();
                _api.stop();
                _start = {
                    pageX:e.changedTouches[0].pageX,
                    pageY:e.changedTouches[0].pageY
                };
                _position.change1 = _param=="left"?$list1.position().left:$list1.position().top;
                if (options.inEndEffect == "cycle") {
                    _position.change2 = _param=="left"?$list2.position().left:$list2.position().top;
                }
            }
            //触碰移动
            function touchMove(e) {
                e.stopPropagation();
                if(options.isStopDefault){
                    e.preventDefault();
                }
                var current = {
                    pageX:e.changedTouches[0].pageX,
                    pageY:e.changedTouches[0].pageY
                };
                var delta = {
                    'x': current.pageX - _start.pageX,
                    'y':current.pageY - _start.pageY
                };
                var move = delta[options.direction];  //移动距离触发点的距离
                if(!_touch_direction){                //根据第一次移动向量判断方向
                    _touch_direction = Math.abs(delta.y) < Math.abs(delta.x)?'x':'y';
                }
                var direction = Math.abs(delta.y) < Math.abs(delta.x)?'x':'y';
                var steps = Math.ceil(Math.abs(move / _distance));  //移动中跳过的帧数
                if(direction==_touch_direction){    //过滤非移动方向上的量,防止抖动
                    if (options.direction=='x'&&_touch_direction=='x'||options.direction=='y') {  //chrome移动版下，默认事件与自定义事件的冲突
                        e.preventDefault();
                        if (options.inEndEffect == "cycle") {
                            if (move > 0) {  //手指向右滑
                                if (_index - steps < 0) {   //是否置换
                                    _position.change2 = -(_index + _size) * _distance;
                                    $list2.css(_param, _position.change2 + 'px');
                                    $list1 = [$list2, $list2 = $list1][0]; //两列表身份互换
                                    _position.change1 = [_position.change2, _position.change2 = _position.change1][0];
                                    _index += _size;
                                }
                            } else {    //手指向左滑
                                if (_index + steps > _size) {
                                    _position.change1 = (2*_size - _index) * _distance;
                                    $list1.css(_param, _position.change1 + 'px');
                                    $list1 = [$list2, $list2 = $list1][0]; //两列表身份互换
                                    _position.change1 = [_position.change2, _position.change2 = _position.change1][0];
                                    _index -= _size;
                                }
                            }
                            $list1.css(_param, _position.change1 + move);
                            $list2.css(_param, _position.change2 + move);
                        } else {
                            if (_index === 0 && move > 0 || _index === _size - _view && move < 0) {  //到达尽头时移动受阻
                                move *= 0.25;
                            }
                            $list1.css(_param, _position.change1 + move);
                        }
                    }
                }
            }
            //触碰结束
            function touchEnd(e) {
                var endTime = new Date();
                if (options.auto) {
                    _api.start();
                }
                var current = {
                    pageX: e.changedTouches[0].pageX,
                    pageY: e.changedTouches[0].pageY
                };
                var move = options.direction=="x"?current.pageX - _start.pageX:current.pageY - _start.pageY;
                var times = Math.abs(move / _distance);
                var steps = (times - Math.floor(times) > options.sensitivity)||endTime-_startTime<250&&Math.abs(move)>10? Math.ceil(times) : Math.floor(times);
                if (steps) {                                        //如果判定移动了一定距离
                    if (options.inEndEffect == "cycle") {
                        if (move > 0) {
                            _index -= steps;
                        } else {
                            _index += steps;
                        }
                    } else {
                        if (move > 0) {
                            if (_index) {
                                _index -= _index > steps ? steps : _index;
                            }
                        } else {
                            var lastindex = _size - _index - _view;
                            if (lastindex) {
                                _index += lastindex > steps ? steps : lastindex;
                            }
                        }
                    }
                }
                slide(true,200);
            }
            //移动
            function slide(animate,s_duration) {
                var duration = animate !=false ? (s_duration||options.duration) :0; //判断滑块是否需要移动动画
                var params = {};
                $nav_list.eq(_index % _size).addClass(options.activeTriggerCls).siblings().removeClass(options.activeTriggerCls);   //导航选中
                params = _param=="left"?{'left': -_index * _distance}:{'top': -_index * _distance};
                _isAnimated [0] = true;
                $list1.animate(params,{
                    'duration':duration,
                    'easing':options.easing,
                    'complete':function() {
                        _isAnimated [0] = false;
                        var status = {
                            index: _index,
                            count: _size
                        };
                        options.afterMove(status);
                    }
                });
                if(options.inEndEffect === "none"){     //左右箭头不可用状态
                    $prev.toggleClass(options.disableBtnCls,_index==0);
                    $next.toggleClass(options.disableBtnCls,_index==_size-1);
                }else if (options.inEndEffect === "cycle") {
                    params = _param=="left"?{'left':(_size - _index) * _distance}:{'top':(_size - _index) * _distance};
                    _isAnimated [1] = true;
                    $list2.animate(params,{
                        'duration':duration,
                        'easing':options.easing,
                        'complete':function() {
                            _isAnimated [1] = false;
                            if (_index >= _size) {
                                _index %= _size;
                                $list1.css(_param, (_size - _index) * _distance+ 'px');
                                $list1 = [$list2, $list2 = $list1][0]; //两列表身份互换
                            }
                        }
                    });
                }
            }
            //事件绑定
            if (options.auto) {
                _api.start();
                $this.bind({
                    'mouseover':_api.stop,
                    'mouseout':_api.start
                });
            }
            $this.bind({
                'mouseover':function(){
                    $(this).addClass("hover");
                },
                'mouseout':function(){
                    $(this).removeClass("hover");
                }
            });
            (function(){  //导航在内容内部的触碰纠正
                var _s = 0;
                function touchS(e){
                    _s = {
                        'pageX':e.changedTouches[0].pageX,
                        'pageY':e.changedTouches[0].pageY,
                    };
                }
                function touchE(e){
                    var current = {
                        'pageX':e.changedTouches[0].pageX,
                        'pageY':e.changedTouches[0].pageY,
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
            $prev.click(_api.prev);
            $next.click(_api.next);
            $this.on('touchstart',touchStart);
            $this.on('touchmove',touchMove);
            $this.on('touchend',touchEnd);
            window.onresize = _api.resize;
            //执行默认行为
            slide(false);
            _api.resize();
            getApi(_api);
        });
    };
})(Zepto, window, document);
