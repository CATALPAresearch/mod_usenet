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
if(!$searchresult = msgSearch($nntp, $searchparam)){
echo '
<div class="alert alert-success" role="alert">
  <h4 class="alert-heading">Kein Glück</h4>
  <p>Ihr Suchanfrage lieferte leider kein Ergebnis zurück</p>
  <hr>
  <p class="mb-0">Ihr letzter Suchbegriff <p class="font-weight-bold">'.$searchparam.'</p></p>
</div>';
return;
}
$messages = imap_fetch_overview($nntp, implode(',',array_slice($searchresult,0)), FT_UID);
if($messageid = $DB->record_exists('messagestatus', array('userid' => $USER->id, 'messageid' => $msgnr))){
//$testmodule=$DB->get_record('messagestatus', array('id' => '2'), '*', MUST_EXIST);
$moduleinstan=$DB->get_record('messagestatus', array('userid' => $USER->id, 'messageid' => $msgnr), '*', IGNORE_MISSING);
switch($moduleinstan->marked){
	case 0:
	$moduleinstan->marked = true;
	break;
	case 1:
	$moduleinstan->marked = false;
	break;
}
$errortest=$DB->update_record('messagestatus', $moduleinstan, $bulk=true);
//$moduleinstan->readstatus = true;
//print_r($searchresult);
//if
//print_r($moduleinstan);
//print_r($testmodule);
}else{
$moduleinstanl = new stdClass();
//$moduleinstanl->id = "3";
$moduleinstanl->userid     = $USER->id;
$moduleinstanl->messageid  = $msgnr;
$moduleinstanl->courseid   = $id;
$moduleinstanl->readstatus = false;
$moduleinstanl->marked     = true;
$DB->insert_record('messagestatus', $moduleinstanl);
}
echo "<div class='col-xl-12' style='overflow-y: auto;height: 500;'><div>Ihre Suche lieferte ". count($messages) ." Treffer</div><hr><ul>";

//print_r($messages);
foreach($messages as $msg){
//print_r($msg);
$tempheader->sender=imap_rfc822_parse_adrlist($msg->from,'');
echo '<a class="searcher" href=' . new moodle_url("/mod/newsmod/messageid.php?id=".$id."&msgnr=" .$msg->uid) .'>';
echo '<li class="node">';
echo '
<div class="col-xl-12">
<div class="col-xl-3">
	<svg width="100" height="100" data-jdenticon-value="'.$tempheader->sender[0]->mailbox."@".$tempheader->sender[0]->host.'"></div>
<div>
<div>
	'.htmlspecialchars($msg->subject).'
</div>

<div>
	'.$msg->from .'
</div>
<div class="timelist" timestamp="'.$msg->date.'">

</div>
</div>

</div>
<div>

</div>';
echo '</li></a>';

//echo '<div id="messagehead messageid="'.htmlspecialchars($header->message_id).'/>';

//echo '</li>';
//print_r($messages);

}
echo '</ul>';

echo '<script>
window.jdenticon_config = {lightness: {color: [0.40, 0.80], grayscale: [0.30, 0.90]}, saturation: { color: 0.50, grayscale: 0.00}, backColor: "#86444400"};
$("svg").jdenticon();
$(".timelist").each(function(idx,elem){
$(elem).append(
$.format.prettyDate(new Date($(elem).attr("timestamp")).getTime(),"dd MM yyyy"));
});
$(".searcher").click(function(event){event.preventDefault(); $("#treeinfo").load($(this).attr("href"))});
window.addEventListener("beforeunload", function (e) {
  e.preventDefault();
  e.returnValue = "";
});
</script>';
//print_r($markedstatus);
//echo $searchparam;
//echo "<img src=" .new moodle_url('/user/pix.php/'.$user->id.'/f1.jpg') ."width=35 height=35></img>";
//echo $user->firstname." ".$user->lastname." </a>";
