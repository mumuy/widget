/**
 * jquery.inputFormat.js 1.0
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
    $.fn.inputFormat = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
            type:'currency',
            tofixed:2
        };
        var options = $.extend({}, defaults, parameter);
        return this.each(function() {
            //对象定义
            var $this = $(this);
            var _api = {};
            var format = {
                currency:function(str,tofixed){
                    var reg = new RegExp('([\\d,]+\\.?(\\d{0,'+tofixed+'})?).*');               //位数截取
                    str = str.replace(/[^\d\.]/g,'').replace(/^[^\d]/,'').replace(reg,'$1');    //清除格式
                    var value = (+str).toFixed(tofixed);
                    var result = '';
                    if(str){
                        var number = value.split('.')[0];
                        if(number){ //处理整数部分
                            number = number.replace(/\d(?=(?:\d{3})+\b)/g,'$&,');
                        }
                        result = str.replace(/(\d)*(\.\d*)?/,number+'$2');  //和小数部分拼接
                    }
                    return result;
                },
                mobile:function(str){
                    var temp = (str.replace(/\s/g,'')+'xxxxxxxxxxx').substr(0,11);
                    var result = $.trim(temp.replace(/x/g,'').replace(/^(\d{7})/,'$1 ').replace(/^(\d{3})/,'$1 '));
                    if(temp.match(/^1[3|4|5|7|8|x][0-9x]{9}/)){
                        return result;
                    }else{
                        return result.substr(0,result.length-1);
                    }
                }
            };
            _api.format = function(value){
                return format[options.type](value,options.tofixed);
            };
            _api.setValue = function(value){
                var s = format[options.type](value,options.tofixed);
                if(s!=value){
                    $this.val(s);
                }
            };
            $this.on({
                input:function(){
                    var value = $this.val();
                    _api.setValue(value);
                }
            });
            //回调
            getApi(_api);
        });
    };
}));
