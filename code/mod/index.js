/**
 * 指标相关接口
 * Created by melody 2018/5/29 1332.
 */
// 获取指标列表
Task.index_list = make_interface("Indexmaintain/indexmaintain_findIndexmaintainBean", {"cache#index_workid":"user.user.fk_school_id"},  false );
// 获取特色指标列表
Task.get_feature_index_list = make_interface("Indexmaintain/indexmaintain_findIndexmaintainBean", {"__sync__":true,"cache#index_workid":"user.user.fk_school_id"}, false );
// 新增评价维度/评价要素（一级指标/二级指标）
Task.add_first_or_second_index = make_interface("Indexmaintain/indexmaintain_addIndexmaintain", {"__sync__":false}, false );
// 新增三级指标（关键表现）
Task.add_three_index = make_interface("Indexmaintain/indexmaintain_addIndexVaule", {"__sync__":false}, false );
// 查询共享指标
Task.index_list_gx = make_interface("Indexmaintain/indexmaintain_findshareindex",{"__sync__":true}, false );
// 采纳共享指标
Task.cn_gx_index = make_interface("Indexmaintain/indexmaintain_addadoptindexmaintain",{"__sync__":false}, false );
// 点赞共享指标
Task.dz_gx_index = make_interface("Indexmaintain/indexmaintain_checkshareindex",{"__sync__":false}, false );
//删除行政指标
Task.del_first_index = make_interface("Indexmaintain/indexmaintain_deleteIndex",{"__sync__":false}, false );
//修改指标启停用
Task.update_index_use = make_interface("Indexmaintain/indexmaintain_updateIndexState",{"__sync__":false}, false);
//指标共享
Task.share_index_ts= make_interface("Indexmaintain/indexmaintain_addshareindex",{"__sync__":false}, false);
cloud.share_index_ts = make_api("share_index_ts");
cloud.upd_idnex_use = make_api("update_index_use");
cloud.del_first_index = make_api("del_first_index");
// 查询三级特色
Task.ts_index_three = make_interface("Indexmaintain/indexmaintain_findIndexmaintainBean",{"cache#index_workid":"user.user.fk_school_id"}, false );
cloud.ts_index_three = make_api("ts_index_three.list");
// 查询学生是否存在评价档案
/**
 * fk_nj_id	年级id	string
fk_xq_id	学期id	string
guid	学生guid	number
status	数据状态	number	1未发布2已发布（1级公示中）3异议待审核4二次公示中5数据归档

 * @type {{url: *, params: *, cache: *, after: *}}
 */
Task.has_pjda = make_interface("Indexmaintain/get_p_id_by_condition", {__sync__:false}, false);
cloud.has_pjda = make_api("has_pjda");
// 获取一级行政指标
cloud.index_list_xz = make_api("index_list.list", {index_rank:1, index_type:1, index_name:"",rows:15,offset:0});
// 获取评价要素2级指标
cloud.ary_index_detail_xs_l2 = function(args)
{
    for(var x=  0; x < args.length; x++)
    {
        if(typeof(args[x] == "Number"))
            args[x] = ""+args[x];
    }
    var l2 = D("index_list.list", {index_rank:2, index_type:1, index_name:"", offset:0, rows:100});
    var ret = [];
    for(var i = 0; i < l2.length; i++ ) {
        if( args.indexOf(l2[i].index_parentid) >= 0 )
             ret.push(l2[i]);
    }
    return ret;
}
// 获取评价要素
cloud.ary_index_detail_xs_l3 = function(args)
{
    for(var x=  0; x < args.length; x++)
    {
        if(typeof(args[x] == "Number"))
            args[x] = ""+args[x];
    }
    var l2 = D("index_list.list", {index_rank:2, index_type:1, index_name:"", offset:0, rows:9999});
    var l3 = D("index_list.list", {index_rank:3, index_type:1, index_name:"",offset:0, rows:99999999});
    var ret = [];
    for(var i = 0; i < l2.length; i++ ) {
        if( args.indexOf(l2[i].index_parentid) < 0 )
            continue;
        for(var x = 0; x < l3.length; x++){
            if(l3[x].index_secondaryid == l2[i].id)
                ret.push(l3[x]);
        }
    }
    return ret;
}
// 获取关键表现（三级指标加上年级筛选）
cloud.ary_index_detail_xs_l3_gradeID = function(args,g_id)
{
    for(var x=  0; x < args.length; x++)
    {
        if(typeof(args[x] == "Number"))
            args[x] = ""+args[x];
    }
    var l2 = D("index_list.list", {index_rank:2, index_type:1, index_name:"", offset:0, rows:9999});
    var l3 = D("index_list.list", {index_rank:3, index_type:1, index_gradeid:g_id, index_name:"",offset:0, rows:99999999});
    var ret = [];
    for(var i = 0; i < l2.length; i++ ) {
        if( args.indexOf(l2[i].index_parentid) < 0 )
            continue;
        for(var x = 0; x < l3.length; x++){
            if(l3[x].index_secondaryid == l2[i].id)
                ret.push(l3[x]);
        }
    }
    return ret;
}
cloud.index_detail_xz = function (args) {
    for(var x=  0; x < args.length; x++)
    {
        if(typeof(args[x] == "Number"))
            args[x] = ""+args[x];
    }
    var l2 = D("index_list.list", {index_rank:2, index_type:1,index_state:2, index_name:"",index_use_state:1,offset:0, rows:9999});
    var l3 = D("index_list.list", {index_rank:3, index_type:1,index_state:2, index_name:"",index_use_state:1,offset:0, rows:9999});
    var ret = [];
    for(var i = 0; i < l2.length; i++ ) {

        if( args.indexOf(l2[i].index_parentid) < 0 )
            continue;
        l2[i].elements = [];
        for(var x = 0; x < l3.length; x++){
            if(l3[x].index_secondaryid == l2[i].id){
                l2[i].elements.push(l3[x]);
            }
        }
        ret.push(l2[i]);
    }
    return ret;
};
/**
 * 行政指标-指标设置
 * 根据cloud.index_detail_xz改编，加上年级
 * args:选中一级指标id数组
 * g_id:年级id
 * */
