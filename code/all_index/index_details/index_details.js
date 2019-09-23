define([
        C.CLF('avalon.js'),
        C.Co("all_index", "index_details/index_details", "css!"),
        C.Co("all_index", "index_details/index_details", "html!"),
        "layer",
        "jquery", C.CM('page_title'),
        C.CMF("data_center.js")],
    function (avalon, css, html, layer, $,page_title,data_center) {
        //评价内容详细
        var find_by_index_value = api.api + "Indexmaintain/indexmaintain_findByIndexValue";
        var avalon_define = function (pmx) {
            var table = avalon.define({
                $id: "table",
                //返回数据集合
                data:'',
                //年级
                arr_grade: [],
                // 初始化
                init: function () {
                    this.cds();
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        if(pmx.index_type!=3){//非共享
                            if(pmx.index_type==4){
                                if(pmx.type){
                                    ajax_post(find_by_index_value, {id: Number(pmx.id)}, self);
                                }else{
                                    ajax_post(find_by_index_value, {id: Number(pmx.id),index_type:4}, self);
                                }

                            }else{
                                //评价内容数据
                                ajax_post(find_by_index_value, {id: Number(pmx.id)}, self);
                            }

                        }else{
                            //评价内容数据
                            ajax_post(find_by_index_value, {id:  Number(pmx.id),index_type:3}, self);
                        }

                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    switch (cmd) {
                        case find_by_index_value:
                            this.complete_detail(data);
                            break;
                    }
                },
                complete_detail:function(data){
                    this.data=data.data;
                    // console.log(this.data);
                    if(data.data.index_grade){
                        this.arr_grade=data.data.index_grade.split(",");
                    }
                    // this.arr_grade=JSON.stringify(data.data.index_grade)

                },
                back:function () {
                    window.history.go(-1);
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