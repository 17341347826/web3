/**
 * Created by Administrator on 2018/7/4.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("growth_incentive_card", "signCard_Objection/signCard_Objection", "css!"),
        C.Co("growth_incentive_card", "signCard_Objection/signCard_Objection", "html!"),
        "layer",
        C.CM("table"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function ($,avalon, css2, html, layer, table,data_center,three_menu_module) {
        //查询标志卡异议列表
        var card_list = api.api + "everyday/page_gain_card_by_status";
        //查询单个标志性卡
        var api_mark_card=api.api+'everyday/get_mark_card';
        //上传
        var url_api_file=api.api+"file/get";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "signCard_Objection",
                url: "",
                data:{
                    offset: 0,
                    rows: 15
                },
                //标志性卡图片
                imageUrl:'',
                //发卡时间
                card_year:'',
                card_month:'',
                card_day:'',
                //被发卡人
                stu_name:'',
                is_init: false,
                //年级
                grade_list:[],
                //班级
                class_list:[],
                only_hash:true,
                //请求参数
                extend: {
                    fk_grade_id: "",
                    fk_class_id: "",
                    fk_school_id:'',
                    status:2,
                    __hash__: ""
                },
                //传参
                schoolId:'',
                // 列表表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "学籍号",
                    type: "text",
                    from: "code"
                }, {
                    title: "姓名",
                    type: "text",
                    from: "name"
                }, {
                    title: "标志性卡",
                    type: "text",
                    from: "b_card_name"
                }, {
                    title: "创建时间",
                    type: "text",
                    from: "encourage_date"
                }, {
                    title: "异议数",
                    type: "text",
                    from: "objectionNum"
                },{
                    title: "操作",
                    type: "html",
                    from: "<a class='tab-btn tab-audit-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='审核'></a>"
                },{
                    title: "标志性卡查看",
                    type: "html",
                    from: "<a class='tab-btn tab-details-btn' data-am-modal-confirm ms-on-click='@oncbopt({current:$idx, type:1})' title='查看'></a>"
                }],
                //  列表按钮操作
                cbopt: function (params) {
                    var p_id=params.data.id;
                    var card_id=params.data.mark_card_id;
                    var encourage_date=params.data.encourage_date;
                    var name=params.data.name;
                    if (params.type == 2) {
                        // window.location="#signCard_Objection_check?p_id="+p_id;
                    }else if(params.type==1){//标志性卡查看
                        this.card_year=encourage_date.substr(0,4);
                        this.card_month=encourage_date.substr(5,2);
                        this.card_day=encourage_date.substr(8,2);
                        this.stu_name=name;
                        //图片信息
                        ajax_post(api_mark_card,{id:card_id},this);
                    }
                },
                init:function () {
                    this.cds();
                },
                //年级改变
                gradeChange:function () {
                    var gId=this.extend.gradeId;
                    this.extend.gradeId=Number(this.extend.gradeId);
                    var grade=this.grade_list;
                    for(var i=0;i<grade.length;i++){
                        var id=grade[i].grade_id;
                        if(id==gId){
                            this.class_list=grade[i].class_list;
                            this.extend.classId=grade[i].class_list[0].classId;
                        }
                    }
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        var cArr = [];
                        if (userType == "1") {
                            var tUserData = JSON.parse(data.data["user"]);
                            //班主任任课集合
                            cArr = tUserData.lead_class_list;
                            if(cArr.length!=0){
                                //年级集合
                                self.grade_list = cArr;
                                self.class_list=cArr[0].class_list;
                                //接口
                                self.url=card_list;
                                self.extend.fk_grade_id=cArr[0].grade_id;
                                self.extend.fk_class_id=cArr[0].class_list[0].class_id;
                                self.extend.fk_school_id=cArr[0].school_id;
                                self.only_hash=false;
                                self.is_init=true;
                                self.extend.__hash__=new Date();
                            }
                        }
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //查询单个标志性卡
                            case api_mark_card:
                                this.complete_mark_card(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                complete_mark_card:function(data){
                    if(data.data.attachment!=undefined){
                        var ach=JSON.parse(data.data.attachment);
                        this.imageUrl=url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + ach[0].inner_name;
                        $("#card-modal").modal({
                            closeOnConfirm: false
                        });
                    }else{
                        layer.alert('暂无标志性卡', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                    }
                },
            });
            table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
