/**
 * Created by uptang on 2017/4/28.
 */

define([
        C.CLF('avalon.js'),
        C.Co("admin","subjects_management/subjects_management","css!"),
        C.Co("admin","subjects_management/subjects_management","html!"),
        C.CM("modal"),C.CM('three_menu_module')],
    function (avalon, css, html,modal,three_menu_module) {
        //列表
        var subject_property = api.user + "subject/subjectList.action";
        //编辑
        var subject_save = api.user + "subject/save.action";
        //启停用
        var subject_state = api.user + "subject/upd_state.action";
        //删除
        var subject_delete = api.user + "subject/delete.action";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "table",
                subject_property:[],
                // 模态框
                modal: {
                    user_id: "",
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: ""
                },
                //增加
                compileData: {
                    subject_code:"",
                    subject_name: "",
                    objectivity_count: "",
                    subjectivity_count: "",
                    //备注
                    remark: ""
                },
                btnType:"",
                subjectCodeFlag:"",
                subjectivityCountFlag:"",
                objectivityCountFlag:"",
                //  列表按钮操作
                statusOn:function (id,status) {
                    this.modal.msg = "";
                    this.modal.id=id;
                    this.btnType = 4;
                    if(status==1){
                        this.modal.title = "停用";
                        this.modal.info = "是否停用此学科？";
                    }else {
                        this.modal.title = "启用";
                        this.modal.info = "是否启用此学科？";
                    }
                    $("#delete-modal").modal({
                        closeOnConfirm: false
                    });
                },
                //删除
                propertyDelete:function (id) {
                    this.modal.title = "删除";
                    this.modal.info = "是否删除此学科？";
                    this.modal.msg = "";
                    this.modal.id=id;
                    this.btnType = 2;
                    $("#delete-modal").modal({
                        closeOnConfirm: false
                    });
                },
                sure: function () {
                    if (this.btnType == 4) {
                        ajax_post(subject_state,{subject_id:this.modal.id},this)
                    } else if (this.btnType == 2) {
                        ajax_post(subject_delete, {subject_id:this.modal.id}, this);
                    }
                },
                //添加
                //数据校验
                numMsg: function () {
                    this.modal.msg = "";
                },
                subjectCode:function () {
                    var reg = /^[1-9]*[1-9][0-9]*$/;
                    if(this.compileData.subject_code!=""){
                        var numReg = reg.test(this.compileData.subject_code);
                        if (!numReg) {
                            this.modal.msg = "请输入正整数";
                            this.subjectCodeFlag=false;
                        }else {
                            this.subjectCodeFlag=true;
                        }
                    }else {
                        this.subjectCodeFlag=false;
                        this.modal.msg = "请输入科目代码";
                    }
                },
                objectivityCount:function () {
                    var reg = /^[1-9]*[1-9][0-9]*$/;
                    if(this.compileData.objectivity_count!=""){
                        var numReg = reg.test(this.compileData.objectivity_count);
                        if (!numReg) {
                            this.modal.msg = "请输入正整数";
                            this.objectivityCountFlag=false;
                        }else {
                            this.objectivityCountFlag=true;
                        }
                    }else {
                        this.objectivityCountFlag=false;
                        this.modal.msg = "请输入客观题数量";
                    }
                },
                subjectivityCount:function () {
                    var reg = /^[1-9]*[1-9][0-9]*$/;
                    if(this.compileData.subjectivity_count!=""){
                        var numReg = reg.test(this.compileData.subjectivity_count);
                        if (!numReg) {
                            this.modal.msg = "请输入正整数";
                            this.subjectivityCountFlag=false;
                        }else {
                            this.subjectivityCountFlag=true;
                        }
                    }else {
                        this.modal.msg = "请输入主观题数量";
                        this.subjectivityCountFlag=false;
                    }
                },
                compile: function () {
                    if (this.compileData.subject_code != ""&&
                        this.compileData.subject_name != ""&&
                        this.compileData.objectivity_count != ""&&
                        this.compileData.subjectivity_count != "") {
                        if(this.subjectCodeFlag &&
                            this.subjectivityCountFlag&&
                            this.objectivityCountFlag){
                            ajax_post(subject_save, this.compileData.$model, this);
                        }else {
                            this.modal.msg = "请输入正整数";
                        }
                    } else {
                        this.modal.msg = "请填写必填项"
                    }
                },
                addInfo: function () {
                    this.modal.title = "添加";
                    this.compileData.grade_name = "";
                    this.compileData.remark="";
                    this.modal.msg = "";
                    $("#compileData").modal({
                        closeOnConfirm: false
                    });
                },
                regMsg: function () {
                    this.modal.msg = "";
                },
                infoModal: function (status, msg) {
                    var info = $("#info-tips");
                    if (status == 200) {
                        info.modal('open');
                        setTimeout(function () {
                            info.modal('close');
                        }, 1000)
                    }
                    this.modal.msg = msg;
                },
                init:function () {
                    ajax_post(subject_property,{},this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    var compileData = $("#compileData");
                    var info = $("#info-tips");
                    switch (cmd) {
                        case  subject_property:
                            this.subject_property=data.data;
                            break;
                        case  subject_save:
                            if (status == 200) {
                                compileData.modal("close");
                                this.compileData.subject_name = '';
                                this.compileData.subject_code = '';
                                this.compileData.objectivity_count = '';
                                this.compileData.subjectivity_count = '';
                                this.compileData.remark = '';
                                ajax_post(subject_property,{},this);
                            }
                            this.infoModal(status, msg);
                            break;
                        case  subject_state:
                            info.modal('open');
                            setTimeout(function () {
                                $("#info-tips").modal('close');
                            }, 1000);
                            this.modal.msg = msg;
                            ajax_post(subject_property,{},this);
                            break;
                        case  subject_delete:
                            info.modal('open');
                            setTimeout(function () {
                                $("#info-tips").modal('close');
                            }, 1000);
                            this.modal.msg = msg;
                            ajax_post(subject_property,{},this);
                            break;
                    }
                }
            });
            table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });