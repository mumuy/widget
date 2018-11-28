/**
 * jquery.colorpicker.js 1.0
 * http://jquerywidget.com
 */
 ;(function (factory) {
    if (typeof define === "function" && (define.amd || define.cmd) && typeof jQuery == 'undefined'){
        // AMD或CMD
        define(['jquery'],function(){
            factory(jQuery);
            return jQuery;
        });
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
    $.fn.colorpicker = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
            id:'colorpicker',
            size: 'default',
            hoverChange:false,
            onChange: function() {
            },
            onSelect: function() {
            }
        };
        var options = $.extend({}, defaults, parameter);
        var $body = $('body');
        return this.each(function() {
            //对象定义
            var $this = $(this);
            var key = +new Date()+','+Math.random();
            $this.data('key',key);
            var $colorpicker = $('#'+options['id']);
            var _api = {};
            if(!$colorpicker.length){
                if(options['size']=='small'){
                    $colorpicker = $('<div id="'+options['id']+'">\
<table><thead><tr><td style="background: rgb(247, 151, 122); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="f7977a"></td><td style="background: rgb(251, 173, 130); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="fbad82"></td><td style="background: rgb(253, 198, 140); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="fdc68c"></td><td style="background: rgb(255, 247, 153); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="fff799"></td><td style="background: rgb(198, 223, 156); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="c6df9c"></td><td style="background: rgb(164, 212, 157); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="a4d49d"></td><td style="background: rgb(129, 202, 157); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="81ca9d"></td><td style="background: rgb(123, 205, 201); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="7bcdc9"></td></tr><tr><td style="background: rgb(108, 207, 247); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="6ccff7"></td><td style="background: rgb(124, 166, 216); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="7ca6d8"></td><td style="background: rgb(130, 147, 202); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="8293ca"></td><td style="background: rgb(136, 129, 190); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="8881be"></td><td style="background: rgb(162, 134, 189); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="a286bd"></td><td style="background: rgb(188, 140, 191); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="bc8cbf"></td><td style="background: rgb(244, 155, 193); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="f49bc1"></td><td style="background: rgb(245, 153, 157); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="f5999d"></td></tr><tr><td style="background: rgb(238, 29, 36); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="ee1d24"></td><td style="background: rgb(241, 101, 34); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="f16522"></td><td style="background: rgb(247, 148, 29); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="f7941d"></td><td style="background: rgb(255, 241, 0); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="fff100"></td><td style="background: rgb(143, 198, 61); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="8fc63d"></td><td style="background: rgb(55, 180, 74); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="37b44a"></td><td style="background: rgb(0, 166, 80); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="00a650"></td><td style="background: rgb(0, 169, 158); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="00a99e"></td></tr><tr><td style="background: rgb(0, 174, 239); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="00aeef"></td><td style="background: rgb(0, 114, 188); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="0072bc"></td><td style="background: rgb(0, 84, 165); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="0054a5"></td><td style="background: rgb(47, 49, 146); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="2f3192"></td><td style="background: rgb(101, 44, 145); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="652c91"></td><td style="background: rgb(145, 39, 143); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="91278f"></td><td style="background: rgb(237, 0, 140); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="ed008c"></td><td style="background: rgb(238, 16, 90); width: 14px; height: 14px; border: 1px solid rgb(0, 0, 0); cursor: pointer;" hx="ee105a"></td></tr></thead><tbody><tr><td style="border:1px solid #000;background:#fff;cursor:pointer;height:60px;-moz-background-clip:-moz-initial;-moz-background-origin:-moz-initial;-moz-background-inline-policy:-moz-initial;" colspan="16" align="center"><input style="color:#000;width:80px;border:1px solid rgb(0, 0, 0);padding:5px;background-color:#fff;font:11px Arial, Helvetica, sans-serif;" maxlength="7" value="#000000"/></td></tr></tbody></table>\
                </div>');
                }else{                
                    $colorpicker = $('<div id="'+options['id']+'">\
    <table><thead><tr><td style="background:#ff0000;" hx="ff0000"></td><td style="background:#ffff00" hx="ffff00"></td><td style="background:#00ff00" hx="00ff00"></td><td style="background:#00ffff" hx="00ffff"></td><td style="background:#0000ff" hx="0000ff"></td><td style="background:#ff00ff" hx="ff00ff"></td><td style="background:#ffffff" hx="ffffff"></td><td style="background:#ebebeb" hx="ebebeb"></td><td style="background:#e1e1e1" hx="e1e1e1"></td><td style="background:#d7d7d7" hx="d7d7d7"></td><td style="background:#cccccc" hx="cccccc"></td><td style="background:#c2c2c2" hx="c2c2c2"></td><td style="background:#b7b7b7" hx="b7b7b7"></td><td style="background:#acacac" hx="acacac"></td><td style="background:#a0a0a0" hx="a0a0a0"></td><td style="background:#959595" hx="959595"></td></tr><tr><td style="background:#ee1d24" hx="ee1d24"></td><td style="background:#fff100" hx="fff100"></td><td style="background:#00a650" hx="00a650"></td><td style="background:#00aeef" hx="00aeef"></td><td style="background:#2f3192" hx="2f3192"></td><td style="background:#ed008c" hx="ed008c"></td><td style="background:#898989" hx="898989"></td><td style="background:#7d7d7d" hx="7d7d7d"></td><td style="background:#707070" hx="707070"></td><td style="background:#626262" hx="626262"></td><td style="background:#555" hx="555"></td><td style="background:#464646" hx="464646"></td><td style="background:#363636" hx="363636"></td><td style="background:#262626" hx="262626"></td><td style="background:#111111" hx="111111"></td><td style="background:#000000" hx="000000"></td></tr><tr><td style="background:#f7977a" hx="f7977a"></td><td style="background:#fbad82" hx="fbad82"></td><td style="background:#fdc68c" hx="fdc68c"></td><td style="background:#fff799" hx="fff799"></td><td style="background:#c6df9c" hx="c6df9c"></td><td style="background:#a4d49d" hx="a4d49d"></td><td style="background:#81ca9d" hx="81ca9d"></td><td style="background:#7bcdc9" hx="7bcdc9"></td><td style="background:#6ccff7" hx="6ccff7"></td><td style="background:#7ca6d8" hx="7ca6d8"></td><td style="background:#8293ca" hx="8293ca"></td><td style="background:#8881be" hx="8881be"></td><td style="background:#a286bd" hx="a286bd"></td><td style="background:#bc8cbf" hx="bc8cbf"></td><td style="background:#f49bc1" hx="f49bc1"></td><td style="background:#f5999d" hx="f5999d"></td></tr><tr><td style="background:#f16c4d" hx="f16c4d"></td><td style="background:#f68e54" hx="f68e54"></td><td style="background:#fbaf5a" hx="fbaf5a"></td><td style="background:#fff467" hx="fff467"></td><td style="background:#acd372" hx="acd372"></td><td style="background:#7dc473" hx="7dc473"></td><td style="background:#39b778" hx="39b778"></td><td style="background:#16bcb4" hx="16bcb4"></td><td style="background:#00bff3" hx="00bff3"></td><td style="background:#438ccb" hx="438ccb"></td><td style="background:#5573b7" hx="5573b7"></td><td style="background:#5e5ca7" hx="5e5ca7"></td><td style="background:#855fa8" hx="855fa8"></td><td style="background:#a763a9" hx="a763a9"></td><td style="background:#ef6ea8" hx="ef6ea8"></td><td style="background:#f16d7e" hx="f16d7e"></td></tr><tr><td style="background:#ee1d24" hx="ee1d24"></td><td style="background:#f16522" hx="f16522"></td><td style="background:#f7941d" hx="f7941d"></td><td style="background:#fff100" hx="fff100"></td><td style="background:#8fc63d" hx="8fc63d"></td><td style="background:#37b44a" hx="37b44a"></td><td style="background:#00a650" hx="00a650"></td><td style="background:#00a99e" hx="00a99e"></td><td style="background:#00aeef" hx="00aeef"></td><td style="background:#0072bc" hx="0072bc"></td><td style="background:#0054a5" hx="0054a5"></td><td style="background:#2f3192" hx="2f3192"></td><td style="background:#652c91" hx="652c91"></td><td style="background:#91278f" hx="91278f"></td><td style="background:#ed008c" hx="ed008c"></td><td style="background:#ee105a" hx="ee105a"></td></tr><tr><td style="background:#9d0a0f" hx="9d0a0f"></td><td style="background:#a1410d" hx="a1410d"></td><td style="background:#a36209" hx="a36209"></td><td style="background:#aba000" hx="aba000"></td><td style="background:#588528" hx="588528"></td><td style="background:#197b30" hx="197b30"></td><td style="background:#007236" hx="007236"></td><td style="background:#00736a" hx="00736a"></td><td style="background:#0076a4" hx="0076a4"></td><td style="background:#004a80" hx="004a80"></td><td style="background:#003370" hx="003370"></td><td style="background:#1d1363" hx="1d1363"></td><td style="background:#450e61" hx="450e61"></td><td style="background:#62055f" hx="62055f"></td><td style="background:#9e005c" hx="9e005c"></td><td style="background:#9d0039" hx="9d0039"></td></tr><tr><td style="background:#790000" hx="790000"></td><td style="background:#7b3000" hx="7b3000"></td><td style="background:#7c4900" hx="7c4900"></td><td style="background:#827a00" hx="827a00"></td><td style="background:#3e6617" hx="3e6617"></td><td style="background:#045f20" hx="045f20"></td><td style="background:#005824" hx="005824"></td><td style="background:#005951" hx="005951"></td><td style="background:#005b7e" hx="005b7e"></td><td style="background:#003562" hx="003562"></td><td style="background:#002056" hx="002056"></td><td style="background:#0c004b" hx="0c004b"></td><td style="background:#30004a" hx="30004a"></td><td style="background:#4b0048" hx="4b0048"></td><td style="background:#7a0045" hx="7a0045"></td><td style="background:#7a0026" hx="7a0026"></td></tr></thead><tbody><tr><td style="border:1px solid #000;background:#fff;cursor:pointer;height:60px;-moz-background-clip:-moz-initial;-moz-background-origin:-moz-initial;-moz-background-inline-policy:-moz-initial;" colspan="16" align="center"><input style="color:#000;width:80px;border:1px solid #333;padding:5px;background:rgba(255,255,255,.6);font:11px Arial, Helvetica, sans-serif;" maxlength="7" value="#000000"/></td></tr></tbody></table>\
                    </div>');
                }
                $body.append($colorpicker);
                $colorpicker.css({
                    'display':'none',
                    'position':'absolute',
                    'z-index':'999',
                    'border':'1px solid rgb(204, 204, 204)',
                    'background':'rgb(51, 51, 51)',
                    'padding':'5px'
                });
                if(options['size']=='small'){
                    $colorpicker.find('thead td').css({
                        'width':'30px',
                        'height':'20px',
                        'border':'1px solid rgb(0, 0, 0)',
                        'cursor':'pointer'
                    });
                }else{
                    $colorpicker.find('thead td').css({
                        'width':'14px',
                        'height':'14px',
                        'border':'1px solid rgb(0, 0, 0)',
                        'cursor':'pointer'
                    });
                }
                $colorpicker.find('tbody td').css({
                    'border':'1px solid rgb(0, 0, 0)',
                    'background':'rgb(0, 0, 0)',
                    'cursor':'pointer',
                    'height':'50px',
                    'width':'12px'
                });
            }
            $this.on('click focus',function(){
                var $input = $(this);
                var color = $input.val();
                var position = $input.offset();
                var height = $input.height();
                $colorpicker.find('input').val(color).parent().css({
                    'background':color
                });
                $colorpicker.fadeIn().css({
                    'display':'block',
                    'top':position.top+height+3,
                    'left':position.left
                });
                $colorpicker.data('key',key);
                return false;
            });
            $colorpicker.on('mouseenter','thead td',function(){
                var $td = $(this);
                var color = '#'+$td.attr('hx');
                $colorpicker.find('input').val(color).parent().css({
                    'background':color
                });
                if($colorpicker.data('key')==$this.data('key')){  //防止多个实例化对象冲突
                    options.onChange(color);
                    if(options.hoverChange){
                        $this.val(color).trigger('change');
                    }
                }
            });
            var hander = null;
            $colorpicker.on('keydown','input',function(){
                hander&&clearTimeout(hander);
            });
            $colorpicker.on('keyup','input',function(){
                var $input = $(this);
                var color = $input.val();
                hander&&clearTimeout(hander);
                hander = setTimeout(function(){
                    if(color.length==4||color.length==7){
                        $input.parent().css({
                            'background':color
                        });
                        if($colorpicker.data('key')==$this.data('key')){  //防止多个实例化对象冲突
                            options.onChange(color);
                            options.onSelect(color);
                            $this.val(color).trigger('change');
                        }
                    }
                },500);
            });
            $colorpicker.on('click','thead td',function(){
                var $td = $(this);
                var color = '#'+$td.attr('hx');
                $colorpicker.find('input').val(color).parent().css({
                    'background':color
                });
                if($colorpicker.data('key')==$this.data('key')){  //防止多个实例化对象冲突
                    options.onSelect(color);
                    $this.val(color).trigger('change');
                }
                $colorpicker.fadeOut();
            });
            $body.on('click',function(e){
                if(!$(e.target).closest('#'+options['id']).length){
                    $colorpicker.fadeOut();
                }
            });
        });
    };
}));
