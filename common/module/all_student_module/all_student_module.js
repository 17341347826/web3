/**
 * 艺术详情组件
 */
define([
        C.CLF('avalon.js'),
        C.CM("worksDetail","css!"),
        C.CM("all_student_module","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "layer"],
    function(avalon,css, html, x, data_center,layer) {
        var pdetail = undefined;
        // 艺术活动基本详细信息组件
        var detail = avalon.component('ms-base-student', {
            template: html,
            defaults: {
                url: api.PCPlayer + "baseUser/studentlist.action",
                student_arr:[],
                module_class_id:"",
                checkbox_arr:[],
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        self.user_type = Number(data.data.user_type);
                    })
                },
                get_all_student: function() {
                    if(this.module_class_id){
                        ajax_post(this.url, {fk_class_id:this.module_class_id }, this);

                    }else{

                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case this.url:
                                complete_get_all_student(data);
                                break;
                        }
                    }
                },
                onReady: function() {
                    pdetail = this;
                    this.cb();
                    this.get_all_student();
                },
                add_student:function () {
                    var student_list=[];
                    for (var i = 0; i < this.checkbox_arr.length; i++) {
                        var stu_info = this.checkbox_arr[i];
                        var obj = {
                            "guid": Number(stu_info.split("|")[0]),
                            "name": stu_info.split("|")[1],
                            "code": stu_info.split("|")[2]
                        };
                        student_list.push(obj);
                    }

                    console.log(student_list);
                },
                cancel_student:function () {
                    $("#add-confirm").modal({
                        closeOnConfirm: true
                    });
                }
            }
        });

        complete_get_all_student = function(data) {
            pdetail.student_arr=data.data.list;
            $("#add-confirm").modal({
                closeOnConfirm: false
            });
        };
    });