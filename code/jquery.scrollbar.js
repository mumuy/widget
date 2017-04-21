/**
 * jquery.scrollbar.js 1.0
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
	$.fn.scrollbar = function(parameter,getApi){
        if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
		var defaults = {
			contentCls: "content",		//内容区的class
			trackCls: "track",			//滑块的class
			direction: "y",				//滚动条的方向
			steps:50,					//滚动鼠标中轴的单位
			touchable:true, 			//是否允许触摸操作
			autoReset:true,				//窗体变化是否重置
			inEndEffect:false,			//滚轴到底时事件是否冒泡给页面
			slide:0						//默认移动的距离
		};
		var options = $.extend({},defaults,parameter);
		var $body = $("body");
		var $document = $(document);
		return this.each(function(){
			/*对象定义*/
			var $this = $(this);
			var $content = $this.find("."+options.contentCls);
			var $track = $this.find("."+options.trackCls);
			var $thumb = $track.children();
			/*全局变量*/
			var _self = this;
			var _api = {};
			var _track_offset = 0;																//滚动条的位置
			var _content_position = 0;															//滑块当前相对于滚动条的位置
			var _cursor_position = 0;															//鼠标的位置
			var _start = {};																		//鼠标的起始位置
			var isMouseDown = false;
			var _track_length,_content_length,_box_length,_thumb_length,_distance,_room;
			/*样式初始化*/
			$this.css({'position':'relative','overflow':'hidden'});
			$content.css({'position':'absolute'});
			$thumb.css({'position':'absolute'});
			/****** 共有方法 ******/
			//滚动到指定位置
			_api.slide = function(move){
				if(move>_room){ //对滚轴移动范围做限制
					move = _room;
				}else if(move<0){
					move = 0;
				}
				if(_room>=0){
					$thumb.css(options.direction=="y"?'top':'left', move*_api.ratio + "px");
					$content.css(options.direction=="y"?'top':'left', -move + "px");
				}
			};
			//重置滚动条参数
			_api.resize = function(){
				if(options.direction=="x"){
					var width = 0;
					$content.children().each(function(){
						var $this = $(this);
						$this.removeAttr('style').css({'width':$this.width()+'px'});
						width +=  $this.outerWidth(true);
					});
					$content.css({'width':width+'px'});
				}
				$track.show();
				_track_length = options.direction=="y"?$track.height():$track.width();
				_content_length = options.direction=="y"?$content.height():$content.width();
				_box_length = options.direction=="y"?$this.height():$this.width();
				_thumb_length = _box_length/_content_length*_track_length;
				_distance = Math.max(_track_length-_thumb_length,0);
				_room = Math.max(_content_length-_box_length,0);
				if(_content_length>_box_length){
					$thumb.css(options.direction=="y"?'height':'width',_thumb_length+'px');
				}else{
					$track.hide();
				}
				_api.ratio = _distance+_room?_distance/_room:0;
				if(options.autoReset){
					_api.slide(0);
				}
			};
			_api.getRatio = function(){
				return _api.ratio = _distance/_room;
			};
			/***** 私有方法 ******/
			function scroll(e){
				if($track.css('display')!='none'){
					e = e||window.event;
					var delta = -e.wheelDelta/120||e.detail/3;
					var move = options.direction=="y"?-$content.position().top+delta*options.steps:-$content.position().left+delta*options.steps;
					if(move>_room){
						move = _room;
						if(!options.inEndEffect){
							stopBubble(e);
							stopDefault(e);
						}
					}else if(move<0){
						move = 0;
						if(!options.inEndEffect){
							stopBubble(e);
							stopDefault(e);
						}
					}else{
						stopBubble(e);
						stopDefault(e);
					}
					_api.slide(move);
				}
			}
			function touchStart(e){
				stopBubble(e);
				_start = {
                    pageX: e.changedTouches[0].pageX,
                    pageY: e.changedTouches[0].pageY
                };
				if(options.direction=="y"){
					_content_position = -$content.position().top||0;
				}else{
					_content_position = -$content.position().left||0;
				}
			}
			function touchMove(e){
				stopBubble(e);
				var current = {
                    pageX: e.changedTouches[0].pageX,
                    pageY: e.changedTouches[0].pageY
                };
                var move = options.direction=="x"?_start.pageX - current.pageX:_start.pageY - current.pageY;//移动距离触发点的距离
				if (options.direction=="x"&&Math.abs(current.pageY - _start.pageY) < Math.abs(move)||options.direction=="y") {  //chrome移动版下，默认事件与自定义事件的冲突
                    move +=_content_position;
                    stopDefault(e);
					if(move<0){
						move = 0;
					}else if(move>_room){
						move = _room;
					}
					if(_distance>0){
						$thumb.css(options.direction=="y"?'top':'left', move*_api.ratio + "px");
						$content.css(options.direction=="y"?'top':'left',  - move  + "px");
					}
				}
			}
			function touchEnd(e){
				stopBubble(e);
				isTouch = false;
			}
			//初始化
			_api.resize();
			_api.slide(options.slide);
			//事件绑定
			$track.on({
				mousedown:function(e){
					isMouseDown = true;
					_track_offset = options.direction=="y"?$track.offset().top:$track.offset().left;
					_cursor_position = options.direction=="y"?e.pageY-_track_offset-$thumb.position().top:e.pageX-_track_offset-$thumb.position().left;
					setSelectable($body,false);
				},
				mouseup:function(e){
					if(isMouseDown){
						var move = options.direction=="y"?e.pageY - _track_offset:e.pageX - _track_offset;
						if(_cursor_position>0&&_cursor_position<_thumb_length){
							move-=_cursor_position;
						}
						_api.slide(move/_api.ratio);
					}
				}
			});
			$document.on({
				mousemove:function(e){
					if(isMouseDown){
						var move = options.direction=="y"?e.pageY - _track_offset:e.pageX - _track_offset;
						if(_cursor_position>0&&_cursor_position<_thumb_length){
							move-=_cursor_position;
						}
						_api.slide(move/_api.ratio);
					}
				},
				mouseup:function(){
					isMouseDown = false;
					_cursor_position=0;
					setSelectable($body,true);
				},
				resize:_api.resize
			});
			if(document.addEventListener){
				_self.addEventListener('DOMMouseScroll',scroll,false);
			}
			_self.onmousewheel = scroll;
			if(_self.addEventListener&&options.touchable){
				_self.addEventListener("touchstart", touchStart);
				_self.addEventListener("touchmove", touchMove);
				_self.addEventListener("touchend", touchEnd);
			}
			getApi(_api);
		});
	};
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
			obj.removeAttr("unselectable").removeAttr("onselectstart").css("-moz-user-select", "").css("-webkit-user-select", "");
		} else {
			obj.attr("unselectable", "on").attr("onselectstart", "return false;").css("-moz-user-select", "none").css("-webkit-user-select", "none");
		}
	}
}));
