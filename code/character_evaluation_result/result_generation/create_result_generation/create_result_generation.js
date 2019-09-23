/**
 * Created by uptang on 2017/7/7.
 */
define([
        C.CLF('avalon.js'),
        C.Co('character_evaluation_result/result_generation', 'result_list/result_list', 'css!'),
        C.Co('character_evaluation_result/result_generation', 'create_result_generation/create_result_generation', 'html!'),
        "layer",
        C.CMF("data_center.js"),
        "date_zh",
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function (avalon, css, html, layer, data_center, date_zh, select_assembly, three_menu_module) {

        var avalon_define = function (par) {
            var save_api = api.api + "score/edit_feature_project";
            var vm = avalon.define({
                $id: "create_result_generation",
                post_data: {
                    _id: '',
                    end_date_time: '',
                    fk_grade_id: '',
                    fk_semester_id: '',
                    grade_name: '',
                    project_name: '',
                    start_date_time: ''
                },
                //年级和班级默认值
                default_grade:'',
                default_semester:'',
                grade_list: [],
                //学年学期列表
                semester_list: [],
                //当前学期
                now_semester:[],
                init: function () {
                    this.grade_list = cloud.grade_all_list();
                    this.semester_list = cloud.semester_all_list();
                    if(par.update_result){
                        var update_result = data_center.get_key('update_result');
                        update_result = JSON.parse(update_result);
                        for(var key in update_result){
                            this.post_data[key] = update_result[key];
                        }
                        for(var i=0;i<this.grade_list.length;i++){
                            if(this.grade_list[i].value==this.post_data.fk_grade_id){
                                this.default_grade = this.grade_list[i].name;
                                break;
                            }
                        }
                        for(var j=0;j<this.semester_list.length;j++){
                            if(this.semester_list[j].value.split('|')[0]==this.post_data.fk_semester_id){
                                this.default_semester = this.semester_list[j].name;
                                break;
                            }
                        }
                    }

                },
                grade_sel: function (el, index) {
                    if (el.value == '') {
                        this.post_data.fk_grade_id = '';
                        this.post_data.grade_name = ''
                        return;
                    }
                    this.post_data.fk_grade_id = el.value;
                    this.post_data.grade_name = el.name;
                },
                //切换学年学期
                semester_sel: function (el, index) {
                    if (el.value == '') {
                        this.post_data.fk_semester_id = '';
                    }
                    this.now_semester = el.value.split('|');
                    this.post_data.fk_semester_id = this.now_semester[0];
                },
                update_start_time: function () {
                    $('#update-start-time')
                        .datetimepicker()
                        .on('changeDate', function (e) {
                            vm.post_data.start_date_time = e.currentTarget.value;
                        });
                    // $('#update-start-time').datetimepicker('setEndDate', vm.post_data.start_date_time);
                },
                //结束时间
                update_end_time: function () {
                    $('#update-end-time')
                        .datetimepicker()
                        .on('changeDate', function (e) {
                            vm.post_data.end_date_time = e.currentTarget.value;
                        });
                    // $('#update-end-time').datetimepicker('setStartDate', vm.post_data.end_date_time);

                },
                back: function () {
                    window.history.back(-1);
                },
                create_result: function () {
                    if(this.post_data.project_name==''){
                        toastr.warning('请输入项目名称')
                        return;
                    }
                    if(this.grade_name=='' ||this.fk_grade_id==''){
                        toastr.warning('请选择年级')
                        return
                    }
                    if (this.post_data.fk_semester_id == '') {
                        toastr.warning('请选择学年学期')
                        return;
                    }
                    if(this.post_data.start_date_time=='' || this.post_data.end_date_time==''){
                        toastr.warning('请选择统计起止时间')
                        return
                    }
                    if(this.post_data.start_date_time>this.post_data.end_date_time){
                        toastr.warning('开始时间不能大于结束时间')
                        return;
                    }
                    if(this.post_data.start_date_time<time_2_str(this.now_semester[1]) ||
                        this.post_data.end_date_time>time_2_str(this.now_semester[2])){
                        toastr.warning('统计起止时间必须在学期时间内')
                        return;
                    }

                    ajax_post(save_api, this.post_data.$model, this)
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case save_api:

                                if(par.update_result){
                                    toastr.success('修改成功')
                                }else {
                                    toastr.success('创建成功')
                                }
                                window.location = "#result_list";
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });
            vm.$watch('onReady', function () {
                $('#update-end-time').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language: 'zh-CN'
                });
                $('#update-start-time').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language: 'zh-CN'
                });
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
