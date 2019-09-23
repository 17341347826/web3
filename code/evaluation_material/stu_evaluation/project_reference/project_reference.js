define(["jquery",C.CLF('avalon.js'),"layer",
        C.Co("evaluation_material/stu_evaluation","evaluation","css!"),
        C.Co("evaluation_material/stu_evaluation","project_reference/project_reference","css!"),
        C.Co("evaluation_material/stu_evaluation","project_reference/project_reference","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function($,avalon, layer,css,css2, html, x, data_center,three_menu_module) {
        //获取学年学期
        var api_get_semester= api.api+"base/semester/appoint_date_part";
        //查询数据
        var api_get_info = api.api+"Indexmaintain/indexmaintain_reference";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "project_reference",
                pro_start_time:"",
                pro_end_time:"",
                add_data:{
                    class_id:"",
                    code:"",
                    end_date:"",
                    guid:"",
                    item_id:"",
                    name:"",
                    fk_plan_id:"",
                    start_date:"",
                    sex:"",
                    plan_level:''
                },
                dataList:[],
                get_info:function () {
                    this.add_data.item_id=Number(pmx.item_id);
                    this.add_data.fk_plan_id=Number(pmx.project_id);
                    this.add_data.plan_level = Number(pmx.plan_level);
                    this.pro_start_time = pmx.pro_start_time;
                    this.pro_end_time = pmx.pro_end_time;
                    this.add_data.class_id = Number(pmx.class_id);
                    ajax_post(api_get_semester,{start_date:this.pro_start_time,end_date:this.pro_end_time},this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取学年学期
                            case api_get_semester:
                                this.complete_get_semester(data);
                                break;
                            //获取数据
                            case api_get_info:
                                this.complete_get_info(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_semester:function(data) {
                    var start = data.data.start_date;
                    var end = data.data.end_date;
                    this.add_data.start_date = this.timeChuo(start);
                    this.add_data.end_date = this.timeChuo(end);
                    ajax_post(api_get_info,this.add_data,this);
                },
                complete_get_info:function (data) {
                    this.dataList = data.data;
                },
                //时间戳
                timeChuo:function(h){
                    var timestamp3 = h/1000;
                    var newDate = new Date();
                    newDate.setTime(timestamp3 * 1000);
                    Date.prototype.format = function(format) {
                        var date = {
                            "M+": this.getMonth() + 1,
                            "d+": this.getDate(),
                            "h+": this.getHours(),
                            "m+": this.getMinutes(),
                            "s+": this.getSeconds(),
                            "q+": Math.floor((this.getMonth() + 3) / 3),
                            "S+": this.getMilliseconds()
                        };
                        if (/(y+)/i.test(format)) {
                            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
                        }
                        for (var k in date) {
                            if (new RegExp("(" + k + ")").test(format)) {
                                format = format.replace(RegExp.$1, RegExp.$1.length == 1
                                    ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
                            }
                        }
                        return format;
                    };
                    var getTimeIs=newDate.format('yyyy-MM-dd');
                    return getTimeIs;
                }

            });
            vm.$watch('onReady', function() {
                this.get_info();

            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });