/**
 * jquery.sliderbar.js 1.0
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
    $.fn.slidebar = function(parameter) {
        parameter = parameter || {};
        var defaults = {
            closeBtnCls:"closebtn",         //关闭滑块触发点的class
            openBtnCls:"openbtn",           //打开滑块触发点的class
            scrollEvent:true,               //是否在滚动过程中打开
            scrolltop:1200,                 //打开前滚动的距离
            duration: 500,                  //打开过程动画时间
            expires: 24,                    //cookie周期
            cookieName:"slidediv_isclose",  //cookie名称
            cookieDomain:"",                //cookie中的域
            cookiePath:"/",                 //cookie路径
            //对外接口
            afterClose:function(){},
            afterOpen:function(){}
        };
        var options = $.extend({}, defaults, parameter);
        var $window = $(window);
        var $document = $(document);
        var isIE6 = navigator.appVersion.indexOf("MSIE 6") > -1;
        if(isIE6){  //兼容
            var _window_height = $window.height();
            $window.resize(function(){
                _window_height = $window.height();
                $window.scroll();
            });
        }
        return this.each(function() {
            var $this = $(this);
            var $close_trigger = $this.find('.' + options.closeBtnCls);
            var $open_trigger = $('.' + options.openBtnCls);
            var _width = $this.children().outerWidth(true);
            var _height = $this.height();
            var _bottom = $this.css('bottom');
            var isShow = false;
            //初始化处理
            var isClose = !!getCookie(options.cookieName);
            var u = navigator.userAgent;
            var isPC = !(u.indexOf('Mobi')>0||u.indexOf('Tablet')>0||u.indexOf('iPh')>0||u.indexOf('iPad')>0||u.indexOf('480')>0);
            var isWideScreen = $window.width()>=1280;
            if(isClose||!isPC||!isWideScreen){
                $this.css({'overflow':'hidden','width': '0px'});
                isShow = false;
            }else{
                $this.css({'overflow':'hidden','width': _width + 'px'});
                isShow = true;
            }
            //事件绑定
            if(options.scrollEvent){
                $this.css({'width': '0px'});
                $window.scroll(scroll).scroll();
            }
            $close_trigger.on("click",close);
            $open_trigger.on("click",open);
            //兼容
            if(isIE6){
                $window.scroll(function(){
                    var scrolltop = $document.scrollTop();
                    $this.css({"position":"absolute","top":scrolltop +_window_height-_height-parseInt(_bottom)+"px"});
                });
            }
            //滚轴滚动
            function scroll(){
                if(!isClose){
                    var scrolltop = $document.scrollTop();
                    if(scrolltop<options.scrolltop){
                        hide();
                    }else {
                        show();
                    }
                }
            }
            //层隐藏
            function hide(){
                if(isShow){
                    $this.animate({'width':'0px'},options.duration);
                    isShow = false;
                }
            }
            //层显示
            function show(){
                if(!isShow){
                    $this.animate({'width':_width},options.duration);
                    isShow = true;
                }
            }
            //层关闭
            function close(){
                addCookie(options.cookieName,"1",options.expires,options.cookieDomain,options.cookiePath);
                hide();
                isClose = true;
                options.afterClose();
            }
            //层打开
            function open(){
                // delCookie(options.cookieName,options.cookieDomain,options.cookiePath);
                show();
                isClose = false;
                options.afterOpen();
            }
        });
    };
    //工具函数
    //删除cookie
    function delCookie(name,objDomain,objPath){
        document.cookie = name+"=;expires="+(new Date(0)).toGMTString()+";domain="+objDomain+";path="+objPath;
    }
    //获取cookie值
    function getCookie(objName){
        var arrStr = document.cookie.split("; ");
        for(var i = 0;i < arrStr.length;i ++){
            var temp = arrStr[i].split("=");
            if(temp[0] == objName) return unescape(temp[1]);
        }
    }
    //添加cookie
    function addCookie(objName,objValue,objHours,objDomain,objPath){
        var str = objName + "=" + escape(objValue);
        if(objHours > 0){  //为时不设定过期时间，浏览器关闭时cookie自动消失
            var date = new Date();
            var ms = objHours*3600*1000;
            date.setTime(date.getTime() + ms);
            str += "; expires=" + date.toGMTString()+";domain="+objDomain+";path="+objPath;
        }
        document.cookie = str;
    }
}));
