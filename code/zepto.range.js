/**
 * zepto.range.js 1.0
 * http://jquerywidget.com
 */
;(function($, window, document, undefined) {
    $.fn.range = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
        	getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
			valueCls: 'value',		//当前有效值范围显示class
			handleCls: 'handle',	//拖动滑块class
			min: 0,					//变化范围的最小值
			max: 100,				//变化范围的最大值
			value: 1,				//默认显示的值
			steps: 1,				//每次移动的步长
			type:'outer',           //outer进度计算以进度条宽为准，inner进度计算需扣除条滑块宽
			onSlide: function(){},	//当前值变化时触发的事件，传入对象:event为事件,value为当前值
			onChange: function(){}    //当前值变化后触发的事件，传入对象:event为事件,value为当前值
        };
		var options = $.extend({},defaults,parameter);
		var $window = $(window);
		var $document = $(document);
		var $body = $("body");
        return this.each(function() {
            //对象定义
			var _self = this;
            var $this = $(this);
			var $value = $("<div class='"+options.valueCls+"'></div>").appendTo($this);
			var $handle = $("<div class='"+options.handleCls+"'></div>").appendTo($this);
			//全局变量
			var _api = {};
			var _value = options.value;
			var _handle_width = $handle.width();
			var _offset = 0;
			var _width = options.type=='outer'?$this.width():$this.width()-_handle_width;
			var _length = _width/(options.max - options.min); 	//单元宽度
			var _cursor_position = $this.offset().left;			//鼠标位置
			var isMouseDown = false;
			//样式初始化
			$this.css({
				'position':'relative'
			});
			$value.css({
				'height':'100%'
			});
			$handle.css({
				'position':'absolute'
			});
			/****** 共有方法 ******/
			//移动到指定值
			_api.setValue = function(value){
				_value = value||_value;
				_value = Math.min(_value,options.max);
				_value = Math.max(_value,options.min);
				$value.css({
					'width':(_value-options.min)*_length
				});
				$handle.css({
					'left':(_value-options.min)*_length
				});
				options.onSlide({event:{},value:_value});
			};
			//重置插件尺寸
			_api.resize = function(){
				_width = options.type=='outer'?$this.width():$this.width()-_handle_width;
				_length = _width/(options.max - options.min);
				_api.setValue();
			};
			/*私有方法*/
			var touchStart = function(e) {
                isMouseDown = true;
                _offset = $this.offset().left;
				_cursor_position =e.changedTouches[0].pageX-_offset-$handle.position().left;
            };
			var touchMove = function(e){
				stopBubble(e);
				stopDefault(e);
				if(isMouseDown){
					var move = e.changedTouches[0].pageX - _offset;
					if(_cursor_position>0&&_cursor_position<_handle_width){   //鼠标在手柄中位置，对值的修正
						move -=_cursor_position;
					}
					move = Math.max(0,move);
					move = Math.min(move,_width);
					$value.css({
						'width':move
					});
					$handle.css({
						'left':move
					});
					_value = Math.round(move/(_length*options.steps))*options.steps+options.min;
					options.onSlide({event:e,value:_value});
				}
			};
			var touchEnd = function(e){
				if(isMouseDown){
					isMouseDown = false;
					setSelectable($body,true);
					_api.setValue();
					options.onChange({event:e,value:_value});
				}
			};
			//事件绑定
			if(_self.addEventListener){
                _self.addEventListener("touchstart", touchStart);
                _self.addEventListener("touchmove", touchMove);
                _self.addEventListener("touchend", touchEnd);
            }
			$this.on({
				mousedown:function(e){
					isMouseDown = true;
					_offset = $this.offset().left;
					_cursor_position = e.pageX-_offset-$handle.position().left;
					setSelectable($body,false);
				},
				mouseup:function(e){
					if(isMouseDown){
						isMouseDown = false;
						setSelectable($body,true);
						var move = e.pageX - _offset;
						if(_cursor_position>0&&_cursor_position<_handle_width){   //鼠标在手柄中位置，对值的修正
							move -=_cursor_position;
						}
						_value = Math.round(move/(_length*options.steps))*options.steps+options.min;
						_api.setValue();
						options.onSlide({event:e,value:_value});
						options.onChange({event:e,value:_value});
					}
				}
			});
			$document.on({
				mousemove:function(e){
					if(isMouseDown){
						var move = e.pageX - _offset;
						if(_cursor_position>0&&_cursor_position<_handle_width){   //鼠标在手柄中位置，对值的修正
							move -=_cursor_position;
						}
						move = Math.max(0,move);
						move = Math.min(move,_width);
						$value.css({
							'width':move
						});
						$handle.css({
							'left':move
						});
						_value = Math.round(move/(_length*options.steps))*options.steps+options.min;
						options.onSlide({event:e,value:_value});
					}
				},
				mouseup:function(e){
					if(isMouseDown){
						isMouseDown = false;
						setSelectable($body,true);
						_api.setValue();
						options.onChange({event:e,value:_value});
					}
				}
			});
			$window.on('resize',_api.resize);
			//初始化
			_api.setValue(_value);
			getApi(_api);
        });
		//工具函数
		function stopBubble(e){
			if (e && e.stopPropagation) {
				e.stopPropagation();
			}else if (window.event) {
				window.event.cancelBubble = true;
			}
		}
		function stopDefault(e) {
			if ( e && e.preventDefault ){
				e.preventDefault();
			}else{
				 window.event.returnValue = false;
			}
			return false;
		}
		function setSelectable(obj, enabled) {
			if(enabled) {
				obj.removeAttr("unselectable").removeAttr("onselectstart").css("user-select", "");
			} else {
				obj.attr("unselectable", "on").attr("onselectstart", "return false;").css("user-select", "none");
			}
		}
    };
})(Zepto, window, document);
