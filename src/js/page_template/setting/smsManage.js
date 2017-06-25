/**
 * Created by glen on 2016/11/9.
 */

;(function (window, document, $, yzl) {

    var smsManageVue = new Vue({
        el : '#sms_manage',
        data: {
            // 短信管理---初始化数据保存 遍历
            smsList: [],
            // 短信管理---按钮状态截留
            btnStatus: null,
            //权限管理
            settingResourceInfo : yzl.resourceInfo,
        },
        methods: {
            // 初始化事件
            initEvent: function () {
                this.initData();
            },
            // 短信管理---初始化数据
            initData: function () {
                var _self = this;
                var data = {
                    hotelId: yzl.hotelId
                }
                yzl.getAjax({
                    path : 'hotel/j/queryHotelMsg',
                    type : 'get',
                    data : data,
                    fadeInElem: '#sms_manage',
                    loadingElem: '#mianContent',
                    tips: false,
                    loadingTop: 300,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.smsList = result.data;
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
            },
            // 短信管理---开启或关闭短信提醒功能
            changeSmsStatus: function (event, perItem) {
                var e = event || window.event,
                    isDisabled = '0',
                    changeElem = e.currentTarget,
                    _self = this;

                clearTimeout(_self.btnStatus);
                _self.btnStatus = setTimeout(function (){
                    if (perItem.isDisabled === '0') {
                        isDisabled = '1';
                    };
                    var data = {
                        hotelId: yzl.hotelId,
                        isDisabled: isDisabled,
                        msgType: perItem.msgType
                    };

                    yzl.getAjax({
                        path : 'hotel/j/switchHotelMsg',
                        type : 'post',
                        data : data,
                        sCallback : function (result) {
                            if (result.code == "0000") {
                                perItem.isDisabled = isDisabled;
                                if ($(changeElem).hasClass('active')) {
                                    $(changeElem).removeClass('active')
                                } else {
                                    $(changeElem).addClass('active');
                                };
                                clearTimeout(_self.btnStatus);
                            } else {
                                yzl.Dialog({
                                    content : result.msg,
                                    AutoClose: true
                                });
                            };
                        }
                    });
                }, 300);
            },

            // 短信管理---短信标题状态
            sms_title: function (perItem) {
                switch(perItem.msgType) {
                    case '1':
                        return '预订信息';
                    case '2':
                        return '服务电话';
                    case '3':
                        return '离店祝福';
                };
            },

            // 短信管理---文本 是否启用状态
            smsIsabled: function (isok) {
                switch(isok) {
                    case '0':
                        return '已启用';
                    case '1':
                        return '未启用';
                };
            },
            // 短信管理---按钮是否启动状态
            isActive: function (isok) {
                switch(isok) {
                    case '0':
                        return 'active';
                    case '1':
                        return '';
                };
            },



        }
    });

    smsManageVue.initEvent();

})(window, document, jQuery, yzlObj);