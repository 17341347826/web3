define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("eval_param_set", "task_control_see/special_personality_see/special_personality_see", "css!"),
        C.Co("eval_param_set", "task_control_see/special_personality_see/special_personality_see", "html!"),
        "layer",
        C.CM('three_menu_module'),
        C.CMF("data_center.js")],
    function ($,avalon, css, html, layer,three_menu_module,data_center) {
        var avalon_define = function (pmx) {
            //查询模块下对应的类型
            var api_list_type = api.growth+"page_list_type";
            //查询列表
            var api_check_list = api.growth+"find_personality_set_list";
            var table = avalon.define({
                $id: "special_personality_see",
                msg:"",
                disabled:false,
                index:'',//1新增 2修改
                //当前页面：类型设置-1，上传数量设置-2，积分规则设置-3，任务开放时间设置-4 ，个性特长-5
                sit_type:5,
                old_id:"",
                old_fk_ps_type_id:"",
                old_ps_type_name:"",
                list_info:[],
                spec_choose:"",
                real_choose:"",
                spec_choose_list:[
                    {id:2,index_name:'思想品德'},
                    {id:6,index_name:'学业水平'},
                    {id:7,index_name:'身心健康'},
                    {id:5,index_name:'艺术素养'},
                    {id:4,index_name:'社会实践'},
                    // {id:1,index_name:'作品作业'},
                    {id:3,index_name:'成就奖励'}
                ],
                request_module:{
                    offset:0,
                    rows:15,
                    type:"",
                    type_name:""
                },
                //模块集合
                second_choose_list:[],
                add_data:{
                    //特长类型id
                    fk_ps_type_id:"",
                    //特长类型name
                    ps_type_name:"",
                    //模块id
                    fk_realistic_moduletid:"",
                    //所属写实模块
                    realistic_modulet:"",
                    id:""//修改传
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
                //获取模块下对应的类型
                specChoose:function () {
                    this.msg = '';
                    var get_module = this.spec_choose;
                    this.add_data.fk_realistic_moduletid = Number(get_module.split('|')[0]);
                    this.add_data.realistic_modulet = get_module.split('|')[1];
                    this.request_module.type = this.add_data.fk_realistic_moduletid;
                    // this.request_module.type_name = this.add_data.realistic_modulet;
                    ajax_post(api_list_type,this.request_module,this);

                },
                //切换个性特长
                realChoose:function () {
                    this.msg = '';
                    var get_info = this.real_choose;
                    this.add_data.fk_ps_type_id = Number(get_info.split('|')[0]);
                    this.add_data.ps_type_name = get_info.split('|')[1];
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        var tUserData = JSON.parse(data.data["user"]);
                        ajax_post(api_check_list,{},self);
                    });
                },
                on_request_complete:function(cmd, status, data, is_suc, msg){
                    switch(cmd){
                        //查询
                        case api_check_list:
                            this.complete_check_list(data);
                            break;
                        //获取模块下对应的类型
                        case api_list_type:
                            this.complete_list_type(data);
                            break;
                    }
                },
                complete_list_type:function (data) {
                    this.second_choose_list = data.data.list;
                    if(this.index == 1){
                        this.real_choose = this.second_choose_list[0].id+"|"+this.second_choose_list[0].type_name;
                        this.add_data.fk_ps_type_id = Number(this.second_choose_list[0].id);
                        this.add_data.ps_type_name = this.second_choose_list[0].type_name;
                    }else{
                        // this.old_fk_ps_type_id = el.fk_ps_type_id;
                        // this.old_ps_type_name = el.ps_type_name;
                        this.real_choose = this.old_fk_ps_type_id+"|"+this.old_ps_type_name;
                        this.add_data.fk_ps_type_id = this.old_fk_ps_type_id;
                        this.add_data.ps_type_name = this.old_ps_type_name;
                    }
                },
                //查询列表
                complete_check_list:function (data) {
                    this.list_info = data.data;
                },
            });
            table.cds();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });