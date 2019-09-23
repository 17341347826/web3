define(["jquery",C.CLF('avalon.js'),"layer",
        C.Co("weixin_pj","project_wx_radio/project_wx_radio","css!"),
        C.Co("weixin_pj","project_wx_radio/project_wx_radio","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "jquery-weui"
    ],
    function($,avalon, layer,css, html, x, data_center,weui) {
        //获取项目内容
        // var api_get_content_list = api.api+"Indexmaintain/indexmaintain_findByPlanSubject";
        //获取学生
        var api_get_student=api.api+"base/baseUser/studentlist.action";
        //查询
        var api_get_find_answer = api.api+"Indexmaintain/indexmaintain_list_record";
        //添加
        var api_add_answer = api.api +"Indexmaintain/indexmaintain_batch_addevaluaterecordtea";
        //获取学年学期
        var api_get_semester= api.api+"base/semester/appoint_date_part";
        //查询数据
        var api_get_info = api.api+"Indexmaintain/indexmaintain_reference";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "project_wx_radio",
                student_arr:[],
                school_id:"",
                type:"",
                teacher_guid:"",
                every_value:"",
                value_table:false,
                pro_end_time:"",
                pro_start_time:"",
                pro_plan_id:"",
                item_id:"",
                add_data:{
                    //班级id	number	当guid为空时必传
                    class_id: '',
                    //	学籍号	string	当guid不为空时（必传）
                    code: '',
                    //	学期结束时间	string	yyyy-MM-dd（必传）
                    end_date: '',
                    //学生guid	number	当对单个学生评价时必传（对多学生评价可不用传）
                    guid: '',
                    //考查项id	number	当guid为空时（必传）
                    item_id: '',
                    //学生姓名	string	当guid不为空时（必传）
                    name: '',
                    //评价项目id	number	（必传）
                    fk_plan_id: '',
                    //学期开始时间	string	yyyy-MM-dd（必传）
                    start_date: '',
                    //学生性别	number	当guid不为空时（必传）
                    sex: '',
                    plan_level:""//方案级别（1:上级 2:校级） number
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userData = JSON.parse(data.data['user']);
                        self.add_answer.school_id =userData.fk_school_id;
                        self.get_info();
                    });
                },
                sub_info:[],
                get_info:function () {
                    this.sub_info = JSON.parse(pmx.value_list);
                    this.add_answer.pj_gradeid=Number(pmx.grade_id);
                    this.add_answer.pj_classid=Number(pmx.class_id);
                    this.add_answer.pj_proid=Number(pmx.pj_proid);
                    this.add_answer.pj_subjectid.push(Number(pmx.sub_subjectid));
                    this.add_answer.pj_subject.push(pmx.sub_subject);
                    this.get_school_id = Number(pmx.school_id);
                    this.teacher_guid = pmx.teacher_guid;
                    this.every_value = pmx.every_value;
                    this.pro_start_time = pmx.pro_start_time;
                    this.pro_end_time = pmx.pro_end_time;
                    this.pro_plan_id = pmx.pro_plan_id;
                    this.item_id = pmx.id;
                    this.find_answer.class_id = Number(pmx.class_id);
                    this.find_answer.guid = '';
                    this.find_answer.pj_subjectid = Number(pmx.sub_subjectid);
                    this.find_answer.pj_type = 2;
                    this.find_answer.project_id = Number(pmx.pj_proid);

                    this.add_data.class_id = Number(pmx.class_id);
                    this.add_data.code = '';
                    this.add_data.end_date = pmx.pro_end_time;
                    this.add_data.guid = '';
                    this.add_data.item_id = pmx.id;
                    this.add_data.name = '';
                    this.add_data.fk_plan_id = pmx.pro_plan_id;
                    this.add_data.start_date = pmx.pro_start_time;
                    this.add_data.sex = '';
                    this.add_data.plan_level = pmx.plan_level;


                    ajax_post(api_get_semester,{start_date:this.pro_start_time,end_date:this.pro_end_time},this);
                },
                find_answer:{
                    class_id:"",
                    guid:"",
                    pj_subjectid:"",
                    pj_type:"",
                    project_id:""
                },
                add_answer:{
                    list:[],
                    pj_classid:"",
                    pj_gradeid:"",
                    pj_proid:"",//项目id
                    pj_subject:[],//考察项名称
                    pj_subjectid:[],//考察项id
                    school_id:""
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取学年学期
                            case api_get_semester:
                                this.complete_get_semester(data);
                                break;
                            //获取数据
                            case api_get_info:
                                this.complete_get_info(data);
                                break;
                            //获取学生
                            case api_get_student:
                                this.complete_get_student(data);
                                break;
                            //查询
                            case api_get_find_answer:
                                this.complete_get_find_answer(data);
                                break;
                            //添加
                            case api_add_answer:
                                this.complete_add_answer(data);
                                break;
                        }
                    } else {
                        $.alert(msg)
                    }
                },
                complete_get_semester:function(data) {
                    var start = data.data.start_date;
                    var end = data.data.end_date;
                    this.add_data.start_date = timeChuo(start);
                    this.add_data.end_date = timeChuo(end);
                    ajax_post(api_get_info,this.add_data,this);
                },
                referenceList:[],
                complete_get_info:function (data) {
                    this.referenceList = data.data;
                    ajax_post(api_get_find_answer,this.find_answer,this);
                },
                //查询考察项
                complete_get_content_list:function (data) {
                    this.content_x = data.data;
                    ajax_post(api_get_find_answer,this.find_answer,this);
                },
                //查询
                content_x:[],
                complete_get_find_answer:function (data) {
                    var dataL = data.data;
                    var dataL_length = data.data.length;
                    if(dataL_length>0){//有数据
                        for(var i=0;i<dataL_length;i++){
                            dataL[i]['value_list'] = this.sub_info;
                        }
                        ajax_post(api_get_student,{
                            fk_school_id:this.get_school_id,
                            grade_id:this.add_answer.pj_gradeid,
                            fk_class_id:this.add_answer.pj_classid
                        },this)
                    }else{//没数据
                        ajax_post(api_get_student,{
                            fk_school_id:this.get_school_id,
                            grade_id:this.add_answer.pj_gradeid,
                            fk_class_id:this.add_answer.pj_classid
                        },this)
                    }

                },
                complete_get_student:function (data) {
                    var dataList = data.data.list;
                    var dataListLength = dataList.length;
                    //参考
                    var r_list = this.referenceList.$model;
                    var r_length = r_list.length;
                    for(var i=0;i<dataListLength;i++){
                        dataList[i].pj_value = '';
                        dataList[i]['pj_cover_name'] = dataList[i]['name'];
                        dataList[i]['pj_cover_name_num'] = dataList[i]['account'];
                        dataList[i]['pj_cover_name_guid'] = dataList[i]['guid'];
                        dataList[i]['pj_answer'] = '';
                        dataList[i]['pj_answer_value'] = '';
                        dataList[i]['value_list'] = this.sub_info.value_list;
                        for(var j = 0; j < r_length; j++ ){
                            if(dataList[i].guid == r_list[j].guid){
                                dataList[i]['everyday_add'] = r_list[j]['everyday_add'];
                                dataList[i]['everyday_minus'] = r_list[j]['everyday_minus'];
                                dataList[i]['xs'] = r_list[j]['xs'];
                            }
                        }
                    }
                    this.student_arr = dataList;
                    console.log(this.student_arr)
                    this.value_table = true;
                },
                value_click:function () {//pj_value
                    var self=this;
                    var name_arr = [];
                    var get_data = [];
                    var dataList_x = this.student_arr.$model;
                    var dataListLength_x = dataList_x.length;
                    for(var i=0;i<dataListLength_x;i++){
                        console.log(dataList_x[i])
                        var get_every_value = dataList_x[i].pj_answer;
                        if(get_every_value == ''){
                            name_arr.push(dataList_x[i].name)
                        }
                    }
                    var name_arr_length = name_arr.length;
                    var name_str = '';
                    if(name_arr_length>0){
                        for(var i=0;i<name_arr_length;i++){
                            name_str += name_arr[i]+","
                        }
                        $.alert(name_str+'这'+'【'+name_arr_length+'】'+'位同学还没进行选项打分,请检查并更正');
                        return;
                    }else{
                        for(var i=0;i<dataListLength_x;i++){
                            var obj = {};
                            obj['pj_answer_value'] = '';
                            obj['pj_cover_name'] = dataList_x[i].pj_cover_name;
                            obj['pj_cover_name_guid'] = dataList_x[i].pj_cover_name_guid;
                            obj['pj_cover_name_num'] = dataList_x[i].pj_cover_name_num;
                            var every_v = dataList_x[i].pj_answer;
                            obj['pj_answer'] = every_v;
                            get_data.push(obj)
                        }
                        this.add_answer.list = get_data;
                        ajax_post(api_add_answer,this.add_answer,this);
                    }
                },
                layer_index:'',
                complete_add_answer:function (data) {
                    layer.closeAll();
                    window.history.back()
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