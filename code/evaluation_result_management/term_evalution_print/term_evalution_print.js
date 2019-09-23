define(['jquery',
        C.CLF('avalon.js'),
        C.Co('evaluation_result_management', 'term_evalution_print/term_evalution_print', 'html!'),
        C.Co('evaluation_result_management', 'term_evalution_print/term_evalution_print', 'css!'),
        C.CMF("data_center.js"),
        C.CM('three_menu_module'),
        C.CM("agent_table"),
        'jquery_print'
    ],
    function ($, avalon, html, css, data_center, three_menu_module, agent_table,jquery_print) {

        var avalon_define = function (args) {
            var vm = avalon.define({
                $id: "term_evalution_print",
                data:{rows:15, offset:0},
                pms_pool:{
                    "city": "成都市",
                    "district": "",
                    "fk_bj_id": "",
                    "fk_nj_id": 37,
                    "fk_xx_id": "",
                    "fk_xq_id": 7,
                    "classId": "", "gradeId": 37, "schoolId": "", "semesterId": 7, "gradeName": "", "state": 5, "rows": 15,
                    "current_page": 0,
                    "offset": 0, "districtId": "",
                    'dfdj':'',
                },
                header: [
                    {
                        "title": "序号",
                        "type": "index",
                        "from": "id"
                    }, {
                        "title": "姓名",
                        "type": "text",
                        "from": "studentName"
                    }, {
                        "title": "学籍号",
                        "type": "text",
                        "from": "studentNum"
                    },
                    {
                        "title": "加分项",
                        "type": "text",
                        "from": "score_plus"
                    }, {
                        "title": "综合分值",
                        "type": "text",
                        "from": "scoreValue"
                    }, {
                        "title": "综合评价",
                        "type": "text",
                        "from": "gradeName"
                    }
                ],
                pipe: [
                    {
                        "type": "query",
                        "url": "Indexmaintain/get_yjzb_title",
                        "pms": [
                            "city@null", "district@null", "fk_bj_id@null", "fk_nj_id@int", "fk_xx_id@null", "fk_xq_id@int", "rows@int", "offset@int"
                        ],

                        "path": "data",
                        "save_as": "index"
                    }, {
                        "type": "query",
                        "url": "Indexmaintain/page_semester_result",
                        "pms": [
                            "classId@null", "gradeId@int", "schoolId@null", "semesterId@int", "dfdj@null", "state@int", "rows@int",
                            "districtId@null", "offset@int",""
                        ],
                        "then": [
                            "percentileOne|split,"
                        ],
                        "path": "data",
                        "save_as": "score"
                    }, {
                        "type": "update_head",
                        "from": "index",
                        "pos": 3,
                        "template": {
                            "title": "signName1",
                            "type": "ary",
                            "from": "percentileOne",
                            "index":"index"
                        }
                    }, {
                        "type": "out",
                        "out": [
                            {
                                "src": "score.list",
                                "as": "body"
                            },
                            {
                                "src": "score.count",
                                "as": "count"
                            },
                            {
                                "src": "pms_pool.current_page",
                                "as": "current_page"
                            },
                            {
                                "src": "pms_pool.rows",
                                "as": "rows"
                            }
                        ]
                    }
                ],

                init: function () {
                    var post_data_str = data_center.get_key('term_print_data');
                    var pms_pool = JSON.parse(post_data_str);
                    for(var key in this.pms_pool){
                        this.pms_pool[key] = pms_pool[key]
                    }
                    this.pms_pool.schoolId = pms_pool.school_id;
                },
                print:function () {
                    $('#print_content').print({
                        globalStyles:true
                    });
                },
                back:function () {
                    window.location = "#term_evaluation_results"
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            default:
                                break;
                        }
                    }

                }

            });

            vm.init()
            return vm;
        }


        return {
            view: html,
            define: avalon_define
        }
    });