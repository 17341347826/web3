/**
 * Created by Administrator on 2018/6/6.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('daily_performance', 'student/student_daily_perform_see/student_daily_perform_see','html!'),
        C.Co('daily_performance', 'student/student_daily_perform_see/student_daily_perform_see','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,three_menu_module) {
        var list_api = api.api + "everyday/get_list_my_everyday";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "daily_perform_see",
                //年级列表
                grade_list: [],
                //班级列表
                class_list: [],
                //学年学期列表
                semester_list: [],
                //年级列表和班级列表
                user_info: [],
                //需要传参
                extend: {
                    code: '',
                    name:"",
                    fk_semester_id: "",
                    //状态 -1删除 1待审核 2审核不通过 3待确认 4已确认(公示) 5归档
                    status: 5,
                    fk_class_id:"",
                    offset:0,
                    rows:10
                },
                list:[],
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had:false,
                district_name:"",
                //前一次请求的滚动条高度
                old_scroll_top: '',
                url_img: url_img,
                user_photo: cloud.user_photo,
                current_menu:'',
                //显示方式：图文-1，表格-2
                html_display:2,
                //表格显示：列表-1，详情-2
                list_detail:1,
                //单个学生详情
                person_detail:{},
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
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    ajax_post(list_api, this.extend.$model, this)
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
                        layer.load(1, {shade:[0.3,'#121212']});
                        this.data_had = false;
                        ajax_post(list_api, this.extend.$model, this)
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
                init: function () {
                    this.district_name = D("user.user.district");
                    this.semester_list = cloud.semester_all_list();

                    this.current_menu = this.semester_list[0].value;
                    this.get_semester_id(this.current_menu);
                    this.get_data();
                    // this.listen_scroll();
                },
                uninit:function () {
                    $(window).unbind ('scroll');
                },
                listen_scroll: function () {
                    var self = this;
                    if(this.html_display == 2)//表格
                        return;
                    var range = 100;
                    $(window).scroll(function () {
                        var srollPos = $(window).scrollTop();    //滚动条距顶部距离(页面超出窗口的高度)
                        totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
                        if(($(document).height()-range) <= totalheight ) {
                            if (self.list.length < self.extend.rows)
                                return;
                            self.extend.rows += 15;
                            self.old_scroll_top = $(document).height()-range;
                            self.get_data();
                        }
                    })
                },
                get_data: function () {
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    ajax_post(list_api, this.extend.$model, this)
                },
                get_semester_id:function (semester) {
                    this.extend.fk_semester_id = semester.split('|')[0];
                },
                //菜单跳转
                menu_jump:function (value) {
                    //切换成页面默认表格形式
                    this.html_display = 2;
                    this.list_detail = 1;
                    this.current_menu = value;
                    this.extend.offset = 0;
                    this.currentPage = 1;
                    this.get_semester_id(this.current_menu);
                    this.get_data();
                },
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case list_api:
                                var list = data.data.list;
                                this.count = data.data.count;
                                //获取总页数+当前显示分页数组
                                this.set_total_page(this.count);
                                var token = sessionStorage.getItem("token");
                                for (var i = 0; i < list.length; i++) {
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
                                ready_photo(list,'guid');
                                sort_by(list,['-everyday_date']);
                                this.list = list;
                                this.data_had = true;
                                layer.closeAll();
                                $(window).scrollTop(0);
                                break;
                            default:
                                break;

                        }
                    } else {
                        toastr.error(msg)
                    }
                },
            });

            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });