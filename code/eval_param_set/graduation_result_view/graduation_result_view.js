/**
 * Created by Administrator on 2018/7/16.
 */
define([
        "jquery", 'layer',
        C.CLF('avalon.js'),
        C.Co("eval_param_set", "graduation_result_view/graduation_result_view", "css!"),
        C.Co("eval_param_set", "graduation_result_view/graduation_result_view", "html!"),
        C.CMF("data_center.js"),
        "PCAS",
        C.CM("three_menu_module"), C.CLF('base64.js'),
    ],
    function ($, layer, avalon, css, html, data_center, PCAS, three_menu_module,bs64) {
        //获取区县集合
        var api_get_arealist = api.user + 'school/arealist.action';
        //获取学校集合
        var api_get_school = api.user + 'school/schoolList.action';
        //获取学校年级集合
        var api_school_grade = api.user + 'grade/school_grade';
        //获取指定学校年级的班级集合
        var api_get_class = api.user + 'class/findClassSimple.action';
        //查询等级设置个数
        var api_rank_count=api.api+'Indexmaintain/bypj_find_rank_set';
        //获取表头
        var get_title_api = api.api + "Indexmaintain/bybg_get_all_index_name";
        //获取数据
        var api_result_view = api.api + 'Indexmaintain/bybg_operation_by_count_result_view';
        //导出
        var api_export_bybg = api.api + 'Indexmaintain/export_bybg_evaluate_result';
        //导入评价结果数据-导入等级
        var api_bypj_import=api.api+'Indexmaintain/bypj_import_excel';
        //查看当前年级的公示等级
        var api_public_rank=api.api+'Indexmaintain/query_public_rank';
        //撤销发布能否撤销
        var api_revoke_publish=api.api+'Indexmaintain/revoke_publish';
        //毕业评价发布/撤销发布
        var api_bypj_publish=api.api+'Indexmaintain/bypj_publish';

        //文件上传
        var api_upload_extract = api.api + "file/upload_extract";
        //文件上传
        var api_file_uploader = api.api + "file/uploader";
        //导入数据
        var check_stunum_api = api.api + "Indexmaintain/bybg_check_stunum";
        //获取已有学生数据
        var get_exist_students_api = api.api + "Indexmaintain/get_stunum_by_gradeid";
        //查看学生pdf或者word
        var look_up_detail_api = api.api + "Indexmaintain/query_bybg_pdf";
        //获取文件地址
        var url_file_api = api.api + "file/get";
        avalon.filters.state_filter = function (state) {
            var str = '';
            if (state == 0) {
                str = '未发布';
                return str;
            }
            if (state == 5) {
                str = '已归档';
                return str;
            }
            str = '已发布';
            return str;
        }
        var avalon_define = function () {
                var vm = avalon.define({
                        $id: "graduation_result_view",
                        //登陆者基本信息
                        user_info:{},
                        //登陆者身份:0：管理员；1：教师；2：学生；3：家长
                        user_type:'',
                        //区县集合
                        area_list: [],
                        area_info: '',
                        //学校集合
                        school_list: [],
                        school_info: '',
                        //年级集合
                        grade_list: [],
                        //年级remark
                        grade_remark:'',
                        //年级信息
                        grade_info: '',
                        //班级集合
                        class_list: '',
                        class_info: '',
                        //等级列表
                        rank_list: [],
                        //学期开始时间
                        semester_start: '',
                        //学期结束时间
                        semester_end: '',
                        //发布状态:0-未发布；1-已发布
                        release_type: 0,
                        //列表数据请求参数
                        req_data: {
                            //number	年级id
                            grade_id: '',
                            class_id: '',
                            //string	要筛选的评价等级A,B,C,D
                            rank: '',
                            //是否归档	number	1，已归档0，未归档
                            is_file:'',
                            //是否发布	number	1，已发布，0未发布
                            is_publish:'',
                            //学生学号
                            stu_num:'',
                            offset:0,
                            rows:9999,
                        },
                        //文件名
                        fileName:"",
                        //上传等级
                        uploadForm:{
                            grade_id:'',
                        },
                        // 模态框
                        modal: {
                            id: "",
                            title: "",
                            info: "",
                            url: "",
                            msg: ""
                        },
                        //导入等级返回数据
                        upload_rank_return:[],
                        //发布、撤销发布参数
                        release_data:{
                            grade_id:'',
                            //发布=1，撤销发布=0
                            is_publish:'',
                            //格式 = "'A','B','C','D'"
                            rank:'',
                            //年级id
                            grade_id:'',
                            //公示等级		A,B,C,D
                            gsdj:''
                        },
                        //发布的等级
                        level:[],
                        //列表表头
                        tbodyThead: [],
                        //列表数据
                        get_info: [],
                        //有问题的文件
                        error_files: [],
                        //导入成功数量
                        successCount: 0,
                        //可以导入的数据
                        right_data: [],
                        //加载进度
                        index:'',
                        //学校id
                        school_id:'',
                        cb: function () {
                            var self = this;
                            data_center.uin(function (data) {
                                var tUserData = JSON.parse(data.data["user"]);
                                self.user_info = tUserData;
                                self.user_type = data.data.user_type;
                                var city = tUserData.city;
                                var fk_school_id = tUserData.fk_school_id;
                                //区县
                                ajax_post(api_get_arealist, {city: city}, self);
                            });
                            this.import_file();
                        },

                        //导出
                        export: function () {
                            if(this.grade_remark != '九年级'){
                                toastr.warning('当前年级不是九年级，不能生成毕业报告！');
                                return;
                            }
                            var token = sessionStorage.getItem('token');
                            var id = this.grade_info.split('|')[0];
                            //http://127.0.0.1:8080/Indexmaintain/export_bybg_evaluate_result?
                            // grade_id=37&district_id=&
                            // school_id=&class_id=&
                            // rank=&token=f8e322b4d4474f6ba8ce35e20c35feb5
                            var dist_id = base_filter(cloud.area_list(), "district", this.area_info)[0].id;
                            var url = api_export_bybg + '?grade_id=' + id + '&district_id=' + dist_id + "&school_id="+ this.school_id + "&class_id="+   this.req_data.class_id+ '&rank=' + '&token=' + token;
                            window.open(url);
                        },
                        //区县
                        areaChange: function () {
                            this.school_list=[];
                            this.grade_list=[];
                            this.rank_list=[];
                            this.class_list=[];
                            this.req_data.grade_id='';
                            this.req_data.class_id='';
                            this.req_data.rank='';
                            ajax_post(api_get_school, {district: this.area_info}, this);
                        },
                        //学校
                        schoolChange: function () {
                            this.grade_list=[];
                            this.rank_list=[];
                            this.class_list=[];
                            this.req_data.grade_id='';
                            this.req_data.class_id='';
                            this.req_data.rank='';
                            var id = this.school_info.split('|')[0];
                            this.school_id=id;
                            ajax_post(api_school_grade, {school_id: id}, this);
                        },
                        //切换年级
                        gradeChange: function () {
                            this.get_info = [];
                            this.rank_list=[];
                            var grade_id = this.grade_info.split('|')[0];
                            var list = this.grade_list;
                            var remark = '';
                            for(var i=0;i<list.length;i++){
                                var id = list[i].id;
                                if(grade_id == id){
                                    remark = list[i].remark;
                                    this.grade_remark = remark;
                                    break;
                                }
                            }
                            if(remark != '九年级'){
                                toastr.warning('当前年级不是九年级，不能生成毕业报告！');
                                return;
                            }
                            this.class_list=[];
                            this.req_data.class_id='';
                            this.req_data.rank='';
                            var school_id = Number(this.school_info.split('|')[0]);
                            this.req_data.grade_id = grade_id;
                            ajax_post(api_get_class, {fk_school_id: school_id, fk_grade_id: parseInt(grade_id)}, this);
                        },
                        //班级
                        classChange: function () {
                            if(this.grade_remark != '九年级'){
                                toastr.warning('当前年级不是九年级，不能生成毕业报告！');
                                return;
                            }
                            this.rank_list=[];
                            this.req_data.rank='';
                            this.req_data.class_id = this.class_info.split('|')[0];
                            //等级
                            ajax_post(api_rank_count, {c_gradeid: parseInt(this.req_data.grade_id)}, this)
                        },
                        //等级切换
                        rankChange:function(){
                            this.get_title();
                        },
                        //发布
                        release_click: function (data) {
                            this.release_data.grade_id=this.grade_info.split('|')[0];
                            this.release_data.is_publish=1;
                            var ranks='';
                            var gsdj='';
                            for(var i=0;i<this.level.length;i++){
                                if(i==this.level.length-1){
                                    // ranks=ranks+this.level[i];
                                    ranks=ranks+"'"+this.level[i]+"'";
                                    gsdj+=this.level[i];
                                }else{
                                    ranks=ranks+"'"+this.level[i]+"'"+',';
                                    gsdj+=this.level[i]+',';
                                }
                            }
                            this.release_data.rank=ranks;
                            this.release_data.gsdj=gsdj;
                            if(this.release_data.rank!=''){
                                //发布
                                ajax_post(api_bypj_publish,this.release_data.$model,this);
                            }else{
                                toastr.warning('请选择需要公示的等级')
                            }
                        },
                        //撤销发布
                        revoke_click: function (data) {
                            this.release_data.grade_id=this.grade_info.split('|')[0];
                            this.release_data.is_publish=0;
                            this.release_data.rank='';
                            this.release_data.gsdj='';
                            //判断能否撤销发布
                            ajax_post(api_revoke_publish,{grade_id: this.release_data.grade_id},this);
                            // //撤销发布
                            // ajax_post(api_bypj_publish,this.release_data.$model,this);
                        },
                        //结果查看
                        get_table_data: function () {
                            this.get_info = [];
                            ajax_post(api_result_view, this.req_data.$model, this);
                        },
                        //导入等级
                        rank_import:function(){
                            if(this.grade_remark != '九年级'){
                                toastr.warning('当前年级不是九年级，不能生成毕业报告！');
                                return;
                            }
                            $("#file").val("");
                            this.fileName="";
                            this.modal.msg = "";
                            $("#file-uploading").modal({
                                closeOnConfirm: false
                            });
                            // ajax_post(api_bypj_import,{},this);
                        },
                        //导入等级上传
                        uploading:function(){
                            var files=this.fileName;
                            // var subFile = files.substring(files.indexOf(".") + 1, files.length);
                            var a=files.split(""); //先拆分成数组
                            var b=files.split("").reverse(); //再反转，但还是数组
                            var c=files.split("").reverse().join("");//最后把数组变成字符串
                            var subFile=c.substring(0,c.indexOf("."));
                            if (subFile == "xslx" || subFile == "slx") {
                                this.uploadForm.grade_id    = this.req_data.grade_id;
                                this.modal.msg = "正在上传，请勿取消";
                                fileUpload(api_bypj_import,this);
                            } else {
                                this.modal.msg = "请上传Excel文件";
                            }
                        },
                        //下载模板
                        down_score:function(){
                            var grade_id=this.req_data.grade_id;
                            var token = sessionStorage.getItem('token');
                            window.open(location.origin+'/api/Indexmaintain/graduation_evaluation_excel_template?grade_id='+grade_id+ '&token=' + token);
                            // window.open('http://pj.xtyun.net/api/Indexmaintain/graduation_evaluation_excel_template?grade_id='+grade_id+ '&token=' + token);
                        },
                        on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                            if (is_suc) {
                                switch (cmd) {
                                    //区县
                                    case api_get_arealist:
                                        this.complete_get_arealist(data);
                                        break;
                                    // 学校
                                    case api_get_school:
                                        this.complete_get_school(data);
                                        break;
                                    //获取年级
                                    case api_school_grade:
                                        this.complete_school_grade(data);
                                        break;
                                    // 获取班级
                                    case api_get_class:
                                        this.complete_get_class(data);
                                        break;
                                    //等级个数
                                    case api_rank_count:
                                        this.complete_rank_count(data);
                                        break;
                                    //    表头
                                    case get_title_api:
                                        this.deal_table_titles(data);
                                        break;
                                    //结果数据查看
                                    case api_result_view:
                                        this.complete_result_view(data);
                                        break;
                                    //    导入等级
                                    case api_bypj_import:
                                        this.complete_bypj_import(data);
                                        break;
                                    // 查询已公示的等级
                                    case api_public_rank:
                                        this.complete_public_rank(data);
                                        break;
                                    //    判断能否撤销发布
                                    case api_revoke_publish:
                                        this.complete_revoke_publish(data);
                                        break;
                                    //    发布、撤销发布
                                    case api_bypj_publish:
                                        this.complete_bypj_publish(data);
                                        break;


                                    case api_file_uploader:
                                        this.import_data(data);
                                        break;
                                    case api_upload_extract:
                                        layer.closeAll();
                                        this.import_data(data);
                                        break;
                                    case check_stunum_api:
                                        this.deal_stunum(data);
                                        break;
                                    case get_exist_students_api:
                                        this.deal_exit_stu(data);
                                        break;
                                    case look_up_detail_api:
                                        this.deal_file_detail(data);
                                        break;
                                }
                            } else {
                                layer.close(this.index);
                                toastr.error(msg);
                                layer.closeAll();
                            }

                        },
                        //区县
                        complete_get_arealist: function (data) {
                            this.area_list = data.data.list;
                            this.area_info = this.area_list[0].district;
                            ajax_post(api_get_school, {district: this.area_info}, this);
                        },
                        //学校
                        complete_get_school: function (data) {
                            this.school_list = data.data.list;
                            this.school_info = this.school_list[0].id + '|' + this.school_list[0].schoolname;
                            var id = this.school_list[0].id;
                            this.school_id=id;
                            ajax_post(api_school_grade, {school_id: id}, this);
                        },
                        //年级
                        complete_school_grade: function (data) {
                            var list = data.data.list;
                            this.grade_list = sort_by(list, ["+grade_name"]);
                            this.grade_info = this.grade_list[0].id + '|' + this.grade_list[0].grade_name;
                            this.grade_remark = this.grade_list[0].remark;
                            var id = Number(this.grade_info.split('|')[0]);
                            var school_id = Number(this.school_info.split('|')[0]);
                            this.req_data.grade_id = id;
                            //班级
                            ajax_post(api_get_class, {fk_school_id: school_id, fk_grade_id: id}, this);
                        },
                        //班级
                        complete_get_class: function (data) {
                            this.class_list = data.data;
                            this.class_info = this.class_list[0].id + '|' + this.class_list[0].class_name;
                            this.req_data.class_id = Number(this.class_info.split('|')[0]);
                            var id = Number(this.grade_info.split('|')[0]);
                            //等级个数
                            ajax_post(api_rank_count, {c_gradeid: id}, this)
                        },
                        //等级
                        complete_rank_count: function (data) {
                            if (data.data && data.data.length != 0) {
                                this.rank_list=data.data.list;
                            }
                            //查询当前公示等级
                            ajax_post(api_public_rank,{grade_id: this.req_data.grade_id},this);
                        },
                        //查询已公示的等级
                        complete_public_rank:function(data){
                            if(data.data!=null){
                                this.level=data.data.GSDJ.split(',');
                                //发布
                                this.release_type=1;
                                // console.log(this.level);
                            }
                            //表头
                            this.get_title();
                        },
                        //数据
                        complete_result_view: function (data) {
                            if (!data.data || !data.data.list || data.data.list.length == 0){
                                layer.close(this.index);
                                return;
                            }
                            var list = data.data.list;
                            var list_length = list.length;
                            for (var i = 0; i < list_length; i++) {
                                var index_value = [];
                                if (list[i].index_value == null || list[i].index_value == '') {
                                    var table_title_length = this.tbodyThead.length;
                                    for (var k = 0; k < table_title_length; k++) {
                                        var str = '';
                                        index_value.push(str);
                                    }
                                } else {
                                    var arr = list[i].index_value.split(',');
                                    if(arr[arr.length-1] == ''){
                                        arr.pop();
                                        index_value = arr ;
                                    }else{
                                        index_value = arr;
                                    }
                                }
                                list[i].values = index_value;
                            }
                            this.get_info = list;
                            layer.close(this.index);
                        },
                        //上传文件
                        complete_bypj_import:function (data) {
                            if(data.data!=null || data.data!=[] || data.data.length!=0){
                                this.modal.msg='';
                                this.upload_rank_return=data.data.list;
                            }else{
                                $("#file-uploading").modal({
                                    closeOnConfirm: true
                                });
                                //查看列表数据
                                this.get_table_data();
                            }
                        },
                        complete_revoke_publish:function(data){
                            var bool=data.data;
                            if(bool==false){
                                //撤销发布
                                ajax_post(api_bypj_publish,this.release_data.$model,this);
                            }else{
                                layer.alert('当前数据已归档，不能进行撤销', {
                                    closeBtn: 0
                                    ,anim: 4 //动画类型
                                });
                            }
                        },
                        //发布、撤销发布
                        complete_bypj_publish:function(data){
                            if(this.release_data.is_publish==1 && data.message=='OK'){//发布
                                this.release_type=1
                            }else if(this.release_data.is_publish==0 && data.message=='OK'){//撤销发布
                                this.release_type=0;
                                this.level=[];
                            }
                            ajax_post(api_result_view, this.req_data.$model, this);
                            toastr.warning(data.message);
                        },
                        //页面跳转stu_evaluate_report传的参数
                        check: function (el) {
                            console.log(el);
                            var grade_name = this.grade_info.split('|')[1];
                            //传参,参考g_list
                            var portfolio_stu = el.stu_id + '|' + grade_name + '|'
                                + el.grade_id + '|' + el.school_id + '|'
                                +'' + '|' + this.user_info.province + '|' + this.user_info.city
                                + '|' + this.area_info + '|' + el.class_id + '|' + el.stu_num;
                            //	数据来源 （1系统生成 2外部导入）
                            if (el.data_source == 1) {
                                if(el.is_file == 1 || this.user_type == '0'){//管理员身份可以查看，其它身份归档才能看
                                    var jm_url = bs64.encoder(portfolio_stu);
                                    window.location = '#graduation_file?portfolio_stu='+jm_url;
                                }else{
                                    toastr.warning('该生还未生成毕业评价数据！');
                                }
                            }else if (el.data_source == 2) {
                                ajax_post(look_up_detail_api, {
                                    grade_id: el.grade_id,
                                    stu_num: el.stu_num
                                }, this);
                            }

                        },

                        //--------------------------------------
                        //获取库中已存在的学生
                        get_exit_student: function () {
                            ajax_post(get_exist_students_api, {grade_id: this.req_data.grade_id}, this)
                        },
                        //处理获取的文件路径
                        deal_file_detail: function (data) {
                            if(!data.data)
                                toastr.error(data.message);
                            return;
                            var url = data.data.file_path;
                            var path = url_file_api+ "?token=" + sessionStorage.getItem("token") + "&img=" + url;
                            window.open(path);
                        },
                        //处理库中存在的学生
                        deal_exit_stu: function (data) {
                            if (!data.data || !data.data.list)
                                return;
                            var list_length = data.data.list.length;
                            var right_data_length = this.right_data.length;
                            //判断数据中是否有相同的
                            var has_same = false;
                            var difference_stu = [];
                            for (var i = 0; i < right_data_length; i++) {
                                var guid = this.right_data[i].file_name;
                                //判断当前学生是否相同
                                var same_stu = false;
                                for (var j = 0; j < list_length; j++) {
                                    if (guid == data.data.list[j].stu_num) {
                                        has_same = true;
                                        same_stu = true;
                                        break;
                                    }
                                }
                                //将不相同的学生存入一个数组
                                if (!same_stu) {
                                    difference_stu.push(this.right_data[i]);
                                }
                            }
                            //如果有学生相同
                            if (has_same) {
                                var self = this;
                                var confirm_layer = layer.confirm('导入的数据与库中的数据存在相同', {
                                    btn: ['覆盖', '合并', '取消'] //按钮
                                }, function () {
                                    //如果覆盖。将所有数据传过去
                                    self.cover_data();
                                    layer.close(confirm_layer)
                                }, function () {
                                    //如果合并，只传不相同的学生
                                    var new_data = JSON.stringify(difference_stu);
                                    ajax_post(check_stunum_api, {
                                        grade_id: self.req_data.grade_id,
                                        data: new_data
                                    }, self);
                                    layer.close(confirm_layer)
                                }, function () {
                                    layer.close(confirm_layer)
                                });
                            } else {
                                //如果没有相同的学生，将所有数据传过去
                                this.cover_data();
                            }
                        },
                        //覆盖
                        cover_data: function () {
                            var new_data = JSON.stringify(this.right_data);
                            ajax_post(check_stunum_api, {
                                grade_id: this.req_data.grade_id,
                                data: new_data
                            }, this);
                        },
                        //获取table表头
                        get_title: function () {
                            // this.index = layer.load(1, {shade: [0.1,'#fff']});//0.1透明度的白色背景
                            ajax_post(get_title_api, {
                                grade_id: this.req_data.grade_id,
                                // school_id:this.school_id,
                            }, this)
                        },
                        //处理表头数据
                        deal_table_titles: function (data) {
                            if (!data.data || data.data.zb_name == '')
                                return;
                            this.tbodyThead = data.data.zb_name.split(',');
                            this.get_table_data();
                        },
                        //导入文件
                        import_file: function () {
                            // if(this.grade_remark != '九年级'){
                            //     toastr.warning('当前年级不是九年级，不能生成毕业报告！');
                            //     return;
                            // }
                            var $galleryImg = $("#import-file");
                            var self = this;
                            $galleryImg.on("change", function (e) {
                                var src, url = window.URL || window.webkitURL || window.mozURL, files = e.target.files;
                                for (var i = 0, len = files.length; i < len; ++i) {
                                    var file = files[i];
                                    if (url) {
                                        src = url.createObjectURL(file);
                                    } else {
                                        src = e.target.result;
                                    }
                                    var file_name_arr = file.name.split('.');
                                    var suffix_name = file_name_arr[file_name_arr.length - 1];
                                    suffix_name = suffix_name.toLowerCase();
                                    var fm = new FormData();
                                    fm.append("file", file, file.name);
                                    fm.append("note", "from weixin");
                                    fm.append("token", window.sessionStorage.getItem("token"));
                                    if (suffix_name != 'zip' && suffix_name != 'pdf' && suffix_name != 'doc' && suffix_name != 'docx') {
                                        toastr.error('所选文件不正确');
                                        return;
                                    }
                                    if (suffix_name == 'zip') {
                                        layer.load(1, {
                                            shade: [0.1, '#fff'] //0.1透明度的白色背景
                                        });
                                        fileUpload(api_upload_extract, self, fm);
                                        $galleryImg.val('');
                                    } else {
                                        fileUpload(api_file_uploader, self, fm);
                                        $galleryImg.val('');
                                    }
                                }


                            })
                        },
                        //导入数据
                        import_data: function (data) {
                            var new_data = [];
                            this.error_files = [];
                            var ext = '';
                            var is_right_ext = true;
                            if (!Array.isArray(data.data)) {
                                //判断文件后缀
                                ext = data.data.ext;
                                if (ext != '.pdf' && ext != '.doc' && ext != '.docx') {
                                    toastr.error('所选文件后缀名不正确');
                                    return;
                                }
                                new_data.push(data.data);
                            } else {
                                // new_data = data.data;
                                var data_length = data.data.length;
                                for (var i = 0; i < data_length; i++) {
                                    //判断文件后缀
                                    ext = data.data[i].ext;
                                    if (ext != '.pdf' && ext != '.doc' && ext != '.docx') {
                                        //存错误的文件，方便显示
                                        this.error_files.push(data.data[i].inner_name);
                                        //判断是否有错误文件
                                        is_right_ext = false;
                                        break;
                                    }
                                    new_data.push(data.data[i])
                                }
                            }
                            var self = this;
                            //如果有错误文件，给出提示
                            this.right_data = new_data;
                            if (!is_right_ext) {
                                var current_layer = layer.confirm('压缩包中有文件不正确，是否确定导入？', {
                                    btn: ['是', '否'] //按钮
                                }, function () {
                                    self.get_exit_student();
                                    layer.close(current_layer);
                                }, function () {

                                });
                            } else {
                                self.get_exit_student();
                            }
                        },
                        //处理数据导入结果
                        deal_stunum: function (data) {
                            if (!data.data)
                                return;
                            //上传成功过条数
                            this.successCount = data.data.successCount;
                            if (!data.data.errorInfo)
                                return;
                            var errorInfo = data.data.errorInfo;
                            var error_list_length = errorInfo.list.length;
                            for (var i = 0; i < error_list_length; i++) {
                                //将上传失败的文件存入错误文件
                                this.error_files.push(errorInfo.list[i]);
                            }
                            var self = this;
                            //显示上传结果
                            layer.open({
                                type: 1,
                                skin: 'layui-layer-rim', //加上边框
                                area: ['420px', '240px'], //宽高
                                content: $('.error-layer'),
                                cancel: function () {
                                    self.get_table_data();
                                }
                            });

                        }
                    }
                );
                vm.$watch("onReady", function () {
                    this.cb();
                });
                return vm;
            }
        ;
        return {
            view: html,
            define: avalon_define
        }
    })
;