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
$msgnr = optional_param('msgnr', 0, PARAM_INT);
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
echo "<script language=javascript type=text/javascript src=https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js></script>";
echo "<script language=javascript type=text/javascript src=jquery-dateformat.js></script>";
echo '<script language="javascript" type="text/javascript" src="jdenticon-2.2.0.js"></script>';

echo '<script language="javascript" type="text/javascript" src="d3.v3.min.js"></script>';
echo '<script language="javascript" type="text/javascript" src="treelist.js"></script>';
echo '<script language="javascript" type="text/javascript" src="tree1.js"></script>';
echo '<script language="javascript" type="text/javascript" src="helper.js"></script>';
echo "<link href=css/all.css rel=stylesheet>";

$PAGE->requires->js_init_call('showtree',array('course'=>$cm->id, 'msgnr'=>$msgnr));
//$myarray = array('apple', 'orange', 'pear');
echo $OUTPUT->header();

echo' 
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <form class="form-inline float-sm-right" action="" method="post">
        	<button class="btn btn-default" type="button" id="createbutton" onclick="javascript: createButton();">Neues Thema</button>
                <input type="text" class="form-control" placeholder="Search">
                <button class="btn btn-outline-success" type="submit">Search</button>
            </form>
        </div>
    </div>
</div>
<div class="container-fluid pll ">
     <div class="pll">
	 <div class="col-12 pll" >
		<div class="pll col-xl-6 col-sm-12" id="tree" style="overflow-y:scroll; height:500px; margin-bottom:30px" >
			<div class=loading><i class="fas fa-cog fa-spin fa-5x"></i>loading
			</div>
                </div>
		<div class="col-xl-6 col-sm-12 row-no-padding" id="treeinfo" style="padding-right:0px; height:500px">
		</div>
	</div>
    </div>
</div>




';
//<div class='btn-toolbar mb-3' role='toolbar' aria-label='Controlbar for Plugins'>";
//echo "<div class='btn-group' role='group' aria-label='First Group'>";


//echo "<div id=contenttree><div id=tree1 class='col-6'></div><div id=treeinfo></div></div>";
echo $OUTPUT->footer();

