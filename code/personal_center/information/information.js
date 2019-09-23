define(['jquery',C.CLF('avalon.js'),
        C.Co("personal_center","information/information",'css!'),
        C.Co("personal_center","information/information",'html!'),
        C.CMF("router.js"),
        C.CMF("formatUtil.js"),
        "layer",C.CMF("data_center.js"), C.CM('page_title'),C.CM("tuploader")
    ],
    function($,avalon,css1,html, x, formatUtil, layer,data_center,page_title,tuploader) {
        //查看学生信息
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
        var api_uploader_base = HTTP_X+"/api/file/uploader_base64";
        //开启签名
        var api_start_sign='http://127.0.0.1:19098/start_sign';
        //获取签名结果
        var api_get_sign=api.sign+':19098/get_sign';
        //保存签名
        var api_save_sign = HTTP_X+"/api/GrowthRecordBag/add_user_sign";
        //查询签字
        var api_check_sign = HTTP_X+"/api/GrowthRecordBag/query_sign_byguid";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "information",
                status:1,//查看 2编辑 3保存
                get_photos:"",
                photos:"",
                userType:"",
                flag:true,
                data: {},
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
                //点击保存
                save_data:function () {
                    var reg = /^([\u4e00-\u9fa5]){2,7}$/;//姓名验证
                    var phone_reg =  /^((1(3|4|5|7|8)\d{9}))$/;//电话验证
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
                            toastr.warning("请填写正确的学生姓名");
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
                //点击编辑
                update_data:function(index){
                    this.status = 3;
                },
                up:"",
                user_id:"",
                token:"",
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        self.data.guid=JSON.parse(data.data["user"]).guid;
                        self.userType = data.data.user_type;
                        self.token=window.sessionStorage.getItem("token");
                        ajax_post(appoint_student_user,{guid:self.data.guid},self);
                        self.up = tuploader.init("report",self.token,
                            function(up, file, status){
                                var data=tuploader.result();
                                var status=data[0].status;
                                if(status=="success"){
                                    ajax_post(photo,{
                                        photo:JSON.stringify(data[0]),
                                        student_id:self.user_id
                                    },self)
                                }
                            });
                    });
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case appoint_student_user:
                                this.complete_appoint_student_user(data);
                                break;
                            case api_get_data:
                                this.complete_get_data(data);
                                break;
                            case api_query_sign:
                                this.complete_query_sign(data);
                                break;
                            case  api_update:
                                this.complete_update_data(data);
                                break;
                            case photo:
                                toastr.success('上传成功');
                                ajax_post(appoint_student_user,{guid:this.data.guid},this);
                                break;
                            //传签名
                            case api_uploader_base:
                                this.complete_uploader_base(data);
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
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
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
                complete_get_data:function(data){
                    for(var i in data.data){
                        if(data.data[i] == null) {
                            data.data[i] = '';
                        }
                    }
                    this.data=data.data;
                    ajax_post(api_query_sign,{class_id:""},this);

                },
                data_status:"",
                reson:"",
                complete_query_sign:function (data) {
                    if(data.data[0].is_adopt_audit == 0){//待审核
                        this.data_status = 0;
                        this.reson = '';
                    }else if(data.data[0].is_adopt_audit == 1){//通过
                        this.data_status = 1;
                    }else if(data.data[0].is_adopt_audit == 2){//不通过
                        this.data_status = 2;
                        this.reson = data.data[0].reson;
                    }
                    if(data.data[0].sign_code == ''){//上传的图片
                        this.get_photos = url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + data.data[0].sign_img;
                    }else{
                        this.get_photos = data.data.sign_img;
                    }
                },
                btn_click:function () {
                    $("#my-confirm").modal({
                        closeOnConfirm: true
                    });
                },
                data_x:{
                    data_source:"",
                    sign_code:"",
                    sign_img:""
                },
                up_img:false,
                img_src:"",
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
                up_ajax:function () {
                    var obj = $("#content > div > section > div > figure > img");
                    var src = obj.attr("src");
                    if(src == undefined){
                        this.msg = '请先保存载提交';
                        return;
                    }else{
                        ajax_post(api_uploader_base,{file:src},this);
                        $("#my-confirm").modal({
                            closeOnConfirm: false
                        });
                    }
                },
                int:"",
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
                },//获取签名结果
                complete_get_sign:function(data){
                    if(data.data.img && data.data.sign_code){
                        clearInterval(this.int);
                        this.data_x.sign_img = data.data.img;
                        this.data_x.sign_code = data.data.sign_code;
                        ajax_post(api_save_sign,this.data,this);
                    }
                },
                complete_uploader_base:function (data) {
                    this.up_img = false;
                    this.img_src = '';
                    this.data_x.sign_img = data.data.inner_name;
                    ajax_post(api_save_sign,this.data_x,this);

                },
                complete_save_sign:function (data) {
                    this.flag_up = true;
                    ajax_post(api_check_sign,{class_id:""},this);
                },
                complete_check_sign:function (data) {
                    if(data.data[0].sign_code == ''){//上传的图片
                        this.get_photos = url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + data.data[0].sign_img;
                    }else{
                        this.get_photos = data.data.sign_img;

                    }
                },
                radio_click:function () {
                    this.data.sign_code = '';
                    this.data.sign_img = '';
                },
                complete_update_data:function(data){
                    toastr.success("提交成功");
                    this.status = 1;
                    this.cds();

                }
            });

            vm.$watch('onReady', function() {
                this.cds();
            })

        }
        return {
            view: html,
            define: avalon_define
        }
    })