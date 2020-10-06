/**
 *
 *
 * @module     mod_usenet
 * @class      Post Container
 * @copyright  Niels Seidel <niels.seidel@fernuni-hagen.de>
 * @license    GNU GPLv3
 */

define([
    M.cfg.wwwroot + '/mod/usenet/amd/src/Reader.js',
    M.cfg.wwwroot + '/mod/usenet/amd/src/Utils.js',
    M.cfg.wwwroot + '/mod/usenet/amd/src/Logging.js'
],
    function (Reader, Utils, Log) {

        require.config({
            enforceDefine: false,
            paths: {
                "pnglib": [M.cfg.wwwroot + "/mod/usenet/lib/build/pnglib"],
                "identicon": [M.cfg.wwwroot + "/mod/usenet/lib/build/identicon"],
                "helper": [M.cfg.wwwroot + "/mod/usenet/lib/build/helper"]
            },
            shim: {

            }
        });

        var start = function (course_id, message_id, instance_name, instance_id) {

            require([], function () {
                var utils = new Utils();
                var log = new Log(utils, course_id, {
                    context: 'mod_usenet',
                    outputType: 1 // set to 1 in order to store logs to the database
                });
                new Reader(log, course_id, message_id, instance_name, instance_id);
            });
        };

        return {
            init: function (course_id, message_id, instance_name, instance_id) {
                try {
                    start(course_id, message_id, instance_name, instance_id);
                } catch (e) {
                    console.error(e);
                }

            }
        };
    }); 