<?php

require_once("../../config.php");
//require_once('./conn_lib.php');
//require_once('./edit_form.php');

$id = required_param('id', PARAM_INT);

if (!$cm = get_coursemodule_from_id('newsmod', $id)) {
    print_error("Course Module ID was incorrect");
}

if (!$course = $DB->get_record("course", array("id" => $cm->course))) {
    print_error("Course is misconfigured");

}

$context = context_module::instance($cm->id);
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

// $entry = $DB->get_record("testnntp__entries", array("userid" => $USER->id, "journal" => $journal->id));

// if ($entry){
// 	$data->entryid = $entry->id;
// 	$data->text = $entry->text;
// 	$data->textformat = $entry->format;
// }else {
//     $data->entryid = null;
//     $data->text = '';
//     $data->textformat = FORMAT_HTML;
// }
// $data->id = $cm->id;

// $editoroptions = array('atto:toolbar' => '','context' => $context, 'subdirs' => false, 'enable_filemanagement' => false);
// $data = file_prepare_standard_editor($data, 'text', $editoroptions, $context, 'mod_testnntp', 'entry', $data->entryid);
//$form = new mod_testnntp_entry_form(null, array('entryid' => $data->entryid, 'editoroptions' => $editoroptions));
//$form->set_data($data);
//if ($header == false) {
//    echo "Abruf fehlgeschlagen<br />\n";
//} else {

//foreach ($header as $val) {
//        $val1 = imap_mime_header_decode($val);
//        print mb_decode_mimeheader($val) . "<BR>\n";
//    }
//};

//$message = new \core\message\message();
//$message->component = 'moodle';
//$message->name = 'instantmessage';
//$message->userfrom = $USER;
//$message->userto = $user;
//$message->subject = 'message subject 1';
//$message->fullmessage = 'message body';
//$message->fullmessageformat = FORMAT_MARKDOWN;
//$message->fullmessagehtml = '<p>message body</p>';
//$message->smallmessage = 'small message';
//$message->notification = '0';
//$message->contexturl = 'http://GalaxyFarFarAway.com';
//$message->contexturlname = 'Context name';
//$message->replyto = "random@example.com";
//$content = array('*' => array('header' => ' test ', 'footer' => ' test ')); // Extra content for specific processor
//$message->set_additional_content('email', $content);
//$message->courseid = $course->id; // This is required in recent versions, use it from 3.2 on https://tracker.moodle.org/browse/MDL-47162

// Create a file instance.
//$usercontext = context_user::instance($user->id);
//$file = new stdClass;
//$file->contextid = $usercontext->id;
//$file->component = 'user';
//$file->filearea  = 'private';
//$file->itemid    = 0;
//$file->filepath  = '/';
//$file->filename  = '1.txt';
//$file->source    = 'test';

//$fs = get_file_storage();
//$file = $fs->create_file_from_string($file, 'file1 content');
//$message->attachment = $file;

//$messageid = message_send($message);
//echo $messageid;

// if($form->is_cancelled()) {
// 		redirect($CFG->wwwroot . '/mod/testnntp/view.php?id=' . $cm->id);
// } else if ($fromform = $form->get_data()){
// 		confirm_sesskey();
// 		$timenow = time();
//
// 		$newentry = new stdClass();
// 		//echo "hallo was geht hier";
// 		$newentry->text = $fromform->text_editor['text'];
// 		$newentry->format = $fromform->text_editor['format'];
// 		$newentry->modified = $timenow;
//
// 		if($entry) {
// 			$newentry->id = $entry->id;
// 			if (!$DB->update_record("testnntp__entries", $newentry)) {
// 		        	print_error("Could not update your journal");
// 		        }
// 		} else {
// 			$newentry->userid = $USER->id;
// 			$newentry->journal = $journal->id;
// 			if(!$newentry->id = $DB->insert_record("testnntp__entries", $newentry)) {
// 				print_error("Could not insert a new journal entry");
// 			}
// 		}
//
//     $fromform = file_postupdate_standard_editor($fromform, 'text', $editoroptions, $editoroptions['context'], 'mod_testnntp', 'entry', $newentry->id);
//     $newentry->text = $fromform->text;
//     $newentry->format = $fromform->textformat;
//     $DB->update_record('testnntp__entries', $newentry);
//
// if ($entry) {
//        // Trigger module entry updated event.
// 	$event = \mod_testnntp\event\entry_updated::create(array('objectid' => $journal->id, 'context' => $context));
//     } else {
//         // Trigger module entry created event.
//         //$event = \mod_testnntp\event\entry_created::create(array('objectid' => $journal->id, 'context' => $context ));
// 	compose_mail();
// 	print_r($fromform);
//
//     }
// 	//compose_mail();
//     $event->add_record_snapshot('course_modules', $cm);
//     $event->add_record_snapshot('course', $course);
//     $event->add_record_snapshot('journal', $journal);
//     $event->trigger();
// 	testnntp_sendmail($context);
//     //redirect(new moodle_url('/mod/testnntp/view.php?id='.$cm->id));

    //die;
//}


//foreach ($i = 1; $i <= $count-1; $i++){
//    print_r($header);
//}
//$nntp = imap_open ("{news.fernuni-hagen.de:119/nntp}feu.cafe", "q3224490", "rtlwO452011!");
//$count = imap_num_msg($nntp);
//$header = imap_header($nntp, 1);
//$threads = imap_thread($nntp);
//    print_r($threads);

//foreach ($threads as $key => $val) {
//  $tree = explode('.', $key);

//  if ($tree[1] == 'num') {
//    $header = imap_headerinfo($nntp, $val);
    //echo $header->subject . "<BR>";
//    echo "<ul>\n\t<li>" . $header->fromaddress . $header->subject . "\n";
//  } elseif ($tree[1] == 'branch') {
//    echo "\t</li>\n</ul>\n";
//  }
//}

// echo $OUTPUT->header();
// echo $OUTPUT->heading(format_string($journal->name));

// $intro = format_module_intro('testnntp', $journal, $cm->id);
// echo $OUTPUT->box($intro);
$myfile = fopen("results.json", "r") or die("Unable to open file!");
echo fread($myfile,filesize("results.json"));
fclose($myfile);


// Otherwise fill and print the form.
// $form->display();
// echo $OUTPUT->footer();
