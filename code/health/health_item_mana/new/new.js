/**
 * Created by Administrator on 2018/6/21.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("health", "health_item_mana/new/new", "css!"),
        C.Co("health", "health_item_mana/new/new", "html!"),
        C.CMF("data_center.js"),"layer"],
    function ($, avalon, css, html, data_center,layer) {
        var url_analyze_excel = api.api + "score/analyze_excel";
        var url_new = api.api + "score/create_health_index"
        var avalon_define = function (pmx) {
            var new_health_item = avalon.define({
                $id: "health_item_new_index",
                form_list: [],
                current_create_index:-1,
                init: function () {
                },
                file_name:"",
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case url_analyze_excel: {
                                this.form_list = data.data;
                                break;
                            }
                            case url_new:{
                                this.form_list.splice(this.current_create_index, 1)
                                if( this.form_list.length == 0){
                                    // 跳转到列表页面
                                    window.location.href = "#health_item_mana?grade_id="+pmx.grade_id+'&is_switch='+pmx.is_switch+
                                    '&module_type='+pmx.module_type;
                                }
                                break;
                            }

                        }
                    } else {
                        if(data.status == 254){
                            toastr.error("请添加评分文件。");
                        }else{
                            toastr.error(msg);
                        }

                    }
                },
                analyze_item: function () {
                    form_data_commit(url_analyze_excel, "form_rule", this);
                },
                del_strand: function (x, y) {
                    this.form_list[x].strand.splice(y, 1)
                },
                del_ext: function (x, y) {
                    this.form_list[x].ext.splice(y, 1)
                },
                del_item: function (x) {
                    this.form_list.splice(x)
                },
                save_as:function (ip, data) {
                    this.current_create_index = ip;
                    ajax_post(url_new, data.$model, this)
                }
            });
            new_health_item.init();
            return new_health_item;
        };
        return {
            view: html,
            define: avalon_define
        }
    });