define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_result_management', 'term_evaluation_results/term_evaluation_results', 'html!'),
        C.Co('evaluation_result_management', 'term_evaluation_results/term_evaluation_results', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        "highcharts",
        C.CM("three_menu_module"),
        C.CMF("table/table.js"),
        "PCAS"
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, highcharts, three_menu_module, table, PCAS) {
        //获取区县
        var api_get_area = api.api + "base/school/arealist.action";
        //获取学校
        var api_get_school = api.api + "base/school/schoolList.action";
        //获取学校下对应的年级
        var api_get_school_grade = api.api + "base/class/school_class.action";
        //查询项目
        var api_get_project = api.api + "Indexmaintain/find_project_by_state";
        //获取表头
        var api_get_table_head = api.api + "Indexmaintain/get_yjzb_title";
        //获取数据
        var api_get_info = api.api + "Indexmaintain/page_semester_result";
        //获取初2016年级是几年级
        var api_get_grade_class = api.api + "base/grade/findGrades.action";
        //获取学年的时间
        var api_get_time = api.api + "base/semester/year_date";
        //查询等级设置个数
        var api_get_c_rank_count = api.api + "Indexmaintain/indexmaintain_findByCountRankParameterInfo";
        //获取学年学期
        var api_get_semester = api.api + "base/semester/grade_opt_semester";
        //获取图表显示数据
        var api_get_data = api.api + "GrowthRecordBag/pj_evaluation_by_class";

        var avalon_define = function () {

            var vm = avalon.define({
                $id: "term_evaluation_results",
                //
                offset: 0,
                exclude_rem: ["student_performance_score"],
                msg: "",

                grade_pmx: {
                    "一年级": {id: 1},
                    "二年级": {id: 2},
                    "三年级": {id: 3},
                    "四年级": {id: 4},
                    "五年级": {id: 5},
                    "六年级": {id: 6},
                    "七年级": {id: 7},
                    "八年级": {id: 8},
                    "九年级": {id: 9},
                    "高一": {id: 10},
                    "高二": {id: 11},
                    "高三": {id: 12}
                },
                due_grade: "",
                p_show: false,
                highest_level: "",
                area_list: [],
                area: "",
                school_list: [],
                grade_list: [],
                class_list: [],
                project_obj: [],

                //己经处理完成的上级数
                sup_count: 0,
                // 上级数列表
                sup_list: [],
                project_id: '',
                data_list: [],
                tbodyThead: [],
                get_info: [],
                school_id: "",
                table_show: false,
                class_id: '',
                //学期开始时间
                semester_start: '',
                //学期结束时间
                semester_end: '',
                semester_list: [],
                semester_id: "",
                //等级
                rank_count_arr: [],
                get_project_info_name: "",
                data: {
                    offset: 0,
                    rows: 15
                },
                form: {
                    city:"",
                    classId: '',
                    district:"",
                    gradeId: '',
                    rows: 10,
                    offset: 0,
                    schoolId: '',
                    semesterId: "",
                    state: 5,//1:未发布，2：发布（公示），3：待审核，4：二次公示，5：归档
                    studentName: "",
                    studentNum:"",
                    dfdj:"",
                    districtId:''

                },
                //分页
                // 数据总数
                districtId:"",
                district: "",
                city: "",
                count: "",
                /*总页数*/
                totalPage: "",
                // 计算分页数组
                totalPageArr: [],
                /*当前是第几页*/
                currentPage: 1,
                //跳转到第几页时错误的提示语
                pageNoMsg: "",
                pageNo: "",
                is_school_user: false,
                //获取总页数+当前显示分页数组
                set_total_page: function (count) {
                    if (count == 0) {
                        // this.totalPageArr = new Array(this.totalPage);
                        this.totalPage = 1;
                        this.get_page_ary(this.currentPage, this.totalPage);
                    } else {
                        //向上取证
                        this.totalPage = Math.ceil(count / this.form.rows);
                        this.get_page_ary(this.currentPage, this.totalPage);
                    }
                },
                get_data: function () {
                    ajax_post(api_get_c_rank_count, {c_gradeid: this.form.gradeId,c_semester_id:this.semester_id}, this);
                },
                //计算分页数组(前提count>0)
                get_page_ary: function (c_page, t_page) {//当前页数，总页数
                    this.totalPageArr = [];
                    var p_ary = [];
                    if (t_page <= 5) {//总页数小于5
                        for (var i = 0; i < t_page; i++) {
                            p_ary[i] = i + 1;
                        }
                    } else if (c_page == 0 && t_page > 5) {
                        for (var i = 0; i < 5; i++) {
                            p_ary[i] = i + 1;
                        }
                    } else if (c_page + 2 >= t_page) {//
                        var base = t_page - 4;
                        for (var i = 0; i < 5; i++) {
                            p_ary[i] = base + i;
                        }
                    } else {//c_page+2<t_page
                        //显示的第一个页数
                        var base = Math.abs(c_page - 2) == 0 ? 1 : Math.abs(c_page - 2);
                        for (var i = 0; i < 5; i++) {
                            p_ary[i] = base + i;
                        }
                    }
                    this.totalPageArr = p_ary;
                },
                //当前页面跳转
                currentPageDate: function (num) {
                    this.currentPage = num;
                    this.form.offset = (num - 1) * this.form.rows;
                    this.is_change_rank = false;
                    //获取数据
                    ajax_post(api_get_info, this.form, this);
                },
                to_print:function () {
                    var post_obj = {
                        "city": this.city,
                        "district": this.area,
                        "fk_bj_id": this.form.classId,
                        "fk_nj_id": this.form.gradeId,
                        "fk_xx_id": this.form.schoolId,
                        "fk_xq_id": this.semester_id,

                        "classId": this.form.classId,
                        "gradeId": this.form.gradeId,
                        "school_id": this.form.schoolId,
                        "semesterId": this.semester_id,
                        "dfdj": this.form.dfdj,
                        "state": 5,
                        "rows": 15,

                        "current_page": 0,
                        "offset": 0,
                         "districtId": this.districtId
                    }
                    data_center.set_key('term_print_data',JSON.stringify(post_obj));
                    window.location = "#term_evalution_print"
                },
                //序号改变
                set_index: function (idx, c_page) {
                    var index = idx + (c_page - 1) * this.form.rows;
                    return index;
                },

                //跳转操作
                pageNOSure: function (num) {
                    if (num < 1) {
                        layer.alert('请输入正确的页码', {
                            closeBtn: 0
                            , anim: 4 //动画类型
                        });
                    } else if (num > this.totalPage) {
                        layer.alert('超出总页数', {
                            closeBtn: 0
                            , anim: 4 //动画类型
                        });
                    } else {
                        this.currentPage = Math.ceil(num);
                        this.form.offset = (this.currentPage - 1) * this.form.rows;
                        //获取数据
                        layer.load(1, {shade:[0.3,'#121212']});
                        this.is_change_rank = false;
                        ajax_post(api_get_info, this.form, this);
                    }
                },
                //分页
                cb: function () {
                    var user = cloud.user_user();
                    var highest = cloud.user_level();
                    var city = user.city;
                    var district = user.district;
                    this.city = city;
                    this.form.city = city;
                    this.area = district;
                    this.form.district = district;
                    this.highest_level = highest;
                    if (highest < 2)
                        return;
                    if (highest < 3) {
                        ajax_post(api_get_area, {city: city}, this);
                        return;
                    }
                    this.districtId = cloud.school_user_distict_id().district_id;

                    if (highest < 4) {
                        ajax_post(api_get_school, {city: city, district: district}, this)
                        return
                    }
                    this.form.schoolId = cloud.user_school_id();

                    this.changGrade();
                    // this.get_data();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取区县
                            case api_get_area:
                                this.complete_get_area(data);
                                break;
                            //获取学校
                            case api_get_school:
                                this.complete_get_school(data);
                                break;
                            //获取学校下对应的年级
                            case api_get_school_grade:
                                this.complete_get_school_grade(data);
                                break;
                            //获取等级个数
                            case api_get_c_rank_count:
                                this.complete_get_c_rank_count(data);
                                break;
                            //获取项目
                            case api_get_project:
                                this.complete_get_project(data);
                                break;
                            //获取表头
                            case api_get_table_head:
                                this.complete_get_table_head(data);
                                break;
                            //获取数据
                            case api_get_info:
                                this.complete_get_info(data);
                                break;
                            //转化年级
                            case api_get_grade_class:
                                this.complete_get_grade_class(data);
                                break;
                            //获取学年
                            case api_get_time:
                                this.complete_get_time(data);
                                break;
                            //获取学期
                            case api_get_semester:
                                this.complete_api_get_semester(data);
                                break;
                            //获取图表数据
                            case api_get_data:
                                this.complete_api_get_data(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                    if (cmd == api_get_info) {
                        layer.closeAll();
                    }
                },
                //获取区县
                complete_get_area: function (data) {
                    this.area_list = data.data.list;
                    //获取区县下对应的学校
                    // ajax_post(api_get_school, {district: this.area, city: this.city}, this)
                },
                //获取区县对应的学校
                is_first_school: true,
                complete_get_school: function (data) {
                    this.school_list = data.data.list;

                    this.grade_list = cloud.auto_grade_list().reverse();
                    if (this.is_first_school)
                        this.form.gradeId = this.grade_list[0].id;
                    this.is_first_school = false;
                    this.get_data();
                    var is_school_user = cloud.is_school_user();
                    if (is_school_user) {
                        this.form.schoolId = this.school_list[0].id;
                        this.is_change_rank = false;
                        ajax_post(api_get_info, this.form, this);
                    }

                },
                //获取学年
                is_first: true,
                complete_api_get_semester: function (data) {
                    this.semester_list = data.data.list;
                    if (this.is_first) {
                        this.semester_id = this.semester_list[0].id;
                        this.query();
                    }
                    this.is_first = false;
                    this.semesterChange();
                },
                //图表数据
                refresh_fbqk: function () {
                    ajax_post(api_get_data, {
                        district_id: this.districtId,
                        class_id: this.form.classId,
                        grade_id: this.form.gradeId,
                        school_id: this.form.schoolId,
                        semester_id: this.semester_id
                    }, this);
                },
                //获取表头
                refresh_detail: function () {
                    ajax_post(api_get_table_head, {
                        city: this.city,
                        district: this.district,
                        fk_bj_id: this.form.classId,
                        fk_nj_id: this.form.gradeId,
                        fk_xx_id: this.form.schoolId,
                        fk_xq_id: this.semester_id
                    }, this);
                },
                complete_get_c_rank_count: function (data) {
                    if(!data.data ||data.data.length==0)
                        return;
                    if (!data.data[0].countRankParameterInfoList || data.data[0].countRankParameterInfoList.length == 0)
                        return;
                    var rank_count_obj = {
                        "1": {level: ['A']},
                        "2": {level: ['A', 'B']},
                        "3": {level: ['A', 'B', 'C']},
                        "4": {level: ['A', 'B', 'C', 'D']},
                        "5": {level: ['A', 'B', 'C', 'D', 'E']}
                    };
                    var rank_count = data.data[0].countRankParameterInfoList.length;
                    this.rank_count_arr = rank_count_obj[rank_count].level;
                },
                //获取图表数据
                complete_api_get_data: function (data) {
                    if (data.data == null) {
                        this.data_list = [];
                        this.get_info = [];
                        return;
                    }
                    var result_data = data.data;
                    if (result_data.length == 0) return;
                    var data_arr = [];
                    for (var i = 0; i < result_data.length; i++) {
                        var obj = {
                            "name": result_data[i].dj + "等",
                            "y": Number(result_data[i].bfb),
                            "drilldown": result_data[i].dj + "等"
                        }
                        data_arr.push(obj);
                    }

                    this.data_list = result_data;
                    this.get_charts_left(data_arr);
                },
                //获取表头
                complete_get_table_head: function (data) {
                    this.get_thead = data.data;
                    //获取数据
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.form.semesterId = this.semester_id;
                    this.is_change_rank = false;
                    ajax_post(api_get_info, this.form, this);
                },
                title_obj:{},
                //得到数据
                complete_get_info: function (data) {
                    this.get_info = [];
                    if(!data || !data.data || !data.data.list){
                        return
                    }
                    if (data.data.list.length > 0) {
                        var dataList = data.data.list;
                        dataList.index_name = this.get_thead;
                        this.tbodyThead = dataList.index_name;
                        var title_obj = {};
                        var ids_arr = []
                        for(var m=0;m<this.tbodyThead.length;m++){
                            var id = this.tbodyThead[m].singId1;
                            title_obj[id] = {
                                name:this.tbodyThead[m].signName1,
                                value:0
                            }
                            ids_arr.push(id);
                        }
                        this.title_obj = JSON.parse(JSON.stringify(title_obj));
                        for(var n=0;n<dataList.length;n++){
                            dataList[n].title_obj = JSON.parse(JSON.stringify(title_obj));
                            if(dataList[n].score_plus==null){
                                dataList[n].score_plus = 0;
                            }
                            if(dataList[n].scoreValue==null){
                                dataList[n].scoreValue = 0;
                            }
                            dataList[n].percentile_arr = dataList[n].percentileOne.split(',');
                            dataList[n].first_index_id_group_arr = dataList[n].first_index_id_group.split(',');
                            dataList[n].value_arr = [];
                            for(var k=0;k<dataList[n].first_index_id_group_arr.length;k++){
                                var value_id = dataList[n].first_index_id_group_arr[k];
                                if(ids_arr.indexOf(Number(value_id))!=-1){
                                    dataList[n].title_obj[value_id].value = dataList[n].percentile_arr[k]
                                }
                            }
                        }


                        this.get_info = dataList;
                        this.p_show = false;
                        //将年级转化成1-12
                        ajax_post(api_get_grade_class, {id: this.form.gradeId + ''}, this);
                        this.count = data.data.count;
                        //获取总页数+当前显示分页数组
                        this.set_total_page(this.count);
                        return;
                    }
                    if(!this.is_change_rank){
                        // this.data_list = [];
                        this.p_show = true;
                        this.table_show = false;
                    }

                    this.count = 0;
                    //获取总页数+当前显示分页数组
                    this.set_total_page(this.count);
                },
                //切换区县
                is_area_first: true,
                changeArea: function () {
                    this.school_list = [];
                    this.class_list = [];
                    this.form.district = this.area;
                    if (this.area != "") {
                        var area_detail = base_filter(this.area_list, "district", this.area);
                        this.form.districtId = area_detail[0].id;
                        this.form.district = this.area;
                        this.districtId = area_detail[0].id;
                        this.district = this.area;
                        ajax_post(api_get_school, {district: this.area, city: this.city}, this)
                    }
                    else {
                        this.district = "";
                        this.districtId = "";
                        this.form.districtId = '';
                        this.form.schoolId = ''
                        this.form.classId = '';
                    }


                },
                //切换学校
                changSchool: function () {
                    if (this.form.schoolId != "") {
                        // 刷新年级列表
                        this.class_list = cloud.class_list({
                            fk_school_id: this.form.schoolId,
                            fk_grade_id: this.form.gradeId
                        });
                    }
                    else {
                        this.class_list = [];
                    }
                },
                //切换年级
                changGrade: function () {
                    // 用户选择了学校，则需要刷新班级，否则清空班级
                    if (this.form.schoolId == "")
                        this.class_list = [];
                    else
                        this.class_list = cloud.class_list({
                            fk_school_id: this.form.schoolId,
                            fk_grade_id: this.form.gradeId
                        });
                    ajax_post(api_get_semester, {grade_id: this.form.gradeId}, this);
                    // this.get_data();
                },
                //切换班级
                changeClass: function () {
                },
                //切换学年学期
                semesterChange: function () {
                    var sm = base_filter(this.semester_list, "id", this.semester_id);
                    this.semester_start = time_2_str(sm[0].start_date);
                    this.semester_end = time_2_str(sm[0].end_date);
                    this.get_data();
                },
                is_change_rank:false,
                //切换等级
                rankChange: function () {
                    this.form.offset = 0;
                    this.currentPage = 1;
                    //获取数据
                    this.form.offset = 0;
                    ajax_post(api_get_info, this.form, this);
                },
                query: function () {
                    this.data_list = [];
                    this.get_info = [];
                    this.refresh_fbqk();
                    this.refresh_detail();
                },
                check: function (el) {
                    var get_guid = el.studentId;
                    window.location = '#stu_evaluate_report?' +
                        'project_id=' + this.project_id +
                        "&start_time=" + this.start_time +
                        "&end_time=" + this.end_time +
                        "&get_guid=" + get_guid +
                        "&studentNum=" + el.studentNum +
                        '&semester_start=' + this.semester_start +
                        "&semester_end=" + this.semester_end +
                        "&grade_id=" + this.form.gradeId +
                        "&school_id=" + this.form.schoolId +
                        "&due_grade=" + this.due_grade +
                        "&year_start_date=" + this.year_start_date +
                        "&year_end_date=" + this.year_end_date;
                },
                //转化年级
                complete_get_grade_class: function (data) {
                    var get_remark = data.data[0].remark;
                    this.due_grade = this.grade_pmx[get_remark].id.toString() + "";
                    ajax_post(api_get_time, {start_date: this.semester_start, end_date: this.semester_end}, this);
                },
                complete_get_time: function (data) {
                    this.year_start_date = data.data.start_date;
                    this.year_end_date = data.data.end_date;
                    this.table_show = true;
                },
                export_reports: function () {
                    var self = this;
                    var grade_name = '';
                    for (var i = 0; i < this.grade_list.length; i++) {
                        if (this.form.gradeId == this.grade_list[i].grade_id) {
                            grade_name = this.grade_list[i].grade_name;
                        }
                    }
                    var token = sessionStorage.getItem('token');
                    if (this.highest_level == 4) {
                        var file_name = '';
                        for (var i = 0; i < this.project_obj.length; i++) {
                            if (this.form.subjectId == this.project_obj[i].id) {
                                file_name = this.project_obj[i].ca_name;
                            }
                        }
                        layer.confirm('确定要导出' + '【' + grade_name + '】' + file_name + '的评价结果吗', {
                                btn: ['确定', '取消'] //按钮
                            }, function () {

                                window.open('http://pj.xtyun.net/api/Indexmaintain/export_interim_report?gradeId=' + self.form.gradeId + "&schoolId=" + self.form.schoolId + '&subjectId=' + self.form.subjectId + '&token=' + token);
                                layer.closeAll();
                            },
                            function () {
                                layer.closeAll();
                            });
                    } else if (this.highest_level == 2 || this.highest_level == 3) {
                        var semester_name = '';
                        for (var i = 0; i < this.semester_list.length; i++) {
                            if (this.semester_id == this.semester_list[i].id) {
                                semester_name = this.semester_list[i].semester_name;
                            }
                        }
                        layer.confirm('确定要导出' + '【' + grade_name + '】' + semester_name + '的评价结果吗', {
                                btn: ['确定', '取消'] //按钮
                            }, function () {
                                window.open('http://pj.xtyun.net/api/Indexmaintain/export_interim_report?gradeId=' + self.form.gradeId + '&subjectId=' + self.form.subjectId + '&semester_id=' + self.semester_id + '&token=' + token);
                                layer.closeAll();
                            },
                            function () {
                                layer.closeAll();
                            });
                    }

                },
                click_export: function () {
                    cloud.has_pjda(
                        {
                            fk_nj_id: vm.form.gradeId,
                            fk_xq_id: vm.form.semesterId,
                            guid: '',
                            status: 5
                        }, function (ars, url, data) {
                            var sid = data[0].fk_pjtjxm_id;
                            var token = sessionStorage.getItem('token');
                            var HTTP_X = location.origin;
                            window.open(HTTP_X + '/api/Indexmaintain/export_interim_report?gradeId=' + vm.form.gradeId +
                                '&classId=' + vm.form.classId +
                                '&subjectId=' + sid +
                                '&semester_id=' + vm.semester_id +
                                "&districtId=" + vm.districtId +
                                "&schoolId=" + vm.form.schoolId +
                                '&token=' + token
                            );
                        })

                },
                current_grade: '',
                init: function () {
                    this.cb();
                    this.city = cloud.user_city();
                    this.is_school_user = cloud.is_school_user();
                    if (this.is_init_sel && this.semester_list.length > 0) {
                        this.current_semester = this.semester_list[0];
                    }
                    if (this.is_init_sel && this.grade_list.length > 0) {
                        this.current_grade = this.grade_list[0];
                    }
                    if (cloud.is_district_leader()) {
                        this.districtId = cloud.school_user_distict_id().district_id;
                    }
                },

                init_data: function () {
                    this.grade_list = cloud.auto_grade_list().reverse();
                    if(this.grade_list.length==0){
                        toastr.error('无教授年级信息')
                        return
                    }
                    this.form.gradeId = this.grade_list[0].id;
                    //this.changGrade();
                    //获取学年学期
                    ajax_post(api_get_semester, {grade_id: this.form.gradeId}, this);
                },
                get_charts_left: function (data) {
                    var series = [{
                        name: '综合素质等级分布',
                        colorByPoint: true,
                        data: data
                    }];
                    var categories = [{}];
                    this.charts(categories, series);
                },
                charts: function (categories, series) {
                    require(["highcharts_more"], function (highcharts_more) {

                        (function (b) {
                            "object" === typeof module && module.exports ? module.exports = b : b(Highcharts)
                        })(function (b) {
                            (function (a) {
                                a.createElement("link", {
                                    href: "https://fonts.googleapis.com/css?family\x3dSignika:400,700",
                                    rel: "stylesheet",
                                    type: "text/css"
                                }, null, document.getElementsByTagName("head")[0]);
                                a.wrap(a.Chart.prototype, "getContainer", function (a) {
                                    a.call(this);
                                    this.container.style.background = "url(http://www.highcharts.com/samples/graphics/sand.png)"
                                });
                                a.theme = {
                                    colors: "#ff6375 #0090ff #ffca63 #37ddbc #f45b5b #8085e9 #8d4654 #7798BF #aaeeee #ff0066 #eeaaee #55BF3B #DF5353  ".split(" "),
                                    chart: {backgroundColor: null, style: {fontFamily: "Signika, serif"}},
                                    title: {style: {color: "black", fontSize: "16px", fontWeight: "bold"}},
                                    subtitle: {style: {color: "black"}},
                                    tooltip: {borderWidth: 0},
                                    legend: {itemStyle: {fontWeight: "bold", fontSize: "13px"}},
                                    xAxis: {labels: {style: {color: "#6e6e70"}}},
                                    yAxis: {labels: {style: {color: "#6e6e70"}}},
                                    plotOptions: {
                                        series: {shadow: !0},
                                        candlestick: {lineColor: "#404048"},
                                        map: {shadow: !1}
                                    },
                                    navigator: {xAxis: {gridLineColor: "#D0D0D8"}},
                                    rangeSelector: {
                                        buttonTheme: {
                                            fill: "white", stroke: "#C0C0C8",
                                            "stroke-width": 1, states: {select: {fill: "#D0D0D8"}}
                                        }
                                    },
                                    scrollbar: {trackBorderColor: "#C0C0C8"},
                                    background2: "#E0E0E8"
                                };
                                a.setOptions(a.theme)
                            })(b)
                        });


                        Highcharts.chart('term_tubiao', {
                            credits: {
                                text: '',
                            },
                            chart: {
                                type: 'column'
                            },
                            title: {
                                text: ''
                            },
                            subtitle: {
                                text: ''
                            },
                            xAxis: {
                                type: 'category'
                            },
                            yAxis: {
                                title: {
                                    text: ''
                                }
                            },
                            legend: {
                                enabled: false
                            },
                            plotOptions: {
                                series: {
                                    borderWidth: 0,
                                    dataLabels: {
                                        enabled: true,
                                        format: '{point.y:.2f}%'
                                    }
                                }
                            },
                            tooltip: {
                                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> <br/>'
                            },
                            series: series,
                            drilldown: {
                                categories: categories
                            }
                        });
                    });
                    //获取表头
                    //var self = this;
                    //ajax_post(api_get_table_head, {semester_id: self.semester_id,grade_id:self.form.gradeId}, this);
//                    this.refresh_detail();
                },

            });
            vm.$watch('onReady', function () {
                vm.init();
            });
            vm.init_data();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });