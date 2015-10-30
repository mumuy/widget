/*
    倒计时 v1.0
    BY:le

    输出格式说明：月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符,年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
*/
(function($) {
    $.fn.countdown = function (parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
            'format': 'hh:mm:ss',                   //格式
            'starttime': '',                        //开始时间
            'endtime': '',                          //结束时间
            'time': '1000',                         //多久倒计时一次 单位：ms
            'onEach': function (timestamp) {        //每单位时间出发事件
            },
            'onEnd':function (timestamp) {      //倒计时结束回调事件
            }
        };
        var options = $.extend({}, defaults, parameter);
        return this.each(function (i) {
            var $this = $(this);
            var _api = {};              //对外的函数接口
            var _hander = null;
            options.starttime = parameter.starttime||$this.text();
            _api.reset=function(){
                if(_hander){
                    clearInterval(_hander);
                }
                if(isNaN(options.starttime)){
                    var start = getTimestamp(options.starttime);
                    var end = getTimestamp(options.endtime);
                }else{
                    options.format = parameter.format||'s';
                    var start = options.starttime*1e3;
                    var end = options.endtime*1e3;
                }
                $this.text(timeFormat(options.format,start));
                _hander = setInterval(function(){
                    start -= options.time;
                    if(start<=end){
                        clearInterval(_hander);
                        $this.text(timeFormat(options.format,end));
                        options.onEnd(end);
                    }else{
                        $this.text(timeFormat(options.format,start));
                        options.onEach(start);
                    }
                },options.time);
            };
            //初始化
            _api.reset();
            getApi(_api);
        });
        function getTimestamp(str){
            return +new Date(str)||+new Date('1970/1/1 '+str);
        }

        function timeFormat(format, timestamp){
            var date    = new Date(timestamp)
                month   = date.getMonth() + 1,
                day     = date.getDate(),
                hours   = date.getHours(),
                minutes = date.getMinutes(),
                seconds = date.getSeconds(),
                milliseconds = date.getMilliseconds();

            return format.replace(/Y+|y+|M+|D+|d+|H+|h+|m+|s+|S|qq|q/g, function($0){
                var ret = '';

                switch($0){
                    case 'y'://年
                    case 'yy':
                    case 'yyy':
                    case 'yyyy':
                    case 'Y':
                    case 'YY':
                    case 'YYY':
                    case 'YYYY':
                        ret = (date.getFullYear() + '').slice(-$0.length);
                        break;
                    case 'M'://月
                        ret = month;
                        break;
                    case 'MM':
                        ret = ('0' + month).slice(-$0.length);
                        break;
                    case 'd'://日
                    case 'D':
                        ret = day;
                    case 'dd':
                    case 'DD':
                        ret = ('0' + day).slice(-2);
                        break;
                    case 'h'://小时
                    case 'H':
                        ret = hours;
                        break;
                    case 'hh':
                    case 'HH':
                        ret = ('0' + hours).slice(-2);
                        break;
                    case 'm'://分钟
                        ret = minutes;
                        break;
                    case 'mm':
                        ret = ('0' + minutes).slice(-2);
                        break;
                    case 's'://秒
                        ret = seconds;
                        break;
                    case 'ss':
                        ret = ('0' + seconds).slice(-2);
                        break;
                    case 'S'://毫秒
                        ret = milliseconds;
                        break;
                    case 'q'://季度
                    case 'qq':
                        var quarter = Math.floor((month + 2)/3);
                        ret = ('0' + quarter).slice(-$0.length);
                        break;
                }
                return ret;
            });
        }
    }
})(jQuery);