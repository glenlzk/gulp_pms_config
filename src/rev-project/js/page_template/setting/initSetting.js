/**
 * Created by glen on 2016/10/29.
 */

$(function () {
    // 页面公用特效
    ;(function (window, document, $,yzl) {
		//权限控制
		 var leftsideSettingVue = new Vue({
		 	el: '#leftsideSetting',
            data: {
                settingResourceInfo : JSON.parse(sessionStorage.getItem("Cookie_headerResourceInfo"))
            },
            methods:{
            	init : function () {
            		$('.wrapper').fadeIn();
	            },
            }
		 })
		 leftsideSettingVue.init();
    })(window, document, jQuery, yzlObj);

});


