define(["lodash",
    C.CMF("request.js"),
    C.CMF("data_center.js")
], function(_, request,x) {

    data_center.uin(function(data) {
        var tUserData = JSON.parse(data.data["user"]);
        console.log(tUserData);
    });
});