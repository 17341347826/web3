/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('reconsider_manage/arrange_selection', 'new_selected_material/new_selected_material', 'html!'),
        C.Co('reconsider_manage/arrange_selection', 'new_selected_material/new_selected_material', 'css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CM("select_assembly")
    ],
    function ($, avalon, layer, html, css, data_center, three_menu_module, select_assembly) {
        //统计资料数量
        var api_count_zh_mk = api.api + 'GrowthRecordBag/count_zh_mk';
        //获取列表数据
        var get_data_api = api.api + "GrowthRecordBag/student_list_lx_data";
        //获取每一个类别的份数
        var count_api = api.api + "GrowthRecordBag/count_zh_mk";

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
                $id: "new_selected_material",
                //区县名称
                district:'',
                //学生guid
                stu_guid:'',
                //学年学期集合
                semester_arr: [],
                //当前选中学期信息
                current_semester: '',
                //前一次请求的滚动条高度
                old_scroll_top: '',
                //累计遴选材料
                count_list: [],
                //本学期遴选材料
                semester_count: [],
                //当前数据总数
                current_count:0,
                //当前查询列表数据
                current_list:[],
                //当前查询列表的部分公有参数
                current_extend:{
                    offset:0,
                    rows:5,
                    sem_id:'',
                    //1待审核 2审核通过 3审核不通过4归档
                    status:1,
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
                    status:1,
                    title:"",
                    fk_semester_id:'',
                    //0-未遴选，1-已遴选
                    isTypical:1,
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
                    status:1,
                    fk_semester_id:'',
                    //0-未遴选，1-已遴选
                    isTypical:1,
                },
                //身心健康列表
                sx_list:[],
                //身心健康请求参数
                sx_extend:{
                    hea_activityType:"",
                    hea_endDate:"",
                    hea_startDate:"",
                    // -1:删除 1:待审核2:提交草稿3:未通过4:审核通过5归档
                    hea_state:1,
                    offset:0,
                    rows:5,
                    fk_semester_id:'',
                    //0-未遴选，1-已遴选
                    isTypical:1,
                },
                //艺术素养列表
                ys_list:[],
                //艺术素养请求参数
                ys_extend:{
                    art_end_date:"",
                    art_start_date:"",
                    //-1:删除 1:待审核2:提交草稿3:未通过4:审核通过5:归档
                    art_state:1,
                    art_type:"",
                    offset:0,
                    rows:5,
                    fk_semester_id:'',
                    //0-未遴选，1-已遴选
                    isTypical:1,
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
                    status:1,
                    title:'',
                    fk_semester_id:'',
                    //0-未遴选，1-已遴选
                    isTypical:1,
                },
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had:false,
                //获取学期和累计遴选数状态
                is_all_count: true,
                user_photo: cloud.user_photo,
                url_img: url_img,
                //当前列表序号
                current_index:'',
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                uninit:function () {
                    $(window).unbind ('scroll');
                },
                init: function () {
                    this.district = cloud.user_district();
                    this.semester_arr = cloud.semester_all_list();
                    this.current_semester = this.semester_arr[0];
                    this.current_extend.sem_id = this.current_semester.value.split('|')[0];
                    this.stu_guid = cloud.user_guid();
                    ready_photo([{guid:this.stu_guid}],'guid')
                    //滚动加载
                    this.listen_scroll();
                    // this.get_data();
                    //获取本学期和累计遴选数据
                    this.get_count(this.is_all_count);
                    //获取模块数据
                    this.get_list_data();
                    //读取头像
                    cloud.ready_photo({guids: [this.stu_guid]});
                },
                //滚动加载
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
                            self.get_list_data();
                        }
                    })

                },
                //获取本学期和累计遴选数据
                get_count: function (is_all) {
                    if (is_all) {
                        ajax_post(count_api, {
                            fk_xs_id: this.stu_guid,
                            sfdx: 1,
                            shzt: this.current_extend.status
                        }, this);
                    } else {
                        ajax_post(count_api, {
                            fk_xs_id: this.stu_guid,
                            sfdx: 1,
                            shzt: this.current_extend.status,
                            fk_xq_id:Number(this.current_extend.sem_id)
                        }, this);
                    }

                },
                //审核状态切换：1待审核 2审核通过 3审核不通过4归档
                change_tab: function (tab) {
                    this.current_list = [];
                    this.current_count = 0;
                    this.current_extend.offset = 0;
                    this.old_scroll_top = 0;
                    this.data_had = false;
                    this.current_extend.status = tab;
                    if(this.current_extend.status == 1){//1待审核
                        this.pd_extend.status = 1;
                        this.xy_extend.status = 1;
                        this.sx_extend.hea_state = 1;
                        this.ys_extend.art_state = 1;
                        this.sj_extend.status = 1;
                    }else if(this.current_extend.status == 2){//2审核通过
                        this.pd_extend.status = 2;
                        this.xy_extend.status = 2;
                        this.sx_extend.hea_state = 4;
                        this.ys_extend.art_state = 4;
                        this.sj_extend.status = 2;
                    }else if(this.current_extend.status == 3){//3审核不通过
                        this.pd_extend.status = 3;
                        this.xy_extend.status = 3;
                        this.sx_extend.hea_state = 3;
                        this.ys_extend.art_state = 3;
                        this.sj_extend.status = 3;
                    }else if(this.current_extend.status == 4){//4归档
                        this.pd_extend.status = 4;
                        this.xy_extend.status = 4;
                        this.sx_extend.hea_state = 5;
                        this.ys_extend.art_state = 5;
                        this.sj_extend.status = 4;
                    }
                    this.is_all_count = true;
                    //获取本学期遴选数据
                    this.get_count(this.is_all_count);
                    //获取当前模块选择学期的数据
                    this.get_list_data();
                },
                //学年学期改变
                sel_semester: function (el) {
                    //切换成页面默认表格形式
                    this.current_semester = el;
                    this.current_extend.sem_id = this.current_semester.value.split('|')[0];
                    this.current_list = [];
                    this.current_count = 0;
                    this.current_extend.offset = 0;
                    this.old_scroll_top = 0;
                    this.data_had = false;
                    this.is_all_count = false;
                    //获取本学期遴选数据
                    this.get_count(this.is_all_count);
                    //获取当前模块选择学期的数据
                    this.get_list_data();
                },
                //模块切换
                click_module_index:function(index,el){
                    //初始化列表
                    this.current_list = [];
                    this.current_count = 0;
                    this.current_extend.offset = 0;
                    this.old_scroll_top = 0;
                    this.checked_module_index = index;
                    this.data_had = false;
                    this.get_list_data();
                },
                //根据模块选择请求列表数据
                get_list_data:function(){
                    var type = Number(this.checked_module_index);
                    switch (type) {
                        case 0:
                            this.pd_extend.offset = this.current_extend.offset;
                            this.pd_extend.fk_semester_id = this.current_extend.sem_id;
                            ajax_post(api_morality_list,this.pd_extend.$model,this);
                            break;
                        case 1:
                            this.xy_extend.offset = this.current_extend.offset;
                            this.xy_extend.fk_semester_id = this.current_extend.sem_id;
                            ajax_post(api_study_list,this.xy_extend.$model,this);
                            break;
                        case 2:
                            this.sx_extend.offset = this.current_extend.offset;
                            this.sx_extend.fk_semester_id = this.current_extend.sem_id;
                            ajax_post(api_health_list,this.sx_extend.$model,this);
                            break;
                        case 3:
                            this.ys_extend.offset = this.current_extend.offset;
                            this.ys_extend.fk_semester_id = this.current_extend.sem_id;
                            ajax_post(api_activity_list,this.ys_extend.$model,this);
                            break;
                        case 4:
                            this.sj_extend.offset = this.current_extend.offset;
                            this.sj_extend.fk_semester_id = this.current_extend.sem_id;
                            ajax_post(api_practice_list,this.sj_extend.$model,this);
                            break;
                    }
                },
                //
                get_data: function () {
                    this.current_extend.sem_id = this.current_semester.value.split('|')[0];
                    this.is_all_count = true;
                    this.get_count(this.is_all_count);
                    // layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    // ajax_post(get_data_api, this.extend.$model, this);
                },
                //图片展开或收起，注：如果数据循环出来，逻辑不一定这么写
                open_close: function (w, index) {
                    if (w == 'open') {
                        this.current_list[index].is_open = true;
                    } else {
                        this.current_list[index].is_open = false;
                    }
                },
                //取消遴选
                no_pass: function (el,idx) {
                    //1品德 2艺术活动3社会实践4学业水平5身心健康6成就奖励7日常表现
                    this.current_index = idx;
                    var type = Number(this.checked_module_index);
                    switch (type) {
                        case 0://思想品德
                            this.choose(morality_choose_api, el.id);
                            break;
                        case 3://艺术素养
                            this.art_choose(art_choose_api, el.id);
                            break;
                        case 4://社会实践
                            this.choose(practic_choose_api, el.id);
                            break;
                        case 1://学业水平
                            this.choose(study_choose_api, el.id);
                            break;
                        case 2://身心健康
                            this.health_choose(health_choose_api, el.id);
                            break;
                        default:
                            break;
                    }
                },
                //取消遴选
                choose: function (url, id) {
                    ajax_post(url, {
                        id: id,
                        isTypical: 0,
                        status: 0
                    }, this);
                },
                //身心健康取消遴选
                health_choose:function (url,id) {
                    ajax_post(url, {
                        id: id,
                        isTypical: 0,
                        hea_state: 2
                    }, this);
                },
                //艺术素养取消遴选
                art_choose:function (url,id) {
                    ajax_post(url, {
                        id: id,
                        isTypical: 0,
                        art_state: 2
                    }, this);
                },
                //处理取消遴选数据返回结果
                deal_msg: function () {
                    var self = this;
                    layer.alert('操作成功！', {
                        skin: 'layui-layer-molv',
                        closeBtn: 0
                    }, function () {
                        layer.closeAll();
                        self.is_all_count = true;
                        // self.get_count();
                        // self.had_checked_lx();
                        self.had_checked(self.current_index)
                    });
                },
                //取消遴选通过后数据处理:index-数据在当前列表中的顺序
                had_checked_lx:function(){
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
                        // //获取本学期和累计遴选数据
                        // this.get_count(true);
                        this.get_list_data();
                        return;
                    }
                    //当前数据大于3条进行手动数据删除
                    this.current_list.splice(index, 1);
                    this.module_list[Number(this.checked_module_index)].cout --
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
                //是否执行删除操作:true-执行，false-不执行
                is_delete:false,
                //删除
                delete: function ($idx, el) {
                    this.is_delete = true;
                    var type = Number(this.checked_module_index);
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
                                vm.had_checked($idx);
                                //统计数量--所有
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
                                vm.had_checked($idx);
                                //统计数量--所有
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
                                vm.had_checked($idx);
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
                                vm.had_checked($idx);
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
                                vm.had_checked($idx);
                                //统计数量--所有
                            });
                        });
                    }
                },
                //删除通过后数据处理:index-数据在当前列表中的顺序
                had_checked:function(index){
                    var list = this.current_list;
                    this.current_count --;
                    //当数据低于3条的时候调用接口
                    if(list.length<3){
                        this.current_extend.offset = 0;
                        if(this.current_count<3){
                            this.current_list = [];
                            this.old_scroll_top = 0;
                        }
                        this.is_all_count = true;
                        //获取本学期和累计遴选数据
                        this.get_count(this.is_all_count);
                        this.get_list_data();
                        return;
                    }
                    //当前数据大于3条进行手动数据删除
                    this.current_list.splice(index, 1);
                    this.module_list[this.checked_module_index].cout --;
                    this.count_list[this.checked_module_index].num --;
                    this.semester_count[this.checked_module_index].num --;
                },

                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取本学期和累计遴选数据
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
                            //品德遴选
                            case morality_choose_api:
                                this.deal_msg();
                                break;
                            //艺术遴选
                            case art_choose_api:
                                this.deal_msg();
                                break;
                            //社会实践遴选
                            case practic_choose_api:
                                this.deal_msg();
                                break;
                            //学业水平遴选
                            case study_choose_api:
                                this.deal_msg();
                                break;
                            // 身心健康遴选
                            case health_choose_api:
                                this.deal_msg();
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
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
                //本学期和累计遴选数据
                complete_count_api:function(data){
                    if (!data.data)
                        return;
                    var list = data.data;
                    for (let i = 0; i < list.length; i++) {
                        if (list[i].mkmc === '身体健康') list[i].mkmc = '身心健康';
                        if (list[i].mkmc === '品德发展') list[i].mkmc = '思想品德';
                    }
                    this.swapArr(list,1,3);
                    this.swapArr(list,2,4);
                    if (this.is_all_count) {
                        this.count_list = list;
                    } else {
                        this.semester_count = list;
                        //接口返回模块： 1品德发展 2 艺术素养 3社会实践 4学业水平 5身体健康 6成就奖励 7日常表现
                        //对应模块当前学期未遴选数
                        this.module_list[0].cout = this.get_module_count(list,1);
                        this.module_list[1].cout = this.get_module_count(list,4);
                        this.module_list[2].cout = this.get_module_count(list,5);
                        this.module_list[3].cout = this.get_module_count(list,2);
                        this.module_list[4].cout = this.get_module_count(list,3);
                    }
                    if (this.is_all_count) {
                        this.is_all_count = false;
                        this.get_count(this.is_all_count);
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
                    layer.closeAll();
                    this.data_had = true;
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
