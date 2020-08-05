<?php
   
require_once("../../../config.php");

$id = required_param('id', PARAM_INT);
$start = required_param('start', PARAM_INT);
$end = required_param('end', PARAM_INT); 

$a = "aaa";

if (!$cm = get_coursemodule_from_id('newsmod', $id)) {
    print_error("Course Module ID was incorrect");
}
if (!$course = $DB->get_record("course", array("id" => $cm->course))) {
    print_error("Course is misconfigured");
}
$journal = $DB->get_record("newsmod", array("id" => $cm->instance));

if (! $journal = $DB->get_record("newsmod", array("id" => $cm->instance))) {
    print_error("Course module is incorrect");
}

require_once($CFG->dirroot . '/mod/newsmod/php/nntp/socketcon.php');

$jsontree = gettree($journal, $start, $end);

echo json_encode($jsontree);
/* 
if (!$cm = get_coursemodule_from_id('newsmod', $id)) {
    print_error("Course Module ID was incorrect");
}
if (!$course = $DB->get_record("course", array("id" => $cm->course))) {
    print_error("Course is misconfigured");
}
$journal = $DB->get_record("newsmod", array("id" => $cm->instance));



if (! $journal = $DB->get_record("newsmod", array("id" => $cm->instance))) {
    print_error("Course module is incorrect");
}

//Header
$PAGE->set_url('/mod/newsmod/edit.php', array('id' => $id));
$PAGE->navbar->add(get_string('edit'));
$PAGE->set_title(format_string($journal->name));
$PAGE->set_heading($course->fullname);

$localconfig = get_config('newsmod');

require_once($CFG->dirroot . '/mod/newsmod/php/nntp/libconn.php');
$jsontree = generateJsonFromNews($journal);


require_once($CFG->dirroot . '/mod/newsmod/php/nntp/socketcon.php');
$jsontree = gettree($journal, $start, $end);
//header('Content-Type: application/json');
echo json_encode($jsontree); 
*/