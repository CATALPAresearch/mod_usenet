<?php
require_once("../../../config.php");


$id = required_param('id', PARAM_INT);
if (!$cm = get_coursemodule_from_id('newsmod', $id)) {
    print_error("Course Module ID was incorrect");
}

$journal = $DB->get_record("newsmod", array("id" => $cm->instance));

require_once($CFG->dirroot . '/mod/newsmod/php/nntp/socketcon.php');


$groupinfo = getgroupinfo($journal);

//header('Content-Type: application/json');

echo json_encode($groupinfo);
