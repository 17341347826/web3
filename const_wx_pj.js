/**
 * Created by Administrator on 2017/4/17.
 */
var HTTP_X = location.origin+"/";
prefix_base = HTTP_X;
prefix_common_img = prefix_base + "common/images/";
prefix_common_mod = prefix_base + "common/module/";
prefix_lib = prefix_base + "common/lib/";
prefix_code = prefix_base + "code/";

var is_app = false;
var is_weixin = false;

C = {
    CB:function (x) {
      return prefix_base + x;
    },
    CBF:function(x, tag){
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
    // 加载模块C.Co2("weixin/daily", "list", "css!"),
    Co2: function (p, m, tag) {
        return (tag || "") + prefix_code + p + "/" + m+'/'+m;
    },
    // 加载模块集
    // C original model
    Com: function (p) {
        return prefix_code + p + "/" + p + ".js";
    },
    // 加载通用模块
    // Common Model
    CP: function (x, tag) {
        return (tag || "") + prefix_common_mod + x + "/" + x ;
    },
    //通用图片
    CI:function(x){
        return prefix_common_img + x;
    }
};
url_api_base = HTTP_X + "api/";
// 全局标志位
api={
    PCPlayer :url_api_base+"base/",
    growth:url_api_base+"GrowthRecordBag/",
    api:url_api_base,
    user:url_api_base+"base/",
    skip_on_not_login: HTTP_X+ "/Growth/wx_pj.html#login"
};
glb_staus = {
    is_debug: true,
    inner: true,
    map: {
        "paths": {
            "text": C.CLF("require/text"),
            "css": C.CLF("require/css"),
            "html": C.CLF("require/html"),
            // "lodash": "//cdn.bootcss.com/lodash.js/4.17.4/lodash.min",
            "lodash": C.CLF("lodash.min"),
            // "layer": "//cdn.bootcss.com/layer/3.0/layer.min",
            "layer": C.CLF("layer.min"),
            // "amazeui": "//cdn.bootcss.com/amazeui/2.7.2/js/amazeui.min",
            "amazeui": C.CLF("amazeui.min"),
            // jquery 必须放于path 中，否则jquery会加载失败。require.js内部对jquery进行了amd处理
            "jquery": C.CLF("jquery.min"),
            "PCAS":C.CP("pcasclass"),
            "plupload":C.CLF("uploader/plupload.full.min"),
            // "select2":"//cdn.bootcss.com/select2/4.0.3/js/select2.min",
            "select2": C.CLF("select2.min"),
            "date_time_picker":C.CLF("amazeui.datetimepicker.min"),
            "date_zh":C.CLF("datetimepicker.zh"),
            "boot_time":C.CLF("bootstrap-datetimepicker"),
            "date_picker":C.CLF("bootstrap-datetimepicker"),
            "prettify":C.CLF("prettify"),
            "query_scrollbar":C.CLF("query.scrollbar"),
            "jsbn":C.CLF("jsbn"),
            "prng4":C.CLF("prng4"),
            "rng":C.CLF("rng"),
            "weui":C.CLF("jquery-weui.min"),
            "rsa":C.CLF("rsa"),
            // "jquery-weui":"//cdn.bootcss.com/jquery-weui/1.0.1/js/jquery-weui.min",
            "jquery-weui":C.CLF("jquery-weui.min"),
            // "swiper":"//cdn.bootcss.com/jquery-weui/1.0.1/js/swiper.min",
            "swiper":C.CLF("swiper.min"),
            // "city_picker":"https://cdn.bootcss.com/jquery-weui/1.0.1/js/city-picker.min",
            "city_picker":C.CLF("city-picker.min"),
            "highcharts": C.CLF("highcharts"),
            "highcharts_more": C.CLF("highcharts-more"),
            "highcharts-zh_CN": C.CLF("highcharts-zh_CN"),
            "echarts":C.CLF("echarts.min"),
            // "jsencrypt":C.CLF("jsencrypt"),
            // "jsencrypt_min":C.CLF("jsencrypt.min")
            // "JSEncrypt":"https://cdn.bootcss.com/jsencrypt/2.3.1/jsencrypt"
            'pinchzoom':C.CLF('pinchzoom'),
        },
        waitSeconds: 90,
        shim: {
            'plupload': {
                deps: [
                    'jquery'
                ],
                exports: 'plupload'
            },
            'PCAS':{
                deps:[
                    'jquery'
                ],
                exports: 'PCAS'
            },
            'base':{
                deps:[
                    'jquery'
                ],
                exports: 'base'
            },
            'layer':{
                deps:[
                    'jquery'
                ],
                exports: 'layer'
            },
            'pinchzoom':{
                deps:[
                    'jquery'
                ],
                exports: 'pinchzoom'
            },
            'highcharts': {
                deps: [
                    'jquery'
                ],
                exports: 'highcharts'
            },
            'highcharts_more': {
                deps: [
                    'highcharts'
                ],
                exports: 'highcharts_more'
            },
            'highcharts-zh_CN': {
                deps: [
                    'highcharts'
                ],
                exports: 'highcharts-zh_CN'
            },
            'swiper': {
                deps: [
                    'jquery-weui'
                ],
                exports: 'swiper'
            },
        },
       urlArgs: "bust=" +  (new Date()).getTime()
    }
};

