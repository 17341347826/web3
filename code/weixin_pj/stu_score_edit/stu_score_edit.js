/**
 * Created by Administrator on 2018/6/7.
 */
define(["jquery",
        C.CLF('avalon.js'),
        C.Co("weixin_pj", "stu_score_edit/stu_score_edit", "css!"),
        C.Co("weixin_pj", "stu_score_edit/stu_score_edit", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "jquery-weui"
    ],
    function ($, avalon, css, html, x, data_center, weui) {
        //根据项目我评价人和评价类型查询出我已评的数据（目前只与直接打分做了关联）
        var api_list_record = api.api + 'Indexmaintain/indexmaintain_list_record';
        //查询方案内容
        var api_get_content = api.api + "Indexmaintain/indexmaintain_findByPlanSubject";
        //保存分值
        var api_save_score = api.api + "Indexmaintain/indexmaintain_addevaluaterecord";
        //查询分值的最大值
        var api_index_max = api.api + "Indexmaintain/get_idex_stu_hd_num";
        var pmx = {};
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "stu_score_edit",
                disabled: false,
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
                response_data: {
                    pro_gradeid: "",
                    //1:学生自评2:学生互评3:教师评价4:家长评价
                    pro_type: 2,
                    pro_workid: ""
                },
                //选项打分
                request_select_data: {
                    //项目id
                    pj_proid: '',
                    //选项
                    pj_answer: [],
                    //选项分值
                    pj_answer_value: [],
                    //被评价人
                    pj_cover_name: "",
                    //被评价人id number
                    pj_cover_name_guid: "",
                    //考察项名称数组
                    pj_subject: [],
                    //考察项id数组
                    pj_subjectid: [],
                    //直接打分分值
                    pj_value: [],
                    pj_cover_name_num: "",
                    //被评价人学校id
                    school_id: '',
                },
                //直接打分
                request_direct_data: {
                    //项目id
                    pj_proid: '',
                    //选项
                    pj_answer: [],
                    //选项分值
                    pj_answer_value: [],
                    //被评价人
                    pj_cover_name: "",
                    //被评价人id number
                    pj_cover_name_guid: "",
                    //考察项名称数组
                    pj_subject: [],
                    //考察项id数组
                    pj_subjectid: [],
                    //直接打分分值
                    pj_value: [],
                    pj_cover_name_num: "",
                    //被评价人学校id
                    school_id: ''
                },
                index_max: {
                    fk_class_id: "",
                    fk_school_id: "",
                    fk_semester_id: "",
                    owner: ''
                },
                userInfo:'',
                //对学生评分信息
                list_record:[],
                //是否可以点击（防止重复提交）：true-可以，false-不可以
                btn_has:true,
                cb: function () {
                    var self = this;
                    var pmx_str = data_center.get_key('to_stu_score_edit');
                    pmx = JSON.parse(pmx_str);
                    data_center.uin(function (data) {
                        var dataList = JSON.parse(data.data["user"]);
                        self.userInfo = dataList;
                        self.response_data.pro_gradeid = dataList.fk_grade_id;
                        self.response_data.pro_workid = dataList.fk_school_id;
                        self.request_select_data.school_id = self.response_data.pro_workid;
                        self.request_direct_data.school_id = self.response_data.pro_workid;
                    });
                    self.is_init = true;
                    self.get_classmate_info();
                },
                get_info: function () {
                    this.name = pmx.get_name;
                    this.code = pmx.get_code;
                    var guid = pmx.get_guid
                    this.stu_grade = pmx.get_grade;
                    this.stu_class = pmx.get_class_name + "班";
                    this.request_select_data.pj_proid = pmx.pj_proid;
                    this.request_direct_data.pj_proid = pmx.pj_proid;
                    this.request_direct_data.pj_cover_name = this.name;
                    this.request_direct_data.pj_cover_name_guid = guid;
                    this.request_direct_data.pj_cover_name_num = this.code;
                    this.request_select_data.pj_cover_name = this.name;
                    this.request_select_data.pj_cover_name_guid = guid;
                    this.request_select_data.pj_cover_name_num = this.code;
                    var pro_plan_id = pmx.pro_plan_id;
                    this.get_title = pmx.pro_name;
                    var plan_level = pmx.plan_level;

                    this.index_max.owner = guid;
                    this.index_max.fk_class_id = pmx.fk_class_id;
                    this.index_max.fk_school_id = pmx.fk_school_id;
                    this.index_max.fk_semester_id = pmx.fk_semester_id;

                    ajax_post(api_get_content, {id: pro_plan_id, plan_level: plan_level}, this);
                },
                //获取我已经评价的同学（目前只与直接打分做了关联）
                get_classmate_info:function(){
                    ajax_post(api_list_record,{
                        class_id:pmx.fk_class_id,
                        guid: this.userInfo.guid,
                        pj_cover_name_guid:pmx.get_guid,
                        pj_subjectid:'',
                        pj_type:1,
                        project_id:pmx.pj_proid,
                    },this);
                },
                save_click: function () {
                    if (this.num == 1) {
                        this.only_save_click();
                    } else {
                        this.select_save_click();
                    }
                },
                //选项打分
                select_save_click: function () {
                    this.disabled = true;
                    var self = this;
                    for (var i = 0; i < this.second_table_list.length; i++) {
                        var value_list = this.second_table_list[i].value_list;
                        var data_id = this.second_table_list[i].sub_subjectid;
                        var data_name = this.second_table_list[i].sub_subject;
                        var select_no = Number(this.second_table_list[i].index_option_content);
                        self.request_select_data.pj_answer.push(value_list[select_no].index_option);
                        self.request_select_data.pj_answer_value.push(value_list[select_no].item_values.toString());
                        self.request_select_data.pj_subjectid.push(data_id);
                        self.request_select_data.pj_subject.push(data_name);
                    }
                    if(self.btn_has){
                        self.btn_has = false;
                        ajax_post(api_save_score, self.request_select_data, self);
                    }
                },
                //直接打分
                only_save_click: function () {
                    this.disabled = true;
                    var a = 0;
                    var self = this;
                    for (var i = 0; i < this.table_list.length; i++) {
                        if (this.table_list[i].value_list != '') {
                            a++;
                            var value_list = this.table_list[i].value_list;
                            var data_id = this.table_list[i].sub_subjectid;
                            var data_name = this.table_list[i].sub_subject;
                            self.request_direct_data.pj_value.push(value_list);
                            self.request_direct_data.pj_subject.push(data_name);
                            self.request_direct_data.pj_subjectid.push(data_id);
                        } else {
                        }
                    }
                    if (a == this.table_list.length) {
                        if(self.btn_has) {
                            self.btn_has = false;
                            ajax_post(api_save_score, this.request_direct_data, this);
                        }
                    } else {
                        this.disabled = false;
                        $.alert('请填写完再提交')
                    }
                },
                inputBlur: function (el,idx) {
                    if($.trim(el.value_list)==''){
                        this.table_list[idx].value_list = '';
                        $.alert('分值不能为空');
                        return;
                    }
                    var reg=/^\d+(\.\d{1})?$/;
                    if(reg.test(el.value_list)){

                    }else{
                        this.table_list[idx].value_list = '';
                        $.alert('分值输入不正确');
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
                //取消
                cancel_click: function () {
                    history.go(-1);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取我已经评价的学生分值(目前只与直接打分做了关联)
                            case api_list_record:
                                this.complete_list_record(data);
                                break;
                            //获取方案内容
                            case api_get_content:
                                this.complete_get_content(data);
                                break;
                            case api_save_score:
                                this.complete_save_score(data);
                                break;
                            case api_index_max:
                                this.get_table_list(data);
                                break;
                        }
                    } else {
                        if(cmd == api_save_score){
                            this.btn_has = true;
                        }
                        $.alert(msg)
                    }
                },
                complete_list_record:function(data){
                    this.list_record = data.data;
                    this.get_info();
                },
                copy_list: [],
                get_table_list: function (data) {
                    var guid = this.index_max.owner;
                    var list = JSON.parse(JSON.stringify(this.copy_list));
                    for (var i = 0; i < list.length;i++) {
                        if(list[i].index_secondaryid == 933 || list[i].index_secondaryid == 939 || list[i].index_secondaryid == 940 || list[i].index_secondaryid == 941 ||list[i].index_secondaryid == 942){
                            list[i].index_value = 5
                        }else if (data.data.hasOwnProperty(list[i].index_secondaryid)) {//设置
                            if (!data.data[list[i].index_secondaryid][guid]) {
                                list[i].index_value = 3
                            }
                        }else{
                            list[i].index_value = 3
                        }
                    }
                    this.num=1;
                    if(this.list_record.length == 0 || this.list_record == null){
                        this.table_list = list;
                        return;
                    }
                    //对已经评价的同学进行数据回显
                    var rlist = this.list_record;
                    for(var a=0;a<rlist.length;a++){
                        var subject_id = rlist[a].pj_subjectid;
                        for(var b=0;b<list.length;b++){
                            if(subject_id == list[b].sub_subjectid){
                                list[b].value_list = rlist[a].pj_value;
                                break;
                            }
                        }
                    }
                    this.table_list = list;
                },
                complete_get_content: function (data) {
                    if (data.data.length == 0) {
                        this.num = 3;
                    } else {
                        if (data.data[0].value_list.length != 0) {//选项打分
                            this.num = 2;
                            this.second_table_list = data.data;
                        } else {//直接打分
                            // this.num = 1;
                            this.copy_list = data.data;
                            ajax_post(api_index_max, this.index_max.$model, this);
                        }
                    }
                },
                complete_save_score: function () {
                    this.disabled = true;
                    $.alert('保存成功')
                    window.location = '#stu_score_list'
                }
            });
            vm.$watch('onReady', function () {
                this.cb();

            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });