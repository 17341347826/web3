/**
 * Created by uptang on 2017/7/7.
 */
define([
        C.CLF('avalon.js'),
        C.Co("growth_incentive_card", "trademark_card_edit/trademark_card_edit", "css!"),
        C.Co("growth_incentive_card", "trademark_card_edit/trademark_card_edit", "html!"),
        "layer",
        C.CMF("data_center.js"),C.CM("tuploader")],
    function (avalon, css, html, layer, data_center,tuploader) {
        //年级
        // var grade_list = api.api + "base/grade/findGrades.action";
        var grade_list = api.user + 'class/school_class.action';
        //提交
        var save_card = api.api + "everyday/save_mark_card";
        //上传
        var url_api_file=api.api+"file/get";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "trademark_card_edit",
                data: {
                    //	主键
                    id:"",
                    //附件
                    attachment:'',
                    //标志卡名称
                    card_name: "",
                    fk_grade_id: "",
                    grade_name: "",
                    //周期类型（必填）	string	1天2周3月4学期5年
                    cycle_type: "",
                    //	最大发卡数（必填）
                    max_number: "",
                    //发卡主体（必填）	string	0管理员1教师2学生
                    user_type: "",
                    //状态	number	-1删除0停用1使用
                    score: "",
                    //标志卡描述
                    card_describe: "",
                    //标志卡发卡标志
                    card_norm: "",
                    remark: "",
                    title:""
                },
                //年级
                grade_list: [],
                other: {
                    grade: ""
                },
                numFlag: "",
                params: {},
                update:"",
                //标志性卡图片
                photos:"",
                up:'',
                gradeChange: function () {
                    var grade = this.other.grade;
                    this.data.fk_grade_id = Number(grade.substring(0, grade.indexOf("|")));
                    this.data.grade_name = grade.substring(grade.indexOf("|") + 1, grade.length);
                },
                numReg: function () {
                    var reg = /^[1-9]*[1-9][0-9]*$/;
                    var numReg = reg.test(this.data.max_number);
                    if (!numReg) {
                        toastr.warning("请输入正整数");
                        this.numFlag = false;
                        this.data.max_number = "";
                    } else {
                        this.numFlag = true;
                    }
                },
                //提交
                submitSure: function () {
                    if (this.other.grade != "" &&
                        this.data.card_name != "" &&
                        this.data.max_number != "" &&
                        this.data.cycle_type != "" &&
                        this.data.user_type != "" &&
                        this.data.title!="" &&
                        this.data.attachment!=""
                    ) {
                        if (!this.numFlag) {
                            toastr.warning("请输入正整数");
                        } else {
                            ajax_post(save_card, this.data.$model, this);
                        }
                    } else {
                        toastr.warning("年级、名称、限制数量、周期、发卡主体、卡片文案、以及评价卡LOGO必选或必填");
                    }
                },
                init: function () {
                    function filter_null(pms) {
                        return pms == null||pms == undefined ? "":pms;
                    }
                    var card = data_center.get_key("trademark_card");
                    // console.log(card);
                    var add=data_center.get_key("trademark_card_add");
                    this.update=add;
                    this.params = card;
                    if (add!=1) {
                        this.data.id=card.data.id;
                        this.data.fk_grade_id = card.data.fk_grade_id;
                        this.data.grade_name = card.data.grade_name;
                        this.data.card_name = filter_null(card.data.card_name);
                        this.data.max_number = card.data.max_number;
                        this.data.cycle_type = card.data.cycle_type;
                        this.data.user_type = card.data.user_type;
                        this.data.card_describe = filter_null(card.data.card_describe);
                        this.data.card_norm = filter_null(card.data.card_norm);
                        this.data.remark = filter_null(card.data.remark);
                        this.data.title = filter_null(card.data.title);
                        this.data.attachment=card.data.attachment;
                        var ach=JSON.parse(card.data.attachment);
                        if(ach!=null){
                            this.photos=url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + ach[0].inner_name;
                        }
                        this.numReg();
                    }
                    this.cd();
                },
                token:'',
                up:'',
                cd:function(){
                    var self=this;
                    data_center.uin(function(data){
                        var user = JSON.parse(data.data.user);
                        var school_id = user.fk_school_id;
                        //请求年级
                        ajax_post(grade_list, {school_id: school_id}, self);
                        self.token=window.sessionStorage.getItem("token");
                        self.up = tuploader.init("report",self.token,
                            function(up, file, status){
                                var data=tuploader.result();
                                var status=data[0].status;
                                if(status=="success"){
                                    self.data.attachment=JSON.stringify(data);
                                    // console.log(self.data.attachment);
                                    self.photos = url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + data[0].inner_name;
                                }
                        });
                    });
                },
                cancel: function () {
                    window.location = "#school_iconic_card";
                    data_center.set_key("trademark_card_edit", 2);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case  grade_list:
                                this.grade_list = data.data;
                                if (this.update == 2) {
                                    this.other.grade = this.params.data.fk_grade_id + "|" + this.params.data.grade_name;
                                }
                                break;
                            case  save_card:
                                var self=this;
                                toastr.success('设置成功');
                                if (status == 200) {
                                    setTimeout(function () {
                                        self.cancel();
                                    },2500)
                                }
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });
            table.$watch('onReady',function(){
                table.init();
            });
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
