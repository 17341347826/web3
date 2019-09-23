/**
 * Created by Administrator on 2018/6/20.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("eval_param_set", "task_control_see/health_solu_mana_see/health_solu_mana_see", "css!"),
        C.Co("eval_param_set", "task_control_see/health_solu_mana_see/health_solu_mana_see", "html!"),
        C.CM("table"),
        C.CM("three_menu_module"),
        C.CMF("data_center.js")],
    function ($, avalon, css_growthPublic, html, table,three_menu_module, data_center) {
        //获取年级
        var api_get_grade=api.api+"base/grade/findGrades.action";
        var url_page_list_solu = api.api + "score/page_list_solu";
        var grade_list = [
            {id:"", "remark":"全部"},
            {id:"7", "remark":'七年级'},
            {id:"8", "remark":'八年级'},
            {id:"9", "remark":'九年级'},

        ]
        var avalon_define = function (pmx) {
            var health_table = avalon.define({
                $id: "health_solu_mana_see",
                url: url_page_list_solu,

                //身份判断
                params:{
                    ident_type:'',
                },
                //年级
                grade_list:grade_list,
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
                            "7": '七年级',
                            "8": '八年级',
                            "9": '九年级',
                            "10": '高一',
                            "11": '高二',
                            "12": '高三',
                        }
                    },
                    {title: "创建人", type: "text_desc_width", from: "for_name"},
                    {title: "创建时间", type: "text", from: "join"},
                    {title: "使用状态", type: "cover_text", from: "status", dict: {"0": '启用', "1": '停用'}},
                ],
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
                    this.cd();
                },
                cd:function(){
                    var self = this;
                    data_center.uin(function(data){
                        self.params.ident_type = data.data.user_type;
                    });
                },
                //测评项目
                test_project:function(){
                    window.location = '#health_item_mana_see?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                        '&module_type='+pmx.module_type;
                },
                //测评任务
                test_task:function(){
                    window.location = '#health_project_mana_see?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                        '&module_type='+pmx.module_type;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //年级名称
                grade_name:'',
                complete_get_grade:function(data){
                    //this.grade_list=data.data;
                    var grade_id = pmx.grade_id;
                    for(var i=0;i<data.data.length;i++){
                        var id = data.data[i].id;
                        if(id == grade_id){
                            this.extend.due_grade = remart_2_no(data.data[i].remark).toString();
                            this.grade_name = data.data[i].remark;
                        }
                    }
                },
            });
            health_table.init();
            return health_table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });