<?php
require_once("../../../config.php");


$id = required_param('id', PARAM_INT);
if (!$cm = get_coursemodule_from_id('usenet', $id)) {
    print_error("Course Module ID was incorrect");
}

$journal = $DB->get_record("usenet", array("id" => $cm->instance));

require_once($CFG->dirroot . '/mod/usenet/php/nntp/socketcon.php');


$groupinfo = getgroupinfo($journal);

//header('Content-Type: application/json');

echo json_encode($groupinfo);
