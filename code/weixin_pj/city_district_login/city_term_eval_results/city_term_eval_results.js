/**
 * Created by Administrator on 2018/9/11.
 */
/**
 * Created by uptang on 2017/4/28.
 */

define(['jquery',
        C.CLF("avalon.js"),
        C.Co("weixin_pj", "city_district_login/city_term_eval_results/city_term_eval_results", "css!"),
        C.Co("weixin_pj", "city_district_login/city_term_eval_results/city_term_eval_results", "html!"),
        C.CMF("data_center.js"),
        "highcharts",
        "PCAS", 'jquery-weui','swiper'
    ],
    function ($, avalon, css, html, data_center,highcharts,PCAS,weui,swiper) {
        //获取年级列表
        var api_get_grade = api.user + "grade/findGrades.action";
        //获取年级可操作学年学期
        var api_garde_semester = api.user + "semester/grade_opt_semester";
        //获取区县
        var api_get_area = api.user + "school/arealist.action";
        //获取学校
        var api_get_school = api.user + "school/schoolList.action";
        //获取班级
        var api_get_class = api.user + 'class/findClassInfo.action';
        //查询等级设置个数
        var api_rank_count = api.api + "Indexmaintain/indexmaintain_findByCountRankParameterInfo";
        //获取表头
        var api_get_table_head = api.api + "Indexmaintain/get_yjzb_title";
        //获取数据
        var api_get_info = api.api + "Indexmaintain/page_semester_result";

        //获取学年的时间
        var api_get_time = api.api + "base/semester/year_date";
        //获取图表显示数据
        var api_get_data = api.api + "GrowthRecordBag/pj_evaluation_by_class";

        var avalon_define = function () {

            var vm = avalon.define({
                $id: "city_term_eval_results",
                //身份判断
                ident_type:'',
                //年级集合
                grade_list:[],
                //学年学期集合
                semester_list:[],
                //区县集合
                area_list:[],
                //学校集合
                school_list:[],
                //班级集合
                class_list:[],
                //等级集合
                rank_arr:[],
                //表头集合
                thead_ary:[],
                tbodyThead:[],
                //表格数据
                get_info:[],
                //数据请求参数
                form: {
                    city: "",
                    classId: '',
                    district: "",
                    gradeId: '',
                    rows: 10,
                    offset: 0,
                    schoolId: '',
                    semesterId: "",
                    state: 5,//1:未发布，2：发布（公示），3：待审核，4：二次公示，5：归档
                    studentName: "",
                    studentNum: "",
                    //综合得分等级
                    dfdj: ""
                },
                init:function () {
                    this.cb();
                },
                cb: function () {
                    //用户user
                    var user = cloud.user_user();
                    // 用户 highest_level：1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                    var highest = cloud.user_level();
                    this.ident_type = highest;
                    var city = user.city;
                    this.form.city = city;
                    if(this.ident_type == 2){//市
                        //区县
                        ajax_post(api_get_area,{city:city},this);
                    }else if(this.ident_type == 3){//区县
                        var district = user.district;
                        this.form.district = district;
                        //学校
                        ajax_post(api_get_school,{district: this.form.district, city: this.form.city},this);
                    }else if(this.ident_type == 4){//校
                        this.form.district = user.district;
                        this.form.schoolId = user.fk_school_id;
                    }else if(this.ident_type ==5 || this.ident_type == 6){//教师
                        this.form.district = user.district;
                        this.form.schoolId = user.fk_school_id;
                        var list = user.lead_class_list;
                        // var teach_list = user.teach_class_list;
                        list = list.concat(user.teach_class_list);
                        this.grade_list = this.aryobj_deweighting(list,'grade_id');
                        this.form.gradeId = this.grade_list[0].grade_id;
                        this.class_list = this.grade_list[0].class_list;
                        //请求学年学期
                        ajax_post(api_garde_semester,{grade_id:this.form.gradeId},this);
                    }
                    if(this.ident_type < 5){
                        //年级
                        ajax_post(api_get_grade,{status:1},this);
                    }
                },
                //数组对象去重: 利用对象访问属性的方法，判断对象中是否存在key
                aryobj_deweighting:function(arr,name){
                    var ary = [];
                    var obj = {};
                    for(var i=0;i<arr.length;i++){
                        if(!obj[arr[i].key]){
                            ary.push(arr[i]);
                            obj[arr[i].key] = true;
                            }
                    }
                    return ary;
                },
                //年级改变
                grade_change:function(){
                    this.get_info = [];
                    this.form.classId = '';
                    this.form.dfdj = '';
                    //请求学年学期
                    ajax_post(api_garde_semester,{grade_id:this.form.gradeId},this);
                },
                //学年学期改变
                sem_change:function(){
                    this.get_info = [];
                    this.form.classId = '';
                    this.form.dfdj = '';
                    //    等级设置个数
                    ajax_post(api_rank_count,{
                        c_gradeid:this.form.gradeId,
                        c_semester_id:this.form.semesterId
                    },this);
                },
                //区县改变
                area_change:function(){
                    this.get_info = [];
                    this.form.schoolId = '';
                    this.form.classId = '';
                    this.form.dfdj = '';
                    //学校
                    ajax_post(api_get_school,{district: this.form.district, city: this.form.city},this);
                    //    请求表格数据
                    ajax_post(api_get_info,this.form.$model,this);
                },
                //学校改变
                school_change:function(){
                    this.get_info = [];
                    this.form.classId = '';
                    this.form.dfdj = '';
                    //班级
                    ajax_post(api_get_class,{fk_grade_id:this.form.gradeId,fk_school_id:this.form.schoolId},this);
                    //    获取表头
                    ajax_post(api_get_table_head,{
                        city: this.form.city,
                        district: this.form.district,
                        fk_bj_id: this.form.classId,
                        fk_nj_id: this.form.gradeId,
                        fk_xx_id: this.form.schoolId,
                        fk_xq_id: this.form.semesterId
                    },this);
                },
                //班级改变
                class_change:function(){
                    this.get_info = [];
                    //清空等级
                    this.form.dfdj = '';
                    //获取表头
                    ajax_post(api_get_table_head,{
                        city: this.form.city,
                        district: this.form.district,
                        fk_bj_id: this.form.classId,
                        fk_nj_id: this.form.gradeId,
                        fk_xx_id: this.form.schoolId,
                        fk_xq_id: this.form.semesterId
                    },this);
                },
                //等级改变
                rank_change:function(){
                    this.get_info = [];
                    //请求表格数据
                    ajax_post(api_get_info,this.form.$model,this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                        //    获取年级
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                        //        学年学期
                            case api_garde_semester:
                                this.complete_grade_semester(data);
                                break;
                        //        区县
                            case api_get_area:
                                this.complete_get_area(data);
                                break;
                        //        学校
                            case api_get_school:
                                this.complete_get_school(data);
                                break;
                        //        班级
                            case api_get_class:
                                this.complete_get_class(data);
                                break;
                        //        等级设置个数
                            case api_rank_count:
                                this.complete_rank_count(data);
                                break;
                        //        获取表头
                            case api_get_table_head:
                                this.complete_table_head(data);
                                break;
                        //        获取数据
                            case api_get_info:
                                this.complete_get_info(data);
                                break;
                        }
                    } else {
                        $.alert(msg);
                    }
                },
            //    年级
                complete_get_grade:function(data){
                    this.grade_list = data.data;
                    this.form.gradeId = this.grade_list[0].id;
                    //请求学年学期
                    ajax_post(api_garde_semester,{grade_id:this.form.gradeId},this);
                    if(this.ident_type == 4){//学校
                        //班级
                        ajax_post(api_get_class,{fk_grade_id:this.form.gradeId,fk_school_id:this.form.schoolId},this);
                    }
                },
            //    学年学期
                complete_grade_semester:function(data){
                    this.semester_list = data.data.list;
                    this.form.semesterId = this.semester_list[0].id;
                //    等级设置个数
                    ajax_post(api_rank_count,{
                        c_gradeid:this.form.gradeId,
                        c_semester_id:this.form.semesterId
                    },this);
                },
            //    区县
                complete_get_area:function(data){
                    this.area_list = data.data.list;
                },
            //学校
                complete_get_school:function(data){
                    this.school_list = data.data.list;
                },
            //班级
                complete_get_class:function(data){
                    this.class_list = data.data.list;
                },
            //    等级设置个数
                complete_rank_count:function(data){
                    //清空之前等级
                    this.rank_arr = [];
                    if(!data.data ||data.data.length==0){
                        // $.alert("暂未设置等级！", "提示");
                        $.alert("该学期评价结果无数据", "提示");
                        return;
                    }
                    if (!data.data[0].countRankParameterInfoList || data.data[0].countRankParameterInfoList.length == 0){
                        // $.alert("暂未设置等级！", "提示");
                        $.alert("该学期评价结果无数据", "提示");
                        return;
                    }
                    var rank_count_obj = {
                        "1": {level: ['A']},
                        "2": {level: ['A', 'B']},
                        "3": {level: ['A', 'B', 'C']},
                        "4": {level: ['A', 'B', 'C', 'D']},
                        "5": {level: ['A', 'B', 'C', 'D', 'E']}
                    };
                    var rank_count = data.data[0].countRankParameterInfoList.length;
                    this.rank_arr = rank_count_obj[rank_count].level;
                //    获取表头
                    ajax_post(api_get_table_head,{
                        city: this.form.city,
                        district: this.form.district,
                        fk_bj_id: this.form.classId,
                        fk_nj_id: this.form.gradeId,
                        fk_xx_id: this.form.schoolId,
                        fk_xq_id: this.form.semesterId
                    },this);
                },
            //    表头
                complete_table_head:function(data){
                    var dataL = data.data;
                    var arr = ['加分项', '综合分值', '综合评价'];
                    for (var i = 0; i < arr.length; i++) {
                        var add_ = {};
                        add_.signName1 = arr[i];
                        dataL.push(add_)
                    }
                    this.thead_ary = dataL;
                //    请求表格数据
                    ajax_post(api_get_info,this.form.$model,this);
                },
            //    表格数据
                complete_get_info:function(data){
                    this.get_info = [];
                    if(!data || !data.data || !data.data.list){
                        return
                    }
                    if (data.data.list.length > 0) {
                        var dataList = data.data.list;
                        for (var i = 0; i < dataList.length; i++) {
                            var scoreValue = dataList[i].scoreValue;//总分
                            var score_plus;
                            if (dataList[i].score_plus == null) {
                                score_plus = '';
                            } else {
                                score_plus = dataList[i].score_plus;//加分
                            }
                            dataList[i].percentileOne += ',' + score_plus + ',';
                            dataList[i].percentileOne += scoreValue;
                            dataList[i].percentileOne = dataList[i].percentileOne.split(',');
                        }
                        dataList.index_name = this.thead_ary;
                        this.tbodyThead = dataList.index_name;
                        this.get_info = dataList;
                    }
                    // console.log(this.get_info);
                },
            });
            vm.init();
            return vm;
        }


        return {
            view: html,
            define: avalon_define
        }
    });