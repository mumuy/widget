/**
 * zepto.select.js 1.0
 * http://jquerywidget.com
 */
;(function($, window, document, undefined) {
    $.fn.select = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
			getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
			selectCls:'select',
			boxCls:'box',
			innerCls:'inner',
			listCls:'list',
			activeCls:'active',
			html:function(status){
				status.list.append("<li>"+status.item.text()+"</li>");
			},
			selected:function(){}
        };
		var options = $.extend({},defaults,parameter);
		var $window = $(window);
		var $document = $(document);
        return this.each(function(i) {
            //对象定义
			var _self = this;
            var $this = $(this);
            if($this.data('widget-type')=='select'){ //如果已调用过，则不进行初始化
            	return false;
            }else{
            	$this.data('widget-type','select');
            }
			var $inner = $("<div class='"+options.innerCls+"'></div>");
			var $list = $("<ul class='"+options.listCls+"'></ul>");
			var $box = $("<div class='"+options.boxCls+"'></div>");
			var $select = $("<div class='"+options.selectCls+"'></div>");
			$inner.append($list);
			$select.append($box).append($inner);
			$this.hide().after($select);
			var $options = $this.find('option');
			$options.each(function(){
				var $this = $(this);
				var status = {
					'list':$list,
					'item':$this
				};
				options.html(status);
			});
			var $items = $list.find('li');
			var _api = {};
			var _index = 0;
			var isShow = false;
			var _target = false; //触发标记，不论有多少个select实例，只展开一个
			//样式修改
			$select.css({
				'position':'relative'
			});
			$inner.css({
				'display':'none',
				'position':'absolute',
				'width':'100%'
			});
			//私有方法
        	//按键按下
        	var down = function(e){
        		if(isShow){
	        		e.isPropagationStopped();
	        		switch(e.keyCode){
	        			case 13:
							_api.value($options.eq(_index).val());
							isShow = false;
	        			break;
	        			case 38:
	        				if(_index>0){
	        					_index--;
	        					$items.eq(_index).addClass(options.activeCls).siblings().removeClass(options.activeCls);
	        				}
	        				e.preventDefault();
	        			break;
	        			case 40:
	        				if(_index<$items.length-1){
	        					_index++;
	        					$items.eq(_index).addClass(options.activeCls).siblings().removeClass(options.activeCls);
	        				}
	        				e.preventDefault();
	        			break;
	        		}
        		}
        	};
			//公有方法
			_api.value = function(value){
				$this.val(value);
				_index = $options.filter(function(){
					return $(this).prop('selected');
				}).index();
				var $item = $items.eq(_index);
				$box.html($item.html());
				$item.addClass(options.activeCls).siblings().removeClass(options.activeCls);
				$inner.hide();
				options.selected(value);
			};
			//事件绑定
			$box.click(function(){
				if(isShow){
					$inner.hide();
				}else{
					$inner.show();
					$items.eq(_index).addClass(options.activeCls).siblings().removeClass(options.activeCls);
				}
				isShow = !isShow;
				_target = true;
			});
			$items.on({
				'mouseenter':function(){
					$(this).addClass(options.activeCls).siblings().removeClass(options.activeCls);
				},
				'click':function(){
					_index = $(this).index();
					var $option = $options.eq(_index);
					_api.value($option.val());
				}
			});
			$document.click(function(){
				if(isShow&&!_target){
					$inner.hide();
					isShow = false;
				}
				_target = false;
			});
			$window.on({
				'keydown':down
			});
			//初始化
			_api.value($this.val());
			getApi(_api);
		});
    };
})(Zepto, window, document);
