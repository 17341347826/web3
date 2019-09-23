/**
 * Created by Administrator on 2018/9/18.
 */
define([
        C.CLF('avalon.js'),"jquery","layer","select2",
        C.Co("user","club_activity_add/club_activity_add","css!"),
        C.Co("user","club_activity_add/club_activity_add","html!"),
        C.CM("table"),
        C.CMF("data_center.js")],
    function (avalon,$,layer,select2,css, html, tab, data_center) {
        //获取教师用户列表
        var api_teach_list = api.user + 'baseUser/teacherlist.action';
        //新增社团
        var api_add_community=api.growth+'communityManagement_addCommunity';
        //修改社团
        var api_uptade_community=api.growth+'communityManagement_updateCommunity';
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "club_activity_add",
                //负责人列表
                charge_list:[],
                //负责人信息
                charge_info:'',
                //指导老师
                guide_teach:[],
                guide_info:[],
                //增加、修改
                compileData: {
                    id:'',
                    //社团名字
                    communityName:'',
                    //社团人数
                    communityNum:'',
                    //社团类型
                    communityType:'',
                    //指导教师id:1，2，3
                    fk_zdjs_id:'',
                    //指导教师
                    instructor:'',
                    //负责人id
                    fk_fzr_id:'',
                    //负责人
                    managementPerson:'',
                    //男女比例
                    proportion:'',
                    //联系方式
                    tel:'',
                    //备注
                    remark: "",
                    //社团简介
                    stjj:'',
                },
                //社团类型
                club_type:[
                    {id:1,type_name:'休闲'},
                    {id:2,type_name:'艺术'},
                    {id:3,type_name:'体育'},
                    {id:4,type_name:'新闻'},
                    {id:5,type_name:'科技'},
                    {id:6,type_name:'公益'},
                    {id:7,type_name:'学习'}
                ],
                //联系方式状态
                phone_type:false,
                //男女比例状态
                proportion_type:true,
                //错误提示
                bad_msg:'',
                init:function(){
                    this.cd();
                    // layer.alert('请先选择负责人在选择指导老师', {
                    //     closeBtn: 0
                    //     ,anim: 4 //动画类型
                    // });
                },
                cd:function(){
                    var self = this;
                    data_center.uin(function (data) {
                        var tUser = JSON.parse(data.data.user);
                        var school_id = tUser.fk_school_id;
                    //    获取教师列表
                        ajax_post(api_teach_list,{fk_school_id:school_id},self);

                    });
                },
                //负责人切换--得出指导教师列表(抽取已选数据)
                charge_change:function(){
                    if(this.charge_info == ''){
                        this.guide_teach = [];
                        this.compileData.fk_fzr_id = '';
                        this.compileData.managementPerson = '';
                        return;
                    }
                    var info = this.charge_info.split('|');
                    var id = info[0];
                    this.compileData.fk_fzr_id = info[0];
                    this.compileData.managementPerson = info[1];
                    this.guide_teach = this.extract_arr(this.charge_list,'guid',id,false);
                    // console.log(this.guide_teach);
                },
                //抽取数据
                extract_arr:function(arr,name,e_name,e_type){//arr-抽取数组，name-抽取字段名称，e_name--抽取值，e_type:true--抽取值为e_name的值，false--抽取除e_name值外的
                    var ary = [];
                    if(e_type){
                        for(let i=0;i<arr.length;i++){
                            if(e_name == arr[i][name]){
                                ary.push(arr[i]);
                            }
                        }
                        return ary;
                    }
                    for(let i=0;i<arr.length;i++){
                        if(e_name != arr[i][name]){
                            ary.push(arr[i]);
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
                //男女比例校验
                proportion_check:function(){
                    var self = this;
                    var _txt = $('#proportion').val();
                    var pro  = _txt.search(":") != -1;
                    var num1 = parseFloat(_txt.split(':')[0]);
                    var num2 = parseFloat(_txt.split(':')[1]);
                    //社团人数
                    var club_num = self.compileData.communityNum;
                    if(club_num == '' || club_num%1 != 0){
                        self.bad_msg  = "请输入正确的社团人数";
                        self.proportion_type = false;
                    }
                    //是否含有英文':'，男女比例单个数字矫正
                    if(!pro){
                        self.bad_msg  = "请输入'1:2'这种类型的男女比例";
                        self.proportion_type = false;
                        return;
                    }
                    if(num1 % 1 !=0 || num2 % 1 != 0 || (club_num % (num1 + num2) != 0)){
                        self.bad_msg  = "社团人数与男女比例不匹配";
                        self.proportion_type = false;
                        return;
                    }
                    self.bad_msg  = '';
                    self.proportion_type = true;
                },
                //取消
                back:function(){
                    window.location = '#club_activity_list';
                },
                //提交
                add_club: function () {
                    var self=this;
                    //社团人数:>0并且为整数
                    var num=false;
                    if(self.compileData.communityNum>0 && Number(self.compileData.communityNum)==parseFloat(self.compileData.communityNum)){
                        num=true;
                    }
                    // //男女比例
                    // var pro=self.compileData.proportion.search(":") != -1
                    if (self.compileData.communityName != "" &&
                        num==true &&
                        self.compileData.communityType != "" &&
                        self.compileData.instructor != "" &&
                        self.compileData.managementPerson != "" &&
                        self.proportion_type== true &&
                        self.phone_type==true) {
                        if(JSON.stringify(pmx) == '{}'){
                            ajax_post(api_add_community, self.compileData.$model, self);
                        }else{
                            ajax_post(api_uptade_community,self.compileData.$model,self);
                        }
                    } else {
                        if(self.compileData.communityName == ""){
                            self.bad_msg  = "请输入社团名称";
                        }else if( self.compileData.managementPerson==''){
                            self.bad_msg  = "请输入负责人";
                        }else if(self.phone_type==false){
                            self.bad_msg  = "请输入正确的联系方式";
                        }else if(self.compileData.instructor==''){
                            self.bad_msg  = "请输入指导老师";
                        }else if(num==false){
                            self.bad_msg  = "请输入正确的社团人数";
                        }else if(self.proportion_type == false){
                            self.bad_msg  = "社团人数与男女比例不匹配";
                        }else if( self.compileData.communityType==''){
                            self.bad_msg  = "请输入社团类型";
                        }
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //        教师列表
                            case api_teach_list:
                                this.complete_teacher_list(data);
                                break;
                            //新增
                            case api_add_community:
                                window.location = '#club_activity_list';
                                break;
                            //        修改
                            case api_uptade_community:
                                window.location = '#club_activity_list';
                                break;
                        }
                    } else {
                        toastr.error('操作失败');
                    }
                },
                //    教师列表
                complete_teacher_list:function (data) {
                    var self = this;
                    this.charge_list = data.data.list;
                    if(JSON.stringify(pmx) == '{}')
                        return;
                    //修改数据回显
                    var info = JSON.parse(pmx.club_info);
                    // 社团名字
                    self.compileData.communityName    = info.communityName;
                    //社团人数
                    self.compileData.communityNum     = info.communityNum;
                    //社团类型
                    self.compileData.communityType    = info.communityType;
                    //负责人id
                    self.compileData.fk_fzr_id         = info.fk_fzr_id;
                    //负责人
                    self.compileData.managementPerson = info.managementPerson;
                    //男女比例
                    self.compileData.proportion       = info.proportion;
                    //联系方式
                    self.compileData.tel              = info.tel;
                    //备注
                    self.compileData.remark           = info.remark;
                    //信息id
                    self.compileData.id               = info.id;
                    //联系人电话号码
                    self.phone_type = true;
                    // 指导老师id
                    self.compileData.fk_zdjs_id       = info.fk_zdjs_id;
                    // 指导老师
                    self.compileData.instructor       = info.instructor;
                    //回显负责人
                    self.charge_info = self.compileData.fk_fzr_id + '|' + self.compileData.managementPerson;
                    //回显指导老师
                    self.guide_teach = self.extract_arr(this.charge_list,'guid', self.compileData.fk_fzr_id,false);
                    var list = self.guide_teach;
                    var ary =  self.compileData.fk_zdjs_id.split(',');
                    var t_ary = [];
                    for(var i=0;i<ary.length;i++){
                        for(var j=0;j<list.length;j++){
                            if(ary[i] == list[j].guid){
                                var per = list[j].guid + '|' + list[j].name;
                                t_ary.push(per);
                                break;
                            }
                        }
                    }
                    self.guide_info = t_ary;
                    $('.js-example-basic-single').select2();
                },
            });
            vm.$watch("onReady", function () {
                vm.init();
                // $('.js-example-basic-single').select2();
                $("#guide-teach").select2({
                    placeholder: "请选中指导老师",
                    multiple : true,
                    tags : true,
                });
                $("#par").click(function() {
                   if(vm.charge_info == ''){
                       layer.alert('请先选择负责人在选择指导老师', {
                           closeBtn: 0
                           ,anim: 4 //动画类型
                       });
                   }
                });
                $("#guide-teach").on("change", function (e) {
                    var ary = $("#guide-teach").val();
                    var str_id  = '';
                    var str_name = '';
                    for(var i=0;i<ary.length;i++){
                        var info = ary[i].split('|');
                        if(i == ary.length-1){
                            str_id = str_id + info[0];
                            str_name = str_name + info[1];
                        }else{
                            str_id = str_id + info[0] + ',';
                            str_name = str_name + info[1] + ',';
                        }
                    }
                    vm.compileData.fk_zdjs_id = str_id;
                    vm.compileData.instructor = str_name;

                });
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
