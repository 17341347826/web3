define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_supervision', 'review_progress_school/review_progress_school', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("use_state_module"),
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, use_state_module, three_menu_module) {

        var avalon_define = function () {
            var review_api = api.api + "GrowthRecordBag/audit_reconsider_progress_school";
            var vm = avalon.define({
                $id: "review_progress_school",
                //当前学期
                cur_semester: '',
                //当前学期id
                semester_id: '',
                //学期开始时间
                semester_start_date: '',
                //当前年级id
                cur_grade_id: '',
                //当前学校id
                school_id: '',
                //上传材料
                sccl_list: [],
                //各班级审核进度
                gbj_list: [],
                //申诉复议数据
                ssfy_list: [],
                init: function () {
                    this.semester_list = cloud.semester_all_list();
                    this.cur_semester = this.semester_list[0].value;
                    this.get_semester();
                    var grade_list = cloud.auto_grade_list();
                    this.grade_list = any_2_select(grade_list, {name: "grade_name", value: ["grade_id"]});
                    this.cur_grade_id = this.grade_list[0].value;
                    this.school_id = cloud.user_school_id();
                    this.get_review();
                },
                get_semester: function () {
                    var semester_arr = this.cur_semester.split('|');
                    this.semester_id = semester_arr[0];
                    this.semester_start_date = time_2_str(semester_arr[1]);
                },
                get_review: function () {
                    ajax_post(review_api, {
                        fk_grade_id: this.cur_grade_id,
                        fk_school_id: this.school_id,
                        fk_semester_id: this.semester_id,
                        semester_start_date: this.semester_start_date
                    }, this)
                },
                semester_change: function (el, index) {
                    this.cur_semester = el.value;
                    this.get_semester();
                    this.get_review();
                },
                grade_change: function (el, index) {
                    this.cur_grade_id = el.value;
                    this.get_review();
                },
                review_data: function (data) {
                    if (!data.data)
                        return;
                    this.sccl_list = data.data.sccl_list;


                    this.ssfy_list = data.data.ssfy_list;
                    sort_by(this.sccl_list, ["+njmc"]);
                    sort_by(this.ssfy_list, ["+njmc"]);
                    this.gbj_list = data.data.gbj_list;
                    sort_by(this.gbj_list, ["+bjmc"]);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case review_api:
                                this.review_data(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                }
            });

            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
