//获取url对应参数
function GetQueryString(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}
// 全局对象
var yzlObj = yzlObj || {};
// 基本公共调用函数
	;(function (window, document, $, basic) {

		var _w = window,
			_d = _w.document;

		yzlObj = {
			host : {
				'pms' : '/yzlpms/'
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
				var that = this;
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
					url: that.host.pms + param.path,
					data: data,
					contentType: "application/json",
					dataType: "json",
					success: function(json){
						if (6000 == json.code) {
							yzlObj.Dialog({
								content : json.msg,
								AutoClose: false,
								callback: function () {
									window.location.replace('/hotel/login.html');
								}
							});

							setTimeout(function () {
								window.location.replace('/hotel/login.html');
							}, 2000);

						} else {
							param.sCallback && param.sCallback(json);
						};
					},
					statusCode:{
						404:function(){
							that.Dialog({
								content : '页面未找到!'
							});
						},
						503:function(){
							that.Dialog({
								content : '服务器内部出错!'
							});
						}
					},
					error: function(e){
						param.fCallback && param.fCallback(e);
					}
				});
			},
			
	};
	//门锁管理页面
    var printVue = new Vue({
        el : '#Sideturnover-window',
        data: {
			SideturnoverformInfo:{}
        },
        methods: {
            // 初始化事件
            initEvent: function () {
            	var _self = this;
				yzlObj.getAjax({
                    path : 'changeShift/j/viewChange', 
                    type : 'post',
                    data : {
                    	hotelId:GetQueryString('hotelId'),
                    	changeShiftId:GetQueryString('changeShiftId')
                    },
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.SideturnoverformInfo = result.data;
                            Vue.nextTick(function () {
                            	//设置网页打印的页眉页脚为空
								function pagesetup_null(){                
						            var  hkey_root,hkey_path,hkey_key;
						            hkey_root="HKEY_CURRENT_USER"
						            hkey_path="\\Software\\Microsoft\\Internet Explorer\\PageSetup\\";
						            try{
			                            var RegWsh = new ActiveXObject("WScript.Shell");
			                            hkey_key="header";
				                        RegWsh.RegWrite(hkey_root+hkey_path+hkey_key,"");
				                        hkey_key="footer";
				                        RegWsh.RegWrite(hkey_root+hkey_path+hkey_key,"");
					                }catch(e){}
						        };
								window.print();
							});
                        } else {
                            yzlObj.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
            },            
        }
    });
	printVue.initEvent();

	})(window, document, jQuery, yzlObj);
