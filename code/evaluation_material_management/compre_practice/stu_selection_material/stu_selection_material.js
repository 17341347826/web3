/**
 * Created by Administrator on 2018/6/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_material_management', 'compre_practice/stu_selection_material/stu_selection_material', 'html!'),
        C.Co('evaluation_material_management', 'compre_practice/stu_selection_material/stu_selection_material', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, three_menu_module) {
        //获取教师遴选数据
        var list_api = api.api + "GrowthRecordBag/teacher_list_lx_data";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "stu_selection_material",
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
                    fk_class_id: '',
                    offset: 0,
                    rows: 15,
                    shzt: 1,
                    fk_xq_id:'',
                    //模块1品德 2艺术活动3社会实践4学业水平5身心健康
                    mk:1,
                    xjh:'',
                    xsmc:''
                },
                list:[],
                type_arr: [
                    // {name:'全部',value:''},
                    {name: '思想品德', value: '1'},
                    {name: '艺术素养', value: '2'},
                    {name: '社会实践', value: '3'},
                    {name: '学业水平', value: '4'},
                    {name: '身心健康', value: '5'}
                ],
                //前一次请求的滚动条高度
                old_scroll_top: '',
                url_img: url_img,
                user_photo: cloud.user_photo,
                current_menu:'',
                init: function () {
                    this.semester_list = cloud.semester_all_list();
                    var semester_obj = {
                        name:'全部',
                        value:''
                    };
                    this.semester_list.unshift(semester_obj);
                    this.current_menu = this.semester_list[1].value;
                    this.user_info = cloud.auto_grade_list();
                    this.deal_grade_class(this.user_info);
                    this.listen_scroll();
                },
                //监听下拉滚动
                listen_scroll: function () {
                    var self = this;
                    $(window).scroll(function () {
                        var srollPos = $(window).scrollTop();    //滚动条距顶部距离(页面超出窗口的高度)
                        var range = 100;
                        totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
                        if(($(document).height()-range) <= totalheight ) {
                            if (self.list.length < self.extend.rows)
                                return;
                            self.extend.rows += 15;
                            self.old_scroll_top = $(document).height()-range;
                            self.get_data();
                        }
                    })
                },
                get_data: function () {
                    layer.load(1, {shade:[0.3,'#121212']});
                    ajax_post(list_api, this.extend.$model, this)
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
                    this.extend.fk_class_id = this.class_list[0].value;
                    this.get_data();
                },
                uninit:function () {
                    $(window).unbind ('scroll');
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
                //班级筛选
                sel_class: function (el) {
                    this.extend.fk_class_id = el.value;
                    this.get_data();
                },
                //学期筛选
                sel_semester: function (el) {
                    this.extend.fk_xq_id = el.value.split('|')[0];
                    this.get_data();
                },
                //类型筛选
                sel_type:function (el) {
                    this.extend.mk = el.value;
                    this.get_data();
                },
                //菜单跳转
                menu_jump1:function (value) {
                    var sign = '.s'+value.split('|')[0];
                    if(!$(sign) || !$(sign).eq(0) || !$(sign).eq(0).position())
                        return;
                    var top1 = $(sign).eq(0).position().top;
                    var top2 = $("#top").position().top;
                    var top = top1-top2-136;
                    this.current_menu = value;
                    $(window).animate({
                        scrollTop: top + 'px'
                    }, 500);
                },
                menu_jump:function (value) {
                    this.current_menu = value;
                    this.extend.fk_xq_id = value.split('|')[0];
                    this.get_data();
                },
                search:function () {
                    this.get_data();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case list_api:
                                var list = data.data.list;
                                for (var i = 0; i < list.length; i++) {
                                    list[i].photo_guid = JSON.parse(list[i].fjdz);
                                }
                                this.list = list;
                                layer.closeAll();
                                if (this.old_scroll_top > 0) {
                                    $(window).scrollTop(this.old_scroll_top);
                                }
                                break;
                            default:
                                break;

                        }
                    } else {
                        toastr.error(msg)
                    }
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