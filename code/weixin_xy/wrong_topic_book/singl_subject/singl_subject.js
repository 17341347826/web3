/**
 * Created by Administrator on 2018/1/25.
 */
define(['jquery',
        C.CLF("avalon.js"),
        C.Co("weixin_xy/wrong_topic_book", "singl_subject/singl_subject", "css!"),
        C.Co("weixin_xy/wrong_topic_book", "singl_subject/singl_subject", "html!"),
        C.CMF("data_center.js")
    ],
    function ($, avalon, css, html, data_center) {
        //获取考试信息
        var api_get_exam=api.wr+'exams/wrong_count';
        //获取考试项目某科目错题列表
        var api_wrong_ques=api.wr+'questions';
        //获取试卷tag-A/B
        var get_ori_list_api = api.wy + "svc_error/get_paper_list";
        //指定题号-获取试卷原题or答案
        var api_get_img = api.wy + "svc_error/ori_pull";
        var avalon_define = function (par) {
            var vm = avalon.define({
                $id: "singl_subject",
                //考试项目集合
                exam_ids:'',
                //错题列表请求参数
                req_data:{
                    //	考试id	number	必传
                    exam_id:'',
                    //知识点名	string
                    knowledge_name:'',
                    //学籍号	string	必传
                    student_number:'',
                    //学科代码	string	必传
                    subject_code:'',
                },
                //考试信息集合
                exam_data:[],
                //某项目科目错题集合
                wrong_data:[],
                //展开--默认展开第一个
                is_show:0,
                //试卷tag
                tag:'',
                //原题图片集合
                proto_img:[],
                init: function () {
                    this.exam_ids                = par.exam_ids;
                    // this.req_data.knowledge_name = par.sub_name;
                    this.req_data.subject_code   = par.sub_code.toString();
                    this.req_data.student_number = sessionStorage.getItem('guid');
                    api_get_exam=api_get_exam+'?exam_ids='+par.exam_ids+'&student_number='+this.req_data.student_number+
                    '&subject_code='+this.req_data.subject_code;
                    ajaxGet(api_get_exam,{},this);
                },
                //错题详情
                err_detail: function (al) {
                    window.location = "#error_detail?fkKsId="+al.fkKsId+'&ctmc='+al.ctmc+'&xjh='+al.xjh+
                            '&kcbh='+al.kcbh+'&cth='+al.cth+'&ctlx='+al.ctlx;
                },
                //筛选
                screen: function () {
                    window.location = "#screen"
                },
                //考试科目点击-错题展开，收起
                exam_btn:function(idx,id,count){
                    if(count==0){
                        $.alert('该次考试没有错题');
                        return;
                    }
                    this.is_show=idx;
                    this.req_data.exam_id=id;
                    //考试某项目科目错题信息
                    ajaxGet(api_wrong_ques,this.req_data.$model,this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //考试信息
                            case api_get_exam:
                                this.complete_get_exam(data);
                                break;
                        //        考试某项目科目错题信息
                            case api_wrong_ques:
                                this.complete_wrong_ques(data);
                                break;
                        //        试卷tag
                            case get_ori_list_api:
                                this.complete_ori_list(data);
                                break;
                        //        原题
                            case api_get_img:
                                break;
                        }
                    } else {
                        $.alert(msg);
                    }

                },
                //考试
                complete_get_exam:function(data){
                    this.exam_data=data.data;
                    for(var i=0;i<this.exam_data.length;i++){
                        if(this.exam_data[i].exam_info){
                            this.req_data.exam_id=Number(this.exam_data[i].exam_info.id);
                            this.is_show=i;
                           break;
                        }
                    }
                    api_wrong_ques=api_wrong_ques+'?exam_id='+this.req_data.exam_id+'&student_number='+this.req_data.student_number+
                            '&subject_code='+this.req_data.subject_code;
                    // console.log(api_wrong_ques);
                    ajaxGet(api_wrong_ques,{},this);
                },
                //错题列表
                complete_wrong_ques:function(data){
                    this.wrong_data=data.data;
                //    获取试卷tag
                    ajaxPost(get_ori_list_api, {
                        exam_code:  this.req_data.exam_id,
                        zkzh:  this.req_data.student_number,
                        subject_code:  Number(this.req_data.subject_code)
                    }, this)
                },
                //试卷tag
                complete_ori_list:function(data){
                    if (!data.data || data.data.length == 0) {
                        $.alert('无试卷信息');
                        return;
                    }
                    this.tag = data.data[0];
                    // console.log(this.wrong_data);
                    var wr=this.wrong_data;
                    var img_ary=[];
                   for(var i=0;i<wr.length;i++){
                        var ctlx=wr[i].ctlx;
                        i_cth=ctlx+'-'+wr[i].cth;
                        var obj={};
                        obj.cth=wr[i].cth;
                        obj.img= api_get_img + '/' + this.req_data.exam_id + '/' +
                            this.req_data.subject_code + '/' + this.tag + '/' + i_cth + '/' + 1;
                        img_ary.push(obj);
                   }
                   // console.log(img_ary);
                    this.proto_img=img_ary;
                },
            });
            require(["jquery_weui"], function (j) {
                vm.init();
            });
            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    });