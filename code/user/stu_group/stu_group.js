/**
 * Created by Administrator on 2017/10/11.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("user", "stu_group/stu_group", "css!"),
        C.Co("user", "stu_group/stu_group", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM('three_menu_module'),
    ],
    function (jquery,avalon,layer,css,html,router,data_center,three_menu_module){
        //获取当前可操作的学年学期
        var api_get_semester = api.api + "base/semester/grade_opt_semester";
        //查询学生分组列表
        var api_check_stu_group =api.api +"everyday/list_student_group";
        //获取学生信息
        // var api_art_evaluation_get_student_info = api.PCPlayer + "baseUser/studentlist.action";
        var api_art_evaluation_get_student_info = api.api + "base/student/class_used_stu";
        //添加学生分组
        var api_add_stu_group = api.api + "everyday/add_group_student";
        //随机分组
        var api_random_group = api.api + "everyday/random_group";
        //删除当前分组行
        var api_delete_group = api.api + 'everyday/delete_group';
        var avalon_define=function(){
            var vm=avalon.define({
                $id:"stu_group",
                layer_index:"",
                semester_list:[],
                semester_info:"",
                grade_info:"",
                class_info:"",
                add_title:"",
                update_title:"",
                json:function (x) {
                    return JSON.parse(x);
                },
                modal_title:"",
                teach_class_list:[],
                class_list:[],
                grade_id:"",
                class_id:"",
                module_student_arr:[],
                year_start:"",
                year_end:"",
                //选择的学生
                checkbox_arr:[],
                //查询到的学生
                resp_stu:[],
                //渲染table数据
                table_info:[],
                //获取整个班级的学生
                stu_data:[],
                //添加学生分组
                add_stu_group:{
                    class_name:"",
                    fk_class_id:"",
                    fk_grade_id:"",
                    fk_school_id:"",
                    grade_name:"",
                    list:[],
                    number:"",
                    school_name:"",
                    year_end:"",
                    year_start:""
                },
                //修改学生分组
                update_stu_group:{
                    id:"",
                    stu_group_guid:"",//string
                    stu_group_name:""//string
                },
                //修改-可选择的学生
                update_module_student_arr:[],
                //手动分组是否首次点击确定:防止手动分组重复点击确定
                btn_has:true,
                //手动分组修改防止重复提交：true-可以点击，false-不能点击
                update_btn_has:true,
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        var userType = data.data.user_type;
                        if (userType == "1") {
                            var tUserData = JSON.parse(data.data["user"]);
                            cArr = tUserData.lead_class_list;
                            // cArr = [
                            //     {
                            //         "school_id": 2,
                            //         "school_name": "眉山市东坡区实验初级中学",
                            //         "grade_id": 36,
                            //         "grade_name": "初2015级",
                            //         "class_list": [
                            //             {
                            //             "class_id": 23,
                            //             "class_name": "006"
                            //             },{
                            //                 "class_id": 24,
                            //                 "class_name": "007"
                            //             }
                            //         ]
                            //     },{
                            //         "school_id": 2,
                            //         "school_name": "眉山市东坡区实验初级中学",
                            //         "grade_id": 37,
                            //         "grade_name": "初2017级",
                            //         "class_list": [
                            //             {
                            //                 "class_id": 1,
                            //                 "class_name": "001"
                            //             },{
                            //                 "class_id": 2,
                            //                 "class_name": "002"
                            //             }
                            //         ]
                            //     }
                            // ];
                            self.teach_class_list = cArr;
                            self.class_list=cArr[0].class_list;
                            self.add_stu_group.fk_grade_id = cArr[0].grade_id;
                            self.add_stu_group.fk_class_id = cArr[0].class_list[0].class_id;
                            self.grade_info = cArr[0].grade_name+'|' +cArr[0].grade_id;
                            self.class_info = cArr[0].class_list[0].class_name+'|' +cArr[0].class_list[0].class_id;
                            self.add_stu_group.grade_name = cArr[0].grade_name;
                            self.add_stu_group.class_name = cArr[0].class_list[0].class_name;
                            self.add_stu_group.fk_school_id = tUserData.fk_school_id;
                            self.add_stu_group.school_name = tUserData.school_name;
                        }
                        //获取当前可操作的学年学期
                        ajax_post(api_get_semester,{grade_id:self.add_stu_group.fk_grade_id},self);
                    });
                },
                //切换年级
                gradeChange: function (data) {
                    var grade_info = this.grade_info;
                    var get_grade_name = grade_info.split('|')[0];
                    var get_grade_id = grade_info.split('|')[1];
                    this.add_stu_group.grade_name = get_grade_name;
                    this.add_stu_group.fk_grade_id = get_grade_id;
                    for (var i = 0; i < this.teach_class_list.length; i++) {
                        if (get_grade_id == this.teach_class_list[i].grade_id) {
                            this.class_list = this.teach_class_list[i].class_list;
                            this.class_info = this.class_list[0].class_name+'|'+this.class_list[0].class_id
                            this.add_stu_group.fk_class_id = this.class_list[0].class_id;
                            this.add_stu_group.class_name = this.class_list[0].class_name;
                            //查询学生分组列表
                            ajax_post(api_check_stu_group,
                                {fk_class_id:this.add_stu_group.fk_class_id,
                                    year_start:this.add_stu_group.year_start,
                                    fk_grade_id:Number(this.add_stu_group.fk_grade_id)},
                                this)
                        }
                    }
                    this.table_info = [];
                },
                //切换班级
                classChange: function () {
                    var class_info = this.class_info;
                    var get_class_name = class_info.split('|')[0];
                    var get_class_id = class_info.split('|')[1];
                    this.add_stu_group.class_name = get_class_name;
                    this.add_stu_group.fk_class_id = get_class_id;
                    //查询学生分组列表
                    ajax_post(api_check_stu_group,{
                        fk_class_id:this.add_stu_group.fk_class_id,
                        year_start:this.add_stu_group.year_start,
                        fk_grade_id:Number(this.add_stu_group.fk_grade_id)
                    },this)
                    this.table_info = [];

                },
                //切换学年学期
                semesterChange:function () {
                    var semester_info = this.semester_info;
                    var year_start = semester_info.split('|')[0];
                    var year_end = semester_info.split('|')[1];
                    var year_start_x = this.timeChuo(year_start);
                    var year_end_x = this.timeChuo(year_end);
                    this.add_stu_group.year_start = year_start_x;
                    this.add_stu_group.year_end = year_end_x;
                    //查询学生分组列表
                    ajax_post(api_check_stu_group,{
                        fk_class_id:this.add_stu_group.fk_class_id,
                        year_start:this.add_stu_group.year_start,
                        fk_grade_id:Number(this.add_stu_group.fk_grade_id)
                    },this)
                    this.table_info = [];
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取学年学期
                            case api_get_semester:
                                this.complete_get_semester(data);
                                break;
                            //查询学生分组列表
                            case api_check_stu_group:
                                this.complete_check_stu_group(data);
                                break;
                            //获取学生信息
                            case api_art_evaluation_get_student_info:
                                this.complete_art_evaluation_get_student_info(data);
                                break;
                            //添加分组
                            case api_add_stu_group:
                                this.complete_add_stu_group(data);
                                break;
                            //随机分组
                            case api_random_group:
                                this.complete_random_group(data);
                                break;
                            //删除寄语分组
                            case api_delete_group:
                                this.complete_delete_group(data);
                                break;
                        }
                    } else {
                        if(cmd == api_random_group){
                            this.random_display = true;
                        }
                        toastr.error(msg)
                    }
                },
                complete_get_semester:function (data) {
                    this.semester_list = data.data.list;
                    this.semester_info =  this.semester_list[0].start_date +"|"+this.semester_list[0].end_date+"|"+this.semester_list[0].id;
                    var year_start = this.semester_list[0].start_date;
                    var year_end = this.semester_list[0].end_date;
                    this.year_start = this.timeChuo(year_start);
                    this.year_end = this.timeChuo(year_end);
                    this.add_stu_group.year_start = this.year_start;
                    this.add_stu_group.year_end = this.year_end;
                    ajax_post(api_check_stu_group,{
                        fk_class_id:this.add_stu_group.fk_class_id,
                        year_start:this.add_stu_group.year_start,
                        fk_grade_id:Number(this.add_stu_group.fk_grade_id)
                    },this)
                },
                complete_check_stu_group:function (data) {
                    this.table_info = [];
                    if(data.data.length > 0){//有数据
                        //已经分组的学生
                        var complete_arr = [];
                        //number数组
                        var num_arr = [];
                        //去重number
                        var result = [];
                        //渲染的数据
                        var list = [];
                        for(var i = 0;i<data.data.length;i++){
                            num_arr.push(data.data[i].number);
                            complete_arr.push(data.data[i].guid)
                        }
                        this.resp_stu = complete_arr;
                        for(var i=0; i<num_arr.length; i++){
                            if(result.indexOf(num_arr[i])==-1){
                                result.push(num_arr[i]);

                            }
                        }
                        for(var i =0;i<result.length;i++){
                            var obj = {
                                "num": result[i],
                                "arr": []
                            };
                            list.push(obj);

                        }
                        for(var i=0;i<list.length;i++){
                            for(var j=0;j<data.data.length;j++){
                                if(list[i].num == data.data[j].number){
                                    list[i]['arr'].push(data.data[j])
                                }
                            }
                        }
                        this.table_info = list;
                        // 取出所有number并取最大值
                        var nums = this.getNumber(data.data,'number');
                        var num =  Math.max.apply(null, nums);
                        this.add_stu_group.number = Number(num)+1;

                    }else{//没有数据(第一次)
                        this.resp_stu = [];
                        this.add_stu_group.number = 1;
                    }
                    //获取学生列表
                    // ajax_post(api_art_evaluation_get_student_info, {fk_class_id:this.add_stu_group.fk_class_id,status:"1"}, this);
                    ajax_post(api_art_evaluation_get_student_info, {fk_class_id:this.add_stu_group.fk_class_id}, this);
                },
                /**
                 * 取出分组信息里面的所有组数number
                 * */
                getNumber:function(ary,name){
                    var a = [];
                    for(var i=0;i<ary.length;i++){
                        a.push(ary[i][name]);
                    }
                    return a;
                },
                o_msg:'',
                complete_art_evaluation_get_student_info:function (data) {
                    this.module_student_arr = [];
                    var obj_arr = [];
                    var dataList = data.data.list;
                    this.stu_data = data.data.list;//获取到的全部学生
                    var dataListLength = dataList.length;
                    var student = this.resp_stu.$model;//已选择学生
                    var studentLength = student.length;
                    var stu_count = data.data.count;
                    var new_obj_arr = [];
                    if(studentLength>0){
                        if(studentLength == stu_count){//分组已经全部完成
                            this.module_student_arr = [];
                        }else{
                            for(var i=0;i<studentLength;i++){
                                for(var j=0;j<dataListLength;j++){
                                    if( student[i] == dataList[j].guid){
                                        dataList[j].me_remark = '1';
                                    }

                                }

                            }
                            for(var i=0;i<studentLength;i++){
                                var obj = {};
                                obj.guid = student[i];
                                obj_arr.push(obj);
                            }
                            new_obj_arr = obj_arr.concat(dataList);
                            var new_arr=[];
                            for(var i=0;i<new_obj_arr.length;i++){
                                if(new_obj_arr[i].hasOwnProperty("name") && !new_obj_arr[i].hasOwnProperty('me_remark')){
                                    new_arr.push(new_obj_arr[i])
                                }
                            }
                            this.module_student_arr = new_arr;
                        }
                        // }
                    }else{
                        this.module_student_arr = dataList;
                        if(dataListLength == 0){
                            this.o_msg="没有该班级学生信息";
                            return;
                        }
                        if(studentLength == 0){
                            this.o_msg="该班已经完成学生分组"
                        }
                    }
                },
                modal_open:function () {
                    this.btn_has = true;
                    this.checkbox_arr = [];
                    $("#add-confirm").modal({
                        closeOnConfirm: false
                    });
                },
                //模态框确定
                add_student: function () {
                    $("#add-confirm").modal({
                        closeOnConfirm: true
                    });
                    if(this.module_student_arr.length > 0){
                        var guid = [];
                        var name = [];
                        var list = [];
                        var checkbox_arr_length = this.checkbox_arr.length;
                        if(checkbox_arr_length < 3){
                            this.add_title = '请至少选择三名学生';
                        }else{
                            for (var i = 0; i < checkbox_arr_length; i++) {
                                var stu_info = this.checkbox_arr[i];
                                var obj = {};
                                 obj = {
                                    "guid": Number(stu_info.split("|")[0]),
                                    "name": stu_info.split("|")[1]
                                };
                                 list.push(obj)
                            }
                            this.add_stu_group.list = list;
                            $("#add-confirm").modal({
                                closeOnConfirm: true
                            });
                            if(this.btn_has){
                                this.btn_has = false;
                                ajax_post(api_add_stu_group,this.add_stu_group,this);
                            }
                        }
                    }


                },
                complete_add_stu_group:function (data) {
                    //查询学生分组列表
                    ajax_post(api_check_stu_group,{
                        fk_class_id:this.add_stu_group.fk_class_id,year_start:this.add_stu_group.year_start,
                        fk_grade_id:Number(this.add_stu_group.fk_grade_id)
                    },this)
                },
                //删除
                delete_btn:function(el){
                    // console.log(el);
                    var self = this;
                    var sem_id =this.semester_info.split('|')[2];
                    layer.alert('确定删除', {
                       closeBtn: 0
                    }, function(){
                        ajax_post(api_delete_group,{
                            fk_class_id:self.add_stu_group.fk_class_id,
                            fk_grade_id:self.add_stu_group.fk_grade_id,
                            fk_school_id:self.add_stu_group.fk_school_id,
                            fk_xq_id:sem_id,
                            number:el.num,
                            year_end:self.add_stu_group.year_end,
                            year_start:self.add_stu_group.year_start,
                        },self);
                        layer.closeAll();
                    });
                },
                complete_delete_group:function(data){
                    //查询学生分组列表
                    ajax_post(api_check_stu_group,{
                        fk_class_id:this.add_stu_group.fk_class_id,
                        year_start:this.add_stu_group.year_start,
                        fk_grade_id:Number(this.add_stu_group.fk_grade_id)
                    },this)
                },
                //修改
                update_checkbox_arr:[],
                edit_btn:function (el) {
                    this.update_checkbox_arr = [];
                    var new_arr = [];
                    var get_el_arr = el.arr;
                    this.add_stu_group.number = el.num;
                    var get_stu_data = this.module_student_arr.$model;//获取还未被分组的学生
                    // this.update_stu_group.id = Number(el.id);
                    // var stu_group_guid = JSON.parse(el.stu_group_guid);
                    // var stu_group_name = JSON.parse(el.stu_group_name);
                    for(var i=0;i<get_el_arr.length;i++){
                        var obj_x = {};
                        obj_x.guid = get_el_arr[i].guid;
                        obj_x.name = get_el_arr[i].name;
                        new_arr.push(obj_x.guid+"|"+obj_x.name);
                        get_stu_data.push(obj_x);
                    }
                    this.update_module_student_arr = get_stu_data;
                    this.update_checkbox_arr = new_arr;
                    this.update_btn_has = true;
                    $("#update-confirm").modal({
                        closeOnConfirm: false
                    });
                },
                //提交修改
                update_add_student:function () {
                    var list = [];
                    var update_checkbox_length = this.update_checkbox_arr.length;
                    if(update_checkbox_length < 3){
                        this.update_title = '请至少选择三名学生';
                    }else{
                        for (var i = 0; i < update_checkbox_length; i++) {
                            var stu_info = this.update_checkbox_arr[i];
                            var obj = {};
                            obj = {
                                "guid": Number(stu_info.split("|")[0]),
                                "name": stu_info.split("|")[1]
                            };
                            list.push(obj)
                        }
                        this.add_stu_group.list = list;
                        $("#update-confirm").modal({
                            closeOnConfirm: true
                        });
                        if(this.update_btn_has){
                            this.update_btn_has = false;
                            ajax_post(api_add_stu_group,this.add_stu_group,this);
                        }
                    }

                },
                complete_update_stu_group:function (data) {
                    //查询学生分组列表
                    ajax_post(api_check_stu_group,{
                        fk_class_id:this.add_stu_group.fk_class_id,year_start:this.add_stu_group.year_start,
                        fk_grade_id:Number(this.add_stu_group.fk_grade_id)
                    },this)
                },
                //随机分组按钮防止重复提交：true-可以提交，false-不能提交
                random_display:true,
                //随机分组
                random_click:function () {
                    var self = this;
                    var title = '';
                    var semester_info = this.semester_info;
                    var year_start = semester_info.split('|')[0];
                    for(var i = 0;i<this.semester_list.length;i++){
                        if(year_start == this.semester_list[i].start_date){
                            title = this.semester_list[i].semester_name;
                        }
                    }
                    layer.prompt({title: '请输入'+title+'每组平均人数', formType: 2}, function(text, index){
                        var self_x = self;
                        if(text>=3){
                            if(self.random_display){
                                self.random_display = false;
                                ajax_post(api_random_group,{
                                    avg_number:Number(text),
                                    fk_class_id:self_x.add_stu_group.fk_class_id,
                                    year_end:self.add_stu_group.year_end,
                                    year_start:self.add_stu_group.year_start,
                                    fk_grade_id:self.add_stu_group.fk_grade_id
                                },self);
                                layer.close(index);
                                toastr.info('正在进行分组,请稍后')
                            }
                            // layer.open({
                            //     title: "温馨提示",
                            //     closeBtn:0,
                            //     content: '<div><p>正在进行分组,请稍后</p></div>',
                            //     yes: function (index, layero) {
                            //         self.layer_index=index;
                            //     }
                            // });
                        }else{
                            toastr.warning('请填写大于2的整数')
                        }

                    });
                },
                complete_random_group:function (data) {
                    toastr.success('设置成功');
                    layer.close(this.layer_index);
                    //查询学生分组列表
                    ajax_post(api_check_stu_group,{
                        fk_class_id:this.add_stu_group.fk_class_id,year_start:this.add_stu_group.year_start,
                        fk_grade_id:Number(this.add_stu_group.fk_grade_id)
                    },this)
                },
                //js把时间戳转为为普通日期格式
                timeChuo:function(h){
                    var timestamp3 = h/1000;
                    var newDate = new Date();
                    newDate.setTime(timestamp3 * 1000);
                    Date.prototype.format = function(format) {
                        var date = {
                            "M+": this.getMonth() + 1,
                            "d+": this.getDate(),
                            "h+": this.getHours(),
                            "m+": this.getMinutes(),
                            "s+": this.getSeconds(),
                            "q+": Math.floor((this.getMonth() + 3) / 3),
                            "S+": this.getMilliseconds()
                        };
                        if (/(y+)/i.test(format)) {
                            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
                        }
                        for (var k in date) {
                            if (new RegExp("(" + k + ")").test(format)) {
                                format = format.replace(RegExp.$1, RegExp.$1.length == 1
                                    ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
                            }
                        }
                        return format;
                    };
                    var getTimeIs=newDate.format('yyyy-MM-dd');
                    return getTimeIs;
                }


            });
            vm.$watch('onReady', function () {
                this.cb();
            });

            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    })