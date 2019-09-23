/**
 * Created by Administrator on 2018/6/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('promise', 'promise_detail/promise_detail','html!'),
        C.Co('promise', 'promise_detail/promise_detail','css!'),
        C.CMF("data_center.js"),"jquery_print",C.CLF('base64.js')
    ],
    function ($,avalon,layer, html,css, data_center,jquery_print,bs64) {
        var avalon_define = function (pmx) {
            var api_cn_nr = api.api + "GrowthRecordBag/goodFaithCommitment_query_by_level";
            var url_api_file = api.api + "file/get";
            var vm = avalon.define({
                $id: "promise_detail",
                is_print:false,
                cn_dw:"",
                cn_con:"",
                cn_sj:"",
                get_photos:'',
                data:{
                    syr_dj:"",
                    syr_lx:""
                },
                init:function () {
                    this.data.syr_dj = pmx.user_level;
                    this.data.syr_lx = pmx.user_type;
                    ajax_post(api_cn_nr,this.data,this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case api_cn_nr:
                                this.complete_cn_nr(data);
                                break;
                        }
                    } else {
                        toastr.warning(msg);
                    }
                },
                complete_cn_nr:function (data) {
                    this.cn_con = data.data[0].cxcnsj;
                    this.cn_dw = data.data[0].cjr_dw_mc;
                    this.cn_sj = time_2_str(data.data[0].cjsj);
                    var url = url_api_file + "?token=" + sessionStorage.getItem(
                            "token") +
                        "&img=" + pmx.img_address + "&encode=b64";
                    var html = ajax_get(url, {}, {on_request_complete:function (data) {
                        vm.get_photos = data;
                        vm.is_print = true;
                    }})


                },
                url_img:function(img_data) {
                    var token = sessionStorage.getItem("token");
                    return HTTP_X + "/api/file/get?token=" + token + "&img=" + img_data;
                },
                print: function () {
                    var url = "code/promise/promise_detail/promise_detail.css";
                    $("#promise_detail").print(url);
                }
            });
            vm.$watch('onReady', function(){
                vm.init();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });