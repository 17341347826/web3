/**
 * Created by Administrator on 2018/9/20.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("user", "recruit_infor_list/recruit_infor_list", "css!"),
        C.Co("user", "recruit_infor_list/recruit_infor_list", "html!"),
        "layer",
        C.CMF("data_center.js"),
        C.CMF("formatUtil.js")],
    function ($, avalon, css, html, layer, data_center, formatUtil) {
        avalon.filters.fmtDate_notice = function(a){
            if(a){
                return a.substring(0,19);
            }
        };
        //招募信息列表
        var api_notice_list = api.api + "GrowthRecordBag/query_community_recruit_by_fkdwid";
        //删除
        var api_notice_delete = api.api + "GrowthRecordBag/delete_community_recruit";
        //发布
        var api_notice_release = api.api + "GrowthRecordBag/publish_community_recruit";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "recruit_infor_list",
                //通知列表
                notice_list:[],

                init: function () {
                    var user_level = cloud.user_level();
                    var user_type = cloud.user_type();
                    //    查询列表
                    ajax_post(api_notice_list,{},this);
                },
                //创建
                create_notice: function () {
                    window.location = "#recruit_infor_create";
                },
                //编辑社团
                edit_notice:function(el){
                    var notice_info = JSON.stringify(el);
                    window.location = "#recruit_infor_create?notice_info="+notice_info;
                },
                //删除社团
                delete_notice:function(el){
                    var self = this;
                    layer.open({
                        title: "提示",
                        content: '是否删除？',
                        btn: ['确定', '取消'],
                        yes: function (index, layero) {
                            ajax_post(api_notice_delete, {id:el.id}, self);
                            layer.close(index);
                        },
                        // btn2: function (index, layero) {
                        //     layer.close(index);
                        // }
                    });
                },
                //发布
                release_notice:function(el){
                    var self = this;
                    layer.open({
                        title: "提示",
                        content: '是否确定发布？',
                        btn: ['确定', '取消'],
                        yes: function (index, layero) {
                            ajax_post(api_notice_release, {
                                bt:el.bt,
                                dwmc:el.dwmc,
                                fk_dw_id:el.fk_dw_id,
                                id:el.id,
                                nr:el.nr
                            }, self);
                            layer.close(index);
                        },
                        // btn2: function (index, layero) {
                        //     layer.close(index);
                        // }
                    });
                },
                //页面切换
                gra_change:function(num){
                    if(num == 1){
                        window.location = '#club_member_list';
                    }else if(num == 2){
                        window.location = '#club_notice';
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //    通知列表
                            case api_notice_list:
                                this.complete_notice_list(data);
                                break;
                            //    删除社团
                            case api_notice_delete:
                                //    查询列表
                                ajax_post(api_notice_list,{},this);
                                toastr.success('删除成功！');
                                break;
                            //    发布
                            case api_notice_release:
                                //    查询列表
                                ajax_post(api_notice_list,{},this);
                                toastr.success('发布成功！');
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //    通知列表
                complete_notice_list:function(data){
                    if(data.data == null || data.data.length == 0)
                        return;
                    this.notice_list = data.data;
                },
            });

            vm.init();

            return vm;
        };
        return {
            view: html,
            define: avalon_define,
            repaint:true,
        }

    });