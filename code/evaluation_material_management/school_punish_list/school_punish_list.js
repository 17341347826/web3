/**
 * Created by Administrator on 2018/6/21.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("evaluation_material_management", "school_punish_list/school_punish_list", "css!"),
        C.Co("evaluation_material_management", "school_punish_list/school_punish_list", "html!"),
        "layer",
        C.CM("table"),
        C.CMF("data_center.js"), C.CM("three_menu_module")],
    function ($,avalon, css, html, layer, table,data_center,three_menu_module) {
        //年级列表 // 班级列表
        var grade_list = api.PCPlayer + "class/school_class.action";
        //处分列表
        var punish_list=api.growth + "punish_findbyPunish";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "school_punish_list",
                url: punish_list,
                data:{
                    offset: 0,
                    rows: 15
                },
                //年级列表
                grade_list:[],
                //班级列表
                class_list:[],

                //请求参数
                //学校
                fk_school_id: "",
                //年级
                fk_grade_id: "",
                // 班级id
                fk_class_id: "",
                //请求处分列表
                extend:{
                    classid:'',
                    gradeid:'',
                    //区县id,学校id
                    schoolid:'',
                    __hash__: ""
                },
                // 列表表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "姓名",
                    type: "text",
                    from: "punished_person"
                }, {
                    title: "学籍号",
                    type: "text",
                    from: "punished_person_num"
                },{
                    title: "年级",
                    type: "text",
                    from: "gradename"
                }, {
                    title: "班级",
                    type: "text",
                    from: "classname"
                }, {
                    title: "处分名称",
                    type: "text",
                    from: "punish_name"
                },{
                    title: "处分类型",
                    type: "cover_text",
                    from: "punish_type",
                    dict: {
                        1: '警告',
                        2: '严重警告',
                        3: '记过',
                        4: '记大过'
                    }
                },{
                    title: "处分时间",
                    type: "text",
                    from: "punish_time"
                },{
                    title: "操作",
                    type: "html",
                    from: "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:5})' title='查看'></a>"
                }],
                //  列表按钮操作
                cbopt: function (params) {
                    // console.log(params);
                    if (params.type == 5) {
                        var punish_id=params.data.id;
                        window.location="#school_punish_detail?punish_id="+punish_id;
                    }
                },
                init:function () {
                    this.cds();
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var tUserData = JSON.parse(data.data["user"]);
                        //学校id
                        self.extend.schoolid=tUserData.fk_school_id;
                        //第一次请求所有处分列表
                        // self.url=punish_list;
                        // self.extend.__hash__=new Date();

                        self.fk_school_id=tUserData.fk_school_id;
                        //年级列表
                        ajax_post(grade_list, {
                            school_id:self.fk_school_id,
                            offset: 0,
                            rows: 99999
                        }, self);
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //    年级、班级
                            case  grade_list:
                                this.complete_get_grade(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //年级--班级
                complete_get_grade:function(data){
                    //年级集合
                    this.grade_list=data.data;
                    //班级集合
                    this.class_list=data.data[0].class_list;
                    // this.fk_grade_id=data.data[0].grade_id;
                    // this.fk_class_id=data.data[0].class_list[0].class_id;
                    // console.log( this.fk_class_id);
                },
                //年级改变
                gradeChange:function(){
                    var gId=this.fk_grade_id;
                    this.extend.gradeid=Number(this.fk_grade_id);
                    this.extend.schoolid=Number(this.fk_school_id);
                    this.extend.classid='';
                    this.fk_class_id='';
                    //年级集合
                    var grade=this.grade_list;
                    for(var i=0;i<grade.length;i++){
                        var grade_id=grade[i].grade_id;
                        if(gId==grade_id){
                            //班级集合
                            this.class_list=grade[i].class_list;
                            // this.extend.classid=grade[i].class_list[0].class_id;
                        }
                    }
                    //请求列表
                    this.url=punish_list;
                    this.extend.__hash__=new Date();
                },
                //班级改变
                classChange:function(){
                    this.extend.gradeid=Number(this.fk_grade_id);
                    this.extend.schoolid=Number(this.fk_school_id);
                    this.extend.classid=Number(this.fk_class_id);
                    //请求列表
                    this.url=punish_list;
                    this.extend.__hash__=new Date();
                }
            });
            table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });