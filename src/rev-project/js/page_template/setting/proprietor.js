;(function (window, document, $, yzl) {
    var proprietorVue = new Vue({
        el : '#proprietorLayot',
        data: {
        	// 分页参数
            cur: 1,
            all: 0,
            msg: '',
            pageup: 10,
            pagedown: 10,
            total:0,
			proprietorList:[],
			initDataInfo:{
				hotelId:yzl.hotelId,
				pageSize: 15,
				pageNum: 1,
				mobile:'',
				userName:'',
				roomNo:''
			},
			NewOwnerUserAccount:{
				hotelId:yzl.hotelId,
				mobile:'',
				idNumber:'',
				idType:'',
				userName:'',
				remark:'',
				ownerUserId:''
			},
			editOwnerAccount:{
				hotelId:yzl.hotelId,
				mobile:'',
				idNumber:'',
				idType:'',
				userName:'',
				remark:'',
				ownerUserId:''
			},
			auditStatus:'',
			editAuditStatus:'',
			idTypeName:'',
			saveOwnerUserId: null,
			roomCommissionList:'',
			roomCommissionStatus:false,
			showTips:false,
			// 导航---获取可选择房间列表 和 获取已选择房间列表---添加或删除操作
			operateType: '',
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
			// 添加房东----显示/隐藏窗口
            isShowAddLandLordMask: false,
			// 编辑房东----显示/隐藏窗口
            isShowEditLandLordMask: false

        },
        // 引入分页组件
        components:{
            'vue-nav': paginationVue,
            'icheck-box': yzlObj.multiCheckboxVue
        },
        // 分页跳转监听
		watch: {
			//监听分页
			cur: function (newVal, oldVal) {
            	var _self = this;
            	_self.initData(newVal);
           	},
			auditStatus:function(newVal,oldVal){
				var _self = this;
				if(newVal == 3){
					if(_self.NewOwnerUserAccount.idType == 1){
						_self.idTypeName = '二代身份证'
					}else if(_self.NewOwnerUserAccount.idType == 4){
						_self.idTypeName = '港澳回乡证'
					}else if(_self.NewOwnerUserAccount.idType == 5){
						_self.idTypeName = '台胞回乡证'
					}else if(_self.NewOwnerUserAccount.idType == 6){
						_self.idTypeName = '外籍护照'
					}
				}
			},
			editAuditStatus:function(newVal,oldVal){
				var _self = this;
				if(newVal == 3){
					if(_self.editOwnerAccount.idType == 1){
						_self.idTypeName = '二代身份证'
					}else if(_self.editOwnerAccount.idType == 4){
						_self.idTypeName = '港澳回乡证'
					}else if(_self.editOwnerAccount.idType == 5){
						_self.idTypeName = '台胞回乡证'
					}else if(_self.editOwnerAccount.idType == 6){
						_self.idTypeName = '外籍护照'
					}
				}
			}
		},
        methods: {
            // 初始化事件
            initEvent: function () {
                this.initData();
            },
            //业主---查询
            searchOwner:function(){
                this.initData();
           	},
            // 业主---初始化数据
            initData: function (cur) {
                var _self = this;
                if(cur){
                	_self.initDataInfo.pageNum = cur;
                }
                var data = _self.initDataInfo;
                yzl.getAjax({
                    path : 'roomOwner/j/page',
                    type : 'post',
                    data : data,
                    fadeInElem: '#proprietorLayot',
                    loadingElem: '#mianContent',
                    tips: false,
                    loadingTop: 120,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.proprietorList = result.data.list;
                            console.log(_self.proprietorList);
							for(var i=0; i<_self.proprietorList.length; i++){
								if(_self.proprietorList[i].idType == 1){
									_self.proprietorList[i].idType = '二代身份证'
								}else if(_self.proprietorList[i].idType == 4){
									_self.proprietorList[i].idType = '港澳回乡证'
								}else if(_self.proprietorList[i].idType == 5){
									_self.proprietorList[i].idType = '台胞回乡证'
								}else if(_self.proprietorList[i].idType == 6){
									_self.proprietorList[i].idType = '外籍护照'
								}
							};
                            if (_self.proprietorList.length == 0) {
                                yzl.noDataTips ({
                                    top: 70,
                                    content: '您还未添加房东信息',
                                    parElem: '#proprietorList'
                                });
							}else {
								yzl.removeNoDataElems();
							};
                            // 分页
                            _self.cur = result.data.pageNum;
                            _self.all = result.data.pages;
                            _self.total = result.data.total;
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
            },
            // 房间格式化
            transformRoomNo: function (item, items,index) {
                var _self = this;

                return index==2 && item.roomList.length>3? items.roomNo + '... ':((index+1)==item.roomList.length)? items.roomNo:items.roomNo + ', ';

                /*if (index==2 && item.roomList.length>3) {
                 return items.roomNo + '... ';
                 } else if (index+1 == item.roomList.length) {
                 return items.roomNo;
                 } else {
                 return items.roomNo + ', ';
                 };*/
            },
            // 添加房东 --- 展示
            AddNewRoomNav:function(){
            	var _self = this;
            	_self.isShowAddLandLordMask = true;
            	_self.NewOwnerUserAccount = {
					hotelId:yzl.hotelId,
					mobile:'',
					idNumber:'',
					idType:'',
					userName:'',
					remark:'',
					ownerUserId:''
				};
				_self.auditStatus = '';
            },
			// 添加房东 --- 隐藏
            hideAddLandLordMaskFun: function () {
                var _self = this;
                _self.isShowAddLandLordMask = false;
                _self.showTips = false;
			},
			// 编辑房东 --- 展示
            editLandLordFun: function () {
                var _self = this;
            	_self.isShowEditLandLordMask = true;
			},
            // 编辑房东 --- 隐藏
            hideEditLandLordMaskFun: function () {
                var _self = this;
                _self.isShowEditLandLordMask = false;
			},
			//编辑房间佣金---隐藏
			closeEditRoomCommission:function(){
				var _self = this;
                _self.roomCommissionStatus = false;
			},
			//编辑房间佣金
			editCommission:function(item){
				var _self = this;
				yzl.getAjax({
                    path : 'roomOwner/j/getOwnerRoomList',
                    type : 'post',
                    data : {
                    	hotelId:yzl.hotelId,
                    	ownerUserId:item.ownerUserId
                    },
                    sCallback : function (result) {
                        if (result.code == "0000") {
                        	_self.roomCommissionList = result.data.roomList;
                        	_self.roomCommissionStatus = true;
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });
			},
			//验证佣金是否为0-100的整数
			regcommission:function(item){
				var _self = this;
				var reg = /^(?:0|[1-9][0-9]?|100)$/;
				if(!reg.test(item)){
					yzl.Dialog({
                        content : '请输入0-100之间的整数',
                        AutoClose: true
                    });
				}
			},
            // 房间佣金只限数字输入
            commissionOnlyNumber: function (item) {
                var _self = this;
                if (yzl.onlyIptNumber(item.rate) > 100) {
                    item.rate = 100;
                } else {
                    item.rate = yzl.onlyIptNumber(item.rate);
                };
            },
			//房间佣金提交
			submitCommission:function(item){
				var _self = this;
				var reg = /^(?:0|[1-9][0-9]?|100)$/;
				for(var i=0; i<_self.roomCommissionList.length; i++){
					console.log(reg.test(_self.roomCommissionList[i].rate));
					if(_self.roomCommissionList[i].rate === '' || !reg.test(_self.roomCommissionList[i].rate)){
						yzl.Dialog({
	                        content : '维护佣金值不能为空或小数，请核对后重新输入',
	                        AutoClose: true
	                    });
	                    return;
					}
				}
				yzl.getAjax({
                    path : 'roomOwner/j/updateOwnerRoomList',
                    type : 'post',
                    data : {
                    	hotelId:yzl.hotelId,
                    	roomList:_self.roomCommissionList
                    },
                    sCallback : function (result) {
                        if (result.code == "0000") {
							_self.closeEditRoomCommission();
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });
			},
			checkPhoneNo: function () {
                var _self = this;
                _self.NewOwnerUserAccount.mobile = yzl.onlyIptNumber(_self.NewOwnerUserAccount.mobile);
			},
			//业主---通过手机号获取其他信息
			getInfoByMobile:function(){
				var _self = this;
				var myreg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/; 
				if(_self.NewOwnerUserAccount.mobile == ''){
                    return false;
				}else if(!myreg.test(_self.NewOwnerUserAccount.mobile)){
					yzl.Dialog({
                        content : '请输入正确的手机号码',
                        AutoClose: true
                    });
                    return false;
				};
				yzl.getAjax({
                    path : 'roomOwner/j/getInfoByMobile',
                    type : 'post',
                    data : {
                    	hotelId:yzl.hotelId,
                    	mobile:_self.NewOwnerUserAccount.mobile
                    },
                    sCallback : function (result) {
                        if (result.code == "0000") {
                        	if(result.data == null){
                        		_self.showTips = true;
                        	}else{
                        		_self.NewOwnerUserAccount.mobile = result.data.mobile;
	                        	_self.NewOwnerUserAccount.idNumber = result.data.idNumber;
	                        	_self.NewOwnerUserAccount.idType = result.data.idType;
	                        	_self.NewOwnerUserAccount.userName = result.data.userName;
	                        	_self.NewOwnerUserAccount.remark = result.data.remark;
	                        	_self.NewOwnerUserAccount.ownerUserId = result.data.ownerUserId;
	                        	_self.auditStatus = result.data.auditStatus;
	                        	_self.showTips = false;
                        	}
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });
			},
            //业主 --- 新增业主信息提交
            AddNewOwnerSubmit:function(){
            	var _self = this;
            	var myregMobile = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/; 
            	if(_self.NewOwnerUserAccount.idType == ''){
            		yzl.Dialog({
                        content : '证件类型不能为空',
                        AutoClose: true
                    });
                    return;
            	}else if(_self.NewOwnerUserAccount.userName == ''){
            		yzl.Dialog({
                        content : '姓名不能为空',
                        AutoClose: true
                    });
                    return;
            	}else if(_self.NewOwnerUserAccount.idNumber == ''){
            		yzl.Dialog({
                        content : '证件号码不能为空',
                        AutoClose: true
                    });
                    return;
            	}else if(/[\u4e00-\u9fa5]/.test(_self.NewOwnerUserAccount.idNumber)){
            		yzl.Dialog({
                        content : '证件号码中不能包含中文',
                        AutoClose: true
                    });
                    return;
            	}else if(_self.NewOwnerUserAccount.mobile == ''){
            		yzl.Dialog({
                        content : '手机号码不能为空',
                        AutoClose: true
                    });
                    return;
            	}else if(!myregMobile.test(_self.NewOwnerUserAccount.mobile)){
            		yzl.Dialog({
                        content : '请输入正确的手机号码',
                        AutoClose: true
                    });
                    return;
            	};
                var data = _self.NewOwnerUserAccount;
                yzl.getAjax({
                    path : 'roomOwner/j/addOwner',
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                        	_self.initData();
                        	_self.hideAddLandLordMaskFun();
                        	_self.editNavRooms(result.data.ownerUserId,'add');
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });
            },
            //业主---点击编辑业主信息按钮
            editOwnerInfo:function(item){
            	var _self = this;
                var data = {
                	hotelId:yzl.hotelId,
                	ownerUserId:item.ownerUserId
                };
                yzl.getAjax({
                    path : 'roomOwner/j/getOwner',
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                    		_self.editOwnerAccount.mobile = result.data.mobile;
                        	_self.editOwnerAccount.idNumber = result.data.idNumber;
                        	_self.editOwnerAccount.idType = result.data.idType;
                        	_self.editOwnerAccount.userName = result.data.userName;
                        	_self.editOwnerAccount.remark = result.data.remark;
                        	_self.editOwnerAccount.ownerUserId = result.data.ownerUserId;
                        	_self.editAuditStatus = result.data.auditStatus
							_self.editLandLordFun();
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });
            },
            //业主---提交修改的业主信息
            editOwnerInfoSave:function(){
            	var _self = this;
            	if(_self.editOwnerAccount.idType == ''){
            		yzl.Dialog({
                        content : '证件类型不能为空',
                        AutoClose: true
                    });
                    return;
            	}else if(_self.editOwnerAccount.userName == ''){
            		yzl.Dialog({
                        content : '姓名不能为空',
                        AutoClose: true
                    });
                    return;
            	}else if(_self.editOwnerAccount.idNumber == ''){
            		yzl.Dialog({
                        content : '证件号码不能为空',
                        AutoClose: true
                    });
            	}else if(/[\u4e00-\u9fa5]/.test(_self.editOwnerAccount.idNumber)){
            		yzl.Dialog({
                        content : '证件号码中不能包含中文',
                        AutoClose: true
                    });
                    return;
            	};
                var data = _self.editOwnerAccount;
                yzl.getAjax({
                    path : 'roomOwner/j/updateOwner',
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                        	_self.initData();
                        	_self.hideEditLandLordMaskFun();
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });
            },
			//业主---获取可选择房间列表 和 获取已选择房间列表
			editNavRooms:function(userId, type){
				var _self = this;
				// 保存指定地址下的房间列表---用于对其添加删除操作
				_self.saveOwnerUserId = userId;

                $('.EditRoomWindow-mask').css('display','block');

				// 获取可选择房间列表
				if (type == 'add') {
					_self.operateType = type;
					var path = 'roomOwner/j/getOptionalRoomList';
					var data = {
						hotelId: yzl.hotelId
					};
				} else {
					// 获取已选择房间列表
					_self.operateType = type;
					var path = 'roomOwner/j/getSelectedRoomList';
					var data = {
						hotelId: yzl.hotelId,
						ownerUserId:userId
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
                            // _self.roomNumList = result.data.roomList;
							_self.backUpRoomNumList = result.data.roomList;
                            _self.roomNumList = _self.transforRoomListData(result.data.roomList, 'roomguide_');
							// 全选 和 取消全选按钮
							// _self.EditRoomWindowCheckAllListen();
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
			// 业主---添加 或 删除 房间列表
			submitAddOrDelRoomsList: function () {
				var _self = this;

				/*$('.EditRoomWindow-content input').each(function (index, elem) {
					if ($(elem).is(':checked')) {
						var id = $(elem).attr('id').split('_')[1];
						var list = {
							roomId: id,
							roomNo: $(elem).val()
						};
						_self.saveRoomsList.push(list);
					};
				});*/
				// 添加操作
				if (_self.operateType == 'add') {
					var path = 'roomOwner/j/addRoom';
				} else {
					// 删除操作
					var path = 'roomOwner/j/deleteRoom';
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
					ownerUserId:_self.saveOwnerUserId,
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
							/*$('#editRoomWindowSwiftBtnText').html('全选');*/
							$('.EditRoomWindow-mask').css('display','none');
							_self.initData();
						} else {
							yzl.Dialog({
								content : result.msg,
								AutoClose: true
							});
						};
					}
				});
			},
			// 业主---关闭 编辑房间 窗口
			closeEditRoomWindow: function () {
				var _self = this;
				/*$('#editRoomWindowSwiftBtnText').html('全选');*/
				$('.EditRoomWindow-mask').css('display','none');
                // 默认不全选
                _self.roomNumList = [];
                _self.$broadcast('unSelectAll');
            },
			/*//业主---编辑房间全选功能
			EditRoomWindowCheckAll:function(e){
				if($(e.target).html() == '全选'){
					$.each($('.EditRoomWindow-content input'), function() {
						$(this).prop('checked',true);
					});
					$(e.target).html('取消全选')
				}else{
					$.each($('.EditRoomWindow-content input'), function() {
						$(this).prop('checked',false);
					});
					$(e.target).html('全选')
				}
			},
			//业主---全选监听
			EditRoomWindowCheckAllListen:function(){
				$.each($('.EditRoomWindow-content input'),function(){
					if(!$(this).is(':checked')){
						$('.EditRoomWindow-content button').html('全选');
						return false;
					};
					$('.EditRoomWindow-content button').html('取消全选');
				});
			},*/
			//业主---删除业主信息
			delRoomNav:function(item){
				var _self = this;
            	yzl.Dialog({
                    content : '是否确认删除',
                    AutoClose: false,
                    callback : function(callback){
                    	var data = {
							ownerUserId:item.ownerUserId,
							hotelId: yzl.hotelId
                    	};
                    	if(callback == true){
                    		yzl.getAjax({
			                    path : 'roomOwner/j/deleteOwner',
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
			}
        }
    });

    proprietorVue.initEvent();

})(window, document, jQuery, yzlObj);