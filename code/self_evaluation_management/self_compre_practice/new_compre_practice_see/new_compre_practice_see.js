/**
 * Created by Administrator on 2018/6/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('self_evaluation_management', 'self_compre_practice/new_compre_practice_see/new_compre_practice_see', 'html!'),
        C.Co('self_evaluation_management', 'self_compre_practice/new_compre_practice_see/new_compre_practice_see', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, three_menu_module) {
        //统计资料数量
        var api_count_zh_mk = api.api + 'GrowthRecordBag/count_zh_mk';
        //获取学年学期集合
        var api_sem_list = api.user + 'semester/used_list.action';

        //思想品德
        var api_morality_list = api.api + 'GrowthRecordBag/morality_list';
        //学业水平
        var api_study_list = api.api + 'GrowthRecordBag/study_list';
        //身心健康
        var api_health_list = api.api + 'GrowthRecordBag/healthActivity_findByStuHealthActivity';
        //艺术素养
        var api_activity_list = api.api + 'GrowthRecordBag/artactivity_findByStuArtactivity';
        //社会实践
        var api_practice_list = api.api + 'GrowthRecordBag/practice_list';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "new_compre_practice_see",
                url_file: api.api + "file/get",//获取文件,
                //学生头像
                user_photo: cloud.user_photo,
                url_img: url_img,
                user_district: "",
                //学期id
                sem_id: '',
                //学期总上传数
                sem_count: [],
                sem_cl_count: '',
                //累计材料
                all_count: [],
                all_cl_count: '',
                //页面首次或者学年学期改变:true-是，false-不是
                pd_first_enter:true,
                xy_first_enter:true,
                sx_first_enter:true,
                ys_first_enter:true,
                sj_first_enter:true,
                //模块选中：0-思想品德，1-学业水平，2-身心健康，3-艺术素养，4-社会实践，5-日常表现，6-成就奖励
                checked_module_index:'0',
                //模块集合
                module_list:[
                    {id:1,module_name:'思想品德',cout:0,},
                    {id:2,module_name:'学业水平',cout:0,},
                    {id:3,module_name:'身心健康',cout:0,},
                    {id:4,module_name:'艺术素养',cout:0,},
                    {id:5,module_name:'社会实践',cout:0,},
                ],
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
                    status:'',
                    title:"",
                    fk_semester_id:'',
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
                    status:'',
                    fk_semester_id:'',
                },
                //身心健康列表
                sx_list:[],
                //身心健康请求参数
                sx_extend:{
                    hea_activityType:"",
                    hea_endDate:"",
                    hea_startDate:"",
                    // -1:删除 1:待审核2:提交草稿3:未通过4:审核通过5归档
                    hea_state:'',
                    offset:0,
                    rows:5,
                    fk_semester_id:'',
                },
                //艺术素养列表
                ys_list:[],
                //艺术素养请求参数
                ys_extend:{
                    art_end_date:"",
                    art_start_date:"",
                    //-1:删除 1:待审核2:提交草稿3:未通过4:审核通过5:归档
                    art_state:'',
                    art_type:"",
                    offset:0,
                    rows:5,
                    fk_semester_id:'',
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
                    status:'',
                    title:'',
                    fk_semester_id:'',
                },
                //已通过遴选审核与编辑、删除按钮不可同时存在
                daily_list: [],
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had:false,
                //学生guid
                stu_guid:'',
                //学年学期列表
                sem_list: [],
                //当前选中学年学期
                semester_remark: -1,
                url_for: function (id) {
                    // console.log( this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id)
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                init: function () {
                    this.stu_guid = cloud.user_guid();
                    this.user_district = cloud.user_district();
                    //统计数量--所有
                    ajax_post(api_count_zh_mk, {
                        fk_xq_id: '',
                        //	是否典型(1典型 0非典型)
                        sfdx: '',
                        fk_xs_id: this.stu_guid,
                        //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                        shzt: '',
                    }, this);
                    //页面滚动加载初始化
                    this.listen_scroll()
                },
                //页面第一次请求：需要把7个模块都查询出来
                first_loading:function(){
                    ajax_post(api_morality_list,this.pd_extend.$model,this);
                    ajax_post(api_study_list,this.xy_extend.$model,this);
                    ajax_post(api_health_list,this.sx_extend.$model,this);
                    ajax_post(api_activity_list,this.ys_extend.$model,this);
                    ajax_post(api_practice_list,this.sj_extend.$model,this);
                },
                //滚动请求数据
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
                //模块切换
                click_module_index:function(index,el){
                    //初始化列表
                    this.current_list = [];
                    this.current_count = 0;
                    this.current_extend.offset = 0;
                    this.old_scroll_top = 0;
                    this.checked_module_index = index;
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
                //学年学期改变
                semesterChange: function (id, start, end) {
                    this.semester_remark = id;
                    this.current_extend.sem_id = this.sem_list[id].id;
                    this.pd_extend.fk_semester_id = this.sem_list[id].id;
                    this.xy_extend.fk_semester_id = this.sem_list[id].id;
                    this.sx_extend.fk_semester_id = this.sem_list[id].id;
                    this.ys_extend.fk_semester_id = this.sem_list[id].id;
                    this.sj_extend.fk_semester_id = this.sem_list[id].id;
                    this.sem_id = this.sem_list[id].id;
                    //统计数量--本学期
                    ajax_post(api_count_zh_mk, {
                        fk_xq_id: this.sem_id,
                        //	是否典型(1典型 0非典型)
                        sfdx: '',
                        fk_xs_id: this.stu_guid,
                        //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                        shzt: '',
                    }, this);
                    if (id != -1) {//不是最新记录
                        layer.load(1, {shade:[0.3,'#121212']});
                        this.data_had = false;
                        this.current_list = [];
                        this.current_count = 0;
                        this.old_scroll_top = 0;
                        this.checked_module_index = 0;
                        this.current_extend.offset = 0;
                        this.pd_extend.offset = 0;
                        this.xy_extend.offset = 0;
                        this.sx_extend.offset = 0;
                        this.ys_extend.offset = 0;
                        this.sj_extend.offset = 0;
                        this.pd_first_enter = true;
                        this.xy_first_enter = true;
                        this.sx_first_enter = true;
                        this.ys_first_enter = true;
                        this.sx_first_enter = true;
                        this.first_loading();
                    }
                },
                // 锚点动画
                my_turn: function () {
                    // console.log($(location.hash))
                    if (location.pathname.replace(/^\//, '')) {
                        var $target = $(location.hash);
                        $target = $target.length && $target || $('[name=' + this.hash.slice(1) + ']');
                        if ($target.length) {
                            var targetOffset = $target.offset().top - 80;
                            $('html,body').animate({
                                    scrollTop: targetOffset
                                },
                                1000);
                            return false;
                        }
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
                            cloud.del_pd({id: id}, function (url, ars, data) {
                                // vm.update_info($idx);
                                // vm.current_list.splice($idx, 1);
                                vm.had_checked($idx);
                                //统计数量--所有
                                ajax_post(api_count_zh_mk, {
                                    fk_xq_id: '',
                                    //	是否典型(1典型 0非典型)
                                    sfdx: '',
                                    fk_xs_id: vm.stu_guid,
                                    //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                                    shzt: '',
                                }, vm);
                            });
                        });
                    } else if (type == 3) {//艺术素养
                        layer.confirm('是否要删除艺术素养记录', {
                            btn: ['确定', '取消'] //按钮
                        }, function () {
                            cloud.del_yshd({id: id}, function (url, ars, data) {
                                // vm.update_info($idx);
                                // vm.current_list.splice($idx, 1);
                                vm.had_checked($idx);
                                //统计数量--所有
                                ajax_post(api_count_zh_mk, {
                                    fk_xq_id: '',
                                    //	是否典型(1典型 0非典型)
                                    sfdx: '',
                                    fk_xs_id: vm.stu_guid,
                                    //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                                    shzt: '',
                                }, vm);
                            });
                        });
                    } else if (type == 4) {// 社会实践
                        layer.confirm('是否要删除社会实践记录', {
                            btn: ['确定', '取消'] //按钮
                        }, function () {
                            cloud.del_shsj({id: id}, function (url, ars, data) {
                                // vm.update_info($idx);
                                // vm.current_list.splice($idx, 1);
                                vm.had_checked($idx);
                                //统计数量--所有
                                ajax_post(api_count_zh_mk, {
                                    fk_xq_id: '',
                                    //	是否典型(1典型 0非典型)
                                    sfdx: '',
                                    fk_xs_id: vm.stu_guid,
                                    //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                                    shzt: '',
                                }, vm);
                            });
                        });
                    } else if (type == 1) {// 学业水平
                        layer.confirm('是否要删除学业水平记录', {
                            btn: ['确定', '取消'] //按钮
                        }, function () {
                            cloud.del_sysp({id: id}, function (url, ars, data) {
                                // vm.update_info($idx);
                                // vm.current_list.splice($idx, 1);
                                vm.had_checked($idx);
                                //统计数量--所有
                                ajax_post(api_count_zh_mk, {
                                    fk_xq_id: '',
                                    //	是否典型(1典型 0非典型)
                                    sfdx: '',
                                    fk_xs_id: vm.stu_guid,
                                    //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                                    shzt: '',
                                }, vm);
                            });
                        });
                    } else if (type == 2) {// 身体健康
                        layer.confirm('是否要删除身体健康记录', {
                            btn: ['确定', '取消'] //按钮
                        }, function () {
                            cloud.del_sxjk({id: id}, function (url, ars, data) {
                                // vm.update_info($idx);
                                // vm.current_list.splice($idx, 1);
                                vm.had_checked($idx);
                                //统计数量--所有
                                ajax_post(api_count_zh_mk, {
                                    fk_xq_id: '',
                                    //	是否典型(1典型 0非典型)
                                    sfdx: '',
                                    fk_xs_id: vm.stu_guid,
                                    //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                                    shzt: '',
                                }, vm);
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
                        this.get_list_data();
                        return;
                    }
                    //当前数据大于3条进行手动数据删除
                    this.current_list.splice(index, 1);
                    this.module_list[this.checked_module_index].cout --
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //学年学期列表
                            case api_sem_list:
                                this.complete_sem_list(data);
                                break;
                            //        统计数量
                            case api_count_zh_mk:
                                if (this.sem_id == '' && !this.is_delete) {
                                    //累计材料
                                    this.all_count = data.data;
                                    var count = 0;
                                    for (var i = 0; i < data.data.length; i++) {
                                        count = count + data.data[i].num;
                                    }
                                    this.all_cl_count = count;
                                    //    学年学期列表
                                    ajax_post(api_sem_list, {status: 1}, this);
                                }else if(this.sem_id != '' && this.is_delete){
                                    //累计材料
                                    this.all_count = data.data;
                                    var count = 0;
                                    for (var i = 0; i < data.data.length; i++) {
                                        count = count + data.data[i].num;
                                    }
                                    this.all_cl_count = count;
                                    //统计数量--本学期
                                    ajax_post(api_count_zh_mk, {
                                        fk_xq_id: this.sem_id,
                                        //	是否典型(1典型 0非典型)
                                        sfdx: '',
                                        fk_xs_id: this.stu_guid,
                                        //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                                        shzt: '',
                                    }, this);
                                    this.is_delete = false;
                                } else {
                                    //学期总上传数
                                    this.sem_count = data.data;
                                    var count = 0;
                                    for (var i = 0; i < data.data.length; i++) {
                                        count = count + data.data[i].num;
                                    }
                                    this.sem_cl_count = count;
                                }
                                break;
                            // 思想品德
                            case api_morality_list:
                                this.complete_morality_list(data);
                                break;
                            //学业水平
                            case api_study_list:
                                this.complete_study_list(data);
                                break;
                            //        身心健康
                            case api_health_list:
                                this.complete_health_list(data);
                                break;
                            //        艺术素养
                            case api_activity_list:
                                this.complete_activity_list(data);
                                break;
                            //        社会实践
                            case api_practice_list:
                                this.complete_practice_list(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                //处理数据
                deal_data:function(data){
                    //获取学生头像
                    // ready_photo(list, "fk_xsyh_id");
                    var token = sessionStorage.getItem("token");
                    for (var i = 0; i < data.length; i++) {
                        //将附件统一改为fjdz
                        if(this.checked_module_index == 0){//思想品德
                            data[i].fjdz = data[i].attachment;
                            data[i].mkmc = '思想品德';
                        }else if(this.checked_module_index == 1){//学业水平
                            data[i].fjdz = data[i].attachment;
                            data[i].mkmc = '学业水平';
                        }else if(this.checked_module_index == 2){//身心健康
                            data[i].fjdz = data[i].hea_enclosure;
                            data[i].mkmc = '身心健康';
                        }else if(this.checked_module_index == 3){//艺术素养
                            data[i].fjdz = data[i].art_enclosure;
                            data[i].mkmc = '艺术素养';
                        }else if(this.checked_module_index == 4){//社会实践
                            data[i].fjdz = data[i].attachment;
                            data[i].mkmc = '社会实践';
                        }
                        if (!data[i].fjdz || data[i].fjdz == null)
                            continue;
                        //将材料文件不全的清空
                        if(data[i].fjdz.indexOf(']') != -1){

                        }else{
                            data[i].fjdz = '[]';
                        }
                        var fjdz = JSON.parse(data[i].fjdz);
                        data[i].img_arr = [];
                        data[i].video_arr = [];
                        data[i].file_arr = [];
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
                                data[i].video_arr.push(fjdz[j]);
                                continue;
                            }
                            if (vm.suffix_img.indexOf(suffix) != -1) {
                                data[i].img_arr.push(fjdz[j]);
                                continue;
                            }
                            data[i].file_arr.push(fjdz[j]);
                        }

                    }
                    vm.current_list = vm.current_list.concat(data);
                    layer.closeAll();
                    this.data_had = true;
                },
                //请求列表数据
                req_data: function () {
                    cloud.stu_zhsj(this.data, function (url, ars, data) {
                        ready_photo(data.list, "fk_xsyh_id");
                        vm.count = data.count;
                        var list = data.list;
                        var token = sessionStorage.getItem("token");
                        for (var i = 0; i < list.length; i++) {
                            if (!list[i].fjdz || list[i].fjdz == null)
                                continue;
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
                        data.list = list;
                        vm.daily_list = data.list;
                        layer.closeAll();
                        this.data_had = true;
                    });
                },
                //学年学期改变
                complete_sem_list: function (data) {
                    this.sem_list = data.data;
                    this.semester_remark = 0;
                    this.current_extend.sem_id = this.sem_list[0].id;
                    this.pd_extend.fk_semester_id = this.sem_list[0].id;
                    this.xy_extend.fk_semester_id = this.sem_list[0].id;
                    this.sx_extend.fk_semester_id = this.sem_list[0].id;
                    this.ys_extend.fk_semester_id = this.sem_list[0].id;
                    this.sj_extend.fk_semester_id = this.sem_list[0].id;
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    //请求列表数据
                    // this.req_data();
                    //第一次请求所有模块的列表
                    this.first_loading();
                    this.sem_id = this.current_extend.sem_id;
                    //统计数量--本学期
                    ajax_post(api_count_zh_mk, {
                        fk_xq_id: this.sem_id,
                        //	是否典型(1典型 0非典型)
                        sfdx: '',
                        fk_xs_id: this.stu_guid,
                        //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                        shzt: '',
                    }, this);
                },
                //    思想品德
                complete_morality_list:function(data){
                    //首次或者刷新
                    if(this.pd_first_enter){
                        this.pd_first_enter = false;
                    }
                    this.deal_data(data.data.list);
                    this.current_count = data.data.count;
                    this.module_list[0].cout = data.data.count;
                },
                //    学业水平
                complete_study_list:function(data){
                    this.module_list[1].cout = data.data.count;
                    //首次或者刷新
                    if(this.xy_first_enter){
                        this.xy_first_enter = false;
                        return;
                    }
                    this.current_count = data.data.count;
                    this.deal_data(data.data.list);
                },
                //    身心健康
                complete_health_list:function(data){
                    this.module_list[2].cout = data.data.count;
                    //首次或者刷新
                    if(this.sx_first_enter){
                        this.sx_first_enter = false;
                        return;
                    }
                    this.current_count = data.data.count;
                    this.deal_data(data.data.list);
                },
                //    艺术素养
                complete_activity_list:function(data){
                    this.module_list[3].cout = data.data.count;
                    //首次或者刷新
                    if(this.ys_first_enter){
                        this.ys_first_enter = false;
                        return;
                    }
                    this.current_count = data.data.count;
                    this.deal_data(data.data.list);
                },
                //    社会实践
                complete_practice_list:function(data){
                    this.module_list[4].cout = data.data.count;
                    //首次或者刷新
                    if(this.sj_first_enter){
                        this.sj_first_enter = false;
                        return;
                    }
                    this.current_count = data.data.count;
                    this.deal_data(data.data.list);
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