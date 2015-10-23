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
			return this.each(function (i) {
				var $this = $(this);
				var defaults = {
					'format': 'hh:mm:ss',					//格式
					'starttime': $this.text(),				//开始时间
					'endtime': '',							//结束时间
					'time': 1000,							//多久倒计时一次 单位：ms
					'disableBtnCls':'disable',
					'auto':true,
					'countEach': function (time) {		//每单位时间出发事件
						$this.text(time);
					},
					'countEnd':function (time) {		//倒计时结束回调事件
						$this.text(time);
					}
				};
				var options = $.extend({}, defaults, parameter);
				var _api = {};              //对外的函数接口
				var _hander = null;
				var _start=0,_end=0;
				var isTimestamp = isNaN(options.starttime);//是否为秒计数模式
				var count = function(){
					if(_hander){
						clearInterval(_hander);
					}
					options.countEach(isTimestamp?timeFormat(options.format,_start):_start/1e3);
					$this.addClass(options.disableBtnCls);
					_hander = setInterval(function(){
						_start -= options.time;
						if(_start<=_end){
							clearInterval(_hander);
							options.countEnd(isTimestamp?timeFormat(options.format,_end):_end/1e3);
							$this.removeClass(options.disableBtnCls);
						}else{
							options.countEach(isTimestamp?timeFormat(options.format,_start):_start/1e3);
						}
					},options.time);
				};
				_api.reset = function(){
					if(isTimestamp){
						_start = getTimestamp(options.starttime);
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
		}
	})(jQuery);