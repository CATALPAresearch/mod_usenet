<?php

require_once("../../config.php");
//require_once('./conn_lib.php');
//require_once('./edit_form.php');

$id = required_param('id', PARAM_INT);
$msgnr = required_param('msgnr',PARAM_INT);
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
//print_r($header);
$message = imap_fetchbody ($nntp, $msgnr, '1',FT_UID);
$message = nl2br($message);
//print_r($header);
if (!$user = $DB->get_record('user', ['email' => $header->fromaddress ])) {
    //echo "User Information not found";
    $user = new \stdClass();
    $user->id = "1";
    $user->firstname = $header->from[0]->personal;
    $user->lastname = "";
}
//print_r($user);

require_once($CFG->dirroot . '/mod/newsmod/libconn.php');
//require_once($CFG->dirroot . '/mod/newsmod/src/image-master/src/Intervention/Image/autoload.php');
markMessageRead($msgnr);
echo '<div class="container row-no-padding" style="padding-right:0px">
	<div class="container row-no-padding" style="padding-right:0px">
 	    <div class="svg col-sm-2 col-xl-2" style="padding-left:0px" id="identiconPlaceholder">
	    </div>
	   <script>
		var placeholder = document.getElementById("identiconPlaceholder");
		placeholder.innerHTML = jdenticon.toSvg("'.$header->from[0]->mailbox."@".$header->from[0]->host .'", 100,
{lightness: {color: [0.40, 0.80], grayscale: [0.30, 0.90]}, saturation: { color: 0.50, grayscale: 0.00}, backColor: "#86444400"});
	   </script>
		<div id="messagehead" class="col-sm-8 col-xl-6" messageid='.htmlspecialchars($header->message_id).'>';
echo '<div class="col-xl"><div><h4><span class="label label-default">Name</span></div><div id="name" >'.$user->firstname." ".$user->lastname.'</h4></div>';

		 //new moodle_url("/user/profile.php?id="'.$user->id).'></a>';
//echo '<div class="col-xl"><div><h4><span class="label label-default">Name</span></h4></div><div id=name >'.$user->firstname." ".$user->lastname.'</div></div>';
echo '<div><div><h4><span class="label label-default">Betreff</span></h4></div><div id=subject >'.htmlspecialchars($header->subject).'</div></div></div>';
echo '</div>';

if ($user->picture > 0){

echo '<div><a class="" href=' .new moodle_url("/user/profile.php?id=".$user->id) .'>';
echo '<img src="' .new moodle_url("/user/pix.php/".$user->id."/f1.jpg" ) .'"width=100 height=100></img>';
echo ' </a></div></div>';
} else {
echo '</div>';
}
echo "<div class='container'><div><a class='btn btn-primary' id=answerbutton onclick='javascript: answerButton();'> Antworten</a></div></div>";

echo '<div class="container row-no-padding" style="padding-right:0px">';

echo "<hr><div id=messagebody class='row-no-padding' style='overflow-y: scroll;height: 335.9px' >".$message."</div>";
echo '</div>';
echo '</div>';
