/**
 * Created by Administrator on 2018/5/24.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('practice_management', 'my_list/my_list', 'html!'),
        C.Co('practice_management', 'my_list/my_list', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),
        C.CM("table")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, three_menu_module,table) {
        //获取
        var url_api_file=api.api+"file/get";
        //查询列表
        var api_check_list = api.api + "GrowthRecordBag/page_activity_manage";
        //报名
        var api_bm = api.api + "GrowthRecordBag/enroll_hd";
        //满意度调查
        var api_man_yi = api.api + "GrowthRecordBag/dc_myd";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "my_list",
                url_img: url_img,
                semester_list:[],
                dataInfo:[],
                current_time:"",
                index_list:[
                    //记录类型 1作品2品德3成就4实践5艺术活动6研究型学习7身心健康8日常表现
                    {name:"思想品德",value:2},
                    {name:"学业水平",value:6},
                    {name:"身心健康",value:7},
                    {name:"艺术素养",value:5},
                    {name:"社会实践",value:4}
                ],
                man_yi:{
                    fk_hd_id:"",
                    sf_my:"",//是否满意1不满意2满意
                    sf_qd:""//是否期待1不期待2期待
                },
                data:{
                    offset:0,
                    rows:9999,
                    bt:"",
                    fk_nj_id:"",
                    fk_xq_id:"",
                    zt:'',//状态 0未发布1已发布2已结束,传空代表查询已发布和已结束的
                    is_enroll:"",//是否报名 0未报名 1已报名
                    is_sc:"",//是否上传 0未上传 1已上传
                    jllx:""

                },
                init:function () {
                    var grade_id = Number(cloud.user_grade_id());
                    var semester_list = cloud.grade_semester_list({grade_id:grade_id});
                    this.semester_list = any_2_select(semester_list, {name: "semester_name", value: ["id"]});
                    this.data.fk_nj_id = grade_id;
                    var current_time = cloud.get_current_time();
                    this.current_time = current_time.current_time;
                    this.ajax_check();

                },
                //学期切换
                semester_change:function (el) {
                    this.data.fk_xq_id = Number(el.value);
                    // this.ajax_check();
                },
                //维度切换
                index_change:function (el) {
                    this.data.jllx = el.value;
                    // this.ajax_check();
                },
                query_info: function () {
                    this.ajax_check();
                },
                is_bm:"",
                is_sc:"",
                ajax_check:function () {
                    cloud.my_ac_list(this.data.$model,function (url, ars, data) {
                        var dataList = data;
                        var dataLength = dataList.length;
                        var current_time = $(".current_time").text();
                        var currentDate = new Date(current_time.replace(/\-/g, "\/"));
                        for(var i = 0; i < dataLength; i++){
                            var bm_start = new Date(dataList[i].bm_kssj.replace(/\-/g, "\/"));
                            var bm_end = new Date(dataList[i].bm_jssj.replace(/\-/g, "\/"));
                            var hd_end = new Date(dataList[i].hd_jssj.replace(/\-/g, "\/"));
                            var hd_start = new Date(dataList[i].hd_kssj.replace(/\-/g, "\/"));

                            if(bm_start < currentDate && currentDate < bm_end){
                                dataList[i]['bm_time'] = 1//当前时间在报名时间段内
                            }else{
                                dataList[i]['bm_time'] = 0;
                            }
                            if(currentDate > hd_start){
                                dataList[i]['sc_time'] = 1;//当前时间在活动开展开始时间后
                            }else{
                                dataList[i]['sc_time'] = 0;
                            }
                        }
                        vm.dataInfo = dataList;
                        console.log(vm.dataInfo)
                    })
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级班级集合
                            case api_bm:
                                this.complete_bm(data);
                                break;
                                //满意度
                            case api_man_yi:
                                this.complete_man_yi(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                //报名
                bao_ming:function (el) {
                    ajax_post(api_bm,{id:el.id},this);
                },
                complete_bm:function (data) {
                    toastr.success('报名成功');
                    this.ajax_check();
                },
                //上传材料
                add:function (el) {
                    sessionStorage.setItem("uploading_material", JSON.stringify(el));
                    window.location = "#add_pra_ma";
                },
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
                //情况调查
                check:function (el) {
                    this.man_yi.fk_hd_id = el.id;
                    $("#check_prompt").modal({
                        closeOnConfirm: false
                    });
                },
                check_save:function () {
                    if(this.man_yi.sf_my == ''){
                        toastr.warning("请选择满意度");
                        return;
                    }
                    if(this.man_yi.sf_qd == ''){
                        toastr.warning("请选择期待度");
                        return;
                    }
                    ajax_post(api_man_yi,this.man_yi.$model,this);
                },
                complete_man_yi:function (data) {
                    $("#check_prompt").modal({
                        closeOnConfirm: true
                    });
                    this.ajax_check();

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
