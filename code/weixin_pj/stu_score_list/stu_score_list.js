/**
 * Created by Administrator on 2018/6/7.
 */

define(["jquery",
        C.CLF('avalon.js'),
        C.Co("weixin_pj","stu_score_list/stu_score_list","css!"),
        C.Co("weixin_pj","stu_score_list/stu_score_list","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "jquery-weui",
        C.CMF("formatUtil.js"),
    ],
    function($,avalon,css, html, x, data_center,weui,formatUtil) {
        //查询guid
        var api_get_guid=api.api+"Indexmaintain/indexmaintain_findevaluateoption";
        //学生列表
        // var api_get_student_list = api.api + "base/baseUser/studentlist.action";
        //学生列表
        var api_get_student_list = api.api + "base/student/class_stus.action";
        //查询已评学生
        var api_get_student_complete=api.api+"Indexmaintain/indexmaintain_findbyevaluaterecord";
        // 查询手动分组：现在统一这个接口调用分组信息
        var api_get_stu = api.api+"Indexmaintain/indexmaintain_findstudentgroupid";
        var pmx;
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "stu_score_list",
                pro_group_type:"",//1随机 2手动分组
                stu_group_guid:"",
                //学生学籍号
                stu_code:'',
                all_student:"",
                guid_arr:"",
                student_arr:[],
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
                cb: function() {
                    var self = this;
                    var pmx_str = data_center.get_key('to_stu_score_list');
                    pmx = JSON.parse(pmx_str);
                    data_center.uin(function(data) {
                        var data = JSON.parse(data.data['user']);
                        self.stu_group_guid = data.guid;
                        self.stu_code = data.code;
                        self.get_info();
                    });
                },
                get_info:function () {
                    this.pj_name_guid=Number(pmx.guid);
                    this.op_guid=pmx.guid;
                    this.pj_proid=Number(pmx.id);
                    this.data.fk_class_id=pmx.class_id;
                    this.data.fk_grade_id=pmx.grade_id;
                    this.data.fk_school_id=pmx.school_id;
                    this.pro_plan_id=Number(pmx.pro_plan_id);
                    this.pro_name=pmx.pro_name;
                    this.pro_group_type = pmx.pro_group_type;
                    // ajax_post(api_get_student_list,this.data,this);
                    ajax_post(api_get_student_list,{student_num:this.stu_code},this);
                },
                evaluate_click:function (el) {
                    var name=el.name;
                    var code=el.code;
                    var guid=el.guid;
                    var grade=el.grade_name;
                    var class_name=el.class_name;
                    var obj = {
                        "get_name":name,
                        "get_code":code,
                        "get_guid":guid,
                        "get_grade":grade,
                        "get_class_name":class_name,
                        "pj_proid":this.pj_proid,
                        "pro_plan_id":this.pro_plan_id,
                        "pro_name":this.pro_name,
                        "plan_level":pmx.plan_level,
                        "fk_school_id":el.fk_school_id,
                        "fk_class_id":el.fk_class_id,
                        "fk_semester_id":pmx.fk_semester_id
                    }
                    data_center.set_key('to_stu_score_edit',JSON.stringify(obj));
                    window.location="#stu_score_edit";
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
                        $.alert(msg);
                    }
                },
                complete_get_student_list:function (data) {
                    this.all_student=data.data.list;
                    // if(this.pro_group_type == 1){
                    //     ajax_post(api_get_guid,{op_guid:this.op_guid,op_proid:this.pj_proid},this);
                    // }else{
                    //     ajax_post(api_get_stu,{
                    //         pj_proid:this.pj_proid,
                    //         classid:this.data.fk_class_id
                    //     },this);
                    // }
                    ajax_post(api_get_stu,{
                        pj_proid:this.pj_proid,
                        classid:this.data.fk_class_id
                    },this);
                },
                complete_get_stu:function (data) {
                    var stu_group_guid = JSON.parse(data.data.stu_group_guid);
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
                complete_get_student_complete:function (data) {
                    var complete_student=data.data;
                    var index_ = {}
                    for(var i = 0; i < complete_student.length; i ++){
                        index_[complete_student[i].pj_cover_name_guid ]= 1
                    }
                    for(var i = 0; i < this.student_arr.length; i++ ){
                        if( index_.hasOwnProperty(this.student_arr[i].guid) ){
                            this.student_arr[i].status = "已评价"
                        }else{
                            this.student_arr[i].status = "未评价"
                        }
                    }
                }
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