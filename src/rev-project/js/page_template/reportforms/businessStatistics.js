;(function (window, document, $, yzl) {

     // 使用
    var myChart = echarts.init(document.getElementById('businessStatisticsForm'));
    var option = {
        title : {
	        text : '房费收入折线图',
	      	subtext : '单位：元'
	    },
	    tooltip : {
	        trigger: 'item',
	        formatter : function (params) {
	            var date = new Date(params.name);
	            var data = date.getFullYear() + '-'
	                   + (date.getMonth()+1)  + '-'
	                   + date.getDate() + ' '

	            return data + '<br/>'
	                   + params.seriesName + ':'
	                   + params.value;
	        }
	    },
	    toolbox: {
	        show : true,
	        feature : {
	            mark : {show: true},
	            dataView : {show: true, readOnly: false},
	            restore : {show: true},
	            saveAsImage : {show: true}
	        }
	    },
	    legend : {
	        data : ['日房费收入', '日入住率']
	    },
	    xAxis : [
	        {
	            type : 'category',
				data:[]
	        }
	    ],
	    yAxis : [
	        {
	            type : 'value'
	        }
	    ],
	    series : [
	        {
	            name: '日房费收入',
	            type: 'line',
	            showAllSymbol: true,
	            data: []
	        }
	    ]
    };

	var businessStatics = new Vue({
        el : '#businessStatistics',
        data: {
        	// 分页参数
            cur: 1,
            all: 0,
            msg: '',
            pageup: 10,
            pagedown: 10,
        	orderInfo:[],
        	orderMessage:'',
        	businessStatisticsInitList:[],
			// 营业统收----获取数据
			getBusinessStatisticsData: {
				hotelId: yzl.hotelId,
				pageSize:10,
				fromDate: new Date().format('yyyy-MM-01'),
				toDate: new Date().format('yyyy-MM-dd')
			},
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
			// 获取数据---渠道统计数据绑定
			businessStatisticsData: []
        },
        // 引入分页组件
		components:{
			'vue-nav': paginationVue,
			'iselect-name': yzlObj.multiSelectVue
		},
        // 分页跳转监听
		watch: {
			//监听分页
			cur: function (newVal, oldVal) {
                var _self = this;
				_self.getPage(_self.businessStatisticsInitList,newVal);
            },
            
			// 日期插件值监控
			getStartDateEndDate: function (newVal, oldVal) {
				var _self = this;
				switch (newVal) {
					case 'recentMonth':
						_self.getBusinessStatisticsData.fromDate = new Date(new Date().getTime() - 86400000*29).format('yyyy-MM-dd');
						_self.getBusinessStatisticsData.toDate  = new Date().format('yyyy-MM-dd');
						break;
					case 'recentWeek':
						_self.getBusinessStatisticsData.fromDate = new Date(new Date().getTime() - 86400000*6).format('yyyy-MM-dd');
						_self.getBusinessStatisticsData.toDate  = new Date().format('yyyy-MM-dd');
						break;
					case 'yesterday':
						_self.getBusinessStatisticsData.fromDate = new Date(new Date().getTime() - 86400000).format('yyyy-MM-dd');
						_self.getBusinessStatisticsData.toDate  = new Date(new Date().getTime() - 86400000).format('yyyy-MM-dd');
						break;
					case 'presentMonth':
						_self.getBusinessStatisticsData.fromDate = new Date().format('yyyy-MM-01');
						_self.getBusinessStatisticsData.toDate  = new Date().format('yyyy-MM-dd');
						break;
					case 'lastMonth':
						_self.getBusinessStatisticsData.fromDate = lastMonthstart(new Date().format('yyyy-MM-dd'));
						_self.getBusinessStatisticsData.toDate  = lastMonthend(new Date().format('yyyy-MM-dd'));
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
                        m = _date.getMonth() -1;

                    _date.setMonth(m, 1);
                    return _date.format('yyyy-MM-dd');
                };
			},
		},
		methods: {
			// 初始化事件
            initEvent: function () {
            	var _self = this;
                _self.checkoutBusinessStatisticsData();
            },
			// 营业统收----日期---点击查询按钮
			checkoutBusinessStatisticsData: function () {
				var _self = this;
				var data = _self.getBusinessStatisticsData;
				var path = '/report/j/businessStatistics';
				yzl.getAjax({
					path : path,
					type : 'post',
					data : data,
					loadingElem: '#mianContent',
                    tips: false,
                    loadingTop: 300,
					sCallback : function (result) {
						if (result.code == "0000") {
                            _self.orderMessage = result.data;
                            _self.orderMessage.total = result.data.length;
                            _self.all = Math.ceil(result.data.length/10);
                            _self.getPage(result.data,1);
                            _self.businessStatisticsInitList = result.data;
                            if (_self.orderMessage.length == 0) {
                                yzl.noDataTips ({
                                    top: 70,
                                    content: '暂无数据',
                                    parElem: '#reprotContentTable',
                                    url:path
                                });
							} else {
                                yzl.removeNoDataElems();
                            };
                            // 分页
							option.series[0].data= _.pluck(_self.businessStatisticsInitList,'income');
							option.xAxis[0].data= _.pluck(_self.businessStatisticsInitList,'date');
							myChart.setOption(option);
							$('#businessStatistics').css('visibility','visible');
						} else {
							yzl.Dialog({
								content : result.msg,
								AutoClose: true
							});
						};
					}
				});
			},
			getPage: function(list,cur){
				var _self = this;
				if(!cur){
					cur = 1;
				}
				_self.businessStatisticsData = list.slice((cur-1)*10,cur*10);
			},
			getIncome: function (event) {
				var _self = this;
				var e = event || window.event;

				$(e.currentTarget).addClass('active').siblings().removeClass('active');
				option.title.text = '房费收入折线图';
				option.title.subtext = '单位：元';
				option.series[0].name="日房费收入";
				option.series[0].data= _.pluck(_self.businessStatisticsInitList,'income');
				option.xAxis[0].data= _.pluck(_self.businessStatisticsInitList,'date');
				myChart.setOption(option);

			},
			getRentRate: function (event) {
				var _self = this;
				var e = event || window.event;

				$(e.currentTarget).addClass('active').siblings().removeClass('active');
				option.title.text = '日入住率';
				option.title.subtext = '百分比';
				option.series[0].name="日入住率";
				option.series[0].data= _.pluck(_self.businessStatisticsInitList,'rentRate');
				option.xAxis[0].data= _.pluck(_self.businessStatisticsInitList,'date');
				myChart.setOption(option);
			},
			formatePercentRate: function (item) {
				var _self = this;
				return Number(item).toFixed(2) + '%';
			},
			businessStatisticDate: function () {
				var _self = this;
				_self.getStartDateEndDate = "";
			}
		}
	});
	businessStatics.initEvent();	
		
})(window, document, jQuery, yzlObj);
	

