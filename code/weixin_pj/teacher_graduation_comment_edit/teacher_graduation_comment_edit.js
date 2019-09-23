/**
 * Created by Administrator on 2018/7/24.
 */
define(['jquery',
        C.CLF('avalon.js'), 'layer',
        C.Co("weixin_pj", "teacher_graduation_comment_edit/teacher_graduation_comment_edit", "css!"),
        C.Co("weixin_pj", "teacher_graduation_comment_edit/teacher_graduation_comment_edit", "html!"),
        C.CMF("router.js"),C.CMF("data_center.js"), "jquery-weui"
    ],
    function($, avalon, layer,css,html, x,data_center,weui ) {
        //添加、修改自评
        var api_add_remark=api.api+'Indexmaintain/add_or_update_bybg_remark';
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "teacher_graduation_comment_edit",
                //添加参数
                add_data:{
                    //班级id	number	必填
                    class_id:'',
                    //年级id	number	必填
                    grade_id:'',
                    //年级名字	string	必填
                    grade_name:'',
                    //身份	number	//1.学生2.老师
                    identity:2,
                    //学校id	number	必填
                    school_id:'',
                    //学生id	number	必填
                    stu_id:'',
                    //学生姓名	string	必填
                    stu_name:'',
                    //学生学号	string	必填
                    stu_num:'',
                    //学生自评内容	string	必填
                    stu_remark:'',
                    //老师id	number	必填
                    teacher_id:'',
                    //老师名字	string	必填
                    teacher_name:'',
                    //老师评价内容	string	必填
                    teacher_remark:'',
                },
                init:function () {
                    var el = JSON.parse(pmx.el);
                    console.log(el);
                    this.add_data.class_id = el.class_id;
                    this.add_data.grade_id = el.grade_id;
                    this.add_data.grade_name = el.grade_name;
                    this.add_data.school_id = el.school_id;
                    this.add_data.stu_id = el.stu_id;
                    this.add_data.stu_name = el.stu_name;
                    this.add_data.stu_num = el.stu_num;
                    this.add_data.stu_remark = el.stu_remark;
                    this.add_data.teacher_id = el.teacher_id;
                    this.add_data.teacher_name = el.teacher_name;
                    this.add_data.teacher_remark = el.teacher_remark;
                },
                //提交
                edit_btn:function (el) {
                    ajax_post(api_add_remark,this.add_data.$model,this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //保存评论
                            case api_add_remark:
                                window.location = '#teacher_graduation_comment';
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