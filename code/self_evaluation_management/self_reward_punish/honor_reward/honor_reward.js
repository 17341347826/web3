/**
 * Created by Administrator on 2018/6/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('self_evaluation_management', 'self_reward_punish/honor_reward/honor_reward','html!'),
        C.Co('self_evaluation_management', 'self_reward_punish/honor_reward/honor_reward','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,three_menu_module) {
        //获取学年学期集合
        var api_sem_list=api.user+'semester/used_list.action';
        //成就列表
        var api_honor_list=api.api+'GrowthRecordBag/achievement_findByAchievement';
        //删除成就
        var api_honor_delete=api.api+'GrowthRecordBag/achievement_deleteAchievement';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "honor_reward",
                url_file:api.api + "file/get",//获取文件,
                //身份
                ident_type:'',
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
                //当前选中学年学期
                semester_remark:0,
                //年级列表
                grade_list:[],
                //班级列表
                class_list:[],
                //状态: 1:待审核 3:未通过4:审核通过(公示中)5:归档
                type_num:5,
                //请求参数
                req_data:{
                    // ach_end_dates:'',
                    // ach_start_dates:'',
                    fk_semester_id:'',
                    ach_type:'',
                    //状态(-1:删除 1:待审核2:提交草稿3:未通过4:审核通过(公示中)5:归档)
                    ach_state:5,
                    offset:0,
                    rows:10,
                },
                //返回数据
                honor_list:[],
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had:false,
                //学校名称
                school_name:'',
                //区县名称
                distrit_name:'',
                //累计上传资料
                count:'',
                //本学期上传资料
                sem_count:'',
                //分页
                // 数据总数
                count:'',
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
                        this.totalPage=Math.ceil(count/this.req_data.rows);
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
                    this.req_data.offset=(num-1)*this.req_data.rows;
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    //获取数据
                    //    成绩奖励
                    ajax_post(api_honor_list,this.req_data.$model,this);
                },
                //序号改变
                set_index:function(idx,c_page){
                    var index=idx+(c_page-1)*this.req_data.rows;
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
                        this.req_data.offset=(this.currentPage-1)*this.req_data.rows;
                        layer.load(1, {shade:[0.3,'#121212']});
                        this.data_had = false;
                        //获取数据
                        //    成绩奖励
                        ajax_post(api_honor_list,this.req_data.$model,this);
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
                        //    学年学期列表
                        ajax_post(api_sem_list,{status:1},self);
                    // //    成绩奖励
                    //     ajax_post(api_honor_list,self.req_data.$model,self);
                    });
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
                    el.img_arr = [];
                    el.video_arr = [];
                    el.file_arr = [];
                    var token = sessionStorage.getItem("token");
                    var fjdz = JSON.parse(el.ach_enclosure);
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
                            el.video_arr.push(fjdz[j]);
                            continue;
                        }
                        if (vm.suffix_img.indexOf(suffix) != -1) {
                            el.img_arr.push(fjdz[j]);
                            continue;
                        }
                        el.file_arr.push(fjdz[j]);
                    }
                    //单个学生详情
                    this.person_detail = el;
                },
                //列表详情返回列表
                back:function(){
                    //表格显示：列表-1，详情-2
                    this.list_detail = 1;
                },
                //我要上传
                html_turn:function(){
                    // window.location='#add_punishments';
                    window.location = '#add_achievement';
                },
                //学年学期改变
                semesterChange:function(id,start,end,sem_id){
                    this.semester_remark=id;
                    if(id!=-1){//不是最新记录
                        //切换成列表
                        this.html_display = 2;
                        this.list_detail = 1;
                        // this.req_data.ach_start_dates=this.timeChuo(start);
                        // this.req_data.ach_end_dates=this.timeChuo(end);
                        this.req_data.fk_semester_id = sem_id;
                        this.req_data.offset = 0;
                        this.currentPage = 1;
                        layer.load(1, {shade:[0.3,'#121212']});
                        this.data_had = false;
                        //    成绩奖励
                        ajax_post(api_honor_list,this.req_data.$model,this);
                    }
                },
                //状态改变
                divide:function(id){
                    //切换成列表
                    this.html_display = 2;
                    this.list_detail = 1;
                    this.req_data.ach_state=id;
                    this.type_num=id;
                    this.req_data.offset = 0;
                    this.currentPage = 1;
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    //成绩奖励
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
                    window.location='#add_achievement?achieve_id='+el.id;
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
                                toastr.success('删除成功');
                                if(this.html_display == 2 && this.list_detail == 2){
                                   this.html_display = 1;
                                }
                                layer.load(1, {shade:[0.3,'#121212']});
                                this.data_had = false;
                                ajax_post(api_honor_list,this.req_data.$model,this);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_sem_list:function(data){
                    this.sem_list=data.data;
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    // var start = this.sem_list[0].start_date;
                    // var end = this.sem_list[0].end_date;
                    // this.req_data.ach_start_dates=this.timeChuo(start);
                    // this.req_data.ach_end_dates=this.timeChuo(end);
                    this.req_data.fk_semester_id = this.sem_list[0].id;
                    //    成绩奖励
                    ajax_post(api_honor_list,this.req_data.$model,this);
                },
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                complete_honor_list:function (data) {
                    this.honor_list = [];
                    ready_photo(data.data.list,'guid');
                    var list = data.data.list;

                    var token = sessionStorage.getItem("token");
                    for (var i = 0; i < list.length; i++) {
                        if (!list[i].ach_enclosure || list[i].ach_enclosure == null)
                            continue;
                        var fjdz = JSON.parse(list[i].ach_enclosure);
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
                    data.data.list = list;
                    layer.closeAll();
                    this.data_had = true;
                    this.honor_list=data.data.list;
                    this.count=data.data.count;
                    //获取总页数+当前显示分页数组
                    this.set_total_page(this.count);
                    if(this.req_data.ach_start_dates==''){//最新记录（目前屏蔽了）
                        this.count=data.data.count;
                        // console.log(this.sem_list[0].start_date);
                        // var a = this.sem_list[0].start_date;
                        var start=this.timeChuo(this.sem_list[0].start_date);
                        start=new Date(start.replace(/\-/g, "\/"));
                        var end=this.timeChuo(this.sem_list[0].end_date);
                        end=new Date(end.replace(/\-/g, "\/"));
                        var count=0;
                        for(var i=0;i<this.honor_list.length;i++){
                            var time=this.honor_list[i].ach_date;
                            time = new Date(time.replace(/\-/g, "\/"));
                            if(time>=start && time<=end){
                                count++;
                            }
                        }
                        this.sem_count=count;
                    }else{
                        this.sem_count=data.data.count;
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
            define: avalon_define,
            repaint:true,
        }
    });