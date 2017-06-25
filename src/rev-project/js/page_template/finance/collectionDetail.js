
;(function (window, document, $, yzl) {

    var collectionDetail = new Vue({
        el : '#collectionDetail',
        data: {
            // 分页参数
            isNullSelect:'0',
            cur: 1,
            all: 0,
            total: 0,
            pageup: 10,
            pagedown: 10,
            // select vue start
                // initList
            searchChannelList:[],
                // selected val list
            channleCodelist:[],
                // seratch text
            selectText: '搜索请输入...',
                // multi select
            isMultiple: true,
            searchChannelElemId: 'searchChannelElemId',
                // default selected
            isSelected: true,
            // select vue end
            // 支付方式下拉框---start
            payTypeList: [],
            payTypeElemId: 'payTypeElemId',
            // 支付方式下拉框---end
            // 操作人下拉框---start
            receiptuserList: [],
            receiptuserElemId: 'receiptuserElemId',
            // 操作人下拉框---end
            // id: otherSearchElemId start
            otherSearchList: [
                {
                    code: 'customerName',
                    name: '预订人'
                },
                {
                    code: 'customerMobile',
                    name: '手机号'
                },
                {
                    code: 'payNo',
                    name: '支付编号'
                },
                {
                    code: 'orderNo',
                    name: '订单号'
                }
            ],
            otherSearchSelectedElem:'customerName',
            otherSearchElemId: 'otherSearchElemId',
            // id: otherSearchElemId end
            // 页面初始化数据
            orderReceiptList: [],
            // 入参: 筛选
            finaReceiptList: {
                hotelId: yzl.hotelId,
                fromDate: new Date(new Date().getTime() - 86400000*29).format('yyyy-MM-dd'),
                toDate: new Date().format('yyyy-MM-dd'),
                receiptUserId: '',
                channelCodeList: [],
                payTypeCode: '',
                // 查询条件---预订人/手机号/支付编号/订单号
                queryTerms: '',
                // 查询条件---值
                queryTermsVal: '',
                // 分页-----
                // 当前页
                pageNum: 1,
                // 每页显示几条
                pageSize: 15
            },
            // 权限管理
            collectionDetailResourceInfo: JSON.parse(sessionStorage.getItem("Cookie_headerResourceInfo"))
        },
        // 分页跳转监听
        watch: {
            cur: function (newVal, oldVal) {
                var _self = this;
                _self.finaReceiptList.pageNum = newVal;
                this.initData();
            },
            searchChannelList: function () {

            }
        },
        // 引入分页组件
        components:{
            'vue-nav': paginationVue,
            'iselect-name': yzlObj.multiSelectVue
        },
        methods: {
            // 初始化事件
            initEvent: function () {
                var _self = this;
                this.initData();
                this.getSearchList();
            },
            // 初始化数据
            initData: function () {
                var _self = this;
				var  exportAddress = '/yzlpms/finance/excel/list?';
                _self.finaReceiptList.channelCodeList = _self.channleCodelist;
                var data = _self.finaReceiptList;
                data[data.queryTerms] = data.queryTermsVal;
				var path = '/orderFinance/j/finaReceiptList';
                yzl.getAjax({
                    path: path,
                    type: 'post',
                    data: data,
                    fadeInElem: '#collectionDetail',
                    loadingElem: '#mianContent',
                    tips: false,
                    loadingTop: 300,
                    sCallback: function (result) {
                        if (result.code == "0000") {
                        	var exporttableList ={};
                            _self.orderReceiptList = result.data.list;
                            if (_self.orderReceiptList.length == 0) {
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
                            _self.total = result.data.total;
                            $.each(_self.finaReceiptList,function(key,val){
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
                            $('.ExportTableBtn a').attr('href',exportAddress); 
                        } else {
                            yzl.Dialog({
                                content: result.msg,
                                AutoClose: true
                            });
                        }
                        ;
                    }
                });
            },
            getSearchList: function () {
                var _self = this;
                var data = {
                    hotelId: yzl.hotelId
                };
                yzl.getAjax({
                    path: '/orderFinance/j/searchReceipt',
                    type: 'post',
                    data: data,
                    sCallback: function (result) {
                        if (result.code == "0000") {
                            _self.searchChannelList = result.data.channelList;

                             _self.receiptuserList = [];
                             for (var i=0; i<result.data.receiptuserList.length; i++) {
                                 var obj = {
                                     code: result.data.receiptuserList[i].userId,
                                     name: result.data.receiptuserList[i].userName
                                 };
                                 _self.receiptuserList.push(obj);
                             };

                           //  _self.receiptuserList = result.data.receiptuserList;
                            _self.payTypeList = result.data.payTypeList;
                        } else {
                            yzl.Dialog({
                                content: result.msg,
                                AutoClose: true
                            });
                        }
                        ;
                    }
                });
            },
            // 日期插件ok按钮事件
            finaReceiptDate: function () {

            },
            // 点击查询---根据条件重新刷新页面数据
            getfinaReceiptList: function () {
                var _self = this;
				_self.finaReceiptList.pageNum = 1;
                _self.initData();
            },
            /*//收款明细---渠道下拉
			channelSlideDown:function(event){
				var e = event || window.event;
                var _self = this;
				e.stopPropagation();
				if (e.target.id == 'slide_layout') {
					$('.slide-out .slide-inner').stop().slideToggle(200);
				};
				$(document.body).unbind('click').on('click', function (e) {
					if (e.target.id != 'slide_layout_box') {
						$('.slide-out .slide-inner').slideUp(200);
					};
				});
			},
            // 收款明细---渠道下拉
            checkoutIpts: function () {
                var _self = this;

                _self.finaReceiptList.channelCode = [];
                $('#channelSecondLi input:checked').each(function (index, elem) {
                    _self.finaReceiptList.channelCode.push($(elem).val());
                });

                $('.slide-out .slide-layout').html('已选'+ ($('#channelSecondLi input:checked').length) +'个渠道');
                if ($('#channelSecondLi input:checked').length == _self.searchChannelList.length) {
                    $('#channelCheckAll').prop('checked', true);
                } else {
                    $('#channelCheckAll').prop('checked', false);
                };
            },
			//收款明细---渠道下拉全选
			bindChannelCheckAll:function(e){
                var _self = this;
                _self.finaReceiptList.channelCode = [];
                if (e.target.checked) {
            		for (var i=0; i<_self.searchChannelList.length; i++) {
                        _self.finaReceiptList.channelCode.push(_self.searchChannelList[i].channelCode);
                    };
                    $('#channelSecondLi input').prop('checked', true);
                    $('.slide-out .slide-layout').html('已选'+ ($('#channelSecondLi input:checked').length) +'个渠道');
                } else {
                    $('#channelSecondLi input').prop('checked', false);
                    $('.slide-out .slide-layout').html('已选'+ ($('#channelSecondLi input:checked').length) +'个渠道');
                };
			},*/
            // 支付编号显示特殊处理
            formatePayNo: function (item) {
                var _self = this;
                if (item.length > 10) {
                   return '...' + item.substr(-10);
                } else {
                    return item;
                };
            },
            //  房间时间列表---点击占用房间---查看订单详情
            openRoomOrderDetails: function (orderId) {
                yzl.contentVue.openRoomOrderDetails(orderId);
            }
        }
    });

    collectionDetail.initEvent();

    // 订单详情修改后，需要刷新collectionDetail的initData
    yzl.contentVue.initPageData = collectionDetail.initData;

})(window, document, jQuery, yzlObj);