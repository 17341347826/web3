/**
 * Created by Administrator on 2017/10/11.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("enrolment", "high_school_check/high_school_check", "css!"),
        C.Co("enrolment", "high_school_check/high_school_check", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM('three_menu_module')
    ],
    function (jquery, avalon, layer, css, html, router, data_center, three_menu_module) {
        var data_api = api.api+"GrowthRecordBag/statis_up_line";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "high_school_check",
                extend:{
                    dwdm:'',
                    dwid:''
                },
                data:[],
                init:function () {
                    var user = cloud.user_user();
                    this.extend.dwdm =  user.code;
                    this.extend.dwid = user.fk_school_id;
                    ajax_post(data_api,this.extend,this)
                },
                list:function (zypc) {
                  window.location = "#growth_stu_list?zypc="+zypc;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case data_api:
                                if(!data.data)
                                    return;
                                this.data = data.data;
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });
            vm.init();
            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    })