/**
 * Created by Administrator on 2018/9/11.
 */
define(['jquery',
        C.CLF('avalon.js'),
        C.Co('weixin_pj', 'archives/growth_archives_list/growth_archives_list', 'html!'),
        C.Co('weixin_pj', 'archives/growth_archives_list/growth_archives_list', 'css!'),
        C.CMF("data_center.js"),
        "echarts",
        "PCAS",'jquery-weui','swiper',C.CLF('base64.js'),
    ],
    function ($, avalon, html, css, data_center, echarts, PCAS,weui,swiper,bs64) {
        //获取年级列表
        var api_find_grades=api.user+'grade/findGrades.action';
        //获取市下区县
        var api_city_disc=api.user+'school/arealist.action';

        var api_disc_school=api.user+'school/schoolList.action';
        //获取指定学校年级的班级
        var api_school_class=api.user+'class/findClassSimple.action';
        //学生列表
        var api_stu_list = api.PCPlayer + "baseUser/studentlist.action";

        var avalon_define = function () {
            var vm = avalon.define({
                $id: "growth_archives_list",
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
                    offset: 0,
                    rows:15,
                },
                //列表数据
                stu_data:[],
                // 所有学生个数
                all_count:'',
                init: function () {
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
                            self.area_list = cloud.area_list();
                            self.stu_list_req();
                        } else if(highest_level=='3'){//区县
                            self.highest_level=3;
                            self.extend.city=tUserData.city;
                            self.extend.district = tUserData.district;
                            var name = tUserData.district;
                            self.school_list = cloud.school_list({"district":name});
                            self.stu_list_req();
                        }else if(highest_level=='4'){//校
                            self.highest_level=4;
                            self.extend.city=tUserData.city;
                            self.extend.district=tUserData.district;
                            self.extend.fk_school_id=tUserData.fk_school_id;
                            //年级
                            vm.grade_list = cloud.grade_list();
                            self.stu_list_req();
                        }
                        else if(userType=='1' && (highest_level=='5' || highest_level=='6')){//年级+教师
                            self.highest_level=11;
                            //年级综合
                            var t_grade=tUserData.teach_class_list;
                            var l_grade=tUserData.lead_class_list;
                            for(var i=0;i<l_grade.length;i++){
                                var has=false;
                                var id=l_grade[i].grade_id;
                                for(var j=0;j<t_grade.length;j++){
                                    if(t_grade[j].grade_id==id){
                                        has=true;
                                        break;
                                    }
                                }
                                if(has==false){
                                    t_grade.push(l_grade[i]);
                                }
                            }
                            self.grade_list=t_grade;
                            //班级综合
                            //教
                            var t_class=tUserData.teach_class_list[0].class_list;
                            //班主任
                            var l_class=tUserData.lead_class_list[0].class_list;
                            for(var i=0;i<l_class.length;i++){
                                var has=false;
                                var id=l_class[i].class_id;
                                for(var j=0;j<t_class.length;j++){
                                    if(t_class[j].class_id==id){
                                        has=true;
                                        break;
                                    }
                                }
                                if(has==false){
                                    t_class.push(l_class[i]);
                                }
                            }
                            self.class_list=t_class;
                            self.extend.city=tUserData.city;
                            self.extend.district=tUserData.district;
                            self.extend.fk_school_id=tUserData.fk_school_id;
                            self.grade_name = self.grade_list[0].grade_name;
                            self.extend.fk_grade_id = self.grade_list[0].grade_id;
                            self.class_name = self.class_list[0].class_name;
                            self.extend.fk_class_id = self.class_list[0].class_id;
                            self.stu_list_req();
                        }
                    });
                },
                //学生列表请求
                stu_list_req:function(){
                    ajax_post(api_stu_list,this.extend.$model,this);
                },
                //区县改变
                areaChange:function(){
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
                    if(this.extend.district!=''){
                        //学校
                        // ajax_post(api_disc_school,{district:this.extend.district},this);
                        this.school_list = cloud.school_list({"district":this.extend.district});
                    }
                    this.stu_list_req();
                },
                //学校筛选
                schoolChange:function(){
                    this.grade_info = '';
                    this.extend.fk_grade_id = "";
                    this.extend.fk_class_id = "";
                    this.class_info = '';
                    this.grade_list = [];
                    this.class_list=[];
                    this.extend.name = '';
                    this.extend.code = '';
                    if(this.extend.fk_school_id != ''){
                        //请求年级
                        this.grade_list = cloud.grade_list({"school_id":Number(this.extend.fk_school_id)});
                    }
                    this.stu_list_req();
                },
                uninit:function(){
                    window.onscroll = undefined
                },
                //年级改变
                gradeChange:function () {
                    this.extend.fk_class_id = '';
                    this.class_info = '';
                    this.class_list = [];
                    var gId = this.extend.fk_grade_id;
                    this.extend.fk_grade_id = gId;
                    this.extend.name = '';
                    this.extend.code = '';
                    if(gId != "" && this.highest_level!=11){
                        this.class_list = cloud.class_all_list({fk_school_id:Number(this.extend.fk_school_id),fk_grade_id: gId});
                        console.log(this.class_list);
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
                    this.stu_list_req();
                },
                //班级改变
                classChange:function(){
                    this.extend.name = '';
                    this.extend.code = '';
                    if(this.highest_level==2 || this.highest_level==3 || this.highest_level==4){
                        this.extend.fk_class_id = this.extend.fk_class_id;
                    }else if(this.highest_level == 11){
                        this.extend.fk_class_id = this.extend.fk_class_id;
                    }
                    this.stu_list_req();
                },
                //学籍号查询
                code_search:function(){
                    this.stu_list_req();
                },
                //姓名模糊查询
                name_search:function(){
                    this.stu_list_req();
                },
                //详情查看
                growth_detail:function(el){
                    //目前为了过检查，临时把跳转屏蔽
                    // var guid = el.guid;
                    // // window.location = '#growth_archives?guid='+guid;
                    // var token = sessionStorage.getItem('token');
                    // var f_url ='/Growth/index.html#file_details?guid=' + guid;
                    // var url = bs64.encoder(f_url);
                    // var dz = window.location.origin + '/api/GrowthRecordBag/wx_growth_file_get_img?token='+token+'&url='+url;
                    // // var newwindow = window.open(dz);
                    // // var con = '档案加载中...';
                    // // newwindow.document.write(con);
                    // window.open(dz);

                    //目前全部置为未生成
                    $.alert("该学生还未生成成长档案!");
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            // //获取年级
                            // case api_find_grades:
                            //     this.complete_find_grades(data);
                            //     break;
                            //获取区县下学校
                            case api_disc_school:
                                this.complete_disc_school(data);
                                break;
                            //获取指定学校年级的班级集合
                            case api_school_class:
                                this.complete_school_class(data);
                                break;
                            //学生列表
                            case api_stu_list:
                                this.complete_stu_list(data);
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
            //    学生列表
                complete_stu_list:function(data){
                    this.stu_data = data.data.list;
                    this.all_count = data.data.count;
                },

            });
            // require(["jquery-weui"], function (j) {
            //     require(['swiper', 'city_picker'], function (a, b) {
            //         vm.cb();
            //     })
            // });
            vm.$watch('onReady', function () {
                vm.init();
                //滚动条监控时间
                window.onscroll = function(){
                    //$(window).height()--窗口高度；$(window).scrollTop()--滚动体距离顶部的高度
                    var total_height = parseFloat($(window).height()) + parseFloat($(window).scrollTop());
                    //内容高度
                    var doc_height = parseFloat($(document).height());
                    var rows = vm.extend.rows;
                    if(doc_height-total_height <= 50 && rows<vm.all_count){
                        vm.first_scoll = doc_height;
                        console.log(vm.first_scoll);
                        vm.extend.rows = rows + 15;
                        vm.stu_list_req();
                    }
                };
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define,
            repaint:true,
        }
    });