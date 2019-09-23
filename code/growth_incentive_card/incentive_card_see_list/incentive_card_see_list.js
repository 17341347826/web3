/**
 * Created by Administrator on 2018/6/18.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("growth_incentive_card", "incentive_card_see_list/incentive_card_see_list", "css!"),
        C.Co("growth_incentive_card", "incentive_card_see_list/incentive_card_see_list", "html!"),
        "layer",
        C.CM("table"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function ($,avalon, css, html, layer, table,data_center,three_menu_module) {
        //获卡详情列表
        var card_list = api.api + "everyday/page_gain_card";
        //查询单个标志性卡
        var api_mark_card=api.api+'everyday/get_mark_card';
        //上传
        var url_api_file=api.api+"file/get";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "incentive_card_see_list",
                url: card_list,
                data:{
                    offset: 0,
                    rows: 10
                },
                is_init: false,
                extend: {
                    card_name:"",
                    user_type:"",
                    start_date: "",
                    end_date: "",
                    student_guid:"",
                //记录状态	number	0：撤销 1：公示，2：待审核，3：异议审核不通过，4：归档
                    status:4
                },
                //标志性卡图片
                imageUrl:'',
                //发卡时间
                card_year:'',
                card_month:'',
                card_day:'',
                //被发卡人
                stu_name:'',
                // 列表表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "成长激励卡名称",
                    type: "text",
                    from: "b_card_name"
                }, {
                    title: "获卡日期",
                    type: "text",
                    from: "encourage_date"
                }, {
                    title: "发卡主体",
                    type: "cover_text",
                    from: "b_user_type",
                    dict: {
                        1: '教师'
                    }
                },
                    {
                        title: "备注",
                        type: "text",
                        from: "b_remark"
                    }
                    ,{
                        title: "事实依据",
                        type: "html",
                        from: "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:1,attachment:el.a_attachment})' title='查看'></a>"
                    },{
                        title: "成长激励卡查看",
                        type: "html",
                        from: "<a class='tab-btn tab-details-btn' data-am-modal-confirm ms-on-click='@oncbopt({current:$idx, type:2})' title='查看'></a>"
                    }],
                other:{
                    card_name:"",
                    code:"",
                    name:"",
                    start_time: "",
                    end_time: "",
                    grade_name:"",
                    class_name:""
                },
                init: function () {
                    var card = data_center.get_key("trademark_stu_card");
                    this.other.code=card.code;
                    this.other.name=card.name;
                    this.other.grade_name=card.grade_name;
                    this.other.class_name=card.class_name;
                    this.extend.student_guid=card.student_guid;
                    this.is_init=true;
                },
                getCompleteDate:function () {
                    var self=this;
                    var datepicker=$("#my-datepicker");
                    datepicker.on("change", function(event) {
                        self.other.start_time = event.delegateTarget.defaultValue;
                        self.extend.start_date=self.other.start_time;
                    });
                    datepicker.datepicker('open');
                },
                getCompleteDates:function () {
                    var self=this;
                    var datepicker=$("#my-datepickers");
                    datepicker.on("change", function(event) {
                        self.other.end_time = event.delegateTarget.defaultValue;
                        self.extend.end_date=self.other.end_time;
                    });
                    datepicker.datepicker('open');
                },
                nameExtend:function () {
                    this.extend.card_name=this.other.card_name;
                },
                cbopt: function (params) {
                    console.log(params);
                    var self=this;
                    var id = params.data.id;
                    var card_id=params.data.mark_card_id;
                    var encourage_date=params.data.encourage_date;
                    var name=params.data.name;
                    if (params.type == 1) {
                        if (params.attachment) {
                            window.location = "#incentive_card_detail?id="+id;
                        } else {
                            toastr.warning("无事实依据");
                            return false;
                        }
                    } else if (params.type == 2) {
                        self.card_year=encourage_date.substr(0,4);
                        self.card_month=encourage_date.substr(5,2);
                        self.card_day=encourage_date.substr(8,2);
                        self.stu_name=name;
                        //图片信息
                        ajax_post(api_mark_card,{id:card_id},self);
                    }
                },
                cancel: function () {
                    var user= data_center.get_key("trademark_card_user");
                    if(user==2){
                        window.location = "#incentive_card_list";
                    }else {
                        window.location = "#school_card_result";
                        data_center.set_key("trademark_card_edit", 3);
                    }
                },
                //返回
                return_back:function(){
                    window.location.href = '#incentive_card_list';
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
                        layer.alert('暂无成长激励卡', {
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
