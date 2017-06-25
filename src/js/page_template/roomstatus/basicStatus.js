/**
 * Created by glen on 2016/11/14.
 */



$(function () {
	
	;(function (window, document, $, yzl) {
		// webosocket时间戳
		yzl.roomStatusWSTimestamp = new Date().getTime();
		var roomStatusVue = new Vue({
	        el : '#room_status',
	        data: {
				// 图片预览对象
				newViewer: null,
				// 房态权限管理
				roomStatusResourceInfo: JSON.parse(sessionStorage.getItem("Cookie_headerResourceInfo")),
				// 保存房态全局信息---选择渠道，支付类型，身份证类型等
				saveComonList: [],
				// 接收房态初始化数据
	            initInfo: {},
				aRoomList: [],
				// 接收房态初始化数据----备份
				initInfoBackups: '',
				// 搜索房间号条件
				searchRoomsNoOperate: '',
				// 房间时间列表---点击空房----保存该元素
				saveClickEmptyRoom: null,
				// 多个拖拽---记录空房----新增订单---请求参数
				emptyRoomList : [],
				// 多个拖拽---记录禁用房----开启房间----请求参数
				forbidroomList : [],
				// 多个拖拽---其他占用房(除空房，禁用房)----判断是可以操作，如果存在，则不操作
				otherOcuppyRoomList : [],
				// 多个拖拽---包含禁用房 显示:开启  空房,显示: 新增+禁用
				dragRoomsOperateIsShow: {
					isSetForbidRoom: false
				},
				//  房间时间列表---点击房间停用操作
				saveCloseRoomInfo: {
					closeTypeCode: '1',
					closeRemark: ''
				},
				// radio vue plugin start---停用房
                saveCloseRoomInitList: [   // 添加
                    {
                        id: 'decorate_radio',  // 对应的选项id
                        value: '1',         // value值必须不一样
                        isDisabled: false,
                        checked: true,
                        name: 'closereason',     // 所有radio name 必须一样
                        zh_cn: '装修'    // 中文名字
                    },
                    {
                        id: 'saveForFriend_radio',
                        value: '2',
                        isDisabled: false,
                        checked: false,
                        name: 'closereason',
                        zh_cn: '为朋友预留'
                    },
                    {
                        id: 'otherReason_radio',
                        value: '3',
                        isDisabled: false,
                        checked: false,
                        name: 'closereason',
                        zh_cn: '其他'
                    }
                ],
                saveCloseRoomCssObj: {
                    'margin-right': '20px'
                },
                // radio vue plugin end
				// 房间时间列表---未入住，已入住，已离店---鼠标移上，信息提示
				perRoomsShowMsg: {
					roomNo: '',
					roomTypeName: '',
					channelName: '',
					customerName: '',
					checkInstatus: '',
					customerMobile: '',
					orderAmount: '',
					needPayAmount: '',
					depositAmount: ''
				},
				// 房间时间列表--禁用房---鼠标移上，信息提示
				forbidroomMouseOverShowTips: {
					roomNo: '',
					roomTypeName: '',
					closeDate: '',
					closeRemark: '',
					closeTypeName: ''
				},
				// 房间时间列表---未入住，已入住，已离店---鼠标移上，颜色变化
				occupyRoomStatusColor: {},
				// 新增订单，修改订单，订单详情等标题名称切换
				addneworderTitle: '新增订单',
				// 新增订单保存
				addNewOrders: {
					hotelId: yzl.hotelId,
					channelCode: '',
					channelName: '',
					imageId: '',
					channelOrderNo: '',
					customerName: '',
					customerMobile: '',
					// 输入手机号---返回customerId(未获取到)
					customerId: '',
					remark: '',
					orderPaymentList: [],
					orderRoomStayList: [],
					orderBillList: [],
					orderDepositList: [],
					timestamp: yzl.roomStatusWSTimestamp
				},
				// 新增订单 -----选择渠道
				channelList: [],
				// 新增订单 ----房间订单入住列表
				orderRoomStayList: [],
				// 新增订单 ----服务名称，服务费用 备注
				orderBillList: [],
                // 新增订单---服务名称---下拉框list
                showBillTypeNameDropDownList : [
                    '餐饮美食',
                    '烟酒饮料',
                    '物品赔付',
                    '景点门票',
                    '特色纪念品',
                    '其它杂项'
                ],
				// 新增订单----支付方式
				orderPaymentList: [],
				// 新增订单----押金
				orderDepositList: [],
                // 新增订单---收押tag显示---focus展示下拉框
                showNewOrderDepositDropDown: false,
                // 新增订单---收押tag显示---下拉框list
                showNewOrderDepositDropDownList : [
                    '入住押金',
                    '房卡押金',
                    '充电器押金',
                    '雨伞押金',
                    '自行车押金',
                    '厨具押金'
                ],
				// 新增订单----订单费用统计
				orderFeeCount: {
					roomSumPrice: 0,
					payAmount: 0,
					alreadyCollection: 0,
					markUpCollection: 0,
					receivedDeposit: 0
				},
				// 新增订单---应收款
				getAccountReceivable: 0,
				// 新增订单---已收款
				calcuAlreadyCollection: 0,
				// 新增订单---需补交款统计
				haveToPayCollection: 0,
				// 新增订单---已收押金统计
				calReceivedDeposit: 0,
                // 新增订单---上传附件（渠道类型）--start
                'channelTypeImgBtn': 'channelTypeImgBtn',
                'channelTypeParam': {
                    url: '/yzlpms/img/j/uploadChannelOrderImage',
                    data: {
                        hotelId: yzl.hotelId
                    },
                    btnText: '上传',
                    isShow: true,
                    parObj: {
                    }
                },
                'channelTypeBackImgInfor': {},
                // 新增订单---上传附件（渠道类型）--end
                // 新增订单---支付类型上传附件--start
                'payTypeImgBtn': 'payTypeImgBtn',
                'payTypeParam': {
                    url: '/yzlpms/img/j/uploadOrderPaymentImage',
                    data: {
                        hotelId: yzl.hotelId
                    },
                    btnText: '上传',
                    isShow: true,
                    parObj: {
                    }
                },
                'payTypeBackImgInfor': {},
                // 新增订单---支付类型上传附件---end
				//保存---新增订单----上传附件----渠道类型附件
				uploadChannelOrderImageUrl: null,
				// 新增订单----上传附件----支付类型附件
				uploadOrderPaymentImageUrl: null,
				// 筛选房型 ---全选按钮
                isSelectAllRoomTypes: true,
				// 筛选房型
				sortFilterRoomType: {
					sortFilterRoomTypeList: [],
					// 保存筛选的房型
					roomTypeList: [],
					// 排序方式
					orderBy: 'roomType',
					// 是否可销售
                    isHideStopSale: '0'
				},
				// 是否显示：房型和房间分离
                showSplitRoomType: false,
                // radio vue plugin start---排序方式
                sortOrderInitList: [   // 添加
                    {
                        id: 'roomType_radio',  // 对应的选项id
                        value: 'roomType',         // value值必须不一样
                        isDisabled: false,
                        checked: true,
                        name: 'sortCondition',     // 所有radio name 必须一样
                        zh_cn: '房型'    // 中文名字
                    },
                    {
                        id: 'roomNo_radio',
                        value: 'roomNo',
                        isDisabled: false,
                        checked: false,
                        name: 'sortCondition',
                        zh_cn: '房间'
                    },
                    {
                        id: 'dirtyRoom_radio',
                        value: 'dirtyRoom',
                        isDisabled: false,
                        checked: false,
                        name: 'sortCondition',
                        zh_cn: '脏房'
                    }
                ],
                sortOrderCssObj: {
                    'margin-right': '20px'
                },
                // radio vue plugin end
                // radio vue plugin start---隐藏禁用房
                canSaleInitList: [   // 添加
                    {
                        id: 'cansale_radio',  // 对应的选项id
                        value: '1',         // value值必须不一样
                        isDisabled: false,
                        checked: false,
                        name: 'isCanSale',     // 所有radio name 必须一样
                        zh_cn: '是'    // 中文名字
                    },
                    {
                        id: 'cannotsale_radio',
                        value: '0',
                        isDisabled: false,
                        checked: true,
                        name: 'isCanSale',
                        zh_cn: '否'
                    }
                ],
                canSaleOrderCssObj: {
                    'margin-right': '20px'
                },
                // radio vue plugin end
				// 获取今天 new Date().getTime()-86400000*2
				getTodayDate: new Date().format('yyyy-MM-dd'),
				// 新增订单，订单详情------bottom的btn根据不同的房间状态，显示不同的按钮
				roomOrderBottomBtnStatus: {
					isEditabel_order_btn: true,		// 默认是  未入住状态 即是按钮是: 取消 入住 修改
					editabel_isCheckIn: true,
					isBookingRoom: false
				},
				websocket: null,
				websocketUniqId: yzl.roomStatusWSTimestamp,
				//----------发送动态密码----------
				sendOTPList:{
					hotelId:yzl.hotelId,
					roomId:'',
					keyCodeType:'',
					num:'',
					mobile:'',
					userName:'',
					assignReason:''
				},
				sendOTPTimeList:{},
				sendOTPOnceList:{},
				sendOTPStatus:1,
				sendOTPTagStatus:1,
				sendOTPRecordList:{},
				sendOTPRecordTotal:'',
				sendOTPRecordNum:1,
				swiftLoadingStatus:false,
				hideLoadingStatus:false,
				// ----------发送动态密码----------
				// 是否显示页面刷新按钮
				isShowReloadBtn: false,
				// 是否显示回到顶部按钮
				isShowBackToTopBtn: false

			},
            // 引入分页组件
            components:{
                'v-uploadify': yzlObj.uploadifyVue,
                'v-radio': yzl.radioVue
            },
			watch: {
				// 监控今天
				getTodayDate: function (newDay, oldDay) {
					var _self = this;
					_self.initData(newDay);

					var obj = {
						hotelId: yzl.hotelId,
						startDate: new Date(new Date(_self.getTodayDate).getTime()-86400000*2).format('yyyy-MM-dd'),
						endDate: new Date(new Date(_self.getTodayDate).getTime()+86400000*13).format('yyyy-MM-dd'),
						timestamp: _self.websocketUniqId
					}

					if (yzl.roomStatusWebsocket != null) {
						// _self.websocket.send(JSON.stringify(obj));
                        try {
                            yzl.roomStatusWebsocket.send(JSON.stringify(obj));
                        }catch(e) {
                            console.log('websocket 出错...');
                        };
					};
				},
				// 动态监控 搜索房间号
				searchRoomsNoOperate: function (newVal, oldVal) {
					var _self = this;
					if (newVal.trim() == '') {
                        if (!_self.showSplitRoomType) {
                            _self.showSplitRoomType = true;
                        };
						_self.initInfo.roomList = _self.initInfoBackups.roomList;
					} else {
                        if (_self.showSplitRoomType) {
                            _self.showSplitRoomType = false;
                        };
						_self.initInfo.roomList = _.filter(_self.initInfoBackups.roomList, function (item) {
							return item.roomNo.indexOf(newVal.trim()) > -1;
						});
					};
					// 初始化数据后-----dom操作，占用房间重新渲染
					_self.initAfterDrawingRooms(_self.initInfo.roomList);
				},
				// 新增订单---上传附件（渠道类型）--上传成功返回url
                channelTypeBackImgInfor: function (newVal) {
					var _self = this;

                    _self.addNewOrders.imageId = newVal.imageId;
                    _self.uploadChannelOrderImageUrl = newVal.imageUrl;
				},
                // 新增订单---支付类型上传附件--上传成功返回url
                payTypeBackImgInfor: function (newVal) {
                    var _self = this;

                    _self.orderPaymentList[0].imageId = newVal.imageId;
                    _self.uploadOrderPaymentImageUrl = newVal.imageUrl;
				}

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
	        methods: {
	            // 初始化事件
	            initEvent: function () {
	                this.initData();
					this.getCommonList();
					// 上传附件初始化
					// this.uploadPersonalData('uploadPersonalDataBtn');
					// ie禁止文本拖拽
					if (document.all) {
						document.onselectstart= function(){return false;};
					};
					// socket初始化
					this.setSocketData();
					//初始化页面刷新及回到顶部
					this.initRefreshBtn();
	            },
				// websocket
				setSocketData: function () {
					var _self = this;

					// ws://192.168.7.79:8080/yzlmessage/webSocketServer
					var url = 'ws://' + yzl.websocketUrl + '/yzlmessage/WsServer/roomStateUpdate';
					if ('WebSocket' in window) {
						yzl.roomStatusWebsocket = new WebSocket(url);
					} else if ('MozWebSocket' in window) {
						yzl.roomStatusWebsocket = new MozWebSocket(url);
					} else {
						//http://192.168.7.79:8080/yzlmessage/sockjs/webSocketServer
						yzl.roomStatusWebsocket = new SockJS('http://' + yzl.websocketUrl + 'yzlmessage/sockjs/WsServer/roomStateUpdate');
					}
					// websocket链接成功，回调方法
					yzl.roomStatusWebsocket.onopen = function(evnt) {
						var obj = {
							hotelId: yzl.hotelId,
							startDate: new Date(new Date( _self.getTodayDate).getTime()-86400000*2).format('yyyy-MM-dd'),
							endDate: new Date(new Date( _self.getTodayDate).getTime()+86400000*11).format('yyyy-MM-dd'),
							timestamp: _self.websocketUniqId
						}
						yzl.roomStatusWebsocket.send(JSON.stringify(obj));
					};
					yzl.roomStatusWebsocket.onmessage = function(evnt) {
						if ("0000" == evnt.data) {
							_self.initData();
						};
					};

					yzl.roomStatusWebsocket.onerror = function(evnt) {
						alert('websocket出错');
						console.log(evnt);
					};
					yzl.roomStatusWebsocket.onclose = function(evnt) {
						yzl.roomStatusWebsocket = null;
					}
				},
				// 获取房态基本信息---选择渠道，支付类型，身份证类型等
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

                                _self.sortFilterRoomType.sortFilterRoomTypeList = result.data.roomTypeList;

                                for (var j=0; j<_self.sortFilterRoomType.sortFilterRoomTypeList.length; j++) {
                                    _self.$set('sortFilterRoomType.sortFilterRoomTypeList['+j+'].checked', true);
								};

								for (var i=0; i<_self.sortFilterRoomType.sortFilterRoomTypeList.length; i++) {
									_self.sortFilterRoomType.roomTypeList.push(_self.sortFilterRoomType.sortFilterRoomTypeList[i].roomTypeId);
								};
								_self.sendOTPTimeList = result.data.tempKeyCodeHoursList;
								_self.sendOTPOnceList = result.data.tempKeyCodeTimesList;
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
	            // 初始化数据
	            initData: function (startDate) {

					/*   startBookDate = 0;    表示开始	 startBookDate > 1;		表示可以接龙

						 1.日期跳跃情况				startBookDate = 0;		已判断
						 2.连续日期,orderId不一样		startBookDate = 0;
						 3.连续日期，orderId一样		startBookDate = +1;
						 startBookDateOrderId           记录最近最后一个 预定房间 的orderId

						 4.不同房间(换行) 清空  startBookDate = 0;		 已判断

						 1. stayInfo !== null 	startBookDate = 1;
						 2.	stayInfo !== null

						 saveLastOrderDate = '';
						 1.每一行  list[j].stayInfo 不为空时，则记录 	   已判断
						 2.换行: 不同房间 清空  saveLastOrderDate = '';   已判断
					 */
                		// ajax请求绑定动态数据
						if (startDate) {
							var start = new Date(new Date(startDate).getTime()-86400000*2).format('yyyy-MM-dd');
						};
						var _self = this;

						_self.sortFilterRoomType.roomTypeList = [];
						for (var i=0; i<_self.sortFilterRoomType.sortFilterRoomTypeList.length; i++) {
							if (_self.sortFilterRoomType.sortFilterRoomTypeList[i].checked) {
                                _self.sortFilterRoomType.roomTypeList.push(_self.sortFilterRoomType.sortFilterRoomTypeList[i].roomTypeId);
							};
						};

						var data = {
							hotelId: yzl.hotelId,
							startDate: start || '',
							roomTypeIdList: _self.sortFilterRoomType.roomTypeList,
							orderBy: _self.sortFilterRoomType.orderBy,
                            isHideStopSale: _self.sortFilterRoomType.isHideStopSale
						};

						yzl.getAjax({
							path: '/roomState/j/roomList',
							type: 'post',
							data: data,
                            fadeInElem: '#room_status',
                            loadingElem: document.body,
                            tips: false,
                            loadingTop: 300,
							sCallback: function(result) {
								if (result.code == "0000") {
                                  	 _self.initInfo = result.data;
                                    _self.showSplitRoomType = false;
                                  	 if (_self.sortFilterRoomType.orderBy == 'roomType') {
                                  	 	_self.showSplitRoomType = true;
									 };
                                  	 if (result.data.roomList.length > 0) {
                                         _self.aRoomList = _self.formateInitRoomList(result.data.roomList);
									 } else {
                                         _self.aRoomList = [];
									 };
									_self.initInfoBackups = JSON.parse(JSON.stringify(result.data));

									// 如果房间搜索不为空----则进行筛选
									if (_self.searchRoomsNoOperate.trim() != '') {
										_self.showSplitRoomType = false;
										_self.initInfo.roomList = _.filter(_self.initInfoBackups.roomList, function (item) {
											return item.roomNo.indexOf(_self.searchRoomsNoOperate.trim()) > -1;
										});
									};

									// 清空页面 占用房---鼠标移上提示框
									_self.outPerRoomsShowMsg();
									// 执行DOM操作
									/*Vue.nextTick(function () {
										var roomList = _self.initInfo.roomList;
										// 同一行，判断是否是同一订单，不同日期: 记录最近一次[连续所占用房间的个数]
										var startBookDate = 0;
										//  同一行,日期连续，该订单与上一订单(记录上一订单)的orderId进行进行匹配
										var startBookDateOrderId = '';
									   /!* // 同一行，该订单与上一订单orderId比较----判定是否是同一订单
										var saveLastOrderDate = '';*!/
										for (var i= 0, len=roomList.length; i<len; i++) {
											// 获取每一行的房间数
											var getRowLis = $('.roomstatus-rooms-rows').eq(i).find('ul li');
											// 获取每一行房间对应的渲染data
											var list = roomList[i].dayList;
											for (var j= 0, jen=list.length; j<jen; j++) {
												// 如果 不为空房且不为禁房  则 表示为占用房间 roomState
												if (list[j].roomState !== '9' && list[j].roomState !== '4') {		// list[j].stayInfo !== null
													/!*saveLastOrderDate = list[j].date;*!/
													// 重新计算开始日期
													if (startBookDate == 0) {	// 开始
														startBookDate += 1;
														startBookDateOrderId = list[j].stayInfo.orderId;
														insertStatus({
															elem: getRowLis[j],
															infor: list[j].stayInfo,
															statusCode: list[j].roomState,
															isStart: true
														});
													} else {	// 连续日期 ,orderId是否一样 ----2,3
														if (startBookDateOrderId == list[j].stayInfo.orderId) {
															startBookDate += 1;
															startBookDateOrderId = list[j].stayInfo.orderId;
															insertStatus({
																elem: getRowLis[j],
																infor: list[j].stayInfo,
																statusCode: list[j].roomState,
																isStart: false
															});
														} else {
															startBookDate = 1;
															startBookDateOrderId = list[j].stayInfo.orderId;
															insertStatus({
																elem: getRowLis[j],
																infor: list[j].stayInfo,
																statusCode: list[j].roomState,
																isStart: true
															});
														};
													};
												} else {
													// 1.日期跳跃情况				startBookDate = 0;
													startBookDate = 0;
													startBookDateOrderId = '';
												};
											};
											// 换行则初始化操作
											// 换行: 不同房间 清空  startBookDate = 0;
											startBookDate = 0;
											/!*saveLastOrderDate = '';*!/
											startBookDateOrderId = '';
										};

										function insertStatus(param) {
											// console.log(param.elem, param.infor, param.statusCode, param.isStart);
											var str = '';
											var setClassName = '';

											if (param.isStart) {
												switch(param.statusCode) {
													case '0':
														setClassName = 'bookingroom';		// 预定中
														break;
													case '1':
														setClassName = 'uncheckin';			// 未入住
														break;
													case '2':
														setClassName = 'hascheckin';		// 已入住
														break;
													case '3':
														setClassName = 'hascheckout';		// 已经离店
														break;
												};

												str += '<div class="'+ setClassName +' checkstatus">';
												if (param.statusCode == '0') {
													str += '<p> 预定中... </p>';
												} else {
													str += '<p>'+ param.infor.customerName + '</p>';
													str += '<p>'+ param.infor.channelName +'</p>';
												};

												str +='</div>';
												param.elem.innerHTML = str;
											};

											/!*param.elem.style.width = (param.elem.offsetWidth + 1) + 'px';
											param.elem.style.marginLeft = '-1px';
											switch(param.statusCode) {
												case '0':
													param.elem.style.background = 'rgb(65, 214, 152)';
													break;
												case '1':
													param.elem.style.background = 'rgb(65, 214, 152)';
													break;
												case '2':
													param.elem.style.background = 'rgb(60, 164, 249)';
													break;
												case '3':
													param.elem.style.background = 'rgb(222, 222, 222)';
													break;
											};*!/
											/!*param.elem.style.width = (param.elem.offsetWidth + 1) + 'px';
											 param.elem.style.marginLeft = '-1px';*!/
											switch(param.statusCode) {
												case '0':
													param.elem.style.background = 'rgb(65, 214, 152)';
													param.elem.style.borderRightColor = 'rgb(65, 214, 152)';
													break;
												case '1':
													param.elem.style.background = 'rgb(65, 214, 152)';
													param.elem.style.borderRightColor = 'rgb(65, 214, 152)';
													break;
												case '2':
													param.elem.style.background = 'rgb(60, 164, 249)';
													param.elem.style.borderRightColor = 'rgb(60, 164, 249)';
													break;
												case '3':
													param.elem.style.background = 'rgb(222, 222, 222)';
													param.elem.style.borderRightColor = 'rgb(222, 222, 222)';
													break;
											};
										};
										// 房间时间列表---点击房间---点击页面其他位置关闭并清除
										_self.clickDocumentClearAllRoomsBg();
										//信息初始化-----多个订单拖拽
										_self.getDragRoomsDetails();
									});*/
									// 初始化数据后-----dom操作，占用房间重新渲染
									_self.initAfterDrawingRooms(_self.initInfo.roomList);
								} else {
									yzl.Dialog({
										content: result.msg,
										AutoClose: true
									});
								};
							}
						});
                    // 绑定静态数据实例
					/*
					var _self = this;
					_self.initInfo = statusInfo.data;
					Vue.nextTick(function () {
						var roomList = _self.initInfo.roomList;
						var startBookDate = 0;
						var startBookDateOrderId = '';
						for (var i= 0, len=roomList.length; i<len; i++) {
							var getRowLis = $('.roomstatus-rooms-rows').eq(i).find('ul li');
							var list = roomList[i].dayList;
							for (var j= 0, jen=list.length; j<jen; j++) {
								if (list[j].stayInfo !== null) {
									// 重新计算开始日期
									if (startBookDate == 0) {	// 开始
										startBookDate += 1;
										startBookDateOrderId = list[j].stayInfo.orderId;
										insertStatus({
											elem: getRowLis[j],
											infor: list[j].stayInfo,
											statusCode: list[j].roomState,
											isStart: true
										});
									} else {	// 连续日期 ,orderId是否一样 ----2,3
										if (startBookDateOrderId == list[j].stayInfo.orderId) {
											startBookDate += 1;
											startBookDateOrderId = list[j].stayInfo.orderId;
											insertStatus({
												elem: getRowLis[j],
												infor: list[j].stayInfo,
												statusCode: list[j].roomState,
												isStart: false
											});
										} else {
											startBookDate = 1;
											startBookDateOrderId = list[j].stayInfo.orderId;
											insertStatus({
												elem: getRowLis[j],
												infor: list[j].stayInfo,
												statusCode: list[j].roomState,
												isStart: true
											});
										};
									};
								} else {
									// 1.日期跳跃情况				startBookDate = 0;
									startBookDate = 0;
									startBookDateOrderId = '';
								};
							};
							// 换行则初始化操作
							// 换行: 不同房间 清空  startBookDate = 0;
							startBookDate = 0;
							startBookDateOrderId = '';
						};

						function insertStatus(param) {
							// console.log(param.elem, param.infor, param.statusCode, param.isStart);
							var str = '';
							var setClassName = '';

							if (param.isStart) {
								switch(param.statusCode) {
									case '1':
										setClassName = 'uncheckin';		// 未入住
										break;
									case '2':
										setClassName = 'hascheckin';		// 未入住
										break;
									case '3':
										setClassName = 'hascheckout';		// 已经离店
										break;
								};
								str += '<div class="'+ setClassName +' checkstatus">';
								str += '<p>'+ param.infor.customerName + '</p>';
								str += '<p>'+ param.infor.channelName +'</p>';
								str +='</div>';
								param.elem.innerHTML = str;
							};

							param.elem.style.width = (param.elem.offsetWidth + 1) + 'px';
							param.elem.style.marginLeft = '-1px';
							switch(param.statusCode) {
								case '1':
									param.elem.style.background = 'rgb(60, 164, 249)';
									break;
								case '2':
									param.elem.style.background = 'rgb(65, 214, 152)';
									break;
								case '3':
									param.elem.style.background = 'rgb(222, 222, 222)';
									break;
							};
						};
						//信息初始化-----多个订单拖拽
						_self.getDragRoomsDetails();
					});
					*/

	            },
				// 初始化---roomList
				/*
					roomList = [
						[
							{
				 				listLen: 4,

							},
							{}
						],
						[{}, {}]
					];
				*/
				formateInitRoomList: function (list) {
					var _self = this;
					var aRoomType = [];
                    var aRoomNo = [];
                    var count = 0;
                    var roomTypeId = list[0].roomTypeId;

                    if (list.length == 0) {
                        return []
					} else {
                        for (var i=0; i<list.length; i++) {
                            if (list[i].roomTypeId == roomTypeId) {
                            	list[i].index = ++count;
                                aRoomNo.push(list[i]);
                            } else {
                                if (aRoomNo.length > 0) {
                                    aRoomNo[0].listLen = aRoomNo.length;
								} else {
                                    aRoomNo[0].listLen = 0;
                                };
                                aRoomType.push(aRoomNo);
                                aRoomNo = [];
                                list[i].index = ++count;
                                aRoomNo.push(list[i]);
                                roomTypeId = list[i].roomTypeId
							};
                        };
                        if (!aRoomNo[0].listLen) {
                            aRoomNo[0].listLen = aRoomNo.length;
						};
                        aRoomType.push(aRoomNo);
					};

                    return aRoomType;
				},
				// 舒适化数据---左侧栏--房型名称超出长度处理
				substrRoomTypName: function (str) {
					var _self = this;
					if (str.length <= 10) {
						return str;
					} else {
						return str.substr(0, 10) + '...';
					};
				},
				// 初始化数据后-----dom操作，占用房间重新渲染
				initAfterDrawingRooms: function (data) {
					var _self = this;
					/*Vue.nextTick(function () {
						var roomList = data;
						// 同一行，判断是否是同一订单，不同日期: 记录最近一次[连续所占用房间的个数]
						var startBookDate = 0;
						//  同一行,日期连续，该订单与上一订单(记录上一订单)的orderId进行进行匹配
						var startBookDateOrderId = '';
						/!* // 同一行，该订单与上一订单orderId比较----判定是否是同一订单
						 var saveLastOrderDate = '';*!/
						for (var i= 0, len=roomList.length; i<len; i++) {
							// 获取每一行的房间数
							var getRowLis = $('.roomstatus-rooms-rows').eq(i).find('ul li');
							// 获取每一行房间对应的渲染data
							var list = roomList[i].dayList;
							for (var j= 0, jen=list.length; j<jen; j++) {
								// 如果 不为空房,不为禁房且不为停售房  则 表示为占用房间 roomState
								if (list[j].roomState !== '9' && list[j].roomState !== '4' && list[j].roomState !== '8') {		// list[j].stayInfo !== null
									/!*saveLastOrderDate = list[j].date;*!/
									// 重新计算开始日期
									if (startBookDate == 0) {	// 开始---表示同一行的房间不同日期
										startBookDate += 1;
										startBookDateOrderId = list[j].stayInfo.orderId;
										insertStatus({
											elem: getRowLis[j],
											infor: list[j].stayInfo,
											statusCode: list[j].roomState,
											isStart: true
										});
									} else {	// 连续日期 ,orderId是否一样 ----2,3
										if (startBookDateOrderId == list[j].stayInfo.orderId) {
											startBookDate += 1;
											startBookDateOrderId = list[j].stayInfo.orderId;
											insertStatus({
												elem: getRowLis[j],
												infor: list[j].stayInfo,
												statusCode: list[j].roomState,
												isStart: false
											});
										} else {
											startBookDate = 1; // 开始---表示同一行的连续不同占用房
											startBookDateOrderId = list[j].stayInfo.orderId;
											insertStatus({
												elem: getRowLis[j],
												infor: list[j].stayInfo,
												statusCode: list[j].roomState,
												isStart: true
											});
										};
									};
								} else {
									// 1.日期跳跃情况				startBookDate = 0;
									startBookDate = 0;
									startBookDateOrderId = '';
								};
							};
							// 换行则初始化操作
							// 换行: 不同房间 清空  startBookDate = 0;
							startBookDate = 0;
							/!*saveLastOrderDate = '';*!/
							startBookDateOrderId = '';
						};

						function insertStatus(param) {
							var str = '';
							var setClassName = '';

							if (param.isStart) {
								switch(param.statusCode) {
									case '0':
										setClassName = 'bookingroom';		// 预定中
										break;
									case '1':
										setClassName = 'uncheckin';			// 未入住
										break;
									case '2':
										setClassName = 'hascheckin';		// 已入住
										break;
									case '3':
										setClassName = 'hascheckout';		// 已经离店
										break;
								};

								str += '<div class="'+ setClassName +' checkstatus" style="overflow:hidden;">';
								if (param.statusCode == '0') {
									str += '<p> 预订中... </p>';
								} else {
									str += '<p>'+ param.infor.customerName + '</p>';
									str += '<p>'+ param.infor.channelName +'</p>';
								};

								str +='</div>';
								param.elem.innerHTML = str;
							};

							switch(param.statusCode) {
								case '0':
									$(param.elem).addClass('bookingroom');
									break;
								case '1':
									$(param.elem).addClass('uncheckin');
									break;
								case '2':
									$(param.elem).addClass('hascheckin');
									break;
								case '3':
									$(param.elem).addClass('hascheckout');
									break;
							};
						};
						// 房间时间列表---点击房间---点击页面其他位置关闭并清除
						_self.clickDocumentClearAllRoomsBg();
						//信息初始化-----多个订单拖拽
						_self.getDragRoomsDetails();
					});*/
					Vue.nextTick(function () {
						var roomList = data;
						// 同一行，判断是否是同一订单，不同日期: 记录最近一次[连续所占用房间的个数]
						var startBookDate = 0;
						// 同一行，判断是否是同一订单，不同日期，最后一个
						var endStatus = false;
						// 同一行，根据orderId去查找在该房间下有几个连续相同的订单
						var sameOrderNum = 0;
						//  同一行,日期连续，该订单与上一订单(记录上一订单)的orderId进行进行匹配
						var startBookDateOrderId = '';
						/* // 同一行，该订单与上一订单orderId比较----判定是否是同一订单
						 var saveLastOrderDate = '';*/
						for (var i= 0, len=roomList.length; i<len; i++) {
							// 获取每一行的房间数
							var getRowLis = $('.roomstatus-rooms-rows').eq(i).find('ul li');
							// 获取每一行房间对应的渲染data
							var list = roomList[i].dayList;
							for (var j= 0, jen=list.length; j<jen; j++) {
								// 如果 不为空房,不为禁房且不为停售房  则 表示为占用房间 roomState
								if (list[j].roomState !== '9' && list[j].roomState !== '4' && list[j].roomState !== '8') {		// list[j].stayInfo !== null
									/*saveLastOrderDate = list[j].date;*/
									// 重新计算开始日期
									if (startBookDate == 0) {	// 开始---表示同一行的房间不同日期
										startBookDate += 1;
										startBookDateOrderId = list[j].stayInfo.orderId;
										// startBookDateOrderId在该房间下有几个连续相同的订单
										sameOrderNum = getSameOrderNum(startBookDateOrderId,list);
										// 同一行，连续订单里判断是否是最后一个 是 true 否 false
										endStatus = lastRoomStatus(startBookDate, sameOrderNum);
										insertStatus({
											elem: getRowLis[j],
											infor: list[j].stayInfo,
											statusCode: list[j].roomState,
											isStart: true,
											isEnd: endStatus,
                                            hasNeedPayAccount: list[j].needPayAmount
										});
									} else {	// 连续日期 ,orderId是否一样 ----2,3
										if (startBookDateOrderId == list[j].stayInfo.orderId) {
											startBookDate += 1;
											startBookDateOrderId = list[j].stayInfo.orderId;
											// startBookDateOrderId在该房间下有几个连续相同的订单
											sameOrderNum = getSameOrderNum(startBookDateOrderId,list);
											// 同一行，连续订单里判断是否是最后一个 是 true 否 false
											endStatus = lastRoomStatus(startBookDate, sameOrderNum);
											insertStatus({
												elem: getRowLis[j],
												infor: list[j].stayInfo,
												statusCode: list[j].roomState,
												isStart: false,
												isEnd: endStatus,
                                                hasNeedPayAccount: list[j].needPayAmount
											});
										} else {
											startBookDate = 1; // 开始---表示同一行的连续房间不同占用房
											startBookDateOrderId = list[j].stayInfo.orderId;
											// startBookDateOrderId在该房间下有几个连续相同的订单
											sameOrderNum = getSameOrderNum(startBookDateOrderId,list);
											// 同一行，连续订单里判断是否是最后一个 是 true 否 false
											endStatus = lastRoomStatus(startBookDate, sameOrderNum);
											insertStatus({
												elem: getRowLis[j],
												infor: list[j].stayInfo,
												statusCode: list[j].roomState,
												isStart: true,
												isEnd: endStatus,
                                                hasNeedPayAccount: list[j].needPayAmount
											});
										};
									};
								} else {
									// 1.日期跳跃情况				startBookDate = 0;
									startBookDate = 0;
									startBookDateOrderId = '';
								};
							};
							// 换行则初始化操作
							// 换行: 不同房间 清空  startBookDate = 0;
							startBookDate = 0;
							/*saveLastOrderDate = '';*/
							startBookDateOrderId = '';
						};

						function insertStatus(param) {
							var str = '';
							var setClassName = '';

							if (param.isStart) {
								switch(param.statusCode) {
									case '0':
										setClassName = 'bookingroom';		// 预定中
										break;
									case '1':
										setClassName = 'uncheckin';			// 未入住
										break;
									case '2':
										setClassName = 'hascheckin';		// 已入住
										break;
									case '3':
										if (param.isEnd) {
											setClassName = 'hascheckout isindependence'; // 单个订单---已经离店
											break;
										} else {
											setClassName = 'hascheckout';		// 已经离店--头
											break;
										};

								};

								str += '<div class="'+ setClassName +' checkstatus" style="overflow:hidden;">';
								if (param.statusCode == '0') {
									str += '<p> 预订中... </p>';
								} else {
                                    if(param.infor.customerName.length > 3 && yzl.reg.Chinese.test(param.infor.customerName)) {
                                        str += '<p>'+ param.infor.customerName.slice(0,3) + '...</p>';
                                    } else if (param.infor.customerName.length > 5 && yzl.reg.LetterNum.test(param.infor.customerName)) {
                                        str += '<p>'+ param.infor.customerName.slice(0,5) + '...</p>';
                                    } else {
                                        if (param.infor.customerName.length > 3) {
                                            str += '<p>'+ param.infor.customerName.slice(0,3) + '...</p>';
                                        } else {
                                            str += '<p>'+ param.infor.customerName + '</p>';
                                        };
                                    };
									str += '<p>'+ param.infor.channelName +'</p>';
								};

								str +='</div>';
								param.elem.innerHTML = str;
							} else {
								if (param.statusCode == '3') {	// 对已离店进行特殊处理
									if (param.isEnd) {	// 末尾 hascheckout-end
										str += '<div class="other-checkstatus hascheckout-end" style="overflow:hidden;">';
										param.elem.innerHTML = str;
									} else {	// 中间 hascheckout-mid
										str += '<div class="other-checkstatus hascheckout-mid" style="overflow:hidden;">';
										param.elem.innerHTML = str;
									};
								} else {
									str += '<div class="other-checkstatus" style="overflow:hidden;">';
									param.elem.innerHTML = str;
								};
							};
							// 对未入住 和 已入住订单欠款图标提示
                            if (param.isEnd && (param.statusCode == '1' || param.statusCode == '2') && param.hasNeedPayAccount > 0) {
                                $(param.elem).addClass('need-pay-account');
                            };

							switch(param.statusCode) {
								case '0':
									$(param.elem).addClass('bookingroom');
									break;
								case '1':
									$(param.elem).addClass('uncheckin');
									break;
								case '2':
									$(param.elem).addClass('hascheckin');
									break;
								case '3':
									$(param.elem).addClass('hascheckout');
									break;
							};
						};
						// 房间时间列表---点击房间---点击页面其他位置关闭并清除
						_self.clickDocumentClearAllRoomsBg();
						//信息初始化-----多个订单拖拽
						_self.getDragRoomsDetails();
					});

					// 获取同个房间下，不同日期的连续订单个数
					function getSameOrderNum(orderId,list) {
						// 记录连续orderId的订单数量
						var num = 0;
						for (var i=0; i<list.length; i++) {
							// 同一行存才统一订单，单不连续情况
							if (list[i]['orderId'] == undefined && num != 0) {
								return num;
							};
							if (list[i]['orderId'] != undefined && list[i]['orderId'] == orderId) {
								num += 1;
							};
						};
						return num;
					};
					// 该连续日期是否是最后一个
					function lastRoomStatus(startBookDate, getSameOrderNum) {
						if (startBookDate < 0|| getSameOrderNum < 0) return;
						if (startBookDate == getSameOrderNum) {
							return  true;
						} else if (startBookDate < getSameOrderNum) {
							return false;
						};
					};
				},
				// 筛选数据---+14天
				reduceFourteenDays: function () {
					var _self = this;
					var reduce14 = new Date(new Date(_self.getTodayDate).getTime() - 86400000*14).format('yyyy-MM-dd');
					_self.getTodayDate = reduce14;
					// _self.initData(_self.getTodayDate);
				},
				// 筛选数据----14天
				raiseFourteenDays: function () {
					var _self = this;
					var raise14 = new Date(new Date(_self.getTodayDate).getTime() + 86400000*14).format('yyyy-MM-dd');
					_self.getTodayDate = raise14;
					// _self.initData(_self.getTodayDate);
				},
				// 筛选数据----回到今天
				setRoomStatusToToday: function () {
					var _self = this;
					var today = new Date().format('yyyy-MM-dd');
					//var today = new Date(new Date().getTime() - 86400000*2).format('yyyy-MM-dd');
					if (today == _self.getTodayDate) return;
					_self.getTodayDate = today;
				},

				// 筛选数据----打开筛选窗口
				sortFilterOperate: function () {
					$('.sort-fliter-tag-mask').css('display', 'block');
					// 禁止滚动条
					$(document.body).css('overflow', 'hidden');
				},
				// 筛选数据----关闭筛选窗口
				closeSortFliterTag: function () {
					$('.sort-fliter-tag-mask').css('display', 'none');
					// 禁止滚动条
					$(document.body).css('overflow', 'visible');
				},
				// 筛选数据----全选/全取消
				sortFilterSelectCancelRooms: function (event) {
					var _self = this;
					var e = event || window.event;
					_self.sortFilterRoomType.roomTypeList = [];
					if (e.currentTarget.checked == true) {
						var item = _self.sortFilterRoomType.sortFilterRoomTypeList;
						for (var i=0; i<item.length; i++) {
							_self.sortFilterRoomType.roomTypeList.push(item[i].roomTypeId);
						};

						$('.sort-fliter-selectList input').each(function (index, elem) {
							elem.checked = true;
						});
					} else {
						$('.sort-fliter-selectList input').each(function (index, elem) {
							elem.checked = false;
						});
					};
				},
                // 排序筛选--- 全选 ---:选择/取消
                selectAllRoomTypes: function () {
                    var _self = this;
                    var bln = false;

                    _self.isSelectAllRoomTypes = !_self.isSelectAllRoomTypes;
                    bln = _self.isSelectAllRoomTypes;

                    if (bln) {
                        for (var i=0; i< _self.sortFilterRoomType.sortFilterRoomTypeList.length; i++) {
                            _self.sortFilterRoomType.sortFilterRoomTypeList[i].checked = true;
                        };

                    } else {
                        for (var i=0; i< _self.sortFilterRoomType.sortFilterRoomTypeList.length; i++) {
                            _self.sortFilterRoomType.sortFilterRoomTypeList[i].checked = false;
                        };
                    };

                },
                // 排序筛选--- 全选 --- 单个:选择/取消
                changePerRoomTypeSelect: function (item) {
                    var _self = this;
                    var arr = [];

                    item.checked = !item.checked;
                    if (item.checked) {
                        for (var i=0; i< _self.sortFilterRoomType.sortFilterRoomTypeList.length; i++) {
                            if (_self.sortFilterRoomType.sortFilterRoomTypeList[i].checked) {
                                arr.push(_self.sortFilterRoomType.sortFilterRoomTypeList[i].roomTypeId);
                            } else {
                                _self.isSelectAllRoomTypes = false;
                            };
                        };

                        if (_self.sortFilterRoomType.sortFilterRoomTypeList.length == arr.length) {
                            _self.isSelectAllRoomTypes = true;
                        };

                    } else {
                        _self.isSelectAllRoomTypes = false;
                    };
                },
				// 筛选数据----确认筛选按钮
				confirmSortFilterSelect: function () {
					var _self = this;
					// 禁止滚动条
					$('.sort-fliter-tag-mask').css('display', 'none');
					$(document.body).css('overflow', 'visible');
					// 清空搜索房间号
					_self.searchRoomsNoOperate = '';
					_self.initData(_self.getTodayDate);
				},
				// 表头---日期添加零
				addZeroFn : function (num) {
					if (num < 10) return '0' + num;
					return num;
				},
	            // 表头---日期格式化
	            formateDate: function (date) {
					var _self = this;
					var formateDate = _self.addZeroFn(new Date(date).getMonth()+1) + '-' + (new Date(date).getDate());
	                var today = new Date().format('yyyy-MM-dd');

	                if (today === date) {
	                    return '今天';
	                } else {
	                    return formateDate;
	                };
	            },
				// 表头---日期是否是今天---如果是则标红
				roomstatusIsToday: function (date) {
					var _self = this;
					var today = new Date().format('yyyy-MM-dd');

					if (today === date) {
						return 'red';
					};
				},
				// 表头---日期是否是今天---如果是背景颜色淡绿
				specailDay: function (date) {
					var _self = this;
					var today = new Date().format('yyyy-MM-dd');
					var day =  new Date(date).getDay();

					if (today === date) {
						return ['istoday'];
					};

					switch(day) {
						case 1:
						case 2:
						case 3:
						case 4:
						case 5:
							return {};
						default:
							return ['isweekend'];
					};
				},
				// 表头---展示特殊节日
				showFestivalDay: function (date) {
					var _self = this;

					if (festival[date] != undefined) {
						return festival[date]['holidayName'];
					};
				},
	            // 表头---日期对应周几
	            whatDay: function (date, weekend) {
					return yzl.contentVue.whatDay(date, weekend);
	            },
	            // 表头---周六，周日标红
	            weenkendBgColor: function (date) {
	                var today = new Date(date).getDay();
	                switch(today) {
	                    case 1:
	                    case 2:
	                    case 3:
	                    case 4:
	                    case 5:
	                        return {};
	                    default:
	                        return {'color': 'red'};
	                };
	            },
	            // 表头---满房
	            fullRooms: function (remain) {
	            	if (remain == 0) {
	            		return {
	            			color: 'red'
	            		}
	            	};
	            },
	            // 侧边栏房间名----锁状态
	            lockStatus: function (item) {
	                switch(item.roomLockStatus) {
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
				// 侧边栏房间名----发送动态密码
				setCleanSendCodePos: function (item) {
					var _self = this;

                    if (!(_self.roomStatusResourceInfo.cloudHotelSetRoomClean && _self.roomStatusResourceInfo.cloudHotelSetRoomDirty)) {
                        return '-76px';
                    };
					if (item.roomLockStatus == 1) {
						return '-153px';
					} else {
						return '-76px';
					};
				},
                // 侧边栏房间名----更改房间清洁状态
                changeRoomCleanStatus: function (item) {
                    var _self = this,
                        confirm = false,
                        content = '确定将房间置为洁房？',
                        confirmContent = '置为洁房',
                        cleanStatus = 1;

                    if (item.roomCleanStatus == 1) {
                        cleanStatus = 2;
                        content = '确定将房间置为脏房？';
                        confirmContent = '置为脏房';
                    };

                    var data = {
                        hotelId: yzl.hotelId,
                        roomId: item.roomId,
                        roomCleanStatus: cleanStatus,
						timestamp: _self.websocketUniqId
                    };

                    yzl.maskDialog({
                        content: content,
                        confirmBtn: confirmContent,
                        callback: function (bln) {
                            confirm = bln;
                            if (!confirm) return;
                            yzl.getAjax({
                                path : 'room/j/updateCleanStatus',
                                type : 'post',
                                data : data,
                                sCallback : function (result) {
                                    if (result.code == "0000") {
										_self.initData(_self.getTodayDate);
                                    } else {
                                        yzl.Dialog({
                                            content : result.msg,
                                            AutoClose: true
                                        });
                                    };
                                }
                            })
                        }
                    });
                },
				//  侧边栏房间名----电池电量提示
				getBatteryPower: function (item, isdueout) {
					var _self = this;
					if (item.powerNum != null && item.powerNum <= 10) {
						return ['low'];
					};
					return '';
				},
	            // 房间时间列表----判定是否是当前，是否需要居中，房间状态等，添加对应的类
	            justfiyClass: function (item) {
	                var today = new Date().format('yyyy-MM-dd');
					var addRoomClasses = '';
					// 禁用房 item.closeInfo != null
					if (item.roomState == '4') {
						// console.log('item.closeInfo: ' + item.closeInfo);
						addRoomClasses = 'forbidroom';
					// 停售房
					} else if (item.roomState == '8') {
						addRoomClasses = 'stopsellingroom';
					// 占用房
					}else if (item.stayInfo != null) {
						// console.log('item.stayInfo: ' + item.stayInfo);
						addRoomClasses = 'ocuppy-room';
					};

					// console.log(today, item.date);
	                if (today === item.date) {
						if (item.dueOut && '1' == item.dueOut) {
							return ['istoday', 'lh-center', 'dueout', addRoomClasses];
						} else {
							return ['istoday', 'lh-center', addRoomClasses];
						};
	                } else {
	                    var otherday = new Date(item.date).getDay();
	                    switch(otherday) {
	                        case 1:
	                        case 2:
	                        case 3:
	                        case 4:
	                        case 5:
	                            return ['lh-center', addRoomClasses];
	                        default:
	                            return ['isweekend', 'lh-center', addRoomClasses];
	                    };
	                };
	            },
				// 房间时间列表---将后台传回的每个房间信息保存全部保存为字符串
				savePerRoomInfor: function (perInfo) {
					return JSON.stringify(perInfo);
				},
				// 房间时间列表---将后台传回的每个房间信息筛选出拓展所需要的信息---保存起来
				saveDragInfo: function (roomType, roomDate) {
					var _self = this;
					// 新版本---已离店----可执行新增订单，禁用房操作
					// 空房-----新增订单
					// 已离店----可执行新增订单，禁用房操作
					if (roomDate.roomState && (roomDate.roomState == '9' ||  roomDate.roomState == '3')) {
						var obj = {
							roomId: roomType.roomId,
							roomNo: roomType.roomNo,
							date: roomDate.date,
							roomState: roomDate.roomState
						};
					};
					// 禁用房---开启房间参数:{"hotelId":"3","roomCloseList":[{"roomCloseId":"808645703235534848"}]}
					if (roomDate.roomState && roomDate.roomState == '4') {
						var obj = {
							roomCloseId: roomDate.closeInfo.roomCloseId,
							roomState: roomDate.roomState
						};
					};
					// 其他占用房(预定，未入住，已入住，已离店)----空房 和 禁用
					if (roomDate.roomState && roomDate.roomState != '4' && roomDate.roomState != '9' && roomDate.roomState != '3') {
						var obj = {
							roomState: roomDate.roomState
						};
					};
					// 旧版本
					/*// 空房-----新增订单
					if (roomDate.roomState && roomDate.roomState == '9') {
						var obj = {
							roomId: roomType.roomId,
							roomNo: roomType.roomNo,
							date: roomDate.date,
							roomState: roomDate.roomState
						};
					};
					// 禁用房---开启房间参数:{"hotelId":"3","roomCloseList":[{"roomCloseId":"808645703235534848"}]}
					if (roomDate.roomState && roomDate.roomState == '4') {
						var obj = {
							roomCloseId: roomDate.closeInfo.roomCloseId,
							roomState: roomDate.roomState
						};
					};
					// 其他占用房(预定，未入住，已入住，已离店)----空房 和 禁用
					if (roomDate.roomState && roomDate.roomState != '4' && roomDate.roomState != '9') {
						var obj = {
							roomState: roomDate.roomState
						};
					};*/

					return JSON.stringify(obj);

				},
				// 房间时间列表---点击每个房间，改变房间状态
				clickPerRooms: function (rooms, day, event, isEmpty) {
					var _self = this,
						e = event || window.event,
						data = {},
						that = e.currentTarget;
					// 开启禁用房间
					if (_self.roomStatusResourceInfo.cloudHotelEnableRoom) {
						if ($(that).hasClass('forbidroom')) {
							// 清除点击禁用房的背景色
							$(that).removeClass('pitch-up');
							// 单击时禁用房时-----清空拖拽list
							_self.forbidroomList = [];
							data = {
								"hotelId": yzl.hotelId,
								"roomCloseList": [
									{
										roomCloseId: day.closeInfo.roomCloseId
									}
								],
								"timestamp": _self.websocketUniqId
							};
							_self.openForbiddenRoom(data);
						};
					};
					// 点击空房----对房间进行新增，停用操作 已离店 视为空房处理
					if (isEmpty ||  day.roomState == '3') {
						// 点击已离店---进行新增 查看 停用操作---关闭 鼠标移上操作
						if (day.roomState == '3') $('.occupy-room-msg-tag').css('display', 'none');
						_self.shutDown_addRoom(rooms, day, e);
					};
					// 权限控制
					if (_self.roomStatusResourceInfo.cloudHotelOrderDetail) {
						// 订单详情---点击占用房间弹窗(占用房 排除已离店房)
						if ($(that).hasClass('ocuppy-room') && day.roomState != '3') {
							if (day.roomState != '0') {
								var orderId = day.stayInfo.orderId;
								_self.openRoomOrderDetails(orderId);
							};
						};
					};
				},
				// 房间时间列表---鼠标移上---占用房间信息提示
				overPerRoomsShowMsg: function (rooms, day, event) {
					var e = event || window.event;

					if (day.roomState == '0' || day.roomState == '') return;
					if (day.roomState == '4') {
						$('.forbidroom-room-msg-tag').css('display', 'block');
					} else {
						// 停售房---没有信息提示
						if (day.roomState !== '8') {
							// 已离店---进行新增 和 停用 查看详情操作 ，则不提示
							if ($(e.currentTarget).find('.shutDown-addRoom-tag').length > 0) return;
							$('.occupy-room-msg-tag').css('display', 'block');
						};
					};

				},
				// 房间时间列表---鼠标移出---隐藏房间信息提示
				outPerRoomsShowMsg: function (event) {
					var e = event || window.event;

					$('.occupy-room-msg-tag').css('display', 'none');
					$('.forbidroom-room-msg-tag').css('display', 'none');

				},
				// 房间时间列表---鼠标移动---房间信息提示跟随移动
				movePerRoomsShowMsg: function (rooms, day, event) {
					var _self = this;
					var e = event || window.event;

					if (day.roomState == '0') return;

					if (day.roomState == '4') {
						_self.forbidroomMouseOverShowTips.roomNo = day.closeInfo.roomNo;
						_self.forbidroomMouseOverShowTips.roomTypeName = day.closeInfo.roomTypeName;
						_self.forbidroomMouseOverShowTips.closeDate = day.closeInfo.closeDate;
						_self.forbidroomMouseOverShowTips.closeRemark = day.closeInfo.closeRemark;
						_self.forbidroomMouseOverShowTips.closeTypeName = day.closeInfo.closeTypeName;

						$('.forbidroom-room-msg-tag').css({'left': e.clientX+25, 'top': e.clientY-10});
					} else {
						if (day.roomState !== '8') {
							_self.perRoomsShowMsg.roomNo = day.stayInfo.roomNo;
							_self.perRoomsShowMsg.roomTypeName = day.stayInfo.roomTypeName;
							_self.perRoomsShowMsg.channelName = day.channelName;
							_self.perRoomsShowMsg.customerName = day.stayInfo.customerName;
							_self.perRoomsShowMsg.customerMobile = day.stayInfo.customerMobile;
							_self.perRoomsShowMsg.orderAmount = day.orderAmount;
							_self.perRoomsShowMsg.needPayAmount = day.needPayAmount;
							_self.perRoomsShowMsg.depositAmount = day.depositAmount;

							switch(day.roomState) {
								case '1':
									_self.occupyRoomStatusColorFun(1);
									_self.perRoomsShowMsg.checkInstatus = '未入住';
									break;
								case '2':
									_self.occupyRoomStatusColorFun(2);
									_self.perRoomsShowMsg.checkInstatus = '已入住';
									break;
								case '3':
									_self.occupyRoomStatusColorFun(3);
									_self.perRoomsShowMsg.checkInstatus = '已离店';
									break;

							};

							$('.occupy-room-msg-tag').css({'left': e.clientX+25, 'top': e.clientY-10});
						};
					};
				},
				// 房间时间列表----鼠标移上---占用房间信息提示
				occupyRoomStatusColorFun: function (num) {
					var _self = this;
					switch(num) {
						case 1:
							_self.occupyRoomStatusColor = {'uncheckin': true};
							return;
						case 2:
							_self.occupyRoomStatusColor = {'hascheckin': true};
							return;
						case 3:
							_self.occupyRoomStatusColor = {'hascheckout': true};
							return;
					};
				},
				//  房间时间列表---开启禁用房间
				openForbiddenRoom: function (sendData) {
					var _self = this,
						confirm = false;

					var data = sendData;

					yzl.maskDialog({
						content: '确定将启用房间吗？',
						callback: function (bln) {
							confirm = bln;
							if (!confirm) return;
							yzl.getAjax({
								path : 'room/j/openRoom',
								type : 'post',
								data : data,
								sCallback : function (result) {
									if (result.code == "0000") {
										_self.initData(_self.getTodayDate);
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

				// 房间时间列表---点击房间，对房间进行新增，停用操作
				/*
					 <div class="shutDown-addRoom-tag ac">
						 <p class="shutDown-addRoom-add">新增</p>
						 <p class="shutDown-addRoom-shut">停用</p>
					 </div>
				*/
				shutDown_addRoom: function (rooms, day, e) {
					var _self = this,
						that = e.currentTarget;
					e.stopPropagation();
					// 选中背景色
					_self.romove_tips_tag();
					// 点击空房----保存该元素
					_self.saveClickEmptyRoom = that;
					// 点击空房----标记该元素背景色
					$(that).addClass('pitch-up');

					var x = $(that).attr('data-x');
					var y = $(that).attr('data-y');

                    // 选中 选中的左侧，日期栏
                    _self.addSelectedRoomDateItem(x, y);
					/*$('.roomstatus-date-lists li').each(function () {
						if ($(this).attr('data-x') == x) {
							$(this).addClass('selected');
						};
					});

                    if (!_self.showSplitRoomType) {
                        // 房型 房间 非分离
                        $('.roomstatus-rooms-title li').each(function () {
                            if ($(this).attr('data-y') == y) {
                                $(this).addClass('selected');
                            };
                        });
					} else {
                        // 房型 房间 分离
                        $('.roomstatus-rooms-title tr td[data-y]').each(function () {
                            if ($(this).attr('data-y') == y) {
                                $(this).addClass('selected');
                            };
                        });
					};*/

					// 1.插入盒子操作
					var divElem = $('<div class="shutDown-addRoom-tag ac"></div>'),
						addElem = $('<p class="shutDown-addRoom-add">新增</p>'),
						checkDetails = $('<p class="shutDown-addRoom-add">查看</p>'),
						shutElem = $('<p class="shutDown-addRoom-add">停用</p>');

					divElem.unbind('click').click(function (e) {
						e.stopPropagation();
						_self.romove_tips_tag();
					});

					// mouseup mousedown禁止冒泡到document的mouseup mousedown事件
					var stopPreventDefault = function(e) {
						e.stopPropagation();
						return false;
					};
					addElem.unbind('mouseup').mouseup(stopPreventDefault);
					shutElem.unbind('mouseup').mouseup(stopPreventDefault);
					checkDetails.unbind('mouseup').mouseup(stopPreventDefault);
					checkDetails.unbind('mousedown').mousedown(stopPreventDefault);
					addElem.unbind('mousedown').mousedown(stopPreventDefault);
					shutElem.unbind('mousedown').mousedown(stopPreventDefault);
					// 权限控制
					if (_self.roomStatusResourceInfo.cloudHotelOrderDetail) {
						// 已离店-----可执行查看订单
						if (day.roomState == '3') {
							checkDetails.unbind('click').click(function (e) {
								var orderId = day.stayInfo.orderId;
								e.stopPropagation();
								_self.openRoomOrderDetails(orderId);

							}).appendTo(divElem);
						};
					};

					// 权限控制
					if (_self.roomStatusResourceInfo.cloudHotelAddOrder) {
						// 点击新增按钮
						addElem.unbind('click').click(function (e) {
							// 新增订单保存
							e.stopPropagation();
							// 单个---新增订单---获取房间型 和 房间数 日期 初始化
							var roomTypePriceParams = [];
							var obj = {
								roomId: rooms.roomId,
								roomNo: rooms.roomNo,
								date: day.date
							};
							roomTypePriceParams.push(obj);

							_self.getRoomTypePrice(roomTypePriceParams, function (data) {
								var orderRoomStay = data.orderRoomStayList[0];

								var orderRoomStay = {
									checkinDate: orderRoomStay.checkinDate,
									checkoutDate: orderRoomStay.checkoutDate,
									roomTypeId: orderRoomStay.roomTypeId,
									roomTypeName: orderRoomStay.roomTypeName,
									roomNo: orderRoomStay.roomNo,
									roomId: orderRoomStay.roomId,
									dayPriceList: [],
									totalDays: 0,
									sumPrices: 0,
									//realtimeSumPrice: 0,
									backupDayPriceList: [],
									fixedPrice: 0,
									roomTypeList:[],
									roomList:[]
								}
								_self.orderRoomStayList.push(orderRoomStay);
								var orderBill = {
									billTypeCode: '',
									billTypeName: '',
									amount: '',
									remark: '',
                                    showBillTypeNameDropDown: false
								};
								_self.orderBillList.push(orderBill);
								_self.clickRoom_addRoom(_self.orderRoomStayList);
							});

						}).appendTo(divElem);
					};

					// 权限控制
					if (_self.roomStatusResourceInfo.cloudHotelDisableRoom) {
						// 点击停用按钮
						shutElem.unbind('click').click(function () {
							$('.closeroom-tag-mask').css('display', 'block');
							// 禁止滚动条
							$(document.body).css('overflow', 'hidden');

							$('.closeroom-confirm-btn').unbind('click').on('click', function () {
								var closeTypeName = _self.radio_getCN(_self.saveCloseRoomInfo.closeTypeCode);
								var data = {
									"hotelId": yzl.hotelId,
									"roomCloseList": [
										{
											roomId: rooms.roomId,
											closeTypeCode: _self.saveCloseRoomInfo.closeTypeCode,
											closeTypeName: closeTypeName,
											closeDate: day.date,
											closeRemark: _self.saveCloseRoomInfo.closeRemark
										}
									],
									"timestamp": _self.websocketUniqId
								};
								_self.clickRoom_shutDownRoom(data);
							});
						}).appendTo(divElem);;
					};

					// 权限控制
					if (_self.roomStatusResourceInfo.cloudHotelOrderDetail || _self.roomStatusResourceInfo.cloudHotelAddOrder || _self.roomStatusResourceInfo.cloudHotelDisableRoom) {
						divElem.appendTo(that);
					};

					/*// 2.点击页面其他位置关闭并清除
					$(document.body).unbind('click').on('click', function () {
						romove_tips_tag();
					});
					// 3.点击新增操作    清除盒子操作

					// 4.点击停用操作		清除盒子操作
					function romove_tips_tag() {
						if ($('.shutDown-addRoom-tag').length > 0) $('.shutDown-addRoom-tag').remove();
						// 删除背景色
						//$('.pitch-up').removeClass('pitch-up');
						$(that).removeClass('pitch-up');
					};*/
				},
				//  房间时间列表---点击房间---点击页面其他位置关闭并清除   clickDocumentClearAllRoomsBg  romove_tips_tag
				clickDocumentClearAllRoomsBg: function () {
					var _self = this;

					// 如果在房间列表范围内拖拽-----防止冒泡到document
					$('#roomstatusDatelist, .drag-rooms-operate-tag, .closeroom-tag-mask').unbind('click').on('click', function (e) {
						e.stopPropagation();
					});
					// 火狐不会触发----chrome会触发
					$(document.body).unbind('click').on('click', function (e) {
						_self.romove_tips_tag();
                        yzl.headerVue.hotelListStatus = false;
					});

					var stopPreventDefault = function(e) {
						e.stopPropagation();
					};
					$('.closeroom-tag-mask').unbind('mouseup').mouseup(stopPreventDefault);
					$('.closeroom-tag-mask').unbind('mousedown').mousedown(stopPreventDefault);


					// 房态房间数据渲染成功后-----设置页头滚动固定问题
					/*var topDateTitle = $('.roomstatus-date-title').offset().top;
					var topFliterBox = $('.roomstatus-title-box').offset().top;*/

					$(window).scroll(function () {
						if (0 <= $(window).scrollTop()) {
							$('.roomstatus-date-title').css({
								'position': 'fixed',
								'top': 108,
								'z-index': 90,
								'borderTop': '1px solid #dadada'
							});

							$('.roomstatus-title-box').css({
								'position': 'fixed',
								'top': 58,
								'z-index': 91,
								'backgroundColor': '#fff'
							});
							$('.roomstatus-ctent-box').css('padding-top','100px');
						} /*else {
							$('.roomstatus-ctent-box').css('padding-top','0');
							$('.roomstatus-date-title').css({
								'position': 'static',
								'borderTop': 'none'
							});

							$('.roomstatus-title-box').css({
								'position': 'static',
								'backgroundColor': 'transparent'
							});
						};*/
					});
				},
				romove_tips_tag : function () {
					var _self = this;
					// 清除房间列表----单个点击---清除 新增 和 停用 按钮
					if ($('.shutDown-addRoom-tag').length > 0) $('.shutDown-addRoom-tag').remove();
					// 删除背景色
					if (_self.saveClickEmptyRoom != null) {
						$(_self.saveClickEmptyRoom).removeClass('pitch-up');
					};
					// 如果拖拽多选房间存在，则清除
					if (_self.emptyRoomList.length > 0 || _self.forbidroomList.length > 0 || _self.otherOcuppyRoomList.length > 0) {
						$('.pitch-up').removeClass('pitch-up');
						// 清除后----清空
						_self.emptyRoomList = [];
						_self.forbidroomList = [];
						_self.otherOcuppyRoomList = [];
					};
					// 如果拖拽存在----禁用房---关闭弹窗
					$('.drag-rooms-operate-tag').css('display','none');
				},
				// 房间时间列表---点击新增，或者拖拽新增---获取房间入住，离店，房型，房间价格等
				/*
				 objList = [{
						 roomId: '',
						 roomNo: '',
						 date: ''
					 }]
				 */
				getRoomTypePrice: function (objList, callback) {
					var _self = this;
					var data = {
						hotelId: yzl.hotelId,
						roomStayList: objList
					}

                    $('.addneworder-tag-mask, #addneworder_tag_content').fadeIn(300);

					yzl.getAjax({
						path : '/roomType/j/getRoomTypePrice',
						type : 'post',
						data : data,
						loadingElem: '#addNewOrdersTag',
                        tips: false,
						sCallback : function (result) {
							if (result.code == "0000") {
								// 房态房间----关闭并清除所有 背景  弹窗
								_self.romove_tips_tag();
								callback && callback(result.data);
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 拖拽----获取房间信息
				getDragRoomsDetails: function () {
					var _self = this;
					// 记录鼠标开始点击坐标
					var obj_start = {};
					// 记录鼠标移动
					var obj_end = {};
					// 根据具体元素，传进去------span   发生改变时，下面标注A处，需要修改
					var smallBox = $('#roomstatusDatelist li');
					// 记录所有被拖拽包含的元素
					var allDragLis = [];
					// 拖拽盒子内包含  禁用房  记录该元素
					var forbidroomLiList = [];
					// 房间列表盒子
					var roomstatusFinalBox = document.getElementById('roomstatusDatelist');


					$('#roomstatusDatelist').unbind('mousedown').mousedown(function(e) {
						var getLi = _self.getSpecifyParElem(e.target, 'LI', roomstatusFinalBox);

						// 房间时间列表---点击房间---点击页面其他位置关闭并清除
						$(_self.saveClickEmptyRoom).removeClass('pitch-up');
						_self.saveClickEmptyRoom = null;

						// 清除房间列表----单个点击---清除 新增 和 停用 按钮
						if ($('.shutDown-addRoom-tag').length > 0) $('.shutDown-addRoom-tag').remove();

						if (getLi) {
							obj_start.x = parseInt($(getLi).attr('data-x'));
							obj_start.y = parseInt($(getLi).attr('data-y'));
						};

						// 清除所有被选中状态，重新选择
						//clearAllActive();

						$(document).unbind('mousemove').mousemove(function (e) {
							var getLi = _self.getSpecifyParElem(e.target, 'LI', roomstatusFinalBox),
								x = parseInt($(getLi).attr('data-x')),
								y = parseInt($(getLi).attr('data-y'));
							// 如果LI不存在 或 li不是指定的LI则不执行
							if (getLi == null || getLi.getAttribute('data-draginfo') == null) return;
							// 取消文本选中默认行为
							e.preventDefault();
							e.stopPropagation();
							// 思路分析:
							/*
							 *   (1, 1)  (1, 2)  (1, 3)  (1, 4)  (1, 5) (1, 6)
							 *   (2, 1)  (2, 2)  (2, 3)  (2, 4)  (2, 5) (2, 6)
							 *   (3, 1)  (3, 2)  (3, 3)  (3, 4)  (3, 5) (3, 6)
							 *   (4, 1)  (4, 2)  (4, 3)  (4, 4)  (4, 5) (4, 6)
							 *   (5, 1)  (5, 2)  (5, 3)  (5, 4)  (5, 5) (5, 6)
							 *
							 *
							 *   start x, y     end  x, y
							 *         1, 2          1, 3
							 *
							 *              end.x - start.x = 0,  end.y - start.y + 1 = 2;
							 *
							 *                                      --------> (1, 2) (1, 3)
							 *
							 *         1, 2          2, 3
							 *
							 *             end.x - start.x = 1 ;  end.y - start.y + 1 = 2;
							 *
							 *            右下角方向
							 *             end.y >= elem.y >= start.y
							 *             end.x >= elem.x >= start.x
							 *
							 *              左上角方向
							 *              start.y >= elem.y >= end.y
							 *              start.x >= elem.x >= end.x
							 *
							 *              右上角方向
							 *              end.y >= elem.y >= start.y
							 *              start.x >= elem.x >= end.x
							 *
							 *              左下角方向
							 *              start.y >= elem.y >= end.y
							 *              end.x >= elem.x >= start.x
							 *
							 *
							 *
							 * */
							// 鼠标在同一个LI上移动，只记录一次横纵坐标
							if (obj_end.x === x && obj_end.y === y) {
								return;
								// 标注： A处
							} else {
								// 鼠标移动最终坐落在span的横纵坐标
								obj_end.x = x;
								obj_end.y = y;

								// 此时此刻,在坐标范围的smallBox元素
								allDragLis = [];
								// 记录空房---清空
								_self.emptyRoomList = [];
								// 记录禁用房----清空
								_self.forbidroomList = [];
								// 其他占用房(除空房，禁用房)
								_self.otherOcuppyRoomList = [];
								// 清除所有被选中状态，重新选择
								clearAllActive();
								// 清空 拖拽盒子内包含  禁用房  记录该元素
								forbidroomLiList = [];

								// 遍历在坐标范围的smallBox元素
								for (var i= 0, len=smallBox.length; i<len; i++) {
									smallBox_x = parseInt(smallBox[i].getAttribute('data-x')),
									smallBox_y = parseInt(smallBox[i].getAttribute('data-y')),
									// 判定符合坐标范围的smallBox元素
									// 右下角方向
									limit_yx_x = obj_end.x >= smallBox_x && obj_start.x <= smallBox_x;
									limit_yx_y = obj_end.y >= smallBox_y && obj_start.y <= smallBox_y;
									// 左上角方向
									limit_zs_x = obj_start.x >= smallBox_x && obj_end.x <= smallBox_x;
									limit_zs_y = obj_start.y >= smallBox_y && obj_end.y <= smallBox_y;
									// 右上角方向
									limit_ys_x = obj_start.x >= smallBox_x && obj_end.x <= smallBox_x;
									limit_ys_y = obj_end.y >= smallBox_y && obj_start.y <= smallBox_y;
									// 左下角方向
									limit_zx_x = obj_end.x >= smallBox_x && obj_start.x <= smallBox_x;
									limit_zx_y = obj_start.y >= smallBox_y && obj_end.y <= smallBox_y;

									// 选中房间对应-----日期区间标色	limit_yx_x  limit_ys_x
									if (limit_yx_x || limit_ys_x) {
										$('.roomstatus-date-lists li').each(function () {
											if ($(this).attr('data-x') == smallBox_x) {
												$(this).addClass('selected');
											};
										});
									};

									// 选中房间对应-----左侧房型标色
									if (limit_yx_y || limit_zs_y) {
                                        if (!_self.showSplitRoomType) {
                                            // 房型 房间 非分离
                                            $('.roomstatus-rooms-title li').each(function () {
                                                if ($(this).attr('data-y') == smallBox_y) {
                                                    $(this).addClass('selected');
                                                };
                                            });
										} else {
                                            // 房型 房间 分离
                                            $('.roomstatus-rooms-title tr td[data-y]').each(function () {
                                                if ($(this).attr('data-y') == smallBox_y) {
                                                    $(this).addClass('selected');
                                                };
                                            });
										};
									};

									// 根据鼠标走向，确定坐标范围smallBox元素
									if ((limit_yx_x && limit_yx_y)||(limit_zs_x && limit_zs_y)||(limit_ys_x && limit_ys_y)||(limit_zx_x && limit_zx_y)) {
										// 新版本---已离店----多个拖拽
										// 空房 背景色 记录新增订单参数
										var emptyRoomInfo = JSON.parse(smallBox[i].getAttribute('data-draginfo'));
										if (emptyRoomInfo && (emptyRoomInfo.roomState == 9 || emptyRoomInfo.roomState == 4 || emptyRoomInfo.roomState == 3)) {
											// 符合坐标范围的smallBox,插入数组
											allDragLis.push(smallBox[i]);
											// 当鼠标未mouseup，往回滚时，清除往回滚，未被覆盖到的smallBox的active
											for (var j= 0, jen=allDragLis.length; j<jen; j++) {
												$(allDragLis[j]).addClass('pitch-up');
											};
										};
										// 把已离店房间----当做空房处理看待
										if (emptyRoomInfo && (emptyRoomInfo.roomState == 9 || emptyRoomInfo.roomState == 3)) {
											// 符合坐标范围的smallBox,插入数组
											//allDragLis.push(smallBox[i]);
											// 获取空房拖拽---上传参数
											var obj = {
												"roomId": emptyRoomInfo.roomId,
												"roomNo": emptyRoomInfo.roomNo,
												"date": emptyRoomInfo.date
											};
											_self.emptyRoomList.push(obj);
											// 当鼠标未mouseup，往回滚时，清除往回滚，未被覆盖到的smallBox的active
											//for (var j= 0, jen=allDragLis.length; j<jen; j++) {
											//	$(allDragLis[j]).addClass('pitch-up');
											//};
										};
										// 禁用房---批量开启房
										if (emptyRoomInfo && emptyRoomInfo.roomState == '4') {
											// 获取禁用房开启---拖拽---上传参数
											var obj = {
												roomCloseId: emptyRoomInfo.roomCloseId
											};
											_self.forbidroomList.push(obj);
											// 拖拽盒子内包含  禁用房  记录该元素
											forbidroomLiList.push(smallBox[i]);
										};

										// 其他占用房(除空房，禁用房)----判断是可以操作，如果存在，则不操作
										if (emptyRoomInfo && emptyRoomInfo.roomState != 9 && emptyRoomInfo.roomState != 4 && emptyRoomInfo.roomState != 3) {
											_self.otherOcuppyRoomList.push(smallBox[i]);
										};
										// 未入住，预定中，已入住......批量操作

										// 旧版本
										/*// 空房 背景色 记录新增订单参数
										var emptyRoomInfo = JSON.parse(smallBox[i].getAttribute('data-draginfo'));
										if (emptyRoomInfo && emptyRoomInfo.roomState == 9) {
											// 符合坐标范围的smallBox,插入数组
											allDragLis.push(smallBox[i]);
											// 获取空房拖拽---上传参数
											var obj = {
												"roomId": emptyRoomInfo.roomId,
												"roomNo": emptyRoomInfo.roomNo,
												"date": emptyRoomInfo.date
											};

											_self.emptyRoomList.push(obj);
											// 当鼠标未mouseup，往回滚时，清除往回滚，未被覆盖到的smallBox的active
											for (var j= 0, jen=allDragLis.length; j<jen; j++) {
												$(allDragLis[j]).addClass('pitch-up');
											};
										};
										// 禁用房---批量开启房
										if (emptyRoomInfo && emptyRoomInfo.roomState == '4') {
											// 获取禁用房开启---拖拽---上传参数
											var obj = {
												roomCloseId: emptyRoomInfo.roomCloseId
											};
											_self.forbidroomList.push(obj);
											// 拖拽盒子内包含  禁用房  记录该元素
											forbidroomLiList.push(smallBox[i]);
										};

										// 其他占用房(除空房，禁用房)----判断是可以操作，如果存在，则不操作
										if (emptyRoomInfo && emptyRoomInfo.roomState != '9' && emptyRoomInfo.roomState != '4') {
											_self.otherOcuppyRoomList.push(smallBox[i]);
										};
										// 未入住，预定中，已入住......批量操作*/
									};
								};

							};

						});
						// 禁止文本选中
						return false;
					});

					// 取消鼠标移动绑定事件
					$(document).unbind('mouseup').mouseup(function (e) {
						$(document).unbind('mousemove');

						// 兼容火狐---chorme没问题
						var getLi = _self.getSpecifyParElem(e.target, 'LI', roomstatusFinalBox);
						// 如果LI不存在 或 li不是指定的LI则不执行
						if (getLi == null || getLi.getAttribute('data-draginfo') == null) {
							if (e.target.id != 'shutDown_addRoom_addRooms' && e.target.id != 'shutDown_addRoom_close' && e.target.id != 'shutDown_addRoom_open') {
								clearAllActive();
								return;
							};
						};

						// 如果存在其他占用房(除空房，禁用房)外，则清除选中色，不进行任何操作
						if (_self.otherOcuppyRoomList.length > 0) {
							//console.log('如果存在其他占用房(除空房，禁用房)外，则清除选中色，不进行任何操作');
							clearAllActive();
							return;
						};
						// 拖拽盒子内包含  禁用房  则清空所选中空房 禁用房标色
						if (_self.forbidroomList.length > 0) {
							// 清空所选中空房
							for (var j=0; j<allDragLis.length; j++) {
								$(allDragLis[j]).removeClass('pitch-up');
							};
							// 禁用房标色
							for (var i=0; i < forbidroomLiList.length; i++ ) {
								$(forbidroomLiList[i]).addClass('pitch-up');
							};
						};

						// 如果拖拽存在----禁用房---默认批量开启房间
						if (forbidroomLiList.length > 0) {
							//console.log('禁用房存在');
							_self.dragRoomsOperateIsShow.isSetForbidRoom = false;
							$('.drag-rooms-operate-tag').css({'display':'block','left': e.clientX+20, 'top': e.clientY+20});
						} else if (allDragLis.length > 0) {
							//console.log('操作空房');
							_self.dragRoomsOperateIsShow.isSetForbidRoom = true;
							$('.drag-rooms-operate-tag').css({'display':'block','left': e.clientX+20, 'top': e.clientY+20});
						};

						// 禁止文本选中
						return false;
					});

					// 清除所有被选中状态，重新选择
					/* function clearAllActive() {
						 for (var i= 0, len=smallBox.length; i<len; i++) {
						 	$(smallBox[i]).removeClass('pitch-up');
						 };
					 };*/
					// 清除所有被选中状态，重新选择
					function clearAllActive() {
						for (var i= 0, len=smallBox.length; i<len; i++) {
							$(smallBox[i]).removeClass('pitch-up');
						};

						// 清除 选中的左侧，日期栏
                        _self.removeSelectedRoomDateItem();

						// 如果拖拽存在----禁用房---关闭弹窗
						$('.drag-rooms-operate-tag').css('display','none');
						// 清除后----清空
						_self.emptyRoomList = [];
						_self.forbidroomList = [];
						_self.otherOcuppyRoomList = [];
						forbidroomLiList = [];
						allDragLis = [];
					};

					// 房态鼠标-----移上----任意一个房间，日期 和 左侧房型 标色
					$('#roomstatusDatelist li').unbind('mouseover').mouseover(function () {
						var x = $(this).attr('data-x');
						var y = $(this).attr('data-y');

                        // 选中 选中的左侧，日期栏
                        _self.addSelectedRoomDateItem(x, y);
					});

					$('#roomstatusDatelist li').unbind('mouseout').mouseout(function () {
                        // 清除 选中的左侧，日期栏
						_self.removeSelectedRoomDateItem();
					});
				},
                // 选中 选中的左侧，日期栏
				// 还有一处未合并进来： line2076---line2100
				addSelectedRoomDateItem: function (x, y) {
                    var _self = this;

                    $('.roomstatus-date-lists li').each(function () {
                        if ($(this).attr('data-x') == x) {
                            $(this).addClass('selected');
                        };
                    });

                    if (!_self.showSplitRoomType) {
                        // 房型 房间 非分离
                        $('.roomstatus-rooms-title li').each(function () {
                            if ($(this).attr('data-y') == y) {
                                $(this).addClass('selected');
                            };
                        });
                    } else {
                        // 房型 房间 分离
                        $('.roomstatus-rooms-title tr td[data-y]').each(function () {
                            if ($(this).attr('data-y') == y) {
                                $(this).addClass('selected');
                            };
                        });
                    };
				},
				// 清除 选中的左侧，日期栏
				removeSelectedRoomDateItem: function () {
					var _self = this;

                    if (!_self.showSplitRoomType) {
                        // 房型 房间 非分离
                        $('.roomstatus-date-lists li, .roomstatus-rooms-title li').each(function () {
                            $(this).removeClass('selected');
                        });
                    } else {
                        // 房型 房间 分离
                        $('.roomstatus-date-lists li,.roomstatus-rooms-title tr td').each(function () {
                            $(this).removeClass('selected');
                        });
                    };
				},

				// 获取指定父级元素
				getSpecifyParElem: function (targetElem, parElem, srchFinalElem) {
					var _self = this;
					if (targetElem == null) return null;
					if (targetElem.tagName === parElem) {
						return targetElem;
					} else if (targetElem.id === srchFinalElem.id) {
						return null;
					} else {
						return _self.getSpecifyParElem(targetElem.parentNode, parElem, srchFinalElem);
					};
				},
				// 多个拖拽---点击新增房间
				dragRoomsAddOrders: function () {
					var _self = this;
					// 如果拖拽存在----禁用房---关闭弹窗
					_self.getRoomTypePrice(_self.emptyRoomList, function (data) {
						var orderRoomStay = data.orderRoomStayList;

						for (var i= 0, len=orderRoomStay.length; i<len; i++) {
							var perOrderRoomStay = {
								checkinDate: orderRoomStay[i].checkinDate,
								checkoutDate: orderRoomStay[i].checkoutDate,
								roomTypeId: orderRoomStay[i].roomTypeId,
								roomTypeName: orderRoomStay[i].roomTypeName,
								roomNo: orderRoomStay[i].roomNo,
								roomId: orderRoomStay[i].roomId,
								dayPriceList: [],
								totalDays: 0,
								sumPrices: 0,
								//realtimeSumPrice: 0,
								backupDayPriceList: [],
								fixedPrice: 0,
								roomTypeList:[],
								roomList:[]
							}
							_self.orderRoomStayList.push(perOrderRoomStay);
						};
						var orderBill = {
							billTypeCode: '',
							billTypeName: '',
							amount: '',
							remark: '',
                            showBillTypeNameDropDown: false
						};
						_self.orderBillList.push(orderBill);
						_self.clickRoom_addRoom(_self.orderRoomStayList);
					});
				},
				// 多个拖拽----批量--开启房间
				dragRoomsOpenSelectedRooms: function () {
					var _self = this;
					var data = {
						hotelId: yzl.hotelId,
						roomCloseList: _self.forbidroomList,
						timestamp: _self.websocketUniqId
					};
					_self.openForbiddenRoom(data);
				},
				// 多个拖拽---批量--关闭房间
				/*
				 var obj = {
					 "roomId": emptyRoomInfo.roomId,
					 "roomNo": emptyRoomInfo.roomNo,
					 "date": emptyRoomInfo.date
				 };

				*/
				dragRoomsForbidroomOperate: function () {
					var _self = this;

					$('.closeroom-tag-mask').css('display', 'block');
					// 开启滚动条
					$(document.body).css('overflow', 'hidden');

					$('.closeroom-confirm-btn').unbind('click').on('click', function () {
						var roomCloseList = [];
						var closeTypeName = _self.radio_getCN(_self.saveCloseRoomInfo.closeTypeCode);

						for (var i=0; i<_self.emptyRoomList.length; i++) {
							var obj = {
								closeDate:_self.emptyRoomList[i].date,
								closeRemark: _self.saveCloseRoomInfo.closeRemark,
								closeTypeCode: _self.saveCloseRoomInfo.closeTypeCode,
								closeTypeName: closeTypeName,
								roomId: _self.emptyRoomList[i].roomId
							};
							roomCloseList.push(obj);
						};

						var data = {
							hotelId: yzl.hotelId,
							roomCloseList: roomCloseList,
							timestamp: _self.websocketUniqId
						};
						_self.clickRoom_shutDownRoom(data);
					});
				},
				//  房间时间列表---点击占用房间---查看订单详情
				openRoomOrderDetails: function (orderId) {
					yzl.contentVue.openRoomOrderDetails(orderId);
				},
				// 房间时间列表---关房radio--备注内容
				radio_getCN: function (val) {
					switch(val) {
						case '1':
							return '装修';
						case '2':
							return '为朋友预留';
						case '3':
							return '其他';
						default :
							return '';
					};
				},
				// 房间时间列表---点击房间，对房间进行新增操作
				clickRoom_addRoom: function (orderRoomStayList) {
					var _self = this;

					yzl.getAjax({
						path : '/order/j/commonList',
						type : 'post',
						data : {
							hotelId: yzl.hotelId
						},
                        loadingElem: '#addNewOrdersTag',
                        tips: false,
						sCallback : function (result) {
							if (result.code == "0000") {
								// 新增订单 -----选择渠道
								_self.channelList= result.data.channelList;
								// 新增订单 -----支付方式
								_self.orderPaymentList = [];
								var orderPayment = {
									payTypeList: result.data.payTypeList,
									payTypeCode: '',
									payTypeName: '',
									payNo: '',
									payAmount: '',
									remark: '',
									imageId: ''
								}
								_self.orderPaymentList.push(orderPayment);
								// 新增订单 -----押金
								_self.orderDepositList = [];
								var orderDeposit = {
									depositTypeName: '',
									depositAmount: ''
								};
								_self.orderDepositList.push(orderDeposit);
								// 禁止滚动条
								$(document.body).css('overflow', 'hidden');
								// 初始化 上传附件
								/*Vue.nextTick(function () {
									_self.uploadOrderPaymentImage('uploadOrderPaymentImageBtn');
								});*/

							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});

					// 获取预定的房型接口数据----离店，入住时间
					for(var i=0;i<orderRoomStayList.length;i++){
						_self.getValidListMethod(orderRoomStayList[i]);
					}
				},
				// 新增订单窗口---获取选择渠道名称
				getChannelName: function (event) {
					var _self = this,
						e = event || window.event;
					_self.addNewOrders.channelName = e.currentTarget.options[e.currentTarget.selectedIndex].text;
				},
				getPaymentlName: function (item, event) {
					var _self = this,
						e = event || window.event;
					item.payTypeName = e.currentTarget.options[e.currentTarget.selectedIndex].text;
				},
				// 新增订单窗口---删除: 入住，离店订单信息
				removeAnoCheckinRow: function (item) {
					var _self = this;
					_self.orderRoomStayList.$remove(item);
					// 统计总费用---入住费用
					_self.orderFeeCount.roomSumPrice = _self.roomSumPrice();
				},
				// 新增订单窗口---添加: 入住，离店订单信息
				addAnoCheckinRow: function (index) {
					var _self = this;
					var data = {
						checkinDate: new Date().format('yyyy-MM-dd'),
						checkoutDate:'',
						roomTypeId: '',
						roomTypeName: '',
						roomNo:'',
						roomId:'',
						dayPriceList: [],
						totalDays: 0,
						sumPrices: 0,
						//realtimeSumPrice: 0,
						backupDayPriceList: [],
						fixedPrice: 0,
						roomTypeList:[],
						roomList:[]
					};

					_self.orderRoomStayList.push(data);
				},
				// 新增订单窗口---每日房价---动态获取dayPriceList的宽度
				getPriceListBoxWidth: function (days) {
					return yzl.contentVue.getPriceListBoxWidth(days);
				},
				// 新增订单窗口---每日房价---动态获取dayPriceList的小三角left值
				getPriceListTriangleLeft: function (days) {
					return yzl.contentVue.getPriceListTriangleLeft(days);
				},
				// 新增订单窗口---每日房价---动态获取dayPriceList自己left值
				getPriceListBoxLeft: function (days) {
					return yzl.contentVue.getPriceListBoxLeft(days);
				},
				// 新增订单窗口---每日房价---日期格式化
				formateDayPricesDate: function (date) {
					return yzl.contentVue.formateDayPricesDate(date);
				},
				// 新增订单窗口---添加: 修改日期之后，加载对应内容
				confrim: function (item){
					var _self = this;
					if(item.checkinDate&&item.checkoutDate){
						_self.getValidListMethod(item);
					}
				},
				// 新增订单窗口---获取预定的房型接口:
				getValidListMethod: function (item) {
					var _self = this;

					var data = {
						checkinDate:item.checkinDate,
						checkoutDate:item.checkoutDate,
						hotelId:yzl.hotelId
					};

					$('#checkin_operate, #addorder_operate').attr('disabled', true).addClass('disabled-btn');
					yzl.getAjax({
						path : '/roomType/j/getValidList',
						type : 'post',
						data : data,
                        loadingElem: '#addNewOrdersTag',
                        tips: false,
						sCallback : function (result) {
							if (result.code == "0000") {
								// 新增订单--日期插件--获取房间列表
								item.roomTypeList=result.data.roomTypeList;
								// 新增订单--日期插件--获取房间号
								if (item.roomTypeId) {
									var roomType = _.filter(item.roomTypeList, function(roomType){ return roomType.roomTypeId == item.roomTypeId});
									item.roomList = roomType[0].roomList;
								};

								if(item.roomTypeId){
									var roomType = _.find(item.roomTypeList, function(roomType){ return roomType.roomTypeId == item.roomTypeId; });
									// item.sumPrices = 0;
									// item.fixedPrice = 0;
									// 每个房间价格---原始列表值
									item.dayPriceList = roomType.dayPriceList;
									// 每个房间价格---列表随时变化
									item.backupDayPriceList = JSON.parse(JSON.stringify(roomType.dayPriceList));
									item.totalDays = roomType.dayPriceList.length;

									var arrDayPriceList = [];
									for (var i=0; i<roomType.dayPriceList.length; i++) {
                                        arrDayPriceList.push(roomType.dayPriceList[i].price);
										/*// 房间价格总价---原始值
										item.sumPrices = yzl.floatObj.add(item.sumPrices, roomType.dayPriceList[i].price);
										// 房间价格总价---随时变化
										item.fixedPrice = yzl.floatObj.add(item.fixedPrice, roomType.dayPriceList[i].price);*/
									};
                                    item.sumPrices = yzl.calcuResult(arrDayPriceList);
                                    item.fixedPrice = yzl.calcuResult(arrDayPriceList);
								}
								// 统计总费用---入住费用
								_self.orderFeeCount.roomSumPrice = _self.roomSumPrice();
								$('#checkin_operate, #addorder_operate').removeAttr('disabled').removeClass('disabled-btn');
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 新增订单窗口---动态获取下来传 房间列表 和 对应价格:
				getRoomList: function (item,roomTypeId, event) {
					var _self = this;
					var e = event || window.event;
					item.roomId = "";
					// item.sumPrices = 0;
					// item.fixedPrice = 0;
					item.roomList = [];
					item.dayPriceList = [];
					for (var i= 0, len=item.roomTypeList.length; i<len; i++) {
						if(item.roomTypeList[i].roomTypeId==roomTypeId){
							item.roomList = item.roomTypeList[i].roomList;
							// 每个房间价格---原始列表值
							item.dayPriceList = item.roomTypeList[i].dayPriceList;
							// 每个房间价格---列表随时变化
							item.backupDayPriceList = JSON.parse(JSON.stringify(item.dayPriceList));
						}
					};
					item.totalDays = item.dayPriceList.length;

					var arrDayPriceList = [];
					for (var i=0; i<item.dayPriceList.length; i++) {
                        arrDayPriceList.push(item.dayPriceList[i].price);
						/*// 房间价格总价---原始值
						item.sumPrices = yzl.floatObj.add(item.sumPrices, item.dayPriceList[i].price);
						// 房间价格总价---随时变化
						item.fixedPrice = yzl.floatObj.add(item.fixedPrice, item.dayPriceList[i].price);*/
					};
                    item.sumPrices = yzl.calcuResult(arrDayPriceList);
                    item.fixedPrice = yzl.calcuResult(arrDayPriceList);
					// 统计总费用---入住费用
					_self.orderFeeCount.roomSumPrice = _self.roomSumPrice();
					// 记录roomTypeName
					item.roomTypeName = e.currentTarget.options[e.currentTarget.selectedIndex].text;
				},
				//  新增订单窗口---离店，入住等下拉框 获取roomNo
				getOrderRoomNo: function (roomId, item, event) {
					var e = event || window.event;
					// 记录roomNo
					item.roomNo = e.currentTarget.options[e.currentTarget.selectedIndex].text;
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
					item.fixedPrice = yzl.keepTwoDecimal(total);

					// 统计总费用---入住费用
					_self.orderFeeCount.roomSumPrice = _self.roomSumPrice();
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
						item.fixedPrice = 0;
					} else {
						// 大于两位小数点需要进行截取
						var sNum = item.fixedPrice + '';
						var index = sNum.indexOf('.');
						if (index != -1) {
							var aNum = sNum.split('.')[1];
							if (aNum.length > 2) {
								item.fixedPrice = Number(yzl.keepTwoDecimal(item.fixedPrice));
							};
						};
					};
					// 各个房间价格算法
					var priceRatio = item.fixedPrice/item.sumPrices;
					var removeLastItemSum = 0;

                    var arrDayPriceList = [];
                    for (var i=0; i<item.dayPriceList.length-1; i++) {
                        var aBackupPriceList = item.backupDayPriceList[i].price;
                        // 保留两位小数
                        //item.backupDayPriceList[i].price = yzl.keepTwoDecimal((item.dayPriceList[i].price)*priceRatio);
                        item.dayPriceList[i].price = yzl.keepTwoDecimal(aBackupPriceList*priceRatio);
                        // removeLastItemSum = yzl.floatObj.add(removeLastItemSum, Number(item.dayPriceList[i].price));
                        arrDayPriceList.push(item.dayPriceList[i].price);
                    };
                    removeLastItemSum = yzl.calcuResult(arrDayPriceList);
					//item.backupDayPriceList[item.backupDayPriceList.length-1].price = yzl.keepTwoDecimal(floatObj.subtract(item.fixedPrice, removeLastItemSum));
					item.dayPriceList[item.dayPriceList.length-1].price = yzl.keepTwoDecimal(yzl.calcuResult([item.fixedPrice, -removeLastItemSum]));

					// 统计总费用---入住费用
					_self.orderFeeCount.roomSumPrice = _self.roomSumPrice();
				},
				// 新增订单窗口---房价列表价格---一口价---失焦保持两位小数 如:0002 2 ==> 2.00
				formateNumFixedPrice: function (item) {
					item.fixedPrice = yzl.keepTwoDecimal(item.fixedPrice);
				},
				// 修改订单----房价列表价格---回复默认价格操作
				restoreDefaultsDayPriceList: function (item) {
					var _self = this;
					var total = 0;
					item.dayPriceList = JSON.parse(JSON.stringify(item.backupDayPriceList));

					var arrDayPriceList = [];
					for (var i=0; i<item.dayPriceList.length; i++) {
						// total = yzl.floatObj.add(total, item.dayPriceList[i].price);
                        arrDayPriceList.push(item.dayPriceList[i].price);
					};
                    total = yzl.calcuResult(arrDayPriceList);

					item.fixedPrice = yzl.keepTwoDecimal(total);

					// 统计总费用---入住费用
					_self.orderFeeCount.roomSumPrice = _self.roomSumPrice();
				},
				// 新增订单窗口---获取每个房间原本备份价格
				getBackupPerdayPrice: function (item, index) {
					var _self = this;

					return item.backupDayPriceList[index]['price']
				},
				// 新增订单窗口---关闭整个窗口
				closeAddNewOrderTag: function () {
					var _self = this;

					_self.orderRoomStayList = [];
					_self.orderBillList = [];
					_self.closeAllroomTagsOperate();
					_self.orderCustomerList = [];
					//新增订单----上传附件----清空附件
					_self.clearPreviewUploadImage();
					// 新增订单窗口--清空---渠道类型，预订人等
					_self.clearAddNewOrderInitData();
					// 开启滚动条
					$(document.body).css('overflow', 'visible');
				},
				// 新增订单窗口--清空---渠道类型，预订人等
				clearAddNewOrderInitData: function () {
					var _self = this;
					// 支付类型
					_self.addNewOrders.channelCode = "";
					// 预订人
					_self.addNewOrders.customerName = "";
					// 手机号
					_self.addNewOrders.customerMobile = "";
					// 订单号
					_self.addNewOrders.channelOrderNo = "";
					// 备注
					_self.addNewOrders.remark = "";
					// 服务名称---服务总费用
                    _self.orderFeeCount.payAmount = 0;
                    // 服务名称---
					_self.orderFeeCount.alreadyCollection = 0;
                    // 服务名称---押金总费用
                    _self.orderFeeCount.receivedDeposit = 0;

				},
				// 判断[] > {}  某个元素的值
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
				// 新增订单窗口----点击确定按钮----订单详情按钮
				addneworder_confirm: function (status) {		// blrz ---点击 订单详情按钮
					var _self = this;
					var path = '';
					// 过滤无效字段
					// 入住列表
					_self.addNewOrders.orderRoomStayList = _self.orderRoomStayList;
					// 支付方式
					_self.addNewOrders.orderPaymentList = _self.justyfyListObejct(_self.orderPaymentList, 'payAmount', 0);
					// 服务费用
					_self.addNewOrders.orderBillList = _self.justyfyListObejct(_self.orderBillList, 'amount', 0);
					// 押金
					_self.addNewOrders.orderDepositList = _self.justyfyListObejct(_self.orderDepositList, 'depositAmount', 0);

					if ((_self.addNewOrders.channelCode).trim() == "") {
						yzl.Dialog({
							content : '请选择渠道类型',
							AutoClose: true
						});
						return;
					};
					if ((_self.addNewOrders.customerName).trim() == "") {
						yzl.Dialog({
							content : '预订人不能为空',
							AutoClose: true
						});
						return;
					};
					/*if ((_self.addNewOrders.customerMobile).trim() == "") {
						yzl.Dialog({
							content : '手机号不能为空',
							AutoClose: true
						});
						return;
					};
					if (!yzl.reg.phoneNo.test(_self.addNewOrders.customerMobile)) {
						yzl.Dialog({
							content : '请输入正确手机号码',
							AutoClose: true
						});
						return;
					};*/
                    if ((_self.addNewOrders.customerMobile).trim() != '' && !yzl.reg.phoneNo.test(_self.addNewOrders.customerMobile)) {
                        yzl.Dialog({
                            content : '请输入正确手机号码',
                            AutoClose: true
                        });
                        return;
                    };
					var data = _self.addNewOrders;

					// 确定按钮
					if (status == 'confirm') {
						path = '/order/j/add';
					};
					// 订单详情按钮
					if (status == 'blru') {
						path = '/order/j/checkin';
					};

					_self.addOrderOrCheckIn(data, path);
				},

				// 新增订单---办理入住 或 新增订单确定
				addOrderOrCheckIn: function (data, path, callback) {
					var _self = this;

					yzl.getAjax({
						path : path,
						type : 'post',
						data : data,
                        loadingElem: '#addNewOrdersTag',
                        tips: false,
						sCallback : function (result) {
							if (result.code == "0000") {
								var showDetail = result.data.showDetail;
								var orderId = result.data.orderId;
								// 隐藏新增订单窗口
								$('.addneworder-tag-mask').css('display', 'none');
								// 初始化
								_self.orderRoomStayList = [];
								_self.orderBillList = [];
								// 解除滚动条
								$(document.body).css('overflow', 'visible');
								// 后台返回orderId，说明满足办理入住条件（打开订单详情），否则则不满足（不打开订单详情）
								if(showDetail && 1 == showDetail) {
									_self.openRoomOrderDetails(orderId);
								};
								// after
								_self.initData(_self.getTodayDate);
								// 新增订单----上传附件----清空附件
								_self.clearPreviewUploadImage();
								// 新增订单窗口--清空---渠道类型，预订人等
								_self.clearAddNewOrderInitData();
								// 回调
								callback && callback(_self);
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 新增订单----展示每日房价列表
				showPerdayPriceBox: function (event, dayPriceList) {
					var e = event || window.event;
					if (dayPriceList.length == 0) return;
					$(e.currentTarget).children('.day-prices-list').css('display', 'block');
				},
				// 新增订单----关闭每日房价列表
				hiddenPerdayPriceBox: function (event) {
					var e = event || window.event;
					$(e.currentTarget).children('.day-prices-list').css('display', 'none');
				},
				// 新增订单----添加---服务名称
				addOderBillList: function () {
					var _self = this;
					var orderBill = {
						billTypeCode: '',
						billTypeName: '',
						amount: '',
						remark: '',
                        showBillTypeNameDropDown: false
					};
					_self.orderBillList.push(orderBill);
				},
                // 新增订单----服务名称---选择下拉框
                selectBillTypeNameDropDownItem: function (childItem, parItems) {
					var _self = this;

                    parItems.billTypeName = childItem;
                    parItems.showBillTypeNameDropDown = false;
				},
				// 新增订单----服务名称---focus
                focusBillTypeNameDropDownIpt: function (item) {
					var _self = this;
					_self.hideAllBillTypeNameDropDownList();
                    item.showBillTypeNameDropDown = true;
                    _self.showNewOrderDepositDropDown = false;
				},
				// 新增订单----服务名称---隐藏所有下拉框
				hideAllBillTypeNameDropDownList: function () {
					var _self = this;

                    for(var i=0; i<_self.orderBillList.length; i++) {
                        _self.orderBillList[i].showBillTypeNameDropDown = false;
                    };
				},
				// 新增订单----删除
				removeOderBillList: function (item) {
					var _self = this;
					_self.orderBillList.$remove(item);
					// 新增订单----统计总服务费用
					_self.serviceSumPrice();
				},
				//  新增订单----入住离店，总费用
				roomSumPrice: function () {
					var _self = this;
					var total = 0;
					var arr = [];
					var item = _self.orderRoomStayList;
					for (var i= 0; i<item.length; i++) {
						arr.push(item[i].fixedPrice);
						// total = yzl.floatObj.add(total, item[i].fixedPrice);
					};
                    total = yzl.calcuResult(arr);
					return yzl.keepTwoDecimal(total);
				},
				// 新增订单----统计总服务费用
				serviceSumPrice: function () {
					var _self = this;
					var total = 0;
					var arr = [];
					var item = _self.orderBillList;
					for (var i= 0; i<item.length; i++) {
                        arr.push(item[i].amount);
						// total = yzl.floatObj.add(total, item[i].amount);
					};
                    total = yzl.calcuResult(arr);
					_self.orderFeeCount.payAmount = yzl.keepTwoDecimal(total);
				},
				//  新增订单----统计=需补交款
				getAlreadyCollection: function (account) {
					var _self = this;
					_self.orderFeeCount.alreadyCollection = account;
				},
				//  新增订单----统计已收押金
				getReceivedDeposit: function (account) {
					var _self = this;
					_self.orderFeeCount.receivedDeposit = account;
				},
                // 新增订单---点击押金名称下拉框
                selectNewOrderDepositDropDownItem: function (item) {
                    var _self = this;
                    _self.orderDepositList[0].depositTypeName = item;
                    _self.showNewOrderDepositDropDown = false;
                },
				// 新增订单---点击窗口隐藏押金名称下拉框
                hideNewOrderDepositDropDownFun: function () {
                    var _self = this;
                    _self.showNewOrderDepositDropDown = false;

                   	_self.hideAllBillTypeNameDropDownList();
				},
                focusNewOrderDepositDropDownInpt: function () {
                    var _self = this;
                    _self.showNewOrderDepositDropDown = true;
					_self.hideAllBillTypeNameDropDownList();
				},
                stopPropagationFun: function () {
                    console.log('阻止冒泡');
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
									//_self.uploadImgId = result.data.imageId;
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
				// 新增订单----上传附件----支付类型附件
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
				//  查看---新增订单---所有---上传附件
				previewUploadImage: function (url) {
					yzl.contentVue.previewUploadImage(url);
				},
				// 新增订单----上传附件----清空附件
				clearPreviewUploadImage: function () {
					var _self = this;
					_self.uploadChannelOrderImageUrl = null;
					_self.uploadOrderPaymentImageUrl = null;
				},
				// 房间时间列表---点击房间，停用操作
				clickRoom_shutDownRoom: function (data) {
					var _self = this;

					yzl.getAjax({
						path : 'room/j/closeRoom',
						type : 'post',
						data : data,
                        loadingElem: '#closeRoomTagBox',
                        tips: false,
                        loadingTop: 94,
						sCallback : function (result) {
							if (result.code == "0000") {
								// 房态房间----关闭并清除所有 背景  弹窗
								_self.romove_tips_tag();

								_self.saveCloseRoomInfo.closeRemark = "";
								_self.closeroomTagOperate();
								_self.initData(_self.getTodayDate);
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 房间时间列表---点击 关房 窗口
				closeroomTagOperate: function () {
					var _self = this;
					_self.saveCloseRoomInfo.closeRemark = "";
					$('.closeroom-tag-mask').css('display', 'none');
					// 开启滚动条
					$(document.body).css('overflow', 'visible');
				},
				// 关闭所有窗口: 新增订单，订单详情,修改订单，遮罩层窗口
				closeAllroomTagsOperate: function () {
					var _self = this;
					_self.addneworderTitle = '新增订单';

					$('.addneworder-tag-mask, #addneworder_tag_content, #show_order_box, #modefy_order_details').css('display', 'none');
					$('.show-order-cancell-tag-mask, .show-order-receivables-tag-mask, .show-order-deposit-tag-mask').css('display', 'none');
				},
				//---------发送动态密码弹窗------------
				//打开动态密码弹窗
				showSendOTPWindow:function(e){
					var _self = this;
					_self.sendOTPList = {
						hotelId:yzl.hotelId,
						roomId:'',
						keyCodeType:'',
						num:'',
						mobile:'',
						userName:'',
						assignReason:''
					};
					_self.sendOTPStatus = 1;
					_self.sendOTPTagStatus=1;
					$('.sendOTP-tag span').eq(0).addClass('active').siblings().removeClass('active');
					$('#timeBtn').prop("checked",true);
					_self.sendOTPList.roomId = e.roomId;
					$('.sendOTP-tag-ulTime span').eq(0).addClass('active').siblings().removeClass('active');
					$('.sendOTP-tag-mask').css('display','block');
					// 禁止滚动条
					$(document.body).css('overflow', 'hidden');
				},
				//关闭动态密码弹窗
				closeSendOTOSTagOperate:function(){
					$('.sendOTP-tag-mask').css('display','none');
					// 解除滚动条
					$(document.body).css('overflow', 'visible');
				},
				//次数和时间切换状态
				changeSendOTOStatusToTime:function(){
					var _self = this; 
					if(_self.sendOTPStatus == 1 ){
						return ;
					}else{
						_self.sendOTPStatus=1;
						$('.sendOTP-tag-ulTime span').eq(0).addClass('active').siblings().removeClass('active');
					}
				},
				changeSendOTOStatusToOnce:function(){
					var _self = this;
					if(_self.sendOTPStatus == 2 ){
						return ;
					}else{
						_self.sendOTPStatus=2;
						$('.sendOTP-tag-ulOnce span').eq(0).addClass('active').siblings().removeClass('active');
					}
				},
				//信息和记录切换
				changeTagStatusInfo:function(){
					var _self = this; 
					if(_self.sendOTPTagStatus == 1 ){
						return ;
					}else{
						_self.sendOTPStatus=1;
						$('#timeBtn').prop("checked",true);
						$('.sendOTP-tag-ulTime span').eq(0).addClass('active').siblings().removeClass('active');
						_self.sendOTPTagStatus=1;
						$('.sendOTP-tag span').eq(0).addClass('active').siblings().removeClass('active');
					}
				},
				changeTagStatusRecord:function(){
					var _self = this; 
					if(_self.sendOTPTagStatus == 2 ){
						return ;
					}else{
						_self.sendOTPRecordNum = 1;
						yzl.getAjax({
							path : 'roomLock/j/getKeyCodeAssignList',
							type : 'post',
							data : {
								hotelId:yzl.hotelId,
								pageNum:_self.sendOTPRecordNum,
								roomId:_self.sendOTPList.roomId
							},
							sCallback : function (result) {
								if(result.code == '0000'){
									_self.sendOTPRecordList = result.data.list;
									if(result.data.total>10){
										_self.swiftLoadingStatus = true;
										_self.hideLoadingStatus = true;
									};
									_self.sendOTPTagStatus=2;
									$('.sendOTP-tag span').eq(1).addClass('active').siblings().removeClass('active');	
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
				//发送记录加载更多
				sendOTPRecordLoadMore:function(){
					var _self = this;
					_self.swiftLoadingStatus = false;
					_self.sendOTPRecordNum += 1;
					yzl.getAjax({
						path : 'roomLock/j/getKeyCodeAssignList',
						type : 'post',
						data : {
							hotelId:yzl.hotelId,
							pageNum:_self.sendOTPRecordNum,
							roomId:_self.sendOTPList.roomId
						},
						sCallback : function (result) {
							if(result.code == '0000'){
								_self.sendOTPRecordList = _.union(_self.sendOTPRecordList,result.data.list);
								_self.swiftLoadingStatus = true;
								if(result.data.total > _self.sendOTPRecordNum*10){
									return;
								}else{
									_self.hideLoadingStatus = false;
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
				//点击添加选中状态
				LabelChangeActive:function(e){
					$(e.target).addClass('active').siblings().removeClass('active');
				},
				//点击确定提交信息
				sendOTPSubmit:function(){
					var _self = this;
					var data = _self.sendOTPList;
					var mobileRe = /^1\d{10}$/;
					data.keyCodeType = $('.sendOTP-tag-checkLabel input:checked').val();
					if(data.keyCodeType == 4){
						data.num = $('.sendOTP-tag-ulTime .active').attr('name');
					}else if(data.keyCodeType == 6){
						data.num = $('.sendOTP-tag-ulOnce .active').attr('name');
					};
					if(_self.sendOTPList.mobile == ''){
						yzl.Dialog({
							content : '手机号码不能为空！',
							AutoClose: true
						});
						return false;
					}else if(!mobileRe.test(_self.sendOTPList.mobile)){
						yzl.Dialog({
							content : '手机号码格式不正确！',
							AutoClose: true
						});
						return false;
					}else if(_self.sendOTPList.userName == ''){
						yzl.Dialog({
							content : '姓名不能为空！',
							AutoClose: true
						});
						return false;
					}else if(_self.sendOTPList.assignReason == ''){
						yzl.Dialog({
							content : '备注不能为空！',
							AutoClose: true
						});
						return false;
					}
					yzl.getAjax({
						path : 'roomLock/j/keyCodeAssign',
						type : 'post',
						data : data,
						sCallback : function (result) {
							if(result.code == '0000'){
								$('.sendOTP-tag-mask').css('display','none');		
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					})
				},
				// 是否显示页面刷新按钮--初始化
				initRefreshBtn: function () {
					var _self = this;
					var isShowReload = ('WebSocket' in window) || ('MozWebSocket' in window);

					if (!isShowReload) {
						_self.isShowReloadBtn = true;
					};

					$(window).scroll(function () {
						if ($(this).scrollTop() > 200) {
							_self.isShowBackToTopBtn = true;
						} else {
							_self.isShowBackToTopBtn = false;
						};
					});
				},
				// 点击刷新按钮 ---刷新页面
				reloadPageData: function () {
					var _self = this;
					_self.initData(_self.getTodayDate);
				},
				// 回到顶部代码绑定
				backToTopOperate: function () {
					var timer = null;
					var scrTop = $(window).scrollTop();
					timer = setInterval(function () {
						if (scrTop > 0) {
							scrTop -= 80;
							if (scrTop <= 0) {
								scrTop = 0;
								clearInterval(timer)
							};
							$(window).scrollTop(scrTop);
						};
					}, 30);
				}
	        }
	    });
	
	    roomStatusVue.initEvent();

		// 订单详情修改后，需要刷新roomStatusVue的initData
		yzl.contentVue.initPageData = roomStatusVue.initData;

        roomStatusVue.$watch('getTodayDate', function (newVal, oldVal) {
            yzl.contentVue.getTodayDate = newVal;
        });

        // 监控----新增订单----应收款变化
        roomStatusVue.$watch('orderFeeCount.roomSumPrice', function (newVal, oldVal) {
            var _self = this;
            var total = 0;
            var arr = [newVal, _self.orderFeeCount.payAmount];

            total = yzl.calcuResult(arr);
            // _self.getAccountReceivable = yzl.keepTwoDecimal(yzl.floatObj.add(newVal, _self.orderFeeCount.payAmount))
            _self.getAccountReceivable = yzl.keepTwoDecimal(total);

        });

        roomStatusVue.$watch('orderFeeCount.payAmount', function (newVal, oldVal) {
            var _self = this;
            var total = 0;
            var arr = [_self.orderFeeCount.roomSumPrice, newVal];

            total = yzl.calcuResult(arr);
            // _self.getAccountReceivable = yzl.keepTwoDecimal(yzl.floatObj.add(_self.orderFeeCount.roomSumPrice, newVal));
            _self.getAccountReceivable = yzl.keepTwoDecimal(total);
        });

        // 监控----新增订单----已收款变化
        roomStatusVue.$watch('orderFeeCount.alreadyCollection', function (newVal, oldVal) {
            var _self = this;
            _self.calcuAlreadyCollection = yzl.keepTwoDecimal(newVal);
        });
        // 监控----新增订单----需补交款统计
        roomStatusVue.$watch('orderFeeCount.roomSumPrice', function (newVal, oldVal) {
            var _self = this;
            var total = 0;
            var arr = [newVal, _self.orderFeeCount.payAmount, -(_self.orderFeeCount.alreadyCollection)];

            total = yzl.calcuResult(arr);
            _self.haveToPayCollection = yzl.keepTwoDecimal(total);
            // var firstStep = yzl.floatObj.add(newVal, _self.orderFeeCount.payAmount);
            // _self.haveToPayCollection = yzl.keepTwoDecimal(yzl.floatObj.subtract(firstStep, _self.orderFeeCount.alreadyCollection));
        });

        roomStatusVue.$watch('orderFeeCount.payAmount', function (newVal, oldVal) {
            var _self = this;
            var total = 0;
            var arr = [_self.orderFeeCount.roomSumPrice, newVal, -(_self.orderFeeCount.alreadyCollection)];

            total = yzl.calcuResult(arr);
            _self.haveToPayCollection = yzl.keepTwoDecimal(total);
            // var firstStep = yzl.floatObj.add(newVal, _self.orderFeeCount.payAmount);
            // _self.haveToPayCollection = yzl.keepTwoDecimal(yzl.floatObj.subtract(firstStep, _self.orderFeeCount.alreadyCollection));
        });

        roomStatusVue.$watch('orderFeeCount.alreadyCollection', function (newVal, oldVal) {
            var _self = this;
            var total = 0;
            var arr = [_self.orderFeeCount.roomSumPrice, _self.orderFeeCount.payAmount, -(newVal)];

            total = yzl.calcuResult(arr);
            _self.haveToPayCollection = yzl.keepTwoDecimal(total);
            // var firstStep = yzl.floatObj.add(_self.orderFeeCount.roomSumPrice, _self.orderFeeCount.payAmount);
            // _self.haveToPayCollection = yzl.keepTwoDecimal(yzl.floatObj.subtract(firstStep, newVal));
        });
        // 监控----新增订单---已收押金统计
        roomStatusVue.$watch('orderFeeCount.receivedDeposit', function (newVal, oldVal) {
            var _self = this;
            _self.calReceivedDeposit = yzl.keepTwoDecimal(newVal);
        });

	})(window, document, jQuery, yzlObj);
	
})






