/**
 * Created by glen on 2017/3/4.
 */

/*var resourceCodeTest = {
    "cloudHotelWeb": "2",
    "cloudHotelRoomState": "10",
    "cloudHotelOrder": "11",
    "cloudHotelCustomer": "12",
    "cloudHotelFinance": "13",
    "cloudHotelReports": "14",
    "cloudHotelSettings": "15",
    "cloudHotelBasicSetting": "16",
    "cloudHotelEditBasic": "17",
    "cloudHotelRoomType": "18",
    "cloudHotelAddRoomType": "19",
    "cloudHotelEditRoomType": "20",
    "cloudHotelDeleteRoomType": "21",
    "cloudHotelAddRoom": "22",
    "cloudHotelEditRoom": "23",
    "cloudHotelDeleteRoom": "24",
    "cloudHotelChannel": "25",
    "cloudHotelYZLChannel": "26",
    "cloudHotelCoChannel": "27",
    "cloudHotelEditChannelHotel": "28",
    "cloudHotelEditHotelService": "29",
    "cloudHotelEditYZLRoomType": "30",
    "cloudHotelAddHotelPicture": "31",
    "cloudHotelAddCoChannel": "32",
    "cloudHotelEditCoChannel": "33",
    "cloudHotelDeleteCoChannel": "34",
    "cloudHotelPayType": "35",
    "cloudHotelAddPayType": "36",
    "cloudHotelDeletePayType": "37",
    "cloudHotelSMS": "38",
    "cloudHotelEnableSMS": "39",
    "cloudHotelAuthoritation": "40",
    "cloudHotelAddRole": "41",
    "cloudHotelEditRole": "42",
    "cloudHotelDeleteRole": "43",
    "cloudHotelAddUser": "44",
    "cloudHotelEditUser": "45",
    "cloudHotelDeleteUser": "46",
    "cloudHotelLock": "47",
    "cloudHotelLockDetail": "48",
    "cloudHotelBusinessReport": "49",
    "cloudHotelChannelReport": "50",
    "cloudHotelPaymentReport": "51",
    "cloudHotelShiftList": "52",
    "cloudHotelAddShift": "53",
    "cloudHotelShiftDetail": "54",
    "cloudHotelFinancePaymentDetail": "55",
    "cloudHotelFinanceDepositDetail": "56",
    "cloudHotelPendingOrder": "57",
    "cloudHotelDueinOrder": "58",
    "cloudHotelCheckinOrder": "59",
    "cloudHotelCheckoutOrder": "60",
    "cloudHotelCancelledOrder": "61",
    "cloudHotelOrderCancelProcess": "62",
    "cloudHotelOrderCancelProcessDetail": "63",
    "cloudHotelAllOrder": "64",
    "cloudHotelFutureRoomState": "65",
    "cloudHotelEnableRoom": "66",
    "cloudHotelDisableRoom": "67",
    "cloudHotelSetRoomClean": "68",
    "cloudHotelSetRoomDirty": "69",
    "cloudHotelAddOrder": "70",
    "cloudHotelPreCheckin": "71",
    "cloudHotelCheckin": "72",
    "cloudHotelEditOrder": "73",
    "cloudHotelCancelOrder": "74",
    "cloudHotelPaymentProcess": "75",
    "cloudHotelDepositProcess": "76",
    "cloudHotelAddOrderGuest": "77",
    "cloudHotelEditOrderGuest": "78",
    "cloudHotelDeleteOrderGuest": "79",
    "cloudHotelAddUIDKey": "80",
    "cloudHotelDeleteUIDKey": "81",
    "cloudHotelSendKeyCode": "82",
    "cloudHotelOrderDetail": "83",
    "cloudHotelNavigationSetting": "92",
    "cloudHotelAddNavigation": "93",
    "cloudHotelEditNavigation": "94",
    "cloudHotelDeleteNavigation": "95",
    "cloudHotelAddNavigationRooms": "96",
    "cloudHotelDeleteNavigationRooms": "97",
    "cloudHotelRoomOwnerSetting": "98",
    "cloudHotelAddRoomOwner": "99",
    "cloudHotelDeleteRoomOwner": "100",
    "cloudHotelAddRoomOwnerRooms": "101",
    "cloudHotelDeleteRoomOwnerRooms": "102"
};*/

// 全局对象
var yzlObj = yzlObj || {};

/* isHasResource  每个item添加是否有权限配置
   isActive       是否选择当前导航(主，次)
   backUpDir      对应的二级导航 '#dir={home|basicHome|initHome}' ==> '#dir={home|basicHome}'
* */

yzlObj.navList = [
    {
        icon: 'icon-roomset',                                        // 导航icon
        resourceCode: '',                                   // resourceCode = ''时，则表示无权限控制
        zh_cn: '首页',                                       // 必备----模块名称
        firDir: 'home',                                     // 必备---#dir={home|basicHome|initHome}  一级导航首部分
        lastDir: 'initHome',                                // 必备---#dir={home|basicHome|initHome}  一级导航末尾部分
        defaultDir: '#dir={home|basicHome|initHome}',       // 设置此值，则说明只有一级导航-----附带可能：无权限控制(根据resourceCode) 或 只有1级导航
        dir: ''                                             // 根据权限表---动态生成dir(无权限控制，则默认defaultDir)
    },
    {
        icon: 'icon-door',
        resourceCode: 'cloudHotelRoomState',                // 对应-----权限表
        zh_cn: '房态',
        firDir: 'roomstatus',
        lastDir: 'initStatus',
        defaultDir: '#dir={roomstatus|basicStatus|initStatus}',
        dir: ''
    },
    {
        icon: 'icon-dingdan',
        resourceCode: 'cloudHotelOrder',
        zh_cn: '订单',
        firDir: 'orders',
        lastDir: 'initOrder',
        defaultDir: '',
        dir: ''
    },
    {
        icon: 'icon-caiwu',
        resourceCode: 'cloudHotelFinance',
        zh_cn: '财务',
        firDir: 'finance',
        lastDir: 'initFinance',
        defaultDir: '',
        dir: ''
    },
    {
        icon: 'icon-baobiao',
        resourceCode: 'cloudHotelReports',
        zh_cn: '报表',
        firDir: 'reportforms',
        lastDir: 'initReportforms',
        defaultDir: '',
        dir: ''
    },
    {
        icon: 'icon-shezhi',
        resourceCode: 'cloudHotelSettings',
        zh_cn: '设置',
        firDir: 'setting',
        lastDir: 'initSetting',
        defaultDir: '',
        dir: ''
    }
];

/* isHasResource  每个item添加是否有权限配置
   isActive       是否选择当前导航(主，次)
 * */

yzlObj.sideBarLists = {
    homeSidebar: [],
    roomstatusSidebar: [],
    settingSidebar: [
        {
            icon: 'icon-shezhi',
            name: 'basicSetting',
            resourceCode: 'cloudHotelBasicSetting',
            zh_cn: '基本设置',
            dir: '#dir={setting|basicSetting}'
        },
        {
            icon: 'icon-roomset',
            name: 'roomTypeManage',
            resourceCode: 'cloudHotelRoomType',
            zh_cn: '房型管理',
            dir: '#dir={setting|roomTypeManage}'
        },
        {       // 2级导航
            icon: 'icon-qudaoset',                                         // 导航icon
            name: '',                                            // dir="javascript:;" 则name: '';    否则 #dir={setting|basicSetting} --- basicSetting
            isSpread: false,
            resourceCode: 'cloudHotelChannel',                   // 对应-----权限表----如果为空，则默认 此用户有此菜单权限
            zh_cn: '渠道管理',                                    // 必备----模块名称
            dir: 'javascript:;',                                 // 如果有3级导航，则此为空
            secBar: [                                            // 有3级导航
                {
                    icon: '',
                    name: 'directChannel',
                    resourceCode: 'cloudHotelYZLChannel',
                    zh_cn: 'KK开门',
                    dir: '#dir={setting|directChannel}'           // 非动态生成
                },
                {
                    icon: '',
                    name: 'cooperateChannel',       // 不能少---#dir={setting|cooperateChannel}----cooperateChannel
                    resourceCode: 'cloudHotelCoChannel',
                    zh_cn: '合作渠道',
                    dir: '#dir={setting|cooperateChannel}'
                }
            ]
        },
        {
            icon: 'icon-payset',
            name: 'paymentManage',
            resourceCode: 'cloudHotelPayType',
            zh_cn: '支付管理',
            dir: '#dir={setting|paymentManage}'
        },
        {
            icon: 'icon-messageset',
            name: 'smsManage',
            resourceCode: 'cloudHotelSMS',
            zh_cn: '短信管理',
            dir: '#dir={setting|smsManage}'
        },
        {
            icon: 'icon-lockset',
            name: 'keyManage',
            resourceCode: '',
            zh_cn: '锁具管理',
            dir: '#dir={setting|keyManage}'
        },
        {
            icon: 'icon-locationset',
            name: 'navigation',
            resourceCode: '',
            zh_cn: '导航设置',
            dir: '#dir={setting|navigation}'
        },
        {
            icon: 'icon-fangdongset',
            name: 'proprietor',
            resourceCode: '',
            zh_cn: '房东管理',
            dir: '#dir={setting|proprietor}'
        },
        {
            icon: 'icon-limitset',
            name: 'authorityManage',
            resourceCode: 'cloudHotelAuthoritation',
            zh_cn: '权限设置',
            dir: '#dir={setting|authorityManage}'
        }

    ],
    reportformsSidebar: [
        {
            icon: 'icon-yingyeall',
            name: 'businessStatistics',
            resourceCode: 'cloudHotelBusinessReport',
            zh_cn: '营业统计',
            dir: '#dir={reportforms|businessStatistics}'
        },
        {
            icon: 'icon-qudaoall',
            name: 'channelStatistics',
            resourceCode: 'cloudHotelChannelReport',
            zh_cn: '渠道统计',
            dir: '#dir={reportforms|channelStatistics}'
        },
        {
            icon: 'icon-moneyall',
            name: 'gatheringStatistics',
            resourceCode: 'cloudHotelPaymentReport',
            zh_cn: '收款统计',
            dir: '#dir={reportforms|gatheringStatistics}'
        },
    ],
    financeSidebar: [
        {
            icon: 'icon-turnlist',
            name: 'turnoverForm',
            resourceCode: 'cloudHotelShiftList',
            zh_cn: '交接表',
            dir: '#dir={finance|turnoverForm}'
        },
        {
            icon: 'icon-moneydetial',
            name: 'collectionDetail',
            resourceCode: 'cloudHotelFinancePaymentDetail',
            zh_cn: '收款明细',
            dir: '#dir={finance|collectionDetail}'
        },
        {
            icon: 'icon-yajindetial',
            name: 'depositDetail',
            resourceCode: 'cloudHotelFinanceDepositDetail',
            zh_cn: '押金明细',
            dir: '#dir={finance|depositDetail}'
        },
    ],
    ordersSidebar: [
        {
            icon: 'icon-daichulidingdan',
            name: 'waitingOrder',
            resourceCode: 'cloudHotelPendingOrder',
            zh_cn: '待处理',
            dir: '#dir={orders|waitingOrder}'
        },
        {
            icon: 'icon-weizhudingdan',
            name: 'uncheckinOrder',
            resourceCode: 'cloudHotelDueinOrder',
            zh_cn: '未入住',
            dir: '#dir={orders|uncheckinOrder}'
        },
        {
            icon: 'icon-yizhudingdan',
            name: 'hascheckinOrder',
            resourceCode: 'cloudHotelCheckinOrder',
            zh_cn: '已入住',
            dir: '#dir={orders|hascheckinOrder}'
        },
        {
            icon: 'icon-leftdingdan',
            name: 'hascheckoutOrder',
            resourceCode: 'cloudHotelCheckoutOrder',
            zh_cn: '已离店',
            dir: '#dir={orders|hascheckoutOrder}'
        },
        {
            icon: 'icon-canceldingdan',
            name: 'cancelledOrder',
            resourceCode: 'cloudHotelCancelledOrder',
            zh_cn: '已取消',
            dir: '#dir={orders|cancelledOrder}'
        },
        {
            icon: 'icon-dingdan',
            name: 'totalOrder',
            resourceCode: 'cloudHotelAllOrder',
            zh_cn: '全部',
            dir: '#dir={orders|totalOrder}'
        }
    ]
};

// 插入global的js
/*$(function () {
     ;(function () {
         var arr = ['base'];

         for (var i=0; i<arr.length; i++) {
             insertScript(arr[i]);
         };

         // 插入js到文档中
         function insertScript(path) {
             var timestamp = new Date().getTime();
             var jsurl =  'js/global/' + path + '.js?t=' + timestamp;
             var script = document.createElement('script');
             script.id = path + '_js';
             script.src = jsurl;

             document.body.appendChild(script);
         };
     })();
 });*/

