/**
 * Created by Administrator on 2018/5/24.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('character_evaluation_result/parameter_setting', 'content_set/content_set', 'html!'),
        C.Co('character_evaluation_result/parameter_setting', 'content_set/content_set', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, three_menu_module) {
        var avalon_define = function () {
            //查看参数
            var rule_api = api.api + "score/get_statis_rule_feature";
            //保存
            var save_api = api.api + "score/edit_statis_rule_feature";
            var vm = avalon.define({
                $id: "content_set",
                page: 1,
                default_data: {
                    "fk_grade_id": '',
                    "fk_unit_id": '',
                    "full_score": 0,
                    "index_ratio": [],
                    "index_type": [2],
                    "lv_partition": [],
                    "lv_type": '',
                    "main_ratio": [],
                    "module": [],
                    "unit_lv": 4
                },
                index_type: [2],
                module: [],
                default_value:'',
                init: function () {
                    this.grade_arr = cloud.grade_all_list();

                    this.default_data.fk_grade_id = this.grade_arr[0].value.toString();
                    if(data_center.get_key('now_grade_id')){
                        this.default_data.fk_grade_id = data_center.get_key('now_grade_id').toString();
                        for (var i = 0; i < this.grade_arr.length; i++) {
                            if (this.grade_arr[i].value == this.default_data.fk_grade_id) {
                                this.default_value = this.grade_arr[i].name;
                                break;
                            }
                        }
                    }
                    if(this.default_value==''){
                        this.default_value = this.grade_arr[0].name;
                    }
                    this.default_data.fk_unit_id = cloud.user_depart_id().toString();
                    this.get_data();
                },
                change_page:function (page) {
                    data_center.set_key('now_grade_id',this.default_data.fk_grade_id)
                    window.location = "#"+page;
                },
                grade_change: function (el, index) {
                    this.default_data.fk_grade_id = el.value.toString();
                    this.get_data();
                },
                save: function () {
                    this.default_data.index_type = this.index_type.sort();
                    if(this.module.length==0){
                        toastr.info('请选择评价任务')
                        return;
                    }
                    this.default_data.module = this.module.sort();
                    ajax_post(save_api,this.default_data,this)
                },
                deal_data: function (data) {
                    this.index_type = [2];
                    this.module = [];
                    if ($.isEmptyObject(data.data))
                        return;
                    if (data.data.index_type && data.data.index_type.length > 0) {
                        this.index_type = data.data.index_type;
                        if(this.index_type.indexOf(1)==-1){
                            data_center.set_key('index_type',2);
                        }else {
                            data_center.set_key('index_type','');
                        }
                    }
                    if (data.data.module && data.data.module.length > 0) {
                        this.module = data.data.module;
                    }
                },
                get_data: function () {
                    ajax_post(rule_api, {fk_grade_id: this.default_data.fk_grade_id}, this)
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case rule_api:
                                this.deal_data(data);
                                break;
                            case save_api:
                                console.dir(data);
                                toastr.success('保存成功')
                                this.get_data();
                                break;

                        }
                    } else {
                        toastr.error(msg)
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
