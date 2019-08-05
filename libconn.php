<?php
// defined('MOODLE_INTERNAL')|| die;

	function summary($journal){

        $localconfig = get_config('newsmod');
        $nntp = imap_open("{". $localconfig->newsgroupserver . "/nntp}".$journal->newsgroup, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);
	$email = imap_search($nntp, 'SINCE "'.Date("d M Y", strtotime("-24 hours", time())).'"' ,SE_UID);
	print_r( Date('j M Y'));
	$tmp =@imap_fetch_overview($nntp, implode(',', $email),FT_UID);
	return($tmp);
	}

	function sendemail($email, $content){
	$email_user = new stdClass;
	$email_user->email=$email;
	$email_user->firstname=" ";
	$email_user->lastname= " ";
	$email_user->maildisplay = false;
	$email_user->mailformat = 1;
	$email_user->id=-99;
	$subject= "Zusammenfassung des Forums";
//	$content= "blablubb";
	$a=email_to_user($email_user, $email_user, $subject, $content);

	}
?>
