/**
 * Created by Administrator on 2018/6/1.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('eval_param_set', 'task_control_see/real_a_upload_num_set_see/real_a_upload_num_set_see','html!'),
        C.Co('eval_param_set', 'task_control_see/real_a_upload_num_set_see/real_a_upload_num_set_see','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CMF("table/table.js")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,table) {
        //查询
        var api_check=api.growth+"page_module_max_number";
        var avalon_define = function(pmx) {
            var table = avalon.define({
                $id: "real_a_upload_num_set_see",
                //当前页面：类型设置-1，上传数量设置-2，积分规则设置-3，任务开放时间设置-4，个性特长-5
                sit_type:2,
                modaule_type:"",
                max_number:"",
                dataList:[{
                    "max_number": "",
                    "modaule_type":"1",
                    "modaule_name":"作品作业"
                },{
                    "max_number": "",
                    "modaule_type":"2",
                    "modaule_name":"品德发展"
                },{
                    "max_number": "",
                    "modaule_type":"3",
                    "modaule_name":"成就奖励"
                },{
                    "max_number": "",
                    "modaule_type":"4",
                    "modaule_name":"实践活动"
                },{
                    "max_number": "",
                    "modaule_type":"5",
                    "modaule_name":"艺术素养"
                },{
                    "max_number": "",
                    "modaule_type":"6",
                    "modaule_name":"研究性学习"
                },{
                    "max_number": "",
                    "modaule_type":"7",
                    "modaule_name":"身心健康"
                }],
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        self.user_type = data.data.user_type;
                    });
                    ajax_post(api_check,{},self);
                },
                //页面切换
                sit_change:function(num){
                    if(num == 1){
                        window.location='#real_a_type_set_see?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type+'&start_time='+pmx.start_time+'&end_time='+pmx.end_time;
                    }else if(num == 2){
                        window.location='#real_a_upload_num_set_see?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type+'&start_time='+pmx.start_time+'&end_time='+pmx.end_time;
                    }else if(num == 3){
                        window.location='#achieve_maintenance_see?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type+'&start_time='+pmx.start_time+'&end_time='+pmx.end_time;
                    }else if(num == 5){
                        window.location='#special_personality_see?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type+'&start_time='+pmx.start_time+'&end_time='+pmx.end_time;
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询
                            case api_check:
                                this.complete_check(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                complete_check:function (data) {
                    var list=data.data.list;
                    var listLength=list.length;
                    for(var i=0;i<listLength;i++){
                        for(var j=0;j<this.dataList.length;j++){
                            if(list[i].modaule_type==this.dataList[j].modaule_type){
                                this.dataList[j].max_number=list[i].max_number;
                            }
                        }
                    }

                }
            });
            table.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                this.cb();
            });
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });