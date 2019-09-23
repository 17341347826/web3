/**
 * Created by Administrator on 2018/1/25.
 */
define(['jquery',
        C.CLF("avalon.js"),
        C.Co("weixin_xy", "xy_home/xy_home", "css!"),
        C.Co("weixin_xy", "projec_query/projec_query", "html!"),
        C.CMF("data_center.js")
    ],
    function ($, avalon, css, html, data_center) {

        var avalon_define = function () {
            //获取考试等级
            var get_exam_rank_api = api.xy + "front/exam_getExamRank";
            //获取考试学年学期
            var get_exam_semester_api = api.xy + "front/exam_getExamSemester";
            //获取项目列表
            var project_list_api = api.xy + "front/exam_listExamByWhere";
            var vm = avalon.define({
                $id: "xy_home",
                //当前选择的考试等级
                rank_level: '',
                //考试等级列表
                rank_list: [],
                //学年学期列表
                semester_list: [],
                //当前选择的学年学期
                current_semester: '',
                //获取项目列表需要的数据
                post_data: {
                    begin_time: '',
                    exam_level: '',
                    exam_name: '',
                    page_number: '1',
                    page_size: '',
                    semester_id: ''
                },
                //项目列表数据
                project_list: [],

                init: function () {
                    this.get_exam_rank();
                    this.get_semesters();
                },
                //获取考试等级
                get_exam_rank: function () {
                    ajax_post(get_exam_rank_api, {}, this)
                },

                //获取学年学期列表
                get_semesters: function () {
                    ajax_post(get_exam_semester_api, {rank_level: this.rank_level}, this)
                },
                //处理学年学期等级
                deal_rank: function (data) {
                    if (!data.data)
                        return;
                    this.rank_list = data.data;
                },
                //处理学年学期
                deal_semester: function (data) {
                    if (!data.data)
                        return;
                    this.semester_list = data.data;
                    if(this.semester_list.length>0){
                        this.current_semester = this.semester_list[0].semester_id;
                    }else {
                        this.current_semester = '';
                    }
                    this.get_project();
                },
                //获取项目列表
                get_project: function () {
                    $.showLoading();
                    this.post_data.exam_level = this.rank_level.toString();
                    this.post_data.semester_id = this.current_semester.toString();
                    ajax_post(project_list_api, this.post_data.$model, this)
                },
                //处理项目列表数据
                deal_project_list: function (data) {
                    if (!data.data)
                        return;
                    this.project_list = data.data.list;
                },
                //成绩分析
                grade_analysis: function (el) {
                    var project = el;
                    var project_obj = {};
                    project_obj.name = project.examName;
                    project_obj.exam_id = project.id;
                    project_obj.rank = project.examRank;
                    window.location = "#grade_analysis?project=" + JSON.stringify(project_obj);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case get_exam_rank_api:
                                this.deal_rank(data);
                                break;
                            case get_exam_semester_api:
                                this.deal_semester(data);
                                break;
                            case project_list_api:
                                this.deal_project_list(data);
                                break;
                        }
                    } else {
                        $.alert(msg);
                    }
                    if (cmd == project_list_api) {
                        $.hideLoading();
                    }

                }

            });
            require(["jquery_weui"], function (j) {
                vm.init();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });