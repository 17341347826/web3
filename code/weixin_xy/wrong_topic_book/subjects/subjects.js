/**
 * Created by Administrator on 2018/1/25.
 */
define(['jquery',
        C.CLF("avalon.js"),
        C.Co("weixin_xy/wrong_topic_book", "subjects/subjects", "css!"),
        C.Co("weixin_xy/wrong_topic_book", "subjects/subjects", "html!"),
        C.CMF("data_center.js")
    ],
    function ($, avalon, css, html, data_center) {
        //获取最近的考试id和科目信息
        var api_get_subject=api.xy+'front/wrongQuestion_getSubjectAndExamIds';
        //统计科目的错题数量:/wrongset/wrong_count/:stu_num/:emxa_ids/:subject_codes'
        var api_wrong_count=api.wr+'questions/count';
        var avalon_define = function (par) {
            var vm = avalon.define({
                $id: "topic_analysis",
                //时间段
                period:'4',
                //科目集合
                sub_list:[],
                //科目信息
                sub_info:[],
                //考试项目id集合
                exam_ids:'',
                //初始化
                init: function () {
                  ajax_post(api_get_subject,{period:this.period},this);
                },
                //时间改变
                period_change:function(){
                    ajax_post(api_get_subject,{period:this.period},this);
                },
                go_single_subject:function (al) {
                    window.location = "#singl_subject?sub_code="+al.subject_code+'&wrong_num='+
                        al.wrong_count+'&sub_name='+al.subject_name+'&exam_ids='+this.exam_ids;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_subject:
                                this.complete_get_subject(data);
                                break;
                            //错题数
                            case api_wrong_count:
                                this.complete_wrong_count(data);
                                break;
                        }
                    } else {
                        $.alert(msg);
                    }
                },
                //获取考试科目
                complete_get_subject:function(data){
                    var list=data.data.subject_list;
                    this.sub_list=list;
                    var emxa_ids=data.data.exam_ids;
                    this.exam_ids=emxa_ids;
                    var stu_num=sessionStorage.getItem('guid');
                    var subject_codes='';
                    for(var i=0;i<list.length;i++){
                        if(i<list.length-1){
                            subject_codes+=list[i].subject_code+','
                        }else{
                            subject_codes+=list[i].subject_code
                        }
                    }
                    //接口重新赋值
                    api_wrong_count=api_wrong_count+'?student_number='+stu_num+'&exam_ids='+emxa_ids+'&subject_codes='+subject_codes;
                    //错题数目
                    ajaxGet(api_wrong_count,{},this);
                },
                complete_wrong_count:function(data){
                    var sub=this.sub_list;
                    var wrong_nums=data.data;
                    //将错题数添加进去
                    for(var i=0;i<sub.length;i++){
                        for(var j=0;j<wrong_nums.length;j++){
                            if(sub[i].subject_code==wrong_nums[j].subject_code){
                                sub[i].wrong_count=wrong_nums[j].wrong_count;
                            }
                        }
                    }
                    //将数组拼成3的倍数好进行排版
                    if(sub.length/3!=0){
                        var len=3-sub.length%3;
                        for(var i=0;i<len;i++){
                            var obj={};
                            obj.subject_code='';
                            obj.subject_name='';
                            obj.wrong_count='';
                            sub.push(obj);
                        }
                    }
                    //将数组三个一等分
                    for(var i=0,len=sub.length;i<len;i+=3){
                        this.sub_info.push(sub.slice(i,i+3));
                    }
                    // console.log(this.sub_info)
                }
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