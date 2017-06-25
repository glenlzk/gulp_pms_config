/**
 * Created by glen on 2016/10/27.
 */

// 去除空格
if (typeof String.prototype.trim != 'undefined') {
	String.prototype.trim = function(){
		return this.replace(/(^\s*)|(\s*$)/g, "");
	};
};
// 日期格式化插件
if (typeof Date.prototype.format == 'undefined') {
	Date.prototype.format = function (mask) {

		var d = this;
		var zeroize = function (value, length) {
			if (!length) length = 2;
			value = String(value);
			for (var i = 0, zeros = ''; i < (length - value.length); i++) {
				zeros += '0';
			}
			return zeros + value;
		};

		return mask.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|M{1,4}|m{1,2}|yy(?:yy)?|([hHMstT])\1?|[lLZ])\b/g, function ($0) {
			switch ($0) {
				case 'd': return d.getDate();		//Date：返回的格式形式
				case 'dd': return zeroize(d.getDate());
				case 'ddd': return ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][d.getDay()];
				case 'dddd': return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
				case 'M': return d.getMonth() + 1;		//Month：返回的格式形式
				case 'MM': return zeroize(d.getMonth() + 1);
				case 'MMM': return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
				case 'MMMM': return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()];
				case 'yy': return String(d.getFullYear()).substr(2);	//Year：返回的格式形式
				case 'yyyy': return d.getFullYear();
				case 'h': return d.getHours() % 12 || 12;			//hours：返回的格式形式
				case 'hh': return zeroize(d.getHours() % 12 || 12);
				case 'H': return d.getHours();
				case 'HH': return zeroize(d.getHours());
				case 'm': return d.getMinutes();				//分：返回的格式形式
				case 'mm': return zeroize(d.getMinutes());
				case 's': return d.getSeconds();				//秒：返回的格式形式
				case 'ss': return zeroize(d.getSeconds());
				case 'l': return zeroize(d.getMilliseconds(), 3);	//毫秒：返回的格式形式
				case 'L': var m = d.getMilliseconds();
					if (m > 99) m = Math.round(m / 10);
					return zeroize(m);
				case 'tt': return d.getHours() < 12 ? 'am' : 'pm';	//am或者pm
				case 'TT': return d.getHours() < 12 ? 'AM' : 'PM';	//AM或者PM
				case 'Z': return d.toUTCString().match(/[A-Z]+$/);
				// Return quoted strings with the surrounding quotes removed
				default: return $0.substr(1, $0.length - 2);
			};
		});
	};
};


// 全局对象
var yzlObj = yzlObj || {};

/**
 * floatObj 包含加减乘除四个方法，能确保浮点数运算不丢失精度
 *
 * 我们知道计算机编程语言里浮点数计算会存在精度丢失问题（或称舍入误差），其根本原因是二进制和实现位数限制有些数无法有限表示
 * 以下是十进制小数对应的二进制表示
 *      0.1 >> 0.0001 1001 1001 1001…（1001无限循环）
 *      0.2 >> 0.0011 0011 0011 0011…（0011无限循环）
 * 计算机里每种数据类型的存储是一个有限宽度，比如 JavaScript 使用 64 位存储数字类型，因此超出的会舍去。舍去的部分就是精度丢失的部分。
 *
 * ** method **
 *  add / subtract / multiply /divide
 *
 * ** explame **
 *  0.1 + 0.2 == 0.30000000000000004 （多了 0.00000000000004）
 *  0.2 + 0.4 == 0.6000000000000001  （多了 0.0000000000001）
 *  19.9 * 100 == 1989.9999999999998 （少了 0.0000000000002）
 *
 * floatObj.add(0.1, 0.2) >> 0.3
 * floatObj.multiply(19.9, 100) >> 1990
 *
 */
yzlObj.floatObj = function() {

	/*
	 * 判断obj是否为一个整数
	 */
	function isInteger(obj) {
		return Math.floor(obj) === obj
	}

	/*
	 * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
	 * @param floatNum {number} 小数
	 * @return {object}
	 *   {times:100, num: 314}
	 */
	function toInteger(floatNum) {
		var ret = {times: 1, num: 0}
		if (isInteger(floatNum)) {
			ret.num = floatNum
			return ret
		}
		var strfi  = floatNum + ''
		var dotPos = strfi.indexOf('.')
		var len    = strfi.substr(dotPos+1).length
		var times  = Math.pow(10, len)
		var intNum = parseInt(floatNum * times + 0.5, 10)
		ret.times  = times
		ret.num    = intNum
		return ret
	}

	/*
	 * 核心方法，实现加减乘除运算，确保不丢失精度
	 * 思路：把小数放大为整数（乘），进行算术运算，再缩小为小数（除）
	 *
	 * @param a {number} 运算数1
	 * @param b {number} 运算数2
	 * @param digits {number} 精度，保留的小数点数，比如 2, 即保留为两位小数
	 * @param op {string} 运算类型，有加减乘除（add/subtract/multiply/divide）
	 *
	 */
	function operation(a, b, digits, op) {
		var o1 = toInteger(a)
		var o2 = toInteger(b)
		var n1 = o1.num
		var n2 = o2.num
		var t1 = o1.times
		var t2 = o2.times
		var max = t1 > t2 ? t1 : t2
		var result = null
		switch (op) {
			case 'add':
				if (t1 === t2) { // 两个小数位数相同
					result = n1 + n2
				} else if (t1 > t2) { // o1 小数位 大于 o2
					result = n1 + n2 * (t1 / t2)
				} else { // o1 小数位 小于 o2
					result = n1 * (t2 / t1) + n2
				}
				return result / max
			case 'subtract':
				if (t1 === t2) {
					result = n1 - n2
				} else if (t1 > t2) {
					result = n1 - n2 * (t1 / t2)
				} else {
					result = n1 * (t2 / t1) - n2
				}
				return result / max
			case 'multiply':
				result = (n1 * n2) / (t1 * t2)
				return result
			case 'divide':
				result = (n1 / n2) * (t2 / t1)
				return result
		}
	}

	// 加减乘除的四个接口
	function add(a, b, digits) {
		return operation(a, b, digits, 'add')
	}
	function subtract(a, b, digits) {
		return operation(a, b, digits, 'subtract')
	}
	function multiply(a, b, digits) {
		return operation(a, b, digits, 'multiply')
	}
	function divide(a, b, digits) {
		return operation(a, b, digits, 'divide')
	}

	// exports
	return {
		add: add,
		subtract: subtract,
		multiply: multiply,
		divide: divide
	}
}();

$(function () {
	// 基本公共调用函数
	;(function (window, document, $, yzl) {

		var _w = window,
			_d = _w.document,
			globalObject = {};

        globalObject = {
			hotelId : sessionStorage.getItem("Cookie_hotelId"),	// $.cookie('hotelId')
			resourceInfo: {},
			// websocketUrl: '192.168.0.155',	/* 192.168.7.173:8080*/
			// swf: 'js/plugin/uploadify/uploadify.swf',	/*js/global/uploadify.swf*/
			roomStatusWebsocket: null,
			reg : {
				phoneNo : /^1[34578]\d{9}$/,
				Chinese : /[\u4e00-\u9fa5]+/g,
				email : /^\s*[a-zA-Z0-9]+(([\._\-]?)[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([_\-][a-zA-Z0-9]+)*(\.[a-zA-Z0-9]+([_\-][a-zA-Z0-9]+)*)+\s*$/g,
				url: /(http\:\/\/)?([\w.]+)(\/[\w\- \.\/\?%&=]*)?/gi,
				LetterNum: /[a-zA-Z0-9]+/g
			},
            isHasFlash: true,
			errorImgUrl: './images/index/acconut_icon.png',
			errorPersonImgUrl: './images/index/acconutPerson_icon.png',
            replaceErrorImg: function  (event) {
				var e = event || window.event;
                e.target.src = this.errorImgUrl;
			},
			replaceErrorPersonImg: function  (event) {
				var e = event || window.event;
                e.target.src = this.errorPersonImgUrl;
			},
			// 弹窗清除定时器
			timer : null,
			/*host : {
				'pms' : '/yzlpms/'
			},*/
			// ajax请求不到数据---储存提示信息
			noDataElemList: [],
			// 保留数字为两位小数----如:10 10.1 10.129
			keepTwoDecimal: function (num) {
				var sNum = num + '';
				var index = sNum.indexOf('.');
				if (index == -1) {
					return Number(num).toFixed(2);
				} else {
					var aNum = sNum.split('.')[1];
					if (aNum.length == 1) {
						return Number(num).toFixed(2);
					} else if (aNum.length == 2) {
						return num;
					} else if (aNum.length >= 3) {
						return sNum.substring(0,index+3);
					};
				};
			},
			// 判断谷歌浏览器
            isChromeBrowser: function(){
                var userAgent = window.navigator.userAgent.toLowerCase();

                if (/(chrome)\D+(\d[\d.]*)/.test(userAgent)){
                	return true;
                };

                return false;
            },
			// 通用调用ajax请求
			/* // 参数说明
			 param = {
				 data : data,  // 传参
				 host : host,  // 主机名+端口
				 path : path,   // 具体路劲,
				 type : type,    // 默认不传为post请求,get请求需要特殊说明
				 sCallback : sCallback,   // 成功回调
				 fCallback : fCallback,   // 失败回调,
			 	 loadingElem: '',  		// 指定需要显示需要加载的元素
			 	 fadeInElem: '',		// 加载完成后，fadeIn
			 	 tips: boolean,			// 是否显示加载tips布尔值, 默认显示
			 	 loadingTop: Number,		// loadingTop值
			 };
			 */
			getAjax : function (param) {
				var that = this,
					type = param.type || 'post',
					loadingElem = param.loadingElem || '',
					fadeInElem = param.fadeInElem || '',
					loadingTop = param.loadingTop || 150,
					timeOut = param.timeout || 20000,
					tips = param.tips;

				if (type === 'get') {
					var data = param.data;
				} else {
					var data = JSON.stringify(param.data);
				};
				if (loadingElem != '' && $('#second_loading').length == 0) {
                    that.showLoadingTips({
                        top: loadingTop,		// loading展示的top值位置
						tips: tips,				// 是否显示文字提示
                        parElem: loadingElem	// 插入指定元素中
                    });
				};

				var host = param.host || yzl.host.pms;
                var ajaxFun = $.ajax({
					type: type,
					async: true,
					url: that.host.pms + param.path,
                    timeout : timeOut, //超时时间设置，单位毫秒
					data: data,
					contentType: "application/json",
					dataType: "json",
					success: function(json){
						if (6000 == json.code) {
							yzlObj.Dialog({
								content : json.msg,
								AutoClose: false,
								callback: function () {
									window.location.replace(yzlObj.loginoutDirectory);
								}
							});

							setTimeout(function () {
								window.location.replace(yzlObj.loginoutDirectory);
							}, 2000);

						} else {
							param.sCallback && param.sCallback(json);
                            if (loadingElem != '' && $('#second_loading').length > 0) {
                            	setTimeout(function () {
                                    $('#second_loading').fadeOut(200).remove();
								}, 200);
							};
                            if (fadeInElem != '') {
                                $(fadeInElem).fadeIn(100);
							};
                            if (that.noDataElemList.length > 0) {
                                // 删除ajax获取无数据已存在的元素
                                that.removeNoDataElems(true);
							};
						};
					},
                    complete: function(XMLHttpRequest,status){ //请求完成后最终执行参数
                        if(status=='timeout'){					//超时,status还有success,error等值的情况
                            ajaxFun.abort();

                            if (loadingElem != '' && $('#second_loading').length > 0) {
								$('#second_loading').fadeOut(200).remove();
                            };

                            that.Dialog({
                                content : '请求超时!',
                                AutoClose: true
                            });
                        };
                    },
					statusCode:{
						404:function(){
                            that.Dialog({
                                content : '页面未找到!',
                                AutoClose: false,
                                callback: function () {
                                    window.location.replace(yzlObj.loginoutDirectory);
                                }
                            });
						},
						503:function(){
                            that.Dialog({
                                content : '服务器内部出错!',
                                AutoClose: false,
                                callback: function () {
                                    window.location.replace(yzlObj.loginoutDirectory);
                                }
                            });
						}
					},
					error: function(e){
						param.fCallback && param.fCallback(e);
					}
				});
			},
			// 只限制输入数字
			onlyIptNumber: function (value) {
				var reg = /^[0-9]+$/g;
				var noNumber = /[^0-9]/g;
				if (!reg.test((value).trim())) {
                    return (value).trim().replace(noNumber,"");
				};
				return value;
			},
			// 判断是否清除所插入的noDataElems
            removeNoDataElems: function (boln) {
				var that = this;
				var list = that.noDataElemList;
                var removeElem = null;
                for (var i=0; i<list.length; i++) {
                	if (boln) {	// true getAjax调用; false 或 不传 则页面调用
                        if (that.getHiddenParElem(list[i]['elemId'])) {
                            removeOper(list[i]);
                            that.noDataElemList.splice(i,1);
                        };
					} else {
                        removeOper(list[i]);
                        that.noDataElemList = [];
					};
                };

                function removeOper(arr) {
                    removeElem = document.getElementById(arr['elemId']);
                    if (removeElem) {
                        removeElem.parentNode.removeChild(removeElem);
                    };
				};
			},
            // 获取指定父级元素
            getHiddenParElem: function (targetElem) {
                var that = this;
                if (targetElem == null) return null;
                var target = document.getElementById(targetElem);

                if(!target) return false;
                var parElem = target.parentNode;

                while(parElem != null) {
                	if (that.getStyle(parElem, 'display') == 'none' || that.getStyle(parElem, 'visibility') == 'hidden') {
						return true;
					} else {
                        parElem = parElem.parentNode;
                        that.getHiddenParElem(parElem);
					};
                };
                return false;
            },
			// 获取指定元素的css,style等样式
            getStyle : function (obj, attr) {
				if (obj == document) return false;
                if (obj.currentStyle) {
                    return obj.currentStyle[attr];
                } else {
					return window.getComputedStyle(obj, null)[attr];
                };
            },
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
						clearTimeout(that.timer);
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

						if (keycode == 13 || keycode == 32) {
							// focus必须跟随click，否则按enter会触发多次点击事件，窗口会关了又弹
							$('#dialog_button').focus().click();
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
					clearTimeout(that.timer);
					that.timer = setTimeout(function () {
						$('#yzl_dialog').animate({opacity : 0}, 400).css('display', 'none');
					}, closeTime);
				};
			},

			/* 弹窗插件
			 参数说明：
				 params ={
					 content: '请输入商户账号！<br> ',	// 提醒内容，如果参数为空，则提示：提示内容为空
			 		 confirmBtn: '',					// 确定按钮自定义文字，默认为"确定"
					 callback: function () {			// 如果不自动关闭，则点击确定返回true,否则为false

					 }
				 }
			 */
			// 有遮罩层的弹窗----取消和确定按钮
			maskDialog: function (params) {
				if (params.content === "") return;
				var that = this,
					content = params.content,
					// 确定按钮文字，自定义
					confirmBtn = params.confirmBtn || '确定';

                // 是否隐藏 取消按钮 默认展示
                // 是否隐藏 取消按钮 默认展示
                if (params.hideCancelBtn) {
                    $('#mask_dialog_cancel').css('display', 'none');
                    $('#mask_dialog_confirm').css('margin-left', 0);
                } else {
                    $('#mask_dialog_confirm').css('margin-left', '22px');
                    $('#mask_dialog_cancel').css('display', 'inline-block');
                };
				// block
				$('#maskDialog').css('display', 'block').stop().animate({opacity : 1}, 300);
				// 确定发送请求
				$('#mask_dialog_confirm').unbind('click').click(function (e) {
					$('#maskDialog').stop().animate({opacity : 0}, 400).css('display', 'none');
					params.callback && params.callback(true);
				});
				// 取消关闭弹窗
				$('#mask_dialog_cancel').unbind('click').click(function (e) {
					$('#maskDialog').stop().animate({opacity : 0}, 400).css('display', 'none');
					params.callback && params.callback(false);
				});
				// 内容填充
				$('#mask_dialog_content>p').html(content);
				$('#mask_dialog_confirm').html(confirmBtn);
			},

			/*  Jcrop 图片裁剪插件参数说明
					param = {
						id: '', 					//  preview最外盒子id
			 			target: '',					//  显示预览裁剪图片id
			 			uploadBtn: '',				//  点击上传裁剪信息按钮 id
			 			boxWidth: '', 				//  画布宽度		无需带参数  默认:300
			 			boxHeight: '',				// 	画布高度		无需带参数  默认:300
						imgId: '',					//  裁剪图片id
			 			callback: function (data) {		// 得到参数，执行上传操作
							disableStatus: ''           // 控制按钮禁用和启用状态
			 			}
					}
			* */
			Jcrop: function (param) {
				// Create variables (in this scope) to hold the API and image size
				var jcrop_api,
					boundx = param.boxWidth,
					boundy = param.boxHeight,
				// Grab some information about the preview pane
					$preview = $('#'+ param.id),
					$pcnt = $('#' + param.id + ' .preview-container'),
					$pimg = $('#'+ param.id +' .preview-container img'),

					xsize = $pcnt.width(),
					ysize = $pcnt.height(),

					boxWidth = param.boxWidth || 300,
					boxHeight = param.boxHeight || 300;

				$('#' + param.target ).Jcrop({
					onChange: updatePreview,
					onSelect: updatePreview,
					aspectRatio: 1,		/*xsize / ysize*/
					keySupport: false,
					boxWidth: boxWidth,
					boxHeight: boxHeight,
					setSelect: [0, 0, 200, 200]
				},function(){
					// Use the API to get the real image size
					var bounds = this.getBounds();
					boundx = bounds[0];
					boundy = bounds[1];
					// Store the API in the jcrop_api variable
					jcrop_api = this;

					// Move the preview into the jcrop container for css positioning
					$preview.appendTo(jcrop_api.ui.holder);
				});

				function updatePreview(c) {
					if (parseInt(c.w) > 0) {
						var rx = xsize / c.w;
						var ry = ysize / c.h;

						$pimg.css({
							width: Math.round(rx * boundx) + 'px',
							height: Math.round(ry * boundy) + 'px',
							marginLeft: '-' + Math.round(rx * c.x) + 'px',
							marginTop: '-' + Math.round(ry * c.y) + 'px'
						});

						$('#'+ param.uploadBtn).unbind('click').click(function () {
							var data = {
								imageId: param.imgId,	/* c.imgno */
								left: c.x,
								top: c.y,
								width: c.w,
								height: c.h
							};
							// 上传操作
							param.callback && param.callback(data);
						});
					}
				};
			},

			// 图片上传插件
			/*  param = {
			 * 		id: '',		// 上传按钮id
			 * 		data: {},	// 传参
			 * 		method: '',	// post或get请求	如果data传参，则必须是get请求方式
			 * 		url: '',	// 上传服务器地址
			 * 		sCallback: function (data) {	// 成功回调
			 *
			 * 		}
			 * }
			 * */
			InitUploadify: function (param) {
				var _self = this;

				if (param.id == '')  return;
				// 默认post请求
				method = param.method || 'post';

	             //上传插件初始化方法
	             $('#' + param.id).uploadify({
	                 // 选择文件后是否自动上传，默认为true
	                 'auto': true,
	                 // 单个文件大小，0为无限制，可接受KB,MB,GB等单位的字符串值 上传大文件 可参考使用手册说明
	                 'fileSizeLimit': '1MB',
	                 /*'width': 68,
	                 'height': 26,*/
	                // 文件描述
	                 'fileTypeDesc': 'Files',
	                 // 允许上传的文件类型 以分号分割
	                 'fileTypeExts': '*.gif; *.jpg; *.png;',
	                 // 请求方式"get"或者"post",默认为"post"   	如果需要传参时，必须用get
	                 'method': method,
	                 // 是否允许同时选择多个文件，默认为true
	                 'multi': true,
	                 // 队列的ID,一个存放上传文件div的ID
	                 'queueID': 'fileQueue',
	                 'buttonText': param.buttonText,
					 'width': param.width,
					 'height': param.height,
					 // FLash文件路径
	                 'swf': yzl.swf,
	                 'formData': param.data,
	                 /*'onUploadStart': function (file) {
	                     //传递参数
	                     $("#" + id).uploadify("settings", "formData", { 'strId': $("#hdId").val() });
	                 },*/
	                 //上传文件处理后台页面
	                 'uploader': param.url,
	                 //禁用和启用上传按钮
//	                 'hideButton': true,
					 // 初始化成功后回调
					 'onInit': function () {
						 // 项目初始化---隐藏  插件初始化显示
						 if ($(document.body).hasClass('hide-flash-block')) {
						 	setTimeout(function () {
                                $(document.body).removeClass('hide-flash-block');
							}, 200);
						 };
					 },
	                 //返回一个错误，选择文件的时候触发
	                 'onSelectError': function (file, errorCode, errorMsg) {
	                     switch (errorCode) {
	                         case -100:
	                         	_self.Dialog({
	                         		content: "上传的文件数量已经超出系统限制的" + $("#" + param.id).uploadify('settings', 'queueSizeLimit') + "个文件！",
	                         		AutoClose: true
	                         	});
	                             break;
	                         case -110:
	                         	_self.Dialog({
	                         		content: "文件 [" + file.name + "] 大小超出系统限制的" + $("#" + param.id).uploadify('settings', 'fileSizeLimit') + "大小！",
	                         		AutoClose: true
	                         	});
	                             break;
	                         case -120:
	                         	_self.Dialog({
	                         		content: "文件 [" + file.name + "] 大小异常！",
	                         		AutoClose: true
	                         	});
	                             break;
	                         case -130:
	                         	_self.Dialog({
	                         		content: "文件 [" + file.name + "] 类型不正确！",
	                         		AutoClose: true
	                         	});
	                             break;
	                     }
	                     return false;
	                 },
	                 //检测FLASH失败调用
	                 'onFallback': function () {
	                 	if (globalObject.isHasFlash) {
                            _self.Dialog({
                                content: "您未安装FLASH控件，无法上传图片！请安装FLASH控件后再试。",
                                AutoClose: true
                            });
                            globalObject.isHasFlash = false;
						};
	                 },
	                 //上传成功后触发，每个文件都触发
	                 'onUploadSuccess': function (file, data, response) {
	                     var result = eval('(' + data + ')');
	                     if (result.imgSrc != "0") {//置换按钮的背景图,uploadify在客户端生成的id为imgUpload-button
	                        param.sCallback && param.sCallback(data);
	                    } else {
	                    	_self.Dialog({
	                     		content: "上传失败",
	                     		AutoClose: true
	                     	});
	                    }
	                 },
	                 // 文件上传出错时触发，参数由服务端程序返回
	                 'onUploadError': function(file, errorCode, errorMsg, errorString) {
	                 	_self.Dialog({
                     		content: errorMsg,
                     		AutoClose: true
                     	});
	                 },
	            });
		     },
			// 检查数组里对象是否存在某个元素 返回boolean
			isArrElemEixt: function(arr,arrElem, aElem) {
				for (var i= 0, len=arr.length; i<len; i++) {
					if (arr[i][arrElem] == aElem) {
						return true;
					};
				};
				return false;
			},
			// loading插入到指定元素
			/*
			  参数说明:
				  id = 'second_loading'	根据id删除：删除插入的元素
				  params = {
					top: ,		// loading展示的top值位置
					parElem: ,	// 插入指定元素中
			 		background: // 默认背景色
				  }
			*/
			showLoadingTips: function (params) {
				var tips = params.tips;
				var box = null;
				var loading = null;

				if (params.parElem == document.body) {
                    box = $('<div id="second_loading" style="position: fixed;"></div>');
				} else {
                    box = $('<div id="second_loading" style="position: absolute;"></div>');
				};

				if (tips) {
                    loading = $('<div><img style="margin:0 auto;"src="images/index/loading2.gif" alt=""/><p style="text-align: center;font-size: 12px;background:transparent;">加载中...请稍后</p></div>');
				} else {
                    loading = $('<div><img style="margin:0 auto;"src="images/index/loading2.gif" alt=""/></div>');
				};
				var paddingTop = params.top||0;
				box.css({
					'width': '100%',
					'height': '100%',
					'left': 0,
					'top': 0,
					'padding-top': paddingTop + 'px',
					'zIndex': 999
				});
				loading.appendTo(box);
				$(params.parElem).append(box).css({'position': 'relative'});
			},
			// noData插入到指定元素
			/*
				 参数说明:
				 id = 'name' + timeStamp	根据id删除：删除插入的元素
				 param = {
					 top: ,		// 请求无数据时，top值位置
			 		 content: ,	// 请求无数据时，插入的提示内容
					 parElem: ,	// 请求无数据时，插入指定元素中
				 }
			 */
			noDataTips: function (param) {
				var that = this,
                	box = null,
                	content = param.content || '暂时无数据...',
                	ElemId =  'noData_' + new Date().getTime(),
					url = param.url || '';

                for (var i=0; i<that.noDataElemList.length; i++) {
                	if (that.noDataElemList[i]['url'] && that.noDataElemList[i]['url'] == url) {
                		return;
					};
				};

				var	obj = {
						elemId: ElemId,
                        url: url
					};

				that.noDataElemList.push(obj);

				box = $('<div id="'+ ElemId +'" style="position: absolute;">'+  content  +'</div>');

                var paddingTop = param.top||0;
                box.css({
                    'width': '100%',
                    'height': '100%',
                    'left': 0,
                    'top': 0,
                    'padding-top': paddingTop + 'px',
                    'zIndex': 199,
					'font-size': '12px',
					'text-align': 'center'
                });
                box.appendTo(box);
                $(param.parElem).append(box).css({'position': 'relative'});
			},
            // 插入文件加载完毕---回调
            fileloaded: function  (elem, callback) {
            	if (document.all) { //如果是IE	判定js是否加载完毕,回调
					elem.onreadystatechange = function () {
						if (elem.readyState == 'loaded' || elem.readyState == 'complete') {
							callback && callback();
						};
					};
				} else {
					elem.onload = function () {
						callback && callback();
					};
				};
                elem.onerror = function () {
					alert('文件加载出错');
                };
			},
            // 浮点数----正负数运算矫正  +-
            calcuResult: function (arr) {
				var num = 0;
				if (!(arr instanceof Array)) {
					return 0
				};

				for (var i=0; i<arr.length; i++) {
					if (arr[i] >= 0 && num >= 0) {
						// console.log(num, arr[i]);
						num = yzlObj.floatObj.add(num, arr[i]);
					} else if (arr[i] >= 0 && num < 0) {
						num = yzlObj.floatObj.subtract(arr[i], Math.abs(num));
					} else if (arr[i] < 0 && num >= 0) {
						// console.log(num, arr[i]);
						num = yzlObj.floatObj.subtract(num, Math.abs(arr[i]));
						// console.log('arr[i]<0' + num, arr[i]);
					} else if (arr[i] < 0 && num < 0) {
						num = -yzlObj.floatObj.add(Math.abs(num), Math.abs(arr[i]));
					};
				};

				return num;
			},
            // 浮点数----正负数运算矫正 *
            /*calcuMultiply: function (arr) {
                var num = 0;
                if (!(arr instanceof Array)) {
                    return 0
                };

                for (var i=0; i<arr.length; i++) {
                    if (arr[i] >= 0 && num >= 0) {
                        // console.log(num, arr[i]);
                        num = yzlObj.floatObj.multiply(num, arr[i]);
                    } else if ((arr[i] >= 0 && num < 0) || (arr[i] < 0 && num >= 0)) {
                        num = -yzlObj.floatObj.multiply(Math.abs(arr[i]), Math.abs(num));
                    } else if (arr[i] < 0 && num < 0) {
                        num = yzlObj.floatObj.multiply(Math.abs(num), Math.abs(arr[i]));
                    };
                };

                return num;
            },
            // 浮点数----正负数运算矫正 /  dividend 被除数  divisor 除数
            calcuDivde: function  (divisor, dividend) {
				var num = 0;

				if (divisor == 0 || !dividend) {
					console.log('除数不能为0 或 除数未传参');
				};
				if (!dividend) {
					dividend = 0;
					console.log('被除数未传参，则默认为0');
				};

				if (divisor > 0 && dividend >= 0) {
					num = yzlObj.floatObj.divide(dividend, divisor);
				} else if ((divisor > 0 && dividend < 0) || (divisor < 0 && dividend >= 0)) {
					num = -yzlObj.floatObj.divide(Math.abs(dividend), Math.abs(divisor));
				} else if (divisor < 0 && dividend < 0) {
					num = yzlObj.floatObj.divide(Math.abs(dividend), Math.abs(divisor));
				};

				return num;
			}*/
            // 模拟滚动条
			/*
				 outBox  最外层盒子对象 $('#box')
				 Bar, 	 滚动条
				 Scro, 	 滚动条盒子
				 Contet	 内容盒子

				 具体参阅：
			 			模拟垂直滚动条 glen.html
			*/
            scrollBarFun: function (outBox, Bar, Scro, Contet) {

                    var boxH = outBox.offsetHeight,
                        ContetH = Contet.offsetHeight,
                        // 1. 首先先要计算红色滚动条的高度    内容越多，滚动条越短    反之  反之
                        // 滚动条的长度计算公式:  容器的高度 / 内容的高度 * 容器的高度
                        // box 是 内容盒子一半  那么红色盒子也要是box盒子的一半
                        autoH = boxH/ContetH*scroll.offsetHeight;

                    Bar.style.height = autoH + 'px';
                    Bar.onmousedown = function (event) {
                        var e = event || window.event,
                            InitalLen = e.clientY - this.offsetTop,
                            that = this;
                        document.onmousemove = function (event) {
                            var e = event || window.event,
                                moveLen = e.clientY - InitalLen,
                                maxLen = Scro.offsetHeight - that.offsetHeight,
                                scrollT = 0;
                            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                            if (moveLen < 0) {
                                moveLen = 0;
                            };
                            if (moveLen > maxLen) {
                                moveLen = maxLen;
                            };
                            //  内容盒子要移动距离
                            // （内容盒子高度 -  大盒子高度） /  (大盒子高度 - 红色盒子的高度)   * 红色盒子移动的数值
                            scrollT = (ContetH - boxH)/maxLen * moveLen;
                            Contet.style.top = -scrollT + 'px';
                            that.style.top = moveLen + 'px';
                        };

                    };

                    document.onmouseup = function () {
                        document.onmousemove = null;
                    };
			}
	};
        yzl = $.extend(yzl, globalObject);

	})(window, document, jQuery, yzlObj);

	// 公共调用函数之外函数
	;(function (window, document, $, yzl) {
        // 单页式切换的基本原理
        yzl.linkClick = {
            //  添加【主导航】js文件----公用文件
            arrNav : [],
            // 保存【左导航栏】的css,js id号
            arrciNav : [],
            // host发生变化,配置
            host : '',
            config : {
                // 点击主导航插入的位置
                base : '.content #mianContent'
            },
            // 对应的js文件排除在外，不加载
            excludeJs: ['basicHome'],
			// 对应的css文件排除在外，不加载
            excludeCss: ['initHome', 'initStatus'],
			// 页面刷新跳转问题----line:994  getUserInfo
            initEvent : function () {
                var that = this;
                // 解析url
                $(window).hashchange(function() {
                    var hash = window.location.hash,
                        reg = /#dir=\{(.*)\}/,
                        key = hash.replace(reg, function ($0, $1) {
                            return $1;
                        });

                    var htmlurl = '';
                    // 锚点变化，校验是否有权限 或 存在此页面
                    switch (that.verifyPermission(hash)) {
						case 1:
							break;
						case 2:
							htmlurl = that.host + 'page_template/error/no_permission.html';
                            // 加载html
                            that.loadHtml(that.config.base, htmlurl);
                            return;
						case 3:
                            htmlurl = that.host + 'page_template/error/error.html';
                            // 加载html
                            that.loadHtml(that.config.base, htmlurl);
                            return;
					};

                    if (yzl.roomStatusWebsocket != null) {
                        yzl.roomStatusWebsocket.close();
                    };

                    key = key.split("|");

                    // 清空wrapper
                    $(that.config.base).html('');
                    // 删除次导航css/js
                    that.removeFile(that.arrciNav);
                    if (key[2]) {
                        // 主导航css,js----模块下的公用文件
                        that.removeFile(that.arrNav);
                    };
					/*$('#mianContent').html('加载中....');*/
                    // 解析路劲+引入文件
                    that.resolve(key);

                    // 刷新页面，主导航栏active 和 页面背景问题
                    // $('a[href="' + hash +'"]').addClass('active').parent().siblings().find('a').removeClass('active');
                });
            },
			// 判读hash是否存在，存在---验证权限？有，插入，无，no_permission.html
            verifyPermission: function  (hash) {
            	var that = this;
            	var dirLists = that.processSideBarData();
				var reg = /#dir=\{(.*)\}/,
					key = hash.replace(reg, function ($0, $1) {
						return $1;
					});

					key = key.split('|');

            	for (var i=0; i<dirLists.length; i++) {
            		var dirItem = dirLists[i];
            		// 存在，且有权限
            		if (dirItem['dir'].indexOf(hash) >= 0 && dirItem['isHasResource']) {
						return 1;
					// 存在，但无权限
					} else if (dirItem['dir'].indexOf(hash) >= 0 && !dirItem['isHasResource']) {
                        return 2;
					// 存在，但无权限
					} else if (key.length == 3) {
            			// 由于1级导航dir key[1]有可能是动态生成的(2,3级无权限情况)
						// 如: #dir={setting|roomTypeManage|initSetting} 假如：#dir={setting|basicSetting} 无权限
						// 此时访问 #dir={setting|basicSetting|initSetting} 应该提示无权限，而不是页面不存在
						var newDir = '#dir={' + key[0] + '|' + key[1] + '}';
						if (dirItem['dir'].indexOf(newDir) >= 0 && !dirItem['isHasResource']) {
							return 2;
						};
					};
				};
            	// 不存在此页面
                if (key[2] || key[1]) {
                    // 如果1级导航没权限，则2,3级侧边栏不显示
                    for (var i=0; i<yzl.navList.length; i++) {
                        var navItem = yzl.navList[i];
                        if (navItem['firDir'].indexOf(key[0]) >= 0) {
                            // 如果1级导航没有权限，则不显示2,3级导航 || 1级导航有权限，且只有一级导航----wrapper居中
                            if (!navItem['isHasResource'] || (navItem['isHasResource'] && navItem['defaultDir'] != '')) {
                                $('#mianContent').css({
                                    'margin': '0 auto',
									'padding': '0px 0px'
								}).addClass('wrapper');
                            } else {
                                // 显示2,3级导航 ----wrapper居左
                                $('#mianContent').css({
                                    'marginLeft': '180px',
                                    'padding': '10px 20px 0px 10px'
                                }).removeClass('wrapper');
                            };
                        };
                    };
                } else {
                    $('#mianContent').css({
                        'margin': '0 auto',
                        'padding': '0px 0px'
                    }).addClass('wrapper');
				};
            	return 3;
			},
			// 处理sideBarData数据
			processSideBarData: function () {
            	var list = [];
                for (var i=0; i<yzl.navList.length; i++) {
                    if (yzl.navList[i].hasOwnProperty('dir') && yzl.navList[i].hasOwnProperty('isHasResource')) {
                        var obj = {
                            dir: yzl.navList[i]['dir'],
                            isHasResource: yzl.navList[i]['isHasResource']
                        };
                        list.push(obj);
                    };
                };

                for (var prop in yzl.sideBarLists) {
                    for (var j=0; j<yzl.sideBarLists[prop].length; j++) {
                        var sideBarItem = yzl.sideBarLists[prop][j];
                        if (sideBarItem.hasOwnProperty('dir') && sideBarItem.hasOwnProperty('isHasResource')) {
                            var obj2 = {
                                dir: sideBarItem['dir'],
                                isHasResource: sideBarItem['isHasResource']
                            };
                            list.push(obj2);
                        };
                        if (sideBarItem.hasOwnProperty('secBar') && sideBarItem['secBar'].length > 0) {
                            for (var k=0; k<sideBarItem['secBar'].length; k++) {
                                var secBarItem = sideBarItem['secBar'][k];
                                var obj3 = {
                                    dir: secBarItem['dir'],
                                    isHasResource: secBarItem['isHasResource']
                                };
                                list.push(obj3);
                            };
                        };
                    };
                };

                return list;
			},
            // 解析路劲 + 拼凑路劲 + 插入文档(css/js/html) + css/js需要顺带生产对应id号，并装入对应的数组里:arrciNav / arrciNav
            resolve : function (data) {
                var that = this,
                    htmlurl = '',
                	isInsertCss = true;
                // 清空次导航所保存的js,css  id
                that.arrciNav.length = 0;
                // 清空所有ajax获取不到数据的插入元素
				yzl.noDataElemList = [];

				// 1级导航
                if (data[2]) {
                    // 清空主导航所保存的js css  id
                    that.arrNav.length = 0;
					// exclude 不加载---对应css文件
                    for (var i=0; i<that.excludeCss.length; i++) {
                        if (data[2] == that.excludeCss[i]) {
                            isInsertCss = false;
                            break;
                        };
                    };

                    if (isInsertCss) {
                        // 插入1级导航----插入公用css
                        insertCss(data[2], function () {
                            that.arrNav.push(data[2] + '_css');
                            insertSecNavCss();
                        });
					} else {
                        // 插入2级导航---不插入公用css
                        insertSecNavCss();
					};
				// 2级导航
				} else if (!data[2] && data[1]) {
                    insertSecNavCss();
				};

                // 加载html,js函数
                function loadHtmlJsFun() {
                    // 如果data[2]存在，则表示点击的是1级导航
                    if (data[2]) {
                        htmlurl = that.host + 'page_template/' + data[0] + '/' + data[1] + '.html?v=' + yzl.version;
                        that.loadHtml(that.config.base, htmlurl, data[0], function () {
                            // 添加主导航js文件----公用文件
                            // 回调函数作用: data[2]加载完成，再加载data[1];
                            insertScript(data[2], function () {
                                that.arrNav.push(data[2] + '_js');
                                insertScript(data[1]);
                                that.arrciNav.push(data[1] + '_js');
                            });
                        });
                    } else {
                        htmlurl = that.host + 'page_template/' + data[0] + '/' + data[1] + '.html?v=' + yzl.version;
                        that.loadHtml(that.config.base, htmlurl, data[0], function (initHtml) {
                            insertScript(data[1]);
                            that.arrciNav.push(data[1] + '_js');
                        });
                    };
				};

                // 插入2级导航---css
                function insertSecNavCss() {
                    insertCss(data[1], function () {
                        that.arrciNav.push(data[1] + '_css');
                        loadHtmlJsFun();
                    });
				};

                // 插入css到文档中
				function insertCss(path, callback) {
                    var cssurl = that.host + 'css/page_template/' + data[0] + '/' + path + '.css?v=' + yzl.version;
                    var link = document.createElement('link');
                    link.rel = "stylesheet";
                    link.id = path + '_css';
                    link.href = cssurl;
                    document.getElementsByTagName('head')[0].appendChild(link);

                    yzl.fileloaded (link, callback);
				};

                // 插入js到文档中
                function insertScript(path, callback) {
                    // exclude 不加载---对应js文件
                    for (var i=0; i<that.excludeJs.length; i++) {
                        if (path == that.excludeJs[i]) {
                            return;
                        };
                    };

                    // setting|basicSetting|initSetting
                    // 拼接js路劲 + 插入body + 记录插入的js id
                    // 无论点击是主导航栏还是次导航栏，都是加载初始化默认js
                    var jsurl =  that.host + 'js/page_template/' + data[0] + '/' + path + '.js?v=' + yzl.version;
                    var script = document.createElement('script');
                    script.id = path + '_js';
                    script.src = jsurl;

                    document.body.appendChild(script);
                    yzl.fileloaded (script, callback);
                };
                // 插入文件加载完毕---回调
				/*function fileloaded (elem, callback) {
                    if (document.all) { //如果是IE	判定js是否加载完毕,回调
                        elem.onreadystatechange = function () {
                            if (elem.readyState == 'loaded' || elem.readyState == 'complete') {
                                callback && callback();
                            };
                        };
                    } else {
                        elem.onload = function () {
                            callback && callback();
                        };
                    };
				};*/
            },
            // 加载html
            loadHtml : function (elem, path, basicPath, callback) {
                var that = this;
                var initHTML = $(elem).html();

                $(elem).load(path, function(responseText, textStatus, jqXHR){
                    // responseText 是响应(返回)的原始文本数据
                    // textStatus 可能是 "success"、 "notmodified"、 "error"、 "timeout"、 "abort"或"parsererror"中的一个
                    // jqXHR 是经过jQuery封装的XMLHttpRequest对象(保留其本身的所有属性和方法)
                    if(textStatus == "success" || textStatus == "notmodified"){
                        callback && callback(initHTML);
                    };
                    // 如果不存在对应内容(找不到对应文件)，则清空元素
                    if (textStatus == "error") {
                        $(elem).html('');
                    };
                });
            },
            // 删除文件操作 css/js文件
            removeFile : function (arr) {
                var elem = null;
                for (var i=arr.length; i>=0; i--) {
                    if (document.getElementById(arr[i])) {
                        elem = document.getElementById(arr[i]);
                        elem.parentNode.removeChild(elem);
                    };
				};
            }
        };


	})(window, document, jQuery, yzlObj);

    // preview image 插件-----不可移动位置---必须先初始化插件
    ;(function (yzl) {

        //  要求:
        //      1. 关闭删除DOM
        //      2. 点击预览初始化DOM

        var tm = '<template v-if="imgList.length > 0">'+
            '<ul :id="previewId" style="display:none;">' +
            '<li v-for="item in imgList"><img data-original="{{item}}" v-bind:src="item" id="{{previewId + \'_\' + $index}}"></li>'+
            '</ul>'+
            '</template>';

        var previewImgVue = Vue.extend({
            template: tm,
            props: [
                'imgList'
            ],
            data: {
                viewer: null,
                previewId: ''
            },
            watch: {
                imgList: function () {
                    var _self = this;
                    if (_self.imgList.length > 0) {
                        _self.initPreviewImg();
                    };
                }
            },
            ready: function () {

            },
            computed: {
                previewId: function () {
                    var timeStamp = new Date().getTime();

                    return 'previewImg'+ timeStamp;
                }
            },
            methods: {
                initPreviewImg: function () {
                    var _self = this;
                    Vue.nextTick(function () {
                        _self.viewer = new Viewer(document.getElementById(_self.previewId), {
                            url: 'data-original',
                            // 隐藏显示缩略图导航
                            navbar: true,
                            // 隐藏工具栏
                            toolbar: true,
                            hidden: function() {
                                // remove DOM
                                _self.imgList = [];
                                _self.viewer.destroy();
                            }
                        });
                        // 打开预览图片器
                        $('#' + _self.previewId + '_0').click();
                    });
                },
            },
            events: {

            }
        });

        yzl.previewImgVue = previewImgVue;

    })(yzlObj);

    // 分页vue插件
    ;(function(window){

        var tm = '<div class="page-bar" v-if="all > 1">'+
            '<ul>'+
            '<li class="pageup"><a v-on:click="pageUp" v-bind:class="{disabled: cur == 1}">«</a></li>'+			/*cur--*/
            '<li v-for="index in indexs"  v-bind:class="{ active: cur == index}">'+
            '<a v-on:click="btnClick(index)">{{ index }}</a>'+
            '</li>'+
            '<li class="pagedown"><a v-on:click="pageDown" v-bind:class="{disabled: cur == all}">»</a></li>'+	/*cur++*/
            '<li><a class="pagetotal">共<i>{{all}}</i>页</a></li>'+
            '<template v-if="all > 10">' +
            '<li><a class="iptnum"><input type="text" v-model="skippage"/></a></li>'+
            '<li><a v-on:click="gopages">GO</a></li>'+
            '</template>' +
            '</ul>'+
            '</div>';

        var paginationVue = Vue.extend({
            template: tm,
            props: ['cur', 'all','pageup', 'pagedown'],
            data: function(){
                return {
                    skippage: ''
                }
            },
            computed: {
                indexs: function(){
                    var left = 1
                    var right = this.all
                    var ar = []
                    if(this.all>= 11){
                        if(this.cur > 5 && this.cur < this.all-4){
                            left = this.cur - 5
                            right = this.cur + 4
                        }else{
                            if(this.cur<=5){
                                left = 1
                                right = 10
                            }else{
                                right = this.all
                                left = this.all -9
                            }
                        }
                    }
                    while (left <= right){
                        ar.push(left)
                        left ++
                    }
                    return ar
                }
            },
            methods: {
                btnClick: function(data){
                    if(data != this.cur){
                        this.cur = data
                        this.$dispatch('btn-click',data)

                    }
                },
                pageUp: function () {
                    //this.cur -= this.pageup || 1;
                    this.cur -= 1;
                    if (this.cur <= 1) {
                        this.cur=1;
                    };
                },
                pageDown: function () {
                    //this.cur += this.pagedown || 1;
                    this.cur += 1;
                    if (this.cur >= this.all) {
                        this.cur=this.all;
                    };
                },
                gopages: function () {
                    if (this.skippage <= 1) {
                        this.cur=1;
                    } else if (this.skippage >= this.all) {
                        this.cur=this.all;
                    } else {
                        this.cur=Number(this.skippage);
                    };
                    this.skippage = '';
                }
            }



        })

        window.paginationVue = paginationVue

    })(window);
    // checkbox vue插件
    ;(function(yzl){
        var tm = '<template v-if="list.length > 0">' +
            '<div v-if="listAll.id" class="mb10">' +
            '<label for="{{listAll.id}}" class="pointer user-no-select" v-bind:style="cssObj.all">' +
            '<input type="checkbox" id="{{listAll.id}}" value="{{listAll.value}}" v-model="listAll.selectVal" @click="swiftCheckBoxStatus(listAll)"/>' +
            '<span class="iconfont fz12 mr4" v-bind:class="listAll.checked? \'icon-xuanzhong\':\'icon-weixuanzhong\'"></span>' +
            '{{listAll.zh_cn}}' +
            '</label>'+
            '</div>' +
            '<div class="checkbox-ctnt clearfix" v-bind:style="cssObj.listbox">'+
            '<template v-for="item in list">' +
            '<label for="{{item.id}}" class="pointer user-no-select" v-bind:class="[item.isDisabled?\'not-allowed\':\'\']" v-bind:style="cssObj.perbox">' +
            '<input type="checkbox" id="{{item.id}}" value="{{item.value}}" v-bind="{disabled: item.isDisabled}" v-model="val" @click="swiftCheckBoxStatus(item)"/>' +
            '<span class="iconfont fz12 mr4" v-bind:class="item.checked ? \'icon-xuanzhong\':\'icon-weixuanzhong\'"></span>' +
            '{{item.zh_cn}}' +
            '</label>'+
            '</template>'+
            '</div>'
        '</template>';

		/*
		 cssObj = {
		 all: {},
		 listbox: {},
		 perbox: {}
		 }
		 */
        var multiCheckboxVue = Vue.extend({
            template: tm,
            props: [
                'list',			// 子checkbox按钮 (除了全选之外的checkbox)
                'disabled',		// 禁用 boolean 可省略，默认为false
                'listall',		// 全选按钮
                'val',			// 最终选定的val值
                'cssObj'
            ],
            data: function(){
                return {
                    // selectedboxvallist: this.val,
                    isTakePlace: true,	// 是否触发'listAll.checked' 对应的watch函数
                    tookPlace: true,		// 是否触发'val' 对应的watch函数
                    listAll: {}
                }
            },
            created: function () {
                var _self = this;

                // 设置 listAll默认值
                if (_self.listall) {
                    _self.listAll = {
                        checked: _self.listall.checked || false,
                        zh_cn: _self.listall.zh_cn || '全选',
                        tookplace: _self.listall.tookplace || true,
                        value: '1',
                        selectVal: _self.listall.checked? '': '1',
                        id: _self.listall.id
                    };
                };

                // 初始化按钮状态
                _self.isDisabledFun(_self.disabled);
            },
            destroyed: function () {

            },
            ready: function () {

            },
            computed: {

            },
            watch: {
				/*selectedboxvallist: function (newVal) {
				 var _self = this;
				 //_self.val = _self.selectedboxvallist;
				 console.log(_self.val);
				 },*/
                'listAll.checked': function (newVal, oldVal) {	// 点击全选按钮----改变(子checkboxs)值变化
                    var _self = this;
                    if (_self.isTakePlace) {	// 是否val(子checkboxs)值变化，要出发listAll(全选按钮)的watch函数----'listAll.checked'
                        _self.val = [];
                        if (newVal) {
                            for (var i=0; i<_self.list.length; i++) {
                                _self.val.push(_self.list[i].value);
                                _self.list[i].checked = true;
                            };
                        } else {
                            for (var j=0; j<_self.list.length; j++) {
                                _self.list[j].checked = false;
                            };
                        };

                        // _self.selectedboxvallist = _self.val;
                    };
                    _self.isTakePlace = true;
                },
                val: function (newVal, oldVal) {		// 点击(子checkboxs)值变化----改变全选按钮的状态
                    var _self = this;
                    if (_self.listAll) {			// 全选按钮是否存在
                        if (_self.tookPlace) {		// listAll(全选按钮)的状态变化，是否触发的watch函数----'val'
                            if (newVal.length == _self.list.length && _self.list.length > 0) {
                                _self.listAll.checked = true;
                                _self.listAll.value = ['1'];
                            } else {
                                _self.listAll.checked = false;
                                _self.listAll.value = [];
                            };
                            _self.isTakePlace = false;
                        } else {
                            _self.tookPlace = true;
                            _self.isTakePlace = true;
                        };
                    };
                    for (var i=0; i<newVal.length; i++) {		// 默认选中---后台返回数据
                        for (var j=0; j<_self.list.length; j++) {
                            if (newVal[i] == _self.list[j].value) {
                                _self.list[j].checked = true;
                                continue;
                            };
                        };
                    };
                },
                // 监控是否禁用所有checkbox
                disabled: function (newVal) {
                    var _self = this;

                    _self.isDisabledFun(newVal);
                }
            },
            methods: {
                // 只能监控函数调用----return返回值
                swiftCheckBoxStatus: function (item) {
                    var _self = this;
                    item.checked = !item.checked;
                    if (item.tookplace) {		// 此时点击的是 listAll(全选按钮)
                        _self.tookPlace = false;
                        _self.isTakePlace = true;
                    };
                },
                isDisabledFun: function (status) {
                    var _self = this;

                    // 是否禁用
                    if (status) {
                        for (var i=0; i<_self.list.length; i++) {
                            _self.list[i].isDisabled = true;
                        };
                    } else {
                        for (var i=0; i<_self.list.length; i++) {
                            _self.list[i].isDisabled = false;
                        };
                    };
                }
            },
            events: {
                unSelectAll: function () {
                    var _self = this
                    _self.list = [];
                    _self.val = [];
                    _self.listAll.checked = false;
                }
            }
        });

        yzl.multiCheckboxVue = multiCheckboxVue;

    })(yzlObj);
    // radio vue插件
    ;(function(yzl){
        var tm = '<template v-for="item in list">' +
            '<label for="{{item.id}}" class="pointer user-no-select" v-bind:class="[item.isDisabled? \'not-allowed\':\'\']" v-bind:style="cssObj">' +
            '<input type="radio" id="{{item.id}}" name="{{item.name}}" value="{{item.value}}" v-model="val" v-bind="{disabled: item.isDisabled}" @click="swiftCheckBoxStatus(item)"/>' +
            '<span class="iconfont fz14 mr4" v-bind:class="item.checked? \'icon-radio\':\'icon-radio1\'"></span>' +
            '{{item.zh_cn}}' +
            '</label>'+
            '</template>';

        var radioVue = Vue.extend({
            template: tm,
            props: [
                'list',
                'disabled',		// 禁用 boolean 可省略，不传，为undefined,不会触发computed > disabled
                'val',
                'cssObj'
            ],
            data: function(){
                return {
                }
            },
            ready: function () {
                var _self = this;
            },
            computed: {

            },
            created: function () {
                var _self = this;

                // 初始化禁用状态
                _self.isDisabledFun(_self.disabled);
            },
            watch:{
                val: function (newVal) {
                    var _self = this;
                    for (var i=0; i<_self.list.length; i++) {
                        if (_self.list[i].value == newVal) {
                            _self.list[i].checked = true;
                        } else {
                            _self.list[i].checked = false;
                        };
                    };
                },
                // 是否禁用
                disabled: function (newVal) {
                    var _self = this;

					/*if (newVal) {
					 for (var i=0; i<_self.list.length; i++) {
					 _self.list[i].isDisabled = true;
					 };
					 } else {
					 for (var i=0; i<_self.list.length; i++) {
					 _self.list[i].isDisabled = false;
					 };
					 };*/

                    _self.isDisabledFun(newVal);
                }
            },
            methods: {
                swiftCheckBoxStatus: function (item) {
                    var _self = this;
                    for (var i=0; i<_self.list.length; i++) {
                        _self.list[i].checked = false;
                    };
                    item.checked = !item.checked;
                },
                // radio is disable
                isDisabledFun: function (status) {
                    var _self = this;
                    if (status) {
                        for (var i=0; i<_self.list.length; i++) {
                            _self.list[i].isDisabled = true;
                        };
                    } else {
                        for (var i=0; i<_self.list.length; i++) {
                            _self.list[i].isDisabled = false;
                        };
                    };
                }
            }
        });

        yzl.radioVue = radioVue;

    })(yzlObj);
    // select vue插件
    ;(function(yzl){
		/*var tm = '<select  placeholder="{{text}}" :id="[testVal]"  v-bind="{ multiple: isMultiple, disabled: isDisabled}">'+
		 '<option value="" v-if="!isMultiple">请选择</option>' +
		 '<option v-for="item in list" value="{{item.code}}">{{item.name}}</option>' +   /!* v-bind="{selected: isSeelectedAll($index)}" 默认选中*!/
		 '</select>';

		 var multiSelectVue = Vue.extend({
		 template: tm,
		 props: [
		 'list',
		 'selectVal',
		 'text',
		 'isMultiple',
		 'isDisabled',
		 'isSelected',		// 多选----是否多选  与 单选无关
		 'selectedElem',		// 单选----单选元素，否则默认单选第一个
		 'timestamp'			// 必填

		 ],
		 data: function(){
		 return {
		 /!*timestamp: new Date().getTime()*!/
		 }
		 },
		 ready: function () {
		 var _self = this;
		 _self.timestamp = new Date().getTime();
		 this.$nextTick(function () {
		 $('#multiSelectElem' + _self.timestamp).on('sumo:closing', function(sumo) {
		 if (_self.isMultiple) {
		 _self.$emit('watchValFun');
		 } else {
		 _self.$emit('singalVal');
		 };
		 });
		 });

		 },
		 computed: {
		 // 只能监控data声明----不声明，也不能是函数调用
		 testVal: function(){
		 var _self = this;
		 return 'multiSelectElem' + _self.timestamp;
		 }
		 },
		 methods: {
		 // 只能监控函数调用----return返回值
		 isSeelectedAll: function (index) {
		 var _self = this;
		 if (_self.isMultiple && _self.isSelected) {
		 return true;
		 } else {
		 if (typeof _self.selectedElem != undefined) {
		 if (_self.list[index].name == _self.selectedElem) {
		 return true;
		 };
		 } else {
		 if ( index == 0) {
		 return true
		 };
		 };
		 }
		 return false;
		 }
		 },
		 events: {
		 watchValFun: function () {
		 var _self = this;
		 this.$nextTick(function () {
		 var arr = [];
		 $("#multiSelectElem" + _self.timestamp + " option:selected").each(function(){
		 arr.push($(this).val());
		 });
		 _self.selectVal = arr;
		 });
		 },
		 singalVal: function () {
		 var _self = this;
		 this.$nextTick(function () {
		 _self.selectVal = $("#multiSelectElem" + _self.timestamp + " option:selected").val();;
		 });
		 }
		 }
		 });

		 yzl.multiSelectVue = multiSelectVue;*/

		/* var tm = '<select  placeholder="{{text}}" id="{{elemId}}"  v-bind="{ multiple: isMultiple, disabled: isDisabled}">'+
		 '<option value="" v-if="!isMultiple">请选择</option>' +
		 '<option v-for="item in list" value="{{item.code}}" v-bind="{selected: isSeelectedAll($index)}">{{item.name}}</option>' +
		 '</select>';

		 var multiSelectVue = Vue.extend({
		 template: tm,
		 props: [
		 'list',
		 'selectVal',
		 'text',
		 'isMultiple',
		 'isDisabled',
		 'isSelected',		// 多选----是否多选  与 单选无关
		 'selectedElem',		// 单选----单选元素，否则默认单选第一个
		 'elemId'			// 必填

		 ],
		 data: function(){
		 return {
		 /!*timestamp: new Date().getTime()*!/
		 }
		 },
		 ready: function () {
		 var _self = this;
		 _self.timestamp = new Date().getTime();
		 this.$nextTick(function () {
		 $('#' + _self.elemId).on('sumo:closing', function(sumo) {
		 if (_self.isMultiple) {
		 _self.$emit('watchValFun');
		 } else {
		 _self.$emit('singalVal');
		 };
		 });
		 });

		 },
		 computed: {
		 /!*!// 只能监控data声明----不声明，也不能是函数调用
		 testVal: function(){
		 var _self = this;
		 return 'multiSelectElem' + _self.timestamp;
		 }*!/
		 },
		 methods: {
		 // 只能监控函数调用----return返回值
		 isSeelectedAll: function (index) {
		 var _self = this;
		 if (_self.isMultiple && _self.isSelected) {
		 return true;
		 } else {
		 console.log(_self.list[index].code, _self.selectedElem);
		 if (typeof _self.selectedElem != 'undefined') {
		 if (_self.list[index].code == _self.selectedElem) {
		 return true;
		 };
		 } /!*else {
		 if ( index == 0) {
		 return true
		 };
		 };*!/
		 }
		 return false;
		 }
		 },
		 events: {
		 watchValFun: function () {
		 var _self = this;
		 this.$nextTick(function () {
		 var arr = [];
		 $("#" + _self.elemId + " option:selected").each(function(){
		 arr.push($(this).val());
		 });
		 _self.selectVal = arr;
		 });
		 },
		 singalVal: function () {
		 var _self = this;
		 this.$nextTick(function () {
		 _self.selectVal = $("#" + _self.elemId + " option:selected").val();;
		 });
		 }
		 }
		 });

		 yzl.multiSelectVue = multiSelectVue;*/

        var tm = '<select  placeholder="{{text}}" id="{{elemId}}"  v-bind="{ multiple: isMultiple}">'+/*, disabled: isDisabled*/
            '<option value="" v-if="(!isMultiple)&&isNullSelect">请选择</option>' +
            '<option v-for="item in list" value="{{item.code}}" v-bind="{selected: isSeelectedAll($index)}">{{item.name}}</option>' +
            '</select>';

        var multiSelectVue = Vue.extend({
            template: tm,
            props: [
                'list',
                'selectVal',
                'text',
                'isMultiple',
                'isNullSelect',
                'isDisabled',
                'isSelected',		// 多选----是否多选  与 单选无关
                'selectedElem',		// 单选----单选元素，否则默认单选第一个
                'elemId',			// 必填 selectedElem
                'search',			// 是否启用搜索功能
                'isReinitial'		// 是否初始化默认值----单选元素
            ],
            data: function(){
                return {

                }
            },
            watch: {
                // list 数据异步
                list: function () {
                    var _self = this;
                    _self.initList();
                },
                isReinitial: function (newVal) {
                    var _self = this;
                    if ((_self.isSelected != _self.selectedElem) && newVal ) {
                        $('#' + _self.elemId)[0].sumo.selectItem(_self.selectedElem + 1);	// _self.selectedElem 只能传index值，不能传value值，否则不生效
                        _self.isReinitial = false;
                    };
                },
                selectedElem: function (newVal) {
                    var _self = this;
                    if (newVal == '' || newVal == null) return;
                    if (_self.list.length > 0 && typeof $('#' + _self.elemId)[0].sumo == 'undefined') {
                        _self.initList();
                        _self.isReinitial = true;
                    } else {
                        _self.isReinitial = true;
                    };
                },
                // 禁用下拉框
                isDisabled: function (newVal) {
                    var _self = this;

                    if (typeof $('#' + _self.elemId)[0].sumo != 'undefined') {
                        if (newVal) {
                            $('#' + _self.elemId)[0].sumo.disable();
                        } else{
                            $('#' + _self.elemId)[0].sumo.enable();
                        };
                    };
                }

            },
            ready: function () {
                var _self = this;

                _self.search = _self.search || true;
                _self.isNullSelect = typeof(_self.isNullSelect)=='undefined'?true: (_self.isNullSelect== '1');
                _self.isReinitial = _self.isReinitial || false;

                if (_self.isMultiple) {
                    _self.selectAll = true;
                } else {
                    _self.selectAll = false;
                };

                this.$nextTick(function () {
                    // list 数据同步
                    if (_self.list.length > 0 ) {
                        _self.initList();
                    };

					/*$('#' + _self.elemId).on('sumo:closing', function(sumo) {
					 _self.getAsycData();
					 });*/
                });

            },
            computed: {

            },
            methods: {
                // 只能监控函数调用----return返回值
                isSeelectedAll: function (index) {
                    var _self = this;
                    // 多选
                    if (_self.isMultiple && _self.isSelected) {
                        return true;
                    } else {
                        // 单选
                        if (typeof _self.selectedElem != 'undefined') {
                            if (_self.list[index].code == _self.selectedElem) {
                                return true;
                            };
                        };
                    }
                    return false;
                },
                // 默认同步获取选中的数据
                getAsycData: function () {
                    var _self = this;
                    // console.log('默认同步获取选中的数据');
                    if (_self.isMultiple) {
                        _self.$emit('watchValFun');
                    } else {
                        _self.$emit('singalVal');
                    };
                },
                // 根据list 异步 同步数据 初始化插件
                initList: function () {
                    var _self = this;
                    $('#' + _self.elemId).SumoSelect({
                        selectAll: _self.selectAll,
                        search : _self.search,
                        callback: function () {
                            _self.getAsycData();
                        }
                    });

                    if (_self.isDisabled) {
                        $('#' + _self.elemId)[0].sumo.disable();
                    };

                    if (typeof _self.selectedElem == 'undefined') {
                        $('#' + _self.elemId)[0].sumo.selectItem(0);
                    };
                    _self.getAsycData();
                }
            },
            events: {
                watchValFun: function () {
                    var _self = this;
                    this.$nextTick(function () {
                        var arr = [];
                        $("#" + _self.elemId + " option:selected").each(function(){
                            arr.push($(this).val());
                        });
                        _self.selectVal = arr;
                    });
                },
                singalVal: function () {
                    var _self = this;
                    this.$nextTick(function () {
                        _self.selectVal = $("#" + _self.elemId + " option:selected").val();;
                    });
                }
            }
        });

        yzl.multiSelectVue = multiSelectVue;

    })(yzlObj);
    // uploadify 插件
    ;(function (yzl) {

        var tm = '<div v-if="param.isShow" v-bind:style="param.parObj"><div :id="[elemId]"></div></div>';

        var uploadifyVue = Vue.extend({
            template: tm,
            props: [
                'elemId',
                'param',
                'imgInfor'      // 上传成功 imgUrl, imgId
            ],
            data: function(){
                return {

                }
            },
            watch: {
                'param.isShow': function (newVal) {
                    var _self = this;
                    if (newVal) {
                        _self.initUploadfy();
                    };
                }
            },
            ready: function () {
                var _self = this;
                _self.initUploadfy();
            },
            computed: {

            },
            methods: {
				/*
				 var param = {
					 url: '',
					 data: {},
					 btnText: '',
					 isShow: true		// 默认显示按钮 默认显示重新初始化DOM，false,则不显示，且清除DOM
				 };
				 */
                initUploadfy: function () {
                    var _self = this;
                    _self.$nextTick(function () {
                        yzl.InitUploadify({
                            id: _self.elemId,												// 上传按钮id
                            url: _self.param.url,						// 上传服务器地址
                            data: _self.param.data,
                            width: _self.param.width || '',
                            height: _self.param.height || '',
                            method:'get',
                            buttonText:_self.param.btnText,
                            sCallback: function (data) {
                                var result = JSON.parse(data);
                                if (result.code == "0000") {
                                    _self.imgInfor = result.data;
                                };
                            }
                        });

                    });
                },
            },
            events: {
                watchValFun: function () {

                }
            }
        });

        yzl.uploadifyVue = uploadifyVue;

    })(yzlObj);

	// 页面基本特效
	;(function (window, document, $, yzl) {
		// 导航
		$('.header .nav li a').click(function () {
			$(this).addClass('active').parent().siblings().find('a').removeClass('active');
			if($(this).html() == '首页'){
					$('.content').css('background','#fff url(images/index/index-bg.png) no-repeat center bottom');
				}else{
					$('.content').css('background','url(images/index/body_bg.jpg) no-repeat center top');
				}
		});

		// 账户
		$('.account-name').mouseenter(function () {
			$(this).find('i').addClass('active');
			//$(this).siblings('.account-dropdown').css('display', 'block');
			$('.account-dropdown').css('display', 'block');
		});

		$('.account-name').mouseleave(function () {
			$('.account-name').find('i').removeClass('active');
			$('.account-dropdown').css('display', 'none');
		})

		$('.account-dropdown').on('click', function (e) {
			e.stopPropagation();
		})

		$(document.body).on('click', function (e) {
			$('.account-dropdown').css('display', 'none');
		});

	})(window, document, jQuery, yzlObj);

	// 头部----获取数据修改数据
	;(function (window, document, $, yzl) {

			//侧边栏弹窗开关绑定---交班
			yzl.headerVue = new Vue({
				el : '#header',
				data: {
					// 个人设置----记录userId
					userId: sessionStorage.getItem("Cookie_userId"),
					getUserInfo: {},
					// 图片上传返回id
					uploadImgId: '',
					// 个人设置---更改密码 上传操作
					changePersonalPswd: {
						mobile : '',
						code : '',
						password : '',
						smsId : ''
					},
					// 个人账户---酒店下拉列表---动态宽度
					saveHoteListWidth: 0,
					// 个人设置---发送验证码
					timer: null,
					// 点击个人设置---初始化
					getPersonalSet: {},
                    // radio vue plugin start
                    roomStatusInitList: [        // 编辑
                        {
                            id: 'roomStatus_0',  // 对应的选项id
                            value: '1',         // value值必须不一样
                            checked: false,
                            name: 'personal-sex',     // 所有radio name 必须一样
                            zh_cn: '男'    // 中文名字
                        },
                        {
                            id: 'roomStatus_1',
                            value: '2',
                            checked: false,
                            name: 'personal-sex',
                            zh_cn: '女'
                        }
                    ],
                    roomStatusCssObj: {
                        'margin-right': '20px'
                    },
                    // radio vue plugin end
					// 权限控制
					headerResourceInfo: JSON.parse(sessionStorage.getItem("Cookie_headerResourceInfo")),
					resourceList: [],
					// 侧边栏数据渲染
					sideBarInitList: [],
					// 动态生成主导航栏
					navListInitList: [],
					//控制酒店切换显示隐藏状态
					hotelListStatus:false
				},
				components: {
					'v-radio': yzl.radioVue
				},
				methods: {
                    noImageUrlProcessFun: function (url) {
                    	if (!url) {
                    		return yzl.errorImgUrl;
						};
						return url;
					},
					// 初始化事件
					initEvent: function () {
                    	var _self = this;
                        _self.initData();

						$(document.body).unbind('click').click(function () {
                            _self.hotelListStatus = false;
						});
					},
					// 初始化数据
					initData: function () {
						var _self = this;
						var data = {};
						yzl.getAjax({
							path : 'account/j/getUserInfo',
							type : 'post',
							data : data,
							sCallback : function (result) {
								if (result.code == "0000") {
									yzl.hotelId = result.data.hotelId;
									_self.getUserInfo = result.data;
									_self.userId = result.data.userId;
									$.each(result.data.resourceList,function(i,item){
                                        yzl.resourceInfo[item] =  '1';
									});
									// 测试----添加s
                                    // yzl.resourceInfo = resourceCodeTest;
                                    // 测试----添加e
									 _self.headerResourceInfo = yzl.resourceInfo;

									/*
										 sessionStorage.setItem("Cookie_userId",_self.userId);
										 var Cookie_headerResourceInfo =  sessionStorage.getItem("Cookie_headerResourceInfo") || {};
										 Cookie_headerResourceInfo['hotelId_' + yzl.hotelId] = yzl.resourceInfo;

										 sessionStorage.setItem("Cookie_headerResourceInfo",Cookie_headerResourceInfo);
									 */

                                    if(!sessionStorage.getItem("Cookie_userId") || _self.userId !=sessionStorage.getItem("Cookie_userId") || !sessionStorage.getItem("Cookie_hotelId") || yzl.hotelId != sessionStorage.getItem("Cookie_hotelId")){
                                        sessionStorage.setItem("Cookie_hotelId",yzl.hotelId);
                                        sessionStorage.setItem("Cookie_userId",_self.userId);
                                        sessionStorage.setItem("Cookie_headerResourceInfo",JSON.stringify(yzl.resourceInfo));
                                    };
									/*if(_self.getUserInfo.hotelName.length<10){
										$('.logo h5').css('padding','17px 0');
									}else if(_self.getUserInfo.hotelName.length>20 && _self.getUserInfo.hotelName.length<=30){
										$('.logo h5').css('padding','7px 0');
									}else if(_self.getUserInfo.hotelName.length>30){
										$('.logo h5').css('padding','7px 0');
										var newHotelName = _self.getUserInfo.hotelName.substring(0,29)+"...";
										_self.getUserInfo.hotelName = newHotelName;
									}*/
									// 获取酒店下来列表的动态宽度
									_self.saveHoteListWidth = _self.setHotelListPos(_self.getUserInfo.hotelList);

									// 获取hotelId
									yzl.contentVue.getCommonList();
									// 监听公告栏websocket
									yzl.contentVue.setSocketData();
									// 公告栏----获取未读信息
									yzl.contentVue.getUnreadCountFun();

									// 登录成功后，默认跳转首页 刷新页面时，默认跳转自己本页
									if (window.location.hash == "") {
										window.location.hash = '#dir={home|basicHome|initHome}';
									}

                                    // 主导航栏(动态生成dir)+侧边导航---添加权限管理
                                    if (!$.isEmptyObject(yzl.resourceInfo)) {
                                        _self.sideBarAddResource(yzl.resourceInfo);
                                    };
									// 侧边导航----路由初始化
                                    yzl.linkClick.initEvent();

									// 侧边导航---初始化
									_self.sideBarInitData();
									$(window).trigger('hashchange');

									// 检测是否是chrome浏览器
									if (!(eval(sessionStorage.getItem("BROWSER_HAS_REMAINED")) || yzl.isChromeBrowser())) {
                                        yzl.maskDialog({
                                            content: '为了保证您能够顺畅地体验KK管家的服务，建议您改用 Google Chrome 浏览器',
                                            hideCancelBtn: true,
                                            callback: function (bln) {
                                                sessionStorage.setItem("BROWSER_HAS_REMAINED", true);
                                            }
                                        });
									};

								} else {
									yzl.Dialog({
										content : result.msg,
										AutoClose: true
									});
								};
							}
						});
					},
                    // 主导航栏(动态生成dir)+侧边导航---添加权限管理
					/* 如果1级导航没有权限，则强制2,3级导航没权限
					   如果2,3级导航都没权限，则强制所在的主导航也没权限
					*/
					sideBarAddResource: function (resource) {
						var _self = this;

						// 侧边栏---添加权限
						for (var pop in yzl.sideBarLists) {
							for (var i=0; i<yzl.sideBarLists[pop].length; i++) {
								var item = yzl.sideBarLists[pop][i];
                                // 侧边栏---导航--2级导航
								if (item.resourceCode !== '') {
									if (resource.hasOwnProperty(item.resourceCode)) {
                                        item['isHasResource'] = true;
									} else {
                                        item['isHasResource'] = false;
                                    };
								} else {
                                    item['isHasResource'] = true;
								};

								// 侧边栏---导航--3级导航
								if (item.hasOwnProperty('secBar') && item['secBar'].length > 0) {
									var secItem = item['secBar'];
									for(var j=0; j<secItem.length; j++) {
                                        if (secItem[j].resourceCode !== '') {
                                            if (resource.hasOwnProperty(secItem[j].resourceCode)) {
                                                secItem[j]['isHasResource'] = true;
                                            } else {
                                                secItem[j]['isHasResource'] = false;
                                            };
                                        } else {
                                            secItem[j]['isHasResource'] = true;
                                        };
									};
								};
							};
						};

						// 主导航栏---1级导航---主导航栏dir 和 设置权限
						for(var k=0; k<yzl.navList.length; k++) {
							// 0 代表2,3级导航没有权限，1代表2,3级导航有权限
                            var isHasSecNav = 0;
							var navItem = yzl.navList[k];
							// 只有1级导航 且 无权限控制---默认为此用户有该权限
							if (navItem.defaultDir != '' && navItem.resourceCode == '') {
                                navItem['dir'] = navItem['defaultDir'];
                                navItem['isHasResource'] = true;
							// 有权限控制 且 只有1级导航
							} else if (navItem.resourceCode !== '' && navItem.defaultDir != '') {
                                if (resource.hasOwnProperty(navItem.resourceCode)) {
                                    navItem['dir'] = navItem['defaultDir'];
                                    navItem['isHasResource'] = true;
                                } else {
                                    navItem['dir'] = navItem['defaultDir'];
                                    navItem['isHasResource'] = false;
                                };
                            } else {
								// 有权限控制 且 不只有1级导航
                                if (navItem.resourceCode !== '' && navItem.defaultDir == '') {
                                    if (resource.hasOwnProperty(navItem.resourceCode)) {
                                        navItem['isHasResource'] = true;
                                    } else {
                                        navItem['isHasResource'] = false;
                                        // 如果主导航，没权限，则2,3级导航权限统一为无
                                        var sidbarNoAccessList = yzl.sideBarLists[navItem['firDir'] + 'Sidebar'];
                                        for (var f=0; f<sidbarNoAccessList.length; f++) {
                                        	var fSidbarItem = sidbarNoAccessList[f];
                                            fSidbarItem['isHasResource'] = false;

                                            // 侧边栏---导航--3级导航
                                            if (fSidbarItem.hasOwnProperty('secBar') && fSidbarItem['secBar'].length > 0) {
                                                var fSecItem = fSidbarItem['secBar'];
                                                for(var h=0; h<fSecItem.length; h++) {
                                                    fSecItem[h]['isHasResource'] = false;
                                                };
                                            };
										};
									};
                                } else {
                                    navItem['isHasResource'] = false;
								};

                                // 主导航栏---dir设置---根据yzl.sideBarLists第一个
                                var navName = navItem['firDir'] + 'Sidebar';
                                var sideBarItem = yzl.sideBarLists[navName];
								// 动态生成---主导航栏dir
								for (var f=0; f<sideBarItem.length; f++) {
									// 2级导航
									if (sideBarItem[f]['isHasResource'] && sideBarItem[f]['name'] != '') {
                                        isHasSecNav = 1;
                                        navItem['dir'] = '#dir={' + navItem['firDir'] + '|' + sideBarItem[f]['name'] + '|' + navItem['lastDir'] + '}';
                                        break;
									// 3级导航---此时二级导航name为空
									} else if (sideBarItem[f]['isHasResource'] && sideBarItem[f]['name'] == '' && sideBarItem[f].hasOwnProperty('secBar') && sideBarItem[f]['secBar'].length > 0) {
										var secBarList = sideBarItem[f]['secBar'];
										for (var e=0; e<secBarList.length; e++) {
                                            if (secBarList[e]['isHasResource'] && secBarList[e]['name'] != '') {
                                                isHasSecNav = 1;
                                                navItem['dir'] = '#dir={' + navItem['firDir'] + '|' + secBarList[e]['name'] + '|' + navItem['lastDir'] + '}';
                                                break;
                                            };
										};
									};
								};
                                // 0 代表2,3级导航没有权限，则主导航没有权限； 1代表2,3级导航有权限
								if (isHasSecNav == 0) {
                                    navItem['isHasResource'] = false;
								};
							};
						};

						// console.log(JSON.stringify(yzl.navList));

                        // _self.navListInitList = yzl.navList;
					},
					// 侧边导航----初始化
					sideBarInitData: function () {
						var _self = this;
                        $(window).hashchange(function() {
                            var hash = window.location.hash,
                                reg = /#dir=\{(.*)\}/,
                                key = hash.replace(reg, function ($0, $1) {
                                    return $1;
                                });

                            if (hash == '') return;

                            key = key.split("|");

                            var newDir = '#dir={' + key[0] + '|' + key[1]  + '}';
                            if (key[2] || key[1]) {
                            	// 如果1级导航没权限，则2,3级侧边栏不显示
                            	for (var i=0; i<yzl.navList.length; i++) {
                            		var navItem = yzl.navList[i];
                            		if (navItem['firDir'].indexOf(key[0]) >= 0) {
                            			// 如果1级导航没有权限，则不显示2,3级导航 || 1级导航有权限，且只有一级导航----wrapper居中
                            			if (!navItem['isHasResource'] || (navItem['isHasResource'] && navItem['defaultDir'] != '')) {
                            				// 如果1级导航有权限，且只有一级导航
                                            // 定位到当前所在导航----次导航
                            				if (navItem['isHasResource']) {
                                                navItem['isActive'] = true;
											};
                                            $('#mianContent').css({
                                                'margin': '0 auto',
                                                'padding': '0px 0px'
                                            }).addClass('wrapper');
                                            _self.sideBarInitList = [];
										} else {
                                            // 显示2,3级导航 ----wrapper居左
                                            // 定位到当前所在导航----次导航
											navItem['isActive'] = true;
                                            $('#mianContent').css({
                                                'marginLeft': '180px',
                                                'padding': '10px 20px 0px 10px'
                                            }).removeClass('wrapper');
											// 定位到当前所在导航----次导航
											var sideList = yzl.sideBarLists[key[0] + 'Sidebar'];
											for (var k=0; k<sideList.length; k++) {
												// 点击主导航栏----子导航默认不展开
												if ( sideList[k].hasOwnProperty('isSpread')) {
                                                    sideList[k].isSpread = false;
												};
												if (!sideList[k].hasOwnProperty('secBar') || sideList[k]['secBar'].length == 0) {
                                                    if (sideList[k].dir == newDir) {
                                                        sideList[k]['isActive'] = true;
                                                    } else {
                                                        sideList[k]['isActive'] = false;
                                                    };
												} else {
													for (var pap in sideList[k]['secBar']) {
														var sideListPop = sideList[k]['secBar'][pap];
                                                        if (sideListPop.dir == newDir) {
                                                            sideListPop['isActive'] = true;
                                                            // 如果定位在次导航栏，刷新则默认展开
                                                            sideList[k].isSpread = true;
                                                        } else {
                                                            sideListPop['isActive'] = false;
                                                        };
													};
												};
											};
											// console.log(yzl.sideBarLists);
                                            _self.sideBarInitList = yzl.sideBarLists[key[0] + 'Sidebar'];
										};
									} else {
                                        navItem['isActive'] = false;
                                    };
								};
                                _self.navListInitList = yzl.navList;
                               // console.log(JSON.stringify(yzl.navList));
                               // console.log(JSON.stringify(yzl.sideBarLists));
							};
						});
					},
					// 侧边栏---子菜单
                    sideBarSlideToggle: function (item) {
						var _self = this;

						if (item.secBar && item.secBar.length > 0) {
                            $('.channel_sec').slideToggle();
						};
					},
					// 更换酒店
					setCurrentHotel: function (item) {
						var _self = this;
						var data = {
							hotelId: item.hotelId
						};
						yzl.getAjax({
							path : 'account/j/setCurrentHotel',
							type : 'post',
							data : data,
							sCallback : function (result) {
								if (result.code == "0000") {
                                    /*
										$.each(result.data.resourceList,function(i,item){
											var obj = item.resourceCode;
											yzl.resourceInfo[obj] =  item.resourceId;
										})

										sessionStorage.setItem("Cookie_hotelId",result.data.hotelId);
										sessionStorage.setItem("Cookie_userId",result.data.userId);
										sessionStorage.setItem("Cookie_headerResourceInfo",JSON.stringify(yzl.resourceInfo));
                                    */
									window.location.reload();

								} else {
									yzl.Dialog({
										content : result.msg,
										AutoClose: true
									});
								};
							}
						});
					},
					// 显示 切换酒店下拉列表
					showHotelList: function (event) {
						var _self = this;
						var e = event || window.event;
						$(e.currentTarget).find('.hotel-list').css('display', 'block');
		 				$(e.currentTarget).addClass('active').siblings().removeClass('active');
					},
					// 隐藏 切换酒店下拉列表
					hiddenHotelList: function (event) {
						var _self = this;
						var e = event || window.event;
						$(e.currentTarget).find('.hotel-list').css('display', 'none');
					},
					// 设置----切换酒店下拉列表---left值
					setHotelListPos: function (arr) {
						var aElem = [];
						if (arr.length == 0) return;

						for (var i=0; i<arr.length; i++) {
							var divElem = document.createElement('div');
							divElem.innerHTML = arr[i].hotelName;
							document.body.appendChild(divElem);
							divElem.style.width = 'auto';
							divElem.style.position = 'absolute';
							divElem.style.fontSize = '12px';
							divElem.style.zIndex = '-1';

							aElem.push(divElem.clientWidth);
							document.body.removeChild(divElem);
						};

						var max = aElem[0];
						for (var j=0; j<aElem.length; j++) {
							if (aElem[j] >= max) {
								max = aElem[j];
							} else {
								continue;
							};
						};
						return -(max+20) + 'px';
					},
					// 退出登录
					clickLogout: function (item) {
						var _self = this;
						var data = {};
						yzl.getAjax({
							path : 'account/j/logout',
							type : 'post',
							data : data,
							sCallback : function (result) {
								if (result.code == "0000") {
									sessionStorage.clear();
									window.location.replace(yzlObj.loginoutDirectory);
								} else {
									yzl.Dialog({
										content : result.msg,
										AutoClose: true
									});
								};
							}
						});
					},
					// 个人设置----初始化
		            showPersonalWindow:function(){
						var _self = this;
						var data = {};
						yzl.getAjax({
							path : '/user/j/getPersonalSet',
							type : 'post',
							data : data,
							sCallback : function (result) {
								if (result.code == "0000") {
									_self.getPersonalSet = result.data;
									_self.changePersonalPswd.mobile =  result.data.mobile;
									$('.personal-setting-mask').css('display','block');
								} else {
									yzl.Dialog({
										content : result.msg,
										AutoClose: true
									});
								};
							}
						});
		            },
		            // 三级联动---自动加载市
	                getPersonalCityList: function (val) {
	                    var _self = this;
	                    _self.getPersonalSet.cityId = "";
	                    _self.getPersonalSet.cityList = [];
	                    _self.getPersonalSet.areaId = "";
	                    _self.getPersonalSet.areaList = [];
	                    _self.get_city_ajax(val);
	                },
	                get_city_ajax:function(val){
	                	if(!val){
	                		return;
	                	}
	                	var data = {
	                    	provinceId : val
	                    };
	                    var _self = this;
	                	yzl.getAjax({
	                        path : 'area/j/city',
	                        data : data,
	                        type : 'get',
	                        sCallback : function (result) {
	                            if (result.code == "0000") {
	                            	_self.getPersonalSet.cityList = result.data.cityList
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
	                },
	                // 三级联动---自动加载区
	                getPersonalAreaList: function (val) {
	                    var _self = this;
	                    _self.getPersonalSet.areaId = "";
	                     _self.getPersonalSet.areaList = [];
	                    _self.get_area_ajax(val);
	                },
	                get_area_ajax:function(val){
	                	if(!val){
	                		return;
	                	}
	                	var data = {
							cityId : val
	                    };
	                    var _self = this;
	                	yzl.getAjax({
	                        path : 'area/j/area',
	                        data : data,
	                        type : 'get',
	                        sCallback : function (result) {
	                            if (result.code == "0000") {
	                            	_self.getPersonalSet.areaList = result.data.areaList
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
					// 个人设置----保存按钮
					savePersonalData: function () {
						var _self = this;

						var data = {
							areaId: _self.getPersonalSet.areaId,
							sex: _self.getPersonalSet.sex
						}
						yzl.getAjax({
							path : '/user/j/updatePersonalSet',
							data : data,
							type : 'post',
							sCallback : function (result) {
								if (result.code == "0000") {
									$('.personal-setting-mask').css('display','none');
								} else {
									yzl.Dialog({
										content : result.msg,
										AutoClose: true
									});
								};
							},
							fCallback : function (error) {
								yzl.Dialog({
									content : error,
									AutoClose: true
								});
							}
						})
					},
					// 个人设置---关闭--个人设置窗口
					closePersonalSettingMask: function () {
						$('.personal-setting-mask').css('display','none');
					},
		            // 个人设置---打开修改密码弹窗
		            showchangePassword:function(){
		            	$('.personalPassword-window-mask').css('display','block');

		            },
					// 个人设置---关闭修改密码弹窗
					closePersonalPswdWin: function () {
						var _self = this;

						_self.changePersonalPswd.password = "";
						_self.changePersonalPswd.code = "";
						$('#getSmsCodeBtn').html('发送验证码').css({
							'backgroundColor': '#f9953c',
							'cursor' :'pointer'
						}).removeAttr('disabled');;
						clearInterval(_self.timer);
						$('.personalPassword-window-mask').css('display','none');
					},
					// 个人设置---更改用户头像
					changePersonalImages: function () {
						var _self = this;
						$('.personal-upload-image-mask').css('display', 'block');

						/* 初始化图片插件 */
						/* 上传图片
						 * */
						yzl.InitUploadify({
							id: "filePickerBtn",												// 上传按钮id
							url: '/yzlpms/img/j/uploadUserProfile',						// 上传服务器地址
							data: {
								/*hotelId: yzl.hotelId*/
							},
							buttonText:'添加图片',
							method:'post',
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
								id: 'personal_preview_pane',
								target: 'personal_preview_target',
								uploadBtn: 'personal_upload_btn',
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
												$('.personal-upload-image-mask').css('display', 'none');
												_self.initData();
												_self.showPersonalWindow();
												$('#preview-target,.jcrop-holder img,.jcrop-preview').attr('src', 'images/index/hotel_preview.png');
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
					},
					// 个人设置---关闭上传个人头像窗口
					closePersonalUploadImage: function () {
						$('.personal-upload-image-mask').css('display', 'none');
					},
					// 个人设置---取消上传个人头像按钮
					cancelPersonalUploadBtn: function () {
						$('.personal-upload-image-mask').css('display', 'none');
						$('.img-container img').attr('src', '');
					},
					// 个人设置---获取验证码
					getSmsCode: function (event) {
						var _self = this;
						var e = event || window.event;
						var mobile = _self.changePersonalPswd.mobile,
							getSmsId = '';
						/*if (mobile == "") {
							$('.personal-mobile-error-tip').html('选择手机号码');
							return;
						};*/

						_self.countdown(e.currentTarget);
						yzl.getAjax({
							type : 'post',
							data : {
								'mobile' : mobile
							},
							// 同步
							path: 'action/api/getCode',
							sCallback : function (result) {
								if (result.code === '0000') {
									_self.changePersonalPswd.smsId = result.data.smsId;
								} else {
									public.Dialog({
										'content': result.msg
									});
								};
							},
							fCallback : function () {
								public.Dialog({
									'content': '请求出错'
								});
							}
						});
						return getSmsId;
					},
					// 个人设置---短信发送时间倒数
					countdown : function (elem) {
						var _self = this;
						var num = 60;

						$(elem).css({
							'backgroundColor': '#ccc',
							'cursor' :'not-allowed'
						}).attr({
							'disabled' : 'disabled'
						});
						_self.timer = setInterval(function () {
							num --;
							$(elem).html(num);
							if (num < 0) {
								$(elem).html('重新发送验证码').css({
									'backgroundColor': '#f9953c',
									'cursor' :'pointer'
								}).removeAttr('disabled');;
								clearInterval(_self.timer);
							};
						}, 1000);
					},
					// 个人设置---修改密码---清除密码input
					clearPswdErrorTip: function () {
						$('.personal-pswd-error-tip').html('');
					},
					// 个人设置---修改密码---清除验证码
					clearVerifiedCodeErrorTip: function () {
						$('.personal-valid-code-error-tip').html('');
					},
					// 个人设置---确认提交新密码
					updatePasswordBtn: function () {
						var _self = this;

						var data = {
							mobile: _self.changePersonalPswd.mobile,
							code: _self.changePersonalPswd.code.trim(),
							password: _self.changePersonalPswd.password.trim(),
							smsId: _self.changePersonalPswd.smsId
						};

						if (data.password === '') {
							$('.personal-pswd-error-tip').html('密码不能为空');
							return;
						} else if (data.password.length > 32) {
							$('.personal-pswd-error-tip').html('密码不能超过32位');
							return;
						} else if (yzl.reg.Chinese.test(data.password)) {
							$('.personal-pswd-error-tip').html('密码不能有中文');
							return;
						};

						if (data.code === '') {
							$('.personal-valid-code-error-tip').html('验证码不为空');
							return;
						} else if (data.code.length > 6) {
							$('.personal-valid-code-error-tip').html('验证码不超过6位');
							return;
						};
						data.password = hex_md5(data.password);

						yzl.getAjax({
							path: 'account/j/findPassword',
							type: 'post',
							data: data,
							sCallback: function (result) {
								if (result.code == "0000") {
									_self.closePersonalPswdWin();
									$('#getSmsCodeBtn').html('发送验证码').css({
										'backgroundColor': '#f9953c',
										'cursor' :'pointer'
									}).removeAttr('disabled');;
									clearInterval(_self.timer);
								} else {
									yzl.Dialog({
										content: result.msg,
										AutoClose: true
									});
								}
								;
							}
						});
					}
				}
			});

			yzl.headerVue.initEvent();



        /*// 初始化
        linkClick.initEvent();*/

			//侧边栏弹窗开关绑定---交班
		yzl.contentVue = new Vue({
	        el : '#content',
	        data: {
	        	SideturnoverformInfo:'',
	        	SideturnoverformStatus:0,
				// 公告栏---初始化
				getNoticeList: [],
				// 公告栏---加载更多按钮
				swiftLoadingStatus: true,
				// 公告栏---不显示 loading 和 加载更多按钮
				hideLoadingStatus: true,
				// 公告栏---加载更多---当前第几页
				noticeCurrentNum: 1,
				// 公告栏---点击发布新消息
				addNewNotice: {
					hotelId: '',
					content: ''
				},
				// 公告栏---textarea的value值
				addNewNoticeContent : '',
				// 公告栏---发布消息按钮是否禁用
				publishIsDisabled: true,
				// 公告栏---发布按钮 和 取消公告切换
				publishBtnShift: true,
				// 公告栏---获取未读数量
				unreadCount: 0,
				websocket: null,
				/* glenlzk 订单详情 start */
				// 选择渠道下拉框
				channelList:[],
				// 新增订单，修改订单，订单详情等标题名称切换
				addneworderTitle: '订单详情',
				// 新增订单----支付方式
				orderPaymentList: [],
				// 新增订单----上传附件----支付类型附件
				uploadOrderPaymentImageUrl: null,
				// 保存房态全局信息---选择渠道，支付类型，身份证类型等
				saveComonList: [],
				// 图片预览对象
				newViewer: null,
				// 房态权限管理
				roomStatusResourceInfo: JSON.parse(sessionStorage.getItem("Cookie_headerResourceInfo")),
				// 图片预览插件
				previewImageList: [],
				//修改订单---订单日志
				// 订单详情---用户点击行为记录
				// orderDetailsOperateTag 1 默认订单详情 2 住客信息 3 日志
				orderDetailsOperateTag: 1,
				showLoginfo:[],
				// 订单详情---初始化
				roomOrderDetails: {},
				// 订单详情---总费用统计
				orderDetailsCount: {
					roomSumPrice: 0,
					payAmount: 0,
                    receivables: 0,
					alreadyCollection: 0,
					markUpCollection: 0,
					receivedDeposit: 0
				},
				// 订单详情---修改订单
				changeOrderDetailsData: {},
                // 订单详情---服务名称---下拉框list
                showBillTypeNameDropDownList : [
                    '餐饮美食',
                    '烟酒饮料',
                    '物品赔付',
                    '景点门票',
                    '特色纪念品',
                    '其它杂项'
                ],
				// 订单详情---修改订单---上传附件预览
				uploadModifyOrderDataUrl: null,
				// 订单详情---取消订单
				cancelOrderOperate: {
					hotelId: '',
					orderId: '',
					cancelRemark: ''
				},
				// 订单详情----收款----上传附件
				uploadOrderPaymentFilesUrl: null,
				// 订单详情---收押按钮
				updateDeposit: {
					hotelId: '',
					orderId: '',
					depositAmount: 0,
					depositTypeName: '入住押金',
					/*receiveDepositTotal: 0,*/
					depositIdReturnList: [],
					orderDepositList: []
				},
				// 订单详情---收款按钮
				addPayment: {
					hotelId: '',
					orderId: '',
					payTypeCode: 'cash',
					payTypeName: '现金',
					payNo: '',
					payAmount: '',
					payTypeList: [],
					imageId: '',
                    remark: ''
				},
                // 订单详情---收付款---input
                receiveAccount: '0.00',
                refundAccount: '0.00',
                // 订单详情---收款按钮
                swfitReceiveReund: true,
				//  订单详情---收款按钮--校验错误提示
				addPaymentErrorTip: '',
				// 订单详情---收押tag显示
				swiftDepositTag: true,
                // 订单详情---收押tag显示---focus展示下拉框
                showDepositDropDown: false,
                // 订单详情---收押tag显示---下拉框list
                showDepositDropDownList : [
                    '入住押金',
                    '房卡押金',
                    '充电器押金',
                    '雨伞押金',
                    '自行车押金',
                    '厨具押金'
                ],
				// 订单详情---添加住客信息---列表初始化
				 orderCustomerList: [],
				// 订单详情---添加住客信息---列表初始化---记录订单状态
				saveOrderStatus: '',
				// 订单详情----住客信息---保存需要添加同住人---单个list
				perOrderCustomerList: null,
				// 订单详情---添加同住人---错误提示
				addGuestInforErrorTips: '',
				// 订单详情---添加同住人--入参
				addGuestInformation: {
					hotelId: '',
					orderId: '',
					orderRoomStayId: '',
					customerName: '',
					customerMobile: '',
					idNumber: '',
					idType: '',
					// 订单详情---住客信息---身份证下拉选项卡
					getCertificateTypeList: [],
					/*// 订单详情---住客信息---获取房间号
					getOrderRoomList: [],
					orderCustomerId: ''*/
				},
				// 订单详情---添加同住人--保存按钮是否禁用
				isDisabledAddResident: false,
				// 新增订单，订单详情------bottom的btn根据不同的房间状态，显示不同的按钮
				roomOrderBottomBtnStatus: {
					isEditabel_order_btn: true,		// 默认是  未入住状态 即是按钮是: 取消 入住 修改
					editabel_isCheckIn: true,
					isBookingRoom: false
				},
				// 订单详情---保存房态页面的日期
				getTodayDate: '',
                // 订单详情---退房---是否打开退房窗口
                isOpensetDirtyroomTag: false,
                // 订单详情---退房---获取脏房的数据
                dirtyRoomList: [],
				// 每个页面的刷新data
				// 参阅：yzl.contentVue.initPageData = collectionDetail.initData;
				initPageData: null,
				/* glenlzk 订单详情 end*/
				// 图片预览插件-------start
                previewImagesList: [],
				// 图片预览插件-------end
                // 订单详情---上传附件（支付类型附件）--start
                'smPayTypeImgBtn': 'smPayTypeImgBtn',
                'smPayTypeParam': {
                    url: '/yzlpms/img/j/uploadOrderPaymentImage',
                    data: {
                        hotelId: yzl.hotelId || ''
                    },
                    btnText: '上传',
                    isShow: true,
                    parObj: {
                    	'display': 'inline-block'
                    }
                },
                'smPayTypeBackImgInfor': {},
                // 订单详情---上传附件（支付类型附件）--end
                // 修改订单---上传附件（渠道类型）--start
                'modefyChannelTypeImgBtn': 'modefyChannelTypeImgBtn',
                'modefyChannelTypeParam': {
                    url: '/yzlpms/img/j/uploadChannelOrderImage',
                    data: {
                        hotelId: yzl.hotelId || ''
                    },
                    btnText: '上传',
                    isShow: true,
                    parObj: {
                    }
                },
                'modefyChannelTypeBackImgInfor': {}
                // 修改订单---上传附件（渠道类型）--end
	        },
            components: {
	        	'v-preview': yzl.previewImgVue,
                'v-uploadify': yzlObj.uploadifyVue
			},
			computed: {
				// 订单详情---收押按钮---动态监控退回押金总额
				receiveDepositTotal: function () {
					var _self = this;
					var total = 0;
					var item = _self.updateDeposit.depositIdReturnList;
					var arr = _self.updateDeposit.orderDepositList;
					for (var i=0; i<item.length; i++) {
						for (var j= 0, jen=arr.length; j<jen; j++) {
							if (arr[j]['orderDepositId'] == item[i]) {
								total += arr[j]['depositAmount'];
							};
						};
					};
					return total;
				}
            },
			watch: {
				// 公告栏---监控输入字符
			 	addNewNoticeContent: function (newVal, oldVal) {
					var _self = this;
					if((newVal).trim().length > 0) {
						_self.publishIsDisabled = false;
						$('.publish-btn').attr('disabled', false);
						return;
					};
					_self.publishIsDisabled = true;
					$('.publish-btn').attr('disabled', true);
				},
                // 修改订单---上传附件（渠道类型）--上传成功返回url
                modefyChannelTypeBackImgInfor: function (newVal) {
                    var _self = this;

                    _self.changeOrderDetailsData.imageId = newVal.imageId;
                    _self.uploadModifyOrderDataUrl = newVal.imageUrl;
                },
                // 修改订单---上传附件（渠道类型）--上传成功返回url
                smPayTypeBackImgInfor: function (newVal) {
                    var _self = this;

                    _self.addPayment.imageId = newVal.imageId;
                    _self.uploadOrderPaymentFilesUrl = newVal.imageUrl;
				},
                // 订单详情----收退款---收款
                swfitReceiveReund: function (newVal) {
                    var _self = this;
                    _self.initReceiveReundTag(newVal);
                },
                // 订单详情----收退款---收款金额
                receiveAccount: function (newVal) {
                    var _self = this;

                    if (newVal < 0) {
                        _self.receiveAccount = '0.00';
                    };
                },
                // 订单详情----收退款---收款金额
                refundAccount: function (newVal) {
                    var _self = this;

                    if (newVal < 0) {
                        _self.refundAccount = '0.00';
                    };
                }
			},
	        methods: {
				// websocket
				setSocketData: function () {
					var _self = this;
					// ws://192.168.7.79:8080/yzlmessage/webSocketServer
					var url = 'ws://' + yzl.websocketUrl + '/yzlmessage/WsServer/newUserNotice';
					if ('WebSocket' in window) {
						_self.websocket = new WebSocket(url);
					} else if ('MozWebSocket' in window) {
						_self.websocket = new MozWebSocket(url);
					} else {
						//http://192.168.7.79:8080/yzlmessage/sockjs/webSocketServer
						_self.websocket = new SockJS('http://' + yzl.websocketUrl + 'yzlmessage/sockjs/WsServer/newUserNotice');
					}
					// websocket链接成功，回调方法
					_self.websocket.onopen = function(evnt) {
						var obj = {
							hotelId: yzl.hotelId,
							userId: sessionStorage.getItem("Cookie_userId")
						}
						try {
                            _self.websocket.send(JSON.stringify(obj));
						}catch(e) {
                            console.log('websocket 出错...');
						};
					};
					_self.websocket.onmessage = function(evnt) {
						/*$("#msgcount").prepend("<p>"+evnt.data+"</p>");*/
						if ("0000" == evnt.data) {
							_self.getUnreadCountFun();
						};
					};

					_self.websocket.onerror = function(evnt) {
						console.log(evnt);
					};
					_self.websocket.onclose = function(evnt) {

					}
				},
	            // 初始化数据
	            initData: function () {
	            	var _self = this;
	                var data = {
	                    hotelId: yzl.hotelId
	                };
	                yzl.getAjax({
	                    path : 'changeShift/j/previewChange',
	                    type : 'post',
	                    data : data,
	                    sCallback : function (result) {
	                        if (result.code == "0000") {
	                            _self.SideturnoverformInfo = result.data;
	                            $('.Sideturnover-window-mask').css('display','block');
								$('.Sideturnover-window-mask i').on("click",function(){
									_self.SideturnoverformStatus = 0;
									$('.Sideturnover-window-mask').css('display','none');
								});
	                        } else {
	                            yzl.Dialog({
	                                content : result.msg,
	                                AutoClose: true
	                            });
	                        };
	                    }
	                });
	            },
	            //点击交班出现弹窗
	            showSideturnoverForm:function(){
	            	this.initData();
	            },
				//点击交班按钮发送增加
				addturnoverChange:function(){
					var _self = this;
					yzl.getAjax({
						path : 'changeShift/j/addChange',
						type : 'post',
						data : {
							hotelId:yzl.hotelId
						},
						sCallback : function (result) {
							if (result.code == "0000") {
								yzl.Dialog({
									content : '交班成功！',
									AutoClose: true
								});
								_self.SideturnoverformStatus=1;
								_self.SideturnoverformInfo = result.data;
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				//点击打印按钮
				printIframe:function(){
					var _self = this;
					var Expaddress = '/hotel/print/initprint.html?changeShiftId=' + _self.SideturnoverformInfo.changeShiftId + '&hotelId=' + yzl.hotelId;
					$('.printIframe').attr('src',Expaddress);
				},
				// 公告栏----获取未读数量
				getUnreadCountFun: function () {
					var _self = this;
					var data = {
						hotelId: yzl.hotelId
					};
					yzl.getAjax({
						path : 'notice/j/getUnreadCount',
						type : 'post',
						data : data,
						sCallback : function (result) {
							if (result.code == "0000") {
								_self.unreadCount = result.data.count;
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 公告栏---发布按钮 和 取消公告切换
				showPublishNoticeOperateBox: function () {
					var _self = this;
					_self.publishBtnShift = !_self.publishBtnShift;
					if (_self.publishBtnShift) {
						_self.addNewNoticeContent = "";
					};
				},
				// 公告栏---点击初始化
				initNoticeCotent: function () {
					var _self = this;
					_self.applyForNoticeLists();
				},
				// 公告栏---初始化数据
				applyForNoticeLists: function (page) {
					var _self = this;
					// 插入loading
					/*yzl.showLoadingTips({
						top: '130',
						parElem: '#sidenoticeContentBox',
						background: '#f7f7f7'
					});*/
					$('.Sidenotice-window-mask').css('display','block');
					var pageNum = page || 1;
					yzl.getAjax({
						path : '/notice/j/getNoticeList',
						type : 'post',
						data : {
							hotelId:yzl.hotelId,
							pageSize: 20,
							pageNum: pageNum
						},
                        loadingElem: '#showPublishBtnOperate',
                        tips: false,
						sCallback : function (result) {
							if (result.code == "0000") {
								if (_self.getNoticeList.length == 0) {
									_self.getNoticeList = result.data.list;
								} else {
									for (var i=0; i<result.data.list.length; i++) {
										_self.getNoticeList.push(result.data.list[i]);
									};
								};

								if (result.data.pageNum*20 < result.data.total) {
									_self.hideLoadingStatus = true;
								} else {
									_self.hideLoadingStatus = false;
								};

								_self.noticeCurrentNum = result.data.pageNum;
								_self.swiftLoadingStatus = true;
								// 公告栏 ---文本是否展开
								for (var i=0; i<_self.getNoticeList.length; i++) {
									if (_self.getNoticeList[i].noticeType == 1) {
										_self.$set('getNoticeList['+i+'].spreadStatus',true);
									};
								};
								_self.processNoticeList(_self.getNoticeList);

								// 禁止滚动条
								$(document.body).css('overflow', 'hidden');
								// 如果没有消息，则默认--发布公告状态
								if(_self.getNoticeList.length == 0) {
									_self.publishBtnShift = false;
								};
								_self.addNewNoticeContent = "";
								/*// 删除loading
								$('#second_loading').remove();*/
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},

				// 公告栏---昨天，今天，更早
				processNoticeList: function (list) {
					var _self = this;
					var today = new Date(new Date().format('yyyy-MM-dd')).getTime();
					var yesterday = new Date(today - 86400000).getTime();
					var startCount = 0;
					var hasYesterday = false;
					var hasToday = false;
					var hasEarlyDays = false;

					if (list.length == 0) return;
					if (list.length == 1) {
						if (timeFormate(list[0]) == today) {
							setNewElem(0, 'isToday');
						} else if (timeFormate(list[0]) == yesterday) {
							setNewElem(0, 'isYesterday');
						} else {
							setNewElem(0, 'isEarlyDays');
						};
					};

					if (list.length > 1) {
						for (var i=0; i<list.length-1; i++) {
							var firListDate =  timeFormate(list[i]);
							var secListDate =  timeFormate(list[i+1]);
							if(firListDate == secListDate) {
								if (startCount == 0) {
									if (firListDate == today) {
										if (hasToday) continue;
										setNewElem(i, 'isToday');
										hasToday = true;
									} else if (firListDate == yesterday) {
										if (hasYesterday) continue;
										setNewElem(i, 'isYesterday');
										hasYesterday = true;
									} else {
										if (hasEarlyDays) continue;
										setNewElem(i, 'isEarlyDays');
										hasEarlyDays = true;
									};
								};
								startCount ++;
							} else if (firListDate != secListDate && firListDate == today) {
								startCount = 0;
								if (hasToday) continue;
								setNewElem(i, 'isToday');
								hasToday = true;
							} else if (firListDate != secListDate && firListDate == yesterday) {
								startCount = 0;
								if (hasYesterday) continue;
								setNewElem(i, 'isYesterday');
								hasYesterday = true;
							} else {
								startCount = 0;
								if (hasEarlyDays) continue;
								setNewElem(i, 'isEarlyDays');
                                hasEarlyDays = true;
							};
						};

						if (startCount == 0) {
							if (timeFormate(list[list.length-1]) == yesterday) {
								//if (!isYesterday) {
									setNewElem(list.length-1, 'isYesterday');
								//};
							};
						};
					};

					function setNewElem(i, whatDay) {
						_self.$set('getNoticeList['+i+'].isShowDayDivingLine',true);
						_self.$set('getNoticeList['+i+'].'+ whatDay, true);
					};

					function timeFormate (list) {
						return new Date(list.createTime.split(' ')[0]).getTime();
					};
				},
				// 公告栏---显示今天，昨天，更早
				noticeShowDateRang: function (item) {
					var _self = this;
					if (item.isToday) {
						return '今天';
					} else if (item.isYesterday) {
						return '昨天';
					} else if (item.isEarlyDays) {
						return '更早';
					};
				},
				// 公告栏---展开按钮
				spreadLayoutTextOperate: function (item, num) {
					item.spreadStatus = !item.spreadStatus
				},
				// 公告栏---格式时间--获取日期
				getNoticeDate: function (t) {
					var _self = this;
					if (t.split(' ').length == 2) {
						return t.split(' ')[0];
					};
				},
				// 公告栏---格式时间--获取时分
				getNoticeTime: function (t) {
					var _self = this;
					if (t.split(' ').length == 2) {
						return t.split(' ')[1];
					};
				},
				// 公告栏---点击加载更多
				sideNoticeLoadingMoreBtn: function () {
					var _self = this;

					_self.noticeCurrentNum += 1;

					_self.applyForNoticeLists(_self.noticeCurrentNum);

					_self.swiftLoadingStatus = false;

				},
				 // 公告栏---发布新消息
				publishNewNotice: function () {
					var _self = this;

					_self.addNewNotice.hotelId = yzl.hotelId;
					_self.addNewNotice.content = _self.addNewNoticeContent.trim();
					var data = _self.addNewNotice;

					/*if (_self.addNewNotice.content.trim() == '') {
						_self.sidenoticeErrorCotentTips = '发布内容不能为空';
						return;
					};*/

					yzl.getAjax({
						path : '/notice/j/addNotice',
						type : 'post',
						data : data,
						sCallback : function (result) {
							if (result.code == "0000") {
								_self.addNewNotice.content = '';
								_self.addNewNoticeContent = '';

								_self.noticeCurrentNum = 1;
								_self.getNoticeList = [];
								_self.applyForNoticeLists(_self.noticeCurrentNum);

								_self.publishBtnShift = true;

								_self.scrollToTop();
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 发布公告---回调成功后，回到顶部
				scrollToTop: function () {
					var _self = this;
					var timer = null;

					var top = $('#sidenoticeContentBox').get(0).scrollTop;

					if (top > 0) {
						timer = setInterval(function () {
							$('#sidenoticeContentBox').get(0).scrollTop -= 200;

							if ($('#sidenoticeContentBox').get(0).scrollTop <= 0) {
								clearInterval(timer);
							};
						}, 30);
					};
				},
				// 公告栏---textArea---focus清空错误提示
				/*addNewNoticeTextaeraFocus: function () {
					var _self = this;
					_self.sidenoticeErrorCotentTips = '';
				},*/
				// 公告栏---关闭公告栏弹窗
				closeSideNoticeTagOpera: function () {
					var _self = this;
					_self.addNewNoticeContent = '';

					yzl.getAjax({
						path : '/notice/j/updateIsRead',
						type : 'post',
						data : {
							hotelId: yzl.hotelId
						},
						sCallback : function (result) {
							if (result.code == "0000") {
								$('.Sidenotice-window-mask').css('display', 'none');
								$(document.body).css('overflow', 'visible');

								_self.getNoticeList = [];

								_self.getUnreadCountFun();
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				/* -------订单详情 start---------- */
				// 获取房态基本信息---选择渠道，支付类型，身份证类型等
				// this.getCommonList();----搜索：yzl.contentVue.getCommonList();
				getCommonList: function () {
					var _self = this;

					yzl.getAjax({
						path : '/order/j/commonList',
						type : 'post',
						data : {
							hotelId: yzl.hotelId
						},
						sCallback : function (result) {
							if (result.code == "0000") {
								_self.saveComonList = result.data;
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 订单详情---关闭整个窗口
				closeWholeOrderTag: function () {
					var _self = this;

					_self.orderRoomStayList = [];
					_self.orderBillList = [];
					_self.closeAllroomTagsOperate();

					_self.changeOrderDetailsData = {};

					_self.orderCustomerList = [];
					// 修改订单----清空附件操作
					_self.uploadModifyOrderDataUrl = null;
					// 回复滚动条
					if($('.Sidenotice-window-mask').css('display') != 'block') {
						$(document.body).css('overflow', 'visible');
					};
				},
				//  查看---新增订单---所有---上传附件
				previewUploadImage: function (url) {
					/*var _self = this;
					_self.previewImageList = [];
					_self.previewImageList.push(url);

					Vue.nextTick(function () {
						// 实例化 viewer插件
						_self.newViewer = new Viewer(document.getElementById('roomStatusPreviewPic'), {
							url: 'data-original',
							// 隐藏显示缩略图导航
							navbar: false,
							// 隐藏工具栏
							toolbar: false
						});
						// 打开预览图片器
						$('#previewOneImage_0').click();
					});*/

                    var _self = this;
                    var imgList = [];

                    imgList.push(url);

                    _self.previewImagesList = imgList;
				},
				//  房间时间列表---点击占用房间---查看订单详情
				openRoomOrderDetails: function (orderId) {
					var _self = this;

                    // 关闭窗口---调回订单详情
                    if ($('.wholeorder-tag-mask').css('display') != 'block') {
                        $('.show-order-cotent-header span').eq(0).addClass('active').siblings().removeClass('active');
                        $('.show-order-orderDetail').addClass('active').siblings().removeClass('active');
                    };

                    $('.wholeorder-tag-mask, #show_order_box').fadeIn(300);

					var data = {
						hotelId: yzl.hotelId,
						orderId: orderId
					};
					// 保存取消订单所需要的orderId
					_self.cancelOrderOperate.orderId = orderId;

					yzl.getAjax({
						path : '/order/j/getDetail',
						type : 'post',
						data : data,
                        loadingElem: '#showOrderDetailTag',
						tips: false,
						sCallback : function (result) {
							if (result.code == "0000") {
								_self.roomOrderDetails = result.data;

								// 窗口-----底下按钮显示状态问题
								switch(result.data.orderStatus) {
									case '1':		// 未入住
										_self.roomOrderBottomBtnStatus.isEditabel_order_btn = true;
										_self.roomOrderBottomBtnStatus.editabel_isCheckIn = true;
										break;
									case '2':		// 已入住
										_self.roomOrderBottomBtnStatus.isEditabel_order_btn = true;
										_self.roomOrderBottomBtnStatus.editabel_isCheckIn = false;
										break;
									case '3':		// 已离店
										_self.roomOrderBottomBtnStatus.isEditabel_order_btn = false;
										break;
									case '4':		// 已取消订单
										_self.roomOrderBottomBtnStatus.isEditabel_order_btn = false;
										break;
								};

								_self.changeOrderDetailsData = result.data;

								_self.addneworderTitle = "订单详情";
								for (var i= 0; i<_self.changeOrderDetailsData.orderRoomStayList.length; i++) {
									_self.$set('changeOrderDetailsData.orderRoomStayList['+i+'].roomTypeList',[]);
									_self.$set('changeOrderDetailsData.orderRoomStayList['+i+'].roomList',[]);
									_self.$set('changeOrderDetailsData.orderRoomStayList['+i+'].origDayPriceList',0);
									_self.$set('changeOrderDetailsData.orderRoomStayList['+i+'].fixedPrice',0);
									_self.$set('changeOrderDetailsData.orderRoomStayList['+i+'].sumPrices',0);
									_self.$set('changeOrderDetailsData.orderRoomStayList['+i+'].totalDays',0);
								};
								_self.getOrderDetailsCount(_self.roomOrderDetails);
								// 禁止滚动条
								$(document.body).css('overflow', 'hidden');

								// 订单详情--取消订单窗口
								$('.show-order-cancell-tag-mask').css('display', 'none');

								// 初始化上传插件
								// _self.uploadPersonalData('uploadModifyOrderDataBtn');
								// _self.uploadOrderPaymentImage('uploadOrderPaymentFiles');
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 新增订单窗口---修改房间价格---一口价和总价变化
				changeSumPrice: function (item, perday) {
					var _self = this;
					var total = 0;
					// 小于0 或 非数字
					if (isNaN(perday.price) || perday.price < 0) {
						perday.price = 0;
					} else {
						// 大于两位小数点需要进行截取
						var sNum = perday.price + '';
						var index = sNum.indexOf('.');
						if (index != -1) {
							var aNum = sNum.split('.')[1];
							if (aNum.length > 2) {
								perday.price = yzl.keepTwoDecimal(perday.price);
							};
						};
					};

					var arrDayPriceList = [];
					for (var i=0; i<item.dayPriceList.length; i++) {
                        arrDayPriceList.push(item.dayPriceList[i].price);
						// total = yzl.floatObj.add(total, item.dayPriceList[i].price);
					};
                    total = yzl.calcuResult(arrDayPriceList);
					//item.realtimeSumPrice = item.fixedPrice = total;
					item.totalPrice = item.fixedPrice = yzl.keepTwoDecimal(total);

					// 统计总费用---入住费用
					//_self.orderFeeCount.roomSumPrice = _self.roomSumPrice();
				},
				// 新增订单窗口---房间价格列表---失焦保持两位小数点  如:0002 2 ==> 2.00
				formateNumPriceList: function (perday) {
					perday.price = yzl.keepTwoDecimal(perday.price);
				},
				// 新增订单窗口---房价列表价格---一口价
				changePerDayPrices: function (item) {
					var _self = this;
					// 小于0 或 非数字
					if (isNaN(item.fixedPrice) || Number(item.fixedPrice) < 0) {
						item.totalPrice = item.fixedPrice = 0;
					} else {
						// 大于两位小数点需要进行截取
						var sNum = item.fixedPrice + '';
						var index = sNum.indexOf('.');
						if (index != -1) {
							var aNum = sNum.split('.')[1];
							if (aNum.length > 2) {
								item.totalPrice = item.fixedPrice = Number(yzl.keepTwoDecimal(item.fixedPrice));
							};
						};
					};
					// 各个房间价格算法
					var priceRatio = item.fixedPrice/item.sumPrices;
					var removeLastItemSum = 0;

                    var arrDayPriceList = [];
                    for (var i=0; i<item.dayPriceList.length-1; i++) {
                        var aOrigPriceList = item.origDayPriceList[i].price;
                        // 保留两位小数
                        item.dayPriceList[i].price = yzl.keepTwoDecimal(aOrigPriceList*priceRatio);
                        // removeLastItemSum = yzl.floatObj.add(removeLastItemSum, item.dayPriceList[i].price);
                        arrDayPriceList.push(item.dayPriceList[i].price);
                    };
                    removeLastItemSum = yzl.calcuResult(arrDayPriceList);

					// item.dayPriceList[item.dayPriceList.length-1].price = yzl.keepTwoDecimal(yzl.floatObj.subtract(item.fixedPrice, removeLastItemSum));
					item.dayPriceList[item.dayPriceList.length-1].price = yzl.keepTwoDecimal(yzl.calcuResult([item.fixedPrice, -removeLastItemSum]));

					// 统计总费用---入住费用
					//_self.orderFeeCount.roomSumPrice = _self.roomSumPrice();
				},
				// 新增订单窗口---房价列表价格---一口价---失焦保持两位小数 如:0002 2 ==> 2.00
				formateNumFixedPrice: function (item) {
					item.totalPrice = item.fixedPrice = yzl.keepTwoDecimal(item.fixedPrice);
				},
				// 修改订单----房价列表价格---回复默认价格操作
				restoreDefaultsDayPriceList: function (item) {
					var total = 0;
					item.dayPriceList = JSON.parse(JSON.stringify(item.origDayPriceList));

					var arrDayPriceList = [];
					for (var i=0; i<item.dayPriceList.length; i++) {
						// total = yzl.floatObj.add(total, item.dayPriceList[i].price);
                        arrDayPriceList.push(item.dayPriceList[i].price);
					};

                    total = yzl.calcuResult(arrDayPriceList);

					item.totalPrice = item.fixedPrice = yzl.keepTwoDecimal(total);
				},
				// 新增订单窗口---获取每个房间原本备份价格
				getBackupPerdayPrice: function (item, index) {
					var _self = this;

					//return item.backupDayPriceList[index]['price']
					return item.origDayPriceList[index]['price']
				},
				// 新增订单----上传附件----渠道类型附件
				/*uploadPersonalData: function (id) {
					var _self = this;

					yzl.InitUploadify({
						id: id,												// 上传按钮id
						url: '/yzlpms/img/j/uploadChannelOrderImage',						// 上传服务器地址
						data: {
							hotelId: yzl.hotelId
						},
						method:'get',
						buttonText:'上传',
						sCallback: function (data) {
							var result = JSON.parse(data);
							if (result.code == "0000") {
								if ('uploadPersonalDataBtn' == id) {
									_self.addNewOrders.imageId = result.data.imageId;
									_self.uploadChannelOrderImageUrl = result.data.imageUrl;

								} else {
									_self.changeOrderDetailsData.imageId = result.data.imageId;
									_self.uploadModifyOrderDataUrl = result.data.imageUrl;
								};
							};
						}
					});
				},*/

				// 订单详情----上传附件----支付类型附件
				/*uploadOrderPaymentImage: function (id) {
					var _self = this;

					yzl.InitUploadify({
						id: id,												// 上传按钮id
						url: '/yzlpms/img/j/uploadOrderPaymentImage',						// 上传服务器地址
						data: {
							hotelId: yzl.hotelId
						},
						method:'get',
						buttonText:'上传',
						sCallback: function (data) {
							var result = JSON.parse(data);
							if (result.code == "0000") {
								//_self.uploadImgId = result.data.imageId;
								if ('uploadOrderPaymentImageBtn' == id) {
									_self.orderPaymentList[0].imageId = result.data.imageId;
									_self.uploadOrderPaymentImageUrl = result.data.imageUrl;
								} else {
									_self.addPayment.imageId = result.data.imageId;
									_self.uploadOrderPaymentFilesUrl = result.data.imageUrl;
								};
							};
						}
					});
				},*/
				// 订单详情---退押金--标红
				returnDepositAccount: function (income) {
					var _self = this;
					if (income != 1) {
						return {'return-deposit': true};
					};
				},
				// 订单详情---统计总费用
				getOrderDetailsCount: function (data) {
					var _self = this;
					var roomSumPriceList = [];
					for (var i= 0, len=data.orderRoomStayList.length; i<len ;i++) {
                        roomSumPriceList.push(data.orderRoomStayList[i].totalPrice);
                        // _self.orderDetailsCount.roomSumPrice = yzl.floatObj.add(_self.orderDetailsCount.roomSumPrice, data.orderRoomStayList[i].totalPrice);
					};
                    _self.orderDetailsCount.roomSumPrice = yzl.calcuResult(roomSumPriceList);

                    var orderBillAmountList = [];
					for (var i= 0, len=data.orderBillList.length; i<len ;i++) {
                        orderBillAmountList.push(data.orderBillList[i].amount);
                        // _self.orderDetailsCount.payAmount = yzl.floatObj.add(_self.orderDetailsCount.payAmount, data.orderBillList[i].amount);
					};
                    _self.orderDetailsCount.payAmount = yzl.calcuResult(orderBillAmountList);

                    // _self.Receivables
					// _self.orderDetailsCount.receivables = yzl.floatObj.add(_self.orderDetailsCount.roomSumPrice, _self.orderDetailsCount.payAmount);
					_self.orderDetailsCount.receivables = yzl.calcuResult([_self.orderDetailsCount.roomSumPrice, _self.orderDetailsCount.payAmount]);;

					var orderPayAmountlist = [];
					for (var i= 0, len=data.orderPaymentList.length; i<len ;i++) {
                        orderPayAmountlist.push(data.orderPaymentList[i].payAmount);
                        // _self.orderDetailsCount.alreadyCollection = yzl.floatObj.add(_self.orderDetailsCount.alreadyCollection, data.orderPaymentList[i].payAmount);
					};
                    _self.orderDetailsCount.alreadyCollection = yzl.calcuResult(orderPayAmountlist);

                    var markUpCollectionList = [
                        _self.orderDetailsCount.roomSumPrice,
                        _self.orderDetailsCount.payAmount,
						-(_self.orderDetailsCount.alreadyCollection)
					];
                    _self.orderDetailsCount.markUpCollection = yzl.calcuResult(markUpCollectionList);

                   /* var markUpCollectionNum = 0;
                    markUpCollectionNum = yzl.floatObj.add(markUpCollectionNum, _self.orderDetailsCount.roomSumPrice);
                    markUpCollectionNum = yzl.floatObj.add(markUpCollectionNum, _self.orderDetailsCount.payAmount);
                    markUpCollectionNum = yzl.floatObj.subtract(markUpCollectionNum, _self.orderDetailsCount.alreadyCollection);
                    _self.orderDetailsCount.markUpCollection = markUpCollectionNum;*/

					_self.orderDetailsCount.receivedDeposit = 0;
					var depositAmountList = [];
					for (var i= 0, len=data.orderDepositList.length; i<len ;i++) {
						if (data.orderDepositList[i].isIncome == '1') {
                            depositAmountList.push(data.orderDepositList[i].depositAmount);
                            //_self.orderDetailsCount.receivedDeposit = yzl.floatObj.add(_self.orderDetailsCount.receivedDeposit, data.orderDepositList[i].depositAmount);
						} else {
                            depositAmountList.push(-data.orderDepositList[i].depositAmount);
                            // _self.orderDetailsCount.receivedDeposit = yzl.floatObj.subtract(_self.orderDetailsCount.receivedDeposit, data.orderDepositList[i].depositAmount);
						};
					};
                    _self.orderDetailsCount.receivedDeposit = yzl.calcuResult(depositAmountList);
				},
				// 订单详情---房型文字超长度，则用...代替
				orderDetailRmTypeLenLimit: function (str) {
					var _slef = this;
					if (str.length <= 13) {
						return str;
					} else {
						return str.substr(0, 13) + '...';
					};
				},
				// 订单详情---展示每日房价
				showRoomOrderDayPrice: function (event) {
					var e = event || window.event;
					$(e.currentTarget).find('.day-prices-list').css('display', 'block');
				},
				// 订单详情---隐藏每日房价
				hiddenRoomOrderDayPrice: function (event) {
					var e = event || window.event;
					$(e.currentTarget).find('.day-prices-list').css('display', 'none');
				},
				// 修改订单---初始化
				changeOrderDetails: function (channelCode) {
					var _self = this;

                    $('#show_order_box').css('display', 'none');
                    $('#modefy_order_details').css('display', 'block');
                    _self.addneworderTitle = '修改订单';

					// 选择渠道
					if (channelCode == "kkapp") {
						_self.channelList= [{code: "kkapp", isCheck: false, isFlag: false, name: "kk开门"}];
						_self.changeOrderDetailsData.channelCode = 'kkapp';
					} else {
						yzl.getAjax({
							path : '/order/j/commonList',
							type : 'post',
							data : {
								hotelId: yzl.hotelId
							},
							sCallback : function (result) {
								if (result.code == "0000") {
									// 新增订单 -----选择渠道
									_self.channelList= result.data.channelList;
								} else {
									yzl.Dialog({
										content : result.msg,
										AutoClose: true
									});
								};
							}
						});
					};

					yzl.getAjax({
						path : '/order/j/getDetail',
						type : 'post',
						data : {
							hotelId: yzl.hotelId,
							orderId: _self.cancelOrderOperate.orderId
						},
                        loadingElem: '#showOrderDetailTag',
                        tips: false,
						sCallback : function (result) {
							if (result.code == "0000") {
								_self.changeOrderDetailsData = result.data;

                                for (var j=0; j<_self.changeOrderDetailsData.orderBillList.length; j++ ) {
                                    _self.$set('changeOrderDetailsData.orderBillList['+j+'].showBillTypeNameDropDown', false);
                                };

								for (var i= 0; i<_self.changeOrderDetailsData.orderRoomStayList.length; i++) {
									_self.$set('changeOrderDetailsData.orderRoomStayList['+i+'].roomTypeList',[]);
									_self.$set('changeOrderDetailsData.orderRoomStayList['+i+'].roomList',[]);
									_self.$set('changeOrderDetailsData.orderRoomStayList['+i+'].origDayPriceList',[]);
									_self.$set('changeOrderDetailsData.orderRoomStayList['+i+'].fixedPrice',0);
									_self.$set('changeOrderDetailsData.orderRoomStayList['+i+'].sumPrices',0);
									_self.$set('changeOrderDetailsData.orderRoomStayList['+i+'].totalDays',0);
								};

								var stayList = _self.changeOrderDetailsData.orderRoomStayList;
								for(var i= 0, len=stayList.length; i<len; i++) {
									_self.getCheckin_checkOutList(stayList[i]);
								};
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});

				},
				// 订单详情---取消订单
				cancleOrderDetails: function () {
					var _self = this;
					if (_self.orderDetailsCount.receivedDeposit == 0) {
						$('.show-order-cancell-tag-mask').css('display', 'block');
					} else {
						yzl.Dialog({
							content : '押金不等于0, 无法取消订单',
							AutoClose: true
						});
					};
				},
				// 订单详情---关闭取消订单窗口
				hiddenShowOrderCancellTag: function () {
					$('.show-order-cancell-tag-mask').css('display', 'none');
					$('.show-order-cancell-textarea textarea').val('');
				},
				// 订单详情---确定取消订单
				confirmCancelOrderOperate: function () {
					var _self = this;

					_self.cancelOrderOperate.hotelId = yzl.hotelId;

					var data = _self.cancelOrderOperate;

					if (yzl.roomStatusWSTimestamp) {
						data.timestamp = yzl.roomStatusWSTimestamp;
					};

					yzl.getAjax({
						path : '/order/j/cancelOrder',
						type : 'post',
						data : data ,
                        loadingElem: '#cancellOrderTag',
                        tips: false,
                        loadingTop: 117,
						sCallback : function (result) {
							if (result.code == "0000") {
								_self.cancelOrderOperate.cancelRemark = "";
								_self.closeAllroomTagsOperate();
								// 页面可滚动
								$(document.body).css('overflow', 'visible');
								if (_self.initPageData) {
									_self.initPageData(_self.getTodayDate);
								};
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 订单详情---取消订单---清除texterea内容
				clearOrderCancelTextArea: function () {
					$('.show-order-cancell-textarea textarea').val('');
				},
				// 订单详情---收取押金---初始化
				receivedDepositOperate: function () {
					var _self = this;

					var data = {
						hotelId: yzl.hotelId,
						orderId: _self.cancelOrderOperate.orderId
					};

					yzl.getAjax({
						path : '/orderFinance/j/depositList',
						type : 'post',
						data : data ,
						sCallback : function (result) {
							if (result.code == "0000") {
								_self.updateDeposit.orderDepositList = result.data.orderDepositList;
								for (var i=0; i<_self.updateDeposit.orderDepositList.length; i++) {
                                    _self.$set('updateDeposit.orderDepositList[' + i +'].checked', false);
								};
								$('.show-order-deposit-tag-mask').css('display', 'block');
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});

				},
				// 订单详情---点击押金名称下拉框
                selectDepositDropDownItem: function (item) {
					var _self = this;
					_self.updateDeposit.depositTypeName = item;
					_self.showDepositDropDown = false;
				},
                clickDeposit: function () {
                	console.log('阻止冒泡');
				},
                depositTagMask: function (event) {
                    var _self = this;
                    _self.showDepositDropDown = false;
				},
				// 订单详情 --- 收/退押 --- checkbox
                selectDepositReturn: function (item) {
					var _self = this;

					item.checked = !item.checked;

					_self.updateDeposit.depositIdReturnList = [];
					for (var i=0; i<_self.updateDeposit.orderDepositList.length; i++) {
						if (_self.updateDeposit.orderDepositList[i].checked) {
                            _self.updateDeposit.depositIdReturnList.push(_self.updateDeposit.orderDepositList[i].orderDepositId);
						};
					};
				},
				// 订单详情---确定提交修改押金
				confirmUpdateDeposit: function () {
					var _self = this;

					_self.updateDeposit.orderId =  _self.cancelOrderOperate.orderId;
					_self.updateDeposit.orderDepositAdd= {
						depositAmount: _self.updateDeposit.depositAmount,
						depositTypeName:  _self.updateDeposit.depositTypeName
					};

					if(_self.updateDeposit.depositAmount == 0){
						_self.updateDeposit.orderDepositAdd = null;
					}
					_self.updateDeposit.hotelId = yzl.hotelId;

					// 根据不同的tag栏提交不同的数据
					if (_self.swiftDepositTag) {
						_self.updateDeposit.depositIdReturnList = [];
					} else {
                        _self.updateDeposit.orderDepositAdd = null;
					};

					var data = _self.updateDeposit;

					yzl.getAjax({
						path : '/orderFinance/j/updateDeposit',
						type : 'post',
						data : data ,
                        loadingElem: '#orderDepositTag',
                        tips: false,
                        loadingTop: 117,
						sCallback : function (result) {
							if (result.code == "0000") {
								// _self.updateDeposit.depositTypeName = '';
								// _self.updateDeposit.depositAmount = 0;
								_self.openRoomOrderDetails(_self.cancelOrderOperate.orderId);
								// $('.show-order-deposit-tag-mask').css('display', 'none');
                                _self.closeOrderDepositTag();
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
                // 订单详情---关闭收押金窗口
                closeOrderDepositTag: function () {
                    var _self = this;
                    _self.updateDeposit.depositTypeName = '入住押金';
                    _self.swiftDepositTag = true;
                    _self.updateDeposit.depositIdReturnList = [];
                    _self.updateDeposit.depositAmount = 0;
                    $('.show-order-deposit-tag-mask').css('display', 'none');
                },
				// 订单详情---关闭收押金窗口
				/*closeOrderDepositTag: function () {
					var _self = this;
					_self.updateDeposit.depositTypeName = '';
					_self.updateDeposit.depositAmount = 0;
					$('.show-order-deposit-tag-mask').css('display', 'none');
				},*/
				// 订单详情---收款窗口---初始化
				receivablesOperate: function () {
					var _self = this;

					_self.addPayment.payTypeList = _self.saveComonList.payTypeList;
					// _self.addPayment.payAmount =(_self.orderDetailsCount.markUpCollection).toFixed(2);
					$('.show-order-receivables-tag-mask').css('display', 'block');

                    if (_self.orderDetailsCount.markUpCollection >= 0) {
                        _self.swfitReceiveReund = true;
                        _self.receiveAccount = _self.orderDetailsCount.markUpCollection;
                    } else {
                        _self.swfitReceiveReund = false;
                        _self.refundAccount = Math.abs(_self.orderDetailsCount.markUpCollection);
                    };
				},
				// 订单详情---收款窗口---确定按钮
				addPaymentOperate: function () {
					var _self = this;

					_self.addPayment.orderId = _self.cancelOrderOperate.orderId;

					if (_self.addPayment.payTypeCode == "") {
						_self.addPaymentErrorTip = '请选择支付方式';
						return;
					};

					if (_self.swfitReceiveReund) {
                        _self.addPayment.payAmount = _self.receiveAccount;
					} else {
                        _self.addPayment.payAmount = -_self.refundAccount;
					};

                    if (_self.addPayment.payAmount == 0) {
                        _self.addPaymentErrorTip = '请输入金额';
                        return;
                    };

					_self.addPayment.hotelId = yzl.hotelId;
					var data = _self.addPayment;
					yzl.getAjax({
						path : '/orderFinance/j/addPayment',
						type : 'post',
						data : data,
                        loadingElem: '#orderReceivableTag',
                        tips: false,
                        loadingTop: 117,
						sCallback : function (result) {
							if (result.code == "0000") {
								_self.addPayment.payNo = '';
								_self.addPayment.payAmount = '';
								_self.openRoomOrderDetails(_self.cancelOrderOperate.orderId);
								$('.show-order-receivables-tag-mask').css('display', 'none');
                                // 订单详情----收款----清空上传附件
                                _self.uploadOrderPaymentFilesUrl = null;
                                // 清空----收款---错误提示
                                _self.addPaymentErrorTip = '';
                                //支付方式---初始化
                                _self.addPayment.payTypeCode = 'cash';
                                _self.addPayment.payTypeName = '现金';

                                if (_self.initPageData) {
                                    _self.initPageData(_self.getTodayDate);
                                };
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
                // 订单详情---收退款---收/退款tag初始化
                initReceiveReundTag: function () {
                    var _self = this;
                    // 清空----收款---错误提示
                    _self.addPaymentErrorTip = '';
                    //支付方式---初始化
                    _self.addPayment.payTypeCode = 'cash';
                    _self.addPayment.payTypeName = '现金';

                    // 收 退款
                    if (_self.orderDetailsCount.markUpCollection >= 0) {
                        _self.receiveAccount = _self.orderDetailsCount.markUpCollection;
						_self.refundAccount = 0;
                    } else {
                        _self.refundAccount = Math.abs(_self.orderDetailsCount.markUpCollection);
                        _self.receiveAccount = 0;
                    };
                },
				// 订单详情---下拉框发生变化时，改变对应payTypeName
				getAddPaymentSelectName: function (event) {
					var _self = this,
						e = event || window.event;
					_self.addPayment.payTypeName = e.currentTarget.options[e.currentTarget.selectedIndex].text;

					//清除错误提示
					_self.addPaymentErrorTip = "";
				},
				// 订单详情---收款窗口---聚焦时，清空错误提示
				focusClearAddPayAmount: function () {
					var _self = this;
					_self.addPaymentErrorTip = "";
				},
				// 订单详情---关闭收款窗口
				/*closeOrderreceivablesTag: function() {
					var _self = this;
					_self.addPayment.payNo = '';
					_self.addPayment.payAmount = '';
					$('.show-order-receivables-tag-mask').css('display', 'none');

					// 订单详情----收款----清空上传附件
					_self.uploadOrderPaymentFilesUrl = null;
					// 清空----收款---错误提示
					_self.addPaymentErrorTip = '';
					//支付方式---初始化
					_self.addPayment.payTypeCode = '';
				},*/
                // 订单详情---关闭收款窗口
                closeOrderreceivablesTag: function() {
                    var _self = this;
                    _self.addPayment.payNo = '';
                    _self.addPayment.payAmount = '';
                    $('.show-order-receivables-tag-mask').css('display', 'none');

                    // 订单详情----收款----清空上传附件
                    _self.uploadOrderPaymentFilesUrl = null;
                    // 清空----收款---错误提示
                    _self.addPaymentErrorTip = '';
                    //支付方式---初始化
                    _self.addPayment.payTypeCode = 'cash';
                    _self.addPayment.payTypeName = '现金';
                    // 清空remark
                    _self.addPayment.remark = '';
                },
				/* 离店 入住 初始化
				 *	1. changeOrderDetailsData > orderRoomStayList(多个遍历)
				 *		---> checkinDate + checkinDate + hotelId
				 *		-----> /roomType/j/getValidList ---> getRoomTypeList
				 *	2. 判断orderRoomStayList[i].roomTypeId 是否在 getRoomTypeList 存在
				 *		存在，
				 *			orderRoomStayList[i]>roomId  去和 getRoomTypeList[i] > roomList[i].roomId  比较,
				 *			如果存在，则不操作，
				 *			如果不存在，则组建一个新的	getRoomTypeList[i] 中 roomList[i] 元素插入到 getRoomTypeList[i] > roomList[i]中
				 *
				 *			var elem = {	---> orderRoomStayList[i]获取
				 *				roomNo: '',
				 *				roomId: ''
				 *			};
				 *
				 *		不存在， (从orderRoomStayList)组装一个新的	getRoomTypeList元素，插入getRoomTypeList元素,
				 *
				 *		 var elem = {
				 *		 	dayPriceList: [],
				 *		 	roomList: [],
				 *		 	roomTypeId: '',
				 *		 	roomTypeName: ''
				 *		 };
				 *
				 *		 getRoomTypeList.push(elem);
				 *
				 *		 getRoomTypeList再绑定到DOM中
				 *   2.
				 * */
				confrim2: function (item){
					var _self = this;
					if(item.checkinDate&&item.checkoutDate){
						_self.getCheckin_checkOutList(item);
					}
				},
				// 修改订单---初始化---离店，入住
				getCheckin_checkOutList: function (item) {
					var _self = this;
					var data = {
						checkinDate:item.checkinDate,
						checkoutDate:item.checkoutDate,
						hotelId:yzl.hotelId,
						roomId: item.roomId,
						orderId: _self.cancelOrderOperate.orderId,
						orderRoomStayId: item.orderRoomStayId
					};
					$('#modefy_order_confirm').attr('disabled', true).addClass('disabled-btn');
					yzl.getAjax({
						path : '/roomType/j/getValidList',
						type : 'post',
						data : data,
                        loadingElem: '#showOrderDetailTag',
                        tips: false,
						sCallback : function (result) {
							if (result.code == "0000") {
								item.roomTypeList= result.data.roomTypeList;
								// 新增订单--日期插件--获取房间号
								if (item.roomTypeId) {
									var roomType = _.filter(item.roomTypeList, function(roomType){ return roomType.roomTypeId == item.roomTypeId});
									item.roomList = roomType[0].roomList;
								};

								if(item.roomTypeId){
									var roomType = _.find(item.roomTypeList, function(roomType){ return roomType.roomTypeId == item.roomTypeId; });
									// item.sumPrices = 0;
									//item.realtimeSumPrice = 0;
									// item.fixedPrice = 0;
									item.dayPriceList = roomType.dayPriceList;
									// 每个房间价格---列表随时变化
									item.origDayPriceList = roomType.origDayPriceList;
									item.totalDays = roomType.dayPriceList.length;

                                    var arrOrigDayPriceList = [];
                                    var arrDayPriceList = [];
									for (var i=0; i<roomType.dayPriceList.length; i++) {
                                        arrOrigDayPriceList.push(roomType.origDayPriceList[i].price);
                                        arrDayPriceList.push(roomType.dayPriceList[i].price);
										// 房间价格总价---原始值
										// item.sumPrices = yzl.floatObj.add(item.sumPrices, roomType.origDayPriceList[i].price);
										// 房间价格总价---随时变化
										// item.fixedPrice = yzl.floatObj.add(item.fixedPrice, roomType.dayPriceList[i].price);
									};
                                    item.sumPrices = yzl.calcuResult(arrOrigDayPriceList);
                                    item.fixedPrice = yzl.calcuResult(arrDayPriceList);
								}
								$('#modefy_order_confirm').removeAttr('disabled').removeClass('disabled-btn');
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 订单详情---每日房价---动态获取dayPriceList的宽度
				getPriceListBoxWidth: function (days) {
					var _self = this;
					if (days >= 7) {
						return '561px';
					} else {
						return (days*80 + 1) + 'px';
					};
				},
				// 订单详情---每日房价---动态获取dayPriceList的小三角left值
				getPriceListTriangleLeft: function (days) {
					if (days >= 7) {
						return (80*7/2 + 5 - 9) + 'px';
					} else if (days == 1) {
						return (days*90/2 - 8) + 'px';
					} else {
						return (days*80/2 + 5 - 9) + 'px';
					};
				},
				// 订单详情---每日房价---动态获取dayPriceList自己left值
				getPriceListBoxLeft: function (days) {
					if (days >= 7) {
						return -((80*7 + 10)/2 -10) + 'px';
					} else if (days == 1) {
						return -13 + 'px';
					} else {
						return -((days*80 + 10)/2 -10) + 'px';
					};
				},
				// 订单详情---每日房价---日期格式化
				formateDayPricesDate: function (date) {
					var dataList = date.split('-');
					return dataList[1] +'-'+ dataList[2];
				},
				// 表头---日期对应周几
				whatDay: function (date, weekend) {
					var today = new Date(date).getDay();
					switch(today) {
						case 1:
							return '一';
						case 2:
							return '二';
						case 3:
							return '三';
						case 4:
							return '四';
						case 5:
							return '五';
						default:
							if (weekend) {
								if (today == 6) {
									return '六';
								} else if (today == 0) {
									return '日';
								};
							};
							return '休';
					};
				},
				// 修改订单---初始化---离店，入住----房型下拉变化，填充对应的房号数据
				getchangeOrderRoomList: function (roomTypeId,item, event) {
					var _self = this;
					// var total = 0;
					var e = event || window.event;
					item.roomList = [];
					item.roomId = "";
					// item.sumPrices = 0;
					// item.fixedPrice = 0;
					item.dayPriceList = [];
					for (var i= 0, len=item.roomTypeList.length; i<len; i++) {
						if(item.roomTypeList[i].roomTypeId==roomTypeId) {
							item.roomList = item.roomTypeList[i].roomList;
							// 每个房间价格---原始列表值
							item.dayPriceList = item.roomTypeList[i].dayPriceList;
							item.origDayPriceList = item.roomTypeList[i].origDayPriceList;
						}
					};

					item.totalDays = item.dayPriceList.length;

					var arrOrigDayPriceList = [];
					var arrDayPriceList = [];
					for (var i=0; i<item.dayPriceList.length; i++) {
                        arrOrigDayPriceList.push(item.origDayPriceList[i].price);
                        arrDayPriceList.push(item.dayPriceList[i].price);
						// 房间价格总价---原始值
						// item.sumPrices = yzl.floatObj.add(item.sumPrices, item.origDayPriceList[i].price);
						// 房间价格总价---随时变化
						// item.fixedPrice = yzl.floatObj.add(item.fixedPrice, item.dayPriceList[i].price);
					};
                    item.sumPrices = yzl.calcuResult(arrOrigDayPriceList);
                    item.fixedPrice = yzl.calcuResult(arrDayPriceList);
					// item.fixedPrice = yzl.keepTwoDecimal(total);
					// 统计总费用---入住费用
					//_self.orderFeeCount.roomSumPrice = _self.roomSumPrice();
					// 记录roomTypeName
					item.roomTypeName = e.currentTarget.options[e.currentTarget.selectedIndex].text;
				},
				// 修改订单----展示每日房价列表
				showChangeOrderPerdayPriceBox: function (event, dayPriceList) {
					var e = event || window.event;
					if (dayPriceList.length == 0) return;
					$(e.currentTarget).children('.day-prices-list').css('display', 'block');
				},
				// 修改订单----关闭每日房价列表
				hiddenChangeOrderPerdayPriceBox: function () {
					var e = event || window.event;

					$(e.currentTarget).children('.day-prices-list').css('display', 'none');
				},
				// 修改订单----删除: 入住，离店订单信息
				removeChangeOrderCheckinRow: function (item) {
					var _self = this;
					 /*// 1新增，2修改，3删除
					if (item.operationType == 2) {
						item.operationType = 3;
					} else {
						_self.changeOrderDetailsData.orderRoomStayList.$remove(item);
					};*/

					_self.changeOrderDetailsData.orderRoomStayList.$remove(item);
				},
				// 新增订单窗口---添加: 入住，离店订单信息
				addChangeOrderCheckinRow: function () {
					var _self = this;
					var data = {
						checkinDate:new Date().format('yyyy-MM-dd'),
						checkoutDate:'',
						nights: 0,
						orderRoomStayId: '',
						roomId: '',
						roomNo: '',
						roomTypeId: '',
						roomTypeName: '',
						roomTypeList:[],
						roomList:[],
						totalDays: 0,
						// 每个房间价格---原始列表值(备份)
						dayPriceList: [],
						// 每个房间价格---列表随时变化
						origDayPriceList: [],
						//backupDayPriceList: [],
						// 房间价格总价---原始值(备份)
						sumPrices: 0,
						// 房间价格总价---随时变化
						fixedPrice: 0
					};

					_self.changeOrderDetailsData.orderRoomStayList.push(data);
				},
				// 修改订单----增 删功能 显示问题
				isShowremoveChangeOrderBtn: function (list) {
					if (list.length > 1) {
						return true;
					};
					return false;
				},
				// 修改订单----增 删功能 显示问题
				isShowAddChangeOrderBtn: function (list, index) {
					if (list.length-1 == index || list.length == 1) {
						return true;
					};
					return false;
				},
				// 修改订单----删除: 服务费用项
				removeChnageOrderBillList: function (item) {
					var _self = this;
					_self.changeOrderDetailsData.orderBillList.$remove(item);
				},
				// 修改订单----服务名称---focus
                focusBillTypeNameDropDownIpt: function (item) {
                    var _self = this;
                    _self.hideAllBillTypeNameDropDownList();
                    item.showBillTypeNameDropDown = true;
                },
                // 修改订单----服务名称---隐藏所有下拉框
                hideAllBillTypeNameDropDownList: function () {
                    var _self = this;
					if(!_self.changeOrderDetailsData.orderBillList)  return;
                    for(var i=0; i<_self.changeOrderDetailsData.orderBillList.length; i++) {
                        _self.changeOrderDetailsData.orderBillList[i].showBillTypeNameDropDown = false;
                    };
                },
                // 修改订单----服务名称---选择下拉框
                selectBillTypeNameDropDownItem: function (childItem, parItems) {
                    var _self = this;

                    parItems.billTypeName = childItem;
                    parItems.showBillTypeNameDropDown = false;
                },
                // 修改订单---点击窗口隐藏押金名称下拉框
                hideAllBillTypeNameDropDownFun: function () {
                    var _self = this;

                    _self.hideAllBillTypeNameDropDownList();
                },
                stopPropagationFun: function () {
                    console.log('阻止冒泡');
                },
				// 修改订单----添加: 服务费用项
				addChangeOderBillList: function () {
					var _self = this;
					var newItem = {
						amount: '',
						billTypeCode: '',
						billTypeName: '',
						orderBillId: '',
						remark: '',
						updateTime: '',
						userName: '',
                        showBillTypeNameDropDown: false
					};
					_self.changeOrderDetailsData.orderBillList.push(newItem);
				},
				//  修改订单----修改房间价格统计
				changeOrderSumPrice: function (item) {
					var _self = this;
					var total = 0;
					for (var i=0; i<item.dayPriceList.length; i++) {
						total += parseFloat(item.dayPriceList[i].price);
					};
					item.totalPrice = total;
				},
				// 修改价格---获取选择渠道名称
				getChangeOrderChannelName: function (event) {
					var _self = this,
						e = event || window.event;
					_self.changeOrderDetailsData.channelName = e.currentTarget.options[e.currentTarget.selectedIndex].text;
				},
				// 修改价格---离店，入住等下拉框 获取roomNo
				getChangeOrderRoomNo: function (roomId, item, event) {
					var e = event || window.event;
					// 记录roomNo
					item.roomNo = e.currentTarget.options[e.currentTarget.selectedIndex].text;

				},
				// 判断[] > {}  某个元素的值
				/*justyfyListObejct: function (arr, elem, val) {
					var newArr = [];
					for (var i=0; i<arr.length; i++) {
						if (arr[i][elem] != val) {
							newArr.push(arr[i]);
						};
					};
					return newArr;
				},*/
                justyfyListObejct: function (arr, elem, val) {
                    var newArr = [];
                    var reg = /^([1-9]\d*\.?\d*|0\.?\d*[1-9]\d*)$/;
                    //var reg = new RegExp("^([1-9]\d*\.?\d*|0\.?\d*[1-9]\d*)$");
                    for (var i=0; i<arr.length; i++) {
                        if (arr[i][elem] == '') arr[i][elem] = 0;
                        var test = reg.test((arr[i][elem] + '').trim());
                        if (arr[i][elem] != val && test) {
                            newArr.push(arr[i]);
                        };
                    };
                    return newArr;
                },
				// 修改订单---确定提交修改信息
				changeOrderUpateAllmsgs: function () {
					var _self = this;

					var orderBillList = _self.justyfyListObejct(_self.changeOrderDetailsData.orderBillList, 'amount', 0);
					_self.changeOrderDetailsData.orderBillList = orderBillList;

					// 过滤押金
					_self.changeOrderDetailsData.orderDepositList = [];
					// 过滤支付方式
					_self.changeOrderDetailsData.orderPaymentList = [];

					var data = _self.changeOrderDetailsData;

					if (yzl.roomStatusWSTimestamp) {
						data.timestamp = yzl.roomStatusWSTimestamp;
					};

					yzl.getAjax({
						path : '/order/j/update',
						type : 'post',
						data : data,
                        loadingElem: '#showOrderDetailTag',
                        tips: false,
						sCallback : function (result) {
							if (result.code == "0000") {
								$('#modefy_order_details').css('display', 'none');

								if (_self.initPageData) {
									_self.initPageData(_self.getTodayDate);
								};
								// 订单详情（住客信息 点击日志 订单详情）---点击入住，修改订单，刷新所在页面
								//_self.openRoomOrderDetails(_self.changeOrderDetailsData.orderId);
								_self.accordingOperateRefresh();

								// 修改订单----清空附件操作
								_self.uploadModifyOrderDataUrl = null;
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 修改订单---取消修改价格
				changeOrderCancellAllmsgs: function () {
					var _self = this;
					$('#modefy_order_details').css('display', 'none');
					//_self.openRoomOrderDetails(_self.changeOrderDetailsData.orderId);
					// 订单详情---点击入住，修改订单，取消订单 刷新所在
					_self.accordingOperateRefresh();
					// 修改订单----清空附件操作
					_self.uploadModifyOrderDataUrl = null;
				},

				// 关闭所有窗口: 新增订单，订单详情,修改订单，遮罩层窗口
				closeAllroomTagsOperate: function () {
					var _self = this;
					_self.addneworderTitle = '新增订单';

					$('.wholeorder-tag-mask, #addneworder_tag_content, #show_order_box, #modefy_order_details').css('display', 'none');
					$('.show-order-cancell-tag-mask, .show-order-receivables-tag-mask, .show-order-deposit-tag-mask').css('display', 'none');
				},
				// 订单详情---点击住客信息按钮
				getGuestInformation: function () {
					var _self = this;
					// orderDetailsOperateTag 1 默认点击订单详情 2 点击住客信息 3 点击日志
					_self.orderDetailsOperateTag = 2;
					$('.show-order-cotent-bottom .show-order-liverInfo').addClass('active').siblings().removeClass('active');
					_self.guestInformationInit();
				},
				// 订单详情---住客信息初始化
				guestInformationInit: function () {
					var _self = this;
					var date = new Date().format('yyyy-MM-dd');

                    $('#show_order_box').css('display', 'block');

					yzl.getAjax({
						path : '/orderCustomer/j/getList',
						type : 'post',
						data : {
							hotelId: yzl.hotelId,
							orderId: _self.cancelOrderOperate.orderId
						},
						loadingElem: '#showOrderDetailTag',
                        tips: false,
						sCallback : function (result) {
							if (result.code == "0000") {
								_self.orderCustomerList = result.data.list;
								for (var i= 0; i<_self.orderCustomerList.length; i++) {
									var customerList = _self.orderCustomerList[i].orderCustomerList;
									var checkoutDate = _self.orderCustomerList[i].checkoutDate.split(' ')[0];
									_self.$set('orderCustomerList['+i+'].getAssignKeyCodeDelayHours','1');
									// 是否展示延时动态密码按钮
									if (checkoutDate == date) {
                                        _self.$set('orderCustomerList['+i+'].isShowSendDelaypswd', true);
									} else {
                                        _self.$set('orderCustomerList['+i+'].isShowSendDelaypswd', false);
									};
									// 倒计时计时器
									if (customerList != null && customerList.length > 0) {
                                        for (var j=0; j<customerList.length; j++) {
                                            _self.$set('orderCustomerList[' + i +'].orderCustomerList['+ j +'].countDown',0);
                                            _self.$set('orderCustomerList[' + i +'].orderCustomerList['+ j +'].timer', null);
                                        };
									};
								};
								_self.saveOrderStatus = result.data.orderStatus;
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 订单详情----住客信息---锁状态显示
				liverLockStatus: function (item) {
					var _self = this;

					switch(item.lockStatus) {
						case '2':
							return 'red';
						case '3':
							return 'orange';
						case '4':
							return 'gray';
						default:
							return '';
					};
				},
				// 订单详情---住客信息---发送延时密码
				sendAssignKeyCodeDelay: function (item) {
					var _self = this;
					yzl.maskDialog({
						content: '是否确定发送'+ item.getAssignKeyCodeDelayHours +'小时延时密码?',
						callback: function (bln) {
							var confirm = bln;
							if (!confirm) return;
							yzl.getAjax({
								path : '/orderCustomer/j/assignKeyCodeDelay',
								type : 'post',
								data : {
									hotelId:yzl.hotelId,
									orderId: _self.cancelOrderOperate.orderId,
									orderRoomStayId: item.orderRoomStayId,
									hours: item.getAssignKeyCodeDelayHours
								},
								sCallback : function (result) {
									if (result.code == "0000") {
										yzl.Dialog({
											content : '发送成功',
											AutoClose: true
										});
									} else {
										yzl.Dialog({
											content : result.msg,
											AutoClose: true
										});
									};
								}
							});
						}
					});
				},
				// 订单详情---住客信息---发送动态密码
				/*sendAssignKeyCode: function (item) {
					var _self = this;
					yzl.maskDialog({
						content: '是否给'+ item.customerName + '发送动态密码?',
						callback: function (bln) {
							var confirm = bln;
							if (!confirm) return;

							yzl.getAjax({
								path : '/orderCustomer/j/assignKeyCode',
								type : 'post',
								data : {
									hotelId:yzl.hotelId,
									orderId: item.orderId,
									orderCustomerId: item.orderCustomerId
								},
								sCallback : function (result) {
									if (result.code == "0000") {
										yzl.Dialog({
											content : '发送成功',
											AutoClose: true
										});
									} else {
										yzl.Dialog({
											content : result.msg,
											AutoClose: true
										});
									};
								}
							});
						}
					});
				},*/
				// 订单详情----住客信息---点击添加同住人按钮
				addGuestInformationRoom: function (item) {
					var _self = this;

					_self.perOrderCustomerList = item;
					_self.addGuestInformation.getCertificateTypeList = _self.saveComonList.idTypeList;
					$('.add-resident-operate-mask').css('display', 'block');
				},
				// 订单详情----住客信息---点击保存---添加同住人
				addResidentOperate: function () {
					var _self = this;

					_self.addGuestInformation.orderId = _self.cancelOrderOperate.orderId;
					_self.addGuestInformation.hotelId = yzl.hotelId;
					_self.addGuestInformation.orderRoomStayId =_self.perOrderCustomerList.orderRoomStayId;

					if (_self.addGuestInformation.customerName.trim() == '') {
						_self.addGuestInforErrorTips = '请填写住客名';
						return;
					};
					if (_self.addGuestInformation.customerMobile.trim() == '') {
						_self.addGuestInforErrorTips = '请填写手机号';
						return;
					};
					if (_self.addGuestInformation.customerMobile.trim().match(yzl.reg.phoneNo) == null) {
						_self.addGuestInforErrorTips = '请填写正确手机号';
						return;
					};
					if (_self.addGuestInformation.idType != '' && _self.addGuestInformation.idNumber.trim() == '') {
						_self.addGuestInforErrorTips = '请填写证件号码';
						return;
					};
					if (_self.addGuestInformation.idType == '' && _self.addGuestInformation.idNumber.trim() != '') {
						/*if (_self.addGuestInformation.idNumber.trim().match(/^[0-9]+$/) == null) {
							_self.addGuestInforErrorTips = '证件号码必须是数字';
							return;
						};*/
						_self.addGuestInforErrorTips = '请填选择证件类型';
						return;
					};

					_self.isDisabledAddResident = true;
					var data = _self.addGuestInformation;
					yzl.getAjax({
						path : '/orderCustomer/j/add',
						type : 'post',
						data : data,
						sCallback : function (result) {
                            _self.isDisabledAddResident = false;
							if (result.code == "0000") {
								// 初始化
								_self.getGuestInformation();
								// 清除
								_self.clearGuestInformationForm();
								$('.add-resident-operate-mask').css('display', 'none');
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 订单详情----住客信息---左边表单初始化
				clearGuestInformationForm: function () {
					var _self = this;
					// 初始化
					_self.addGuestInforErrorTips = '';
					_self.addGuestInformation.customerName = '';
					_self.addGuestInformation.customerMobile = '';
					_self.addGuestInformation.idNumber = '';
					_self.addGuestInformation.idType = '';
					_self.addGuestInformation.getCertificateTypeList = [];
				},
				// 订单详情---住客信息---添加同住人---清除错误提示
				clearGuestInforErrorTips: function () {
					var _self = this;
					_self.addGuestInforErrorTips = '';
				},
				// 订单详情---住客信息---显示证件类型
				showLiveInforIdName: function (item) {
					var _self = this;
					var arr = _self.saveComonList.idTypeList;
					for (var i=0; i<arr.length; i++) {
						if (arr[i].code == item.idType) {
							return arr[i].name
						};
					};
				},
				// 订单详情---住客信息---是否是kk用户
				iskkCustomer: function (item) {
					if (item.customerId == null) return '';
					return 'iskk-customer';
				},
				// 订单详情---住客信息---禁止文本选中
				stopPreventSelectTxt: function () {
					console.log('无法禁止');
					return false;
				},
				// 订单详情---住客信息---发送动态密码
				sendAssignKeyCode: function (item) {
					var _self = this;
					yzl.maskDialog({
						content: '是否给'+ item.customerName + '发送动态密码?',
						callback: function (bln) {
							var confirm = bln;
							if (!confirm) return;
							item.countDown = 30;
                            item.timer = setInterval(function () {
                                item.countDown --;
                                if (item.countDown < 0) {
                                    item.countDown = 0;
                                    clearInterval(item.timer);
                                };
                            }, 1000);

							yzl.getAjax({
								path : '/orderCustomer/j/assignKeyCode',
								type : 'post',
								data : {
									hotelId:yzl.hotelId,
									orderId: item.orderId,
									orderCustomerId: item.orderCustomerId
								},
								sCallback : function (result) {
									if (result.code == "0000") {
										// 刷新自身栏目状态
										// _self.getGuestInformation();
									} else {
										yzl.Dialog({
											content : result.msg,
											AutoClose: true
										});
									};
								}
							});
						}
					});
				},
				// 订单详情---住客信息---删除同住人
				deleteGuestInformationRoom: function (item) {
					var _self = this;

					var data = {
						hotelId: yzl.hotelId,
						orderId: _self.cancelOrderOperate.orderId,
						orderCustomerId: item.orderCustomerId
					};

					yzl.maskDialog({
						content: '是否确定删除'+ item.customerName + '同住人?',
						callback: function (bln) {
							var confirm = bln;
							if (!confirm) return;
							yzl.getAjax({
								path : '/orderCustomer/j/delete',
								type : 'post',
								data : data,
								sCallback : function (result) {
									if (result.code == "0000") {
										// 初始化
										_self.getGuestInformation();
									} else {
										yzl.Dialog({
											content : result.msg,
											AutoClose: true
										});
									};
								}
							});
						}
					});
				},
				// 订单详情----住客信息--添加同住人---关闭窗口 和 取消操作
				closeAddResidentOperateTag: function () {
					var _self = this;
					$('.add-resident-operate-mask').css('display', 'none');
					// 清除
					_self.clearGuestInformationForm();
					// 保存按钮恢复可用
                    _self.isDisabledAddResident = false;
				},
				// 新增订单---办理入住 或 新增订单确定
				addOrderOrCheckIn: function (data, path, callback) {
					var _self = this;

					yzl.getAjax({
						path : path,
						type : 'post',
						data : data,
                        loadingElem: '#showOrderDetailTag',
                        tips: false,
						sCallback : function (result) {
							if (result.code == "0000") {
								var orderId = result.data.orderId;
								// 订单详情--取消订单窗口
								$('.show-order-cancell-tag-mask').css('display', 'none');
								// 初始化
								_self.orderRoomStayList = [];
								_self.orderBillList = [];
								// 重新加载住客信息 和 日志

								_self.openRoomOrderDetails(orderId);
								if (_self.initPageData) {
									_self.initPageData(_self.getTodayDate);
								};
								// 回调
								callback && callback();
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 订单详情---点击入住按钮---相关跳转
				checkInBtnOperate: function () {
					var _self = this;
					var data = _self.roomOrderDetails;
					if (yzl.roomStatusWSTimestamp) {
						data.timestamp = yzl.roomStatusWSTimestamp;
					};
					_self.addOrderOrCheckIn(data, 'order/j/checkin', function () {
						_self.guestInforIsShow = true;
						// 订单详情（住客信息 点击日志 订单详情）---点击入住，修改订单，刷新所在页面
						_self.accordingOperateRefresh();
					});
				},
				// 订单详情（住客信息 点击日志 订单详情）---点击入住，修改订单，刷新所在页面
				// orderDetailsOperateTag 1 默认点击订单详情 2 点击住客信息 3 点击日志
				accordingOperateRefresh: function () {
					var _self = this;

					switch (_self.orderDetailsOperateTag) {
						case 1:
							_self.openRoomOrderDetails(_self.changeOrderDetailsData.orderId);
							break;
						case 2:
							_self.guestInformationInit();
							break;
						case 3:
							_self.getLog();
							break;
					};
				},
                // 订单详情----点击退房按钮
                checkOutOperate: function () {
                    var _self = this;

					if (Number(_self.orderDetailsCount.markUpCollection) != 0) {
                        yzl.Dialog({
                            content : '需补款不等于0，不能办理离店',
                            AutoClose: true
                        });
                        return;
					};

                    _self.dirtyRoomList = _self.getSetDirtyRoomList();

                    _self.isOpensetDirtyroomTag = true;

                },
                // 订单详情----点击退房---获取房间数据
                getSetDirtyRoomList: function () {
                    var _self = this,
						todayTime = new Date(new Date().format('yyyy-MM-dd')).getTime(),
                        list = _self.roomOrderDetails.orderRoomStayList,
                        outPutList = [];

                    var firArr = [];
                    var lastArr = [];
                    for (var i=0; i<list.length; i++) {
                        var hasExit = false;
                        for (var j=0; j<outPutList.length; j++) {
                            if (list[i].roomId == outPutList[j].roomId) {
                                hasExit = true;
                                continue;
                            };
                        };
                        if (!hasExit) {
                            var checkIn = list[i].checkinDate.split('-');
                            var checkOut = list[i].checkoutDate.split('-');
                            var checkOutTime = new Date(list[i].checkoutDate).getTime();

                            var obj = {
                                roomId: list[i].roomId,
                                roomNo: list[i].roomNo,
                                date:checkIn[1] + '-'+ checkIn[2] + '~' + checkOut[1] + '-'+ checkOut[2],
                                isDirty: false
                            };

                            if (todayTime == checkOutTime) {
                                obj.isDirty = true;
                                firArr.push(obj);
							} else {
                                lastArr.push(obj);
							};
                        };
                    };

                    outPutList = firArr.concat(lastArr);

                    return outPutList;
                },
                // 订单详情----点击退房---关闭设置脏房窗口
                closeSetDirtyRoomTag: function () {
                    var _self = this;

                    _self.isOpensetDirtyroomTag = false;
                },
                // 订单详情----脏房确认---点击是否设置脏房
                clickPerDirtyRoom: function (item) {
                    var _self = this;
                    item.isDirty = !item.isDirty;

                    _self.re_sortDirtyRoom();
                },
                // 订单详情----脏房确认---点击是否设置脏房---重新排序
                re_sortDirtyRoom: function () {
                    var _self = this,
                        list = _self.dirtyRoomList,
                        firList = [],
                        lastList = [];

                    for (var i=0; i<list.length; i++) {
                        if (list[i].isDirty) {
                            firList.push(list[i]);
                        } else {
                            lastList.push(list[i]);
                        };
                    }

                    _self.dirtyRoomList = firList.concat(lastList);
                },
                // 订单详情----点击退房---提交设置脏房信息
                confirmSetDirtyRoomTag: function () {
                    var _self = this,
                        roomIdList = [],
                        list = _self.dirtyRoomList;

                    for (var i=0; i<list.length; i++) {
                        if (list[i].isDirty) {
                            roomIdList.push(list[i].roomId);
                        };
                    };

                   /*if (roomIdList.length == 0) {
                        yzl.Dialog({
                            content : '请选择置为脏房的房间',
                            AutoClose: true
                        });
                        return;
                    };*/

                    var data = {
                        hotelId:yzl.hotelId,
                        orderId: _self.cancelOrderOperate.orderId,
                        roomIdList:roomIdList
                    };
                    if (yzl.roomStatusWSTimestamp) {
                        data.timestamp = yzl.roomStatusWSTimestamp;
                    };

                    yzl.getAjax({
                        path : 'order/j/checkout',
                        type : 'post',
                        data : data,
                        sCallback : function (result) {
                            if (result.code == "0000") {
                                _self.isOpensetDirtyroomTag = false;

                                _self.guestInforIsShow = true;
                                _self.closeWholeOrderTag();
                                $(document.body).css('overflow', 'visible');
                                if (_self.initPageData) {
                                    _self.initPageData(_self.getTodayDate);
                                };
                                /*// 执行退房操作
                                _self.confirmCheckOut();*/
                            } else {
                                yzl.Dialog({
                                    content : result.msg,
                                    AutoClose: true
                                });
                            };
                        }
                    });
                },
                // 订单详情----执行退房操作
                /*confirmCheckOut: function () {
                    var _self = this;
                    var data = {
                        hotelId:yzl.hotelId,
                        orderId: _self.cancelOrderOperate.orderId
                    };
                    if (yzl.roomStatusWSTimestamp) {
                        data.timestamp = yzl.roomStatusWSTimestamp;
                    };

                    yzl.getAjax({
                        path : 'order/j/checkout',
                        type : 'post',
                        data : data,
                        sCallback : function (result) {
                            if (result.code == "0000") {
                                _self.guestInforIsShow = true;
                                _self.closeWholeOrderTag();
                                // 开启滚动条
                                $(document.body).css('overflow', 'visible');
                                if (_self.initPageData) {
                                    console.log('退房操作: ' + _self.getTodayDate);
                                    _self.initPageData(_self.getTodayDate);
                                };
                            } else {
                                yzl.Dialog({
                                    content : result.msg,
                                    AutoClose: true
                                });
                            };
                        }
                    });
                },*/
				//订单详情---恢复入住
				recoverCheckInStatus: function () {
					var _self = this;
					var data = {
						hotelId:yzl.hotelId,
						orderId: _self.cancelOrderOperate.orderId
					};
					if (yzl.roomStatusWSTimestamp) {
						data.timestamp = yzl.roomStatusWSTimestamp;
					};
					yzl.getAjax({
						path : 'order/j/resume',
						type : 'post',
						data : data,
                        loadingElem: '#showOrderDetailTag',
                        tips: false,
						sCallback : function (result) {
							if (result.code == "0000") {
								_self.guestInforIsShow = true;
								_self.closeWholeOrderTag();
								// 开启滚动条
								$(document.body).css('overflow', 'visible');
								if (_self.initPageData) {
									_self.initPageData(_self.getTodayDate);
								};
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 订单详情---日志---点击日志按钮
				showLog:function() {
					var _self = this;
					// orderDetailsOperateTag 1 默认点击订单详情 2 点击住客信息 3 点击日志
					_self.orderDetailsOperateTag = 3;
					$('.show-order-cotent-bottom .show-order-log').addClass('active').siblings().removeClass('active');
					_self.getLog();
				},
				// 订单详情---日志---日志初始化
				getLog: function () {
					var _self = this;

                    $('#show_order_box').css('display', 'block');

					yzl.getAjax({
						path : 'orderLog/j/selectListByOrderId',
						type : 'post',
						data : {
							hotelId:yzl.hotelId,
							orderId: _self.cancelOrderOperate.orderId
						},
                        loadingElem: '#showOrderDetailTag',
                        tips: false,
						sCallback : function (result) {
							if (result.code == "0000") {
								_self.showLoginfo = result.data;
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 点击订单详情----切换回订单详情
				/* _self.orderDetailsOperateTag 1 默认订单详情 2 住客信息 3 日志
				* */
				clickOrderDetails: function () {
					var _self = this;

					_self.orderDetailsOperateTag = 1;
					$('.show-order-cotent-bottom .show-order-orderDetail').addClass('active').siblings().removeClass('active');
					if (_self.changeOrderDetailsData.orderId) {
						_self.openRoomOrderDetails(_self.changeOrderDetailsData.orderId);
					};
				}
				/* -------房态订单详情 end---------- */
	        },
	    });

		yzl.headerVue.$watch('headerResourceInfo', function () {
			yzl.contentVue.roomStatusResourceInfo = yzl.headerVue.headerResourceInfo;
	    });

		//订单详情弹窗代码
		$('.show-order-cotent-header span').unbind('click').on("click",function(){
			$(this).addClass('active').siblings().removeClass('active');
		})

	})(window, document, jQuery, yzlObj);



});

		
		
		
	
