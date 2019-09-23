/**
 * Created by Administrator on 2018/9/6.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('weixin_pj', 'parent_login/kid_honor_reward/kid_honor_reward','html!'),
        C.Co('weixin_pj', 'parent_login/kid_honor_reward/kid_honor_reward','css!'),
        C.CMF("router.js"),C.CMF("data_center.js"), "jquery-weui"
    ],
    function ($,avalon,layer, html,css,x, data_center,weui) {
        //获取学年学期集合
        var api_sem_list=api.user+'semester/used_list.action';
        //家长查询子女成就列表
        var api_honor_list=api.api+'GrowthRecordBag/achievement_findParAchievement';
        //删除成就
        var api_honor_delete=api.api+'GrowthRecordBag/achievement_deleteAchievement';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "kid_honor_reward",
                url_file:api.api + "file/get",//获取文件,
                //身份
                ident_type:'',
                //学生头像信息
                // stu_head:{},
                //学生头像
                user_photo: cloud.user_photo,
                url_img:url_img,
                //学年学期列表
                sem_list:[],
                //当前选中学年学期
                semester_remark:-1,
                //年级列表
                grade_list:[],
                //班级列表
                class_list:[],
                //状态: 1:待审核 3:未通过4:审核通过(公示中)5:归档
                type_num:5,
                //状态集合
                type_arr: [
                    {name:'待审核',value:'1'},
                    {name:'公示中',value:'4'},
                    {name:'未通过',value:'3'},
                    {name:'已归档',value:'5'}
                ],
                //请求参数
                req_data:{
                    ach_end_dates:'',
                    ach_start_dates:'',
                    //学生guid
                    ach_ownerid:'',
                    //状态(-1:删除 1:待审核2:提交草稿3:未通过4:审核通过(公示中)5:归档)
                    ach_state:5,
                    offset:0,
                    rows:9999,
                },
                //返回数据
                honor_list:[],
                //学校名称
                school_name:'',
                //区县名称
                distrit_name:'',
                //累计上传资料
                count:'',
                //本学期上传资料
                sem_count:'',
                url_for: function(id) {
                    // console.log( this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id)
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                //string转json
                data_change:function(d){
                    return JSON.parse(d);
                },
                //菜单改变
                menu_change:function(num){
                    window.location = '#stu_irregularities_violation';
                },
                init:function () {
                    this.cb();
                },
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        self.ident_type=userType;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level=data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        var stu = tUserData.student;
                        //头像
                        // self.stu_head=JSON.parse(tUserData.photo);
                        self.req_data.ach_ownerid = stu.guid;
                        self.school_name = stu.school_name;
                        self.distrit_name = stu.district;
                        //    学年学期列表
                        ajax_post(api_sem_list,{status:1},self);
                    });
                },
                //我要上传
                html_turn:function(){
                    // window.location='#add_punishments';
                    window.location = '#add_achievement';
                },
                //学年学期信息
                sem_info:'',
                //学年学期改变
                semesterChange:function(){
                    this.req_data.ach_start_dates = '';
                    this.req_data.ach_end_dates = '';
                    if(this.sem_info == ''){
                        //    成绩奖励
                        ajax_post(api_honor_list,this.req_data.$model,this);
                        return;
                    }
                    var id = this.sem_info.split('|')[0];
                    var start = this.sem_info.split('|')[1];
                    var end = this.sem_info.split('|')[2];
                    this.semester_remark=id;
                    if(id!=-1){//不是最新记录
                        this.req_data.ach_start_dates=this.timeChuo(start);
                        this.req_data.ach_end_dates=this.timeChuo(end);
                        //    成绩奖励
                        ajax_post(api_honor_list,this.req_data.$model,this);
                    }
                },
                //状态改变
                divide:function(){
                    this.req_data.ach_state = this.type_num;
                    //    成绩奖励
                    ajax_post(api_honor_list,this.req_data.$model,this);
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
                //编辑
                edit_honor:function(el){
                    window.location='#add_punishments';
                },
                //删除
                delete_honor:function(el){
                    ajax_post(api_honor_delete,{id:el.id},this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //学年学期列表
                            case api_sem_list:
                                this.complete_sem_list(data);
                                break;
                            //成就奖励
                            case api_honor_list:
                                this.complete_honor_list(data);
                                break;
                            //        删除成就奖励
                            case api_honor_delete:
                                $.alert('删除成功');
                                break;
                        }
                    } else {
                        $.alert(msg)
                    }
                },
                complete_sem_list:function(data){
                    this.sem_list=data.data;
                    //    成绩奖励
                    ajax_post(api_honor_list,this.req_data.$model,this);
                },
                complete_honor_list:function (data) {
                    ready_photo(data.data.list,'guid');
                    var self = this;
                    self.honor_list=data.data.list;
                    if(self.req_data.ach_start_dates==''){
                        self.count=data.data.count;
                        // console.log(this.sem_list[0].start_date);
                        // var a = this.sem_list[0].start_date;
                        var start=self.timeChuo(self.sem_list[0].start_date);
                        start=new Date(start.replace(/\-/g, "\/"));
                        var end=self.timeChuo(self.sem_list[0].end_date);
                        end=new Date(end.replace(/\-/g, "\/"));
                        var count=0;
                        for(var i=0;i<self.honor_list.length;i++){
                            var time=self.honor_list[i].ach_date;
                            if(time>=start && time<=end){
                                count++;
                            }
                        }
                        self.sem_count=count;
                    }else{
                        self.sem_count=data.data.count;
                    }
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