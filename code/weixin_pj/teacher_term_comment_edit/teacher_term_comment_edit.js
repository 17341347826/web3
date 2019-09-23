/**
 * Created by Administrator on 2018/7/24.
 */
define(['jquery',
        C.CLF('avalon.js'), 'layer',
        C.Co("weixin_pj", "teacher_term_comment_edit/teacher_term_comment_edit", "css!"),
        C.Co("weixin_pj", "teacher_term_comment_edit/teacher_term_comment_edit", "html!"),
        C.CMF("router.js"),C.CMF("data_center.js"), "jquery-weui"
    ],
    function($, avalon, layer,css,html, x,data_center,weui ) {
        //提交评语
        var api_add_comment_teacher = api.api + "everyday/remarl_teacher";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "teacher_term_comment_edit",
                data:{
                    fk_nj_id:'',
                    list: [{
                        content_teacher:'',
                        fk_class_id: '',
                        fk_grade_id: '',
                        fk_school_id: '',
                        grade: '',
                        semester:'',
                        student_id:'',
                        fk_semester_id: '',
                        semester_name: '',
                        code: ''
                    }]
                },
                init:function () {
                    var el = JSON.parse(pmx.el);
                    console.log(el);
                    this.data.fk_nj_id = pmx.fk_grade_id;
                    this.data.list[0].content_teacher = el.content_teacher;
                    this.data.list[0].fk_class_id = el.fk_class_id;
                    this.data.list[0].fk_grade_id = el.fk_grade_id;
                    this.data.list[0].fk_school_id = el.fk_school_id;
                    this.data.list[0].grade = pmx.grade;
                    this.data.list[0].semester = pmx.semester;
                    this.data.list[0].student_id = el.guid;
                    this.data.list[0].fk_semester_id =  pmx.fk_semester_id;
                    this.data.list[0].semester_name =  pmx.semester_name;
                    this.data.list[0].code = el.code;
                },
                //提交
                edit_btn:function () {
                    if(this.data.list[0].content_teacher == ''){
                        $.alert('请输入评语');
                        return;
                    }
                    ajax_post(api_add_comment_teacher,this.data.$model,this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //保存评论
                            case api_add_comment_teacher:
                                window.location = '#teacher_term_comment';
                                break;

                        }
                    }
                },
            });
            vm.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                this.init();

            });

            return vm;
        };

        return {
            view: html,
            define: avalon_define
        }
    });