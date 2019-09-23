define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_result_management', 'daily_performance_evaluation/daily_performance_evaluation','html!'),
        C.Co('evaluation_result_management', 'daily_performance_evaluation/daily_performance_evaluation','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),
        "select2"
    ],
    function (avalon,layer, html,css, data_center,select_assembly,three_menu_module, select2) {
        var avalon_define = function () {

            var vm = avalon.define({
                $id: "daily-performance-evaluation",
                login_level:'',
                user_photo: cloud.user_photo,
                orderList:[],
                area_list:[],
                semester_list: [],
                semester_remark:'',
                cur_district_name:"",
                cur_district_id:'',
                grade_list:[],
                class_list:[],
                info:[],
                school_list:[],
                //显示方式：图文-1，表格-2
                html_display:2,
                //表格显示：列表-1，详情-2
                list_detail:1,
                //单个学生详情
                person_detail:{},
                url_img:url_img,
                offset:0,
                fm:{
                    code:"",
                    city:"",
                    district:"",
                    fk_grade_id:"",
                    fk_school_id:"",
                    fk_semester_id:"",
                    fk_class_id:"",
                    offset:0,
                    rows:10
                },
                //分页
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
                        this.totalPage=Math.ceil(count/this.fm.rows);
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
                    this.fm.offset=(num-1)*this.fm.rows;
                    //获取数据
                    //获取数据
                    this.query();
                },
                //序号改变
                set_index:function(idx,c_page){
                    var index=idx+(c_page-1)*this.fm.rows;
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
                        this.fm.offset=(this.currentPage-1)*this.fm.rows;
                        //获取数据
                       this.query();
                    }
                },
                //分页
                //显示方式-列表
                radio_table:function(){
                    //表格显示：列表-1，详情-2
                    this.list_detail =1;
                },
                //列表查看详情
                person_honor:function(el){
                    // console.log(el);
                    //表格显示：列表-1，详情-2
                    this.list_detail = 2;

                    el.img_arr = [];
                    el.video_arr = [];
                    el.file_arr = [];
                    var token = sessionStorage.getItem("token");
                    var fjdz = JSON.parse(el.attachment);
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
                        if (vm.suffix_video.indexOf(suffix) != -1) {//视频
                            el.video_arr.push(fjdz[j]);
                            continue;
                        }
                        if (vm.suffix_img.indexOf(suffix) != -1) {
                            el.img_arr.push(fjdz[j]);
                            continue;
                        }
                        el.file_arr.push(fjdz[j]);
                    }

                    //单个学生详情
                    this.person_detail = el;
                },
                //列表详情返回列表
                back:function(){
                    //表格显示：列表-1，详情-2
                    this.list_detail = 1;
                },
                district_switch:function (el) {
                    if(el.value != ""){
                        this.fm.district = el.name;
                        this.fm.offset = 0;
                        this.currentPage = 1;
                        this.cur_district_name = el.name;
                        this.cur_district_id = el.value.split("|")[0];
                        this.school_list =  this.filter_school(cloud.sel_school_list());
                    }else{
                        this.fm.district = '';
                        this.fm.offset = 0;
                        this.currentPage = 1;
                        this.cur_district_name = '';
                        this.cur_district_id = '';
                        this.fm.fk_school_id = '';
                        this.school_list =  cloud.sel_school_list();
                    }

                },
                filter_school:function (data) {
                    var ret = [];
                    for(var x = 0; x < data.length; x++){
                        if(data[x].value.indexOf(this.cur_district_name)>=0){
                            ret.push(data[x]);
                        }
                    }
                    return ret;
                },
                grade_switch:function (value) {
                    //切换成页面默认表格形式
                    // this.html_display = 2;
                    // this.list_detail = 1;
                    this.fm.fk_grade_id = value.value;
                    this.fm.offset = 0;
                    this.currentPage = 1;
                },
                class_switch:function (value) {
                    //切换成页面默认表格形式
                    // this.html_display = 2;
                    // this.list_detail = 1;
                    this.fm.fk_class_id = value.class_id;
                    this.fm.offset = 0;
                    this.currentPage = 1;

                },
                school_switch:function (va) {
                    var value = va.value;
                    this.fm.fk_school_id = value.split("|")[0];
                    this.fm.district = value.split("|")[1];
                    this.fm.offset = 0;
                    this.currentPage = 1;
                },
                //初始化页面高度
                init_height: function () {
                    var winHeight = 0;
                    if (window.innerHeight)
                        winHeight = window.innerHeight;
                    else if ((document.body) && (document.body.clientHeight))
                        winHeight = document.body.clientHeight;
                    if (document.documentElement && document.documentElement.clientHeight)
                        winHeight = document.documentElement.clientHeight;
                    $('.d-p-c-info').height(winHeight - 140)
                },
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                query:function (num) {
                    //切换成页面默认表格形式
                    vm.html_display = 2;
                    vm.list_detail = 1;
                    if(num == 1){
                        this.fm.offset = 0;
                        this.currentPage = 1;
                    }
                    if(this.html_display == 2 &&
                        this.list_detail == 1){
                        cloud.list_everyday_x(this.fm.$model, function (url, args, data) {
                            if(!data ||!data.list) return;
                            var list= data.list;
                            var list_length = list.length;
                            var token = sessionStorage.getItem("token");
                            for (var i = 0; i < list_length; i++) {
                                if (!list[i].attachment || list[i].attachment == null)
                                    continue;
                                var fjdz = JSON.parse(list[i].attachment);
                                list[i].img_arr = [];
                                list[i].video_arr = [];
                                list[i].file_arr = [];
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
                                    if (vm.suffix_video.indexOf(suffix) != -1) {//视频
                                        list[i].video_arr.push(fjdz[j]);
                                        continue;
                                    }
                                    if (vm.suffix_img.indexOf(suffix) != -1) {
                                        list[i].img_arr.push(fjdz[j]);
                                        continue;
                                    }
                                    list[i].file_arr.push(fjdz[j]);
                                }
                            }
                            vm.info = list;
                            vm.count=data.count;
                            //获取总页数+当前显示分页数组
                            vm.set_total_page(vm.count);
                        });
                    }else{
                        cloud.list_everyday(this.fm.$model, function (url, args, data) {
                            vm.info = data;
                            vm.count=data.count;
                            //获取总页数+当前显示分页数组
                            vm.set_total_page(vm.count);
                        });
                    }


                },
                //学年学期
                semesterChange:function (index) {
                    this.semester_remark = index;
                    this.fm.offset = 0;
                    this.currentPage = 1;
                    //切换成页面默认表格形式
                    this.html_display = 2;
                    this.list_detail = 1;
                    if(index == 0 ){
                        this.fm.fk_semester_id = "";
                        this.query();
                        //  cloud.list_everyday(this.fm.$model, function (url, args, data) {
                        //     vm.info = data;
                        // });
                         return;
                    }
                    this.fm.fk_semester_id = this.semester_list[index].value.split("|")[0];
                    //  cloud.list_everyday(this.fm.$model, function (url, args, data) {
                    //     vm.info = data;
                    // });
                    this.query();
                },
                init:function () {
                    var user_level = cloud.user_level();
                    this.login_level = user_level;
                    this.fm.district = cloud.user_district();
                    this.fm.city = cloud.user_city();
                    //1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                    if(user_level>=4 && user_level<=6){
                        this.fm.fk_school_id = cloud.user_school_id();
                    }
                    if(user_level == 4){
                        var dataList = cloud.grade_list();
                            var dataLength = dataList.length;
                            for(var i = 0;i<dataLength;i++){
                                dataList[i]['name'] = dataList[i].grade_name;
                                dataList[i]['value'] = dataList[i].grade_id;
                                for(var j = 0;j<dataList[i].class_list.length;j++){
                                    dataList[i].class_list[j]['name'] = dataList[i].class_list[j].class_name
                                }
                            }
                        this.grade_list = dataList;
                        this.class_list = dataList[0].class_list;
                    }else{
                        this.school_list = this.filter_school(cloud.sel_school_list());
                        var area_list = cloud.area_list();
                        this.area_list = any_2_select(area_list, {name: "district", value: ["id"]})
                        this.grade_list = cloud.grade_all_list();
                    }
                    this.semester_list = cloud.semester_all_list();
                    this.semester_list.unshift({name:"最新记录"});
                    this.semester_remark = 0;
                    // cloud.list_everyday(this.fm.$model, function (url, args, data) {
                    //     vm.info = data;
                    // });
                    this.query();
                    var obj={
                        name:'全部',
                        value:''
                    };
                    this.school_list.unshift(obj);
                    this.grade_list.unshift(obj);
                    this.area_list.unshift(obj);

                },
                cb: function () {

                }
            });
            vm.$watch('onReady', function () {
                vm.init_height();
                $("#school_sel").select2();

            });
            vm.$watch('html_display', function (a, b) {
                if(vm.html_display == 2){
                    vm.query();
                }

            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });