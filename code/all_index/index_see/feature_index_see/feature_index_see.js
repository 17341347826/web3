/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('all_index', 'index_see/feature_index_see/feature_index_see','html!'),
        C.Co('all_index', 'index_see/feature_index_see/feature_index_see','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("table"),
        C.CM("three_menu_module")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,table,three_menu_module) {
        var api_index_import = api.api +"Indexmaintain/batch_import_eval_index";
        //查询指标-在此针对三级指标分页
        var api_find_index = api.api + 'Indexmaintain/indexmaintain_findIndexmaintainBean';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "feature_index_see",
                //三级指标
                url:api_find_index,
                //二级指标（带'se_'是二级指标的相关信息）
                se_url:api_find_index,
                //三级指标请求参数
                extend:{
                    index_rank:3,
                    index_gradeid:'',
                    login_user_id:'',
                    index_type: 2,
                    index_parent:'',
                    index_workid:'',
                    __hash__:'',
                },
                //二级指标请求参数
                se_extend:{
                    login_user_id:'',
                    index_rank:2,
                    index_type: 2,
                    index_parent:'',
                    index_workid:'',
                    __hash__:'',
                },
                data: {
                    offset: 0,
                    rows:15,
                },
                se_data: {
                    offset: 0,
                    rows:15,
                },
                params:{
                    //登录人用户类型user_type
                    login_type:"",
                    //登录人用户等级：highest_level
                    login_level:'',
                    //登陆人单位
                    login_work:"",
                    //登录人guid
                    login_guid:"",
                    //登陆人单位id
                    login_work_id:"",
                },
                //table
                remember:false,
                //开关
                is_init: false,
                //二级指标开关
                se_is_init:false,
                // only_hash: true,
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
                //登录人用户类型user_type
                login_type:"",
                //登陆人单位
                login_work:"",
                false_data:[],//批量导入指标错误信息
                level:"",
                // 三级指标表头名称
                theadTh: [
                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    },{
                        title: "评价表现",
                        type: "text_desc",
                        from: "index_name"
                    },{
                        title: "所属要素",
                        type: "text",
                        from: "index_secondary"
                    },{
                        title: "创建单位",
                        type: "text_small",
                        from:"index_work"
                    },{
                        title: "作者",
                        type: "text_small",
                        from:"index_author"
                    },{
                        title: "来源",
                        type: "html",
                        from:
                            "<span :visible=\"el.ssdwmc == null || el.ssdwmc == '' || el.ssdwmc == undefined\">自建特色指标</span>" +
                            "<span :visible=\"el.ssdwmc != null && el.ssdwmc != '' && el.ssdwmc != undefined\">来自共享指标</span>"
                    },{
                        title: "使用状态",
                        type: "html",
                        from:"<div :if=\"el.index_work == params.login_work && params.login_type == 0 && el.index_state == 2\">" +
                            "<a :class=\"[(el.index_use_state == 1 ? 'tab-toggle-on-btn':'tab-toggle-off-btn')]\" class='tab-btn' ms-on-click='@oncbopt({current:$idx, type:1})'></a>" +
                            "</div>" +
                            "<div :if=\"params.login_type != 0 || params.login_work != el.index_work || el.index_state != 2\">" +
                            "<span :if=\"el.index_use_state == 1\">启用</span>" +
                            "<span :if=\"el.index_use_state == 2\">停用</span>" +
                            "</div>"
                    },{
                        title: "操作",
                        type: "html",
                        from:
                            "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='查看'></a>\n" +
                            "<a class='tab-btn tab-edit-btn' ms-if='el.index_founderid == params.login_guid && el.index_state!=2' ms-on-click='@oncbopt({current:$idx, type:3})' title='编辑'></a>" +
                            "<a class='tab-btn tab-edit-btn-disabled' ms-if='el.index_founderid != params.login_guid || el.index_state==2' ms-on-click='@oncbopt({current:$idx, type:4})' title='不可编辑'></a>" +
                            "<a class='tab-btn tab-trash-btn' ms-if='el.index_founderid == params.login_guid && el.index_state!=2' ms-on-click='@oncbopt({current:$idx, type:5})' title='删除'></a>" +
                            "<a class='tab-btn tab-trash-btn-disabled' ms-if='el.index_founderid != params.login_guid || el.index_state==2' ms-on-click='@oncbopt({current:$idx, type:6})' title='不可删除'></a>" +
                            "<a class='tab-btn tab-share-btn' ms-if='el.index_authorid == params.login_guid && el.index_state==2 && el.share_index_state!=1 && el.share_index_state!=2 && el.index_use_state==1' ms-on-click='@oncbopt({current:$idx, type:7})' title='共享'></a>" +
                            "<a class='tab-btn tab-share-btn-disabled' ms-if='el.index_authorid != params.login_guid || el.index_state!=2 || el.share_index_state==1 || el.share_index_state==2 || el.index_use_state!=1'  title='不可共享'></a>"
                            // "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='查看'></a>"+
                            // "<a class='tab-btn tab-export-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='导出'></a>"
                    }
                ],
                //二级指标表头
                se_theadTh:[
                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    },{
                        title: "评价要素",
                        type: "text_desc",
                        from: "index_name"
                    },{
                        title: "创建单位",
                        type: "text",
                        from: "index_work"
                    },{
                        title: "作者",
                        type: "text_small",
                        from:"index_author"
                    },{
                        title: "来源",
                        type: "html",
                        from:
                            "<span :visible=\"el.ssdwmc == null || el.ssdwmc == '' || el.ssdwmc == undefined\">自建特色指标</span>" +
                            "<span :visible=\"el.ssdwmc != null && el.ssdwmc != '' && el.ssdwmc != undefined\">来自共享指标</span>"
                    },{
                        title: "使用状态",
                        type: "html",
                        from:"<a :if=\"el.index_workid == params.login_work_id && (params.login_level == 4 || params.login_level == 3) && params.login_type == 0\" :class=\"[(el.index_use_state == 1 ? 'tab-toggle-on-btn':'tab-toggle-off-btn')]\" class='tab-btn' ms-on-click='@oncbopt({current:$idx, type:9})'></a>"+
                            "<span :if=\"el.index_use_state == 1 &&  (params.login_level != 4 || params.login_level != 3)\"></span>"+
                            "<span :if=\"el.index_use_state == 2 &&  (params.login_level != 4 || params.login_level != 3)\"></span>"
                    },{
                        title: "操作",
                        type: "html",
                        from:
                            "<a class='tab-btn tab-edit-btn' ms-if='el.index_founderid==params.login_guid && el.index_state!=2' ms-on-click='@oncbopt({current:$idx, type:10})' title='编辑'></a>" +
                            "<a class='tab-btn tab-edit-btn-disabled' ms-if='el.index_founderid!=params.login_guid|| el.index_state==2' ms-on-click='@oncbopt({current:$idx, type:11})' title='不可编辑'></a>" +
                            "<a class='tab-btn tab-trash-btn' ms-if='el.index_founderid==params.login_guid && el.index_state!=2' ms-on-click='@oncbopt({current:$idx, type:12})' title='删除'></a>" +
                            "<a class='tab-btn tab-trash-btn-disabled' ms-if='el.index_founderid!=params.login_guid || el.index_state==2' ms-on-click='@oncbopt({current:$idx, type:13})' title='不可删除'></a>" +
                            "<!--<a class='tab-btn tab-share-btn' ms-if='el.index_authorid==@login_guid && el.index_state==2 && el.share_index_state!=1 && el.share_index_state!=2 && el.index_use_state==1' ms-on-click='@method(el,$index,6)' title='共享'></a>-->\n" +
                            // "<a class='tab-btn tab-share-btn' ms-if='el.index_authorid==params.login_guid && el.index_state==2 && el.share_index_state!=1 && el.share_index_state!=2 && el.index_use_state==1' ms-on-click='@oncbopt({current:$idx, type:14})' title='共享'></a>" +
                            "<a class='tab-btn tab-share-btn' ms-if='el.index_authorid==params.login_guid && el.index_state==2 && el.share_index_state!=1 && el.share_index_state!=2 && el.index_use_state==1'  title='共享'></a>" +
                            "<a class='tab-btn tab-share-btn-disabled' ms-if='el.index_authorid!=params.login_guid || el.index_state!=2 || el.share_index_state==1 || el.share_index_state==2 || el.index_use_state!=1'  title='不可共享'></a>"
                    }
                ],
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
                    this.params.login_work_id = cloud.user_user().fk_school_id;
                    //	user_type='1' 时才有值。1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                    this.login_level = cloud.user_level();
                    this.params.login_level = cloud.user_level();
                    //0：管理员；1：教师；2：学生；3：家长
                    this.login_type = cloud.user_type();
                    this.login_work = cloud.user_school();
                    this.params.login_type = cloud.user_type();
                    this.params.login_work = cloud.user_school();
                    this.params.login_guid = cloud.user_user().guid;
                    //一级指标
                    this.first_index_list = cloud.index_list_ts({index_rank:1,index_state:'',index_use_state:''});
                    if(this.first_index_list.length>0){
                        this.first_index_list.reverse();
                    }
                    if(!this.first_index_list||this.first_index_list.length == 0)
                        return;

                    this.col_index = this.checked_first_index;
                    this.first_col = this.first_index_list[this.checked_first_index];
                    var index_parent = this.first_index_list[this.checked_first_index].index_name;
                    // var zb_detail = cloud.index_detail_ts_gardeId([index_parent],this.grade_id);
                    // this.second_index_list = zb_detail.sec_index;
                    // this.third_index_list = zb_detail.thr_index;
                    this.extend.login_user_id = cloud.user_user().guid.toString();
                    this.extend.index_gradeid = this.grade_id;
                    this.extend.index_parent = this.first_index_list[this.checked_first_index].index_name;
                    this.extend.index_workid = cloud.user_user().fk_school_id;
                    this.se_extend.index_parent = this.first_index_list[this.checked_first_index].index_name;
                    this.se_extend.index_workid = cloud.user_user().fk_school_id;
                    this.se_extend.login_user_id = cloud.user_user().guid.toString();
                    this.is_init = true;
                    this.extend.__hash__ = new Date();
                    this.se_is_init = true;
                    this.extend.__hash__ = new Date();
                },
                //三级指标table表操作
                cbopt:function(params){
                    console.log(params);
                    if(params.type == 1){//启停用
                        this.update_use_state(params.current,params.data)
                    }else if(params.type == 2){//查看
                        this.method(params.data,params.current,2);
                    }else if(params.type == 3){//编辑
                        this.method(params.data,params.current,4);
                    }else if(params.type == 4){//不可编辑
                        this.method(params.data,params.current,7);
                    }else if(params.type == 5){//删除
                        this.method(params.data,params.current,5);
                    }else if(params.type == 6){//不可删除
                        this.method(params.data,params.current,8);
                    }else if(params.type == 7){//共享
                        this.method(params.data,params.current,6);
                    }else if(params.type == 9){//启停用--二级指标
                        this.update_use_state(params.current,params.data);
                    }else if(params.type == 10){//编辑--二级指标
                        this.method(params.data,params.current,4);
                    }else if(params.type == 11){//不可编辑--二级指标
                        this.method(params.data,params.current,7);
                    }else if(params.type == 12){//删除--二级指标
                        this.method(params.data,params.current,5);
                    }else if(params.type == 13){//不可删除--二级指标
                        this.method(params.data,params.current,8);
                    }else if(params.type == 14){//共享,现在暂时屏蔽--二级指标
                        this.method(params.data,params.current,6);
                    }
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
                    if(info.value != ''){
                        if(this.login_level == 6){//教师
                            var g_name = this.pro_grade_list[index].detail.remark;
                        }else{
                            var g_name = this.pro_grade_list[index].remark;
                        }
                        this.grade_id = this.garde_remark(g_name);
                    }else{
                        this.grade_id = '';
                    }
                    if (this.first_index_list && this.first_index_list.length > 0) {
                        // var index_parent = this.first_index_list[this.checked_first_index].index_name;
                        // var zb_detail = cloud.index_detail_ts_gardeId([index_parent],this.grade_id);
                        // this.second_index_list = zb_detail.sec_index;
                        // this.third_index_list = zb_detail.thr_index;
                        this.extend.index_gradeid = this.grade_id;
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
                    // var zb_detail = cloud.index_detail_ts_gardeId([index_name],this.grade_id);
                    // this.second_index_list = zb_detail.sec_index;
                    // this.third_index_list = zb_detail.thr_index;
                    this.extend.index_parent = index_name;
                    this.se_extend.index_parent = index_name;
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
                    if(el.index_state == 1){
                        toastr.warning('该指标还未通过审核,不能进行启停用操作');
                    }else{
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
                                            // vm.second_index_list[$index].index_use_state = 2;
                                            vm.se_extend.__hash__ = new Date();

                                        }else{
                                            // vm.third_index_list[$index].index_use_state = 2;
                                            vm.extend.__hash__ = new Date();
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
                                            // vm.second_index_list[$index].index_use_state = 1;
                                            vm.se_extend.__hash__ = new Date();
                                        }else{
                                            // vm.third_index_list[$index].index_use_state = 1;
                                            vm.extend.__hash__ = new Date();
                                        }
                                    });

                                    layer.close(index);
                                },
                                btn2: function (index, layero) {
                                    layer.close(index);
                                }
                            });
                        }
                    }

                },
                method: function (el,$index,remark) {
                    if(remark == 2){
                        window.location = "#index_details?id="+el.id+"&index_type="+el.index_type+'&type='+2;
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
                                // vm.second_index_list.splice($index,1);
                                vm.se_extend.__hash__ = new Date();
                            }else{
                                // vm.third_index_list.splice($index,1);
                                vm.extend.__hash__ = new Date();
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
                                    // vm.second_index_list.share_index_state = 1;
                                    // vm.second_index_list[$index].share_index_state = 1;
                                    vm.se_extend.__hash__ = new Date();
                                }else{
                                    // vm.third_index_list.share_index_state = 1;
                                    // vm.third_index_list[$index].share_index_state = 1;
                                    vm.extend.__hash__ = new Date();

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
                },
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });