/**
 * Created by Administrator on 2018/6/9.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('daily_performance', 'publicity/compre_practice_pub/compre_practice_pub', 'html!'),
        C.Co('daily_performance', 'publicity/compre_practice_pub/compre_practice_pub', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),
        C.CMF('partial_loading/loading.js'),
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,three_menu_module,pl) {
        //审核公式管控-查询
        var api_query_pub = api.api + 'GrowthRecordBag/publicity_audit_query';
        //校级公示-年级、班级
        var api_grade_class = api.user + 'class/school_class.action';
        //年级公示-班级
        var api_get_class = api.user + 'class/findClassSimple.action';
        //实践活动列表
        var api_publicity_list = api.api + 'GrowthRecordBag/class_publicity_list_zh';
        // 添加异议
        var api_comment_add = api.growth + "comment_add";

        //判断后台班级名称是否返回'班'
        avalon.filters.class_ban = function (name) {
            if (name.indexOf("班") != -1)
                return name;
            else
                return name + '班'
        };
        var content_pl = undefined;
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "compre_practice_pub",
                url_file: api.api + "file/get",//获取文件,
                //学生头像
                user_photo: cloud.user_photo,
                url_img: url_img,
                is_show_none: false,
                //身份
                ident_type: "",
                //登录者姓名
                ident_name: '',
                //公示管控范围:0-未设置、不公示；1-全校可见；2-本年级可见；3-本班可见
                pub_range: 0,
                //学校id
                school_id: '',
                //区县地址
                district_name: '',
                //年级列表
                grade_list: [],
                grade_info: '',
                //班级列表
                class_list: [],
                //综合实践类型
                // 老的：模块1品德 2艺术活动3社会实践4学业水平5身心健康6成就奖励7日常表现
                //新的：2 品德 5 艺术活动 4 社会实践 6 学业水平 7 身体健康
                prac_list: [
                    {id: 2, prac_name: '品德发展'},
                    {id: 6, prac_name: '学业水平'},
                    {id: 5, prac_name: '艺术活动'},
                    {id: 4, prac_name: '社会实践'},
                    {id: 7, prac_name: '身心健康'}
                ],
                //学籍号
                stu_num: '',
                //姓名
                stu_name: '',
                //图片展开收起
                open_close: false,
                daily_num: -1,
                //实践活动请求参数
                activity_req: {
                    //年级id
                    fk_nj_id: '',
                    fk_class_id: '',
                    //当前登录用户id不能为空
                    fk_xs_id: '',
                    // 老的：模块1品德 2艺术活动3社会实践4学业水平5身心健康6成就奖励7日常表现
                    //新的：2 品德 5 艺术活动 4 社会实践 6 学业水平 7 身体健康
                    mk: '',
                    offset: 0,
                    rows: 5,
                    xjh: '',
                    xsmc: ''
                },
                //实践活动列表数据
                activity_list: [],
                //实践活动总条数
                all_count: 0,
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had: false,
                //上一次滚动条滚动的位置
                old_scroll_top: 0,
                //滚动判断每次滚动只加载一次
                only_scoll_req: true,
                //当前提异议的序号
                dissent_index: -1,
                //提出的异议信息
                dissent_obj: {},
                /**
                 * 滚动条事件:
                 * 当滚动条滚动到距离底部一定距离位置才会重新请求接口
                 * scrollTop为滚动条在Y轴上的滚动距离。
                 * clientHeight为内容可视区域的高度。
                 * scrollHeight为内容可视区域的高度加上溢出（滚动）的距离
                 * */
                scoll_load: function () {
                    $(window).scroll(function () {
                        var h = $(document.body).height();//网页文档的高度
                        var c = $(document).scrollTop();//滚动条距离网页顶部的高度
                        var wh = $(window).height(); //页面可视化区域高度
                        if (Math.ceil(wh + c) >= h && vm.only_scoll_req) {
                            if(vm.activity_req.offset + vm.activity_req.rows >= vm.all_count || vm.activity_list.length == 0){
                                // $(window).off("scroll");
                                return;
                            }
                            content_pl.start();
                            vm.data_had = false;
                            vm.activity_req.offset = vm.activity_req.offset + vm.activity_req.rows;
                            vm.old_scroll_top = h;
                            vm.only_scoll_req = false;
                            ajax_post(api_publicity_list, vm.activity_req.$model, vm);
                        }
                    });
                },
                to_search: function (by) {
                    this.activity_list = [];
                    this.activity_req.xjh = this.stu_num.trim();
                    this.activity_req.xsmc = this.stu_name.trim();
                    this.activity_req.offset = 0;
                    this.old_scroll_top = 0;
                    this.data_had = false;
                    // layer.load(1, {shade: [0.3, '#121212']});
                    content_pl.start();
                    //实践活动列表
                    ajax_post(api_publicity_list, this.activity_req.$model, this);
                },
                init: function () {
                    content_pl = new pl();
                    content_pl.init({
                        target: "#list_con",
                        type:1,//0-正常模式，1-非正常模式
                    });
                    //公示审核管控
                    ajax_post(api_query_pub, {}, this);
                    this.scoll_load();
                },
                url_for: function (id) {
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                //图片展开收起
                img_open: function (idx, num) {
                    if (num == 0) {//收起
                        this.open_close = false;
                        this.daily_num = -1;
                    } else if (num == 1) {//展开
                        this.open_close = true;
                        this.daily_num = idx;
                    }
                },
                //数据类型转换
                data_change: function (a) {
                    return JSON.parse(a);
                },
                //学籍号
                code_search:function(){
                    this.activity_list = [];
                    this.activity_req.xjh = this.stu_num;
                    this.activity_req.offset = 0;
                    this.old_scroll_top = 0;
                    content_pl.start();
                    this.data_had = false;
                    //    实践活动列表
                    ajax_post(api_publicity_list,this.activity_req.$model,this);
                },
                //姓名
                name_search:function(){
                    this.activity_list = [];
                    this.activity_req.xsmc = this.stu_name;
                    this.activity_req.offset = 0;
                    this.old_scroll_top = 0;
                    content_pl.start();
                    this.data_had = false;
                    //    实践活动列表
                    ajax_post(api_publicity_list,this.activity_req.$model,this);
                },
                cb: function () {
                    var self = this;
                    //公示管控范围:0-未设置、不公示；1-全校可见；2-本年级可见；3-本班可见
                    var pub_range = self.pub_range;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        self.ident_type = userType;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level = data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        if (userType == 1) {//教师
                            self.ident_name = tUserData.name;
                            self.activity_req.fk_xs_id = tUserData.guid;
                            self.district_name = tUserData.district;
                            self.school_id = tUserData.fk_school_id;
                            if (pub_range == 1) {//全校可见
                                ajax_post(api_grade_class, {school_id: self.school_id}, self);
                            } else if (pub_range == 2) {//本年级可见

                                self.grade_list = cloud.auto_grade_list({});
                                var grade_id = self.grade_list[0].grade_id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class, {fk_school_id: self.school_id, fk_grade_id: grade_id}, self);
                            } else if (pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                                self.grade_list = cloud.auto_grade_list({});
                                self.class_list = self.grade_list[0].class_list;
                            }
                        } else if (userType == 2) {//学生
                            self.activity_req.fk_xs_id = tUserData.guid;
                            self.district_name = tUserData.district;
                            self.school_id = tUserData.fk_school_id;
                            self.ident_name = tUserData.name;
                            if (pub_range == 1) {//本校可见
                                ajax_post(api_grade_class, {school_id: self.school_id}, self);
                            } else if (pub_range == 2) {//本年级可见
                                //年级
                                var gb = {
                                    grade_id: tUserData.fk_grade_id,
                                    grade_name: tUserData.grade_name
                                };
                                self.grade_list.push(gb);
                                var grade_id = self.grade_list[0].grade_id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class, {fk_school_id: self.school_id, fk_grade_id: grade_id}, self);
                            } else if (pub_range == 3 || pub_range == 0) {//班级公式、不公式、未设置
                                //年级
                                var gb = {
                                    grade_id: tUserData.fk_grade_id,
                                    grade_name: tUserData.grade_name
                                };
                                self.grade_list.push(gb);
                                //班级
                                var obj = {
                                    class_id: tUserData.fk_class_id,
                                    class_name: tUserData.class_name
                                };
                                self.class_list.push(obj);
                            }
                        } else if (userType == 3) {//家长
                            self.activity_req.fk_xs_id = tUserData.guid;
                            self.ident_name = tUserData.name;
                            var stu = tUserData.student;
                            self.school_id = stu.fk_school_id;
                            self.district_name = stu.district;
                            if (pub_range == 1) {//本校可见
                                ajax_post(api_grade_class, {school_id: self.school_id}, self);
                            } else if (pub_range == 2) {//本年级可见
                                //年级
                                var gb = {
                                    grade_id: stu.fk_grade_id,
                                    grade_name: stu.grade_name
                                };
                                self.grade_list.push(gb);
                                var grade_id = self.grade_list[0].grade_id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class, {fk_school_id: self.school_id, fk_grade_id: grade_id}, self);
                            } else if (pub_range == 3 || pub_range == 0) {//班级公式、不公式、未设置
                                //年级
                                var gb = {
                                    grade_id: stu.fk_grade_id,
                                    grade_name: stu.grade_name
                                };
                                self.grade_list.push(gb);
                                //班级
                                var obj = {
                                    class_id: stu.fk_class_id,
                                    class_name: stu.class_name
                                };
                                self.class_list.push(obj);
                            }
                        }
                        if (pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                            self.grade_info = self.grade_list[0].grade_id;
                            // self.school_id=tUserData.fk_school_id;
                            self.activity_req.fk_nj_id = self.grade_info;
                            self.activity_req.fk_class_id=self.class_list[0].class_id;
                            content_pl.start();
                            self.data_had = false;
                            //    实践活动列表
                            ajax_post(api_publicity_list, self.activity_req.$model, self);
                        }
                    });
                },
                /**
                 *  教师合并年级班级信息：
                 *  班级信息：任课班级+班主任班级
                 *  l_data:班主任年级班级信息
                 *  c_data:任课年级班级信息
                 *  unshift:为了让班主任查看的第一个是班主任班级
                 */
                teacherCombinClass: function (l_data, c_data) {
                    if (l_data.length == 0) return c_data;
                    if (c_data.length == 0) return l_data;
                    let com_grade = [];
                    let self = this;
                    l_data.forEach(function (el) {
                        //在任课里面取出当前班主任年级信息
                        let c_gradeId_info = self.base_filter(c_data, 'garde_id', el.garde_id);
                        if (c_gradeId_info.length == 0) {
                            // c_data.push(el);
                            c_data.unshift(el);
                        } else {
                            let l_class = el.class_list;
                            let c_class = c_gradeId_info[0].class_list;
                            l_class.forEach(function (al) {
                                //获取任课里面当前年级下的班级信息
                                let c_class_info = self.base_filter(c_class, 'class_id', al.class_id);
                                if (c_class_info.length == 0)
                                // c_gradeId_info[0].class_list.push(al);
                                    c_gradeId_info[0].class_list.unshift(al);
                            })
                        }
                    });
                    return c_data;
                },
                /**
                 * 基础过滤器, 返回Array<Object>中，满 足Object<key>=value的子数组
                 * @param data
                 * @param col_name
                 * @param value
                 * @returns {Array}
                 */
                base_filter: function (data, col_name, value) {
                    var ret = [];
                    for (var x = 0; x < data.length; x++) {
                        if (data[x][col_name] == value) {
                            ret.push(data[x]);
                        }
                    }
                    return ret;
                },
                //年级改变
                gradeChange: function () {
                    var pub_range = this.pub_range;
                    if (pub_range == 2) {//年级公示
                        var grade_id = this.grade_info;
                        var school_id = this.school_id;
                        //获取指定学校年级的班级集合
                        ajax_post(api_get_class, {fk_school_id: school_id, fk_grade_id: grade_id}, this);
                        return;
                    }
                    var g_id = this.grade_info;
                    this.activity_req.fk_nj_id = Number(g_id);
                    for (var i = 0; i < this.grade_list.length; i++) {
                        var id = this.grade_list[i].grade_id;
                        if (g_id == id) {
                            this.class_list = this.grade_list[i].class_list;
                            this.activity_req.fk_class_id = this.class_list[0].class_id;
                        }
                    }
                    this.activity_list = [];
                    this.activity_req.offset = 0;
                    this.old_scroll_top = 0;
                    content_pl.start();
                    this.data_had = false;
                    //    实践活动列表
                    ajax_post(api_publicity_list,this.activity_req.$model,this);
                },
                //提异议
                ask_dis: function (id, idx) {
                    var self = this;
                    layer.prompt({title: '请填写异议', formType: 2}, function (text, index) {
                        vm.dissent_index = idx;
                        vm.dissent_obj = {content: text};
                        ajax_post(api_comment_add, {content: text, synthesize_id: id}, self);
                        layer.close(index);
                    });
                },
                //班级改变
                class_change:function(){
                    this.activity_list = [];
                    this.activity_req.offset = 0;
                    this.old_scroll_top = 0;
                    content_pl.start();
                    this.data_had = false;
                    //    实践活动列表
                    ajax_post(api_publicity_list,this.activity_req.$model,this);
                },
                //模块改变
                mk_change: function () {
                    this.activity_list = [];
                    this.activity_req.offset = 0;
                    this.old_scroll_top = 0;
                    content_pl.start();
                    this.data_had = false;
                    //    实践活动列表
                    ajax_post(api_publicity_list, this.activity_req.$model, this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    layer.closeAll();
                    if (is_suc) {
                        switch (cmd) {
                            //    公示审核管控
                            case api_query_pub:
                                this.complete_query_pub(data);
                                break;
                            //    获取校下面的年级、班级
                            case api_grade_class:
                                this.complete_grade_class(data);
                                break;
                            //    获取指定学校年级的班级集合
                            case api_get_class:
                                this.complete_get_class(data);
                                break;
                            //        综合实践列表
                            case api_publicity_list:
                                this.complete_publicity_list(data);
                                break;
                            //        提异议
                            case api_comment_add:
                                this.complete_comment_add(data);
                                break;
                        }
                        return
                    }
                    if (cmd == api_publicity_list) {
                        vm.only_scoll_req = true;
                    }
                    content_pl.stop();
                    toastr.error(msg)
                },
                //公示审核管控
                complete_query_pub: function (data) {
                    var self = this;
                    var list = data.data;
                    // if(data.data == null || data.data == undefined || data.data.length == 0){
                    //     self.cb();
                    //     return;
                    // }
                    if (list != null && list.length > 0) {
                        //mkid（模块id）：1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                        //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                        //sfsh（是否审核）：0否1是2学生录入教师审3教师录入评价小组审
                        //xsqr（学生确认）：0否1是
                        for (var i = 0; i < list.length; i++) {
                            var mkid = list[i].mkid;
                            if (mkid == 2) {
                                self.pub_range = list[i].gsfw;
                                break;
                            }
                        }
                    }
                    self.cb();
                },
                //校下面年级班级
                complete_grade_class: function (data) {
                    var list = data.data;
                    this.grade_list = list;
                    this.class_list = this.grade_list[0].class_list;
                    //年级信息
                    this.grade_info = this.grade_list[0].grade_id;
                    this.activity_req.fk_nj_id = this.grade_info;
                    //班级id
                    this.activity_req.fk_class_id = this.class_list[0].class_id;
                    //    实践活动列表
                    ajax_post(api_publicity_list, this.activity_req.$model, this);
                },
                //指定学校年级的班级集合
                complete_get_class: function (data) {
                    var list = data.data;
                    this.class_list = list;
                    //年级信息
                    this.grade_info = this.grade_list[0].grade_id;
                    this.activity_req.fk_nj_id = this.grade_info;
                    //班级id
                    this.activity_req.fk_class_id = this.class_list[0].id;
                    //    实践活动列表
                    ajax_post(api_publicity_list, this.activity_req.$model, this);
                },
                //    实践列表
                complete_publicity_list: function (data) {
                    this.all_count = data.data.count;
                    this.deal_list(data);
                    // this.activity_list=data.data.list;
                    this.is_show_none = this.activity_list.length == 0 ? true : false;
                },
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                deal_list: function (data) {
                    if (!data || !data.data || !data.data.list) return;
                    var list = data.data.list;
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
                            } else {
                                file_name = fjdz[j].inner_name;
                            }
                            fjdz[j].down_href = api.api + 'file/download_file?img=' + fjdz[j].guid + "&token=" + token;
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
                    ready_photo(list, 'guid');
                    content_pl.stop();
                    this.data_had = true;
                    this.activity_list = this.activity_list.concat(list);
                    if (this.old_scroll_top > 0) {
                        $(window).scrollTop(this.old_scroll_top);
                    }
                    vm.only_scoll_req = true;
                },
                //提异议
                complete_comment_add: function (data) {
                    toastr.success('提交异议成功');
                    // layer.load(1, {shade:[0.3,'#121212']});
                    // this.data_had = false;
                    //实践活动列表
                    // ajax_post(api_publicity_list,this.activity_req.$model,this);
                    this.activity_list[this.dissent_index].dissent_list.push(this.dissent_obj);
                },
            });
            vm.$watch('onReady', function () {
                vm.init();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });