/**
 * Created by Glen on 2016/10/27.
 */

$(function () {



    // 页面交互
    ;(function (window, document, $, yzl) {
        /* // 参数说明
         param = {
             data : data,  // 传参
             host : host,  // 主机名+端口
             path : path,   // 具体路劲,
             type : type,    // 默认不传为post请求,get请求需要特殊说明
             sCallback : sCallback,   // 成功回调
             fCallback : fCallback   // 失败回调
         };
         */
       // 基本设置---编辑页面
        function ipt_foucs (cur, elem) {
            $(cur).css('border-bottom', 'none').siblings(elem).css('display', 'block');
        };

        var hotelVue = new Vue({
            el: '#basicSetting',
            data: {
                hotelInfo : '',
                uploadImgId: '',
                settingResourceInfo : JSON.parse(sessionStorage.getItem("Cookie_headerResourceInfo")),
                // uploadHotelId: '',
            },
            methods: {
                showData: function () {
                    var _self = this;
                    initPageData();
                    function initPageData(){
                    	yzl.getAjax({
	                        path : 'hotel/j/info',
                            data: {
                                hotelId: yzl.hotelId
                            },
	                        type : 'post',
                            fadeInElem: '#basicSetting',
                            loadingElem: '#mianContent',
                            tips: false,
                            loadingTop: 300,
	                        sCallback : function (result) {
	                            if (result.code == "0000") {
	                                _self.hotelInfo = result.data;
	                                Vue.nextTick(function(){
					                    /* 初始化图片插件 */
					                    /* 上传图片
					                    * */
					                    yzl.InitUploadify({
					                        id: "filePicker",												// 上传按钮id
					                        url: '/yzlpms/img/j/uploadHotelLogo',						// 上传服务器地址
					                        data: {
					                            hotelId: yzl.hotelId
					                        },
					                        method:'get',
					                        buttonText:'添加图片',
					                        sCallback: function (data) {
					                            var result = JSON.parse(data);
					                            if (result.code == "0000") {
					                                $('#preview-target,.jcrop-holder img,.jcrop-preview').attr('src', result.data.imageUrl);
					                                _self.uploadImgId = result.data.imageId;
					                                // 初始化图片裁剪插件
					                                initCrop();
					                            };
					                        }
					                    });
						
						                // 初始化图片裁剪插件
						                initCrop();
						                function initCrop() {
						                    /* 裁剪图片
						                     * */
						                    yzl.Jcrop({
						                        id: 'preview-pane',
						                        target: 'preview-target',
						                        uploadBtn: 'upload_btn',
						                        boxWidth: 260,
						                        boxHeight: 260,
						                        imgId: _self.uploadImgId,
						                        callback: function (data) {
						                            yzl.getAjax({
						                                path : 'img/j/cropImg',
						                                data : data,
						                                type : 'get',
						                                sCallback : function (result) {
						                                    if (result.code == "0000") {
						                                        $('.upload-image-mask').css('display', 'none');
						                                        initPageData();
						                                        window.location.reload();
                                                                /*yzl.headerVue.initData();*/
                                                                $('#preview-target,.jcrop-holder img,.jcrop-preview').attr('src', 'images/index/hotel_preview-bef9270b7c.png');
						                                    } else {
						                                        yzl.Dialog({
						                                            content : result.msg
						                                        });
						                                    };
						                                },
						                                fCallback : function (error) {
						                                    yzl.Dialog({
						                                        content : error
						                                    });
						                                }
						                            })
						                        }
						                    });
						                };
				
									});
	                            } else {
	                                yzl.Dialog({
	                                    content : result.msg
	                                });
	                            };
	                        },
	                        fCallback : function (error) {
	                            yzl.Dialog({
	                                content : error
	                            });
	                        }
	                    });
                    };
                },
                // 设置 > 保存 > 日切
                fcs_riqie_ipt : function () {
                    ipt_foucs ($('#riqie_ipt'), '.riqie-time');
                    $('#checkOut_time').parent('.checkOut-time').css('display', 'none').siblings('#checkOut_ipt').css('border-bottom', '');
                },
                click_riqie_time : function (e) {
                    var _self = this;
                    var elem = e.target;
                    if (elem.tagName === 'LI') {
                        _self.hotelInfo.cutTime = $(elem).html();
                        $('#riqie_time').parent('.riqie-time').css('display', 'none').siblings('#riqie_ipt').css('border-bottom', '');
                    };
                },
                // 设置 > 保存 > 退房时间
                fus_checkOut_ipt : function () {
                    ipt_foucs ($('#checkOut_ipt'), '.checkOut-time')
                },
                click_checkOut_time : function (e) {
                    var _self = this;
                    var elem = e.target;
                    if (elem.tagName === 'LI') {
                        _self.hotelInfo.checkoutTime = $(elem).html();
                        $('#checkOut_time').parent('.checkOut-time').css('display', 'none').siblings('#checkOut_ipt').css('border-bottom', '');
                    };
                },
                // 设置 > 保存 > 入住时间
                fus_checkIn_ipt : function () {
                    ipt_foucs ($('#checkIn_ipt'), '.checkIn-time')
                },
                click_checkIn_time : function (e) {
                    var _self = this;
                    var elem = e.target;
                    if (elem.tagName === 'LI') {
                        _self.hotelInfo.checkinTime = $(elem).html();
                        $('#checkIn_time').parent('.checkIn-time').css('display', 'none').siblings('#checkIn_ipt').css('border-bottom', '');
                    };
                },
                // 三级联动---自动加载市
                get_city : function (val) {
                    var _slef = this;

                    var data = {
                        provinceId: val
                    }
                    yzl.getAjax({
                        path : '/area/j/city',
                        data : data,
                        type : 'get',
                        sCallback : function (result) {
                            if (result.code == "0000") {
                                _slef.hotelInfo.cityId = "";
                                _slef.hotelInfo.areaId = "";
                                _slef.hotelInfo.areaList = [];
                                _slef.hotelInfo.cityList = result.data.cityList;
                            } else {
                                yzl.Dialog({
                                    content : result.msg
                                });
                            };
                        },
                        fCallback : function (error) {
                            yzl.Dialog({
                                content : error
                            });
                        }
                    })
                },
                // 三级联动---加载区(县)
                get_area : function (val) {
                    var _slef = this;

                    var data = {
                        cityId: val
                    }
                    yzl.getAjax({
                        path : '/area/j/area',
                        data : data,
                        type : 'get',
                        sCallback : function (result) {
                            if (result.code == "0000") {
                                _slef.hotelInfo.areaId = "";
                                _slef.hotelInfo.areaList = result.data.areaList;
                            } else {
                                yzl.Dialog({
                                    content : result.msg
                                });
                            };
                        },
                        fCallback : function (error) {
                            yzl.Dialog({
                                content : error
                            });
                        }
                    })
                },

                /*uploadImg: function  (hotelId) {
                    var _self = this;
                    /!* 图片上传
                     * *!/
                    yzl.InitUploadify({
                        id: "filePicker",												// 上传按钮id
                        url: '/yzlpms/web/j/uploadHortelLogo',						// 上传服务器地址
                        data: {
                            objectId: hotelId
                        },
                        method:'get',
                        sCallback: function (data) {
                            var result = JSON.parse(data);
                            if (result.code == "0000") {
                                $('#preview-target,.jcrop-holder img,.jcrop-preview').attr('src', result.data.imageUrl);
                                Img_crop (imgId);
                            };
                        }
                    });


                    function Img_crop (imgId) {
                        /!* 图片裁剪
                         * *!/
                        yzl.Jcrop({
                            id: 'preview-pane',
                            target: 'preview-target',
                            uploadBtn: 'upload_btn',
                            boxWidth: 260,
                            boxHeight: 260,
                            imgId: imgId,
                            callback: function (data) {
                                yzl.getAjax({
                                    path : '/area/j/area',
                                    data : data,
                                    type : 'get',
                                    sCallback : function (result) {
                                        if (result.code == "0000") {
                                            $('.upload-image-mask').css('display', 'none');
                                            _self.hotelInfo.logoUrl = result.data.imgUrl;
                                        } else {
                                            yzl.Dialog({
                                                content : result.msg
                                            });
                                        };
                                    },
                                    fCallback : function (error) {
                                        yzl.Dialog({
                                            content : error
                                        });
                                    }
                                })
                            }
                        });
                    };
                }*/
            }
        });


        hotelVue.showData();

        var basicSetting = {
            // 初始化页面
            init : function () {
                this.initEvent();
            },

            initEvent : function () {
                var basic = this;
                // 酒店上传logo是否有弹窗
                var flag = false;
                // 点击编辑按钮，切换保存页面
                $('.right-btn-edit').unbind('click').click(function () {
                    flag = true;
                    $(this).css('display', 'none').siblings().css('display', '');
                    $('.right-table-save').css('display', 'none').siblings('.right-table-edit').css('display', '');
                });
                $('.right-btn-cancel').unbind('click').click(function () {
                    flag = false;
                    hotelVue.showData();
                    $('.right-table-edit').css('display', 'none').siblings().css('display', '');
                    $('.right-btn-edit').css('display', 'inline-block').siblings().css('display', 'none');
                });
                $('.right-btn-save').unbind('click').click(function () {
                    var that = this;
                    flag = false;

                    var params = {
                        hotelId: $('#hotelId').val().trim(),
                        hotelName: $('#hotelName').val().trim(),
                        cityId: $('#cityId').val().trim(),
                        areaId: $('#areaId').val().trim(),      // areaId
                        address: $('#hotel_address').val().trim(),
                        email: $('#hotel_email').val().trim(),
                        longitude: $('#longitude').val().trim(),
                        latitude: $('#latitude').val().trim(),
                        cutTime: $('#riqie_ipt').val().trim(),
                        checkinTime: $('#checkIn_ipt').val().trim(),
                        checkoutTime: $('#checkOut_ipt').val().trim(),
                    };

                    if (basic.check_ipt_val(params)) {
                        // 缺少验证
                        yzl.getAjax({
                            path : 'hotel/j/update',
                            type : 'post',
                            data : params,
                            sCallback : function (result) {
                                if (result.code == '0000' ) {
                                  hotelVue.showData();
                                    window.location.reload();
                                    /*  yzl.headerVue.initData();*/
                                    $(that).css('display', 'none').siblings().css('display', '');
                                    $('.right-btn-cancel').css('display', 'none');
                                    $('.right-table-edit').css('display', 'none').siblings().css('display', '');
                                } else {
                                    yzl.Dialog({
                                        content : result.msg
                                    });
                                };
                            }
                        });
                    };
                });

                // 上传酒店logo弹窗
                $('#change_logo_box').click(function () {
                    if (flag) {
                        $('.upload-image-mask').css('display', 'block');

                    };
                });

                // 关闭酒店logo弹窗
                $('.upload-win-close').click(function () {
                    $('.upload-image-mask').css('display', 'none');
                });
            },
            // 验证上传数据
            check_ipt_val: function (params) {
                var errorMsg = '';

                if (params.hotelName === '') {
                    errorMsg += '酒店名称不能为空<br/>';
                };
                if (params.cityId === '') {
                    errorMsg += '地区不能为空<br/>';
                };
                if (params.address === '') {
                    errorMsg += '地址不能为空<br/>';
                };
                if (params.email === '') {
                    errorMsg += 'email不能为空<br/>';
                } else if (params.email.trim().match(yzl.reg.email) == null) {                         // (yzl.reg.email.test(params.email.trim()))
                    errorMsg += '请输入正确的邮箱地址<br/>';
                };
                if (params.longitude === '') {
                    errorMsg += '经度不能为空<br/>';
                };
                if (params.latitude === '') {
                    errorMsg += '纬度不能为空<br/>';
                };
                if (params.cutTime === '') {
                    errorMsg += '日切不能为空<br/>';
                } else if (!/^\d{2}:[03]{2}$/.test(params.cutTime)) {
                    errorMsg += '日切时间格式不对，如:07:30<br/>';
                };
                if (params.checkinTime === '') {
                    errorMsg += '入住时间不能为空<br/>';
                } else if (!/^\d{2}:[03]{2}$/.test(params.checkinTime)) {
                    errorMsg += '入住时间格式不对，如:07:30<br/>';
                };
                if (params.checkoutTime === '') {
                    errorMsg += '退房时间不能为空<br/>';
                } else if (!/^\d{2}:[03]{2}$/.test(params.checkoutTime)) {
                    errorMsg += '退房时间格式不对，如:07:30<br/>';
                };

                if (errorMsg === '') {
                    return true;
                } else {
                    yzl.Dialog({
                        content : errorMsg
                    });
                    return false;
                };
            }

        };

        basicSetting.init();


    })(window, document, jQuery, yzlObj);

    // 页面基本特效
    ;(function (window, document, $, yzl) {

        $('.cancel-btn').click(function () {
            $('.upload-image-mask').css('display', 'none');
            $('.img-container img').attr('src', '');
        });


    })(window, document, jQuery, yzlObj);


});