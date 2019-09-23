/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('reconsider_manage/arrange_selection', 'not_select_material/not_select_material', 'html!'),
        C.Co('reconsider_manage/arrange_selection', 'selected_material/selected_material', 'css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CM("select_assembly")
    ],
    function ($, avalon, layer, html, css, data_center, three_menu_module, select_assembly) {
        // //遴选列表数据统计五个模块的，请求时间长
        // var get_data_api = api.api + "GrowthRecordBag/student_list_up_data";
        //获取当前学生本学期未遴选材料每一个类别的份数
        var count_api = api.api + "GrowthRecordBag/count_zh_mk";
        //统计资料数量
        var api_count_zh_mk = api.api + 'GrowthRecordBag/count_zh_mk';
        //思想品德遴选列表数据
        var api_morality_list = api.api + 'GrowthRecordBag/morality_list';
        //学业水平遴选列表数据
        var api_study_list = api.api + 'GrowthRecordBag/study_list';
        //身心健康遴选列表数据
        var api_health_list = api.api + 'GrowthRecordBag/healthActivity_findByStuHealthActivity';
        //艺术素养遴选列表数据
        var api_activity_list = api.api + 'GrowthRecordBag/artactivity_findByStuArtactivity';
        //社会实践遴选列表数据
        var api_practice_list = api.api + 'GrowthRecordBag/practice_list';

        //品德遴选
        var morality_choose_api = api.api + "GrowthRecordBag/morality_chooseTypical";
        //学业水平遴选
        var study_choose_api = api.api + "GrowthRecordBag/study_chooseTypical";
        //身心健康遴选
        var health_choose_api = api.api + "GrowthRecordBag/healthActivity_chooseTypical";
        //艺术素养遴选
        var art_choose_api = api.api + "GrowthRecordBag/artactivity_chooseTypical";
        //社会实践遴选
        var practic_choose_api = api.api + "GrowthRecordBag/practice_chooseTypical";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "new_not_select_material",
                //区县名称
                district:'',
                //学生guid
                stu_guid:'',
                //核查意见
                opinion: '',
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had:false,
                //获取用户区县
                district: '',
                //请求图片
                url_img: url_img,
                user_photo: cloud.user_photo,
                //当前学年学期信息
                current_semester: '',

                //前一次请求的滚动条高度
                old_scroll_top: '',
                //当前数据总数
                current_count:0,
                //当前查询列表数据
                current_list:[],
                //当前查询列表的部分公有参数
                current_extend:{
                    offset:0,
                    rows:5,
                    sem_id:'',
                },
                //模块选中：0-思想品德，1-学业水平，2-身心健康，3-艺术素养，4-社会实践
                checked_module_index:0,
                //模块集合
                module_list:[
                    {id:1,module_name:'思想品德',cout:0,},
                    {id:2,module_name:'学业水平',cout:0,},
                    {id:3,module_name:'身心健康',cout:0,},
                    {id:4,module_name:'艺术素养',cout:0,},
                    {id:5,module_name:'社会实践',cout:0,},
                ],
                //思想品德列表
                pd_list:[],
                //品德审核请求参数
                pd_extend:{
                    activity_type:"",
                    end_time:"",
                    offset:0,
                    rows:5,
                    start_time:"",
                    // 0草稿 1待审核 2审核通过 3审核不通过 4归档
                    status:'0',
                    title:"",
                    fk_semester_id:'',
                    //0-未遴选，1-已遴选
                    isTypical:0,
                },
                //学业水平列表
                xy_list:[],
                //学业水平请求参数
                xy_extend:{
                    course_name:'',
                    course_type:'',
                    end_time:'',
                    offset:0,
                    rows:5,
                    start_time:'',
                    //  0草稿  1待审核 2审核通过 3审核不通过 4归档
                    status:'0',
                    fk_semester_id:'',
                    //0-未遴选，1-已遴选
                    isTypical:0,
                },
                //身心健康列表
                sx_list:[],
                //身心健康请求参数
                sx_extend:{
                    hea_activityType:"",
                    hea_endDate:"",
                    hea_startDate:"",
                    // -1:删除 1:待审核2:提交草稿3:未通过4:审核通过5归档
                    hea_state:'2',
                    offset:0,
                    rows:5,
                    fk_semester_id:'',
                    //0-未遴选，1-已遴选
                    isTypical:0,
                },
                //艺术素养列表
                ys_list:[],
                //艺术素养请求参数
                ys_extend:{
                    art_end_date:"",
                    art_start_date:"",
                    //-1:删除 1:待审核2:提交草稿3:未通过4:审核通过5:归档
                    art_state:'2',
                    art_type:"",
                    offset:0,
                    rows:5,
                    fk_semester_id:'',
                    //0-未遴选，1-已遴选
                    isTypical:0,
                },
                //社会实践列表
                sj_list:[],
                //社会实践请求参数
                sj_extend:{
                    activity_type:'',
                    create_time:'',
                    offset:0,
                    rows:5,
                    start_time:'',
                    // 0草稿 1待审核 2审核通过 3审核不通过 4归档
                    status:'0',
                    title:'',
                    fk_semester_id:'',
                    //0-未遴选，1-已遴选
                    isTypical:0,
                },
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                //遴选当前处理数据在列表中的序号
                current_index:-1,
                uninit:function () {
                    $(window).unbind ('scroll');
                },
                //是否执行删除操作:true-执行，false-不执行
                is_delete:false,
                //删除
                delete: function ($idx, el) {
                    this.is_delete = true;
                    var type = this.checked_module_index;
                    var id = el.id;
                    //模块  0品德 3艺术活动4社会实践1学业水平2身心健康
                    if (type == 0) {//品德发展
                        layer.confirm('是否要删除品德发展记录', {
                            btn: ['确定', '取消'] //按钮
                        }, function () {
                            layer.closeAll();
                            cloud.del_pd({id: id}, function (url, ars, data) {
                                // vm.update_info($idx);
                                // vm.current_list.splice($idx, 1);
                                vm.current_index = $idx;
                                vm.had_checked();
                                // ajax_post(api_morality_list,this.pd_extend.$model,this);
                                //统计数量--所有
                                // ajax_post(api_count_zh_mk, {
                                //     fk_xq_id: '',
                                //     //	是否典型(1典型 0非典型)
                                //     sfdx: '',
                                //     fk_xs_id: vm.stu_guid,
                                //     //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                                //     shzt: '',
                                // }, vm);
                                //获取本学期未遴选材料
                                ajax_post(count_api, {
                                    fk_xs_id: vm.stu_guid,
                                    sfdx: 0,
                                    fk_xq_id: vm.current_semester.id,
                                    shzt:0,
                                }, vm);
                            });
                        });
                    } else if (type == 3) {//艺术素养
                        layer.confirm('是否要删除艺术素养记录', {
                            btn: ['确定', '取消'] //按钮
                        }, function () {
                            layer.closeAll();
                            cloud.del_yshd({id: id}, function (url, ars, data) {
                                // vm.update_info($idx);
                                // vm.current_list.splice($idx, 1);
                                vm.current_index = $idx;
                                vm.had_checked();
                                // ajax_post(api_activity_list,this.ys_extend.$model,this);
                                //统计数量--所有
                                // ajax_post(api_count_zh_mk, {
                                //     fk_xq_id: '',
                                //     //	是否典型(1典型 0非典型)
                                //     sfdx: '',
                                //     fk_xs_id: vm.stu_guid,
                                //     //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                                //     shzt: '',
                                // }, vm);
                                //获取本学期未遴选材料
                                ajax_post(count_api, {
                                    fk_xs_id: vm.stu_guid,
                                    sfdx: 0,
                                    fk_xq_id: vm.current_semester.id,
                                    shzt:0,
                                }, vm);
                            });
                        });
                    } else if (type == 4) {// 社会实践
                        layer.confirm('是否要删除社会实践记录', {
                            btn: ['确定', '取消'] //按钮
                        }, function () {
                            layer.closeAll();
                            cloud.del_shsj({id: id}, function (url, ars, data) {
                                // vm.update_info($idx);
                                // vm.current_list.splice($idx, 1);
                                vm.current_index = $idx;
                                vm.had_checked();
                                // ajax_post(api_practice_list,this.sj_extend.$model,this);
                                //统计数量--所有
                                // ajax_post(api_count_zh_mk, {
                                //     fk_xq_id: '',
                                //     //	是否典型(1典型 0非典型)
                                //     sfdx: '',
                                //     fk_xs_id: vm.stu_guid,
                                //     //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                                //     shzt: '',
                                // }, vm);
                                //获取本学期未遴选材料
                                ajax_post(count_api, {
                                    fk_xs_id: vm.stu_guid,
                                    sfdx: 0,
                                    fk_xq_id: vm.current_semester.id,
                                    shzt:0,
                                }, vm);
                            });
                        });
                    } else if (type == 1) {// 学业水平
                        layer.confirm('是否要删除学业水平记录', {
                            btn: ['确定', '取消'] //按钮
                        }, function () {
                            layer.closeAll();
                            cloud.del_sysp({id: id}, function (url, ars, data) {
                                // vm.update_info($idx);
                                // vm.current_list.splice($idx, 1);
                                vm.current_index = $idx;
                                vm.had_checked();
                                //统计数量--所有
                                // ajax_post(api_count_zh_mk, {
                                //     fk_xq_id: '',
                                //     //	是否典型(1典型 0非典型)
                                //     sfdx: '',
                                //     fk_xs_id: vm.stu_guid,
                                //     //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                                //     shzt: '',
                                // }, vm);
                                //获取本学期未遴选材料
                                ajax_post(count_api, {
                                    fk_xs_id: vm.stu_guid,
                                    sfdx: 0,
                                    fk_xq_id: vm.current_semester.id,
                                    shzt:0,
                                }, vm);
                            });
                        });
                    } else if (type == 2) {// 身体健康
                        layer.confirm('是否要删除身体健康记录', {
                            btn: ['确定', '取消'] //按钮
                        }, function () {
                            layer.closeAll();
                            cloud.del_sxjk({id: id}, function (url, ars, data) {
                                // vm.update_info($idx);
                                // vm.current_list.splice($idx, 1);
                                vm.current_index = $idx;
                                vm.had_checked();
                                //统计数量--所有
                                // ajax_post(api_count_zh_mk, {
                                //     fk_xq_id: '',
                                //     //	是否典型(1典型 0非典型)
                                //     sfdx: '',
                                //     fk_xs_id: vm.stu_guid,
                                //     //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                                //     shzt: '',
                                // }, vm);
                                //获取本学期未遴选材料
                                ajax_post(count_api, {
                                    fk_xs_id: vm.stu_guid,
                                    sfdx: 0,
                                    fk_xq_id: vm.current_semester.id,
                                    shzt:0,
                                }, vm);
                            });
                        });
                    }
                },
                //修改
                edit: function (el) {
                    //	模块1 品德发展 2 艺术素养 3社会实践 4学业水平 5身体健康 6成就奖励 7日常表现
                    var mk = '';
                    if(this.checked_module_index == 0){
                        mk = 1;
                    }else if(this.checked_module_index == 1){
                        mk = 4;
                    }else if(this.checked_module_index == 2){
                        mk = 5;
                    }else if(this.checked_module_index == 3){
                        mk = 2;
                    }else if(this.checked_module_index == 4){
                        mk = 3;
                    }
                    if (el.fk_hd_id) {
                        window.location = '#add_pra_ma?id=' + el.id + "&mk=" +mk + "&fk_hd_id=" + el.fk_hd_id;
                    } else {
                        window.location = '#add_practice?id=' + el.id + '&mk=' +mk;
                    }
                },
                init: function () {
                    this.district = cloud.user_district();
                    this.stu_guid = cloud.user_guid();
                    ready_photo([{guid:this.stu_guid}],'guid')
                    //获取当前学年学期id
                    cloud.semester_current({},function (url,args,data) {
                        vm.current_semester = data;
                        vm.current_extend.sem_id = data.id;
                        vm.pd_extend.fk_semester_id = data.id;
                        vm.xy_extend.fk_semester_id = data.id;
                        vm.sx_extend.fk_semester_id = data.id;
                        vm.ys_extend.fk_semester_id = data.id;
                        vm.sj_extend.fk_semester_id = data.id;
                        //监听滚动
                        vm.listen_scroll();
                        //请求数据：本学期数据和当前模块
                        vm.get_data();
                    });
                },
                //监听下拉滚动
                listen_scroll: function () {
                    var self = this;
                    $(window).scroll(function () {
                        var h = $(document.body).height();//网页文档的高度
                        var c = $(document).scrollTop();//滚动条距离网页顶部的高度
                        var wh = $(window).height(); //页面可视化区域高度

                        if (Math.ceil(wh + c) >= h) {
                            if (self.current_list.length < self.current_extend.offset)
                                return;
                            self.current_extend.offset += 5;
                            self.old_scroll_top = h;
                            self.data_had = false;
                            //根据当前模块类型选择请求那个模块数据
                            self.get_list_data()
                        }
                    })
                },
                //请求数据：本学期数据和当前模块
                get_data: function () {
                    //获取本学期未遴选材料
                    ajax_post(count_api, {
                        fk_xs_id: this.stu_guid,
                        sfdx: 0,
                        fk_xq_id: this.current_semester.id,
                        shzt:0,
                    }, this);
                    // layer.load(1, {shade:[0.3,'#121212']});
                    //根据当前模块类型选择请求那个模块数据
                    this.click_module_index(this.checked_module_index)
                },
                //模块切换
                click_module_index:function(index,el){
                    //初始化列表
                    this.current_list = [];
                    this.current_count = 0;
                    this.current_extend.offset = 0;
                    this.old_scroll_top = 0;
                    this.checked_module_index = Number(index);
                    this.data_had = false;
                    this.get_list_data();
                },
                //根据模块选择请求列表数据
                get_list_data:function(){
                    var type = this.checked_module_index
                    switch (type) {
                        case 0:
                            this.pd_extend.offset = this.current_extend.offset;
                            ajax_post(api_morality_list,this.pd_extend.$model,this);
                            break;
                        case 1:
                            this.xy_extend.offset = this.current_extend.offset;
                            ajax_post(api_study_list,this.xy_extend.$model,this);
                            break;
                        case 2:
                            this.sx_extend.offset = this.current_extend.offset;
                            ajax_post(api_health_list,this.sx_extend.$model,this);
                            break;
                        case 3:
                            this.ys_extend.offset = this.current_extend.offset;
                            ajax_post(api_activity_list,this.ys_extend.$model,this);
                            break;
                        case 4:
                            this.sj_extend.offset = this.current_extend.offset;
                            ajax_post(api_practice_list,this.sj_extend.$model,this);
                            break;
                    }
                },
                //图片展开或收起，注：如果数据循环出来，逻辑不一定这么写
                open_close: function (w, index) {
                    if (w == 'open') {
                        this.current_list[index].is_open = true;
                    } else {
                        this.current_list[index].is_open = false;
                    }
                },
                //评选为遴选材料
                pass: function (el,idx) {
                    this.current_index = idx;
                    var type =this.checked_module_index;
                    switch (type) {
                        case 0://思想品德
                            this.choose(morality_choose_api, el.id);
                            break;
                        case 3://艺术素养
                            this.choose_art(art_choose_api, el.id);
                            break;
                        case 4://社会实践
                            this.choose(practic_choose_api, el.id);
                            break;
                        case 1://学业水平
                            this.choose(study_choose_api, el.id);
                            break;
                        case 2://身心健康
                            this.choose_health(health_choose_api, el.id);
                            break;
                        default:
                            break;
                    }
                },
                //遴选操作：isTypical：1典型 0非典型
                choose: function (url, id) {
                    ajax_post(url, {
                        id: id,
                        isTypical: 1,
                        status: 1
                    }, this);
                },
                //身心健康遴选操作：isTypical：1典型 0非典型
                choose_health:function (url,id) {
                    ajax_post(url, {
                        id: id,
                        isTypical: 1,
                        hea_state: 1
                    }, this);
                },
                //艺术素养遴选操作：isTypical：1典型 0非典型
                choose_art:function (url,id) {
                    ajax_post(url, {
                        id: id,
                        isTypical: 1,
                        art_state: 1
                    }, this);
                },
                deal_msg: function () {
                    var self = this;
                    layer.alert('遴选成功，等待审核！', {
                        skin: 'layui-layer-molv',
                        closeBtn: 0
                    }, function () {
                        layer.closeAll();
                        //获取本学期未遴选材料
                        ajax_post(count_api, {
                            fk_xs_id: self.stu_guid,
                            sfdx: 0,
                            fk_xq_id: self.current_semester.id,
                            shzt:0,
                        }, self);
                        self.had_checked();
                    });
                },
                //遴选通过后数据处理:index-数据在当前列表中的顺序
                had_checked:function(){
                    var index = this.current_index;
                    var list = this.current_list;
                    this.current_count --;
                    //当数据低于3条的时候调用接口
                    if(list.length<3){
                        this.current_extend.offset = 0;
                        if(this.current_count<3){
                            this.current_list = [];
                            this.old_scroll_top = 0;
                        }
                        this.data_had = false;
                        this.get_list_data();
                        return;
                    }
                    //当前数据大于3条进行手动数据删除
                    this.current_list.splice(index, 1);
                    this.module_list[this.checked_module_index].cout--;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取每一个类别的份数
                            case count_api:
                                this.complete_count_api(data);
                                break;
                            // 思想品德列表
                            case api_morality_list:
                                this.complete_data_list(data,0);
                                break;
                            //学业水平列表
                            case api_study_list:
                                this.complete_data_list(data,1);
                                break;
                            //身心健康列表
                            case api_health_list:
                                this.complete_data_list(data,2);
                                break;
                            //艺术素养列表
                            case api_activity_list:
                                this.complete_data_list(data,3);
                                break;
                            //社会实践列表
                            case api_practice_list:
                                this.complete_data_list(data,4);
                                break;
                            //思想品德遴选
                            case morality_choose_api:
                                this.deal_msg();
                                break;
                            // 艺术素养遴选
                            case art_choose_api:
                                this.deal_msg();
                                break;
                            // 社会实践遴选
                            case practic_choose_api:
                                this.deal_msg();
                                break;
                            //学业遴选
                            case study_choose_api:
                                this.deal_msg();
                                break;
                            //身心健康遴选
                            case health_choose_api:
                                this.deal_msg();
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                    if(cmd == api_morality_list || cmd == api_study_list || cmd == api_health_list || cmd == api_activity_list || cmd == api_practice_list){
                        vm.data_had = true;
                    }
                },
                //获取本学期未遴选数量
                complete_count_api:function(data){
                    var list = data.data;
                    //学期总上传数
                    for (let i = 0; i < list.length; i++) {
                        if (list[i].mkmc === '身体健康') list[i].mkmc = '身心健康';
                        if (list[i].mkmc === '品德发展') list[i].mkmc = '思想品德';
                    }
                    this.swapArr(list,1,3);
                    this.swapArr(list,2,4);
                    //接口返回模块： 1品德发展 2 艺术素养 3社会实践 4学业水平 5身体健康 6成就奖励 7日常表现
                    //对应模块当前学期未遴选数
                    this.module_list[0].cout = this.get_module_count(list,1);
                    this.module_list[1].cout = this.get_module_count(list,4);
                    this.module_list[2].cout = this.get_module_count(list,5);
                    this.module_list[3].cout = this.get_module_count(list,2);
                    this.module_list[4].cout = this.get_module_count(list,3);
                },
                /**
                 * 两个元素交换位置
                 * */
                swapArr:function(arr, index1, index2) {
                    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
                    return arr;
                },
                /**
                 * 从总遴选数组中根据模块名称获取数量
                 * */
                get_module_count:function(ary,value){
                    for(var i=0,len=ary.length;i<len;i++){
                        if(ary[i].mk == value){
                            return ary[i].num;
                        }
                    }
                },
                //五个模块列表数据处理
                complete_data_list:function(data,type){
                    this.deal_data(data);
                    this.current_count = data.data.count;
                    this.module_list[type].cout = data.data.count;
                },
                //处理列表数据
                deal_data:function(data){
                    if (!data.data)
                        return;
                    var list = data.data.list;
                    var token = sessionStorage.getItem("token");
                    for (var i = 0; i < list.length; i++) {
                        //将附件统一改为fjdz
                        if(this.checked_module_index == 0){//思想品德
                            list[i].fjdz = list[i].attachment;
                            list[i].mkmc = '思想品德';
                        }else if(this.checked_module_index == 1){//学业水平
                            list[i].fjdz = list[i].attachment;
                            list[i].mkmc = '学业水平';
                        }else if(this.checked_module_index == 2){//身心健康
                            list[i].fjdz = list[i].hea_enclosure;
                            list[i].mkmc = '身心健康';
                        }else if(this.checked_module_index == 3){//艺术素养
                            list[i].fjdz = list[i].art_enclosure;
                            list[i].mkmc = '艺术素养';
                        }else if(this.checked_module_index == 4){//社会实践
                            list[i].fjdz = list[i].attachment;
                            list[i].mkmc = '社会实践';
                        }
                        if (!list[i].fjdz || list[i].fjdz == null)
                            continue;
                        //将材料文件不全的清空
                        if(list[i].fjdz.indexOf(']') != -1){

                        }else{
                            list[i].fjdz = '[]';
                        }
                        list[i].is_open = false;
                        var fjdz = JSON.parse(list[i].fjdz);
                        list[i].img_arr = [];
                        list[i].video_arr = [];
                        list[i].file_arr = [];
                        for (var j = 0; j < fjdz.length; j++) {
                            var file_name = '';
                            if (fjdz[j].hasOwnProperty('name')) {
                                file_name = fjdz[j].name;
                            }
                            else {
                                file_name = fjdz[j].inner_name;
                            }
                            fjdz[j].down_href = api.api+'file/download_file?img=' + fjdz[j].guid + "&token="+ token;
                            var suffix_index = file_name.lastIndexOf('.');
                            var suffix = file_name.substr(suffix_index + 1);
                            suffix = suffix.toLowerCase();
                            if (vm.suffix_video.indexOf(suffix) != -1) {//视频
                                list[i].video_arr.push(fjdz[j]);
                                continue;
                            }
                            if (vm.suffix_img.indexOf(suffix) != -1) {
                                list[i].img_arr.push(fjdz[j]);
                                continue;
                            }
                            list[i].file_arr.push(fjdz[j]);
                        }
                    }
                    this.current_list = this.current_list.concat(list);
                    if (this.old_scroll_top > 0){
                        $(window).scrollTop(this.old_scroll_top);
                    }
                },
                //js把时间戳转为为普通日期格式
                timeChuo: function (h) {
                    var timestamp3 = h / 1000;
                    var newDate = new Date();
                    newDate.setTime(timestamp3 * 1000);
                    Date.prototype.format = function (format) {
                        var date = {
                            "M+": this.getMonth() + 1,
                            "d+": this.getDate(),
                            "h+": this.getHours(),
                            "m+": this.getMinutes(),
                            "s+": this.getSeconds(),
                            "q+": Math.floor((this.getMonth() + 3) / 3),
                            "S+": this.getMilliseconds()
                        };
                        if (/(y+)/i.test(format)) {
                            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
                        }
                        for (var k in date) {
                            if (new RegExp("(" + k + ")").test(format)) {
                                format = format.replace(RegExp.$1, RegExp.$1.length == 1
                                    ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
                            }
                        }
                        return format;
                    };
                    var getTimeIs = newDate.format('yyyy-MM-dd');
                    return getTimeIs;
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
