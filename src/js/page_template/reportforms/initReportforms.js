/**
 * Created by glen on 2016/10/29.
 */

$(function () {
    // 页面公用特效
    ;(function (window, document, $, yzl) {

        //权限控制
		 var leftsideReportformsVue = new Vue({
		 	el: '#leftsideReportforms',
            data: {
                reportformsResourceInfo : JSON.parse(sessionStorage.getItem("Cookie_headerResourceInfo"))
            },
            methods:{
            	init : function () {
            		Vue.nextTick(function(){
            			$('.wrapper').fadeIn();
            			// 左侧导航栏 + 导航栏位置提示
				        $('.left-nav li a').click(function () {
				            $(this).addClass('active').parent().siblings().find('a').removeClass('active');
				            $('#content_title_secNav').html($(this).html());
				            $('.channel_sec').stop().slideUp();
				        });
            		})
	            },
            }
		 })
		 leftsideReportformsVue.init();

    })(window, document, jQuery, yzlObj);
});


