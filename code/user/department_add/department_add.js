/**
 * Created by Administrator on 2018/8/23.
 */
define(["jquery",C.CLF('avalon.js'),'layer',"select2",
        C.Co("user","department_add/department_add","css!"),
        C.Co("user","department_add/department_add","html!"),
        C.CMF("router.js"),C.CMF("data_center.js"),C.CM('three_menu_module')
    ],
    function($,avalon,layer,select2,css, html, x, data_center,three_menu_module) {
        //获取可选择的教师集合--部门人
        var api_get_teacher = api.user+'teacher/chooseteacher.action';
        //新增单位部门
        var api_save_office = api.user + 'office/save';
        //教师编号取第一位
        avalon.filters.first_num = function(str){
            return str.substr(0,1);
        };
        //教师编号取第一位
        avalon.filters.last_num = function(str){
            return str.substr(-2);
        };
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "department_add",
                //状态：新增-1，修改-2
                office_type:'',
                //身份判断
                highest_level:"",
                //请求参数
                extend:{
                    //部门id	--修改时必填
                    id:'',
                    //部门负责人id
                    leader_id:'',
                    //成员id	---array<number>是教师id，不是guid
                    member_arr:[],
                    //部门名称
                    o_name:'',
                },
                //部门负责人
                charge_ary:[],
                //负责人绑定数据
                charge_echo:"",
                //部门成员
                depar_memeber:[],
                //部门成员绑定数据
                mem_echo:'',
                //已添加成员数据
                member_ary:[],
                cb:function() {
                    var self = this;
                    data_center.uin(function(data) {
                        //状态
                        self.office_type = pmx.type;
                        //user_type='1' 时才有值。1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        self.highest_level = data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        var id = tUserData.fk_school_id;
                        //获取部门成员集合
                        ajax_post(api_get_teacher,{fk_school_id:id},self);
                    });
                },
                //成员添加
                // add_member:function(){
                //     //获取添加成员selectk框选中数据
                //     var list =  $("#member_select").val();
                //     console.log(list);
                //     var new_list = [];
                //     for(var i=0;i<list.length;i++){
                //         var obj = {};
                //         obj.teacher_name = list[i].split('|')[0];
                //         obj.id = list[i].split('|')[1];
                //         obj.teacher_num = list[i].split('|')[2];
                //         new_list.push(obj);
                //     }
                //     this.member_ary = new_list;
                // },
                //取消
                back:function(){
                    window.location = '#department_manage';
                },
                //保存
                save_data:function(){
                    //添加部门成员信息
                    var list = this.member_ary;
                    if(this.extend.o_name == ''){
                        toastr.warning('请输入部门名称');
                    }else if(this.extend.leader_id == '' || this.extend.leader_id == undefined){
                        toastr.warning('请选择部门负责人');
                    }else if(list.length == 0){
                        toastr.warning('请选择部门成员');
                    }else{
                        var member_arr = [];
                        for(var i=0;i<list.length;i++){
                            member_arr.push(Number(list[i].id))
                        }
                        this.extend.member_arr = member_arr;
                        ajax_post(api_save_office,this.extend.$model,this);
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            // 获取部门成员集合
                            case api_get_teacher:
                                this.complete_get_teacher(data);
                                break;
                            //添加部门
                            case api_save_office:
                                toastr.success('添加成功！');
                                window.location='#department_manage';
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //获取部门成员集合
                complete_get_teacher:function (data) {
                    this.charge_ary = data.data;
                    if(pmx.type == 2){
                        //    数据回显
                        var el = JSON.parse(pmx.el);
                        // console.log(el);
                        this.extend.id = el.id;
                        this.extend.o_name = el.o_name;
                        var charge_val = el.leader.teacher_name+'|'+el.leader.teacher_id;
                        //部门负责人
                        this.charge_echo = charge_val;
                        this.extend.leader_id = el.leader.teacher_id;
                        // $("#tea-charge").select2("val", val);
                        // $("#tea-charge").text(charge_val);
                        // $("#tea-charge").val(charge_val);
                        // $("#tea-charge").val(charge_val).trigger("change");
                        // console.log($("#tea-charge").val());
                    //    部门成员赋值
                        var leader_id = el.leader.teacher_id;
                        var list = this.charge_ary;
                        var new_list = [];
                        for(var i=0;i<list.length;i++){
                            var id = list[i].id;
                            if(id != leader_id){
                                new_list.push(list[i]);
                            }
                        }
                        this.depar_memeber = new_list;
                        var members = el.members;
                        var mem_list = [];
                        for(var i=0;i<members.length;i++){
                            var a = members[i].teacher_name+'|'+members[i].teacher_id+'|'+members[i].teacher_num;
                            mem_list.push(a);
                        }
                        this.mem_echo = mem_list;

                        var up_list = [];
                        for(var i=0;i<mem_list.length;i++){
                            var obj = {};
                            obj.teacher_name = mem_list[i].split('|')[0];
                            obj.id = mem_list[i].split('|')[1];
                            obj.teacher_num = mem_list[i].split('|')[2];
                            up_list.push(obj);
                        }
                        this.member_ary = up_list;
                    }
                },
            });
            vm.$watch('onReady', function() {
                this.cb();
                //模糊查询
                //部门负责人
                $('#tea-charge').select2();
                $("#member_select").select2({
                    placeholder : '请选择部门成员',
                    multiple : true,
                });
                //部门负责人
                $("#tea-charge").on("change", function (e) {
                    var charge_info = $("#tea-charge").val();
                    if(charge_info == ''){
                        vm.extend.leader_id = '';
                        toastr.warning('请选择部门负责人');
                        return;
                    }
                    vm.extend.leader_id = Number(charge_info.split('|')[1]);
                    var leader_id = charge_info.split('|')[1];
                    var list = vm.charge_ary;
                    var new_list = [];
                    for(var i=0;i<list.length;i++){
                        var id = list[i].id;
                        if(id != leader_id){
                            new_list.push(list[i]);
                        }
                    }
                    vm.depar_memeber = new_list;
                });
                //部门成员添加框获取焦点事件
                $(".select2-search__field").on("focus", function(){
                    if(vm.depar_memeber.length == 0){
                        layer.alert('请先选择部门负责人', {
                           closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                    }
                });
                $("#member_select").on("change", function (e) {
                    //获取添加成员selectk框选中数据
                    var list =  $("#member_select").val();
                    // console.log(list);
                    var new_list = [];
                    for(var i=0;i<list.length;i++){
                        var obj = {};
                        obj.teacher_name = list[i].split('|')[0];
                        obj.id = list[i].split('|')[1];
                        obj.teacher_num = list[i].split('|')[2];
                        new_list.push(obj);
                    }
                    vm.member_ary = new_list;
                    // console.log( vm.member_ary);
                });
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
