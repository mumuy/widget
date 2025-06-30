/**
 * jquery.tablesort.js 1.0
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
    $.fn.tablesort = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
			getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
            /* 节点绑定 */
            sortCls: 'sortabled',       // 排序的class
            ascCls:'sort-asc',          // 升序
            descCls:'sort-desc',        // 降序
            activeCls:'active',
            firstSort:'asc',            // 第1次点击的时候默认排序
            onSortEnd: function() {     // 排序后触发
            }
        };
        var options = $.extend({}, defaults, parameter);
        return this.each(function() {
            var $table = $(this);
            var thMap = [];
            var thHash = {};
            $table.find('thead tr').each(function(tr_index){
                thMap[tr_index] = []; 
            });
            $table.find('thead tr').each(function(tr_index){
                var $tr = $(this);
                $tr.find('th,td').each(function(th_index){
                    var $th = $(this);
                    var rowspan = +$th.attr('rowspan')||1;
                    var colspan = +$th.attr('colspan')||1;
                    for(var m=0;m<thMap[tr_index].length;m++){
                        if(typeof thMap[tr_index][m]=='undefined'){
                            break;
                        }
                    }
                    for(var i=0;i<rowspan;i++){
                        for(var j=0;j<colspan;j++){
                            thMap[tr_index+i][m+j] = tr_index+','+th_index;
                            thHash[tr_index+','+th_index] = {
                                'row':tr_index+i,
                                'col':m+j,
                                'item':$th
                            };
                        }
                    }
                });
            });
            var _api = {};
            _api.sortByIndex = function(index,type){
                var type = type||'asc';
                var $bd_tbody = $table.find('tbody');
                $bd_tbody.find('td').removeClass(options.activeCls).filter(':nth-child('+(index+1)+')').addClass(options.activeCls);
                var $items = $bd_tbody.find('tr');
                var $temps = $items.clone();
                var list = $.map($items,function(item,i){
                    var $item = $(item);
                    var value = $item.find('td').eq(index).attr('data-value')||0;
                    return {
                        'index':i,
                        'value':value
                    };
                });
                var $th = null;
                for(let key in thHash){
                    let item = thHash[key];
                    if(item['col']==index){
                        $th = item['item'];
                    }
                }
                $table.find('th').removeClass(options.descCls).removeClass(options.ascCls);
                if(type=='asc'){
                    $th.addClass(options.ascCls);
                    list.sort(function(item1,item2){
                        if(isNaN(item1['value'])||isNaN(item2['value'])){
                            return item1['value'].toString().localeCompare(item2['value'].toString());
                        }else{
                            return item1['value']-item2['value'];
                        }
                    });
                }else{
                    $th.addClass(options.descCls);
                    list.sort(function(item1,item2){
                        if(isNaN(item1['value'])||isNaN(item2['value'])){
                            return item2['value'].toString().localeCompare(item1['value'].toString());
                        }else{
                            return item2['value']-item1['value'];
                        }
                    });
                }
                $bd_tbody.append($temps);
                $temps.each(function(index){
                    var $this = $(this);
                    var $temp = $items.eq(list[index]['index']);
                    $this.replaceWith($temp);
                });
            };
            $table.on('click','thead th.'+options.sortCls,function(){
                var $th = $(this);
                var $tr = $th.parent();
                var tr_index = $tr.index();
                var th_index = $th.index();
                var hash = thHash[tr_index+','+th_index];
                var type = options.firstSort;
                if($th.hasClass(options.descCls)){
                    type = 'asc';
                }else if($th.hasClass(options.ascCls)){
                    type = 'desc';
                }
                _api.sortByIndex(hash['col'],type);
                options.onSortEnd(th_index,type);
            });
            getApi(_api);
        });
    };
}));