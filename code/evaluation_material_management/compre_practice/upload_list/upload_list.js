/**
 * Created by uptang on 2017/9/4.
 */

define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co('evaluation_material_management', 'compre_practice/upload_list/upload_list', 'css!'),
        C.Co("evaluation_material_management", "compre_practice/upload_list/upload_list", "html!"),
        "layer",
        C.CM("table"),
        C.CMF("data_center.js"),
        C.CM('three_menu_module'),
        C.CMF("formatUtil.js"),
        C.CM("select_assembly")
    ],
    function ($, avalon, css, html, layer, table, data_center, three_menu_module, formatUtil, select_assembly) {
        //获取指标数据
        var share_index_api = api.api + "GrowthRecordBag/teacher_list_data";
        var avalon_define = function () {

            var vm = avalon.define({
                $id: "upload_list",
                url: share_index_api,
                index_state: "",
                data: {
                    offset: 0,
                    rows: 10
                },
                is_init: false,
                extend: {
                    fk_class_id: '',
                    shzt: 4,
                    fk_xq_id: '',
                    mk: 1,
                    xjh: '',
                    xsmc: '',
                    __hash__: ""
                },
                presentation: [{
                    name: '列表查看',
                    value: '2'
                }, {
                    name: '详情查看',
                    value: '1'
                }],
                // 列表表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "学校",
                    type: "text",
                    from: "xxmc"
                }, {
                    title: "年级",
                    type: "text",
                    from: "xqmc"
                }, {
                    title: "姓名",
                    type: "text",
                    from: "xsxm"
                }, {
                    title: "学籍号",
                    type: "html",
                    from: "<span>{{el.xjh | mtruncate(3,3)}}</span>"
                }, {
                    title: "活动主题",
                    type: "text",
                    from: "bt"
                }, {
                    title: "类型",
                    type: "text",
                    from: "lx"
                }, {
                    title: "操作",
                    type: "html",
                    from: "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='查看'></a>"
                }
                ],
                grade_list: [],
                class_list: [],
                semester_list: [],
                user_info: [],
                current_menu: '',
                default: {
                    grade_name: '',
                    class_name: '',
                    semester_name: ''
                },
                html_display: 2,
                cb: function () {
                    this.semester_list = cloud.semester_all_list();
                    var semester_obj = {
                        name: '全部',
                        value: ''
                    };
                    var upload_default = data_center.get_key('upload_default');
                    if(upload_default){
                        this.default = JSON.parse(upload_default);
                    }

                    this.semester_list.unshift(semester_obj);
                    this.current_menu = this.semester_list[1].value;
                    this.user_info = cloud.auto_grade_list();
                    if (this.user_info.length == 0) {
                        layer.alert('您无执教年级信息！');
                        return;
                    }
                    this.deal_grade_class(this.user_info);
                },
                sel_grade: function (el, index) {
                    var id = el.value;
                    this.default.grade_name = el.name;
                    for (var i = 0; i < this.user_info.length; i++) {
                        if (this.user_info[i].grade_id == id) {
                            this.get_class(this.user_info[i]);
                        }
                    }
                },
                sel_class: function (el, index) {
                    this.default.class_name = el.name;
                    this.extend.fk_class_id = el.value;
                    this.extend.__hash__ = new Date();
                },
                sel_semester: function (el, index) {
                    this.semester_name = el.name;
                    this.extend.fk_xq_id = el.value.split("|")[0];
                    this.extend.__hash__ = new Date();
                },
                deal_grade_class: function (user_info) {
                    this.grade_list = [];
                    for (var i = 0; i < user_info.length; i++) {
                        var obj = {
                            name: '',
                            value: ''
                        };
                        obj.name = user_info[i].grade_name;
                        obj.value = user_info[i].grade_id;
                        this.grade_list.push(obj)
                    }
                    this.get_class(user_info[0]);
                },
                init: function () {
                    var extend = data_center.get_key('upload_list_extend');
                    extend = JSON.parse(extend);
                    for (var key in extend) {
                        this.extend[key] = extend[key];
                    }
                    this.is_init = true;
                    this.extend.__hash__ = new Date();
                },
                get_class: function (grade) {
                    var class_list = grade.class_list;
                    var class_length = class_list.length;
                    this.class_list = [];
                    for (var i = 0; i < class_length; i++) {
                        var class_obj = {};
                        class_obj.name = class_list[i].class_name;
                        class_obj.value = class_list[i].class_id;
                        this.class_list.push(class_obj)
                    }
                    this.extend.fk_class_id = this.class_list[0].value;
                    this.extend.__hash__ = new Date();
                },
                presentation_change: function (el, index) {
                    if (this.html_display == 1) {
                        window.location = "#stu_upload_material"
                    }
                },
                menu_jump:function (value) {
                    var fk_semester = value.split('|');
                    this.extend.fk_xq_id = fk_semester[0];
                    this.current_menu = value;

                },
                cbopt: function (params) {
                    if (params.type == 2) {
                        var upload_simple_data = params.data;
                        data_center.set_key('upload_simple_data', JSON.stringify(upload_simple_data));
                        window.location = '#upload_simple_detail'
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case share_check_api:
                                toastr.success('审核成功');
                                this.extend.__hash__ = new Date();
                                break;

                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });
            vm.$watch('onReady', function () {
                vm.init();
            })
            vm.cb();

            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });