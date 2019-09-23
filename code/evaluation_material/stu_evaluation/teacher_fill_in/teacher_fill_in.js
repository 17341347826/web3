/**
 * Created by Administrator on 2017/7/18.
 */
define(["jquery",
        C.CLF('avalon.js'),
        "layer",
        C.Co("evaluation_material/stu_evaluation", "evaluation", "css!"),
        C.Co("evaluation_material/stu_evaluation", "teacher_fill_in/teacher_fill_in", "css!"),
        C.Co("evaluation_material/stu_evaluation", "teacher_fill_in/teacher_fill_in", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function ($, avalon, layer, css1, css2, html, x, data_center,three_menu_module) {
        //查询方案内容
        var api_get_content = api.api + "Indexmaintain/indexmaintain_findByPlanSubject";
        //查询分值的最大值
        var api_index_max = api.api + "Indexmaintain/get_idex_stu_hd_num";
        //保存分值
        var api_save_score = api.api + "Indexmaintain/indexmaintain_addevaluaterecordtea";
        //根据项目我评价人和评价类型查询出我已评的数据
        var api_list_record = api.api + 'Indexmaintain/indexmaintain_list_record';

        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "teacher_fill_in",
                get_title: "",
                stu_grade: "",
                stu_class: "",
                type: "",
                num: "",
                name: "",
                code: "",
                table_list: [],
                second_table_list: [],
                choice_arr: "",
                //查询已评数据
                data_record: [],
                response_data: {
                    pro_gradeid: "",
                    //1:学生自评2:学生互评3:教师评价4:家长评价
                    pro_type: 3,
                    pro_workid: ""
                },
                //已评数据
                list_record: {
                    //班级id	number	（必传）
                    class_id: '',
                    //评价人guid	number	（选传）
                    guid: '',
                    //被评价人guid	number	当对单个人进行评价的时候传
                    pj_cover_name_guid: '',
                    //这传的是三级指标id	number	（当guid为空时必传）
                    pj_subjectid: '',
                    //1:学生自评2:学生互评3:教师评价4:家长评价
                    pj_type: 2,
                    //项目id	number	（必传）
                    project_id: '',
                },
                //选项打分
                request_select_data: {
                    //班级id number
                    pj_classid: "",
                    //年级id number
                    pj_gradeid: "",
                    //选项
                    pj_answer: [],
                    //选项分值
                    pj_answer_value: [],
                    //被评价人
                    pj_cover_name: "",
                    //被评价人id number
                    pj_cover_name_guid: "",
                    //项目id
                    pj_proid: "",
                    //考察项名称数组
                    pj_subject: [],
                    //考察项id数组
                    pj_subjectid: [],
                    //直接打分分值
                    pj_value: [],
                    // pj_cover_name_num:"",
                    //被评价人的学校id	number
                    school_id: '',
                },
                //直接打分
                request_direct_data: {
                    //选项
                    pj_answer: [],
                    //选项分值
                    pj_answer_value: [],
                    //班级id number
                    pj_classid: "",
                    //被评价人
                    pj_cover_name: "",
                    //被评价人id number
                    pj_cover_name_guid: "",
                    //年级id number
                    pj_gradeid: "",
                    //项目id
                    pj_proid: "",
                    //考察项名称数组
                    pj_subject: [],
                    //考察项id数组
                    pj_subjectid: [],
                    //直接打分分值
                    pj_value: [],
                    // pj_cover_name_num:"",
                    //被评价人的学校id	number
                    school_id: '',
                },
                index_max: {
                    fk_class_id: "",
                    fk_school_id: "",
                    fk_semester_id: "",
                    owner: ''
                },
                project_id: "",
                teacher_guid: "",
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        var dataList = JSON.parse(data.data["user"]);
                        var lend = dataList.lead_class_list;
                        self.response_data.pro_gradeid = lend[0].grade_id;
                        self.response_data.pro_workid = lend[0].school_id;
                        self.list_record.class_id = lend[0].class_list[0].class_id;
                        self.list_record.guid = dataList.guid;
                        self.list_record.project_id = Number(pmx.id);
                        self.list_record.pj_cover_name_guid = Number(pmx.guid);
                        self.request_select_data.school_id = dataList.fk_school_id;
                        self.request_direct_data.school_id = dataList.fk_school_id;
                        self.index_max.fk_school_id = dataList.fk_school_id;
                        // ajax_post(api_get_plan_id,self.response_data,self);
                        ajax_post(api_list_record, self.list_record.$model, self);
                    });
                    self.is_init = true;
                },
                //学生表现参考
                index_turn: function () {
                    window.location = "#teacher_index_count?guid=" + pmx.guid +
                        '&project_id=' + pmx.project_id +
                        '&pro_end_time=' + pmx.pro_end_time +
                        '&pro_start_time=' + pmx.pro_start_time +
                        '&code=' + pmx.code + '&name=' + pmx.name +
                        '&sex=' + pmx.sex +
                        "&class_id=" + pmx.class_id+
                        '&plan_level='+pmx.plan_level;
                },
                get_info: function () {
                    var plan_level = Number(pmx.plan_level);
                    this.index_max.fk_semester_id = Number(pmx.semester_id);
                    this.name = data_center.get_key("get_name");
                    this.code = data_center.get_key("get_code");
                    var guid = data_center.get_key("get_guid");
                    var grade_id = data_center.get_key("get_grade_id");
                    var class_id = data_center.get_key("get_class_id");
                    this.index_max.fk_class_id = class_id;
                    this.index_max.owner = guid;
                    // this.stu_grade = data_center.get_key("get_grade_name");
                    // this.stu_class = data_center.get_key("get_class_name") + "班";
                    this.project_id = data_center.get_key("project_id");
                    this.teacher_guid = data_center.get_key("teacher_guid");
                    this.request_direct_data.pj_cover_name = this.name;
                    this.request_direct_data.pj_cover_name_guid = guid;
                    this.request_direct_data.pj_gradeid = grade_id;
                    this.request_direct_data.pj_classid = class_id;
                    // this.request_direct_data.pj_cover_name_num=this.code;
                    this.request_select_data.pj_cover_name = this.name;
                    this.request_select_data.pj_cover_name_guid = guid;
                    this.request_select_data.pj_gradeid = grade_id;
                    this.request_select_data.pj_classid = class_id;
                    // this.request_select_data.pj_cover_name_num=this.code;
                    var pro_plan_id = data_center.get_key("pro_plan_id");
                    this.request_select_data.pj_proid = Number(this.project_id);
                    this.request_direct_data.pj_proid = Number(this.project_id);
                    ajax_post(api_get_content, {id: pro_plan_id,plan_level:plan_level}, this);
                },
                //选项打分
                select_save_click: function () {
                    var self = this;
                    var ary_option = [], ary_score = [];
                    for (var i = 0; i < this.second_table_list.length; i++) {
                        var value_list = this.second_table_list[i].value_list;
                        var data_id = this.second_table_list[i].sub_subjectid;
                        var data_name = this.second_table_list[i].sub_subject;
                        if (!this.second_table_list[i].hasOwnProperty('index_option_content')) {
                            toastr.warning('有空白项没选择');
                            return;
                        } else {
                            var select_no = Number(this.second_table_list[i].index_option_content);
                            self.request_select_data.pj_answer.push(value_list[select_no].index_option);//A
                            self.request_select_data.pj_answer_value.push(value_list[select_no].item_values.toString());//5
                            self.request_select_data.pj_subjectid.push(data_id);
                            self.request_select_data.pj_subject.push(data_name);
                        }
                    }
                    ajax_post(api_save_score, this.request_select_data, this);
                },
                blur_input: function (el,idx) {

                    if($.trim(el.value_list)==''){
                        this.table_list[idx].value_list = '';
                        toastr.warning('分值不能为空');
                        return;
                    }
                    var reg=/^\d+(\.\d{1})?$/;
                    if(reg.test(el.value_list)){

                    }else{
                        this.table_list[idx].value_list = '';
                        toastr.warning('分值输入不正确');
                        return;
                    }
                    if(parseFloat(el.value_list)<0){
                        this.table_list[idx].value_list = 0;
                        return;
                    }
                    if(parseFloat(el.value_list)>parseFloat(el.index_value)){
                        this.table_list[idx].value_list = el.index_value;
                        return;
                    }

                },
                //直接打分
                only_save_click: function () {
                    var self = this;
                    self.request_direct_data.pj_value = [];
                    self.request_direct_data.pj_subject = [];
                    self.request_direct_data.pj_subjectid = [];
                    for (var i = 0; i < self.table_list.length; i++) {
                        var value_list = self.table_list[i].value_list;
                        var data_id = self.table_list[i].sub_subjectid;
                        var data_name = self.table_list[i].sub_subject;
                        self.request_direct_data.pj_value.push(value_list);
                        self.request_direct_data.pj_subject.push(data_name);
                        self.request_direct_data.pj_subjectid.push(data_id);
                    }
                    var ary_score = self.request_direct_data.pj_value;
                    var a = 0;
                    for (var k = 0; k < ary_score.length; k++) {
                        var index_value = Number(self.table_list[k].index_value);
                        if (Number(ary_score[k]) > index_value || Number(ary_score[k]) < 0) {
                            a++;
                            toastr.warning("第" + (k + 1) + "项所填分值不能大于该项目最大分值并且不能小于0分");
                        }
                    }
                    if (a == 0) {
                        var b = 0;
                        for (var i = 0; i < self.table_list.length; i++) {
                            if (self.table_list[i].value_list == "") {
                                b++;
                            }
                        }
                        if (b == 0) {
                            ajax_post(api_save_score, self.request_direct_data.$model, self);
                        } else {
                            toastr.warning("存在空白分值")
                        }
                    }
                },
                //取消
                back:function(){
                    history.go(-1);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取方案内容
                            case api_get_content:
                                this.complete_get_content(data);
                                break;
                            //    查询已评数据
                            case api_list_record:
                                this.complete_list_record(data);
                                break;
                            //保存
                            case api_save_score:
                                this.complete_save_score(data);
                                break;
                            //查询最大分值
                            case api_index_max:
                                this.complete_index_max(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                copy_data: [],
                complete_get_content: function (data) {
                    var self = this;
                    if (data.data.length == 0) {
                        self.num = 3;
                    } else {
                        // ajax_post(api_list_record,this.list_record.$model,this);
                        if (data.data[0].value_list.length != 0) {//选项打分
                            self.num = 2;
                            self.second_table_list = data.data;
                        } else {//直接打分
                            this.copy_data = data.data;
                            ajax_post(api_index_max, this.index_max.$model, this);
                            // console.log( self.table_list);
                        }
                    }
                },
                complete_index_max: function (data) {
                    var guid = this.index_max.owner;
                    var table = [];
                    var list = this.copy_data;
                    // self.table_list=data.data;
                    if (list.data_record != []) {
                        for (var i = 0; i < list.length; i++) {
                            for (var j = 0; j < this.data_record.length; j++) {
                                if (list[i].sub_subjectid == this.data_record[j].pj_subjectid) {
                                    list[i].value_list = this.data_record[j].pj_value;
                                }
                            }
                        }
                    }
                    table = list;
                    var data = data.data;
                    for (var i = 0; i < table.length; i++) {
                        if(table[i].index_secondaryid == 933 || table[i].index_secondaryid == 939 || table[i].index_secondaryid == 940 || table[i].index_secondaryid == 941 ||table[i].index_secondaryid == 942){
                            table[i].index_value = 5
                        }else if (data.hasOwnProperty(table[i].index_secondaryid)) {//设置
                            if (!data[table[i].index_secondaryid][guid]) {
                                table[i].index_value = 3
                            }
                        }else{
                            table[i].index_value = 3
                        }
                    }
                    this.table_list = table;
                    this.num = 1;
                },
                //显示已评数据
                complete_list_record: function (data) {
                    this.data_record = data.data;
                    this.get_info();
                },
                complete_save_score: function () {
                    toastr.success("保存成功");
                    ajax_post(api_list_record, this.list_record.$model, this);
                    window.history.go(-1);
                    // window.location="#teacher_fill_list?id="+this.project_id+"&guid="+this.teacher_guid+"&grade_id="+this.request_select_data.pj_gradeid+"&class_id="+ this.request_direct_data.pj_classid+"&school_id="+this.response_data.pro_workid;
                },
                cancel:function () {
                    window.history.go(-1);
                }
            });
            vm.$watch('onReady', function () {
                this.cb();
                // this.get_info();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });