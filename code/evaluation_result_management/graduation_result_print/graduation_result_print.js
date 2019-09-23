define(['jquery',
        C.CLF('avalon.js'),
        C.Co('evaluation_result_management', 'graduation_result_print/graduation_result_print', 'html!'),
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
                data:{rows:999, offset:0},
                is_init:false,
                pms_pool: {
                    "grade_id":37,
                    "class_id":"",
                    "rank":"",
                    "is_file":1,
                    "is_publish":1,
                    "stu_num":"",
                    "stu_name":"",
                    "offset":0,
                    "rows":99999,
                    "school_id":"",
                    "district_id":"",
                    "current_page": 0
                },
                header: [
                    {
                        "title": "序号",
                        "type": "index",
                        "from": "id"
                    }, {
                        "title": "姓名",
                        "type": "text",
                        "from": "stu_name"
                    }, {
                        "title": "学籍号",
                        "type": "text",
                        "from": "stu_num"
                    }, {
                        "title": "加分项",
                        "type": "text",
                        "from": "score_plus"
                    }, {
                        "title": "综合分值",
                        "type": "text",
                        "from": "zf"
                    }, {
                        "title": "综合评价",
                        "type": "text",
                        "from": "rank"
                    }
                ],
                pipe: [
                    {
                        "type": "query",
                        "url": "Indexmaintain/bybg_operation_by_count_result_view",
                        "pms": [
                            "grade_id@int", "class_id@null", "rank@null", "is_file@int", "is_publish@int", "stu_num@null",
                            "stu_name@null", "offset@int", "rows@int", "school_id@null", "district_id@null"
                        ],
                        "then": [
                            "index_value|split,",
                            "index_name|split,"
                        ],
                        "path": "data",
                        "save_as": "score"
                    }, {
                        "type": "update_head",
                        "from": "score.list.0.index_name",
                        "pos": 3,
                        "template": {
                            "title": ".",
                            "type": "ary",
                            "from": "index_value",
                            "index": "index"
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
                    var post_data_str = data_center.get_key('graduation_print_data');
                    var pms_pool = JSON.parse(post_data_str);
                    for(var key in this.pms_pool){
                        this.pms_pool[key] = pms_pool[key];
                    }
                    this.pms_pool.rank = pms_pool.rank;
                    this.is_init = true;
                },
                print:function () {
                    $('#print_content').print({
                        globalStyles:true
                    });
                },
                back:function () {
                  window.location = "#graduation_results"
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
            define: avalon_define,
            repaint:true,
        }
    });