/**
 * Created by Administrator on 2017/10/11.
 */
define(["jquery", C.CLF('avalon.js'), 'layer',
        C.Co("user", "classUserControl/parentCheck/parentCheck", "css!"),
        C.Co("user", "classUserControl/parentCheck/parentCheck", "html!"),
    C.CMF("router.js"), C.CMF("data_center.js"),C.CM('three_menu_module'),C.CMF("table/table.js")
],
    function (jquery,avalon,layer,css,html,router,data_center,three_menu_module,table){
        //获取指定学校的班级集合
        var api_school_class=api.user+'class/school_class.action';
        //获取班级学生家长关联集合
        var api_parent_map=api.PCPlayer+"parent/class_stu_parent_map";
        //文件上传
        var api_file_upload = api.user + "file/upload.action";
        //批量导入家长
        var api_import_parent=api.user+'parent/import_parent';
        var avalon_define=function(){
            var vm=avalon.define({
                $id:"parentCheck",
                url:api_parent_map,
                //用户基本信息
                user:{},
                //身份判断:4-校管理员；6-班主任
                identype:'',
                data: {
                    offset: 0,
                    rows:15
                },
                remember:false,
                //开关
                is_init:false,
                // 请求参数
                extend:{
                    //班级id
                    // class_id:35
                    class_id:'',
                    __hash__: ""
                },
                //年级id
                grade_id:'',
                //年级列表
                grade_list:'',
                //班级列表
                class_list:'',
                // 模态框
                modal: {
                    // id: "",
                    // title: "",
                    // info: "",
                    // url: "",
                    msg: ""
                },
                //文件
                fileName:'',
                //上传参数
                uploadForm:{
                    // 返回名
                    fileBackName: "",
                    //校验是够存在错误	boolean	只有任何类型的错误都不存在时才为true
                    exist_error:'',
                    //文件格式错误	boolean
                    format_error:'',
                    //家长姓名为空	array<string>
                    parent_empty:[],
                    //电话号码格式错误	array<string>
                    phone_error:[],
                    //电话号码已存在	array<string>
                    phone_exist:[],
                    //电话号码重复	array<string>
                    phone_repeat:[],
                    //学生学籍号不存在	array<string>
                    stu_not_exist:[],
                    //学生学籍号和姓名不匹配	array<string>
                    stu_not_map:[],
                    // //数据校验是否通过	boolean
                    // check_ok:'',
                    // //数据导入是否成功	boolean
                    // import_ok:'',
                },
                // 表头名称
                theadTh: [
                    {
                    title: "序号",
                    type: "index",
                    from: "id"
                },
                    {
                        title: "学生姓名",
                        type: "text",
                        from: "student_name"
                    },
                    {
                        title: "学籍号",
                        type: "text",
                        from: "student_num"
                    },
                    {
                        title: "家长1",
                        type: "html",
                        from:"<div>{{el.parents[0].parent_name}}</div>" +
                        "<div>{{el.parents[0].parent_phone}}</div>"
                    },
                    {
                        title: "家长2",
                        type: "html",
                        from:"<div>{{el.parents[1].parent_name}}</div>" +
                        "<div>{{el.parents[1].parent_phone}}</div>"
                    },
                    {
                        title: "家长3",
                        type: "html",
                        from:"<div>{{el.parents[2].parent_name}}</div>" +
                        "<div>{{el.parents[2].parent_phone}}</div>"
                    },
                    {
                        title: "家长4",
                        type: "html",
                        from:"<div>{{el.parents[3].parent_name}}</div>" +
                        "<div>{{el.parents[3].parent_phone}}</div>"
                    }
                ],
                //年级改变
                gradeChange:function(){
                    var self=this;
                    var gId=Number(self.grade_id);
                    var grade=self.grade_list;
                    for(var i=0;i<grade.length;i++){
                        var id=grade[i].grade_id;
                        if(id==gId){
                            self.class_list=grade[i].class_list;
                            self.extend.class_id=Number(grade[i].class_list[0].class_id);
                        }
                    }
                },
                //文件修改
                fileChange:function(){
                    this.modal.msg='';
                    //家长姓名为空
                    this.uploadForm.parent_empty =[];
                    // 电话号码格式错误
                    this.uploadForm.phone_error = [];
                    //电话号码已存在
                    this.uploadForm.phone_exist =[];
                    // 电话号码重复
                    this.uploadForm.phone_repeat =[];
                    //学生学籍号不存在
                    this.uploadForm.stu_not_exist =[];
                    //学生学籍号和姓名不匹配
                    this.uploadForm.stu_not_map =[];
                },
                //批量导入
                uploadingModal: function () {
                    $("#file").val("");
                    this.fileName="";
                    this.modal.msg = "";
                    //家长姓名为空
                    this.uploadForm.parent_empty =[];
                    // 电话号码格式错误
                    this.uploadForm.phone_error = [];
                    //电话号码已存在
                    this.uploadForm.phone_exist =[];
                    // 电话号码重复
                    this.uploadForm.phone_repeat =[];
                    //学生学籍号不存在
                    this.uploadForm.stu_not_exist =[];
                    //学生学籍号和姓名不匹配
                    this.uploadForm.stu_not_map =[];
                    $("#file-uploading").modal({
                        closeOnConfirm: false
                    });
                },
                //开始上传
                uploading: function () {
                    var files=this.fileName;
                    var a=files.split(""); //先拆分成数组
                    var b=files.split("").reverse(); //再反转，但还是数组
                    var c=files.split("").reverse().join("");//最后把数组变成字符串
                    var subFile=c.substring(0,c.indexOf("."));
                    if (subFile === "xslx" || subFile === "slx"){
                        // this.uploadForm.fk_class_id= this.data.form.fk_class_id;
                        // this.uploadForm.fk_grade_id= this.data.form.fk_grade_id;
                        // this.uploadForm.phase= this.data.form.phase;
                        // this.uploadForm.fk_school_id= this.data.form.fk_school_id;
                        // this.uploadForm.subject_id= this.data.form.subject_id;
                        // this.uploadForm.subject_name= 'bjks';
                        // this.uploadForm.year_start= this.data.form.year_start;
                        // this.uploadForm.year_end= this.data.form.year_end;
                        this.modal.msg = "正在上传，请勿取消";
                        fileUpload(api_file_upload,this);
                    } else {
                        this.modal.msg = "请上传Excel文件";
                    }
                },
                init:function(){
                    // this.is_init=true;
                    this.cds();
                },
                //获取class_id
                cds:function(){
                    var self=this;
                    data_center.uin(function(data){
                        var cArr = [];
                        var tUserData = JSON.parse(data.data["user"]);
                        self.user = tUserData;
                        //最高等级
                        var highest_level=data.data.highest_level;
                        if(highest_level.toString()==='4'){//校管理员
                            var id=tUserData.fk_school_id;
                            ajax_post(api_school_class,{school_id:id},self);
                            self.identype=4;
                        }else if(highest_level.toString()==='6'){//班主任和普通老师
                            //班主任
                            cArr = tUserData.lead_class_list;
                            if(cArr!=[] && cArr!=null){
                                self.identype=6;
                                //年级
                                self.grade_list=cArr;
                                //班级
                                self.class_list=cArr[0].class_list;
                                self.grade_id=cArr[0].grade_id;
                                self.is_init=true;
                                self.extend.class_id = cArr[0].class_list[0].class_id;
                            }
                        }
                    })
                },
                on_request_complete:function(cmd,status,data,is_suc,msg){
                    switch (cmd) {
                        case api_school_class:
                            this.complete_school_class(data);
                            break;
                        case api_file_upload:
                            if (Number(status) === 200) {
                                this.uploadForm.fileBackName = data.data.file;
                                ajax_post(api_import_parent, {file: this.uploadForm.fileBackName}, this);
                            }
                            this.modal.msg = msg;
                            break;
                        // 家长信息导入
                        case api_import_parent:
                            var file=$('#file-uploading');
                            // var data=data.data;
                            // console.log(data);
                            if (Number(status) === 200) {
                                file.modal('close');
                                this.extend.__hash__ = new Date();
                                toastr.success('家长信息上传成功');
                            } else if (Number(status) === 205) {
                                //家长姓名为空
                                this.uploadForm.parent_empty = data.data.check_error.parent_empty;
                                // 电话号码格式错误
                                this.uploadForm.phone_error = data.data.check_error.phone_error;
                                //电话号码已存在
                                this.uploadForm.phone_exist = data.data.check_error.phone_exist;
                                // 电话号码重复
                                this.uploadForm.phone_repeat = data.data.check_error.phone_repeat;
                                //学生学籍号不存在
                                this.uploadForm.stu_not_exist = data.data.check_error.stu_not_exist;
                                //学生学籍号和姓名不匹配
                                this.uploadForm.stu_not_map = data.data.check_error.stu_not_map;
                            }
                            this.modal.msg =msg;
                            break;
                    }
                },
                complete_school_class:function(data){
                    this.grade_list=data.data;
                    this.grade_id=this.grade_list[0].grade_id;
                    this.class_list=this.grade_list[0].class_list;
                    this.is_init=true;
                    this.extend.class_id=this.class_list[0].class_id;
                },
                // complete_import_parent:function(data){
                //     var file=$('#file-uploading');
                //     if (status == 200) {
                //         file.modal('close');
                //         // info.modal('open');
                //         // setTimeout(function () {
                //         //     info.modal('close');
                //         // }, 1000);
                //         this.extend.__hash__ = new Date();
                //     } else if (status == 205) {
                //         //家长姓名为空
                //         this.uploadForm.parent_empty = data.data.parent_empty;
                //         // 电话号码格式错误
                //         this.uploadForm.phone_error = data.data.phone_error;
                //         //电话号码已存在
                //         this.uploadForm.phone_exist = data.data.phone_exist;
                //         // 电话号码重复
                //         this.uploadForm.phone_repeat = data.data.phone_repeat;
                //         //学生学籍号不存在
                //         this.uploadForm.stu_not_exist = data.data.stu_not_exist;
                //         //学生学籍号和姓名不匹配
                //         this.uploadForm.stu_not_map = data.data.stu_not_map;
                //     }
                //     this.modal.msg =data.msg;
                // },
            });
            vm.init();
            return vm;
        };
         return {
                view: html,
                define: avalon_define
         }
 });