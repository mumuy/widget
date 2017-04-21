(function(window){
    //根据class获取节点
    var getClass = function(className,context,tagName){
        if(typeof context == 'string'){
            tagName = context;
            context = document;
        }else{
            context = context || document;
            tagName = tagName || '*';
        }
        if(context.getElementsByClassName){
            return context.getElementsByClassName(className);
        }
        var nodes = context.getElementsByTagName(tagName);
        var results= [];
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var classNames = node.className.split(' ');
            for (var j = 0; j < classNames.length; j++) {
                if (classNames[j] == className) {
                    results.push(node);
                    break;
                }
            }
        }
        return results;
    };  
    //跨浏览器事件对象
    var EventUtil = { 
        addEvent:function(element,type,handler){ //添加绑定
            if(element.addEventListener){ 
                element.addEventListener(type,handler,false); 
            }else if(element.attachEvent){ 
                element.attachEvent('on'+type,handler); 
            }else{ 
                element['on'+type]=handler; 
            } 
        }, 
        getEvent:function(event){ //返回事件对象引用 
            return event?event:window.event; 
        },
        getTarget:function(event){ //返回事件源目标 
            return event.target||event.srcElement; 
        }, 
        preventDefault:function(event){ //取消默认事件 
            if(event.preventDefault){ 
                event.preventDefault(); 
            }else{ 
                event.returnValue=false; 
            }
        },
        stoppropagation:function(event){ //阻止事件流 
            if(event.stoppropagation){ 
                event.stoppropagation(); 
            }else{ 
                event.canceBubble=false; 
            } 
        }
    };
    //IE6~9兼容
    function setTBodyInnerHTML(tbody, html) {
        var div = document.createElement('div');
        div.innerHTML = '<table>' + html + '</table>';
        tbody.parentNode.replaceChild(div.firstChild.firstChild, tbody);
    }
    var isIE= navigator.appVersion.indexOf("MSIE")>-1;

    var Calendar = function(id,parameter){
        parameter = parameter||{};
        var options = {
            prefix:'widget',            //生成日历的class前缀
            isRange:false,              //是否选择范围
            limitRange:[],              //有效选择区域的范围
            highlightRange:[],          //指定日期范围高亮
            onChange:function(){},      //当前选中月份修改时触发
            onSelect:function(){}       //选择日期时触发
        };
        for (var p in parameter) {
            options[p] = parameter[p];
        }
        var _self = this;
        var $this = document.getElementById(id);
        $this.innerHTML = '<table>\
            <caption>\
                <a class="'+options.prefix+'-prevYear" href="javascript:;">&lt;&lt;</a>\
                <a class="'+options.prefix+'-prevMonth" href="javascript:;">&lt;</a>\
                <span class="'+options.prefix+'-title">2016年3月</span>\
                <a class="'+options.prefix+'-nextMonth" href="javascript:;">&gt;</a>\
                <a class="'+options.prefix+'-nextYear" href="javascript:;">&gt;&gt;</a>\
                <a class="'+options.prefix+'-back" href="javascript:;">今天</a>\
            </caption>\
            <thead>\
                <tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr>\
            </thead>\
            <tbody></tbody>\
        </table>';
        var $tbody = $this.getElementsByTagName('TBODY')[0];
        var $prevYear = getClass(options.prefix+"-prevYear",$this)[0];
        var $prevMonth = getClass(options.prefix+"-prevMonth",$this)[0];
        var $title = getClass(options.prefix+"-title",$this)[0];
        var $nextMonth = getClass(options.prefix+"-nextMonth",$this)[0];
        var $nextYear = getClass(options.prefix+"-nextYear",$this)[0];
        var $back = getClass(options.prefix+"-back",$this)[0];
        var _today,         //当天
            _data,          //日期数据
            _day,           //日历状态
            _range = [];
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
        var format = function(data){
            _day['year'] += Math.floor((_day['month']-1)/12);
            _day['month'] = (_day['month']+11)%12+1;
            options.onChange(_day);
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
                            break;
                        }else{
                            d['status'] = 'active';
                            _range[1]=d;
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
            $title.innerHTML = _day['year']+'年'+_day['month']+'月';
            if(isIE){
                setTBodyInnerHTML($tbody,html);
            }else{
                $tbody.innerHTML = html;
            }
        };
        /***** 对外方法 *****/
        _self.getData = function(obj){
            if(typeof obj=='undefined'){
                obj = _today;
            }
            var first_day = getDateObj(obj['year'],obj['month'],1);      //当月第一天
            var days = getMonthDays(first_day);              //当月天数
            var data = [];                              //日历信息
            var obj = {};
            //上月日期
            for(var i=first_day['week'];i>0;i--){
                obj = getDateObj(first_day['year'],first_day['month'],first_day['day']-i);
                var info = getDateInfo(obj);
                if(!options.limitRange.length){
                    info['status'] = 'disabled';
                }
                data.push(info);
            }
            //当月日期
            for(var i=0;i<days;i++){
                obj = {
                    'year':first_day['year'],
                    'month':first_day['month'],
                    'day':first_day['day']+i,
                    'week':(first_day['week']+i)%7
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
        //获取当前月份
        _self.getCurrentMonth = function(){
            return _day;
        };
        /***** 初始化 *****/
        _today = getDateObj();
        _day = {
            'year':_today['year'],
            'month':_today['month']
        };
        EventUtil.addEvent($prevMonth,'click',function(){
            _day['month']--;
            _data = _self.getData(_day);
            format(_data);
        });
        EventUtil.addEvent($nextMonth,'click',function(){
            _day['month']++;
            _data = _self.getData(_day);
            format(_data);
        });
        EventUtil.addEvent($prevYear,'click',function(){
            _day['year']--;
            _data = _self.getData(_day);
            format(_data);
        });
        EventUtil.addEvent($nextYear,'click',function(){
            _day['year']++;
            _data = _self.getData(_day);
            format(_data);
        });
        EventUtil.addEvent($back,'click',function(){
            _day = {'year':_today['year'],'month':_today['month']};
            _data = _self.getData();
            format(_data);
        });
        EventUtil.addEvent($this,'click',function(e){
            var $target = EventUtil.getTarget(e);
            while($target.tagName != 'TD'&&$target!=$this){
                $target = $target.parentNode;
            }
            if($target.tagName == 'TD'){
                var index = $target.getAttribute('data-id');
                var day = _data[index];
                if(day['status']!='disabled'){
                    if(options.isRange){
                        if(_range.length!=1){
                            _range = [day];
                            format(_data);
                        }else{
                            _range.push(day);
                            _range.sort(function(a,b){
                                return a['code']>b['code'];
                            });
                            format(_data);
                            options.onSelect(_range);
                        }
                    }else{
                        _range = [day];
                        format(_data);
                        options.onSelect(_range);
                    }
                }
            }
        });
        _data = _self.getData();
        format(_data);
    };
    window.Calendar = Calendar;
})(window);