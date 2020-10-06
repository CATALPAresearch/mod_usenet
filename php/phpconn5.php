<?php
//header('Content-Type: application/json');

require_once("../../../config.php");
//require_once('./conn_lib.php');
//require_once('./edit_form.php');

$id = required_param('id', PARAM_INT);
if (!$cm = get_coursemodule_from_id('usenet', $id)) {
    print_error("Course Module ID was incorrect");
}
if (!$course = $DB->get_record("course", array("id" => $cm->course))) {
    print_error("Course is misconfigured");
}
$journal = $DB->get_record("usenet", array("id" => $cm->instance));


$context = context_module::instance($cm->id);
//require_login($course, false, $cm);
//require_capability('mod/usenet:addentries', $context);

if (! $journal = $DB->get_record("usenet", array("id" => $cm->instance))) {
    print_error("Course module is incorrect");
}
$localconfig = get_config('usenet');
require_once($CFG->dirroot . '/mod/usenet/php/nntp/libconn.php');
$jsontree = generateJsonFromNews($journal);

echo $jsontree;
