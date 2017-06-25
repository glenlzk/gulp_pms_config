/**
 * Created by glen on 2016/10/27.
 */

;(function (window, document, $, yzl) {
    var roomTypeVue = new Vue({
        el : '#room_type_total',
        data: {
            removeRoomId : -1,
            removePriceTimeRangeId: -1,
            // 添加房型信息---点击---有效定制时段---每一行---记录对应参数
            savePirceTimeRangeParams: {
                hotelId: yzl.hotelId,
                roomTypeId: '',
                priceTimeRangeId: ''
            },
            roomsPrice : {
                hotelId : yzl.hotelId,
                monday : '',
                tuesday : '',
                wednesday : '',
                thursday : '',
                friday : '',
                saturday : '',
                sunday : '',
                roomTypeName : ''
            },
            flatPriceBtn : '',
            roomTypeList: [],
            // #room_type_total 是否显示右边框
            showBorderRight: {},
            // 添加房型信息
            priceTimeRange : '',
            // 显示---添加房型信息--有效定制时段
            addRoomTagTimeStepBox: false,
            // 新增定制时段
            addTimeRange: {
                hotelId: yzl.hotelId,
                roomTypeId : '',
                startDate : '',
                endDate : '',
                remark : ''
            },
            // 保存房型总数
            roomTypeTotal: 0,
            // 保存房间总数
            roomTotal: 0,
            //权限管理
            settingResourceInfo : yzl.resourceInfo,
            // 添加房型信息窗口----日历初始化数据转换
            finalDataList: [],
            // 房型管理---日历---空格子: 不可拖拽，不可修改价格，无日历
            emptyRoomList: [],
            // 房型管理---日历---禁用格子: 不可拖拽，不可修改价格，有日历
            forbidroomList: [],
            // 房型管理---日历---可拖拽格子: 可拖拽，可修改价格，有日历
            canbeModifiedRoomList: [],
            // 房型管理---日历---弹窗--记录后的价格
            setRoomPriceOperate: '',
            // 房型管理---日历---头部---展示年月
            showCalendarYearMonth: ''
        },
        methods: {
            // 初始化事件
            initEvent: function () {
                this.initData();
                /*this.startDatepicker();*/
            },
            // 初始化数据
            initData: function () {
                var _self = this;
                var total = 0;
                var data = {
                    hotelId: yzl.hotelId
                }
                yzl.getAjax({
                    path : 'roomType/j/getList',
                    type : 'post',
                    data : data,
                    fadeInElem: '#roomTypeManage',
                    loadingElem: '#mianContent',
                    tips: false,
                    loadingTop: 300,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.roomTypeList = result.data.roomTypeList;
                            _self.roomTypeTotal = result.data.roomTypeList.length;
                            for (var i= 0, len=result.data.roomTypeList.length; i<len; i++) {
                                total += parseInt(result.data.roomTypeList[i].roomCount);
                            };
                            _self.roomTotal = total;
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
            },
            // 单击
            toggle_bgc : function (e, i) {
                $(e.currentTarget).addClass('active').siblings().removeClass('active');
                $(e.currentTarget).find('input').prop('checked',true);
                $(e.currentTarget).siblings().find('input').prop('checked',false);
                this.removeRoomId = i.roomTypeId;
                roomsTotalVue.getRoomTypeList(i.roomTypeId, 'roomTypeVue');
            },
            // 删除操作
            removeElem : function (removeRoomId) {
                var _self = this;
                var confirm = false;
                if (roomsTotalVue.roomsList.length > 0) {
                    yzl.Dialog({
                        content: '此房型已关联房间，无法删除',
                        AutoClose: true
                    });
                    return;
                };

                var data = {
                    roomTypeId : removeRoomId,
                    hotelId: yzl.hotelId
                }
                yzl.Dialog({
                    content: '确定删除此房型吗？',
                    AutoClose: false,
                    callback: function(b){
                        confirm = b;
                        if (!confirm) return;
                        yzl.getAjax({
                            path : 'roomType/j/del',
                            type : 'post',
                            data : data,
                            sCallback : function (result) {
                                if (result.code == "0000") {
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
                });
            },
            // 关闭弹窗
            closeTag : function () {
                var _self = this;
                // $('.right-addRoom-mask, .right-addRoomTag-timeStepBox').css('display', 'none');
                $('.right-addRoom-mask').css('display', 'none');
                _self.addRoomTagTimeStepBox = false;
            },
            // 确定提交弹窗数据
            addHotelData : function () {
                var _self = this;
                if (!_self.addRoomTagTimeStepBox) {/*$('.right-addRoomTag-timeStepBox').css('display') === 'none'*/
                    _self.addRoomPrice('add');
                } else {
                    _self.addRoomPrice('update');
                };
            },
            // 提交房型周一周日价格
            addRoomPrice : function (path) {
                var _self = this;
                var addRoomPrice = _self.roomsPrice;
                var errorMsg = ''
                if (addRoomPrice.roomTypeName === '') {
                    errorMsg += '房型名称 '
                } else if (!/^\d+(\.\d{1,2})?$/.test(addRoomPrice.monday)) {
                    errorMsg += '周一 ';
                } else if (!/^\d+(\.\d{1,2})?$/.test(addRoomPrice.tuesday)) {
                    errorMsg += '周二 ';
                } else if (!/^\d+(\.\d{1,2})?$/.test(addRoomPrice.wednesday)) {
                    errorMsg += '周三 ';
                } else if (!/^\d+(\.\d{1,2})?$/.test(addRoomPrice.thursday)) {
                    errorMsg += '周四 ';
                } else if (!/^\d+(\.\d{1,2})?$/.test(addRoomPrice.friday)) {
                    errorMsg += '周五 ';
                } else if (!/^\d+(\.\d{1,2})?$/.test(addRoomPrice.saturday)) {
                    errorMsg += '周六 ';
                }else if (!/^\d+(\.\d{1,2})?$/.test(addRoomPrice.sunday)) {
                    errorMsg += '周日 ';
                } ;
                if (errorMsg !== '') {
                    $('.addRoom-talbe-tips').html(errorMsg+ ' 检查是否为数字,且最多可输两位小数位');
                    return;
                }
                if (path === 'update') {
                    addRoomPrice.roomTypeId = _self.addTimeRange.roomTypeId;
                };
                yzl.getAjax({
                    path : 'roomType/j/'+ path,
                    type : 'post',
                    data : addRoomPrice,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.clearRoomPrice();
                            _self.closeTag();
                            _self.initData();
                            // $('.right-addRoomTag-timeStepBox').css('display', 'none');
                            _self.addRoomTagTimeStepBox = false;
                        } else {
                            $('.addRoom-talbe-tips').html(result.msg);
                        };
                    }
                })
            },
            clearRoomPrice : function () {
                var _self = this;
                _self.flatPriceBtn = '';
                for (var key in _self.roomsPrice) {
                    if (key !== 'hotelId') {
                        _self.roomsPrice[key] = '';
                    };
                };
            },
            // 提起鼠标统一所有房型价格
            flatPrice : function (val) {
               var _self = this;
                if (/^\d+(\.\d{1,2})?$/.test(val) || val=='') {
                    $('.addRoom-talbe-tips').html('');
                    for (var key in _self.roomsPrice) {
                        if (key !== 'hotelId' && key !== 'roomTypeName') {
                            _self.roomsPrice[key] = val;
                        };
                    };
                } else {
                    $('.addRoom-talbe-tips').html('请输入数字，小数点最多为两位');
                };
            },
            // 日历插件调用
            addTimeRangeDate: function () {
                // 清空错误提示
                $('.customTime-errorTips').html('');
            },

            // 有效定制时段table点击特效
            clickPriceTimeRange : function (e, i) {
                var _self = this;
                $(e.currentTarget).addClass('active').siblings().removeClass('active');
                $(e.currentTarget).find('input').prop('checked',true);
                $(e.currentTarget).siblings().find('input').prop('checked',false);
                _self.removePriceTimeRangeId = i.priceTimeRangeId;
   

                _self.savePirceTimeRangeParams.hotelId = yzl.hotelId;
                _self.savePirceTimeRangeParams.roomTypeId = i.roomTypeId;
                _self.savePirceTimeRangeParams.priceTimeRangeId = i.priceTimeRangeId;

                // 获取右侧----日历---时间价格列表
                _self.getRoomsPriceTimeRange();

            },

            // 有效定制时段table----点击每一行----获取对应时间段房间价格列表
            getRoomsPriceTimeRange: function () {
                var _self = this;

                if (_self.savePirceTimeRangeParams.priceTimeRangeId == "") return;
                var data = _self.savePirceTimeRangeParams;

                yzl.getAjax({
                    path : '/roomType/j/getTimeRange',
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            // 初始化----日历
                            _self.finalDataList = _self.initPageData(result.data.customPriceList);
                            // 初始化----拖拽生效
                            Vue.nextTick(function () {
                                _self.clickDocumentClearAllRoomsBg();
                                _self.getDragRoomsDetails();
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

            // 房型管理----日历----拖拽---- 获取房间信息
            getDragRoomsDetails: function () {
                var _self = this;
                // 记录鼠标开始点击坐标
                var obj_start = {};
                // 记录鼠标移动
                var obj_end = {};
                // 根据具体元素，传进去------span   发生改变时，下面标注A处，需要修改
                var smallBox = $('#calendarBox li');
                // 记录所有被拖拽包含的元素
                var allDragLis = [];
                // 房间列表盒子
                var roomstatusFinalBox = document.getElementById('calendarBox');

                $('#calendarBox').unbind('mousedown').mousedown(function(e) {
                    var getLi = _self.getSpecifyParElem(e.target, 'LI', roomstatusFinalBox);


                    // 房间时间列表---点击房间---点击页面其他位置关闭并清除
                    /*$(_self.saveClickEmptyRoom).removeClass('pitch-up');
                    _self.saveClickEmptyRoom = null;*/

                    /*// 清除房间列表----单个点击---清除 新增 和 停用 按钮
                    if ($('.shutDown-addRoom-tag').length > 0) $('.shutDown-addRoom-tag').remove();*/

                    if (getLi) {
                        obj_start.x = parseInt($(getLi).attr('data-x'));
                        obj_start.y = parseInt($(getLi).attr('data-y'));
                    };

                    // 清除所有被选中状态，重新选择
                    //clearAllActive();

                    $(document).unbind('mousemove').mousemove(function (e) {
                        var getLi = _self.getSpecifyParElem(e.target, 'LI', roomstatusFinalBox),
                            x = parseInt($(getLi).attr('data-x')),
                            y = parseInt($(getLi).attr('data-y'));
                        // 如果LI不存在 或 li不是指定的LI则不执行
                        if (getLi == null || (getLi.getAttribute('data-x') == null && getLi.getAttribute('data-y') == null)) return;
                        // 取消文本选中默认行为
                        e.preventDefault();
                        e.stopPropagation();

                        // 鼠标在同一个LI上移动，只记录一次横纵坐标
                        if (obj_end.x === x && obj_end.y === y) {
                            return;
                            // 标注： A处
                        } else {
                            // 鼠标移动最终坐落在span的横纵坐标
                            obj_end.x = x;
                            obj_end.y = y;

                            // 清除所有被选中状态，重新选择
                            clearAllActive();
                            // 此时此刻,在坐标范围的smallBox元素
                            allDragLis = [];
                            // 记录空格子---清空
                            _self.emptyRoomList = [];
                            // 记录禁用格子----清空
                            _self.forbidroomList = [];
                            // 记录可拖拽格子---修改价格---房间
                            _self.canbeModifiedRoomList = [];

                            // 遍历在坐标范围的smallBox元素
                            for (var i= 0, len=smallBox.length; i<len; i++) {
                                smallBox_x = parseInt(smallBox[i].getAttribute('data-x')),
                                smallBox_y = parseInt(smallBox[i].getAttribute('data-y')),
                                // 判定符合坐标范围的smallBox元素
                                // 右下角方向
                                limit_yx_x = obj_end.x >= smallBox_x && obj_start.x <= smallBox_x;
                                limit_yx_y = obj_end.y >= smallBox_y && obj_start.y <= smallBox_y;
                                // 左上角方向
                                limit_zs_x = obj_start.x >= smallBox_x && obj_end.x <= smallBox_x;
                                limit_zs_y = obj_start.y >= smallBox_y && obj_end.y <= smallBox_y;
                                // 右上角方向
                                limit_ys_x = obj_start.x >= smallBox_x && obj_end.x <= smallBox_x;
                                limit_ys_y = obj_end.y >= smallBox_y && obj_start.y <= smallBox_y;
                                // 左下角方向
                                limit_zx_x = obj_end.x >= smallBox_x && obj_start.x <= smallBox_x;
                                limit_zx_y = obj_start.y >= smallBox_y && obj_end.y <= smallBox_y;


                                // 根据鼠标走向，确定坐标范围smallBox元素
                                if ((limit_yx_x && limit_yx_y)||(limit_zs_x && limit_zs_y)||(limit_ys_x && limit_ys_y)||(limit_zx_x && limit_zx_y)) {

                                    // 空房 背景色 记录新增订单参数
                                    var emptyRoomInfo = JSON.parse(smallBox[i].getAttribute('data-draginfo'));

                                    if (emptyRoomInfo && emptyRoomInfo.status == "2") {
                                        // 符合坐标范围的smallBox,插入数组
                                        allDragLis.push(smallBox[i]);

                                        _self.canbeModifiedRoomList.push(emptyRoomInfo.customPriceId);
                                        // 当鼠标未mouseup，往回滚时，清除往回滚，未被覆盖到的smallBox的active
                                         for (var j= 0, jen=allDragLis.length; j<jen; j++) {
                                            $(allDragLis[j]).addClass('active');
                                         };
                                    };
                                    // 禁用房---批量开启房
                                    if (emptyRoomInfo && emptyRoomInfo.status == '1') {
                                        _self.forbidroomList.push(smallBox[i]);
                                    };

                                    // 其他占用房(除空房，禁用房)----判断是可以操作，如果存在，则不操作
                                    if (emptyRoomInfo && emptyRoomInfo.status == 0) {
                                        _self.emptyRoomList.push(smallBox[i]);
                                    };

                                };
                            };
                           
                        };
                    });
                    // 禁止文本选中
                    return false;
                });

                // 取消鼠标移动绑定事件
                $(document).unbind('mouseup').mouseup(function (e) {
                    $(document).unbind('mousemove');

                    // 兼容火狐---chorme没问题
                    var getLi = _self.getSpecifyParElem(e.target, 'LI', roomstatusFinalBox);

                    // 如果LI不存在 或 li不是指定的LI则不执行
                    if (getLi == null || getLi.getAttribute('data-draginfo') == null) {
                        //console.log('li不是指定的LI');
                        //if (e.target.id != 'shutDown_addRoom_addRooms') {
                            clearAllActive();
                            return;
                       // };
                    };

                    // 如果存在其他占用房(除空房，禁用房)外，则清除选中色，不进行任何操作
                    if (_self.emptyRoomList.length > 0 || _self.forbidroomList.length > 0) {
                        //onsole.log('如果存在其他占用房(除空房，禁用房)外，则清除选中色，不进行任何操作');
                        clearAllActive();
                        return;
                    };

                    if (_self.canbeModifiedRoomList.length > 0) {
                        $('#addRoomTagAditprice').css({
                            'display': 'block',
                            'opacity': 1
                        });
                    };

                    // 禁止文本选中
                    return false;
                });

                // 清除所有被选中状态，重新选择
                function clearAllActive() {
                    for (var i= 0, len=allDragLis.length; i<len; i++) {
                        $(allDragLis[i]).removeClass('active');
                    };

                    // 清除后----清空
                    _self.emptyRoomList = [];
                    _self.forbidroomList = [];
                    _self.canbeModifiedRoomList = [];
                    allDragLis = [];
                };
            },
            // 房型管理----日历---- 获取指定父级元素
            getSpecifyParElem: function (targetElem, parElem, srchFinalElem) {
                var _self = this;
                if (targetElem == null) return null;
                if (targetElem.tagName === parElem) {
                    return targetElem;
                } else if (targetElem.id === srchFinalElem.id) {
                    return null;
                } else {
                    return _self.getSpecifyParElem(targetElem.parentNode, parElem, srchFinalElem);
                };
            },
            //  房型管理----日历----防止冒泡等操作   包括: _self.clickDocumentClearAllRoomsBg 和 _self.romove_tips_tag
            clickDocumentClearAllRoomsBg: function () {
                var _self = this;

                // 如果在房间列表范围内拖拽-----防止冒泡到document
                $('#addRoomTagAditprice').unbind('click').on('click', function (e) {
                    e.stopPropagation();
                });
                // 火狐不会触发----chrome会触发
                $(document.body).unbind('click').on('click', function (e) {
                    _self.romove_tips_tag();
                });

                var stopPreventDefault = function(e) {
                    e.stopPropagation();
                };
                $('#addRoomTagAditprice').unbind('mouseup').mouseup(stopPreventDefault);
            },
            romove_tips_tag : function () {
                var _self = this;
                // 如果拖拽多选房间存在，则清除
                if (_self.emptyRoomList.length > 0 || _self.forbidroomList.length > 0) {
                    $('#calendarBox li').removeClass('active');
                    // 清除后----清空
                    _self.emptyRoomList = [];
                    _self.forbidroomList = [];
                    _self.canbeModifiedRoomList = [];
                };
            },
            // 房型管理----日历----取消---批量修改价格
            cancelAditPriceOperate: function () {
                var _self = this;

                _self.setRoomPriceOperate = '';
                $('.addRoomTag-aditprice-errorTip').html('');
                $('#addRoomTagAditprice').css({
                    'display': 'none',
                    'opacity': 0
                });

                $('#calendarBox li').removeClass('active');
                _self.emptyRoomList = [];
                _self.forbidroomList = [];
                _self.canbeModifiedRoomList = [];
            },
            // 房型管理----日历--修改价格弹窗--聚焦--清空错误提示
            clearAditpriceErrorTip: function () {
                var _self = this;
                $('.addRoomTag-aditprice-errorTip').html('');
            },
            // 房型管理----日历----点击单个---设置价格
            setPerDayPrice: function (item, event) {
                var _self = this;
                var e = event || window.event;

                if (item.status == 2) {
                    $(e.currentTarget).addClass('active');
                    _self.canbeModifiedRoomList = [item.customPriceId];
                    $('#addRoomTagAditprice').css({
                        'display': 'block',
                        'opacity': 1
                    });
                };
            },
            //房型管理---添加
            addElement:function(){
            	var _self = this;
            	$('.right-addRoom-mask').css('display', 'block');
            },
            // 房型管理----日历--修改价格弹窗--确定---批量修改价格
            confirmAditPriceOperate: function () {
                var _self = this;

                var data = {
                    hotelId: yzl.hotelId,
                    price: _self.setRoomPriceOperate,
                    customPriceIdList: _self.canbeModifiedRoomList
                };

                if(data.price == '') {
                    $('.addRoomTag-aditprice-errorTip').html('价格不能为空');
                    return;
                };
                if(!(/^\d+(.\d{1,2})?$/.test(data.price))) {
                    $('.addRoomTag-aditprice-errorTip').html('请输入小数点两位数字！');
                    return;
                };

                yzl.getAjax({
                    path : '/roomType/j/updateTimeRange',
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            // 刷新所选中的----有效时间段----房间价格
                            _self.getRoomsPriceTimeRange();
                            // 关闭弹窗
                            _self.cancelAditPriceOperate();
                            // 清除相关拖拽---记录的list
                            // 清除后----清空
                            _self.emptyRoomList = [];
                            _self.forbidroomList = [];
                            _self.canbeModifiedRoomList = [];
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });
            },
            // 房型管理----日历---- 转化初始数据
            initPageData: function (data) {
                var _self = this;
                // 记录开始日期----几号
                //var startDay1 = data[0].customDate.replace(/\-/g,'/');
                var startDay = data[0].customDate.split('-');
                // 记录结束日期
                var endDay = data[data.length -1].customDate.split('-');
                // 记录开始日期----几号
                var startDate = startDay[2];
                // 组装每个月1号日期 2016-12-01
                var perMonthStartDay = startDay[0] + '-' + startDay[1] + '-' + '01';
                perMonthStartDay = perMonthStartDay.replace(/\-/g,'/');
                // 一个月有多少天
                var MonthDays = _self.getCountDays(startDay[0], startDay[1]);
                // 每月1号是周几
                var getDay = new Date(perMonthStartDay.replace(/\-/g,'/')).getDay() || 7;	// 周日为0时，转化为7

                var finalArr = [];

                _self.showCalendarYearMonth = startDay[0] + '-' + startDay[1];

                // 解决思路
                /*
                 最佳思路：
                 先根据数据，构造数据结构，渲染成功，再按此数据接口生成该数据

                 获取时间段: 2016-12-12(开始日期)     2016-12-24(结束日期)
                 每月总共有几天 :  1号     31号


                 空格有三种状态：
                     1. 空白(status: 0)-----不可点击，不可拖拽，无日期       ;
                     2. 填充空白(status: 1)-----不可点击，不可拖拽，有日期    ;
                     3. 填充非空白(status: 2)-----可点击，可拖拽，有日期


                 行数: 0 <= row <= 5;
                 每行格子index: 1 <= j < 7

                 // 1代表1号，2代表2号
                 var num = 0;       < 所在月数最大天数 (如: 31天)

                 // 每月1号是周几
                 var getDate01 = 2;

                 如果:
                     row == 0 且  空白(status: 0)--->j < 每月1号是周几(getDate01);
                         {
                             "customDate": null,
                             "status": 0
                         }
                 否则： j >= 1号是周几
                     num ++;
                     ----- j 格子有四种情况：
                     一:  填充空白(status: 1)  ----  num ++; <  2016-12- 12(开始日期)
                         {
                         "customDate": "2016-12" + num   if (num < 10) {return '0'+num};
                         "status": 1
                         }
                     二:  填充非空白(status: 2)---- 2016-12-12(开始日期) <= num ++; <=  2016-12-24(结束日期)
                         var date = "2016-12-"+ num;
                         var getObj = _.filter(customPriceList, function (item) {return item.date == date});
                         {
                             "customDate": getObj.customDate,
                             "customPriceId": getObj.customPriceId,
                             "price": getObj.price,
                             "priceTimeRangeId": getObj.priceTimeRangeId,
                             "roomTypeId": getObj.roomTypeId,
                             "status": 2
                         }
                     三:  填充空白(status: 1)  2016-12-24(结束日期) < num ++; <=  所在月数最大天数 (如: 31天)
                         {
                             "customDate": "2016-12" + num   if (num < 10) {return '0'+num};
                             "status": 1
                         }

                     四： 空白(status: 0)  num ++ >  所在月数最大天数 (如: 31天)
                         {
                             "customDate": null,
                             "status": 0
                         }
                 */
                // 1代表1号，2代表2号
                var dayNum = 1;
                // 总共
                for (var row=0; row<=5; row++) {
                    // 每一行的list
                    var rowList = [];
                    for (var col=1; col<=7; col++) {
                        // 第一次循环---空格
                        if (row == 0 && col < getDay) {
                            rowList.push({
                                "customDate": null,
                                "status": 0
                            });
                        } else {
                            if (dayNum < parseInt(startDay[2])) {
                                rowList.push({
                                    "customDate": startDay[0] + '-' + startDay[1] + '-' + _self.dayAddZero(dayNum),
                                    "status": 1
                                });
                                // 填充非空白(status: 2)
                            } else if (parseInt(startDay[2]) <= dayNum  && dayNum <= parseInt(endDay[2])) {
                                var customDate = startDay[0] + '-' + startDay[1] + '-' + _self.dayAddZero(dayNum);
                                var getObj = _.filter(data, function (item) {return item.customDate == customDate});

                                rowList.push({
                                    "customDate": getObj[0].customDate,
                                    "customPriceId": getObj[0].customPriceId,
                                    "price": getObj[0].price,
                                    "priceTimeRangeId": getObj[0].priceTimeRangeId,
                                    "roomTypeId": getObj[0].roomTypeId,
                                    "status": 2
                                });
                            } else if (parseInt(endDay[2]) < dayNum && dayNum <= MonthDays) {
                                rowList.push({
                                    "customDate": startDay[0] + '-' + startDay[1] + '-' + _self.dayAddZero(dayNum),
                                    "status": 1
                                });
                            } else if (dayNum > MonthDays) {
                                rowList.push({
                                    "customDate": null,
                                    "status": 0
                                });
                            };
                            dayNum ++;
                        };

                    };

                    if (row > 0 && rowList[0].customDate == null) {
                        return finalArr;
                    };
                    var perRowObj = {
                        row:rowList
                    };
                    finalArr.push(perRowObj);
                };

                return finalArr;
            },
            // 房型管理----日历---- 一个月有几天函数
            getCountDays: function (Y, M) {
                return new Date(Y, M, 0).getDate();
            },
            // 房型管理----日历---- 小于10，补0函数
            dayAddZero: function (num) {
                if (num < 10) {return '0'+num};
                return num;
            },
            // 房型管理----日历---- 计算几号
            getDate: function (item) {
                return parseInt(item.split('-')[2])
            },
            // 房型管理----日历---- 计算是否是周末
            checkForWeekend: function (customDate) {
                var _self = this;
                var getDay = new Date(customDate).getDay() || 7;	// 周日为0时，转化为7

                if (getDay == 6 || getDay == 7) {
                    return ['tue_sun'];
                } else {
                    return [];
                };

            },
            // 房型管理----日历---每个盒子data-status附带的信息
            /*
                data-draginfo="{"roomState":"3", customPriceId: ''}"
            */
            getPerCalendarBoxInfo: function (item) {
                var _self = this;
                var obj = {};
                if (item.status == 0 || item.status == 1 || item.status == 2) {
                    obj.status = item.status;
                };
                if (item.customPriceId) {
                    obj.customPriceId = item.customPriceId;
                };

                return JSON.stringify(obj);
            },
            // 点击编辑按钮
            editRoomTypeList : function (roomTypeId) {
                var _self = this;
                // $('.right-addRoom-mask, .right-addRoomTag-timeStepBox').css('display', 'block');
                $('.right-addRoom-mask').css('display', 'block');
                _self.addRoomTagTimeStepBox = true;
                // 获取 房型名称 数据
                _self.getPerRoomData(roomTypeId);
            },
            // 获取 房型名称 数据
            getPerRoomData : function (id) {
                var _self = this;
                var data = {
                    roomTypeId: id,
                    hotelId: yzl.hotelId
                }
                _self.addTimeRange.roomTypeId = id;
                yzl.getAjax({
                    path : 'roomType/j/get',
                    type : 'post',
                    data : data,
                    loadingElem: '#rightAddroomTag',
                    tips: false,
                    loadingTop: 150,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            // 这里可能需要一个转换器
                            var data = result.data;
                            _self.roomsPrice = {
                                hotelId : yzl.hotelId,
                                monday : data.monday,
                                tuesday : data.tuesday,
                                wednesday : data.wednesday,
                                thursday : data.thursday,
                                friday : data.friday,
                                saturday : data.saturday,
                                sunday : data.sunday,
                                roomTypeName : data.roomTypeName
                            };
                            _self.priceTimeRange = data.priceTimeRangeList;
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
            },
            // 删除新增定制房型时段
            delTimeRange : function () {
                var _self = this;
                var data = {
                    priceTimeRangeId : _self.removePriceTimeRangeId,
                    hotelId: yzl.hotelId
                };
                yzl.getAjax({
                    path : 'roomType/j/delTimeRange',
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.priceTimeRange = result.data.priceTimeRangeList;
                            // 清空右侧列表
                            _self.finalDataList = [];
                            //有效定制时段---选中对应行----active
                            _self.savePirceTimeRangeParams = {
                                hotelId: yzl.hotelId,
                                roomTypeId: "",
                                priceTimeRangeId: ""
                            };
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
            },
            // 新增定制时段窗口
            closeAddTimeRangeTag : function () {
                var _self = this;
                $('.right-l-customTimeBox').css('display', 'none');
                // 初始化新增定制时段弹窗
                _self.addTimeRange.startDate = "";
                _self.addTimeRange.endDate = "";
                _self.addTimeRange.remark = "";
                $('.customTime-errorTips').html('');
            },
            // 打开新增定制时段
            openAddTimeRangeTag : function () {
                $('.right-l-customTimeBox').css('display', 'block');
            },
            // 添加新增定制时段
            addTimeRangeTag : function () {
                var _self = this;

                if (_self.addTimeRange.startDate == "" || _self.addTimeRange.endDate == "") {
                    $('.customTime-errorTips').html('请选择起止日期');
                    return;
                };

                if (_self.addTimeRange.startDate && _self.addTimeRange.endDate) {
                    var start = _self.addTimeRange.startDate.split('-')[1];
                    var end = _self.addTimeRange.endDate.split('-')[1];
                    if (start !== end) {
                        $('.customTime-errorTips').html('请选择同一月份的起止日期');
                        return;
                    };
                };

                yzl.getAjax({
                    path : 'roomType/j/addTimeRange',
                    type : 'post',
                    data : _self.addTimeRange,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.priceTimeRange = result.data.priceTimeRangeList;
                            _self.closeAddTimeRangeTag();
                            // 初始化新增定制时段弹窗
                            _self.addTimeRange.startDate = "";
                            _self.addTimeRange.endDate = "";
                            _self.addTimeRange.remark = "";
                            $('.customTime-errorTips').html('');
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
            },
            // 修改自定义房间价格
            updateTimeRange : function () {

            }

        }
    });
    roomTypeVue.initEvent();

    // 房间总数模块
    var roomsTotalVue = new Vue({
        el : '#rooms_total',
        data: {
            // 房间总数---保存请求房间总数
            roomsList: [],
            // #rooms_total 是否显示左边框
            showBorderLeft: {},
            // 房间总数----删除功能--记录被点击房间
            removeRoomId: -1,
            // 房间总数----删除功能--roomTypeId---删除后刷新原有数据列表
            roomTypeId: '',
            // 添加房间信息----房间信息盒子数初始化
            roomSum : [1, 2, 3],
            // 添加房间信息--- 打开弹窗--初始化房型数据
            roomTypeList : '',
            // 添加房间信息--- 房间名称组成初始化
            roomNameParts: {
                header : '温馨',
                body : '1202',
                footer : 'C',
                roomsTotal: 3,
                roomTypeId: '',
                roomId: ''
            },
            // 编辑房间信息---打开窗口--保存初始化房间名称和锁状态
            addRoomMsg : {},
            // 编辑房间信息---获取今日日期
            getTodayDate: new Date().format('yyyy-MM-dd'),
            // 打开编辑窗口---锁态初始值
            lockStatusInitList: [
                {
                    value: 2,
                    checked: true,
                    id: 'lock_id_red',
                    iconClass: 'lock_red',
                    isDisabled:false,
                    txt: '故障'
                },
                {
                    value: 3,
                    checked: false,
                    id: 'lock_id_yellow',
                    iconClass: 'lock_yellow',
                    isDisabled:false,
                    txt: '异常'
                },
                {
                    value: 4,
                    checked: false,
                    id: 'lock_id_green',
                    iconClass: 'lock_green',
                    isDisabled:false,
                    txt: '无英智联锁具'
                },
                {
                    value: 1,
                    checked: false,
                    id: 'lock_id_none',
                    iconClass: 'lock_none',
                    isDisabled:false,
                    txt: '正常'
                }
            ],
            // 打开编辑窗口---展示悬浮/离开提示class
            showLockStatusTipClass: '',
            // 打开编辑窗口---展示悬浮/离开提示txt
            showLockStatusTipText: '',
            //  打开编辑窗口---房间状态
            // radio vue plugin start
            diffSexInitList: [        // 编辑
                {
                    id: 'roomStatus_0',  // 对应的选项id
                    value: '0',         // value值必须不一样
                    checked: false,
                    name: 'room_status_ison',     // 所有radio name 必须一样
                    zh_cn: '启用'    // 中文名字
                },
                {
                    id: 'roomStatus_1',
                    value: '1',
                    checked: false,
                    name: 'room_status_ison',
                    zh_cn: '停售'
                }
            ],
            diffSexCssObj: {
                'margin-right': '20px'
            },
            // radio vue plugin end
            // 保存  房间总数
            roomTotal: 0,
            //权限管理
            settingResourceInfo : yzl.resourceInfo,
        },
        components: {
            'v-radio': yzl.radioVue
        },
        watch: {
            'addRoomMsg.roomLockStatus': function (newVal, oldVal) {
                var _self = this;
                for (var i=0; i<this.lockStatusInitList.length; i++) {
                    var item = this.lockStatusInitList[i];
                    if (newVal == item.value) {
                        item.checked = true;
                    } else {
                        item.checked = false;
                    };
                };
            }
        },
        methods: {
            // 初始化事件
            initEvent: function () {
                this.initData();
            },
            // 初始化数据
            initData: function () {
                var _self = this;
            },
            // 全选
            /*selectAll : function (e) {
             if ($(e.currentTarget).hasClass('select-all')) {
             $(e.currentTarget).removeClass('select-all')
             $('.right-rb-tby > tr').removeClass('active');
             } else {
             $(e.currentTarget).addClass('select-all')
             $('.right-rb-tby > tr').addClass('active');
             };
             },*/
            // 房间总数---单击房型列表，改变背景色
            click_bgc : function (e, i) {
                var _self = this;
                $(e.currentTarget).addClass('active').siblings().removeClass('active');
                $(e.currentTarget).find('input').prop('checked',true);
                $(e.currentTarget).siblings().find('input').prop('checked',false);
                _self.removeRoomId = i.roomId;
                _self.roomTypeId = i.roomTypeId;
            },
            // 房间总数---点击删除按钮
            removeElem : function (removeRoomId) {
                var _self = this;
                var confirm = false;
                
                var data = {
                    roomId : removeRoomId,
                    hotelId: yzl.hotelId
                };

                yzl.Dialog({
                    content: '是否确认删除该房间？',
                    AutoClose: false,
                    callback: function(b){
                        confirm = b;
                        if (!confirm) return;
                        yzl.getAjax({
                            path : 'room/j/delete',
                            type : 'post',
                            data : data,
                            sCallback : function (result) {
                                if ( "0000" == result.code) {
                                    _self.removeRoomId = -1;
                                    _self.getRoomTypeList(_self.roomTypeId, 'roomsTotalVue');
                                    _self.roomTypeId = '';
                                    roomTypeVue.initData();
                                } else {
                                    yzl.Dialog({
                                        content : result.msg,
                                        AutoClose: true
                                    });
                                };
                            }
                        })
                    }
                });
            },
            // 房间总数---根据返回数据，提示锁状态
            setClass : function (item) {
                /*switch (item) {
                    case '1':
                        return 'red';
                    case '2':
                        return 'orange';
                    case '3':
                        return 'blue';
                    default :
                        return '';
                };*/
                switch (item) {
                    case '2':
                        return 'red';
                    case '3':
                        return 'orange';
                    case '4':
                        return 'grey';
                    case '1':
                        return 'green';
                };
            },
            // 房间总数---请求房型列表数据
            getRoomTypeList : function (RTV_roomId, RTV) {
                var _self = this;
                var rommId = '';

                if (RTV) { // vue roomTypeVue 调用
                    rommId = RTV_roomId;
                } else {
                    rommId = roomsTotalVue.roomTypeId;
                };
                var data = {
                    roomTypeId : rommId,
                    hotelId: yzl.hotelId
                };
                yzl.getAjax({
                    path : 'room/j/getList',
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.roomsList = result.data.roomList;
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });
            },
            // 添加房间信息--- 打开弹窗
            addElem: function () {
                var _self = this;
                $('#addRoomMessageModal').show();
	    		// 禁止滚动条
				$(document.body).css('overflow', 'hidden');
                var data = {
                    hotelId: yzl.hotelId
                };
                yzl.getAjax({
                    path : 'roomType/j/list',
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.roomTypeList = result.data.itemList;
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
            },
            // 添加房间信息--- 关闭弹窗
            closeAddRoomMessageTag : function () {
                $('#addRoomMessageModal').hide();
	    		$(document.body).css('overflow', 'visible');
	    		$('.room-info-errorMsg').html('');
            },
            // 添加房间信息---未选择房型提示
            AditeRoomMessage : function (val) {
                if (val === "") {
                    $('.aditeRoomMessage-state-errorMsg').html('请选择房型');
                } else {
                    $('.aditeRoomMessage-state-errorMsg').html('');
                };
            },
            // 添加房间信息---关闭窗口
            closeAditeRoomMessageTag : function () {
                $('.aditeRoomMessageMask').css('display', 'none');
            },
            // 添加房间信息----遍历房间信息盒子名称
            roomNameFun: function (i) {
                var roomName = this.roomNameParts.header + (parseInt(this.roomNameParts.body) + i) + this.roomNameParts.footer;
                return roomName;
            },
            // 添加房间信息---删除房间名称
            removeRoomsNameBox: function (i) {
                var _self = this;
                _self.roomSum.$remove(i);
                _self.roomNameParts.roomsTotal -= 1;
            },
            // 添加房间信息---提示为选中房型菜单
            isRoomTypeId : function (val) {
                if (val === "") {
                    $('.room-info-errorMsg').html('请选择房型');
                } else {
                    $('.room-info-errorMsg').html('');
                };
            },
            // 添加房间信息---点击确认按钮
            addRoomTypeName : function () {
                var _self = this;
                var confirm = true;
                var data = {
                	hotelId:yzl.hotelId,
                    roomTypeId : _self.roomNameParts.roomTypeId,
                    roomList : []
                };
                if (_self.roomNameParts.roomsTotal == '') {
                    $('.room-info-errorMsg').html('请输入房间数量');
                    confirm = false;
                    return;
                }else if(data.roomTypeId === ""){
                	$('.room-info-errorMsg').html('请选择房型');
                    confirm = false;
                    return;
                };

                $('.room-sml-boxPar li').each(function (index, elem) {
                    var roomName = $(elem).find('input').val();
                    if (data.roomList.length == 0 && roomName !== '') {
                        data.roomList.push({
                            roomNo : roomName
                        });
                    } else {
                        confirm = checkArr(data.roomList, roomName);
                    };
                });
                if (confirm) {
                    yzl.getAjax({
                        path : 'room/j/add',
                        type : 'post',
                        data : data,
                        sCallback : function (result) {
                            if (result.code == "0000") {
                                $('#addRoomMessageModal').css('display', 'none');
                                $('.room-info-errorMsg').html('');
                                _self.getRoomTypeList(_self.roomNameParts.roomTypeId, 'roomsTotalVue');
                                roomTypeVue.initData();
                            } else {
                                $('.room-info-errorMsg').html(result.msg);
                            };
                        }
                    });
                };

                function checkArr(arr, elem) {
                    for (var i=0, len=arr.length; i<len; i++) {
                        if (elem === '') {
                            $('.room-info-errorMsg').html('有房间名称为空，请检查!');
                            return false;
                        } else if (arr[i] === elem) {
                            $('.room-info-errorMsg').html('房间名称: '+ elem + '有重复，请检查!');
                            return false;
                        };
                    };
                    arr.push({
                        roomNo : elem
                    });
                    return true;
                };
            },
            // 编辑房间信息---打开窗口
            showEditRoomStatus : function (val) {
                var _self = this;

                var data = {
                    hotelId: yzl.hotelId
                };
                var getRoom = {
                    roomId: val,
                    hotelId: yzl.hotelId
                };

                yzl.getAjax({
                    path : 'roomType/j/list',
                    type : 'post',
                    data : data,
                    loadingElem: '#aditeRoomMessageBox',
                    tips: false,
                    loadingTop: 150,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.roomTypeList = result.data.itemList;
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });

                yzl.getAjax({
                    path : 'room/j/get',
                    type : 'post',
                    data : getRoom,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            _self.addRoomMsg = result.data;
                            _self.addRoomMsg.roomLockStatus = result.data.roomLockStatus;
                            // 打开编辑窗口---锁状态变跟
                            if (_self.addRoomMsg.roomLockStatus == '4') {
                            	for(var i=0;i<4;i++){
                            		var item = _self.lockStatusInitList[i];
                            		if(item.value=='4'){
                            			item.isDisabled = false;
                            		}else{
                            			item.isDisabled = true;
                            		}
                            	}
                            } else {
                            	for(var i=0;i<4;i++){
                            		var item = _self.lockStatusInitList[i];
                            		if(item.value=='4'){
                            			item.isDisabled = true;
                            		}else{
                            			item.isDisabled = false;
                            		}
                            	}
                            };
                            // 打开编辑窗口
                            $('.aditeRoomMessageMask').css('display', 'block');
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                })
            },
            // 编辑房间信息---单击确认按钮
            updateRoomMessageBtn : function () {
                var _self = this;
                var data = {
                    roomTypeId: _self.addRoomMsg.roomTypeId,
                    roomId : _self.addRoomMsg.roomId,
                    roomLockStatus : _self.addRoomMsg.roomLockStatus,
                    roomNo : _self.addRoomMsg.roomNo,
                    hotelId: yzl.hotelId,
                    isStopSale: _self.addRoomMsg.isStopSale,
                    wifiName: _self.addRoomMsg.wifiName,
                    wifiPassword: _self.addRoomMsg.wifiPassword
                };

                if (data.isStopSale == 1) {
                    data.stopSaleDate = _self.getTodayDate;
                };

                if (!/^\d+$/.test(data.roomLockStatus)) {
                    $('.aditeRoomMessage-state-errorMsg').html('请选择锁状态');
                    return;
                };
                if (data.roomNo.trim() == '') {
                    $('.aditeRoomMessage-state-errorMsg').html('房间名称不能为空');
                    return;
                };
                if (data.roomTypeId == '') {
                    $('.aditeRoomMessage-state-errorMsg').html('请选择房型');
                    return;
                };

                yzl.getAjax({
                    path : 'room/j/update',
                    type : 'post',
                    data : data,
                    sCallback : function (result) {
                        if (result.code == "0000") {
                            $('.aditeRoomMessageMask').css('display', 'none');
                            _self.getRoomTypeList(_self.addRoomMsg.roomTypeId, 'roomsTotal');
                        } else {
                            yzl.Dialog({
                                content : result.msg,
                                AutoClose: true
                            });
                        };
                    }
                });
            },
            // 编辑房间信息---锁态悬浮 tips提示
            showLockIconTips: function (item) {
                var _self = this;
                _self.showLockStatusTipClass = item.iconClass;
                _self.showLockStatusTipText = item.txt;
            },
            // 编辑房间信息---离开 tips提示
            hideLockIconTips: function (item) {
                var _self = this;
                _self.showLockStatusTipClass = '';
                _self.showLockStatusTipText = '';
            },
        }
    });
    // 添加房间信息---房间信息盒子 跟随 房间数量 变化
    roomsTotalVue.$watch('roomNameParts.roomsTotal', function (newVal, oldVal) {
        this.roomSum = [];
        for (var i= 0; i<newVal; i++) {
            this.roomSum[i] = i+1;
        };
    });


    roomsTotalVue.initEvent();
    // 监控房型中 房间总数 变化
    roomTypeVue.$watch('roomTotal', function (newVal, oldVal) {
        roomsTotalVue.roomTotal = newVal;
    });

    roomTypeVue.$watch('roomTypeList', function(newVal, oldVal) {
        compareLen (newVal.length, roomsTotalVue.roomsList.length);
    });

    roomsTotalVue.$watch('roomsList', function (newVal, oldVal) {
        compareLen (roomTypeVue.roomTypeList.length, newVal.length);
    });

    function compareLen (roomTypeLen, roomsTotalLen) {
        roomTypeVue.showBorderRight = {};
        roomsTotalVue.showBorderLeft = {};
        if (roomTypeLen >= roomsTotalLen) {
            roomTypeVue.showBorderRight = {
                'border-right': '1px solid #ccc'
            };
        } else {
            roomsTotalVue.showBorderLeft = {
                'border-left': '1px solid #ccc'
            };
        };
    };

})(window, document, jQuery, yzlObj);