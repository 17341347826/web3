/**
 * Created by Administrator on 2018/6/6.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('weixin_pj', 'publicity/daily_perform_pub/daily_perform_pub','html!'),
        C.Co('weixin_pj', 'publicity/daily_perform_pub/daily_perform_pub','css!'),
        C.CMF("data_center.js"),
        "select2"
    ],
    function ($,avalon,layer, html,css, data_center, select2) {
        //审核公式管控-查询
        var api_query_pub = api.api+'GrowthRecordBag/publicity_audit_query';
        //校级公示-年级、班级
        var api_grade_class = api.user+'class/school_class.action';
        //年级公示-班级
        var api_get_class = api.user+'class/findClassSimple.action';
        //日常表象公示列表
        var api_daily_pub=api.api+'GrowthRecordBag/class_publicity_list_rc';
        // 添加异议
        var api_comment_add =api.growth + "comment_add";
        var avalon_define = function () {
            //判断后台班级名称是否返回'班'
            avalon.filters.class_ban = function(name){
                if(name.indexOf("班") != -1)
                    return name;
                else
                    return name+'班'
            };
            var vm = avalon.define({
                $id: "daily_perform_pub",
                url_file:api.api + "file/get",//获取文件,
                //学生头像
                user_photo: cloud.user_photo,
                url_img:url_img,
                //登录者姓名
                ident_name:'',
                //公示管控范围:0-未设置、不公示；1-全校可见；2-本年级可见；3-本班可见
                pub_range:0,
                //区县名称
                district_name:'',
                //学校id
                school_id:'',
                //年级列表
                grade_list:[],
                grade_info:'',
                //班级列表
                class_list:[],
                //学籍号
                stu_num:'',
                //姓名
                stu_name:'',
                //图片展开收起
                open_close:false,
                daily_num:-1,
                //日常表现列表数据
                daily_list:[],
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had:false,
                // 查询所用到的参数
                form_list_score: {
                    fk_class_id: "",
                    fk_nj_id:'',
                    fk_xs_id:'',
                    offset:0,
                    rows:999,
                    xjh:'',
                    xsmc:''
                },
                //数据类型转换
                data_change:function(a){
                    return JSON.parse(a);
                },
                url_for: function(id) {
                    // console.log( this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id)
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                //年级改变
                gradeChange:function(){
                    var pub_range = this.pub_range;
                    if(pub_range == 2){//年级公示
                        var grade_id = this.grade_info;
                        var school_id = this.school_id;
                        //获取指定学校年级的班级集合
                        ajax_post(api_get_class,{fk_school_id:school_id,fk_grade_id:grade_id},self);
                        return;
                    }
                    var g_id = this.grade_info;
                    this.form_list_score.fk_nj_id = Number(g_id);
                    for(var i=0;i<this.grade_list.length;i++){
                        var id = this.grade_list[i].grade_id;
                        if(g_id == id){
                            this.class_list = this.grade_list[i].class_list;
                            this.form_list_score.fk_class_id = this.class_list[0].class_id;
                        }
                    }
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    //    日常表现列表
                    ajax_post(api_daily_pub,this.form_list_score.$model,this);
                },
                //班级改变
                class_change: function () {
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    //    日常表现列表
                    ajax_post(api_daily_pub,this.form_list_score.$model,this);
                },
                //学籍号
                code_search:function(){
                    this.form_list_score.xjh = this.stu_num;
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    //    日常表现列表
                    ajax_post(api_daily_pub,this.form_list_score.$model,this);
                },
                //姓名
                name_search:function(){
                    this.form_list_score.xsmc ='%'+this.stu_name+'%';
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    //    日常表现列表
                    ajax_post(api_daily_pub,this.form_list_score.$model,this);
                },
                init:function () {
                    //公示审核管控
                    ajax_post(api_query_pub,{},this);
                },
                //图片展开收起
                img_open:function(idx,num){
                    if(num==0){//收起
                        this.open_close=false;
                        this.daily_num=-1;
                    }else if(num==1){//展开
                        this.open_close=true;
                        this.daily_num=idx;
                    }
                },
                //提异议
                ask_dis:function(id){
                    var self=this;
                    layer.prompt({title: '请填写异议', formType: 2}, function(text, index){
                        ajax_post(api_comment_add,{content:text,synthesize_id:id},self);
                        layer.close(index);
                    });
                },
                cb: function () {
                    var self = this;
                    //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                    var pub_range = self.pub_range;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level=data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        //登陆者guid
                        self.form_list_score.fk_xs_id=tUserData.guid;
                        if(userType==1){//教师
                            self.ident_name=tUserData.name;
                            self.district_name=tUserData.district;
                            var school_id = tUserData.fk_school_id;
                            self.school_id = tUserData.fk_school_id;
                            if(pub_range == 1){//校级公示
                                ajax_post(api_grade_class,{school_id:school_id},self);
                            }else if(pub_range == 2){//年级公示
                                var t_grade = tUserData.teach_class_list;
                                var l_grade = tUserData.lead_class_list;
                                for(var i=0;i<l_grade.length;i++){
                                    var has = false;
                                    var g_id = l_grade[i].grade_id;
                                    for(var j=0;j<t_grade.length;j++){
                                        var id = t_grade[j].grade_id;
                                        var obj = {};
                                        if(g_id == id){
                                            has = true;
                                            break;
                                        }
                                    }
                                    if(has == false){
                                        t_grade.push(l_grade[i]);
                                    }
                                }
                                self.grade_list = t_grade;
                                var grade_id = self.grade_list[0].grade_id;
                            //获取指定学校年级的班级集合
                                ajax_post(api_get_class,{fk_school_id:school_id,fk_grade_id:grade_id},self);
                            }else if(pub_range == 3 || pub_range == 0){//班级公示、不公示
                                var t_grade = tUserData.teach_class_list;
                                var l_grade = tUserData.lead_class_list;
                                self.grade_list = self.teacherCombinClass(l_grade,t_grade);
                                self.class_list = self.grade_list[0].class_list;
                            }
                        }else if(userType==2){//学生
                            self.district_name = tUserData.district;
                            self.ident_name = tUserData.name;
                            var school_id = tUserData.fk_school_id;
                            self.school_id = tUserData.fk_school_id;
                            if(pub_range == 1){//校级公示
                                ajax_post(api_grade_class,{school_id:school_id},self);
                            }else if(pub_range == 2) {//年级公示
                                //年级
                                var gb = {
                                    grade_id:tUserData.fk_grade_id,
                                    grade_name:tUserData.grade_name
                                };
                                self.grade_list.push(gb);
                                var grade_id = self.grade_list[0].grade_id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class,{fk_school_id:school_id,fk_grade_id:grade_id},self);
                            }else if(pub_range == 3 || pub_range == 0){//班级公示、不公示
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
                        }else if(userType==3){//家长
                            //子女基本信息
                            var stuInfo = tUserData.student;
                            self.district_name = stuInfo.district;
                            self.ident_name = tUserData.name;
                            var school_id = stuInfo.fk_school_id;
                            self.school_id = stuInfo.fk_school_id;
                            if(pub_range == 1){//校级公示
                                ajax_post(api_grade_class,{school_id:school_id},self);
                            }else if(pub_range == 2) {//年级公示
                                //年级
                                var gb = {
                                    grade_id:stuInfo.fk_grade_id,
                                    grade_name:stuInfo.grade_name
                                };
                                self.grade_list.push(gb);
                                var grade_id = self.grade_list[0].grade_id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class,{fk_school_id:school_id,fk_grade_id:grade_id},self);
                            }else if(pub_range == 3 || pub_range == 0) {//班级公示、不公示、未设置
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
                        if(pub_range == 3 || pub_range == 0){//班级公示、不公式、未设置
                            //年级信息
                            self.grade_info = self.grade_list[0].grade_id;
                            //年级id
                            self.form_list_score.fk_nj_id = self.grade_info;
                            //班级id
                            self.form_list_score.fk_class_id=self.class_list[0].class_id;
                            layer.load(1, {shade:[0.3,'#121212']});
                            self.data_had = false;
                            //    日常表现列表
                            ajax_post(api_daily_pub,self.form_list_score.$model,self);
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
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //公示审核管控
                            case api_query_pub:
                                this.complete_query_pub(data);
                                break;
                            // 校级公示-年级班级
                            case api_grade_class:
                                this.complete_grade_class(data);
                                break;
                            //    年级公示-班级
                            case api_get_class:
                                this.complete_get_class(data);
                                break;
                            //日常表现列表
                            case api_daily_pub:
                                this.complete_daily_pub(data);
                                break;
                        //        提交异议
                            case api_comment_add:
                                this.complete_comment_add(data);
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
                            if(mkid == 1){
                                self.pub_range = list[i].gsfw;
                                break;
                            }
                        }
                    }
                    self.cb();
                },
                //校级公示-年级班级
                complete_grade_class:function(data){
                    var list = data.data;
                    this.grade_list = list;
                    this.class_list = this.grade_list[0].class_list;
                    //年级信息
                    this.grade_info = this.grade_list[0].grade_id;
                    this.form_list_score.fk_nj_id = this.grade_info;
                    //班级id
                    this.form_list_score.fk_class_id=this.class_list[0].class_id;
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    //日常表现列表
                    ajax_post(api_daily_pub,this.form_list_score.$model,this);
                },
                //年级公示-班级
                complete_get_class:function(data){
                    var list = data.data;
                    this.class_list = list;
                    //年级信息
                    this.grade_info = this.grade_list[0].grade_id;
                    this.form_list_score.fk_nj_id = this.grade_info;
                    //班级id
                    this.form_list_score.fk_class_id=this.class_list[0].id;
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    //日常表现列表
                    ajax_post(api_daily_pub,this.form_list_score.$model,this);
                },
                //日常表现公示
                complete_daily_pub:function(data){
                    this.deal_data(data);
                },
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                deal_data:function(data){
                    if(!data || !data.data || !data.data.list) return;
                    var token = sessionStorage.getItem("token");
                    var list = data.data.list;
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
                            }
                            else {
                                file_name = fjdz[j].inner_name;
                            }
                            fjdz[j].down_href = api.api+'file/download_file?img=' + fjdz[j].guid + "&token="+ token;
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
                    ready_photo(list,'fk_xsyh_id');
                    this.daily_list = list;
                    this.data_had = true;
                    layer.closeAll();
                },
                //提异议
                complete_comment_add:function(data){
                    toastr.success('异议提交成功');
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    //    日常表现列表
                    ajax_post(api_daily_pub,this.form_list_score.$model,this);
                },
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