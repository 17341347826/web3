/**
 * 学业水平记录详情组件
 */
define([
        C.CLF('avalon.js'),
        C.CM("worksDetail","css!"),
        C.CM("academicDetail","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "layer"],
    function(avalon, css, html, x, data_center,layer) {
        // 学业水平记录基本详细信息组件
        var detail = avalon.component('ms-base-academic-detail', {
            template: html,
            defaults: {
                url_file:"",//获取图片文件
                url:"",//获取学业水平记录详情
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
                    console.log( this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id)
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                request_data:{
                    owner:'',
                    start_date:'',
                    end_date:''
                    // owner:1637,
                    // start_date:'2017-06-17',
                    // end_date:'2017-08-23'
                },
                data: {
                    id: "",
                    course_name: "",
                    course_startTime: "",
                    course_endTime: "",
                    place: "",
                    know_teacher: "",
                    role: "",
                    reap: "",
                    task:"",
                    elapsed_time: "",
                    topic: "",
                    process: "",
                    conclusion: ""
                },
                productGetDetalisById: function() { //get详细
                    this.request_data.start_date = data_center.get_key('start_time');//开始时间
                    this.request_data.end_date = data_center.get_key('end_time');//结束页面
                    this.request_data.owner=Number(data_center.get_key('get_guid'));//学生id
                    ajax_post(this.url, this.request_data.$model, this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case this.url:
                                this.complete_find_study_curriculum(data);
                                break;
                        }
                    } else {
                        layer.msg(msg)
                    }
                },
                //???
                complete_find_study_curriculum:function(data) {
                    this.data = data.data;
                    $('.am-slider').flexslider();//amaze ui js轮播插件
                },
                onReady: function() {
                    // this.request_data.owner=Number(sessionStorage.getItem("get_guid"));
                    // this.request_data.start_date=sessionStorage.getItem("start_time");
                    // this.request_data.end_date=sessionStorage.getItem("end_time");

                    $('.am-gallery').pureview();//web组件
                    this.productGetDetalisById();
                }

            }
        })

    });