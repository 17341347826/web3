/**
 * Created by Administrator on 2018/6/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('self_evaluation_management', 'self_reward_punish/lrregularities_violation/lrregularities_violation','html!'),
        C.Co('self_evaluation_management', 'self_reward_punish/lrregularities_violation/lrregularities_violation','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,three_menu_module) {
        //获取学年学期集合
        var api_sem_list=api.user+'semester/used_list.action';
        //惩戒处罚列表
        var api_punish_list=api.api+'GrowthRecordBag/punish_findbyPunish';
        avalon.filters.deal_type = function(num){
            if(num == 1){
                return "警告"
            }else if(num == 2){
                return '严重警告'
            }else if(num == 3){
                return '记过'
            }else if(num == 4){
                return '记大过'
            }
        };
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "lrregularities_violation",
                url_file:api.api + "file/get",//获取文件,
                //身份
                ident_type:'',
                //学生基本信息
                stu_info:[],
                //学生头像信息
                // stu_head:{},
                //学生头像
                user_photo: cloud.user_photo,
                url_img:url_img,
                //显示方式：图文-1，表格-2
                html_display:2,
                //表格显示：列表-1，详情-2
                list_detail:1,
                //单个学生详情
                person_detail:{},
                //学年学期列表
                sem_list:[],
                //年级列表
                grade_list:[],
                //班级列表
                class_list:[],
                //学年学期集合
                semester_list:[],
                //当前选中学年学期
                semester_remark:0,
                //日常表现列表数据
                daily_list:[
                    {id:1,name:'邹倩岚',yy:'只怪人太美'},
                    {id:2,name:'杨秋琳'}
                ],
                //学校名称
                school_name:'',
                // 区县名称
                distrit_name:'',
                //上传资料
                count:'',
                //处分返回数据
                punish_list:[],
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had:false,
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
                // rotation_str: function(x) {
                //     var deg = 'rotate(' + x + 'deg)'
                //     return {
                //         'WebkitTransform': deg,
                //         'MosTransform': deg,
                //         'OTransform': deg,
                //         'transform': deg
                //     }
                // },
                url_for: function(id) {
                    // console.log( this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id)
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                //string转json
                data_change:function(d){
                    return JSON.parse(d);
                },
                init:function () {
                    // var a=1528853720000;
                    // var b=this.timeChuo(a);
                    // console.log(b);
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
                        //头像
                        // self.stu_head=JSON.parse(tUserData.photo);
                        self.school_name=tUserData.school_name;
                        self.distrit_name=tUserData.district;
                        self.req_data.classid=tUserData.fk_class_id;
                        self.req_data.gradeid=tUserData.fk_grade_id;
                        self.req_data.schoolid=tUserData.fk_school_id;
                        self.req_data.punished_person_id=tUserData.guid;
                    //    学年学期列表
                        ajax_post(api_sem_list,{status:1},self);
                    });
                },
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
                //学年学期改变
                semesterChange:function(id,start,end){
                    this.semester_remark=id;
                    //不是点击最新记录
                    if(id!=-1){
                        //切换成页面默认表格形式
                        this.html_display = 2;
                        this.list_detail = 1;
                        this.req_data.xqkssj=this.timeChuo(start);
                        this.req_data.xqjssj=this.timeChuo(end);
                        layer.load(1, {shade:[0.3,'#121212']});
                        this.data_had = false;
                        //惩戒列表
                        ajax_post(api_punish_list,this.req_data.$model,this);
                    }
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
                            //学年学期列表
                            case api_sem_list:
                                this.complete_sem_list(data);
                                break;
                            //    惩戒列表
                            case api_punish_list:
                                this.complete_punish_list(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_sem_list:function(data){
                    this.semester_list=data.data;
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    var start = this.semester_list[0].start_date;
                    var end = this.semester_list[0].end_date;
                    this.req_data.xqkssj=this.timeChuo(start);
                    this.req_data.xqjssj=this.timeChuo(end);
                    //惩戒列表
                    ajax_post(api_punish_list,this.req_data.$model,this);

                },
                /*本学期上传材料数量*/
                sem_count:'',
                complete_punish_list:function(data){
                    this.count=data.data.count;
                    ready_photo(data.data.list,'punished_person_id');
                    layer.closeAll();
                    this.data_had = true;
                    this.punish_list=data.data.list;
                    // console.log(this.punish_list);
                    var start=this.timeChuo(this.semester_list[0].start_date);
                    start=new Date(start.replace(/\-/g, "\/"));
                    var end=this.timeChuo(this.semester_list[0].end_date);
                    end=new Date(end.replace(/\-/g, "\/"));
                    var count=0;
                    for(var i=0;i<this.punish_list.length;i++){
                        var time=new Date(this.punish_list[i].punish_time.replace(/\-/g, "\/"));
                        if(time>=start && time<=end){
                            count++;
                        }
                    }
                    this.sem_count=count;
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