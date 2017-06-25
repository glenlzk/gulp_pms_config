/**
 * Created by glen on 2017/3/22.
 */

// 全局对象
var yzlObj = yzlObj || {};

$(function () {
    ;(function ($, yzl) {

        var config = {};
        // 开发环境
        config = {
            // websocketUrl: '192.168.0.155',
            // websocketUrl: 'demo.inzlink.com',
            websocketUrl: 'dev.inzlink.com',
            swf:'js/plugin/uploadify/uploadify.swf',
            host: {
                'pms' : '/yzlpms/'
            },
            version: '3.0.0',
            loginDirectory: '/index.html',
            loginoutDirectory: '/login.html',
            printDirectory: '/print/initprint.html'
            /*loginDirectory: '/hoteltest/index.html',
            loginoutDirectory: '/hoteltest/login.html'*/
        };



        // 生产环境
        /*config = {
            // websocketUrl: 'www.inzlink.com',
            // websocketUrl: 'demo.inzlink.com',
             websocketUrl: window.location.hostname+':'+window.location.port,
             // websocketUrl: 'dev.inzlink.com',
             swf:'js/global/uploadify.swf',
             host: {
                'pms' : '/yzlpms/'
             },
             version: '3.1.3',
             loginDirectory: '/hotel/index.html',
             loginoutDirectory: '/hotel/login.html',
             printDirectory: '/hotel/print/initprint.html'
         };*/

        yzl = $.extend(yzl, config);

    })(jQuery, yzlObj);
});
