define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //备份恢复
            "/backup_recovery":"backup_recovery/backup_recovery.js",
            //自动备份
            "/automatic_backup":"automatic_backup/automatic_backup.js",
            //手动备份
            "/manual_backup":"manual_backup/manual_backup.js"
        };

        function init(main) {
            x.on_by_config(on_by_config, main,"data_security");
        }
        return {
            init: init
        }
    });