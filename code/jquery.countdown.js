/**
 * jquery.countdown.js 1.1
 * http://jquerywidget.com
 */
; (function (factory) {
    if (typeof define === "function" && define.amd) {
        // AMD
        if (typeof jQuery === 'undefined') {
            define(['jquery'], factory);
        } else {
            define(function () {
                factory(jQuery);
            });
        }
    } else if (typeof define === "function" && define.cmd) {
        // CMD
        if (typeof jQuery === 'undefined') {
            define(function (require) {
                let jQuery = require('jquery');
                factory(jQuery);
            });
        } else {
            define(function () {
                factory(jQuery);
            });
        }
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function (root, jQuery) {
            if (typeof jQuery === 'undefined') {
                if (typeof window !== 'undefined') {
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
    $.fn.countdown = function (parameter, getApi) {
        if (typeof parameter == 'function') { //重载
            getApi = parameter;
            parameter = {};
        } else {
            parameter = parameter || {};
            getApi = getApi || function () { };
        }
        return this.each(function (i) {
            let $this = $(this);
            const text = $this.text().trim();
            const starttime = text.match(/((\d{4})[\/\-年](\d{2})[\/\-月](\d{2})[日]?\s+)?\d{2}:\d{2}(:\d{2})?|\d+/)?.[0]||'';
            let defaults = {
                'format': 'HH:mm:ss',					// 格式
                'starttime': starttime,	                // 开始时间
                'endtime': '',							// 结束时间
                'interval': 1000,						// 多久倒计时一次 单位：ms
                'disabledCls': 'disabled',
                'auto': true,							// 是否默认自动计数
                'countEach': function (time) {			// 每单位时间出发事件,传入一个对象，包含时间信息(month)和时间格式化输出(format)
                    $this.text(time['current']);
                },
                'countEnd': function (time) { }			// 倒计时结束回调事件
            };
            let options = $.extend({}, defaults, parameter);
            let _api = {};                              // 对外的函数接口
            let _hander = null;
            let _start = 0, _end = 0;
            let isTime = isNaN(options.starttime)||isNaN(options.endtime); // 是否时间表达式
            let isReverse = false;
            let getTime = function () {
                let time = _start;
                let diff = _end - _start;
                let format;
                if (isTime) {
					format = timeFormat(options.format, time);
				} else {
					format = time / options.interval;
				}
                return {
                    'day': Math.floor(diff / 86400000),
                    'hour': Math.floor(diff % 86400000 / 3600000),
                    'minute': Math.floor(diff % 3600000 / 60000),
                    'second': Math.floor(diff % 60000 / 1000),
                    'microsecond': diff % 1000,
                    'distance': diff,
                    'current': format
                };
            };
            let count = function () {
                if (_hander) {
                    clearInterval(_hander);
                }
                setTimeout(function () {
                    options.countEach(getTime());
                }, 0);
                $this.addClass(options.disabledCls);
                _hander = setInterval(function () {
                    if (isReverse) {
                        if (options.starttime) {
                            _start -= options.interval;
                        } else {
                            _start = Date.now();
                        }
                        options.countEach(getTime(_start));
                        if (_start <= _end) {
                            clearInterval(_hander);
                            $this.removeClass(options.disableBtnCls);
                            options.countEnd(getTime(_end));
                        }
                    } else {
                        _start += options.interval;
                        if (options.starttime) {
                            _start += options.interval;
                        } else {
                            _start = Date.now();
                        }
                        options.countEach(getTime(_start));
                        if (_start >= _end) {
                            clearInterval(_hander);
                            $this.removeClass(options.disableBtnCls);
                            options.countEnd(getTime(_end));
                        }
                    }
                }, options.interval);
            };
            _api.reset = function () {
                if(isTime){
                    _start = options.starttime ? (isNaN(options.starttime) ? getTimestamp(options.starttime) : options.starttime) : Date.now();
                    _end = isNaN(options.endtime) ? getTimestamp(options.endtime) : options.endtime;
                }else{
                    _start = options.starttime*options.interval;
					_end = options.endtime*options.interval;
                }
                isReverse = _start > _end ? true : false;
                count();
            };
            _api.setStarttime = function (start) {
                options.starttime = start;
                isTime = isNaN(start);
				if(isTime){
					_start = options.starttime ? (isNaN(options.starttime) ? getTimestamp(options.starttime) : options.starttime) : Date.now();
				}else{
					_start = start*options.interval;
				}
                count();
            };
            _api.setEndtime = function (end) {
                options.endtime = end;
                isTime = isNaN(end);
				if(isTime){
                    _end = isNaN(options.endtime) ? getTimestamp(options.endtime) : options.endtime;
                }else{
					_end = end*options.interval;
				}
                count();
            };
            //初始化
            if (options.auto) {
                _api.reset();
            }
            getApi(_api);
        });
        function getTimestamp(str) {
            str = str.replace(/\-/g, '/');
            const today = (new Date()).toISOString().substring(0, 10);
            return +new Date(str) || +new Date(`${today} ${str}`);
        }
        function timeFormat(fmt, timestamp) {
            let date = new Date(timestamp);
            let o = {
                "M+": date.getMonth() + 1,               //月份
                "D+": date.getDate(),                    //日
                "H+": date.getHours(),                   //小时
                "m+": date.getMinutes(),                 //分
                "s+": date.getSeconds(),                 //秒
                "q+": Math.floor((date.getMonth() + 3) / 3), //季度
                "S": date.getMilliseconds()             //毫秒
            };
            if (/(Y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (let k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
            return fmt;
        }
    };
}));