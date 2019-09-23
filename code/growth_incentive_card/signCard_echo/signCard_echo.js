/**
 * Created by Administrator on 2018/7/4.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("growth_incentive_card", "signCard_echo/signCard_echo", "css!"),
        C.Co("growth_incentive_card", "signCard_echo/signCard_echo", "html!"),
        C.CMF("viewer/viewer.js"),C.CMF("uploader/uploader.js"),
        "layer",C.CM("three_menu_module"),
        C.CMF("data_center.js")],
    function ($,avalon,css, html,viewer,uploader, layer,three_menu_module, data_center) {
        //文件上传
        var api_file_uploader = api.api+"file/uploader";
        //标志卡
        var card_list = api.api + "everyday/find_mark_card";
        // //保存标志卡
        // var card_save = api.api + "everyday/give_gain_card";
        //修改标志性卡
        var update_card=api.api+ "everyday/update_gain_card";
        //标志卡详情
        var card_detail=api.api+"everyday/get_gain_card";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "signCard_echo",
                files: [],
                files_length:'',
                uploader_url: api_file_uploader,
                //状态：记录，修改
                type:'',
                //记录id
                card_id:'',
                //标志卡
                card_list:[],
                fk_grade_id:'',
                card_name:"",
                //信息
                stu_info:"",
                other:{
                    attachment:[],
                    grade_name:"",
                    class_name:"",
                    mark_card_id:'',
                    encourage_date:'',
                    //记录id
                    id:''
                },
                // update:{
                //     attachment:'',
                //     id:"",
                //     mark_card_id:'',
                //     encourage_date:''
                // },
                //标志性卡
                get_cardList:function(){
                    ajax_post(card_list,{fk_grade_id:this.fk_grade_id},this);
                },
                //提交
                submitSure:function () {
                    var uploaderWorks = data_center.ctrl("card_uploader");
                    var files = uploaderWorks.get_files();
                    var is_complete=uploaderWorks.is_finished();
                    if(is_complete==true){
                        vm.other.attachment = JSON.stringify(files);
                    }
                    if (
                        this.other.encourage_date!=""&&
                        this.other.mark_card_id!=""&&
                        is_complete==true &&
                        files.length>0
                    ) {
                        var self = this;
                        layer.open({
                            title: "提示",
                            content: '是否修改卡片？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                layer.close(index);
                                self.files_length=files.length;
                                ajax_post(update_card,self.other.$model, self)
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    } else {
                        toastr.warning("所有选项必选")
                    }
                },
                // //日期
                // getCompleteDate:function () {
                //     var self=this;
                //     var datepicker=$("#my-datepicker");
                //     datepicker.on("change", function(event) {
                //         self.data.encourage_date = event.delegateTarget.defaultValue;
                //     });
                //     datepicker.datepicker('open');
                // },
                //取消
                cancel:function () {
                    // this.other.encourage_date="";
                    // this.other.mark_card_id="";
                    // this.other.attachment=[];
                    // this.files ='';
                    window.location="#incentive_card_type_see";
                },
                //获取修改状态
                getType:function () {
                    this.type=pmx.params_type;
                },
                //获取记录id
                getId: function() {
                    this.card_id = pmx.pId;
                },
                /*修改--回显数据*/
                product_modify: function() {
                    ajax_post(card_detail, { id: Number(this.card_id)}, this);
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        var cArr = [];
                        if (userType == "1") {
                            var tUserData = JSON.parse(data.data["user"]);
                            // cArr= tUserData.lead_class_list;
                            // self.grade_list=cArr;
                            // self.data.fk_school_id=tUserData.fk_school_id;
                            // self.data.school_name=tUserData.school_name;
                        }
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //详情--数据回显
                            case card_detail:
                                this.complete_cardDetail(data);
                                break;
                            //    标志性卡列表
                            case card_list:
                                this.complete_cardList(data);
                                break;
                            case  update_card:
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
                complete_cardDetail:function(data){
                    this.other=data.data;
                    console.log(this.other);
                    this.other.mark_card_id="";
                    this.card_name=data.data.card_name;
                    this.files = data.data.attachment || [];
                    this.stu_info=data.data.name+"-"+data.data.code;
                    this.fk_grade_id=data.data.fk_grade_id;
                    this.card_name=data.data.card_name;
                    this.get_cardList();
                },
                //    标志性卡列表
                complete_cardList:function(data){
                    this.card_list=data.data;
                    // var cId=this.other.mark_card_id;
                    // var len=this.card_list.length;
                    // for(var i=0;i<len;i++){
                    //     var id=data.data[i].id;
                    //     if(cId==id){
                    //
                    //     }
                    // }
                }
            });
            vm.$watch('onReady', function () {
                this.cds();
                this.getType();
                this.getId();
                /*有punish_id是修改*/
                if(vm.card_id){
                    vm.product_modify();
                }
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define,
            date_input: {startDate: "my-datepicker", type: 3}
        }
    });