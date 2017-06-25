/**
 * Created by glen on 2016/10/27.
 */
;(function (window, document, $, yzl) {

    var paymentManage = new Vue({
        el : '#paymentManage',
        data: {
        	addpaymentMethod:'',
            paymentMethod:'',
            //权限管理
            settingResourceInfo : yzl.resourceInfo,
        },
        methods: {
            // 初始化事件
            initEvent: function () {
                this.initData();
            },
            // 初始化数据
            initData: function () {
            	var _self = this;
                var data = {
                    hotelId: yzl.hotelId
                };
                yzl.getAjax({
                    path : 'payType/j/list',
                    type : 'get',
                    data : data,
                    fadeInElem: '#paymentManage',
                    loadingElem: '#mianContent',
                    tips: false,
                    loadingTop: 300,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.paymentMethod = result.data;
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });
            },
            //支付管理---添加支付方式
            addPayment : function(){
            	var _self = this;
            	console.log($('.add-btn input').val().length);
            	if($('.add-btn input').val() == ''){
            		yzl.Dialog({
                        content : '请输入支付方式名称',
                        AutoClose: false
                    });
                    return;
            	}else if($('.add-btn input').val().length > 18){
            		yzl.Dialog({
                        content : '支付名称过长，请重新输入',
                        AutoClose: false
                    });
                    $('.add-btn input').val('');
                    return;
            	}else{
            		var data = {
            			payTypeName:_self.addpaymentMethod,
            			hotelId: yzl.hotelId
            		};
            		yzl.getAjax({
	                    path : 'payType/j/add',
	                    type : 'post',
	                    data : data,
	                    sCallback : function (result) {
	                        if (result.code == "0000") {
	                            _self.paymentMethod.hotelPayTypelist.push({payTypeName:_self.addpaymentMethod});
            					_self.addpaymentMethod = '';
            					_self.initData();
	                        } else {
	                            yzl.Dialog({
	                                content : result.msg,
	                                AutoClose: true
	                            });
	                        };
	                    }
	                });
            	}
            },
            //支付管理---删除支付方式
            delPayment : function(item){
            	var _self = this;
            	yzl.Dialog({
                    content : '是否确认删除该支付方式',
                    AutoClose: false,
                    callback : function(callback){
                    	var data = {
                    		hotelId:yzl.hotelId,
                    		hotelPayTypeId:item.hotelPayTypeId
                    	};
                    	if(callback == true){
                    		yzl.getAjax({
			                    path : 'payType/j/delete',
			                    type : 'post',
			                    data : data,
			                    sCallback : function (result) {
			                        if (result.code == "0000") {
			                            _self.paymentMethod.hotelPayTypelist.$remove(item);
			                            _self.initData();
			                        } else {
			                            yzl.Dialog({
			                                content : result.msg,
			                                AutoClose: true
			                            });
			                        };
			                    }
			                });
                    		
                    	}
                    }
                });
            	
            },
		}
		
    });
    paymentManage.initEvent();
    
	//支付管理--=限制支付方式名不能为空
//          $('.paymentManage li input').blur(function(){
//          	console.log($(this).val().trim());
//          	if($(this).val().trim() == ''){
//          		alert('支付方式名不能为空！');
//          		$(this).focus();
//          	}
//          })
   

})(window, document, jQuery, yzlObj);