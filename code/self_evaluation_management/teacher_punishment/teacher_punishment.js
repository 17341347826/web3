define([C.CLF('avalon.js'), "jquery", "layer", "select2",
        C.Co("self_evaluation_management", "teacher_punishment/teacher_punishment", "css!"),
        C.Co("self_evaluation_management", "teacher_punishment/teacher_punishment", "html!"),
        C.CMF("viewer/viewer.js"), C.CMF("uploader/uploader.js"),
        C.CMF("router.js"),C.CMF("data_center.js")],
    function (avalon, $, layer,select2, css,html, viewer, uploader, x,data_center) {
        //获取指定学校的年级集合
        var api_get_grade=api.user+'grade/school_grade';
        //获取指定学校年级的班级集合
        var api_get_class=api.user+'class/findClassSimple.action';
        //文件上传
        var api_file_uploader = api.api + "file/uploader";
        //获取学生信息
        var api_studentlist = api.PCPlayer + "baseUser/studentlist.action";
        //添加处分
        var api_punish=api.growth+"punish_addpunish";
        //查询处分详情
        var api_findbyPunishID=api.growth+"punish_findbyPunishID";
        //修改处罚
        var api_updatepunish=api.growth+"punish_updatepunish";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "teacher_punishment",
                files: [],
                uploader_url: api_file_uploader,
                //身份
                ident_type:'',
                //学校
                school_id:'',
                //年级
                grade_list:[],
                grade_info:'',
                //班级
                class_list:[],
                class_info:'',
                //学生请求参数
                stuExtend:{
                    fk_class_id:'',
                    fk_grade_id:'',
                    status:'1'
                },
                //请求参数
                extend:{
                    basis:'',//事实依据	string
                    classid:'',
                    classname:'',
                    gradeid:'',
                    gradename:'',
                    punish_cause:'',//	处罚缘由	string
                    punish_name:'',//	处罚名称	string
                    punish_time:'',//	处罚时间	string
                    punished_person:'',
                    punished_person_id:'',
                    punished_person_num:'',
                    punish_type:'',//	处罚类型(1:警告2:严重警告3:记过4记大过)	number
                    //录入人guid
                    input_person_id:'',
                //    录入人名称
                    input_person:'',
                    schoolid:'',
                    schoolname:''
                },
                //禁用
                is_disabled:false,
                //记录id
                punish_id:'',
                //类型：记录、修改
                type:'',
                //学生集合
                stu_list:'',
                //被处罚人信息
                stu_info:'',
                //处罚返回
                msg:'',
                //处罚列表
                punish_list:[
                    { "id": 0,value:1, "type_name": "警告" },
                    { "id": 1,value:2, "type_name": "严重警告" },
                    { "id": 2,value:3, "type_name": "记过" },
                    { "id": 3,value:4, "type_name": "记大过" }
                 ],
                //年级改变
                grade_change:function(){
                    var grade_id=this.grade_info.split('|')[0];
                    ajax_post(api_get_class,{fk_grade_id:grade_id,fk_school_id:this.school_id},this);
                },
                //班级改变
                class_change:function(){
                    var grade_id = this.grade_info.split('|')[0];
                    var grade_name = this.grade_info.split('|')[1];
                    var class_id = this.class_info.split('|')[0];
                    var class_name = this.class_info.split('|')[1];
                    //学生
                    this.stuExtend.fk_grade_id = grade_id;
                    this.stuExtend.fk_class_id = class_id;

                    //记录
                    this.extend.gradeid = grade_id;
                    this.extend.gradename = grade_name;
                    this.extend.classid = class_id;
                    this.extend.classname = class_name;
                    // 请求学生列表
                    ajax_post(api_studentlist,this.stuExtend.$model,this);
                },
                //获取处罚时间
                getDate:function(){
                    $("#my-datepicker").on("change", function (event) {
                        vm.extend.punish_time = event.delegateTarget.defaultValue;
                    });
                    $('#my-datepicker').datepicker('open');
                },
                //获取修改
                getType:function () {
                    this.type=pmx.params_type;
                },
                //获取记录id
                getId: function() {
                    this.punish_id = pmx.punish_id;
                },
                /*修改--回显数据*/
                product_modify: function() {
                    ajax_post(api_findbyPunishID, { id: Number(this.punish_id)}, this);
                },
                //取消
                back:function(){
                    window.location = '#t_lrregularities_violation';
                },
                //提交
                save_daily: function () {
                    var self=this;
                    var uploaderWorks = data_center.ctrl("uploader_add_daily");
                    var is_complete=uploaderWorks.is_finished();
                    self.extend.punish_type=Number(self.extend.punish_type);
                    if(self.extend.punished_person==''){
                        toastr.warning('请选择被处罚人');
                    }else if($.trim(self.extend.punish_time)==''){
                        toastr.warning('请选择处分时间');
                    }else if($.trim(self.extend.punish_name)==''){
                        toastr.warning('请填写处分名称');
                    }else if($("#punish_select").val()==0){
                        toastr.warning('请选择处分类型');
                    }else if($.trim(self.extend.punish_cause)==''){
                        toastr.warning('请填写处分原由');
                    }else if(is_complete==true){
                        var files = uploaderWorks.get_files();
                        vm.extend.basis = JSON.stringify(files);
                        if(files.length==0) {
                            toastr.warning('请上传事实依据');
                        }else {
                            layer.confirm('确认提交？', {
                                btn: ['确认', '取消'] //按钮
                            }, function() {
                                ajax_post(api_punish,self.extend.$model,self);
                                layer.closeAll();
                                // window.location="#headTeacher_punish_list";
                            });
                        }
                    }
                    else{
                        layer.confirm('确认提交？', {
                            btn: ['确认', '取消'] //按钮
                        }, function() {
                            ajax_post(api_punish,self.extend.$model,self);
                            layer.closeAll();
                            // window.location="#headTeacher_punish_list";
                        });
                    }
                },
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //4：校级；5：年级；6：班主任或普通任课教师
                        var high_type=data.data.highest_level;
                        self.ident_type=high_type;
                        var userType = data.data.user_type;
                        var tUserData = JSON.parse(data.data["user"]);
                        cArr = tUserData.lead_class_list;
                        self.extend.input_person_id = tUserData.guid;
                        self.extend.input_person = tUserData.name;
                        self.extend.schoolid = tUserData.fk_school_id;
                        self.extend.schoolname = tUserData.school_name;
                        if (high_type == "6") {//老师
                            if(cArr.length!=0){
                                //学生
                                self.stuExtend.fk_grade_id=cArr[0].grade_id;
                                self.stuExtend.fk_class_id=cArr[0].class_list[0].class_id;

                                //记录
                                self.extend.gradeid=cArr[0].grade_id;
                                self.extend.gradename=cArr[0].grade_name;
                                self.extend.classid=cArr[0].class_list[0].class_id;
                                self.extend.classname=cArr[0].class_list[0].class_name;
                                // 请求学生列表
                                ajax_post(api_studentlist,self.stuExtend.$model,self);
                            }
                        }else if(high_type == "4"){//校级
                            var school_id=tUserData.fk_school_id;
                            self.school_id=school_id;
                            //年级
                            ajax_post(api_get_grade,{school_id:school_id},self);
                        }
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //年级
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                            //    班级
                            case api_get_class:
                                this.complete_get_class(data);
                                break;
                            //获取学生信息
                            case api_studentlist:
                                this.complete_studentlist(data);
                                break;
                            case api_punish:
                                this.msg=data.data;
                                window.location="#t_lrregularities_violation";
                                break;
                            //详情--数据回显
                            case api_findbyPunishID:
                                this.complete_findbyPunishID(data);
                                break;
                            //修改处分
                            case api_updatepunish:
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                //年级
                complete_get_grade:function(data){
                    this.grade_list=data.data.list;
                },
                //班级
                complete_get_class:function(data){
                    this.class_list=data.data;
                },
                //获取学生信息
                complete_studentlist:function(data){
                    this.stu_list=data.data.list;
                },
                //详情--数据回显
                complete_findbyPunishID:function(data){
                    vm.extend = data.data;
                    vm.files = JSON.parse(data.data.basis);
                    vm.stu_info=data.data.punished_person+pmx.punished_person_num;
                    $("#select2-student_select-container").text(vm.stu_info);
                    vm.is_disabled=true;
                    // console.log(vm.stu_info);
                },
                //
                save_daily2:function(){
                    var self=this;
                    var uploaderWorks = data_center.ctrl("uploader_add_daily");
                    var files = uploaderWorks.get_files();
                    var is_complete=uploaderWorks.is_finished();
                    // console.log(this.stu_info.split('|'));
                    // self.extend.punished_person_id=Number(self.stu_info.split('|')[0]);
                    // self.extend.punished_person=self.stu_info.split('|')[1];
                    // self.extend.punished_person_num =self.stu_info.split('|')[2];
                    self.extend.punish_type=Number(self.extend.punish_type);

                    if(self.extend.punished_person==''){
                        toastr.warning('请选择被处罚人');
                    }else if($.trim(self.extend.punish_time)==''){
                        toastr.warning('请选择处分时间');
                    }else if($.trim(self.extend.punish_name)==''){
                        toastr.warning('请填写处分名称');
                    }else if($.trim(self.extend.punish_type)=='' && self.extend.punish_type!='请选择'){
                        toastr.warning('请选择处分类型');
                    }else if($.trim(self.extend.punish_cause)==''){
                        toastr.warning('请填写处分原由');
                    }else if(is_complete==true){
                        vm.extend.basis = JSON.stringify(files);
                        if(files.length==0) {
                            toastr.warning("请上传事实依据");
                        }else {
                            layer.confirm('确认提交？', {
                                btn: ['确认', '取消'] //按钮
                            }, function() {
                                ajax_post(api_updatepunish,{
                                    basis:vm.extend.basis,
                                    id:Number(self.punish_id),
                                    punish_cause:self.extend.punish_cause,
                                    punish_name:self.extend.punish_name,
                                    punish_time:self.extend.punish_time,
                                    punish_type:self.extend.punish_type
                                },self);
                                layer.closeAll();
                                window.location="#t_lrregularities_violation";
                            });
                        }
                    }
                    else{
                        layer.confirm('确认提交？', {
                            btn: ['确认', '取消'] //按钮
                        }, function() {
                            ajax_post(api_updatepunish,{
                                basis:vm.extend.basis,
                                id:self.punish_id,
                                punish_cause:self.extend.punish_cause,
                                punish_name:self.extend.punish_name,
                                punish_time:self.extend.punish_time,
                                punish_type:self.extend.punish_type
                            },self);
                            layer.closeAll();
                            window.location="#t_lrregularities_violation";
                        });
                    }
                }
            });
            vm.$watch('onReady', function () {
                this.cb();
                this.getType();
                this.getId();
                $(".js-example-basic-single").select2();
                /*有punish_id是修改*/
                if(vm.punish_id){
                    vm.product_modify();
                }
                $(function() {
                    var nowTemp = new Date();
                    var nowDay = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0).valueOf();
                    var nowMoth = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), 1, 0, 0, 0, 0).valueOf();
                    var nowYear = new Date(nowTemp.getFullYear(), 0, 1, 0, 0, 0, 0).valueOf();
                    var $myStart2 = $("#my-datepicker");

                    var checkin = $myStart2.datepicker({
                        onRender: function(date, viewMode) {
                            // 默认 days 视图，与当前日期比较
                            var viewDate = nowDay;

                            switch (viewMode) {
                                // moths 视图，与当前月份比较
                                case 1:
                                    viewDate = nowMoth;
                                    break;
                                // years 视图，与当前年份比较
                                case 2:
                                    viewDate = nowYear;
                                    break;
                            }

                            return date.valueOf() > viewDate ? 'am-disabled' : '';
                        }
                    }).on('changeDate.datepicker.amui', function(event) {
                        vm.extend.punish_time = event.delegateTarget.defaultValue;
                        checkin.close();
                    }).data('amui.datepicker');
                });
                //选择评价项
                $("#student_select").on("change", function (e) {
                    vm.stu_info = $("#student_select").val();
                    var item_arr = vm.stu_info;
                    if (item_arr == 0) {
                        vm.extend.punished_person = '';
                        vm.extend.punished_person_id = '';
                        vm.extend.punished_person_num = '';
                    } else {
                        vm.extend.punished_person_id=Number(vm.stu_info.split('|')[0]);
                        vm.extend.punished_person=vm.stu_info.split('|')[1];
                        vm.extend.punished_person_num =vm.stu_info.split('|')[2];
                    }
                    })
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define,
        }
    });