cloud.index__xz_sz_gradeID = function (args,g_id) {
    if(g_id == '' || g_id == null){
        var l2 = D("index_list.list", {index_rank:2, index_type:1,index_state:null, index_name:"",index_use_state:null,offset:0, rows:9999});
    }
    var l3 = D("index_list.list", {index_rank:3, index_type:1,index_gradeid:g_id,index_state:null, index_name:"",index_use_state:null,offset:0, rows:9999});

    //判断是否查询二级指标
    if(l2){
        return {second_ary:l2,third_ary:l3};
    }else{
        return {third_ary:l3};
    }
};
/**
 * 根据cloud.index_detail_xz改编，加上年级
 * args:选中一级指标id数组
 * g_id:年级id
 * */
cloud.index_detail_xz_gradeID = function (args,g_id) {
    //这一部分逻辑在页面里面计算
    // for(var x=  0; x < args.length; x++)
    // {
    //     if(typeof(args[x] == "Number"))
    //         args[x] = ""+args[x];
    // }
    if(g_id == '' || g_id == null){
        var l2 = D("index_list.list", {index_rank:2, index_type:1,index_state:2, index_name:"",index_use_state:1,offset:0, rows:9999});
    }
    var l3 = D("index_list.list", {index_rank:3, index_type:1,index_gradeid:g_id,index_state:2, index_name:"",index_use_state:1,offset:0, rows:9999});
    //这一部分逻辑在页面里面计算
    // var ret = [];
    // for(var i = 0; i < l2.length; i++ ) {
    //
    //     if( args.indexOf(l2[i].index_parentid) < 0 )
    //         continue;
    //     l2[i].elements = [];
    //     for(var x = 0; x < l3.length; x++){
    //         if(l3[x].index_secondaryid == l2[i].id){
    //             l2[i].elements.push(l3[x]);
    //         }
    //     }
    //     ret.push(l2[i]);
    // }
    // return ret;

    //判断是否查询二级指标
    if(l2){
        return {second_ary:l2,third_ary:l3};
    }else{
        return {third_ary:l3};
    }
};

/**
 *  查看特色指标
 *  @author melody
 *  @param args
 *   index_parent 一级指标	string
 *   index_secondary 二级指标	string
 *   index_rank 指标等级(必传，1:一级指标 2:二级指标 3:三级指标) number
 *   offset 查询偏移量(必传) number
 *   rows  查询数量(必传) number
 */

// index_use_state 使用状态(1:启用 2:停用)
// index_type 指标类型(1:行政指标 2:特色指标 3:共享指标)
// index_state 审核状态(1:待审核 2:审核通过 3:审核未通过)

// 获取一级特色指标
cloud.index_list_ts = make_api("get_feature_index_list.list", {index_rank: 1});

