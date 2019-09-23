/**
 * Created by uptang on 2017/9/4.
 */

define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("notice", "notice_list/notice_list", "css!"),
        C.Co("notice", "notice_list/notice_list", "html!"),
        "layer",
        C.CM("table"),
        C.CMF("data_center.js"),
        C.CMF("formatUtil.js"),C.CM('three_menu_module')],
    function ($, avalon, css, html, layer, table, data_center, formatUtil,three_menu_module) {
        avalon.filters.fmtDate_notice = function(a){
            if(a){
                return a.substring(0,19);
            }
        };
        //维度table列表
        var table_list = api.api + "Indexmaintain/indexmaintain_selNoticeInfo";
        //删除
        var index_delete = api.api + "Indexmaintain/indexmaintain_delNoticeInfo";
        //保存是否语音广播配置
        var save_radio_status = api.api +"everyday/system_parameter_save";
        //获取是否语音广播
        var get_radio_status = api.api + "everyday/system_parameter_get";
        //将通知信息转储到语音待播报列表
        var notice_to_voice_api = api.api+"Indexmaintain/notice_to_voice";
        var avalon_define = function () {

            var vm = avalon.define({
                $id: "notice_list",
                url: table_list,
                //用户身份
                params:{
                    ident_type:'',
                },
                is_radio:1,
                is_sc_man:false,
                data: {
                    offset: 0,
                    rows: 15
                },
                is_init: true,
                extend: {
                    userType:0,
                    state:0,
                    __hash__: ""
                },
                // 列表表头名称
                theadTh: [
                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    },
                    {
                        title: "标题",
                        type: "min_text",
                        from: "title",
                        min_width:"white-space"
                    },

                    {
                        title: "发布时间",
                        type: "html",

                        from: "<span>{{el.createTime | fmtDate_notice}}</span>"
                    },
                    {
                        title: "状态",
                        type: "cover_text",
                        from: "state",
                        dict: {
                            1: '未发布',
                            2: '已发布',

                        }
                    },

                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-edit-btn' ms-attr='{disabled:el.state==2}' ms-on-click='@oncbopt({current:$idx, type:3})' title='编辑'></a>" +
                        "<a class='tab-btn tab-trash-btn' ms-attr='{disabled:el.state==2}' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>"+
                        "<a class='tab-btn tab-issue-btn' ms-if='el.state!=2' ms-on-click='@oncbopt({current:$idx, type:5})' title='发布'></a>" +
                        "<a class='tab-btn tab-issue-btn-disabled' ms-if='el.state==2'  title='发布'></a>"+
                        "<a class='tab-btn broadcast-btn' title='广播' ms-if='el.state==2 && @params.ident_type == 4' ms-on-click='@oncbopt({current:$idx, type:7})'></a>"+
                        // "<a class='tab-btn broadcast-btn' title='广播' ms-attr='{disabled:@params.ident_type == 4 || el.state==2}'ms-on-click='@oncbopt({current:$idx, type:7})'></a>"+
                        "<a class='tab-btn broadcast-btn-disabled' ms-if='el.state==1 && @params.ident_type == 4'  title='广播'></a>"

                    }],

                init: function () {
                    //user_type='1' 时才有值。1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                    var user_level = cloud.user_level();
                    this.params.ident_type = user_level;
                    var user_type = cloud.user_type();
                    if(user_type==0&&user_level==4){
                        this.is_sc_man = true;
                        ajax_post(get_radio_status, {p_type: 2}, this);
                    }
                    this.is_init = true;
                },
                create_notice: function () {
                    window.location = "#create_notice";
                },
                save_radio_status:function (status) {
                    if(this.is_sc_man){
                        ajax_post(save_radio_status, {p_type: 2,kg:status}, this);
                    }
                },
                cbopt: function (params) {
                    if (params.type == 3) {
                        window.location = "#create_notice?id=" + params.data.id;
                    } else if (params.type == 4) {
                        var self = this;
                        layer.open({
                            title: "提示",
                            content: '是否删除？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                ajax_post(index_delete, {id: params.data.id,state:0}, self);
                                layer.close(index);
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    } else if (params.type == 5) {
                        var self = this;
                        layer.open({
                            title: "提示",
                            content: '是否确定发布？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                ajax_post(index_delete, {id: params.data.id,state:2}, self);
                                layer.close(index);
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    }
                    if(params.type==7){
                        ajax_post(notice_to_voice_api,{
                            id:params.data.id,
                            num:1
                        },this)
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case index_delete:
                                this.extend.__hash__ = new Date();
                                break;
                            case get_radio_status:
                                if(data.data == null || data.data.length == 0)
                                    return;
                                this.is_radio = data.data.kg;
                                break;
                            case save_radio_status:
                                break;
                            case notice_to_voice_api:
                                toastr.success('播报成功！')
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });

            vm.init();

            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }

    });