define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_supervision', 'upload-democratic/upload-democratic', 'html!'),
        C.Co('evaluation_supervision', 'upload-active/upload', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        C.CM("three_menu_module"),
        C.CMF("formatUtil.js")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, three_menu_module, formatUtil) {

        var avalon_define = function () {
            const data_api = api.api + "GrowthRecordBag/mzpj_input_progress";
            //手动刷新接口
            const refresh_api = api.api+"GrowthRecordBag/manual_refresh_progress";
            const USER_LEVEL = {
                //市级用户
                CITY: 2,
                //区县用户
                AREA: 3,
                //校级用户
                SCHOOL: 4
            }
            let user_info;
            let Screen = undefined;
            //校级用户年级列表
            let school_grade_list = [];
            var vm = avalon.define({
                $id: "upload-democratic",
                select_init: true,
                //学年学期列表
                semester_list: [],
                //年级列表
                grade_list: [],
                //区县列表
                area_list: [],
                params: {
                    //班级id
                    fk_bj_id: null,
                    //年级id
                    fk_nj_id: null,
                    //学期id
                    fk_xq_id: null,
                    //学校id
                    fk_xx_id: null,
                    //区县名称
                    qxmc: null,
                    //市名称
                    szmc: null,
                    //用户等级
                    user_level:null
                },
                //学校名称
                school_name: '',
                //用户等级
                user_level: '',
                data: [],
                count: count,
                default_area: '',
                data_school: [],
                data_class: [],

                school_grade_list: [],
                //班级下拉列表
                class_list: [],
                //班级列表选择的年级id
                class_grade_id: '',
                //班级列表选择的班级id
                class_class_id: '',
                /**
                 * 数据初始化
                 */

                init: function () {
                    var semester = get_first_select(this.select_init, this.semester_list).value;
                    this.params.fk_xq_id = Number(semester.split('|')[0])
                    this.list_data()
                },

                init_data: function () {
                    user_info = cloud.user_user();
                    this.semester_list = cloud.semester_all_list();
                    this.grade_list = this.init_select(cloud.grade_all_list());
                    this.user_level = cloud.user_level();
                    this.params.user_level = this.user_level;
                    this.params.szmc = user_info.city;
                    if (this.user_level == USER_LEVEL.CITY) {
                        this.area_list = this.init_select(cloud.sel_area_list());
                        this.default_area = this.area_list[1].name
                    }
                    //如果用户等级小于市级用户（区 校）,获取区县名称
                    if (this.user_level > USER_LEVEL.CITY) {
                        this.params.qxmc = user_info.district;
                    }
                    //如果是校级用户
                    if (this.user_level > USER_LEVEL.AREA) {
                        this.params.fk_xx_id = user_info.fk_school_id;
                        school_grade_list = cloud.grade_list();
                        this.grade_list = this.init_select(any_2_select(school_grade_list, {
                            name: 'grade_name',
                            value: ['grade_id']
                        }));
                    }

                },

                /**
                 * 下拉列表中第一个选项置为全部
                 * @returns {*}
                 */
                init_select: function (arr) {
                    var obj = {
                        name: '全部',
                        value: ''
                    }
                    arr.unshift(obj);
                    return arr;
                },
                /**
                 * 学年学期下拉列表改变
                 */
                semester_change: function (val) {
                    this.params.fk_xq_id = Number(val.value.split('|')[0])
                    this.list_data()
                },
                /**
                 * 年级下拉列表改变
                 */
                grade_change: function (val) {
                    if (val.value == '') val.value = null;
                    this.params.fk_nj_id = val.value;
                    if (val.value == null) {
                        this.list_data()
                        return
                    }
                    this.deal_result()
                },
                /**
                 * 校级用户年级下拉列表改变
                 */
                class_grade_change: function (val) {
                    const grade_id = val.value;
                    var class_list = [];
                    this.class_class_id = '';
                    this.class_grade_id = grade_id;
                    for (var i = 0, len = school_grade_list.length; i < len; i++) {
                        if (grade_id == school_grade_list[i].grade_id) {
                            class_list = school_grade_list[i].class_list;
                            break
                        }
                    }
                    this.class_list = [];
                    if (class_list.length > 0) {
                        this.class_list = this.init_select(any_2_select(class_list, {
                            name: 'class_name',
                            value: ['class_id']
                        }))
                    }
                    this.get_class_data()
                },
                /**
                 * 切换班级
                 */
                class_change: function (val) {
                    this.class_class_id = val.value;
                    this.get_class_data();
                },
                deal_result: function () {
                    if (this.user_level == USER_LEVEL.CITY) {
                        const city_cnt = vm.filter_city(vm.data.city_cnt)
                        if (is_empty(city_cnt)) return
                        this.draw_circle('tubiao_1', city_cnt)
                    }
                    if (this.user_level < USER_LEVEL.SCHOOL) {
                        this.draw_bar();
                    }
                    setTimeout(function () {
                        if (vm.default_area == '') vm.default_area = '全部'
                        vm.school_data_deal(vm.default_area)
                    }, 30)
                    if (this.user_level > USER_LEVEL.AREA) {
                        this.get_class_data();
                    }
                },
                get_class_data: function () {
                    this.data_class = vm.filter_class(this.data.class_cnt);
                    draw_class_bar(echarts, vm.filter_class(this.data.class_cnt), 'wcl')
                },
                area_change: function (val) {
                    if (val.name == '全部') {
                        this.params.qxmc = null
                        this.draw_bar()
                        return
                    }
                    this.params.qxmc = val.name;
                    this.draw_bar()
                },
                area_change2: function (val) {
                    this.school_name = '';
                    this.default_area = val.name;
                    this.school_data_deal(this.default_area);
                },
                school_change: function () {
                    this.school_data_deal(this.default_area);
                },
                list_data: function () {
                    ajax_post(data_api, this.params.$model, this)
                },
                filter_city: make_filter(function (line) {
                    if (vm.params.fk_nj_id == line.fk_nj_id || !vm.params.fk_nj_id) return true;
                    return false;
                }),
                filter_area: make_filter(function (line) {
                    if ((vm.params.qxmc == line.qxmc || !vm.params.qxmc) &&
                        (vm.params.fk_nj_id == line.fk_nj_id || !vm.params.fk_nj_id)) return true;
                    return false;
                }),
                filter_school: make_filter(function (line) {
                    if ((vm.default_area == line.qxmc || vm.default_area == '全部') &&
                        (vm.params.fk_nj_id == line.fk_nj_id || !vm.params.fk_nj_id) &&
                        (!vm.params.fk_xx_id || vm.params.fk_xx_id == line.fk_xx_id) &&
                        (vm.school_name == '' || line.xxmc.indexOf(vm.school_name) >= 0)) return true;
                    return false;
                }),
                filter_class: make_filter(function (line) {
                    if ((line.fk_nj_id == vm.class_grade_id || vm.class_grade_id == '') &&
                        (line.fk_bj_id == vm.class_class_id || vm.class_class_id == '')) return true;
                    return false;
                }),
                /**
                 * 画圆形涂
                 */
                draw_circle: function (id, data) {
                    setTimeout(function () {
                        draw_circle(echarts, id, data, 'wcl')
                    }, 10)
                },
                /**
                 * 区县画柱状图
                 */
                draw_bar: function () {
                    setTimeout(function () {
                        const district_cnt = vm.filter_area(vm.data.district_cnt)
                        if (is_empty(district_cnt)) return
                        const data_for_bar = bar_data(district_cnt, 'area', 'wcl');
                        set_image_wrap_height('tubiao_2',data_for_bar.series_arr.length,data_for_bar.yAxis_arr.length)
                        bar_for_progress('tubiao_2', echarts, data_for_bar.series_arr, data_for_bar.yAxis_arr, data_for_bar.legend_arr);
                    }, 20)
                },
                /**
                 * 学校画柱状图
                 * @param area
                 */
                school_data_deal: function (area) {
                    layer.load(1, {shade: [0.3, '#121212']});
                    Screen.filter_data(area, function (new_cnt) {
                        vm.data_school = JSON.parse(JSON.stringify(vm.filter_school(new_cnt)));
                        layer.closeAll()
                        if (is_empty(vm.data_school)) return
                        if (vm.user_level == USER_LEVEL.SCHOOL) {
                            const wrap = document.getElementById('tubiao_3')
                            wrap.style.height = '200px';
                            vm.draw_circle('tubiao_3', vm.data_school)
                            return
                        }
                        const data_for_bar = bar_data(vm.data_school, 'school', 'wcl');
                        set_image_wrap_height('tubiao_3',data_for_bar.series_arr.length,data_for_bar.yAxis_arr.length)
                        bar_for_progress('tubiao_3', echarts, data_for_bar.series_arr, data_for_bar.yAxis_arr, data_for_bar.legend_arr);
                    })
                },
                /**
                 * 手动刷新
                 */
                handle_refresh: function () {
                    if(time_request()){
                        layer.msg('已刷新，正在计算，请稍候查看')
                        return
                    }
                    const params = get_refresh_params(this.semester_list,this.params.fk_xq_id)
                    ajax_post(refresh_api, params, this)
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (status == 200) {
                        switch (cmd) {
                            case data_api:
                                if (!data || !data.data) return;
                                this.data = data.data;
                                var school_obj = {
                                    bjmc: "-",
                                    bjrs: '-',
                                    bp_wcl: '-',
                                    bp_wp: '-',
                                    bp_yp: '-',
                                    bzrmc: "",
                                    fk_bj_id: "",
                                    fk_nj_id: "",
                                    fk_xx_id: "",
                                    hp_wcl: '-',
                                    hp_wp: '-',
                                    hp_yp: '-',
                                    njmc: "",
                                    qxmc: "",
                                    szmc: "",
                                    wcl: '-',
                                    xxmc: "",
                                    zp_wcl: '-',
                                    zp_wp: '-',
                                    zp_yp: '-',
                                    xgsj:'-'
                                }
                                var school_data = merge_school(this.data.school_cnt, this.grade_list, school_obj)
                                Screen.all_data = school_data
                                this.deal_result()
                                break;
                            case refresh_api:
                                layer.msg('数据统计中,请稍后刷新页面查看')
                                break;
                        }
                        return
                    }
                    layer.msg(msg)

                }

            });
            vm.$watch('onReady', function () {
                require(['/Growth/code/evaluation_supervision/ISupport.js',
                    '/Growth/code/evaluation_supervision/e_s_public.js'], function () {
                    Screen = new deal_school_data()
                    vm.init()
                })
            });
            vm.init_data()
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });