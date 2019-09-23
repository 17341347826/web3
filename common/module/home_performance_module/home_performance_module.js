/**
 * 日常表现
 */
define(['jquery',
        C.CLF('avalon.js'),'layer',
        C.CM("home_performance_module", "html!"),
        C.CM("home_chart", "css!"),
        C.CM("home_performance_module", "css!"),
        C.CMF("router.js"),
        C.CMF("data_center.js")],
    function ($,avalon,layer,html,css,css2,x, data_center) {
        var pdetail = undefined;
        var vm = avalon.component('ms-home-performance-module', {
            template: html,
            defaults: {
                //新增记录 审核情况 日常表现(指标)
                add_record:api.api + "GrowthRecordBag/home_page_statistics",
                change_tab_num:1,
                good_list:[],
                bad_list:[],
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if(is_suc){
                        switch (cmd){
                            case this.add_record:
                                if(data.data.statistics_everyday){
                                    if(data.data.statistics_everyday.good_list){
                                        if(data.data.statistics_everyday.good_list.length > 0){
                                            this.good_list = data.data.statistics_everyday.good_list;
                                        }else{
                                            this.good_list = [{item:"暂无记录"}];
                                        }
                                    }
                                    if(data.data.statistics_everyday.bad_list){
                                        if(data.data.statistics_everyday.bad_list.length > 0){
                                            this.bad_list = data.data.statistics_everyday.bad_list;
                                        }else{
                                            this.bad_list = [{item:"暂无记录"}];
                                        }
                                    }

                                }else{
                                    this.good_list = [{item:"暂无记录"}];
                                    this.bad_list = [{item:"暂无记录"}];
                                }
                                break;
                        }
                    }else{
                        layer.msg(msg);
                    }
                },
                change_tab: function (index) {
                    switch (index) {
                        case 1:
                            this.change_tab_num = 1;
                            break;
                        case 2:
                            this.change_tab_num = 2;
                            break;
                    }
                },
                onReady: function () {
                    ajax_post(this.add_record,{},this);
                }
            }
        });
    });
