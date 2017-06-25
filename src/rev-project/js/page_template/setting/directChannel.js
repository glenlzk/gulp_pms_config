$(function () {
    ;(function (window, document, $, yzl) {
    	
        // 基本设置---编辑页面
        function ipt_foucs (cur, elem) {
            $(cur).css('border-bottom', 'none').siblings(elem).css('display', 'block');
        };
    	//跳转后加载数据
    	var directChannelVue = new Vue({
    		el:'#directChannel',
    		data:{
    			// editSurvece:0,
                // 酒店设置---start
                roomSetting:{},
                roomSettingBtnSwift: true,
                websiteIsReadOnly: true,
                openDateIsReadOnly: true,
                decorateIsReadOnly: true,
                roomTotalIsReadOnly: true,
                teleIsReadOnly: true,
                faxIsReadOnly: true,
                hotelIntrolIsReadOnly: true,
                // 酒店设置---end
    			roominfoSingle:'',
				roomEditSingle: '',
    			roomtypeId:'',
    			getImages:[],
    			gethotelImages:[],
    			//uploadImages:[],
    			hotelImageList:'',
    			roomTypeImageList:'',
    			showRoomTypeImage:'',
				// 服务政策---start
				serverPolicy: {
                    serviceList: [],
                    checkinTime:'',
                    checkoutTime:'',
                    presaleDays:'',
                    rule: ''
				},
                // check-box初始化---start
                hoteServiceInit: [
                    {
                        id: 'hs_park',
                        value: '1',
                        isDisabled: false,
                        checked: false,
                        zh_cn: '停车场'
                    },
                    {
                        id: 'hs_freewifi',
                        value: '2',
                        isDisabled: false,
                        checked: false,
                        zh_cn: '免费WIFI'
                    },
                    {
                        id: 'hs_breakfast',
                        value: '3',
                        isDisabled: false,
                        checked: false,
                        zh_cn: '早餐'
                    },
                    {
                        id: 'hs_invoice',
                        value: '4',
                        isDisabled: false,
                        checked: false,
                        zh_cn: '提供发票'
                    },
                    {
                        id: 'hs_shuttle',
                        value: '5',
                        isDisabled: false,
                        checked: false,
                        zh_cn: '接送服务'
                    }
                ],
                hoteServiceCss: {
                    listbox: {
                        'display': 'inline-block'
                    },
                    perbox: {
                        'margin-right': '20px'
                    }
                },
                unabledHoteService: true,
                // check-box初始化---end
                // select vue start----入住时间
                checkinTimelList:[
					{
                        code: '12:00',
                        name: '12:00'
					},
					{
                        code: '12:30',
						name: '12:30'
					},
					{
                        code: '13:00',
						name: '13:00'
					},
					{
                        code: '13:30',
						name: '13:30'
					},
					{
                        code: '14:00',
						name: '14:00'
					},
					{
                        code: '14:30',
						name: '14:30'
					},
					{
                        code: '15:00',
						name: '15:00'
					},
					{
                        code: '15:30',
						name: '15:30'
					},
					{
                        code: '16:00',
						name: '16:00'
					},
					{
                        code: '16:30',
						name: '16:30'
					},
					{
                        code: '17:00',
						name: '17:00'
					},
					{
                        code: '17:30',
						name: '17:30'
					}
                ],
                checkinTimeElemId: 'checkinTimeElemId',
                unabledCheckin: true,
                checkinSelecElem: 1,
                checkoutTimelList:[
                    {
                        code: '10:00',
                        name: '10:00'
                    },
                    {
                        code: '10:30',
                        name: '10:30'
                    },
                    {
                        code: '11:00',
                        name: '11:00'
                    },
                    {
                        code: '11:30',
                        name: '11:30'
                    },
                    {
                        code: '12:00',
                        name: '12:00'
                    },
                    {
                        code: '12:30',
                        name: '12:30'
                    },
                    {
                        code: '13:00',
                        name: '13:00'
                    },
                    {
                        code: '13:30',
                        name: '13:30'
                    },
                    {
                        code: '14:00',
                        name: '14:00'
                    },
                    {
                        code: '14:30',
                        name: '14:30'
                    },
                    {
                        code: '15:00',
                        name: '15:00'
                    },
                    {
                        code: '15:30',
                        name: '15:30'
                    }
                ],
                checkoutTimeElemId: 'checkoutTimeElemId',
                checkoutSelecElem: 1,
                unabledCheckout: true,
                // select vue end
                // radio vue plugin start---渠道编辑
                preSaleInitList: [   // 添加
                    {
                        id: 'presale_60',  // 对应的选项id
                        value: '60',         // value值必须不一样
                        isDisabled: false,
                        checked: false,
                        name: 'preSaleDays',     // 所有radio name 必须一样
                        zh_cn: '60天'    // 中文名字
                    },
                    {
                        id: 'presale_90',
                        value: '90',
                        isDisabled: false,
                        checked: false,
                        name: 'preSaleDays',
                        zh_cn: '90天'
                    },
                    {
                        id: 'presale_120',
                        value: '120',
                        isDisabled: false,
                        checked: false,
                        name: 'preSaleDays',
                        zh_cn: '120天'
                    },
                    {
                        id: 'presale_180',
                        value: '180',
                        isDisabled: false,
                        checked: false,
                        name: 'preSaleDays',
                        zh_cn: '180天'
                    }
                ],
                preSaleCssObj: {
                    'margin-right': '20px'
                },
                unabledPresale: true,
                // radio vue plugin end
                ruleIsReadonly: true,
                serverPolicyBtnSwift: true,
				// 服务政策---end
				// 房型信息---start
                roominfoSetting: {},
                // 房型信息---end
    			//presaleDaysStatus:true,
    			showCheckInTimeStatus:0,
    			showCheckOutTimeStatus:0,
    			gethotelInfo:'',
    			//权限管理
            	settingResourceInfo : yzl.resourceInfo,
            	roomTypeImgUploadLength:'',
            	hotelImgUploadLength:'',

    		},
			components: {
    			'v-checkbox': yzl.multiCheckboxVue,
				'v-select':yzlObj.multiSelectVue,
                'v-radio': yzl.radioVue
			},
    		methods:{
    			// 初始化事件
	            initEvent: function () {
	            	var _self = this;
	                _self.initData();
	                _self.loop();
	                
            	},
	            // 初始化数据
	            initData: function () {
					var _self = this;
	                var data = {
	                    hotelId: yzl.hotelId
	                };
	                yzl.getAjax({
	                    path : 'hotel/j/detail',
	                    type : 'post',
	                    data : data,
                        fadeInElem: '#directChannel',
                        loadingElem: '#mianContent',
                        tips: false,
                        loadingTop: 300,
	                    sCallback : function (result) {
	                        if (result.code == "0000") {
	                            //_self.roominfoSetting = result.data;
	                            // 酒店设置
	                            _self.roomSetting = result.data;
	                            // 服务政策
	                            _self.serverPolicy.serviceList = result.data.serviceList;
	                            _self.checkinSelecElem =  _self.getVselectIndex(result.data.checkinTime, _self.checkinTimelList);
	                            _self.checkoutSelecElem =  _self.getVselectIndex(result.data.checkoutTime, _self.checkoutTimelList);

	                            _self.serverPolicy.presaleDays = result.data.presaleDays;
	                            _self.serverPolicy.rule = result.data.rule;

	                        } else {
	                            yzl.Dialog({
	                                content : result.msg,
	                                AutoClose: true
	                            });
	                        };
	                    }
	                });
	               
	            },
				getVselectIndex: function (data, list) {
	            	for (var i=0; i<list.length; i++) {
	            		if (list[i].code == data) {
	            			return i;
						};
					};
	            	return 1;	// 默认选择第一个
				},
	            //酒店设置---设置 > 保存 > 入住时间
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
	            // 酒店设置---编辑
                hotelSettingEidt : function() {
	            	var _self = this;

					_self.swfitroomSettingStatus(false);
	           	},
                // 酒店设置---切换所有表单禁用状态
                swfitroomSettingStatus: function (bln) {
                    var _self = this;

                    _self.roomSettingBtnSwift = bln;
                    _self.websiteIsReadOnly = bln;
                    _self.openDateIsReadOnly = bln;
                    _self.decorateIsReadOnly = bln;
                    _self.roomTotalIsReadOnly = bln;
                    _self.teleIsReadOnly = bln;
                    _self.faxIsReadOnly = bln;
                    _self.hotelIntrolIsReadOnly = bln;
                },
	           	//酒店设置---取消
	           	cancelHotelEdit:function(){
	           		var _self = this;

                    _self.swfitroomSettingStatus(true);
	           		_self.initData();
	           	},
				// 酒店设置---保存
                saveHotelEdit: function () {
                    var _self = this;

                    var params = {
                        website: _self.roomSetting.website,
                        openDate: _self.roomSetting.openDate,
                        decorateDate: _self.roomSetting.decorateDate,
                        roomTotal: _self.roomSetting.roomTotal,
                        telephonNo: _self.roomSetting.telephonNo,
                        fax: _self.roomSetting.fax,
                        feature: _self.roomSetting.feature,
                        hotelId : yzl.hotelId,
                        flag:1
                    };
                    yzl.getAjax({
                        path : 'hotel/j/updateDetail',
                        type : 'post',
                        data : params,
                        sCallback : function (result) {
                            if (result.code == "0000") {
                                _self.initData();
                                _self.swfitroomSettingStatus(true);
                            } else {
                                yzl.Dialog({
                                    content : result.msg,
                                    AutoClose: true
                                });
                            };
                        }
                    });
                },
	          	// 服务政策---编辑
	          	serverinfoEdit : function() {
	          		var _self = this;

	          		_self.swfitAllFormStatus(false);
	            },
				// 服务政策---保存
                serverinfoSave: function () {
                    var _self = this;

                    var params = _self.serverPolicy;
                    params.hotelId = yzl.hotelId;
                    params.flag = 2;

                    yzl.getAjax({
                        path : 'hotel/j/updateDetail',
                        type : 'post',
                        data : params,
                        sCallback : function (result) {
                            if (result.code == "0000") {
                                _self.initData();
                                _self.swfitAllFormStatus(true);
                            } else {
                                yzl.Dialog({
                                    content : result.msg,
                                    AutoClose: true
                                });
                            };
                        }
                    });
				},
	            // 服务政策---编辑状态下取消
	            cancelServerEdit:function() {
	            	var _self = this;

                    _self.swfitAllFormStatus(true);
	            	_self.initData();
	            },
				// 服务政策---切换所有表单禁用状态
				swfitAllFormStatus: function (bln) {
                    var _self = this;

                    _self.serverPolicyBtnSwift = bln;
                    _self.unabledHoteService= bln;
                    _self.unabledCheckin= bln;
                    _self.unabledCheckout= bln;
                    _self.unabledPresale= bln;
                    _self.ruleIsReadonly= bln;
				},
	            // 服务政策---获取入住时间弹出
	            /*showCheckInTime:function(event){
	            	var _self = this;
	            	var e = event || window.event;
					e.stopPropagation();
					if(_self.editSurvece == 0){
						return false;
					}else{
						$('#showCheckOutTime').stop().slideUp(200);
						if (e.target.id == 'checkinTime' || e.target.id == 'checkinTime-span') {
							$('#CheckInTimeBox').stop().slideToggle(200);
						};	
						$(document.body).unbind('click').on('click', function (e) {
							if (e.target.id != 'checkinTime' && e.target.id != 'checkinTime-span') {		/!* && e.target.id != "slide_inner"*!/
								$('#CheckInTimeBox').stop().slideUp(200);
							};
						});
					}
	            },*/
	            //服务政策---获取离店时间弹出
	            /*showCheckoutTime:function(event){
	            	var _self = this;
	            	var e = event || window.event;
					e.stopPropagation();
					if(_self.editSurvece == 0){
						return false;
					}else{
						$('#CheckInTimeBox').stop().slideUp(200);
						if (e.target.id == 'checkoutTime' || e.target.id == 'checkoutTime-span') {
							$('#showCheckOutTime').stop().slideToggle(200);
						};	
						$(document.body).unbind('click').on('click', function (e) {
							if (e.target.id != 'checkoutTime' && e.target.id != 'checkoutTime-span') {		/!* && e.target.id != "slide_inner"*!/
								$('#showCheckOutTime').stop().slideUp(200);
							};
						});
					}
	            },*/
	            //服务政策---选择入住时间
	            /*selectCheckInTime:function(item){
	            	var _self = this;
	            	_self.checkinTime=item;
	            	_self.showCheckInTimeStatus = 0;
	            	$('#CheckInTimeBox').stop().slideUp(200);
	            },*/
	            //服务政策---选择离店时间
	            /*selectCheckOutTime:function(item){
	            	var _self = this;
	            	_self.checkoutTime=item;
	            	_self.showCheckOutTimeStatus = 0;
	            	$('#showCheckOutTime').stop().slideUp(200);
	            },*/
	            //房型信息---房型总数数据获取
	            hotelroomTotalbind : function(e){
	            	var _self = this;
	            	yzl.getAjax({
	                    path : 'roomType/j/getList',
	                    type : 'post',
	                    data : {hotelId:yzl.hotelId},
	                    fadeInElem: '#directChannel',
                        loadingElem: '#mianContent',
                        tips: false,
                        loadingTop: 300,
	                    sCallback : function (result) {
	                        if (result.code == "0000") {
	                            _self.roominfoSetting = result.data.roomTypeList;
	                        } else {
	                            yzl.Dialog({
	                                content : result.msg,
	                                AutoClose: true
	                            });
	                        };
	                    }
	                });
	            },
	            //房型信息---房型单个数据获取
	            hotelroomBind : function(e,item){
	            	var _self = this;
	            	$(e.target).parents('tr').addClass('active').siblings().removeClass('active');
	            	_self.roomtypeId = item.roomTypeId;
	            	yzl.getAjax({
	                    path : 'roomType/j/getRoomTypeDetail',
	                    type : 'post',
	                    data : {
	                    	roomTypeId:_self.roomtypeId,
	                    	hotelId:yzl.hotelId
	                    },
	                    sCallback : function (result) {
	                        if (result.code == "0000") {
	                        	_self.roominfoSingle = result.data.roomTypeDto;
	                        } else {
	                            yzl.Dialog({
	                                content : result.msg,
	                                AutoClose: true
	                            });
	                        };
	                    }
	                });
	            },
	            // 房型信息---点击编辑按钮
	            editRoomTypeList : function (item,e) {
	            	e.stopPropagation();
	                var _self = this;
	                $('.roomStyle-edition').css("display","block");
	            	_//self.roominfoSingle = item;
	            	_self.roomtypeId = item.roomTypeId;
	            	yzl.getAjax({
	                    path : 'roomType/j/getRoomTypeDetail',
	                    type : 'post',
	                    data : {
	                    	roomTypeId:_self.roomtypeId,
	                    	hotelId:yzl.hotelId
	                    },
	                    loadingElem: '#roomStatusWindow',
                        tips: false,
                        loadingTop: 250,
	                    sCallback : function (result) {
	                        if (result.code == "0000") {
	                        	_self.roomEditSingle = result.data.roomTypeDto;
	                        	console.log(_self.roomEditSingle.imageList.length);
				            	//调用图片上传插件
				                yzl.InitUploadify({
				                	id: "imgUpload",												// 上传按钮id
							 		url: '/yzlpms/img/j/uploadRoomTypeImage',						// 上传服务器地址			 		
							 		data: {
							 			roomTypeId:_self.roomtypeId,
							 			hotelId:yzl.hotelId
							 		},
							 		buttonText:'添加图片',
							 		method:'get',
							 		sCallback: function (data) {
							 			var result = JSON.parse(data);
							 			if (result.code == "0000") {
											_self.editRoomTypeList(_self.roomEditSingle,e);
							 				//调用轮播
							 				Vue.nextTick(function(){
							 					_self.loop(_self.roomEditSingle.imageList.length,'.editRoomType');
							 					_self.verticalloop(_self.roomEditSingle.imageList.length,3,'.roomTypeImgupload');
							 				})
							 			};
							 		}
								});
				                $('.right-addRoomTag-title i').on("click",function(){
									$('.roomStyle-edition').css("display","none");
								});
								//调用轮播
				 				Vue.nextTick(function(){
				 					_self.loop(_self.roomEditSingle.imageList.length,'.editRoomType');
				 					_self.verticalloop(_self.roomEditSingle.imageList.length,3,'.roomTypeImgupload');
				 					
				 					$('.editRoomType .hotel-ul li img').load(function(){
									  $('.editRoomType .hoteluploadLayout').css('height',$('.editRoomType .hotel-ul li img').height()*3+32+'px');
									});
				 				})
	                        } else {
	                            yzl.Dialog({
	                                content : result.msg,
	                                AutoClose: true
	                            });
	                        };
	                    }
	                });
	                
	            },
	            //房型信息---删除图片
	            delImage:function(index){
	                var _self = this;
	            	yzl.Dialog({
	                    content : '是否确认删除该图片',
	                    AutoClose: false,
	                    callback : function(callback){
	                    	var data = {
	                    		imageId:_self.roomEditSingle.imageList[index].imageId,
	                    		hotelId:yzl.hotelId
	                    	};
	                    	if(callback == true){
	                    		yzl.getAjax({
				                    path : 'img/j/delImage',
				                    type : 'get',
				                    data : data,
				                    sCallback : function (result) {
				                        if (result.code == "0000") {
				                            _self.roomEditSingle.imageList.$remove(_self.roomEditSingle.imageList[index]);
				                            //调用轮播
							 				Vue.nextTick(function(){
							 					_self.loop(_self.roomEditSingle.imageList.length,'.editRoomType');
							 					_self.verticalloop(_self.roomEditSingle.imageList.length,3,'.roomTypeImgupload');
							 				})
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
	            //房型信息---编辑提交信息
	            roomstyleSave : function(){
	            	var _self=this;
	            	var params = {
                        houseType: $('#houseType option:selected').val().trim(),
                        roomArea: $('#roomArea').val().trim(),
                        landscaped: $('#landscaped option:selected').val().trim(),
                        bedType: $('#bedType').val().trim(),      
                        wifiSupport: $('#wifiSupport').val().trim(),
                        floor:$('#floor').val().trim(),
                        roomTypeUrlList:_self.getImages,
                        roomTypeId : _self.roomtypeId,
                        hotelId:yzl.hotelId
                    };
                    yzl.getAjax({
	                    path : 'roomType/j/updateDirect',
	                    type : 'post',
	                    data : params,
	                    sCallback : function (result) {
	                        if (result.code == "0000") {
	                            $('.roomStyle-edition').css("display","none");
	                        } else {
	                            yzl.Dialog({
	                                content : result.msg,
	                                AutoClose: true
	                            });
	                        };
	                    }
	                });
	                this.hotelroomTotalbind();
	            },
	            //图片信息---请求数据
	            imageInfobind:function(e){
	            	var _self = this;
	            	$(e.target).parents('tr').addClass('active').siblings().removeClass('active');
	            	yzl.getAjax({
	                    path : 'hotel/j/getImageList',
	                    type : 'post',
	                    data : {hotelId:yzl.hotelId},
	                    fadeInElem: '#directChannel',
                        loadingElem: '#mianContent',
                        tips: false,
                        loadingTop: 300,
	                    sCallback : function (result) {
	                        if (result.code == "0000") {
	                        	_self.gethotelImages=result.data.imageList;
	                        	_self.gethotelInfo = result.data;
	                        	_self.roomTypeImageList=result.data.roomTypeList;
	                        } else {
	                            yzl.Dialog({
	                                content : result.msg,
	                                AutoClose: true
	                            });
	                        };
	                    }
	                });
	            },
	            //图片信息---初始化
	            initImageinfo:function(){
	            	var _self = this;
	            	yzl.getAjax({
	                    path : 'hotel/j/getImageList',
	                    type : 'post',
	                    data : {hotelId:yzl.hotelId},
	                    sCallback : function (result) {
	                        if (result.code == "0000") {
	                        	_self.gethotelImages=result.data.imageList;
	                        	_self.gethotelInfo = result.data;
	                        	_self.roomTypeImageList=result.data.roomTypeList;
	                        	Vue.nextTick(function(){
					 				_self.loop(_self.gethotelImages.length,'.hotelimage-upload');
		 							_self.verticalloop(_self.gethotelImages.length,4,'.hotelimage-upload');	
		 							$('.hotelimage-upload .hotel-ul li img').load(function(){
									  $('.hotelimage-upload .hoteluploadLayout').css('height',$('.hotelimage-upload .upload-left ul li img').height()*4+50+'px');
									});
				 				})
	                        } else {
	                            yzl.Dialog({
	                                content : result.msg,
	                                AutoClose: true
	                            });
	                        };
	                    }
	                });
	            },
	            //图片信息---酒店图片上传
	            addhotelImage:function(e){
	            	var _self = this;
					$('.hotelimage-upload').css("display","block");
					$('.right-addRoomTag-title i').unbind('click').on("click",function(){
						$('.hotelimage-upload').css("display","none");
						_self.initImageinfo();
					});
	            	
	            	//调用图片上传插件
	                yzl.InitUploadify({
	                	id: "hotelimgUpload",												// 上传按钮id
				 		url: '/yzlpms/img/j/uploadHotelImage',						// 上传服务器地址
				 		data: {
				 			hotelId:yzl.hotelId
				 		},
				 		method:'get',
				 		buttonText:'添加图片',
				 		sCallback: function (data) {
				 			var result = JSON.parse(data);
				 			if (result.code == "0000") {
				 				_self.initImageinfo();
				 			}
				 		}
					});
					//调用轮播
					Vue.nextTick(function(){
	 					_self.loop(_self.gethotelImages.length,'.hotelimage-upload');
	 					_self.verticalloop(_self.gethotelImages.length,4,'.hotelimage-upload');
	 					$('.hotelimage-upload .hoteluploadLayout').css('height',$('.hotelimage-upload .upload-left ul li img').height()*4+50+'px');
	 				})
	            },
	            //图片信息---酒店图片上传保存
	            btnsaveaddhotelImage:function(){
	            	var _self = this;
	            	$('.hotelimage-upload').css('display','none');
	            	_self.initImageinfo();
	            },
	            //图片信息---房型图片上传保存
	            btnsavearoomtypeImage:function(){
	            	var _self = this;
	            	$('.hotelroomtype-show').css('display','none');
	            	_self.initImageinfo();
	            },
	            //图片信息---酒店图片删除
	            delhotelImage:function(item){
	            	var _self = this;
	            	yzl.Dialog({
	                    content : '是否确认删除该图片?',
	                    AutoClose: false,
	                    callback : function(callback){
	                    	var data = {
	                    		imageId:item.imageId,
	                    		hotelId:yzl.hotelId
	                    	};
	                    	if(callback == true){
	                    		yzl.getAjax({
				                    path : 'img/j/delImage',
				                    type : 'get',
				                    data : data,
				                    sCallback : function (result) {
				                        if (result.code == "0000") {
				                            _self.gethotelImages.$remove(item);
				                            //调用轮播
											Vue.nextTick(function(){
							 					_self.loop(_self.gethotelImages.length,'.hotelimage-upload');
							 					_self.verticalloop(_self.gethotelImages.length,4,'.hotelimage-upload');
							 				})
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
	            //图片信息---房型信息展示
	            BindshowRoomTypeImage:function(item){
	            	var _self = this;
	            	_self.showRoomTypeImage=item;
	            	//调用轮播
					Vue.nextTick(function(){
                    	_self.loop(_self.showRoomTypeImage.imageList.length,'.hotelroomtype-show');
                    });
	            	$('.hotelroomtype-show').css('display','block');
	            	$('.right-addRoomTag-title i').on("click",function(){
						$('.hotelroomtype-show').css("display","none");
						_self.initImageinfo();
					})
	            },
	            //图片信息---房型图片删除
	            delroomTypeImage:function(item){
	            	var _self = this;
	            	yzl.Dialog({
	                    content : '是否确认删除该图片?',
	                    AutoClose: false,
	                    callback : function(callback){
	                    	var data = {
	                    		imageId:item.imageId,
	                    		hotelId:yzl.hotelId
	                    	};
	                    	if(callback == true){
	                    		yzl.getAjax({
				                    path : 'img/j/delImage',
				                    type : 'get',
				                    data : data,
				                    sCallback : function (result) {
				                        if (result.code == "0000") {
				                            _self.showRoomTypeImage.imageList.$remove(item);
				                            //调用轮播
				                            Vue.nextTick(function(){
				                            	_self.loop(_self.showRoomTypeImage.imageList.length,'.hotelroomtype-show');	
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
	                    }
	                });
	            },
	            
	            //轮播图
				loop : function(target,targhtName){
					var num = 0;
					var loopNum =0;
					$('.imgshow-banner ul').css('left','0');
					$('.banner-prev').css('display','none');
					$('.banner-next').css('display','none');
					if(target > 1){
						$('.banner-next').css('display','block');
                	}else{
                		$('.banner-next').css('display','none');
                	};
					$('.banner-next').click(function() {
						num ++;
						loopNum ++;
						$('.banner-prev').css('display','block')         
						if( num >= target-1){
							$('.banner-next').css('display','none')
						}else{
							$('.banner-next').css('display','block');
						}
						var myLeft = loopNum * -$('.imgshow-banner li').width();
						$('.imgshow-banner ul').stop().animate({'left':myLeft+'px'},500);
			        });
					$('.banner-prev').click(function() {
			            num --;
						loopNum --;
						$('.banner-next').css('display','block');
						if( num == 0){
							$('.banner-prev').css('display','none')
						}
						var myLeft = loopNum * -$('.imgshow-banner li').width();
						$('.imgshow-banner ul').stop().animate({'left':myLeft+'px'},500);
			        });
			        $(targhtName + ' .hotel-ul li').on("click",function(){
			        	loopNum  = $(this).index();
			        	num=loopNum ;
			        	var myLeft = loopNum * - $('.imgshow-banner li').width();
			        	$(targhtName + ' .imgshow-banner ul').css({'left':myLeft+'px'});
			        	if( num == 0){
							$(targhtName + ' .banner-prev').css('display','none');
							$(targhtName + ' .banner-next').css('display','block');
						}else if(num == target-1){
							$(targhtName + ' .banner-next').css('display','none');
							$(targhtName + ' .banner-prev').css('display','block');
						}else{
							$(targhtName + ' .banner-next').css('display','block');
							$(targhtName + ' .banner-prev').css('display','block');
						}
			        });
			  	},
		        //垂直轮播图
				verticalloop : function(target,targetNum,targetNam){
					var num = targetNum;
					var loopNum = 0;
					$(targetNam + ' .hotel-ul').css('top','0');
					$(targetNam + ' .hotelbtn-up').css('display','none');
					$(targetNam + ' .hotelbtn-down').css('display','none');
					if(target > targetNum){
						$(targetNam + ' .hotelbtn-down').css('display','block');
                	}else{
                		$('targetNam .hotelbtn-down').css('display','none');
                	};
					$(targetNam + ' .hotelbtn-down').click(function() {
						num ++;
						loopNum ++;
						$(targetNam + ' .hotelbtn-up').css('display','block')         
						if( num >= target){
							$(targetNam + ' .hotelbtn-down').css('display','none')
						}else{
							$(targetNam + ' .hotelbtn-down').css('display','block');
						}
						var myTop = loopNum * -($(targetNam + ' .hotel-ul li').height()+14);
						$(targetNam + ' .hotel-ul').stop().animate({'top':myTop+'px'},500);
			        });
					$(targetNam + ' .hotelbtn-up').click(function() {
			            num --;
						loopNum --;
						$(targetNam + ' .hotelbtn-down').css('display','block');
						if( num <= targetNum){
							$(targetNam + ' .hotelbtn-up').css('display','none')
						}
						var myTop = loopNum * -($(targetNam + ' .hotel-ul li').height()+14);
						$(targetNam + ' .hotel-ul').stop().animate({'top':myTop+'px'},500);
			        });
			        

			},
									 //轮播图
//					alineloop : function(){
//						var num = 0;
//						var loopNum =0;
//						console.log(target + 'target');
//						$('.imgshow-banner ul').css('top','0');
//						$('.ul-prev').css('display','none');
//						if(target <= 1){
//	                		$('.ul-next').css('display','none');
//	                	}else{
//	                		$('.ul-next').css('display','block');
//	                	};
//						$('.ul-next').click(function() {
//							console.log(target + 'target');
//							num ++;
//							loopNum ++;
//							$('.banner-prev').css('display','block')
//				            
//							if( num >= target-1){
//								$('.ul-next').css('display','none')
//							}else{
//								$('.ul-next').css('display','block');
//							}
//							var myTop = loopNum * -$('.imgshow-banner li').height() + 10;
//							$('.imgshow-banner ul').stop().animate({'top':myLeft+'px'},500);
//				        });
//						$('.ul-prev').click(function() {
//				            num --;
//							loopNum --;
//							$('.ul-next').css('display','block');
//							if( num == 0){
//								$('.ul-prev').css('display','none')
//							}
//							var myTop = loopNum * -$('.imgshow-banner li').height() +10;
//							$('.imgshow-banner ul').stop().animate({'top':myLeft+'px'},500);
//				        });
//				  	}
    		},
    		
    	});
    	directChannelVue.initEvent();
    	
    	//切换tab栏
    	$('.tab-layout span').on("click",function(){
    		$(this).addClass('active').siblings().removeClass('active');
    		$('.channel-contact .channel-contact-box').eq($(this).attr('id')).fadeIn(300).siblings().hide();
    	})

		
    })(window, document, jQuery, yzlObj);
});
