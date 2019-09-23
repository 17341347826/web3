/**
 * Created by uptang on 2017/5/8.
 */
define([
        C.CLF('avalon.js'),
        C.Co("enrolment", "growth_stu_list/growth_stu_list", "css!"),
        C.Co("enrolment", "growth_stu_list/growth_stu_list", "html!"),
        C.CM("table"),
        C.CMF("data_center.js"),
        C.CM('three_menu_module'),
        "PCAS",
        "select2",
        C.CM("select_assembly")
    ],
    function (avalon, css, html, tab, data_center, three_menu_module, PCAS, select2, select_assembly) {
        // 学生信息列表
        var api_student_list = api.api + "GrowthRecordBag/page_stu_by_volunteer";
        //获取学校列表
        var get_school_list_api = api.api + "GrowthRecordBag/school_group_student";
        var all = {
            name: '全部',
            value: ''
        }
        var avalon_define = function (par) {
            var vm = avalon.define({
                $id: "growth_stu_list",
                // 列表数据接口
                url: api_student_list,
                is_init: false,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                // 列表表头名称
                theadTh: [

                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    },
                    {
                        title: "姓名",
                        type: "text",
                        from: "xsxm"
                    },
                    {
                        title: "学籍号",
                        type: "text",
                        from: "xjh"
                    },
                    {
                        title: "区县",
                        type: "text",
                        from: "qxmc"
                    },
                    {
                        title: "学校",
                        type: "text",
                        from: "xxmc"
                    },
                    {
                        title: "年级",
                        type: "text",
                        from: "njmc"
                    },
                    {
                        title: "班级",
                        type: "text",
                        from: "bjmc"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='查看成长档案'></a>" +
                        "<a class='tab-btn tab-detail-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='查看毕业评价档案'></a>"
                    }
                ],

                //区县列表-学校列表-年级列表-班级列表
                area_list: [],
                school_list: [],
                grade_list: [],
                class_list: [],
                //志愿批次
                batch_arr: [],
                extend: {
                    //搜索的姓名
                    xsxm: '',
                    //搜索的批次
                    zypc: '',
                    //区县名称
                    qxmc: '',
                    //学籍号
                    xjh: '',
                    //志愿单位学校id
                    dwid: '',
                    //志愿单位代码
                    dwdm: '',
                    //班级id
                    fk_bj_id: '',
                    //年级id
                    fk_nj_id: '',
                    //学校id,
                    fk_xx_id: '',
                    __hash__: ""
                },

                //  列表按钮操作
                cbopt: function (params) {
                    var stu = params.data;
                    var stu_info = cloud.user_info({guid: stu.fk_xs_id});
                    var extend_data = {};
                    extend_data.class_id = stu_info.fk_class_id;
                    extend_data.grade_id = stu_info.fk_grade_id;
                    extend_data.guid = stu_info.guid;
                    extend_data.school_id = stu_info.fk_school_id;
                    extend_data.token = sessionStorage.getItem('token');
                    extend_data.tar_year = Number(stu_info.grade_name.substr(1, 4));
                    if (params.type == 1) {
                        //查看成长档案
                        data_center.set_key('grow_export_data',JSON.stringify(extend_data));
                        window.location='#file_details?guid='+stu_info.guid;
                        return
                    }
                    if (params.type == 2) {
                        //查看毕业档案
                        var param = {
                            class_id: stu_info.fk_class_id,
                            grade_id: stu_info.fk_grade_id,
                            stu_num: stu_info.code,
                            school_id:stu_info.fk_school_id
                        };

                        cloud.get_bybg_count_result_list(param, function (url, args, data) {
                            if (data == null || data.list.length == 0) {
                                toastr.warning("该学生还未生成毕业评价数据!")
                            } else {
                                data_center.set_key('g_export_data',JSON.stringify(extend_data))
                                window.location = '#graduation_file';
                            }
                        });
                    }

                },
                get_school_list: function () {
                    ajax_post(get_school_list_api, {
                        dwdm: this.extend.dwdm,
                        dwid: this.extend.dwid,
                        qxmc: this.extend.qxmc,
                        zypc: this.extend.zypc
                    }, this)
                },

                init: function () {
                    var user = cloud.user_user();
                    this.extend.dwdm = user.code;
                    this.extend.dwid = user.fk_school_id;

                    var area_list = cloud.heigh_school_area({dwdm: user.code, dwid: user.fk_school_id, zypc: '21'});

                    area_list = any_2_select(area_list, {name: "qxmc", value: ["qxmc"]})
                    area_list.unshift(all);
                    this.area_list = area_list;

                    var grade_list = cloud.grade_list();
                    this.grade_list = [];
                    for (var i = 0; i < grade_list.length; i++) {
                        var remark = grade_list[i].remark;
                        if (remark == '九年级') {
                            var obj = {
                                name: grade_list[i].grade_name,
                                value: grade_list[i].grade_id
                            }
                            this.grade_list.push(obj);
                            this.extend.fk_nj_id = grade_list[i].grade_id;
                            break;
                        }
                    }

                    //志愿批次
                    var batch_arr = [
                        {name: '全部', value: ''},
                        {name: '单报民办志愿', value: '11'},
                        {name: '跨区县志愿', value: '12'},
                        {name: '艺体特长生志愿', value: '13'},
                        {name: '定向切块志愿', value: '21'},
                        {name: '划线志愿', value: '22'},
                        {name: '兼报志愿', value: '23'},
                        {name: '第一志愿', value: '31'},
                        {name: '第二志愿', value: '32'},
                        {name: '第三志愿', value: '33'},
                        {name: '公办兼报民办志愿', value: '4'},
                    ]
                    for (var i = 0; i < batch_arr.length; i++) {
                        if (batch_arr[i].value == par.zypc) {
                            this.batch_arr.push(batch_arr[i]);
                            break;
                        }
                    }
                    this.extend.zypc = par.zypc;
                    this.get_school_list();
                    this.is_init = true;
                    this.extend.__hash__ = new Date();

                },
                //区县改变
                area_change: function (el, index) {
                    if (el.value == '') {
                        this.extend.qxmc = el.value;
                    } else {
                        this.extend.qxmc = el.name;
                    }
                    this.get_school_list();
                },
                //班级改变
                class_change: function (el, index) {
                    this.extend.fk_bj_id = el.value;
                },
                //志愿批次改变
                batch_change: function (el, index) {
                    this.extend.zypc = el.value;
                },
                //初始化school-select2控件
                init_widget: function () {
                    $(".js-example-basic-single").select2();
                    //学校改变
                    $("#school_select").select2({
                        language: {
                            noResults: function (params) {
                                return "未找到结果";
                            }
                        }
                    })
                    $("#school_select").on("change", function (e) {
                        vm.is_show = false;
                        vm.extend.fk_xx_id = $("#school_select").val();
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case get_school_list_api:
                                this.school_list = data.data;
                                break;
                        }
                        return;
                    }
                    toastr.error(msg)

                }

            });
            vm.$watch('onReady', function () {
                vm.init_widget();
            })
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });