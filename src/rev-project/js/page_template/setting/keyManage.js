
;(function (window, document, $, yzl) {
	//门锁管理页面
    var keyManageVue = new Vue({
        el : '#key_manage',
        data: {
        	// 分页参数
            cur: 1,
            all: 0,
            msg: '',
            pageup: 8,
            pagedown: 8,
            // 日志分页参数
            logcur: 1,
            logall: 0,
            keyManageInfo:'',
			keyManageListInfo:'',
			keyManageListInfoDetail:'',
			detailkeylogList:'',
			detailkeylogInfo:'',
			keylockIdDetail:'',
			// 门锁信息---是否显示: 钥匙tag
			isShowLockTag: true,
			keylogData : {
            	hotelId:yzl.hotelId,
            	lockId:'',
            	fromDate: new Date().format('yyyy-MM-01'),
				toDate: new Date().format('yyyy-MM-dd'),
            	content: '',
            	pageNum:1,
            	pageSize:15
            },
			// 选择下拉框---start
            lockTypeList: [
                {
                    code: '1',
                    name: '正常'
                },
                {
                    code: '2',
                    name: '仅支持钥匙开门'
                },
                {
                    code: '3',
                    name: '无法使用'
                },
                {
                    code: '4',
                    name: '无英智联锁'
                }
            ],
            lockTypeElemId: 'lockTypeElemId',
			// 选择下拉框---end
            initdata:{
            	hotelId: yzl.hotelId,
				lockStatus: '',
				roomNo:'',
				lockNo:'',
				pageNum:1,
				pageSize:15,
            },
            //锁具授权
            roomStatusTag:1,
            roomLockList:{},
            addRoomLockList:[],
            roomLockListLength:0,
            authorizerList:[],
            authorizerInfo:[],
            isSelectAllRooms: false,
            //锁具状态List---start
            lockStatusList:[
            	{
            		code:1,
            		name:'正常'
            	},
       			{
       				code:2,
       				name:'仅支持钥匙开门'
       			},
       			{
       				code:3,
       				name:'无法使用'
       			},
       			{
       				code:4,
       				name:'无英智联锁'
       			}
            ],
            lockStatusListId:'lockStatusListId',
            //锁具状态List---end
            //getStartDateEndDateList---start
            getStartDateEndDateList:[
            	{
            		code:'recentMonth',
            		name:'最近一月'
            	},
            	{
            		code:'recentWeek',
            		name:'最近一周'
            	},
            	{
            		code:'yesterday',
            		name:'昨天'
            	},
            	{
            		code:'presentMonth',
            		name:'本月'
            	},
            	{
            		code:'lastMonth',
            		name:'上月'
            	},
            	{
            		code:'',
            		name:'自定义'
            	}
            ],
            dateSelectedElem:'presentMonth',
            getStartDateEndDateListId:'getStartDateEndDateListId',
            isReloadSelectPlugin: false,
            //getStartDateEndDateList---end
            //权限管理
            settingResourceInfo : yzl.resourceInfo,
        },
        // 分页跳转监听
        watch: {
            cur: function (newVal, oldVal) {
                var _self=this;
                _self.initdata.pageNum = newVal;
                _self.initEvent();
            },
            //日志分页
            logcur:function (newVal, oldVal) {
                var _self = this;
                _self.keylogData.pageNum = newVal;
				_self.showKeyLog();
            },
            // 日期插件值监控
			getStartDateEndDate: function (newVal, oldVal) {
				var _self = this;
				switch (newVal) {
					case 'recentMonth':
						_self.keylogData.fromDate = new Date(new Date().getTime() - 86400000*29).format('yyyy-MM-dd');
						_self.keylogData.toDate  = new Date().format('yyyy-MM-dd');
						break;
					case 'recentWeek':
						_self.keylogData.fromDate = new Date(new Date().getTime() - 86400000*6).format('yyyy-MM-dd');
						_self.keylogData.toDate  = new Date().format('yyyy-MM-dd');
						break;
					case 'yesterday':
						_self.keylogData.fromDate = new Date(new Date().getTime() - 86400000).format('yyyy-MM-dd');
						_self.keylogData.toDate  = new Date(new Date().getTime() - 86400000).format('yyyy-MM-dd');
						break;
					case 'presentMonth':
						_self.keylogData.fromDate = new Date().format('yyyy-MM-01');
						_self.keylogData.toDate  = new Date().format('yyyy-MM-dd');
						break;
					case 'lastMonth':
						_self.keylogData.fromDate = lastMonthstart(new Date().format('yyyy-MM-dd'));
						_self.keylogData.toDate  = lastMonthend(new Date().format('yyyy-MM-dd'));
						break;
					/*default :
						_self.getBusinessStatisticsData.fromDate = "";
						_self.getBusinessStatisticsData.toDate  = "";
						break;*/
				};

				function lastMonthend(_date) {
					var _date = new Date(_date);

					_date.setDate(0);
					return _date.format('yyyy-MM-dd');
				};

				function lastMonthstart(_date) {
					var _date = new Date(_date),
						m = _date.getMonth();

					_date.setMonth(m - 1);
					return _date.format('yyyy-MM-01');
				};
			},
        },
        // 引入分页组件
        components:{
            'vue-nav': paginationVue,
            'iselect-name': yzlObj.multiSelectVue
        },
        methods: {
        	// 分页点击监听:
            listen:function(data){
                //this.msg = '你点击了'+data+ '页';
            },
            // 初始化事件
            initEvent: function () {
            	var _self = this;
            	var path = 'roomLock/j/page';
				yzl.getAjax({
                    path : path,
                    type : 'post',
                    data : _self.initdata,
                    fadeInElem: '#key_manage',
                    loadingElem: '#mianContent',
                    tips: false,
                    loadingTop: 300,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.keyManageListInfo = result.data.list;
                            _self.keyManageInfo = result.data;
                            if (_self.keyManageListInfo.length == 0) {
                                yzl.noDataTips ({
                                    top: 70,
                                    content: '暂无数据',
                                    parElem: '#keyManageTable',
                                    url:path
                                });
							} else {
                                yzl.removeNoDataElems();
                            };
                            _self.all = result.data.pages;
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
            },
            //门锁页面查询
            searchKeyListInfo:function(){
            	var _self = this;
            	_self.initdata.pageNum = 1;
				_self.initEvent();
            },
            // 点击编辑弹出窗口
            showKeyDetailInfo:function(item){
            	var _self = this;
            	// 是否显示---钥匙tag
            	if (!item.roomId) {
                    _self.isShowLockTag = false;
				} else {
                    _self.isShowLockTag = true;
				};

				yzl.getAjax({
                    path : 'roomLock/j/getDetail', 
                    type : 'post',
                    data : {
                    	hotelId:yzl.hotelId,
                    	lockId:item.lockId
                    },
                    loadingElem: '#keyDoormsgBox',
                    tips: false,
                    loadingTop: 150,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.keyManageListInfoDetail = result.data;
                            _self.keylockIdDetail = result.data.lockId;
							// 重新初始化---select日期插件
							_self.isReloadSelectPlugin = true;
                            _self.keylogData.fromDate = new Date().format('yyyy-MM-01');
                            _self.keylogData.toDate = new Date().format('yyyy-MM-dd');
                            $('.key-doormsg-tag').css('display','block');
                            $('.key-doormsg-title i').on('click',function(){
                            	$('.key-doormsg-tag').css('display','none');
                            	_self.keylogData.content = '';
                            	$('.key-doormsg-subtitle span').eq(0).addClass('active').siblings().removeClass('active');
                            	$('.key-doormsg-boxlist>div').eq(0).addClass('active').siblings().removeClass('active');
                            });
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
            	
            },
            //日历插件OK按钮
            keylogDate:function(){
            	
            },
           	//获取门锁日志列表
           	showKeyLog:function(){
           		var _self = this;
           		_self.keylogData.lockId=_self.keylockIdDetail;
           		var path = 'roomLock/j/getUnlockRecordList';
				yzl.getAjax({
                    path : path,
                    type : 'post',
                    data :_self.keylogData,
                    loadingElem: '#keyDoorlocklogBox',
                    tips: false,
                    loadingTop: 100,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.detailkeylogList = result.data.list;
                            _self.detailkeylogInfo = result.data;
                            _self.logall = result.data.pages;
                            if (_self.detailkeylogList.length == 0) {
                                yzl.noDataTips ({
                                    top: 70,
                                    content: '您的门店暂时没有该类订单',
                                    parElem: '#keyDoorlocklogBox',
                                    url:path
                                });
							} else {
                                yzl.removeNoDataElems();
                            };
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
           	},
           	//门锁日志查询按钮点击
           	searchKeyLog:function(){
           		var _self = this;
           		_self.keylogData.pageNum = 1;
           		_self.showKeyLog();
           	},
           	//门锁授权---房间和已选房间状态切换
           	roomStatusChange:function(num) {
           		var _self = this;
                _self.roomStatusTag = num;
           		/*if($(e.target).hasClass('active')){
           			return ;
           		}else{
           			if(_self.roomStatusTag == 1){
           				_self.roomStatusTag = 2;
           			}else{
           				_self.roomStatusTag = 1;
           			};
           			$('.lockAuthorization-select span').removeClass('active');
           			$(e.target).addClass('active');
           		}*/
           	},
           	//门锁授权---获取房间列表
           	getRoomLockList:function(){
           		var _self = this;
           		_self.roomLockListLength = 0;
           		_self.roomStatusTag = 1;
           		var data = {hotelId:yzl.hotelId};
           		yzl.getAjax({
                    path : 'roomLock/j/getRoomLockList', 
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.roomLockList = result.data;
                            for (var i=0; i<_self.roomLockList.length; i++) {
								_self.$set('roomLockList['+i+'].checked',false);
							};
                            $('.lockAuthorization-mask').css('display','block');
                            _self.addRoomLockList = [];
                            $('.lockAuthorization-title i').on('click',function(){
                            	$('.lockAuthorization-mask').css('display','none');
                            })
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
           	},
            // 锁具授权 --- 全选:选择/取消
            selectAllRooms: function (str) {
                var _self = this;
                var bln = false;
                if (str == 'unselect') {
                	_self.isSelectAllRooms = !_self.isSelectAllRooms;
                    bln = _self.isSelectAllRooms;
				};

                if (bln) {
                	for (var i=0; i<_self.roomLockList.length; i++) {
                        _self.roomLockList[i].checked = true;
					};

                    _self.roomLockListLength = _self.roomLockList.length;
				} else {
                    for (var i=0; i<_self.roomLockList.length; i++) {
                        _self.roomLockList[i].checked = false;
                    };

                    _self.roomLockListLength = 0;
				};

			},
			// 锁具授权 --- 单个:选择/取消
            changePerSelect: function (item) {
                var _self = this;
                var arr = [];

                item.checked = !item.checked;
                if (item.checked) {
                	for (var i=0; i< _self.roomLockList.length; i++) {
                		if (_self.roomLockList[i].checked) {
                            arr.push(_self.roomLockList[i].roomId);
						} else {
                            _self.isSelectAllRooms = false;
						};
					};

                	if (_self.roomLockList.length == arr.length) {
                        _self.isSelectAllRooms = true;
					};

				} else {
                	_self.isSelectAllRooms = false;
				};


                _self.roomLockListLength = arr.length;
			},
           	//门锁授权---点击改变门锁房间状态
           	addLockRoom:function(item){
           		var _self = this;
           		item.isActive = !item.isActive;
           		$.each(_self.roomLockList,function(){
           			if($(this)[0].isActive == false){
           				$('.lockAuthorization-checkAll button').html('全选');
           				return false;
           			}else{
           				$('.lockAuthorization-checkAll button').html('反选');
           			}
				});
				Vue.nextTick(function(){
					_self.roomLockListLength = $('.lockAuthorizationadd .lockRoomList .active').length;
				});
           	},
           	//门锁授权---全选/取消全选
			lockRoomCheckAll:function(e){
				var _self = this;
				if($(e.target).html() == '全选'){
					$.each(_self.roomLockList,function(){
						$(this)[0].isActive = true;
					});
					$(e.target).html('反选');
				}else{
					$.each(_self.roomLockList,function(){
						$(this)[0].isActive = false;
					});
					$(e.target).html('全选');
				}
				Vue.nextTick(function(){
					_self.roomLockListLength = $('.lockAuthorizationadd .lockRoomList .active').length;
				});
			},
			//门锁授权---授权人模态框弹出
			authorizerListModalShow:function(){
				var _self = this;
				var data = {
					hotelId:yzl.hotelId
				}
				yzl.getAjax({
                    path : 'hotel/j/getHotelUserList', 
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.authorizerList = result.data;
                            for (var i=0; i<_self.authorizerList.length; i++) {
								_self.$set('authorizerList['+i+'].isActive',false);
							};
                            $('.authorizerList-mask').css('display','block');
                            $('.authorizerList-title i').on('click',function(){
                            	$('.authorizerList-mask').css('display','none');
                            })
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
			},
			//门锁授权---点击改变门锁房间状态
           	addAuthorizer:function(item){
           		var _self = this;
           		item.isActive = !item.isActive;
           	},
           	//门锁授权---点击取消
           	addAuthorizerCancel:function(){
           		$('.authorizerList-mask').css('display','none');
           	},
           	//门锁授权---点击提交
           	addAuthorizerSubmit:function(){
           		var _self = this;
				var data = {
					hotelId:yzl.hotelId,
					roomIdList:[],
					userIdList:[]
				};

				for (var i=0; i<_self.roomLockList.length; i++) {
                    if(_self.roomLockList[i].checked){
                        data.roomIdList.push(_self.roomLockList[i].roomId);
                    }
				};

                for (var j=0; j<_self.authorizerList.length; j++) {
                    if(_self.authorizerList[j].isActive){
                        data.userIdList.push(_self.authorizerList[j].userId);
                    }
                };

           		yzl.getAjax({
                    path : 'roomLock/j/addRoomKeyAssign', 
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            $('.lockAuthorization-mask').css('display','none');
							$('.authorizerList-mask').css('display','none');
							_self.isSelectAllRooms = false;
							_self.initEvent();
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
           	},
           	//门锁授权---操作人员页面渲染
           	getRoomKeyUser:function(){
           		var _self = this;
           		var data = {
           			hotelId:yzl.hotelId,
           			roomId:_self.keyManageListInfoDetail.roomId
           		}
           		yzl.getAjax({
                    path : 'roomLock/j/getRoomKeyUser', 
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.authorizerInfo = result.data;
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
           	},
           	//门锁授权---删除操作人员
           	removeAuthorizerInfo:function(item){
           		var _self = this;
           		yzl.Dialog({
                  	content : '是否确认删除该人员?',
                  	AutoClose: false,
                  	callback : function(callback){
	                    var data = {
	                      roomKeyAssignId:item.roomKeyAssignId,
	                      hotelId:yzl.hotelId
	                    };
	                    if(callback == true){
	                      yzl.getAjax({
	                        path : 'roomLock/j/cancelRoomKeyAssign',
	                        type : 'post',
	                        data : data,
	                        sCallback : function (result) {
	                            if (result.code == "0000") {
	                                	_self.getRoomKeyUser();
	                                	_self.initEvent();
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
	keyManageVue.initEvent();

	
    $('.key-doormsg-subtitle span').click(function () {
        var index = $(this).index();
        $(this).addClass('active').siblings().removeClass('active');
        $('.key-doormsg-boxlist>div').eq(index).addClass('active').siblings().removeClass('active');
    });
	
	
})(window, document, jQuery, yzlObj);