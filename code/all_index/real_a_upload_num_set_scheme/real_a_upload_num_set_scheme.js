/**
 * Created by Administrator on 2018/6/1.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('all_index', 'real_a_upload_num_set_scheme/real_a_upload_num_set_scheme','html!'),
        C.Co('all_index', 'real_a_upload_num_set_scheme/real_a_upload_num_set_scheme','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CMF("table/table.js"), C.CM("three_menu_module")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,table,three_menu_module) {
        //查询
        var api_check=api.growth+"page_module_max_number";
        //添加
        var api_add=api.growth+"save_module_max_number";
        var avalon_define = function() {
            var table = avalon.define({
                $id: "real_a_upload_num_set_scheme",
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
                edit_btn:function (el) {
                    this.modaule_type = el.modaule_type;
                    var self = this;
                    layer.prompt({title: '请填写最大上传数', formType: 3}, function(text, index){
                        if(text>0){
                            self.max_number=Number(text);
                            ajax_post(api_add,{modaule_type:self.modaule_type,max_number:self.max_number},self);
                        }else{
                            toastr.warning('请填写正整数')
                        }
                    });
                },
                //页面切换
                sit_change:function(num){
                    if(num == 1){
                        window.location='#real_a_type_set_scheme';
                    }else if(num == 2){
                        window.location='#real_a_upload_num_set_scheme';
                    }else if(num == 3){
                        window.location='#achieve_maintenance_scheme';
                    }else if(num == 4){
                        window.location='#real_a_t_t_set';
                    }else if(num == 5){
                        window.location='#special_personality_scheme';
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //添加
                            case api_add:
                                this.complete_add(data);
                                break;
                            //查询
                            case api_check:
                                this.complete_check(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                complete_add:function (data) {
                    layer.closeAll();
                    ajax_post(api_check,{},this);
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