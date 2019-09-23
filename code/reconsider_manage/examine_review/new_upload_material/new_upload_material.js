/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('reconsider_manage/examine_review', 'new_upload_material/new_upload_material', 'html!'),
        C.Co('reconsider_manage/examine_review', 'new_upload_material/new_upload_material', 'css!'),
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
                refresh_yy_list();
            }
            //文件服务处理：图片、视频、文件
            function deal_data(data) {
                if (!data || data.length === 0) return;
                var token = sessionStorage.getItem("token");
                var data_length = data.length;
                for (var i = 0; i < data_length; i++) {
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

            /**
             * 体质测评相应数据处理:
             * 1、list:数据列表，mk:模块属性值(mk=9)
             * 2、循环获取当前学生异议数
             */
            function add_mk(list,mk){
                for(var i=0,len = list.length;i<len;i++){
                    list[i].content.dissent_list = list[i].dissent;
                    list[i].content.mk = mk;
                    list[i].content.xjh  = list[i].content.code;
                    list[i].content.xsxm = list[i].content.name;
                    list[i].content.njmc = list[i].content.grade_name;
                    list[i].content.bjmc = list[i].content.class_name;
                    list[i].content.xxmc = cloud.user_school();
                    list[i].content.lx = '体质测评';
                    list[i].content.sj = list[i].content.last;
                    list[i] = list[i].content;
                }
                return list;
            };
            //各种异议审核列表请求
            function refresh_yy_list() {
                vm.list = [];
                var count = 0;

                var data_push = function (url, arg, data) {
                    count++;
                    if(url == location.origin+'/api/score/new_health_dissent_list'){
                        data = add_mk(data,9);
                    }else{
                        data = deal_data(data);
                    }
                    vm.list.pushArray(data);
                    console.log(vm.list);
                    if (count == 4)
                        vm.is_show_none = vm.list.length == 0 ? true : false;
                };
                //综合实践：1 品德发展 2 艺术素养 3社会实践 4学业水平 5身体健康 6成就奖励 7日常表现
                cloud.zhsjyy_list(vm.form_list.$model, data_push);
                // 查询体质测评异议列表
                cloud.new_health_dissent_list(vm.tz_list_req,data_push);
                // cloud.new_health_dissent_list(vm.tz_req, data_push);
                // // 查询体质测评异议列表
                // cloud.tzcpyy_list({
                //     fk_school_id: vm.fk_school_id.toString(),
                //     fk_class_id: vm.form_list.fk_class_id
                // }, data_push);
                //学业水平成绩
                cloud.xyspcj_list({
                    fk_school_id: vm.fk_school_id.toString(),
                    fk_class_id: vm.form_list.fk_class_id
                }, data_push);
                //成长激励卡
                cloud.jlk_list({
                    fk_class_id: vm.form_list.fk_class_id,
                    offset: 0,
                    rows: 100
                }, data_push);
            }

            var status_map = {
                m1_1: 4,
                m1_0: 3,
                m2_1: 5,
                m2_0: 3,
                m3_1: 4,
                m3_0: 3,
                m4_1: 4,
                m4_0: 3,
                m5_1: 5,
                m5_0: 3,
                m6_1: 5,
                m6_0: 3,
                //  -1删除 1待审核 2审核不通过 3待确认 4已确认(公示) 5归档
                m7_1: 5,
                m7_0: 2,
                //成长激励卡：3不通过4归档
                m8_1: 4,
                m8_0: 3,
                m9_1: true,
                m9_0: false,
                m10_1: true,
                m10_0: false
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
                //综合实践：1 品德发展 2 艺术素养 3社会实践 4学业水平 5身体健康 6成就奖励 7日常表现
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
                    // 成长激励卡
                    case 8:
                        //  标志卡
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
                    //体质健康
                    case 9:
                        // cloud.fy_tzcp({_id: id, content: content, img: attachment, is_pass: status}, request_after);
                        break;
                    //学业成绩
                    case 10:
                        break;
                }
            }

            var vm = avalon.define({
                $id: "new_upload_material",
                //图片是否展开（注：如果数据是循环出来，不能用这种方式）
                is_open: false,
                is_show_none: false,
                //核查意见
                opinion: '',
                ary_score: ['10', '9'],
                // 图片显示相关支持
                count: act_count,
                user_photo: cloud.user_photo,
                url_img: url_img,
                //下拉列表是否初始化
                is_init_sel: true,
                head_value: {grade: "请选择年级", class: "请选择班级", semester: "请选择学期"},
                filter: {code: "", name: ""},
                //姓名、学籍号筛选
                filter_show: function (el) {
                    var code = '';
                    var name = '';
                    code = el.xjh;
                    name = el.xsxm;
                    if (this.filter.name == "" && code.indexOf(this.filter.code) >= 0) return true;
                    else if (this.filter.code == "" && name.indexOf(this.filter.name) >= 0) return true;
                    else if (this.filter.name == "" && this.filter.code == "") return true;
                    else if (code.indexOf(this.filter.code) && name.indexOf(this.filter.name)) return true;
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
                //体质健康测评请求参数
                tz_list_req:{
                    fk_class_id:'',
                    fk_school_id:'',
                },
                tz_req:{
                    current_process:'公示中',//当前进度（已提交 ，已修改，公示中，已归档,公示结束,异议己核实）
                    fk_class_id:'',
                    fk_grade_id:'',
                    fk_school_id:'',
                    flag_exempt:'',//标志免考 0 正常 1 免考(审核通过) 2待审核免考 3 审核不同
                    guid:'',
                    offset:0,
                    rows:9999,
                    semester_id:'',
                    code__icontains:'',//学籍号
                    name__icontains:'',//姓名
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
                    {value: "10", "name": "学业水平成绩"}
                ],
                init: function () {
                    setTimeout(function (args) {
                        // -> 不同的身份，获取的班级，年级列表不一样
                        vm.fk_school_id = cloud.user_school_id();
                        vm.tz_req.fk_school_id = cloud.user_school_id().toString();
                        vm.tz_list_req.fk_school_id = cloud.user_school_id().toString();
                        grade_list = cloud.auto_grade_list({});
                        vm.grade_list = any_2_select(grade_list, {name: "grade_name", value: ["grade_id"]});
                        vm.change_grade(vm.grade_list[0], 0);
                    }, 0);
                },
                //年级改变
                change_grade: function (value, index) {
                    var ori_class = grade_list[index].class_list;
                    // 获取班级列表
                    this.class_list = any_2_select(ori_class, {name: "class_name", value: ["class_id"]});
                    this.tz_req.fk_grade_id = value.value;
                    // 修改对应显示信息
                    data_center.scope("update_mate_opt_grade", function (p) {
                        p.head_value = value.name;
                    });

                    this.change_class(this.class_list[0], 0);
                },
                //班级改变
                change_class: function (value, index) {
                    data_center.scope("update_mate_opt_class", function (p) {
                        p.head_value = value.name;
                    });
                    this.form_list.fk_class_id = value.value;
                    this.tz_req.fk_class_id = value.value;
                    this.tz_list_req.fk_class_id = value.value;
                    refresh_yy_list();

                },
                //类型改变
                change_type: function (el, index) {
                    // this.current_type = el.value;
                    this.form_list.mk = el.value;
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
                //体质健康测评异议处理
                tz_dissent_btn:function(el){
                    window.location.href = '#new_ph_check_detail?id='+el._id;
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
