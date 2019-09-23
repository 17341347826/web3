/**
 * Created by Administrator on 2018/5/25.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('growth', 'portfolio_assessment/p_a_list/p_a_list', 'html!'),
        C.Co('growth', 'portfolio_assessment/p_a_list/p_a_list', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CMF("table/table.js"),
        C.CM("three_menu_module"),
        C.CM("select_kinds")
    ],
    function (avalon, layer, html, css, data_center, select_assembly,table,three_menu_module,select_kinds) {
        //获取年级列表
        var api_find_grades=api.user+'grade/findGrades.action';
        //获取市下区县
        var api_city_disc=api.user+'school/arealist.action';

        var api_disc_school=api.user+'school/schoolList.action';
        //获取指定学校年级的班级
        var api_school_class=api.user+'class/findClassSimple.action';
        //学生列表
        var api_stu_list = api.PCPlayer + "baseUser/studentlist.action";
        //导出
        var export_api = api.api+"Indexmaintain/export_growthArchives_pdfzip";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "p_a_list",
                url:api_stu_list,
                //用户类型	string	0：管理员；1：教师；2：学生；3：家长
                user_type:'',
                //最高等级	string	user_type='1' 时才有值。
                // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师;11:年级+教师
                highest_level:'',
                //年级
                grade_list: [],
                grade_info:'',
                grade_name:'',
                //区县
                area_list:[],
                area_info:'',
                //学校
                school_list:[],
                school_name:'',
                school_info:'',
                //学校下拉是否显示
                is_show_school:false,
                //学校模糊查询
                nameFlag: false,
                //班级
                class_list:[],
                class_info:'',
                class_name:'',//教师身份初次默认
                //学生学籍号
                stu_code:'',
                //学生姓名
                stu_name:'',
                //table
                remember:false,
                //开关
                is_init: false,
                only_hash: true,
                data: {
                    offset: 0,
                    rows:10,
                },
                // 学生列表请求参数
                extend: {
                    name:"",
                    code:"",
                    //市
                    city:'',
                    //区县
                    district:'',
                    //学校id number
                    fk_school_id:"",
                    //年级id number
                    fk_grade_id: "",
                    // 班级id
                    fk_class_id: "",
                    __hash__: ""
                },
                // 表头名称
                theadTh: [
                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    },{
                        title: "姓名",
                        type: "text",
                        from: "name"
                    },{
                        title: "学籍号",
                        type: "text",
                        from: "code"
                    },{
                        title: "区县",
                        type: "text",
                        from:"district"
                    },{
                        title: "学校",
                        type: "text",
                        from:"school_name"
                    },{
                        title: "年级",
                        type: "text",
                        from:"grade_name"
                    },{
                        title: "班级",
                        type: "text",
                        from:"class_name"
                    },{
                        title: "操作",
                        type: "html",
                        from:
                        "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='查看'></a>"+
                        "<a class='tab-btn tab-export-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='导出'></a>"
                    }
                ],
                extend_data:{
                    class_id:'',
                    grade_id:'',
                    guid:'',
                    school_id:'',
                    tar_year:'',
                    token:'',
                    position:1
                },
                cbopt: function(params) {
                    this.get_extend(params);
                    if(params.type==1){
                        var portfolio_stu=params.data.guid+'|'+params.data.grade_name+'|'+params.data.fk_grade_id+'|'+params.data.fk_school_id+'|'+
                            params.data.sex+'|'+params.data.province+'|'+params.data.city+'|'+params.data.district+'|'+params.data.fk_class_id+'|'+params.data.code;
                        sessionStorage.setItem('portfolio_stu',portfolio_stu);
                        var arr = portfolio_stu.split('|');
                        data_center.set_key('grow_export_data',JSON.stringify(this.extend_data));
                        window.location='#file_details?guid='+arr[0];
                        return;
                    }
                    if(params.type==2){
                        var url = export_api +'?';
                        for(var key in this.extend_data){
                            url += key+'='+this.extend_data[key]+"&";
                        }
                        url = url.substr(0,url.length-1);
                        window.open(url);
                    }
                },
                get_extend:function (params) {
                    this.extend_data.class_id = params.data.fk_class_id;
                    this.extend_data.grade_id = params.data.fk_grade_id;
                    this.extend_data.guid = params.data.guid;
                    this.extend_data.school_id = params.data.fk_school_id;
                    this.extend_data.token = sessionStorage.getItem('token');
                    this.extend_data.tar_year = Number(params.data.grade_name.substr(1, 4));

                },
                init: function () {
                    this.is_init = true;
                    this.cds();
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level = data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        if (highest_level == '2') {//市级
                            self.highest_level = 2;
                            self.extend.city = tUserData.city;
                            // ajax_post(api_city_disc, {city: self.extend.city}, self);
                            self.area_list = cloud.area_list();
                            self.only_hash = false;
                        } else if(highest_level=='3'){//区县
                            self.highest_level=3;
                            self.extend.city=tUserData.city;
                            // self.area_info = tUserData.district;
                            self.extend.district = tUserData.district;
                            var name = tUserData.district;
                            self.school_list = cloud.school_list({"district":name});
                            // var department_id=tUserData.fk_school_id;
                            // ajax_post(api_disc_school,{department_id:department_id,grade_id:0},self);
                        }else if(highest_level=='4'){//校
                            self.highest_level=4;
                            self.extend.city=tUserData.city;
                            // self.area_info = tUserData.district;
                            self.extend.district=tUserData.district;
                            // vm.grade_info = vm.grade_list[0].grade_id;
                            // vm.extend.fk_grade_id = vm.grade_list[0].grade_id;
                            // vm.gradeChange(vm.grade_list[0]);
                            self.extend.fk_school_id=tUserData.fk_school_id;
                            //年级
                            vm.grade_list = cloud.grade_list();
                            // ajax_post(api_grade_class,{fk_school_id:self.extend.fk_school_id, fk_grade_id:vm.grade_list[0].grade_id },self);
                        }
                        else if(userType=='1' && (highest_level=='5' || highest_level=='6')){//年级+教师
                            self.highest_level=11;
                            self.grade_list = cloud.auto_grade_list();
                            self.class_list = self.grade_list[0].class_list;
                            self.only_hash=true;
                            self.extend.city=tUserData.city;
                            self.extend.district=tUserData.district;
                            self.extend.fk_school_id=tUserData.fk_school_id;
                            self.grade_name = self.grade_list[0].grade_name;
                            self.extend.fk_grade_id = self.grade_list[0].grade_id;
                            self.class_name = self.class_list[0].class_name;
                            self.extend.fk_class_id = self.class_list[0].class_id;
                            self.extend.__hash__=new Date();
                            self.only_hash=false;
                        }
                    });
                },
                //区县改变
                areaChange:function(el){
                    this.only_hash=true;
                    this.school_list=[];
                    this.school_name='';
                    this.school_info = '';
                    this.extend.fk_school_id='';
                    this.grade_info = '';
                    this.extend.fk_grade_id = "";
                    this.class_info = '';
                    this.extend.fk_class_id = "";
                    this.grade_list = [];
                    this.class_list=[];
                    this.extend.name = '';
                    this.extend.code = '';
                    this.extend.district = el.district;
                    if(this.extend.district!=''){
                        //学校
                        ajax_post(api_disc_school,{district:this.extend.district},this);
                    }
                    this.extend.__hash__=new Date();
                    this.only_hash=false;
                },
                //学校筛选
                schoolChange:function(el){
                    this.only_hash = true;
                    this.grade_info = '';
                    this.extend.fk_grade_id = "";
                    this.extend.fk_class_id = "";
                    this.class_info = '';
                    this.grade_list = [];
                    this.class_list=[];
                    this.extend.name = '';
                    this.extend.code = '';
                    this.extend.fk_school_id = el.id;
                    if(this.extend.fk_school_id != ''){
                        //请求年级
                        this.grade_list = cloud.grade_list({"school_id":Number(this.extend.fk_school_id)});
                    }
                    this.extend.__hash__ = new Date();
                    this.only_hash = false;
                },
                //年级改变
                gradeChange:function (el) {
                    this.only_hash=true;
                    this.extend.fk_class_id = '';
                    this.class_info = '';
                    this.class_list = [];
                    var gId = el.grade_id;
                    this.extend.fk_grade_id = gId;
                    this.extend.name = '';
                    this.extend.code = '';
                    if(gId != "" && this.highest_level!=11){
                        this.class_list = cloud.class_all_list({fk_school_id:Number(this.extend.fk_school_id),fk_grade_id: gId});

                    }else if(gId != "" && this.highest_level == 11){//教师
                        var grade=this.grade_list;
                        for(var i=0;i<grade.length;i++){
                            var id=grade[i].grade_id;
                            if(id == gId){
                                this.class_list = grade[i].class_list;
                                this.extend.fk_class_id = this.class_list[0].class_id;
                            }
                        }
                    }
                    this.extend.__hash__=new Date();
                    this.only_hash=false;
                },
                //班级改变
                classChange:function(el){
                    this.only_hash = true;
                    if(this.highest_level==2 || this.highest_level==3 || this.highest_level==4){
                        this.extend.fk_class_id = el.value;
                    }else if(this.highest_level == 11){
                        this.extend.fk_class_id = el.class_id;
                    }
                    this.extend.name = '';
                    this.extend.code = '';
                    this.extend.__hash__ = new Date();
                    this.only_hash = false;
                },
                //学籍号查询
                code_search:function(){
                    this.only_hash = true;
                    this.extend.__hash__ = new Date();
                    this.only_hash = false;
                },
                //姓名模糊查询
                name_search:function(){
                    this.only_hash = true;
                    this.extend.__hash__ = new Date();
                    this.only_hash = false;
                },
                //学校模糊查询
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case api_find_grades:
                                this.complete_find_grades(data);
                                break;

                            //获取区县下学校
                            case api_disc_school:
                                this.complete_disc_school(data);
                                break;
                            //获取指定学校年级的班级集合
                            case api_school_class:
                                this.complete_school_class(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //获取年级
                complete_find_grades:function(data){
                    this.grade_list=data.data;
                },

                //学校
                complete_disc_school:function(data){
                    this.school_list=data.data.list;

                },
            //    年级、班级集合
                complete_school_class:function(data){
                    this.class_all_list=data.data;
                },
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define,
            repaint:true,
        }
    });
