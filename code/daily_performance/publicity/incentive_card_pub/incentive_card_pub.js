/**
 * Created by Administrator on 2018/6/14.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('daily_performance', 'publicity/incentive_card_pub/incentive_card_pub', 'html!'),
        C.Co('daily_performance', 'publicity/incentive_card_pub/incentive_card_pub', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),
        "select2",
        C.CMF('partial_loading/loading.js'),
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, three_menu_module, select2,pl) {
        //审核公式管控-查询
        var api_query_pub = api.api + 'GrowthRecordBag/publicity_audit_query';
        //校级公示-年级、班级
        var api_grade_class = api.user + 'class/school_class.action';
        //年级公示-班级
        var api_get_class = api.user + 'class/findClassSimple.action';
        //成长激励卡公示列表
        var api_card_pub = api.api + 'everyday/page_gain_card_by_status';
        //成长激励卡添加异议
        var api_comment_add = api.api + "everyday/addObjection";
        const page_objection_api = api.api + "everyday/page_objection";
        //查询学生异议收集列表
        // var api_get_obj=api.api+"everyday/page_objection";
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
                $id: "incentive_card_pub",
                url_file: api.api + "file/get",//获取文件,
                //学生头像
                user_photo: cloud.user_photo,
                url_img: url_img,
                //登录者姓名
                ident_name: '',
                //公示管控范围:0-未设置、不公示；1-全校可见；2-本年级可见；3-本班可见
                pub_range: 0,
                //区县名称
                district_name: '',
                //年级列表
                grade_list: [],
                grade_info: '',
                //班级列表
                class_list: [],
                //学籍号
                stu_num: '',
                //姓名
                stu_name: '',
                //图片展开收起
                open_close: false,
                daily_num: -1,
                //成长激励卡列表数据
                card_list: [],
                //成长激励卡活动总条数
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
                // 查询所用到的参数
                form_list_score: {
                    fk_class_id: "",
                    fk_grade_id: '',
                    fk_school_id: '',
                    //记录状态	number	4-公示
                    status: 1,
                    offset: 0,
                    rows: 5,
                    code: '',
                    name: '',
                },
                status_list: [],
                //数据类型转换
                data_change: function (a) {
                    return JSON.parse(a);
                },
                url_for: function (id) {
                    // console.log( this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id)
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                to_search: function () {
                    this.card_list = [];
                    this.form_list_score.offset = 0;
                    this.old_scroll_top = 0;
                    this.data_had = false;
                    this.form_list_score.code = this.stu_num.trim();
                    this.form_list_score.name = this.stu_name.trim();
                    content_pl.start();
                    // 成长激励卡列表
                    ajax_post(api_card_pub, this.form_list_score.$model, this);
                },
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
                        // if (Math.ceil(wh + c) >= h) {
                        if (Math.ceil(wh + c) >= h && vm.only_scoll_req) {
                            if (vm.card_list.length == 0 || vm.form_list_score.offset + vm.form_list_score.rows >= vm.all_count) return;
                            content_pl.start();
                            vm.data_had = false;
                            vm.form_list_score.offset = vm.form_list_score.offset + vm.form_list_score.rows;
                            vm.old_scroll_top = h;
                            vm.only_scoll_req = false;
                            ajax_post(api_card_pub, vm.form_list_score.$model, vm);
                        }
                    });
                },
                //年级改变
                gradeChange: function () {
                    var gId = this.grade_info;
                    this.form_list_score.fk_grade_id = this.grade_info;
                    var pub_range = this.pub_range;
                    if (pub_range == 2) {//年级
                        //获取指定学校年级的班级集合
                        ajax_post(api_get_class, {
                            fk_school_id: this.form_list_score.fk_school_id,
                            fk_grade_id: gId
                        }, this);
                        return;
                    }
                    var list = this.grade_list;
                    for (var i = 0; i < list.length; i++) {
                        var grade_id = list[i].grade_id;
                        if (gId == grade_id) {
                            this.class_list = this.grade_list[i].class_list;
                            this.form_list_score.fk_class_id = this.class_list[0].class_id;
                        }
                    }

                },

                init: function () {
                    content_pl = new pl();
                    content_pl.init({
                       target:'#list-con',
                       type:1,
                    });
                    content_pl.start();
                    //公示审核管控
                    ajax_post(api_query_pub, {}, this);
                    this.scoll_load();
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
                //当前提异议的序号
                dissent_index:-1,
                //提出的异议信息
                dissent_obj:{},
                //提异议
                ask_dis: function (id,idx) {
                    var self = this;
                    layer.prompt({title: '请填写异议', formType: 2}, function (text, index) {
                        vm.dissent_index = idx;
                        vm.dissent_obj = {content:text,owner_name:vm.ident_name};
                        ajax_post(api_comment_add, {content: text, p_id: id}, self);
                        layer.close(index);
                    });
                },

                cb: function () {
                    var self = this;
                    var pub_range = self.pub_range;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level = data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        self.form_list_score.fk_xs_id = tUserData.guid;
                        if (userType == 1) {//教师
                            // self.form_list_score.fk_grade_id=tUserData.teach_class_list[0].grade_id;
                            self.ident_name = tUserData.name;
                            self.district_name = tUserData.district;
                            self.form_list_score.fk_school_id = tUserData.fk_school_id;
                            if (pub_range == 1) {//全校可见
                                ajax_post(api_grade_class, {school_id: self.form_list_score.fk_school_id}, self);
                            } else if (pub_range == 2) {//本年级可见
                                self.grade_list = cloud.auto_grade_list({});
                                var grade_id = self.grade_list[0].grade_id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class, {
                                    fk_school_id: self.form_list_score.fk_school_id,
                                    fk_grade_id: grade_id
                                }, self);
                            } else if (pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                                self.grade_list = cloud.auto_grade_list({});
                                self.class_list = self.grade_list[0].class_list;
                            }
                        } else if (userType == 2) {//学生
                            // self.form_list_score.fk_grade_id=tUserData.grade_id;
                            self.district_name = tUserData.district;
                            self.ident_name = tUserData.name;
                            self.form_list_score.fk_school_id = tUserData.fk_school_id;
                            if (pub_range == 1) {//本校可见
                                ajax_post(api_grade_class, {school_id: self.form_list_score.fk_school_id}, self);
                            } else if (pub_range == 2) {//本年级可见
                                //年级
                                var gb = {
                                    grade_id: tUserData.fk_grade_id,
                                    grade_name: tUserData.grade_name
                                };
                                self.grade_list.push(gb);
                                var grade_id = self.grade_list[0].grade_id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class, {
                                    fk_school_id: self.form_list_score.fk_school_id,
                                    fk_grade_id: grade_id
                                }, self);
                            } else if (pub_range == 3 || pub_range == 0) {//班级公式、不公式、未设置
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
                            //子女基本信息
                            var stuInfo = tUserData.student;
                            self.district_name = stuInfo.district;
                            self.ident_name = tUserData.name;
                            self.form_list_score.fk_school_id = stuInfo.fk_school_id;
                            if (pub_range == 1) {//本校可见
                                ajax_post(api_grade_class, {school_id: self.form_list_score.fk_school_id}, self);
                            } else if (pub_range == 2) {//本年级可见
                                //年级
                                var gb = {
                                    grade_id: stuInfo.fk_grade_id,
                                    grade_name: stuInfo.grade_name
                                };
                                self.grade_list.push(gb);
                                var grade_id = self.grade_list[0].grade_id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class, {
                                    fk_school_id: self.form_list_score.fk_school_id,
                                    fk_grade_id: grade_id
                                }, self);
                            } else if (pub_range == 3 || pub_range == 0) {//班级公式、不公式、未设置
                                //年级
                                var gb = {
                                    grade_id: stuInfo.fk_grade_id,
                                    grade_name: stuInfo.grade_name
                                };
                                self.grade_list.push(gb);
                                //班级
                                var obj = {
                                    class_id: stuInfo.fk_class_id,
                                    class_name: stuInfo.class_name
                                };
                                self.class_list.push(obj);
                            }
                        }
                        if (pub_range == 3 || pub_range == 0) {
                            self.grade_info = self.grade_list[0].grade_id;
                            self.form_list_score.fk_grade_id = self.grade_list[0].grade_id;
                            self.form_list_score.fk_class_id = self.class_list[0].class_id;
                            // 成长激励卡列表
                            ajax_post(api_card_pub, self.form_list_score.$model, self);
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
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //公式管控审核
                            case api_query_pub:
                                this.complete_query_pub(data);
                                break;
                            //    校下的年级班级
                            case api_grade_class:
                                this.complete_grade_class(data);
                                break;
                            //    指定学校年级的班级
                            case api_get_class:
                                this.complete_get_class(data);
                                break;
                            //成长激励卡列表
                            case api_card_pub:
                                layer.closeAll();
                                this.complete_daily_pub(data);
                                break;
                            //提交异议
                            case api_comment_add:
                                this.complete_comment_add(data);
                                break;
                            case page_objection_api:
                                if (!data || !data.data || !data.data.list) return;
                                const new_data = data.data;
                                const new_list = new_data.list;
                                for (var i = 0, len = this.status_list.length; i < len; i++) {
                                    this.status_list[i].a_adissent = [];
                                    for (var j = 0, len2 = new_list.length; j < len2; j++) {
                                        if (new_list[j].p_id == this.status_list[i].id) {
                                            this.status_list[i].a_adissent.push(new_list[j])
                                        }
                                    }
                                }
                                this.deal_list(this.status_list);
                                break;
                        }
                    } else {
                        content_pl.stop();
                        toastr.error(msg)
                    }
                },
                //公式审核管控
                complete_query_pub: function (data) {
                    var self = this;
                    var list = data.data;
                    if (list != null && list.length > 0) {
                        //mkid（模块id）：1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                        //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                        //sfsh（是否审核）：0否1是2学生录入教师审3教师录入评价小组审
                        //xsqr（学生确认）：0否1是
                        for (var i = 0; i < list.length; i++) {
                            var mkid = list[i].mkid;
                            if (mkid == 6) {
                                self.pub_range = list[i].gsfw;
                                break;
                            }
                        }
                    }
                    this.cb();
                },
                //校下年级班级
                complete_grade_class: function (data) {
                    var list = data.data;
                    this.grade_list = list;
                    this.class_list = this.grade_list[0].class_list;
                    //年级信息
                    this.grade_info = this.grade_list[0].grade_id;
                    //年级id
                    this.form_list_score.fk_grade_id = this.grade_list[0].grade_id;
                    //班级id
                    this.form_list_score.fk_class_id = this.class_list[0].class_id;
                    // 成长激励卡列表
                    ajax_post(api_card_pub, this.form_list_score.$model, this);
                },
                //指定学校年级的班级
                complete_get_class: function (data) {
                    var list = data.data;
                    this.class_list = list;
                    //年级信息
                    this.grade_info = this.grade_list[0].grade_id;
                    //年级id
                    this.form_list_score.fk_grade_id = this.grade_list[0].grade_id;
                    //班级id
                    this.form_list_score.fk_class_id = this.class_list[0].class_id;
                    // 成长激励卡列表
                    ajax_post(api_card_pub, this.form_list_score.$model, this);
                },
                complete_daily_pub: function (data) {
                    // this.card_list = [];
                    //获取头像
                    ready_photo(data.data.list, 'student_guid');
                    //获取列表信息
                    var list = data.data.list;
                    vm.all_count = list.length;
                    if (list.length == 0) {
                        content_pl.stop();
                        this.data_had = true;
                        return;
                    }
                    var ids = [];
                    for (var i = 0, len = list.length; i < len; i++) {
                        ids.push(list[i].id)
                    }
                    this.list_page_objection(ids);
                    this.status_list = list;
                    // for (var i = 0; i < list.length; i++) {
                    //     var id = list[i].id;
                    //     var obj = list[i];
                    //     var e = 0;
                    //     cloud.get_objection({p_id: id}, function (url, arg, ret) {
                    //         for (var i = 0; i < list.length; i++) {
                    //             if (ret.list.length == 0)
                    //                 break;
                    //             if (ret.list[0].p_id == list[i].id) {
                    //                 list[i].a_adissent = ret.list;
                    //                 break;
                    //             }
                    //         }
                    //         e++;
                    //         if (e == list.length) {
                    //             vm.deal_list(list);
                    //         }
                    //     });
                    // }
                },
                list_page_objection: function (ids) {
                    ajax_post(page_objection_api, {
                        p_id_list: ids
                    }, this)
                },

                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                deal_list: function (list) {
                    var token = sessionStorage.getItem("token");
                    for (var i = 0; i < list.length; i++) {
                        if (!list[i].a_attachment || list[i].a_attachment == null)
                            continue;
                        var fjdz = JSON.parse(list[i].a_attachment);
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
                    this.card_list = this.card_list.concat(list);
                    if (this.old_scroll_top > 0) {
                        $(window).scrollTop(this.old_scroll_top);
                    }
                    vm.only_scoll_req = true;
                },
                complete_comment_add: function (data) {
                    toastr.success('异议提交成功');
                    //成长激励卡列表
                    // ajax_post(api_card_pub, this.form_list_score.$model, this);
                    var dis = this.card_list[this.dissent_index];
                    if(!dis.hasOwnProperty('a_adissent')){
                        dis.a_adissent = [];
                    }
                   dis.a_adissent.push(this.dissent_obj);
                    this.card_list.set(this.dissent_index,JSON.parse(JSON.stringify(dis)))
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