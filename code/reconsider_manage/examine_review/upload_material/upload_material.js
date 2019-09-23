/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('reconsider_manage/examine_review', 'upload_material/upload_material', 'html!'),
        C.Co('reconsider_manage/examine_review', 'term_evaluation_result/term_evaluation_result', 'css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CM("select_assembly"),
        C.CM("tuploader")
    ],
    function ($, avalon, layer, html, css, data_center, three_menu_module, select_assembly, tuploader) {

        var avalon_define = function () {
            var grade_list = [];
            var semester_full = [];
            var uploader = null;
            var suffix_video = ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'];
            var suffix_img = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

            function request_after(a, b, c, is_suc, msg) {
                if (!is_suc) {
                    toastr.error(msg);
                    return;
                }
                layer.load(1, {shade:[0.3,'#121212']});
                vm.data_had = false;
                refresh_yy_list();
            }
            //1、附件材料处理；2、添加模块mk:成长激励卡-8、体质健康-9、学业成绩-10、艺术测评-11
            function deal_data(url,arg,data) {
                if (!data || data.length === 0) return;
                var token = sessionStorage.getItem("token");
                var data_length = data.length;
                var mk = '';
                if(url.indexOf('bz_yy_sh_list')>-1){//成长激励卡
                    mk = 8;
                }else if(url.indexOf('health_dissent_list_v2')>-1){//体质健康
                    mk = 9;
                }else if(url.indexOf('score_dissent_list_v2')>-1 && arg.subject_id == '1000'){//学业成绩
                    mk = 10;
                }else if(url.indexOf('score_dissent_list_v2')>-1 && arg.subject_id == '10000'){//艺术测评
                    mk = 11;
                }
                for (var i = 0; i < data_length; i++) {
                    if(!data[i].mk){
                        data[i].mk = mk;
                    }
                    //这一步主要是规避学业成绩和艺术测评
                    if(!data[i].fjdz) break;
                    var fjdz = data[i].fjdz;
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
                        if (suffix_video.indexOf(suffix) != -1) {//视频
                            data[i].video_arr.push(fjdz[j]);
                            continue;
                        }
                        if (suffix_img.indexOf(suffix) != -1) {
                            data[i].img_arr.push(fjdz[j]);
                            continue;
                        }
                        data[i].file_arr.push(fjdz[j]);
                    }
                }
                return data;
            }
            //请求页面数据
            function refresh_yy_list() {
                vm.list = [];
                var count = 0;

                var data_push = function (url, arg, data) {
                    count++;
                    // if(url.indexOf('score_dissent_list_v2')>-1 && arg.subject_id == '1000'){
                    //     data = [
                    //         {
                    //             columns:[
                    //                 {col_1: "道德与法治",name:'道德与法治',alias:'col_1',type:'nor'},
                    //                 {col_2: "语文",name:'语文',alias:'col_2',type:'nor'},
                    //                 {col_3: "数学",name:'数学',alias:'col_3',type:'nor'},
                    //                 {col_4: "英语",name:'英语',alias:'col_4',type:'nor'},
                    //                 {col_11: "信息技术",name:'信息技术',alias:'col_11',type:'ABCD'},
                    //                 {音乐: "音乐",name:'音乐',alias:'音乐',type:'pass'},
                    //                 {col_13: "美术",name:'美术',alias:'col_13',type:'pass'},
                    //                 {col_14: "劳动与技术教育",name:'劳动与技术教育',alias:'col_14',type:'pass'},
                    //                 {col_15: "地方及校本课程",name:'地方及校本课程',alias:'col_15',type:'pass'}
                    //                 ],
                    //             xjh:'G511421200606190023',
                    //             xsxm:'向心悦',
                    //             content:{
                    //                 act_col_9: {level: "合格", value: 1},
                    //                 city: "眉山市",
                    //                 class_name: "001",
                    //                 code: "G511421200606190023",
                    //                 col_1: {add: 75, full_score: 100, level: "良", rate: 1, score: 75, value: 75, value_percent: 75},
                    //                 col_2: {add: 86.67, full_score: 100, level: "良", rate: 1, score: 86.67, value: 86.67, value_percent: 86.7},
                    //                 col_3: {add: 91.33, full_score: 100, level: "优", rate: 1, score: 91.33, value: 91.33, value_percent: 91.3},
                    //                 col_4: {add: 91.67, full_score: 100, level: "优", rate: 1, score: 91.67, value: 91.67, value_percent: 91.7},
                    //                 col_7: {add: 84, full_score: 100, level: "良", rate: 1, score: 84, value: 84, value_percent: 84},
                    //                 col_8: {add: 85, full_score: 100, level: "良", rate: 1, score: 85, value: 85, value_percent: 85},
                    //                 col_9: {add: 89, full_score: 100, level: "良", rate: 1, score: 89, value: 89, value_percent: 89},
                    //                 col_10: {add: 75, full_score: 100, level: "良", rate: 1, score: 75, value: 75, value_percent: 75},
                    //                 col_11: {level: "A", value: "A"},
                    //                 col_12: {level: "合格", value: 1},
                    //                 col_13: {level: "合格", value: 1},
                    //                 col_14: {level: "合格", value: 1},
                    //                 col_15: {level: "合格", value: 1},
                    //                 current_process: "公示中",
                    //                 fjdz:[],
                    //                 district: "仁寿县",
                    //                 fk_class_id: "780",
                    //                 fk_grade_id: "3",
                    //                 fk_school_id: "23",
                    //                 grade_name: "初2018级",
                    //                 grade_no: 7,
                    //                 guid: 37471,
                    //                 join: "2019-07-10 17:44:53",
                    //                 last: "2019-07-22 10:33:59",
                    //                 name: "向心悦",
                    //                 phase: "1",
                    //                 process: [{name: "已提交", start: "2019-07-10 17:44:53", user: "3506", user_name: "仁寿县城北实验初级中学"}],
                    //                 province: "四川省",
                    //                 score_type: "5c8b12f5c6b3782eec2c2d1f",
                    //                 semester_id: "12",
                    //                 sex: "2",
                    //                 total: 677.6700000000001,
                    //                 total_percent: 677.7,
                    //                 year: "2019",
                    //                 _id: "5d25b3959368286301099c29",
                    //             }
                    //         }
                    //     ]
                    // }
                    //处理附件；为成长激励卡、体质健康、学业成绩、艺术测评添加模块mk
                    data = deal_data(url, arg, data);
                    vm.list.pushArray(data);
                    layer.closeAll();
                    vm.data_had = true;
                    if (count == 5)
                        vm.is_show_none = vm.list.length == 0 ? true : false;
                };
                //模块mk:1 品德发展 2 艺术素养 3社会实践 4学业水平 5身体健康 6成就奖励 7日常表现
                if (vm.form_list.mk == '' || (vm.form_list.mk != 8 && vm.form_list.mk != 9 && vm.form_list.mk != 10 && vm.form_list.mk != 11)) {
                    cloud.zhsjyy_list(vm.form_list.$model, data_push);
                }
                // 查询体质测评异议列表:mk=9
                if (vm.form_list.mk == '' || vm.form_list.mk == 9) {
                    cloud.tzcpyy_list({
                        fk_school_id: vm.fk_school_id.toString(),
                        fk_class_id: vm.form_list.fk_class_id
                    }, data_push);
                }
                //学业成绩:mk=10
                if (vm.form_list.mk == '' || vm.form_list.mk == 10) {
                    cloud.xyspcj_list({
                        fk_school_id: vm.fk_school_id.toString(),
                        fk_class_id: vm.form_list.fk_class_id,
                        subject_id: '1000',
                    }, data_push);
                }
                //成长激励卡：mk=8
                if (vm.form_list.mk == '' || vm.form_list.mk == 8) {
                    cloud.jlk_list({
                        fk_class_id: vm.form_list.fk_class_id,
                        offset: 0,
                        rows: 100
                    }, data_push);
                }
                //艺术测评：mk=11
                if (vm.form_list.mk == '' || vm.form_list.mk == 11) {
                    cloud.xyspcj_list({
                        fk_school_id: vm.fk_school_id.toString(),
                        fk_class_id: vm.form_list.fk_class_id,
                        subject_id: '10000',
                    }, data_push);
                }
            }
            var status_map = {
                //思想品德： -1草稿 0删除 1待审核 2审核通过 3审核不通过4归档
                m1_1: 4,
                m1_0: 3,
                //艺术素养：-1:删除 1:待审核2:提交草稿3:未通过4:审核通过5:归档
                m2_1: 5,
                m2_0: 3,
                //社会实践：-1删除0草稿 1待审核 2审核通过 3审核不通过4归档
                m3_1: 4,
                m3_0: 3,
                //综合实践学业水平活动：-0草稿 1删除 1待审核 2审核通过 3审核不通过4归档
                m4_1: 4,
                m4_0: 3,
                //身体健康：-1:删除 1:待审核2:提交草稿3:未通过4:审核通过5:归档
                m5_1: 5,
                m5_0: 3,
                //成就奖励
                m6_1: 5,
                m6_0: 3,
                // 日常表现： -1删除 1待审核 2审核不通过 3待确认 4已确认(公示) 5归档
                m7_1: 5,
                m7_0: 2,
                //成长激励卡：3不通过4归档
                m8_1: 4,
                m8_0: 3,
                //体质测评
                m9_1: true,
                m9_0: false,
                //学业水平成绩
                m10_1: true,
                m10_0: false,
                //艺术成绩成绩
                m11_1: true,
                m11_0: false
            }

            function yy_treat(mk, id, content, attachment, is_pass) {
                var status = status_map["m" + mk + "_" + is_pass.toString()];
                var is_school_user = cloud.is_school_user();
                var distict_id = '';
                if (is_school_user) {
                    var distict_id_obj = cloud.school_user_distict_id();
                    distict_id = distict_id_obj.district_id;
                }
                var user = cloud.user_user();
                switch (mk) {
                    // 思想品德
                    case 1:
                        cloud.fy_sxpd({
                            id: id,
                            check_opinion: content,
                            second_check_attachment: attachment,
                            status: status,
                            "district_id": distict_id,
                            "district": user.district,
                            "fk_school_id": user.fk_school_id,
                            "school_name": user.school_name,
                            "fk_grade_id": vm.audited_one.fk_nj_id,
                            "grade_name": vm.audited_one.njmc,
                            "fk_class_id": vm.audited_one.fk_bj_id,
                            "class_name": vm.audited_one.bjmc,
                            "account": user.account,
                            "name": user.name,
                            "student_num": vm.audited_one.xjh,
                            "student_name": vm.audited_one.xsxm
                        }, request_after);
                        break;
                    // 艺术素养
                    case 2:
                        cloud.fy_yscp({
                            id: id,
                            art_checkContent: content,
                            art_check_enclosure: attachment,
                            art_state: status,
                            "district_id": distict_id,
                            "district": user.district,
                            "fk_school_id": user.fk_school_id,
                            "school_name": user.school_name,
                            "fk_grade_id": vm.audited_one.fk_nj_id,
                            "grade_name": vm.audited_one.njmc,
                            "fk_class_id": vm.audited_one.fk_bj_id,
                            "class_name": vm.audited_one.bjmc,
                            "account": user.account,
                            "name": user.name,
                            "student_num": vm.audited_one.xjh,
                            "student_name": vm.audited_one.xsxm
                        }, request_after);
                        break;
                    // 社会实践
                    case 3:
                        cloud.fy_shsj({
                            id: id,
                            check_opinion: content,
                            second_check_attachment: attachment,
                            status: status,
                            "district_id": distict_id,
                            "district": user.district,
                            "fk_school_id": user.fk_school_id,
                            "school_name": user.school_name,
                            "fk_grade_id": vm.audited_one.fk_nj_id,
                            "grade_name": vm.audited_one.njmc,
                            "fk_class_id": vm.audited_one.fk_bj_id,
                            "class_name": vm.audited_one.bjmc,
                            "account": user.account,
                            "name": user.name,
                            "student_num": vm.audited_one.xjh,
                            "student_name": vm.audited_one.xsxm
                        }, request_after);
                        break;
                    // 学业水平
                    case 4:
                        cloud.fy_xysp({
                            id: id,
                            check_opinion: content,
                            second_check_attachment: attachment,
                            status: status,
                            "district_id": distict_id,
                            "district": user.district,
                            "fk_school_id": user.fk_school_id,
                            "school_name": user.school_name,
                            "fk_grade_id": vm.audited_one.fk_nj_id,
                            "grade_name": vm.audited_one.njmc,
                            "fk_class_id": vm.audited_one.fk_bj_id,
                            "class_name": vm.audited_one.bjmc,
                            "account": user.account,
                            "name": user.name,
                            "student_num": vm.audited_one.xjh,
                            "student_name": vm.audited_one.xsxm
                        }, request_after);
                        break;
                    // 身心健康
                    case 5:
                        cloud.fy_sxjk({
                            hea_checkContent: content,
                            hea_check_enclosure: attachment,
                            hea_state: status,
                            id: id,
                            "district_id": distict_id,
                            "district": user.district,
                            "fk_school_id": user.fk_school_id,
                            "school_name": user.school_name,
                            "fk_grade_id": vm.audited_one.fk_nj_id,
                            "grade_name": vm.audited_one.njmc,
                            "fk_class_id": vm.audited_one.fk_bj_id,
                            "class_name": vm.audited_one.bjmc,
                            "account": user.account,
                            "name": user.name,
                            "student_num": vm.audited_one.xjh,
                            "student_name": vm.audited_one.xsxm
                        }, request_after);
                        break;
                    //成就奖励
                    case 6:
                        cloud.fy_cjjy({
                            "ach_checkContent": content,
                            "ach_check_enclosure": attachment,
                            "id": id,
                            "ach_state": status,
                            "district_id": distict_id,
                            "district": user.district,
                            "fk_school_id": user.fk_school_id,
                            "school_name": user.school_name,
                            "fk_grade_id": vm.audited_one.fk_nj_id,
                            "grade_name": vm.audited_one.njmc,
                            "fk_class_id": vm.audited_one.fk_bj_id,
                            "class_name": vm.audited_one.bjmc,
                            "account": user.account,
                            "name": user.name,
                            "student_num": vm.audited_one.xjh,
                            "student_name": vm.audited_one.xsxm
                        }, request_after);
                        break;
                    // 日常表现
                    case 7:
                        cloud.fy_rcbx({
                            check_opinion: content,
                            status: status,
                            id: id,
                            "district_id": distict_id,
                            "district": user.district,
                            "fk_school_id": user.fk_school_id,
                            "school_name": user.school_name,
                            "fk_grade_id": vm.audited_one.fk_nj_id,
                            "grade_name": vm.audited_one.njmc,
                            "fk_class_id": vm.audited_one.fk_bj_id,
                            "class_name": vm.audited_one.bjmc,
                            "account": user.account,
                            "name": user.name,
                            "student_num": vm.audited_one.xjh,
                            "student_name": vm.audited_one.xsxm
                        }, request_after);
                        break;
                    //  标志卡
                    case 8:
                        cloud.fy_jlk({
                            check_opinion: content,
                            status: status,
                            id: id,
                            "district_id": distict_id,
                            "district": user.district,
                            "fk_school_id": user.fk_school_id,
                            "school_name": user.school_name,
                            "fk_grade_id": vm.audited_one.fk_nj_id,
                            "grade_name": vm.audited_one.njmc,
                            "fk_class_id": vm.audited_one.fk_bj_id,
                            "class_name": vm.audited_one.bjmc,
                            "account": user.account,
                            "name": user.name,
                            "student_num": vm.audited_one.xjh,
                            "student_name": vm.audited_one.xsxm
                        }, request_after)
                        break;
                    case 9:
                        // cloud.fy_tzcp({_id: id, content: content, img: attachment, is_pass: status}, request_after);
                        break;
                    case 10:
                        break;
                    case 11:
                        break;
                }
            }

            var vm = avalon.define({
                $id: "um",
                //图片是否展开（注：如果数据是循环出来，不能用这种方式）
                is_open: false,
                is_show_none: false,
                //核查意见
                opinion: '',
                ary_score: [10, 9,11],
                // 图片显示相关支持
                count: act_count,
                user_photo: cloud.user_photo,
                url_img: url_img,
                //下拉列表是否初始化
                is_init_sel: true,
                head_value: {grade: "请选择年级", class: "请选择班级", semester: "请选择学期"},
                filter: {code: "", name: ""},
                filter_show: function (el) {
                    if (this.filter.name == "" && el.xjh.indexOf(this.filter.code) >= 0) return true;
                    else if (this.filter.code == "" && el.xsxm.indexOf(this.filter.name) >= 0) return true;
                    else if (this.filter.name == "" && this.filter.code == "") return true;
                    else if (el.xjh.indexOf(this.filter.code) && el.xsxm.indexOf(this.filter.name)) return true;
                    return false;
                },
                fk_school_id: "",
                form_list: {
                    fk_class_id: "",
                    offset: 0,
                    rows: 15,
                    mk: ''
                },
                list: [],
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had:false,
                change_grade: function (value, index) {
                    var ori_class = grade_list[index].class_list;
                    // 获取班级列表
                    this.class_list = any_2_select(ori_class, {name: "class_name", value: ["class_id"]});
                    // 修改对应显示信息
                    data_center.scope("update_mate_opt_grade", function (p) {
                        p.head_value = value.name;
                    });

                    this.change_class(this.class_list[0], 0);
                },
                change_class: function (value, index) {
                    data_center.scope("update_mate_opt_class", function (p) {
                        p.head_value = value.name;
                    });
                    this.form_list.fk_class_id = value.value;
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    refresh_yy_list();

                },
                grade_list: [],
                class_list: [],
                // current_type: "0",
                //弹出框，选择的文件名
                file_name: '请选择文件',
                type_arr: [
                    {value: "", "name": "全部类型"},
                    {value: "1", "name": "品德发展"},
                    {value: "2", "name": "艺术素养"},
                    {value: "3", "name": "社会实践"},
                    {value: "4", "name": "学业水平"},
                    {value: "5", "name": "身体健康"},
                    {value: "6", "name": "成就奖励"},
                    {value: "7", "name": "日常表现"},
                    {value: "8", "name": "成长激励卡"},
                    {value: "9", "name": "体质测评"},
                    {value: "10", "name": "学业水平成绩"},
                    {value: "11", "name": "艺术测评成绩"}
                ],
                init: function () {
                    setTimeout(function (args) {
                        // -> 不同的身份，获取的班级，年级列表不一样
                        vm.fk_school_id = cloud.user_school_id();
                        grade_list = cloud.auto_grade_list({});
                        vm.grade_list = any_2_select(grade_list, {name: "grade_name", value: ["grade_id"]});
                        vm.change_grade(vm.grade_list[0], 0);
                    }, 0);
                },

                change_type: function (el, index) {
                    // this.current_type = el.value;
                    this.form_list.mk = el.value;
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    refresh_yy_list();
                },
                //跳转页面
                change_page: function (page) {
                    window.location = "#" + page;
                },
                //展开或收起图片（注：如果数据是循环出来，不能用这种方式）
                open_close: function (w) {
                    if (w == 1) {
                        this.is_open = true;
                    } else {
                        this.is_open = false;
                    }
                },
                audited_one: {},
                //异议无效
                disagree: function (el) {
                    var value = el;
                    layer.confirm('确定异议无效吗？', {
                        btn: ['确定', '取消'] //按钮
                    }, function () {
                        vm.audited_one = el;
                        yy_treat(value.mk, value.id, "", "", 1);
                        layer.closeAll();
                    }, function () {
                    });
                },
                //异议成立
                establish: function (el) {
                    //选的文件初始化
                    $('#file').change(function (e) {
                        self.file_name = e.currentTarget.files[0].name;
                    });
                    uploader.cb = function (up, data, status) {
                        var status = data[0].status;
                        if (status == "success") {
                            tuploader.clear(uploader);
                            vm.audited_one = el;
                            yy_treat(el.mk, el.id, vm.opinion, JSON.stringify(data), 0);
                            vm.opinion = "";
                        } else {
                            toastr.error("附件上传失败")
                        }
                    };
                    layer.open({
                        title: '核查意见', type: 1, area: ['600px', '360px'], content: $('#v_layer'), btn: ['确定', '取消'],
                        yes: function (index, layero) {
                            if (uploader.files.length != 0) {
                                uploader.start();
                                layer.closeAll();
                            }
                            else {
                                toastr.warning("请选择上传材料");
                            }
                        }, cancel: function () {
                            //右上角关闭回调
                        }
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });

            vm.$watch("onReady", function () {
                var token = sessionStorage.getItem("token");
                uploader = tuploader.init("file", token, undefined, false);
                vm.init();

            });
            return vm;
        }

        return {
            view: html,
            define: avalon_define
        }

    });
