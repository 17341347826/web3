/**
 * Created by uptang on 2017/5/8.
 */
define([
        C.CLF('avalon.js'),
        "jquery_weui",
        C.Co("weixin_xy", "choose_project/choose_project", "css!"),
        C.Co("weixin_xy", "choose_project/choose_project", "html!")],
    function (avalon, weui, css, html) {
        // 获取可查看的考试项目
        var choose_project_url = api.xy + "front/examProject_findStudentChooseExamProject.action";

        //设置选中的考试项目
        var selected_project_url = api.xy + "front/examProject_selectedProject.action";
        var avalon_define = function (pmx) {
            var project = avalon.define({
                $id: "projects",
                //data: [{project_id: 8, exam_rank: "2", exam_name: "期末考试（测试）", import_mark: 1, statistic_mark: 0}],
                data: "",
                errmsg: "",
                //项目id
                exam_id:'',
                //项目名称
                exam_name:'',
                //跳转去考试项目详情页
                exam_detail: function(exam_id, exam_name){
                    this.exam_id=exam_id;
                    this.exam_name=exam_name;
                    ajaxPost(selected_project_url, {exam_id : exam_id, exam_name : exam_name}, this);
                },
                // 实例化
                init: function () {
                    ajaxPost(choose_project_url, {}, this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    switch (cmd) {
                        case  choose_project_url:
                            if (status == 200) {
                                this.data = data.data.projects;
                                if(data.data.count == 0){
                                    this.errmsg = "暂无考试项目";
                                    $.toast("暂无考试项目", "text");
                                }
                            }else{
                                this.errmsg = data.message + "(" + data.status + ")";
                            }
                            break;
                        case  selected_project_url:
                            if (status == 200) {
                                var type=pmx.type;
                                if(type==1){
                                    window.location = "#score";
                                }else if(type==2){
                                    window.location = "#choose_sub?exam_id="+this.exam_id+'&exam_name='+ this.exam_name;
                                }
                            }else{
                                this.errmsg = data.message + "(" + data.status + ")";
                            }
                            break;
                    }
                }
            });
            project.init();
            return project;
        };
        return {
            view: html,
            define: avalon_define
        }
    });