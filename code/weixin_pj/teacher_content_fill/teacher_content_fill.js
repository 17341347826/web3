define(["jquery",
        C.CLF('avalon.js'),
        "layer",
        C.Co("weixin_pj","teacher_content_fill/teacher_content_fill","css!"),
        C.Co("weixin_pj","teacher_content_fill/teacher_content_fill","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),"jquery-weui"
    ],
    function($,avalon, layer,css, html, x, data_center,weui) {
        //获取学生
        // var api_get_student=api.api+"base/baseUser/studentlist.action";
        var api_get_student = api.api + "base/student/class_used_stu";
        //查询
        var api_get_find_answer = api.api+"Indexmaintain/indexmaintain_list_record";
        //查询分值的最大值
        var api_index_max = api.api+"Indexmaintain/get_idex_stu_hd_num";
        //添加
        var api_add_answer = api.api +"Indexmaintain/indexmaintain_batch_addevaluaterecordtea";
        //获取学年学期
        var api_get_semester= api.api+"base/semester/appoint_date_part";
        //查询数据
        var api_get_info = api.api+"Indexmaintain/indexmaintain_reference";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "teacher_content_fill",
                student_arr:[],
                school_id:"",
                type:"",
                teacher_guid:"",
                every_value:"",
                value_table:false,
                pro_end_time:"",
                pro_start_time:"",
                pro_plan_id:"",
                item_id:"",
                index_max:{
                    fk_class_id:'',
                    fk_school_id:'',
                    fk_semester_id:'',
                    index_id:''
                },
                //参考表现请求参数
                add_data:{
                    //班级id	number	当guid为空时必传
                    class_id: '',
                    //	学籍号	string	当guid不为空时（必传）
                    code: '',
                    //	学期结束时间	string	yyyy-MM-dd（必传）
                    end_date: '',
                    //学生guid	number	当对单个学生评价时必传（对多学生评价可不用传）
                    guid: '',
                    //考查项id	number	当guid为空时（必传）
                    item_id: '',
                    //学生姓名	string	当guid不为空时（必传）
                    name: '',
                    //评价项目id	number	（必传）
                    fk_plan_id: '',
                    //学期开始时间	string	yyyy-MM-dd（必传）
                    start_date: '',
                    //学生性别	number	当guid不为空时（必传）
                    sex: '',
                    plan_level:""//方案级别（1:上级 2:校级） number
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userData = JSON.parse(data.data['user']);
                        self.add_answer.school_id =userData.fk_school_id;
                        self.get_info();
                    });
                },
                get_info:function () {
                    this.add_answer.pj_gradeid=Number(pmx.grade_id);
                    this.add_answer.pj_classid=Number(pmx.class_id);
                    this.add_answer.pj_proid=Number(pmx.pj_proid);
                    this.add_answer.pj_subjectid.push(Number(pmx.sub_subjectid));
                    this.add_answer.pj_subject.push(pmx.sub_subject);
                    this.get_school_id = Number(pmx.school_id);
                    this.teacher_guid = pmx.teacher_guid;
                    this.every_value = pmx.every_value;
                    this.pro_start_time = pmx.pro_start_time;
                    this.pro_end_time = pmx.pro_end_time;
                    this.pro_plan_id = pmx.pro_plan_id;
                    this.item_id = pmx.id;
                    this.find_answer.class_id = Number(pmx.class_id);
                    this.find_answer.guid = '';
                    this.find_answer.pj_subjectid = Number(pmx.sub_subjectid);
                    this.find_answer.pj_type = 2;
                    this.find_answer.project_id = Number(pmx.pj_proid);
                    this.index_max.fk_class_id = this.add_answer.pj_classid;
                    this.index_max.fk_school_id = this.get_school_id;
                    this.index_max.fk_semester_id = Number(pmx.semester_id);
                    this.index_max.index_id = Number(pmx.index_secondaryid);
                    this.add_data.class_id = Number(pmx.class_id);
                    this.add_data.end_date = '';
                    this.add_data.item_id = pmx.id;
                    this.add_data.fk_plan_id = Number(pmx.pro_plan_id);
                    this.add_data.start_date = '';
                    this.add_data.plan_level = pmx.plan_level;
                    ajax_post(api_get_find_answer,this.find_answer,this);
                },
                find_answer:{
                    class_id:"",
                    guid:"",
                    pj_subjectid:"",
                    pj_type:"",
                    project_id:""
                },
                add_answer:{
                    list:[],
                    pj_classid:"",
                    pj_gradeid:"",
                    pj_proid:"",//项目id
                    pj_subject:[],//考察项名称
                    pj_subjectid:[],//考察项id
                    school_id:""
                },
                blur_input: function (el,idx) {
                    if($.trim(el.pj_value)==''){
                        this.student_arr_x[idx].pj_value = '';
                        $.alert('分值不能为空');
                        return;
                    }
                    var reg=/^\d+(\.\d{1})?$/;
                    if(reg.test(el.pj_value)){

                    }else{
                        this.student_arr_x[idx].pj_value = '';
                        $.alert('分值输入不正确');
                        return;
                    }
                    if(parseFloat(el.pj_value)<0){
                        this.student_arr_x[idx].pj_value = 0;
                        return;
                    }
                    if(parseFloat(el.pj_value)>parseFloat(el.my_value)){
                        this.student_arr_x[idx].pj_value = el.my_value;
                        return;
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询
                            case api_get_find_answer:
                                this.complete_get_find_answer(data);
                                break;
                            //获取学生
                            case api_get_student:
                                this.complete_get_student(data);
                                break;
                            //添加
                            case api_add_answer:
                                this.complete_add_answer(data);
                                break;
                            //查询指标最大分值
                            case api_index_max:
                                this.complete_api_index_max(data);
                                break;
                            //获取学年学期
                            case api_get_semester:
                                this.complete_get_semester(data);
                                break;
                            //获取数据
                            case api_get_info:
                                this.complete_get_info(data);
                                break;
                        }
                    } else {
                        $.alert(msg)
                    }
                },
                remark:'',
                old_data:"",
                //查询
                complete_get_find_answer:function (data) {
                    var dataL = data.data;
                    var dataL_length = data.data.length;
                    if(dataL_length>0){//有数据
                        this.old_data = dataL;
                        this.remark = 1;
                        // ajax_post(api_index_max,this.index_max.$model,this);
                    }else{//没数据
                        this.remark = 2;
                    }
                    ajax_post(api_get_student,{
                        // fk_school_id:this.get_school_id,
                        // grade_id:this.add_answer.pj_gradeid,
                        fk_class_id:this.add_answer.pj_classid
                    },this);
                },
                copy_data:[],
                complete_get_student:function (data) {
                    var dataList = data.data.list;
                    var dataListLength = dataList.length;
                    for(var i=0;i<dataListLength;i++){
                        dataList[i].pj_value = '';
                        dataList[i]['pj_cover_name'] = dataList[i]['name'];
                        dataList[i]['pj_cover_name_num'] = dataList[i]['account'];
                        dataList[i]['pj_cover_name_guid'] = dataList[i]['guid'];
                        dataList[i]['pj_answer'] = '';
                        dataList[i]['pj_answer_value'] = '';
                        dataList[i]['my_value'] = '';
                    }
                    this.copy_data = dataList;
                    ajax_post(api_index_max,this.index_max.$model,this);
                },
                //合并记录的数据和学生数据
                get_concat_stu:function(ary1,ary2,name){
                    for(var i=0,len=ary1.length;i<len;i++){
                        if(vm.get_ary_element(ary2,name,ary1[i][name])){

                        }else{
                            ary2.push(ary1[i]);
                        }
                    }
                    return ary2;
                },
                //判断数组中是否有某个元素值
                get_ary_element:function(ary,name,value){
                    for(var i=0,len=ary.length;i<len;i++){
                        if(value == ary[i][name]){
                            return true;
                        }
                    }
                    return false;
                },
                complete_api_index_max:function (data) {
                    var dataList = data.data;
                    if(this.remark == 1){//之前评论过
                        //评论过的数据与学生数据合并一下
                        var old_data = this.get_concat_stu(this.copy_data,this.old_data,'pj_cover_name_guid');
                        // console.log(old_data);
                        // var old_data = this.old_data.$model;
                        if(JSON.stringify(dataList)=="{}"){
                            for(var i = 0; i < old_data.length;i++){
                                old_data[i]['my_value'] = this.every_value;
                            }
                        }else{
                            for(var i = 0; i < old_data.length;i++){
                                //如果考察项id为982、979、978、977、976时显示5分
                                if(old_data[i].pj_subjectid == 982 || old_data[i].pj_subjectid == 979 ||
                                    old_data[i].pj_subjectid == 978 || old_data[i].pj_subjectid == 977 ||
                                    old_data[i].pj_subjectid == 976 || dataList[this.index_max.index_id][old_data[i].pj_cover_name_guid]){
                                    old_data[i]['my_value'] = this.every_value;
                                }else{
                                    old_data[i]['my_value'] = 3;
                                }
                            }
                        }
                        this.student_arr = old_data;
                        // this.value_table = true;
                    }
                    else if(this.remark == 2){
                        var copyData = this.copy_data.$model;

                        if(JSON.stringify(dataList)=="{}"){
                            for(var i = 0; i < copyData.length;i++){
                                copyData[i]['my_value'] = this.every_value;
                            }
                        }else{
                            for(var i = 0; i < copyData.length;i++){
                                //当二级指标id为933、939、940、941、942显示5分
                                if(this.index_max.index_id == 933 || this.index_max.index_id == 939 || this.index_max.index_id == 940 ||
                                    this.index_max.index_id == 941 || this.index_max.index_id == 942 ||
                                    dataList[this.index_max.index_id][copyData[i].guid]){
                                    copyData[i]['my_value'] = this.every_value;
                                }else{
                                    copyData[i]['my_value'] = 3;
                                }
                            }
                        }


                        this.student_arr = copyData;
                        // this.value_table = true;


                    }
                    ajax_post(api_get_semester,{start_date:this.pro_start_time,end_date:this.pro_end_time},this);
                },
                //直接打分保存
                value_click:function () {//pj_value
                    var self=this;
                    var name_arr = [];
                    var get_data = [];
                    var dataList_x = this.student_arr_x.$model;
                    var dataListLength_x = dataList_x.length;
                    for(var i=0;i<dataListLength_x;i++){
                        var get_every_value = Number(dataList_x[i].pj_value);
                        var my_value = Number(dataList_x[i].my_value);
                        if(get_every_value>my_value || get_every_value<0 || get_every_value == ''){
                            if(dataList_x[i].hasOwnProperty('pj_cover_name')){
                                name_arr.push(dataList_x[i].pj_cover_name)
                            }else if(dataList_x[i].hasOwnProperty('name')){
                                name_arr.push(dataList_x[i].name)
                            }
                        }
                    }
                    var name_arr_length = name_arr.length;
                    var name_str = '';
                    if(name_arr_length>0){
                        for(var i=0;i<name_arr_length;i++){
                            name_str += name_arr[i]+","
                        }
                        $.alert(name_str+'这'+'【'+name_arr_length+'】'+'位同学分值不符合规范,请检查并更正');
                    }else{
                        for(var i=0;i<dataListLength_x;i++){
                            var obj = {};
                            obj['pj_answer'] = '';
                            obj['pj_answer_value'] = '';
                            obj['pj_cover_name'] = dataList_x[i].pj_cover_name;
                            obj['pj_cover_name_guid'] = dataList_x[i].pj_cover_name_guid;
                            obj['pj_cover_name_num'] = dataList_x[i].pj_cover_name_num;
                            var every_v = Number(dataList_x[i].pj_value);
                            every_v = every_v.toFixed(1);
                            obj['pj_value'] = every_v;
                            get_data.push(obj)
                        }
                        this.add_answer.list = get_data;
                        ajax_post(api_add_answer,this.add_answer,this);
                        // layer.open({
                        //     title: "温馨提示",
                        //     closeBtn:0,
                        //     content: '<div><p>正保存数据,请稍后</p></div>',
                        //     yes: function (index, layero) {
                        //         self.layer_index=index;
                        //     }
                        // });
                    }
                },
                layer_index:'',
                complete_add_answer:function (data) {
                    $.alert('保存成功');
                    // layer.closeAll();
                    window.history.back()
                },
                //对多个学生打分的考察
                resources_click:function () {
                    window.location = '#project_reference?&item_id='+this.add_answer.pj_subjectid+
                        "&project_id="+this.pro_plan_id+
                        "&item_id="+this.item_id+
                        "&class_id="+this.add_answer.pj_classid+
                        "&pro_end_time="+this.pro_end_time+
                        "&pro_start_time="+this.pro_start_time+
                        "&plan_level=" + pmx.plan_level;
                },
                complete_get_semester:function(data) {
                    var start = data.data.start_date;
                    var end = data.data.end_date;
                    this.add_data.start_date = timeChuo(start);
                    this.add_data.end_date = timeChuo(end);
                    ajax_post(api_get_info,this.add_data,this);
                },
                student_arr_x:[],
                complete_get_info:function (data) {
                    var dataList = data.data;
                    var dataLength = dataList.length;
                    var stuList = this.student_arr;
                    var stuLength = stuList.length;
                    for(var i = 0; i < stuLength; i++){
                        for(var j = 0; j< dataLength;j++){
                            if(this.remark == 1){
                                if(stuList[i].pj_cover_name_guid == dataList[j].guid){
                                    stuList[i]['everyday_add'] = dataList[j].everyday_add;
                                    stuList[i]['everyday_minus'] = dataList[j].everyday_minus;
                                    stuList[i]['xs'] = dataList[j].xs;
                                }
                            }else{
                                if(stuList[i].guid == dataList[j].guid){
                                    stuList[i]['everyday_add'] = dataList[j].everyday_add;
                                    stuList[i]['everyday_minus'] = dataList[j].everyday_minus;
                                    stuList[i]['xs'] = dataList[j].xs;
                                }
                            }

                        }
                    }
                    this.student_arr_x = stuList;
                    // this.value_table = true;
                    console.log(this.student_arr_x)
                }
            });
            vm.$watch('onReady', function() {
                this.cb();

            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });