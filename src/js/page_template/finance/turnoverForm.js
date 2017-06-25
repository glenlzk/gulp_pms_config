
;(function (window, document, $, yzl) {

    var turnoverForm = new Vue({
        el : '#turnoverForm',
        data: {
        	// 分页参数
            cur: 1,
            all: 0,
            msg: '',
            pageup: 10,
            pagedown: 10,
        	turnoverInfo:'',
        	turnoverInfoList:[],
        	pages:'',
        	list:[],
        	btnpageList:[],
        	turnoverInfoDetail:{},
        	pageListNum:1,
        	printInfo:{},
        	initdata:{
        		hotelId:yzl.hotelId,
				userName:'',
				pageSize:'15',
				pageNum:'1',
        	},
        	//权限管理
            financeResourceInfo : yzl.resourceInfo,
        },
        // 分页跳转监听
        watch: {
            cur: function (newVal, oldVal) {
                var _self = this;
                _self.initdata.pageNum = newVal;
                _self.initData();
            },
        },
        // 引入分页组件
        components:{
            'vue-nav': paginationVue
        },
        methods: {
        	// 分页点击监听:
            listen:function(data){
                //this.msg = '你点击了'+data+ '页';
            },
            // 初始化事件
            initEvent: function () {
                this.initData();
            },
            // 初始化数据
            initData: function () {
            	var _self = this;
                var data = _self.initdata;
                var path = 'changeShift/j/list';
                yzl.getAjax({
                    path : path,
                    type : 'post',
                    data : data,
                    fadeInElem: '#turnoverForm',
                    loadingElem: '#mianContent',
                    tips: false,
                    loadingTop: 300,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.turnoverInfoList = result.data.list;
                            _self.turnoverInfo = result.data;
                            if (_self.turnoverInfoList.length == 0) {
                                yzl.noDataTips ({
                                    top: 70,
                                    content: '您的门店暂时没有该类订单',
                                    parElem: '#rightContentBottom',
                                    url:path
                                });
							} else {
                                yzl.removeNoDataElems();
                            };
                            // 分页
                            _self.cur = result.data.pageNum;
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
            // 交接班---查询
            searchOrder:function(){
            	var _self=this;
            	_self.initdata.pageNum = 1;
                _self.initData();
            },
			//查看交班单详情
			showturnoverDetail:function(item){
				var _self=this;
				$('.turnover-window-mask').css('display','block');
				_self.printInfo = item;
				yzl.getAjax({
                    path : 'changeShift/j/viewChange',
                    type : 'post',
                    data : {
                    	hotelId:yzl.hotelId,
                    	changeShiftId:item.changeShiftId
                    },
                    loadingElem: '#turnoverWindow',
                    tips: false,
                    loadingTop: 300,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                           	_self.turnoverInfoDetail = result.data;
                           	$('.turnover-window-mask i').on("click",function(){
								$('.turnover-window-mask').css('display','none');
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
			//打印交班表
			printme:function (){
				var _self = this;
				// /hotel/print/initprint.html
                var Expaddress = yzl.printDirectory + '?changeShiftId=' + _self.printInfo.changeShiftId + '&hotelId=' + yzl.hotelId;
                $('.printIframe').attr('src',Expaddress); 
       		}
        },
    });
    turnoverForm.initEvent();

  
})(window, document, jQuery, yzlObj);