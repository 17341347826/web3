/**
 * Created by Administrator on 2018/5/24.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('practice_management', 'teacher_list/teacher_list', 'html!'),
        C.Co('practice_management', 'teacher_list/teacher_list', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),
        C.CM("table")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, three_menu_module,table) {
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "teacher_list",
                url_img: url_img,
                semester_list:[],
                dataInfo:[],
                index_list:[
                    //记录类型 1作品2品德3成就4实践5艺术活动6研究型学习7身心健康8日常表现
                    {name:"思想品德",value:2},
                    {name:"学业水平",value:6},
                    {name:"身心健康",value:7},
                    {name:"艺术素养",value:5},
                    {name:"社会实践",value:4}
                ],
                data:{
                    offset:0,
                    rows:9999,
                    fk_xq_id:"",
                    jllx:""//1作品2品德3成就4实践5艺术活动6研究型学习7身心健康8日常表现

                },
                init:function () {
                    var semester_list = cloud.semester_list();
                    this.semester_list = any_2_select(semester_list, {name: "semester_name", value: ["id"]});
                    this.ajax_check();

                },
                //学期切换
                semester_change:function (el) {
                    this.data.fk_xq_id = Number(el.value);
                    this.ajax_check();
                },
                //维度切换
                index_change:function (el) {
                    this.data.jllx = el.value;
                    this.ajax_check();
                },
                ajax_check:function () {
                    cloud.my_te_list(this.data.$model,function (url, ars, data) {
                        vm.dataInfo = data;
                    })
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {

                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                //报名
                current_bj:99999,
                show_jj:function ($idx) {
                    this.current_bj = $idx;
                },
                hide_jj:function ($idx) {
                    this.current_bj = 99999;
                },
                json:function (x) {
                    return JSON.parse(x);
                },
                click_btn:function (el) {
                    sessionStorage.setItem("te_pro",JSON.stringify(el));
                    window.location = "#teacher_list_com";
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
