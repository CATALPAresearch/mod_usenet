<?php

namespace mod_newsmod\task;

/**
 * An example of a scheduled task.
 */
class send_summary extends \core\task\scheduled_task {

    /**
     * Return the task's name as shown in admin screens.
     *
     * @return string
     */
    public function get_name() {
        return get_string('email_send', 'newsmod');
    }

    /**
     * Execute the task.
     */
    public function execute() {
        // Apply fungus cream.
        // Apply chainsaw.
        // Apply olive oil.
	global $CFG,$DB;

	require_once($CFG->dirroot . '/mod/newsmod/libconn.php');
	$summary = $DB->get_records('user');
	$fp = fopen('./crontest.txt', 'w');
	$cachesummary = array();
	foreach ($summary as $record){
		$enrolled = $DB->get_records_sql("
		SELECT c.id, nm.newsgroup, u.email, u.firstname
		FROM {course} c
		JOIN {newsmod} nm ON nm.course = c.id
		JOIN {context} ct ON c.id = ct.instanceid
		JOIN {role_assignments} ra ON ra.contextid = ct.id
		JOIN {user} u ON u.id = ra.userid
		JOIN {role} r ON r.id = ra.roleid
		where u.id = $record->id");
		$summarytext = "Guten Tag, diese E-Mail enthält die tägliche Zusammenfassung neuer Newsgroupbeiträge";
		foreach ($enrolled as $newsgr){
			if(!isset($cachesummary[$newsgr->newsgroup])){
			$cachesummary[$newsgr->newsgroup]=summary($newsgr);
			}
			if(count($cachesummary[$newsgr->newsgroup])>0){
			$summarytext = $summarytext . "\r\n\r\n<hr size=1 noshade=noshade />";
			$summarytext = $summarytext . $newsgr->newsgroup."\r\n";
			}
			foreach($cachesummary[$newsgr->newsgroup] as $message){
			$summarytext = $summarytext ."\r\n".$message->subject;
//			print_r($message->subject);
			}
		}
		echo "\r\n";
			fwrite($fp, json_encode($cachesummary));
		print_r("USER ".$record->firstname."\r\n");
		print_r($summarytext);
		print_r("nächster\r\n");
		sendemail($summarytext);
}
	echo "hallo";
		fclose($fp);
      }
}
