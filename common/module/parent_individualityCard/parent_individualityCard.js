/**
 * Created by Administrator on 2017/10/12.
 */
define([
        C.CLF('avalon.js'),
        C.CM("parent_individualityCard","css!"),
        C.CM("parent_individualityCard","html!"),
        "layer", C.CM("tuploader"),
        C.CMF("formatUtil.js"),
        C.CMF("data_center.js"),],
    function (avalon,css, html, layer,tuploader,formatUtil,data_center) {
        //保存学生用户照片
        var photo=api.api+"base/student/edit_stu_photo";
        //获取指定学生用户信息
        var appoint_student_user = api.user+"baseUser/get_appoint_student_user.action";
        var card_list = api.growth + "card_list";
        var url_api_file=api.api+"file/get";
        var detail = avalon.component('ms-ele-parentStu-card', {
            template: html,
            defaults: {
                card_update:"",
                //可编辑状态,1可编辑，0不可编辑
                updateFlag: "",
                guid: "",
                //文本域状态，1显示，0不显示
                txtFlag: "",
                userType:"",
                //名片列表
                cardList: [],
                //编辑修改数据
                data: [],
                //学生信息
                stuInfo: {},
                token:"",
                up:[],
                url:"",
                //编辑
                update: function () {
                    this.txtFlag = 1;
                    this.updateFlag=0;
                },
                //取消
                cancel: function () {
                    this.txtFlag = 0;
                    this.updateFlag=1;
                },
                //确定
                confirm: function () {
                    ajax_post(this.card_update, this.cardList, this);
                },
                onReady:function () {
                    var self = this;
                    data_center.uin(function (data) {
                        self.userType = data.data.user_type;
                        if(self.userType==2){
                            self.token=window.sessionStorage.getItem("token");
                            this.up = tuploader.init("report",self.token,
                                function(up, file, status){
                                    var data=tuploader.result();
                                    var status=data[0].status;
                                    if(status=="success"){
                                        ajax_post(photo,{
                                            photo:JSON.stringify(data[0]),
                                            student_id:self.stuInfo.user_id
                                        },self)
                                    }
                                });
                        }
                    });

                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if(is_suc){
                        switch (cmd) {
                            case  this.card_update:
                                if(status==200){
                                    this.txtFlag=0;
                                    this.updateFlag=1;
                                    layer.msg("保存成功");
                                }
                                break;
                            case photo:
                                if(status==200){
                                    layer.msg("图片上传成功");
                                    ajax_post(appoint_student_user, {guid: this.stuInfo.guid}, this);
                                }
                                break;
                            case   appoint_student_user:
                                if(status==200){
                                    this.stuInfo = data.data;
                                    var urlP=JSON.parse(this.stuInfo.photo);
                                    this.url = url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + urlP.inner_name;
                                }
                                break;
                        }
                    }else{
                        layer.msg(msg);
                    }
                }
            }
        });

    });