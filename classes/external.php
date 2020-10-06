<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**


defined('MOODLE_INTERNAL') || die;

require_once("$CFG->libdir/externallib.php");

/**
 * usenet external functions
 *
 * @package    mod_usenet
 * @category   external
 * @copyright  2020 Niels Seidel <niels.seidel@fernuni-hagen.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      Moodle 3.5
 */
class mod_usenet_external extends external_api {

    
    /**
     * Takes video player log data form the client
     */
    public static function log_parameters() {
        return new external_function_parameters(
            array(
                'data' => 
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                            'utc' => new external_value(PARAM_INT, '...utc time', VALUE_OPTIONAL),
                            'action' => new external_value(PARAM_TEXT, '..action', VALUE_OPTIONAL),
                            'entry' => new external_value(PARAM_RAW, 'log data', VALUE_OPTIONAL)
                        )
                )
            )
        );
    }
    public static function log_returns() {
        return new external_single_structure(
                array( 'response' => new external_value(PARAM_RAW, 'Server respons to the incomming log') )
        );
    }
    public static function log($data) {
        global $CFG, $DB, $USER;
        
        $r = new stdClass();
        $r->name='mod_usenet';
        $r->component='mod_usenet';
        $r->eventname='\mod_usenet\event\course_module_' . $data['action'];
        $r->action=$data['action'];
        $r->target='course_module';
        $r->objecttable='usenet';
        $r->objectid=0;
        $r->crud='r';
        $r->edulevel=2;
        $r->contextid=120;
        $r->contextlevel=70;
        $r->contextinstanceid=86;
        $r->userid=$USER->id; 
        $r->courseid=(int)$data['courseid'];
        //$r->relateduserid=NULL;
        $r->anonymous=0;
        $r->other=$data[entry];	 
        $r->timecreated=$data['utc'];
        $r->origin='web';	 
        $r->ip=$_SERVER['REMOTE_ADDR'];
        //$r->realuserid=NULL;
        
        $transaction = $DB->start_delegated_transaction();
        $res = $DB->insert_records("logstore_standard_log", array($r)); // $CFG->prefix .
        $transaction->allow_commit();
        
        return array('response'=> json_encode($r));
    } 
    public static function log_is_allowed_from_ajax() { return true; }
    
}
