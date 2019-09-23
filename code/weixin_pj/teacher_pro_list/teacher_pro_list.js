define(["jquery",C.CLF('avalon.js'),"layer",
        C.Co("weixin_pj","teacher_pro_list/teacher_pro_list","css!"),
        C.Co("weixin_pj","teacher_pro_list/teacher_pro_list","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),"jquery-weui"
    ],
    function($,avalon, layer,css, html, x, data_center,weui) {
        //获取学生
        // var api_get_student=api.api+"base/baseUser/studentlist.action";
        var api_get_student=api.api+"base/student/class_used_stu";
        //获取已评学生
        var api_get_complete_student=api.api+"Indexmaintain/indexmaintain_findbyevaluaterecord";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "teacher_pro_list",
                student_arr:[],
                class_is_show:false,
                table_show:false,
                color_green:{color: 'green'},
                color_red:{color: 'red'},
                grade_list:[],
                class_list:[],
                get_grade_id:"",
                get_class_id:"",
                school_id:"",
                type:"",
                teacher_guid:"",
                pj_proid:"",
                pro_plan_id:"",
                semester_id:"",
                plan_level:"",
                get_info:function () {
                    this.pj_proid=Number(pmx.id);
                    this.teacher_guid=Number(pmx.guid);
                    this.get_grade_id=Number(pmx.grade_id);
                    this.get_class_id=Number(pmx.class_id);
                    this.school_id=pmx.school_id;
                    this.pro_plan_id=Number(pmx.pro_plan_id);
                    this.semester_id = pmx.semester_id;
                    this.plan_level = pmx.plan_level;
                    ajax_post(api_get_student,{fk_class_id:this.get_class_id},this)
                },
                evaluate_click:function (el) {
                    // console.log(el);
                    var name=el.name;
                    var code=el.code;
                    var guid=el.guid;
                    var grade_id=el.fk_grade_id;
                    var class_id=el.fk_class_id;
                    // var grade_name=el.grade_name;
                    // var class_name=el.class_name;
                    data_center.set_key("get_name",name);
                    data_center.set_key("get_code",code);
                    data_center.set_key("get_guid",guid);
                    data_center.set_key("get_grade_id",grade_id);
                    data_center.set_key("get_class_id",class_id);
                    // data_center.set_key("get_class_name",class_name);
                    // data_center.set_key("get_grade_name",grade_name);
                    data_center.set_key("project_id",this.pj_proid);
                    data_center.set_key("teacher_guid",this.teacher_guid);
                    data_center.set_key("pro_plan_id",this.pro_plan_id);
                    window.location="#teacher_fill_list_wx?guid=" + el.guid +'&id='+pmx.id+
                        '&project_id=' + pmx.pro_plan_id+'&pro_end_time='+pmx.pro_end_time+
                        '&pro_start_time='+pmx.pro_start_time+
                        '&code='+el.code+'&name='+el.name+'&sex='+el.sex+"&class_id=" + pmx.class_id+"&semester_id="+this.semester_id+"&plan_level="+this.plan_level;
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取学生
                            case api_get_student:
                                this.complete_get_student(data);
                                break;
                            //获取已评学生
                            case api_get_complete_student:
                                this.complete_get_complete_student(data);
                                break;
                        }
                    } else {
                        $.alert(msg)
                    }
                },
                complete_get_student:function (data) {
                    if(data.data.list.length>0){
                        // this.table_show=true;
                        this.student_arr = data.data.list;
                        ajax_post(api_get_complete_student,{pj_name_guid:this.teacher_guid,pj_proid:this.pj_proid},this);
                    }else{
                        $.alert("暂无该班级学生数据");
                        // this.table_show=false;
                    }
                },
                student_arr_a:[],
                complete_get_complete_student:function (data) {
                    var complete_student=data.data;
                    var index_ = {}
                    for(var i = 0; i < complete_student.length; i ++){
                        index_[complete_student[i].pj_cover_name_guid ]= 1
                    }
                    var list = this.student_arr;
                    for(var i = 0; i < list.length; i++ ){
                        if( index_.hasOwnProperty(list[i].guid) ){
                            list[i].status = "已评价";//已评价
                        }else{
                            list[i].status = "未评价";//未评价
                        }
                    }
                    this.student_arr_a = sort_by(list,['-status']);
                    this.table_show=true;
                }
            });
            vm.$watch('onReady', function() {
                this.get_info();

            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });