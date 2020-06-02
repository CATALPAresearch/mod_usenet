/**
 * @module     mod/newsmod
 * @class      newsmod
 * @copyright  2020 Niels Seidel <niels.seidel@fernuni-hagen.de>
 * @license    MIT
 * @since      3.1
 */
define([
    M.cfg.wwwroot + '/mod/newsmod/amd/src/Reader.js',
    M.cfg.wwwroot + '/mod/newsmod/amd/src/Utils.js',
    M.cfg.wwwroot + '/mod/newsmod/amd/src/Logging.js'
],
    function (Reader, Utils, Log) {

        require.config({
            enforceDefine: false,
            baseUrl: M.cfg.wwwroot + "/mod/newsmod/lib/build",
            paths: {
                "d3": ["d3.v5.min"],
                "pnglib": ["pnglib"],
                "identicon": ["identicon"],
                "helper": ["helper"]
            },
            shim: {
                'vue259': {
                    exports: 'Vue'
                },
                'axios': {
                    exports: 'axios'
                }
            }
        });

        var start = function (courseid, messageid) {

            require([
                'd3'
            ], function (d3) {
                var utils = new Utils(d3);
                var log = new Log(utils, courseid, {
                    context: 'mod_newsmod',
                    outputType: 0 // set to 1 in order to store logs to the database
                });
                new Reader(log, courseid, messageid);
            });
        };

        return {
            init: function (courseid, messageid) {
                try {
                    start(courseid, messageid);
                } catch (e) {
                    console.error(e);
                }

            }
        };
    }); 