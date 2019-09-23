/**
 * Created by Administrator on 2018/6/21.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("eval_param_set","task_control_see/health_item_mana_see/health_item_mana_see","css!"),
        C.Co("eval_param_set","task_control_see/health_item_mana_see/health_item_mana_see","html!"),
        C.CM("table"),C.CM("three_menu_module"),
        C.CMF("data_center.js")],
    function ($,avalon, css_health_item_mana,  html, table, three_menu_module,data_center) {
        //获取年级
        // var api_get_grade=api.api+"base/grade/findGrades.action";
        var url_health_list = api.api + "score/health_index_list";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "health_item_mana_see",
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
                ],
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
                //测评方案
                test_scheme:function(){
                    window.location = '#health_solu_mana_see?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                        '&module_type='+pmx.module_type;
                },
                //测评任务
                test_task:function(){
                    window.location = '#health_project_mana_see?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
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