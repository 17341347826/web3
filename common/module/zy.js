

var covert_rule = [
    {"name":"单报民办志愿学校","value":1},
    {"name":"跨区县志愿学校","value":2},
    {"name":"艺体志愿学校","value":3},
    {"name":"切块志愿学校","value":4},
    {"name":"划线志愿学校","value":5},
    {"name":"兼报志愿学校","value":6},
    {"name":"第一志愿学校","value":7},
    {"name":"第二志愿学校","value":8},
    {"name":"第三志愿学校","value":9},
    {"name":"兼报民办志愿学校","value":10}
];


function zhi_yuan(src_ary) {
    var dataList = src_ary;
    var dataLength = src_ary.length;
    var arr = [];
    for(var i = 0; i < dataLength; i++) {
        var obj = {};
        var ret = base_filter(covert_rule, 'name', dataList[i].zypcmc);
        if (ret.length >= 0) {
            obj["value"] = ret[0].value;
            obj["name"] = ret[0].name;

        }
        arr.push(obj);
    }
    arr = [{name:"请选择志愿批次",value:""}].concat(arr);
    return arr;
}