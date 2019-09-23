/**
 * Created by Administrator on 2018/6/21.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("health","health_item_mana/health_item_mana","css!"),
        C.Co("health","health_item_mana/health_item_mana","html!"),
        C.CM("table"),C.CM("three_menu_module"),
        C.CMF("data_center.js")],
    function ($,avalon, css_health_item_mana,  html, table, three_menu_module,data_center) {
        //获取年级
        // var api_get_grade=api.api+"base/grade/findGrades.action";
        var url_health_list = api.api + "score/health_index_list";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "health_item_mana",
                //身份判断
                params:{
                    ident_type:'',
                },
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
                        "<a class='tab-btn tab-edit-btn' :visible='params.ident_type == 0' ms-on-click='@oncbopt({current:$idx, type:2})' title='编辑'></a>"+
                        "<a class='tab-btn tab-edit-btn-disabled' :visible='params.ident_type == 1' title='不可编辑'></a>"
                    },
                ],
                cbopt:function(params){
                    if (params.type == 2) {
                        var id = params.data._id;
                        window.location = "#health_item_edit?_id="+id+'&grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type;
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
                    this.cd();
                },
                cd:function(){
                    var self = this;
                    data_center.uin(function(data){
                       self.params.ident_type = data.data.user_type;
                    });
                },
                //创建
                create_scheme:function(){
                    window.location='#health_item_new_index?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                        '&module_type='+pmx.module_type;
                },
                //测评方案
                test_scheme:function(){
                    window.location = '#health_solu_mana?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                        '&module_type='+pmx.module_type;
                },
                //测评任务
                test_task:function(){
                    window.location = '#health_project_mana?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                        '&module_type='+pmx.module_type;
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