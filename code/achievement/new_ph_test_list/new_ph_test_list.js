define([
        "jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("achievement", "new_ph_test_list/new_ph_test_list", "css!"),
        C.Co("achievement", "new_ph_test_list/new_ph_test_list", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM('three_menu_module'),
        C.CMF("formatUtil.js"),
        C.CMF('partial_loading/loading.js')
    ],
    function ($, avalon, layer, css, html, x, data_center, three_menu_module, formatUtil,pl) {
        //审核公式管控-查询
        var api_query_pub = api.api+'GrowthRecordBag/publicity_audit_query';
        //校级公示-年级、班级
        var api_grade_class = api.user+'class/school_class.action';
        //年级公示-班级
        var api_get_class = api.user+'class/findClassSimple.action';
        //体质测试列表
        var table_list_api = api.api + "score/list_new_health";
        //获取学生信息
        var student_list_api = api.api + "base/student/class_used_stu";
        //提交异议
        var commit_dissent_api = api.api + "score/new_health_dissent";
        //判断后台班级名称是否返回'班'
        avalon.filters.class_ban = function(name){
            if(name.indexOf("班") != -1)
                return name;
            else
                return name+'班'
        };
        var content_pl = undefined;
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "new_ph_test_list",
                extend: {
                    current_process:'公示中',//当前进度（已提交 ，已修改，公示中，已归档）
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
                //身份
                user_type: '',
                //公示管控范围:0-未设置、不公示；1-全校可见；2-本年级可见；3-本班可见
                pub_range:0,
                //年级列表
                grade_list:[],
                //班级列表
                class_list:[],
                //获取的学生列表
                student_arr: [],
                //表格中展示的数据
                table_list: [],
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had:false,
                //表格标题列表
                course_list: [],
                // 表头名称
                init: function () {
                    content_pl = new pl();
                    content_pl.init({
                        target:'#content-pl',
                        type:1
                    });
                    content_pl.start();
                    //公示审核管控
                    ajax_post(api_query_pub,{},this);
                },
                get_login_user: function () {
                    var self = this;
                    // //初始化下拉列表数据
                    // self.select_list = [];
                    var pub_range = this.pub_range;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level = data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        if(userType==1){//教师
                            self.extend.fk_school_id = tUserData.fk_school_id.toString();
                            if(pub_range == 1){//全校可见
                                ajax_post(api_grade_class,{school_id:self.extend.fk_school_id},self);
                            }else if(pub_range == 2){//本年级可见
                                self.grade_list = cloud.auto_grade_list({});
                                var grade_id = self.grade_list[0].grade_id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class,{fk_school_id: self.extend.fk_school_id,fk_grade_id:grade_id},self);
                            }else if(pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                                self.grade_list = cloud.auto_grade_list({});
                                self.class_list = self.grade_list[0].class_list;
                            }
                        }else if(userType==2){//学生
                            self.extend.fk_school_id = tUserData.fk_school_id.toString();
                            if(pub_range == 1){//全校可见
                                ajax_post(api_grade_class,{school_id:self.extend.fk_school_id},self);
                            }else if(pub_range == 2){//本年级可见
                                //年级
                                var gb = {
                                    grade_id:tUserData.fk_grade_id,
                                    grade_name:tUserData.grade_name
                                };
                                self.grade_list.push(gb);
                                var grade_id = self.grade_list[0].grade_id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class,{fk_school_id: self.extend.fk_school_id,fk_grade_id:grade_id},self);
                            }else if(pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                                //年级
                                var gb = {
                                    grade_id:tUserData.fk_grade_id,
                                    grade_name:tUserData.grade_name
                                };
                                self.grade_list.push(gb);
                                //班级
                                var obj={
                                    class_id:tUserData.fk_class_id,
                                    class_name:tUserData.class_name
                                };
                                self.class_list.push(obj);
                            }
                        }else if(userType==3){
                            //子女基本信息
                            var stuInfo = tUserData.student;
                            self.extend.fk_school_id = stuInfo.fk_school_id.toString();
                            if(pub_range == 1){//全校可见
                                ajax_post(api_grade_class,{school_id:self.extend.fk_school_id},self);
                            }else if(pub_range == 2){//本年级可见
                                //年级
                                var gb = {
                                    grade_id:stuInfo.fk_grade_id,
                                    grade_name:stuInfo.grade_name
                                };
                                self.grade_list.push(gb);
                                var grade_id = self.grade_list[0].grade_id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class,{fk_school_id: self.extend.fk_school_id,fk_grade_id:grade_id},self);
                            }else if(pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                                //年级
                                var gb = {
                                    grade_id:stuInfo.fk_grade_id,
                                    grade_name:stuInfo.grade_name
                                };
                                self.grade_list.push(gb);
                                //班级
                                var obj={
                                    class_id:stuInfo.fk_class_id,
                                    class_name:stuInfo.class_name
                                };
                                self.class_list.push(obj);
                            }
                        }
                        if(pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                            self.extend.fk_grade_id = self.grade_list[0].grade_id;
                            self.extend.fk_class_id = self.class_list[0].class_id;
                            //学生列表
                            self.get_student_list();
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
                teacherCombinClass:function(l_data,c_data){
                    if(l_data.length == 0) return c_data;
                    if(c_data.length == 0) return l_data;
                    let com_grade = [];
                    let self = this;
                    l_data.forEach(function(el){
                        //在任课里面取出当前班主任年级信息
                        let c_gradeId_info = self.base_filter(c_data,'garde_id',el.garde_id);
                        if(c_gradeId_info.length == 0){
                            // c_data.push(el);
                            c_data.unshift(el);
                        }else{
                            let l_class = el.class_list;
                            let c_class = c_gradeId_info[0].class_list;
                            l_class.forEach(function(al){
                                //获取任课里面当前年级下的班级信息
                                let c_class_info = self.base_filter(c_class,'class_id',al.class_id);
                                if(c_class_info.length == 0)
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
                base_filter:function (data, col_name, value) {
                    var ret = [];
                    for (var x = 0; x < data.length; x++) {
                        if (data[x][col_name] == value) {
                            ret.push(data[x]);
                        }
                    }
                    return ret;
                },
                //年级改变
                grade_change: function () {
                    var g_id = this.extend.fk_grade_id;
                    var pub_range = this.pub_range;
                    if(pub_range == 2){//年级公示
                        //获取指定学校年级的班级集合
                        ajax_post(api_get_class,{fk_school_id: this.extend.fk_school_id,fk_grade_id:g_id},this);
                        return;
                    }
                    for(var i=0;i<this.grade_list.length;i++){
                        var id = this.grade_list[i].grade_id;
                        if(g_id == id){
                            this.class_list = this.grade_list[i].class_list;
                            this.extend.fk_class_id = this.class_list[0].class_id;
                        }
                    }
                },

                to_search:function(){
                    content_pl.start();
                    this.data_had = false;
                    this.get_student_list();
                },
                //获取学生列表
                get_student_list: function () {
                    ajax_post(student_list_api, {fk_class_id: this.extend.fk_class_id}, this);
                },
                //处理学生数据
                deal_student: function (data) {
                    if (!data.data || !data.data.list || data.data.list.length == 0)
                        return;
                    this.student_arr = [];
                    this.student_arr = data.data.list;
                    this.get_title_score();
                },
                //体质测评公示请求
                get_title_score: function () {
                    // var student_list = abstract(this.student_arr.$model, "guid");
                    this.extend.fk_grade_id = this.extend.fk_grade_id.toString();
                    this.extend.fk_class_id = this.extend.fk_class_id.toString();
                    ajax_post(table_list_api, this.extend.$model, this);
                },
                //体质测评公示列表
                deal_title_score: function (data) {
                    this.table_list = [];
                    this.data_had = true;
                    content_pl.stop();
                    if (!data.data || data.data.list.length == 0)
                        return;
                    this.table_list = data.data.list;
                },
                //提异议
                raise_objection: function (el) {
                    var self = this;
                    var id = el._id;
                    layer.prompt({title: '请填写异议', formType: 2}, function (text, index) {
                        self.commit_dissent(id, text)
                    });
                },
                commit_dissent: function (id,text) {
                    ajax_post(commit_dissent_api, {
                        _id: id,
                        content:text
                    }, this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //公示审核管控
                            case api_query_pub:
                                this.complete_query_pub(data);
                                break;
                            //获取校下面的年级、班级
                            case api_grade_class:
                                this.complete_grade_class(data);
                                break;
                            //    获取指定学校年级的班级集合
                            case api_get_class:
                                this.complete_get_class(data);
                                break;
                            case student_list_api:
                                this.deal_student(data);
                                break;
                            //体质测评公示
                            case table_list_api:
                                this.deal_title_score(data);
                                break;
                            case commit_dissent_api:
                                layer.closeAll();
                                toastr.success('异议提交成功');
                                // this.get_title_score();
                                break;
                            default:
                                break;

                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                //公示审核管控
                complete_query_pub:function(data){
                    var self = this;
                    var list = data.data;
                    if(list != null && list.length>0){
                        //mkid（模块id）：1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                        //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                        //sfsh（是否审核）：0否1是2学生录入教师审3教师录入评价小组审
                        //xsqr（学生确认）：0否1是
                        for(var i=0;i<list.length;i++){
                            var mkid = list[i].mkid;
                            if(mkid == 5){
                                self.pub_range = list[i].gsfw;
                                break;
                            }
                        }
                    }
                    self.get_login_user();
                },
                //校下面年级班级
                complete_grade_class:function(data){
                    var list = data.data;
                    this.grade_list = list;
                    this.class_list = this.grade_list[0].class_list;
                    //年级信息
                    this.extend.fk_grade_id = this.grade_list[0].grade_id;
                    this.extend.fk_class_id = this.class_list[0].class_id;
                    //学生列表
                    this.get_student_list();
                },
                //指定学校年级的班级集合
                complete_get_class:function(data){
                    var list = data.data;
                    this.class_list = list;
                    //年级信息
                    this.extend.fk_grade_id = this.grade_list[0].grade_id;
                    this.extend.fk_class_id = this.class_list[0].id;
                    //学生列表
                    this.get_student_list();
                },
            });
            vm.$watch('onReady',function(){
                vm.init();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });