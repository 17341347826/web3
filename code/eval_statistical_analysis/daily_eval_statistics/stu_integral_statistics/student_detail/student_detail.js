define(["jquery", C.CLF('avalon.js'), 'layer',
        C.Co('eval_statistical_analysis/daily_eval_statistics','stu_integral_statistics/student_detail/student_detail','css!'),
        C.Co('eval_statistical_analysis/daily_eval_statistics','stu_integral_statistics/student_detail/student_detail','html!'),
        C.CMF("router.js"), C.CMF("data_center.js")
    ],
    function($, avalon, layer, css, html, x, data_center) {
        //日常表现积分查看
        var api_get_my=api.api+"everyday/get_list_everyday";
        var avalon_define = function(pmx) {
            var table = avalon.define({
                $id: "student_detail",
                url_file:api.api + "file/get",//获取文件,
                //学生头像
                user_photo: cloud.user_photo,
                url_img:url_img,
                //区县名字
                district_name:'',
                //积分列表
                integral_list:[],
                // 请求参数
                extend: {
                    name:'',
                    code:"",
                    start_date:"",
                    end_date:"",
                    //状态 -1删除 1待审核 2审核不通过 3待确认 4已确认(公示) 5归档
                    status:5,
                    offset: 0,
                    rows: 10
                },
                //加载
                index:'',
                //分页
                // 数据总数
                count:'',
                /*总页数*/
                totalPage: "",
                // 计算分页数组
                totalPageArr: [],
                /*当前是第几页*/
                currentPage: 1,
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
                        for(let i=0;i<t_page;i++){
                            p_ary[i]=i+1;
                        }
                    }else if(c_page==0 && t_page>5){
                        for(let i=0;i<5;i++){
                            p_ary[i]=i+1;
                        }
                    }else if(c_page+2>=t_page){//
                        let base=t_page-4;
                        for(let i=0;i<5;i++){
                            p_ary[i]=base+i;
                        }
                    }else{//c_page+2<t_page
                        //显示的第一个页数
                        let base=Math.abs(c_page-2)==0 ? 1 : Math.abs(c_page-2);
                        for(let i=0;i<5;i++){
                            p_ary[i]=base+i;
                        }
                    }
                    this.totalPageArr=p_ary;
                    console.log(this.totalPageArr)
                    // console.log(this.totalPageArr);
                },
                //当前页面跳转
                currentPageDate:function(num){
                    console.log(num)
                    this.currentPage=num;
                    this.extend.offset=num-1;
                    layer.load(1, {shade:[0.3,'#121212']});
                    //获取数据
                    //    成绩奖励
                    ajax_post(api_get_my,this.extend.$model,this);
                },
                //数据类型转换
                back:function () {
                    window.history.go(-1);
                },
                data_change:function(a){
                    return JSON.parse(a);
                },
                url_for: function(id) {
                    // console.log( this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id)
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                //初始化
                init:function(){
                    this.extend.code       = pmx.code;
                    this.extend.name       = pmx.name;
                    this.extend.start_date = pmx.start_date;
                    this.extend.end_date   = pmx.end_date;
                    this.cb();
                },
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level=data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        self.district_name=tUserData.district;
                        self.index=layer.load(1, {shade:[0.3,'#121212']});
                        ajax_post(api_get_my,self.extend.$model,self);
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //日常表现学生积分统计详情
                            case api_get_my:
                                layer.close(this.index);
                                layer.closeAll();
                                window.scrollTo(0, 0);
                                this.complete_get_my(data);
                                this.count=data.data.count;
                                this.set_total_page(this.count);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_my:function(data){
                    ready_photo(data.data.list,'guid');
                    this.integral_list=data.data.list;
                },
            });
            table.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                table.init();
            });
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });