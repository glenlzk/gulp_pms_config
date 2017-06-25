$(function () {
	;(function (window, document, $, yzl) {

		var navigationVue = new Vue({
			el : '#navigationLayot',
			data: {
				// 分页参数
				cur: 1,
				all: 0,
				msg: '',
				pageup: 8,
				pagedown: 8,
				total:0,
				roomNavList:[],
				// 上次插件初始化-----init
                'vueUploadfyBtn': 'vueUploadfyBtn',
                'uploadParam': {
                    url: '/yzlpms/img/j/uploadRoomGuideImage',
                    data: {
                        hotelId: yzl.hotelId
                    },
                    btnText: '上传图片',
                    isShow: true,
                    width: '100%',
                    height: '100%',
                    parObj: {
                        width: '100%',
                        height: '100%'
					}
                },
                'backImgeInfor': {},
				// 上次插件初始化-----end
				//addRoomGuideInfo:{},
				// 导航---获取可选择房间列表 和 获取已选择房间列表---添加或删除操作
				operateType: '',
				// 默认是新增房间导航
				addNewRoomNavSubmitStatus: true,
				// 导航---保存新增操作信息
				saveAddroomGuideInfor: {
					hotelId: yzl.hotelId,
					roomGuideId: '',
					imageIds: [],
					// 用户可更改
					addressDetailBmap: '',
					// 以下是保存百度地图的信息
					latBmap: '',
					lngBmap: '',
					// 用户不可更改---百度提供
					addressBmap: ''
				},
				// 导航---用户在地图上的信息操作备份----百度提供的信息
				saveCustomerOprateRoomGuideInfor: {
					latBmap: '',
					lngBmap: '',
					addressBmap: ''
				},
				// 导航---记录地图缩放级别
				saveZoom: '',
				// 导航---保存上传图片
				saveImgUrlList: [],
				// 图片预览对象
				newViewer: null,
				// check-box初始化--编辑房间--start
	            saveRoomsList: [],
	            backUpRoomNumList: [],	// 非必须
	            roomNumList:[],
	            roomSelectAll: {
	                id: 'roomSelectAllBtn'		// 如果有全选按钮，必须传id
	            },
	            checkBoxCss: {
	                all: {
	                    'float': 'right'
	                },
	                listbox: {
                        'padding': '8px',
                        'width': '100%',
                        'overflow-y': 'auto',
                        'height': '300px'
	                },
	                perbox: {
	                    'width': '25%',
	                    'float': 'left',
	                    'padding': '5px'
	                }
	            },
	            // check-box初始化--编辑房间--end

			},
			// 分页跳转监听
			watch: {
				cur: function (newVal, oldVal) {
					var _self = this;

					_self.initData(newVal);
				},
				// 上传图片成功后，赋值
                backImgeInfor: function (newVal) {
					var _self = this;

                    _self.saveAddroomGuideInfor.imageIds.push(newVal.imageId);
                    _self.saveImgUrlList.push(newVal.imageUrl);

                    // 是否初始化----v-uploadify插件
					_self.initVuploadify(_self.saveImgUrlList);
				}
			},
			// 引入分页组件
			components:{
				'vue-nav': paginationVue,
                'v-uploadify': yzlObj.uploadifyVue,
                'icheck-box': yzlObj.multiCheckboxVue
			},
			methods: {
				// 分页点击监听事件----不能省略否则会报错
				listen: function () {

				},
				// 是否初始化----v-uploadify插件
				initVuploadify: function (arr) {
					var _self = this;
                    // 是否隐藏----上传图片按钮
                    if (arr.length >= 5) {
                        _self.uploadParam.isShow = false;
                    } else {
                        _self.uploadParam.isShow = true;
                    };
				},
				// 初始化事件
				initEvent: function () {
					this.initData();
				},
				// 导航---初始化数据
				initData: function (cur) {
					var _self = this;
					var data = {
						hotelId: yzl.hotelId,
						pageSize: 15,
						pageNum: cur || 1
					}
					yzl.getAjax({
						path : 'roomGuide/j/page',
						type : 'post',
						data : data,
                        fadeInElem: '#navigationLayot',
                        loadingElem: '#mianContent',
                        tips: false,
                        loadingTop: 120,
						sCallback : function (result) {
							if (result.code == "0000") {
								_self.roomNavList = result.data.list;
								if (_self.roomNavList.length == 0) {
	                                yzl.noDataTips ({
	                                    top: 70,
	                                    content: '您还未添加导航信息',
	                                    parElem: '#roomNavList'
	                                });
								}else {
									yzl.removeNoDataElems();
								};
								_self.all = result.data.pages;
								_self.total = result.data.total;
								// 初始化---上传插件
								/*Vue.nextTick(function () {
									_self.uploadGuideRoomImage('guideRoomUploadImgsBtn');
								});*/
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					})
				},
				//导航 --- 新增房间导航
				/*AddNewRoomNav:function(){
					var _self = this;

					// 切换为新增房间导航
					_self.addNewRoomNavSubmitStatus = true;
					var _self = this;
					$('.NavigationMap-mask').css('display','block');
					// 百度地图API功能
					function G(id) {
						return document.getElementById(id);
					}
					// 初始化地图		enableMapClick:false 禁止地图点击事件----屏蔽消息弹窗
					var map = new BMap.Map("l-map",{enableMapClick:false});
					// 初始化地图---设置城市和地图级别
					var point = new BMap.Point(116.331398,39.897445);
					map.centerAndZoom(point,12);
					// 地图上marker
					var marker = null;

					// 逆解析地址: 经纬度 解析为 具体地址和位置
					var geoc = new BMap.Geocoder();

					// 如果经纬度不存在---则定位当前城市地址
					if (_self.saveAddroomGuideInfor.latBmap == '' && _self.saveAddroomGuideInfor.lngBmap == '') {
						function myFun(result){
							var cityName = result.name;
							map.setCenter(cityName);
						}
						var myCity = new BMap.LocalCity();
						myCity.get(myFun);
					} else {
						// 如果经纬度存在---根据经纬度标记marker位置
						function resetMarker() {
							/!* 以下经纬度顺序不能倒，否则会出错
							 lng纬度 39.897445
							 lat经度	116.331398

							 new BMap.Point(116.331398,39.897445)  返回经纬度对象：{lng: 114.045481, lat: 22.626591}
							 *!/
							var pp = new BMap.Point(_self.saveAddroomGuideInfor.lngBmap, _self.saveAddroomGuideInfor.latBmap);
							setMarker(pp);
						};

						// 地图上智能搜索
						var newLocal = new BMap.LocalSearch(map, {
							onSearchComplete: resetMarker
						});
						// 根据地址去搜索具体位置
						newLocal.search(_self.saveAddroomGuideInfor.addressBmap);
					};


					//开启鼠标滚轮缩放
					map.enableScrollWheelZoom(true);
					//建立一个自动完成的对象
					var ac = new BMap.Autocomplete(
						{"input" : "suggestId"
							,"location" : map
						});

					var myValue;
					// 鼠标点击下拉列表后的事件
					ac.addEventListener("onconfirm", function(e) {
						var _value = e.item.value;
						_self.saveAddroomGuideInfor.addressBmap = myValue =  _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
						setPlace();
					});
					// 地图上查找位置，并设置marker
					function setPlace() {
						// 清除地图上所有覆盖物
						map.clearOverlays();
						function myFun(){
							// 获取第一个智能搜索的结果
							var pp = local.getResults().getPoi(0).point;

							_self.saveAddroomGuideInfor.latBmap = pp.lat;
							_self.saveAddroomGuideInfor.lngBmap = pp.lng;

							setMarker(pp);
						}
						// 地图上智能搜索
						var local = new BMap.LocalSearch(map, {
							onSearchComplete: myFun
						});
						local.search(myValue);
					}
					// 根据经纬度---设置地图上的marker
					function setMarker(pp) {
						map.centerAndZoom(pp, 19);
						// 创建标注
						marker = new BMap.Marker(pp);
						//添加标注
						map.addOverlay(marker);
						// 开启标注拖拽功能
						marker.enableDragging();
						// 标注点移动-----松开鼠标事件
						marker.addEventListener("dragend", function(){
							//获取marker的位置-----------获取经纬度
							var p = marker.getPosition();
							// 根据marker的获取marker标注位经纬度------获取具体详细地址
							geoc.getLocation(p, function(rs) {
								//console.log(rs);
								_self.saveAddroomGuideInfor.addressBmap = rs.address;
								_self.saveAddroomGuideInfor.latBmap = rs.point.lat;
								_self.saveAddroomGuideInfor.lngBmap = rs.point.lng;
							});
						});
					};
				},*/
				// 导航---新增房间导航
				AddNewRoomNavOperate: function () {
					var _self = this;

					// 切换为新增房间导航
					_self.addNewRoomNavSubmitStatus = true;
					// 打开地图导航窗口
					$('.NavigationMap-mask').css('display','block');
					// 初始化地图导航
					_self.AddNewRoomNav();
				},
				// 导航---调用地图导航
				AddNewRoomNav:function() {
					var _self = this;

					// 百度地图API功能
					function G(id) {
						return document.getElementById(id);
					}
					// 初始化地图		enableMapClick:false 禁止地图点击事件----屏蔽消息弹窗
					var map = new BMap.Map("l-map",{enableMapClick:false});
					// 地图上marker
					var marker = null;

					// 逆解析地址: 经纬度 解析为 具体地址和位置
					var geoc = new BMap.Geocoder();

					// 如果经纬度不存在---则定位当前城市地址
					if (_self.saveAddroomGuideInfor.latBmap == '' && _self.saveAddroomGuideInfor.lngBmap == '') {
						function myFun(result){
							var cityName = result.name;
							var zoom = _self.saveZoom || 12;
							map.centerAndZoom(cityName,zoom);
						};
						var myCity = new BMap.LocalCity();
						myCity.get(myFun);
					} else {
						// 修改初始化
						_self.saveCustomerOprateRoomGuideInfor.addressBmap = _self.saveAddroomGuideInfor.addressBmap;
						_self.saveCustomerOprateRoomGuideInfor.latBmap = _self.saveAddroomGuideInfor.latBmap;
						_self.saveCustomerOprateRoomGuideInfor.lngBmap = _self.saveAddroomGuideInfor.lngBmap;
						// 如果经纬度存在---根据经纬度标记marker位置
						function resetMarker() {
							/* 以下经纬度顺序不能倒，否则会出错
							 lng纬度 39.897445
							 lat经度	116.331398

							 new BMap.Point(116.331398,39.897445)  返回经纬度对象：{lng: 114.045481, lat: 22.626591}
							 */
							// 清除marker
							map.removeOverlay(marker);
							var pp = new BMap.Point(_self.saveAddroomGuideInfor.lngBmap, _self.saveAddroomGuideInfor.latBmap);
							setMarker(pp);
						};

						// 地图上智能搜索
						var newLocal = new BMap.LocalSearch(map, {
							onSearchComplete: resetMarker
						});
						// 根据地址去搜索具体位置
						newLocal.search(_self.saveAddroomGuideInfor.addressBmap);
					};

					//开启鼠标滚轮缩放
					map.enableScrollWheelZoom(true);
					//建立一个自动完成的对象
					var ac = new BMap.Autocomplete(
						{"input" : "suggestId"
							,"location" : map
						});

					var myValue;
					// 鼠标点击下拉列表后的事件
					ac.addEventListener("onconfirm", function(e) {
						var _value = e.item.value;
						_self.saveCustomerOprateRoomGuideInfor.addressBmap = myValue =  _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
						setPlace();
					});
					// 地图上查找位置，并设置marker
					function setPlace() {
						// 清除地图上所有覆盖物
						map.clearOverlays();
						function myFun(){
							// 获取第一个智能搜索的结果
							var pp = local.getResults().getPoi(0).point;

							_self.saveCustomerOprateRoomGuideInfor.latBmap = pp.lat;
							_self.saveCustomerOprateRoomGuideInfor.lngBmap = pp.lng;

							setMarker(pp);
						}
						// 地图上智能搜索
						var local = new BMap.LocalSearch(map, {
							onSearchComplete: myFun
						});
						local.search(myValue);
					}
					// 根据经纬度---设置地图上的marker
					function setMarker(pp) {
						var zoom = _self.saveZoom || 18;
						map.centerAndZoom(pp, zoom);
						// 获取缩放级别
						// console.log(map.getZoom());
						// 创建标注
						marker = new BMap.Marker(pp);
						//添加标注
						map.addOverlay(marker);
						// 开启标注拖拽功能
						marker.enableDragging();
						// 标注点移动-----松开鼠标事件
						marker.addEventListener("dragend", function(){
							//获取marker的位置-----------获取经纬度
							var p = marker.getPosition();
							// 根据marker的获取marker标注位经纬度------获取具体详细地址
							geoc.getLocation(p, function(rs) {
								//console.log(rs);
								_self.saveCustomerOprateRoomGuideInfor.addressBmap = rs.address;
								_self.saveCustomerOprateRoomGuideInfor.latBmap = rs.point.lat;
								_self.saveCustomerOprateRoomGuideInfor.lngBmap = rs.point.lng;
							});
						});
					};
					// 每次缩放结束后，记录缩放级别
					// 设置缩放级别map.setZoom(zoom: Number)
					map.addEventListener('zoomend', function (type, target) {
						_self.saveZoom = map.getZoom();
					});
				},
				// 导航--- 关闭--添加地址窗口
				closeAddNewRoomNavTag: function () {
					var _self = this;
					// 清除相关数据
					_self.clearAddNewRoomNavInfor();
					// 清除记录的地图缩放级别
					_self.saveZoom = '';
					$('.addNewRoomNav-mask').css('display','none');
				},
				// 导航---添加地址----清除所有信息
				clearAddNewRoomNavInfor : function () {
					var _self = this;
					_self.saveImgUrlList = [];
					_self.saveAddroomGuideInfor.imageIds = [];
					_self.saveAddroomGuideInfor.roomGuideId = '';
					_self.saveAddroomGuideInfor.addressDetailBmap = '';
					_self.saveAddroomGuideInfor.latBmap = '';
					_self.saveAddroomGuideInfor.lngBmap = '';
					_self.saveAddroomGuideInfor.addressBmap = '';
				},
				//导航 --- 新增房间导航信息提交
				AddNewRoomNavSubmit: function() {
					var _self = this;
					var data = _self.saveAddroomGuideInfor;

					if (_self.addNewRoomNavSubmitStatus == true) {
						var path = 'roomGuide/j/add';
					} else {
						var path = '/roomGuide/j/update';
					};

					yzl.getAjax({
						path : path,
						type : 'post',
						data : data,
						sCallback : function (result) {
							if (result.code == "0000") {
								_self.initData();
								_self.clearAddNewRoomNavInfor();
								// 清除记录的地图缩放级别
								_self.saveZoom = '';
								$('.addNewRoomNav-mask').css('display','none');
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 导航 --- 添加地址窗口---删除即将要上传的图片
				removeImgUrlList: function (item, index) {
					var _self = this;
					_self.saveAddroomGuideInfor.imageIds.$remove(_self.saveAddroomGuideInfor.imageIds[index]);
					_self.saveImgUrlList.$remove(item);

                    // 是否初始化----v-uploadify插件
                    _self.initVuploadify(_self.saveAddroomGuideInfor.imageIds);
				},
				//导航 --- 打开设置导航窗口
				showNavMapWindow:function() {
					var _self = this;
					$('.NavigationMap-mask').css('display','block');

					// 初始化地图导航
					_self.AddNewRoomNav();
				},
				// 导航--地图窗口---确定按钮---获取地图定位信息
				getLocationInfor: function () {
					var _self = this;

					if (_self.saveCustomerOprateRoomGuideInfor.addressBmap == "") {
						yzl.Dialog({
							content : '请搜索标注地图位置',
							AutoClose: true
						});
						return;
					};
					_self.saveAddroomGuideInfor.addressDetailBmap = _self.saveCustomerOprateRoomGuideInfor.addressBmap;
					_self.saveAddroomGuideInfor.addressBmap = _self.saveCustomerOprateRoomGuideInfor.addressBmap;
					_self.saveAddroomGuideInfor.latBmap = _self.saveCustomerOprateRoomGuideInfor.latBmap;
					_self.saveAddroomGuideInfor.lngBmap = _self.saveCustomerOprateRoomGuideInfor.lngBmap;

					_self.saveCustomerOprateRoomGuideInfor.addressBmap = '';
					// 关闭窗口
					$('.NavigationMap-mask').css('display', 'none');
					// 新增窗口
					$('.addNewRoomNav-mask').css('display','block');
				},
				//导航--地图窗口---关闭按钮
				closeBmapTag: function () {
					var _self = this;

					// 关闭窗口
					$('.NavigationMap-mask').css('display','none');
					_self.saveCustomerOprateRoomGuideInfor.addressBmap = '';
				},
				// 导航--添加地址窗口---上传图片按钮
				// 新增订单----上传附件----支付类型附件
				/*uploadGuideRoomImage: function (id) {
					var _self = this;

					yzl.InitUploadify({
						id: id,												// 上传按钮id
						url: '/yzlpms/img/j/uploadRoomGuideImage',						// 上传服务器地址
						data: {
							hotelId: yzl.hotelId
						},
						method:'get',
						buttonText:'上传图片',
						sCallback: function (data) {
							var result = JSON.parse(data);
							if (result.code == "0000") {
								_self.saveAddroomGuideInfor.imageIds.push(result.data.imageId);
								_self.saveImgUrlList.push(result.data.imageUrl);
							};
						}
					});
				},*/
				// 导航----上传图片预览
				/*previewUploadedImage: function (item) {
					var _self = this;
					if (yzl.contentVue.newViewer) {
						$('.viewer-container').remove();
						// 初始化---图片预览器
						yzl.contentVue.newViewer.destroy();
					};

					yzl.contentVue.previewImageList = [];
					if (item.imageList.length == 0) return;
					for (var i=0; i<item.imageList.length; i++) {
						yzl.contentVue.previewImageList.push(item.imageList[i].imageUrl);
					};
					Vue.nextTick(function () {
						// 实例化 viewer插件
						yzl.contentVue.newViewer = new Viewer(document.getElementById('roomStatusPreviewPic'), {
							url: 'data-original',
							// 隐藏显示缩略图导航
							navbar: true,
							// 隐藏工具栏
							toolbar: true
						});

						// 打开预览图片器
						for (var j=yzl.contentVue.previewImageList.length; j>0; j--) {
							$('#previewOneImage_' + (j-1)).click();
						};
					});
				},*/
                // 导航----上传图片预览
                previewUploadedImage: function (item) {
                    var _self = this;
					var imgList = [];
                    if (item.imageList.length == 0) return;


                    for (var i=0; i<item.imageList.length; i++) {
                        imgList.push(item.imageList[i].imageUrl);
                    };

                    yzl.contentVue.previewImagesList = imgList;
                },
				//导航---获取可选择房间列表 和 获取已选择房间列表
				editNavRooms:function(item, type){
					var _self = this;
					// 保存指定地址下的房间列表---用于对其添加删除操作
					_self.saveRoomNavListItem = item;

                    $('.EditRoomWindow-mask').css('display','block');

					// 获取可选择房间列表
					if (type == 'add') {
						_self.operateType = type;
						var path = 'roomGuide/j/getOptionalRoomList';
						var data = {
							hotelId: yzl.hotelId
						};
					} else {
						// 获取已选择房间列表
						_self.operateType = type;
						var path = 'roomGuide/j/getSelectedRoomList';
						var data = {
							hotelId: yzl.hotelId,
							roomGuideId:item.roomGuideId
						};
					};

					yzl.getAjax({
						path : path,
						type : 'post',
						data : data,
						loadingElem: '#EditRoomWindowTag',
	                    tips: false,
	                    loadingTop: 100,
						sCallback : function (result) {
							if (result.code == "0000") {
								//_self.roomNumList = result.data.roomList;
								_self.backUpRoomNumList = result.data.roomList;
                            	_self.roomNumList = _self.transforRoomListData(result.data.roomList, 'roomguide_');
								// 全选 和 取消全选按钮
								//_self.EditRoomWindowCheckAllListen();
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 格式化插件---checkbox list
				transforRoomListData: function (arr, perElemId, isChecked) {
					var outputArr = [];
	                isChecked = isChecked || false;
	
					if (!(arr instanceof Array)) return [];
	
					for (var i=0; i<arr.length; i++) {
						var obj = {
	                        id: perElemId + arr[i].roomId,
	                        value: arr[i].roomId,
	                        checked: isChecked,
	                        zh_cn: arr[i].roomNo
						};
	                    outputArr.push(obj);
					};
	
					return outputArr;
				},
				// 导航---添加 或 删除 房间列表
				submitAddOrDelRoomsList: function () {
					var _self = this;

//					$('.EditRoomWindow-content input').each(function (index, elem) {
//						if ($(elem).is(':checked')) {
//							var id = $(elem).attr('id').split('_')[1];
//							var list = {
//								roomId: id,
//								roomNo: $(elem).val()
//							};
//							_self.saveRoomsList.push(list);
//						};
//					});
					// 添加操作
					if (_self.operateType == 'add') {
						var path = 'roomGuide/j/addRoom';
					} else {
						// 删除操作
						var path = 'roomGuide/j/deleteRoom';
					};
					var roomList = [];
					for (var i=0; i<_self.saveRoomsList.length; i++) {
						var rlist = _self.saveRoomsList[i];
						for (var j=0; j<_self.backUpRoomNumList.length; j++) {
							var blist = _self.backUpRoomNumList[j].roomId;
							if (rlist == blist) {
	                            roomList.push(_self.backUpRoomNumList[j]);
							};
						};
					};
	
					var data = {
						hotelId: yzl.hotelId,
						roomGuideId:_self.saveRoomNavListItem.roomGuideId,
						roomList: roomList
					};
					yzl.getAjax({
						path : path,
						type : 'post',
						data : data,
						loadingElem: '#EditRoomWindowTag',
	                    tips: false,
	                    loadingTop: 100,
						sCallback : function (result) {
							if (result.code == "0000") {
								_self.saveRoomsList = [];
								$('.EditRoomWindow-mask').css('display','none');
								_self.initData();
								//$('#editRoomsSwiftSelectOperat').html('全选');
							} else {
								yzl.Dialog({
									content : result.msg,
									AutoClose: true
								});
							};
						}
					});
				},
				// 导航---关闭 编辑房间 窗口
				closeEditRoomWindow: function () {
					var _self = this;
					$('.EditRoomWindow-mask').css('display','none');
//					$('#editRoomsSwiftSelectOperat').html('全选');
                    /*_self.roomNumList = [];
                    _self.saveRoomsList = [];*/
                    _self.$broadcast('unSelectAll');
				},
				//导航---编辑房间全选功能
//				EditRoomWindowCheckAll:function(e){
//					if($(e.target).html() == '全选'){
//						$.each($('.EditRoomWindow-content input'), function() {
//							$(this).prop('checked',true);
//						});
//						$(e.target).html('取消全选')
//					}else{
//						$.each($('.EditRoomWindow-content input'), function() {
//							$(this).prop('checked',false);
//						});
//						$(e.target).html('全选')
//					}
//				},
				//导航---全选监听
//				EditRoomWindowCheckAllListen:function(){
//					$.each($('.EditRoomWindow-content input'),function(){
//						if(!$(this).is(':checked')){
//							$('.EditRoomWindow-content button').html('全选');
//							return false;
//						};
//						$('.EditRoomWindow-content button').html('取消全选');
//					});
//				},
				//导航---删除房间导航
				delRoomNav:function(item){
					var _self = this;
					yzl.Dialog({
						content : '是否确认删除',
						AutoClose: false,
						callback : function(callback){
							var data = {
								roomGuideId:item.roomGuideId,
								hotelId: yzl.hotelId
							};
							if(callback == true){
								yzl.getAjax({
									path : 'roomGuide/j/delete',
									type : 'post',
									data : data,
									sCallback : function (result) {
										if (result.code == "0000") {
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
				// 导航---修改房间导航---信息
				modefyRoomNav: function (item) {
					var _self = this;
					var data = {
						hotelId: yzl.hotelId,
						roomGuideId:item.roomGuideId
					};
					$('.addNewRoomNav-mask').css('display','block');
					
					yzl.getAjax({
						path : '/roomGuide/j/get',
						type : 'post',
						data : data,
						loadingElem: '#addNewRoomNavTag',
	                    tips: false,
	                    loadingTop: 100,
						sCallback : function (result) {
							if (result.code == "0000") {
								_self.saveAddroomGuideInfor.addressDetailBmap = result.data.addressDetailBmap;
								_self.saveAddroomGuideInfor.addressBmap = result.data.addressBmap;
								_self.saveAddroomGuideInfor.latBmap = result.data.latBmap;
								_self.saveAddroomGuideInfor.lngBmap = result.data.lngBmap;
								_self.saveAddroomGuideInfor.roomGuideId = item.roomGuideId;
								_self.saveAddroomGuideInfor.imageIds = [];
								_self.saveImgUrlList = [];
								for (var i=0; i<result.data.imageList.length; i++) {
									_self.saveAddroomGuideInfor.imageIds.push(result.data.imageList[i].imageId);
									_self.saveImgUrlList.push(result.data.imageList[i].imageUrl);
								};

								// 是否隐藏----上传图片按钮
								if (result.data.imageList.length >= 5) {
									_self.uploadParam.isShow = false;
								} else {
                                    _self.uploadParam.isShow = true;
								};
								// 切换为修改房间导航
								_self.addNewRoomNavSubmitStatus = false;
								
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

		navigationVue.initEvent();

	})(window, document, jQuery, yzlObj);
});
