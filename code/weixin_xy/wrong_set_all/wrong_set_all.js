define([C.CLF('avalon.js'),
        "jquery",
        //c.co(上级名字， 本级路径名字)
        C.Co("weixin_xy", "wrong_set_all/wrong_set_all", "html!"),
        C.Co("weixin_xy", "wrong_set_all/wrong_set_all", "css!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "amazeui",
        "jquery_weui"
    ],
    function(avalon, $,html,css, x, data_center,amazeui,weui) {
        // 查询wrongset 项目下的  wrongset 数据库里面的科目错题
        var api_wrongset_error = api.wr + "wrongTitle/getWrongTitleByStuNum";
        //wrongset 项目下的  wrongset 数据库里面的科目错题，到xtyun项目下的  xtyun 数据库查询科目错题
       var query_wrong_title_by_xtyun = api.xy + "front/totalErrorSet_getWrongTitleByStuNum.action";
        //从xtyun项目下的  xtyun 数据库保存错题到 wrongset 数据库
        var save_wrong_title_to_wrongset = api.wr + "wrongTitle/saveWrongTitle";
        //保存答错原因
        var update_wrong_res_to_wrongset = api.wr + "wrongTitle/updateWrongReason";
        //保存学习状态
        var update_learning_state_to_wrongset = api.wr + "wrongTitle/updateLearningState";
        //获取试卷图片
        var api_get_img=api.xy+"svc_error/ori_pull";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "wrong_set_all",
                //项目名称
                exam_name:'',
                //科目名称
                sub_name:'',
                //错题集
                wrong_ary:[],
                wrong_data:[],
                files: [],
                click_index:-1,
                showTitle:false,
                wrong_res:'',
                //错误信息提示
                notice_msg:'',
                request_data:{
                        //科目代码
                        subjectCode:"",
                        //考试项目id
                        examId:"",
                        //学生学号
                        stuNum:""
                },
                save_xyun_title:{
                    //考试项目ID
                    examId:'',
                    //科目ID
                    subjectCode:'',
                    //题目
                    title:'',
                    //学生学号
                    stuNum:'',
                    //知识点
                    knowledgePoint:'',
                    //题目得分
                    getScore:'',
                    //题目总分
                    allScore:''
                },
                update_wrong_res_post_data:{
                    //考试项目ID
                    examId:'',
                    //科目ID
                    subjectCode:'',
                    //题目
                    title:'',
                    //学生学号
                    stuNum:'',
                    //错误原因
                    wrongRes:''
                },
                update_learning_state_post_data:{
                    //考试项目ID
                    examId:'',
                    //科目ID
                    subjectCode:'',
                    //题目
                    title:'',
                    //学生学号
                    stuNum:'',
                    //学习状态
                    learningState:''
                },
                //题目
                img_type:-1,
                //图片点击
                btn_img:function(ind){
                   this.img_type=ind;
                },
                //我的答案
                my_answer_type:-1,
                //图片点击
                btn_img_answer:function(ind){
                    this.my_answer_type=ind;
                },
                //正确答案
                sure_answer_type:-1,
                //图片点击
                btn_sure_answer:function(ind){
                    this.sure_answer_type=ind;
                },
                query_wrong_title:function () {
                  ajax_post(api_wrongset_error,this.request_data.$model,this);
                },
                save_wrong_res:function (index,value) {
                    this.click_index = index;
                    var title = this.wrong_ary[index].title;
                    this.wrong_ary[index].wrongReason = value;
                    // this.wrong_ary[index].wrongReason = 0;
                    var res = this;
                    res.update_wrong_res_post_data.examId =pmx.exam_id;
                    res.update_wrong_res_post_data.stuNum =  sessionStorage.getItem('guid');
                    res.update_wrong_res_post_data.subjectCode = pmx.sub_id;
                    res.update_wrong_res_post_data.title = title;
                    res.update_wrong_res_post_data.wrongRes = value;
                    ajax_post(update_wrong_res_to_wrongset,res.update_wrong_res_post_data.$model,this);
                },
                save_learning_state:function (index,value) {
                    this.click_index = index;
                    var title = this.wrong_ary[index].title;
                    this.wrong_ary[index].learningState = value;
                    var res = this;
                    res.update_learning_state_post_data.examId =pmx.exam_id;
                    res.update_learning_state_post_data.stuNum = sessionStorage.getItem('guid');
                    res.update_learning_state_post_data.subjectCode = pmx.sub_id;
                    res.update_learning_state_post_data.title = title;
                    res.update_learning_state_post_data.learningState = value;
                    // console.log(res.update_learning_state_post_data.$model);
                    ajax_post(update_learning_state_to_wrongset,res.update_learning_state_post_data.$model,this);
                },
                init:function(){
                    // console.log(pmx);
                    this.exam_name=pmx.exam_name;
                    this.sub_name=pmx.sub_name;
                    //请求wrongset 项目下的错题参数
                    this.request_data.subjectCode=pmx.sub_id;
                    this.request_data.examId=pmx.exam_id;
                    this.request_data.stuNum=sessionStorage.getItem('guid');
                    this.query_wrong_title();
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    // console.log(is_suc);
                    if (is_suc) {
                        switch (cmd) {
                            //wrongset 项目下
                            case api_wrongset_error:
                                this.completet_get_errors(data);
                                break;
                            // xtyun项目
                            case query_wrong_title_by_xtyun:
                                if(data.data!=null && data.data.length!=0){
                                    // this.wrong_ary=data.data;
                                    this.completet_get_errors(data);
                                    this.save_wrong_title_complete_by_xtyun(data);
                                }else{
                                    this.notice_msg='暂时没有数据';
                                }
                                break;
                            //保存到wrongset项目中
                            case save_wrong_title_to_wrongset:
                                break;
                            //保存答错原因
                            case update_wrong_res_to_wrongset:
                                if(status=='200'){
                                    $.alert({
                                        title: '标题',
                                        text: '答错原因修改成功',
                                        onOK: function () {
                                            //点击确认
                                        }
                                    });
                                }
                                break;
                            //保存学习状态
                            case update_learning_state_to_wrongset:
                                if(status=='200'){
                                    $.alert({
                                        title: '标题',
                                        text: '学习状态修改成功',
                                        onOK: function () {
                                            //点击确认
                                        }
                                    });
                                }
                                break;
                            //图片
                            case api_get_img:
                                break;
                        }
                    }else{
                        $.alert(msg);
                    }
                },
                //错题查询
                completet_get_errors:function(data){
                    var self=this;
                    self.wrong_ary=data.data;
                    if(data.data==null || data.data.length==0){
                        ajax_post(query_wrong_title_by_xtyun,this.request_data.$model,this);
                    }else{
                        // svc_error/pull/项目号/科目号/准考证号/题号/题类型
                        console.log(pmx);
                        var exam_id=pmx.exam_id;
                        var sub_id=pmx.sub_id;
                        var regis_num=sessionStorage.getItem('guid');
                        for(var i=0;i<data.data.length;i++){
                            var title=data.data[i].title;
                            var url1=api_get_img+'/'+exam_id+'/'+sub_id+'/'+regis_num+'/'+title+'/'+1;
                            var url2=api_get_img+'/'+exam_id+'/'+sub_id+'/'+regis_num+'/'+title+'/'+2;
                            var url3=api_get_img+'/'+exam_id+'/'+sub_id+'/'+regis_num+'/'+title+'/'+3;
                            self.wrong_ary[i].src1=url1;
                            self.wrong_ary[i].src2=url2;
                            self.wrong_ary[i].src3=url3;
                            console.log(self.wrong_ary[i]);
                        }
                    }
                   self.wrong_data=self.wrong_ary;
                    console.log( self.wrong_data);
                },
                //存数据到wrongset中
                save_wrong_title_complete_by_xtyun : function(data){
                    var self = this;
                    for(var i = 0;i < data.data.length;i++){
                        var list = data.data[i];
                        self.save_xyun_title.examId = pmx.exam_id;
                        self.save_xyun_title.subjectCode =pmx.sub_id;
                        self.save_xyun_title.title = list.title;
                        self.save_xyun_title.stuNum = sessionStorage.getItem('guid');
                        self.save_xyun_title.knowledgePoint = list.knowledgePoint;
                        self.save_xyun_title.getScore = list.getScore;
                        self.save_xyun_title.allScore = list.allScore;
                        // console.log(self.save_wrong_title_post_data.$model);
                        ajax_post(save_wrong_title_to_wrongset,self.save_xyun_title.$model,self);
                    }
                },
                //展开收起操作
                is_diaplay:function (index) {
                    this.current_value = '';
                    this.current_value1 = '';
                    if(this.click_index == index){
                        this.click_index = -1;
                    }else {
                        this.click_index = index;
                    }
            }
            });
            // vm.$watch('onReady', function() {
            //     this.query_wrong_title();
            // });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
