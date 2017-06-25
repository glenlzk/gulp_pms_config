/**
 * Created by glen on 2016/11/08.
 */


;(function (window, document, $, yzl) {

    var cooperateVue = new Vue({
        el : '#cooperate_channel',
        data: {
            // 合作渠道---初始化数据
            channelList: [],
            //  合作渠道---打开编辑渠道弹窗--确认按钮提交数据
            updateMerchantSms:{
                hotelId: yzl.hotelId,
                channelId: '',
                hotelChannelId: '',
                channelName: '',
                isDisabled: '',
                contact: '',
                contactMobile: '',
                channelWeb: '',
                channelAccount: '',
                channelPassword: '',
                remark: ''
            },
            //  合作渠道---提交自定义渠道信息
            customChannelSms: {
                hotelId: yzl.hotelId,
                channelName: '',
                isDisabled: '0',
                contact: '',
                contactMobile: '',
                channelWeb: '',
                channelAccount: '',
                channelPassword: '',
                remark: ''
            },
            //权限管理
            settingResourceInfo : yzl.resourceInfo,
            // radio vue plugin start---渠道编辑
            updateMerInitList: [        // 编辑
                {
                    id: 'merchant_able',  // 对应的选项id
                    value: '0',         // value值必须不一样
                    checked: false,
                    name: 'channel_ison',     // 所有radio name 必须一样
                    zh_cn: '是'    // 中文名字
                },
                {
                    id: 'merchant_unable',
                    value: '1',
                    checked: false,
                    name: 'channel_ison',
                    zh_cn: '否'
                }
            ],
            updateMerCssObj: {
                'margin-right': '20px'
            },
            // radio vue plugin end
            // radio vue plugin start---渠道编辑
            addMerInitList: [   // 添加
                {
                    id: 'addMerchant_able',  // 对应的选项id
                    value: '0',         // value值必须不一样
                    checked: true,
                    name: 'channel_ison',     // 所有radio name 必须一样
                    zh_cn: '是'    // 中文名字
                },
                {
                    id: 'addMerchant_unable',
                    value: '1',
                    checked: false,
                    name: 'channel_ison',
                    zh_cn: '否'
                }
            ],
            addMerCssObj: {
                'margin-right': '20px'
            },
            // radio vue plugin end

        },
        components: {
            'v-radio': yzl.radioVue
        },
        methods: {
            // 初始化事件
            initEvent: function () {
                this.initData();
            },
            // 合作渠道---初始化数据
            initData: function () {
                var _self = this;
                var data = {
                    hotelId: yzl.hotelId
                }
                yzl.getAjax({
                    path : 'channel/j/getChannelList',
                    type : 'get',
                    data : data,
                    fadeInElem: '#cooperate_channel',
                    loadingElem: '#mianContent',
                    tips: false,
                    loadingTop: 300,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.channelList = result.data;
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
            },

            // 合作渠道---打开编辑渠道弹窗
            oepnEditChannelTag: function (perItem) {
                var _self = this;
                $('.editChannelMask').css('display', 'block');
                _self.updateMerchantSms.channelId = perItem.channelId;
                _self.updateMerchantSms.hotelChannelId = perItem.hotelChannelId;

                var data = {
                    hotelId: yzl.hotelId,
                    channelId: perItem.channelId,
                    hotelChannelId: perItem.hotelChannelId
                };

                yzl.getAjax({
                    path : 'channel/j/getChannelInfo',
                    type : 'post',
                    data : data,
                    loadingElem: '#editChannelMaskBox',
                    tips: false,
                    loadingTop: 250,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.updateMerchantSms = {
                                hotelId: yzl.hotelId,
                                channelId: result.data.channelId,
                                hotelChannelId: result.data.hotelChannelId,
                                channelName: result.data.channelName,
                                isDisabled: result.data.isDisabled,
                                contact: result.data.contact,
                                contactMobile: result.data.contactMobile,
                                channelWeb: result.data.channelWeb,
                                channelAccount: result.data.channelAccount,
                                channelPassword:  result.data.channelPassword,
                                remark:  result.data.remark,
                                channelImgUrl: result.data.channelImgUrl
                            };
                        } else {
                            $('.editChannel-errorMsg-tips').html(result.msg);
                        };
                    }
                });

            },

            // 合作渠道---打开编辑渠道弹窗---确定提交数据
            updateCooperateMerchantSms: function (perItem) {
                var _self = this;

                var data = _self.updateMerchantSms;

                yzl.getAjax({
                    path : 'channel/j/updateChannelInfo',
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.initData();
                            $('.editChannelMask').css('display', 'none');
                        } else {
                            $('.editChannel-errorMsg-tips').html(result.msg);
                        };
                    }
                });
            },

            // 合作渠道---关闭编辑渠道弹窗
            closeEditChannelMask : function () {
                $('.editChannelMask').css('display', 'none');
            },

            // 合作渠道---删除合作商家
            delCooperateMerchant: function (perItem) {
                var _self = this;

                var data = {
                    hotelId: yzl.hotelId,
                    hotelChannelId: perItem.hotelChannelId
                };

                yzl.getAjax({
                    path : 'channel/j/deleteChannel',
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.initData();
                        } else {
                            yzl.Dialog({
                                content : result.msg
                            });
                        };
                    }
                });
            },

            // 合作渠道---打开自定义渠道窗口
            clickAddMerchantBtn: function () {
                $('.addChannelMask').css('display', 'block');
            },
            //  合作渠道---关闭自定义渠道窗口
            closeAddChannelMask: function () {
                $('.addChannelMask').css('display', 'none');
            },
            // 合作渠道---提交添加自定义渠道信息
            submitCustomChannel: function () {
                var _self = this;

                var data = _self.customChannelSms;
                if(data.contactMobile == ''){
                	 yzl.Dialog({
                        content : '手机号码不能为空！'
                    });
                }else if(!(/^1[34578]\d{9}$/).test(data.contactMobile)){
                	 yzl.Dialog({
                        content : '请输入正确的手机号码！'
                    });
                }else{
                	yzl.getAjax({
	                    path : 'channel/j/add',
	                    type : 'post',
	                    data : data,
	                    sCallback : function (result) {
	                        if (result.code == "0000") {
	                            _self.initData();
	                            _self.closeAddChannelMask();
	                            _self.customChannelSms = {
	                                hotelId: yzl.hotelId,
	                                channelName: '',
	                                isDisabled: '0',
	                                contact: '',
	                                contactMobile: '',
	                                channelWeb: '',
	                                channelAccount: '',
	                                channelPassword: '',
	                                remark: ''
	                            };
	                        } else {
	                            $('.customChannel-errorMsg-tips').html(result.msg);
	                        };
	                    }
	                });
                }
            },
            // 清空 两个 textarea文本
            focusTextFun: function () {
                var _self = this;
                if ($('.addChannelMask').css('display') == 'none') {
                    _self.updateMerchantSms.remark = '';
                };
            }

        }
    });
    cooperateVue.initEvent();

})(window, document, jQuery, yzlObj);