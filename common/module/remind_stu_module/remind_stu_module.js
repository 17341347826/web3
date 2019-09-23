/**
 * 待处理（待录入）-学生
 */
define(['jquery',
        C.CLF('avalon.js'),
        C.CM("home_chart", "css!"),
        C.CM("remind_stu_module","css!"),
        C.CM("remind_stu_module","html!"),
        C.CMF("data_center.js"),
        "layer"],
    function ($,avalon,css1,css2, html,data_center, layer) {
        var pdetail = undefined;
        var detail = avalon.component('ms-remind-stu-module', {
            template: html,
            defaults: {
                userType:"",
                //待处理任务
                pending_url:api.growth + "pendingItems",
                pending_list:[],
                onReady:function () {
                    ajax_post(this.pending_url,{},this)
                },
                detail:function (el) {
                    console.log(el)
                    if(el.mod != "暂无数据"){
                        window.location.href = el.href;
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if(is_suc){
                        switch (cmd) {
                            case this.pending_url:
                                if(data.data.length > 0){
                                    this.pending_list = data.data;
                                }else{
                                    this.pending_list = [{mod:'暂无数据',title:"待评价"}]
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
                        layer.msg(msg);
                    }
                }
            }
        });

    });