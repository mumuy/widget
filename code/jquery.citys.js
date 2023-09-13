/**
 * jquery.citys.js 1.2
 * http://jquerywidget.com
 */
;(function (factory) {
    if (typeof define === "function" && define.amd){
        // AMD
        if (typeof jQuery === 'undefined') {
            define(['jquery'],factory);
        }else{
            define(function(){
                factory(jQuery);
            });
        }
    }else if (typeof define === "function" && define.cmd){
        // CMD
        if (typeof jQuery === 'undefined') {
            define(function(require){
                var jQuery = require('jquery');
                factory(jQuery);
            });
        }else{
            define(function(){
                factory(jQuery);
            });
        }
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function( root, jQuery ) {
            if (typeof jQuery === 'undefined') {
                if (typeof window !== 'undefined' ) {
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
    $.support.cors = true;
    $.fn.citys = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
            data:null,                //数据源
            dataUrl:'https://passer-by.com/data_location/list.json',     //数据库地址
            crossDomain: true,        //是否开启跨域
            dataType:'json',          //数据库类型:'json'或'jsonp'
            provinceField:'province', //省份字段名
            cityField:'city',         //城市字段名
            districtField:'district',         //地区字段名
            valueType:'code',         //下拉框值的类型,code行政区划代码,name地名
            code:0,                   //地区编码
            province:0,               //省份,可以为地区编码或者名称
            city:0,                   //城市,可以为地区编码或者名称
            district:0,               //地区,可以为地区编码或者名称
            required: true,           //是否必须选一个
            nodata: 'hidden',         //当无数据时的表现形式:'hidden'隐藏,'disabled'禁用,为空不做任何处理
            placeholder:' - 请选择 - ',          // 默认项
            onChange:function(){}     //地区切换时触发,回调函数传入地区数据
        };
        var options = $.extend({}, defaults, parameter);
        return this.each(function() {
            //对象定义
            var _api = {};
            var $this = $(this);
            var $province = $this.find('select[name="'+options.provinceField+'"]'),
                $city = $this.find('select[name="'+options.cityField+'"]'),
                $district = $this.find('select[name="'+options.districtField+'"]');
            var init = function(data){
                var province,city,district,hasCity;
                var initCode = function(){
                    if(options.code){   //如果设置地区编码，则忽略单独设置的信息
                        var code =  options.code.toString();
                        var c = code.replace(/\d{4}$/,'0000');
                        if(data[c]){
                            options.province = c;
                        }
                        c = code.replace(/\d{2}$/,'00');
                        if(data[c]){
                            options.city = c;
                        }
                        c = options.code%1e2 ? options.code : '';
                        options.district = c;
                    }else{
                        options.province = options.province||($province.val()||'').toString().replace(/\d{4}$/,'0000');
                        options.city = options.city||($city.val()||'').toString().replace(/\d{2}$/,'00');
                        options.district = options.district||($district.val()||'').toString();
                    }
                };
                var updateCode = function(){
                    province={},city={},district={};
                    hasCity = false;       //判断是非有地级城市
                    for(var code in data){
                        if(code.match(/0000$/)){
                            province[code]=data[code];
                            if(options.required&&!options.province){
                                if(options.city&&options.city.match(/0000$/)){  //省未填，并判断为直辖市
                                    options.province = options.city;
                                }else{
                                    options.province = code;
                                }
                            }else if(isNaN(options.province)&&data[code].indexOf(options.province)>-1){
                                options.province = code;
                            }
                        }
                    }
                    if(options.province){
                        for(var code in data){
                            var prefix = code.replace(/\d{4}$/,'0000');
                            if(code!=prefix&&prefix==options.province){
                                if(code.match(/00$/)){
                                    hasCity = true;
                                    city[code]=data[code];
                                    if(options.required&&!options.city){
                                        options.city = code;
                                    }else if(isNaN(options.city)&&data[code].indexOf(options.city)>-1){
                                        options.city = code;
                                    }
                                }else if(code.match(/[89]0\d{2}$/)){
                                    city[code] = data[code];
                                    if(options.required&&!options.city){
                                        options.city = code;
                                    }else if(isNaN(options.city)&&data[code].indexOf(options.city)>-1){
                                        options.city = code;
                                    }
                                }
                            }
                        }
                    }
                    if(hasCity){
                        if(options.city){
                            for(var code in data){
                                var prefix = code.replace(/\d{2}$/,'00');
                                if(code!=prefix&&prefix==options.city){
                                    district[code] = data[code];
                                    if(options.required&&!options.district){
                                        options.district = code;
                                    }else if(isNaN(options.district)&&data[code].indexOf(options.district)>-1){
                                        options.district = code;
                                    }
                                }
                            }
                        }
                    }else{
                        for(var code in data){
                            var prefix = code.replace(/\d{4}$/,'0000');
                            if(code!=prefix&&prefix==options.province){
                                district[code] = data[code];
                                if(options.required&&!options.district){
                                    options.district = code;
                                }else if(isNaN(options.district)&&data[code].indexOf(options.district)>-1){
                                    options.district = code;
                                }
                            }
                        }
                    }
                };
                var format = {
                    province:function(){
                        $province.empty();
                        if(!options.required){
                            $province.append('<option value="">'+options.placeholder+'</option>');
                        }
                        for(var i in province){
                            $province.append('<option value="'+(options.valueType=='code'?i:province[i])+'" data-code="'+i+'">'+province[i]+'</option>');
                        }
                        if(options.province){
                            var value = options.valueType=='code'?options.province:province[options.province];
                            $province.val(value);
                        }
                        this.city();
                    },
                    city:function(){
                        $city.empty();
                        if(!hasCity){
                            $city.css('display','none');
                        }else{
                            $city.css('display','');
                            if(!options.required){
                                $city.append('<option value="">'+options.placeholder+'</option>');
                            }
                            if(options.nodata=='disabled'){
                                $city.prop('disabled',$.isEmptyObject(city));
                            }else if(options.nodata=='hidden'){
                                $city.css('display',$.isEmptyObject(city)?'none':'');
                            }
                            for(var i in city){
                                $city.append('<option value="'+(options.valueType=='code'?i:city[i])+'" data-code="'+i+'">'+city[i]+'</option>');
                            }
                            if(options.city){
                                var value = options.valueType=='code'?options.city:city[options.city];
                                $city.val(value);
                            }else if(options.district){
                                var value = options.valueType=='code'?options.district:city[options.district];
                                $city.val(value);
                            }
                        }
                        this.district();
                    },
                    district:function(){
                        $district.empty();
                        if(!options.required){
                            $district.append('<option value="">'+options.placeholder+'</option>');
                        }
                        if(options.nodata=='disabled'){
                            $district.prop('disabled',$.isEmptyObject(district));
                        }else if(options.nodata=='hidden'){
                            $district.css('display',$.isEmptyObject(district)?'none':'');
                        }
                        for(var i in district){
                            $district.append('<option value="'+(options.valueType=='code'?i:district[i])+'" data-code="'+i+'">'+district[i]+'</option>');
                        }
                        if(options.district){
                            var value = options.valueType=='code'?options.district:district[options.district];
                            $district.val(value);
                        }
                    }
                };
                // 设置值
                _api.setCode = function(code){
                    options.code = code;
                    initCode();
                    updateCode();
                    format.province();
                };
                // 获取当前地理信息
                _api.getInfo = function(){
                    var status = {
                        direct:!hasCity,
                        province:data[options.province]||'',
                        city:data[options.city]||'',
                        district:data[options.district]||''
                    };
                    if($district.length){
                        status['code'] = options.district||options.city||options.province;
                    }else if($city.length){
                        status['code'] = options.city||options.province;
                    }else if($province.length){
                        status['code'] = options.province;
                    }else{
                        status['code'] = 0;
                    }
                    return status;
                };
                // 事件绑定
                $province.on('change',function(){
                    options.province = $(this).find('option:selected').data('code')||0; //选中节点的区划代码
                    options.city = 0;
                    options.district = 0;
                    updateCode();
                    format.city();
                    options.onChange(_api.getInfo());
                });
                $city.on('change',function(){
                    options.city = $(this).find('option:selected').data('code')||0; //选中节点的区划代码
                    options.district = 0;
                    updateCode();
                    format.district();
                    options.onChange(_api.getInfo());
                });
                $district.on('change',function(){
                    options.district = $(this).find('option:selected').data('code')||0; //选中节点的区划代码
                    options.onChange(_api.getInfo());
                });
                // 初始化
                initCode();
                updateCode();
                format.province();
                options.onChange(_api.getInfo());
                getApi(_api);
            };
            if(options.data){
                init(options.data);
            }else{
                $.ajax({
                    url:options.dataUrl,
                    type:'GET',
                    crossDomain: options.crossDomain,
                    dataType:options.dataType,
                    jsonpCallback:'jsonp_location',
                    success:init
                });
            }
        });
    };
}));