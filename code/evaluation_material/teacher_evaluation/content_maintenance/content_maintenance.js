define(["jquery",C.CLF('avalon.js'),'layer',
        C.Co("evaluation_material","teacher_evaluation/content_maintenance/content_maintenance","css!"),
        C.Co("evaluation_material","teacher_evaluation/content_maintenance/content_maintenance","html!"),
        C.CMF("router.js"),C.CMF("data_center.js")],
    function( $,avalon,layer,css, html, x, data_center) {
        //校管理查询具体内容
        // var api_get_plan=api.api+"Indexmaintain/indexmaintain_findByPlanSubject";
        var api_get_plan=api.api+"Indexmaintain/indexmaintain_list_plan_subject";
        //市区县查看具体内容
        var api_get_plan_leader = api.api + "Indexmaintain/find_county_plan_subject_list";
        //校管理保存(修改了上级方案)
        var api_save=api.api+"Indexmaintain/indexmaintain_update_plan_subject";
        //市区县保存
        var api_save_leader=api.api+"Indexmaintain/update_county_plan_subject";
        //删除
        var api_delete_plan = '';
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "table",
                id:"",
                num:"",
                grade:"",
                plan_subject:"",
                get_plan_type:"",
                sub_subjectids:"",
                first_table_list:"",
                second_table_list:"",
                highest_level:"",
                second_table_copy:[],
                first_table_copy:[],
                get_plan_refer:"",
                get_plan_founder:"",
                get_plan_name:"",
                get_plan_level:"",
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        self.highest_level = data.data.highest_level;
                        self.grade=data_center.get_key("grade");
                        self.plan_subject=data_center.get_key("plan_subject");
                        self.id=data_center.get_key("get_id");
                        self.get_plan_type=data_center.get_key("get_plan_type");
                        self.get_plan_refer=data_center.get_key("get_plan_refer");
                        self.get_plan_founder=data_center.get_key("plan_founder");
                        self.get_plan_level=data_center.get_key("get_plan_level");
                        self.get_plan_school_type=data_center.get_key("plan_school_type");//有值代表是区或者是市级创建的方案
                        self.get_plan_name=data_center.get_key("plan_name");

                        if(self.highest_level == 2 || self.highest_level == 3){
                            ajax_post(api_get_plan_leader,{fk_plan_id:self.id},self);

                        }else{
                            ajax_post(api_get_plan,{fk_plan_id:self.id},self);

                        }
                        // self.get_id();
                        // self.check_plan();
                    });

                },
                back:function () {
                    window.location.hash = '#school_t_e_s_s'
                },
                // get_id:function () {
                //     this.grade=data_center.get_key("grade");
                //     this.plan_subject=data_center.get_key("plan_subject");
                //     this.id=data_center.get_key("get_id");
                //     this.get_plan_type=data_center.get_key("get_plan_type");
                // },
                // check_plan:function () {
                //     if(this.highest_level == 2 || this.highest_level == 3){
                //         ajax_post(api_get_plan_leader,{fk_plan_id:this.id},this);
                //
                //     }else{
                //         ajax_post(api_get_plan,{fk_plan_id:this.id},this);
                //
                //     }
                //     // ajax_post(api_get_plan,{id:this.id},this);
                // },
                //添加内容
                add_content:function () {
                    data_center.set_key("grade",this.grade);
                    data_center.set_key("plan_subject",this.plan_subject);
                    data_center.set_key("get_id",this.id);
                    data_center.set_key("get_plan_type",this.get_plan_type);
                    window.location="#add_content";
                },
                //保存(选项打分)
                save_click:function (index,el) {
                    var dataList = this.second_table_copy.$model;
                    var dataListLength = dataList.length;
                    var arr = [];//保存当前数据原有的分值
                    for(var i= 0; i<dataListLength;i++){
                        if(index == i){
                            var arr_option = dataList[i].sub_subject_data.arr_option;
                            var arr_option_length = arr_option.length;
                            for(var j = 0;j<arr_option_length;j++){
                                arr.push(Number(arr_option[j].score))
                            }
                        }
                    }
                    var get_sub_subject_data=el.sub_subject_data;
                    var get_arr_option = get_sub_subject_data.arr_option;
                    var get_value = [];//获取修改后的数据
                    for(var i =0;i<get_arr_option.length;i++){
                        if(Number(get_arr_option[i].score) > 0 || Number(get_arr_option[i].score) == 0){
                            get_value.push(Number(get_arr_option[i].score));

                        }else{
                            toastr.warning('只能填写数字');
                            return;
                        }
                    }
                    var a = 0;
                    for(var i = 0;i<get_value.length;i++){
                        if(arr[i] != get_value[i]){
                            a++;
                        }else{
                            a = 0;
                        }
                    }
                    if(a != 0){//数据有改变
                        if(this.highest_level == 2 || this.highest_level == 3){
                            ajax_post(api_save_leader,el,this);

                        }else{//学校
                            el.plan_state = 1;
                            el.sub_subject_data = JSON.stringify(el.sub_subject_data);
                            ajax_post(api_save,el,this);


                        }
                    }
                },
                //保存(直接打分)
                save_first_click:function (index,el) {
                    var dataList = this.first_table_copy.$model;
                    var dataListLength = dataList.length;
                    var old_value = 0;//保存当前数据原有的分值
                    for(var i= 0; i<dataListLength;i++){
                        if(index == i){
                            old_value = Number(dataList[i].sub_subject_data.index_value);
                        }
                    }
                    var get_sub_subject_data=el.sub_subject_data;
                    var new_value = Number(get_sub_subject_data.index_value);//获取修改后的数据
                    if(new_value != old_value){
                        if(new_value > 0 || new_value == 0){
                            if(this.highest_level == 2 || this.highest_level == 3){
                                el.sub_subject_data = JSON.stringify(el.sub_subject_data);
                                ajax_post(api_save_leader,el,this);
                            }else{//学校
                                el.plan_state = 1;
                                el.sub_subject_data = JSON.stringify(el.sub_subject_data);
                                ajax_post(api_save,el,this);
                            }
                        }else{
                            toastr.warning('只能填写数字');
                            return;
                        }
                    }
                },
                // //修改上级方案内容
                // update_parent:function (c_value) {
                //     var dataList ;
                //     var dataListLength ;
                //     if(c_value){
                //         dataList = c_value;
                //         dataListLength = c_value.length;
                //     }else{
                //         dataList = this.second_table_list.$model;
                //         dataListLength = dataList.length;
                //     }
                //     var add_data = {
                //         fk_plan_id:"",
                //         plan_name:"",
                //         plan_state:1,
                //         plan_subject_data:[]
                //     };
                //
                //     add_data.plan_name = this.get_plan_name;
                //     if(dataListLength == 0){
                //         add_data.fk_plan_id = '';
                //         add_data.plan_subject_data = [];
                //     }else{
                //         var new_arr = [];
                //         add_data.fk_plan_id = dataList[0].fk_plan_id;
                //         for(var i = 0 ;i<dataListLength;i++){
                //             var obj = {};
                //             obj['sub_subject'] = dataList[i].sub_subject;
                //             obj['sub_subject_data'] = JSON.stringify(dataList[i].sub_subject_data);
                //             obj['sub_subjectid'] = dataList[i].sub_subjectid;
                //             new_arr.push(obj)
                //         }
                //         add_data.plan_subject_data = new_arr;
                //     }
                //     ajax_post(api_save,add_data,this);
                // },
                // //对上级方案进行删除
                // update_parent_del:function (el) {
                //     var arr = [];
                //     var get_sub_subjectid = el.sub_subjectid;
                //     var dataList = this.second_table_list.$model;
                //     var dataListLength = dataList.length;
                //     for(var i = 0; i<dataListLength;i++){
                //         if(get_sub_subjectid != dataList[i].sub_subjectid){
                //             arr.push(dataList[i])
                //         }
                //     }
                //     this.update_parent(arr);
                // },
                //删除
                del_click:function (el) {
                    if(this.get_plan_level == 1){
                        //删除(上级)
                        api_delete_plan = api.api+"Indexmaintain/delete_county_plan_subject";
                    }else{
                        //删除(校级)
                        api_delete_plan = api.api+"Indexmaintain/indexmaintain_deletePlanSubject";
                    }
                    this.sub_subjectids=Number(el.sub_subjectid);
                    ajax_post(api_delete_plan,{sub_subjectids:this.sub_subjectids},this)
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询
                            case api_get_plan:
                                this.complete_get_plan(data);
                                break;
                            //查询
                            case api_get_plan_leader:
                                this.complete_get_plan(data);
                                break;
                            //删除
                            case api_delete_plan:
                                this.complete_delete_plan(data);
                                break;
                            case api_save_leader:
                                this.complete_save(data);
                                break;
                            case api_save:
                                this.complete_save(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_plan:function (data) {
                    if(data.data.length==0){
                        this.num=3;
                    }else{
                        var is_who=data.data[0].sub_subject_data.index_isoption;
                        if(is_who==2){//直接打分
                            this.num=1;
                            this.first_table_list=data.data;
                            this.first_table_copy = this.first_table_list.$model;
                        }else{//选项打分
                            this.num=2;
                            this.second_table_list=data.data;
                            this.second_table_copy = this.second_table_list.$model;
                            console.log(this.second_table_list)
                        }
                    }


                },
                complete_delete_plan:function (data) {
                    toastr.success("删除成功!");
                    this.first_table_list = [];
                    this.second_table_list = [];
                    if(this.highest_level == 2 || this.highest_level == 3){
                        ajax_post(api_get_plan_leader,{fk_plan_id:this.id},this);

                    }else{
                        ajax_post(api_get_plan,{fk_plan_id:this.id},this);

                    }
                },
                complete_save:function (data) {
                    toastr.success("修改成功!");
                    this.first_table_list = [];
                    this.second_table_list = [];
                    if(this.highest_level == 2 || this.highest_level == 3){
                        ajax_post(api_get_plan_leader,{fk_plan_id:this.id},this);

                    }else{
                        ajax_post(api_get_plan,{fk_plan_id:this.id},this);

                    }
                },
                complete_save_parent:function (data) {
                    toastr.success("修改成功!");
                    this.first_table_list = [];
                    this.second_table_list = [];
                    ajax_post(api_get_plan,{fk_plan_id:data.data},this);
                }
            });
            vm.$watch('onReady', function() {
                this.cb();
                // this.get_id();
                // this.check_plan();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });