define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('achievement', 'new_school_achievement/new_school_achievement', 'html!'),
        C.Co('achievement', 'new_school_achievement/new_school_achievement', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM('three_menu_module'),
        C.CMF("formatUtil.js")
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, three_menu_module, fmt) {
        //审核公式管控-查询
        var api_query_pub = api.api + 'GrowthRecordBag/publicity_audit_query';
        //上学业成绩
        var api_uploader_cj = api.api + 'score/upload_score_file_v2';
        //整个年级艺术测评成绩导入
        var api_uploader_cj_v2 = api.api + 'score/upload_score_file_v2';
        //获取成绩接口
        var api_score_list = api.api + 'render/table_agent_render';
        //获取进度接口
        var api_get_progress = api.api + 'score/get_up_progress';

        var avalon_define = function (args) {

            var subject_id = args.sid;
            if (subject_id == undefined) {
                subject_id = "1000"
            }
            avalon.filters.code_format = function (str) {
                return '...' + str.substring(16);
            };
            var semester_full = [];
            var grade_list = [];
            var vm = avalon.define({
                $id: "new_school_achievement",
                sid:"",
                //用户等级
                user_level: "",
                //公示按钮
                show_public_click: true,
                grade_list: [],
                class_list: [],
                sem_list: [],
                //学期名称
                sem_name:'',
                head_value: {grade: "请选择年级", class: "请选择班级", semester: "请选择学期"},
                form_list_score: {
                    __hash__:false,
                    fk_class_id: "",
                    fk_grade_id: "",
                    fk_school_id: "",
                    phase: "",
                    semester_id: "",
                    subject_id: subject_id,
                    province: "",
                    city: "",
                    district: "",
                    class_name: "",
                    grade_name: "",
                    code: "",
                    name: "",
                    offset:0,
                    rows: 15,
                },
                //表头
                header: [{
                    "title": "序号",
                    "type": "index",
                    "from": "id"
                }, {
                    "title": "姓名",
                    "type": "text",
                    "from": "name"
                }, {
                    "title": "学籍号",
                    "type": "truncate",
                    "from": "code",
                    "before":3,
                    "behind":3
                }],
                pipe: [
                    {
                        "type": "query",
                        // "url": "base/baseUser/studentlist.action",
                        "url": "base/student/class_used_stu",
                        "pms": [
                            // "fk_class_id@int", "rows@int", "offset@int", "name@str", "code@str"
                            "fk_class_id@int"
                        ],
                        "path": "data",
                        "save_as": "student"
                    }, {
                        "type": "query",
                        "url": "score/list_score_v2",
                        "pms": [
                            "fk_class_id@str",
                            "subject_id@str",
                            "fk_grade_id@str",
                            "phase@str",
                            "fk_school_id@str",
                            "year_end@str",
                            "year_start@str",
                            "semester_id@str"
                        ],
                        "path": "data",
                        "save_as": "score"
                    },
                    {
                        "type": "merge",
                        "src": "score.list",
                        "dst": "student.list",
                        "src_key": [
                            "guid"
                        ],
                        "dst_key": [
                            "guid"
                        ]
                    },
                    {
                        "type": "update_head",
                        "from": "score.columns"
                    },
                    {
                        "type": "out",
                        "out": [
                            {
                                "src": "student.list",
                                "as": "body"
                            },
                            {
                                "src": "student.count",
                                "as": "count"
                            },
                            {
                                "src": "pms_pool.current_page",
                                "as": "current_page"
                            },
                            {
                                "src": "pms_pool.rows",
                                "as": "rows"
                            }
                        ]
                    }
                ],
                //表头数据
                head_list:[],
                //成绩列表
                score_list:[],
                // 模态框 -- 批量上传那些事。
                file_name: "",
                modal: {
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: ""
                },
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had:false,
                //分页开始
                // 数据总数
                count: "",
                /*总页数*/
                totalPage: "",
                // 计算分页数组
                totalPageArr: [],
                /*当前是第几页*/
                currentPage: 1,
                //跳转页码
                pageNo: "",
                //获取总页数+当前显示分页数组
                set_total_page:function(count){
                    if(count==0){
                        this.totalPageArr=new Array(this.totalPage);
                    }else{
                        //向上取证
                        this.totalPage=Math.ceil(count/this.form_list_score.rows);
                        this.get_page_ary(this.currentPage,this.totalPage);
                    }
                },
                //计算分页数组(前提count>0)
                get_page_ary:function(c_page,t_page){//当前页数，总页数
                    this.totalPageArr=[];
                    var p_ary=[];
                    if(t_page<=5){//总页数小于5
                        for(var i=0;i<t_page;i++){
                            p_ary[i]=i+1;
                        }
                    }else if(c_page==0 && t_page>5){
                        for(var i=0;i<5;i++){
                            p_ary[i]=i+1;
                        }
                    }else if(c_page+2>=t_page){//
                        var base=t_page-4;
                        for(var i=0;i<5;i++){
                            p_ary[i]=base+i;
                        }
                    }else{//c_page+2<t_page
                        //显示的第一个页数
                        var base=Math.abs(c_page-2)==0 ? 1 : Math.abs(c_page-2);
                        for(var i=0;i<5;i++){
                            p_ary[i]=base+i;
                        }
                    }
                    this.totalPageArr=p_ary;
                    // console.log(this.totalPageArr);
                },
                //当前页面跳转
                currentPageDate:function(num){
                    this.currentPage=num;
                    this.form_list_score.offset=(num-1)*this.form_list_score.rows;
                    //获取数据
                    this.query_score();
                },
                //序号改变
                set_index:function(idx,c_page){
                    var index=idx+(c_page-1)*this.form_list_score.rows;
                    return index;
                },
                //跳转操作
                pageNOSure:function(num){
                    if(num<1){
                        layer.alert('请输入正确的页码', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                    }else if(num>this.totalPage){
                        layer.alert('超出总页数', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                    }else{
                        this.currentPage=Math.ceil(num);
                        this.form_list_score.offset=(this.currentPage-1)*this.form_list_score.rows;
                        //获取数据
                        this.query_score();
                    }
                },
                //分页结束
                //初始化
                init: function () {
                    //学业成绩-1000；艺术测评-10000
                    if(args.sid == 10000){
                        this.sid = 10000;
                    }
                    setTimeout(function (args) {
                        vm.user_level = cloud.user_level();
                        if(vm.user_level != '4'){
                            vm.show_public_click = false;
                        }
                        vm.form_list_score.fk_school_id = String(cloud.user_depart_id());
                        vm.form_list_score.province = cloud.user_province();
                        vm.form_list_score.city = cloud.user_city();
                        vm.form_list_score.district = cloud.user_district();
                        grade_list = cloud.auto_grade_list({});
                        vm.grade_list = any_2_select(grade_list, {name: "grade_name", value: ["grade_id"]});
                        vm.change_grade(vm.grade_list[0], 0);
                        vm.query_score();
                    }, 0);
                },
                change_grade: function (value, index) {
                    this.form_list_score.offset = 0;
                    this.currentPage = 1;
                    var grade_ls = grade_list;
                    var ori_class = grade_ls[index].class_list;

                    // 获取班级列表
                    var sel_class_ls = any_2_select(ori_class, {name: "class_name", value: ["class_id"]})
                    this.class_list = sel_class_ls;
                    // this.change_class(sel_class_ls[0], 0);

                    // 获取年级的学期列表
                    semester_full = cloud.grade_semester_list({grade_id: Number(value.value)});
                    this.sem_list = any_2_select(semester_full, {name: "semester_name", value: ["id"]});
                    this.form_list_score.grade_id = value.value;
                    // this.change_sems(this.sem_list[0], 0);

                    // 查询参数
                    this.form_list_score.fk_grade_id = value.value;
                    this.form_list_score.grade_name = value.name;
                    this.form_list_score.fk_class_id = sel_class_ls[0].value;
                    this.form_list_score.class_name = sel_class_ls[0].name;
                    this.form_list_score.semester_id = this.sem_list[0].value;
                    this.sem_name = this.sem_list[0].name;
                    this.form_list_score.phase = (semester_full[0].semester_index - 1).toString();

                    // 修改对应显示信息
                    data_center.scope("score_edit_opt_grade", function (p) {
                        p.head_value = value.name;
                    });
                    data_center.scope("score_edit_opt_class", function (p) {
                        p.head_value = ori_class[0].class_name;
                    });
                    data_center.scope("score_edit_opt_sem", function (p) {
                        p.head_value = semester_full[0].semester_name;
                    });
                    // //调用查询数据接口
                    // this.query_score();
                },
                change_class: function (value, index) {
                    this.form_list_score.offset = 0;
                    this.currentPage = 1;
                    this.form_list_score.fk_class_id = value.value;
                    this.form_list_score.class_name = value.name;
                    // //调用查询数据接口
                    // this.query_score();
                },
                change_sems: function (value, index) {
                    this.form_list_score.offset = 0;
                    this.currentPage = 1;
                    this.form_list_score.semester_id = value.value;
                    this.sem_name = value.name;
                    this.form_list_score.phase = (semester_full[index].semester_index - 1).toString();
                    // //调用查询数据接口
                    // this.query_score();
                },
                //查询列表数据
                query_score: function () {
                    this.score_list = [];
                    this.head_list = [];
                    this.count = 0;
                    this.data_had = false;
                    ajax_post(api_score_list,{
                        header:this.header,
                        pipe:this.pipe,
                        pms_pool:this.form_list_score
                    },this);
                },
                //录入点击
                input_score: function () {
                    if(sessionStorage.getItem('xy_stu_code')){
                        sessionStorage.removeItem('xy_stu_code');
                    }
                    //公式管控
                    ajax_post(api_query_pub, {}, this);
                },
                //编辑修改
                score_edit:function(index,el){
                    if(el.current_process == '已归档'){
                        layer.alert('数据已归档，如需修改，请联系管理员先撤销公示', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                        return;
                    }
                    sessionStorage.setItem('xy_stu_code',el.code+'|'+el.name+'|'+el.guid);
                    //公式管控
                    ajax_post(api_query_pub,{},this);
                },
                isEmptyObject:$.isEmptyObject,
                //公示提交
                make_pub: function () {
                    toastr.info('发布公示中，请稍等');
                    var form = {
                        semester_id: vm.form_list_score.semester_id + '',
                        fk_school_id:vm.form_list_score.fk_school_id + '',
                        fk_grade_id:vm.form_list_score.fk_grade_id + '',
                        subject_id:subject_id.toString(),
                    };
                    if(!cloud.is_school_leader()){
                        form["fk_class_id"] = vm.form_list_score.fk_class_id + ''
                    }else{
                        form["fk_class_id"] = "";
                    }
                    cloud.make_pub_xy(form, function (url, args, data, is_suc, msg) {
                        if(!is_suc){
                            toastr.error(msg);
                        }else{
                            toastr.success("公示成功");
                            vm.query_score();
                        }
                    });
                },
                //公示按钮
                public_click: function (el) {
                    var self = this;
                    var unvalid_score_list = base_filter(this.score_list, "has_score", false);
                    var msg_unvalid = join_ex(unvalid_score_list, ",", function (v, i) {
                        return v.name;
                    });
                    if (unvalid_score_list.length != 0) {
                        layer.confirm(msg_unvalid + ' 这' + '【' + unvalid_score_list.length + '】' + '位同学还没有上传成绩,是否继续进行公示', {
                            btn: ['继续', '取消'] //按钮
                        }, function () {
                            vm.make_pub();
                        }, function () {
                            layer.closeAll();
                        });
                    } else {
                        vm.make_pub();
                    }
                },
                //撤销公示
                cancel_click:function(){
                    layer.confirm('是否撤销公示', {
                        btn: ['继续', '取消'] //按钮
                    }, function () {
                        var form = {
                            semester_id: vm.form_list_score.semester_id + '',
                            fk_school_id: vm.form_list_score.fk_school_id+ '',
                            fk_grade_id: vm.form_list_score.fk_grade_id+ '',
                            subject_id:subject_id.toString(),
                        };
                        if(!cloud.is_school_leader()){
                            form["fk_class_id"] = vm.form_list_score.fk_class_id + ''
                        }else{
                            form["fk_class_id"] = "";
                        }
                        layer.closeAll();
                        toastr.info('撤销公示中，请稍等');
                        cloud.make_cancel_pub_xy(form, function (url, args, data, is_suc, msg) {
                            if(!is_suc){
                                toastr.error(msg);
                            }else{
                                toastr.success("撤销公示成功");
                                vm.query_score();
                            }
                        });
                    }, function () {
                        layer.closeAll();
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //公示审核管控
                            case api_query_pub:
                                this.complete_query_pub(data);
                                break;
                            // 上传
                            case api_uploader_cj:
                                // $("#file-uploading").modal({
                                //     closeOnConfirm: true
                                // });
                                // window.location.reload();
                                //this.checkBtn();
                                break;
                            // 上传
                            case api_uploader_cj_v2:
                                // $("#file-uploading").modal({
                                //     closeOnConfirm: true
                                // });
                                // window.location.reload();
                                //this.checkBtn();
                                break;
                            //查询成绩列表
                            case api_score_list:
                                this.complete_score_list(data);
                                break;
                            //获取进度接口
                            case api_get_progress:
                                this.complete_get_progress(data);
                                break;
                        }
                    }else{
                        if(cmd == api_uploader_cj || cmd == api_uploader_cj_v2){

                        }else{
                            toastr.error(msg);
                        }
                    }
                },
                //公式光控
                complete_query_pub: function (data) {
                    var list = data.data;
                    if (list.length > 0) {
                        for (var i = 0; i < list.length; i++) {
                            //mkid（模块id）：1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                            //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                            //sfsh（是否审核）：0否1是2学生录入教师审3教师录入评价小组审
                            //xsqr（学生确认）：0否1是
                            var mkid = list[i].mkid;
                            if (mkid == 4) {//学业成绩
                                location.href = "#sch_ach_entering?fk_class_id=" +
                                    this.form_list_score.fk_class_id + "&class_name=" +
                                    this.form_list_score.class_name + "&fk_grade_id=" +
                                    this.form_list_score.fk_grade_id+ "&grade_name=" +
                                    this.form_list_score.grade_name + "&fk_school_id=" +
                                    this.form_list_score.fk_school_id.toString() + "&semester_id=" +
                                    this.form_list_score.semester_id + "&sem_name=" +
                                    this.sem_name+ "&phase=" +
                                    this.form_list_score.phase  + "&sid=" + subject_id;
                                return;
                            }
                        }
                    }
                    layer.alert('市管理员公示审核管控还未设置', {
                        closeBtn: 0
                        , anim: 4 //动画类型
                    });
                },
                //下载模版
                down_score: function () {
                    var subject_id = this.form_list_score.subject_id;
                    var subject_name = 'msqmks';
                    var fk_school_id = this.form_list_score.fk_school_id;
                    var get_token = sessionStorage.getItem('token');
                    window.open(api.api+'score/down_score_template?subject_id=' + subject_id + "&subject_name=" + subject_name + "&fk_school_id=" + fk_school_id + '&token=' + get_token);
                },
                //批量导入
                uploading: function () {
                    var files = this.file_name;
                    // var subFile = files.substring(files.indexOf(".") + 1, files.length);
                    var a=files.split(""); //先拆分成数组
                    var b=files.split("").reverse(); //再反转，但还是数组
                    var c=files.split("").reverse().join("");//最后把数组变成字符串
                    var subFile=c.substring(0,c.indexOf("."));
                    if (subFile == "xslx" || subFile == "slx") {
                        // this.modal.msg = "正在上传，请勿取消";
                        if (subject_id == 10000 && this.user_level == 4) {//校领导上传艺术测评
                            var old_fki =this.form_list_score.fk_class_id ;
                            this.form_list_score.fk_class_id = '';
                            fileUpload(api_uploader_cj_v2, this);
                            //获取进度
                            setTimeout(function(){
                                ajax_post(api_get_progress,{url:'upload_score_file_v2'},vm);
                            },1000);
                            this.form_list_score.fk_class_id = old_fki;
                        } else {
                            fileUpload(api_uploader_cj, this);
                            //获取进度
                            setTimeout(function(){
                                ajax_post(api_get_progress,{url:'upload_score_file_v2'},vm);
                            },1000);
                        }
                    } else {
                        this.error_has = true;
                        this.modal.msg = "请上传Excel文件";
                    }
                },
                uploadingModal: function () {
                    $("#file").val("");
                    this.file_name = "";
                    this.modal.msg = "";
                    this.error_has = false;
                    $("#file-uploading").modal({
                        closeOnConfirm: false
                    });

                },
                //'错误信息，请检查：'信息显示隐藏：true-显示，false-隐藏
                error_has:false,
                is_progress_show:false,
                progress_scale:'0%',
                // 进度接口
                complete_get_progress:function(data){
                    if(JSON.stringify(data.data) == '{}'){//错误信息提示
                        this.error_has = true;
                        this.is_progress_show = false;
                        // this.modal.msg = '请求过时';
                        return;
                    }else if(data.data.indexOf('%') == -1){//错误信息提示
                        this.error_has = true;
                        this.is_progress_show = false;
                        this.modal.msg = data.data;
                        return;
                    }
                    this.error_has = false;
                    this.modal.msg = '上传进度：' + data.data;
                    this.is_progress_show = true;
                    this.progress_scale = data.data;
                    if(data.data == "100.0%"){
                        window.location.reload();
                        return;
                    }
                    setTimeout(function(){
                        ajax_post(api_get_progress,{url:'upload_score_file_v2'},vm);
                    },5000);
                },
                //查询成绩列表
                complete_score_list:function(data){
                    this.data_had = true;
                    if(!data.data) return;
                    // this.count = data.data.count;
                    // //获取总页数+当前显示分页数组
                    // this.set_total_page(this.count);
                    this.head_list = data.data.score.columns;
                    // this.score_list = data.data.body;
                    this.score_list = this.deal_message(data.data.body,data.data.score.columns)
                },
                deal_message:function (list1,list2) {
                    for(var i=0,len=list1.length;i<len;i++){
                        var l1 = list1[i]
                        l1.values = [];
                        l1.index = this.set_index(i+1,this.currentPage)
                        l1.current_process = this.filter_progress(l1.current_process)
                        for(var j=0,len2= list2.length;j<len2;j++){
                            var l2 = list2[j];
                            var key  = l2.alias;
                            var value = '';
                            if(l2.score_type == 'nor' && l1[key]){
                                value = l1[key].score
                            }
                            if((l2.score_type== 'ABCD' || l2.score_type == 'pass')&& l1[key]){
                                value = l1[key].level
                            }
                            list1[i].values.push(value)
                        }
                    }
                    return list1;
                },
                filter_progress:function (str) {
                    if(str == '已提交' || str == '已修改'){
                        return '未公示';
                    }
                    if(str == '公示中' || str == '已归档'){
                        return str;
                    }
                    if(str == '公示结束'){
                        return '待审核';
                    }
                    if(str == '' || str == undefined || str == null){
                        return '未上传';
                    }
                }
            });
            vm.$watch("onReady", function () {
                $(".am-dimmer").css("display", "none");
                // this.cb();
            });
            vm.init();
            return vm;
        }


        return {
            view: html,
            define: avalon_define,
            repaint:true,
        }
    });