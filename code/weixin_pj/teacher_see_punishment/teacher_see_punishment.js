/**
 * Created by Administrator on 2018/6/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('weixin_pj', 'teacher_see_punishment/teacher_see_punishment','html!'),
        C.Co('weixin_pj', 'teacher_practice_see/teacher_practice_see','css!'),
        C.CMF("data_center.js"),'jquery-weui','swiper'
    ],
    function ($,avalon,layer, html,css, data_center,weui,swiper) {
        //获取指定学校的班级集合
        var api_grade_class=api.user+'class/school_class.action';
        //惩戒处罚列表
        var api_punish_list=api.api+'GrowthRecordBag/punish_findbyPunish';
        //学年学期
        var api_sem_list = api.api + "base/semester/grade_opt_semester";
        //查询班级人数(在籍学生)
        var api_class_stu = api.api + "base/student/class_used_stu";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "teacher_see_punishment",
                url_file:api.api + "file/get",//获取文件,
                //学生头像
                user_photo: cloud.user_photo,
                url_img:url_img,
                //身份
                ident_type:'',
                //学生姓名
                stu_name:'',
                //学籍号
                stu_num:'',
                //学年学期列表
                sem_list:[],
                //年级列表
                grade_list:[],
                //班级列表
                class_list:[],
                //学年学期集合
                semester_list:[],
                //当前选中学年学期
                semester_remark:-1,
                //日常表现列表数据
                daily_list:[
                    {id:1,name:'邹倩岚',yy:'只怪人太美'},
                    {id:2,name:'杨秋琳'}
                ],
                //学校名称
                school_name:'',
                // 区县名称
                distrit_name:'',
                //处分返回数据
                punish_list:[],
                req_data:{
                    classid:'',
                    gradeid:'',
                    //被处罚人id
                    punished_person_id:'',
                    schoolid:'',
                    //学年学期结束时间
                    xqjssj:'',
                    //    学年学期开始时间
                    xqkssj:'',
                },
                url_for: function(id) {
                    // console.log( this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id)
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                //string转json
                data_change:function(d){
                    return JSON.parse(d);
                },
                //学年学期改变
                semesterChange:function(){
                    var time = this.semester_info;
                    var start = time.split('|')[0];
                    var end = time.split('|')[1];
                    this.req_data.xqkssj = timeChuo(start);
                    this.req_data.xqjssj = timeChuo(end);
                    this.get_data();
                },
                //年级改变
                grade_change:function(){
                    if(this.ident_type=='6')
                        return;
                    var grade_id=this.req_data.gradeid;
                    for(var i=0;i<this.grade_list.length;i++){
                        var id=this.grade_list[i].grade_id;
                        if(grade_id==id){
                            this.class_list=this.grade_list[i].class_list;
                        }
                    };
                    //惩戒列表
                    ajax_post(api_punish_list,this.req_data.$model,this);
                },
                //班级改变
                class_change:function(){
                    //惩戒列表
                    ajax_post(api_punish_list,this.req_data.$model,this);
                },
                init:function () {
                    this.cb();
                },
                //上传惩戒处罚
                html_turn:function(){
                    window.location = '#teacher_punishment';
                },
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level=data.data.highest_level;
                        self.ident_type=highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        self.school_name=tUserData.school_name;
                        self.distrit_name=tUserData.district;
                        self.req_data.schoolid=tUserData.fk_school_id;
                        if(highest_level=='4'){//校
                            ajax_post(api_grade_class,{school_id:tUserData.fk_school_id},self);
                        }else if(highest_level=='6'){//教师
                            //年级综合
                            var t_grade=tUserData.teach_class_list;
                            var l_grade=tUserData.lead_class_list;
                            for(var i=0;i<l_grade.length;i++){
                                var has=false;
                                var id=l_grade[i].grade_id;
                                for(var j=0;j<t_grade.length;j++){
                                    if(t_grade[j].grade_id==id){
                                        has=true;
                                        break;
                                    }
                                }
                                if(has==false){
                                    t_grade.push(l_grade[i]);
                                }
                            }
                            self.grade_list=t_grade;
                            self.req_data.gradeid=self.grade_list[0].grade_id;
                            self.class_list=self.grade_list[0].class_list;
                            self.req_data.classid = self.class_list[0].class_id;
                            //    学年学期列表
                            ajax_post(api_sem_list,{grade_id:self.req_data.gradeid},self);
                        }
                    });
                },
                //锚点动画
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
                            //获取年级班级集合
                            case api_grade_class:
                                this.complete_grade_class(data);
                                break;
                            //学年学期列表
                            case api_sem_list:
                                this.complete_sem_list(data);
                                break;
                            case api_class_stu:
                                this.complete_class_stu(data);
                                break;
                            //    惩戒列表
                            case api_punish_list:
                                this.complete_punish_list(data);
                                break;
                        }
                    } else {
                        $.alert(msg)
                    }
                },
                //年级班级集合
                complete_grade_class:function(data){
                    this.grade_list = data.data;
                    this.req_data.gradeid = this.grade_list[0].grade_id;
                    this.class_list = this.grade_list[0].class_list;
                    //    学年学期列表
                    ajax_post(api_sem_list,{status:1},this);
                },
                stu_list:[],
                semester_info:"",
                complete_sem_list:function(data){
                    var list = data.data.list;
                    this.semester_list=data.data.list;
                    var end_date = list[0].end_date;
                    var start_date = list[0].start_date;
                    var end_date_x = timeChuo(end_date);
                    var start_date_x = timeChuo(start_date);
                    this.semester_info = start_date_x + "|" + end_date_x;
                    this.req_data.xqjssj = end_date_x;
                    this.req_data.xqkssj = start_date_x;
                    ajax_post(api_class_stu,{fk_class_id:this.req_data.classid},this);
                },
                complete_class_stu:function (data) {
                    var dataList = data.data.list;
                    dataList.unshift({name:"全部",code:""});
                    this.stu_list = dataList;
                    this.get_data();
                },
                get_data:function () {
                    //惩戒列表
                    ajax_post(api_punish_list,this.req_data.$model,this);
                },
                complete_punish_list:function(data){
                    var list = data.data.list;
                    var length = list.length;
                    if(length > 0){
                        ready_photo(data.data.list, "punished_person_id");
                        this.count=data.data.count;
                        var obj = {
                            1:'警告',
                            2:'严重警告',
                            3:'记过',
                            4:'记大过'
                        };
                        for(var i=0;i<data.data.list.length;i++){
                            var punish_type = data.data.list[i].punish_type;
                            data.data.list[i]['punish_type'] = obj[punish_type];
                        }
                    }
                    this.punish_list = list;

                },
                stuChange:function () {
                    this.get_data();
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