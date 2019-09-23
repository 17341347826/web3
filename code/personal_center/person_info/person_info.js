/**
 * Created by Administrator on 2018/7/6.
 */
define([C.CLF('avalon.js'),"jquery",
        C.Co("personal_center","person_info/darkroom",'css!'),
        C.Co("personal_center","person_info/person_info",'css!'),
        C.Co("personal_center","person_info/person_info",'html!'),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "layer", C.CMF("formatUtil.js"),C.CM("tuploader"),C.CM("picture_cutting")
    ],
    function(avalon,$,css1,css2,html, x, data_center, layer,formatUtil,tuploader,pictureCutting) {
        //修改姓名
        var api_update_name = api.user+'baseUser/upd_name';
        //学生基本信息
        var api_get_data = api.user+"student/stu_info";
        //查询签字
        var api_query_sign = api.api+"GrowthRecordBag/query_sign_byguid";
        //修改学生信息
        var api_update= api.user+"student/upd_stu_info";
        //查询照片
        var appoint_student_user = api.user+"baseUser/get_appoint_student_user.action";
        //更改学生照片
        var photo=api.api+"base/student/edit_stu_photo";
        //上传
        var url_api_file=api.api+"file/get";
        //上传签名
        var api_uploader_base = api.api+"file/uploader_base64";
        //开启签名
        var api_start_sign='http://127.0.0.1:19098/start_sign';
        //获取签名结果
        var api_get_sign=api.sign+':19098/get_sign';
        //保存签名
        var api_save_sign = HTTP_X+"/api/GrowthRecordBag/add_user_sign";
        //查询签字
        var api_check_sign = HTTP_X+"/api/GrowthRecordBag/query_sign_byguid";
        //个性名片--编辑
        var card_update= api.api+"GrowthRecordBag/card_update";

        //用户修改头像
        var api_update_head = api.user+'baseUser/upd_picture';
        //获取登录用户信息
        var api_login_info = api.user+'baseUser/sessionuser.action';

        //家长--获取关联的学生集合
        var api_stu_used = api.user + "parent/stu_used";
        //家长--获取当前添加子女的信息确保信息正确
        var api_stu_info = api.user+'student/studentList.action';
        //家长--增加关联学生
        var api_add_kid = api.user + 'parent/map_student';

        //除家长、学生外-增加关联子女
        var api_teacher_kid = api.user + 'parent/relevance_student';

        var image_buf="";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "person_info",
                //登陆者姓名
                user_name:'',
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
                //个人基本信息
                data: {},
                //个性名片返回参数和请求参数
                person_card: [],
                //个性名片按钮状态：1-编辑 2-保存
                card_type:1,
                //民族
                nationList:[
                    {name:"汉族"},
                    {name:"壮族"},
                    {name:"回族"},
                    {name:"满族"},
                    {name:"维吾尔族"},
                    {name:"苗族"},
                    {name:"彝族"},
                    {name:"土家族"},
                    {name:"藏族"},
                    {name:"蒙古族"},
                    {name:"侗族"},
                    {name:"布依族"},
                    {name:"瑶族"},
                    {name:"白族"},
                    {name:"朝鲜族"},
                    {name:"哈尼族"},
                    {name:"黎族"},
                    {name:"哈萨克族"},
                    {name:"傣族"},
                    {name:"畲族"},
                    {name:"傈僳族"},
                    {name:"东乡族"},
                    {name:"仡佬族"},
                    {name:"拉祜族"},
                    {name:"佤族"},
                    {name:"水族"},
                    {name:"纳西族"},
                    {name:"羌族"},
                    {name:"土族"},
                    {name:"仫佬族"},
                    {name:"锡伯族"},
                    {name:"柯尔克孜族"},
                    {name:"景颇族"},
                    {name:"达斡尔族"},
                    {name:"撒拉族"},
                    {name:"布朗族"},
                    {name:"毛南族"},
                    {name:"塔吉克族"},
                    {name:"普米族"},
                    {name:"阿昌族"},
                    {name:"怒族"},
                    {name:"鄂温克族"},
                    {name:"京族"},
                    {name:"基诺族"},
                    {name:"德昂族"},
                    {name:"保安族"},
                    {name:"俄罗斯族"},
                    {name:"裕固族"},
                    {name:"乌孜别克族"},
                    {name:"门巴族"},
                    {name:"鄂伦春族"},
                    {name:"独龙族"},
                    {name:"赫哲族"},
                    {name:"高山族"},
                    {name:"珞巴族"},
                    {name:"塔塔尔族"},
                    {name:"未识别民族"},
                    {name:"入籍外国人"}
                ],
                //文化程度
                cultureList:[
                    {name: "研究生"},
                    {name:"大学本科"},
                    {name:"大学专科"},
                    {name:"专科学校"},
                    {name:"中专"},
                    {name:"中技"},
                    {name:"技工学校"},
                    {name:"高中"},
                    {name:"初中"},
                    {name:"小学"},
                    {name:"文盲或半文盲"}
                ],
                //政治面貌
                politicalList:[
                    {name:"中共党员"},
                    {name:"中共预备党员"},
                    {name:"群众"},
                    {name:"民革党员"},
                    {name:"民盟盟员"},
                    {name:"民建会员"},
                    {name:"民进会员"},
                    {name:"农工党党员"},
                    {name:"致公党党员"},
                    {name:"九三学社社员"},
                    {name:"台盟盟员"},
                    {name:"无党派人士"},
                    {name:"九三学社社员"}
                ],
                up:"",
                user_id:"",
                token:"",
                //头像图片
                head_photos:'',
                //头像修改
                head_up:{
                    sign_code:"",
                    sign_img:""
                },
                //登陆者基本信息
                use_info:{},
                //除家长外添加子女请求参数
                teacher_kid_req:{
                    account:'',//用户名	string	【必填】
                    guid:'',//	用户编号	number	【必填】
                    name:'',//		姓名	string	【必填】
                    phone:'',//		手机号	string
                    stu_name:'',//学生姓名	string	【必填】
                    stu_num:'',//		学生学籍号	string	【必填】
                },
                //添加子女请求参数
                extend_kid:{
                    student_name:'',
                    student_num:'',
                },
                //添加子女信息是否正确：false-不正确 ，true-正确
                kid_insure:false,
                //添加子女数据库返回信息
                kid_return:{},
                //添加子女提示信息
                kid_msg:'',
                //家长--获取子女信息集合
                kid_ary:[],
                //头像签名提示信息
                // head_msg:'',
                head_msg:false,
                //签名提示信息
                msg:'',
                cds:function(){
                    var self = this;
                    data_center.uin(function(data){
                        var user_type = data.data.user_type;
                        var user = JSON.parse(data.data.user);
                        self.use_info = user;
                        self.user_name = user.name;
                        self.userType = data.data.user_type;
                        if(user.picture != ''){
                            self.head_photos = url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + user.picture;
                        }
                        if(user_type == '2'){//学生
                            var guid = user.guid;
                            // //基本信息
                            // ajax_post(api_get_data,{guid:guid},self);
                            // //头像
                            // ready_photo(user, "guid");
                            self.stu_guid = user.guid;

                            self.data.guid=JSON.parse(data.data["user"]).guid;
                            self.token = sessionStorage.getItem("token");
                            ajax_post(appoint_student_user,{guid:self.data.guid},self);
                            self.up = tuploader.init("report",self.token,
                                function(up, file, status){
                                    var data=tuploader.result();
                                    // var status=data[0].status;
                                    if(status=="success"){
                                        ajax_post(photo,{
                                            photo:JSON.stringify(data[0]),
                                            student_id:self.user_id
                                        },self)
                                    }
                                });
                            // self.up = tuploader.init("report-edit",self.token,
                            //     function(up, file, status){
                            //         var data=tuploader.result();
                            //         // var status=data[0].status;
                            //         if(status=="success"){
                            //             ajax_post(photo,{
                            //                 photo:JSON.stringify(data[0]),
                            //                 student_id:self.user_id
                            //             },self)
                            //         }
                            //     });
                            //个性名片
                            self.get_per_card_list(guid);
                        }else if(user_type == '3'){//家长
                            // console.log(self.use_info);
                            //获取子女集合
                            ajax_post(api_stu_used,{parent_num:user.account},self);
                        }else if(user_type == '1' || user_type == '0'){//管理员和教师级别
                            self.teacher_kid_req.account = user.account;
                            self.teacher_kid_req.guid = user.guid;
                            self.teacher_kid_req.name = user.name;
                            self.teacher_kid_req.phone = user.phone;
                            //获取子女集合
                            ajax_post(api_stu_used,{parent_num:user.account},self);
                        }
                    });
                },
                //姓名
                //姓名修改
                name_up:function(){
                    var value = this.user_name;
                    var self = this;
                    layer.prompt({
                        title: '请输入姓名', value:value, formType: 2,
                        yes:function(index, layero){
                        var val = layero.find(".layui-layer-input").val();
                        var reg = /^[\u4E00-\u9FA5]{2,10}$/;
                        if($.trim(val)==''){
                            layer.close(index);
                            toastr.warning('姓名不能为空');
                        }else if(!reg.test(val)){
                            layer.close(index);
                            toastr.warning('请输入2-10位汉字');
                        }else{
                            layer.close(index);
                            ajax_post(api_update_name,{name:val},self);
                        }
                    }
                    });
                },
                //学生个人信息--保存
                save_data:function () {
                    this.flag = true;
                    var reg = /^([\u4e00-\u9fa5]){2,7}$/;//姓名验证
                    var phone_reg =  /^((1(3|4|5|6|7|8|9)\d{9}))$/;//电话验证
                    var age_reg = /^(1[0-2]\d|\d{1,2})$/;
                    if(this.data.politic == 0){
                        this.data.politic = '';
                    }else if(this.data.father_political == 0){
                        this.data.father_political = '';
                    }else if(this.data.mother_political == 0){
                        this.data.mother_political = '';
                    }else if(this.data.father_culture == 0){
                        this.data.father_culture = '';
                    }else if(this.data.mother_culture == 0){
                        this.data.mother_culture = ''
                    }else if(this.data.nation == 0){
                        this.data.nation = '';
                    }
                    if($.trim(this.data.student_code) != ""){
                        if(this.data.student_code.length != 18){
                            toastr.warning("请输入正确的身份证号");
                            this.flag = false;
                        }
                    }
                    if(this.data.student_phone){
                        if(!phone_reg.test(this.data.student_phone)){
                            toastr.warning("请填写正确的学生电话");
                            this.flag = false;
                        }
                    }
                    if(this.data.father_call){
                        if(!phone_reg.test(this.data.father_call)){
                            toastr.warning("请填写正确的您的父亲的电话");
                            this.flag = false;
                        }
                    }
                    if(this.data.mother_call){
                        if(!phone_reg.test(this.data.mother_call)){
                            toastr.warning("请填写正确的您的母亲的电话");
                            this.flag = false;
                        }
                    }
                    if(this.data.trustee_call){
                        if(!phone_reg.test(this.data.trustee_call)){
                            toastr.warning("请填写正确的您的托管监护人的电话");
                            this.flag = false;
                        }
                    }
                    if($.trim(this.data.old_name) != ""){
                        if(!reg.test(this.data.old_name)){
                            toastr.warning("曾用名填写不正确，没有请不填写");
                            this.flag = false;
                        }
                    }
                    if(this.data.trustee_age){
                        if(!age_reg.test(this.data.trustee_age)){
                            toastr.warning("请填写正确托管人年龄");
                            this.flag = false;
                        }
                    }
                    if(this.flag == true){
                        ajax_post(api_update,this.data.$model,this);

                    }
                },
                //学生个人信息-编辑
                update_data:function(index){
                    this.status = 3;
                },
                //获取个性名片
                get_per_card_list: function (guid) {
                    var self = this;
                    cloud.get_per_card_list({guid: guid}, function (url, args, data) {
                        self.person_card = data;
                    })
                },
                //个性名片--编辑
                card_update_data:function(){
                    this.card_type = 2;
                },
                //个性名片--保存
                card_save_data:function(){
                    this.card_type = 1;
                    //卡片修改
                    ajax_post(card_update,this.person_card,this);
                },
                radio_click:function () {
                    this.data.sign_code = '';
                    this.data.sign_img = '';
                },
                //点击添加子女
                add_kids:function(){
                    //清空之前填写的内容
                    this.extend_kid.student_name = '';
                    this.extend_kid.student_num = '';
                    this.kid_return = {};
                    $("#kid-model").modal({
                        closeOnConfirm: false
                    });
                },
                //添加子女-姓名失去焦点,添加子女-学籍号失去焦点
                kid_blur:function(num){
                    this.kid_msg = '';
                    var name = this.extend_kid.student_name;
                    var code = this.extend_kid.student_num;
                    if(name.trim() == '' && num == 1){
                        this.kid_msg = '请输入子女姓名';
                    }else if(code.trim() == ''  && num == 2){
                        this.kid_msg = '请输入子女学籍号';
                    }else if(name.trim() != '' && code.trim() != ''){
                        this.kid_msg = '';
                        ajax_post(api_stu_info,{student_name:name,student_num:code},this);
                    }
                },
                //保存添加子女
                save_kid:function(){
                    var name = this.extend_kid.student_name;
                    var code = this.extend_kid.student_num;
                    if(name.trim() != '' && code.trim() != '' && this.kid_insure){
                        this.kid_msg = '';
                        this.extend_kid.student_name = name.trim();
                        this.extend_kid.student_num = code.trim();
                        this.call_add_kids();
                    }else if(name.trim() == ''){
                        this.kid_msg = '请输入子女姓名';
                    }else if(code.trim() == ''){
                        this.kid_msg = '请输入子女学籍号';
                    }else if(this.kid_insure){
                        this.kid_msg = '子女信息不存在';
                    }
                },
                //判断非学生用户添加子女调用接口
                call_add_kids:function(){
                    if(this.userType == '3'){//家长
                        ajax_post(api_add_kid,this.extend_kid.$model,this);
                    }else if(this.userType == '0' || this.userType == '1'){//非家长、学生
                        this.teacher_kid_req.stu_name = this.extend_kid.student_name;
                        this.teacher_kid_req.stu_num = this.extend_kid.student_num;
                        ajax_post(api_teacher_kid,this.teacher_kid_req.$model,this);
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                        //    修改姓名
                            case api_update_name:
                                this.complete_update_name(data);
                                break;
                            //    查询照片
                            case appoint_student_user:
                                this.complete_appoint_student_user(data);
                                break;
                            //学生基本信息
                            case api_get_data:
                                this.complete_get_data(data);
                                break;
                            //查询签字
                            case api_query_sign:
                                this.complete_query_sign(data);
                                break;
                            //修改学生信息
                            case  api_update:
                                this.complete_update_data(data);
                                break;
                            //更改学生照片
                            case photo:
                                toastr.success('上传成功');
                                ajax_post(appoint_student_user,{guid:this.data.guid},this);
                                break;
                            //上传签名
                            case api_uploader_base:
                                if(this.head_up.sign_img != ''){
                                    this.up_img = false;
                                    // this.img_src = '';
                                    this.head_up.sign_img = '';
                                    ajax_post(api_update_head,{picture:data.data.inner_name},this);
                                }else{
                                    this.complete_uploader_base(data);
                                }
                                break;
                            //开启签名
                            case api_start_sign:
                                this.complete_start_sign(data);
                                break;
                            //获取签名结果
                            case api_get_sign:
                                this.complete_get_sign(data);
                                break;
                            //保存签名
                            case api_save_sign:
                                this.complete_save_sign(data);
                                break;
                            //查询签字
                            case api_check_sign:
                                this.complete_check_sign(data);
                                break;
                        //    个性名片修改
                            case card_update:
                                if(status==200){
                                    // this.txtFlag=0;
                                    // this.updateFlag=1;
                                    toastr.success("保存成功");
                                    this.get_per_card_list(this.stu_guid);
                                }
                                break;
                        //        上传头像
                            case api_update_head:
                                this.complete_update_head(data);
                                break;
                        //        登录用户信息
                            case api_login_info:
                                this.complete_login_info(data);
                                break;
                        //        家长-获取子女信息集合
                            case api_stu_used:
                                this.kid_ary = data.data;
                                break;
                        //        家长-输入子女姓名、学籍号后判断子女信息是否正确
                            case api_stu_info:
                                var list = data.data.list;
                                if(list.length == 0){
                                    this.kid_msg = '子女信息与学籍号不符';
                                }else{
                                    this.kid_insure = true;
                                    this.kid_return = list[0];
                                }
                                break;
                            //家长-添加子女
                            case api_add_kid:
                                this.complete_add_kid(data);
                                break;
                            //管理员和教师级别-添加子女
                            case api_teacher_kid:
                                this.complete_teacher_kid(data);
                                break;

                        }
                    } else {
                        if (cmd == api_start_sign) {
                            toastr.warning('请连接设备');
                            return;
                        }else{
                            toastr.error(msg);
                        }

                    }
                },
                // //学生基本信息
                // complete_stu_basic:function(data){
                //     this.stu = data.data;
                //     ajax_post(api_get_data,{guid:this.stu_guid},this);
                // },
                //修改姓名
                complete_update_name:function(data){
                    toastr.success('姓名修改成功');
                    //登录用户信息
                    ajax_post(api_login_info,{},this);
                },
                //查询照片
                complete_appoint_student_user:function (data) {
                    this.user_id = data.data.user_id;

                    if(data.data.photo != null && data.data.photo != ""){
                        var urlP=JSON.parse(data.data.photo);
                        this.photos = url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + urlP.inner_name;
                    }else {
                        this.photos="";
                    }
                    ajax_post(api_get_data,{"guid":this.data.guid},this);
                },
               //学生基本信息
                complete_get_data:function(data){
                    for(var i in data.data){
                        if(data.data[i] == null) {
                            data.data[i] = '';
                        }
                    }
                    this.data=data.data;
                    ajax_post(api_query_sign,{class_id:''},this);
                },
                data_status:"",
                //未通过原因
                reson:"",
                //查询签字
                complete_query_sign:function (data) {
                    if(data.data == null || data.data.length == 0 || data.data == undefined){
                        this.data_status = 0;
                        this.reson = '';
                        return;
                    }
                    //is_adopt_audit:审核状态 0未审核 1审核通过 2不通过
                    // if(data.data[0].is_adopt_audit == 0){//待审核
                    //     this.data_status = 0;
                    //     this.reson = '';
                    // }else if(data.data[0].is_adopt_audit == 1){//通过
                    //     this.data_status = 1;
                    // }else if(data.data[0].is_adopt_audit == 2){//不通过
                    //     this.data_status = 2;
                    //     this.reson = data.data[0].reson;
                    // }
                    if(data.data.sign_code == ''){//上传的图片
                        this.get_photos = url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + data.data.sign_img;
                    }else{
                        this.get_photos = data.data.sign_img;
                    }
                },
                //修改学生信息
                complete_update_data:function(data){
                    toastr.success("提交成功");
                    this.status = 1;
                    this.cds();

                },
                //更改签名
                btn_click:function () {
                    $("#my-confirm").modal({
                        closeOnConfirm: true
                    });
                },
                //个人基本信息--开始签名-保存修改
                data_x:{
                    //签订的诚信承诺的版本时间--这里不传值
                    cxcnbbsj:'',
                    //诚信承诺签字时间--这里不传值
                    cxcnqzsj:'',
                    data_source:"",
                    sign_code:"",
                    sign_img:""
                },
                up_img:false,
                img_src:"",
                //签名
                file_change:function () {
                    this.img_src = '';
                    var get_chooseImage = document.getElementById('chooseImage');
                    var imgFile = get_chooseImage.files[0];

                    var filePath = $("#chooseImage").val(),
                        fileFormat = filePath.substring(filePath.lastIndexOf(".")).toLowerCase(),
                        src = window.URL.createObjectURL(imgFile); //转成可以在本地预览的格式
                    // 检查是否是图片
                    if( !fileFormat.match(/.png|.jpg|.jpeg/) ) {
                        toastr.warning('上传错误,文件格式必须为：png/jpg/jpeg');
                        return;
                    }
                    this.img_src = src;
                    var dkrm = new Darkroom('#target', {
                        // Size options
                        minWidth: 100,
                        minHeight: 100,
                        maxWidth: 540,
                        maxHeight: 300,
                        ratio: 4/3,
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

                },
                //签名确定
                up_ajax:function () {
                    var obj = $("#content > div > section > div > figure > img");
                    var src = obj.attr("src");
                    if(src == undefined){
                        // this.msg = '请先点击保存在点击提交';
                        this.msg = '图片';
                        return;
                    }else{
                        ajax_post(api_uploader_base,{file:src},this);
                        $("#my-confirm").modal({
                            closeOnConfirm: false
                        });
                    }
                },
                int:"",
                //开始签名
                start_sign:function () {
                    //开启签名
                    ajax_post(api_start_sign,{},this);
                },
                //开始签名
                complete_start_sign:function(data){
                    var self=this;
                    self.int=setInterval(function(){
                        self.getSign()
                    },3000);
                },
                //获取签名结果
                getSign:function(){
                    //获取签名结果
                    ajax_post(api_get_sign,{},this);
                },
                //获取签名结果
                complete_get_sign:function(data){
                    if(data.data.img && data.data.sign_code){
                        clearInterval(this.int);
                        this.data_x.sign_img = data.data.img;
                        this.data_x.sign_code = data.data.sign_code;
                        ajax_post(api_save_sign,this.data,this);
                    }
                },
                //上传签名
                complete_uploader_base:function (data) {
                    this.up_img = false;
                    this.img_src = '';
                    this.data_x.sign_img = data.data.inner_name;
                    ajax_post(api_save_sign,this.data_x,this);
                },
                //保存签名
                complete_save_sign:function (data) {
                    this.flag_up = true;
                    ajax_post(api_check_sign,{class_id:""},this);
                },
                //查询签字
                complete_check_sign:function (data) {
                    if(data.data.sign_code == ''){//上传的图片
                        this.get_photos = url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + data.data.sign_img;
                    }else{
                        this.get_photos = data.data.sign_img;

                    }
                },
                //    头像修改
                update_head:function(){
                    $("#cuttingImg-modal").modal({
                        closeOnConfirm: false
                    });
                },
                //头像裁剪保存按钮-组件
                cuttingImg_late:function(src){
                    //上传签名
                    this.head_up.sign_img = src;
                    //上传头像
                    ajax_post(api_uploader_base,{file:src},this);
                },
            //    修改头像
                complete_update_head:function(data){
                    this.up_img = false;
                    this.img_src = '';
                    //登录用户信息
                    ajax_post(api_login_info,{},this);
                },
            //    登录用户信息
                complete_login_info:function(data){
                    var user = JSON.parse(data.data.user);
                    this.head_photos = url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + user.picture;
                    sessionStorage.setItem('user_info',JSON.stringify(data));
                    //刷新页面--主要是为了刷新header里面的头像
                    window.location.reload ();
                },
            //    家长添加子女信息
                complete_add_kid:function(data){
                    //1-是；0-否。若需要学生确认则必须学生确认后才能在关联列表中查询到记录
                    var sure = data.data.need_sure;
                    if(sure == '0'){
                        //获取子女集合
                        ajax_post(api_stu_used,{parent_num:this.use_info.account},this);
                    }else if(sure == '1'){
                        layer.alert('添加成功，需要子女前去确认', {
                           closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                    }
                    $("#kid-model").modal({
                        closeOnConfirm: true
                    });
                },
                //管理员和教师级别-添加子女
                complete_teacher_kid:function(data){
                    //获取子女集合
                    ajax_post(api_stu_used,{parent_num:this.use_info.account},this);
                    $("#kid-model").modal({
                        closeOnConfirm: true
                    });
                },
            });
            // //监听图片变化
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