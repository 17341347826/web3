define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("growth", "growthPublic/css/growth_table", "css!"),
        C.Co('questionnaire_investigation', 'answer_paper_list/answer_paper_list', 'css!'),
        C.Co('questionnaire_investigation', 'answer_paper_list/answer_paper_list', 'html!'),
        C.CMF("data_center.js"),
        C.CM("table"),
        C.CM("three_menu_module")

    ],
    function ($, avalon, layer, css1,css2, html, data_center, table,three_menu_module) {
        //查询列表
        var api_find_papers_list = api.api + "ques_naire/page_start_quest";
        // //删除卷子
        // var delete_ques_api = api.api+"ques_naire/delete_questionnaire";
        // //停止发布
        // var stop_release_api = api.api+"ques_naire/stop_questionnaire";
        //验证是否已答
        var is_existence_answer_api = api.api + "ques_naire/is_existence_answer";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "table",
                // 数据接口
                url: api_find_papers_list,
                is_init: false,
                data: {
                    offset: 0,
                    rows: 15
                },
                current_choose_id: '',
                // 请求参数
                extend: {
                    ques_name__icontains: '',
                    __hash__: "",
                    power: '',
                    gradeIds: []
                },
                // 表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                },
                    {
                        title: "问卷题目",
                        type: "text",
                        from: "ques_name"
                    },
                    {
                        title: "创建人",
                        type: "text",
                        from: "founder"
                    },
                    {
                        title: "创建单位",
                        type: "text",
                        from: "company_name"
                    },

                    {
                        title: "发布状态",
                        type: "cover_text",
                        from: "data_status",
                        dict: {
                            0: '未发布',
                            1: '已发布'
                        }
                    },
                    {
                        title: "状态",
                        type: "cover_text",
                        from: "status",
                        dict: {
                            0: '启用状态',
                            1: '禁用状态',
                            2: '删除状态'
                        }
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a title='答题'  class='am-btn am-btn-primary am-margin-right-xs' ms-on-click='@oncbopt({current:$idx, type:1})'>" +
                        "<span class='am-icon-paint-brush'></span>" +
                        "</a>"
                    }
                ],

                init: function () {
                    var self = this;
                    self.is_init = true;
                    data_center.uin(function (data) {
                        var arr = data.data.auth.split(',');
                        for (var i = 0; i < arr.length; i++) {
                            arr[i] = parseInt(arr[i]);
                        }
                        var obj = {
                            ques_name__icontains: '',
                            __hash__: "",
                            power: '',
                            gradeIds: []
                        }
                        obj.power = arr;
                        var user_info = data_center.get_key('user_info');
                        var user = JSON.parse(user_info.data.user);
                        if (user_info.data.user_type == 2) {
                            obj.gradeIds.push(user.fk_grade_id);
                        } else if (user_info.data.user_type == 1) {
                            var len = user.teach_class_list.length;
                            for (var j = 0; j < len; j++) {
                                obj.gradeIds.push(user.teach_class_list[j].grade_id);
                            }
                        } else if (user_info.data.user_type == 3) {
                            obj.gradeIds.push(user.student.fk_grade_id);
                        }
                        self.extend = obj;
                    });
                },

                cbopt: function (params) {
                    if (params.type == 1) {
                        this.current_choose_id = params.data._id;
                        ajax_post(is_existence_answer_api, {_id: params.data._id}, this);
                    }

                },
                // //停止发布
                // stop_release:function (id) {
                //     ajax_post(stop_release_api,{_id:id},this);
                // },

                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {

                            case is_existence_answer_api:
                                window.location.href = "#answer_page?id=" + this.current_choose_id
                                break;

                        }
                    } else {
                        if (cmd == is_existence_answer_api) {
                            toastr.error('此卷子已填写，不能再次填写');
                        } else {
                            toastr.error(msg);
                        }


                    }
                },

            });
            table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define,
        }
    });