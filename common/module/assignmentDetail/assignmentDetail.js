/**
 * 作品作业详情组件
 */
define([
        C.CLF('avalon.js'),
        C.CM("worksDetail","css!"),
        C.CM("assignmentDetail","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "layer"],
    function(avalon, css, html, x, data_center,layer) {
        // 作品作业基本详细信息组件
        var detail = avalon.component('ms-base-work-detail', {
            template: html,
            defaults: {
                url_file:"",//获取文件
                url:"",//获取作品作业详情
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
                data: [],
                request_data:{
                    owner:'',
                    start_date:'',
                    end_date:''
                    // owner:1637,
                    // start_date:'2017-06-17',
                    // end_date:'2017-08-23'
                },
                productGetDetalisById: function() { //get详细
                    this.request_data.start_date = data_center.get_key('start_time');//开始时间
                    this.request_data.end_date = data_center.get_key('end_time');//结束页面
                    this.request_data.owner=Number(data_center.get_key('get_guid'));//学生id
                    ajax_post(this.url,this.request_data.$model, this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    var url=this.url;
                    if (is_suc) {
                        switch (cmd) {
                            case url:
                                this.complete_find_work_curriculum(data);
                                break;
                        }
                    } else {
                        layer.msg(msg)
                    }
                },
                complete_find_work_curriculum:function(data) {
                    this.data = data.data;
                    $('.am-slider').flexslider();//amaze ui js轮播插件
                },
                onReady: function() {
                    // this.request_data.guid=data_center.get_key('get_guid');//学生id
                    // this.request_data.start_time=data_center.get_key('start_time');//开始时间
                    // this.request_data.end_time=data_center.get_key('end_time');//结束页面
                    this.productGetDetalisById();
                }

            }
        })
    });