// 获取评价要素 二级指标
cloud.index_detail_ts = function (args) {
    for(var x=  0; x < args.length; x++)
    {
        if(typeof(args[x] == "Number"))
            args[x] = ""+args[x];
    }
    var l2 = D("get_feature_index_list.list", {index_rank:2,index_type: 2,index_parent:args[0]});
    var l3 = D("get_feature_index_list.list", {index_rank:3,index_type: 2,index_parent:args[0]});

    var se = [];
    var thr = [];
    //特色指标的二级与三级之间没关联，所有特色指标都只关联到一级特色上
    var login_guid = cloud.user_guid();
    /*特色指标二级查看条件:本单位可查看本单位审核通过的,本单位待审核状态只能创建人查看*/
    if(l2.length > 0){
        for(var  i = 0; i < l2.length; i++){
            if((l2[i].index_founderid == login_guid && l2[i].index_state != 2) || (l2[i].index_state == 2)){
                se.push(l2[i]);
            }
        }
    }
    if(l3.length > 0){
        for(var  i = 0; i < l3.length; i++){
            if((l3[i].index_founderid == login_guid && l3[i].index_state != 2) ||
                (l3[i].index_state == 2) ||
                (l3[i].index_founderid != login_guid && l3[i].index_state == 2)

            ){
                thr.push(l3[i]);
            }
        }
    }
    return {sec_index:se,thr_index:thr};
};

// 获取特色指标的二级指标、三级指标（带年级id请求参数）
cloud.index_detail_ts_gardeId = function (args,g_id) {
    for(var x=  0; x < args.length; x++)
    {
        if(typeof(args[x] == "Number"))
            args[x] = ""+args[x];
    }
    var l2 = D("get_feature_index_list.list", {index_rank:2,index_type: 2,index_parent:args[0]},);
    var l3 = D("get_feature_index_list.list", {index_rank:3,index_gradeid:g_id,index_type: 2,index_parent:args[0]});

    var se = [];
    var thr = [];
    //特色指标的二级与三级之间没关联，所有特色指标都只关联到一级特色上
    var login_guid = cloud.user_guid();
    /*特色指标二级查看条件:本单位可查看本单位审核通过的,本单位待审核状态只能创建人查看*/
    if(l2.length > 0){
        for(var  i = 0; i < l2.length; i++){
            if((l2[i].index_founderid == login_guid && l2[i].index_state != 2) || (l2[i].index_state == 2)){
                se.push(l2[i]);
            }
        }
    }
    if(l3.length > 0){
        for(var  i = 0; i < l3.length; i++){
            if((l3[i].index_founderid == login_guid && l3[i].index_state != 2) ||
                (l3[i].index_state == 2) ||
                (l3[i].index_founderid != login_guid && l3[i].index_state == 2)

            ){
                thr.push(l3[i]);
            }
        }
    }
    return {sec_index:se,thr_index:thr};
};
/**
 *  新增评价维度/评价要素（一级指标/二级指标）
 *  @author melody
 *  @param args
     index_author 作者 string
     index_authorid 作者id number
     index_end_interval 分值结束区间 number
     index_name	指标名称	string
     index_parent 一级指标 string
     index_parentid	一级指标id number
     index_rank	指标等级(1:一级指标 2:二级指标 3:三级指标) number
     index_review 考察要点 string
     index_secondary 二级指标 string
     index_secondaryid 二级指标id number
     index_start_interval 分值起始区间	number
     index_type	指标类型(1:行政指标 2:特色指标 3:共享指标4:共享采纳) number
     index_value 最高分值 string
     index_work	创建单位	string
 */
cloud.add_first_or_second_index = make_api("add_first_or_second_index");


/**
 *  新增关键表现（三级指标）
 *  @author melody
 *  @param args
     index_applys 适用类型(评价主体)	array<string>
     index_author 作者 string
     index_authorid	作者id number
     index_end_interval	分值结束区间	number
     index_grade 适用年级 string
     index_gradeid 年级id string
     index_isoption	是否带选项(1:带 2:不带) number
     index_name	考察项名称 string
     index_option_content 答案内容 array<object>
     index_parent 一级指标名称 string
     index_parentid	一级指标id number
     index_review 考察要点 string
     index_secondary 二级指标名称 string
     index_secondaryid	二级指标id number
     index_start_interval 分值起始区间 number
     index_type	指标类型(1:行政指标 2:特色指标 3:共享指标) number
     index_value 最高分值 number
     index_values 答案分值 array<object>
 */
cloud.add_three_index = make_api("add_three_index");


// 获取共享指标
cloud.index_list_gx = make_api("index_list_gx.list");

/**
 * 点赞共享指标
 * 
 */
cloud.cn_gx_index = make_api("cn_gx_index");
/**
 * 采纳共享指标
 * 
 */
cloud.dz_gx_index = make_api("dz_gx_index");




