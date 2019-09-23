/**
 * Created by Administrator on 2017/10/11.
 */
define(["jquery", C.CLF('avalon.js'), 'layer',
        C.Co("user", "classUserControl/group_of_class_teachers/group_of_class_teachers", "html!"),
        C.Co("user", "classUserControl/group_of_class_teachers/group_of_class_teachers", "css!"),
        C.CMF("router.js"), C.CMF("data_center.js"),C.CM('three_menu_module')
    ],
    function (jquery,avalon,layer,html,css,router,data_center,three_menu_module){
        //获取学生信息
        var api_art_evaluation_get_student_info = api.api + "base/student/class_used_stu";
        //查询学生分组列表
        var api_check_stu_group = api.api + "Indexmaintain/indexmaintain_findstudentgroup";
        //添加学生分组
        var api_add_stu_group = api.api + "Indexmaintain/indexmaintain_addstudentgroup";
        //修改学生分组
        var api_update_stu_group = api.api + "Indexmaintain/indexmaintain_updatestudentgroup";
        //随机分组学生
        var api_random_group  = api.api + 'Indexmaintain/random_student_group';
        //删除当前分组行
        var api_delete_group = api.api + 'Indexmaintain/delete_group';
        var avalon_define=function(){
            var vm=avalon.define({
                $id:"group_of_class_teachers",
                add_title:"",
                update_title:"",
                json:function (x) {
                  //  由于后台原因，将暂时用另一种方式处理数据
                  // return JSON.parse(x);
                    x = x.substr(x.indexOf('[')+1,x.length);
                    x = x.substr(0,x.indexOf(']'));
                    //去掉所有'';
                    var b = x.replace(/"/g, "");
                    b.replace(/'/g, "");
                    return b.split(',');
                },
                modal_title:"",
                teach_class_list:[],
                class_list:[],
                grade_id:"",
                class_id:"",
                module_student_arr:[],
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
                    classid:"",
                    gradeid:"",
                    stu_group_guid:"",//string
                    stu_group_name:""//string
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
                            self.grade_id = cArr[0].grade_id;
                            self.class_id = cArr[0].class_list[0].class_id;
                            self.add_stu_group.classid = self.class_id;
                            self.add_stu_group.gradeid = self.grade_id;
                        }
                        //查询学生分组列表
                        ajax_post(api_check_stu_group,{classid:Number(self.class_id),gradeid:Number(self.grade_id)},self);
                    });
                },
                //切换年级
                gradeChange: function (data) {
                    var get_grade_id = this.grade_id;
                    for (var i = 0; i < this.teach_class_list.length; i++) {
                        if (get_grade_id == this.teach_class_list[i].grade_id) {
                            this.class_list = this.teach_class_list[i].class_list;
                            this.class_id = this.class_list[0].class_id;
                            //获取学生
                            ajax_post(api_art_evaluation_get_student_info, {fk_class_id: this.class_id}, this);

                        }
                    }
                },
                //切换班级
                classChange: function () {
                    //获取学生
                    ajax_post(api_art_evaluation_get_student_info, {fk_class_id: this.class_id}, this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
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
                                //修改
                            case api_update_stu_group:
                                this.complete_update_stu_group(data);
                                break;
                            //随机分组
                            case api_random_group:
                                this.complete_random_group(data);
                                break;
                            //删除评价分组
                            case api_delete_group:
                                this.complete_delete_group(data);
                                break;
                        }
                    } else {
                        if(cmd == api_random_group){
                            vm.random_display = true;
                        }
                        toastr.error(msg)
                    }
                },
                complete_check_stu_group:function (data) {
                    this.table_info = [];
                    if(data.data.length>0){//有数据
                        var arr = [];
                        for(var i = 0;i<data.data.length;i++){
                            var every = JSON.parse(data.data[i].stu_group_guid);
                            for(var j = 0;j<every.length;j++){
                                arr.push(every[j])
                            }
                        }
                        this.table_info = data.data;
                        // console.log(this.table_info);
                        this.resp_stu = arr;
                    }else{//没有数据(第一次)
                        this.random_display = true;
                    }
                    //获取学生列表
                    ajax_post(api_art_evaluation_get_student_info, {fk_class_id: this.class_id}, this);
                },
                complete_art_evaluation_get_student_info:function (data) {
                    var self = this;
                    this.module_student_arr = [];
                    var obj_arr = [];
                    var dataList = data.data.list;
                    this.stu_data = data.data.list;
                    var dataListLength = dataList.length;
                    var student = this.resp_stu.$model;//已选择学生
                    var studentLength = student.length;
                    var stu_count = data.data.count;
                    var new_obj_arr = [];
                    if(studentLength>0){
                        if(studentLength == stu_count){//分组已经全部完成
                            this.module_student_arr = [];
                        }else{
                            for(let i=0;i<studentLength;i++){
                                for(var j=0;j<dataListLength;j++){
                                    if( student[i] == dataList[j].guid){
                                        dataList[j].me_remark = '1';
                                    }

                                }

                            }
                            for(let i=0;i<studentLength;i++){
                                var obj = {};
                                obj.guid = student[i];
                                obj_arr.push(obj);
                            }
                            new_obj_arr = obj_arr.concat(dataList);
                            var new_arr=[];
                            for(let i=0;i<new_obj_arr.length;i++){
                                if(new_obj_arr[i].hasOwnProperty("name") && !new_obj_arr[i].hasOwnProperty('me_remark')){
                                    new_arr.push(new_obj_arr[i])
                                }
                            }
                            this.module_student_arr = new_arr;
                            // var xself = self;
                            // var num_x = data.data.list.length-studentLength;
                            // if(this.is_click == true){//点击分组
                            //     for(var i=0;i<studentLength;i++){
                            //         for(var j=0;j<dataListLength;j++){
                            //             if( student[i] == dataList[j].guid){
                            //                 dataList[j].me_remark = '1';
                            //             }
                            //
                            //         }
                            //
                            //     }
                            //     for(var i=0;i<studentLength;i++){
                            //         var obj = {};
                            //         obj.guid = student[i];
                            //         obj_arr.push(obj);
                            //     }
                            //     new_obj_arr = obj_arr.concat(dataList);
                            //     var new_arr=[];
                            //     for(var i=0;i<new_obj_arr.length;i++){
                            //         if(new_obj_arr[i].hasOwnProperty("name") && !new_obj_arr[i].hasOwnProperty('me_remark')){
                            //             new_arr.push(new_obj_arr[i])
                            //         }
                            //     }
                            //     this.module_student_arr = new_arr;
                            // }else{//继续分组
                            //     layer.confirm('当前还有'+num_x+'个学生未进行分组,是否继续进行分组?', {
                            //         btn: ['继续分组','取消'] //按钮
                            //     }, function(){
                            //         layer.closeAll();
                            //         xself.modal_open();
                            //         for(var i=0;i<studentLength;i++){
                            //             for(var j=0;j<dataListLength;j++){
                            //                 if( student[i] == dataList[j].guid){
                            //                     dataList[j].me_remark = '1';
                            //                 }
                            //
                            //             }
                            //
                            //         }
                            //         for(var i=0;i<studentLength;i++){
                            //             var obj = {};
                            //             obj.guid = student[i];
                            //             obj_arr.push(obj);
                            //         }
                            //         new_obj_arr = obj_arr.concat(dataList);
                            //         var new_arr=[];
                            //         for(var i=0;i<new_obj_arr.length;i++){
                            //             if(new_obj_arr[i].hasOwnProperty("name") && !new_obj_arr[i].hasOwnProperty('me_remark')){
                            //                 new_arr.push(new_obj_arr[i])
                            //             }
                            //         }
                            //         xself.module_student_arr = new_arr;
                            //     }, function(){
                            //         layer.closeAll();
                            //     });
                            }
                        // }
                    }else{
                        this.module_student_arr = dataList;
                    }
                },
                //随机分组按钮：true-显示，false-隐藏
                random_display:true,
                //随机分组
                random_click:function () {
                    var self = this;
                    layer.prompt({title: '请输入每组平均人数', formType: 2}, function(text, index){
                        if(text>=3){
                            self.random_display = false;
                            ajax_post(api_random_group,{
                                num:Number(text),
                                classid:self.add_stu_group.classid,
                                gradeid:self.add_stu_group.gradeid
                            },self);
                            layer.close(index);
                            toastr.info('正在进行分组,请稍后')
                        }else{
                            toastr.warning('请填写大于2的整数')
                        }

                    });
                },
                //随机分组
                complete_random_group:function (data) {
                    toastr.success('设置成功');
                    //查询学生分组列表
                    ajax_post(api_check_stu_group,{classid:Number(this.class_id),gradeid:Number(this.grade_id)},this);
                },
                //分组
                modal_open:function () {
                    this.checkbox_arr = [];
                    //将确定请求放出
                    this.btn_has = true;
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
                        var checkbox_arr_length = this.checkbox_arr.length;
                        if(checkbox_arr_length < 3){
                            this.add_title = '请至少选择三名学生';
                        }else{
                            for (var i = 0; i < checkbox_arr_length; i++) {
                                var stu_info = this.checkbox_arr[i];
                                guid.push(Number(stu_info.split("|")[0]));
                                name.push(stu_info.split("|")[1])
                            }
                            this.add_stu_group.stu_group_guid = JSON.stringify(guid);
                            this.add_stu_group.stu_group_name = JSON.stringify(name);
                            if(this.btn_has){
                                this.btn_has = false;
                                ajax_post(api_add_stu_group,this.add_stu_group,this);
                            }
                        }
                    }

                },
                complete_add_stu_group:function (data) {
                    //查询学生分组列表
                    ajax_post(api_check_stu_group,{classid:Number(this.class_id),gradeid:Number(this.grade_id)},this);
                },
                //删除
                delete_btn:function(el){
                    // console.log(el);
                    var self = this;
                    layer.alert('确定删除', {
                        closeBtn: 0
                    }, function(){
                        toastr.info('数据正在删除中，请稍等');
                        ajax_post(api_delete_group,{
                            id:el.id,
                        },self);
                        layer.closeAll();
                    });
                },
                complete_delete_group:function(data){
                    toastr.info('数据删除成功');
                    //查询学生分组列表
                    ajax_post(api_check_stu_group,{classid:Number(this.class_id),gradeid:Number(this.grade_id)},this);
                },
                //修改
                update_checkbox_arr:[],
                edit_btn:function (el) {
                    this.update_checkbox_arr = [];
                    var new_arr = [];
                    var get_el = el;
                    var get_stu_data = this.module_student_arr.$model;//获取还未被分组的学生
                    this.update_stu_group.id = Number(el.id);
                    var stu_group_guid = JSON.parse(el.stu_group_guid);
                    // var stu_group_name = JSON.parse(el.stu_group_name);
                    var stu_group_name = this.json(el.stu_group_name);
                    for(var i=0;i<stu_group_guid.length;i++){
                        var obj_x = {};
                        obj_x.guid = stu_group_guid[i];
                        obj_x.name = stu_group_name[i];
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
                    var guid = [];
                    var name = [];
                    var update_checkbox_length = this.update_checkbox_arr.length;
                    if(update_checkbox_length < 3){
                        this.update_title = '请至少选择三名学生';
                        return;
                    }
                    for (var i = 0; i < update_checkbox_length; i++) {
                        var stu_info = this.update_checkbox_arr[i];
                        guid.push(Number(stu_info.split("|")[0]));
                        name.push(stu_info.split("|")[1])
                    }
                    this.update_stu_group.stu_group_guid = JSON.stringify(guid);
                    this.update_stu_group.stu_group_name = JSON.stringify(name);
                    $("#update-confirm").modal({
                        closeOnConfirm: true
                    });
                    if (this.update_btn_has) {
                        this.update_btn_has = false;
                        ajax_post(api_update_stu_group, this.update_stu_group, this);
                    }

                },
                complete_update_stu_group:function (data) {
                    //查询学生分组列表
                    ajax_post(api_check_stu_group,{classid:Number(this.class_id),gradeid:Number(this.grade_id)},this);
                }

            });
            vm.$watch('onReady', function () {
                this.cb();
            });

            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });