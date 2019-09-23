define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("all_index", "special_personality_scheme/special_personality_scheme", "css!"),
        C.Co("all_index", "special_personality_scheme/special_personality_scheme", "html!"),
        "layer",
        C.CM('three_menu_module'),
        C.CMF("data_center.js")],
    function ($,avalon, css, html, layer,three_menu_module,data_center) {
        var avalon_define = function (pmx) {
            //查询模块下对应的类型
            var api_list_type = api.growth+"page_list_type";
            //查询列表
            var api_check_list = api.growth+"find_personality_set_list";
            //保存或修改
            var api_save_or_update = api.growth+"save_or_update_persona_set";
            //删除
            var api_delete_personality_set = api.growth+"delete_personality_set";
            var table = avalon.define({
                $id: "special_personality_scheme",
                //单位id
                guid:'',
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
                //新增
                add_special:function(){
                    this.index = 1;
                    this.disabled = false;
                    //显示 Modal 窗口
                    $("#my-prompt").modal({
                        closeOnConfirm: false
                    });
                    this.spec_choose = this.spec_choose_list[0].id+"|"+this.spec_choose_list[0].index_name;
                    this.add_data.fk_realistic_moduletid = Number(this.spec_choose_list[0].id);
                    this.add_data.realistic_modulet = this.spec_choose_list[0].index_name;
                    this.request_module.type = this.add_data.fk_realistic_moduletid;
                    ajax_post(api_list_type,this.request_module,this);
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
                save_btn:function () {
                    var a=0;
                    //获取已设置的
                    var existData = this.list_info.$model;
                    var existDataLength = existData.length;
                    for(var i=0;i<existDataLength;i++){
                        if(
                            this.add_data.fk_ps_type_id == existData[i].fk_ps_type_id &&
                            this.add_data.ps_type_name == existData[i].ps_type_name &&
                            this.add_data.fk_realistic_moduletid == existData[i].fk_realistic_moduletid &&
                            this.add_data.realistic_modulet == existData[i].realistic_modulet

                        ){
                            a++;

                        }else{

                        }
                    }
                    if(a == 0){
                        if(this.index == 1){//新增
                            this.add_data.id = '';
                        }else{//修改
                            this.add_data.id = this.old_id;
                        }
                        ajax_post(api_save_or_update,this.add_data,this);
                    }else{
                        this.msg = '该模块已经设置!';
                        return;
                    }





                },
                //取消
                cancel_btn:function(){

                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        var tUserData = JSON.parse(data.data["user"]);
                        self.guid = tUserData.guid;
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
                        //保存或修改
                        case api_save_or_update:
                            this.complete_save_or_update(data);
                            break;
                        //删除
                        case api_delete_personality_set:
                            this.complete_delete_personality_set(data);
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
                complete_save_or_update:function (data) {
                    $("#my-prompt").modal({
                        closeOnConfirm: true
                    });
                    this.msg = '';
                    ajax_post(api_check_list,{},this);
                },
                //删除
                del_btn:function (el) {
                    var id = el.id;
                    ajax_post(api_delete_personality_set,{id:id},this);
                },
                complete_delete_personality_set:function (data) {
                    ajax_post(api_check_list,{},this);
                },
                //修改
                edit_btn:function (el) {
                    this.index = 2;
                    this.disabled = true;
                    this.old_id = el.id;
                    this.old_fk_ps_type_id = el.fk_ps_type_id;
                    this.old_ps_type_name = el.ps_type_name;
                    //显示 Modal 窗口
                    $("#my-prompt").modal({
                        closeOnConfirm: false
                    });
                    this.request_module.type = el.fk_realistic_moduletid;
                    this.spec_choose = el.fk_realistic_moduletid+'|'+el.realistic_modulet;
                    ajax_post(api_list_type,this.request_module,this);
                }
            });
            table.cds();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });