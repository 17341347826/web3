/**
 * Created by Administrator on 2018/6/7.
 */

define(["jquery",C.CLF('avalon.js'),"layer",
        C.Co("evaluate_students","peer_review/student_fill_in_mutual_list/student_fill_in_mutual_list","css!"),
        C.Co("evaluate_students","peer_review/student_fill_in_mutual_list/student_fill_in_mutual_list","html!"),
        C.CMF("router.js"),C.CMF("data_center.js")],
    function($,avalon,layer,css, html, x, data_center) {
        //查询随机分组
        var api_get_guid=api.api+"Indexmaintain/indexmaintain_findevaluateoption";
        //学生列表
        var api_get_student_list = api.api + "base/student/class_stus.action";
        //查询已评学生
        var api_get_student_complete=api.api+"Indexmaintain/indexmaintain_findbyevaluaterecord";
        //查询手动分组：现在统一这个接口调用分组信息
        var api_get_stu = api.api+"Indexmaintain/indexmaintain_findstudentgroupid";

        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "student_fill_in_mutual_list",
                pro_group_type:"",//1随机 2手动分组
                stu_group_guid:"",
                all_student:"",
                guid_arr:"",
                student_arr:[
                    // {id:1,code:'12',name:'sjdj',status:'已评价'},
                    // {id:2,code:'12',name:'sjdj',status:'已评价'},
                ],
                status:"",
                type:"",
                op_guid:"",
                pj_proid:"",
                data:{
                    fk_school_id:"",
                    fk_grade_id:"",
                    fk_class_id:""
                },
                pj_name_guid:"",
                pro_plan_id:"",
                pro_name:"",
                semester_id:"",
                stu_num:"",
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var data = JSON.parse(data.data['user']);
                        self.stu_group_guid = data.guid;
                        self.stu_num = data.code;
                        self.get_info();
                    });
                },
                get_info:function () {
                    this.semester_id = Number(pmx.semester_id);
                    this.pj_name_guid=Number(pmx.guid);
                    this.op_guid=pmx.guid;
                    this.pj_proid=Number(pmx.id);
                    this.data.fk_class_id=pmx.class_id;
                    this.data.fk_grade_id=pmx.grade_id;
                    this.data.fk_school_id=pmx.school_id;
                    this.pro_plan_id=Number(pmx.pro_plan_id);
                    this.pro_name=pmx.pro_name;
                    this.pro_group_type = pmx.pro_group_type;
                    ajax_post(api_get_student_list,{student_num:this.stu_num},this);
                },
                evaluate_click:function (el) {
                    console.log(el);
                    var name=el.name;
                    var code=el.code;
                    var guid=el.guid;
                    var grade=el.grade_name;
                    var class_name=el.class_name;
                    data_center.set_key("get_name",name);
                    data_center.set_key("get_code",code);
                    data_center.set_key("get_guid",guid);
                    data_center.set_key("get_grade",grade);
                    data_center.set_key("get_class_name",class_name);
                    data_center.set_key("pj_proid",this.pj_proid);
                    data_center.set_key("pro_plan_id",this.pro_plan_id);
                    data_center.set_key("pro_name",this.pro_name);
                    data_center.set_key("plan_level",pmx.plan_level);
                    data_center.set_key("semester_id",this.semester_id);
                    data_center.set_key('tx_info',JSON.stringify(el));
                    window.location="#student_fill_in_mutual";
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取学生
                            case api_get_student_list:
                                this.complete_get_student_list(data);
                                break;
                            // //获取guid
                            // case api_get_guid:
                            //     this.complete_get_guid(data);
                            //     break;
                            //获取手动分组
                            case api_get_stu:
                                this.complete_get_stu(data);
                                break;
                            //查询已评
                            case api_get_student_complete:
                                this.complete_get_student_complete(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_student_list:function (data) {
                    this.all_student=data.data.list;
                    // if(this.pro_group_type == 1){
                    //     ajax_post(api_get_guid,{op_guid:Number(this.op_guid),op_proid:this.pj_proid},this);
                    // }else{
                    //     ajax_post(api_get_stu,{pj_proid:this.pj_proid},this);
                    // }
                    ajax_post(api_get_stu,{
                        pj_proid:this.pj_proid,
                        classid:this.data.fk_class_id,
                    },this);
                },

                complete_get_stu:function (data) {
                    if(data.data == null || data.data == []) return;
                    var stu_group_guid = JSON.parse(data.data.stu_group_guid);
                    var arr = [];
                    // for(var i=0;i<stu_group_guid.length;i++){
                    //     if(this.stu_group_guid != stu_group_guid[i]){
                    //         arr.push(stu_group_guid[i])
                    //     }
                    //
                    // }
                    arr = stu_group_guid;
                    var stu = this.all_student;
                    for (var i = 0; i < arr.length; i++) {
                        for (var j = 0; j < stu.length; j++) {
                            if (arr[i] == stu[j].guid) {
                                this.student_arr.push(stu[j]);
                            }
                        }
                    }
                    ajax_post(api_get_student_complete,{pj_name_guid:this.pj_name_guid,pj_proid:this.pj_proid},this)

                },
                complete_get_guid:function (data) {
                    var data=JSON.parse(data.data.op_option);
                    var stu = this.all_student;
                    for (var i = 0; i < data.length; i++) {
                        for (var j = 0; j < stu.length; j++) {
                            if (data[i] == stu[j].guid) {
                                this.student_arr.push(stu[j]);
                            }
                        }
                    }
                    ajax_post(api_get_student_complete,{pj_name_guid:this.pj_name_guid,pj_proid:this.pj_proid},this)
                },
                student_arr_x:[],
                complete_get_student_complete:function (data) {
                    var complete_student=data.data;
                    var stu = this.student_arr.$model;
                    var stu_length = stu.length;
                    var index_ = {}
                    for(var i = 0; i < complete_student.length; i ++){
                        index_[complete_student[i].pj_cover_name_guid ]= 1
                    }
                    for(var i = 0; i < stu_length; i++ ){
                        if( index_.hasOwnProperty(stu[i].guid) ){
                            stu[i].status = "已评价"
                        }else{
                            stu[i].status = "未评价"
                        }
                    }
                    this.student_arr_x = stu;
                },

                sort_table_by_status: false,
                sort_table: function () {
                    let ing_arr = [];
                    let end_arr = [];
                    for (let i = 0 ;i < this.student_arr_x.length; i++) {
                        if (this.student_arr_x[i].status === '未评价') ing_arr.push(this.student_arr_x[i]);
                        if (this.student_arr_x[i].status === '已评价') end_arr.push(this.student_arr_x[i]);
                    }
                    if (this.sort_table_by_status === false) {
                        this.student_arr_x = ing_arr.concat(end_arr);
                        this.sort_table_by_status = true;
                    } else {
                        this.student_arr_x = end_arr.concat(ing_arr);
                        this.sort_table_by_status = false;
                    }
                },
            });
            vm.$watch('onReady', function() {
                this.cb();

            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });