/**
 * Created by Administrator on 2018/7/4.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("growth_incentive_card", "school_card_result/school_card_result", "css!"),
        C.Co("growth_incentive_card", "school_card_result/school_card_result", "html!"),
        "layer",
        C.CM("table"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function ($, avalon, css,html, layer, table, data_center, three_menu_module) {
        //年级
        var grade_list = api.api + "base/class/school_class.action";
        //结果查询列表
        var trademark_card_over = api.api + "everyday/page_count_gain_card";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "school_card_result",
                url: "",
                data: {},
                listData: {
                    offset: 0,
                    rows: 10
                },
                is_init: false,
                extend: "",
                thirdListExtend: {
                    code: "",
                    fk_grade_id: "",
                    fk_class_id: "",
                    name: "",
                    start_date: "",
                    end_date: "",
                    __hash__: ""
                },
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
                //结果查看
                trademark_card_over: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "学籍号",
                    type: "text",
                    from: "code"
                }, {
                    title: "姓名",
                    type: "text",
                    from: "name"
                }, {
                    title: "年级",
                    type: "text",
                    from: "grade_name"
                }, {
                    title: "班级",
                    type: "text",
                    from: "class_name"
                }, {
                    title: "获卡数量",
                    type: "text",
                    from: "count_number"
                }, {
                    title: "操作",
                    type: "html",
                    from: "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:5})' title='查看'></a>"
                }],
                //  列表按钮操作
                cbopt: function (params) {
                   if (params.type == 5) {
                        data_center.set_key("trademark_stu_card", params.data);
                       window.location = "#incentive_card_see_list";
                    }
                },
                //年级
                gradeChangeClass: function () {
                    var grade = this.grade_list;
                    var gradeId = this.extend.fk_grade_id;
                    if (gradeId != "") {
                        for (var i = 0; i < grade.length; i++) {
                            var id = grade[i].grade_id;
                            if (gradeId == id) {
                                this.class_list = grade[i].class_list;
                                this.extend.fk_class_id = "";
                            }
                        }
                    } else {
                        this.extend.fk_class_id = "";
                        this.class_list = [];
                        this.extend.__hash__ = new Date();
                    }
                },
                //学籍号
                codeExtend: function () {
                    this.extend.code = this.other.code;
                },
                //姓名
                nameExtend: function () {
                    this.extend.name = this.other.name;
                },
                //时间比对
                //开始时间
                getCompleteDate: function () {
                    var self = this;
                    var datepicker = $("#my-datepicker");
                    datepicker.on("change", function (event) {
                        if(self.other.end_time != '' && self.other.end_time < event.delegateTarget.defaultValue){
                            layer.alert('开始日期应小于结束日期！', {
                                closeBtn: 0
                                ,anim: 4 //动画类型
                            });
                            return;
                        }
                        self.other.start_time = event.delegateTarget.defaultValue;
                        self.extend.start_date = self.other.start_time;
                    });
                    datepicker.datepicker('open');
                    // var nowTemp = new Date();
                    // var nowDay = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0).valueOf();
                    // var nowMoth = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), 1, 0, 0, 0, 0).valueOf();
                    // var nowYear = new Date(nowTemp.getFullYear(), 0, 1, 0, 0, 0, 0).valueOf();
                    // $("#my-datepicker").datepicker({
                    //     onRender: function(date, viewMode) {
                    //         // 默认 days 视图，与当前日期比较
                    //         var viewDate = nowDay;
                    //
                    //         switch (viewMode) {
                    //             // moths 视图，与当前月份比较
                    //             case 1:
                    //                 viewDate = nowMoth;
                    //                 break;
                    //             // years 视图，与当前年份比较
                    //             case 2:
                    //                 viewDate = nowYear;
                    //                 break;
                    //         }
                    //
                    //         return date.valueOf() < viewDate ? 'am-disabled' : '';
                    //     }
                    // }).on("change", function (event) {
                    //     if(self.other.end_time != '' && self.other.end_time < event.delegateTarget.defaultValue){
                    //         layer.alert('开始日期应小于结束日期！', {
                    //             closeBtn: 0
                    //             ,anim: 4 //动画类型
                    //         });
                    //         return;
                    //     }
                    //     self.other.start_time = event.delegateTarget.defaultValue;
                    //     self.extend.start_date = self.other.start_time;
                    // });
                },
                //结束时间
                getCompleteDates: function () {
                    var self = this;
                    var datepicker = $("#my-datepickers");
                    datepicker.on("change", function (event) {
                        if(self.other.start_time != '' && self.other.start_time > event.delegateTarget.defaultValue){
                            layer.alert('结束日期应大于开始日期！', {
                                closeBtn: 0
                                ,anim: 4 //动画类型
                            });
                            return;
                        }
                        self.other.end_time = event.delegateTarget.defaultValue;
                        self.extend.end_date = self.other.end_time;
                    });
                    datepicker.datepicker('open');
                },
                init: function () {
                    this.cds();
                    this.thirdListExtend.fk_school_id = this.other.fk_school_id;
                    this.theadTh = this.trademark_card_over;
                    this.data = this.listData;
                    this.url = trademark_card_over;
                    this.extend = this.thirdListExtend;
                    this.is_init = true;
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        // if (userType == "0") {
                        //     var tUserData = JSON.parse(data.data["user"]);
                        //     self.other.fk_school_id = tUserData.fk_school_id;
                        //     ajax_post(grade_list, {school_id: tUserData.fk_school_id}, self);
                        // }
                        var tUserData = JSON.parse(data.data["user"]);
                        self.other.fk_school_id = tUserData.fk_school_id;
                        ajax_post(grade_list, {school_id: tUserData.fk_school_id}, self);
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case grade_list:
                                this.grade_list = data.data;
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
            define: avalon_define,
            date_input: {startDate: "my-datepicker",endDate: "my-datepickers",type: 2},
            // date_input: {startDate: "my-datepicker", type: 3},
        }
    });