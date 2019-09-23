/**
 * Created by Administrator on 2018/6/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_material_management', 'teacher_reward_punish/t_honor_reward/t_honor_reward','html!'),
        C.Co('evaluation_material_management', 'teacher_reward_punish/t_honor_reward/t_honor_reward','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),C.CM("table")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,three_menu_module,table) {
        //获取指定学校的班级集合
        var api_grade_class = api.user+'class/school_class.action';
        //获取学年学期集合
        var api_sem_list=api.user+'semester/used_list.action';
        //教师查询成就奖励列表
        var api_honor_list=api.api+'GrowthRecordBag/achievement_findByAchievements';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "t_honor_reward",
                url:api_honor_list,
                url_file:api.api + "file/get",//获取文件,
                //学生头像
                user_photo: cloud.user_photo,
                url_img:url_img,
                //显示方式：图文-1，表格-2
                html_display:2,
                //表格显示：列表-1，详情-2
                list_detail:1,
                //单个学生详情
                person_detail:{},
                //身份
                ident_type:'',
                //学生头像信息
                stu_head:{},
                //学年学期列表
                sem_list:[],
                //当前选中学年学期
                semester_remark:0,
                //年级列表
                grade_list:[],
                //班级列表
                class_list:[],
                //学籍号
                stu_num:'',
                //姓名
                stu_name:'',
                remember:false,
                is_init:false,
                // //需要传参
                // extend: {
                //     ach_end_dates:'',
                //     ach_start_dates:'',
                //     ach_type:'',
                //     //状态(-1:删除 1:待审核2:提交草稿3:未通过4:审核通过(公示中)5:归档)
                //     ach_state:5,
                //     //    年级
                //     ach_gradeid:'',
                //     //    班级
                //     ach_classid:'',
                //     offset:0,
                //     rows:10,
                // },
                //请求参数
                extend:{
                    // ach_end_dates:'',
                    // ach_start_dates:'',
                    fk_semester_id:'',
                    ach_type:'',
                    //状态(-1:删除 1:待审核2:提交草稿3:未通过4:审核通过(公示中)5:归档)
                    ach_state:5,
                //    年级
                    ach_gradeid:'',
                //    班级
                    ach_classid:'',
                    offset:0,
                    rows:10,
                    // 学生姓名
                    ach_studentname:'',
                    //    学生学籍号
                    ach_studentnum:'',
                //    学校id
                    ach_schoolid:'',
                },
                leader_data:{
                    ach_classid:"",
                    // ach_end_dates:"",
                    ach_gradeid:"",
                    ach_schoolid:"",
                    // ach_start_dates:"",
                    fk_semester_id:'',
                    city:"",
                    district:"",
                    offset:"",
                    province:"",
                    review_state:"",
                    rows:""
                },
                //返回数据
                honor_list:[],
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had:false,
                //学校名称
                school_name:'',
                //区县名称
                distrit_name:'',
                //分页
                // 数据总数
                count: "",
                /*总页数*/
                totalPage: "",
                // 计算分页数组
                totalPageArr: [],
                /*当前是第几页*/
                currentPage: 1,
                //跳转页码
                pageNo: "",
                //获取总页数+当前显示分页数组
                set_total_page:function(count){
                    if(count==0){
                        this.totalPageArr=new Array(this.totalPage);
                    }else{
                        //向上取证
                        this.totalPage=Math.ceil(count/this.extend.rows);
                        this.get_page_ary(this.currentPage,this.totalPage);
                    }
                },
                //计算分页数组(前提count>0)
                get_page_ary:function(c_page,t_page){//当前页数，总页数
                    this.totalPageArr=[];
                    var p_ary=[];
                    if(t_page<=5){//总页数小于5
                        for(var i=0;i<t_page;i++){
                            p_ary[i]=i+1;
                        }
                    }else if(c_page==0 && t_page>5){
                        for(var i=0;i<5;i++){
                            p_ary[i]=i+1;
                        }
                    }else if(c_page+2>=t_page){//
                        var base=t_page-4;
                        for(var i=0;i<5;i++){
                            p_ary[i]=base+i;
                        }
                    }else{//c_page+2<t_page
                        //显示的第一个页数
                        var base=Math.abs(c_page-2)==0 ? 1 : Math.abs(c_page-2);
                        for(var i=0;i<5;i++){
                            p_ary[i]=base+i;
                        }
                    }
                    this.totalPageArr=p_ary;
                    // console.log(this.totalPageArr);
                },
                //当前页面跳转
                currentPageDate:function(num){
                    this.currentPage=num;
                    this.extend.offset=(num-1)*this.extend.rows;
                    //获取数据
                    //    成绩奖励
                    if(this.highest_level == 4){
                        this.leader_check();
                    }else{
                        layer.load(1, {shade:[0.3,'#121212']});
                        this.data_had = false;
                        ajax_post(api_honor_list,this.extend.$model,this);
                    }
                },
                //序号改变
                set_index:function(idx,c_page){
                    var index=idx+(c_page-1)*this.extend.rows;
                    return index;
                },
                //跳转操作
                pageNOSure:function(num){
                    if(num<1){
                        layer.alert('请输入正确的页码', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                    }else if(num>this.totalPage){
                        layer.alert('超出总页数', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                    }else{
                        this.currentPage=Math.ceil(num);
                        this.form.offset=(this.currentPage-1)*this.extend.rows;
                        //获取数据
                        //    成绩奖励
                        if(this.highest_level == 4){
                            this.leader_check();
                        }else{
                            layer.load(1, {shade:[0.3,'#121212']});
                            this.data_had = false;
                            ajax_post(api_honor_list,this.extend.$model,this);
                        }
                    }
                },
                //分页
                url_for: function(id) {
                    // console.log( this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id)
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                //string转json
                data_change:function(d){
                    return JSON.parse(d);
                },
                init:function () {
                    this.cb();
                },
                leader_check:function () {
                    this.leader_data.city = cloud.user_city();
                    this.leader_data.district = cloud.user_district();
                    this.leader_data.province = cloud.user_province();
                    // this.leader_data.ach_end_dates = this.extend.ach_end_dates;
                    // this.leader_data.ach_start_dates= this.extend.ach_start_dates;
                    this.leader_data.fk_semester_id = this.extend.fk_semester_id;
                    this.leader_data.ach_gradeid= this.extend.ach_gradeid;
                    this.leader_data.ach_classid = this.extend.ach_classid;
                    this.leader_data.offset = this.extend.offset;
                    this.leader_data.rows = this.extend.rows;
                    this.leader_data. ach_schoolid= this.extend.ach_schoolid;
                    api_honor_list = api.api+'GrowthRecordBag/achievement_findbyachievementall';
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    ajax_post(api_honor_list,this.leader_data,this);
                },
                highest_level:"",
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        self.ident_type=userType;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level=data.data.highest_level;
                        self.highest_level = highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        self.school_name=tUserData.school_name;
                        self.distrit_name=tUserData.district;
                        self.extend.ach_schoolid = tUserData.fk_school_id;
                        if(highest_level == 4){//校
                            var id = tUserData.fk_school_id;
                            ajax_post(api_grade_class,{school_id:id},self);
                        }else if(highest_level == 6){//教师
                            //求合并年级班级的另一种方式
                            // //年级综合
                            // var t_grade=tUserData.teach_class_list;
                            // var l_grade=tUserData.lead_class_list;
                            // for(var i=0;i<l_grade.length;i++){
                            //     var has=false;
                            //     var id=l_grade[i].grade_id;
                            //     for(var j=0;j<t_grade.length;j++){
                            //         if(t_grade[j].grade_id==id){
                            //             has=true;
                            //             break;
                            //         }
                            //     }
                            //     if(has==false){
                            //         t_grade.push(l_grade[i]);
                            //     }
                            // }
                            // self.grade_list=t_grade;
                            // self.extend.ach_gradeid=self.grade_list[0].grade_id;
                            // //班级综合
                            // //教
                            // var t_class=tUserData.teach_class_list[0].class_list;
                            // //班主任
                            // var l_class=tUserData.lead_class_list[0].class_list;
                            // for(var i=0;i<l_class.length;i++){
                            //     var has=false;
                            //     var id=l_class[i].class_id;
                            //     for(var j=0;j<t_class.length;j++){
                            //         if(t_class[j].class_id==id){
                            //             has=true;
                            //             break;
                            //         }
                            //     }
                            //     if(has==false){
                            //         t_class.push(l_class[i]);
                            //     }
                            // }
                            // self.class_list=t_class;
                            var t_grade = tUserData.teach_class_list;
                            var l_grade = tUserData.lead_class_list;
                            self.grade_list= self.teacherCombinClass(l_grade,t_grade);
                            self.extend.ach_gradeid=self.grade_list[0].grade_id;
                            self.class_list = self.grade_list[0].class_list;
                            //    学年学期列表
                            ajax_post(api_sem_list,{status:1},self);
                            layer.load(1, {shade:[0.3,'#121212']});
                            self.data_had = false;
                            // //    成绩奖励
                            //     ajax_post(api_honor_list,self.extend.$model,self);
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
                //显示方式-列表
                radio_table:function(){
                    //表格显示：列表-1，详情-2
                    this.list_detail =1;
                },
                //列表查看详情
                person_honor:function(el){
                    // console.log(el);
                    //表格显示：列表-1，详情-2
                    this.list_detail = 2;
                        //单个学生详情
                    this.person_detail = el;
                },
                //列表详情返回列表
                back:function(){
                    //表格显示：列表-1，详情-2
                    this.list_detail = 1;
                },
                //年级改变
                grade_change:function(){
                    //切换成页面默认表格形式
                    this.html_display = 2;
                    this.list_detail = 1;
                    this.extend.offset = 0;
                    this.currentPage = 1;
                    this.extend.ach_classid = '';
                    var list = this.grade_list;
                    var g_id = this.extend.ach_gradeid;
                    for(var i=0;i<list.length;i++){
                        var id = list[i].grade_id;
                        if(id == g_id){
                            this.class_list = list[0].class_list;
                        }
                    }
                    //    成绩奖励
                    if(this.highest_level == 4){
                        this.leader_check();
                    }else{
                        layer.load(1, {shade:[0.3,'#121212']});
                        this.data_had = false;
                        ajax_post(api_honor_list,this.extend.$model,this);
                    }
                },
                //班级改变
                class_change:function(){
                    //切换成页面默认表格形式
                    this.html_display = 2;
                    this.list_detail = 1;
                    this.extend.offset = 0;
                    this.currentPage = 1;
                    if(this.extend.ach_classid == 0){
                        this.extend.ach_classid = '';
                    }
                    //    成绩奖励
                    if(this.highest_level == 4){
                        this.leader_check();
                    }else{
                        layer.load(1, {shade:[0.3,'#121212']});
                        this.data_had = false;
                        ajax_post(api_honor_list,this.extend.$model,this);
                    }
                },
                //学年学期改变
                semesterChange:function(id,start,end,sem_id){
                    this.semester_remark=id;
                    if(id!=-1){//不是最新记录
                        //切换成页面默认表格形式
                        this.html_display = 2;
                        this.list_detail = 1;
                        this.extend.offset = 0;
                        this.currentPage = 1;
                        // this.extend.ach_start_dates=this.timeChuo(start);
                        // this.extend.ach_end_dates=this.timeChuo(end);
                        this.extend.fk_semester_id = sem_id;
                        //    成绩奖励
                        if(this.highest_level == 4){
                            this.leader_check();
                        }else{
                            layer.load(1, {shade:[0.3,'#121212']});
                            this.data_had = false;
                            ajax_post(api_honor_list,this.extend.$model,this);
                        }
                    }
                },
                //学籍号模糊查询
                code_search:function(){
                    //切换成页面默认表格形式
                    this.html_display = 2;
                    this.list_detail = 1;
                    this.extend.offset = 0;
                    this.currentPage = 1;
                    //    成绩奖励
                    if(this.highest_level == 4){
                        this.leader_check();
                    }else{
                        layer.load(1, {shade:[0.3,'#121212']});
                        this.data_had = false;
                        ajax_post(api_honor_list,this.extend.$model,this);
                    }
                },
                //姓名模糊查询
                name_search:function(){
                    //切换成页面默认表格形式
                    this.html_display = 2;
                    this.list_detail = 1;
                    this.extend.offset = 0;
                    this.currentPage = 1;
                    //    成绩奖励
                    if(this.highest_level == 4){
                        this.leader_check();
                    }else{
                        layer.load(1, {shade:[0.3,'#121212']});
                        this.data_had = false;
                        ajax_post(api_honor_list,this.extend.$model,this);
                    }
                },
                // 锚点动画
                my_turn:function(){
                    // console.log($(location.hash))
                    if (location.pathname.replace(/^\//, '')) {
                        var $target = $(location.hash);
                        $target = $target.length && $target || $('[name=' + this.hash.slice(1) + ']');
                        if ($target.length) {
                            var targetOffset = $target.offset().top-80;
                            $('html,body').animate({
                                    scrollTop: targetOffset
                                },
                                1000);
                            return false;
                        }
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //学校-年级班级
                            case api_grade_class:
                                this.complete_grade_class(data);
                                break;
                            //学年学期列表
                            case api_sem_list:
                                this.complete_sem_list(data);
                                break;
                            //成就奖励
                            case api_honor_list:
                                this.complete_honor_list(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //校-年级班级
                complete_grade_class:function(data){
                    this.grade_list = data.data;
                    this.extend.ach_gradeid=this.grade_list[0].grade_id;
                    this.class_list = this.grade_list[0].class_list;
                    //    学年学期列表
                    ajax_post(api_sem_list,{status:1},this);
                },
                complete_sem_list:function(data){
                    this.sem_list=data.data;
                    // var start = this.sem_list[0].start_date;
                    // var end =  this.sem_list[0].end_date;
                    // this.extend.ach_start_dates=this.timeChuo(start);
                    // this.extend.ach_end_dates=this.timeChuo(end);
                    this.extend.fk_semester_id = this.sem_list[0].id;
                    //    成绩奖励
                    if(this.highest_level == 4){
                        this.leader_check();
                    }else{
                        layer.load(1, {shade:[0.3,'#121212']});
                        this.data_had = false;
                        ajax_post(api_honor_list,this.extend.$model,this);
                    }
                },
                complete_honor_list:function (data) {
                    ready_photo(data.data.list, "guid");
                    this.data_had = true;
                    layer.closeAll();
                    this.honor_list=data.data.list;
                    this.count=data.data.count;
                    //获取总页数+当前显示分页数组
                    this.set_total_page(this.count);
                },
                //js把时间戳转为为普通日期格式
                timeChuo:function(h){
                    var timestamp3 = h/1000;
                    var newDate = new Date();
                    newDate.setTime(timestamp3 * 1000);
                    Date.prototype.format = function(format) {
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
                    var getTimeIs=newDate.format('yyyy-MM-dd');
                    return getTimeIs;
                }
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