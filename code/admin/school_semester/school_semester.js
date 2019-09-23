   /**
 * Created by uptang on 2017/4/28.
 */

define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("admin","school_semester/school_semester","css!"),
        C.Co("admin","school_semester/school_semester","html!"),
        C.CM("modal"),C.CM('three_menu_module')],
    function ($,avalon, css, html,modal,three_menu_module) {
        //列表
        var semester_property = api.user + "semester/used_list.action";
        //编辑
        var semester_save = api.user + "semester/edit.action";
        //启停用
        var semester_state = api.user + "semester/upd_state.action";
        //删除
        var semester_delete = api.user + "semester/delete.action";
        //归档
        var filed_api = api.api+"base/user_stat/stat_stu_cnt";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "table",
                semester_property:[],
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
                    start_date:"",
                    end_date:"",
                    semester_name: "",
                    xn:"",
                    semester_index:"",
                    //备注
                    remark: ""
                },
                other:{
                    start_time:"",
                    end_time:""
                },
                btnType:"",
                //  列表按钮操作
                statusOn:function (id,status) {
                    this.modal.msg = "";
                    this.modal.id=id;
                    this.btnType = 4;
                    if(status==1){
                        this.modal.title = "停用";
                        this.modal.info = "是否停用此学年学期？";
                    }else {
                        this.modal.title = "启用";
                        this.modal.info = "是否启用此学年学期？";
                    }
                    $("#delete-modal").modal({
                        closeOnConfirm: false
                    });
                },
                //删除
                propertyDelete:function (id) {
                    this.modal.title = "删除";
                    this.modal.info = "是否删除此学年学期？";
                    this.modal.msg = "";
                    this.modal.id=id;
                    this.btnType = 2;
                    $("#delete-modal").modal({
                        closeOnConfirm: false
                    });
                },
                sure: function () {
                    if (this.btnType == 4) {
                        ajax_post(semester_state,{semester_id:this.modal.id},this)
                    } else if (this.btnType == 2) {
                        ajax_post(semester_delete, {semester_id:this.modal.id}, this);
                    }
                },
                //学年初始状态
                xn_type:false,
                //学年判断数字
                xn_blur:function(){
                    var reg = /^(\d{4})\-(\d{4})$/
                    var text = this.compileData.xn;
                    if(reg.test(text) && text.trim()){
                        this.xn_type = true;
                        this.modal.msg = '';
                    }else{
                        this.modal.msg = "请输入学年正确格式"
                    }
                },
                //添加
                compile: function () {
                    if (this.compileData.semester_name != ""&&
                    this.compileData.start_date!=""&&
                    this.compileData.end_date!="" &&
                    this.compileData.semester_index!="" &&
                        this.xn_type == true
                    ) {
                        var starTime=new Date(this.compileData.start_date.replace(/-/g,"\/"));
                        var endTime=new Date(this.compileData.end_date.replace(/-/g,"\/"));
                        if(starTime<endTime){
                            ajax_post(semester_save, this.compileData.$model, this);
                        }else {
                            this.modal.msg = "结束日期应大于开始日期！"
                        }
                    }else if(this.xn_type == false){
                        this.modal.msg = "请输入学年正确格式"
                    } else {
                        this.modal.msg = "除备注外所有项必填"
                    }
                },
                filed:function (id) {
                    ajax_post(filed_api,{semester_id:id},this)
                },
                getCompleteDate:function () {
                    var self=this;
                    var datepicker=$("#my-datepicker");
                    datepicker.on("change", function(event) {
                        self.other.start_time = event.delegateTarget.defaultValue;
                        self.compileData.start_date=self.other.start_time;
                    });
                    datepicker.datepicker('open');
                },
                getCompleteDates:function () {
                    var self=this;
                    var datepicker=$("#my-datepickers");
                    datepicker.on("change", function(event) {
                        self.other.end_time = event.delegateTarget.defaultValue;
                        self.compileData.end_date=self.other.end_time;
                    });
                    datepicker.datepicker('open');
                },
                addInfo: function () {
                    this.modal.title = "添加";
                    this.compileData.start_date = "";
                    this.compileData.end_date = "";
                    this.other.start_time = "";
                    this.other.end_time = "";
                    this.compileData.semester_name = "";
                    this.compileData.remark="";
                    this.compileData.semester_index="";
                    this.compileData.xn="";
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
                    ajax_post(semester_property,{},this);

                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    var compileData = $("#compileData");
                    var info = $("#info-tips");
                    switch (cmd) {
                        case  semester_property:
                            this.semester_property=data.data;
                            break;
                        case  semester_save:
                            if (status == 200) {
                                compileData.modal("close");
                                ajax_post(semester_property,{},this);
                            }
                            this.infoModal(status, msg);
                            break;
                        case  semester_state:
                            info.modal('open');
                            setTimeout(function () {
                                $("#info-tips").modal('close');
                            }, 1000);
                            this.modal.msg = msg;
                            ajax_post(semester_property,{},this);
                            break;
                        case  semester_delete:
                            info.modal('open');
                            setTimeout(function () {
                                $("#info-tips").modal('close');
                            }, 1000);
                            this.modal.msg = msg;
                            ajax_post(semester_property,{},this);
                            break;
                        case filed_api:
                            toastr.success('归档完成！');
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