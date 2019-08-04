<?php

require_once("../../config.php");
//require_once('./conn_lib.php');
//require_once('./edit_form.php');

$id = required_param('id', PARAM_INT);
$msgnr = required_param('msgnr',PARAM_RAW);
//$sender = optional_param('sender',PARAM_TEXT);
//$subject  = optional_param('subject', PARAM_TEXT);
$form = data_submitted();

if (!$cm = get_coursemodule_from_id('newsmod', $id)) {
    print_error("Course Module ID was incorrect");
}

if (!$course = $DB->get_record("course", array("id" => $cm->course))) {
    print_error("Course is misconfigured");

}
$journal = $DB->get_record("newsmod", array("id" => $cm->instance));
$localconfig = get_config('newsmod');

$context = context_module::instance($cm->id);
require_login($course, false, $cm);


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

compose_mail();

function compose_mail(){
	global $form, $msgnr,$localconfig,$journal,$USER;
	if(!$msgnr){
	 $msgnr=$form->subject;
	}
        $username = "AUTHINFO USER ". $localconfig->newsgroupusername ."\n";
        $headers['from'] = $USER->email;
        $headers['subject'] = $form->subject;
        $headers['custom_headers'][] = 'Newsgroups: ' . $journal->newsgroup;
	$headers['custom_headers'][] = 'References: ' . $msgnr;
        $body[0]['type'] = TYPETEXT;
        $body[0]['subtype'] = 'plain';
        $body[0]['contents.data'] = $form->userInput;
        $post = imap_mail_compose($headers, $body);
        $server = 'news.fernuni-hagen.de';
        $port = 119;
        $sh = fsockopen($server, $port) or die ("Can't connect to $server.");
        //echo $sh;
	print_r($post);
//fwrite($sh, "STARTTLS\n");
        if(fwrite($sh, $username)!=strlen($username)){
        fclose($sh);
        return(null);
        }
	$st=fgets($sh, 512);
    if (substr($st, 0, 3)!="+OK")
    {
        //print_r($st);
        //fclose($sh);
        //return(NULL);
    }else{print_r($st);}
        $st="AUTHINFO PASS ".$localconfig->newsgrouppassword ."\n";
        if (fwrite($sh, $st)!=strlen($st))
        {
                fclose($sh);
        return(NULL);
         }
	$st=fgets($sh, 512);
    if (substr($st, 0, 3)!="+OK")
    {
//        print_r($st);
//        fclose($sh);
//        return(NULL);
    }else{print_r($st);}
        fputs($sh, "POST\r\n");
        fputs($sh, $post);
        fputs($sh, ".\r\n");
        fclose($sh);
}





//if (!$user = $DB->get_record('user', ['email' => $sender])) {
    //echo "User Information not found";
//    $user = new \stdClass();
//    $user->id = "1";
//    $user->firstname = $sender;
//    $user->lastname = "";
//}

