;(function (window, document, $, yzl) {

     // 使用
    var myChart = echarts.init(document.getElementById('channelStatisticsForm'));

    var option = {
         title : {
	        text: '渠道收入统计',
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
	            name:'渠道类型',
	            type:'pie',
	            radius : '55%',
	            center: ['50%', '60%'],
	            data:[]
	        }
	    ]
    };


	var channelStatistics = new Vue({
		el : '#channelStatistics',
		data: {
			// 营业统收----获取数据
			getChannelStatisticsData: {
				hotelId: yzl.hotelId,
				fromDate: new Date().format('yyyy-MM-01'),
				toDate: new Date().format('yyyy-MM-dd')
			},
			// 获取数据---渠道统计数据绑定
			channelStatisticsData: [],
			channelStatisticsDataImg:[],
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
						_self.getChannelStatisticsData.fromDate = new Date(new Date().getTime() - 86400000*29).format('yyyy-MM-dd');
						_self.getChannelStatisticsData.toDate  = new Date().format('yyyy-MM-dd');
						break;
					case 'recentWeek':
						_self.getChannelStatisticsData.fromDate = new Date(new Date().getTime() - 86400000*6).format('yyyy-MM-dd');
						_self.getChannelStatisticsData.toDate  = new Date().format('yyyy-MM-dd');
						break;
					case 'yesterday':
						_self.getChannelStatisticsData.fromDate = new Date(new Date().getTime() - 86400000).format('yyyy-MM-dd');
						_self.getChannelStatisticsData.toDate  = new Date(new Date().getTime() - 86400000).format('yyyy-MM-dd');
						break;
					case 'presentMonth':
						_self.getChannelStatisticsData.fromDate = new Date().format('yyyy-MM-01');
						_self.getChannelStatisticsData.toDate  = new Date().format('yyyy-MM-dd');
						break;
					case 'lastMonth':
						_self.getChannelStatisticsData.fromDate = lastMonthstart(new Date().format('yyyy-MM-dd'));
						_self.getChannelStatisticsData.toDate  = lastMonthend(new Date().format('yyyy-MM-dd'));
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
				this.checkoutBusinessStatisticsData();
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
			},
			// 营业统收----日期---点击查询按钮
			checkoutBusinessStatisticsData: function () {
				var _self = this;
				var data = _self.getChannelStatisticsData;
				var path = '/report/j/channelStatistics'
				yzl.getAjax({
					path : path,
					type : 'post',
					data : data,
					loadingElem: '#mianContent',
                    tips: false,
                    loadingTop: 300,
					sCallback : function (result) {
						if (result.code == "0000") {
							_self.channelStatisticsData = result.data.itemList;
							if (_self.channelStatisticsData.length == 0) {
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
									orderCount:0,
									income:0,
								};
								for(i=4;i<result.data.itemList.length;i++){
									otherList.orderCount += result.data.itemList[i].orderCount;
									otherList.income += result.data.itemList[i].income;
									otherList.channelName = '其他';
								}
								var newList = result.data.itemList.slice(0,4);
								newList.push(otherList);
								_self.channelStatisticsDataImg = newList;
							}else{
								_self.channelStatisticsDataImg = result.data.itemList;
							}
							option.legend.data= _.pluck(_self.channelStatisticsDataImg,'channelName');
							_.each(_self.channelStatisticsDataImg,function(item){
								item.value = item.orderCount;
								item.name = item.channelName;
							});
							option.series[0].data=_self.channelStatisticsDataImg;
							myChart.setOption(option);
							$('#channelStatistics').css('visibility','visible');
						} else {
							yzl.Dialog({
								content : result.msg,
								AutoClose: true
							});
						};
					}
				});
			},
			formatePercentRate: function (item) {
				var _self = this;
				return Number(item).toFixed(2) + '%';
			},
			channelStatisticsDate: function () {
				var _self = this;
				_self.getStartDateEndDate = "";
			}
		}
	});
	channelStatistics.initEvent();
		
})(window, document, jQuery, yzlObj);
	

