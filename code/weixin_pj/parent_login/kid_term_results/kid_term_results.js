/**
 * Created by Administrator on 2018/9/7.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("weixin_pj/parent_login", "kid_term_results/kid_term_results", "css!"),
        C.Co("weixin_pj/parent_login", "kid_term_results/kid_term_results", "html!"),
        C.CMF("data_center.js"),
        "jquery-weui",C.CLF('base64.js')
    ],
    function ($, avalon,css, html, data_center,weui,bs64) {
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "kid_term_results",
                data:{
                    fk_grade_id:"",
                    fk_semester_id:"",
                    guid:"",
                    listType:10,
                    workid:"",
                    offset:0,
                    rows:999
                },
                //登陆者基本信息-学生
                login_info:{},
                semester_list:[],
                info:[],
                index:"",
                head:[],
                init:function () {
                    var semester_list = [];
                    var dataList = [];
                    var user_type = cloud.user_type();
                    if(user_type != 3){//目前只知道学生也会用
                        this.login_info = cloud.user_user();
                        this.data.fk_grade_id = cloud.user_grade_id();
                        this.data.guid = cloud.user_guid();
                        this.data.workid = cloud.user_school_id();
                    }else if(user_type == 3){//家长
                        this.login_info = cloud.user_user().student;
                        this.data.fk_grade_id = cloud.parent_stu().fk_grade_id;
                        this.data.guid = cloud.parent_stu().guid;
                        this.data.workid = cloud.parent_stu().fk_school_id;
                    }
                    semester_list = cloud.grade_semester_list({grade_id:this.data.fk_grade_id});
                    cloud.my_term_result(vm.data.$model,function (url, s, data) {
                        dataList = data;
                        var dataLength = dataList.length;
                        //获取表头
                        for(var i=0;i<dataList.length;i++){
                            if(dataList[i].evaluate_grade_list.length>0){
                                vm.head = dataList[i].evaluate_grade_list;
                                break;
                            }
                        }
                        if(dataLength != 0){
                            var semesterLength = semester_list.length;
                            for(var i = 0;i < semesterLength; i++){
                                for(var j = 0;j < dataLength; j++){
                                    if(dataList[j].semester_id == semester_list[i].id){
                                        semester_list[i]['list'] = dataList[j].evaluate_grade_list;
                                        semester_list[i]['sum_score'] =  dataList[j].sum_score;
                                        semester_list[i]['daily_evaluation_score'] =  dataList[j].daily_evaluation_score;
                                        semester_list[i]['grade_name'] =  dataList[j].grade_name;
                                        vm.index = i;
                                    }
                                }
                            }
                            //组表格数据
                            for(var i=0;i<semester_list.length;i++){
                                if(semester_list[i].hasOwnProperty('list')){
                                    var len = semester_list[i].list.length;
                                    if(len == 0){
                                        for(var j=0;j<vm.head.length;j++){
                                            var obj = {};
                                            obj.signname1 = '';
                                            obj.evaluate_score = '';
                                            semester_list[i].list.push(obj);
                                        }
                                    }
                                }else{
                                    semester_list[i]['list'] = [];
                                    for(var j=0;j<vm.head.length;j++){
                                        var obj = {};
                                        obj.signname1 = '';
                                        obj.evaluate_score = '';
                                        semester_list[i]['list'].push(obj);
                                    }
                                }

                            }
                            vm.semester_list = semester_list;

                        }

                    });
                    // this.semester_list = [
                    //     {
                    //         semester_name:'2017-2018学年（上）',
                    //         list:[
                    //             {signname1:'思想品德',evaluate_score:12},
                    //             {signname1:'学业水平',evaluate_score:13},
                    //             {signname1:'艺术素养',evaluate_score:14},
                    //             {signname1:'社会实践',evaluate_score:15},
                    //             {signname1:'身心健康',evaluate_score:16},
                    //         ],
                    //         daily_evaluation_score:24,
                    //         sum_score:94,
                    //         grade_name:'B'
                    //     },
                    //     {
                    //         semester_name:'2017-2018学年（下）',
                    //         list:[
                    //             {signname1:'思想品德',evaluate_score:22},
                    //             {signname1:'学业水平',evaluate_score:23},
                    //             {signname1:'艺术素养',evaluate_score:24},
                    //             {signname1:'社会实践',evaluate_score:25},
                    //             {signname1:'身心健康',evaluate_score:26},
                    //         ],
                    //         daily_evaluation_score:24,
                    //         sum_score:144,
                    //         grade_name:'A'
                    //     }
                    //     ];
                    // console.log(semester_list);
                },
                //学期档案查看
                term_archives:function(el){
                    console.log(el);
                    var grade_id = this.login_info.fk_grade_id;
                    var sem_id =  el.id;
                    var guid = this.login_info.guid;
                    cloud.has_pjda({ fk_nj_id: grade_id, fk_xq_id: sem_id,
                        guid: guid, status: 5
                    }, function (url, args, data) {
                        if (data.length == 0) {
                            $.alert("该学生还未生成学期评价数据");
                            return;
                        }
                        var sid = data[0].fk_pjtjxm_id;
                        // vm.export_extend.project_id = sid;
                        var end_date = '';
                        var start_date = '';
                        for (var i = 0; i < vm.semester_list.length; i++) {
                            if (sem_id == vm.semester_list[i].id) {
                                end_date = vm.semester_list[i].end_date;
                                start_date = vm.semester_list[i].start_date;
                            }
                        }
                        end_date = vm.timeChuo(end_date);
                        start_date = vm.timeChuo(start_date);

                        var href = "guid=" + guid + "&s=" + start_date + "&e=" + end_date +
                            "&sid=" + sid + "&smsid=" + sem_id;
                        data_center.set_key('export_data', JSON.stringify(vm.export_extend));
                        // window.location = '#term_archives?' + href;
                        var token = sessionStorage.getItem('token');
                        var f_url = '/Growth/index.html#evaluation_detail?guid=' +guid+ "&s=" + start_date + "&e=" + end_date +
                            "&sid=" + sid + "&smsid=" +  sem_id;
                        var url =  bs64.encoder(f_url);
                        var dz = window.location.origin + '/api/GrowthRecordBag/wx_growth_file_get_img?token='+token+'&url='+url;
                        window.open(dz)
                    });
                },
                //时间戳
                timeChuo: function (h) {
                    var timestamp3 = h / 1000;
                    var newDate = new Date();
                    newDate.setTime(timestamp3 * 1000);
                    Date.prototype.format = function (format) {
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
                                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                                    date[k] : ("00" + date[k]).substr(("" + date[k]).length));
                            }
                        }
                        return format;
                    }
                    var getTimeIs = newDate.format('yyyy-MM-dd');
                    return getTimeIs;
                },
            });
            vm.$watch('onReady', function () {

            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });