/**
 * Created by Administrator on 2017/4/17.
 */
var HTTP_X = location.origin+"/";
var HTTP_Y = location.origin;
prefix_base = HTTP_X;
prefix_common_img = prefix_base + "common/images/";
prefix_common_mod = prefix_base + "common/module/";
prefix_lib = prefix_base + "common/lib/";
prefix_code = prefix_base + "code/";

C = {
    CB: function(x) {
        return prefix_base + x;
    },
    CBF: function(x, tag) {
        var suffix = "";
        if (!tag) {
            suffix = ".js";
        }
        return (tag || "") + prefix_base + x + suffix;
    },
    // 加载通用模块
    // Common Model
    CM: function(x, tag) {
        var suffix = ""
        if (!tag) {
            suffix = ".js";
        }
        return (tag || "") + prefix_common_mod + x + "/" + x + suffix;
    },
    // 加载通用模块中的文件
    CMF: function(x, tag) {
        return (tag || "") + prefix_common_mod + x;
    },
    // 加载外部库
    // Common Library
    CL: function(x, tag) {
        return (tag || "") + prefix_lib + x + "/" + x;
    },
    // 加载外部库-加载文件
    // Common Library File
    // 主要用于处理:
    // avalon/avalon.js
    // 
    CLF: function(x, tag) {
        return (tag || "") + prefix_lib + x;
    },
    // 加载模块
    // Code
    Co: function(p, m, tag) {
        return (tag || "") + prefix_code + p + "/" + m;
    },
    // 加载模块C.Co2("weixin_xy/daily", "list", "css!"),
    Co2: function(p, m, tag) {
        return (tag || "") + prefix_code + p + "/" + m + '/' + m;
    },
    // 加载模块集
    // C original model
    Com: function(p) {
        return prefix_code + p + "/" + p + ".js";
    },
    // 加载通用模块
    // Common Model
    CP: function(x, tag) {
        return (tag || "") + prefix_common_mod + x + "/" + x;
    },
    //通用图片
    CI: function(x) {
        return prefix_common_img + x;
    }
};
url_api_base=HTTP_X + "api/"
//url_api_base = "http://dev.xtyun.net/api/";
url_sign=HTTP_Y;
// 全局标志位
api = {
    current_url: "",
    com_set: {},
    //router: "1.0.2",
    PCPlayer: url_api_base + "base/",
    growth: url_api_base + "GrowthRecordBag/",
    api: url_api_base,
    user: url_api_base + "base/",
    sign:url_sign,
    skip_on_not_login: HTTP_X + "/Growth/new_index.html",
    // online_path: "dev.xtyun.net/websocket",
    online_path:"pj.xtyun.net/websocket",
};
glb_staus = {
    is_debug: true,
    inner: true,
    map: {
        "paths": {

            "text": C.CLF("require/text"),
            "css": C.CLF("require/css"),
            "html": C.CLF("require/html"),
            "lodash": C.CLF("lodash.min"),
            "carota":C.CLF('carota-debug'),
            "layer": C.CLF("layer.min"),
            "amazeui": C.CLF("amazeui"),
            // jquery 必须放于path 中，否则jquery会加载失败。require.js内部对jquery进行了amd处理
            "jquery": C.CLF("jquery.min"),
            "jquery_print": C.CLF("jQuery.print"),
            "tinyeditor": C.CLF("tinyeditor"),
            "PCAS": C.CP("pcasclass"),
            'moxie': C.CLF("uploader/moxie"),
            "plupload": C.CLF("uploader/plupload.full.min"),
            "select2": C.CLF("select2.min"),
            "selecr2_zh_CN":C.CLF("zh-CN"),
            "date_time_picker": C.CLF("amazeui.datetimepicker.min"),
            "date_zh": C.CLF("datetimepicker.zh"),
            "boot_time": C.CLF("bootstrap-datetimepicker"),
            "date_picker": C.CLF("bootstrap-datetimepicker"),
            "prettify": C.CLF("prettify"),
            "query_scrollbar": C.CLF("query.scrollbar"),
            "jsbn": C.CLF("jsbn"),
            "prng4": C.CLF("prng4"),
            "rng": C.CLF("rng"),
            "rsa": C.CLF("rsa"),
            "highcharts_more":C.CLF("highcharts-more"),
            "exporting": C.CLF("exporting"),
            'jSignature':C.CLF("jSignature.min"),
            'oldie':C.CLF("oldie"),
            "echarts":C.CLF("echarts.min"),
            "highcharts": C.CLF("highcharts"),
            "highcharts-more": C.CLF("highcharts-more"),
            "highcharts-zh_CN": C.CLF("highcharts-zh_CN"),
            "wysiwyg": C.CLF("wysiwyg"),
            "wysiwyg-editor": C.CLF("wysiwyg-editor"),
        },
        waitSeconds: 90,
        shim: {
            'carota':{
                deps:[],
                exports: 'carota'
            },
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
            },
            'base': {
                deps: [
                    'jquery'
                ],
                exports: 'base'
            },
            'layer': {
                deps: [
                    'jquery'
                ],
                exports: 'layer'
            },
            'highcharts': {
                deps: [
                    'jquery'
                ],
                exports: 'highcharts'
            },
            'highcharts_more': {
                deps: [
                    'jquery'
                ],
                exports: 'highcharts_more'
            },
            'highcharts-zh_CN': {
                deps: [
                    'highcharts'
                ],
                exports: 'highcharts-zh_CN'
            },
            'exporting': {
                deps: [
                    'jquery'
                ],
                exports: 'exporting'
            },
            'hls': {
                deps: [
                    'jquery'
                ],
                exports: 'hls'
            }
        }
    }
};