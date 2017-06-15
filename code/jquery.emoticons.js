/**
 * jquery.emoticons.js 1.0
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
    $.emoticons = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
            'prefix':'widget',
            'publisherCls':'publisher',
            'triggerCls':'trigger',
            'activeCls':'active',
            'path':'public/image/',
            'list':[
                {'title':'微笑','url':'weixiao.gif'},
                {'title':'嘻嘻','url':'xixi.gif'},
                {'title':'哈哈','url':'haha.gif'},
                {'title':'可爱','url':'keai.gif'},
                {'title':'可怜','url':'kelian.gif'},
                {'title':'挖鼻','url':'wabi.gif'},
                {'title':'吃惊','url':'chijing.gif'},
                {'title':'害羞','url':'haixiu.gif'},
                {'title':'挤眼','url':'jiyan.gif'},
                {'title':'闭嘴','url':'bizui.gif'},
                {'title':'鄙视','url':'bishi.gif'},
                {'title':'爱你','url':'aini.gif'},
                {'title':'泪','url':'lei.gif'},
                {'title':'偷笑','url':'touxiao.gif'},
                {'title':'亲亲','url':'qinqin.gif'},
                {'title':'生病','url':'shengbing.gif'},
                {'title':'太开心','url':'taikaixin.gif'},
                {'title':'白眼','url':'baiyan.gif'},
                {'title':'右哼哼','url':'youhengheng.gif'},
                {'title':'左哼哼','url':'zuohengheng.gif'},
                {'title':'嘘','url':'xu.gif'},
                {'title':'衰','url':'shuai.gif'},
                {'title':'吐','url':'tu.gif'},
                {'title':'哈欠','url':'haqian.gif'},
                {'title':'抱抱','url':'baobao.gif'},
                {'title':'怒','url':'nu.gif'},
                {'title':'疑问','url':'yiwen.gif'},
                {'title':'馋嘴','url':'chanzui.gif'},
                {'title':'拜拜','url':'baibai.gif'},
                {'title':'思考','url':'sikao.gif'},
                {'title':'汗','url':'han.gif'},
                {'title':'困','url':'kun.gif'},
                {'title':'睡','url':'shui.gif'},
                {'title':'钱','url':'qian.gif'},
                {'title':'失望','url':'shiwang.gif'},
                {'title':'酷','url':'ku.gif'},
                {'title':'色','url':'se.gif'},
                {'title':'哼','url':'heng.gif'},
                {'title':'鼓掌','url':'guzhang.gif'},
                {'title':'晕','url':'yun.gif'},
                {'title':'悲伤','url':'beishang.gif'},
                {'title':'抓狂','url':'zhuakuang.gif'},
                {'title':'黑线','url':'heixian.gif'},
                {'title':'阴险','url':'yinxian.gif'},
                {'title':'怒骂','url':'numa.gif'},
                {'title':'互粉','url':'hufen.gif'},
                {'title':'书呆子','url':'shudaizi.gif'},
                {'title':'愤怒','url':'fennu.gif'},
                {'title':'感冒','url':'ganmao.gif'},
                {'title':'心','url':'xin.gif'},
                {'title':'伤心','url':'shangxin.gif'},
                {'title':'猪','url':'zhu.gif'},
                {'title':'熊猫','url':'xiongmao.gif'},
                {'title':'兔子','url':'tuzi.gif'},
                {'title':'OK','url':'ok.gif'},
                {'title':'耶','url':'ye.gif'},
                {'title':'GOOD','url':'good.gif'},
                {'title':'NO','url':'no.gif'},
                {'title':'赞','url':'zan.gif'},
                {'title':'来','url':'lai.gif'},
                {'title':'弱','url':'ruo.gif'},
                {'title':'草泥马','url':'caonima.gif'},
                {'title':'神马','url':'shenma.gif'},
                {'title':'囧','url':'jiong.gif'},
                {'title':'浮云','url':'fuyun.gif'},
                {'title':'给力','url':'geili.gif'},
                {'title':'围观','url':'weiguan.gif'},
                {'title':'威武','url':'weiwu.gif'},
                {'title':'话筒','url':'huatong.gif'},
                {'title':'蜡烛','url':'lazhu.gif'},
                {'title':'蛋糕','url':'dangao.gif'},
                {'title':'发红包','url':'fahongbao.gif'}
            ],
            'top':0,
            'left':0,
            'onShow':function(){},
            'onHide':function(){},
            'onSelect':function(){}
        };
        var options = $.extend({}, defaults, parameter);

        var _api = {};
        var $document = $(document);
        var $body = $('body');
        var $layer = $('<div class="'+options.prefix+'-layer">').appendTo($body);
        var $tool = $('<div class="'+options.prefix+'-tool"></div>').appendTo($layer);
        var $close = $('<a class="'+options.prefix+'-close" href="javascript:;" title="关闭">X</a>').appendTo($tool);
        var $panel = $('<div class="'+options.prefix+'-panel"></div>').appendTo($layer);
        var $list = $('<ul></ul>').appendTo($panel);
        var $trigger = null;
        var $textarea = null;
        var _hash = {};
        //结构处理
        $layer.css({
            'position':'absolute',
            'display':'none'
        });
        $.each(options.list,function(index,item){
            _hash[item.title] = options.path+item.url;
            $list.append('<li title="'+item.title+'"><img src="'+_hash[item.title]+'"/></li>');
        });
        //接口处理
        _api.getTextarea = function(){
            return $textarea;
        },
        _api.format = function(str){
            var list = str.match(/\[[\u4e00-\u9fa5]*\w*\]/g);
            var filter = /[\[\]]/g;
            var title;
            if(list){
                for(var i=0;i<list.length;i++){
                    title = list[i].replace(filter,'');
                    if(_hash[title]){
                        str = str.replace(list[i],' <img src="'+_hash[title]+'"/> ');
                    }
                }                
            }
            return str;
        };
        //关闭弹框
        var closeLayer = function(){
            if($trigger){
                $trigger.removeClass(options.activeCls);
            }
            $layer.hide();
            $trigger = null;
            $textarea = null;
            options.onHide();
        };
        //事件绑定
        $document.on('click','.'+options.triggerCls,function(){
            $trigger = $(this);
            var $publisher = $trigger.parents('.'+options.publisherCls);
            $textarea = $publisher.find('textarea');
            var offset = $trigger.offset();
            var height = $trigger.outerHeight();
            $trigger.addClass(options.activeCls);
            $layer.css({
                left: offset.left+options.left,
                top: offset.top+height+options.top
            }).show();
            options.onShow();
        });
        $document.on('click',function(e){
            var $target = $(e.target);
            if(!$target.is('.'+options.triggerCls)&&!$target.closest('.'+options.prefix+'-layer').length){
                closeLayer();
            }
        });
        $layer.on('click','.'+options.prefix+'-close',closeLayer);
        $layer.on('click','li',function(){
            var $this = $(this);
            var title = $this.attr('title');
            if($textarea){
                insertText($textarea[0],'['+title+']');
            }
            options.onSelect(_api);
        });
        //为了兼容insertText
        $document.on('select click keyup','.'+options.publisherCls+' textarea',function(){
            if (this.createTextRange){
                this.caretPos = document.selection.createRange().duplicate();
            }
        });
        //初始化
        getApi(_api);
        return this;
    };

    //插入文字
    function insertText(obj,str) {
        if(document.all && obj.createTextRange && obj.caretPos){ 
            var caretPos=obj.caretPos; 
            caretPos.text = caretPos.text.charAt(caretPos.text.length-1) == '' ? 
            str+'' : str; 
        }else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
            var startPos = obj.selectionStart,
                endPos = obj.selectionEnd,
                cursorPos = startPos,
                tmpStr = obj.value;
            obj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
            cursorPos += str.length;
            obj.selectionStart = obj.selectionEnd = cursorPos;
        } else {
            obj.value += str;
        }
    }
}));
