;(function (window, document, $, yzl) {
	var uncheckinOrder = new Vue({
        el : '#uncheckinOrder',
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
            uncheckinChannelList:[],
                // selected val list
            channleCodelist:[],
                // seratch text
            selectText: '搜索请输入...',
                // multi select
            isMultiple: true,
            uncheckinChannelElemId: 'uncheckinChannelElemId',
                // default selected
            isSelected: true,
            // select vue end
            initdata:{
                hotelId: yzl.hotelId,
                channelCodeList:[],
                channelOrderNo:'',
                roomNo:'',
                customer:'',
                orderStatus:1,
                fromDate: new Date(new Date().getTime() - 86400000*7).format('yyyy-MM-dd'),
                toDate: new Date(new Date().getTime() + 86400000*14).format('yyyy-MM-dd'),
                pageSize:'15',
				pageNum:'1'
            },
            // 未入住权限
            uncheckinOrderResourceInfo: JSON.parse(sessionStorage.getItem("Cookie_headerResourceInfo"))
        },
        // 分页跳转监听
        watch: {
            cur: function (newVal, oldVal) {
                var _self=this;
                _self.initdata.pageNum = newVal;
                _self.initData();
            },
        },
        // 引入分页组件
        components:{
            'vue-nav': paginationVue,
            'iselect-name': yzlObj.multiSelectVue
        },
		methods: {
            // 初始化事件
            initEvent: function () {
                this.initChannel();
                this.initData();
            },
            // 初始化数据
            initData: function () {
                var _self = this;
                var  exportAddress = '/yzlpms/order/excel/list?';
                /*_self.channleCodelist=[];
            	$.each($('#channelSecondLi input:checked'),function(){
            		var target = $(this).attr('id');
            		_self.channleCodelist.push(target);
            	});*/
            	_self.initdata.channelCodeList = _self.channleCodelist;
            	var path = 'order/j/list';
                yzl.getAjax({
                    path : path,
                    type : 'post',
                    data : _self.initdata,
                    fadeInElem: '#uncheckinOrder',
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
                            _self.all = result.data.pages;
                            $.each(_self.initdata,function(key,val){
                            	if(val == '' || key == 'pageSize' || key == 'pageNum'){

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
            // 日期插件
            finaDepositDate: function () {

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
                            _self.uncheckinChannelList = result.data.channelForQueryList;
                            _self.saveComonList = result.data;

                            _self.all = result.data.pages;
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
            //未入住订单---渠道下拉
            /*channelSlideDown:function(event){
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
           /* bindChannelCheckAll:function(e){
                if(e.target.checked){
                    $("#channelSecondLi input").prop("checked",true);
                    $('.slide-out .slide-layout').html('已选'+ ($('.slide-inner input:checked').length-1) +'个渠道');
                }else{
                    $("#channelSecondLi input").prop("checked",false);
                    $('.slide-out .slide-layout').html('已选'+ $('.slide-inner input:checked').length +'个渠道');
                }
            },*/
			//未入住订单---点击下拉
            slideDownMoreDetail: function (index) {
				var _self = this;
				$('.tb-close' + index).fadeToggle();
			},
            //  房间时间列表---点击占用房间---查看订单详情
            openRoomOrderDetails: function (orderId) {
                yzl.contentVue.openRoomOrderDetails(orderId);
            }
        }
    });
	
	    uncheckinOrder.initEvent();
        // 订单详情修改后，需要刷新uncheckinOrder的initData
        yzl.contentVue.initPageData = uncheckinOrder.initData;

		
})(window, document, jQuery, yzlObj);
	

