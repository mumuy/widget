/**
 * jquery.countdown.js 1.0
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
            let defaults = {
                'format': 'hh:mm:ss',					//格式
                'starttime': $this.text(),				//开始时间
                'endtime': '',							//结束时间
                'interval': 1000,						//多久倒计时一次 单位：ms
                'disabledCls': 'disabled',
                'auto': true,							//是否默认自动计数
                'countEach': function (time) {			//每单位时间出发事件,传入一个对象，包含时间信息(month)和时间格式化输出(format)
                    $this.text(time['format']);
                },
                'countEnd': function (time) { }			//倒计时结束回调事件
            };
            let options = $.extend({}, defaults, parameter);
            let _api = {};              //对外的函数接口
            let _hander = null;
            let _start = 0, _end = 0;
            let isTime = isNaN(options.starttime) || isNaN(options.endtime); //是否时间表达式
            let getTime = function () {
                let date, format;
                let time = _start;
                let diff = _end - _start;
                let offset_GMT = new Date().getTimezoneOffset();
                let diff_format;
                if (isTime) {
                    date = new Date(time);
                    format = timeFormat(options.format, time);
                    diff_format = timeFormat(options.format, diff + offset_GMT * 60 * 1000);
                } else {
                    date = new Date();
                    format = time / 1e3;
                    diff_format = diff / 1e3;
                }
                return {
                    'year': date.getFullYear(),
                    'month': date.getMonth() + 1,
                    'day': date.getDate(),
                    'hour': date.getHours(),
                    'minute': date.getMinutes(),
                    'second': date.getSeconds(),
                    'quarter': Math.floor((date.getMonth() + 3) / 3),
                    'microsecond': date.getMilliseconds(),
                    'format': format,
                    'distance': diff_format,
                    'timestamp': diff
                };
            };
            let count = function () {
                if (_hander) {
                    clearInterval(_hander);
                }
                options.countEach(getTime());
                $this.addClass(options.disabledCls);
                let isReverse = _start > _end ? true : false;
                _hander = setInterval(function () {
                    if (isReverse) {
                        _start -= options.interval;
                        options.countEach(getTime());
                        if (_start <= _end) {
                            clearInterval(_hander);
                            $this.removeClass(options.disabledCls);
                            options.countEnd(getTime());
                        }
                    } else {
                        _start += options.interval;
                        options.countEach(getTime());
                        if (_start >= _end) {
                            clearInterval(_hander);
                            $this.removeClass(options.disabledCls);
                            options.countEnd(getTime());
                        }
                    }
                }, options.interval);
            };
            _api.reset = function () {
                if (isTime) {
                    _start = options.starttime ? getTimestamp(options.starttime) : (+new Date());
                    _end = getTimestamp(options.endtime);
                } else {
                    _start = options.starttime * 1e3;
                    _end = options.endtime * 1e3;
                }
                count();
            };
            _api.setStarttime = function (start) {
                isTime = isNaN(start);
                if (isTime) {
                    _start = getTimestamp(start);
                } else {
                    _start = start * 1e3;
                }
                count();
            };
            _api.setEndtime = function (end) {
                isTime = isNaN(end);
                if (isTime) {
                    _end = getTimestamp(end);
                } else {
                    _end = end * 1e3;
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
            return +new Date(str) || +new Date('1970/1/1 ' + str);
        }
        function timeFormat(fmt, timestamp) {
            let date = new Date(timestamp);
            let o = {
                "M+": date.getMonth() + 1,                 //月份
                "d+": date.getDate(),                    //日
                "h+": date.getHours(),                   //小时
                "m+": date.getMinutes(),                 //分
                "s+": date.getSeconds(),                 //秒
                "q+": Math.floor((date.getMonth() + 3) / 3), //季度
                "S": date.getMilliseconds()             //毫秒
            };
            if (/(y+)/.test(fmt)) {
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