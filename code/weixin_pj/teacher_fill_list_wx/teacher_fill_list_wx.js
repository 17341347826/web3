/**
 * Created by Administrator on 2017/7/18.
 */
define(["jquery",
        C.CLF('avalon.js'),
        "layer",
        C.Co("weixin_pj", "teacher_fill_list_wx/teacher_fill_list_wx", "css!"),
        C.Co("weixin_pj", "teacher_fill_list_wx/teacher_fill_list_wx", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"), "jquery-weui"
    ],
    function ($, avalon, layer, css, html, x, data_center,weui) {
        //查询方案内容
        var api_get_content = api.api + "Indexmaintain/indexmaintain_findByPlanSubject";
        //查询分值的最大值
        var api_index_max = api.api + "Indexmaintain/get_idex_stu_hd_num";
        //保存分值
        var api_save_score = api.api + "Indexmaintain/indexmaintain_addevaluaterecordtea";
        //根据项目我评价人和评价类型查询出我已评的数据
        var api_list_record = api.api + 'Indexmaintain/indexmaintain_list_record';
        //查询教师参考接口
        var api_index_count = api.api + "Indexmaintain/indexmaintain_reference";
        //获取指定日期段所属学年学期
        // var api_date_part = api.user + 'semester/appoint_date_part';
        var api_date_part = api.api+"base/semester/current_semester.action";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "teacher_fill_list_wx",
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
                //请求参数(参考)
                req: {
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
                //是否可以点击（防止重复提交）：true-可以，false-不可以
                btn_has:true,
                json:function (x) {
                    return JSON.parse(x);
                },
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


                        self.req.class_id = Number(pmx.class_id);
                        self.req.code = pmx.code;
                        self.req.end_date = '';
                        self.req.guid = Number(pmx.guid);
                        self.req.item_id = '';
                        self.req.name = pmx.name;
                        self.req.fk_plan_id = Number(pmx.project_id);
                        self.req.start_date = '';
                        self.req.sex = Number(pmx.sex);
                        self.req.plan_level = pmx.plan_level;



                        // ajax_post(api_get_plan_id,self.response_data,self);
                        ajax_post(api_list_record, self.list_record.$model, self);
                    });
                    self.is_init = true;
                },
                inputBlur:function (el,idx) {
                    if($.trim(el.value_list)==''){
                        this.table_list_x[idx].value_list = '';
                        $.alert('分值不能为空');
                        return;
                    }
                    var reg=/^\d+(\.\d{1})?$/;
                    if(reg.test(el.value_list)){

                    }else{
                        this.table_list_x[idx].value_list = '';
                        $.alert('分值输入不正确');
                        return;
                    }
                    if(parseFloat(el.value_list)<0){
                        this.table_list_x[idx].value_list = 0;
                        return;
                    }
                    if(parseFloat(el.value_list)>parseFloat(el.index_value)){
                        this.table_list_x[idx].pj_value = el.index_value;
                        return;
                    }
                },
                //学生表现参考
                index_turn: function () {
                    window.location = "#teacher_index_count?guid=" + pmx.guid +
                        '&project_id=' + pmx.project_id + '&pro_end_time=' + pmx.pro_end_time +
                        '&pro_start_time=' + pmx.pro_start_time +
                        '&code=' + pmx.code + '&name=' + pmx.name + '&sex=' + pmx.sex + "&class_id=" + pmx.class_id;
                },
                get_info: function () {
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
                    ajax_post(api_get_content, {id: pro_plan_id,plan_level:Number(this.req.plan_level)}, this);
                },
                //选项打分
                select_save_click: function () {
                    var self = this;
                    var ary_option = [], ary_score = [];
                    for (var i = 0; i < this.table_list_x.length; i++) {
                        var value_list = this.table_list_x[i].value_list;
                        var data_id = this.table_list_x[i].sub_subjectid;
                        var data_name = this.table_list_x[i].sub_subject;
                        if (!this.table_list_x[i].hasOwnProperty('index_option_content')) {
                            $.alert('有空白项没选择');
                            return;
                        } else {
                            var select_no = Number(this.table_list_x[i].index_option_content);
                            self.request_select_data.pj_answer.push(value_list[select_no].index_option);//A
                            self.request_select_data.pj_answer_value.push(value_list[select_no].item_values.toString());//5
                            self.request_select_data.pj_subjectid.push(data_id);
                            self.request_select_data.pj_subject.push(data_name);
                        }
                    }
                    if(self.btn_has){
                        self.btn_has = false;
                        ajax_post(api_save_score, this.request_select_data, this);
                    }
                },
                blur_input: function (el) {
                    var index_value = Number(el.index_value);
                    var value_list = Number(el.value_list);
                    if (value_list > index_value) {
                        $.alert('不能超过最大分值');
                        el.value_list = '';
                    } else if (value_list < 0) {
                        $.alert('分值不能为负数哦');
                        el.value_list = '';
                    }

                },
                submit:function () {
                    if(this.is_select == 2){
                        this.select_save_click();
                    }else{
                        this.only_save_click();
                    }

                },
                //直接打分
                only_save_click: function () {
                    var self = this;
                    self.request_direct_data.pj_value = [];
                    self.request_direct_data.pj_subject = [];
                    self.request_direct_data.pj_subjectid = [];
                    for (var i = 0; i < self.table_list_x.length; i++) {
                        var value_list = self.table_list_x[i].value_list;
                        var data_id = self.table_list_x[i].sub_subjectid;
                        var data_name = self.table_list_x[i].sub_subject;
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
                            $.alert("第" + (k + 1) + "项分值有误");
                        }
                    }
                    if (a == 0) {
                        var b = 0;
                        for (var i = 0; i < self.table_list_x.length; i++) {
                            if (self.table_list_x[i].value_list == "") {
                                b++;
                            }
                        }
                        if (b == 0) {
                            if(self.btn_has) {
                                self.btn_has = false;
                                ajax_post(api_save_score, self.request_direct_data.$model, self);
                            }
                        } else {
                            $.alert("必须全部填写完")
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
                            //指定日期段所属学年学期
                            case api_date_part:
                                this.complete_date_part(data);
                                break;
                            //    进度
                            case api_index_count:
                                this.complete_index_count(data);
                                break;
                        }
                    } else {
                        if(cmd == api_save_score){
                            this.btn_has = true;
                        }
                        $.alert(msg)
                    }
                },
                copy_data: [],
                is_select:0,
                complete_get_content: function (data) {
                    var self = this;
                    if (data.data.length == 0) {
                        self.num = 3;
                    } else {
                        // ajax_post(api_list_record,this.list_record.$model,this);
                        if (data.data[0].value_list.length != 0) {//选项打分
                            self.is_select = 2;
                            this.copy_data = data.data;
                            // self.second_table_list = data.data;
                            ajax_post(api_index_max, this.index_max.$model, this);
                        } else {//直接打分
                            self.is_select = 1;
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
                    if (this.data_record.length > 0 ) {
                        if(this.is_select == 1){
                            for (var i = 0; i < list.length; i++) {
                                for (var j = 0; j < this.data_record.length; j++) {
                                    if (list[i].sub_subjectid == this.data_record[j].pj_subjectid) {
                                        list[i].value_list = this.data_record[j].pj_value;
                                    }
                                }
                            }
                        }else{
                            for (var i = 0; i < list.length; i++) {
                                for (var j = 0; j < this.data_record.length; j++) {
                                    if (list[i].sub_subjectid == this.data_record[j].pj_subjectid) {
                                        var value_list = list[i].value_list;
                                        var get_answer = this.data_record[j].pj_answer;
                                        for(var x = 0;x< value_list.length;x++){
                                            if(value_list[x].index_option == get_answer){
                                                list[i].index_option_content = j;
                                            }
                                        }
                                        // list[i].index_option_content = this.data_record[j].pj_value;
                                    }
                                }
                            }
                        }

                    }else{

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
                    var start = pmx.pro_start_time.substr(0, 10);
                    var end = pmx.pro_end_time.substr(0, 10);
                    // ajax_post(api_date_part, {end_date: end, start_date: start}, this);
                    ajax_post(api_date_part, {}, this);
                },
                complete_date_part: function (data) {
                    this.req.end_date = timeChuo(data.data.end_date);
                    this.req.start_date = timeChuo(data.data.start_date);
                    ajax_post(api_index_count, this.req.$model, this);
                },
                table_list_x:[],
                tt:[],
                complete_index_count: function (data) {
                    var dataList = data.data;
                    var dataLength = dataList.length;
                    var tableList = this.table_list.$model;
                    var tableLength = tableList.length;
                    for(var i = 0; i < tableLength; i++){
                        for(var j = 0; j< dataLength;j++){
                            if(tableList[i].fk_index_id == dataList[j].three_index_id){
                                tableList[i]['everyday_add'] = dataList[j].everyday_add;
                                tableList[i]['everyday_minus'] = dataList[j].everyday_minus;
                                tableList[i]['xs'] = dataList[j].xs;
                                tableList[i]['index_option_content'] = '';
                            }
                        }
                    }

                    this.tt = tableList;
                    this.table_list_x = this.tt;
                },
                //显示已评数据
                complete_list_record: function (data) {
                    this.data_record = data.data;
                    this.get_info();
                },
                complete_save_score: function () {
                    $.alert("保存成功");
                    // ajax_post(api_list_record, this.list_record.$model, this);
                    window.history.go(-1);
                    // window.location="#teacher_fill_list?id="+this.project_id+"&guid="+this.teacher_guid+"&grade_id="+this.request_select_data.pj_gradeid+"&class_id="+ this.request_direct_data.pj_classid+"&school_id="+this.response_data.pro_workid;
                },
                cancel:function () {
                    window.history.go(-1);
                },
                // is_score:2,
                // current_id:"",
                // score_click:function ($idx) {
                //     this.current_id = $idx;
                //     this.is_score = 1;
                // }
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