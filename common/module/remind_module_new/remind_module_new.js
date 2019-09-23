/**
 * 待处理+待审核左右结构-除校外
 */
define(['jquery',
        C.CLF('avalon.js'),
        C.CM("home_chart", "css!"),
        C.CM("remind_module_new","css!"),
        C.CM("remind_module_new","html!"),
        C.CMF("data_center.js"), "highcharts",
        "highcharts_more",
        "layer"],
    function ($,avalon,css1,css2, html,data_center, highcharts,highcharts_more,layer) {
        var pdetail = undefined;
        var detail = avalon.component('ms-remind-module-new', {
            template: html,
            defaults: {
                change_tab_num:1,
                userType:"",
                //待处理任务
                pending_url:api.growth + "pendingItems",
                pending_list:[],
                onReady:function () {
                    ajax_post(this.pending_url,{},this)
                },
                detail:function (url) {
                    if(url){
                        window.location.href = url;
                    }
                },
                change_tab:function (index) {
                    this.change_tab_num = index;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if(is_suc){
                        switch (cmd) {
                            case this.pending_url:
                                if(data.data.length > 0){
                                    this.pending_list = data.data;
                                }else{
                                    this.pending_list = [{mod:'暂无数据',title:"待审核"},{mod:'暂无数据',title:"待评价"}]
                                }

                                // this.pending_list = [
                                //     {"mod":"民主评价-教师评","count":47,"href":"#teacher_evaluation_list","title":"待评价","type":"1"},
                                //     {"mod":"成就奖励","count":1,"href":"#achieveCheck","title":"待审核","type":"1"},
                                //     {"mod":"艺术活动","count":3,"href":"#artactivityCheck","title":"待审核","type":"1"},
                                //     {"mod":"研究性学习","count":3,"href":"#study_check_list","title":"待审核","type":"1"},
                                //     {"mod":"身心健康","count":3,"href":"#healthActivityCheck","title":"待审核","type":"1"},
                                //     {"mod":"民主评价-教师评","count":47,"href":"#teacher_evaluation_list","title":"待评价","type":"1"},
                                //     {"mod":"成就奖励","count":1,"href":"#achieveCheck","title":"待审核","type":"1"},
                                //     {"mod":"艺术活动","count":3,"href":"#artactivityCheck","title":"待审核","type":"1"},
                                //     {"mod":"研究性学习","count":3,"href":"#study_check_list","title":"待审核","type":"1"},
                                //     {"mod":"身心健康","count":3,"href":"#healthActivityCheck","title":"待审核","type":"1"}
                                //     ]
                                break;
                        }
                    }else{
                        toastr.error(msg);
                    }
                }
            }
        });

    });