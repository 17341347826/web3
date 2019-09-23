/**
 * Created by uptang on 2017/6/5.
 */
define([
        "jquery",'layer',
        C.CLF('avalon.js'),
        C.Co("health", "final_exam_objection_detail/final_exam_objection_detail", "css!"),
        C.Co("health", "final_exam_objection_detail/final_exam_objection_detail", "html!"),
        C.CMF("uploader/uploader.js"),
        C.CMF("data_center.js"), "PCAS",C.CM('page_title')],
    function ($, layer,avalon,css, html,uploader, data_center, PCAS,page_title) {
        //获取成绩
        // var api_get_score = api.api+"score/score_detail";
        var api_get_score = api.api+"score/score_dissent_detail";

        //文件上传
        var api_file_uploader=api.api+"file/uploader";
        //提交审核
        var api_get_score_dissent_check = api.api+"score/score_dissent_check";
        //保存
        var api_art_evaluation_save_or_update = api.api+"score/save_or_update_score";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "final_exam_objection_detail",

                old_score:[],//原始成绩
                new_score:[],
                headers:[],
                dissent:[],
                files: [],
                hidden:true,
                uploader_url: api_file_uploader,
                is_pass:"11",
                data:{
                    _id:"",//学业成绩id
                    content:"",//审核意见
                    img:"",//附件
                    // column_list:[],
                    is_pass:""//是否通过	boolean	true 通过进入归档 false 不通过重新公示
                },
                count: act_count,

                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        self.user_type = data.data.user_type;

                        self.data._id = pmx._id;

                        ajax_post(api_get_score,{for_id:pmx._id, use_new_version:true},self);
                    });
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取成绩
                            case api_get_score:
                                this.complete_get_score(data);
                                break;
                                //修改成绩
                            case api_art_evaluation_save_or_update:
                                this.complete_art_evaluation_save_or_update(data);
                                break;
                                //提交审核
                            case api_get_score_dissent_check:
                                //window.location = "#final_exam_objection_list";
                                history.go(-1);
                                break;
                        }
                    } else {
                        if(cmd == api_art_evaluation_save_or_update){
                            layer.close(this.layer_index);
                            toastr.error('成绩修改失败');
                        }else{
                            toastr.error(msg);
                        }

                    }
                },
                complete_get_score:function (data) {
                    //表头
                    vm.headers = data.data.course_list;
                    vm.old_score = [data.data.score.content];
                    vm.new_score = [data.data.score.content];
                    vm.dissent = data.data.score.dissent;
                    vm.hidden=false;
                },
                //提交
                check:function () {

                    if(this.is_pass == 11){//没异议，进入归档
                        this.data.is_pass = true;
                        // this.data.column_list = [];

                    }else if(this.is_pass == 22){//有异议，进行数据比较
                        this.data.is_pass = false;
                    }
                    var uploaderWorks = data_center.ctrl("final_uploader");
                    var is_complete=uploaderWorks.is_finished();
                    if($.trim(this.data.content) == ''){
                        toastr.warning('请填写材料说明');
                        return;
                    }else if(is_complete == true){
                        var files = uploaderWorks.get_files();
                        if(files.length == 0){
                            toastr.warning('必须上传审核材料');
                            return;
                        }else{
                            this.data.img = JSON.stringify(files);
                            ajax_post(api_art_evaluation_save_or_update,this.new_score[0].$model,this);
                        }

                    }else{
                        toastr.warning('必须上传审核材料');
                        return;
                    }
                },
                complete_art_evaluation_save_or_update:function (data) {
                    ajax_post(api_get_score_dissent_check,this.data,this);
                }
            });
            vm.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                this.cb();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });