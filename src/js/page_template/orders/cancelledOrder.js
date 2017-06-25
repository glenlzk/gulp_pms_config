;(function (window, document, $, yzl) {
	var cancelledOrder = new Vue({
        el : '#cancelledOrder',
        data: {
        	// 分页参数
            cur: 1,
            all: 0,
            msg: '',
            pageup: 10,
            pagedown: 10,
        	orderInfo:[],
        	orderMessage:'',
        	// 新增定制时段
            addTimeRange: {
                roomTypeId : '',
                fromDate : '',
                toDate : '',
                remark : ''
            },
            pageList:[],
            pages:'',
            pageListNum:1,
            // select vue start
            	// initList
            cancelChannelList:[],
				// selected val list
            channleCodelist:[],
            	// seratch text
            selectText: '搜索请输入...',
            	// multi select
            isMultiple: true,
            cancelChannelElemId: 'cancelChannelElemId',
            	// default selected
            isSelected: true,
            // select vue end
            handleOrderInfo:'',
            singleHandleInfo:'',
            CancelStatus:1,
            PayTypeList:'',
            initdata:{
                hotelId: yzl.hotelId,
                channelCodeList:[],
                channelOrderNo:'',
                roomNo:'',
                customer:'',
                orderStatus:4,
                fromDate: new Date(new Date().getTime() - 86400000*7).format('yyyy-MM-dd'),
                toDate: new Date(new Date().getTime() + 86400000*14).format('yyyy-MM-dd'),
                pageSize:'15',
				pageNum:'1'
            },
            submitdata:{
            	hotelId:yzl.hotelId,
            	orderId:'',
            	imageId:'',
            	payNo:'',
				payTypeCode:'',
				payTypeName:'',
				payAmount:'',
				remark:'',
            },
            // 已取消订单---上传附件（支付类型附件）--start
            'collectionImgBtn': 'collectionImgBtn',
            'collectionParam': {
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
            'collectionBackImgInfor': {},
            // 已取消订单---上传附件（支付类型附件）--end
            uploadCollectionFilesUrl:null,
            collectionStatus:1,
            //权限管理
            cancelledOrderResourceInfo: JSON.parse(sessionStorage.getItem("Cookie_headerResourceInfo"))
        },
        // 分页跳转监听
        watch: {
            cur: function (newVal, oldVal) {
                var _self=this;
                _self.initdata.pageNum = newVal;
                _self.initData();
            },
            // 已取消订单---上传附件--上传成功返回url
            collectionBackImgInfor: function (newVal) {
                var _self = this;

                _self.submitdata.imageId = newVal.imageId;
                _self.uploadCollectionFilesUrl = newVal.imageUrl;
			},
        },
        // 引入分页组件
        components:{
            'vue-nav': paginationVue,
            'iselect-name': yzlObj.multiSelectVue,
            'v-uploadify': yzlObj.uploadifyVue
        },
		methods: {
			// 初始化事件
            initEvent: function () {
            	this.initChannel();
				this.initData();
            },
            // 初始化数据
            initData: function () {
            	var  exportAddress = '/yzlpms/order/excel/list?';
            	var _self = this;
            	/*_self.channleCodelist=[];
            	$.each($('#channelSecondLi input:checked'),function(){
            		var target = $(this).attr('id');
            		_self.channleCodelist.push(target);
            	});*/
            	if (_self.cancelChannelList.length == _self.channleCodelist.length) {
                    _self.initdata.channelCodeList = [];
				} else {
                    _self.initdata.channelCodeList = _self.channleCodelist;
                };
				_self.uploadCollectionFilesUrl = null;
            	var path = 'order/j/list';
                yzl.getAjax({
                    path : path,
                    type : 'post',
                    data : _self.initdata,
                    fadeInElem: '#cancelledOrder',
                    loadingElem: '#mianContent',
                    tips: false,
                    loadingTop: 200,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                        	var exporttableList ={};
                            _self.orderInfo = result.data.list;
                            _self.orderMessage = result.data;
                            if (_self.orderInfo.length == 0) {
                                yzl.noDataTips ({
                                    top: 70,
                                    content: '您的门店暂时没有该类订单',
                                    parElem: '#rightContentBottom',
                                    url:path
                                });
							}else {
                                yzl.removeNoDataElems();
                            };
                            // 分页
                            _self.cur = result.data.pageNum;
                            _self.all = result.data.pages;
                            $.each(_self.initdata,function(key,val){
                            	if(val == '' || key == 'pageSize' || key == 'pageNum'){
                            		;
                            	}else{
                            		exporttableList[key] = val;
                            	}
                            });
                            $.each(exporttableList,function(key,val){	
                            	if($.isArray(val)){
                            		$.each(val,function(i,item){
                            			exportAddress += key + '['+i+']=' + item + '&';
                            		})
                            	}else{
                            		exportAddress += key + '=' + val + '&';
                            	}
                            });
                            var s = exportAddress;
                            s=s.substring(0,s.length-1);
                            exportAddress = s;
                            Vue.nextTick(function(){
                            	$('.ExportTableBtn a').attr('href',exportAddress); 
								$('.table-list i').on("click",function(){
									if($(this).hasClass('active')){
										$(this).removeClass('active').html('+');
									}else{
										$(this).addClass('active').html('-');
									}
							   		$(this).parent().siblings(".slideDownbox").stop().slideToggle();
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
            //初始化渠道信息
            initChannel: function(){
            	var _self = this;
            	var Data={
            		hotelId : yzl.hotelId
            	};
            	yzl.getAjax({
                    path : 'order/j/commonList',
                    type : 'post',
                    data : Data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.cancelChannelList = result.data.channelForQueryList;
                            _self.PayTypeList = result.data.payTypeList;
                            _self.submitdata.payTypeCode = _self.PayTypeList[0].code;
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
            // 待处理订单---查询
            searchOrder:function(){
            	var _self = this;
            	_self.initdata.pageNum = 1;
				_self.initData();
            },
			//未入住订单---处理弹窗
			showHandle:function(item){
				var _self=this;
				if((_self.cancelledOrderResourceInfo.cloudHotelOrderCancelProcess && item.cancelStatus == 0) ||  (_self.cancelledOrderResourceInfo.cloudHotelOrderCancelProcessDetail && item.cancelStatus == 1)){
					if(item.cancelStatus == 1){
						_self.CancelStatus = 1;
					}else{
						_self.CancelStatus = 0;
					}
					yzl.getAjax({
	                    path : 'order/j/getCancelDetail',
	                    type : 'post',
	                    data : {
	                    	hotelId:yzl.hotelId,
	                    	orderId:item.orderId
	                    },
	                    loadingElem: '#handleWindow',
	                    tips: false,
	                    loadingTop: 150,
	                    sCallback : function (result) {
	                        if (result.code == "0000") {
	                           	_self.singleHandleInfo = result.data;
	                           	_self.uploadCollectionFilesUrl = _self.singleHandleInfo.imageUrl
	                           	$('.handle-window-mask').css('display','block');
	                           	$('.handle-window-title i').on("click",function(){
	                           		_self.submitdata = {
						            	hotelId:yzl.hotelId,
						            	orderId:'',
						            	imageId:'',
						            	payNo:'',
										payTypeCode:_self.PayTypeList[0].code,
										payTypeName:'',
										payAmount:'',
										remark:'',
						            };
						            _self.uploadCollectionFilesUrl = null;
						            _self.collectionStatus = 1;
	                           		$('.handle-window-mask').css('display','none');
	                           	})
	                        } else {
	                            yzl.Dialog({
	                                content : result.msg,
	                                AutoClose: true
	                            });
	                        };
	                    }
	                });
				}else{
					return false;
				};
			},
			//未入住订单---处理弹窗提交
			SaveshowHandle:function(){
				var _self=this;
				if(_self.collectionStatus == 1){
					if(_self.submitdata.payAmount < 0){
						yzl.Dialog({
	                        content : '请输入金额',
	                        AutoClose: true
	                    });
					}else if(_self.submitdata.payAmount == 0 || _self.submitdata.payAmount == null){
						yzl.Dialog({
	                        content : '取消处理没有收款，确定处理完毕吗？',
	                        AutoClose: false,
	                        callback : function(callback){
	                        	if(callback == true){
	                        		_self.sendHandle();
	                        	}
	                        }
	                    });
					}else{
						_self.sendHandle();
					}
				}else{
					if(_self.submitdata.payAmount <= 0 || _self.submitdata.payAmount == null){
						yzl.Dialog({
	                        content : '请输入金额',
	                        AutoClose: true
	                    });
					}else{
						_self.submitdata.payAmount = -(_self.submitdata.payAmount);
						_self.sendHandle();
					}
				}
			},
			//  已取消订单弹窗---上传附件
			previewUploadImage: function (url) {

                var _self = this;
                var imgList = [];

                imgList.push(url);

                yzl.contentVue.previewImagesList = imgList;
			},
			//未入住订单---发送请求
			sendHandle:function(){
				var _self = this;
				_self.submitdata.orderId = _self.singleHandleInfo.orderId;
				_self.submitdata.payTypeName = $('.cancelorder-payType option:selected').html();
				yzl.getAjax({
                    path : 'order/j/cancelConfirm',
                    type : 'post',
                    data : _self.submitdata,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                           	yzl.Dialog({
                                content : '处理成功！',
                                AutoClose: true
                            });
                            $('.handle-window-mask').css('display','none');
                            $('.remarkTextarea').val('');
                           	$('.cancelorder-payAmount').val('');
                           	_self.submitdata = {
				            	hotelId:yzl.hotelId,
				            	orderId:'',
				            	imageId:'',
				            	payNo:'',
								payTypeCode:_self.PayTypeList[0].code,
								payTypeName:'',
								payAmount:'',
								remark:'',
				            };
				            _self.collectionStatus = 1;
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
			/*//未入住订单---渠道下拉
			channelSlideDown:function(event){
				var e = event || window.event;
				e.stopPropagation();
				if (e.target.id == 'slide_layout') {
					$('.slide-out .slide-inner').stop().slideToggle(200);
				};
				if(e.target.id == 'channelCheckAll'){
					return false
				}else{
					if($('#channelCheckAll').prop('checked')){
						$('.slide-out .slide-layout').html('已选'+ ($('.slide-inner input:checked').length-1) +'个渠道');
					}else{
						$('.slide-out .slide-layout').html('已选'+ $('.slide-inner input:checked').length +'个渠道');
					}
				};
				$(document.body).unbind('click').on('click', function (e) {
					if (e.target.id != 'slide_layout_box') {		/!* && e.target.id != "slide_inner"*!/
						$('.slide-out .slide-inner').slideUp(200);
					};
				});
			},*/
			//未入住订单---渠道下拉全选
			/*bindChannelCheckAll:function(e){
				if(e.target.checked){
					$("#channelSecondLi input").prop("checked",true);  
					$('.slide-out .slide-layout').html('已选'+ ($('.slide-inner input:checked').length-1) +'个渠道');
				}else{
					$("#channelSecondLi input").prop("checked",false);   
					$('.slide-out .slide-layout').html('已选'+ $('.slide-inner input:checked').length +'个渠道');
				}
			},*/
			//已取消订单---点击下拉
            slideDownMoreDetail: function (index) {
				var _self = this;
				$('.tb-close' + index).fadeToggle();
			},
            //  房间时间列表---点击占用房间---查看订单详情
            openRoomOrderDetails: function (orderId) {
                yzl.contentVue.openRoomOrderDetails(orderId);
            },
            //切换收款/退款状态
            changeCollectionStatus:function(status){
            	var _self = this;
            	if(_self.collectionStatus == status){
            		return false;
            	}else{
            		_self.collectionStatus = status;
            	}
            }
        }
    });
	
	    cancelledOrder.initEvent();

        // 订单详情修改后，需要刷新cancelledOrder的initData
        yzl.contentVue.initPageData = cancelledOrder.initData;


		
})(window, document, jQuery, yzlObj);
	

