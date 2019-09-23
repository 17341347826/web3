/**
 * Created by Administrator on 2018/6/15.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("growth_incentive_card", "incentive_card_list/incentive_card_list", "css!"),
        C.Co("growth_incentive_card", "incentive_card_list/incentive_card_list", "html!"),
        "layer",
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function ($,avalon, css, html, layer,data_center,three_menu_module) {
        //过滤器-过滤身份
        avalon.filters.gl_type = function(str){
            if(str == 1){
                return '教师'
            }else if(str == 2){
                return '学生'
            }else if(str == 3){
                return '家长'
            }else if(str == 0){
                return '管理员'
            }
        };
        //学生列表
        var api_card_list = api.api + "everyday/page_count_gain_card";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "incentive_card_list",
                url_file: api.api + "file/get",//获取文件,
                //学生头像
                user_photo: cloud.user_photo,
                url_img:url_img,
                //显示方式：图文-1，表格-2
                html_display:1,
                //表格显示：列表-1，详情-2
                list_detail:1,
                //单个学生详情
                person_detail:{},
                //区县
                district_name:'',
                //请求
                extend: {
                    code: "",
                    fk_grade_id: "",
                    fk_class_id: "",
                    name: "",
                    start_date: "",
                    end_date: "",
                    offset: 0,
                    rows: 3,
                },
                //列表数据
                card_list:[],
                //图文数据
                card_detail_list:[],
                other:{
                    name:"",
                    code:"",
                    start_time: "",
                    end_time: ""
                },
                //年级
                grade_list:[],
                //班级
                class_list:[],
                only_hash:true,
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                //分页
                // 数据总数
                count:'',
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
                        this.totalPage=Math.ceil(count/this.extend.rows);
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
                    this.extend.offset=(num-1)*this.extend.rows;
                    //获取数据
                    //    成绩奖励
                    ajax_post(api_card_pub,this.extend.$model,this);
                },
                //序号改变
                set_index:function(idx,c_page){
                    var index=idx+(c_page-1)*this.extend.rows;
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
                        this.extend.offset=(this.currentPage-1)*this.extend.rows;
                        //获取数据
                        //    成绩奖励
                        ajax_post(api_card_pub,this.extend.$model,this);
                    }
                },
                //分页
                //数据类型转换
                data_change:function(a){
                    return JSON.parse(a);
                },
                url_for: function(id) {
                    // console.log( this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id)
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                nameExtend:function () {
                    this.extend.card_name=this.other.card_name;
                    ajax_post(api_card_list,this.extend.$model,this);
                },
                codeChange:function () {
                    this.extend.code=this.other.code;
                    ajax_post(api_card_list,this.extend.$model,this);
                },
                nameChange:function () {
                    this.extend.name=this.other.name;
                    ajax_post(api_card_list,this.extend.$model,this);
                },
                getCompleteDate:function () {
                    var self=this;
                    var datepicker=$("#my-datepicker");
                    datepicker.on("change", function(event) {
                        self.other.start_time = event.delegateTarget.defaultValue;
                        self.extend.start_date=self.other.start_time;
                        ajax_post(api_card_list,self.extend.$model,self);
                    });
                    datepicker.datepicker('open');
                },
                getCompleteDates:function () {
                    var self=this;
                    var datepicker=$("#my-datepickers");
                    datepicker.on("change", function(event) {
                        self.other.end_time = event.delegateTarget.defaultValue;
                        self.extend.end_date=self.other.end_time;
                        ajax_post(api_card_list,self.extend.$model,self);
                    });
                    datepicker.datepicker('open');
                },
                //列表查看
                person_honor:function(el){
                    data_center.set_key("trademark_stu_card", el);
                    data_center.set_key("trademark_card_user", 2);
                    window.location = "#incentive_card_see_list";
                },
                init:function () {
                    this.cds();
                },
                // grantCard:function () {
                //     window.location = "#grant_trademark_card";
                // },
                //年级改变
                gradeChange:function () {
                    var gId=this.extend.fk_grade_id;
                    var grade=this.grade_list;
                    for(var i=0;i<grade.length;i++){
                        var id=grade[i].grade_id;
                        if(id==gId){
                            this.class_list=grade[i].class_list;
                        }
                    }
                    ajax_post(api_card_list,this.extend.$model,this);
                },
                //班级改变
                classChange:function(){
                    ajax_post(api_card_list,this.extend.$model,this);
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        var cArr = [];
                        if (userType == "1") {
                            var tUserData = JSON.parse(data.data["user"]);
                            if(tUserData.lead_class_list.length!=0){
                                cArr = tUserData.lead_class_list;
                            }else {
                                cArr = tUserData.teach_class_list;
                            }
                            self.district_name = tUserData.district;
                            self.grade_list = cArr;
                            self.class_list=cArr[0].class_list;
                            self.extend.fk_grade_id=cArr[0].grade_id;
                            self.extend.fk_class_id=cArr[0].class_list[0].class_id;
                            ajax_post(api_card_list,self.extend.$model,self);
                        }
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //成长激励卡列表
                            case api_card_list:
                                this.complete_card_list(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_card_list:function(data){
                    this.count = data.data.count;
                    //获取总页数+当前显示分页数组
                    this.set_total_page(this.count);
                    //列表数据
                    this.card_list = data.data.list;
                    //图文数据
                    var list = data.data.list;
                    var list_length = list.length;
                    var token = sessionStorage.getItem("token");
                    var new_ary = [];
                    for(var i=0;i<list_length;i++){
                        var num = list[i].count_number;
                        //依据
                        var a_fjdz = list[i].a_fjdz.split('|');
                        //卡片
                        var b_fjdz = list[i].b_fjdz.split('|');
                        //成长激励卡名称
                        var bzkmc = list[i].bzkmc.split('|');
                        //发卡时间
                        var hksj = list[i].hksj.split('|');
                        //发卡主体
                        var fkzt = list[i].fkzt.split('|');
                        var per = list[i];
                        // //对象删除某个属性
                        // delete per.id;
                        for(var k=0;k<num;k++){
                            var obj = {};
                            obj.student_guid = per.student_guid;
                            obj.name = per.name;
                            obj.grade_name = per.grade_name;
                            obj.class_name = per.class_name;
                            obj.school_name = per.school_name;
                            obj.create_time = per.create_time;
                            obj.b_fjdz = b_fjdz[k];
                            obj.bzkmc = bzkmc[k];
                            obj.hksj = hksj[k];
                            obj.fkzt = fkzt[k];
                            obj.a_fjdz = a_fjdz[k];
                            //处理依据--将图片、附件、视频分离开
                            var fjdz = JSON.parse(obj.a_fjdz);
                            obj.img_arr = [];
                            obj.video_arr = [];
                            obj.file_arr = [];
                            for (var j = 0; j < fjdz.length; j++) {
                                var file_name = '';
                                if (fjdz[j].hasOwnProperty('name')) {
                                    file_name = fjdz[j].name;
                                }
                                else {
                                    file_name = fjdz[j].inner_name;
                                }
                                fjdz[j].down_href = api.api+'file/download_file?img=' + fjdz[j].guid + "&token="+ token;
                                var suffix_index = file_name.lastIndexOf('.');
                                var suffix = file_name.substr(suffix_index + 1);
                                suffix = suffix.toLowerCase();
                                if (table.suffix_video.indexOf(suffix) != -1) {//视频
                                    obj.video_arr.push(fjdz[j]);
                                    continue;
                                }
                                if (table.suffix_img.indexOf(suffix) != -1) {
                                    obj.img_arr.push(fjdz[j]);
                                    continue;
                                }
                                obj.file_arr.push(fjdz[j]);
                            }
                            new_ary.push(obj);
                        }
                    }
                    this.card_detail_list = new_ary;
                }
            });
            table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define,
            date_input:{startDate:"my-datepicker",endDate:"my-datepickers",type:2}
        }
    });
