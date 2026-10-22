/**
 * jquery.emoji.js 1.0
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
                let jQuery = require('jquery');
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
    const categoryIcons = [
        '<circle cx="12" cy="12" r="9"/><path d="M8 14a4 4 0 0 0 8 0M8 9h.01M16 9h.01"/>',
        '<circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
        '<ellipse cx="5" cy="9" rx="2" ry="3"/><ellipse cx="10" cy="5" rx="2" ry="3"/><ellipse cx="16" cy="5" rx="2" ry="3"/><ellipse cx="21" cy="9" rx="2" ry="3"/><path d="M7 17c0-3 3-6 6-6s6 3 6 6c0 4-4 2-6 2s-6 2-6-2Z"/>',
        '<path d="M4 8h12v6a6 6 0 0 1-12 0ZM16 9h2a3 3 0 0 1 0 6h-2M7 2v3M11 2v3M3 22h15"/>',
        '<path d="m5 8 2-5h10l2 5M3 8h18v9H3ZM5 17v3M19 17v3M6 12h2M16 12h2"/>',
        '<circle cx="12" cy="12" r="9"/><path d="m12 7 5 4-2 6H9l-2-6ZM12 3v4M3.5 9.5 7 11M20.5 9.5 17 11M6.5 19 9 17M17.5 19 15 17"/>',
        '<path d="M8 14a6 6 0 1 1 8 0l-1 3H9ZM9 20h6M10 23h4"/>',
        '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>'
    ].map(content=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`);
    const groups = [
        ['笑脸情绪','😀 😃 😄 😁 😆 😅 😂 🤣 😊 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶 😏 😒 🙄 😬 😮 😯 😲 😳 🥺 😢 😭 😤 😠 😡 🤯 😱 😨 😰 😥 😓 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥱 😴 🤤 😪 😎 🤓 🧐 🤩 🥳 😷 🤒 🤕 🤢 🤮 🤧 😵 🤠 😇 😈 👿 👻 💀 🤖 👽 💩 😺 😸 😹 😻 😼 😽 🙀 😿 😾'],
        ['人物手势','👋 🤚 🖐️ ✋ 🖖 👌 🤏 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 👐 🤲 🤝 🙏 💪 🦾 🦵 🦶 👂 👃 👀 👁️ 🧠 🦷 👶 🧒 🧑 👩 👨 🧓 👵 👴 🧑‍💻 🧑‍🎨 🧑‍🍳 🧑‍🔬 🧑‍🚀 👮 🧑‍🚒 🧑‍🏫 🧑‍⚕️'],
        ['动物自然','🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🦆 🦅 🦉 🦇 🐺 🐴 🦄 🐝 🐛 🦋 🐌 🐞 🐜 🦗 🕷️ 🐢 🐍 🦎 🐙 🦑 🦐 🦀 🐠 🐟 🐡 🐬 🐳 🦈 🐊 🐘 🦒 🦓 🦌 🐪 🦙 🦘 🦥 🦦 🦔 🐾 🌵 🎄 🌲 🌳 🌴 🌱 🌿 ☘️ 🍀 🍃 🍂 🍁 🍄 🌾 💐 🌷 🌹 🌺 🌸 🌼 🌻 ☀️ 🌤️ ☁️ 🌧️ ⛈️ 🌨️ ❄️ ⛄ 🌈 🌙 ⭐ 🌟 ✨ 🔥 💧 🌊'],
        ['食物饮品','🍎 🍏 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶️ 🌽 🥕 🥔 🍠 🥐 🥯 🍞 🥖 🧀 🥚 🍳 🥞 🧇 🥓 🥩 🍗 🍖 🌭 🍔 🍟 🍕 🥪 🌮 🌯 🥗 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🍙 🍚 🍘 🍢 🍡 🍤 🍿 🍦 🍨 🍩 🍪 🎂 🍰 🧁 🍫 🍬 🍭 🍮 🍯 🍼 🥛 ☕ 🍵 🧃 🥤 🧋 🍺 🍻 🥂 🍷 🍹 🍸 🥃 🍽️ 🥢'],
        ['旅行地点','🚗 🚕 🚙 🚌 🚎 🏎️ 🚓 🚑 🚒 🚚 🚛 🚜 🛵 🏍️ 🚲 🛴 🚂 🚆 🚇 🚊 🚉 ✈️ 🛫 🛬 🚁 🚀 🛸 ⛵ 🚤 🛳️ ⚓ ⛽ 🚦 🚧 🗺️ 🧭 🏠 🏡 🏢 🏫 🏥 🏦 🏨 🏪 🏛️ 🏰 🗼 🗽 ⛩️ 🏖️ 🏝️ 🏜️ 🏕️ ⛰️ 🏔️ 🌋 🌅 🌄 🌃 🌆 🌇 🌉 🎡 🎢 🎠'],
        ['活动庆祝','⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🎱 🏓 🏸 🏒 🏑 🥅 ⛳ 🏹 🎣 🥊 🥋 🛹 ⛸️ 🎿 🛷 🏋️ 🤸 🏊 🚴 🏃 🧘 💃 🕺 🎯 🎮 🕹️ 🎲 🧩 ♟️ 🎭 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🎷 🎺 🎸 🎻 🏆 🥇 🥈 🥉 🏅 🎖️ 🎉 🎊 🎈 🎁 🎀 🎇 🎆'],
        ['生活物品','📱 📲 💻 ⌨️ 🖥️ 🖨️ 🖱️ 💾 💿 📷 📸 📹 🎥 📺 📻 ☎️ 🔋 🔌 💡 🔦 🕯️ ⏰ ⌚ ⏳ ⌛ 📚 📖 📕 📗 📘 📙 📓 📔 📒 📝 ✏️ 🖊️ 🖋️ 🖌️ 📌 📍 📎 🖇️ 📐 📏 ✂️ 📁 📂 🗂️ 📅 📆 📋 📊 📈 📉 🔍 🔎 🔒 🔓 🔑 🗝️ 🔨 🪛 🔧 🛠️ ⚙️ 🧰 🧲 ⚖️ 💰 💵 💳 💎 🛒 👕 👖 👗 👟 👠 🎒 👜 👓 🕶️ ☂️ 🧴 🧼 🧹 🧺 🛏️ 🛋️ 🪑 🚪 🪴'],
        ['符号爱心','❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 💌 💋 💯 💢 💥 💫 💦 💤 ✅ ☑️ ✔️ ❌ ❎ ➕ ➖ ✖️ ➗ ❗ ❓ ❕ ❔ ‼️ ⁉️ ⚠️ 🚫 ⛔ 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤 🔺 🔻 🔸 🔹 🔶 🔷 ⬛ ⬜ ◼️ ◻️ ▶️ ⏸️ ⏹️ ⏭️ ⏮️ 🔁 🔂 🔀 ⬆️ ⬇️ ⬅️ ➡️ ↗️ ↘️ ↙️ ↖️ ↔️ ↕️ ♻️ ⚜️ 🔱 ©️ ®️ ™️ #️⃣ *️⃣ 0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟']
    ].map(([name,values],index)=>({
        name,
        icon:categoryIcons[index],
        list:values.split(' ')
    }));
    $.fn.emoji = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        let defaults = {
            'title':'选择表情',
            'prefix':'widget',
            'triggerCls':'trigger',
            'activeCls':'active',
            'onShow':function(){},
            'onHide':function(){},
            'onSelect':function(){}
        };
        let options = $.extend({}, defaults, parameter);
        const $window = $(window);
        const $document = $(document);
        const $body = $('body');
        return this.each(function() {
            //全局变量
            let $this = $(this);
            let $trigger = null;
            let $textarea = null;
            if(!$.fn.emoji._layers){
                $.fn.emoji._layers = {};
            }
            let $layer = $.fn.emoji._layers[options.prefix];
            if(!$layer){
                $layer = $(`
                    <dialog class="${options.prefix}-layer">
                        <div class="${options.prefix}-container">
                            <div class="${options.prefix}-head">
                                <span class="${options.prefix}-title">${options.title}</span>
                                <a class="${options.prefix}-close" href="javascript:;" rel="nofollow">✖</a>
                            </div>
                            <div class="${options.prefix}-body">
                                <div class="${options.prefix}-menu">
                                    ${
                                        groups.map((group,index)=>`
                                            <button class="${index==0?'active':''}" type="button" data-index="${index}">${group.icon}</button>
                                        `).join('')
                                    }
                                </div>
                                <div class="${options.prefix}-panels">
                                    ${
                                        groups.map((group,index)=>`
                                            <div class="${options.prefix}-panel" style="display: ${index==0?'block':'none'}">
                                                <div class="${options.prefix}-grid">
                                                ${
                                                    group.list.map(value=>`
                                                        <button type="button" data-value="${value}">${value}</button>
                                                    `).join('')
                                                }
                                                </div>
                                            </div>
                                        `).join('')
                                    }
                                </div>
                            </div>
                        </div>
                    </dialog>
                `);
                $body.append($layer);
                $.fn.emoji._layers[options.prefix] = $layer;
            }
            const resizeLayer = function(){
                if($layer && $layer.length){
                    $trigger = $this.find(`.${options.triggerCls}`);
                    const offset = $trigger.offset();
                    const scroll_top = $window.scrollTop();
                    const scroll_left = $window.scrollLeft();
                    const window_width = $window.width();
                    const window_height = $window.height();
                    const trigger_width = $trigger.outerWidth();
                    const trigger_height = $trigger.outerHeight();
                    const layer_width = $layer.outerWidth();
                    const layer_height = $layer.outerHeight();
                    const top_distance = offset.top - scroll_top;
                    const bottom_distance = window_height - top_distance - trigger_height;
                    const left_distance = offset.left -scroll_left;
                    const right_distance = window_width - left_distance - trigger_width;
                    let top = offset.top + trigger_height;
                    let left = offset.left + trigger_width;
                    if(bottom_distance < layer_height){
                        if(top_distance < layer_height){
                            top = (window_height - layer_height)/2 + scroll_top;
                        }else{
                            top = offset.top - layer_height;
                        }
                    }
                    if(right_distance < layer_width){
                        if(left_distance < layer_width){
                            left = (window_width - layer_width)/2 + scroll_left;
                        }else{
                            left = offset.left - layer_width;
                        }
                    }
                    $layer.css({
                        left,
                        top
                    });
                }
            };
            // 开启弹框
            const openLayer = function(){
                $trigger = $this.find(`.${options.triggerCls}`);
                $textarea = $this.find(`textarea`);
                $trigger.addClass(options.activeCls);
                resizeLayer();
                $layer.get(0).show();
                options.onShow();
            };
            // 关闭弹框
            const closeLayer = function(){
                if($trigger){
                    $trigger.removeClass(options.activeCls);
                }
                $layer.get(0).close();
                options.onHide();
            };
            //事件绑定
            if(Object.keys($.fn.emoji._layers).length){
                $this.on('click',`.${options.triggerCls}`,openLayer);
                $document.on('click',function(e){
                    let $target = $(e.target);
                    if(!$target.is(`.${options.triggerCls}`)&&!$target.closest(`.${options.prefix}-layer`).length){
                        closeLayer();
                    }
                });
                $layer.on('click',`.${options.prefix}-close`,closeLayer);
                $layer.on('click',`.${options.prefix}-menu button`,function(){
                    const $this = $(this);
                    const index = $this.data('index');
                    $this.addClass('active').siblings().removeClass('active');
                    $layer.find(`.${options.prefix}-panel`).hide().eq(index).show();
                });
                $layer.on('click',`.${options.prefix}-panel button`,function(){
                    const $this = $(this);
                    const value = $this.data('value');
                    if($textarea){
                        insertText($textarea[0],value);
                    }
                    options.onSelect();
                });
            }
            $window.on('resize',resizeLayer);
            //初始化
            getApi();
            return this;
        });
    };

    //插入文字
    function insertText(element,value) {
        if (typeof element.selectionStart === 'number' && typeof element.selectionEnd === 'number') {
            let startPos = element.selectionStart,
                endPos = element.selectionEnd,
                cursorPos = startPos,
                tmpStr = element.value;
            element.value = tmpStr.substring(0, startPos) + value + tmpStr.substring(endPos, tmpStr.length);
            cursorPos += value.length;
            element.selectionStart = element.selectionEnd = cursorPos;
            element.focus();
        } else {
            element.value += value;
        }
    }
}));