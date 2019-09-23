/**
 * Created by Administrator on 2018/3/8.
 */
define(['jquery',
        C.CLF('avalon.js'), 'layer',
        C.Co("self_evaluation_management", "self_description/new_stu_comment/new_stu_comment", "css!"),
        C.Co("self_evaluation_management", "self_description/new_stu_comment/new_stu_comment", "html!"),
        C.CMF("router.js"),C.CMF("data_center.js"),C.CM('three_menu_module')
    ],
    function($, avalon, layer,css,html, x,data_center,three_menu_module ) {
        //获取当前学年学期
        var api_current_semester=api.user+'semester/current_semester.action';
        //查询可用的学年学期
        var api_semester_is_fill=api.user+"semester/grade_semester_mapping";
        //查询模块时间
        var api_get_module_time=api.api+"everyday/get_module_switch";
        //获取系统当前时间
        var api_get_server_time=api.api+'base/baseUser/current_time';
        //查询我所在组的其他成员
        var api_get_my_group=api.api+'everyday/list_my_group';
        //查询我评论过的互评记录
        var api_my_remarl = api.api + "everyday/get_my_remarl";
        //评语提交
        var api_remarl_add = api.api + "everyday/remarl_he";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "new_stu_comment",
                //年级id
                grade_id:'',
                remark:'',
                //学年学期开始时间
                semester_start:'',
                //学年学期结束时间
                semester_end:'',
                //当前学年学期开始时间
                current_semester_start:'',
                //当前学年学期结束时间
                current_semester_end:'',
                //模块开始时间
                start_time:"",
                //模块结束时间
                end_time:"",
                //当前系统时间
                current_time:"",
                //当前状态：1-可编辑；2-不可编辑，只能查看
                is_fill:"",
                //学年学期集合
                semester_list:[],
                fk_semester:"",
                semester:"",
                //当前可编辑的却年学期
                yearSemester:"",
                //成员信息
                stu_list:[],
                //组合数据
                data_list:[],
                //避免重复提交：true-可以提交，false-不可以提交
                btn_had:true,
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userData = JSON.parse(data.data['user']);
                        self.grade_id=userData.fk_grade_id;
                        //当前学年学期
                        ajax_post(api_current_semester,{},self);
                    });
                },
                //学年学期改变
                semesterChange:function () {
                    this.data_list=[];
                    this.stu_list = [];
                    var semester = this.fk_semester;
                    var semester_name = semester.split("|")[0];
                    this.grade = Number(semester_name.substr(0,4));
                    var semester_index = Number(semester.split("|")[1]);
                    this.semester = semester.split("|")[4];
                    this.semester_start=this.timeChuo(semester.split("|")[3]);

                    this.remark=semester.split("|")[5];
                    //模块时间
                    ajax_post(api_get_module_time,{module_type:"2",grade_id:this.grade_id},this);
                    // console.log(this.data_list);
                    // console.log(this.data_list.length);
                },
                disabled_tips:function () {
                    toastr.info('当前时间不可录入')
                },
                //编辑添加
                edit_btn:function (el) {
                    var self=this;
                    var name = el.name;
                    var student_id=el.guid;
                    var fk_semester = self.fk_semester;
                    //学年
                    var grade=Number(self.semester_start.substr(0,4));
                    var semester=Number(self.fk_semester.split('|')[4]);
                    var semester_name = fk_semester.split("|")[0];
                    var remark=fk_semester.split("|")[5];
                    var title="请对"+"【"+name+"】"+"进行"+semester_name+"期的评价";
                    var content_my=el.content;
                    layer.prompt(
                        {
                            title: title, 
                            formType: 2 ,
                            value:content_my,
                            yes:function (index, layero) {
                                var value = layero.find(".layui-layer-input").val();
                                if($.trim(value) == ''){
                                    toastr.warning('评论不能为空');
                                }else{
                                    if(self.btn_had){
                                        self.btn_had = false;
                                        ajax_post(api_remarl_add,{
                                            content:value,
                                            grade:grade,
                                            party_id:student_id,
                                            party_name:name,
                                            semester:semester,
                                            semester_name:remark,
                                            fk_semester_id:fk_semester.split('|')[4],
                                            fk_grade_id:self.grade_id
                                        },self);
                                    }
                                    layer.close(index);
                                }

                            }
                        }

                    );
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            // 当前学年学期
                            case api_current_semester:
                                this.complete_current_semester(data);
                                break;
                            //查询服务器当前时间
                            case api_get_server_time:
                                this.complete_get_server_time(data);
                                break;
                            //可操作的学年学期
                            case api_semester_is_fill:
                                this.complete_semester_is_fill(data);
                                break;
                            //查询模块时间
                            case api_get_module_time:
                                this.complete_module_time(data);
                                break;
                            //查询所在组成员
                            case api_get_my_group:
                                this.complete_my_group(data);
                                break;
                            //查询互评记录
                            case api_my_remarl:
                                this.complete_my_ramarl(data);
                                break;
                            //评语提交
                            case api_remarl_add:
                                toastr.success('评语修改成功');
                                this.complete_remarl_add(data);
                                break;
                        }
                    }else{
                        if(cmd == api_remarl_add){
                            this.btn_had = true;
                        }
                        toastr.error(msg)
                    }

                },
                //当前学年学期
                complete_current_semester:function(data){
                    this.current_semester_start=this.timeChuo(data.data.start_date);
                    this.current_semester_end=this.timeChuo(data.data.end_date);
                    //当前服务器时间
                    ajax_post(api_get_server_time,{},this);
                },
                //当前服务器时间
                complete_get_server_time:function (data) {
                    this.current_time=this.timeChuo(data.data.current_time);
                    //获取当前可用的学年学期
                    ajax_post(api_semester_is_fill,{grade_id:this.grade_id},this);
                },
                //可操作学年学期
                complete_semester_is_fill:function (data) {
                    var dataList=data.data.list;
                    var len=dataList.length-1;
                    this.semester_list=dataList;
                    this.semester_start=this.timeChuo(dataList[len].start_date);
                    this.semester_end=this.timeChuo(dataList[len].end_date);
                    this.fk_semester=dataList[len].semester_name+"|"+
                        dataList[len].semester_index+"|"+
                        dataList[len].end_date+"|"+
                        dataList[len].start_date+'|'+
                        dataList[len].id+'|'+
                        dataList[len].remark;
                    this.grade=Number(dataList[len].semester_name.substr(0,4));
                    this.semester=dataList[len].id;
                    this.remark=dataList[len].remark;
                    //模块时间
                    ajax_post(api_get_module_time,{module_type:"2",grade_id:this.grade_id},this);
                },
                is_switch:"",
                //模块时间
                complete_module_time:function(data){
                    if(data.data){
                        this.start_time=data.data.start_time;
                        this.end_time=data.data.end_time;
                        this.is_switch = data.data.is_switch;
                        var self=this;
                        //系统时间-当前时间
                        var currentDate=new Date(self.current_time.replace(/\-/g, "\/"));
                        //模块时间
                        var start=new Date(self.start_time.replace(/\-/g, "\/"));
                        var end=new Date(self.end_time.replace(/\-/g, "\/"));
                        //学年学期时间
                        var sem_start=new Date(self.semester_start.replace(/\-/g, "\/"));
                        var sem_end=new Date(self.semester_end.replace(/\-/g, "\/"));
                        //当前学年学期
                        var cur_sem_start=new Date(self.current_semester_start.replace(/\-/g, "\/"));
                        var cur_sem_end=new Date(self.current_semester_end.replace(/\-/g, "\/"));
                        if(cur_sem_start<=sem_start && cur_sem_end<=sem_end) {//可编辑
                            if (cur_sem_start> end || cur_sem_end <start) {
                                self.is_fill = 2;
                            }else{
                                if(cur_sem_start<=currentDate && currentDate<=cur_sem_end  && this.is_switch == true){
                                    self.is_fill = 1;
                                }else{
                                    self.is_fill = 2;
                                }
                            }
                        }else{
                            self.is_fill = 2;
                        }
                        // if(start<currentDate && currentDate<end) {//可编辑
                        //     if (sem_start < currentDate && currentDate < sem_end) {
                        //         self.is_fill = 1;
                        //     }else{
                        //         self.is_fill = 2;
                        //     }
                        //     // var dataList = this.semester_list;
                        //     // var dataList_length = dataList.length;
                        //     // for (var i = 0; i < dataList_length; i++) {
                        //     //     var start_x = this.timeChuo(dataList[i].start_date);
                        //     //     var end_x = this.timeChuo(dataList[i].end_date);
                        //     //     var semester_start = new Date(start_x.replace(/\-/g, "\/"));
                        //     //     var semester_end = new Date(end_x.replace(/\-/g, "\/"));
                        //     //     if (semester_start < currentDate && currentDate < semester_end) {
                        //     //         this.yearSemester = dataList[i].semester_name + "|" +
                        //     //             dataList[i].semester_index + "|" +
                        //     //             dataList[i].end_date + "|" +
                        //     //             dataList[i].start_date;
                        //     //     }
                        //     // }
                        // }else{
                        //     self.is_fill = 2;
                        // }
                    }else{
                        this.is_fill=2;//只能查看
                    }
                    //查询学生分组
                    ajax_post(api_get_my_group,{year_start:this.semester_start,fk_grade_id:this.grade_id},this);
                },
                //分组
                complete_my_group:function(data){
                    var self=this;
                   if(data.data.length>0){
                       //学年
                       var grade=Number(self.semester_start.substr(0,4));
                       var semester=self.semester;
                       // 查询互评记录
                       ajax_post(api_my_remarl,{grade:grade,
                           offset:0,
                           rows:9999,
                           semester:semester},self);
                       var list=data.data;
                       for(var i=0;i<list.length;i++){
                           self.stu_list[i]={guid:list[i].guid,name:list[i].name,content:''};
                       }
                   }else{
                       toastr.warning('该学生暂未分组')
                   }
                },
                //互评记录
                complete_my_ramarl:function(data){
                    this.data_list=[];
                    var stu=this.stu_list;
                    var list=data.data.list;
                    if(list.length>0){
                        for(var i=0;i<stu.length;i++){
                            for(var j=0;j<list.length;j++){
                                if(stu[i].guid==list[j].party_id){
                                    stu[i].content=list[j].content;
                                }
                            }
                        }
                    }
                    this.data_list=stu;
                },
                //提交
                complete_remarl_add:function(data){
                    this.btn_had = true;
                    var self=this;
                    //学年
                    var grade=Number(self.semester_start.substr(0,4));
                    var semester=Number(self.fk_semester.split('|')[1]);
                    //查询学生分组
                    ajax_post(api_get_my_group,{year_start:self.semester_start,fk_grade_id:self.grade_id},self);

                    // 查询互评记录
                    // ajax_post(api_my_remarl,{grade:grade,
                    //     offset:0,
                    //     rows:9999,
                    //     semester:semester},self);
                    // var list=data.data;
                    // for(var i=0;i<list.length;i++){
                    //     self.stu_list[i]={guid:list[i].guid,name:list[i].name,content_my:''};
                    // }
                },
                //时间戳
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
            vm.$watch("onReady", function() {
                this.cb();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });




