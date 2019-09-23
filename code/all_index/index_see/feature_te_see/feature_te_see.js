/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('all_index', 'index_see/feature_te_see/feature_te_see','html!'),
        C.Co('all_index', 'index_see/feature_te_see/feature_te_see','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("table"),
        C.CM("three_menu_module")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,table,three_menu_module) {
        var api_index_import = api.api +"Indexmaintain/batch_import_eval_index";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "feature_te_see",
                // grade_list:[{name:"初2015级", value:7},{name:"初2016级",value:8},{name:"初2017级",value:9}],
                pro_grade_list:[],
                grade_list: [],
                grade_id: "",
                //一级指标渲染数据
                first_index_list:[],
                //二级指标渲染
                second_index_list:[],
                //三级指标渲染
                third_index_list:[],
                //被选中的一级指标
                checked_first_index:0,
                //一级指标信息
                first_col:"",
                //一级指标index
                col_index:"",
                //登录人guid
                login_guid:"",
                //登录人highest_level
                login_level:"",
                //登录人单位id
                login_schoolId:"",
                //登录人用户类型
                login_type:"",
                //登陆人单位
                login_work:"",
                false_data:[],//批量导入指标错误信息
                level:"",
                init: function () {
                    //获取年级
                    var g_list = cloud.auto_grade_list({});
                    var obj1= {grade_name:'请选择年级',id:'',remark:''};
                    g_list.splice(0,0,obj1);
                    this.pro_grade_list = g_list;
                    var gradeList = any_2_select(g_list, {name: "grade_name", value: ["id"]});
                    vm.grade_list = gradeList;
                    var index_index = data_center.get_key("index_index");
                    this.level = cloud.user_level();
                    if(index_index)
                        this.checked_first_index = index_index;
                    this.login_guid = cloud.user_user().guid;
                    this.login_schoolId = cloud.user_user().fk_school_id;
                    this.login_level = cloud.user_level();
                    this.login_type = cloud.user_type();
                    this.login_work = cloud.user_school();
                    this.first_index_list = cloud.index_list_ts({index_rank:1,index_state:2,index_use_state:1});
                    if(this.first_index_list.length>0){
                        this.first_index_list.reverse();
                    }
                    if(!this.first_index_list||this.first_index_list.length == 0)
                        return;

                    this.col_index = this.checked_first_index;
                    this.first_col = this.first_index_list[this.checked_first_index];
                    var index_parent = this.first_index_list[this.checked_first_index].index_name;
                    var zb_detail = cloud.index_detail_ts_gardeId([index_parent],this.grade_id);
                    this.second_index_list = zb_detail.sec_index;
                    this.third_index_list = zb_detail.thr_index;

                },
                //年级转换
                garde_remark:function(name){
                    if(name == '七年级') return '7';
                    if(name == '八年级') return '8';
                    if(name == '九年级') return '9';
                    if(name == '请选择年级') return '';
                },
                //年级改变
                grade_change(info,index){
                    this.grade_id = '';
                    if(info != '' && info != null || info != undefined){
                        var g_name = this.pro_grade_list[index].remark;
                        this.grade_id = this.garde_remark(g_name);
                    }
                    if (this.first_index_list && this.first_index_list.length > 0) {
                        var index_parent = this.first_index_list[this.checked_first_index].index_name;
                        var zb_detail = cloud.index_detail_ts_gardeId([index_parent],this.grade_id);
                        this.second_index_list = zb_detail.sec_index;
                        this.third_index_list = zb_detail.thr_index;
                    }
                },
                //数据来源判断
                index_type_check:function(type){
                    var value = '';
                    if(type == 1){//行政指标
                        value = '行政指标';
                    }else if(type == 2){
                        value = '特色指标';
                    }
                    return value;
                },
                //一级指标使用状态
                use_state_check:function(state){
                    var value = '';
                    if(state == 1){
                        value = '启用';
                    }else if(state == 2){
                        value = '停用';
                    }else if(state == -1){
                        value = '删除';
                    }
                    return value;
                },
                //一级指标悬浮事件
                first_index_enter:function($index,el){
                    var text =  '<div>'+'创建单位：'
                        +el.index_work
                        + '</div>'
                        +'<div>'+'数据来源：'
                        +this.index_type_check(el.index_type)
                        + '</div>'
                        +'<div>'+'使用状态：'
                        +this.use_state_check(el.index_use_state)
                        + '</div>';
                    layer.tips(text,'#first-index'+$index,{
                        tips: [3, '#50C9C1'],
                        time: 2000
                    });
                },
                //点击选择一级指标
                click_first_index:function($index,el){
                    this.col_index = $index;
                    this.first_col = el;
                    this.checked_first_index = $index;
                    var index_name = el.index_name;
                    var zb_detail = cloud.index_detail_ts_gardeId([index_name],this.grade_id);
                    this.second_index_list = zb_detail.sec_index;
                    this.third_index_list = zb_detail.thr_index;
                },
                //新增一级特色
                firstIndexAdd: function (num) {
                    data_center.set_key("index_index",this.checked_first_index);
                    data_center.set_key('add_point_first_index',JSON.stringify(this.first_index_list[this.checked_first_index]))
                    if(num == 1){
                        window.location = '#add_first_index?index_type=' + 2;
                    }else if(num == 2){
                        window.location = '#a_a_element?index_type=' + 2;
                    }else{
                        window.location = '#a-k-perform?index_type=' + 2;
                    }
                },
                //删除一级指标
                del_index:function () {
                    this.delete_data(this.first_col.id);
                },
                delete_data: function (id) {
                    layer.confirm('你确定要删除吗？', {
                        btn: ['确定', '取消'] //按钮
                    }, function () {
                        //删除
                        cloud.del_first_index({id:id});
                        vm.first_index_list.splice(vm.col_index,1);
                        layer.closeAll();
                    });
                },
                //指标的启停用
                update_use_state:function ($index,el) {
                    var id = el.id;
                    var index_rank = el.index_rank;
                    if(el.index_use_state == 1){
                        layer.open({
                            title: "提示",
                            content: '是否停用该指标？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                cloud.upd_idnex_use({ id: id, index_use_state: 2,index_state:el.index_state},function (url,args,data) {
                                    if(index_rank == 1){
                                        vm.first_col = vm.first_index_list[vm.checked_first_index];
                                        vm.first_col.index_use_state = 2;
                                        vm.first_index_list[vm.checked_first_index].index_use_state = 2;

                                    }else if(index_rank == 2){
                                        vm.second_index_list[$index].index_use_state = 2;

                                    }else{
                                        vm.third_index_list[$index].index_use_state = 2;

                                    }
                                });

                                layer.close(index);
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    }else{
                        layer.open({
                            title: "提示",
                            content: '是否启用该指标？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                cloud.upd_idnex_use({ id: id, index_use_state: 1,index_state:el.index_state},function (url,args,data) {
                                    if(index_rank == 1){
                                        vm.first_col = vm.first_index_list[vm.checked_first_index];
                                        vm.first_col.index_use_state = 1;
                                        vm.first_index_list[vm.checked_first_index].index_use_state = 1;

                                    }else if(index_rank == 2){
                                        vm.second_index_list[$index].index_use_state = 1;

                                    }else{
                                        vm.third_index_list[$index].index_use_state = 1;

                                    }
                                });

                                layer.close(index);
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    }
                },
                method: function (el,$index,remark) {
                    if(remark == 2){
                        window.location = "#index_details?id="+el.id+"&index_type="+el.index_type;
                        // if($index == null){
                        //     window.location = "#add_first_index?id="+el.id+"&index_type="+el.index_type;
                        // }else{
                        //     window.location = "#a-k-perform?id="+el.id+"&index_type="+el.index_type;
                        // }
                    }
                    else if (remark == 4) { //修改
                        if(el.index_rank == 1){
                            window.location = "#a_a_element?id=" + el.id + '&index_type=' + el.index_type;
                        }
                        else if(el.index_rank == 2){
                            window.location = "#a_a_element?id=" + el.id + '&index_type=' + el.index_type;
                        }else{
                            window.location = "#a-k-perform?id=" + el.id + '&index_type=' + el.index_type;
                        }
                    } else if (remark == 5) { //删除
                        layer.confirm('你确定要删除吗？', {
                            btn: ['确定', '取消'] //按钮
                        }, function () {
                            //删除
                            cloud.del_first_index({id:el.id});
                            layer.closeAll();
                            if(el.index_rank == 2){
                                vm.second_index_list.splice($index,1);
                            }else{
                                vm.third_index_list.splice($index,1);
                            }
                        });
                    } else if (remark == 6) { //共享
                        layer.open({
                            title: "提示",
                            content: '是否确认该指标分享到指标库？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                cloud.share_index_ts({id:el.id});
                                if(el.index_rank == 1){
                                    vm.first_col = vm.first_index_list[vm.checked_first_index];
                                    vm.first_col.share_index_state = 1;
                                    vm.first_index_list[vm.checked_first_index].share_index_state = 1;
                                }else if(el.index_rank == 2){
                                    vm.second_index_list.share_index_state = 1;
                                    vm.second_index_list[$index].share_index_state = 1;
                                }else{
                                    vm.third_index_list.share_index_state = 1;
                                    vm.third_index_list[$index].share_index_state = 1;

                                }
                                layer.close(index);
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    }
                },
                file_name:"",
                modal_msg:"",
                index_import: function () {
                    $("#file").val("");
                    this.file_name = "";
                    this.modal_msg = "";
                    $("#file-uploading").modal({
                        closeOnConfirm: false
                    });

                },
                /*模版下载*/
                down_index:function () {
                    var HTTP_X = location.origin;
                    window.open(HTTP_X + "/common/template/指标信息模板.xls");
                },
                /*上传*/
                uploading:function () {
                    this.false_data = [];
                    var files=this.file_name;
                    var subFile = files.substring(files.indexOf(".") + 1, files.length);
                    if (subFile == "xlsx" || subFile == "xls") {
                        fileUpload(api_index_import,this)
                    }else{
                        vm.modal_msg = '请上传excel文件'
                    }
                },
                cancel:function () {
                    this.false_data = [];
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_index_import:
                                $("#file-uploading").modal({
                                    closeOnConfirm: true
                                });
                                vm.init();
                                break;

                        }
                    } else {
                        if(cmd == api_index_import){
                            this.false_data = data.data;
                        }else{
                            toastr.error(msg)
                        }


                    }
                }

            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });