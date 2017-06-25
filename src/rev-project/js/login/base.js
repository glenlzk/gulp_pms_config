/**
 * Created by Glen on 2016/10/23.
 */

$(function () {

    ;(function (window, document, $, undefined) {

        // 点击登录---注册按钮
        $('.login-register').click(function () {
            cleanAllVal('.login');
            loginBtn ($('.login'), $('.register'));
        });

        // 点击登录---忘记密码按钮
        $('.login-forget').click(function () {
            cleanAllVal('.login');
            loginBtn ($('.login'), $('.reset-pswd'));
        });

        // 登录窗口统一分装
        function loginBtn (elem1, elem2) {
            elem1.css({
                'display': 'none',
            });
            elem2.css({
                'display': 'block',
                'opacity' : 0,
                'left' : '74%'
            }).animate({
                'opacity': 1,
                'left' : '50%'
            }, 500);
        };


        // 注册---登录按钮
        $('.register-login').click(function () {
            cleanAllVal('.register');
            $('.register, .reset-pswd').css({
                'display': 'none',
                'opacity' : 0
            });
            $('.login').css({
                'display': 'block',
                'opacity' : 0,
                'left' : '50%'
            }).animate({
                'opacity': 1,
                'left' : '74%'
            }, 500);
        });

        // 注册---忘记密码按钮
        $('.register-forget').click(function () {
            cleanAllVal('.register');
            $('.register').css({
                'display': 'none',
                'opacity' : 0
            });
            $('.reset-pswd').css({
                'display': 'block',
                'opacity' : 0,
                'left' : '50%'
            }).animate({
                'opacity': 1
            }, 500);
        });

        // 重置密码----注册按钮
        $('.reset-register').click(function () {
            cleanAllVal('.reset-pswd');
            $('.reset-pswd').css({
                'display': 'none',
                'opacity' : 0
            });
            $('.register').css({
                'display': 'block',
                'opacity' : 0,
                'left' : '50%'
            }).animate({
                'opacity': 1
            }, 500);
        });

        // 重置密码---显示/关闭密码
        $('.pswd-eye').click(function (e) {
            e.preventDefault();
            var pswd_Val = $('.new-pswd').val();
                $(this).toggleClass('open-eye');

            if ($(this).hasClass('open-eye')) {
                $('.new-pswd').replaceWith('<input type="text" placeholder="新密码" class="fl new-pswd" id="reset_newPswd">');
                $('.new-pswd').val(pswd_Val);
            } else {
                $('.new-pswd').replaceWith('<input type="password" placeholder="新密码" class="fl new-pswd" id="reset_newPswd">');
                $('.new-pswd').val(pswd_Val);
            };
        });

        // 清除val值
        function cleanAllVal(par) {
            $(par).find('input[type=password], input[type=text]').val('');
        }



    })(window, document, jQuery);


});
