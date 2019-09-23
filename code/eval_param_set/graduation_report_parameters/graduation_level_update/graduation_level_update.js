/**
 * Created by Administrator on 2018/6/21.
 */
define(
    [
        C.CLF('avalon.js'), "layer",
        C.Co("eval_param_set", "graduation_report_parameters/graduation_level_update/graduation_level_update", 'css!'),
        C.Co("eval_param_set", "graduation_report_parameters/graduation_level_update/graduation_level_update", 'html!'),
        C.CMF("router.js"), C.CMF("data_center.js")
    ],
    function (avalon,layer,css,html,x,data_center) {
        //获取年级(市级 区县)
        var api_get_grade_leader = api.PCPlayer+"grade/findGrades.action";
        //等级参数设置-保存
        // var api_add_countRank=api.api+'Indexmaintain/indexmaintain_addCountRankParameter';
        var api_add_countRank=api.api+'Indexmaintain/indexmaintain_addCountRankParameter_by';
        //查询详情
        // var api_get_find_by_count_rank = api.api+"Indexmaintain/indexmaintain_findByCountRankParameterInfo";
        var api_get_find_by_count_rank = api.api+"Indexmaintain/indexmaintain_findByCountRankParameterInfo_by";
        //修改
        // var api_update=api.api+"Indexmaintain/indexmaintain_updateCountRankParameterInfo";
        var api_update=api.api+"Indexmaintain/indexmaintain_updateCountRankParameterInfo_by";
        var avalon_define = function (pmx) {
            var default_class_list_as_grade = {
                class_name:"全部班级",
                class_id:"",
                A:{startscore:'',endscore:''},
                B:{startscore:'',endscore:''},
                C:{startscore:'',endscore:''},
                D:{startscore:'',endscore:''},
                E:{startscore:'',endscore:''}
            };
            var vm = avalon.define({
                $id: "graduation_level_update",
                //设置等级个数
                level_count: 5,
                // 等级划分方式
                split_method: 1,
                char_start: "A",
                //标准
                strand:1,
                grade:"",
                grade_id:"",
                is_save_btn:1,
                level_list: ['A', 'B', 'C', 'D', 'E'],

                class_list:[default_class_list_as_grade],
                //查询等级设置是否有数据:false-没有，true-有
                is_count_rank:false,
                //按分数段设置的等级+年级统一标准
                add_data:{
                    id:"",
                    c_classid:[],
                    c_classname:[],
                    c_number:[],
                    c_rank:[],
                    c_grade:"",
                    c_gradeid:"",
                    //标准 1年级统一 2按照各班级
                    c_standard:"",
                    //等级个数
                    c_rankcount:'',
                    //等级划分方式 1按分数段 2按人数比
                    c_rankway:"",
                    //分数段数组
                    c_scoregroup:[]
                },
                avg_width: 0,
                grade_list:[],
                highest_level:"",
                cb: function() {
                    var self=this;
                    data_center.uin(function(data) {
                        var dataList=JSON.parse(data.data['user']);
                        self.highest_level = data.data.highest_level;
                        ajax_post(api_get_grade_leader,{status:1},self);
                    });
                },
                level_count_change:function () {
                    vm.avg_width = (100 / (vm.level_count + 1)).toFixed(2);
                },

                inputLimits:function (e) {
                    e.currentTarget.value=e.currentTarget.value.replace(/^[0]+[0-9]*$/gi,"");
                },
                refresh_class_exam_item:function (grade_id, new_lev) {

                    if( grade_id == undefined )
                    {
                        var class_list = [default_class_list_as_grade];
                        var class_len = class_list.length;
                        var ele_count = new_lev.length;
                        for( var x = 0;x < class_len; x++ ){
                            for( var n = 0; n < ele_count; n++ ){
                                var cur_lev = new_lev[n];
                                if( !class_list[x].hasOwnProperty(cur_lev) ){
                                    class_list[x][cur_lev] = {
                                        "startscore":"",
                                        "endscore":""
                                    }
                                }
                            }
                        }
                        this.class_list = class_list;
                        return;
                    }
                    var grade_length=this.grade_list.length;
                    for(var i=0;i<grade_length;i++){
                        if(this.grade_list[i].grade_id==this.grade_id){
                            var class_list = this.grade_list[i].class_list;
                            var class_len = class_list.length;
                            var ele_count = new_lev.length;
                            for( var x = 0;x < class_len; x++ ){
                                for( var n = 0; n < ele_count; n++ ){
                                    var cur_lev = new_lev[n];
                                    if( !class_list[x].hasOwnProperty(cur_lev) ){
                                        class_list[x][cur_lev] = {
                                            "startscore":"",
                                            "endscore":""
                                        }
                                    }else{
                                        var s = 0;
                                        s = 1;
                                    }
                                }
                            }
                            this.class_list = class_list;
                            break;
                        }
                    }
                },
                //等级划分方式
                split_method_change:function () {
                    if(this.split_method==this.add_data.c_rankway && this.strand==this.add_data.c_standard){
                        ajax_post(api_get_find_by_count_rank,{c_gradeid:this.grade_id.toString()},this);
                    }else{
                        var class_list=this.class_list;
                        var class_list_length=class_list.length;
                        var level_list=this.level_list;
                        var level_list_length=level_list.length;
                        for(var i=0;i<class_list_length;i++){
                            for(var j=0;j<level_list_length;j++){
                                class_list[i][level_list[j]].startscore='';
                                class_list[i][level_list[j]].endscore='';

                            }

                        }
                    }
                },
                t_abstrace:function (obj, key ,num) {
                    var s = [];
                    for( var i = 0; i < obj.length; ++i ){
                        // s.push(obj[i][key]);
                        s = s.concat(Array(num).fill(obj[i][key]))

                    }
                    return s;
                },
                t_abstrace_rank:function (obj ,num) {
                    var s = [];
                    for( var i = 0; i < num; ++i ){
                        // s.push(obj[i][key]);
                        s = s.concat(obj.$model)
                    }
                    return s;
                },
                t_level_abstract_min:function () {
                    var ret = [];
                    var clen = this.class_list.length;
                    var vlen = this.level_list.length;
                    for(var i = 0; i < clen; ++i ){
                        for( var c = 0; c < vlen; ++c ){
                            var cur = this.class_list[i][this.level_list[c]];
                            var value = cur.startscore;
                            ret.push(value)
                        }
                    }
                    return ret;
                },
                t_level_abstract_min_max:function () {
                    var ret = [];
                    var clen = this.class_list.length;
                    var vlen = this.level_list.length;
                    for(var i = 0; i < clen; ++i ){
                        for( var c = 0; c < vlen; ++c ){
                            var cur = this.class_list[i][this.level_list[c]];
                            var value = cur.startscore.toString() + '-' + cur.endscore.toString();
                            ret.push(value)
                        }
                    }
                    return ret;
                },
                save_btn:function () {
                    //get -> c_classid
                    var c_classid = this.t_abstrace(this.class_list, 'class_id',this.level_list.length);

                    var c_classname = this.t_abstrace(this.class_list, 'class_name',this.level_list.length);
                    // get -> c_grade
                    var c_grade = vm.add_data.c_grade;
                    var c_gradeid = vm.add_data.c_gradeid;
                    // c_number
                    var c_number = this.t_level_abstract_min();
                    // c_rank
                    // var c_rank = this.level_list;
                    var c_rank=this.t_abstrace_rank(this.level_list, this.class_list.length);
                    var c_rankcount = this.level_count;
                    //c_rankway
                    var c_rankway = this.split_method;
                    // c_scoregroup
                    var c_scoregroup = this.t_level_abstract_min_max();
                    // c_standard
                    var c_standard = this.strand;

                    var form = {
                        id:this.add_data.id,
                        c_classid:c_classid,
                        c_classname:c_classname,
                        c_grade:c_grade,
                        c_gradeid:c_gradeid,
                        c_number:c_number,
                        c_rank:c_rank,
                        c_rankcount:c_rankcount,
                        c_rankway:c_rankway,
                        c_scoregroup:c_scoregroup,
                        c_standard:c_standard,

                };
                    //这里写判断是否差为100，才请求
                    if(this.split_method==1){//按分数段设置等级
                        //分数段之和
                        //判断是否有负数
                        var get_length=[];
                        for(var i=0;i<c_scoregroup.length;i++){
                            get_length=c_scoregroup[i].split('-');
                            if(get_length.length==3){
                                toastr.warning('不能填写负数');
                                return;
                            }
                        }
                        var spNum=[];//所有数据
                        for(var i=0;i<c_scoregroup.length;i++){
                            spNum=spNum.concat(c_scoregroup[i].split('-'));
                        }
                        //   左区间
                        var leftNum=[];
                        //右区间
                        var rightNum=[];
                        for(var i=0;i<spNum.length;i++){
                            if(spNum[i]==''){
                                toastr.warning('请全部填写');
                                return;
                            }else{
                                if((i+1)%2==0){
                                    leftNum=leftNum.concat((spNum[i]));
                                }else{
                                    rightNum=rightNum.concat((spNum[i]));
                                }
                            }
                        }
                        if(this.strand==1){//按年级
                            //总分动态获取-9.12
                            // if(spNum[0]!=100){
                            //     toastr.warning('A等级左区间必须为100%哦');
                            //     return;
                            // }
                            var spNum_length=spNum.length;
                            if(spNum[spNum_length-1]!=0){
                                toastr.warning('最后一个等级右区间必须为0哦');
                                return;
                            }
                            //判断前一个的右区间和下一个的左区间是否相等
                            var b=0;
                            for(var i=0;i<spNum.length;i++){
                                if(spNum[i]-spNum[i+3]==0 || spNum[2*i+2]==0){
                                    toastr.warning('数据格式不对');
                                    return;
                                }
                            }
                            for(var i=0;i<rightNum.length-1;i++){
                                if(rightNum[i+1]==leftNum[i]){
                                    b++;
                                }else{
                                    toastr.warning('数据格式不对');
                                    return;
                                }
                            }
                            if(b==this.level_list.length-1){
                                var self=this;
                                if(self.is_count_rank==true){
                                    ajax_post(api_update,form,self);
                                }else{
                                    ajax_post(api_add_countRank,form,self);
                                }
                            }
                        }else{//按各班
                            var every_arr=[];
                            var x=0;
                            for(var i=0;i<spNum.length;i++){
                                if(spNum[2*i+2]==0){
                                    toastr.warning('数据格式不对哦');
                                    return;
                                }
                            }
                            //把所有数据按照各数取出来放在一个大数组里
                            every_arr=this.chunk(spNum,this.level_list.length*2);
                            for(var i=0;i<every_arr.length;i++){
                                if(every_arr[i][0]!=100){
                                    toastr.warning('A等级左区间必须为100%哦');
                                    return;
                                }else if(every_arr[i][every_arr[i].length-1]!=0){
                                    toastr.warning('最后一个等级右区间必须为0哦');
                                    return;
                                }else{
                                    //去掉100和0
                                    every_arr[i].shift();
                                    every_arr[i].pop();
                                }
                            }
                            for(var i=0;i<every_arr.length;i++){
                                for(var j=0;j<every_arr[i].length/2;j++){
                                    if(every_arr[i][2*j]==every_arr[i][2*j+1] && every_arr[i][j]-every_arr[i][j+2]!=0){
                                        x++;
                                    }
                                    else{
                                        toastr.warning('第'+(i+1)+'行数据格式不对');
                                        return;
                                    }
                                }
                            }
                            if(x==2*this.level_list.length-2){
                                var self=this;
                                if(self.is_count_rank==true){
                                    ajax_post(api_update,form,self);
                                }else{
                                    ajax_post(api_add_countRank,form,self);
                                }
                            }
                        }
                    }else{//按人数比例设置等级
                        //百分数之和
                        var sumNumber=0;
                        var value_arr=[];
                        var sum_arr=[];
                        for(var i=0;i<c_number.length;i++){
                            if(c_number[i]<0){
                                toastr.warning('不能写负数');
                                return;
                            } else if(c_number[i]==''){
                                toastr.warning('有些没有填写或者为特殊字符');
                                return;
                            }else if(c_number[i]==0){
                                toastr.warning('不能为0');
                                return;
                            }else{
                                value_arr.push(c_number[i]);
                            }

                        }
                        var every_arr=this.chunk(value_arr,this.level_list.length);
                        for(var i=0;i<every_arr.length;i++){
                            sumNumber=0;
                            for(var j=0;j<every_arr[i].length;j++){
                                sumNumber+=Number(every_arr[i][j]);
                            }
                            sum_arr.push(sumNumber);
                        }
                        var a=0;
                        var sum_arr_length=sum_arr.length;
                        for(var i=0;i<sum_arr_length;i++){
                            //总分变成动态获取--9.12
                            // if(sum_arr[i]!=100){
                            //     toastr.warning('设置失败!第'+(i+1)+'个班级比例之和不为100');
                            //     return;
                            // }
                            //else
                                {
                                a++;
                            }
                        }
                        if(a==sum_arr_length){
                            this.is_save_btn=2;
                            var self=this;
                            if(self.is_count_rank==true){
                                ajax_post(api_update,form,self);
                            }else{
                                ajax_post(api_add_countRank,form,self);
                            }
                        }
                    }
                },
                //按各班设置时按照等级个数分别取数组
                chunk:function (arr, size) {
                    var arr1=[];
                    for(var i=0;i<arr.length;i=i+size){
                        var arr2=arr;
                        arr1.push(arr2.slice(i,i+size));
                    }
                    return arr1;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case api_get_grade_leader:
                                this.complete_get_grade(data);
                                break;
                            //获取详情
                            case api_get_find_by_count_rank:
                                this.complete_get_find_by_count_rank(data);
                                break;
                            //    等级设置-保存
                            case api_add_countRank:
                                this.complete_save(data);
                                break;
                            //修改
                            case api_update:
                                this.complete_update(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //年级
                complete_get_grade: function (data) {
                    this.grade_list=data.data;
                    this.get_id();
                },
                //详情
                complete_get_find_by_count_rank:function (data) {
                    if(data.data.length==0){
                        toastr.warning("该年级暂时还没设置等级参数");
                        this.is_count_rank=false;
                    }else{
                        this.is_count_rank=true;
                        data = data.data[0];
                        this.add_data.id=data.id;
                        this.split_method=data.c_rankway;
                        this.strand=data.c_standard;
                        this.level_count=data.c_rankcount;
                        this.add_data.c_rankway=data.c_rankway;
                        this.add_data.c_standard=data.c_standard;
                        this.add_data.c_rankcount=data.c_rankcount;

                        var start_code = vm.char_start.charCodeAt();
                        var level_count = data.c_rankcount;
                        if(level_count == 0)return;

                        var rank_list =  data.countRankParameterInfoList;
                        for(var i=0;i<rank_list.length;i++){
                            rank_list[i].class_name=rank_list[i].c_classname;
                        }
                        var class_count  = rank_list.length / level_count;
                        var levels = [];
                        var classes = [];
                        for( var i = 0; i < levels; i++ ){
                            levels.push(rank_list[i].c_rank)//[A,B,C,D,E]
                        }
                        for( var i = 0; i < class_count ; i++ ){
                            var dic = rank_list[i*level_count];
                            if(this.add_data.c_rankway==1){
                                for( var x = 0; x < level_count; x++ ){
                                    dic[String.fromCharCode(start_code+x)] = {
                                        startscore:rank_list[i*level_count+x].startscore,
                                        endscore:rank_list[i*level_count+x].endscore
                                    }

                                }
                            }else{
                                for( var x = 0; x < level_count; x++ ){
                                    dic[String.fromCharCode(start_code+x)] = {
                                        startscore:rank_list[i*level_count+x].c_number,
                                        endscore:''
                                    }

                                }
                            }

                            classes.push(dic);
                        }
                        this.class_list=classes;
                    }
                },
                //保存
                complete_save:function (data) {
                    toastr.success("设置成功");
                    var grade_id=pmx.grade_id;
                    var grade_name=pmx.grade_name;
                    window.location = "#graduation_level_check?grade_id="+grade_id+"&grade_name="+grade_name;
                },
                //修改
                complete_update:function (data) {
                    toastr.success("修改成功");
                    var grade_id=this.grade_id;
                    var grade_name=this.add_data.c_grade;
                    window.location = "#graduation_level_check?grade_id="+grade_id+"&grade_name="+grade_name;
                    // window.location = "#graduation_level_check";
                },
                //取消
                cancel_btn:function () {
                    var grade_id=this.grade_id;
                    var grade_name=this.add_data.c_grade;
                    window.location = "#graduation_level_check?grade_id="+grade_id+"&grade_name="+grade_name;
                    // window.location = "#graduation_level_check";

                },
                get_id:function () {
                    var grade_id=pmx.grade_id.toString();
                    var grade_name=pmx.grade_name;
                    this.grade_id=grade_id;
                    this.grade=grade_name+'|'+grade_id;
                    this.add_data.c_grade=grade_name;
                    this.add_data.c_gradeid=grade_id;
                    ajax_post(api_get_find_by_count_rank,{c_gradeid:grade_id},this);
                }
            });

            // 求平均宽
            vm.avg_width = (100 / (vm.level_count + 1)).toFixed(2);
            vm.$watch('level_count', function (a, b) {
                var col_bak = vm.level_list.$model;
                var mod = a - b;
                vm.level_count = a;
                vm.avg_width = (100 / (a + 1)).toFixed(2);
                if (mod > 0) {
                    // 补足
                    var start_code = vm.char_start.charCodeAt();
                    var ori_len = vm.level_list.length;
                    for (var i = 1; i <= mod; ++i) {
                        var char = String.fromCharCode(start_code + i + ori_len - 1);
                        col_bak.push(char)
                    }
                }
                else if (mod < 0) {
                    // 清除多余项
                    col_bak.splice(vm.level_list.length - Math.abs(mod), Math.abs(mod));
                }
                if( vm.strand == 1)
                    vm.refresh_class_exam_item(undefined, col_bak);
                else
                    vm.refresh_class_exam_item(vm.grade_id, col_bak);
                vm.level_list = col_bak;
            });
            vm.$watch('onReady', function() {
                this.cb();
                // this.get_id();
            });
            vm.$watch('strand', function(a,b){
                if( a == 1)
                    vm.refresh_class_exam_item(undefined, this.level_list);
                else
                    vm.refresh_class_exam_item(vm.grade_id, this.level_list )
            });


            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });