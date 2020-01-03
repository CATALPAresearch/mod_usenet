<?php

require_once("../../config.php");
//require_once('./conn_lib.php');
//require_once('./edit_form.php');

$id = required_param('id', PARAM_INT);
$msgnr = required_param('msgnr', PARAM_INT);
$sender = optional_param('sender', 0, PARAM_TEXT);
if (!$cm = get_coursemodule_from_id('newsmod', $id)) {
    print_error("Course Module ID was incorrect");
}

if (!$course = $DB->get_record("course", array("id" => $cm->course))) {
    print_error("Course is misconfigured");
}
$journal = $DB->get_record("newsmod", array("id" => $cm->instance));


$context = context_module::instance($cm->id);
if (!isloggedin()) {
    header('Temporary-Header: True', true, 401);
}
require_login($course, false, $cm);
// require_capability('mod/newsmod:addentries', $context);

if (! $journal = $DB->get_record("newsmod", array("id" => $cm->instance))) {
    print_error("Course module is incorrect");
}


function read($socket)
{

    $done = false;  //loop exit condition


    /*
        //socket_select requieres arrays of socket to keep track of
    */
    $w = null;      //sockets for writing
    $e = null;      //exception sockets
    $r = array($socket);    //sockets for reading

    $buf = "";      //receiver var for socket_recv() - data origin: tcp buffer 
    $sum = "";      //concatenation of $buf
    

    /*
        //pre loop initialization
    */
    $n = 0;     //return val of socket_recv(), stores amount of bytes read
    $changed_sockets = 0;   //return val of socket_select(), stores amount of changed sockets


    do{
        
        if($n === false)
        {

            $changed_sockets = socket_select($r,$w,$e, 0, 500000);  //500000us = 500ms

            if ($changed_sockets === false)
            {
                echo "error - function read";
                $done = true;
                break;
            }

            if ($changed_sockets == 0)
            {
                $done = true;
            }

            //echo "ch sock: "."$changed_sockets<br>";
            

        } 
        $n = socket_recv($socket, $buf, 2048, MSG_DONTWAIT);

        //0 received bytes indicate a closed connection
        if ($n === 0)
        {
            $done = true;
            echo "connection widowed<br>";
        }

        $sum .= $buf."<br>";

        //echo "bytes rec:"."$n<br>";
        
    }while(!$done);


    return $sum;
}



$port = 119;
$address = gethostbyname('feunews.fernuni-hagen.de');
/*
    ///nntp commands must end with \n or \0
*/
$user = "AUTHINFO USER friedrichk\n"; // fill in your ldap name here
$pass = "AUTHINFO PASS 241d0HB3450\n"; // enter your password here


if (($sock = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)) === false) {
    echo "socket_create() failed: reason: " . socket_strerror(socket_last_error()) . "\n";
}

if (socket_connect($sock, $address, $port) === false) {
    echo "socket_bind() fehlgeschlagen: Grund: " . socket_strerror(socket_last_error($sock)) . "\n";
}


        socket_write ($sock, $user, strlen ($user));
      
        socket_write ($sock, $pass, strlen ($pass));


        $message = "group feu.news\n";

        //$message = "list overview.fmt\n";

        socket_write ($sock, $message);


        $buf = read($sock);


        $message = "body 15\n";

        socket_write ($sock, $message);

        $buf = read($sock);

        $messagebody = $buf;
        $messagebody = nl2br($messagebody);

        $message = "quit\n";

        socket_write ($sock, $message);


        $buf = read($sock);


    echo "<br> close";

    socket_close ($sock);















//Header
$PAGE->set_url('/mod/newsmod/edit.php', array('id' => $id));
$PAGE->navbar->add(get_string('edit'));
$PAGE->set_title(format_string($journal->name));
$PAGE->set_heading($course->fullname);
$data = new stdClass();
$localconfig = get_config('newsmod');
$nntp = imap_open("{". $localconfig->newsgroupserver . "/nntp}".$journal->newsgroup, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);
$header = imap_header($nntp, imap_msgno($nntp, $msgnr));
//print_r($header);
//$message = imap_fetchbody($nntp, $msgnr, '1', FT_UID);
//$message = nl2br($message);
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


		var itendi = new Identicon(btoa("'.$header->from[0]->mailbox."@".$header->from[0]->host .'"),options).toString();
		var outerh = "<img width=100 height=100 src=\"data:image/svg+xml;base64,"+itendi+"";
		$(\'#identiconPlaceholder\').append(outerh+"\"></img>");


	   </script>
        	<div id="messagehead" class="col-sm-8 col-xl-6" messageid='.htmlspecialchars($header->message_id).'>';
echo '<div class="col-xl"><div></div><div id="name" >'.$user->firstname." ".$user->lastname.'</div>';

         //new moodle_url("/user/profile.php?id="'.$user->id).'></a>';
//echo '<div class="col-xl"><div><h4><span class="label label-default">Name</span></h4></div><div id=name >'.$user->firstname." ".$user->lastname.'</div></div>';
echo '<div><div></div><div class="font-weight-bold" id=subject >'.htmlspecialchars($header->subject).'</div></div></div>';
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
