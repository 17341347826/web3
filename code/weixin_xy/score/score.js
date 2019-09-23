/**
 * Created by uptang on 2017/5/8.
 */
define([
        C.CLF('avalon.js'),
        C.Co("weixin_xy", "score/score", "css!"),
        C.Co("weixin_xy", "score/score", "html!")],
    function (avalon, css, html) {
        // 获取指定考试项目详情
        var exam_detail_url = api.xy + "front/sumMark_getExamDetail.action";
        var avalon_define = function () {
            var marks = avalon.define({
                $id: "marks",
                project_name: "",
                marks: {
                    SUMMARK:""
                },
                subjects: "",
                class_avg: "",
                school_avg: "",
                city_avg: "",
                errmsg: "",
                //获取考试项目成绩
                init: function () {
                    ajaxPost(exam_detail_url, {}, this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    switch (cmd) {
                        case  exam_detail_url:
                            if (status == 200) {
                                this.marks = data.data.marks;
                                this.subjects = data.data.sujects;
                                this.class_avg = data.data.class_avg;
                                this.school_avg = data.data.school_avg;
                                this.city_avg = data.data.city_avg;
                                this.project_name = data.data.project_name;
                            }else{
                                this.errmsg = data.message + "(" + data.status + ")";
                            }
                            break;
                    }
                }
            });
            marks.init();
            return marks;
        };
        return {
            view: html,
            define: avalon_define
        }
    });