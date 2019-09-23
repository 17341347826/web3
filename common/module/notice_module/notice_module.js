/**
 * 通知版本更新
 */
define(['jquery',
        C.CLF('avalon.js'),'layer',
        C.CM("notice_module", "html!"),
        C.CM("home_chart", "css!"),
        C.CM("notice_module", "css!"),
        C.CMF("router.js"),
        C.CMF("data_center.js")],
    function ($,avalon,layer,html,css,home_chart,x, data_center) {
        var pdetail = undefined;
        var vm = avalon.component('ms-notice-module', {
            template: html,
            defaults: {
                //获取最新的一条通知
                new_notice:api.api + "Indexmaintain/indexmaintain_selNewNoticeInfo",
                //查询版本更新通知
                edition_notice:api.api + "Indexmaintain/indexmaintain_findversionnotify",
                change_tab_num:1,
                notice_data:[],
                version_content:"",
                //身份等级
                ident:'',
                //查看更多
                notice_more:function(){
                    window.location = '#notice_more';
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if(is_suc){
                        switch (cmd){
                            //最新通知
                            case this.new_notice:
                                if(data.data){
                                    this.notice_data = data.data;
                                }else{
                                    this.notice_data = {title:"暂无最新数据"};
                                }
                                break;
                                //版本更新通知
                            case this.edition_notice:
                                this.version_content = data.data[0].content;
                                break;

                        }
                    }else{
                        toastr.error(msg);
                    }
                },
                change_tab: function (index) {
                    switch (index) {
                        case 1:
                            this.change_tab_num = 1;
                            break;
                        case 2:
                            this.change_tab_num = 2;
                            ajax_post(this.edition_notice,{},this);
                            break;
                    }
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        self.ident = Number(data.data.highest_level);
                        var userType = Number(data.data.user_type);
                        ajax_post(self.new_notice,{userType:userType},self);
                    });
                },
                onReady: function () {
                    this.cb();
                }
            }
        });
    });
