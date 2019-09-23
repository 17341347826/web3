/**
 * Created by Administrator on 2018/8/31.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("notice", "notice_more/notice_more", "css!"),
        C.Co("notice", "notice_more/notice_more", "html!"),
        "layer",
        C.CMF("data_center.js"),
        C.CMF("formatUtil.js")],
    function ($, avalon, css, html, layer, data_center, formatUtil) {
        //查询更多通知列表
        var api_notice_list = api.api + 'Indexmaintain/page_notice';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "notice_more",
                //请求参数
                extend: {
                    //用户类型
                    userType:'',
                    //0：查询所有列表，1：查询最近一个月列表信息
                    // state:0,
                    // offset:0,
                    // rows:9999,
                },
                //公告列表
                notice_list:[],
                cd:function(){
                    var self = this;
                    data_center.uin(function(data){
                        //用户类型--0：管理员；1：教师；2：学生；3：家长
                        var user_type = data.data.user_type;
                        self.extend.userType = Number(user_type);
                        ajax_post(api_notice_list,self.extend.$model,self);
                    });
                },
                //详情查看
                notice_detail:function(el){
                    window.location = '#notice_more_detail';
                    sessionStorage.setItem('notice_detail',JSON.stringify(el));
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //公告列表
                            case api_notice_list:
                               this.notice_list = data.data.list;
                               break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });
            vm.cd();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }

    });