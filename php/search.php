<?php

require_once("../../../config.php");
//require_once('./conn_lib.php');
//require_once('./edit_form.php');

$id = required_param('id', PARAM_INT);
$searchparam = optional_param('searchparam', 0, PARAM_TEXT);
$msgnr = optional_param('msgnr', 0, PARAM_INT);
$markedstatus = optional_param('marked', 0, PARAM_INT);
$sender = optional_param('sender', 0, PARAM_TEXT);
if (!$cm = get_coursemodule_from_id('usenet', $id)) {
    print_error("Course Module ID was incorrect");
}

if (!$course = $DB->get_record("course", array("id" => $cm->course))) {
    print_error("Course is misconfigured");
}
$journal = $DB->get_record("usenet", array("id" => $cm->instance));


$context = context_module::instance($cm->id);
if (!isloggedin()) {
    header('Temporary-Header: True', true, 401);
}
require_login($course, false, $cm);
// require_capability('mod/usenet:addentries', $context);

if (! $journal = $DB->get_record("usenet", array("id" => $cm->instance))) {
    print_error("Course module is incorrect");
}

//Header
$PAGE->set_url('/mod/usenet/edit.php', array('id' => $id));
$PAGE->navbar->add(get_string('edit'));
$PAGE->set_title(format_string($journal->name));
$PAGE->set_heading($course->fullname);
$data = new stdClass();
$localconfig = get_config('usenet');


if (!$user = $DB->get_record('user', ['email' => $sender])) {
    //echo "User Information not found";
    $user = new \stdClass();
    $user->id = "1";
    $user->firstname = $sender;
    $user->lastname = "";
}
require_once($CFG->dirroot . '/mod/usenet/php/nntp/libconn.php');

$searchresult = msgSearch($journal, $searchparam);


if ($searchresult) {
    echo json_encode($searchresult);
} else {
    header('HTTP/1.1 204 No Content', true, 204);
}
