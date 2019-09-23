/**
 * Created by Administrator on 2018/6/20.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("eval_param_set","task_control_see/health_project_mana_see/health_project_mana_see","css!"),
        C.Co("eval_param_set","task_control_see/health_project_mana_see/health_project_mana_see","html!"),
        C.CM("table"),C.CM('page_title'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")],
    function ($,avalon, css, html, table, page_title,data_center,three_menu_module) {
        var health_item_list = "";
        //获取年级
        var api_get_grade=api.api+"base/grade/findGrades.action";
        var url_health_list = api.api + "score/health_project_list";

        var rela_list = [
            {url:"#health_item_mana_see", power_name:"测评项目"},
            {url:"#health_solu_mana_see", power_name:"测评方案"},
            {url:"#health_project_mana_see", power_name:"测评任务"},
        ];

        var avalon_define = function (pmx) {
            var health_table = avalon.define({
                $id: "health_project_mana_see",
                url:url_health_list,
                //年级
                grade_list:[],
                params:{
                    work_id:"",
                    ident_type:''
                },
                theadTh:[
                    { title: "序号", type:"index", from:"id"},
                    { title: "任务名称", type: "min_text", from: "name",min_width:"white-space" },
                    {
                        title: "年级年级", type: "cover_text", from: "due_grade",
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
                    { title: "开始时间", type: "text", from: "start" },
                    { title: "结束时间", type: "text", from: "end"},
                    { title: "创建人", type: "text_desc_width", from: "for_name" },
                    { title: "创建时间", type: "text", from: "join" },
                ],
                data:{
                    rows:15,
                    offset:0
                },
                extend:{
                    name__icontains:'',
                    start:'',
                    end:'',
                    due_grade:'',
                },
                //测评项目
                test_project:function(){
                    window.location = '#health_item_mana_see?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                        '&module_type='+pmx.module_type;
                },
                //测评方案
                test_scheme:function(){
                    window.location = '#health_solu_mana_see?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                        '&module_type='+pmx.module_type;
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var data_x = JSON.parse(data.data['user']);
                        self.params.work_id = data_x.fk_school_id;
                        self.params.ident_type = data.data.user_type;
                        //年级
                        ajax_post(api_get_grade, {status: "1"}, self);
                    });
                },
                init:function () {
                    var three_info = JSON.parse(sessionStorage.getItem("three_info"));
                    if(three_info != null){
                        three_info.elements = rela_list;
                    }
                    sessionStorage.setItem("three_info", JSON.stringify(three_info));
                    sessionStorage.setItem("is_menu_show", "2");
                    this.cb();
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
                    this.grade_list=data.data;
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
            define: avalon_define,
            date_input:{startDate:"start_time_input",endDate:"end_time_input",type:1}
        }
    });