define(['jquery',
        C.CLF('avalon.js'),
        "layer",
        C.Co('character_evaluation_result/parameter_setting', 'weight/weight', 'html!'),
        C.Co('character_evaluation_result/parameter_setting', 'weight/weight', 'css!'),
        C.Co('character_evaluation_result/parameter_setting', 'content_set/content_set', 'css!'),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CM("select_assembly")
    ],
    function ($, avalon, layer, html, css, css2, x, data_center, three_menu_module, select_assembly) {

        var avalon_define = function () {
            //请求指标库指标
            var get_index_api = api.api + "Indexmaintain/indexmaintain_findByIndexName";
            //查看参数
            var rule_api = api.api + "score/get_statis_rule_feature";
            //保存
            var save_api = api.api + "score/edit_statis_rule_feature";
            var index_count = 0;
            var vm = avalon.define({
                $id: "quota",
                //如果page_state状态为1，为查看状态，如果为2，为修改状态
                page_state: 1,
                grade_list: [],
                rule_extend: {
                    fk_grade_id: '',
                    fk_unit_id: '',
                    unit_lv: ''
                },
                rank_state: 1,
                //指标存放(来自指标库)
                index_ratio: [],
                //指标存放（来自权重库）
                quota_weight: {},
                main_ratio: [
                    {
                        "main_part": 1,
                        "name": '自评',
                        "ratio": 0
                    },
                    {
                        "main_part": 2,
                        "name": '互评',
                        "ratio": 0
                    },
                    {
                        "main_part": 3,
                        "name": '教师评',
                        "ratio": 0
                    }
                ],
                default_data: {
                    "fk_grade_id": '',
                    "fk_unit_id": '',
                    "full_score": 0,
                    "index_ratio": [],
                    "index_type": [],
                    "lv_partition": [],
                    "lv_type": '',
                    "main_ratio": [],
                    "module": [],
                    "unit_lv": ''
                },
                default_value: '',
                index_type: 2,
                change_page: function (page) {
                    data_center.set_key('now_grade_id', this.rule_extend.fk_grade_id)
                    window.location = "#" + page;
                },

                init: function () {
                    this.grade_list = cloud.grade_all_list();
                    this.rule_extend.fk_grade_id = parseInt(this.grade_list[0].value).toString();
                    if (data_center.get_key('now_grade_id')) {
                        this.rule_extend.fk_grade_id = data_center.get_key('now_grade_id').toString();
                        for (var i = 0; i < this.grade_list.length; i++) {
                            if (this.grade_list[i].value == this.rule_extend.fk_grade_id) {
                                this.default_value = this.grade_list[i].name;
                            }
                        }
                    }
                    if (this.default_value == '') {
                        this.default_value = this.grade_list[0].name;
                    }
                    this.rule_extend.unit_lv = parseInt(cloud.user_level());
                    this.rule_extend.fk_unit_id = parseInt(cloud.user_depart_id());
                    var index_type = data_center.get_key('index_type');
                    if (index_type || index_type == '') {
                        this.index_type = index_type;
                    }

                    this.get_first_index();
                },
                get_first_index: function () {
                    this.rank_state = 1;
                    layer.load(1, {shade:[0.3,'#121212']});
                    ajax_post(get_index_api, {
                        index_type: this.index_type,
                        query_type: 1,
                        index_rank: 3
                    }, this)
                },
                get_sec_index: function (id) {

                    this.rank_state = 2;
                    layer.load(1, {shade:[0.3,'#121212']});
                    ajax_post(get_index_api, {
                        index_type: this.index_type,
                        index_rank: 2,
                        index_parentid: id,
                        query_type: ''
                    }, this)
                },
                get_rule: function () {
                    //需删除

                    //---------
                    ajax_post(rule_api, this.rule_extend.$model, this)
                },
                grade_check: function (el, index) {
                    this.rule_extend.fk_grade_id = el.value.toString();
                    this.get_first_index();
                },
                //指标库数据处理
                deal_rank: function (data) {
                    if (!data.data)
                        return;
                    // //处理一级指标
                    var first_index_list = data.data;
                    var first_index_length = first_index_list.length;
                    this.index_ratio = [];
                    for (var i = 0; i < first_index_length; i++) {
                        var index_id = first_index_list[i].index_parentid;
                        var obj = {
                            for_id: index_id,
                            name: first_index_list[i].index_parent,
                            ratio: 0,
                            second_index_ration: []
                        };
                        for (var j = 0; j < first_index_length; j++) {
                            if (first_index_list[j].index_parentid == index_id) {
                                var sec_obj = {
                                    for_id: first_index_list[j].index_secondaryid,
                                    name: first_index_list[j].index_secondary,
                                    ratio: 0
                                }
                                obj.second_index_ration.push(sec_obj);
                            }
                        }
                        if (JSON.stringify(this.index_ratio).indexOf(JSON.stringify(obj)) == -1) {
                            this.index_ratio.push(obj);
                        }
                    }
                    this.get_rule();
                },
                //权重库数据处理
                level_msg: function (data) {
                    if (!data.data)
                        return;
                    var is_empty_obj = $.isEmptyObject(data.data);
                    this.main_ratio = [
                        {
                            "main_part": 1,
                            "name": '自评',
                            "ratio": 0
                        },
                        {
                            "main_part": 2,
                            "name": '互评',
                            "ratio": 0
                        },
                        {
                            "main_part": 3,
                            "name": '教师评',
                            "ratio": 0
                        }
                    ]
                    if (is_empty_obj) {
                        this.default_data.fk_grade_id = this.rule_extend.fk_grade_id.toString();
                        this.default_data.unit_lv = this.rule_extend.unit_lv;
                        this.default_data.fk_unit_id = this.rule_extend.fk_unit_id;

                        this.quota_weight = this.default_data;
                        return;
                    }
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.quota_weight = data.data;
                    var quota_weight = data.data.index_ratio;
                    var quota_length = quota_weight.length;
                    var index_ratio_length = this.index_ratio.length;
                    for (var i = 0; i < quota_length; i++) {
                        var first_index_id = quota_weight[i].for_id;
                        for (var j = 0; j < index_ratio_length; j++) {
                            if (this.index_ratio[j].for_id == first_index_id) {
                                var quota_sec_index = quota_weight[i].second_index_ration;
                                var ratio_sec_index = this.index_ratio[j].second_index_ration;
                                this.index_ratio[j].ratio = this.double_deal(quota_sec_index, ratio_sec_index, j);
                                break;
                            }
                        }
                    }
                    if (data.data.main_ratio && data.data.main_ratio.length > 0) {
                        this.main_ratio = data.data.main_ratio;
                    }
                    layer.closeAll();
                },
                double_deal: function (quota_sec_list, ratio_sec_list, j) {
                    var quota_sec_length = quota_sec_list.length;
                    var ratio_sec_length = ratio_sec_list.length;
                    var sec_ratio = 0;
                    for (var m = 0; m < quota_sec_length; m++) {
                        var for_id = quota_sec_list[m].for_id;
                        for (var n = 0; n < ratio_sec_length; n++) {
                            if (for_id == ratio_sec_list[n].for_id) {
                                this.index_ratio[j].second_index_ration[n].name = quota_sec_list[m].name;
                                this.index_ratio[j].second_index_ration[n].ratio = quota_sec_list[m].ratio;
                                sec_ratio += ratio_sec_list[n].ratio;
                                break;
                            }
                        }
                    }
                    return sec_ratio;
                },
                //输入权重时，进行计算
                calculation: function () {
                    var index_ratio_length = this.index_ratio.length;
                    for (var i = 0; i < index_ratio_length; i++) {
                        var second_index_ration = this.index_ratio[i].second_index_ration;
                        var second_index_ration_length = second_index_ration.length;
                        var count = 0;
                        for (var j = 0; j < second_index_ration_length; j++) {
                            count += Number(second_index_ration[j].ratio);
                        }
                        this.index_ratio[i].ratio = count;
                    }
                },
                //保存
                save: function () {
                    var index_ratio_length = this.index_ratio.length;
                    var all_ratio = 0;
                    for (var i = 0; i < index_ratio_length; i++) {
                        var sec_length = this.index_ratio[i].second_index_ration.length
                        for (var j = 0; j < sec_length; j++) {
                            var sec_ratio = this.index_ratio[i].second_index_ration[j].ratio;
                            if ($.trim(sec_ratio) == '')
                                this.index_ratio[i].second_index_ration[j].ratio = 0;
                        }
                        if (this.index_ratio[i].ratio < 0 || this.index_ratio[i].ratio > 100) {
                            toastr.warning('权重必须在0-100之间')
                            return
                        }

                        all_ratio += Number(this.index_ratio[i].ratio);
                    }
                    var main_all_ratio = 0;
                    for (var k = 0; k < this.main_ratio.length; k++) {
                        if (this.main_ratio[k].ratio < 0 || this.main_ratio[k].ratio > 100) {
                            toastr.warning('权重必须在0-100之间')
                            return;
                        }
                        var main_ratio_ratio = this.main_ratio[k].ratio;
                        if ($.trim(main_ratio_ratio) == '')
                            this.main_ratio[k].ratio = 0;
                        main_all_ratio += this.main_ratio[k].ratio;
                    }
                    if (main_all_ratio != 100) {
                        toastr.warning('评价指标权重之和必须为100，目前是：' + main_all_ratio)
                        return;
                    }
                    if (all_ratio != 100) {
                        toastr.warning('一级指标权重之和必须为100，目前是：' + all_ratio);
                        return;
                    }
                    this.quota_weight.index_ratio = this.index_ratio;
                    this.quota_weight.main_ratio = this.main_ratio;
                    ajax_post(save_api, this.quota_weight.$model, this);
                },


                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case get_index_api:
                                this.deal_rank(data);
                                break;
                            case rule_api:
                                this.level_msg(data);
                                break;
                            case save_api:
                                toastr.success('保存成功')
                                this.page_state = 1;
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                    if (cmd == get_index_api) {
                        layer.closeAll();
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