/**
 * Created by Administrator on 2018/7/26.
 */
define([
        'jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('daily_performance/teacher', 'dailyperform_group_review/dailyperform_group_review', 'html!'),
        C.Co('daily_performance/teacher', 'dailyperform_group_review/dailyperform_group_review', 'css!'),
        C.CMF("data_center.js"),
        C.CMF("table/table.js"),
        C.CM("select_assembly"),
        C.CM("select_kinds")
    ],
    function ($, avalon, layer, html, css, data_center, table, select_assembly,select_kinds) {
        avalon.filters.count_filter = function (count,is_show) {
            if(!is_show)
                return '*';
            return count;
        };
        //获取市下区县
        var api_city_disc = api.user + 'school/arealist.action';
        //获取学校
        var api_get_school = api.user+'school/schoolList.action';
        //获取区县下全部学校年级集合-区县
        var api_disc_school = api.user + 'school/sub_school_grade_list';
        //获取指定学校的年级班级集合——校、区县
        var api_school_class = api.user + 'class/school_class.action';
        //审核日常表现
        var api_daily_check = api.api+'everyday/checke_everyday';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "dailyperform_group_review",
                //图片是否展开（注：如果数据是循环出来，不能用这种方式）
                is_open: false,
                //未通过理由
                no_pass_msg: '',
                // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师;11:年级+教师
                highest_level: '',
                //区县
                area_list: [],
                area_name:'',
                //学校
                school_list: [],
                school_name:'',
                //年级
                grade_list: [],
                grade_name:'',
                //班级列表
                class_list: [],
                class_name:'',
                //区县
                district: '',
                //数据列表
                list: [],
                //请求数据的数量
                current_rows: 15,
                //前一次请求的滚动条高度
                old_scroll_top: '',
                //判断是审核通过页面还是审核未通过页面
                tab_state: '1',
                extend: {
                    fk_grade_id:'',
                    fk_class_id: '',
                    //状态 -1删除 1待审核 2审核不通过 3待确认 4已确认(公示) 5归档
                    status: '',
                    offset: 0,
                    rows: 15,
                    code: '',
                    name: ''
                },
                person_types:[],
                count:0,
                init: function () {
                    //获取页面刷新是选中的是待审核还是审核未通过
                    var tab_state = sessionStorage.getItem('review_tab_state');
                    if(tab_state){
                        this.tab_state = tab_state;
                    }
                    this.district = cloud.user_district();
                    this.cd();
                },
                cd:function () {
                    var self = this;
                    data_center.uin(function(data){
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level = data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        // if(highest_level == '2'){//市
                        //     self.highest_level = 2;
                        //     //区县
                        //     self.area_list = cloud.area_list();
                        //     self.area_name = self.area_list[0].district;
                        //     //学校
                        //     self.school_list =  cloud.school_list({"district":self.area_name});
                        //     self.school_name = self.school_list[0].schoolname;
                        //     //年级
                        //     var school_id = self.school_list[0].id;
                        //     ajax_post(api_school_class,{school_id:school_id},self);
                        // }else if(highest_level == 3){//区县
                        //     self.highest_level=3;
                        //     var name = tUserData.district;
                        //     self.school_list = cloud.school_list({"district":name});
                        //     self.school_name = self.school_list[0].schoolname;
                        //     //年级
                        //     var school_id = self.school_list[0].id;
                        //     ajax_post(api_school_class,{school_id:school_id},self);
                        // }else
                        if(highest_level == '4'){//学校
                            self.highest_level=4;
                            self.school_name = tUserData.school_name;
                            //年级
                            var school_id = tUserData.fk_school_id;
                            ajax_post(api_school_class,{school_id:school_id},self);
                        }
                    });
                },
                // //区县改变
                // areaChange:function(el){
                //     this.school_list = [];
                //     this.school_name = '';
                //     this.grade_list = [];
                //     this.grade_name = '';
                //     this.extend.fk_grade_id = '';
                //     this.class_list = [];
                //     this.class_name = '';
                //     this.extend.fk_class_id = '';
                //     // var data = this.area_list;
                //     var name = el.district;
                //     //学校
                //     this.school_list = cloud.school_list({"district":name});
                //     this.school_name = this.school_list[0].schoolname;
                //     //年级
                //     var school_id = this.school_list[0].id;
                //     ajax_post(api_school_class,{school_id:school_id},this);
                // },
                // //学校改变
                // schoolChange:function(el){
                //     this.grade_list = [];
                //     this.grade_name = '';
                //     this.extend.fk_grade_id = '';
                //     this.class_list=[];
                //     this.extend.fk_class_id = "";
                //     this.class_name = '';
                //     var school_id = el.id;
                //     ajax_post(api_school_class,{school_id:school_id},this);
                // },
                //年级改变
                gradeChange:function(el){
                    this.class_list = [];
                    this.class_name = '';
                    this.extend.fk_class_id = '';
                    var list = this.grade_list;
                    var gId = el.grade_id;
                    this.extend.fk_grade_id = el.grade_id;
                    for(var i=0;i<list.length;i++){
                        var id = list[i].grade_id;
                        if(gId == id){
                            this.class_list = this.grade_list[i].class_list;
                            this.class_name = this.class_list[0].class_name;
                            this.extend.fk_class_id = this.class_list[0].class_id;
                            this.get_classes();
                            this.listen_scroll();
                        }
                    }
                },
                //班级改变
                classChange:function(el){
                    this.extend.fk_class_id = el.class_id;
                    this.get_classes();
                    this.listen_scroll();
                },
                uninit:function () {
                    $(window).unbind ('scroll');
                },
                url_img: url_img,
                user_photo: cloud.user_photo,
                //监听滚动
                listen_scroll: function () {
                    var self = this;
                    $(window).scroll(function () {
                        var h = $(document.body).height();//网页文档的高度
                        var c = $(document).scrollTop();//滚动条距离网页顶部的高度
                        var wh = $(window).height(); //页面可视化区域高度
                        if (Math.ceil(wh + c) >= h) {
                            if (self.list.length < self.extend.rows)
                                return;
                            self.extend.rows += 15;
                            self.old_scroll_top = h;
                            self.get_classes();
                        }
                    })

                },
                //获取教师教的班级
                get_classes: function () {
                    //获取日常表现数据
                    this.get_daily_data();
                },
                //获取日常表现
                get_daily_data: function () {
                    // class_id = 83;
                    var self = this;
                    self.count = 0;
                    if (this.tab_state == 1) {
                        this.extend.status = '1';
                        layer.load(1);
                        cloud.get_daily_checke_leader(this.extend.$model, function (url, args, data) {
                            self.count = data.count;
                            self.deal_data(data.list);
                            layer.closeAll()
                        });
                        return
                    }
                    this.extend.status = '2';
                    layer.load(1);
                    cloud.get_daily_checke_leader(this.extend.$model, function (url, args, data) {
                        self.count = data.count;
                        self.deal_data(data.list);
                        layer.closeAll()
                    })

                },

                //处理请求过来的数据
                deal_data: function (data) {
                    this.list = [];
                    if(!data)
                        return;

                    for (var i = 0; i < data.length; i++) {
                        //图片展开收起
                        data[i].is_open = false;
                        //活动图片
                        data[i].photo_guid = JSON.parse(data[i].attachment);
                    }
                    this.list = this.list.concat(data);
                    if (this.old_scroll_top > 0) {
                        $(window).scrollTop(this.old_scroll_top);
                    }
                    layer.closeAll();
                },
                //切换tab
                change_tab: function (tab) {
                    //存储当前是待审核还是审核未通过
                    this.tab_state = tab;
                    sessionStorage.setItem('review_tab_state',tab);
                    this.get_classes();
                    this.listen_scroll();
                },
                //图片展开或收起，注：如果数据循环出来，逻辑不一定这么写
                open_close: function (w, index) {
                    if (w == 'open') {
                        this.list[index].is_open = true;
                    } else {
                        this.list[index].is_open = false;
                    }
                },
                //通过执行的方法
                pass: function (el, index) {
                    var id = el.id;
                    //状态 -1删除 1待审核 2审核不通过 3待确认 4已确认(公示) 5归档
                    ajax_post(api_daily_check,{id:id,status:3},this);
                },
                //不通过执行的方法
                no_pass: function (el, index) {
                    var self = this;
                    var id = el.id;
                    self.no_pass_msg = '';
                    layer.open({
                        title: '理由',
                        type: 1,
                        area: ['600px', '320px'],
                        content: $('#v_layer')
                        , btn: ['确定', '取消']
                        , yes: function (index1, layero) {
                            // self.deal_audit(el, index, false);
                            //状态 -1删除 1待审核 2审核不通过 3待确认 4已确认(公示) 5归档
                            ajax_post(api_daily_check,{id:id,status:2},self);
                        }
                        , cancel: function () {
                            //右上角关闭回调
                        }
                    });
                },
                //查询
                search: function () {
                    this.get_classes();
                    this.listen_scroll();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取指定学校的年级班级集合
                            case api_school_class:
                                this.complete_school_class(data);
                                break;
                            //    审核日常表现
                            case api_daily_check:
                                this.complete_daily_check(data);
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //    获取指定学校的年级班级集合
                complete_school_class:function(data){
                    this.grade_list = data.data;
                    this.grade_name = this.grade_list[0].grade_name;
                    this.extend.fk_grade_id = this.grade_list[0].grade_id;
                    this.class_list = this.grade_list[0].class_list;
                    this.class_name = this.class_list[0].class_name;
                    this.extend.fk_class_id = this.class_list[0].class_id;
                    this.get_classes();
                    this.listen_scroll();
                },
                complete_daily_check:function(data){
                    layer.closeAll();
                    toastr.success('操作成功！');
                    this.get_classes();
                    this.listen_scroll();
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
