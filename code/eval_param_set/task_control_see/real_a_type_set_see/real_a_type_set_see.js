/**
 * Created by Administrator on 2018/6/1.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('eval_param_set', 'task_control_see/real_a_type_set_see/real_a_type_set_see','html!'),
        C.Co('eval_param_set', 'task_control_see/real_a_type_set_see/real_a_type_set_see','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CMF("table/table.js"),
        C.CM("three_menu_module")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,table,three_menu_module) {
        //列表
        var api_page_list=api.growth+"page_list_type";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "real_a_type_set_see",
                // 数据接口
                url: api_page_list,
                //当前页面：类型设置-1，上传数量设置-2，积分规则设置-3，任务开放时间设置-4，个性特长-5
                sit_type:1,
                data: {
                    offset: 0,
                    rows: 10
                },
                // 请求参数
                extend: {
                    type_name: "",
                    type: "",
                    __hash__:""
                },
                is_init:true,
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
                ],
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

                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
            });
            vm.$watch('onReady', function () {

            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });