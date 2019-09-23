/**
 * Created by Administrator on 2017/9/15 0015.
 */
/**
 * Created by Administrator on 2017/4/17.
 */

prefix_base = "http://" + window.location.host + "/";
// prefix_base = "http://xy.xtyun.net/";
prefix_common_img = prefix_base + "common/images/";
prefix_common_mod = prefix_base + "common/module/";
prefix_lib = prefix_base + "common/lib/";
prefix_code = prefix_base + "code/";

C = {
    CB: function (x) {
        return prefix_base + x;
    },
    CBF: function (x, tag) {
        var suffix = ""
        if (!tag) {
            suffix = ".js";
        }
        return (tag || "") + prefix_base + x + suffix;
    },
    // 加载通用模块
    // Common Model
    CM: function (x, tag) {
        var suffix = ""
        if (!tag) {
            suffix = ".js";
        }
        return (tag || "") + prefix_common_mod + x + "/" + x + suffix;
    },
    // 加载通用模块中的文件
    CMF: function (x, tag) {
        return (tag || "") + prefix_common_mod + x;
    },
    // 加载外部库
    // Common Library
    CL: function (x, tag) {
        return (tag || "") + prefix_lib + x + "/" + x;
    },
    // 加载外部库-加载文件
    // Common Library File
    // 主要用于处理:
    // avalon/avalon.js
    //
    CLF: function (x, tag) {
        return (tag || "") + prefix_lib + x;
    },
    // 加载模块
    // Code
    Co: function (p, m, tag) {
        return (tag || "") + prefix_code + p + "/" + m;
    },
    // 加载模块集
    // C original model
    Com: function (p) {
        return prefix_code + p + "/" + p + ".js";
    },
    // 加载通用模块
    // Common Model
    CP: function (x, tag) {
        return (tag || "") + prefix_common_mod + x + "/" + x;
    },
    //通用图片
    CI: function (x) {
        return prefix_common_img + x;
    }
};

//微信服务域名
url_wx_base="http://wx.xtyun.net/";
// url_wx_base = "http://192.168.0.213/";
//学业质量检测与评价服务域名
url_xy_base="http://xy.xtyun.net/";
// url_xy_base = "http://127.0.0.1/";
//错题集本地域名
url_wr_base = "http://xy.xtyun.net/";
url_api_base = url_xy_base;
// url_api_base = HTTP_X + "/api/";
// 全局标志位
api = {
    weixin: url_wx_base + "weixin/",
    xy: url_xy_base + "xtyun/",
    wr: url_wr_base +"wrongset/",
    // 文件服务地址
    wy: "http://wy.xtyun.net:10000/",
    skip_on_not_login: url_xy_base + "xywx/wx_xy.html"
    // weixin: url_api_base + "weixin/",
    // xy: url_api_base + "xtyun/",
    // wr: url_api_base +"wrongset/",
    // skip_on_not_login: url_api_base + "xywx/wx_xy.html"
};
glb_staus = {
    is_debug: true,
    inner: true,
    map: {
        "paths": {
            "text": C.CLF("require/text"),
            "css": C.CLF("require/css"),
            "html": C.CLF("require/html"),
            "lodash": "//cdn.bootcss.com/lodash.js/4.17.4/lodash.min",
            "layer": "//cdn.bootcss.com/layer/3.0/layer.min",
            "amazeui": "//cdn.bootcss.com/amazeui/2.7.2/js/amazeui.min",
            // jquery 必须放于path 中，否则jquery会加载失败。require.js内部对jquery进行了amd处理
            "jquery": C.CLF("jquery.min"),
            "PCAS": C.CP("pcasclass"),
            "plupload": C.CLF("uploader/plupload.full.min"),
            "select2": "//cdn.bootcss.com/select2/4.0.3/js/select2.min",
            "date_time_picker": C.CLF("amazeui.datetimepicker.min"),
            "date_zh": C.CLF("datetimepicker.zh"),
            "boot_time": C.CLF("bootstrap-datetimepicker"),
            "date_picker": C.CLF("bootstrap-datetimepicker"),
            "jquery_weui": C.CLF("jquery-weui.min"),
            "swiper":"//cdn.bootcss.com/jquery-weui/1.0.1/js/swiper.min",
            "city_picker":"//cdn.bootcss.com/jquery-weui/1.0.1/js/city-picker.min",
            "weui":"//res.wx.qq.com/open/libs/weuijs/1.0.0/weui.min.js",
            "highcharts": C.CLF("highcharts"),
            "highcharts-more": C.CLF("highcharts-more"),
            "highcharts-zh_CN": C.CLF("highcharts-zh_CN")
        },
        waitSeconds: 90,
        shim: {
            'plupload': {
                deps: [
                    'jquery'
                ],
                exports: 'plupload'
            },
            'PCAS': {
                deps: [
                    'jquery'
                ],
                exports: 'PCAS'
            }
        },
        // urlArgs: "bust=" +  (new Date()).getTime()
    }
};
