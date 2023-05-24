/**
 * jquery.tablefixed.js 1.0
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
                var jQuery = require('jquery');
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
    $.fn.tablefixed = function (parameter, getApi) {
        if (typeof parameter == 'function') { //重载
            getApi = parameter;
            parameter = {};
        } else {
            parameter = parameter || {};
            getApi = getApi || function () { };
        }
        var defaults = {
            prefix: 'widget',         // 样式前缀
            fixedColumnCount:1
        };
        var options = $.extend({}, defaults, parameter);
        var $window = $(window);
        return this.each(function () {
            var $outer = $(this);
            var $table = $outer.find('table');
            $table.wrap('<div class="'+options.prefix+'-fixed-body"></div>');
            var $fixed_corner = $('<div class="'+options.prefix+'-fixed-corner"></div>').appendTo($outer);
            var $fixed_header = $('<div class="'+options.prefix+'-fixed-header"></div>').appendTo($outer);
            var $fixed_column = $('<div class="'+options.prefix+'-fixed-column"></div>').appendTo($outer);
            var tableCSS = {
                'position':'absolute',
                'top':0,
                'left':0,
                'z-index':99,
                'background':'#fff',
                'overflow':'hidden'
            };
            $fixed_corner.css(Object.assign({},tableCSS,{
                'z-index':99,
            }));
            $fixed_header.css(Object.assign({},tableCSS,{
                'z-index':98,
            }));
            $fixed_column.css(Object.assign({},tableCSS,{
                'z-index':97,
            }));
            $outer.css({
                'position':'relative',
                'overflow':'auto'
            });
        
            var reset = function(){
                var border_width = parseInt($table.find('th,td').css('border-width')) + parseInt($table.css('border-spacing'))*2;
                var thead_height = $table.find('thead').outerHeight(true)+border_width;
                var thead_width = border_width;
                $table.find('thead').find('td,th').each(function(index){
                    if(index<options.fixedColumnCount){
                        thead_width += $(this).outerWidth(true);
                    }
                });
                $fixed_corner.html($table.clone()).width(thead_width).height(thead_height);
                $fixed_header.html($table.clone()).height(thead_height);
                $fixed_column.html($table.clone()).width(thead_width);
            };

            $outer.scroll(function(){
                var scroll_left = $outer.scrollLeft();
                var scroll_top = $outer.scrollTop();
                $fixed_column.css('left',scroll_left);
                $fixed_header.css('top',scroll_top);
                $fixed_corner.css('left',scroll_left).css('top',scroll_top);
            });
            $window.resize(reset);

            reset();
            getApi();
        });
    };
}));