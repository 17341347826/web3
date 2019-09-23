/**
 * Created by Administrator on 2018/8/2.
 */
define(["jquery",
        C.CLF('avalon.js'),
        C.Co('weixin_pj', 'stu_compre_practice/stu_record_material/stu_record_material', 'html!'),
        C.Co('weixin_pj', 'stu_compre_practice/stu_record_material/stu_record_material', 'css!'),
        C.CMF("router.js"), C.CMF("data_center.js"), "jquery-weui"
    ],
    function ($, avalon, html, css, x, data_center, weui) {
        //时间过滤
        avalon.filters.time_ten = function (data) {
            return data.substr(0, 10);
        };
        //统计资料数量
        var api_count_zh_mk = api.api + 'GrowthRecordBag/count_zh_mk';
        //获取学年学期集合
        var api_sem_list = api.user + 'semester/used_list.action';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "stu_record_material",
                url_file: api.api + "file/get",//获取文件,
                //身份
                user_type: '',
                //学生头像
                user_photo: cloud.user_photo,
                url_img: url_img,
                user_district: "",
                //
                sem_id: '',
                //学期总上传数
                sem_count: [],
                sem_cl_count: '',
                //累计材料
                all_count: [],
                all_cl_count: '',
                //学业水平
                sem_xy_count: '',
                all_xy_count: '',
                //思想品德
                sem_sx_count: '',
                all_sx_count: '',
                //身心健康
                sem_sxjk_count: '',
                all_sxjk_count: '',
                //艺术素养
                sem_ys_count: '',
                all_ys_count: '',
                //社会实践
                sem_sj_count: '',
                all_sj_count: '',
                //已通过遴选审核与编辑、删除按钮不可同时存在
                daily_list: [],
                data: {
                    fk_xq_id: '',
                    fk_xs_id: "",
                    //模块：1品德 2艺术活动 3社会实践 4学业水平 5身心健康
                    mk: 1,
                    offset: 0,
                    rows: 15
                },
                //学年学期列表
                sem_list: [],
                //当前选中学年学期
                semester_remark: -1,
                //菜单改变
                menu_change: function (num) {
                    if (num == 2) {
                        window.location = '#stu_no_selected_material';
                    } else if (num == 3) {
                        window.location = '#stu_selected_material';
                    }
                },
                init: function () {
                    // this.data.fk_xs_id = cloud.user_guid();
                    // this.user_district = cloud.user_district();
                    this.cd();
                    this.listen_scroll()
                    // this.init_load_more()
                },
                cd: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        //0：管理员；1：教师；2：学生；3：家长
                        var user_type = cloud.user_type();
                        self.user_type = cloud.user_type();
                        if (user_type == 2) {
                            self.data.fk_xs_id = cloud.user_guid();
                            self.user_district = cloud.user_district();
                        } else if (user_type == 3) {
                            self.data.fk_xs_id = cloud.parent_stu().guid;
                            self.user_district = cloud.parent_stu().district;
                        }
                        //统计数量--所有
                        ajax_post(api_count_zh_mk, {
                            fk_xq_id: '',
                            //	是否典型(1典型 0非典型)
                            sfdx: '',
                            fk_xs_id: self.data.fk_xs_id,
                            //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                            shzt: '',
                        }, self);
                    });
                },
                //学年学期当前序号
                sem_index: '',
                //学年学期改变
                semesterChange: function () {
                    var id = this.sem_index;
                    this.semester_remark = id;
                    this.data.fk_xq_id = this.sem_list[id].id;
                    this.sem_id = this.data.fk_xq_id;
                    //统计数量--本学期
                    ajax_post(api_count_zh_mk, {
                        fk_xq_id: this.sem_id,
                        //	是否典型(1典型 0非典型)
                        sfdx: '',
                        fk_xs_id: this.data.fk_xs_id,
                        //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                        shzt: '',
                    }, this);
                    if (id != -1) {//不是最新记录
                        cloud.stu_zhsj(this.data, function (url, ars, data) {
                            ready_photo(data.list, "fk_xsyh_id");
                            vm.daily_list = data.list;
                        });
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
                //添加跳转
                // add_record:function () {
                //     window.location = "#add_practice";
                // },
                json: function (x) {
                    return JSON.parse(x);
                },
                //修改
                edit: function (el) {
                    //	模块1 品德发展 2 艺术素养 3社会实践 4学业水平 5身体健康 6成就奖励 7日常表现
                    window.location.href = '#update_wx_practice?id=' + el.id + "&mk=" + this.data.mk;
                },
                //删除
                delete: function ($idx, el) {
                    var type = el.mk;
                    var id = el.id;
                    //模块  1品德 2艺术活动3社会实践4学业水平5身心健康
                    if (type == 1) {//1 品德发展
                        $.confirm({
                            title: '标题',
                            text: '是否要删除品德发展记录',
                            onOK: function () {
                                cloud.del_pd({id: id}, function (url, ars, data) {
                                    vm.daily_list.splice($idx, 1);
                                    //统计数量--所有
                                    ajax_post(api_count_zh_mk, {
                                        fk_xq_id: '',
                                        //	是否典型(1典型 0非典型)
                                        sfdx: '',
                                        fk_xs_id: vm.data.fk_xs_id,
                                        //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                                        shzt: '',
                                    }, vm);
                                });
                            },
                            onCancel: function () {
                            }
                        });
                    } else if (type == 2) {//2 艺术素养
                        $.confirm({
                            title: '标题',
                            text: '是否要删除艺术素养记录',
                            onOK: function () {
                                cloud.del_yshd({id: id}, function (url, ars, data) {
                                    vm.daily_list.splice($idx, 1);
                                    //统计数量--所有
                                    ajax_post(api_count_zh_mk, {
                                        fk_xq_id: '',
                                        //	是否典型(1典型 0非典型)
                                        sfdx: '',
                                        fk_xs_id: vm.data.fk_xs_id,
                                        //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                                        shzt: '',
                                    }, vm);
                                });
                            },
                            onCancel: function () {
                            }
                        });
                    } else if (type == 3) {// 3社会实践
                        $.confirm({
                            title: '标题',
                            text: '是否要删除社会实践记录',
                            onOK: function () {
                                cloud.del_shsj({id: id}, function (url, ars, data) {
                                    vm.daily_list.splice($idx, 1);
                                    //统计数量--所有
                                    ajax_post(api_count_zh_mk, {
                                        fk_xq_id: '',
                                        //	是否典型(1典型 0非典型)
                                        sfdx: '',
                                        fk_xs_id: vm.data.fk_xs_id,
                                        //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                                        shzt: '',
                                    }, vm);
                                });
                            },
                            onCancel: function () {
                            }
                        });
                    } else if (type == 4) {// 4学业水平
                        $.confirm({
                            title: '标题',
                            text: '是否要删除学业水平记录',
                            onOK: function () {
                                cloud.del_sysp({id: id}, function (url, ars, data) {
                                    vm.daily_list.splice($idx, 1);
                                    //统计数量--所有
                                    ajax_post(api_count_zh_mk, {
                                        fk_xq_id: '',
                                        //	是否典型(1典型 0非典型)
                                        sfdx: '',
                                        fk_xs_id: vm.data.fk_xs_id,
                                        //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                                        shzt: '',
                                    }, vm);
                                });
                            },
                            onCancel: function () {
                            }
                        });
                    } else if (type == 5) {// 5身体健康
                        $.confirm({
                            title: '标题',
                            text: '是否要删除身体健康记录',
                            onOK: function () {
                                cloud.del_sxjk({id: id}, function (url, ars, data) {
                                    vm.daily_list.splice($idx, 1);
                                    //统计数量--所有
                                    ajax_post(api_count_zh_mk, {
                                        fk_xq_id: '',
                                        //	是否典型(1典型 0非典型)
                                        sfdx: '',
                                        fk_xs_id: vm.data.fk_xs_id,
                                        //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                                        shzt: '',
                                    }, vm);
                                });
                            },
                            onCancel: function () {
                            }
                        });
                    }
                },
                init_load_more: function () {
                    var self = this;
                    var loading = false;
                    $(document.body).infinite().on("infinite", function () {
                        if (loading) return;
                        loading = true;
                        setTimeout(function () {
                            self.req_data()
                            loading = false;
                        }, 2000);
                    });
                },
                to_show_video:function(src){
                    sessionStorage.setItem('video_src',src)
                    window.location.href = "#show_video"
                },

                listen_scroll: function () {
                    var self = this;
                    $(window).scroll(function () {
                        var h = $(document.body).height();//网页文档的高度
                        var c = $(document).scrollTop();//滚动条距离网页顶部的高度
                        var wh = $(window).height(); //页面可视化区域高度

                        if (Math.ceil(wh + c) >= h) {
                            if (self.daily_list.length == self.count || self.daily_list.length > self.count)
                                return;
                            self.req_data()
                        }
                    })
                },
                uninit:function(){
                    $(window).unbind('scroll')
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
                                if (this.sem_id == '') {
                                    //累计材料
                                    this.all_count = data.data;
                                    var count = 0;
                                    for (var i = 0; i < data.data.length; i++) {
                                        count = count + data.data[i].num;
                                    }
                                    this.all_cl_count = count;
                                    //    学年学期列表
                                    ajax_post(api_sem_list, {status: 1}, this);
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
                        }
                    } else {
                        $.alert(msg)
                    }
                },
                //请求列表数据
                req_data: function () {
                    this.data.offset = this.daily_list.length;
                    this.is_show_loader_more = true;
                    const self = this;
                    $.showLoading();
                    cloud.stu_zhsj(this.data, function (url, ars, data) {
                        $.hideLoading();
                        ready_photo(data.list, "fk_xsyh_id");
                        vm.count = data.count;
                        const list = self.deal_file(data.list)
                        sort_by(list,['-cjsj'])
                        vm.daily_list = self.daily_list.concat(list)
                        self.is_show_loader_more = false
                    });
                },
                deal_file: function (list) {
                    const suffix_video = ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'];
                    const suffix_img = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
                    for (var i = 0, len = list.length; i < len; i++) {
                        var fjdz = JSON.parse(list[i].fjdz);
                        list[i].img_arr = [];
                        list[i].video_arr = [];
                        list[i].file_arr = [];
                        for (var j = 0, len2 = fjdz.length; j < len2; j++) {
                            var file_name = '';
                            if (fjdz[j].hasOwnProperty('name')) {
                                file_name = fjdz[j].name;
                            }
                            else {
                                file_name = fjdz[j].inner_name;
                            }
                            fjdz[j].down_href = api.api+'file/download_file?img=' + fjdz[j].guid + "&token="+ sessionStorage.getItem('token');
                            var suffix_index = file_name.lastIndexOf('.');
                            var suffix = file_name.substr(suffix_index + 1);
                            suffix = suffix.toLowerCase();
                            if (suffix_video.indexOf(suffix) != -1) {//视频
                                list[i].video_arr.push(fjdz[j]);
                                continue;
                            }
                            if (suffix_img.indexOf(suffix) != -1) {
                                list[i].img_arr.push(fjdz[j]);
                                continue;
                            }
                            list[i].file_arr.push(fjdz[j]);
                        }
                    }
                    return list;
                },
                complete_sem_list: function (data) {
                    this.sem_list = data.data;
                    this.sem_index = 0;
                    this.semester_remark = 0;
                    this.data.fk_xq_id = this.sem_list[0].id;
                    this.req_data();
                    this.sem_id = this.data.fk_xq_id;
                    //统计数量--本学期
                    ajax_post(api_count_zh_mk, {
                        fk_xq_id: this.sem_id,
                        //	是否典型(1典型 0非典型)
                        sfdx: '',
                        fk_xs_id: this.data.fk_xs_id,
                        //	审核状态 1待审核 2审核通过 3审核不通过(必传不能为空）
                        shzt: '',
                    }, this);
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