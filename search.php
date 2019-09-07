<?php

require_once("../../config.php");
//require_once('./conn_lib.php');
//require_once('./edit_form.php');

$id = required_param('id', PARAM_INT);
$searchparam = optional_param('searchparam',0,PARAM_TEXT);
$msgnr = optional_param('msgnr', 0, PARAM_INT);
$markedstatus = optional_param('marked', 0, PARAM_INT);
$sender = optional_param('sender',0,PARAM_TEXT);
if (!$cm = get_coursemodule_from_id('newsmod', $id)) {
    print_error("Course Module ID was incorrect");
}

if (!$course = $DB->get_record("course", array("id" => $cm->course))) {
    print_error("Course is misconfigured");

}
$journal = $DB->get_record("newsmod", array("id" => $cm->instance));


$context = context_module::instance($cm->id);
if(!isloggedin()){
header('Temporary-Header: True', true, 401);
}
require_login($course, false, $cm);
// require_capability('mod/newsmod:addentries', $context);

if (! $journal = $DB->get_record("newsmod", array("id" => $cm->instance))) {
    print_error("Course module is incorrect");
}

//Header
$PAGE->set_url('/mod/newsmod/edit.php', array('id' => $id));
$PAGE->navbar->add(get_string('edit'));
$PAGE->set_title(format_string($journal->name));
$PAGE->set_heading($course->fullname);
$data = new stdClass();
$localconfig = get_config('newsmod');
$nntp = imap_open("{". $localconfig->newsgroupserver . "/nntp}".$journal->newsgroup, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);
$header = imap_header($nntp, imap_msgno($nntp,$msgnr));
$message = imap_fetchbody ($nntp, $msgnr, '1',FT_UID);
$message = nl2br($message);

if (!$user = $DB->get_record('user', ['email' => $sender])) {
    //echo "User Information not found";
    $user = new \stdClass();
    $user->id = "1";
    $user->firstname = $sender;
    $user->lastname = "";
}
require_once($CFG->dirroot . '/mod/newsmod/libconn.php');
$searchresult = msgSearch($nntp, $searchparam);
$messages = imap_fetch_overview($nntp, implode(',',array_slice($searchresult,0)), FT_UID);

if($messages){
header('Content-Type: application/json');
echo json_encode($messages);
}else{
header('HTTP/1.1 204 No Content', true, 204);
}
