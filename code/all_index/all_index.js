/**
 * Created by Administrator on 2018/5/24.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            // =========================================指标查看、设置=================================
            //行政指标查看
            '/admin_index_see':'index_see/admin_index_see/admin_index_see.js',
            //特色指标查看(有操作功能)
            '/feature_index_see':'index_see/feature_index_see/feature_index_see.js',
            //特色指标查看(只查看)
            '/feature_te_see':'index_see/feature_te_see/feature_te_see.js',
            //指标设置
            "/index_set":"index_set/index_set.js",
            //共享指标查看
            '/share_index_see':'share_index_see/share_index_see.js',
            //新增评价维度
            '/add_first_index':'add_first_index/add_first_index.js',
            //指标审核
            "/index_audit":"index_audit/index_audit.js",
            //指标详情查看
            "/index_details":"index_details/index_details.js",
            //=========================================指标新增=================================
            //新增评价要素
            '/a_a_element':'index_add/a_a_element/a_a_element.js',
            //新增关键表现
            '/a-k-perform':'index_add/a-k-perform/a-k-perform.js',
            // 用于测试
            "/test_hello":"test/test.js",
            //公共审核管控-编辑
            "/public_edit":"public_management_control/public_edit/public_edit.js",
            //评价方案细则(教师查看)
            "/evaluation_scheme":"evaluation_scheme/evaluation_scheme.js",
            //==============================审核共享======================
            //一级指标审核
            "/first_idx_examine":"first_idx_examine/first_idx_examine.js",
            //二级指标审核
            "/sec_idx_examine":"sec_idx_examine/sec_idx_examine.js",
            //三级指标审核
            "/third_idx_examine":"third_idx_examine/third_idx_examine.js",
            //=========================采纳审核================================

            //共享指标采纳审核(一级)
            "/share_adopt_first_examine":"share_adopt_first_examine/share_adopt_first_examine.js",
            //共享指标采纳审核(二级)
            "/share_adopt_second_examine":"share_adopt_second_examine/share_adopt_second_examine.js",
            //共享指标采纳审核(三级)
            "/share_adopt_third_examine":"share_adopt_third_examine/share_adopt_third_examine.js",
            //共享指标采纳列表(查看通过与未通过情况)
            "/adoption_list":"adoption_list/adoption_list.js",
            //===================================日常评价方案设置===============================
            // 类型设置
            "/real_a_type_set_scheme":"real_a_type_set_scheme/real_a_type_set_scheme.js",
            //上传数量设置
            "/real_a_upload_num_set_scheme":"real_a_upload_num_set_scheme/real_a_upload_num_set_scheme.js",
            // 积分规则设置
            "/achieve_maintenance_scheme":"achieve_maintenance_scheme/achieve_maintenance_scheme.js",
            //个性特长
            "/special_personality_scheme":"special_personality_scheme/special_personality_scheme.js",
            //===================================学期评价方案设置===============================
            //学期评价方案设置
            "/item_programme_management_scheme":"item_programme_management_scheme/item_programme_management_scheme.js",
            //学期评价方案设置(市、区县)--评价指标管理-评价方案-学期评价方案设置
            "/city_district_t_e_s_s":"city_district_t_e_s_s/city_district_t_e_s_s.js",
            //学期评价方案设置(学校)--评价指标管理-评价方案-学期评价方案设置
            "/school_t_e_s_s":"school_t_e_s_s/school_t_e_s_s.js",
        };

        function init(main) {
            x.on_by_config(on_by_config, main,"all_index");
        }
        return {
            init: init
        }
    });