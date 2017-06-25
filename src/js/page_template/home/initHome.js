;(function (window, document, $, yzl) {
	 // 使用

    var option = {

	    tooltip : {
	        trigger: 'item',
	        formatter: "{a} <br/>{b} : {c} ({d}%)"
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
	    color:['#D87A80', '#5AB1EF','#FFB980'],
	    series : [
	        {
	            name:'今日房况：',
	            type:'pie',
	            radius : '55%',
	            center: ['50%', '60%'],
	            data:[]
	        }
	    ]
    };
    
	var initHome = new Vue({
        el : '#initHome',
        data: {
        	indexInfo:''
        },
		methods: {
			// 初始化事件
            initEvent: function () {
                this.initData();
            },
            // 初始化数据
            initData: function () {
            	var _self = this;
            	yzl.getAjax({
                    path : 'homePage/j/queryOverview',
                    type : 'post',
                    data : {
                    	hotelId : yzl.hotelId
                    },
                    fadeInElem: '#initHome',
                    loadingElem: '#mianContent',
                    tips: false,
                    loadingTop: 300,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.indexInfo = result.data;
							var myChart = echarts.init(document.getElementById('initHome-right'));
                            var Data = [
                            	{value:_self.indexInfo.totalCheckin, name:'入住房'},
                            	{value:_self.indexInfo.totalVacant, name:'空房'},
                            	{value:_self.indexInfo.totalClose, name:'停用房'},
                            ];
                            option.series[0].data = Data;
							myChart.setOption(option);
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });
			},	

		}
	});
	
	initHome.initEvent();	
		
})(window, document, jQuery, yzlObj);
	

