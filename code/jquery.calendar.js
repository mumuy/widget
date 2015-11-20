/**
 * jquery.calendar.js 1.0
 * http://passer-by.com
 */
;(function($, window, document, undefined) {
    $.fn.calendar = function(parameter,getApi) {
        parameter = parameter || {};
        var defaults = {
            'prefix':'widget',          //生成日历的class前缀
            'change':function(){},      //当前选中月份修改时触发
            'select':function(){}       //选择日期时触发
        };
        var options = $.extend({}, defaults, parameter);
        return this.each(function() {
            var $this = $(this);
            var $table = $('<table>').appendTo($this);
            var $caption = $('<caption>').appendTo($table);
            var $prevYear = $('<a class="'+options.prefix+'-prevYear" href="javascript:;">&lt;&lt;</a>').appendTo($caption);
            var $prevMonth = $('<a class="'+options.prefix+'-prevMonth" href="javascript:;">&lt;</a>').appendTo($caption);
            var $title = $('<span>').appendTo($caption);
            var $nextMonth = $('<a class="'+options.prefix+'-nextMonth" href="javascript:;">&gt;</a>').appendTo($caption);
            var $nextYear = $('<a class="'+options.prefix+'-nextYear" href="javascript:;">&gt;&gt;</a>').appendTo($caption);
            var $back = $('<a class="'+options.prefix+'-back" href="javascript:;">今天</a>').appendTo($caption);
            var _today, //当天
                _data,  //日期数据
                _day;   //日历状态
            /*****  节点修改 *****/
            $table.append('<thead><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead>');
            var $tbody = $('<tbody>').appendTo($table);
            /***** 私有方法 *****/
            //获取日期数据
            var getDateObj = function(year,month,day){
                var date = arguments.length&&year?new Date(year,month-1,day):new Date();
                return {
                    'year':date.getFullYear(),
                    'month':date.getMonth()+1,
                    'day':date.getDate(),
                    'week':date.getDay()
                };
            };
            //获取当月天数
            var getMonthDays = function(obj){
                var day = new Date(obj.year,obj.month,0);
                return  day.getDate();
            };
            //获取某天日期信息
            var getDateInfo = function(obj){
                if(obj['year']==_today['year']&&obj['month']==_today['month']&&obj['day']==_today['day']){
                    obj['sign'] = 'today';
                }
                return obj;
            };
            var getData = function(obj){
                if(typeof obj=='undefined'){
                    obj = _today;
                }
                _day = getDateObj(obj['year'],obj['month'],1);      //当月第一天
                var days = getMonthDays(_day);              //当月天数
                var data = [];                              //日历信息
                var obj = {};
                //上月日期
                for(var i=_day['week'];i>0;i--){
                    obj = getDateObj(_day['year'],_day['month'],_day['day']-i);
                    var info = getDateInfo(obj);
                    info['disabled'] = 1;
                    data.push(info);
                }
                //当月日期
                for(var i=0;i<days;i++){
                    obj = {
                        'year':_day['year'],
                        'month':_day['month'],
                        'day':_day['day']+i,
                        'week':(_day['week']+i)%7
                    };
                    var info = getDateInfo(obj);
                    info['disabled'] = 0;
                    data.push(info);
                }
                //下月日期
                var last = obj;
                for(var i=1;last['week']+i<7;i++){
                    obj = getDateObj(last['year'],last['month'],last['day']+i);
                    var info = getDateInfo(obj);
                    info['disabled'] = 1;
                    data.push(info);
                }
                return data;        
            };
            var format = function(date){
                _data = getData(date);
                options.change(_day);
                var html = '<tr>';
                for(var i=0,len=_data.length;i<len;i++){
                    var date = _data[i];
                    var className = '';
                    if(date['sign']){
                        className += options.prefix+'-'+date['sign'];
                    }
                    if(date['disabled']){
                        className += ' '+options.prefix+'-'+'disabled';
                    }
                    html+='<td'+(className?' class="'+className+'"':'')+' data-id="'+i+'">\
                        '+(date['link']?'<a href="'+date['link']+'">'+date['day']+'</a>':'<span>'+date['day']+'</span>')+'\
                    </td>';
                    if(i%7==6&&i<len-1){
                        html+='</tr><tr>';
                    }
                }
                html+='</tr>';
                $title.html(_day['year']+'年'+_day['month']+'月');
                $tbody.html(html);
            };
            /***** 初始化 *****/
            _today = getDateObj();
            _day = {
                'year':_today['year'],
                'month':_today['month']
            };
            $prevMonth.click(function(){
                _day['month']--;
                format(_day);
            });
            $nextMonth.click(function(){
                _day['month']++;
                format(_day);
            });
            $prevYear.click(function(){
                _day['year']--;
                format(_day);
            });
            $nextYear.click(function(){
                _day['year']++;
                format(_day);
            });
            $back.click(function(){
                format();
            });
            $this.on('click','td',function(){
                var $this = $(this);
                var index = $(this).data('id');
                var day = _data[index];
                if(!day['disabled']){
                    var className = options.prefix+'-active';
                    $tbody.find('td').removeClass(className);
                    $this.addClass(className);
                    options.select(day);
                }
            });
            format();
        });
    };
})(jQuery, window, document);