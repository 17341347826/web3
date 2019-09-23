define(['jquery',
        C.CLF('avalon.js'),
        "layer",
        C.Co('eval_param_set', 'term_report_parameters/quota_weight_set/quota_weight_set', 'html!'),
        C.Co('eval_param_set', 'term_report_parameters/quota_weight_set/quota_weight_set', 'css!'),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CM("select_assembly")
    ],
    function ($, avalon, layer, html, css, x, data_center, three_menu_module, select_assembly) {

        var avalon_define = function () {
            //请求指标库指标
            var get_index_api = api.api + "Indexmaintain/indexmaintain_findByIndexName";
            //获取二级指标
            const sec_index_api = api.api + "Indexmaintain/indexmaintain_findSecondLevelIndex";
            //查看参数
            var rule_api = api.api + "score/get_statis_rule";
            //保存
            var save_api = api.api + "score/edit_statis_rule";
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
                quota_weight: [],

                default_data: {
                    "fk_grade_id": '',
                    "fk_unit_id": '',
                    "unit_lv": '',
                    "full_score": 0,
                    "index_ratio": [],
                    "main_ratio": [],
                    "score_lv": [],
                    "index_type": [1, 2],
                    "module": [1, 2, 3, 4, 5, 6, 7]
                },

                init: function () {
                    this.grade_list = cloud.grade_all_list();
                    this.rule_extend.fk_grade_id = parseInt(this.grade_list[0].value);
                    this.rule_extend.unit_lv = parseInt(cloud.user_level());
                    this.rule_extend.fk_unit_id = parseInt(cloud.user_depart_id());
                    this.get_first_index();
                },
                get_first_index: function () {
                    this.rank_state = 1;
                    ajax_post(get_index_api, {index_rank: 1}, this)
                },
                list_sec_index: function (arr) {
                    if (arr.length == 0) return;
                    ajax_post(sec_index_api, {
                        index_rank: 2,
                        index_parentid_list: arr
                    }, this)
                },

                get_rule: function () {
                    //需删除
                    // this.rule_extend.fk_grade_id = 37;
                    // this.rule_extend.fk_unit_id = 8;
                    // this.rule_extend.unit_lv = 2;
                    //---------
                    ajax_post(rule_api, this.rule_extend.$model, this)
                },
                grade_check: function (el, index) {
                    this.rule_extend.fk_grade_id = el.value;
                    this.get_first_index();
                },
                //指标库数据处理
                deal_rank: function (data) {
                    if (!data.data)
                        return;

                    //处理一级指标
                    var first_index_list = data.data;
                    var first_index_length = first_index_list.length;
                    this.index_ratio = [];
                    var parents_ids = [];
                    for (var i = 0; i < first_index_length; i++) {
                        var index_id = first_index_list[i].id;
                        var obj = {
                            for_id: index_id,
                            name: first_index_list[i].index_name,
                            ratio: 0,
                            second_index_ration: []
                        };
                        this.index_ratio.push(obj);
                        parents_ids.push(index_id)
                    }
                    this.list_sec_index(parents_ids)
                },
                //权重库数据处理
                level_msg: function (data) {
                    if (!data.data)
                        return;
                    var is_empty_obj = $.isEmptyObject(data.data);
                    if (is_empty_obj) {
                        this.default_data.fk_grade_id = this.rule_extend.fk_grade_id;
                        this.default_data.unit_lv = this.rule_extend.unit_lv;
                        this.default_data.fk_unit_id = this.rule_extend.fk_unit_id;
                        this.quota_weight = this.default_data;
                        return;
                    }
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
                        all_ratio += Number(this.index_ratio[i].ratio);
                    }
                    if (all_ratio != 100) {
                        layer.alert('一级指标权重之和必须为100', {
                            icon: 2,
                            skin: 'layer-ext-moon'
                        })
                        return;
                    }
                    this.quota_weight.index_ratio = this.index_ratio;
                    ajax_post(save_api, this.quota_weight.$model, this);
                },


                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case get_index_api:
                                this.deal_rank(data);
                                break;
                            case sec_index_api:
                                var sec_index_list = data.data;
                                var new_sec_index = [];
                                for (var i = 0, len = sec_index_list.length; i < len; i++) {
                                    var sec_obj = {
                                        for_id: sec_index_list[i].id,
                                        name: sec_index_list[i].index_name,
                                        ratio: 0
                                    }
                                    new_sec_index.push(sec_obj);
                                }
                                for (var i = 0, len = this.index_ratio.length; i < len; i++) {
                                    this.index_ratio[i].second_index_ration = []
                                    for (var j = 0, len2 = sec_index_list.length; j < len2; j++) {
                                        if(sec_index_list[j].index_parentid == this.index_ratio[i].for_id){
                                            this.index_ratio[i].second_index_ration.push(new_sec_index[j]);
                                        }
                                    }
                                }
                                this.get_rule();
                                break;
                            case rule_api:
                                this.level_msg(data);
                                break;
                            case save_api:
                                layer.alert('保存成功', {
                                    icon: 1,
                                    skin: 'layer-ext-moon'
                                });
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