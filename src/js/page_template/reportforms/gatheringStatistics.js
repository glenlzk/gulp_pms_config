;(function (window, document, $, yzl) {

     // 使用
    var myChart = echarts.init(document.getElementById('gatheringStatisticsForm'));
	var option = {
		title : {
			text: '支付方式收款统计',
			x:'center'
		},
		tooltip : {
			trigger: 'item',
			formatter: "{a} <br/>{b} : {c} ({d}%)"
		},
		legend: {
			orient : 'vertical',
			x : 'left',
			data:[]
		},
		toolbox: {
			show : true,
			feature : {
				mark : {show: true},
				dataView : {show: true, readOnly: false},
				magicType : {
					show: true,
					type: ['pie', 'funnel'],
					option: {
						funnel: {
							x: '25%',
							width: '50%',
							funnelAlign: 'left',
							max: 1548
						}
					}
				},
				restore : {show: true},
				saveAsImage : {show: true}
			}
		},
		calculable : true,
		color:['#D87A80', '#5AB1EF','#FFB980','#2EC7C9','#B6A2DE'],
		series : [
			{
				name:'支付方式',
				type:'pie',
				radius : '55%',
				center: ['50%', '60%'],
				data:[]
			}
		]
	}


	
	var gatheringStatistics = new Vue({
        el : '#gatheringStatistics',
        data: {
			// 营业统收----获取数据
			getGatheringStatistics: {
				hotelId: yzl.hotelId,
				fromDate: new Date().format('yyyy-MM-01'),
				toDate: new Date().format('yyyy-MM-dd')
			},
			// 获取数据---渠道统计数据绑定
			gatheringStatisticsData: [],
			// 获取数据---渠道统计数据绑定针对饼图的
			gatheringStatisticsDataImg: [],
            // 日期下拉框---start
            getStartDateEndDateList: [
                {
                    code: 'recentMonth',
                    name: '最近一月'
                },
                {
                    code: 'recentWeek',
                    name: '最近一周'
                },
                {
                    code: 'yesterday',
                    name: '昨天'
                },
                {
                    code: 'presentMonth',
                    name: '本月'
                },
                {
                    code: 'lastMonth',
                    name: '上月'
                },
                {
                    code: '',
                    name: '自定义'
                }
            ],
            dateSelectedElem:'presentMonth',
            getStartDateEndDate: '',
            getStartDateEndDateElemId: 'getStartDateEndDateElemId',
            // 日期下拉框---end
        },
        // 引入分页组件
        components:{
            'iselect-name': yzlObj.multiSelectVue
        },
		watch: {
			// 日期插件值监控
			getStartDateEndDate: function (newVal, oldVal) {
				var _self = this;
				switch (newVal) {
					case 'recentMonth':
						_self.getGatheringStatistics.fromDate = new Date(new Date().getTime() - 86400000*29).format('yyyy-MM-dd');
						_self.getGatheringStatistics.toDate  = new Date().format('yyyy-MM-dd');
						break;
					case 'recentWeek':
						_self.getGatheringStatistics.fromDate = new Date(new Date().getTime() - 86400000*6).format('yyyy-MM-dd');
						_self.getGatheringStatistics.toDate  = new Date().format('yyyy-MM-dd');
						break;
					case 'yesterday':
						_self.getGatheringStatistics.fromDate = new Date(new Date().getTime() - 86400000).format('yyyy-MM-dd');
						_self.getGatheringStatistics.toDate  = new Date(new Date().getTime() - 86400000).format('yyyy-MM-dd');
						break;
					case 'presentMonth':
						_self.getGatheringStatistics.fromDate = new Date().format('yyyy-MM-01');
						_self.getGatheringStatistics.toDate  = new Date().format('yyyy-MM-dd');
						break;
					case 'lastMonth':
						_self.getGatheringStatistics.fromDate = lastMonthstart(new Date().format('yyyy-MM-dd'));
						_self.getGatheringStatistics.toDate  = lastMonthend(new Date().format('yyyy-MM-dd'));
						break;
				};

				function lastMonthend(_date) {
					var _date = new Date(_date);

					_date.setDate(0);
					return _date.format('yyyy-MM-dd');
				};

				function lastMonthstart(_date) {
					var _date = new Date(_date),
						m = _date.getMonth() -1;

                    	_date.setMonth(m, 1);
					return _date.format('yyyy-MM-dd');
				};
			},
		},
		methods: {
			// 初始化事件
            initEvent: function () {
				this.initData();
				this.checkoutGatheringStatisticsData();
            },
            // 初始化数据
            initData: function () {
            	var _self = this;
                var data = {
                    hotelId: yzl.hotelId,
                    cbannelCode:'',
                    keyword:'',
                    orderId:'',
                    orderStatus:4,
                    checkinDate:'',
                    endDate:'',
                    pageSize:'1',
                    pageNo:'1'
                };
//              yzl.getAjax({
//                  path : 'order/j/getOrderStatusList',
//                  type : 'post',
//                  data : data,
//                  sCallback : function (result) {
//                      if (result.code == "0000") {
//                          _self.orderInfo = result.data.orderLogList.list;
//                          _self.orderMessage = result.data;
//                          _self.pages = result.data.orderLogList.pages;
//                          _self.listItem(_self.pages);
//                          Vue.nextTick(function(){
//								$('.table-list i').on("click",function(){
//							   		console.dir($(this).parent('span').siblings(".slideDownbox"));
//							   		$(this).addClass('active').parent().siblings(".slideDownbox").slideToggle();
//						   		});
//						   		$('.pageList button').eq(0).addClass('active');
//							})
//                      } else {
//                          yzl.Dialog({
//                              content : result.msg,
//                              AutoClose: true
//                          });
//                      };
//                  }
//              });
            },
			// 营业统收----日期---点击查询按钮
			checkoutGatheringStatisticsData: function () {
				var _self = this;
				var data = _self.getGatheringStatistics;
				var path = '/report/j/receivablesStatistics'
				yzl.getAjax({
					path : path,
					type : 'post',
					data : data,
                    loadingElem: '#mianContent',
                    tips: false,
                    loadingTop: 300,
					sCallback : function (result) {
						if (result.code == "0000") {
							_self.gatheringStatisticsData = result.data.itemList;
							if (_self.gatheringStatisticsData.length == 0) {
                                yzl.noDataTips ({
                                    top: 70,
                                    content: '暂无数据',
                                    parElem: '#reprotContentTable',
                                    url:path
                                });
							} else {
                                yzl.removeNoDataElems();
                            };
							if(result.data.itemList.length > 5){
								var otherList = {
									billAmount:0,
									billCount:0,
									income:0,
									outspend:0,
								};
								for(i=4;i<result.data.itemList.length;i++){
									otherList.billAmount += result.data.itemList[i].billAmount;
									otherList.billCount += result.data.itemList[i].billCount;
									otherList.income += result.data.itemList[i].income;
									otherList.outspend += result.data.itemList[i].outspend;
									otherList.payTypeName = '其他';
								}
								var newList = result.data.itemList.slice(0,4);
								newList.push(otherList);
								_self.gatheringStatisticsDataImg = newList;
							}else{
								_self.gatheringStatisticsDataImg = result.data.itemList;
							}
							option.legend.data= _.pluck(_self.gatheringStatisticsDataImg,'payTypeName');
							_.each(_self.gatheringStatisticsDataImg,function(item){
								item.value = item.billAmount;
								item.name = item.payTypeName;
							});
							option.series[0].data=_self.gatheringStatisticsDataImg;
							 myChart.setOption(option);
							 $('#gatheringStatistics').css('visibility','visible');
						} else {
							yzl.Dialog({
								content : result.msg,
								AutoClose: true
							});
						};
					}
				});
			},
           // 日历插件调用
           /* startDatepicker : function() {
                $( ".customTime-selectTime-start" ).datepicker({
                    defaultDate: "+1w",
                    numberOfMonths: 1,
                    onClose: function( selectedDate ) {
                        $( ".customTime-selectTime-end" ).datepicker( "option", "minDate", selectedDate );
                    }
                });
                $( ".customTime-selectTime-end" ).datepicker({
                    defaultDate: "+1w",
                    numberOfMonths: 1,
                    onClose: function( selectedDate ) {
                        $( ".customTime-selectTime-start" ).datepicker( "option", "maxDate", selectedDate );
                    }
                });
            },*/
			gatheringStatisticsDate: function () {
				var _self = this;
				_self.getStartDateEndDate = "";
			}
		}
	});
	gatheringStatistics.initEvent();	
		
})(window, document, jQuery, yzlObj);
	

