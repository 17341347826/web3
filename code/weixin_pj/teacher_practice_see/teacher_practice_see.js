/**
 * Created by Administrator on 2018/6/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('weixin_pj', 'teacher_practice_see/teacher_practice_see','html!'),
        C.Co('weixin_pj', 'teacher_practice_see/teacher_practice_see','css!'),
        C.CMF("data_center.js"),
        "jquery-weui",'swiper'
    ],
    function ($,avalon,layer, html,css, data_center,weui,swiper) {
        //获取教师遴选数据
        var list_api = api.api + "GrowthRecordBag/teacher_list_data";
        //学年学期
        var api_get_semester = api.api + "base/semester/grade_opt_semester";
        //查询班级人数(在籍学生)
        var api_class_stu = api.api + "base/student/class_used_stu";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "teacher_practice_see",
                get_count:"",
                //年级列表
                grade_list: [],
                //班级列表
                class_list: [],
                //学年学期列表
                semester_list: [],
                //年级列表和班级列表
                user_info: [],
                fk_grade_id:"",
                stu_list:[],
                //需要传参
                extend: {
                    fk_class_id: '',
                    offset: 0,
                    rows: 15,
                    shzt: 4,
                    fk_xq_id:'',
                    //模块1品德 2艺术活动3社会实践4学业水平5身心健康
                    mk:1,
                    xjh:'',
                    xsmc:''
                },
                list:[],
                type_arr: [
                    {name:'全部',value:''},
                    {name: '思想品德', value: '1'},
                    {name: '艺术素养', value: '2'},
                    {name: '社会实践', value: '3'},
                    {name: '学业水平', value: '4'},
                    {name: '身心健康', value: '5'}
                ],
                url_img: url_img,
                user_photo: cloud.user_photo,
                current_menu:'',
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userData = JSON.parse(data.data['user']);
                        var lead_class_list = userData.lead_class_list;
                        console.log(lead_class_list)
                        self.grade_list = lead_class_list;
                        self.fk_grade_id = self.grade_list[0].grade_id;
                        self.class_list = lead_class_list[0].class_list;
                        self.extend.fk_class_id = self.class_list[0].class_id;
                        vm.init_load_more();
                        ajax_post(api_get_semester,{grade_id:self.fk_grade_id},self);
                    });
                },
                get_data: function () {
                    $.showLoading();
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
                menu_jump:function (value) {
                    var fk_semester = value.split('|');
                    this.extend.fk_xq_id = fk_semester[0];
                    this.current_menu = value;
                    this.get_data();
                },
                search:function () {
                    this.get_data();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    $.hideLoading();
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_semester:
                                 this.complete_get_semester(data);
                                 break;
                            case api_class_stu:
                                this.complete_class_stu(data);
                                break;
                            case list_api:
                                this.complete_list(data);
                                break;
                            default:
                                break;

                        }
                    } else {
                        $.alert(msg)
                    }
                },
                uninit:function () {
                    $(document.body).destroyInfinite();
                },
                show_loader:true,
                complete_list:function (data) {
                    var list = data.data.list;
                    var listLength = list.length;
                    this.get_count=data.data.count;
                    for (var i = 0; i < listLength; i++) {
                        list[i].photo_guid = JSON.parse(list[i].fjdz);
                    }
                    ready_photo(list,'fk_xsyh_id');
                    this.list = list;
                    if(list.length==data.data.count){
                        $(document.body).destroyInfinite();
                        this.show_loader = false;
                    }
                },
                complete_get_semester:function (data) {
                    this.semester_list = data.data.list;
                    ajax_post(api_class_stu,{fk_class_id:this.extend.fk_class_id},this)
                },
                complete_class_stu:function (data) {
                    var dataList = data.data.list;
                    dataList.unshift({name:"全部",code:""});
                    this.stu_list = dataList;
                    this.get_data();
                },
                init_load_more:function () {
                    var loading = false;  //状态标记
                    var self = this;
                    $(document.body).infinite().on("infinite", function() {
                        if(loading) return;
                        loading = true;
                        setTimeout(function() {
                            self.extend.rows+=15;
                            self.get_data();
                            loading = false;
                        }, 100);
                    });
                },
                gradeChange:function () {
                    var fk_grade_id = this.fk_grade_id;
                    for(var i = 0;i < this.grade_list.length; i++){
                        if(fk_grade_id == this.grade_list[i].grade_id){
                            this.class_list = this.grade_list[i].class_list
                        }
                    }
                    this.extend.fk_class_id = this.class_list[0].class_id;
                    ajax_post(api_get_semester,{grade_id:fk_grade_id},this);
                },
                semesterChange:function () {
                    this.get_data();
                },
                //模块切换
                moduleChange:function(){
                    this.get_data();
                },
                classChange:function (data) {
                    this.get_data();
                },
                stuChange:function () {
                    this.get_data();
                }
            });
            vm.cb();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });