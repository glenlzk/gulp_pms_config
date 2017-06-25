/**
 * Created by Glen on 2016/10/23.
 */

if (typeof String.prototype.trim != 'undefined') {
    String.prototype.trim = function(){
        return this.replace(/(^\s*)|(\s*$)/g, "");
    };
}

/*信息备注：

  1.有待完善设置，验证不通过 +error， 如：
     <div class="error">
         <label for="username"></label>
         <input type="text" placeholder="请输入11位手机号码">
     </div>
     // 验证通过 + correct，如：
     <div class="correct">
         <label for="username"></label>
         <input type="text" placeholder="请输入11位手机号码">
     </div>

 5.public.getAjax 未考虑jsonp跨域请求情况


* */

$(function () {

    ;(function (window, document, $, undefined) {

        // 公用函数
        var public = {
            // 对话框--定时器
            Dialogtimer : null,
            // 验证码--定时器
            timer: null,
            reg : {
                phoneNo : /^1[34578]\d{9}$/,
                Chinese : /[\u4e00-\u9fa5]+/g
            },
            host : {
                'pms' : '/yzlpms/'
            },
            // 检测手机号
            checkPhone : function (val) {
                if (val === '') {
                    return {
                        'isOk' : false,
                        'errorMsg' : '手机号不能为空'
                    };
                } else if (!this.reg.phoneNo.test(val)) {
                    return {
                        'isOk' : false,
                        'errorMsg' : '请输入正确手机号码'
                    };
                }
                return {
                    'isOk' : true
                };
            },

            // 检测手机号
            checkPswd : function (val) {
                if (val === '') {
                    return {
                        'isOk' : false,
                        'errorMsg' : '密码不能为空'
                    };
                } else if (val.length > 32) {
                    return {
                        'isOk' : false,
                        'errorMsg' : '密码长度不能超过32位'
                    };
                } else if (this.reg.Chinese.test(val)) {
                    return {
                        'isOk' : false,
                        'errorMsg' : '密码不能有中文'
                    };
                }
                return {
                    'isOk' : true
                };
            },

            // 校验短信验证码
            checkSms : function (val) {
                if (val === '') {
                    return {
                        'isOk' : false,
                        'errorMsg' : '短信验证码不能为空'
                    };
                } else if (val.length > 6) {
                    return {
                        'isOk' : false,
                        'errorMsg' : '短信验证码不能超过6位'
                    };
                };
                return {
                    'isOk' : true
                };
            },

            // 清空input[type='password'] 和 input[type='text']操作, par为父级别
            cleanAllVal : function (par) {
                par.find('input[type=password], input[type=text]').val('');
            },

            // 短信发送时间倒数
            countdown : function (elem) {
                var self = this;
                var num = 60;/*,
                    timer = null*/;

                $(elem).css({
                    'backgroundColor': '#ccc',
                    'cursor' :'not-allowed'
                }).attr({
                    'disabled' : 'disabled'
                });
                self.timer = setInterval(function () {
                    num --;
                    $(elem).val(num);
                    if (num < 0) {
                        $(elem).val('重新发送验证码').css({
                            'backgroundColor': '#ffb425',
                            'cursor' :'pointer'
                        }).removeAttr('disabled');
                        clearInterval(self.timer);
                    };
                }, 1000);
            },
            // 注册 和 忘记密码点击发送验证码公用函数
            sendSms : function (params) {
                var val = $('#' + params.phone).val().trim(),
                    getSmsId = '';

                if (!public.checkPhone(val)['isOk']) {
                    public.Dialog({
                        'content': public.checkPhone(val).errorMsg,
                        'isConfirm': false
                    });
                } else {
                    public.countdown(params.elem);
                    public.getAjax({
                        type : 'post',
                        data : {
                            'mobile' : val
                        },
                        // 同步
                        path: 'action/api/getCode',
                        sCallback : function (result) {
                            if (result.code === '0000') {
                                params.success && params.success(result.data.smsId);
                            } else {
                                public.Dialog({
                                    'content': result.msg,
                                    'isConfirm': false
                                });
                            };
                        },
                        fCallback : function () {
                            public.Dialog({
                                'content': '请求出错',
                                'isConfirm': false
                            });
                        }
                    });
                };
                return getSmsId;
            },
            // 注册 和 忘记密码点击按钮公用函数
            register_reset : function  (params) {

                // 原始方法
                var phone = $('#' + params.phone).val().trim(),
                    pswd = $('#'+ params.pswd).val().trim(),
                    sms_code = $('#' + params.smsCode).val().trim(),
                    smsId = params.smsId,
                    errorTip = '';

                // 基本校验
                var b_phone = public.checkPhone(phone),
                    b_pswd = public.checkPswd(pswd),
                    b_checkSms = public.checkSms(sms_code);

                if (!b_phone['isOk']) {
                    errorTip += b_phone.errorMsg + '<br/>';
                } else if (!b_pswd['isOk']) {
                    errorTip += b_pswd.errorMsg + '<br/>';
                } else if (!b_checkSms['isOk']) {
                    errorTip += b_checkSms.errorMsg + '<br/>';
                };

                // 校验结果
                if (b_phone.isOk && b_pswd.isOk && b_checkSms.isOk) {
                    if (smsId === '') {
                        public.Dialog({
                            'content': '请发送短信验证',
                            'isConfirm': false
                        });
                    };
                    // 清空数据
                    public.cleanAllVal($('.' + params.tag));
                    console.log('mobile:' + phone, 'code: ' + sms_code, 'password: ' +  pswd, 'smsId: ' + smsId);
                    public.getAjax({
                        type : 'post',
                        data : {
                            'mobile' : phone,
                            'code' : sms_code,
                            'password' : hex_md5(pswd),
                            'smsId' : smsId
                        },
                        path : params.path,
                        sCallback : function (result) {
                            if ('0000' === result.code) {
                                // 忘记密码----注册功能需要区分判断(未做)
                                public.Dialog({
                                    'content': '修改成功',
                                    'AutoClose': true
                                });
                                /*$('#username').val(phone);*/
                                $('.register-login').trigger('click');
                                $('#pswd, #username').val('');
                                $('#reset_getCode').val('发送验证码').css({
                                    'backgroundColor': '#ffb425',
                                    'cursor' :'pointer'
                                }).removeAttr('disabled');
                                clearInterval(public.timer);
                            } else {
                                public.Dialog({
                                    'content': result.msg,
                                    'isConfirm': false
                                });
                            };
                        }
                    });
                } else {
                    public.Dialog({
                        'content': errorTip,
                        'isConfirm': false
                    });
                };
            },

            // 通用调用ajax请求
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
            getAjax : function (param) {
                var type = param.type || 'post';
                if (type === 'get') {
                    data = param.data;
                } else {
                    data = JSON.stringify(param.data);
                };

                var host = param.host || this.host.pms;
                $.ajax({
                    type: type,
                    async: true,
                    url: host + param.path,
                    data: data,
                    contentType: "application/json",
                    dataType: "json",
                    success: function(json){
                        param.sCallback && param.sCallback(json);
                    },
                    error: function(){
                        param.fCallback && param.fCallback();
                    }
                });
            },
            /* 弹窗插件
                前提: 相对body定位
                 参数说明：
                    params ={
                         title: '温馨提醒',							// 窗口标题，默认标题为：消息提醒
                         content: '请输入商户账号！<br> ',			// 提醒内容，如果参数为空，则提示：提示内容为空
                         width:  '600',								// 窗口宽度，窗口默认宽度300
                         closeTime : 3000							// 关闭时间，默认关闭时间3秒
                     }
            */
            /*Dialog : function (params) {
                var title = params.title || '消息提醒',
                    content = params.content || '提示内容为空',
                    width = parseInt(params.width) || 300,
                    closeTime = parseInt(params.closeTime) || 3000;

                // close
                $('#yzl_dialog').css('display', 'block').stop().animate({opacity : 1}, 300)
                $('#dialog_button, #yzl_close_btn').click(function () {
                    $('#yzl_dialog').stop().animate({opacity : 0}, 400).css('display', 'none');
                    clearTimeout(public.timer);
                });
                // 内容填充
                $('#yzl_dialog_title').html(title);
                $('#yzl_dialog_content>p').html(content);

                // 居中页面
                var height = $('#yzl_dialog').height() || 160;

                $('#yzl_dialog').width(width);

                $('#yzl_dialog').css({
                    'position': 'absolute',
                    'left' : '50%',
                    'top' : '50%',
                    'margin-left': -width/2 +'px',
                    'margin-top': -300 + 'px'
                });

                clearTimeout(public.timer);
                public.timer = setTimeout(function () {
                    $('#yzl_dialog').animate({opacity : 0}, 400).css('display', 'none');
                }, closeTime);

            }*/
            /* 弹窗插件
             前提: 相对body定位
             参数说明：
             params ={
                 title: '温馨提醒',							// 窗口标题，默认标题为：消息提醒
                 content: '请输入商户账号！<br> ',			// 提醒内容，如果参数为空，则提示：提示内容为空
                 width:  '600',								// 窗口宽度，窗口默认宽度300
                 closeTime : 3000							// 关闭时间，默认关闭时间3秒
                 AutoClose: false							// 是否自动关闭
                 callback 									// 如果不自动关闭，则点击确定返回true,否则为false
                 isConfirm									// 是否开启按enter键，默认点击确定键
             }
             */
            Dialog : function (params) {
                var that = this,
                    title = params.title || '消息提醒',
                    content = params.content || '提示内容为空',
                    width = parseInt(params.width) || 300,
                    closeTime = parseInt(params.closeTime) || 3000,
                    autoClose = params.AutoClose,
                    isTurnOnConfirmBtn = true;

                if (params.isConfirm == false) {
                    isTurnOnConfirmBtn = false;
                };

                // confirm
                function confirmBtn() {
                    $('#yzl_dialog').stop().animate({opacity : 0}, 400).css('display', 'none');
                    params.callback && params.callback(true);
                }

                // close cancel
                $('#yzl_dialog').css('display', 'block').stop().animate({opacity : 1}, 300)
                if (autoClose) {
                    $('#dialog_button, #yzl_close_btn').unbind('click').click(function () {
                        $('#yzl_dialog').stop().animate({opacity : 0}, 400).css('display', 'none');
                        clearTimeout(that.Dialogtimer);
                    });
                } else {	// confirmbtn
                    $('#dialog_button').unbind('click').click(confirmBtn);
                    $('#yzl_close_btn').unbind('click').click(function () {
                        $('#yzl_dialog').stop().animate({opacity : 0}, 400).css('display', 'none');
                        params.callback && params.callback(false);
                    });
                };

                if (isTurnOnConfirmBtn) {
                    $(document).unbind('keydown').keydown(function (e) {
                        var keycode = e.keyCode? e.keyCode : e.which? e.which : e.charCode;
                        if (keycode == 13) {
                            confirmBtn();
                        };
                    });
                };



                // 内容填充
                $('#yzl_dialog_title').html(title);
                $('#yzl_dialog_content>p').html(content);

                // 居中页面
                var height = $('#yzl_dialog').height() || 160;

                $('#yzl_dialog').width(width);

                $('#yzl_dialog').css({
                    'position': 'fixed',
                    'left' : '50%',
                    'top' : '50%',
                    'margin-left': -width/2 +'px',
                    'margin-top': -200 + 'px'
                });

                if (autoClose) {
                    clearTimeout(that.Dialogtimer);
                    that.Dialogtimer = setTimeout(function () {
                        $('#yzl_dialog').animate({opacity : 0}, 400).css('display', 'none');
                    }, closeTime);
                };
            },

        };
        // 注册
        var register = {
            // 事件绑定
            BindEvent : function () {
                var that = this;
                // 接收短信返回id
                var getSmsId = '';
                // 短信验证
                $('#getSmsCode').click(function () {
                    // 原始方法
                    /*var val = $('#register_phone').val().trim();

                    if (!public.checkPhone(val)['isOk']) {
                        public.Dialog({
                            'content': public.checkPhone(val).errorMsg
                        });
                    } else {
                        public.countdown(this);
                        public.getAjax({
                            type : 'get',
                            data : {
                                'mobile' : val
                            },
                            path: 'action/api/getCode',
                            sCallback : function (data) {
                                if (data.code === '0000') {
                                    getSmsId = data.data.smsId;
                                    console.log(getSmsId);
                                } else {
                                    public.Dialog({
                                        'content': data.msg
                                    });
                                };
                            },
                            fCallback : function () {
                                public.Dialog({
                                    'content': '请求出错'
                                });
                            }
                        });
                    };*/
                    var params = {
                        elem : this,
                        phone : 'register_phone',
                        success : function (result) {
                            getSmsId = result;
                        }
                    };
                    public.sendSms(params);
                });

                // 用户注册
                $('#custom_register').click(function () {
                    // 原始方法
                   /* // 原始方法
                     var phone = $('#register_phone').val().trim(),
                     pswd = $('#login_pswd').val().trim(),
                     sms_code = $('#sms_code').val().trim(),
                     smsId = getSmsId,
                     errorTip = '';

                     // 基本校验
                     var b_phone = public.checkPhone(phone),
                     b_pswd = public.checkPswd(pswd),
                     b_checkSms = public.checkSms(sms_code);

                     if (!b_phone['isOk']) {
                     errorTip += b_phone.errorMsg + '<br/>';
                     } else if (!b_pswd['isOk']) {
                     errorTip += b_pswd.errorMsg + '<br/>';
                     } else if (!b_checkSms['isOk']) {
                     errorTip += b_checkSms.errorMsg + '<br/>';
                     };

                     // 校验结果
                     if (b_phone.isOk && b_pswd.isOk && b_checkSms.isOk) {
                     if (smsId === '') {
                     public.Dialog({
                     'content': '请发送短信验证'
                     });
                     };
                     // 清空数据
                     public.cleanAllVal($('.register'));
                     console.log('mobile:' + phone, 'code: ' + sms_code, 'password: ' +  pswd, 'smsId: ' + smsId);
                     public.getAjax({
                     type : 'get',
                     data : {
                     'mobile' : phone,
                     'code' : sms_code,
                     'password' : pswd,
                     'smsId' : smsId
                     },
                     path : '/account/j/regist',
                     sCallback : function (result) {
                     if ('0000' === result.code) {
                     $('#username').val(phone);
                     $('.register-login').trigger('click');
                     } else {
                     public.Dialog({
                     'content': result.msg
                     });
                     };
                     }
                     });
                     } else {
                     public.Dialog({
                     'content': errorTip
                     });
                     };*/
                    // 抽取公用方法
                    var params = {
                        phone : 'register_phone',
                        pswd : 'login_pswd',
                        smsCode : 'sms_code',
                        smsId : getSmsId,
                        tag : 'register',
                        path : '/account/j/regist'
                    };

                    public.register_reset(params);

                });
            }
        };

        // 登录
        var login = {
            // 事件绑定
            BindEvent : function () {
                var that = this;
                // login main fun
                var loginFun = function () {
                    var username = $('#username').val().trim(),
                        pswd = $('#pswd').val().trim(),
                        verifyCode = $('#verifyCode').val().trim(),
                        errorMsg = '';

                    // 基本验证
                    if (!username) {
                        errorMsg += '账号不能为空' + '<br/>';
                    };
                    if (!pswd) {
                        errorMsg += '密码不能为空' + '<br/>';
                    };
                    if (!verifyCode) {
                        errorMsg += '验证码不能为空' + '<br/>';
                    };

                    // 验证结果
                    if (username && pswd && verifyCode) {
                        public.getAjax({
                            data : {
                                'account': username,
                                'captcha': verifyCode,
                                'password' : hex_md5(pswd)
                            },
                            path : '/account/j/login',
                            type : 'get',
                            sCallback : function (result) {
                                if ('0000' === result.code) {
                                    window.location.replace(yzlObj.loginDirectory);
                                } else {
                                    if ("0020" === result.code) {
                                        $('#verifyCode').val('');
                                    } else {
                                        $('#pswd, #username, #verifyCode').val('');
                                    };
                                    public.Dialog({
                                        'content': result.msg,
                                        'AutoClose': true,
                                        'isConfirm': false
                                    });
                                    that.codeChange();
                                };
                            }
                        });
                    } else {
                        public.Dialog({
                            'content': errorMsg,
                            'AutoClose': true,
                            'isConfirm': false
                        });
                    };
                }
                // 点击登录按钮
                $('.login-btn').click(loginFun);

                $(document).keydown(function (e) {
                    var keycode = e.keyCode? e.keyCode : e.which? e.which : e.charCode;
                    if (keycode == 13) {
                        loginFun();
                    };
                });

                // 点击切换验证码1
                $('#codeImage').click(function () {
                    that.codeChange();
                });
                // 点击切换验证码2
               /* $('#verifyCode').focus(function () {
                    // $(this).val('');
                    that.codeChange();
                });*/
            },
            // 切换验证码
            codeChange : function (){
                var time = new Date().getTime();
                $('#codeImage').attr('src', '/yzlpms/account/j/captcha?type='+time)
                $('#codeValue').val(time);
            }
        };

        // 忘记密码
        var reset_pswd = {
            // 事件绑定
            BindEvent : function () {
                var that = this;
                // 接收短信返回id
                var getSmsId = '';
                // 发送验证码：
                $('#reset_getCode').click(function () {
                    var params = {
                        elem : this,
                        phone : 'reset_phone',
                        success : function (result) {
                            getSmsId = result;
                        }
                    };
                    public.sendSms(params);
                    // 原始方法
                    /*var val = $('#reset_phone').val().trim();

                    if (!public.checkPhone(val)['isOk']) {
                        public.Dialog({
                            'content': public.checkPhone(val).errorMsg
                        });
                    } else {
                        public.countdown(this);
                        public.getAjax({
                            type : 'get',
                            data : {
                                'mobile' : val
                            },
                            path: 'action/api/getCode',
                            sCallback : function (data) {
                                if (data.code === '0000') {
                                    getSmsId = data.data.smsId;
                                    console.log(getSmsId);
                                } else {
                                    public.Dialog({
                                        'content': data.msg
                                    });
                                };
                            },
                            fCallback : function () {
                                public.Dialog({
                                    'content': '请求出错'
                                });
                            }
                        });
                    };*/
                });

                // 点击重置密码按钮
                $('.reset-btn').click(function () {

                    // 抽取公共方法
                    var params = {
                        phone : 'reset_phone',
                        pswd : 'reset_newPswd',
                        smsCode : 'reset_verifyCode',
                        smsId : getSmsId,
                        tag : 'reset-pswd',
                        path : '/account/j/findPassword'
                    };

                    public.register_reset(params);
                });
            }
        };


        // 统一调用
        register.BindEvent();
        login.BindEvent();
        reset_pswd.BindEvent();


    })(window, document, jQuery);

});
