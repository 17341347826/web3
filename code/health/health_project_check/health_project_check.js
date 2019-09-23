/**
 * Created by Administrator on 2017/8/2.
 */
/**
 * Created by uptang on 2017/6/5.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("health","health_project_check/health_project_check","css!"),
        C.Co("health","health_project_check/health_project_check","html!"),
        C.CM("table"),
        C.CMF("data_center.js"), C.CM('three_menu_module')],
    function ($,avalon, css, html, table, data_center,three_menu_module) {
        var health_item_list = "";
        var url_health_list = api.api + "score/health_project_check_list";
        var avalon_define = function () {
            var health_table = avalon.define({
                $id: "health_project_list",
                url:url_health_list,
                is_init:true,
                theadTh:[
                    { title: "序号", type:"index", from:"id"},
                    { title: "测试项名称", type: "text", from: "name" },
                    { title: "创建人", type: "text", from: "for_name" },
                    { title: "创建时间", type: "text", from: "join" },
                    { title: "审核状态", type: "cover_text", from: "check_status",dict: {1: '待审核', 2: '己审核',3:'未通过'}},
                    { title: "操作", type: "html", from:
                        "<a class='tab-btn tab-audit-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='审核'></a>"
                    }
                ],
                cbopt: function (params) {
                    if (params.type == 2) {
                         var id = params.data._id;
                         window.location = "#health_project_check_detail?_id="+id;
                    }
                },
                data:{
                    rows:15,
                    offset:0
                },
                extend:{
                    name__icontains:'',
                    start:'', 
                    end:''
                },
                init:function () {

                }
            });
            health_table.init();
            return health_table;
        };
        return {
            view: html,
            define: avalon_define,
            date_input:{startDate:"start_time_input",endDate:"end_time_input",type:1}
        }
    });