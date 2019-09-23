/**
 * 品德详情组件
 */
define([
        C.CLF('avalon.js'),
        C.CM("worksDetail","css!"),
        C.CM("social_practice_detail","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "layer"],
    function(avalon, css, html, x, data_center,layer) {
        // 作品基本详细信息组件
        var detail = avalon.component('ms-social_practice_detail', {
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
                social_practice_data:{
                    end_date:'',
                    owner:'',
                    start_date:''
                    // end_date: '2017-09-27',
                    // owner: 3217,
                    // start_date:'2017-08-30'
                },
                productGetDetalisById: function() { //get详细
                    //-------------------
                    this.social_practice_data.start_date = data_center.get_key('start_time');//开始时间
                    this.social_practice_data.end_date = data_center.get_key('end_time');//结束页面
                    this.social_practice_data.owner=Number(data_center.get_key('get_guid'));//学生id
                    //----------------------------------
                    ajax_post(this.url,this.social_practice_data.$model, this);
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
                    this.productGetDetalisById();
                },
                complete_moralDevelopmentGetDetalisById:function (data) {
                    this.data = data.data;
                    $('.am-slider').flexslider();
                }
               
            }
        })
    });