$(function () {
    // 页面公用特效
    ;(function (window, document, $, yzl) {

        //权限控制
		 var leftsideOrderVue = new Vue({
		 	el: '#leftsideOrder',
            data: {
                OrderResourceInfo : JSON.parse(sessionStorage.getItem("Cookie_headerResourceInfo"))
            },
            methods:{
            	init : function () {
            		$('.wrapper').fadeIn();
            		Vue.nextTick(function(){
            			// 左侧导航栏 + 导航栏位置提示
				        $('.left-nav li a').click(function () {
				            $(this).addClass('active').parent().siblings().find('a').removeClass('active');
				            $('.Orderspinner-mask').css('display','block');
				            $('#content_title_secNav').html($(this).html());
				            $('.channel_sec').stop().slideUp();
				        });
            		})
	            },
            }
		 })
		 leftsideOrderVue.init();

    })(window, document, jQuery, yzlObj);
});