define(["jquery",C.CLF('avalon.js'),"layer",
        C.Co("evaluation_material/stu_evaluation","evaluation","css!"),
        C.Co("evaluation_material/stu_evaluation","project_content_fill_radio/project_content_fill_radio","css!"),
        C.Co("evaluation_material/stu_evaluation","project_content_fill_radio/project_content_fill_radio","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function($,avalon, layer,css1,css2, html, x, data_center,three_menu_module) {
        //获取项目内容
        var api_get_content_list = api.api+"Indexmaintain/indexmaintain_findByPlanSubject";
        //获取学生
        var api_get_student=api.api+"base/baseUser/studentlist.action";
        //查询
        var api_get_find_answer = api.api+"Indexmaintain/indexmaintain_list_record";
        //添加
        var api_add_answer = api.api +"Indexmaintain/indexmaintain_batch_addevaluaterecordtea";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "project_content_fill_radio",
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
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userData = JSON.parse(data.data['user']);
                        self.add_answer.school_id =userData.fk_school_id;
                        self.get_info();
                    });
                },
                get_info:function () {
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
                    ajax_post(api_get_content_list,{id:this.pro_plan_id,index_id:this.item_id},this);
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
                            //获取当前评价内容
                            case api_get_content_list:
                                this.complete_get_content_list(data);
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
                        toastr.error(msg)
                    }
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
                            dataL[i]['value_list'] = this.content_x[0].value_list;
                        }
                        this.student_arr = dataL;
                        this.value_table = true;
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
                    for(var i=0;i<dataListLength;i++){
                        dataList[i].pj_value = '';
                        dataList[i]['pj_cover_name'] = dataList[i]['name'];
                        dataList[i]['pj_cover_name_num'] = dataList[i]['account'];
                        dataList[i]['pj_cover_name_guid'] = dataList[i]['guid'];
                        dataList[i]['pj_answer'] = '';
                        dataList[i]['pj_answer_value'] = '';
                        dataList[i]['value_list'] = this.content_x[0].value_list;
                    }
                    this.student_arr = dataList;
                    this.value_table = true;
                },
                //直接打分保存
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
                        layer.confirm(name_str+'这'+'【'+name_arr_length+'】'+'位同学还没进行选项打分,请检查并更正', {
                            btn: ['知道了'] //按钮
                        }, function(){
                            layer.closeAll();
                        });
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
                        layer.open({
                            title: "温馨提示",
                            closeBtn:0,
                            content: '<div><p>正保存数据,请稍后</p></div>',
                            yes: function (index, layero) {
                                self.layer_index=index;
                            }
                        });
                    }
                },
                layer_index:'',
                complete_add_answer:function (data) {
                    layer.closeAll();
                    window.history.back()
                },
                //对多个学生打分的考察
                resources_click:function () {
                    window.location = '#project_reference?&item_id='+this.add_answer.pj_subjectid+
                        "&project_id="+this.pro_plan_id+
                        "&item_id="+this.item_id+
                        "&class_id="+this.add_answer.pj_classid+
                        "&pro_end_time="+this.pro_end_time+
                        "&pro_start_time="+this.pro_start_time+
                        "&plan_level=" + pmx.plan_level;
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