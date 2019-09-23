/**
 * Created by Administrator on 2018/6/20.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("eval_param_set", "e_task_control/health_solu_mana/health_solu_mana", "css!"),
        C.Co("eval_param_set", "e_task_control/health_solu_mana/health_solu_mana", "html!"),
        C.CM("table"),
        C.CM("three_menu_module"),
        C.CMF("data_center.js")],
    function ($, avalon, css_growthPublic, html, table,three_menu_module, data_center) {
        //获取年级
        var api_get_grade=api.api+"base/grade/findGrades.action";
        var url_page_list_solu = api.api + "score/page_list_solu";
        var avalon_define = function () {
            var health_table = avalon.define({
                $id: "health_solu_mana",
                url: url_page_list_solu,
                //年级
                grade_list:[],
                theadTh: [
                    {title: "序号",type: "index",from: "id"},
                    {title: "方案名称", type: "min_text", from: "solu_name",min_width:"white-space"},
                    {
                        title: "适用年级", type: "cover_text", from: "due_grade",
                        dict: {
                            "1": '一年级',
                            "2": '二年级',
                            "3": '三年级',
                            "4": '四年级',
                            "5": '五年级',
                            "6": '六年级',
                            "7": '初一',
                            "8": '初二',
                            "9": '初三',
                            "10": '高一',
                            "11": '高二',
                            "12": '高三',
                        }
                    },
                    {title: "创建人", type: "text_desc_width", from: "for_name"},
                    {title: "创建时间", type: "text", from: "join"},
                    {title: "使用状态", type: "cover_text", from: "status", dict: {"0": '启用', "1": '停用'}},
                    {
                        title: "操作", type: "html", from:
                        "<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='编辑'></a>"
                    },
                ],
                cbopt:function(params){
                    if (params.type == 2) {
                        var id = params.data._id;
                        window.location = "#health_solu_new?_id="+id;
                    }
                },
                data: {
                    rows: 15,
                    offset: 0
                },
                extend: {
                    solu_name__icontains:"",
                    due_grade:"",
                },
                init:function () {
                    //年级
                    ajax_post(api_get_grade, {status: "1"}, this);
                },
                //创建方案
                create_scheme:function(){
                    window.location='#health_solu_new';
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case api_get_grade:
                                this.grade_list=data.data;
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });
            health_table.init();
            return health_table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });