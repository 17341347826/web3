/**
 * 品德详情组件
 */
define([
        C.CLF('avalon.js'),
        C.CM("worksDetail","css!"),
        C.CM("physical_health_detail","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "layer"],
    function(avalon, css, html, x, data_center,layer) {
        var pdetail = undefined;
        // 作品基本详细信息组件
        var detail = avalon.component('ms-physical-health-detail', {
            template: html,
            defaults: {
                url_file:"",//获取文件
                url:"",//获取品德详情
                rotation_str: function(x) {
                    var deg = 'rotate(' + x + 'deg)'
                    return {
                        'WebkitTransform': deg,
                        'MosTransform': deg,
                        'OTransform': deg,
                        'transform': deg
                    }
                },
                url_for: function(id) {
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                data:[],
                heath_data:{
                    hea_endDate:'',
                    hea_ownerid:'',
                    hea_startDate:''
                    // hea_endDate: '2017-09-27',
                    // hea_ownerid: 3217,
                    // hea_startDate:'2017-08-30'
                },
                productGetDetalisById: function() { //get详细
                    // this.data.id = data_center.get_key("get_guid");
                    //-------------------
                    this.heath_data.hea_startDate = data_center.get_key('start_time');//开始时间
                    this.heath_data.hea_endDate = data_center.get_key('end_time');//结束页面
                    this.heath_data.hea_ownerid=Number(data_center.get_key('get_guid'));//学生id
                    //----------------------------------
                    ajax_post(this.url,this.heath_data.$model, this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case this.url:
                                this.complete_moralDevelopmentGetDetalisById(data);
                                break;
                        }
                    } else {
                        layer.msg(msg)
                    }
                },
                onReady: function() {
                    pdetail = this;
                    $('.am-gallery').pureview();
                    // pdetail.data.id = sessionStorage.getItem("id");
                    this.productGetDetalisById();
                },
                complete_moralDevelopmentGetDetalisById:function (data) {
                    this.data= data.data;
                    $('.am-slider').flexslider();
                }
               
            }
        })

    });