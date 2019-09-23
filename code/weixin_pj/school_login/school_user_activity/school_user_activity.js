/**
 * Created by Administrator on 2018/9/12.
 */
define(['jquery',
        C.CLF("avalon.js"),
        C.Co("weixin_pj", "school_login/school_user_activity/school_user_activity", "css!"),
        C.Co("weixin_pj", "school_login/school_user_activity/school_user_activity", "html!"),
        C.CMF("data_center.js"),'echarts', "highcharts", C.CM("use_state_module"),
        'jquery-weui','swiper', C.CMF("formatUtil.js")
    ],
    function ($, avalon, css, html, data_center, echarts,highcharts,use_state_module,weui,swiper,formatUtil) {
                var avalon_define = function () {

                    var vm = avalon.define({
                        $id: "school_user_activity",
                        is_init_sel: true,
                        orderList: [],
                        area_list: [],
                        semester_list: [],
                        grade_list: [],
                        count: count,
                        current_grade: "",
                        current_area: "",
                        // 校级查看
                        current_school: "",
                        current_school_dist: "",

                        //校级数据
                        data_school: [],
                        //班级数据
                        data_class: [],
                        //用户等级
                        user_level: '',
                        //当前年级id
                        grade_id: '',
                        filter_city: make_filter(function (line) {
                            if (line.grade == vm.current_grade || vm.current_grade == "")
                                return true;
                            return false;
                        }),
                        filter_area: make_filter(function (line) {
                            if (
                                (line.grade == vm.current_grade || vm.current_grade == "") &&
                                (line.district == vm.current_area || vm.current_area == "")
                            ) {
                                return true;
                            }
                            return false;
                        }),
                        filter_school: make_filter(function (line) {
                            if (
                                (line.grade == vm.current_grade || vm.current_grade == "") &&
                                (line.district == vm.current_school_dist || vm.current_school_dist == "") &&
                                (line.school.indexOf(vm.current_school) >= 0)
                            ) {
                                return true;
                            }
                            return false;
                        }),
                        init: function () {
                            this.semester_list = cloud.semester_all_list();
                            this.grade_list = cloud.grade_all_list();
                            this.grade_id = this.grade_list[0].value;
                            this.user_level = cloud.user_level();
                        },
                        filter: function (el, data) {
                            if (data == "")
                                return true;
                            if (el.grade == data) return true;
                            return false;
                        },
                        cb: function () {
                            var self = this;
                            cloud.school_yfhy_process({}, function (url, args, data) {
                                sort_by(data.list, ["+grade"]);
                                self.data_school = data;
                            });
                            this.get_class_data();
                        },
                        get_class_data: function () {
                            var self = this;
                            $.showLoading();
                            cloud.class_yfhy_process({grade_id: Number(this.grade_id)}, function (url, args, data) {
                                sort_by(data.list, ["+grade","+class_name"]);
                                $.hideLoading();
                                self.data_class = data;
                                if (data.list.length == 0)
                                    return;
                                self.set_class_img_height(self.data_class.list, 'tubiao_3');
                                // self.active_bar('tubiao_3', self.data_class);
                            })
                        },
                        set_class_img_height:function (data,div_id) {
                            var height = data.length*40*3+40+'px';
                            var tubiao = document.getElementById(div_id);
                            // tubiao.style.height = height;
                        },
                        //年级筛选下拉选择获取的数据
                        grade_check: function () {
                            this.get_class_data();
                        }
                    });
                    vm.$watch('onReady', function () {
                        require(['/Growth/code/evaluation_supervision/e_s_public.js'], function () {
                            vm.cb();
                        })
                    });
                    vm.init();
                    return vm;
                };
                return {
                    view: html,
                    define: avalon_define
                }
            });
