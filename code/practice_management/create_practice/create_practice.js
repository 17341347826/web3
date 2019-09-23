define([
        C.CLF('avalon.js'),
        'layer', "date_zh",
        C.Co("practice_management", "create_practice/darkroom", 'css!'),
        C.Co('practice_management', 'create_practice/create_practice', 'html!'),
        C.Co('practice_management', 'create_practice/create_practice', 'css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CMF("formatUtil.js"), "select2"
    ],
    function (avalon, layer, date_zh, css1, html, css, data_center, three_menu_module, formatUtil, select2) {
        //获取
        var url_api_file = api.api + "file/get";
        //上传
        var api_uploader_base = api.api + "file/uploader_base64";
        //添加
        var api_add = api.api + 'GrowthRecordBag/edit_activity_manage';
        //添加教师
        var api_add_teacher = api.api + 'GrowthRecordBag/set_activity_tutor';
        //查详情
        var api_check_info = api.api + "GrowthRecordBag/get_activity_manage";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "create_practice",
                level: "",
                img_src: "",
                up_img: "",
                grade_list: [],
                lx_list: [],
                teacher_arr: [],
                teacher_info: "",
                is_disabled: false,
                is_update: 0,
                teacher_sel: {
                    fk_hd_id: "",
                    list: []
                },
                data: {
                    cjpt: "",
                    bm_jssj: "",//报名结束时间
                    bm_kssj: "",//报名开始时间
                    bmrs: "",//报名人数
                    bt: "",//标题
                    cjdw_mc: "",//创建单位名称
                    cjr_mc: "",//创建人名称
                    cjsj: "",//创建时间
                    fjdz: "",//附件地址
                    fk_cjdw_id: "",//创建单位id
                    fk_cjr_id: "",//创建人id
                    fk_nj_id: "",//创建年级id
                    njmc: "",//年级名称
                    // fk_zdls_id:"",//指导老师id
                    hd_jssj: "",//活动结束时间
                    hd_kssj: "",//活动开始时间
                    hddd: "",//活动地点
                    hdjj: "",//活动简介
                    id: "",//活动id
                    jllx: "",//记录类型 1作品2品德3成就4实践5艺术活动6研究型学习7身心健康8日常表现
                    fk_xq_id: "",//学期id
                    lx: "",//类型(类型管理里面的数据)
                    scrs: "",//上传人数
                    xgsj: "",//修改时间
                    // zdls:"",//指导老师名称
                    zt: ""//状态0未发布1已发布2已结束
                },
                init: function () {
                    if (pmx.id) {//有数据 修改
                        this.is_update = 1;
                        ajax_post(api_check_info, {id: pmx.id}, this);
                    } else {
                        this.is_update = 0;
                        var user = cloud.user_user();
                        this.data.cjdw_mc = user.school_name;
                        this.data.cjr_mc = user.name;
                        this.data.fk_cjdw_id = cloud.user_school_id();
                        this.data.fk_cjr_id = cloud.user_guid();
                        var login_level = cloud.user_level();
                        this.level = login_level;
                        if (login_level == 2) {//市管理
                            this.data.cjpt = '市级';
                            this.grade_list = cloud.grade_all_list();
                        } else if (login_level == 3) {//区管理
                            this.data.cjpt = '区级';
                            this.grade_list = cloud.grade_all_list();
                        } else if (login_level == 4) {//校管理
                            this.data.cjpt = '校级';
                            this.grade_list = cloud.school_to_grade();
                            this.teacher_arr = cloud.school_to_teacher();
                        }
                        this.data.fk_nj_id = Number(this.grade_list[0].value);
                        this.data.njmc = this.grade_list[0].name;
                        this.data.jllx = '0';
                    }

                },
                //切换年级
                gradeChange: function () {
                    var id = this.data.fk_nj_id;
                    for (var i = 0; i < this.grade_list.length; i++) {
                        if (id == this.grade_list[i].value) {
                            this.data.njmc = this.grade_list[i].name;
                        }
                    }
                },
                //评价维度
                typeChange: function () {
                    /*
                    *2 思想品德
                     6 学业水平
                     7 身心健康
                     5 艺术素养
                     4 社会实践*/
                    var type_num = this.data.jllx;
                    if (type_num == '0') {
                        toastr.warning('请选择评价维度');
                    } else {
                        cloud.get_module_type({type: type_num}, function (ars, url, data) {
                            vm.lx_list = data.list;
                            if (vm.is_update == 1) {
                                vm.data.lx = vm.data.lx;
                            } else {
                                vm.data.lx = vm.lx_list[0].type_name;
                            }
                        });
                    }
                },
                /*======================报名时间==============================*/
                get_start_date_x: function () {
                    let time = new Date();
                    let y = time.getFullYear();
                    let m = time.getMonth()+1;
                    let d = time.getDate();
                    let h = time.getHours();
                    let mm = time.getMinutes();
                    if (m < 10) m = '0' + m;
                    if (d < 10) d = '0' + d;
                    if (h < 10) h = '0' + h;
                    if (h < 24) { h += 1; mm = '00'}
                    else {if (mm < 10) mm = '0' + mm;}
                    let nowTime = y + '-' + m + '-' + d + ' ' + h + ':' + mm;
                    $('#start_time_x').datetimepicker('setStartDate', nowTime);
                    if (vm.data.bm_jssj != '') {
                        $('#start_time_x').datetimepicker('setEndDate', vm.data.bm_jssj);
                    }
                    $('#start_time_x')
                        .datetimepicker()
                        .on('changeDate', function (e) {
                            vm.data.bm_kssj = e.currentTarget.value;
                            vm.is_same(vm.data.bm_kssj,vm.data.bm_jssj,'bm_kssj')

                        });
                },
                start_click_x: function () {
                    $('#start_time_x').datetimepicker('show');
                },
                get_end_date_x: function () {
                    let time = new Date();
                    let y = time.getFullYear();
                    let m = time.getMonth()+1;
                    let d = time.getDate();
                    let h = time.getHours();
                    let mm = time.getMinutes();
                    if (m < 10) m = '0' + m;
                    if (d < 10) d = '0' + d;
                    if (h < 10) h = '0' + h;
                    if (h < 22) { h += 2; mm = '00'}
                    else {if (mm < 10) mm = '0' + mm;}
                    let nowTime = y + '-' + m + '-' + d + ' ' + h + ':' + mm;
                    if (vm.data.bm_kssj != '') {
                        $('#end_time_x').datetimepicker('setStartDate', vm.data.bm_kssj);
                    } else {
                        $('#end_time_x').datetimepicker('setStartDate', nowTime);
                    }
                    if (vm.data.hd_kssj != '') {
                        $('#end_time_x').datetimepicker('setEndDate', vm.data.hd_kssj);
                    }
                    $('#end_time_x')
                        .datetimepicker()
                        .on('changeDate', function (e) {
                            vm.data.bm_jssj = e.currentTarget.value;
                            vm.is_same(vm.data.bm_kssj,vm.data.bm_jssj,'bm_jssj')
                            $('#end_time').datetimepicker({
                                format: 'yyyy-mm-dd hh:ii',
                                language: 'zh-CN'

                            });
                            $('#start_time').datetimepicker({
                                format: 'yyyy-mm-dd hh:ii',
                                language: 'zh-CN'
                            });
                        });
                },
                end_click_x: function () {
                    $('#end_time_x').datetimepicker('show');

                },
                /*======================开展时间==============================*/
                get_start_date: function () {
                    let time = new Date();
                    let y = time.getFullYear();
                    let m = time.getMonth()+1;
                    let d = time.getDate();
                    let h = time.getHours();
                    let mm = time.getMinutes();
                    if (m < 10) m = '0' + m;
                    if (d < 10) d = '0' + d;
                    if (h < 10) h = '0' + h;
                    if (h < 23) { h += 1; mm = '00'}
                    else {if (mm < 10) mm = '0' + mm;}
                    let nowTime = y + '-' + m + '-' + d + ' ' + h + ':' + mm;
                    if (vm.data.bm_jssj != '') {
                        $('#start_time').datetimepicker('setStartDate', vm.data.bm_jssj);
                    } else {
                        $('#start_time').datetimepicker('setStartDate', nowTime);
                    }
                    if (vm.data.hd_jssj != '') {
                        $('#start_time').datetimepicker('setEndDate', vm.data.hd_jssj);
                    }
                    $('#start_time')
                        .datetimepicker()
                        .on('changeDate', function (e) {
                            vm.data.hd_kssj = e.currentTarget.value;
                            vm.is_same(vm.data.hd_kssj,vm.data.hd_jssj,'hd_kssj')
                        });

                },
                start_click: function () {
                    $('#start_time').datetimepicker('show');
                },
                get_end_date: function () {
                    if (vm.data.hd_kssj != '') {
                        $('#end_time').datetimepicker('setStartDate', vm.data.hd_kssj);
                    } else {
                        $('#end_time').datetimepicker('setStartDate', vm.data.bm_jssj);
                    }
                    $('#end_time')
                        .datetimepicker()
                        .on('changeDate', function (e) {
                            vm.data.hd_jssj = e.currentTarget.value;
                            vm.is_same(vm.data.hd_kssj,vm.data.hd_jssj,'hd_jssj')

                        });
                },
                is_same: function (date1, date2,key) {
                    if (date1 != '' && date2 != '' && date1 == date2) {
                        layer.msg('开始时间不能等于结束时间')
                        setTimeout(function () {
                            vm.data[key] = '';
                        },500)
                    }
                },
                end_click: function () {
                    $('#end_time').datetimepicker('show');

                },
                add_img: function () {
                    $("#head-confirm").modal({
                        closeOnConfirm: true
                    });
                },
                //封面
                file_change_head: function () {
                    this.img_src = '';
                    var get_chooseImage = document.getElementById('chooseImage-head');
                    var imgFile = get_chooseImage.files[0];
                    var filePath = $("#chooseImage-head").val(),
                        fileFormat = filePath.substring(filePath.lastIndexOf(".")).toLowerCase(),
                        src = window.URL.createObjectURL(imgFile); //转成可以在本地预览的格式
                    // 检查是否是图片
                    if (!fileFormat.match(/.png|.jpg|.jpeg/)) {
                        toastr.warning('上传错误,文件格式必须为：png/jpg/jpeg');
                        return;
                    }
                    this.img_src = src;
                    var dkrm = new Darkroom('#target-head', {
                        // Size options
                        // minWidth: 100,
                        // minHeight: 100,
                        // maxWidth: 540,
                        // maxHeight: 300,
                        // ratio: 4/3,
                        // backgroundColor: '#000',
                        minWidth: 260,
                        minHeight: 160,
                        maxWidth: 1200,
                        maxHeight: 3000,
                        ratio: 260 / 160,
                        backgroundColor: '#000',

                        // Plugins options
                        plugins: {
                            //save: false,
                            crop: {
                                quickCropKey: 67, //key "c"
                                //minHeight: 50,
                                //minWidth: 50,
                                //ratio: 4/3
                            }
                        },

                        // Post initialize script
                        initialize: function () {
                            var cropPlugin = this.plugins['crop'];
                            // cropPlugin.selectZone(170, 25, 300, 300);
                            cropPlugin.requireFocus();
                        }
                    });
                },
                //确定上传
                up_head: function () {
                    var obj = $("#content-head > div > section > div > figure > img");
                    var src = obj.attr("src");

                    var get_chooseImage = document.getElementById('chooseImage-head');
                    var imgFile = get_chooseImage.files[0];

                    blob_2_b64(imgFile, function (data) {
                        ajax_post(api_uploader_base, {file: data}, vm);
                    });

                },
                complete_uploader_base: function (data) {
                    var obj = {
                        inner_name: "",
                        guid: ""
                    };
                    var inner_name = data.data.inner_name;
                    var guid = data.data.guid;
                    obj.inner_name = inner_name;
                    obj.guid = guid;
                    this.data.fjdz = JSON.stringify(obj);
                    this.up_img = url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + inner_name;
                },
                ajax_add: function () {
                    if (this.level == 4) {
                        if (this.teacher_info.length == 0) {
                            toastr.warning('请选择指导老师');
                            return;
                        } else {
                            var list_x = [];
                            var data = this.teacher_info;
                            var length = data.length;
                            for (var i = 0; i < length; i++) {
                                var obj = {
                                    fk_zdls_id: "",
                                    zdls: ""
                                };
                                var data_x = data[i];
                                var guid = Number(data_x.split('|')[0]);
                                var name = data_x.split('|')[1];
                                obj.fk_zdls_id = guid;
                                obj.zdls = name;
                                list_x.push(obj);
                            }
                            this.teacher_sel.list = list_x;
                        }
                    }
                    if (this.data.jllx == '0') {
                        toastr.warning('请选择评价维度');
                        return;
                    }
                    if ($.trim(this.data.bt) == '') {
                        toastr.warning('请填写主题');
                        return;
                    }
                    if ($.trim(this.data.hdjj) == '') {
                        toastr.warning('请填写活动描述');
                        return;
                    }
                    if (this.data.bm_kssj == '') {
                        toastr.warning('请选择报名开始时间');
                        return;
                    }
                    if (this.data.bm_jssj == '') {
                        toastr.warning('请选择报名结束时间');
                        return;
                    }
                    if (this.data.hd_kssj == '') {
                        toastr.warning('请选择活动开展开始时间');
                        return;
                    }
                    if (this.data.hd_jssj == '') {
                        toastr.warning('请选择活动开展结束时间');
                        return;
                    }
                    if (this.up_img == '') {
                        this.data.fjdz = '[]';
                    }
                    if (this.is_update == 1) {//修改
                        this.data.id = pmx.id;
                        ajax_post(api_add, vm.data.$model, vm);
                    } else {
                        cloud.semester_current({}, function (url, ars, data) {
                            vm.data.fk_xq_id = data.id;
                            ajax_post(api_add, vm.data.$model, vm);
                        });
                    }

                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //上传封面
                            case api_uploader_base:
                                this.complete_uploader_base(data);
                                break;
                            case api_check_info:
                                this.complete_check_info(data);
                                break;
                            case api_add:
                                this.complete_add(data);
                                break;
                            case api_add_teacher:
                                window.location = '#management_list';
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                //数据回显
                complete_check_info: function (data) {
                    // this.data = data.data;

                    this.data.cjpt = data.data.cjpt;
                    this.data.bm_jssj = data.data.bm_jssj;
                    this.data.bm_kssj = data.data.bm_kssj;
                    this.data.bmrs = data.data.bmrs;
                    this.data.bt = data.data.bt;
                    this.data.cjdw_mc = data.data.cjdw_mc;
                    this.data.cjr_mc = data.data.cjr_mc;
                    this.data.cjsj = data.data.cjsj;
                    this.data.fjdz = data.data.fjdz;
                    this.data.fk_cjdw_id = data.data.fk_cjdw_id;
                    this.data.fk_cjr_id = data.data.fk_cjr_id;
                    this.data.fk_nj_id = data.data.fk_nj_id;
                    this.data.njmc = data.data.njmc;
                    this.data.hd_jssj = data.data.hd_jssj;
                    this.data.hd_kssj = data.data.hd_kssj;
                    this.data.hddd = data.data.hddd;
                    this.data.hdjj = data.data.hdjj;
                    this.data.id = data.data.id;
                    this.data.jllx = data.data.jllx;
                    this.data.fk_xq_id = data.data.fk_xq_id;
                    this.data.lx = data.data.lx;
                    this.data.scrs = data.data.scrs;
                    this.data.xgsj = data.data.xgsj;
                    this.data.zt = data.data.zt;


                    var fjdz = JSON.parse(data.data.fjdz);
                    if (fjdz.length == 0) {
                        this.up_img = '';
                    } else {
                        var inner_name = fjdz.inner_name;
                        this.up_img = url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + inner_name;

                    }

                    var login_level = cloud.user_level();
                    this.level = login_level;
                    if (login_level == 4) {//校管理
                        this.teacher_arr = cloud.school_to_teacher();
                        var tea_data = data.data.zdls_list;
                        var tea_length = tea_data.length;
                        var arr = [];
                        for (var i = 0; i < tea_length; i++) {
                            var obj = tea_data[i].fk_zdls_id + '|' + tea_data[i].zdls;
                            arr.push(obj);
                        }
                        this.teacher_info = arr;
                    }
                    this.typeChange();
                },
                complete_add: function (data) {
                    if (this.level == 4) {
                        this.teacher_sel.fk_hd_id = data.data.id;
                        ajax_post(api_add_teacher, this.teacher_sel, this);
                    } else {
                        window.location = '#management_list';
                    }
                },
                back: function () {
                    window.location = '#management_list';
                }

            });
            vm.$watch('onReady', function () {
                vm.init();
                $("#select_teacher").select2();
                $("#select_teacher").on("change", function (e) {
                    vm.teacher_info = $("#select_teacher").val();
                });
                $('#end_time_x').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language: 'zh-CN'

                });
                $('#start_time_x').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language: 'zh-CN'
                });
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });