;(function (window, document, $, yzl) {
	var waitingOrder = new Vue({
        el : '#waitingOrder',
        data: {
        	// 分页参数
            cur: 1,
            all: 0,
            msg: '',
            pageup: 10,
            pagedown: 10,
        	orderMessage:'',
        	// 新增定制时段
            addTimeRange: {
                roomTypeId : '',
                startDate : '',
                endDate : '',
                remark : ''
            },
            // 请求入参
            waitingOrderInfo:{
            	hotelId: yzl.hotelId,
                searchFlagList:['1','2','3','4'],
                pageSize:'15',
                pageNum:'1'
            },
            // check-box初始化
            checkBoxInit: [
                {
                    id: 'w_uncheckin',
                    value: '1',
                    checked: true,
                    zh_cn: '今日未入住'
                },
                {
                    id: 'w_uncheckout',
                    value: '2',
                    checked: true,
                    zh_cn: '今日未退房'
                },
                {
                    id: 'w_overdue_uncheckin',
                    value: '3',
                    checked: true,
                    zh_cn: '逾期未入住'
                },
                {
                    id: 'w_overdue_uncheckout',
                    value: '4',
                    checked: true,
                    zh_cn: '逾期未退房'
                }
            ],
            checkBoxCss: {
                listbox: {
                    'display': 'inline-block'
                },
                perbox: {
                    'margin-right': '20px'
                }
            },
            // check-box 初始化end
            // 权限管理
            waitingOrderResourceInfo: JSON.parse(sessionStorage.getItem("Cookie_headerResourceInfo"))
        },
        watch: {
        	// 分页跳转监听
            cur: function (newVal, oldVal) {
            	var _self = this;
                _self.waitingOrderInfo.pageNum = newVal;
                this.initData();
			},
            //订单查询状态监听
            'waitingOrderInfo.searchFlagList':function(newVal) {
                var _self = this;
                _self.initData();
            }
        },
        // 引入分页组件
        components:{
            'vue-nav': paginationVue,
            'icheck-box': yzlObj.multiCheckboxVue
        },
		methods: {
            swiftCheckBoxStatus: function (item) {
                item.checked = !item.checked;
            },
			// 初始化事件
            initEvent: function () {
                this.initData();
            },
            // 初始化数据
            initData: function () {
            	var _self = this;
                var data = _self.waitingOrderInfo;
                var path = 'order/j/getUntreatedList';
                yzl.getAjax({
                    path : path,
                    type : 'post',
                    data : data,
                    fadeInElem: '#waitingOrder',
                    loadingElem: '#mianContent',
                    tips: false,
                    loadingTop: 200,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.orderMessage = result.data;
                            if (_self.orderMessage.list.length == 0) {
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
                            _self.all = result.data.pages;
                            _self.cur = result.data.pageNum;
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });
            },
            //待处理订单---点击下拉
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
	
	    waitingOrder.initEvent();


        // 订单详情修改后，需要刷新uncheckinOrder的initData
        yzl.contentVue.initPageData = waitingOrder.initData;

   
})(window, document, jQuery, yzlObj);
	

