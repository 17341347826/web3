/**
 * Created by Administrator on 2017/10/11.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("user", "classUserControl/parentControl/parentControl", "html!"),
        C.Co("user", "classUserControl/parentControl/parentControl", "css!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CMF("table/table.js"),
        C.CM('three_menu_module'),
        C.CM("modal"),
        C.CM("select_assembly")
    ],
    function ($, avalon, layer, html, css, router, data_center, table, three_menu_module, modal, select_assembly) {
        //获取学生申请取消家长关联集合
        var api_stu_cancel = api.PCPlayer + "parent/class_stu_cancel_parent_map";
        //教师确认学生取消家长关联（通过）
        var api_teacher_cancel = api.PCPlayer + "parent/teacher_cancel";
        //教师否定学生取消家长关联（不通过）
        var api_cancel_not = api.PCPlayer + "parent/teacher_cancel_not";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "parentExamine",
                url: api_stu_cancel,
                data: {
                    offset: 0,
                    rows: 15
                },
                //家长id
                parent_id: '',
                //学生id
                stu_id: '',
                // 请求参数
                extend: {
                    //班级id
                    class_id: '',
                    __hash__: ""
                },
                is_init: true,
                only_hash: true,
                // 模态框
                modal: {
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: ""
                },
                grade_list: [],
                class_list: [],
                grade_index: 0,
                class_index: 0,
                //表头名称
                theadTh: [
                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    },
                    {
                        title: "学生姓名",
                        type: "text",
                        from: "student_name"
                    },
                    {
                        title: "学籍号",
                        type: "text",
                        from: "student_num"
                    },
                    {
                        title: "取消关联家长",
                        type: "text",
                        from: "parent_name"
                    },
                    {
                        title: "家长电话",
                        type: "text",
                        from: "parent_phone"
                    },
                    {
                        title: "取消原因",
                        type: "text",
                        from: "cancel_msg"
                    },
                    {
                        title: "审核意见",
                        type: "html",
                        from: "<a class='tab-btn tab-pass-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='通过'></a>" +
                        "<a class='tab-btn tab-pass-no-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='不通过'></a>"
                    }
                ],
                //列表按钮操作
                cbopt: function (params) {
                    //班主任同意
                    if (params.type == "1") {
                        var self = this;
                        self.stu_id = params.data.stu_id;
                        self.parent_id = params.data.parent_id;
                        layer.open({
                            title: "提示",
                            content: '是否同意取消家长关联？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                ajax_post(api_teacher_cancel, {
                                    parent_id: self.parent_id,
                                    stu_id: self.stu_id
                                }, self, self);
                                layer.close(index);
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });

                    }
                    //班主任不同意
                    else if (params.type == "2") {
                        var self = this;
                        self.stu_id = params.data.stu_id;
                        self.parent_id = params.data.parent_id;
                        layer.open({
                            title: "提示",
                            content: "<input type='text' id='apply_cancel' placeholder='请说明不同意原因'/>",
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                ajax_post(api_cancel_not, {
                                    parent_id: self.parent_id,
                                    stu_id: self.stu_id,
                                    check_msg: $("#apply_cancel").val()
                                }, self);
                                layer.close(index);
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    switch (cmd) {
                        //同意
                        case api_teacher_cancel:
                            this.extend.__hash__ = new Date();
                            break;
                        // 不同意
                        case api_cancel_not:
                            this.extend.__hash__ = new Date();
                            break;
                    }
                },
                //获取class_id
                cds: function () {
                    var grade_class_list = cloud.auto_grade_list({});
                    this.get_grade_class(grade_class_list);
                    this.only_hash = false;
                    this.extend.__hash__ = new Date();
                },
                get_grade_class: function (grade_class_list) {
                    this.grade_list = any_2_select(grade_class_list, {name: "grade_name", value: ["grade_id"]});
                    var class_list = grade_class_list[this.grade_index].class_list;
                    this.class_list = any_2_select(class_list, {name: "class_name", value: ["class_id"]});
                    this.extend.class_id = this.class_list[this.class_index].value;
                },
                grade_change: function (el, index) {
                    var class_list = this.grade_list[index].class_list;
                    this.class_list = any_2_select(class_list, {name: "class_name", value: ["class_id"]});
                    this.extend.class_id = this.class_list[this.class_index].value;
                },
                class_change: function (el, index) {
                    this.extend.class_id = this.class_list[index].value;
                }
            });
            vm.cds();
            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    })
