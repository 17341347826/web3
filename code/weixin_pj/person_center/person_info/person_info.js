/**
 * Created by Administrator on 2018/8/3.
 */
define([C.CLF('avalon.js'),"jquery",
        C.Co('weixin_pj', 'person_center/person_info/darkroom','css!'),
        C.Co('weixin_pj', 'person_center/person_info/person_info','css!'),
        C.Co('weixin_pj', 'person_center/person_info/person_info','html!'),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CMF("formatUtil.js"),C.CM("tuploader"), "jquery-weui",C.CM("bottom_tab")
    ],
    function(avalon,$,css1,css2,html, x, data_center, formatUtil,tuploader,weui,tb) {
        //修改姓名
        var api_update_name = api.user+'baseUser/upd_name';
        //上传
        var url_api_file=api.api+"file/get";
        //头像图片保存中转站
        var api_uploader_base = api.api+"file/uploader_base64";
        //用户修改头像
        var api_update_head = api.user+'baseUser/upd_picture';
        //获取登录用户信息
        var api_login_info = api.user+'baseUser/sessionuser.action';
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "person_info",
                //登陆者姓名
                user_name:'',
                //登陆者身份判断:1：教师；2：学生；3：家长
                ident_type:'',
                //学生个人信息
                stu: {},
                url_img: url_img,
                user_photo: cloud.user_photo,
                //学生guid
                stu_guid:'',
                //学生个人基本信息按钮：1查看 2编辑 3保存
                status:1,
                get_photos:"",
                photos:"",
                //登陆者usertype:0：管理员；1：教师；2：学生；3：家长
                userType:"",
                flag:true,
                up:"",
                user_id:"",
                token:"",
                //头像图片
                head_photos:'',
                //登陆者基本信息
                use_info:{},
                cds:function(){
                    var self = this;
                    const token  = sessionStorage.getItem('token');
                    if(!token){
                        window.location = prefix_base + 'Growth/wx_pj.html';
                    }
                    data_center.uin(function(data){
                        //0：管理员；1：教师；2：学生；3：家长
                        var user_type = data.data.user_type;
                        //user_type='1' 时才有值。1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level = data.data.highest_level;
                        //身份:1：教师；2：学生；3：家长;4:市；5：区县；6：校
                        if(highest_level == 2){//市管理员和市领导
                            self.ident_type = 4;
                        }else if(highest_level == 3){//区县管理员和区县领导
                            self.ident_type = 5;
                        }else if(highest_level == 4){//校管理员和校领导
                            self.ident_type = 6;
                        }else if((highest_level == 5 || highest_level == 6) && user_type == 1){//教师
                            self.ident_type = 1;
                        }else if(user_type == 2){//学生
                            self.ident_type = 2;
                        }else if(user_type == 3){//家长
                            self.ident_type = 3;
                        }
                        var user = JSON.parse(data.data.user);
                        self.use_info = user;
                        self.user_name = user.name;
                        self.userType = data.data.user_type;
                        self.token = sessionStorage.getItem("token");
                        if(user.picture != ''){
                            self.head_photos = url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + user.picture;
                            console.log(self.head_photos);
                        }
                        if(user_type == '2'){//学生
                            var guid = user.guid;
                            self.stu_guid = user.guid;
                        }
                        //初始化头像
                        self.up = tuploader.init("report",self.token,
                            function(up, file, status){
                                var data=tuploader.result();
                                if(status == "success"){
                                    ajax_post(api_update_head,{picture:data[0].inner_name},self)
                                }
                            });
                    });
                },
                //姓名修改
                name_up:function(){
                    var value = this.user_name;
                    var self = this;
                    // layer.prompt({title: '请输入姓名',value:value, formType: 2}, function(text, index){
                    //     layer.close(index);
                    //     ajax_post(api_update_name,{name:text},self);
                    // });
                    $.prompt({
                        title: '修改姓名',
                        // input: '请输入姓名',
                        input: value,
                        empty: false, // 是否允许为空
                        onOK: function (input) {
                           ajax_post(api_update_name,{name:input},self);
                           self.user_name = input;
                        },
                        onCancel: function () {
                            //点击取消
                        }
                    });
                },
                //密码设置
                pwd_turn:function(){
                    window.location = '#update_pwd';
                },
                //帮助与反馈
                help_turn:function(){
                    window.location = '#hot_issues';
                },
                //关于
                about_turn:function(){
                    window.location = '#about_uptang';
                },
                //学生个人资料
                stu_data:function(){
                    window.location = '#stu_person_data';
                },
                //手机号修改
                phone_turn:function(){
                    window.location = '#binding_phone';
                },
                //退出当前账号
                sign_out:function(){
                    $.confirm({
                        title: '提示',
                        text: '是否确认退出当前账号',
                        onOK: function () { //点击确认
                            window.location = prefix_base + 'Growth/wx_pj.html';
                            sessionStorage.clear()
                        },
                        onCancel: function () {
                        }
                    });
                },
                //上传图片路径
                head_src:'',
                img_src:'',
                up:'',
                //头像
                file_change_head:function () {
                    this.img_src = '';
                    var get_chooseImage = document.getElementById('chooseImage-head');
                    var imgFile = get_chooseImage.files[0];
                    var filePath = $("#chooseImage-head").val(),
                        fileFormat = filePath.substring(filePath.lastIndexOf(".")).toLowerCase(),
                        src = window.URL.createObjectURL(imgFile); //转成可以在本地预览的格式
                    // 检查是否是图片
                    if( !fileFormat.match(/.png|.jpg|.jpeg/) ) {
                        $.alert('上传错误,文件格式必须为：png/jpg/jpeg');
                        return;
                    }
                    this.img_src = src;
                    var dkrm = new Darkroom('#target-head', {
                        // Size options
                        // minWidth: 100,
                        // minHeight: 100,
                        // maxWidth: 540,
                        // maxHeight: 300,
                        // ratio: 4/3,
                        // backgroundColor: '#000',
                        minWidth: 260,
                        minHeight: 160,
                        maxWidth: 540,
                        maxHeight: 300,
                        ratio: 260/160,
                        backgroundColor: '#000',

                        // Plugins options
                        plugins: {
                            //save: false,
                            crop: {
                                quickCropKey: 67, //key "c"
                                //minHeight: 50,
                                //minWidth: 50,
                                //ratio: 4/3
                            }
                        },

                        // Post initialize script
                        initialize: function() {
                            var cropPlugin = this.plugins['crop'];
                            // cropPlugin.selectZone(170, 25, 300, 300);
                            cropPlugin.requireFocus();
                        }
                    });
                    var obj = $("#content-head > div > section > div > figure > img");
                    var src = obj.attr("src");
                    if(src == undefined){
                        return;
                    }else{
                        //上传头像
                        ajax_post(api_uploader_base,{file:src},this);
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //    修改姓名
                            case api_update_name:
                                this.complete_update_name(data);
                                break;
                            //图片中转站
                            case api_uploader_base:
                                this.complete_uploader_base(data);
                                break;
                            // 上传头像
                            case api_update_head:
                                this.complete_update_head(data);
                                break;
                            //登录用户信息
                            case api_login_info:
                                this.complete_login_info(data);
                                break;
                        }
                    } else {
                        $.alert(msg);
                    }
                },
                //修改姓名
                complete_update_name:function(data){
                    $.alert('姓名修改成功');
                },
                //图片中转站
                complete_uploader_base:function(data){
                    //上传头像
                    ajax_post(api_update_head,{picture:data.data.inner_name},this);
                },
                //上传头像
                complete_update_head:function(data){
                    this.img_src = '';
                    //登录用户信息
                    ajax_post(api_login_info,{},this);
                },
                //登录用户信息
                complete_login_info:function(data){
                    var user = JSON.parse(data.data.user);
                    this.head_src = url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + user.picture;
                    sessionStorage.setItem('user_info',JSON.stringify(data));
                    location.reload();
                },
            });
            // //监听图片变化
            // vm.$watch('use_info',function(){
            //
            // });
            vm.$watch('onReady',function(){
                vm.cds();
            });
            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    })