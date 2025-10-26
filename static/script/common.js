const $scrollContainer = document.documentElement;

// 头部滚动
(function(){
    const $header = document.querySelector('.mod-head');
    window.addEventListener('scroll',function(){
        let scrollTop = $scrollContainer.scrollTop;
        let ratio = Math.min(scrollTop/600,1);
        $header.style.background = 'rgba(255,255,255,'+(ratio*0.8)+')';
        $header.style.boxShadow = '1px 2px 8px rgba(0,0,0,'+(ratio*0.06)+')';
        $header.style.backdropFilter = 'blur('+(ratio*10)+'px)';
    });
})();

// 底部滚动
(function(){
    const $gotop = document.querySelector('.mod-fixedbar .gotop');
    $gotop.addEventListener('click',function(){
        $scrollContainer.scrollTo({
            left:0,
            top:0,
            behavior:'smooth'
        });
    });
})();

// 块链接
(function(){
    document.addEventListener('click',function(e) {
        let $tag = e.target;
        while ($tag.tagName!='A'&&$tag.tagName!='BODY'&&!$tag.classList.contains('J_link')) {
            $tag = $tag.parentNode;
        }
        if($tag.tagName!='A'&&$tag.classList.contains('J_link')){
            let url = $tag.getAttribute('data-url');
            let target = $tag.getAttribute('data-target');
            if(url){
                if (target !== '_blank') {
                    window.open(url);
                } else {
                    location.href = url;
                }
            }else{
                let $link = $tag.querySelector('a');
                target = $link.getAttribute('target');
                url = $link.getAttribute('href')||'/';
                if (target == '_blank') {
                    window.open(url);
                } else {
                    location.href = url;
                }
            }
        }
    });
})();