/**
 * Created by Administrator on 2018/1/25.
 */
define(['jquery',
        C.CLF("avalon.js"),
        C.Co("weixin_xy", "xy_home/xy_home", "css!"),
        C.Co("weixin_xy", "xy_home/xy_home", "html!"),
        C.CMF("data_center.js")
    ],
    function ($, avalon, css, html,data_center) {
        // //解除绑定
        var avalon_define = function () {
            var project_list_api = api.xy+"front/exam_listExamByWhere";
            var vm = avalon.define({
                $id: "xy_home",
                //项目列表
                project_list:[],
                post_data:{
                    begin_time:'',
                    exam_level:'',
                    exam_name:'',
                    page_number:'1',
                    page_size:'4',
                    semester_id:''
                },
                init: function () {
                    this.get_project_list();
                },
                //获取项目列表
                get_project_list:function () {
                    $.showLoading();
                    ajax_post(project_list_api,this.post_data.$model,this)
                },
                //初始化图片轮播（未用）
                init_swipper:function () {
                    $(".swiper-container").swiper({
                        loop: true,
                        autoplay: 2000
                    });
                },
                //处理项目列表数据
                deal_project_list:function (data) {
                    if(!data.data)
                        return;
                    this.project_list = data.data.list
                },
                //真题练习点击
                real_exercise:function () {
                    $.alert('暂未开放');
                },
                //错题本点击
                go_error_book:function () {
                    window.location = "#subjects"
                },
                //成绩分析
                grade_analysis:function (el) {
                    var project = {};
                    if(!el){
                        project = this.project_list[0];
                    }else{
                        project = el;
                    }
                    var project_obj = {};
                    project_obj.name = project.examName;
                    project_obj.exam_id = project.id;
                    project_obj.rank = project.examRank;
                    window.location = "#grade_analysis?project="+JSON.stringify(project_obj);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case project_list_api:
                                this.deal_project_list(data);
                                break;
                        }
                    } else {
                        $.alert(msg);
                    }
                    if(cmd==project_list_api){
                        $.hideLoading();
                    }
                }

            });
            require(["jquery_weui"], function (j) {
                require(['swiper', 'city_picker'], function (a, b) {
                    vm.init();
                })
            });
            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    });