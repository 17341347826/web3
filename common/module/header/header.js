/**
 * 头部
 * Created by ma weifeng on 2017.04.26.
 */
define([
        C.CLF('avalon.js'),
        "amazeui",
        C.CM("header", "html!"),
        C.CM("header", "css!"),
        C.CMF("data_center.js"),
        C.CB("Growth/menu.js"),
    ],
    function(avalon, amazeui, html, css, data_center,menu_deal) {
        var pdetail = undefined;
        var HTTP_X = location.origin;
        //家长关联子女开始---
        //获取关联的学生集合
        var api_stu_used = api.user + "parent/stu_used";
        //更新guid
        //家长选中操作学生
        var api_selected_student = api.user + "parent/selected_student";
        //家长、用户切换角色--获取登录用户信息
        var api_login_info = api.user + "baseUser/sessionuser.action";
        //家长关联子女结束---

        //退出清除token
        var api_remove_token = api.PCPlayer + "baseUser/exit.action";
        //上传--图片
        var url_api_file=api.api+"file/get";

        //是否有消息
        var api_my_msg = api.api + 'GrowthRecordBag/page_push_my_msg';

        //获取登陆者的所有角色
        var api_my_role = api.user + 'role/find_my_role';
        //用户切换角色
        var api_change_role = api.user + 'user_role/user_switch_role';
        //获取当前登录用户使用的角色菜单
        var api_user_changed_menu = api.user + 'power/find_logon_user_role_power';
        var detail = avalon.component('ms-ele-header', {
            template: html,
            defaults: {
                url_index: "", //跳转登录页面地址
                nick_name: "",
                user_type: 0,
                stus_sel_show: false,
                menu: [],
                local_href: '',
                current_up_pos: 0,
                //用户基础信息接口调用类别：true-用户切换角色调用，false-true的反面
                base_api:false,
                //登陆者信息
                login_info:{},
                //登陆者菜单
                login_menu:[],
                user: undefined,
                //菜单滚动图标显示:1-菜单顶部，未出现下滑；2-菜单滑动一部分；3-菜单底部，滑到底
                menu_icon:1,
                //登录用户为家长
                parentIdet: '',
                //判断是否点击一级菜单
                one_menu_index:'',
                //判断点击二级菜单
                two_menu_index:'',
                //一级菜单名称
                current_menu_title: '',
                //登录者身份
                userType: '',
                highest_level:'',
                //登陆者头像
                login_head:'',
                my_roles:[],
                ///家长-当前操作学生
                stu_check_index:0,
                //家长-当前查看子女
                current_kid:'',
                //家长--获取子女信息集合
                kid_ary:[],
                kid_info:'',//子女在当前数组的序号+姓名
                //消息小红点是否显示:true-显示，false-隐藏
                red_dot:false,
                //三级菜单info
                three_info:function(el2){
                    if(el2 == null || el2 == undefined){

                    }else{
                        var type = el2.content.type[0];
                        if(type == 'expand'){
                            data_center.set_key('three_info', el2);
                            location.href = el2.elements[0].url
                        }else if(type == 'skip'){
                            data_center.set_key('three_info', null);
                            location.href = el2.url;
                        }
                        //回到顶部
                        // $('html,body').animate({scrollTop:0},0);
                        // window.scrollTop(0);
                        // document.body.scrollTop =  0;
                        $(window).scrollTop = -80;
                    }
                },
                //logo跳转首页
                turn_index:function(){
                    window.location=''
                },
                //一级菜单选中
                click_one_menu:function(index){
                    if(this.one_menu_index==index+1){
                        this.one_menu_index='';
                        return;
                    }
                    this.one_menu_index=index+1;
                // 清空之前选中的二级菜单
                    var obj= data_center.get_key('one_tow_menu');
                    if(!obj) return;
                    var pre_one=obj.one_menu_index;
                    if(index!=pre_one){
                        this.two_menu_index=-1;
                    }else{
                        this.two_menu_index=obj.two_menu_index+1;
                    }
                    // var obj2={
                    //     one_menu_index:obj.one_menu_index,
                    //     two_menu_index:-1,
                    // };
                    // data_center.set_key('one_tow_menu',obj2);
                //    回到顶部
                    $('html,body').animate({scrollTop:0},0);
                    $(window).off("scroll");
                    //清除加载提示
                    var loads = $('.ui-loading');
                    if(loads.length>0){
                        $('.ui-loading').remove();
                    }
                },
                //二级菜单点击页面跳转-选中菜单中页面之后
                close_menu: function(title1, title2, func_code,index1,index2) {
                    this.one_menu_index=index1+1;
                    this.two_menu_index=index2+1;
                    //记录登录数--request.js中
                    report(func_code);
                    //title1一级菜单,title2,二级菜单，title3三级菜单
                    var obj = {
                        first_level_menu: title1,
                        two_level_menu: title2,
                    };
                    data_center.set_key('menu_level', obj);
                    //保存二级菜单index，方便三级菜单操作
                    var menu_obj={
                        one_menu_index:index1,
                        two_menu_index:index2,
                    };
                    data_center.set_key('one_tow_menu',menu_obj);
                    //清除之前三级是否选中，清为0
                    data_center.set_key('is_menu_show',0);
                    //回到顶部
                    // $('html,body').animate({scrollTop:0},0);
                    $(window).scrollTop = -80;
                    $(window).off("scroll");
                    //清除加载提示
                    var loads = $('.ui-loading');
                    if(loads.length>0){
                        $('.ui-loading').remove();
                    }
                },
                //一级菜单选中跳转页面
                close_one_menu:function(title1,func_code,index1){
                    report(func_code);
                    //title1一级菜单,title2,二级菜单，title3三级菜单  方便站点地图
                    var obj = {
                        first_level_menu: title1,
                        two_level_menu:'',
                    };
                    data_center.set_key('menu_level', obj);
                    //保存二级菜单index，方便三级菜单操作
                    var menu_obj={
                        one_menu_index:index1,
                        two_menu_index:'',
                    };
                    data_center.set_key('one_tow_menu',menu_obj);
                    //回到顶部
                    $('html,body').animate({scrollTop:0},0);
                    $(window).off("scroll");
                },
                //全屏菜单跳转页面
                close_all_menu: function(title1, title2, func_code) {
                    report(func_code);
                    $("#all-menu-model").modal({
                        closeOnConfirm: true
                    });
                    $('.head-menu').show();
                    if (title1 && title2) {
                        var obj = {
                            first_level_menu: title1,
                            two_level_menu: title2
                        }
                        data_center.set_key('menu_level', obj);
                    }

                },
                //菜单滚动
                menu_scoll:function(type,name){
                    //菜单滚动图标显示:1-菜单顶部，未出现下滑；2-菜单滑动一部分；3-菜单底部，滑到底
                    var menu_icon = this.menu_icon;
                    //每次点击滚动距离
                    var scoll_height = 152;
                    //菜单外层高度
                    var head_menu = $('#head-menu').height();
                    //菜单当前展示内容高度
                    var con_height = $('#head-menu-ch').height();
                    //页面滚动条滑动高度
                    // console.log($(window).scrollTop());
                    // console.log($('#head-menu-ch').scrollTop());---0
                    // //菜单外层高度
                    // console.log($('#head-menu').height());
                    // //菜单所有元素呈现高度
                    // console.log($('#head-menu-ch').height());
                    // //菜单滚动条滑动高度
                    // console.log($('#head-menu').scrollTop());

                    //菜单外层高度-不会变化
                    var menu_height = $('#head-menu').height();
                    if(type == 'bottom' && name == ''){//未滑动
                        $('#head-menu').animate({scrollTop:scoll_height},100);
                        this.menu_icon = 2;
                    }else  if(type == 'bottom' && name == 'middle'){//滑动向下
                        //滚动高度
                        var height = $('#head-menu').scrollTop()+scoll_height;
                        $('#head-menu').animate({scrollTop:height},100);
                        //实际高度
                        var true_height = height+head_menu;
                        if(true_height >= con_height){
                            this.menu_icon = 3;
                        }
                    }else  if(type == 'top' && name == 'middle'){//滑动向上
                        var height = $('#head-menu').scrollTop()-scoll_height;
                        $('#head-menu').animate({scrollTop:height},100);
                        //实际高度
                        // var true_height = height-head_menu;
                        if($('#head-menu').scrollTop() <=152){
                            this.menu_icon = 1;
                        }
                    }else  if(type == 'top' && name == ''){//滑动到底部
                        var height = $('#head-menu').scrollTop()-scoll_height;
                        $('#head-menu').animate({scrollTop:height},100);
                        this.menu_icon = 2;
                    }
                },
                //家长--点击切换按钮出现弹框
                kid_change:function(){
                    //打开弹框
                    $("#changeKid-model").modal({
                        closeOnConfirm: false
                    });
                    //当前查看子女姓名
                    var name = this.current_kid;
                    var list = this.kid_ary;
                },
                //家长--子女切换
                kid_select:function(){

                },
                //家长--保存子女切换结果
                save_kid:function(){
                    var kid_info = this.kid_info.split('|');
                    this.stu_check_index = kid_info[0];
                    sessionStorage.setItem('sel_stu_index', this.stu_check_index);
                    $('#changeKid-model').modal({
                        closeOnConfirm: true
                    });
                    window.location = HTTP_X + '/Growth/index.html';
                },
                user_info:{},
                //判断菜单下滑和上滑是否存在
                menu_icon_event:function(){
                    //菜单外层高度
                    var menu_wc = $('#head-menu').height();
                    //菜单当前展示内容高度
                    var menu_con = $('#head-menu-ch').height();
                    if(menu_wc >= menu_con){
                        this.menu_icon = -1;
                    }
                },
                onReady: function() {
                    var self = this;
                    //==页面刷新时，删除防止重复提交的session记录 ==========================
                    var cmd_agent  = sessionStorage.getItem('cmd_agent');
                    var data_agent = sessionStorage.getItem('data_agent');
                    var time_agent = sessionStorage.getItem('start_time_agent');
                    if (cmd_agent && data_agent && time_agent) {
                        sessionStorage.removeItem('cmd_agent');
                        sessionStorage.removeItem('data_agent');
                        sessionStorage.removeItem('start_time_agent');
                    }
                    //页面刷新保留之前选中的一二级菜单
                    // console.log(data_center.get_key('one_tow_menu'));
                    var arr=data_center.get_key('one_tow_menu');
                    if(arr!=null){
                        var index1=arr.one_menu_index;
                        var index2=arr.two_menu_index;
                        self.one_menu_index=index1+1;
                        self.two_menu_index=index2+1;
                    }
                    //============================
                    data_center.uin(function(data) {
                        //0：管理员；1：教师；2：学生；3：家长
                        var user_type = data.data.user_type;
                        self.userType = data.data.user_type;
                        var highest_level = data.data.highest_level;
                        self.highest_level = data.data.highest_level;
                        var get_stu = JSON.parse(data.data['user']);
                        self.user_info = get_stu;
                        if(get_stu.picture != ''){
                            self.login_head = url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + get_stu.picture;
                        }
                        if (user_type == 0) {
                            //管理员
                            switch (highest_level) {
                                case "0":
                                    self.nick_name = "超级管理员";
                                    break;
                                case "1":
                                    self.nick_name = "省级管理员";
                                    break;
                                case "2":
                                    self.nick_name = "市州管理员";
                                    break;
                                case "3":
                                    self.nick_name = "区县管理员";
                                    break;
                                case "4":
                                    self.nick_name = "学校管理员";
                                    break;
                                default:
                                    break;
                            }
                        } else if (user_type == 1) {
                            //教师
                            switch (highest_level) {
                                case "1":
                                    self.nick_name = "省级领导";
                                    break;
                                case "2":
                                    self.nick_name = "市州级领导";
                                    break;
                                case "3":
                                    self.nick_name = "区县级领导";
                                    break;
                                case "4":
                                    self.nick_name = "学校领导";
                                    break;
                                case "5":
                                    self.nick_name = "年级领导";
                                    break;
                                case "6":
                                    self.nick_name = "教师";
                                    break;
                                default:
                                    break;
                            }

                        } else if (user_type == 2) {
                            self.nick_name = "学生";
                        } else if (user_type == 3) {
                            self.nick_name = "家长";
                            var stu_info = get_stu.student;
                            // var stu_guid = stu_info.guid;
                            // sessionStorage.setItem('stu_guid', stu_guid);
                            //家长关联学生
                            ajax_post(api_stu_used, {parent_num:get_stu.account}, self);
                        }
                        self.parentIdet = data.data.auth;
                        // window.document.title = "学唐云."+self.nick_name+"平台"
                        window.document.title = "眉山市初中学生综合素质评价";
                        // console.log(self.user);
                        // console.log(self.menu);
                        //登陆者信息
                        self.login_info = self.user;
                        //登陆者菜单
                        self.login_menu = self.menu;
                    //    存菜单方便set_desktop操作
                        sessionStorage.setItem('handle_menu',JSON.stringify(self.menu));
                        //获取登陆者所有角色
                        ajax_post(api_my_role,{},self);
                        //监听角色切换
                        $(document).bind("mousedown",function(e){
                            var target  = $(e.target);
                            if(target.closest(".role-out").length == 0){
                                self.role_box_display = false;
                            }
                        })
                    });
                    //判断菜单按钮是否存在
                    self.menu_icon_event();
                    //监控菜单鼠标滚动事件
                    $('#head-menu').scroll(function () {
                        self.menu_icon_event();
                        //菜单外层高度
                        var head_menu = $('#head-menu').height();
                        //菜单当前展示内容高度
                        var con_height = $('#head-menu-ch').height();
                        var height = $('#head-menu').scrollTop();
                        if(height<=0){
                            self.menu_icon = 1;
                        }else if((height+head_menu)<con_height){
                            self.menu_icon = 2;
                        }else if((height+head_menu)>=con_height){
                            self.menu_icon = 3;
                        }
                    });
                //    根据需求暂时屏蔽
                //    导航消息是否存在红点
                //     ajax_post(api_my_msg,{offset:0,rows:9999},self);
                },
                //切换角色框显示隐藏
                role_box_display:false,
                //切换角色鼠标放上去
                role_over:function(){
                    this.role_box_display = !this.role_box_display;
                },
                // //切换角色鼠标移开
                // role_out:function(){
                //     this.role_box_display = false;
                // },
                //用户角色切换
                role_change:function(info){
                    ajax_post(api_change_role,{role_id:info.id},this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                                //    退出
                            case api_remove_token:
                                var token = sessionStorage.getItem("table_params");
                                sessionStorage.removeItem("token");
                                sessionStorage.removeItem("table_params");
                                sessionStorage.removeItem('one_tow_menu');
                                sessionStorage.removeItem("menu_level");
                                sessionStorage.removeItem('three_info');
                                sessionStorage.removeItem('is_menu_show');
                                sessionStorage.removeItem('user_info');
                                sessionStorage.removeItem('menu');
                                sessionStorage.removeItem('login_remark');
                                sessionStorage.removeItem('online_time');
                                sessionStorage.removeItem('handle_menu');
                                sessionStorage.removeItem('set_first_time');
                                //退出登录
                                // window.location = this.url_exit;
                                window.location = HTTP_X + '/Growth/new_index.html';
                                break;
                            //        家长-获取子女信息集合
                            case api_stu_used:
                                this.complete_stu_used(data);
                                break;
                            //家长-选中操作学生
                            case api_selected_student:
                                this.complete_selected_student(data);
                                break;
                            //家长选中操作学生后重新获取家长学生信息
                            case api_login_info:
                                if(this.base_api){
                                    this.complete_changed_login_info(data);
                                }else{
                                    this.complete_login_info(data);
                                }
                                this.base_api = false;
                                break;
                            // 是否存在消息
                            case api_my_msg:
                                if(data.data.count>0){
                                    this.red_dot = true;
                                }else{
                                    this.red_dot = false;
                                }
                                break;
                            // 获取登陆者所有角色
                            case api_my_role:
                               this.complete_my_role(data);
                               break;
                             //用户切换角色
                            case api_change_role:
                                this.complete_change_role(data);
                                break;
                             //用户切换角色菜单
                            case api_user_changed_menu:
                                this.complete_user_changed_menu(data);
                                break;
                        }
                    }else{
                        toastr.error(msg)
                    }
                },
                user_center: function() {
                    var token = sessionStorage.getItem("token");
                    window.location = this.url_index + "?token=" + token;
                },
                //退出
                quit: function() {
                    sessionStorage.removeItem('sel_stu_index');
                    ajax_post(api_remove_token, {}, this);
                },
                //消息中心
                message_center:function () {
                    window.location = "#message_center";
                },
                //账号安全
                update_pwd:function () {
                    // window.location = '#update_password';
                    window.location = '#account_security';
                },
                //个人信息
                person_info:function(){
                    window.location = '#person_center';
                },
            //    家长-子女集合
                complete_stu_used:function(data){
                    this.kid_ary = data.data;
                    //获取选中子女
                    var sel_index = sessionStorage.getItem('sel_stu_index');
                    if (!sel_index || sel_index == 'undefined' || sel_index == undefined) {
                        //默认第一条
                        this.kid_info = '0'+'|'+data.data[0].id+'|'+data.data[0].student_name;
                    }else{
                        this.kid_info = sel_index+'|'+data.data[sel_index].id+'|'+data.data[sel_index].student_name;
                    }
                    // this.sel_student = data.data[sel_index].id + '|' + sel_index;
                    //获取家长选中操作学生
                    var id = this.kid_info.split('|')[1];
                    ajax_post(api_selected_student, { stu_id: id }, this);
                },
            //    家长-选中操作学生
                complete_selected_student:function(data){
                    //重新请求获取家长选中学生信息
                    ajax_post(api_login_info, {}, this);
                },
            //  重新请求获取家长选中学生信息
                complete_login_info:function(data){
                    var user = JSON.parse(data.data.user);
                    this.current_kid = user.student.name;
                    //学生guid
                    var stu_guid = user.student.guid;
                    sessionStorage.setItem('stu_guid', stu_guid);
                    //学生grade_name
                    var grade_name = user.student.grade_name;
                    sessionStorage.setItem('grade_name', grade_name);
                    sessionStorage.setItem('studentInfo',JSON.stringify(user.student));
                    sessionStorage.setItem('user_info',JSON.stringify(data));
                },
                //获取登陆者所有角色
                complete_my_role:function(data){
                    this.my_roles = data.data.list;
                },
                //用户切换角色
                complete_change_role:function(data){
                    //第一步调用基本信息
                    this.base_api = true;
                    sessionStorage.removeItem('user_info');
                    ajax_post(api_login_info, {}, this);
                    //第二步调用菜单
                    ajax_post(api_user_changed_menu,{},this);
                },
                //用户基础信息-用户切换
                complete_changed_login_info:function(data){
                    var user = data.data.user;
                    this.user_type = data.data.user_type;
                    this.highest_level = data.data.highest_level;
                    this.user_info = JSON.parse(data.data['user']);
                    this.login_info = JSON.parse(data.data['user']);
                    sessionStorage.setItem('user_info',JSON.stringify(data));
                },
                //用户切换角色菜单
                complete_user_changed_menu:function(data){
                    sessionStorage.setItem('menu',JSON.stringify(data.data));
                    // this.menu = menu_deal.menu(this.user_type);
                    // this.login_menu = this.menu;
                    // sessionStorage.setItem('handle_menu',JSON.stringify(this.menu));
                    window.location = location.origin + '/Growth/index.html#';
                    location.reload();

                },
                click_help:function () {
                    window.location = "#common_problem";
                }
            }
        })
    });