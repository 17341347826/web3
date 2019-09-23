/**
 * Created by ma weifeng on 2017.07.18.
 */
define([], function () {
    var menus = JSON.parse(sessionStorage.getItem("menu"));

    function url_for(img) {
        return "http://pj.xtyun.net/common/images/" + img;
    }

    function menu_make(ret) {
        for (var i = 0; i < menus.length; i++) {
            var menu = menus[i];
            var first_powser_index = menu.power_code.substr(4, 2) - 1
            var second_powser_index = menu.power_code.substr(6, 2) - 1
            var third_power_index = menu.power_code.substr(8, 2) - 1

        }
    }

    function first_index(func_code) {
        return func_code.substr(4, 2);
    }
    function second_index(func_code) {
        return func_code.substr(6,2);
    }
    function third_index(func_code){
        return func_code.substr(8,2);
    }

    function get_menus(user_type) {
        // menus = [{"id":7441,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价指标管理","second_power":"","power_code":"0201010000","url":"#","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"expand\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7447,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价指标管理","second_power":"性质指标","power_code":"0201010100","url":"#admin_index_see","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7448,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价指标管理","second_power":"特色指标","power_code":"0201010200","url":"#feature_index_see","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7442,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价状况监管","second_power":"","power_code":"0201020000","url":"#","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"expand\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7446,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价状况监管","second_power":"录入进度","power_code":"0201020100","url":"#","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"expand\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7449,"product_code":"xspj","product_name":"学生评价","power_name":"活动上传","first_power":"评价状况监管","second_power":"录入进度","power_code":"0201020101","url":"#","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7450,"product_code":"xspj","product_name":"学生评价","power_name":" 日常表现","first_power":"评价状况监管","second_power":"录入进度","power_code":"0201020102","url":"#","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7451,"product_code":"xspj","product_name":"学生评价","power_name":"成就导入","first_power":"评价状况监管","second_power":"录入进度","power_code":"0201020103","url":"#","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7443,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价结果管理","second_power":"","power_code":"0201030000","url":"#","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"expand\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7444,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价数据分析","second_power":"","power_code":"0201040000","url":"#","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"expand\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7445,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"学生档案管理","second_power":"","power_code":"0201050000","url":"#","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"expand\\\"], \\\"icon\\\": \\\"\\\"}\""}];
        // menus = [{"id":7111,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价指标管理","second_power":"","power_code":"0201010000","url":"#","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"expand\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7117,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价指标管理","second_power":"行政指标","power_code":"0201010100","url":"#","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"expand\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7129,"product_code":"xspj","product_name":"学生评价","power_name":"指标查看","first_power":"评价指标管理","second_power":"行政指标","power_code":"0201010101","url":"#admin_index_see","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7130,"product_code":"xspj","product_name":"学生评价","power_name":"指标设置","first_power":"评价指标管理","second_power":"行政指标","power_code":"0201010102","url":"#index_set","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7131,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价指标管理","second_power":"特色指标","power_code":"0201010200","url":"#feature_index_see","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7132,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价指标管理","second_power":"共享指标","power_code":"0201010300","url":"#share_index_see","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7142,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价指标管理","second_power":"公示审核管控","power_code":"0201010400","url":"#public_edit","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7112,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价状况监管","second_power":"","power_code":"0201020000","url":"#","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"expand\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7116,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价状况监管","second_power":"录入进度","power_code":"0201020100","url":"#","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"expand\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7118,"product_code":"xspj","product_name":"学生评价","power_name":"活动上传","first_power":"评价状况监管","second_power":"录入进度","power_code":"0201020101","url":"#act_upload_progress","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7119,"product_code":"xspj","product_name":"学生评价","power_name":"日常表现","first_power":"评价状况监管","second_power":"录入进度","power_code":"0201020102","url":"#daily_perform_progress","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7120,"product_code":"xspj","product_name":"学生评价","power_name":"成绩导入","first_power":"评价状况监管","second_power":"录入进度","power_code":"0201020103","url":"#achieve_introduct_progress","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7121,"product_code":"xspj","product_name":"学生评价","power_name":"民主评价","first_power":"评价状况监管","second_power":"录入进度","power_code":"0201020104","url":"#d_e_progress","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7122,"product_code":"xspj","product_name":"学生评价","power_name":"计划与实现","first_power":"评价状况监管","second_power":"录入进度","power_code":"0201020105","url":"#plan_realization_progress","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7123,"product_code":"xspj","product_name":"学生评价","power_name":"描述性评价","first_power":"评价状况监管","second_power":"录入进度","power_code":"0201020106","url":"#description_e_progress","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7124,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价状况监管","second_power":"审核进度","power_code":"0201020200","url":"#review_progress","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7125,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价状况监管","second_power":"用户活跃度","power_code":"0201020300","url":"#user_activity","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7126,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价状况监管","second_power":"申诉复议","power_code":"0201020400","url":"#reconsideration_appeals","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7127,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价状况监管","second_power":"结果生成进度","power_code":"0201020500","url":"#result_gen_progress","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7113,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价结果管理","second_power":"","power_code":"0201030000","url":"#","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"expand\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7128,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价结果管理","second_power":"日常评价记录","power_code":"0201030100","url":"#daily_performance_evaluation","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7140,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价结果管理","second_power":"学期评价结果","power_code":"0201030200","url":"#term_evaluation_results","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7141,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价结果管理","second_power":"毕业评价结果","power_code":"0201030300","url":"#graduation_results","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7114,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价统计分析","second_power":"","power_code":"0201040000","url":"#","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"expand\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7139,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价统计分析","second_power":"横向分析","power_code":"0201040100","url":"#comparative_analysis","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7136,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价统计分析","second_power":"纵向分析","power_code":"0201040200","url":"#evaluation_scale","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7137,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价统计分析","second_power":"群体性分析","power_code":"0201040300","url":"#co_analysis","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7138,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"评价统计分析","second_power":"区域性分析","power_code":"0201040400","url":"#region_analysis","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7115,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"学生档案管理","second_power":"","power_code":"0201050000","url":"#","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"expand\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7133,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"学生档案管理","second_power":"学生成长档案","power_code":"0201050100","url":"#p_a_list","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7135,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"学生档案管理","second_power":"学期评价档案","power_code":"0201050200","url":"#e_list","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""},{"id":7134,"product_code":"xspj","product_name":"学生评价","power_name":"","first_power":"学生档案管理","second_power":"毕业评价档案","power_code":"0201050300","url":"#g_list","role_type":"1","role_level":"2","apis":"null","content":"\"{\\\"type\\\": [\\\"skip\\\"], \\\"icon\\\": \\\"\\\"}\""}]
        // 对菜单进行分治
        // 防止重复菜单
        var menu_already = [];

        var menu_v1 = [], menu_v2 = [], menu_v3 = [];
        for (var i in menus) {
            var sub = menus[i];
            var jsc = JSON.parse(sub.content);
            if(typeof(jsc) == "string")
                jsc = JSON.parse(jsc);
            if(menu_already.indexOf(sub.id) >= 0)
                continue;
            menu_already.push(sub.id);
            sub.content = jsc;
            if (sub.power_name != "") {
                menu_v3.push(sub);
            } else if (sub.second_power == "") {
                menu_v1.push(sub);
            } else {
                menu_v2.push(sub);
            }
        }

        // 3级菜单找2级菜单
        for (var y = 0; y < menu_v2.length; y++) {
            menu_v2[y].elements = [];
            for (var x = 0; x < menu_v3.length; x++) {
                if (
                    first_index(menu_v3[x].power_code) == first_index(menu_v2[y].power_code) &&
                    second_index(menu_v3[x].power_code) == second_index(menu_v2[y].power_code) &&
                    menu_v3[x].second_power==menu_v2[y].second_power )  {
                    menu_v2[y].elements.push(menu_v3[x]);
                }
            }
        }
        // 二级菜单找一级菜单
        for (var y = 0; y < menu_v1.length; y++) {
            menu_v1[y].elements = [];
            for (var x = 0; x < menu_v2.length; x++) {
                if (first_index(menu_v1[y].power_code)== first_index(menu_v2[x].power_code) && menu_v1[y].first_power == menu_v2[x].first_power) {
                    menu_v1[y].elements.push(menu_v2[x]);
                }
            }
        }
        return menu_v1;
    }

    return {menu: get_menus}
})