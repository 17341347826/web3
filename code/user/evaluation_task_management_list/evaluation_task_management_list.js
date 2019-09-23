define(["jquery", C.CLF('avalon.js'), 'date_zh','layer','amazeui',
        C.Co('user','evaluation_task_management_list/evaluation_task_management_list','css!'),
        C.Co('user','evaluation_task_management_list/evaluation_task_management_list','html!'),
        C.CMF("router.js"), C.CMF("data_center.js"), C.CM("table"),
        C.CM('three_menu_module')
    ],
    function($, avalon, date_zh,layer,amazeui, css,html, x, data_center, tab,three_menu_module) {
        //获取系统当前时间
        var api_get_server_time=api.api+'base/baseUser/current_time';
        // 查询
        var api_student_audited=api.api + "everyday/page_module_switch";
        //添加或者修改
        var api_add_or_update=api.api+"everyday/save_module_switch";
        var avalon_define = function() {
            var table = avalon.define({
                $id: "table",
                // 数据接口
                url: api_student_audited,
                is_init: false,
                current_time:"",
                index:"",
                data: {
                    offset:0,
                    rows:15
                },
                // 请求参数
                extend: {
                    __hash__: ""
                },
                module_arr:[
                    {id:1,value:'自我描述'},
                    {id:2,value:'同学寄语'},
                    {id:3,value:'家长寄语'},
                    {id:4,value:'教师寄语'},
                    {id:5,value:'目标与计划'},
                    {id:6,value:'实现情况'}
                ],
                modal_data:{
                    end_time:"",
                    module_type:"",
                    start_time:"",
                    is_switch:''
                },
                request_module:"",
                is_start_update:"",
                is_end_update:"",
                old_start_time:"",
                old_end_time:"",
                old_is_switch:"",
                // 表头名称
                 theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                },
                    {
                        title: "模块",
                        type: "cover_text",
                        from: "module_type",
                        dict: {
                            '1': '自我描述',
                            '2': '同学寄语',
                            '3': '家长寄语',
                            '4': '教师寄语',
                            '5': '目标计划',
                            '6': '目标实现情况'
                        }
                    },
                    {
                        title: "开始时间",
                        type: "text",
                        from: "start_time"
                    },
                    {
                        title: "结束时间",
                        type: "text",
                        from: "end_time"
                    },
                     {
                         title: "使用状态",
                         type: "html",
                         from:
                         "<span class='am-icon-toggle-on' ms-visible='el.is_switch==true' ms-on-click='@oncbopt({current:$idx, type:2})'></span>"+
                         "<span class='am-icon-toggle-off'  ms-visible='el.is_switch==false' ms-on-click='@oncbopt({current:$idx, type:3})'></span>"
                     },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='编辑'>" +
                        "</a>"
                    }
                ],
                add:function () {
                    ajax_post(api_student_audited,{},this);
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        self.user_type = data.data.user_type;
                    });
                    ajax_post(api_get_server_time,{},self);
                    self.is_init = true;

                },
                cbopt: function(params) {
                    var current_time=$(".current_time").text();
                    var pa_start=params.data.start_time;
                    var pa_end=params.data.end_time;
                    var module_type=params.data.module_type;
                    this.modal_data.start_time=pa_start;
                    this.modal_data.end_time=pa_end;
                    // 当前数据的id
                    if (params.type == 1) { //编辑
                        this.old_is_switch = params.data.is_switch;
                        this.modal_data.module_type=module_type;
                        for(var i=0;i<this.module_arr.length;i++){
                            if(module_type==this.module_arr[i].id){
                                this.request_module=this.module_arr[i].value;
                            }
                        }
                        this.old_start_time=pa_start;
                        this.old_end_time=pa_end;
                        $("#update-confirm").modal({
                            closeOnConfirm: false
                        });
                    }else if(params.type == 2){
                        this.index=3;
                        ajax_post(api_add_or_update,{end_time:pa_end,is_switch:false,module_type:module_type,start_time:pa_start},this);

                    }else if(params.type == 3){
                        this.index=3;
                        ajax_post(api_add_or_update,{end_time:pa_end,is_switch:true,module_type:module_type,start_time:pa_start},this);

                    }
                },
                //开始时间
                start_time:function () {
                    $('#start-time')
                        .datetimepicker()
                        .on('changeDate', function(e){
                            table.modal_data.start_time = e.currentTarget.value;
                        });
                    if(table.modal_data.end_time!=''){
                        $('#start-time').datetimepicker('setEndDate', table.modal_data.end_time);
                    }
                },
                //结束时间
                end_time:function () {
                    $('#end-time')
                        .datetimepicker()
                        .on('changeDate', function(e){
                            table.modal_data.end_time = e.currentTarget.value;
                        });
                    $('#end-time').datetimepicker('setStartDate', table.modal_data.start_time);


                },
                //修改开始时间
                update_start_time:function () {
                    $('#update-start-time')
                        .datetimepicker()
                        .on('changeDate', function(e){
                            table.modal_data.start_time = e.currentTarget.value;
                        });
                    if(table.modal_data.end_time!=''){
                        $('#update-start-time').datetimepicker('setEndDate', table.modal_data.end_time);
                    }
                },
                //修改完成时间
                update_end_time:function () {
                    $('#update-end-time')
                        .datetimepicker()
                        .on('changeDate', function(e){
                            table.modal_data.end_time = e.currentTarget.value;
                        });
                    $('#update-end-time').datetimepicker('setStartDate', table.modal_data.start_time);

                },
                //取消
                cancel_module:function () {
                    this.modal_data.end_time="";
                    this.modal_data.module_type="";
                    this.modal_data.start_time="";
                },
                //添加
                add_module:function (val) {
                    if(this.modal_data.module_type==0){
                        toastr.warning('请选择需要设置的模块');
                        return;
                    }else if(this.modal_data.start_time==''){
                        toastr.warning('请设置开始时间');
                        return;
                    }else if(this.modal_data.end_time==''){
                        toastr.warning('请设置结束时间');
                        return;
                    }else{
                        if(val==1){//新增
                            this.modal_data.is_switch = true;
                            this.index=1;
                        }else{//修改
                            this.modal_data.is_switch = this.old_is_switch;
                            this.index=2
                        }
                        ajax_post(api_add_or_update,this.modal_data.$model,this);
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询
                            case api_student_audited:
                                this.complete_student_audited(data);
                                break;
                            //获取系统的当前时间
                            case api_get_server_time:
                                this.current_time=data.data.current_time;
                                break;
                            case api_add_or_update:
                                toastr.success('设置成功');
                                if(this.index == 1){
                                    $("#add-confirm").modal({
                                        closeOnConfirm: true
                                    });
                                }else if(this.index == 2){
                                    $("#update-confirm").modal({
                                        closeOnConfirm: true
                                    });
                                }else if(this.index == 3){

                                }
                                this.modal_data.end_time="";
                                this.modal_data.module_type="";
                                this.modal_data.start_time="";
                                this.extend.__hash__=new Date();
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                data_list_index_arr:[],
                complete_student_audited:function(data){
                    var dataList=data.data.list;
                    var dataList_Length=dataList.length;
                    if(dataList_Length==this.module_arr.length){
                        toastr.warning('暂无可添加的模块')
                    }else{
                       //------------------------------------
                        for(var i=0;i<dataList_Length;i++){
                            for(var j=0;j<this.module_arr.length;j++){
                                if(this.module_arr[j].id==dataList[i].module_type){
                                    this.data_list_index_arr.push(j);
                                }
                            }
                        }
                        this.data_list_index_arr.sort();
                        while (this.data_list_index_arr.length>0){
                            var index = this.data_list_index_arr[0];
                            this.module_arr.removeAt(index);
                            this.data_list_index_arr.splice(0,1);
                            for(var k=0;k<this.data_list_index_arr.length;k++){
                                this.data_list_index_arr[k] = this.data_list_index_arr[k]-1;
                            }
                        }
                        //---------------------------------
                        $("#add-confirm").modal({
                            closeOnConfirm: false
                        });
                    }

                }

            });
            table.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                this.cb();
                $('#start-time').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language:  'zh-CN'
                });
                $('#end-time').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language:  'zh-CN'
                });
                $('#update-start-time').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language:  'zh-CN'
                });
                $('#update-end-time').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language:  'zh-CN'
                });

            });
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });