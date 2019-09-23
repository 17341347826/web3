/**
 * Created by uptang on 2017/7/7.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("weixin_pj/parent_login", "stu_term_evaluation/stu_term_evaluation", "css!"),
        C.Co("weixin_pj/parent_login", "parent_msg_fill/parent_msg_fill", "html!"),
        C.CMF("data_center.js"),
        "jquery-weui"
    ],
    function ($, avalon,css, html, data_center,weui) {
        //评语提交
        var remarl_guardian = api.api + "everyday/remarl_guardian";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "parent_msg_fill",
                //提交评语请求数据
                remarl:{
                    //	学生学籍号
                    code:'',
                    //家长评内容
                    content_guardian:'',
                    //学年	string	2017
                    grade:'',
                    //学期 1上学期2下学期	number
                    semester:'',
                    //子女学生的guid	number
                    student_id:'',
                    //学校id
                    fk_school_id:'',
                    //年级id
                    fk_grade_id:'',
                    //    班级id
                    fk_class_id:'',
                    //    年级名称
                    grade_name:'',
                    //    学校名称
                    school_name:'',
                    //    班级名称
                    class_name:'',
                    //    学年学期名称
                    semester_name:'',
                },
                init:function () {
                    var obj_str = JSON.parse(window.sessionStorage.getItem('remarl_req'));
                    this.remarl = this.cloneObjectFn(obj_str);
                    // 通过 for in 循环赋值
                    // for( var key in this.remarl ){
                    //     this.remarl[key] = obj_str[key]
                    // }
                    // console.log(this.remarl);
                },
                /**
                 * 对象赋值（强）
                 */
                cloneObjectFn:function(obj){
                    return JSON.parse(JSON.stringify(obj))
                },
                submit_data:function () {
                    if(this.remarl.content_guardian==''){
                        $.alert('请填写评语');
                        return;
                    }
                    ajax_post(remarl_guardian,this.remarl.$model,this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case remarl_guardian:
                                $.toast("操作成功");
                                window.location.href = "#new_parent_msg";
                                window.sessionStorage.removeItem('remarl_req');
                                break;
                            default:
                                break;
                        }
                    } else {
                        $.alert(msg)
                    }

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