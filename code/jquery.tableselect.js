/**
 * jquery.tableselect.js 1.1
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
    $.fn.tableselect = function (parameter, getApi) {
        if (typeof parameter == 'function') { //重载
            getApi = parameter;
            parameter = {};
        } else {
            parameter = parameter || {};
            getApi = getApi || function () { };
        }
        var defaults = {
            disabledCls: 'disabled',         // 不可选中的class
            selectedCls: 'selected',         // 已选择的class
            selectingCls: 'selecting',       // 正在选择的class
            direction: 'default',            // 选择的方向 
            onSelectStart: function () {     // 选中范围前
            },
            onSelectEnd: function () {       // 选中范围后
            },
            onSelecting: function () {          // 选中变化时
            }
        };
        var options = $.extend({}, defaults, parameter);
        return this.each(function () {
            var $table = $(this);
            var $tbody = $table.find('tbody');
            var $trs = $tbody.find('tr');
            var $tds = $tbody.find('td');
            $table.css({ 
                'user-select': 'none'
            });
            // 初始化
            var _range = null;
            var _selectedRange = null;
            var _api = {};
            var tdMap = [];
            $trs.each(function (tr_index) {
                tdMap[tr_index] = [];
            });
            $trs.each(function (tr_index) {
                var $tr = $(this);
                $tr.find('th,td').each(function (th_index) {
                    var $td = $(this);
                    var rowspan = +$td.attr('rowspan') || 1;
                    var colspan = +$td.attr('colspan') || 1;
                    for (var m = 0; m < tdMap[tr_index].length; m++) {
                        if (typeof tdMap[tr_index][m] == 'undefined') {
                            break;
                        }
                    }
                    $td.attr('data-from', (m) + ':' + (tr_index));
                    for (var i = 0; i < rowspan; i++) {
                        for (var j = 0; j < colspan; j++) {
                            tdMap[tr_index + i][m + j] = tr_index + ',' + th_index;
                            $td.attr('data-to',  (m + j)+ ':' + (tr_index + i));
                        }
                    } 
                });
            });
            // 判断小范围是否在大范围内
            var isInRange = function (child_range, parent_range) {
                var range = { 'from': [], 'to': [] };
                range['from'][0] = Math.min(parent_range['from'][0], parent_range['to'][0]);
                range['from'][1] = Math.min(parent_range['from'][1], parent_range['to'][1]);
                range['to'][0] = Math.max(parent_range['from'][0], parent_range['to'][0]);
                range['to'][1] = Math.max(parent_range['from'][1], parent_range['to'][1]);
                // 左上
                if (child_range['from'][0] >= range['from'][0] && child_range['from'][1] >= range['from'][1] && child_range['from'][0] <= range['to'][0] && child_range['from'][1] <= range['to'][1]) {
                    return true;
                    // 右下
                } else if (child_range['to'][0] >= range['from'][0] && child_range['to'][1] >= range['from'][1] && child_range['to'][0] <= range['to'][0] && child_range['to'][1] <= range['to'][1]) {
                    return true;
                    // 左下
                } else if (child_range['to'][0] >= range['from'][0] && child_range['from'][1] >= range['from'][1] && child_range['to'][0] <= range['to'][0] && child_range['from'][1] <= range['to'][1]) {
                    return true;
                    // 右上
                } else if (child_range['from'][0] >= range['from'][0] && child_range['to'][1] >= range['from'][1] && child_range['from'][0] <= range['to'][0] && child_range['to'][1] <= range['to'][1]) {
                    return true;
                } else {
                    return false;
                }
            };
            // 获取从大范围排除小范围后的范围
            var getRemainRange = function (child_range, parent_range) {
                var left = Math.min(child_range['from'][0], child_range['to'][0]);
                var top = Math.min(child_range['from'][1], child_range['to'][1]);
                var right = Math.max(child_range['from'][0], child_range['to'][0]);
                var bottom = Math.max(child_range['from'][1], child_range['to'][1]);
                // 上方
                if (parent_range['from'][0] == parent_range['to'][0] && parent_range['from'][1] > parent_range['to'][1]) {
                    console.log('[上方]');
                    return {
                        'from':parent_range['from'],
                        'to':[left,buttom+1]
                    };
                // 下方
                }else if (parent_range['from'][0] == parent_range['to'][0] && parent_range['from'][1] < parent_range['to'][1]) {
                    console.log('[下方]');
                    return {
                        'from':parent_range['from'],
                        'to':[left,top-1]
                    };
                // 左方
                }else if (parent_range['from'][0] > parent_range['to'][0] && parent_range['from'][1] == parent_range['to'][1]) {
                    console.log('[左方]');
                    return {
                        'from':parent_range['from'],
                        'to':[right+1,top]
                    };
                // 右方
                }else if (parent_range['from'][0] < parent_range['to'][0] && parent_range['from'][1] == parent_range['to'][1]) {
                    console.log('[右方]');
                    return {
                        'from':parent_range['from'],
                        'to':[left-1,top]
                    };
                // 右上
                }else if (parent_range['from'][0] < parent_range['to'][0] && parent_range['from'][1] < parent_range['to'][1]) {
                    console.log('[右上]');
                    return {
                        'from':parent_range['from'],
                        'to':[left-1,bottom+1]
                    };
                // 左上
                } else if (parent_range['from'][0] > parent_range['to'][0] && parent_range['from'][1] < parent_range['to'][1]) {
                    console.log('[左上]');
                    return {
                        'from':parent_range['from'],
                        'to':[right+1,bottom+1]
                    };
                // 右下
                } else if (parent_range['from'][0] < parent_range['to'][0] && parent_range['from'][1] > parent_range['to'][1]) {
                    console.log('[右下]');
                    return {
                        'from':parent_range['from'],
                        'to':[left-1,top-1]
                    };
                // 左下
                } else if (parent_range['from'][0] > parent_range['to'][0] && parent_range['from'][1] > parent_range['to'][1]) {
                    console.log('[左下]');
                    return {
                        'from':parent_range['from'],
                        'to':[right+1,top-1]
                    };
                } else {
                    return null;
                }
            };
            var selectRange = function (param, callback) {
                var callback = callback || function () { };
                var cellList = [];
                var from = param.from;
                var to = param.to;
                if (options.direction == 'row') {
                    to[0] = from[0];
                } else if (options.direction == 'col') {
                    to[1] = from[1];
                }
                var selected_range = { from: from, to: to };
                var $abledTds = $tds.filter(function () {
                    return !$(this).hasClass(options.disabledCls);
                });
                var $disabledTds = $tds.filter(function () {
                    return $(this).hasClass(options.disabledCls);
                });
                // 动态判断限制范围
                var limit_range = options.onSelecting(selected_range);
                if(limit_range){
                    selected_range = limit_range;
                }
                console.log('[selected_range#a]',JSON.stringify(selected_range));
                // 遇到不可选单元格的处理
                $disabledTds.each(function(){
                    var $temp = $(this);
                    var t_fromKey = $temp.data('from');
                    var t_toKey = $temp.data('to');
                    var t_from = t_fromKey.split(':').map(function (value) { return +value; });
                    var t_to = t_toKey.split(':').map(function (value) { return +value; });
                    let child_range = { from: t_from, to: t_to };
                    if(isInRange(child_range,selected_range)){
                        selected_range = getRemainRange(child_range,selected_range);
                    }
                });
                console.log('[selected_range#b]',JSON.stringify(selected_range));
                // 遇到夸行或跨列单元格的处理
                var getOuterRange = function (range) {
                    $abledTds.each(function () {
                        var $temp = $(this);
                        var t_fromKey = $temp.data('from');
                        var t_toKey = $temp.data('to');
                        var t_from = t_fromKey.split(':').map(function (value) { return +value; });
                        var t_to = t_toKey.split(':').map(function (value) { return +value; });
                        if (isInRange({ from: t_from, to: t_to }, range)) {
                            cellList.push({
                                'from': t_from,
                                'to': t_to,
                            });
                        }
                    });
                    var outer_from = [Math.min.apply(null, cellList.map(function (item) {
                        return item['from'][0];
                    })), Math.min.apply(null, cellList.map(function (item) {
                        return item['from'][1];
                    }))];
                    var outer_to = [Math.max.apply(null, cellList.map(function (item) {
                        return item['to'][0];
                    })), Math.max.apply(null, cellList.map(function (item) {
                        return item['to'][1];
                    }))];
                    return {
                        from: outer_from,
                        to: outer_to
                    };
                };
                var outer_range = getOuterRange(selected_range);
                while (outer_range['from'][0] != selected_range['from'][0] || outer_range['from'][1] != selected_range['from'][1] || outer_range['to'][0] != selected_range['to'][0] || outer_range['to'][1] != selected_range['to'][1]) {
                    selected_range = outer_range;
                    outer_range = getOuterRange(selected_range);
                }
                $abledTds.each(function () {
                    var $temp = $(this);
                    var t_fromKey = $temp.data('from');
                    var t_toKey = $temp.data('to');
                    var t_from = t_fromKey.split(':').map(function (value) { return +value; });
                    var t_to = t_toKey.split(':').map(function (value) { return +value; });
                    if (param.className) {
                        if (isInRange({ from: t_from, to: t_to }, outer_range)) {
                            $temp.addClass(param.className);
                        } else if (param.isRemove) {
                            $temp.removeClass(param.className);
                        }
                    }
                });
                callback(outer_range);
            };
            _api.mergeCells = function (param, callback) {
                var callback = callback || function () { };
                selectRange({
                    from: param['from'],
                    to: param['to'],
                }, function (parent_range) {
                    var $itemList = $('');
                    var htmlArr = [];
                    $tds.each(function () {
                        var $temp = $(this);
                        var t_fromKey = $temp.data('from');
                        var t_toKey = $temp.data('to');
                        var child_range = {
                            from: t_fromKey.split(':').map(function (value) { return +value; }),
                            to: t_toKey.split(':').map(function (value) { return +value; })
                        };
                        if (isInRange(child_range, parent_range)) {
                            if (!$itemList.length) {
                                var colspan = parent_range['to'][0] - parent_range['from'][0] + 1;
                                var rowspan = parent_range['to'][1] - parent_range['from'][1] + 1;
                                var className = $temp.attr('class');
                                $itemList = $('<td class="' + className + '" rowspan="' + rowspan + '" colspan="' + colspan + '" data-from="' + parent_range['from'].join(':') + '" data-to="' + parent_range['to'].join(':') + '"></td>');
                                $temp.before($itemList);
                            }
                            htmlArr.push($temp.html());
                            $temp.remove();
                        }
                    });
                    $itemList.html(htmlArr.join(''));
                    callback($itemList);
                    $tds = $tbody.find('td').filter(function () {
                        return !$(this).hasClass(options.disabledCls);
                    });
                });
            };
            _api.splitCells = function (param, callback) {
                var callback = callback || function () { };
                selectRange({
                    from: param['from'],
                    to: param['to'],
                }, function (parent_range) {
                    var $itemList = $('');
                    $tds.each(function () {
                        var $temp = $(this);
                        var t_fromKey = $temp.data('from');
                        var t_toKey = $temp.data('to');
                        var child_range = {
                            from: t_fromKey.split(':').map(function (value) { return +value; }),
                            to: t_toKey.split(':').map(function (value) { return +value; })
                        };
                        if (isInRange(child_range, parent_range)) {
                            if (child_range['from'][0] == child_range['to'][0] && child_range['from'][1] == child_range['to'][1]) {
                                $itemList.push($temp[0]);
                            } else {
                                var htmlStr = $temp.html();
                                var className = $temp.attr('class');
                                $trs.each(function (tr_index) {
                                    if (tr_index >= child_range['from'][1] && tr_index <= child_range['to'][1]) {
                                        var td_index_max = Math.max(child_range['from'][0], child_range['to'][0]);
                                        var isFirst = false;
                                        var $tr = $(this);
                                        $tr.find('td').each(function () {
                                            var $td = $(this);
                                            var td_fromKey = $td.data('from');
                                            var td_toKey = $td.data('to');
                                            var td_from = td_fromKey.split(':').map(function (value) { return +value; });
                                            var td_to = td_toKey.split(':').map(function (value) { return +value; });
                                            var td_index_min = Math.min(td_from[0], td_to[0]);
                                            if (td_index_max < td_index_min && !isFirst) {
                                                isFirst = true;
                                                for (var td_index = child_range['from'][0]; td_index <= child_range['to'][0]; td_index++) {
                                                    var $newItem = $('<td class="' + className + '" data-from="' + (tr_index + ':' + td_index) + '" data-to="' + (tr_index + ':' + td_index) + '"></td>');
                                                    $td.before($newItem);
                                                    if (!$itemList.length) {
                                                        $newItem.html(htmlStr);
                                                    }
                                                    $itemList.push($newItem[0]);
                                                }
                                            }
                                        });
                                        if (!isFirst) {
                                            for (var td_index = child_range['from'][0]; td_index <= child_range['to'][0]; td_index++) {
                                                var $newItem = $('<td class="' + className + '" data-from="' + (tr_index + ':' + td_index) + '" data-to="' + (tr_index + ':' + td_index) + '"></td>');
                                                $tr.append($newItem);
                                                if (!$itemList.length) {
                                                    $newItem.html(htmlStr);
                                                }
                                                $itemList.push($newItem[0]);
                                            }
                                        }
                                    }
                                });
                                $temp.remove();
                            }
                        }
                    });
                    callback($itemList);
                    $tds = $tbody.find('td').filter(function () {
                        return !$(this).hasClass(options.disabledCls);
                    });
                });
            };
            _api.getSelectedRange = function(){
                return _selectedRange;
            };
            _api.getSelectedCells = function(){
                return $tds.filter(function () {
                    return $(this).hasClass(options.selectedClsCls);
                });
            };
            // 事件绑定
            $tbody.on('click', 'td', function () {
                var $td = $(this);
                if ($td.hasClass(options.disabledCls)) {
                    return false;
                }
                var fromKey = $td.data('from') || '';
                var toKey = $td.data('to') || '';
                var from = fromKey.split(':').map(function (value) { return +value; });
                var to = toKey.split(':').map(function (value) { return +value; });
                _selectedRange = null;
                if (!_range || !_range['isSelecting']) {
                    _range = {
                        from: from,
                        to: to,
                        isSelecting: true
                    };
                    $tds.removeClass(options.selectedCls);
                    $td.addClass(options.selectingCls);
                    options.onSelectStart(from, to);
                } else {
                    _range['to'] = to;
                    _range['isSelecting'] = false;
                    $tds.removeClass(options.selectingCls);
                    selectRange({
                        from: _range['from'],
                        to: _range['to'],
                        className: options.selectedCls,
                        isRemove: false
                    }, function(range){
                        _selectedRange = range;
                        options.onSelectEnd(range);
                    });
                }
            });
            $tbody.on('mouseenter', 'td', function () {
                var $td = $(this);
                var toKey = $td.data('to');
                var to = toKey.split(':').map(function (value) { return +value; });
                if (_range) {
                    if (_range['isSelecting']) {
                        selectRange({
                            from: _range['from'],
                            to: to,
                            className: options.selectingCls,
                            isRemove: true
                        });
                    }
                }
            });
            getApi(_api);
        });
    };
}));

