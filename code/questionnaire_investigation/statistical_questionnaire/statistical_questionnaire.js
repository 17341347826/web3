define(["jquery",
        C.CLF('avalon.js'),
        "layer",
        C.Co("questionnaire_investigation", "statistical_questionnaire/statistical_questionnaire", "css!"),
        C.Co("questionnaire_investigation", "statistical_questionnaire/statistical_questionnaire", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")

    ],
    function ($, avalon, layer, css, html, x, data_center,three_menu_module) {
        var statistical_api = api.api + "ques_naire/statis_answer";
        var avalon_define = function (par) {
            var vm = avalon.define({
                $id: "test",
                statistical_data:{},
                init: function () {
                    this.get_statistical_msg();
                },
                get_statistical_msg:function () {
                    ajax_post(statistical_api,{_id:par.id},this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case statistical_api:
                                if(data.data){
                                    this.statistical_data = data.data;
                                    var data_len = this.statistical_data.data.length;
                                    for(var i=0;i<data_len;i++){
                                        if(this.statistical_data.data[i].option&&
                                            this.statistical_data.data[i].option.length&&
                                            this.statistical_data.data[i].option.length>0){
                                            var arr = [];
                                            for(var j=this.statistical_data.data[i].option.length-1;j>-1;j--){
                                                arr.push(this.statistical_data.data[i].option[j]);
                                            }
                                            this.statistical_data.data[i].option =  arr;
                                        }
                                    }

                                }
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