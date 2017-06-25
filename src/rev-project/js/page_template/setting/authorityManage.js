/**
 * Created by glen on 2016/10/27.
 */
;(function (window, document, $, yzl) {
	var authorityManageVue = new Vue({
		el : '#authorityManageVue',
		data : {
			titleName:'新增人员',
			totalRolenumber: 0,
			roleList:[],
			roleIdList:[],
			selectAllRoleIds:false,
			userIdList:[],
            selectAllRoleStaffIds: false,
            showBorderRight: {},
            showBorderLeft: {},
			roleListDetail:[],
			roleListsingleDetail:'',
			rolesingleDetail:{},
			roleResourceList:[],
			roleListEdit:[],
			orgRoleList:[],
			checkedStatus:[],
			authorityList:[],
			KKManagerApp:'',
			cloudHotelWeb:'',
			KKManagerAppsingle:'',
			cloudHotelWebsingle:'',
			//权限管理
            settingResourceInfo : yzl.resourceInfo,
		},
		watch: {
		},
		methods : {
			// 初始化事件
            initEvent: function () {
            	var _self = this;
                _self.initData();
                $('.modal-header i').on("click",function(){
		    		$('.role-List').css('display','none');
		    		$('.role-Listdetail').css('display','none');
		    		_self.initData();
		    	});
            },
            // 初始化数据
            initData: function () {
                var _self = this;
                var data = {
                    hotelId: yzl.hotelId
                };
                _self.orgRoleList=[];
                _self.roleListDetail = [];
                yzl.getAjax({
                    path : 'right/j/queryRole', 
                    type : 'get',
                    data : data,
                    fadeInElem: '#authorityManageVue',
                    loadingElem: '#mianContent',
                    tips: false,
                    loadingTop: 300,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                        	var roleList = [];
                            _self.totalRolenumber = 0;
                            $.each(result.data,function (i,item) {
                                // _self.totalRolenumber = parseInt(item.userCount) + _self.totalRolenumber;
                                _self.totalRolenumber = parseInt(item.userCount) + _self.totalRolenumber;
                                _self.orgRoleList.push({
                                    roleId:item.roleId,
                                    roleName:item.roleName
                                });
                                roleList.push({
                                    remark: item.remark,
                                    roleId: item.roleId,
                                    roleName: item.roleName,
                                    userCount: item.userCount,
                                    checked: false
								});
                            });

                            _self.roleList = roleList;
                            //_self.totalRolenumber=0;
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
            },
            // 权限管理---全选管理：点击角色总数:全选/取消全选
            clickSelectAllRoleCount: function () {
                var _self = this;

                _self.selectAllRoleIds = !_self.selectAllRoleIds;

                _self.roleIdList=[];
                if (_self.selectAllRoleIds) {
                    $.each(_self.roleList,function(i,item){
                        item.checked = true;
                        _self.roleIdList.push(item.roleId);
                    });
                } else {
                    $.each(_self.roleList,function(i,item){
                        item.checked = false;
                    });
                };

                _self.getRoleListDetailFun(_self.roleIdList);

			},
            // 权限管理---全选管理：点击员工总数---:全选/取消全选
            clickSelectAllroleStaffs: function () {
                var _self = this;
                _self.selectAllRoleStaffIds = !_self.selectAllRoleStaffIds;

                _self.userIdList=[];
                if (_self.selectAllRoleStaffIds) {
                    $.each(_self.roleListDetail,function(i,item){
                        item.checked = true;
                        _self.userIdList.push(item.userId);
                    });
                } else {
                    $.each(_self.roleListDetail,function(i,item){
                        item.checked = false;
                    });
                };
			},
            // 权限管理---获取选中的roleIdList
			getSelectedRoleIdList: function (role) {
                var _self = this;
                var aRole = [];
                var isRoleCount = role == 'roleCount';
                var arr =[];

				isRoleCount? aRole = _self.roleList : aRole = _self.roleListDetail;

                $.each(aRole,function(i,peritem){
                    if (peritem.checked) {
                        isRoleCount? arr.push(peritem.roleId): arr.push(peritem.userId);
                    };
                });

                if(aRole.length > arr.length)  {
                    isRoleCount? _self.selectAllRoleIds = false : _self.selectAllRoleStaffIds = false;
				} else {
                    isRoleCount? _self.selectAllRoleIds = true : _self.selectAllRoleStaffIds = true;
				};

                return arr;
			},
            //权限管理---角色列表详情加载
            clickPerRow : function(item, role){
            	var _self = this;

                item.checked = !item.checked;

                if (role == 'roleCount') {
                    _self.roleIdList = _self.getSelectedRoleIdList('roleCount');
                    _self.getRoleListDetailFun(_self.roleIdList);
				} else {
					_self.userIdList = _self.getSelectedRoleIdList('roleStaff');
				};
            },
			// 权限管理--获取员工总数列表
			getRoleListDetailFun: function (idLists) {
                var _self = this;

                if (idLists.length == 0) {
                    _self.roleListDetail = [];
                    return false;
				};

                yzl.getAjax({
                    path : 'right/j/queryRoleStaff',
                    type : 'post',
                    data : {
                        hotelId: yzl.hotelId,
                        roleIdList: idLists
					},
                    sCallback : function (result) {
                        if (result.code == "0000") {
                        	var roleListDetail = [];
                            $.each(result.data,function (i,item) {
                                roleListDetail.push({
                                    idNumber: item.idNumber,
                                    mobile: item.mobile,
                                    remark: item.remark,
                                    roleId: item.roleId,
                                    roleName: item.roleName,
                                    userAccount: item.userAccount,
                                    userId: item.userId,
                                    userName: item.userName,
                                    checked: false
                                });
                            });
                            _self.roleListDetail = roleListDetail;
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });
			},
            //权限管理---角色全选绑定
            bindCheckAll : function(e){
	          	var _self = this;
            	$(".left-checkbox").click(function(){  
				    if(this.checked){    
				        $(".right-r-bottom tbody input:checkbox").prop("checked",true);  
				        $(".right-r-bottom tbody tr").addClass('active');
				        _self.roleIdList=[];
				    	$.each(_self.roleList,function(i,item){
				    		_self.roleIdList.push(item.roleId);
				    	});
					    var data = {
		            		hotelId: yzl.hotelId,
		            		roleIdList: _self.roleIdList
		            	};
		            	yzl.getAjax({
		                    path : 'right/j/queryRoleStaff', 
		                    type : 'post',
		                    data : data,
		                    sCallback : function (result) {
		                        if (result.code == "0000") {
		                        	_self.roleListDetail = [];
		                            _self.roleListDetail = result.data;
		                        } else {
		                            yzl.Dialog({
		                                content : result.msg,
		                                AutoClose: true
		                            });
		                        };
		                    }
		                });
				    }else{    
				        $(".right-r-bottom tbody input:checkbox").prop("checked", false); 
				        $(".right-r-bottom tbody tr").removeClass('active');
				        _self.roleListDetail = [];
				    };
				});
            },
            //权限管理---角色下的人员全选绑定
            bindCheckAlldetail:function(e){
            	var _self = this;
            	$(".right-checkbox").click(function(){  
				    if(this.checked){ 
				        $(".right-l-bottom tbody input:checkbox").prop("checked",true);   
				    }else{    
				        $(".right-l-bottom tbody input:checkbox").prop("checked", false); 
				    };
				}); 
            },
            //权限管理---选择角色
            addActive:function(e){
            	var _self = this;
            	_self.roleIdList=[];
            	e.stopPropagation();
            	Vue.nextTick(function(){
	            	if($(e.target).is(':checked')){
	            		$(e.target).parents('tr').addClass('active');
	            	}else{
	            		$(e.target).parents('tr').removeClass('active')
	            	}
            	});
            	$.each($('.right-r-bottom tbody input'),function(i,item){
            		if($(this).is(':checked')){
            			_self.roleIdList.push(_self.roleList[i].roleId);
            		}
            	});
            	var data = {
            		hotelId: yzl.hotelId,
            		roleIdList: _self.roleIdList
            	};
            	if(_self.roleIdList.length == 0){
            		_self.roleListDetail = [];
            		return false;
            	}else{
            		yzl.getAjax({
	                    path : 'right/j/queryRoleStaff', 
	                    type : 'post',
	                    data : data,
	                    sCallback : function (result) {
	                        if (result.code == "0000") {
	                            _self.roleListDetail = result.data;
	                        } else {
	                            yzl.Dialog({
	                                content : result.msg,
	                                AutoClose: true
	                            });
	                        };
	                    }
	                })
            	}
            },
            //权限管理---角色弹窗全选绑定
            bindroleCheckAll:function(){
            	$.each($(".checkbox-secondbox"),function(i,item){
            		if($(this).find('input').length == $(this).find('input:checked').length){
						$(this).siblings('.title-checkbox').find('.SecondcheckAll-pc').prop("checked",true);
						$(this).siblings('.title-checkbox').find('.SecondcheckAll-app').prop("checked",true);
					}else{
						$(this).siblings('.title-checkbox').find('.SecondcheckAll-pc').prop("checked",false);
						$(this).siblings('.title-checkbox').find('.SecondcheckAll-app').prop("checked",false);
					}
            	});
            	$(".checkAll-pc").unbind('click').click(function(){  
				    if(this.checked){    
				        $(".pc-checkboxBottom input:checkbox").prop("checked",true);   
				    }else{    
				        $(".pc-checkboxBottom input:checkbox").prop("checked", false); 
				    };
				}); 
				$(".checkAll-app").unbind('click').click(function(){  
				    if(this.checked){    
				        $(".app-checkboxBottom input:checkbox").prop("checked",true);   
				    }else{    
				        $(".app-checkboxBottom input:checkbox").prop("checked", false); 
				    };
				});  
				$(".SecondcheckAll-pc").unbind('click').click(function(){
					if(this.checked){ 
				        $(this).parent().siblings('.checkbox-secondbox').find('input').prop("checked",true);   
				    }else{    
				        $(this).parent().siblings('.checkbox-secondbox').find('input').prop("checked",false);   
				    };
				})
				$(".SecondcheckAll-app").unbind('click').click(function(){
					if(this.checked){ 
				        $(this).parent().siblings('.checkbox-secondbox').find('input').prop("checked",true);   
				    }else{    
				        $(this).parent().siblings('.checkbox-secondbox').find('input').prop("checked",false);   
				    };
				})
				$(".checkbox-secondbox input").on("click",function(){
					if($(this).parents('.checkbox-secondbox').find('input').length == $(this).parents('.checkbox-secondbox').find('input:checked').length){
						$(this).parents('.checkbox-secondbox').siblings('.title-checkbox').find('.SecondcheckAll-pc').prop("checked",true);
						$(this).parents('.checkbox-secondbox').siblings('.title-checkbox').find('.SecondcheckAll-app').prop("checked",true);
					}else{
						$(this).parents('.checkbox-secondbox').siblings('.title-checkbox').find('.SecondcheckAll-pc').prop("checked",false);
						$(this).parents('.checkbox-secondbox').siblings('.title-checkbox').find('.SecondcheckAll-app').prop("checked",false);
					}
				})
            },
            //权限管理---添加角色
            bindAddrole:function(){
            	var _self = this;
            	_self.titleName = '添加角色';
            	_self.authorityList=[];
		    	$('.role-List input').val('');
		    	$('.role-List textarea').val('');
		    	// $('.window-checkdel input:checked').prop('checked',false);
		    	yzl.getAjax({
                    path : 'right/j/getResource',	// right/j/queryRoleRight
                    type : 'post',
                    data : {
                    	hotelId: yzl.hotelId
                    },
                    sCallback : function (result) {
                        if (result.code == "0000") {
                        	/*_self.KKManagerApp='';
                        	_self.cloudHotelWeb='';
                        	_self.KKManagerApp=result.data.KKManagerApp;
                        	_self.cloudHotelWeb=result.data.cloudHotelWeb;*/
                            _self.KKManagerApp = _self.converQueryRole(result.data)['KKManagerApp'];
                            _self.cloudHotelWeb = _self.converQueryRole(result.data)['cloudHotelWeb'];
                        	$('.role-List').css('display','block');
							/*Vue.nextTick(function (){
								_self.bindroleCheckAll();
							});*/
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });
            },
			// 权限管理 --- 首级(全部授权)全选，取消
            firstSelectAll: function (obj) {
                var _self = this;
                obj.checked = !obj.checked;

                var list = obj.childList
                if (obj.checked) {
                	for (var prop in list) {		// 父级
                        list[prop].checked = true;
                        list[prop].resourceIdList = [];
                        for (var i=0; i<list[prop].childList.length; i++) {		// 孙级
                            list[prop].childList[i].checked = true;
                            list[prop].resourceIdList.push(list[prop].childList[i].resourceId);
						};
					};
				} else {
                    for (var prop in list) {
                        list[prop].checked = false;
                        list[prop].resourceIdList = [];
                        for (var i=0; i<list[prop].childList.length; i++) {
                            list[prop].childList[i].checked = false;
                        };
                    };
				};
			},
			// 权限管理 --- 次级全选、全取消
            secondarySelectAll: function (parItem, grandParItem) {
            	var _self = this;
                parItem.checked = !parItem.checked;
                parItem.resourceIdList = [];
                // 次级变化-----影响resourceIdList，孙级 和 父级变化
            	if (parItem.checked) {
            		for (var i=0; i<parItem.childList.length; i++) {
                        parItem.childList[i].checked = true;
                        parItem.resourceIdList.push(parItem.childList[i].resourceId);
                    };
                    //  父级变化----> 祖父级显示状态变化
                    grandParItem.checked = true;
                    for (var prop in grandParItem.childList) {
                        if (!grandParItem.childList[prop].checked) {
                            grandParItem.checked = false;
                            break;
                        };
                    };
				} else {
                    for (var i=0; i<parItem.childList.length; i++) {
                        parItem.childList[i].checked = false;
                    };
                    //  父级变化----> 祖父级显示状态变化
                    grandParItem.checked = false;
				};
			},
			// 权限管理 --- 孙级，单个状态改变
            changePerSelect: function (item, parItem, grandParItem) {
                var _self = this;
                item.checked = !item.checked;

                // 孙级变化----> 父级resourceIdList变化
                if (item.checked) {
                    parItem.resourceIdList.push(item.resourceId);
				} else {
                    var arrIdLists = [];
					for (var i=0; i<parItem.resourceIdList.length; i++) {
						if (parItem.resourceIdList[i] == item.resourceId) {
							continue;
						} else {
                            arrIdLists.push(parItem.resourceIdList[i]);
						};
					};
                    parItem.resourceIdList = arrIdLists;
				};

                // 孙级变化----> 父级显示状态变化, 即是否勾选
                if (parItem.resourceIdList.length == parItem.childList.length) {
                    parItem.checked = true;
                    //  孙级变化----> 祖父级显示状态变化
                    grandParItem.checked = true;
                    for (var prop in grandParItem.childList) {
                        if (!grandParItem.childList[prop].checked) {
                            grandParItem.checked = false;
                            break;
                        };
                    };
				} else {
                    parItem.checked = false;
                    //  孙级变化----> 祖父级显示状态变化
                    grandParItem.checked = false;
				};
			},
            //权限管理---添加角色保存
            saveAddrole:function(){
            	var _self = this;

                var arr=_self.getResourceIdList();
                var data = {
                    hotelId: yzl.hotelId,
                    roleName:_self.rolesingleDetail.roleName,
                    remark:_self.rolesingleDetail.remark,
                    resourceIdList:arr
                };

            	if( data.roleName == ''){
            		yzl.Dialog({
	                    content : '请输入角色名称！',
	                    AutoClose: true
	                });
	                return false;
            	}else if(arr == ''){
            		yzl.Dialog({
	                    content : '请为该角色进行对应授权！',
	                    AutoClose: true
	                });
            	}else{
            		yzl.getAjax({
	                    path : 'right/j/addRoleRight',
	                    type : 'post',
	                    data : data,
	                    sCallback : function (result) {
	                        if (result.code == "0000") {
				                $('.role-List').css('display','none');
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
            //权限管理---删除角色
            bindDelrole:function(){
            	var _self = this;

                if(_self.roleIdList.length == 0){
                    yzl.Dialog({
                        content : '请选择要删除的角色！',
                        AutoClose: true
                    });
                } else {
            		yzl.Dialog({
	                    content : '是否确认删除这'+_self.roleIdList.length+'条信息？',
	                    AutoClose: false,
	                    callback : function(callback){
	                    	var data = {
	                    		hotelId: yzl.hotelId,
	                    		roleIdList:_self.roleIdList
	                    	};
	                    	if(callback == true){
	                  		yzl.getAjax({
				                    path : 'right/j/deleteHotelRole',
				                    type : 'post',
				                    data : data,
				                    sCallback : function (result) {
				                        if (result.code == "0000") {
                                            _self.roleIdList = [];
                                            _self.selectAllRoleIds = false;
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
            },
            //权限管理---编辑角色
            bindEditrole:function(item,e){
            	var _self = this;
            	e.stopPropagation();
            	_self.titleName = '修改角色';
            	_self.rolesingleDetail=item;
            	_self.authorityList=[];
		    	var data = {
		    		hotelId: yzl.hotelId,
            		roleId: item.roleId
            	};
            	yzl.getAjax({
                    path : 'right/j/getResource', // right/j/queryRoleRight
                    type : 'post',
                    data : data,
                    loadingElem: '#windowCheckdel',
                    tips: false,
                    loadingTop: 300,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                        	/*_self.KKManagerApp=result.data.KKManagerApp;
                        	_self.cloudHotelWeb=result.data.cloudHotelWeb;*/
                            _self.KKManagerApp = _self.converQueryRole(result.data)['KKManagerApp'];
                            _self.cloudHotelWeb = _self.converQueryRole(result.data)['cloudHotelWeb'];

							 /*Vue.nextTick(function(){
								$.each(_self.roleResourceList, function(i,item) {
			                		$.each($('.role-List .pc-checkboxBottom input'),function(i,val){
				                		if($(this).val() == item.resourceId){
				                			$(this).prop({checked:true});  
				                		}
				                	});
				             	});
			                	$.each(_self.roleResourceList, function(i,item) {
			                		$.each($('.role-List .app-checkboxBottom input'),function(i,val){
				                		if($(this).val() == item.resourceId){
				                			$(this).prop({checked:true});  
				                		}
				                	});
								});
								_self.bindroleCheckAll();
							});*/
                            $('.role-List').css('display','block');
							
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });
           	},
			/*
			// 最终输出数据结构:
			 var obj = {
				 cloudHotelWeb: {
					 checked: true,
					 resourceName: '',
					 childList: {
						 cloudHotelCustomer: {
							 checked: true,
							 resourceName: '',
							 resourceIdList: [],
							 childList: [
								 {
									 resourceId: '',
									 resourceName: '',
									 checked: false
								 }
							 ]
						 },
						 cloudHotelFinance: {

						 }
					 }
				 },
			 	 KKManagerApp: {}
			 }

			 // 后台数据
				 {
					 "KKManagerApp": {
						 "appLock": [{
							 "haveThisResourceForRole": false,
							 "moduleCode": null,
							 "moduleName": "锁具",
							 "productCode": null,
							 "productName": "KK管家app",
							 "resourceCode": null,
							 "resourceId": "8",
							 "resourceName": "锁具"
						 }],
						 "appCleaning": [{
							 "haveThisResourceForRole": false,
							 "moduleCode": null,
							 "moduleName": "保洁",
							 "productCode": null,
							 "productName": "KK管家app",
							 "resourceCode": null,
							 "resourceId": "6",
							 "resourceName": "保洁"
						 }]
					 },
					 "cloudHotelWeb": {
						 "cloudHotelRoomState": [{
							 "haveThisResourceForRole": true,
							 "moduleCode": null,
							 "moduleName": "房态",
							 "productCode": null,
							 "productName": "酒店云管理系统",
							 "resourceCode": null,
							 "resourceId": "10",
							 "resourceName": "房态"
						 }],
						 "cloudHotelReports": [{
							 "haveThisResourceForRole": false,
							 "moduleCode": null,
							 "moduleName": "报表",
							 "productCode": null,
							 "productName": "酒店云管理系统",
							 "resourceCode": null,
							 "resourceId": "14",
							 "resourceName": "报表"
						 }]
					}
				 }
			 */
			// 处理后台数据
            converQueryRole: function (list) {
            	var _self = this;
            	var obj = {};

                for (var item in list) {
                    if (list.hasOwnProperty(item)) {
                        obj[item] = {
                            checked: true,
                            productName: '',
                            childList: {}
                        };
                        var smList = list[item];
                        for (var childItem in smList) {		// item == cloudHotelWeb / KKManagerApp
                            if (smList.hasOwnProperty(childItem)) {
                                // get obj resourceName
                                if (obj[item].productName == '') obj[item].productName = smList[childItem][0].productName;
                                obj[item].childList[childItem] = {		// childItem ==>  appLock / appCleaning / cloudHotelRoomState / cloudHotelReports
                                    checked : true,
                                    moduleName: '',
                                    resourceIdList: [],
                                    childList: []
                                };

                                for (var i=0; i<smList[childItem].length; i++) {
                                    // smList[childItem] ==> "cloudHotelReports": [{
                                    //     "haveThisResourceForRole": false,
                                    //     "moduleCode": null,
                                    //     "moduleName": "报表",
                                    //     "productCode": null,
                                    //     "productName": "酒店云管理系统",
                                    //     "resourceCode": null,
                                    //     "resourceId": "14",
                                    //     "resourceName": "报表"
                                    //  }]
                                    if (obj[item].childList[childItem].moduleName == '') obj[item].childList[childItem].moduleName = smList[childItem][i].moduleName;
                                    if (smList[childItem][i].haveThisResourceForRole) {
                                        obj[item].childList[childItem]['resourceIdList'].push(smList[childItem][i].resourceId);
                                    };
                                    var smObj = {
                                        resourceId: smList[childItem][i].resourceId,
                                        resourceName: smList[childItem][i].resourceName,
                                        checked: smList[childItem][i].haveThisResourceForRole
                                    };

                                    obj[item].childList[childItem]['childList'].push(smObj);
                                };

                                if (obj[item].childList[childItem].resourceIdList.length == obj[item].childList[childItem].childList.length) {
                                    obj[item].childList[childItem].checked = true;
                                } else {
                                    obj[item].childList[childItem].checked = false;
                                    obj[item].checked = false;
                                };
                            };
                        };
                    };
                };

                return obj;
			},
			// 权限管理 --- 获取 resourceIdList
			getResourceIdList: function () {
            	var _self = this;
				var cloudHotelWeb = _self.cloudHotelWeb.childList;
				var KKManagerApp = _self.KKManagerApp.childList;
				var list = [];

                getListId(cloudHotelWeb);
                getListId(KKManagerApp);

				function getListId(obj) {
					for (var prop in obj) {
                        if (obj.hasOwnProperty(prop)) {
                            list = list.concat(obj[prop].resourceIdList);
						};
					};
				};

				return list;
			},
           	//权限管理---编辑角色保存
            saveEditrole:function(){
            	var _self = this;
            	var arr=_self.getResourceIdList();
            	/*$.each($('.role-List .pc-checkboxBottom input'),function(){
            		if($(this).is(':checked') && $(this).attr('id') != 'secondCheckbox'){
            			arr.push($(this).val());
            		}
            	});
            	$.each($('.role-List .app-checkboxBottom input'),function(){
            		if($(this).is(':checked') && $(this).attr('id') != 'secondCheckbox'){
            			arr.push($(this).val());
            		}
            	});*/
            	var data = {
            		hotelId: yzl.hotelId,
            		roleId:_self.rolesingleDetail.roleId,
            		roleName:_self.rolesingleDetail.roleName,
            		remark:_self.rolesingleDetail.remark,
            		resourceIdList:arr
            	};
            	yzl.getAjax({
                    path : 'right/j/updateRoleRight', 
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                        	$('.role-List').css('display','none');
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });
           	},
           	//权限管理---添加角色详细人员
           	bindAddroleDetail:function(){
            	var _self = this;
            	_self.titleName = '新增人员';
            	$('.role-Listdetail').css('display','block');
            	$('.role-Listdetail-tips').css('display','block');
				$('.window-head i').on("click",function(){
		    		$('.role-List').css('display','none');
		    		_self.titleName='新增人员';
		    	});
		    	_self.roleListsingleDetail='';
		    	$('.role-Listdetail input').val('');
		    	$('.role-Listdetail .roll-table thead input').unbind('blur').blur(function(e){
		    		
                });
            },
            //搜索KK号/手机号
            searchKKNo:function(){
            	var _self = this;
            	if(_self.roleListsingleDetail.userAccount != ''){
				    	var data={
				    		hotelId: yzl.hotelId,
				    		userAccount: _self.roleListsingleDetail.userAccount
				    	};
		    			yzl.getAjax({
		                    path : 'right/j/queryUserInfo',
		                    type : 'post',
		                    data : data,
		                    sCallback : function (result) {
		                        if (result.code == "0000") {
		                        	_self.roleListsingleDetail = result.data;
		                        } else {
		                            yzl.Dialog({
		                                content : result.msg,
		                                AutoClose: true
		                            });
		                        };
		                    }
		                })
		    		}else{
						return false;
		    		}		
            },
            //权限管理---保存添加人员
            saveAddroleDetail:function(event){
            	var _self = this;
            	event.target.blur();
            	if(_self.roleListsingleDetail.userId == null){
            		yzl.Dialog({
	                    content : 'KK号/手机号不能为空',
	                    AutoClose: true,
	                });
	                return false;
            	}else{
            		var _self = this;
	            	var data = {
	            		hotelId: yzl.hotelId,
	            		userId: _self.roleListsingleDetail.userId,
	            		roleId: $('.role-Listdetail option:selected').val()
	            	};
	            	yzl.getAjax({
	                    path : 'right/j/addHotelStaff', 
	                    type : 'post',
	                    data : data,
	                    sCallback : function (result) {
	                        if (result.code == "0000") {
				                $('.role-Listdetail').css('display','none');
				                _self.initData();
	                        } else {
	                            yzl.Dialog({
	                                content : result.msg,
	                                AutoClose: true
	                            });
	                        };
	                    }
	                })
            	}
            },
            //权限管理---编辑人员详细
           	bindEditroleDetail:function(item){
            	var _self = this;
            	_self.titleName = '修改人员信息';
            	$('.role-Listdetail').css('display','block');
            	$('.role-Listdetail-tips').css('display','none');
              	_self.roleListsingleDetail=item;
              	$.each($('.role-Listdetail option'),function(i,items){
              		if($(this).html() == _self.roleListsingleDetail.roleName){
              			$(this).attr("selected", true);
              		}
              	})
              	
            },
            //权限管理---保存编辑人员信息
            saveEditroleDetail: function(){
            	var _self = this;
            	_self.checkedStatus=[];
            	$.each($('.right-r-bottom tbody input:checked'),function(i,item){
            		_self.checkedStatus.push($(this).val());
            	});
            	var data={
              		hotelId: yzl.hotelId,
              		userId: _self.roleListsingleDetail.userId,
              		roleId: $('.role-Listdetail option:selected').val()
              	};
              	yzl.getAjax({
                    path : 'right/j/updateUserRole', 
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                        	_self.initData();
			                $('.role-Listdetail').css('display','none');
			                Vue.nextTick(function(){
								$.each(_self.checkedStatus, function(i,item) {
				                	$.each($('.right-r-bottom tbody input'),function(i,items){
				                		if($(this).val() == item){
				                			$(this).prop({checked:true});  
				                		}
				                	})
				                });
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
            //权限管理---删除角色下的用户
            bindDelroledetail:function(){
            	var _self = this;

            	if(_self.userIdList.length == 0){
                    yzl.Dialog({
                        content : '请选择要删除的员工！',
                        AutoClose: true
                    });
            	} else {
            		yzl.Dialog({
	                    content : '是否确认删除这'+_self.userIdList.length+'条信息？',
	                    AutoClose: false,
	                    callback : function(callback){
	                    	var data = {
	                    		hotelId: yzl.hotelId,
	                    		userIdList:_self.userIdList
	                    	};
	                    	if(callback == true){
	                  		yzl.getAjax({
				                    path : 'right/j/deleteHotelStaff',
				                    type : 'post',
				                    data : data,
				                    sCallback : function (result) {
				                        if (result.code == "0000") {
							                _self.initData();
                                            _self.userIdList = [];
                                            _self.selectAllRoleStaffIds = false;
                                            _self.getRoleListDetailFun(_self.roleIdList);
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
            },
        }    
	});


	authorityManageVue.initEvent();


    authorityManageVue.$watch('roleList', function(newVal, oldVal) {
        compareLen (newVal.length, authorityManageVue.roleListDetail.length);
    });

    authorityManageVue.$watch('roleListDetail', function (newVal, oldVal) {
        compareLen (authorityManageVue.roleList.length, newVal.length);
    });

    function compareLen (roomTypeLen, roomsTotalLen) {
        authorityManageVue.showBorderRight = {};
        authorityManageVue.showBorderLeft = {};
        if (roomTypeLen >= roomsTotalLen) {
            authorityManageVue.showBorderRight = {
                'border-right': '1px solid #ccc'
            };
        } else {
            authorityManageVue.showBorderLeft = {
                'border-left': '1px solid #ccc'
            };
        };
    };

	
})(window, document, jQuery, yzlObj);