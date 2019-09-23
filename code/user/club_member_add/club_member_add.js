/**
 * Created by Administrator on 2018/9/19.
 */
define([
        C.CLF('avalon.js'),"jquery","layer","select2",
        C.Co("user","club_member_add/club_member_add","css!"),
        C.Co("user","club_member_add/club_member_add","html!"),
        C.CM("table"),
        C.CMF("data_center.js")],
    function (avalon,$,layer,select2,css, html, tab, data_center) {
        //年级班级集合--校领导
        var api_grade_class = api.user + 'class/school_class.action';
        //获取班级当前可用学生
        var api_class_stu = api.user + 'student/class_used_stu';
        //修改社团
        var api_uptade_member = api.growth + 'update_community_member';
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "club_member_add",
                //年级
                grade_list:[],
                grade_info:'',
                //班级
                class_list:[],
                class_info:'',
                //学生
                stu_list:[],
                stu_info:'',
                //增加、修改
                compileData: {
                    //班级名称
                    bjmc:'',
                    //班级id:'
                    fk_bj_id:'',
                    //年级id:'
                    fk_nj_id:'',
                    //社团id:'
                    fk_st_id:'',
                    //学生id:'
                    fk_xs_id:'',
                    //学校id:'
                    fk_xx_id:''	,
                    id:'',
                    //联系方式:'
                    lxfs	:'',
                    //年级名称:'
                    njmc	:'',
                    //qq:'
                    qq	:'',
                    //社团名称:'
                    stmc	:'',
                    //性别:'
                    xb	:'',
                    //学籍号:'
                    xjh	:'',
                    //学生姓名:'
                    xsxm	:'',
                    //学校名称:'
                    xxmc	:'',
                },
                //联系方式状态
                phone_type:true,
                //qq
                qq_type:true,
                //错误提示
                bad_msg:'',
                init:function(){
                    //修改数据回显(学生列表还有)
                    var info = JSON.parse(pmx.info);
                    // //班级名称
                    // this.compileData.bjmc     = info.bjmc;
                    // //班级id
                    // this.compileData.fk_bj_id = info.fk_bj_id;
                    // //年级名称
                    // this.compileData.njmc     = info.njmc;
                    // //年级id
                    // this.compileData.fk_nj_id = info.fk_nj_id;
                    //社团名称
                    this.compileData.stmc     = info.stmc;
                    //社团id
                    this.compileData.fk_st_id = info.fk_st_id;
                    //学生id
                    this.compileData.fk_xs_id = info.fk_xs_id;
                    //学校id
                    this.compileData.fk_xx_id = info.fk_xx_id;
                    //id
                    this.compileData.id       = info.id;
                    //联系方式
                    this.compileData.lxfs     = info.lxfs;
                    //qq
                    this.compileData.qq       = info.qq;
                    //性别
                    this.compileData.xb       = info.xb;
                    //学校名称
                    this.compileData.xxmc     = info.xxmc;
                    this.cd();
                },
                cd:function(){
                    var self = this;
                    data_center.uin(function (data) {
                        var tUser = JSON.parse(data.data.user);
                        var highest_level = data.data.highest_level;
                        var school_id = tUser.fk_school_id;
                        if(highest_level == 4){//校领导
                            // //   年级班级
                            // ajax_post(api_grade_class,{school_id:school_id},self);
                        }else if(highest_level == 5 || highest_level == 6){//教师
                        //     var list = tUser.lead_class_list;
                        //     list = list.concat(tUser.teach_class_list);
                        //     self.grade_list = self.aryobj_deweighting(list,'grade_id');
                        //     self.class_list = self.grade_list[0].class_list;
                        //     var class_id = self.class_list[0].class_id;
                        // //    获取学生
                        //     ajax_post(api_class_stu,{fk_class_id:class_id},self);
                        }
                        //   年级班级
                        ajax_post(api_grade_class,{school_id:school_id},self);
                    });
                },
                //数组对象去重: 利用对象访问属性的方法，判断对象中是否存在key
                aryobj_deweighting:function(arr,name){
                    var ary = [];
                    var obj = {};
                    for(var i=0;i<arr.length;i++){
                        if(!obj[arr[i].key]){
                            ary.push(arr[i]);
                            obj[arr[i].key] = true;
                        }
                    }
                    return ary;
                },
                //联系方式
                phone_check: function() {
                    var self = this;
                    var reg = /^((1(3|4|5|7|8)\d{9}))$/;
                    var _txt = $("#phone").val();
                    if (reg.test(_txt)) {
                        self.phone_type = true;
                        self.bad_msg = "";
                    } else {
                        self.phone_type = false;
                        self.bad_msg  = "请输入正确的联系方式";
                    }
                },
                //qq验证
                qq_check:function(){
                    var self = this;
                    var reg = /^[1-9][0-9]{4,14}$/;
                    var _txt = $('#check-qq').val();
                    if (reg.test(_txt)) {
                        self.qq_type = true;
                        self.bad_msg = "";
                    } else {
                        self.qq_type = false;
                        self.bad_msg  = "请输入正确的qq";
                    }
                },
                //年级改变
                grade_change:function(){
                    var id = this.grade_info.split('|')[0];
                    this.compileData.njmc = this.grade_info.split('|')[1];
                    this.compileData.fk_nj_id = id;
                    var list = this.grade_list;
                    for(var i=0;i<list.length;i++){
                        if(id == list[i].grade_id){
                            this.class_list = list[i].class_list;
                            this.compileData.bjmc = this.class_list[0].class_name;
                            this.compileData.fk_bj_id = this.class_list[0].class_id;
                            this.class_info =  this.compileData.bjmc + '|' +  this.compileData.fk_bj_id;
                        }
                    }
                    //    获取学生
                    ajax_post(api_class_stu,{fk_class_id: this.compileData.fk_bj_id},this);
                },
                //班级改变
                class_change:function(){
                    this.compileData.bjmc = this.class_info.split('|')[1];
                    this.compileData.fk_bj_id = this.class_info.split('|')[0];
                    //    获取学生
                    ajax_post(api_class_stu,{fk_class_id: this.compileData.fk_bj_id},this);
                },
                //取消
                back:function(){
                    window.location = '#club_member_list';
                },
                //提交
                add_club: function () {
                    if(this.compileData.njmc != '' && this.compileData.bjmc != '' && this.stu_info != '' &&
                    this.compileData.xb != '' && this.compileData.lxfs != '' && this.compileData.qq != '' &&
                    this.phone_type == true && this.qq_type == true){
                        ajax_post(api_uptade_member,this.compileData.$model,this);
                    }else{
                        if(this.compileData.lxfs == ''){
                            this.bad_msg  = "请输入正确的联系方式";
                        }else if(this.compileData.qq == ''){
                            this.bad_msg  = "请输入正确的qq";
                        }
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //年级班级
                            case api_grade_class:
                                this.complete_grade_class(data);
                                break;
                            //    学生
                            case api_class_stu:
                                this.complete_class_stu(data);
                                break;
                            // 修改
                            case api_uptade_member:
                                window.location = '#club_member_list';
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //年级班级
                complete_grade_class:function(data){
                    this.grade_list = data.data;
                    this.class_list = this.grade_list[0].class_list;
                    // var class_id = this.class_list[0].class_id;
                    //修改数据回显(init还有)
                    var info = JSON.parse(pmx.info);
                    //班级名称
                    this.compileData.bjmc     = info.bjmc;
                    //班级id
                    this.compileData.fk_bj_id = info.fk_bj_id;
                    //年级名称
                    this.compileData.njmc     = info.njmc;
                    //年级id
                    this.compileData.fk_nj_id = info.fk_nj_id;
                    this.grade_info = this.compileData.fk_nj_id + '|' + this.compileData.njmc;
                    this.class_info = this.compileData.fk_bj_id + '|' + this.compileData.bjmc + '班';
                    //    获取学生
                    ajax_post(api_class_stu,{fk_class_id:this.compileData.fk_bj_id},this);
                },
            //    学生
                complete_class_stu:function(data){
                    this.stu_list = data.data.list;
                    //修改数据回显(init还有)
                    var info = JSON.parse(pmx.info);
                    if(this.compileData.fk_nj_id != info.fk_nj_id || this.compileData.fk_bj_id != info.fk_bj_id){//年级班级改变
                        //学籍号
                        this.compileData.xjh  =  this.stu_list[0].code;
                        //学生姓名
                        this.compileData.xsxm =  this.stu_list[0].name;
                        this.compileData.fk_xs_id =  this.stu_list[0].guid;
                    }else{
                        //学籍号
                        this.compileData.xjh  = info.xjh;
                        //学生姓名
                        this.compileData.xsxm = info.xsxm;
                        //学生id
                        this.compileData.fk_xs_id = info.fk_xs_id;
                    }
                    var stu_info = this.compileData.xjh+'|'+this.compileData.xsxm+'|'+this.compileData.fk_xs_id;
                    this.stu_info = stu_info;
                    $('.js-example-basic-single').select2();
                },
            });
            vm.$watch("onReady", function () {
                vm.init();
                // $('.js-example-basic-single').select2();
                $("#stu-name").select2({
                    placeholder: "请选择学生",
                });

                $("#stu-name").on("change", function (e) {
                    var ary = $("#stu-name").val();
                    var info = ary.split('|');
                    //学籍号
                    vm.compileData.xjh  = info[0];
                    //学生姓名
                    vm.compileData.xsxm = info[1];
                    //学生id
                    vm.compileData.fk_xs_id = info[2];
                //    获取学生性别
                    var list = vm.stu_list;
                    for(var i=0;i<list.length;i++){
                        var code = list[i].code;
                        if(vm.compileData.xjh == code){
                            vm.compileData.xb = list[i].sex;
                        }
                    }
                });
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
