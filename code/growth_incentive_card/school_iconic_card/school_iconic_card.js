/**
 * Created by Administrator on 2018/7/4.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("growth_incentive_card", "school_iconic_card/school_iconic_card", "css!"),
        C.Co("growth_incentive_card", "school_iconic_card/school_iconic_card", "html!"),
        "layer",
        C.CM("table"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CM("select_kinds"),
    ],
    function ($, avalon, css,html, layer, table, data_center, three_menu_module,select_kinds) {
        //年级
        var grade_list = api.api + "base/class/school_class.action";
        //标志卡列表
        var trademark_card_list = api.api + "everyday/page_mark_card";
        //标志卡启停用
        var trademark_card_switch = api.api + "everyday/switch_mark_card";
        //标志卡删除
        var trademark_card_delete = api.api + "everyday/delete_mark_card";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "school_iconic_card",
                url: "",
                data: {},
                listData: {
                    offset: 0,
                    rows: 10
                },
                is_init: false,
                extend: "",
                secondListExtend: {
                    card_name: "",
                    cycle_type: "",
                    fk_grade_id: "",
                    //最大发卡数	number
                    max_number:'',
                    status: "",
                    user_type: "",
                    __hash__: ""
                },
                //周期列表
                week_list:[
                    {name:'每天',value:'1'},
                    {name:'每周',value:'2'},
                    {name:'每月',value:'3'},
                    {name:'每学期',value:'4'},
                    ],
                //发卡主体
                hairpin_list:[
                    {name:'教师',value:'1'}
                ],
                //使用状态
                type_list:[
                    {name:'停用',value:'0'},
                    {name:'启用',value:'1'}
                ],
                // 列表表头名称
                theadTh: [],
                //年级
                grade_list: [],
                class_list: [],
                other: {
                    grade: "",
                    code: "",
                    name: "",
                    card_name: "",
                    start_time: "",
                    end_time: "",
                    fk_school_id: "",
                    fk_grade_id: ""
                },
                //标志卡
                trademark_card_th: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "年级",
                    type: "text",
                    from: "grade_name"
                }, {
                    title: "卡名称",
                    type: "text",
                    from: "card_name"
                }, {
                    title: "发卡主体",
                    type: "cover_text",
                    from: "user_type",
                    dict: {
                        1: '教师'
                    }
                }, {
                    title: "周期",
                    type: "cover_text",
                    from: "cycle_type",
                    dict: {
                        1: '每天',
                        2: '每周',
                        3: '每月',
                        4: '每学期'
                    }
                }, {
                    title: "最大获卡量",
                    type: "text",
                    from: "max_number"
                }, {
                    title: "状态",
                    type: "cover_text",
                    from: "status",
                    dict: {
                        0: '停用',
                        1: '启用'
                    }
                },
                    {
                        title: "使用状态",
                        type: "html",
                        from: "<a class='tab-toggle-on-btn tab-btn' ms-if='el.status==1' ms-on-click='@oncbopt({current:$idx, type:2})'></a>" +
                        "<a class='tab-toggle-off-btn tab-btn' ms-if='el.status==0' ms-on-click='@oncbopt({current:$idx, type:1})'></a>"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a :if='el.index_state !=2' class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:3})' title='编辑'></a>" +
                        "<a class='tab-btn tab-trash-btn' :if='el.status != 1' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>"
                    }
                ],
                //新增
                secondAdd: function () {
                    window.location = "#trademark_card_edit";
                    data_center.set_key("trademark_card_add", 1);
                    data_center.set_key("trademark_card", "");
                },
                //卡片名称模糊查询
                cardNameChange: function () {
                    this.extend.card_name = this.other.card_name;
                },
                //年级改变
                gradeChange:function(el){
                    this.extend.fk_grade_id = el.grade_id;
                },
                //周期改变
                weekChange:function(el){
                    this.extend.cycle_type = el.value;
                },
                //发卡主体改变
                hairpinChange:function(el){
                    this.extend.user_type = el.value;
                },
                //使用状态改变
                typeChange:function(el){
                    this.extend.status = el.value;
                },
                //  列表按钮操作
                cbopt: function (params) {
                    if (params.type == 1) {
                        var self = this;
                        layer.open({
                            title: "提示",
                            content: '是否启用该标志卡？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                ajax_post(trademark_card_switch, {id: params.data.id, status: 1}, self);
                                layer.close(index);
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    } else if (params.type == 2) {
                        var self = this;
                        layer.open({
                            title: "提示",
                            content: '是否停用该标志卡？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                ajax_post(trademark_card_switch, {id: params.data.id, status: 0}, self);
                                layer.close(index);
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    } else if (params.type == 4) {
                        var self = this;
                        layer.open({
                            title: "提示",
                            content: '是否删除该标志卡？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                ajax_post(trademark_card_delete, {id: params.data.id}, self);
                                layer.close(index);
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    } else if (params.type == 3) {
                        console.log(params);
                        var self = this;
                        layer.open({
                            title: "提示",
                            content: '是否修改该标志卡？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                layer.close(index);
                                data_center.set_key("trademark_card", params);
                                data_center.set_key("trademark_card_add", 2);
                                window.location = "#trademark_card_edit"
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    }
                },
                //初始化
                init: function () {
                    this.cds();
                    //表头
                    this.theadTh = this.trademark_card_th;
                    this.data = this.listData;
                    this.url = trademark_card_list;
                    this.extend = this.secondListExtend;
                    this.is_init = true;
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        if (userType == "0") {//校管理员
                            var tUserData = JSON.parse(data.data["user"]);
                            self.other.fk_school_id = tUserData.fk_school_id;
                            //年级
                            ajax_post(grade_list, {school_id: tUserData.fk_school_id}, self);
                        }
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //年级
                            case grade_list:
                                this.grade_list = data.data;
                                break;
                            //    标志卡启停用
                            case trademark_card_switch:
                                toastr.error('使用状态修改成功');
                                this.extend.__hash__ = new Date();
                                break;
                            //    删除
                            case trademark_card_delete:
                                toastr.error('删除成功');
                                this.extend.__hash__ = new Date();
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });
            table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });