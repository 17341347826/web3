/**
 * Created by Administrator on 2018/5/24.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('practice_management', 'management_list/management_list', 'html!'),
        C.Co('practice_management', 'management_list/management_list', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),
        C.CM("table")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, three_menu_module,table) {
        //查询列表(市级和区县级)
        var api_check_list = api.api + "GrowthRecordBag/page_activity_manage";
        //查询列表(学校级)
        var api_check_list_school = api.api + "GrowthRecordBag/page_up_activity_manage";
        //发布
        var api_launch = api.api + "GrowthRecordBag/launch_activity_manage";
        //删除
        var api_del = api.api + "GrowthRecordBag/delete_activity_manage";
        //获取教师
        var api_get_all_teacher = api.api + "base/teacher/chooseteacher.action";
        //添加指导教师
        var api_add_teacher = api.api + "GrowthRecordBag/set_activity_tutor";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "management_list",
                is_init:false,
                remember:false,
                pro_id:"",
                fill_te:"",
                choose_teacher:[],
                data: {
                    offset:0,
                    rows:15
                },
                url:'',
                // 请求参数
                extend: {
                    bt: '',
                    fk_nj_id:"",
                    fk_xq_id:"",
                    zt:"",// 0未发布1已发布2已结束
                    __hash__: ""
                },
                params:{
                    login_level:"",
                    guid:""
                },
                grade_list:[],
                semester_list:[],
                all_teacher:[],
                copy_data:[],
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                },
                    {
                        title: "年级",
                        type: "text",
                        from: "njmc"
                    },
                    {
                        title: "主题",
                        type: "text_desc_width",
                        from: "bt"
                    },
                    {
                        title: "内容描述",
                        type: "text_desc_width",
                        from: "hdjj"
                    },
                    {
                        title: "开展时间",
                        type: "html",
                        from:
                        "<div class='title_a'  ms-attr='{title:el.hd_kssj + el.hd_jssj}'>{{el.hd_kssj}}-{{el.hd_jssj}}</div>"
                    },
                    {
                        title: "报名时间",
                        type: "html",
                        from:
                            "<div class='title_a'  ms-attr='{title:el.bm_kssj + el.bm_jssj}'>{{el.bm_kssj}}-{{el.bm_jssj}}</div>"
                    },
                    {
                        title: "报名人数",
                        type: "html",
                        from:
                        "<span ms-on-click='@oncbopt({current:$idx, type:4})'>{{el.bmrs}}</span>"
                    },
                    {
                        title: "结果上传人数",
                        type: "html",
                        from:
                            "<span ms-on-click='@oncbopt({current:$idx, type:5})'>{{el.scrs}}</span>"
                    },
                    {
                        title: "指导教师",
                        type: "list",
                        from: "zdls_list",
                        use_name:"zdls"
                    },
                    {
                        title: "状态",//状态0未发布1已发布2已结束
                        type: "cover_text",
                        from: "zt",
                        dict: {
                            0: '未发布',
                            1: '已发布',
                            2: '已结束'
                        }
                    },
                    {
                        title: "操作",
                        type: "html",
                        from:
                            "<a :if='el.zt == 0 && params.guid == el.fk_cjr_id' class='tab-btn tab-edit-btn' title='编辑' ms-on-click='@oncbopt({current:$idx, type:1})'></a>"+
                            "<a :if='el.zt == 0 && params.guid == el.fk_cjr_id' class='tab-btn tab-trash-btn' title='删除' ms-on-click='@oncbopt({current:$idx, type:2})'></a>"+
                            "<a :if='el.zt == 0 && params.guid == el.fk_cjr_id' class='tab-btn tab-issue-btn' title='发布' ms-on-click='@oncbopt({current:$idx, type:3})'></a>"+
                            "<a :if='el.cjpt != \"校级\" && params.login_level == 4' class='tab-btn tab-change-btn' title='指定教师' ms-on-click='@oncbopt({current:$idx, type:6})'></a>"

                    }
                ],
                init:function () {
                    var login_level = cloud.user_level();
                    if(login_level == 2 || login_level == 3){//市管理
                        this.url = api_check_list;
                    }else if(login_level == 4){//校管理
                        this.params.login_level = 4;
                        this.url = api_check_list_school;
                    }
                    this.grade_list = cloud.grade_all_list();
                    this.params.guid = cloud.user_guid();
                    this.is_init = true;
                },
                grade_change:function (el) {
                    this.extend.fk_nj_id = Number(el.value);
                    all_semester_list = cloud.grade_semester_mapping_list({grade_id:this.extend.fk_nj_id});
                    this.semester_list = any_2_select(all_semester_list, {name: "semester_name", value: ["id"]});
                    this.extend.fk_xq_id = '';
                    this.extend.__hash__ = new Date();
                },
                semester_change:function (el) {
                    this.extend.fk_xq_id = Number(el.value);
                    this.extend.__hash__ = new Date();
                },
                old_tea:[],//已经选择的教师
                cbopt: function(params) {
                    var self = this;
                    // 当前数据的id
                    var id = params.data.id;
                    var grade_id = params.data.fk_nj_id;
                    var grade_name = params.data.njmc;
                    var bt = params.data.bt;
                    if(params.type == 1){
                        window.location = '#create_practice?id='+id;
                    }else if(params.type == 2){//删除
                        layer.confirm('确定删除吗', {
                            btn: ['确定','取消'] //按钮
                        }, function(){
                            ajax_post(api_del,{id:id},self);
                            layer.closeAll();
                        }, function() {
                        });
                    }else if(params.type == 3){//发布
                        layer.confirm('确定发布吗', {
                            btn: ['确定','取消'] //按钮
                        }, function(){
                            ajax_post(api_launch,{id:id},self);
                            layer.closeAll();
                        }, function() {
                        });

                    }else if(params.type == 4 || params.type == 5){
                        window.location = '#sign_result?id=' + id + "&grade_id=" + grade_id + "&bt=" + bt + "&grade_name=" + grade_name;
                    }else if(params.type == 6){//选择教师
                        this.old_tea = params.data.zdls_list;
                        this.pro_id = id;
                        var school_id = cloud.user_school_id();
                        ajax_post(api_get_all_teacher,{fk_school_id:school_id},self);
                    }

                },
                open:function () {
                    $("#file-uploading").modal({
                        closeOnConfirm: false
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_launch:
                                this.extend.__hash__ = new Date();
                                break;
                            //删除
                            case api_del:
                                this.extend.__hash__ = new Date();
                                break;
                            case api_get_all_teacher:
                                this.complete_get_all_teacher(data);
                                break;
                            case api_add_teacher:
                                $("#file-uploading").modal({
                                    closeOnConfirm: true
                                });
                                this.extend.__hash__ = new Date();
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_all_teacher:function (data) {
                    var old_tea = this.old_tea.$model;
                    var old_length = old_tea.length;
                    var arr = [];
                    if(old_length > 0 ){//有教师，进行修改
                        for(var i = 0; i < old_length; i++){
                            var obj = {};
                            obj =  old_tea[i].fk_zdls_id + '|' + old_tea[i].zdls;
                            arr.push(obj);
                        }
                    }
                    this.all_teacher = data.data;
                    this.copy_data = data.data;
                    this.choose_teacher = arr;
                    this.open();
                },
                create:function () {
                    window.location = '#create_practice';
                },
                click_do:function () {
                    var fill_do = this.fill_te;
                    if (fill_do != null && fill_do.length > 0) {
                        this.all_teacher = [];
                        var new_arr = [];
                        var dataList = this.copy_data;
                        var dataLength = dataList.length;
                        for (var i = 0; i < dataLength; i++) {
                            var data_x = dataList[i];
                            var data_name = data_x.teacher_name;
                            if(data_name.indexOf(fill_do) != -1){
                                new_arr.push(data_x)
                            }
                        }
                        this.all_teacher = new_arr;
                    } else {
                        this.all_teacher = this.copy_data;
                    }
                },
                msg_te:"",
                save:function () {
                    var data = this.choose_teacher;
                    var length = data.length;
                    if(length == 0){
                        this.msg_te = '请选择指导教师';
                        return;
                    }else{
                        var list = [];
                        var list_x = [];
                        for(var i = 0; i < length;i++){
                            var obj = {
                                fk_zdls_id:"",
                                zdls:""
                            };
                            var data_x = data[i];
                            var guid = Number(data_x.split('|')[0]);
                            var name = data_x.split('|')[1];
                            obj.fk_zdls_id = guid;
                            obj.zdls = name;
                            list_x.push(obj);
                        }
                        list = list_x;
                    }
                    console.log(data);
                    ajax_post(api_add_teacher,{fk_hd_id:this.pro_id,list:list},this);
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
