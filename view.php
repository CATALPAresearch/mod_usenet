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
 * Prints an instance of mod_newsmod.
 *
 * @package     mod_newsmod
 * @copyright   Rudolf Patzer <rpatzer@gmx.de>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__.'/../../config.php');
require_once(__DIR__.'/lib.php');

// Course_module ID, or
$id = optional_param('id', 0, PARAM_INT);

// ... module instance id.
$n  = optional_param('n', 0, PARAM_INT);

if ($id) {
    $cm             = get_coursemodule_from_id('newsmod', $id, 0, false, MUST_EXIST);
    $course         = $DB->get_record('course', array('id' => $cm->course), '*', MUST_EXIST);
    $moduleinstance = $DB->get_record('newsmod', array('id' => $cm->instance), '*', MUST_EXIST);
} else if ($n) {
    $moduleinstance = $DB->get_record('newsmod', array('id' => $n), '*', MUST_EXIST);
    $course         = $DB->get_record('course', array('id' => $moduleinstance->course), '*', MUST_EXIST);
    $cm             = get_coursemodule_from_instance('newsmod', $moduleinstance->id, $course->id, false, MUST_EXIST);
} else {
    print_error(get_string('missingidandcmid', mod_newsmod));
}

require_login($course, true, $cm);

$modulecontext = context_module::instance($cm->id);
//print_r($modulecontext);
//$event = \mod_newsmod\event\course_module_viewed::create(array(
//    'objectid' => $moduleinstance->id,
//    'context' => $modulecontext
//));
//$event->add_record_snapshot('course', $course);
//$event->add_record_snapshot('newsmod', $moduleinstance);
//$event->trigger();

$PAGE->set_url('/mod/newsmod/view.php', array('id' => $cm->id));
$PAGE->set_title(format_string($moduleinstance->name));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($modulecontext);
//$PAGE->requires->js('/mod/newsmod/jquery-1.10.2.js');


//$PAGE->requires->js('/mod/newsmod/d3.v3.min.js','/mod/newsmod/treelist.js');
//$PAGE->requires->js('/mod/newsmod/treelist.js');
//$PAGE->requires->js('/mod/newsmod/tree.js');
//$PAGE->requires->js('/mod/newsmod/helper.js');
echo "<script language=javascript type=text/javascript src=d3.v3.min.js></script>";
echo "<script language=javascript type=text/javascript src=treelist.js></script>";
echo "<script language=javascript type=text/javascript src=tree.js></script>";
echo "<script language=javascript type=text/javascript src=helper.js></script>";
//$myarray = array('apple', 'orange', 'pear');
$PAGE->requires->js_init_call('showtree',array('course'=>$cm->id));
echo $OUTPUT->header();

echo "<a class='btn btn-primary' id=createbutton onclick='javascript: createButton();'>Neues Thema</a>";
echo "<div id=contenttree><div id=tree></div><div id=treeinfo></div></div>";
echo $OUTPUT->footer();
