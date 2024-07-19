/**
 * jquery.citys.js 1.2
 * http://jquerywidget.com
 * 全球定制版
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
            countryField:'country',   //国家字段名
            provinceField:'province', //省份字段名
            cityField:'city',         //城市字段名
            districtField:'district', //地区字段名
            valueType:'code',         //下拉框值的类型,code行政区划代码,name地名
            code:0,                   //地区编码
            country:0,                //国家,可以为地区编码或名称
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
            var $country = $this.find('select[name="'+options.countryField+'"]'),
                $province = $this.find('select[name="'+options.provinceField+'"]'),
                $city = $this.find('select[name="'+options.cityField+'"]'),
                $district = $this.find('select[name="'+options.districtField+'"]');
            var init = function(data){
                var country,province,city,district,hasCity;
                var initCode = function(){
                    if(options.code){   //如果设置地区编码，则忽略单独设置的信息
                        var code =  options.code.toString();
                        var c = code.replace(/[\dA-z]{6}$/,'000000');
                        if(data[c]){
                            options.country = c;
                        }
                        c = code.replace(/[\dA-z]{4}$/,'0000');
                        if(data[c] && options.country && c != options.country){
                            options.province = c;
                        }
                        c = code.replace(/[\dA-z]{2}$/,'00');
                        if (data[c] && c != options.province) {
                            options.city = c;
                        }
                        c = code.substr(-2)!='00' ? code : 0;
                        if (data[c] && c != options.city) {
                            options.district = c;
                        }
                    }else{
                        options.country = options.country || ($country.data('value') || $country.val() || '').toString().replace(/\d{6}$/, '000000');
                        options.province = options.province || ($province.data('value') || $province.val() || '').toString().replace(/\d{4}$/, '0000');
                        options.city = options.city || ($city.data('value') || $city.val() || '').toString().replace(/\d{2}$/, '00');
                        options.district = options.district || ($district.data('value') || $district.val() || '').toString();
                    }
                };
                var updateCode = function(){
                    country={},province={},city={},district={};
                    hasCity = false;       //判断是非有地级城市
                    for(var code in data){
                        if(code.match(/000000$/)){
                            country[code] = data[code];
                            if(options.required&&!options.country){
                                options.country = code;
                            }else if(isNaN(options.country)&&data[code].indexOf(options.country)>-1){
                                options.country = code;
                            }
                        }
                    }
                    if(options.country||code.match(/^[\dA-z]{6}$/)){
                        for(var code in data){
                            var prefix = code.replace(/[\dA-z]{6}$/,'000000');
                            if(code!=prefix&&prefix==options.country){
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
                        }
                    }
                    if(options.province){
                        for(var code in data){
                            var prefix = code.replace(/[\dA-z]{4}$/,'0000');
                            if(code!=prefix&&prefix==options.province){
                                if(code.match(/00$/)){
                                    hasCity = true;
                                    city[code]=data[code];
                                    if(options.required&&!options.city){
                                        options.city = code;
                                    }else if(isNaN(options.city)&&data[code].indexOf(options.city)>-1){
                                        options.city = code;
                                    }
                                }else if(code.match(/[89]0[\dA-z]{2}$/)){
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
                                var prefix = code.replace(/[\dA-z]{2}$/,'00');
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
                            var prefix = code.replace(/[\dA-z]{4}$/,'0000');
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
                    country:function(){
                        $country.empty();
                        if(!options.required){
                            $country.append('<option value="">'+options.placeholder+'</option>');
                        }
                        var list = [];
                        for(var i in country){
                            list.push({
                                'code':i,
                                'name':country[i]
                            });
                        }
                        list.sort(function(item1,item2){
                            return item1['name'].localeCompare(item2['name']);
                        });
                        list.forEach(function(item){
                            $country.append('<option value="'+(options.valueType=='code'?item['code']:item['name'])+'" data-code="'+item['code']+'">'+item['name']+'</option>');
                        });
                        if(options.country){
                            var value = options.valueType=='code'?options.country:country[options.country];
                            $country.val(value);
                        }
                        this.province();
                    },
                    province:function(){
                        $province.empty();
                        if(!options.required){
                            $province.append('<option value="">'+options.placeholder+'</option>');
                        }
                        var list = [];
                        for(var i in province){
                            list.push({
                                'code':i,
                                'name':province[i]
                            });
                        }
                        list.sort(function(item1,item2){
                            return item1['name'].localeCompare(item2['name']);
                        });
                        list.forEach(function(item){
                            $province.append('<option value="'+(options.valueType=='code'?item['code']:item['name'])+'" data-code="'+item['code']+'">'+item['name']+'</option>');
                        });
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
                            var list = [];
                            for(var i in city){
                                list.push({
                                    'code':i,
                                    'name':city[i]
                                });
                            }
                            list.sort(function(item1,item2){
                                return item1['name'].localeCompare(item2['name']);
                            });
                            list.forEach(function(item){
                                $city.append('<option value="'+(options.valueType=='code'?item['code']:item['name'])+'" data-code="'+item['code']+'">'+item['name']+'</option>');
                            });
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
                        var list = [];
                        for(var i in district){
                            list.push({
                                'code':i,
                                'name':district[i]
                            });
                        }
                        list.sort(function(item1,item2){
                            return item1['name'].localeCompare(item2['name']);
                        });
                        list.forEach(function(item){
                            $district.append('<option value="'+(options.valueType=='code'?item['code']:item['name'])+'" data-code="'+item['code']+'">'+item['name']+'</option>');
                        });
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
                        country:data[options.country]||'',
                        province:data[options.province]||'',
                        city:data[options.city]||'',
                        district:data[options.district]||'',
                        code:options.district||options.city||options.province||options.country
                    };
                    return status;
                };
                // 事件绑定
                $country.on('change',function(){
                    options.country = $(this).find('option:selected').data('code')||0; //选中节点的区划代码
                    options.province = 0;
                    options.city = 0;
                    options.district = 0;
                    updateCode();
                    format.province();
                    options.onChange(_api.getInfo());
                });
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
                format.country();
                if(options.code){
                    options.onChange(_api.getInfo());
                }
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