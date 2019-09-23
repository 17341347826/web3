define(["jquery", C.CLF('avalon.js'), "layer",
        C.Co("questionnaire_investigation", "check_roll/check_roll", "css!"),
        C.Co("questionnaire_investigation", "answer_page/answer_page", "css!"),
        C.Co("questionnaire_investigation", "answer_page/answer_page", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js")

    ],
    function ($, avalon, layer, css, css2, html, x, data_center) {
        //获取卷子详情
        var get_questionnaire_api = api.api + "ques_naire/get_questionnaire";
        //往卷子中插入题，保存卷子
        var api_save = api.api + "/ques_naire/save_answer";

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
                //交卷
                finish_ans: function () {
                    // console.log(this.question_data);
                    var len = this.question_data.questio_list.length;
                    for (var i = 0; i < len; i++) {
                        this.question_data.questio_list[i].q_index = i + 1;
                        var question_type = this.question_data.questio_list[i].question_type;
                        if (question_type == '单选题' || question_type == '多选题') {
                            var index_len = 0;
                            for (var j = 0; j < this.question_data.questio_list[i].data.length; j++) {
                                var is_checked = this.question_data.questio_list[i].data[j].is_checked;
                                if (is_checked) {
                                    break;
                                } else {
                                    index_len++;
                                }
                            }
                            if (this.question_data.questio_list[i].must&&index_len == this.question_data.questio_list[i].data.length) {
                                toastr.warning("有必答题未填写");
                                return;
                            }
                        }
                        if (question_type == '单项填空题' || question_type == '多项填空题') {
                            for(var k=0;k<this.question_data.questio_list[i].data.length; k++){
                                if(this.question_data.questio_list[i].must&&this.question_data.questio_list[i].data[k].answer==''){
                                    toastr.warning("有必答题未填写");
                                    return;
                                }
                            }
                        }
                    }
                    ajax_post(api_save,{ques:this.question_data.$model},this);


                    // window.location.href = "#papers_list"
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case get_questionnaire_api:
                                this.question_data = data.data[0];
                                break;
                            case api_save:
                                window.location.href = "#answer_paper_list"
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