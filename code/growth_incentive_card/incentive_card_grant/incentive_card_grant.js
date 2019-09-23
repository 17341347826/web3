/**
 * Created by Administrator on 2018/6/15.
 */
define([
        "jquery",
        C.CLF('avalon.js'),"select2",
        C.Co("growth_incentive_card", "incentive_card_grant/incentive_card_grant", "css!"),
        C.Co("growth_incentive_card", "incentive_card_grant/incentive_card_grant", "html!"),
        C.CMF("viewer/viewer.js"),C.CMF("uploader/uploader.js"),
        "layer",
        C.CM('page_title'),
        C.CMF("data_center.js")],
    function ($,avalon,select2,css, html,viewer,uploader, layer, page_title,data_center) {
        //文件上传
        var api_file_uploader = api.api+"file/uploader";
        //学生
        var stu_list = api.api + "base/baseUser/studentlist.action";
        //可以标志卡
        var card_list = api.api + "everyday/find_mark_card";
        //可以标志卡
        var card_save = api.api + "everyday/give_gain_card";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "incentive_card_grant",
                files: [],
                files_length:'',
                uploader_url: api_file_uploader,
                student_info:"",
                data:{
                    attachment:'',
                    fk_school_id:"",
                    school_name:"",
                    fk_grade_id:"",
                    grade_name:"",
                    fk_class_id:"",
                    class_name:"",
                    code:"",
                    name:"",
                    mark_card_id:"",
                    student_guid:"",
                    encourage_date:""
                },
                //年级
                grade_list:[],
                //班级
                class_list:[],
                //学生列表
                stu_list:[],
                //标志卡
                card_list:[],
                other:{
                    stu_info:"",
                    grade_name:"",
                    class_name:""
                },
                demand:function () {

                },
                submitSure:function (data) {
                    // this.data.encourage_date='2018-04-07 00:00:00';
                    var uploaderWorks = data_center.ctrl("card_uploader");
                    var is_complete=uploaderWorks.is_finished();
                    if(is_complete==true){
                        var files = uploaderWorks.get_files();
                        table.data.attachment = JSON.stringify(files);
                    }
                    if (this.data.fk_school_id!=""&&
                        this.data.school_name!=""&&
                        this.data.encourage_date!=""&&
                        this.data.mark_card_id!=""&&
                        this.other.stu_info!=""&&
                        this.other.grade_name!=""&&
                        this.other.class_name!=""&&
                        is_complete==true &&
                        files.length>0
                    ) {
                        var self = this;
                        layer.open({
                            title: "提示",
                            content: '是否发卡？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                layer.close(index);
                                var files = uploaderWorks.get_files();
                                self.files_length=files.length;
                                ajax_post(card_save,self.data.$model, self);
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    } else {
                        toastr.warning("所有选项必选")
                    }
                },
                gradeChange:function () {
                    var grade = this.other.grade_name;
                    var grades=this.grade_list;
                    this.data.fk_grade_id = grade.substring(0, grade.indexOf("|"));
                    this.data.grade_name = grade.substring(grade.indexOf("|") + 1, grade.length);
                    ajax_post(card_list,{fk_grade_id:this.data.fk_grade_id},this);
                    this.class_list=this.grade_list;
                    var gId= this.data.fk_grade_id;
                    for(var i=0;i<grades.length;i++){
                        var id=grades[i].grade_id;
                        if(id==gId){
                            this.class_list=grades[i].class_list;
                        }
                    }
                },
                classChange:function () {
                    var classes = this.other.class_name;
                    this.data.fk_class_id = classes.substring(0, classes.indexOf("|"));
                    this.data.class_name  = classes.substring(classes.indexOf("|") + 1, classes.length);
                    if(this.other.grade_name==""){
                        toastr.warning("请选择年级")
                    }else {
                        ajax_post(stu_list,{
                            fk_grade_id:this.data.fk_grade_id,
                            fk_school_id:this.data.fk_school_id,
                            fk_class_id:this.data.fk_class_id
                        },this);
                    }
                },
                getCompleteDate:function () {
                    var self=this;
                    var datepicker=$("#my-datepicker");
                    datepicker.on("change", function(event) {
                        self.data.encourage_date = event.delegateTarget.defaultValue;
                    });
                    datepicker.datepicker('open');
                },
                cancel:function () {
                    window.history.back(-1);
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        var cArr = [];
                        if (userType == "1") {
                            var tUserData = JSON.parse(data.data["user"]);
                            cArr= tUserData.lead_class_list;
                            self.grade_list=cArr;
                            self.data.fk_school_id=tUserData.fk_school_id.toString();
                            self.data.school_name=tUserData.school_name;
                            console.log(self.getMyDate('2016-09-08'));
                        }
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case  card_list:
                                this.card_list = data.data;
                                if(data.data.length==0){
                                    toastr.warning("暂无可发放标志卡")
                                }
                                break;
                            case  stu_list:
                                this.stu_list = data.data.list;
                                if(data.data.list.length==0){
                                    toastr.warning("暂无学生")
                                }

                                break;
                            case  card_save:
                                if(status==200){
                                    toastr.success("发卡成功");
                                    window.location="#incentive_card_type_see";
                                }else {
                                    toastr.error(msg);
                                }
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //   年月日-年月日时分秒
                getMyDate:function(str){
                    var oDate = new Date(str),
                        oYear = oDate.getFullYear(),
                        oMonth = oDate.getMonth()+1,
                        oDay = oDate.getDate(),
                        oHour = oDate.getHours(),
                        oMin = oDate.getMinutes(),
                        oSen = oDate.getSeconds(),
                        oTime = oYear +'-'+ this.getzf(oMonth) +'-'+ this.getzf(oDay) +' '+ this.getzf(oHour) +':'+ this.getzf(oMin) +':'+this.getzf(oSen);//最后拼接时间
                    return oTime;
                },
                //补0操作
                getzf:function(num){
                    if(parseInt(num) < 10){
                        num = '0'+num;
                    }
                    return num;
                }

            });
            table.$watch('onReady', function () {
                table.cds();
                $(".js-example-basic-single").select2();
                $("#student_select").on("change", function (e) {
                    table.other.stu_info = $("#student_select").val();
                    table.data.student_guid = table.other.stu_info.substring(0, table.other.stu_info.indexOf("|"));
                    table.data.code= table.other.stu_info.substring(table.other.stu_info.indexOf("/") + 1, table.other.stu_info.length);
                    table.data.name = table.other.stu_info.substring(table.other.stu_info.indexOf("|") + 1, table.other.stu_info.indexOf("/"));

                });
            });
            return table;
        };
        return {
            view: html,
            define: avalon_define,
            date_input: {startDate: "my-datepicker", type: 3}
        }
    });