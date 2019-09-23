/**
 * Created by uptang on 2017/5/8.
 */
define([
        C.CLF('avalon.js'),
        C.CM("table"),
        C.CMF("data_center.js"),
        'layer'
    ],
    function(avalon, html, tab, nav, data_center, layer) {
        // 学生信息列表
        var make_col = function(col_name) {
            return tab.make_custom_column([
                [col_name],
                ["总人数", "班主任", "今日凳陆", "本周访问", "访问量"]
            ]);
        };
        var avalon_define = function() {
            var table = avalon.define({
                $id: "sys_stat_list",
                // 列表数据接口
                url: api.uesr + "user_stat/sys_used_cnt",
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                extend: {
                    /**
                     *
     district	区县	string	
	grade_id	年级id	number	
	level	统计等级	number	【必填】2-市州级；3-区县级；4-校级；5-班级
	school	学校名称	string	
                     */
                    district: "",
                    grade_id: "",
                    level: "",
                    school: ""
                },
                is_init: true,
                // 表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "user_id"
                }, {
                    title: "市州",
                    type: "text",
                    from: "course_type"
                }, {
                    title: "区县",
                    type: "text",
                    from: "course_name"
                }, {
                    title: "学校",
                    type: "text",
                    from: "start_date"
                }, {
                    title: "年级",
                    type: "text",
                    from: "end_date"
                }, {
                    title: make_col("教师"),
                    type: "html",
                    from: make_body_column([
                        [
                            "{{@el.tch_cnt}}",
                            "{{@el.tch_class_cnt}}",
                            "{{@el.tch_login}}",
                            "{{@el.tch_logins}}",
                            "{{@el.tch_visits}}",
                        ]
                    ])
                }, {
                    title: make_col("学生"),
                    type: "html",
                    from: make_body_column([
                        [
                            "{{@el.stu_cnt}}",
                            "{{@el.stu_login}}",
                            "{{@el.stu_logins}}",
                            "{{@el.stu_visits}}",
                        ]
                    ])
                }, {
                    title: make_col("家长"),
                    type: "html",
                    from: make_body_column([
                        [
                            "{{@el.par_cnt}}",
                            "{{@el.par_login}}",
                            "{{@el.par_logins}}",
                            "{{@el.par_visits}}",
                        ]
                    ])
                }],
                // 
                cbopt: function(params) {},
                init: function() {
                    data_center.uin(function(data) {
                        var cArr = [];
                        var tUserData = JSON.parse(data.data["user"]);
                        self.highest_level = data.data.highest_level;
                        //ajax_post(api_get_info, self.data, self);
                    });
                }
            });
            table.$watch("onReady", function() {});
            table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });