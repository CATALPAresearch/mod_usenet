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
 * Prints an instance of mod_usenet.
 *
 * @package     mod_usenet
 * @copyright   Konstantin Friedrich 
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__.'/../../config.php');
require_once(__DIR__.'/lib.php');

// Course_module ID, or
$id = optional_param('id', 0, PARAM_INT);
$msgnr = optional_param('msgnr', 0, PARAM_INT); // TODO: This number does not exist
// ... module instance id.
$n  = optional_param('n', 0, PARAM_INT);
//
$usenet = $PAGE->activityrecord;


if ($id) {
    $cm             = get_coursemodule_from_id('usenet', $id, 0, false, MUST_EXIST);
    $course         = $DB->get_record('course', array('id' => $cm->course), '*', MUST_EXIST);
    $moduleinstance = $DB->get_record('usenet', array('id' => $cm->instance), '*', MUST_EXIST);
} elseif ($n) {
    $moduleinstance = $DB->get_record('usenet', array('id' => $n), '*', MUST_EXIST);
    $course         = $DB->get_record('course', array('id' => $moduleinstance->course), '*', MUST_EXIST);
    $cm             = get_coursemodule_from_instance('usenet', $moduleinstance->id, $course->id, false, MUST_EXIST);
} else {
    print_error(get_string('missingidandcmid', mod_usenet));
}

require_login($course, true, $cm);

$modulecontext = context_module::instance($cm->id);
$course = $DB->get_record('course', array('id'=>$cm->course), '*', MUST_EXIST);


$PAGE->set_url('/mod/usenet/view.php', array('id' => $cm->id));
$PAGE->set_title(format_string($moduleinstance->name));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($modulecontext);
$PAGE->requires->css( '/mod/usenet/styles.css', true );

echo $OUTPUT->header();


echo get_intro($cm->course);

if(access_control()){
    echo '<usenet-container></usenet-container>';
    $PAGE->requires->js_call_amd('mod_usenet/usenet', 'init', array('course'=>$cm->course, 'msgnr'=>$msgnr, 'instanceName'=>$moduleinstance->name, 'instance_id'=>$cm->id));
}else{
    //echo format_module_intro('usenet', $usenet, $cm->id);
    echo '<div class="alert alert-danger w-75" role="alert">';
    echo '<h4>Kein Zugang</h4><br/>Wir können Ihnen zu dieser Ressource leider keinen Zugang gewähren, da Sie den Untersuchungen im Rahmen des Forschungsprojekt APLE nicht zugestimmt haben.';
    $limit = new DateTime("2020-10-31 23:59:59");
    $now = new DateTime();
    if($now < $limit){
        echo '<br/><br/><a href="/course/format/ladtopics/policy.php" target="new" class="btn btn-primary">Nachträglich der Teilnahme am Forschungsprojekt zustimmen</a><a href="/course/view.php?id='.$course->id.'" class="btn btn-link" style="float:right;">Zurück zum Kurs</a>';
    }
    echo '</div>';
}


echo $OUTPUT->footer();


function access_control(){
    global $DB, $USER;
    $version = 3;// local_niels: 11  aple: 3
    $transaction = $DB->start_delegated_transaction();
    $res = $DB->get_record("tool_policy_acceptances", array("policyversionid" => $version, "userid" => (int)$USER->id ), "status");
    $transaction->allow_commit();
    if(isset($res->status) && (int)$res->status == 1){
        return true;
    }
    return false;
}


function get_intro($courseid){
    global $DB, $USER;
   $query = '
        SELECT m.id AS module_id, mm.id AS instance_id, u.intro AS intro 
        FROM {'.$CFG->prefix.'course_modules} AS mm 
        JOIN {'.$CFG->prefix.'modules} AS m 
        ON
        m.name=\'usenet\' AND
        m.id = mm.module AND
        mm.course = '.$courseid.'
        JOIN {'.$CFG->prefix.'usenet} AS u
        ON u.id = mm.instance
        ;
        ';

    $transaction = $DB->start_delegated_transaction();
    $res = $DB->get_record_sql($query);
    $transaction->allow_commit();
    if(isset($res->intro) && $res->intro){
        return $res->intro;
    }
    return '';
    
}

