<?php

require_once("../../../config.php");
//require_once('./conn_lib.php');
//require_once('./edit_form.php');



$id = required_param('id', PARAM_INT);
$msgnr = required_param('msgnr', PARAM_INT);
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


require_once($CFG->dirroot . '/mod/usenet/php/nntp/socketcon.php');


$nntp = nntp_open($localconfig->newsgroupserver, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);


if (is_array($nntp) && array_key_exists('is_error',$nntp)) {    //error detected, theres error_feedback data structure here!
    $returnmsg = $nntp;
}
else {
    $header = nntp_header($nntp, $journal->newsgroup, $msgnr);
    if (array_key_exists('is_error', $header)) {
        $returnmsg = $header;
    }
    else {
        $messagebody = nntp_fetchbody($nntp, $journal->newsgroup, $msgnr);
        if (is_array($messagebody) && array_key_exists('is_error', $messagebody)) {
            $returnmsg = $body;
        }
        else {
            require_once($CFG->dirroot . '/mod/usenet/php/nntp/libconn.php');

            $self = [];

            $statusread = @loadMessageStatus($header->number);
            $userinfo = @getUserIdByEmail($header->from);


            $self["name"] = $header->subject;
            $self["number"] = $header->number;
            $self["messageid"] = $header->id;
            $self["threadhead"] = false;
            $self["personal"] = $header->name;
            $self["sender"] = addcslashes(str_replace('\\', '', $header->from), "\"");
            $self["messagestatus"] = $statusread->readstatus;
            $self["markedstatus"] = $statusread->marked;
            $self["picturestatus"] = $userinfo->picture;
            $self["user_id"] = $userinfo->id;
            $self["date"] = $header->displaydate;
            $self["timestamp"] = $header->date;

            $returnmsg = [
                "header" => $self,
                "messagebody" => $messagebody
            ];
        
            markMessageRead($msgnr);
        }
    }
}

echo json_encode($returnmsg);


//      LEGACY CODE

//check out $header->fromaddress
/*
if (!$user = $DB->get_record('user', ['email' => $header->from])) {
    //echo "User Information not found";
    $user = new \stdClass();
    $user->id = "1";
    $user->firstname = $header->name;
    $user->lastname = "";
}
*/
//print_r($user);

//require_once($CFG->dirroot . '/mod/usenet/src/image-master/src/Intervention/Image/autoload.php');
//var itendi = new Identicon(btoa("'.$header->from[0]->mailbox."@".$header->from[0]->host .'"),options).toString();


/*
echo '<div class="container row-no-padding" style="padding-right:0px"><hr>
	<div class="container row-no-padding row" style="padding-right:0px">
 	    <div class="svg col-sm-2 col-xl-2" style="padding-left:0px" id="identiconPlaceholder">
	    </div>
	   <script>
		var placeholder = document.getElementById("identiconPlaceholder");
var options = {
                      background: [255, 255, 255, 255],         // rgba white
                      margin: 0.05,                              // 20% margin
                      size: 20,                                // 420px square
                      format: \'svg\'                             // use SVG instead of PNG
                    };


		var itendi = new Identicon(btoa("'.$header->from .'"),options).toString();
		var outerh = "<img width=100 height=100 src=\"data:image/svg+xml;base64,"+itendi+"";
		$(\'#identiconPlaceholder\').append(outerh+"\"></img>");


	   </script>
        	<div id="messagehead" class="col-sm-8 col-xl-6" messageid="'.htmlspecialchars($header->number).'" references="'.htmlspecialchars(implode(" ",$header->references)).'" uid="'.$header->id.'">';
echo '<div class="col-xl"><div id="name" >'.$user->firstname." ".$user->lastname.'</div>';

         //new moodle_url("/user/profile.php?id="'.$user->id).'></a>';
//echo '<div class="col-xl"><div><h4><span class="label label-default">Name</span></h4></div><div id=name >'.$user->firstname." ".$user->lastname.'</div></div>';
echo '<div><div class="font-weight-bold" id=subject >'.htmlspecialchars($header->subject).'</div></div></div>';
echo '</div>';

if ($user->picture > 0) {
    echo '<div><a class="" href=' .new moodle_url("/user/profile.php?id=".$user->id) .'>';
    echo '<img src="' .new moodle_url("/user/pix.php/".$user->id."/f1.jpg") .'"width=100 height=100></img>';
    echo ' </a></div></div>';
} else {
    echo '</div>';
}
echo "<div class='container row'><div class='col-xl-5 col-sm-2 px-0'><button class=' btn btn-primary' id=answerbutton onclick='javascript: answerButton();'> Antworten</button></div>";
echo "<div class='btn-group' role='group' aria-label='Basic example'><button class='btn btn-primary' type='button' id='previusbutton' onclick='javascript: navigatePrevius();'>Vorherige Nachricht</button>";
echo "<button class='btn btn-primary' type='button' id='nextbutton'  onclick='javascript: navigateNext();'>Nächste Nachricht</button></div></div>";

echo '<div class="container row-no-padding" style="padding-right:0px">';

echo "<hr><div id=messagebody class='row-no-padding' style='overflow-y: scroll;height: 335.9px' >".$messagebody."</div>";
echo '</div>';
echo '</div>';
*/