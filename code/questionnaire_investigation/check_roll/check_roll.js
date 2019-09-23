define(["jquery", C.CLF('avalon.js'), "layer",
        C.Co("questionnaire_investigation", "check_roll/check_roll", "css!"),
        C.Co("questionnaire_investigation", "check_roll/check_roll", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")

    ],
    function ($, avalon, layer, css, html, x, data_center,three_menu_module) {
        //获取卷子详情
        var get_questionnaire_api = api.api + "ques_naire/get_questionnaire";
        //往卷子中插入题，保存卷子
        var api_add_get_papers = api.api + "ques_naire/save_questionnaire";
        var avalon_define = function (par) {
            var vm = avalon.define({
                $id: "add_topic",
                simple_html: '',
                question_data: {},
                init: function () {
                    this.get_questionnaire();
                },
                get_questionnaire: function () {
                    if (par.id) {
                        ajax_post(get_questionnaire_api, {_id: par.id}, this);
                    }
                },
                finish_see:function () {
                    window.location.href = "#papers_list"
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case get_questionnaire_api:
                                this.question_data = data.data[0];
                                break;

                            default:
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