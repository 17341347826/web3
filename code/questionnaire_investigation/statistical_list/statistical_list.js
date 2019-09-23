define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("questionnaire_investigation", "add_topic/add_topic", "css!"),
        C.Co('questionnaire_investigation', 'statistical_list/statistical_list', 'html!'),
        C.CMF("data_center.js"),
        C.CM("table"),
        C.CM("three_menu_module")
    ],
    function ($, avalon, layer, css1, html, data_center, table,three_menu_module) {
        //查询列表
        var api_find_papers_list = api.api + "ques_naire/page_end_questionnaire";

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
                // 请求参数
                extend: {
                    ques_name__icontains: '',
                    __hash__: ""
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
                        from: "<a title='统计'  class='tab-btn tab-statistics-btn' ms-on-click='@oncbopt({current:$idx, type:1})'>" +
                        "</a>"
                    }
                ],

                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        self.user_type = data.data.user_type;
                    });
                    self.is_init = true;
                },

                cbopt: function (params) {

                    if (params.type == 1) {
                        window.location.href = "#statistical_questionnaire?id="+params.data._id;
                    }
                },


                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {

                            default:
                                break;

                        }
                    } else {
                        toastr.error(msg);
                    }
                },

            });
            table.$watch("onReady", function () {
                $(".am-dimmer").css("display", "none");
                this.cb();
            });
            return table;
        };
        return {
            view: html,
            define: avalon_define,
            date_input: {startDate: "startTime", endDate: "endTime", type: 1}
        }
    });