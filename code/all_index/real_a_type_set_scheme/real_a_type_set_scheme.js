/**
 * Created by Administrator on 2018/6/1.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('all_index', 'real_a_type_set_scheme/real_a_type_set_scheme','html!'),
        C.Co('all_index', 'real_a_type_set_scheme/real_a_type_set_scheme','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CMF("table/table.js"),
        C.CM("three_menu_module")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,table,three_menu_module) {
        //列表
        var api_page_list=api.growth+"page_list_type";
        //删除
        var api_delete_type=api.growth+"delete_type";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "real_a_type_set_scheme",
                // 数据接口
                url: api_page_list,
                //当前页面：类型设置-1，上传数量设置-2，积分规则设置-3，任务开放时间设置-4，个性特长-5
                sit_type:1,
                data: {
                    offset: 0,
                    rows: 10
                },
                params:{
                    fk_school_id:"",//单位id
                },
                // 请求参数
                extend: {
                    type_name: "",
                    type: "",
                    __hash__:""
                },
                is_init:false,
                remember:false,
                // 表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                },
                    {
                        title: "活动",
                        type: "text",
                        from: "type_name"

                    },
                    {
                        title: "类型",
                        type: "cover_text",
                        from: "type",
                        dict: {
                            2: '思想品德',
                            3: '成就奖励',
                            4: '社会实践',
                            5: '艺术素养',
                            6: '学业水平',
                            7: '身心健康',
                        }
                    },
                    {
                        title: "所属性质",
                        type: "text",
                        from: "xz"
                    },
                    {
                        title: "所属评价维度",
                        type: "min_text",
                        from: "first_index_name",
                        min_width:"white-space"
                    },
                    {
                        title: "所属评价要素",
                        type: "min_text",
                        from: "second_index_name",
                        min_width:"white-space"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from:
                            "<a class='tab-btn tab-edit-btn'  ms-if='el.branch_id == params.fk_school_id' ms-on-click='@oncbopt({current:$idx, type:1})' title='编辑'></a>" +
                            "<a class='tab-btn tab-trash-btn'  ms-if='el.branch_id == params.fk_school_id' ms-on-click='@oncbopt({current:$idx, type:2})' title='删除'></a>"+
                            "<a class='tab-btn tab-edit-btn-disabled' ms-if='el.branch_id != params.fk_school_id' title='上级部门设置，不可编辑'></a>" +
                            "<a class='tab-btn tab-trash-btn-disabled' ms-if='el.branch_id != params.fk_school_id' title='上级部门设置，不可删除'></a>"
                    }
                ],
                cbopt: function(params) {
                    console.log(params);
                    // 当前数据的id
                    var id = params.data.id;
                    switch(params.type){
                        case 1:
                            window.location = "#type_set_add?type_id="+id;
                            break;
                        case 2:
                            var self = this;
                            layer.confirm('确认删除？', {
                                btn: ['确定', '取消'] //按钮
                            }, function() {
                                ajax_post(api_delete_type,{id:id},self);
                                layer.closeAll();
                            });
                            break;

                    }
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
                //增加类型
                create_type:function(){
                    window.location = '#type_set_add';
                },
                init:function () {
                    this.cb();
                },
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level=data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        self.params.fk_school_id = tUserData.fk_school_id;
                        self.is_init = true;
                        self.extend.__hash__ = new Date();
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_delete_type:
                                this.complete_api_delete_type(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_api_delete_type:function(data){
                    this.extend.__hash__=new Date();
                }
            });
            vm.$watch('onReady', function () {
                vm.init();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });