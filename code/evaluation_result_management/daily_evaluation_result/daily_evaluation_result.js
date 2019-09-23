/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_result_management', 'daily_evaluation_result/daily_evaluation_result', 'html!'),
        C.Co('evaluation_condition_monitor', 'teacher_review_progress/teacher_review_progress', 'css!'),
        C.Co('evaluation_result_management', 'daily_evaluation_result/daily_evaluation_result', 'css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CM("select_assembly"),
        C.CM("table"),
    ],
    function ($, avalon, layer, html, css1,css2, data_center, three_menu_module, select_assembly,table) {
        var avalon_define = function () {
            var url_data = api.api + "Indexmaintain/indexmaintain_getbonuspointproscore";
            var vm = avalon.define({
                $id: "rp",
                //年级数组
                grade_arr: [],
                grade_default:"",
                semester_arr:[],
                semester_default:"",
                school_list:[],
                school_list_default:"",
                //班级数组
                class_arr: [],
                class_default:"",
                // 选择区悬
                area_arr:[],
                //项目数组
                project_arr:[],
                project_default:"",
                stu_code:'',
                stu_name:'',
                data:{
                    city:"",
                    district:"",
                    fk_bj_id:"",
                    fk_nj_id:"",
                    fk_xq_id:"",
                    fk_xx_id:"",
                    xsxjh:"",
                    xsxm:"",
                    __hash__:"",
                },
                url: url_data,
                theadTh:[
                    {title: "序号", type: "index", from: "id" },
                    {title: "姓名", type: "text", from: "student_name"},
                    {title: "学籍号", type: "text", from: "student_num"},
                    {title:"目标与计划完成情况",type:"text", from:"targetplan_score"},
                    {title:"日常表现与个性特长",type:"html", from:"{{el.specialpersonality_score+el.everyday_score}}"},
                    {title:"综合实践",type:"text", from:"activity_score"},
                    {title:"荣誉奖励",type:"text", from:"prize_score"},
                    {title:"总分",type:"text", from:"score"},
                ],
                pms_row: {
                    offset: 0,
                    rows: 15,
                },
                xsxjh:"",
                xsxm:"",
                index_nj:0,
                only_hash:true,
                is_district_user:false,
                is_school_user:false,
                is_teacher_user:false,
                is_city_user:false,
                dataInfo:[],
                init: function () {
                    var user_auto = cloud.auto_grade_list();
                    this.grade_arr = any_2_select(user_auto, {name:"grade_name", value:["id"]});
                    if(this.grade_arr.length==0){
                        toastr.error('暂无教授年级信息')
                        return;
                    }

                    this.grade_sel(this.grade_arr[0], 0);

                    var sem_list = cloud.grade_semester_list({grade_id:this.grade_arr[0].value});
                    this.semester_arr = any_2_select(sem_list, {name:"semester_name", value:["id"]})
                    this.semester_default =this.semester_arr[0].name;
                    this.data.fk_xq_id = this.semester_arr[0].value;
                    this.is_school_user = cloud.is_school_user();
                    this.is_city_user = cloud.is_city_leader();
                    vm.data.city = cloud.user_city();
                    if(this.is_school_user){
                        vm.is_teacher_user = cloud.is_teacher();
                        vm.data.fk_xx_id = cloud.user_school_id();
                        vm.data.district = cloud.user_district();
                        vm.refresh_class();
                    }
                    else if(cloud.is_district_leader()){
                        vm.is_district_user = true;
                        vm.data.district = cloud.user_district();
                        vm.refresh_school();_
                    }else if(vm.is_city_user){
                        vm.refresh_area();
                    }
                },
                refresh_area:function () {
                    var area_list = cloud.area_list({city:this.data.city});
                    area_list = [{district:"请选择区县",id:""}].concat(area_list);
                    this.area_arr = any_2_select(area_list, {name:"district", value:["id"]})
                },
                refresh_school:function () {
                        var school_list = cloud.school_list({"district":vm.data.district});
                        school_list = [{schoolname:'请选择学校', id:''}].concat(school_list);
                        vm.school_list = any_2_select(school_list, {name:"schoolname", value:["id"]});
                },
                refresh_class:function () {
                    if(vm.is_teacher_user){
                        var grade_list = cloud.auto_grade_list();
                        var class_list = grade_list[vm.index_nj].class_list;
                        this.class_arr = any_2_select(class_list, {name:"class_name", value:["class_id"]});
                    }else{
                        var class_list = cloud.class_list({fk_school_id: this.data.fk_xx_id, fk_grade_id: this.data.fk_nj_id});
                        this.class_arr = any_2_select(class_list, {name:"class_name", value:["id"]})
                    }
                },
                area_sel:function (el,index) {
                    if(el.value==""){
                         this.data.district = "";
                         this.school_list = [];
                         this.class_arr = [];
                         return;
                    }else{
                        this.data.district = el.name;
                    }
                    data_center.scope("daily_eva_xx", function (p) {
                        p.head_value = "请选择学校";
                    });
                    data_center.scope("daily_eva_bj", function (p) {
                        p.head_value = "请选择班级";
                    });
                    this.data.fk_xx_id = "";
                    this.data.fk_bj_id = "";
                    this.refresh_school();
                    vm.refresh_table();
                },
                refresh_table:function () {
                  vm.data.__hash__ = new Date();
                },
                school_sel:function (el) {
                      vm.data.fk_xx_id = el.value;
                      vm.data.fk_bj_id = "";
                      if(el.value==""){
                          vm.class_arr = [];
                          vm.refresh_table();
                          return;
                      }
                      data_center.scope("daily_eva_bj", function (p) {
                        p.head_value = "请选择班级";
                    });
                      this.refresh_class();
                      vm.refresh_table();
                },
                grade_sel: function (el, index) {
                    this.index_nj = index;
                    this.data.fk_nj_id = el.value;

                    var sem_list = cloud.grade_semester_list({grade_id:el.value});
                    this.semester_arr = any_2_select(sem_list, {name:"semester_name", value:["id"]})

                    data_center.scope("daily_eva_nj", function (p) {
                       p.head_value = el.name;
                    });
                    vm.refresh_table();
                },
                semester_sel:function (el) {
                    this.data.fk_xq_id = el.value;
                    vm.refresh_table();
                },
                class_sel: function (el) {
                    this.data.fk_bj_id = el.value;
                   vm.refresh_table();
                },
                //模糊查询
                check_code:function () {
                    var arr = [];
                    var data = this.dataInfo.$model;
                    var length = data.length;
                    var code = this.xsxjh;
                    for(var i = 0; i < length; i++){
                        if(data[i].student_num.indexOf(code) != -1){
                            arr.push(data[i])
                        }
                    }
                    this.dataInfo = arr;

                },
                check_name:function () {
                    var arr = [];
                    var data = this.dataInfo.$model;
                    var length = data.length;
                    var name = this.xsxm;
                    for(var i = 0; i < length; i++){
                        if(data[i].student_name.indexOf(name) != -1){
                            arr.push(data[i])
                        }
                    }
                    this.dataInfo = arr;
                },
                //-------------------------

                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });
            vm.$watch("data.xsxjh",function () {
                vm.refresh_table()
            });
            vm.$watch("data.xsxm",function () {
                vm.refresh_table()
            });

            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
