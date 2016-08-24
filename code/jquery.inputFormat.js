/**
 * jquery.inputFormat.js 1.0
 * http://jquerywidget.com
 */
;(function($, window, document, undefined) {
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
                }
            };
            _api.format = function(value){
                return format[options.type](value,options.tofixed);
            }
            _api.setValue = function(value){
                var s = format[options.type](value,options.tofixed);
                if(s!=value){
                    $this.val(s);
                }
            }
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
})(jQuery, window, document);
