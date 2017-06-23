/**
 * jquery.slider-calendar.js 1.0
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
    $.fn.calendar = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
            prefix:'widget',            //生成日历的class前缀
            isRange:false,              //是否选择范围
            limitRange:[],              //有效选择区域的范围
            highlightRange:[],          //指定日期范围高亮
            onChange:function(){},      //当前选中月份修改时触发
            onSelect:function(){}       //选择日期时触发
        };
        var options = $.extend({}, defaults, parameter);
        return this.each(function() {
            var $this = $(this);
            var $title = $('<div class="'+options.prefix+'-title"></div>').appendTo($this);
            var $prevMonth = $('<a class="'+options.prefix+'-prevMonth" href="javascript:;">&lt;</a>').appendTo($title);
            var $date = $('<span>').appendTo($title);
            var $nextMonth = $('<a class="'+options.prefix+'-nextMonth" href="javascript:;">&gt;</a>').appendTo($title);
            var $panel = $('<div class="'+options.prefix+'-panel"></div>').appendTo($this);
            var _today,         //当天
                _data,          //日期数据
                _day,           //日历状态
                _range = [];    //当前选择范围
            /***** 样式初始化 *****/
            var width = $this.width();
            /***** 私有方法 *****/
            //获取日期数据
            var getDateObj = function(year,month,day){
                var date = arguments.length&&year?new Date(year,month-1,day):new Date();
                var obj = {
                    'year':date.getFullYear(),
                    'month':date.getMonth()+1,
                    'day':date.getDate(),
                    'week':date.getDay()
                };
                obj['code'] = ''+obj['year']+(obj['month']>9?obj['month']:'0'+obj['month'])+(obj['day']>9?obj['day']:'0'+obj['day']);
                return obj;
            };
            //获取当月天数
            var getMonthDays = function(obj){
                var day = new Date(obj.year,obj.month,0);
                return  day.getDate();
            };
            //获取某天日期信息
            var getDateInfo = function(obj){
                if(options.limitRange.length){
                    obj['status'] = 'disabled';
                    for(var i=0;i<options.limitRange.length;i++){
                        var start = options.limitRange[i][0];
                        var end =  options.limitRange[i][1];
                        if(start=='today'){
                            start = _today['code'];
                        }
                        if(end=='today'){
                            end = _today['code'];
                        }
                        if(start>end){
                            start = [end,end=start][0];
                        }
                        if(obj['code']>=start&&obj['code']<=end){
                            obj['status'] = '';
                            break;
                        }
                    }
                }
                obj['sign'] = [];
                if(options.highlightRange.length){
                    for(var i=0;i<options.highlightRange.length;i++){
                        var start = options.highlightRange[i][0];
                        var end =  options.highlightRange[i][1];
                        if(start=='today'){
                            start = _today['code'];
                        }
                        if(end=='today'){
                            end = _today['code'];
                        }
                        if(start>end){
                            start = [end,end=start][0];
                        }
                        if(obj['code']>=start&&obj['code']<=end){
                            obj['sign'].push('highlight');
                            break;
                        }
                    }
                }
                if(obj['code']==_today['code']){
                    obj['sign'].push('today');
                }
                return obj;
            };
            //获取某月信息
            var getData = function(obj){
                var first = getDateObj(obj['year'],obj['month'],1);     //当月第一天
                var days = getMonthDays(first);                         //当月天数
                var data = [];                                          //日历信息
                var obj = {};
                //上月日期
                for(var i=first['week'];i>0;i--){
                    obj = getDateObj(first['year'],first['month'],first['day']-i);
                    var info = getDateInfo(obj);
                    if(!options.limitRange.length){
                        info['status'] = 'disabled';
                    }
                    data.push(info);
                }
                //当月日期
                for(var i=0;i<days;i++){
                    obj = {
                        'year':first['year'],
                        'month':first['month'],
                        'day':first['day']+i,
                        'week':(first['week']+i)%7
                    };
                    obj['code'] = ''+obj['year']+(obj['month']>9?obj['month']:'0'+obj['month'])+(obj['day']>9?obj['day']:'0'+obj['day']);
                    var info = getDateInfo(obj);
                    data.push(info);
                }
                //下月日期
                var last = obj;
                for(var i=1;last['week']+i<7;i++){
                    obj = getDateObj(last['year'],last['month'],last['day']+i);
                    var info = getDateInfo(obj);
                    if(!options.limitRange.length){
                        info['status'] = 'disabled';
                    }
                    data.push(info);
                }
                return data;
            };
            //格式化月份
            var formatMonth = function($table,data){
                $table.append('<thead><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead>');
                var $tbody = $('<tbody>').appendTo($table);
                for(var i=0;i<data.length;i++){
                    var d = data[i];
                    if(d['status'] == 'active'){
                        d['status'] = '';
                    }
                }
                if(_range.length==2){
                    var start = _range[0]['code'];
                    var end = _range[1]['code'];
                    for(var i=0;i<data.length;i++){
                        var d = data[i];
                        if(d['code']>=start&&d['code']<=end){
                            if(d['status']=='disabled'){
                                _range[1]=d;
                                break;
                            }else{
                                d['status'] = 'active';
                            }
                        }
                    }
                }else if(_range.length==1){
                    for(var i=0;i<data.length;i++){
                        var d = data[i];
                        if(d['code']==_range[0]['code']){
                            d['status'] = 'active';
                        }
                    }
                }
                var html = '<tr>';
                for(var i=0,len=data.length;i<len;i++){
                    var day = data[i];
                    var arr = [];
                    for(var s=0;s<day['sign'].length;s++){
                        arr.push(options.prefix+'-'+day['sign'][s]);
                    }
                    if(day['status']){
                        arr.push(options.prefix+'-'+day['status']);
                    }
                    var className = arr.join(' ');
                    html+='<td'+(className?' class="'+className+'"':'')+' data-id="'+i+'">\
                        '+(day['link']?'<a href="'+day['link']+'">'+day['day']+'</a>':'<span>'+day['day']+'</span>')+'\
                    </td>';
                    if(i%7==6&&i<len-1){
                        html+='</tr><tr>';
                    }
                }
                html+='</tr>';
                $tbody.html(html);
            };
            //格式化日历
            var format = function(obj){
                if(typeof obj=='undefined'){
                    obj = _today;
                }
                var data;
                $panel.empty();
                if(obj['month']<1){
                    obj['year']--;
                    obj['month']+=12;
                }else if(obj['month']>12){
                    obj['year']++;
                    obj['month']-=12;
                }
                $date.html(obj['year']+'年'+obj['month']+'月');
                var $prev = $('<table>').appendTo($panel);
                data = getData({'year':obj['year'],'month':obj['month']-1});
                formatMonth($prev,data);
                var $now = $('<table>').appendTo($panel);
                data = getData({'year':obj['year'],'month':obj['month']});
                formatMonth($now,data);
                var $next = $('<table>').appendTo($panel);
                data = getData({'year':obj['year'],'month':obj['month']+1});
                formatMonth($next,data);
                if(_api){
                    _api.resize();
                }
                options.onChange(obj);
            };
            /***** 初始化 *****/
            _today = getDateObj();
            _day = {
                'year':_today['year'],
                'month':_today['month']
            };
            $this.on('click','td',function(){
                var $this = $(this);
                var index = $(this).data('id');
                var data = getData(_day);
                var day = data[index];
                if(day['status']!='disabled'){
                    if(options.isRange){
                        if(_range.length!=1){
                            _range = [day];
                            format(_day);
                        }else{
                            _range.push(day);
                            _range.sort(function(a,b){
                                return a['code']>b['code'];
                            });
                            format(_day);
                            options.onSelect(_range);
                        }
                    }else{
                        _range = [day];
                        format(_day);
                        options.onSelect(_range);
                    }
                }
            });
            format();
            var _api;
            $this.slider({
                'contentCls':options.prefix+'-panel',
                'prevBtnCls':options.prefix+'-prevMonth',
                'nextBtnCls':options.prefix+'-nextMonth',
                'hasTriggers':false,
                'activeIndex':1,
                'onChangeEnd':function(status){
                    if(status.index!=1){
                        if(_api){
                            _api.setIndex(1,false);
                        }
                        if(status.index==2){
                            _day['month']++;
                            format(_day);
                        }else{
                            _day['month']--;
                            format(_day);
                        }
                    }
                }
            },function(api){
                _api = api;
            });
        });
    };
}));
