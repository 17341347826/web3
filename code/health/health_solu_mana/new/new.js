/**
 * Created by Ma Weifeng on 2017/8/2.
 */


define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("health", "health_solu_mana/new/new", "css!"),
        C.Co("health", "health_solu_mana/new/new", "html!"),
        C.CMF("data_center.js"),  "layer"],
    function ($, avalon, css, html, data_center, layer) {
        var api_get_health_solu = api.api + "score/get_health_solu";
        var api_save_or_update_solu = api.api + "score/save_or_update_solu"
        var avalon_define = function (pms) {
            var new_health_solu = avalon.define({
                $id: "new_health_solu",
                form_list: [],
                select_health: [],
                data: {
                    _id: "",
                    solu_name: "",
                    due_grade: "7",
                    status: "0",
                    health_sole_item: [],
                },
                boy: 0.0,
                girl: 0.0,
                //年级名称
                grade_name:'',
                init: function () {
                    //获取年级
                    var grade_name = pms.grade_name;
                    this.grade_name = pms.grade_name;
                    if(grade_name == '七年级'){
                        this.data.due_grade = 7;
                    }else if(grade_name == '八年级'){
                        this.data.due_grade = 8;
                    }else if(grade_name == '九年级'){
                        this.data.due_grade = 9;
                    }
                    this.data.id = pms._id ? pms._id : "";
                    ajax_post(api_get_health_solu, {"_id": this.data.id}, this)
                },
                save_as: function () {
                    this.boy = 0;
                    this.girl = 0
                    this.data.health_sole_item = [];
                    for (var i = 0; i <= this.select_health.length; i++) {
                        for (var j in this.form_list) {
                            if (this.form_list[j]._id == this.select_health[i]) {
                                if (!this.form_list[j].rate) {
                                    toastr.warning(this.form_list[j].name + "未设置权重比")
                                    return false;
                                }
                                if (this.form_list[j].rate < 0) {
                                    toastr.warning('权重比不能为负数');
                                    return
                                }
                                if(this.form_list[j].for_sex==1){
                                    this.boy+=parseFloat(this.form_list[j].rate)
                                }else{
                                    this.girl+=parseFloat(this.form_list[j].rate)
                                }
                                this.data.health_sole_item.push({
                                    "health_item": this.form_list[j]._id,
                                    "rate": this.form_list[j].rate
                                });
                                break;
                            }
                        }

                    }
                    if (this.boy != 100 || this.girl != 100) {
                        toastr.warning("权重比总数必须为100%")
                        return false
                    }
                    if (this.data.health_sole_item.length == 0) {
                        toastr.warning("请选择测试项");
                        return false
                    }
                    if(this.data.solu_name == ""){
                        toastr.warning("请设置方案名后再保存");
                        return false;
                    }
                    ajax_post(api_save_or_update_solu, this.data, this)
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_health_solu:
                                for (i in data.data.form_list) {
                                    if (!data.data.form_list[i].rate) {
                                        data.data.form_list[i]["rate"] = 0;
                                    }
                                }
                                this.form_list = data.data.form_list;
                                if (data.data.solu) {
                                    this.data = data.data.solu;
                                    for (i in this.data.health_sole_item) {
                                        this.select_health.push(this.data.health_sole_item[i].health_item)
                                        for (j in this.form_list) {
                                            if (this.form_list[j]._id == this.data.health_sole_item[i].health_item) {
                                                this.form_list[j].rate = this.data.health_sole_item[i].rate
                                                break;
                                            }
                                        }
                                    }
                                    for (i in this.form_list) {
                                        if (this.form_list[i].for_sex == 1) {
                                            this.boy += parseFloat(this.form_list[i].rate)
                                        } else {
                                            this.girl += parseFloat(this.form_list[i].rate)
                                        }
                                    }
                                }
                                break;
                            case api_save_or_update_solu:
                                window.location = "#health_solu_mana?grade_id="+pms.grade_id+'&is_switch='+pms.is_switch+
                                '&module_type='+pms.module_type;
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },

            });
            new_health_solu.init();
            return new_health_solu;
        };
        return {
            view: html,
            define: avalon_define
        }
    });