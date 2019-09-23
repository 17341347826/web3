define(['jquery',
        C.CLF('avalon.js'),
        "layer",
        C.Co('eval_param_set', 'term_report_parameters/main_weight/main_weight', 'html!'),
        C.Co('eval_param_set', 'term_report_parameters/main_weight/main_weight', 'css!'),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CM("select_assembly")
    ],
    function ($, avalon, layer, html, css, x, data_center, three_menu_module, select_assembly) {

        avalon.filters.to_number = function (data) {
            return Number(data);
        };
        //权重前面名称变化
        avalon.filters.nameChange = function(str){
            if(str == '互评'){
                return '组评';
            }else if(str == '教师评'){
                return '班评';
            }else{
                return str;
            }
        };
        var avalon_define = function () {
            //查看参数
            var rule_api = api.api + "score/get_statis_rule";
            //保存
            var save_api = api.api + "score/edit_statis_rule";
            var vm = avalon.define({
                $id: "main_weight",
                //如果page_state状态为1，为查看状态，如果为2，为修改状态
                page_state: 1,
                //年级下拉列表
                grade_list: [],
                rule_extend: {
                    fk_grade_id: '',
                    fk_unit_id: '',
                    unit_lv: ''
                },
                default_data: {
                    "fk_grade_id": '',
                    "fk_unit_id": '',
                    "unit_lv": '',
                    "full_score": 0,
                    "index_ratio": [],
                    "main_ratio": [
                        {
                            "main_part": 1,
                            "name": "自评",
                            "ratio": 0
                        },
                        {
                            "main_part": 2,
                            "name": "互评",
                            "ratio": 0
                        },
                        {
                            "main_part": 3,
                            "name": "教师评",
                            "ratio": 0
                        }
                    ],
                    "score_lv": [],
                    "index_type": [1, 2],
                    "module": [1, 2, 3, 4, 5, 6, 7]
                },


                main_weight: [],
                init: function () {
                    this.grade_list = cloud.grade_all_list();
                    this.rule_extend.fk_grade_id = parseInt(this.grade_list[0].value);
                    this.rule_extend.unit_lv = parseInt(cloud.user_level());
                    this.rule_extend.fk_unit_id = parseInt(cloud.user_depart_id());
                    this.get_rule();
                },
                get_rule: function () {
                    //需删除
                    // this.rule_extend.fk_grade_id = 1;
                    // this.rule_extend.fk_unit_id = 2;
                    // this.rule_extend.unit_lv = 2;
                    //---------
                    ajax_post(rule_api, this.rule_extend.$model, this)
                },
                level_msg: function (data) {
                    if (!data.data)
                        return;
                    var is_empty_obj = $.isEmptyObject(data.data);
                    if (is_empty_obj) {
                        this.default_data.fk_grade_id = this.rule_extend.fk_grade_id;
                        this.default_data.unit_lv = this.rule_extend.unit_lv;
                        this.default_data.fk_unit_id = this.rule_extend.fk_unit_id;
                        this.main_weight = this.default_data;
                        return;
                    }
                    this.main_weight = data.data;
                    if (this.main_weight.main_ratio.length == 0) {
                        this.main_weight.main_ratio = this.default_data.main_ratio;
                    }
                },
                //切换年级
                grade_check: function (el, index) {
                    this.rule_extend.fk_grade_id = el.value;
                    this.get_rule();
                },
                //保存
                save: function () {

                    var main_ratio = this.main_weight.main_ratio;
                    var all_ratio = 0;
                    for (var i = 0; i < main_ratio.length; i++) {
                        all_ratio += Number(main_ratio[i].ratio);
                    }
                    if (all_ratio != 100) {
                        toastr.warning('总权重必须为100%');
                        return;
                    }
                    this.page_state = 1;
                    ajax_post(save_api, this.main_weight.$model, this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case rule_api:
                                this.level_msg(data);
                                break;
                            case save_api:
                                toastr.success('修改成功');
                                break;
                            default:
                                break;

                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });