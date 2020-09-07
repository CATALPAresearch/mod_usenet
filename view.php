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
$msgnr = optional_param('msgnr', 0, PARAM_INT);
// ... module instance id.
$n  = optional_param('n', 0, PARAM_INT);

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


$PAGE->set_url('/mod/usenet/view.php', array('id' => $cm->id));
$PAGE->set_title(format_string($moduleinstance->name));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($modulecontext);
$PAGE->requires->css( '/mod/usenet/styles.css', true );

echo $OUTPUT->header();
echo '<usenet-container></usenet-container>';

$PAGE->requires->js_call_amd('mod_usenet/usenet', 'init', array('course'=>$cm->id, 'msgnr'=>$msgnr, 'instanceName'=>$moduleinstance->name));

echo $OUTPUT->footer();
