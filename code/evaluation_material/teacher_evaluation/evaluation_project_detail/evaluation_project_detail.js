define([
        "jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("evaluation_material", "teacher_evaluation/evaluation_project_detail/evaluation_project_detail", "css!"),
        C.Co("evaluation_material", "teacher_evaluation/evaluation_project_detail/evaluation_project_detail", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js")
    ],
    function ($, avalon, layer, css,  html, x, data_center) {
        var get_pro_detail_api = api.api + "/Indexmaintain/find_evaluatepro_plansubject_list";

        var avalon_define = function (pxm) {
            var vm = avalon.define({
                $id: "teacher_add",
                detail_list: [],
                init: function () {
                    this.get_pro_detail();
                },
                get_pro_detail: function () {
                    ajax_post(get_pro_detail_api, {id: pxm.project_id,plan_level:pxm.plan_level}, this)
                },
                deal_detail_msg: function (data) {

                    if (!data.data || data.data == null || data.data.length == 0)
                        return;
                    var obj = {};
                    var detail_length = data.data.length;
                    for (var i = 0; i < detail_length; i++) {
                        if (data.data[i].school_type_id=='undefined') {
                            continue;
                        }
                        var key = data.data[i].school_type_id;

                        if (!obj[key]) {
                            obj[key] = {};
                        }
                        if (!obj[key].plan_name) {
                            obj[key].plan_name = data.data[i].plan_name;
                        }
                        if (!obj[key].subject_data) {
                            obj[key].subject_data = [];
                        }

                        if (data.data[i].sub_subject_data && data.data[i].sub_subject_data != '') {
                            var sub_subject_data = JSON.parse(data.data[i].sub_subject_data);
                            var index_obj = {};
                            var arr_option = sub_subject_data.arr_option;
                            var msg = '';
                            for (var j = 0; j < arr_option.length; j++) {
                                msg += arr_option[j].title + ',答案:' + arr_option[j].question + ',得分:' + arr_option[j].score + '     ';
                            }
                            index_obj.index_name = sub_subject_data.index_name;
                            index_obj.msg = msg;
                            obj[key].subject_data.push(index_obj);
                        }

                    }
                    for (var new_key in obj) {
                        this.detail_list.push(obj[new_key])
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case get_pro_detail_api:
                                this.deal_detail_msg(data);
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                }
            });
            vm.$watch('onReady', function () {
                this.init();

            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });