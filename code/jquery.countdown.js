/**
 * jquery.countdown.js 1.0
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
	$.fn.countdown = function (parameter,getApi) {
		if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
		return this.each(function (i) {
			var $this = $(this);
			var defaults = {
				'format': 'hh:mm:ss',					//格式
				'starttime': $this.text(),				//开始时间
				'endtime': '',							//结束时间
				'interval': 1000,						//多久倒计时一次 单位：ms
				'disableBtnCls':'disable',
				'auto':true,							//是否默认自动计数
				'countEach': function (time) {			//每单位时间出发事件,传入一个对象，包含时间信息(month)和时间格式化输出(format)
					$this.text(time['format']);
				},
				'countEnd':function (time) {}			//倒计时结束回调事件
			};
			var options = $.extend({}, defaults, parameter);
			var _api = {};              //对外的函数接口
			var _hander = null;
			var _start=0,_end=0;
			var isTimestamp = isNaN(options.starttime)||isNaN(options.endtime);//是否为秒计数模式
			var getTime = function(timestamp){
				var date,format;
				if(isTimestamp){
					date = new Date(timestamp);
					format = timeFormat(options.format,timestamp);
				}else{
					date = new Date();
					format = timestamp/1e3;
				}
				return {
					'year':date.getFullYear(),
					'month':date.getMonth()+1,
					'day':date.getDate(),
					'hour':date.getHours(),
					'minute':date.getMinutes(),
					'second':date.getSeconds(),
					'quarter':Math.floor((date.getMonth()+3)/3),
					'microsecond':date.getMilliseconds(),
					'format':format
				};
			};
			var count = function(){
				if(_hander){
					clearInterval(_hander);
				}
				options.countEach(getTime(_start));
				$this.addClass(options.disableBtnCls);
				_hander = setInterval(function(){
					_start -= options.interval;
					options.countEach(getTime(_start));
					if(_start<=_end){
						clearInterval(_hander);
						$this.removeClass(options.disableBtnCls);
						options.countEnd(getTime(_end));
					}
				},options.interval);
			};
			_api.reset = function(){
				if(isTimestamp){
					_start = options.starttime?getTimestamp(options.starttime):(+new Date());
					_end = getTimestamp(options.endtime);
				}else{
					_start = options.starttime*1e3;
					_end = options.endtime*1e3;
				}
				count();
			};
			_api.setStarttime = function(start){
				isTimestamp = isNaN(start);
				if(isTimestamp){
					_start = getTimestamp(start);
				}else{
					_start = start*1e3;
				}
				count();
			};
			_api.setEndtime = function(end){
				isTimestamp = isNaN(end);
				if(isTimestamp){
					_end = getTimestamp(end);
				}else{
					_end = end*1e3;
				}
				count();
			};
			//初始化
			if(options.auto){
				_api.reset();
			}
            getApi(_api);
		});
		function getTimestamp(str){
			return +new Date(str)||+new Date('1970/1/1 '+str);
		}
		function timeFormat(fmt,timestamp){
			var date = new Date(timestamp);
			var o = {
				"M+" : date.getMonth()+1,                 //月份
				"d+" : date.getDate(),                    //日
				"h+" : date.getHours(),                   //小时
				"m+" : date.getMinutes(),                 //分
				"s+" : date.getSeconds(),                 //秒
				"q+" : Math.floor((date.getMonth()+3)/3), //季度
				"S"  : date.getMilliseconds()             //毫秒
			};
			if(/(y+)/.test(fmt)){
				fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
			}
			for(var k in o){
				if(new RegExp("("+ k +")").test(fmt)){
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
				}
			}
			return fmt;
		}
	};
}));
