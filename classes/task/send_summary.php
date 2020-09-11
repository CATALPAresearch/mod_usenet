<?php

namespace mod_usenet\task;

/**
 * An example of a scheduled task.
 */
class send_summary extends \core\task\scheduled_task
{

    /**
     * Return the task's name as shown in admin screens.
     *
     * @return string
     */
    public function get_name()
    {
        return get_string('email_send', 'usenet');
    }

    /**
     * Execute the task.
     */
    public function execute()
    {
        // Apply fungus cream.
        // Apply chainsaw.
        // Apply olive oil.
        global $CFG,$DB;

        require_once($CFG->dirroot . '/mod/usenet/libconn.php');
        $summary = $DB->get_records('user');
        $fp = fopen('./crontest.txt', 'w');
        $cachesummary = array();
        $httppos = $DB->get_records_sql("
                SELECT wwwroot
                FROM mdl_mnet_host
                WHERE id = '1';
                ");
        $lastruntime = $DB->get_record_sql("
                SELECT t.lastruntime
                FROM {task_scheduled} t
                where t.component = 'mod_usenet'");

        if ($lastruntime->lastruntime>0) {
            $timetosearch=time();
        } else {
            $timetosearch=strtotime("-40 hours", $lastruntrime->lastruntime);
        }

        foreach ($httppos as $key) {
            $httppos=$key->wwwroot;
        }

        foreach ($summary as $record) {
            $enrolled = $DB->get_records_sql("
		SELECT nm.newsgroup, u.id ,u.email, u.firstname
		FROM {course} c
		JOIN {usenet} nm ON nm.course = c.id
		JOIN {context} ct ON c.id = ct.instanceid
		JOIN {role_assignments} ra ON ra.contextid = ct.id
		JOIN {user} u ON u.id = ra.userid
		JOIN {role} r ON r.id = ra.roleid
		where u.id = $record->id");
            $summarytext = '
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
                      "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>E-Mail Beispiel</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin: 0; padding: 0;">';

            $summarytext = $summarytext . "<b>Guten Tag, diese E-Mail enthält die tägliche Zusammenfassung neuer Newsgroupbeiträge seit dem ".date("d-M-Y", $lastruntime->lastruntime)."</b>";
            $content= "";
            foreach ($enrolled as $newsgr) {
                $testhallo= $newsgr->newsgroup;
                $enrolledd = $DB->get_records_sql("
                      SELECT cm.id, nm.newsgroup FROM {modules} c
                      JOIN {course_modules} cm ON cm.module = c.id
                      JOIN {usenet} nm ON nm.id = cm.instance
                      WHERE c.name = 'usenet'");
                $key = array_search($newsgr->newsgroup, array_column($enrolledd, 'newsgroup'));
                $keys = array_slice($enrolledd, $key, 1);

                if (count($enrolled)>0) {
                    $content =1;
                }
                if (!isset($cachesummary[$newsgr->newsgroup])) {


                    //call to summary in libconn.php


                    $cachesummary[$newsgr->newsgroup]=summary($newsgr, $timetosearch);
                }
                if (count($cachesummary[$newsgr->newsgroup])>0) {
                    //$summarytext = $summarytext . "\r\n\r\n<hr size=1 noshade=noshade />";
                    $summarytext = $summarytext ."<h3>Newsgruppe: ". $newsgr->newsgroup."</h3>\r\n";
                    $summarytext = $summarytext . '<table border="0" height="200" cellpadding="0" cellspacing="0" width="100%">';
                }


                foreach ($cachesummary[$newsgr->newsgroup] as $message) {
                    $summarytext= $summarytext .'<tr><td height="10px">';
                    $summarytext = $summarytext .  '<a class="searcher" href="'.$httppos .'/mod/usenet/view.php?id='. $keys[0]->id .'&msgnr='. $message->uid .'">';
                    //$summarytext = $summarytext . '<li class="node" style="list-style:none">';
                    //$summarytext = $summarytext .  '<svg width="100" height="100" data-jdenticon-value=">';


                    //original code:
                    //$tempheader->sender=imap_rfc822_parse_adrlist($message->from, '');

                    //maybe use formating on $message->from (example from generatejsonfromnews() in libconn.php)
                    //$jsontree = $jsontree . '"sender":"'.addcslashes(str_replace('\\', '', $header->from), "\"").'",';
                    $tempheader->sender=$message->from;



                    //print_r(new moodle_url("/mod/usenet/messageid.php?id=" . $newsgr->id . "&msgnr=" . $message->uid));
                    $summarytext = $summarytext . '<p>Betreff: '. htmlspecialchars($message->subject).'</p><p> Absender: ';



                    //original code:
                    //$summarytext = $summarytext . $tempheader->sender[0]->mailbox."@".$tempheader->sender[0]->host;

                    //sender already contains mailbox@host
                    $summarytext = $summarytext . $tempheader->sender;


                    $summarytext = $summarytext . $tempheader->personal.'</p>';
                    //$summarytext = $summarytext . '</div><div class="timelist" timestamp="' .$message->date.'"';
                    //$summarytext = $summarytext . '</div></div></div></li></a>';
                    $summarytext = $summarytext .'</td></tr>';
                }
                $summarytext = $summarytext .'</table>';
            }

            $summarytext = $summarytext . "</html>";
            if ($content>0) {
                sendemail($record->id, $summarytext);
                $content=0;
            }
        }
        fclose($fp);
    }
}
