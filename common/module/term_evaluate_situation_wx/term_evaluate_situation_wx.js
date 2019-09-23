/**
 * Created by Administrator on 2018/9/3.
 */
/**
 *当前学期评价进行情况微信端
 */
define(['jquery',
        C.CLF('avalon.js'),'layer',
        C.CM("term_evaluate_situation_wx", "html!"),
        C.CM("term_evaluate_situation_wx", "css!"),
        C.CMF("router.js"),
        C.CMF("data_center.js")],
    function ($,avalon,layer,html,css,x, data_center) {
        var pdetail = undefined;
        //获取当前学年学期
        var api_current_term = api.user + 'semester/current_semester.action';
        //当前学期评价进行情况
        var api_term_situation = api.api + 'GrowthRecordBag/stu_eval_progress';
        var vm = avalon.component('ms-term-evaluate-situation-wx', {
            template: html,
            defaults: {
                evaluate_list:{},
                //tips数据
                //综合实践
                sj_tips:[
                    // {name:'思想品德',value:1},
                    // {name:'学业水平',value:2},
                    // {name:'身心健康',value:3},
                    // {name:'艺术素养',value:4},
                    // {name:'社会实践',value:5},
                ],
                //获得奖励
                jl_tips:[
                    // {name:'思想品德',value:7},
                    // {name:'学业水平',value:8},
                    // {name:'身心健康',value:9},
                    // {name:'艺术素养',value:14},
                    // {name:'社会实践',value:15},
                ],
                //个性特长
                tc_tips:[
                    // {name:'思想品德',value:21},
                    // {name:'学业水平',value:22},
                    // {name:'身心健康',value:23},
                    // {name:'艺术素养',value:24},
                    // {name:'社会实践',value:25},
                ],
                extend:{
                    fk_school_id:'',
                    fk_grade_id:'',
                    fk_class_id:'',
                    //学期id（必传）	number	@mock=4
                    fk_semester_id:'',
                    //学生guid(必传)	string	@mock=444
                    guid:'',
                    //学期结束时间（必传）	string	@mock=2018-07-23
                    semester_end_date:'',
                    //学期开始时间（必传）	string	@mock=2018-03-05
                    semester_start_date:'',
                },
                init:function(){
                    this.cd();
                },
                cd:function(){
                    var self = this;
                    data_center.uin(function (data) {
                        var tUser = JSON.parse(data.data.user);
                        //user_type：0：管理员；1：教师；2：学生；3：家长
                        var user_type = data.data.user_type;
                        if(user_type == '2'){//学生
                            var semester = JSON.parse(data.data.semester);
                            self.extend.fk_school_id = tUser.fk_school_id;
                            self.extend.fk_grade_id = tUser.fk_grade_id;
                            self.extend.fk_class_id = tUser.fk_class_id;
                            self.extend.guid = tUser.guid.toString();
                            self.extend.fk_semester_id = semester.id;
                            self.extend.semester_end_date = semester.end_date.substr(0,10);
                            self.extend.semester_start_date = semester.start_date.substr(0,10);
                            ajax_post(api_term_situation,self.extend.$model,self);
                        }else if(user_type == '3'){//家长
                            var stu = tUser.student;
                            self.extend.fk_school_id = stu.fk_school_id;
                            self.extend.fk_grade_id = stu.fk_grade_id;
                            self.extend.fk_class_id = stu.fk_class_id;
                            self.extend.guid = stu.guid.toString();
                            //    当前学年学期
                            ajax_post(api_current_term,{},self);
                        }
                    })
                },
                //鼠标放上去事件
                hover_tip:function(name,list){
                    // text = '<div>'+
                    //         <!--ms-for:($idx,el) in @list-->
                    //         '<div>'+{{el.name}}{{el.value}}+'</div>'+
                    //         <!--ms-for-end:-->+
                    //         '</div>'
                    var text = '';
                    if(list.length == 0)
                        return;
                    for(var i=0;i<list.length;i++){
                        text = text+
                            '<div>'+
                            list[i].lxmc+'：'+list[i].cls+
                            '</div>'
                    }
                    layer.tips(text,name,{
                        tips: [3, '#50C9C1'],
                        time: 4000
                    });
                },
                //鼠标移出事件
                leave_tip:function(){
                    layer.closeAll();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if(is_suc){
                        switch (cmd){
                            //    当前学年学期
                            case api_current_term:
                                this.complete_current_term(data);
                                break;
                            //    当前学期评价进度统计
                            case api_term_situation:
                                this.complete_term_situation(data);
                                break;
                        }
                    }else{
                        layer.msg(msg);
                    }
                },
                //当前学年学期
                complete_current_term:function(data){
                    var data = data.data;
                    this.extend.fk_semester_id = data.id;
                    this.extend.semester_end_date = this.timeChuo(data.end_date).substr(0,10);
                    this.extend.semester_start_date = this.timeChuo(data.start_date).substr(0,10);
                    ajax_post(api_term_situation,this.extend.$model,this);
                },
                //当前学期评价进度统计
                complete_term_situation:function(data){
                    // this.evaluate_list = data.data;
                    var list = data.data;
                    var obj = {};
                    for(var i=0;i<list.length;i++){
                        var name = list[i].mkmc;
                        if(name == '目标计划'){
                            obj.mbjh_zt = list[i].zt;
                        }else if(name == '学生自评'){
                            obj.xszp_zt = list[i].zt;
                        }else if(name == '自我描述'){
                            obj.zwms_zt = list[i].zt;
                        }else if(name == '学生互评'){
                            obj.xshp_zt = list[i].zt;
                        }else if(name == '同学寄语'){
                            obj.txjy_zt = list[i].zt;
                        }else if(name == '综合实践'){
                            obj.zhsj_zt = list[i].clzs;
                            this.sj_tips = list[i].sub_list;
                        }else if(name == '获得奖励'){
                            obj.hdjl_zt = list[i].clzs;
                            this.jl_tips = list[i].sub_list;
                        }else if(name == '个性特长'){
                            obj.gxtc_zt = list[i].clzs;
                            this.tc_tips = list[i].sub_list;
                        }else if(name == '违纪违规'){
                            obj.wjwg_zt = list[i].clzs;
                        }else if(name == '日常表现'){
                            obj.rcbx_zt = list[i].clzs;
                        }
                    }
                    this.evaluate_list = obj;
                },
                onReady: function () {
                    this.init();
                    $('#gn-name').on('click',function(){
                        text = '<div>'+
                            '<div>思想品德：1</div>'+
                            '<div>学业水平：2</div>'+
                            '<div>身心健康：1</div>'+
                            '<div>艺术素养：6</div>'+
                            '<div>社会实践：4</div>'+
                            '</div>'
                        layer.tips(text, {
                            tips: [1, '#fff'],
                            time: 4000
                        });
                    });
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
                    }
                    var getTimeIs=newDate.format('yyyy-MM-dd');
                    return getTimeIs;
                },
            }
        });
    });
