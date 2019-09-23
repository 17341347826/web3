/**
 * Created by Administrator on 2018/6/6.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('daily_performance', 'teacher/daily_perform_see_list/daily_perform_see_list', 'html!'),
        C.Co('daily_performance', 'teacher/daily_perform_see_list/daily_perform_see_list', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),C.CM("table")
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, three_menu_module,table) {
        //审核公式管控-查询
        var api_query_pub = api.api+'GrowthRecordBag/publicity_audit_query';
        //教师查看日常表现
        var list_api = api.api + "everyday/list_create_everyday";
        //班干部查看日常表现
        var create_everyday_api = api.api + "everyday/get_list_my_create_everyday";
        // // 删除数据
        var api_delete_by_id=api.api + "everyday/delete_everyday";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "daily_perform_see_list",
                html_display:2,
                url:'',
                remember:false,
                is_init:false,
                semester_head:"",
                type_list:[
                    {name:'列表查看',value:1},
                    {name:'请选择查看方式',value:0},
                    {name:'详情查看',value:2}
                ],
                //年级列表
                grade_list: [],
                //班级列表
                class_list: [],
                //学年学期列表
                semester_list: [],
                //年级列表和班级列表
                user_info: [],
                //需要传参
                extend: {
                    code: '',
                    name: "",
                    fk_semester_id: "",
                    status: '',
                    fk_class_id: "",
                    founder:'',
                    fk_school_id:""
                },
                data:{
                    offset: 0,
                    rows: 15
                },
                // 表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                },
                    {
                        title: "姓名",
                        type: "text",
                        from: "name"
                    },
                    {
                        title: "学籍号",
                        type: "text",
                        from: "code"
                    },
                    {
                        title: "关键表现",
                        type: "text_desc_width",
                        from: "description"
                    },
                    {
                        title: "表现时间",
                        type: "text",
                        from: "everyday_date"
                    },
                    {
                        title: "得分",
                        type: "text",
                        from: "score"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='查看'></a>"
                    }
                ],
                cbopt: function (params) {
                    if (params.type == 1) {
                        this.deal_list(params.data);
                    }
                },
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                deal_list: function (el) {
                    el.img_arr = [];
                    el.video_arr = [];
                    el.file_arr = [];
                    var token = sessionStorage.getItem("token");
                    var fjdz = JSON.parse(el.attachment);
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
                            el.video_arr.push(fjdz[j]);
                            continue;
                        }
                        if (vm.suffix_img.indexOf(suffix) != -1) {
                            el.img_arr.push(fjdz[j]);
                            continue;
                        }
                        el.file_arr.push(fjdz[j]);
                    }
                    this.list = el;

                },
                list: [],
                district_name: "",
                //前一次请求的滚动条高度
                old_scroll_top: '',
                url_img: url_img,
                user_photo: cloud.user_photo,
                current_menu: '',
                user_level: '',
                head_value: {grade: "请选择年级", class: "请选择班级", semester: "请选择学期"},
                init: function () {
                    this.district_name = D("user.user.district");
                    this.semester_list = cloud.semester_all_list();
                    var semester_obj = {
                        name: '全部',
                        value: ''
                    };
                    this.semester_list.unshift(semester_obj);
                    this.current_menu = this.semester_list[1].value;
                    this.user_level = cloud.user_level();
                    var user = cloud.user_user();
                    if(this.user_level == 4){
                        this.extend.fk_school_id = cloud.user_school_id();
                    }else{
                        this.extend.founder = user.guid;

                    }
                    var remark_obj = JSON.parse(sessionStorage.getItem('remark_obj'));
                    if(remark_obj){
                        if(Number(remark_obj.fk_semester_id) == ''){
                            this.extend.fk_semester_id = '';
                        }else{
                            this.extend.fk_semester_id = Number(remark_obj.fk_semester_id);
                        }
                        if(remark_obj.semester_name == ''){
                            this.semester_head =  '';
                        }else{
                            this.semester_head =  remark_obj.semester_name;
                        }
                        this.extend.status = remark_obj.status;
                    }else{
                        this.extend.fk_semester_id = '';
                        this.semester_head =  '';
                        this.extend.status = 1;
                    }


                    if (this.user_level == 7) {
                        this.extend.fk_class_id = user.fk_class_id;
                        this.url = list_api;
                        this.is_init = true;
                        this.get_data();
                        return;
                    }
                    this.user_info = cloud.auto_grade_list();
                    // console.log(cloud.user_user());
                    // console.log(this.user_info);
                    if (this.user_info.length == 0) {
                        layer.alert('您暂无执教年级数据');
                        return;
                    }

                    this.deal_grade_class(this.user_info);
                },
                uninit:function () {
                    $(window).unbind ('scroll');
                },
                update_data:function (el) {
                    data_center.set_key("my_add_list", el.id);
                    if(this.user_level==6){
                        window.location = "#dpe?params_type="+2+"&my_add_list="+el.id+'&status='+1;
                        return
                    }
                    window.location = "#dpe?params_type="+2+"&my_add_list="+el.id+'&status='+2;


                },
                add_daily: function () {
                    //查询公示审核管控
                    ajax_post(api_query_pub,{},this);
                },
                delete_data:function (el) {
                    var self = this;
                    var id = el.id;
                    layer.confirm('你确定要删除吗？', {
                        btn: ['确定', '取消'] //按钮
                    }, function() {
                        //删除
                        toastr.info('正在删除中', { icon: 1 });
                        ajax_post(api_delete_by_id, { id: id }, self);
                    });
                },
                get_data: function () {
                    // layer.load(1, {shade:[0.3,'#121212']});
                    if(this.user_level==7){
                        this.url = create_everyday_api;
                        this.extend.__hash__ = new Date();
                        return;
                    }
                    this.url = list_api;
                    // console.log(this.extend)
                    this.is_init = true;
                    // console.log(this.extend)
                },
                deal_grade_class: function (user_info) {
                    this.grade_list = [];
                    for (var i = 0; i < user_info.length; i++) {
                        var obj = {
                            name: '',
                            value: ''
                        };
                        obj.name = user_info[i].grade_name;
                        obj.value = user_info[i].grade_id;
                        this.grade_list.push(obj)
                    }
                    this.get_class(user_info[0]);
                },
                //年级筛选
                sel_grade: function (el) {
                    var id = el.value;
                    for (var i = 0; i < this.user_info.length; i++) {
                        if (this.user_info[i].grade_id == id) {
                            this.get_class(this.user_info[i]);
                        }
                    }
                },
                get_class: function (grade) {
                    var class_list = grade.class_list;
                    var class_length = class_list.length;
                    this.class_list = [];
                    for (var i = 0; i < class_length; i++) {
                        var class_obj = {};
                        class_obj.name = class_list[i].class_name;
                        class_obj.value = class_list[i].class_id;
                        this.class_list.push(class_obj)
                    }
                    this.sel_class(this.class_list[0]);
                    // this.extend.fk_class_id = this.class_list[0].value;
                    // this.get_data();
                },
                //班级筛选
                sel_class: function (el) {
                    this.extend.fk_class_id = el.value;
                    data_center.scope("daily_class", function (p) {
                        p.head_value = el.name;
                    });
                    this.get_data();
                },
                //学期筛选
                sel_semester: function (el) {
                    this.extend.fk_semester_id = el.value.split('|')[0];
                    this.get_data();
                },
                //菜单跳转
                menu_jump: function (value) {
                    this.current_menu = value;
                    this.extend.fk_semester_id = value.split('|')[0];
                    this.url = list_api;
                    this.extend.__hash__ = new Date();
                    // ajax_post(list_api, this.extend.$model, this);
                    var sign = '.s' + value.split('|')[0];
                    if (!$(sign) || !$(sign).eq(0) || !$(sign).eq(0).position())
                        return;
                    var top1 = $(sign).eq(0).position().top;
                    var top2 = $("#top").position().top;
                    var top = top1 - top2 - 136;
                    $('body,html').animate({scrollTop: top}, 500);
                },
                search: function () {
                    this.get_data();
                },
                change_status: function (statu) {
                    this.extend.status = statu;
                    if(statu == 5){
                        this.extend.founder = null;
                    }
                    this.get_data();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询公示审核管控
                            case api_query_pub:
                                this.complete_query_pub(data);
                                break;

                            case api_delete_by_id:
                                toastr.success('成功删除');
                                this.get_data();
                                break;
                            default:
                                break;

                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                //公示审核管控
                complete_query_pub:function (data) {
                    var type = false;
                    var list = data.data;
                    if(list != null && list.length>0){
                        //mkid（模块id）：1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                        //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                        //sfsh（是否审核）：0否1是2学生录入教师审3教师录入评价小组审
                        //xsqr（学生确认）：0否1是
                        for(var i=0;i<list.length;i++){
                            var mkid = list[i].mkid;
                            if(mkid == 1){
                                type = true;
                                break;
                            }
                        }
                    }
                    if(type == true){
                        data_center.set_key("params_type", 1);
                        data_center.remove_key("params_type");
                        data_center.remove_key("my_add_list");
                        if(this.user_level==6){
                            window.location = "#dpe?status="+1;
                        }
                        window.location = "#dpe?status="+2;
                    }else{
                        layer.alert('市管理员公示审核管控还未设置', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                    }
                },
                back:function () {
                    this.list = [];
                }
            });
            vm.$watch("html_display", function() {
                if(vm.html_display == 1){
                    var obj = {};
                    obj.status = this.extend.status;
                    obj.fk_semester_id = this.extend.fk_semester_id;
                    obj.semester_name = this.semester_name;
                    sessionStorage.setItem('remark_obj',JSON.stringify(obj));
                    window.location = '#daily_perform_see';
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