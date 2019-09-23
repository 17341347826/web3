/**
 * Created by Administrator on 2018/6/21.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("eval_param_set","e_task_control/health_item_mana/health_item_mana","css!"),
        C.Co("eval_param_set","e_task_control/health_item_mana/health_item_mana","html!"),
        C.CM("table"),C.CM("three_menu_module"),
        C.CMF("data_center.js")],
    function ($,avalon, css_health_item_mana,  html, table, three_menu_module,data_center) {
        //获取年级
        // var api_get_grade=api.api+"base/grade/findGrades.action";
        var url_health_list = api.api + "score/health_index_list";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "health_item_mana",
                url:url_health_list,
                //年级列表
                // grade_list:[],
                theadTh:[
                    {title: "序号",type: "index",from: "id"},
                    { title: "测试项名称", type: "min_text", from: "name",min_width:"white-space" },
                    { title: "适用性别", type: "cover_text", from: "for_sex", dict: {1: '男', 2: '女'}},
                    { title: "创建人", type: "text", from: "for_name" },
                    { title: "创建时间", type: "text", from: "join" },
                    { title: "操作", type: "html", from:
                        "<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='编辑'></a>"
                    },
                ],
                cbopt:function(params){
                    if (params.type == 2) {
                        var id = params.data._id;
                        window.location = "#health_item_edit?_id="+id;
                    }
                },
                data:{
                    rows:99,
                    offset:0
                },
                extend:{
                    for_sex:0,
                    name__icontains:'',
                },
                init:function () {
                    //年级
                    // ajax_post(api_get_grade, {status: "1"}, this);
                },
                //创建
                create_scheme:function(){
                    window.location='#health_item_new_index';
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