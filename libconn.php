<?php
defined('MOODLE_INTERNAL')|| die;

//error_reporting(E_ALL);

require_once($CFG->dirroot . '/mod/newsmod/socketcon.php');

    function summary($journal, $timetosearch)
    {
        global $CFG, $DB;
        $localconfig = get_config('newsmod');
        
        $nntp = nntp_open($localconfig->newsgroupserver, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);
        $result = nntp_headers($nntp, $journal->newsgroup);
        file_put_contents($CFG->dataroot."/cache/".$journal->newsgroup.".txt", serialize($result));
        //$string_data = file_get_contents("filecontents.txt");
        //$result = unserialize($string_data);
        //print_r($timetosearch);

        //foreach ($result as $overview) {
//    echo "#{$overview->msgno} ({$overview->date}) - From: {$overview->from}
//    {$overview->subject}\n<BR>";
        //echo mb_detect_encoding($overview->subject)."\r\n";
        //}

        /*
        $email = imap_search($nntp, 'SINCE "'.Date("d M Y", $timetosearch).'"', SE_UID);
        $tmp =@imap_fetch_overview($nntp, implode(',', $email), FT_UID);
        return($tmp);
        */
        return $result;
    }

    function buildSearchSting()
    {
    }

    function buildCache($journal)
    {
        global $CFG;
        $localconfig = get_config('newsmod');
        $nntp = nntp_open($localconfig->newsgroupserver, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);
        $result = nntp_headers($nntp, $journal->newsgroup);
        file_put_contents($CFG->dataroot."/cache/".$journal->newsgroup.".txt", serialize($result));
    }

    function sendemail($email, $content)
    {
        global $USER;
        $message = new \core\message\message();
        $message->component = 'mod_newsmod'; // Name of your local plugin.
        $message->name = 'posts'; // Name of message provider.
        $message->userfrom = $USER;
        $message->userto = $email;
        $message->subject= "Zusammenfassung der Newsgroups";
        $message->fullmessage = 'message body';
        $message->fullmessageformat = FORMAT_PLAIN;
        $message->fullmessagehtml = $content;
        $message->smallmessage = '';
        $message->notification = '1';
        $message->contexturl = 'noreply';
        $message->contexturlname = '';
        $message->replyto = '';
        //$content = array('*' => array('header' => ' test ', 'footer' => ' test ')); // Extra content for specific processor
        $message->set_additional_content('email', $content);
        $messageid = message_send($message);
        //$a=email_to_user($email_user, $email_user, $subject, html_to_text($content),$content);
    }
    function getUserIdByEmail($sender)
    {
        global $DB,$CFG;
        if (!$user = $DB->get_record('user', ['email' => $sender])) {
            //echo "User Information not found";
            $user = new \stdClass();
            $user->id = "-99";
            $user->firstname = $sender;
            $user->lastname = "";
        }
        return $user;
    }

    function utf8_for_xml($string)
    {
      return preg_replace('/[^\x{0009}\x{000a}\x{000d}\x{0020}-\x{D7FF}\x{E000}-\x{FFFD}]+/u',
                          ' ', $string);
    }
    
    function generateJsonFromNews($journal)
    {
        global $CFG;
        $localconfig = get_config('newsmod');
        $nntp = nntp_open($localconfig->newsgroupserver, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);
        //$cacheddata = loadCachedData($journal);
        
        $threads = thread_load_newsserver($nntp, $journal->newsgroup);
        
       

        $jsontree = '{"name":"'. $journal->newsgroup. '/Aktivitätslog", "moodleurl":"'. new moodle_url("/") .'","children":[{';
        $treend =0;
        $last = "";
        $siblings = 0;

        
    foreach ($threads as $header) {
        
      if (!$header->isReply)
            {
              if ($siblings > 0)
            {
                $jsontree .= "},{";
            }
            //print_r($header);
            $tempheader="";

            /*
            if ($cacheddata) {
                $key = array_search($val, array_column($cacheddata, 'uid'));
            } else {
                $key ="";
            }

            if ($key!= "") {
                $tempheader=$cacheddata[$key];
                $tempheader->sender[0]= new \stdClass();
                $tempheader->sender=imap_rfc822_parse_adrlist($cacheddata[$key]->from, '');
                //$tempheader->subject=stripslashes(imap_utf8($tempheader->subject));
                $tempheader->subject=addcslashes(imap_utf8($tempheader->subject), "\"");
            //print_r($tempheader->subject);
            //$tempheader->subject ='Nachrichtenknoten gelöscht';
            } else {
                $tempheader=headersubject($nntp, $val);
                if (@$tempheader->subject) {
                    $tempheader->subject=imap_utf8($tempheader->subject);
                }
            }
            if (!is_object($tempheader)) {
                $tempheader= new \stdClass();
                $tempheader->subject ='Nachrichtenknoten gelöscht';
                $tempheader->sender[0] = new \stdClass();
                $tempheader->sender[0]->mailbox= 'nicht vorhanden';
                $tempheader->sender[0]->host= 'nicht vorhanden';
                $tempheader->date= 'Mon, 1 Jan 2019 11:28:23';
            }
            */
            $statusread = @loadMessageStatus($header->number);
            $userinfo = @getUserIdByEmail($header->from);

            
            $header->subject = addcslashes(utf8_encode($header->subject), "\"");
            $jsontree = $jsontree . '"name":"'.$header->subject.'",';
            $jsontree = $jsontree . '"messageid":"'.$header->number.'",';
            $jsontree = $jsontree . '"personal":"'.$header->name.'",';
          
            $jsontree = $jsontree . '"sender":"'.addcslashes(str_replace('\\', '', $header->from), "\"").'",';
            $jsontree = $jsontree . '"messagestatus":"'. $statusread->readstatus .'",';
            $jsontree = $jsontree . '"markedstatus":"'. $statusread->marked .'",';
            $jsontree = $jsontree . '"picturestatus":"'. $userinfo->picture .'",';
            $jsontree = $jsontree . '"user_id":"'.$userinfo->id.'",';
            $jsontree = $jsontree . '"date":"'.$header->displaydate.'"';

            
          
                $jsontree .= getchildren($header, $threads);
     
            $siblings++;

            } 

    }
    $jsontree = $jsontree . "}]}";

    

    return $jsontree;
    }

    

    function getchildren($headeri, $threads)
    {
    
        $jsontree = "";
    
    
        if (isset($headeri->answers))
        {
            $siblings = 0;
            $jsontree = $jsontree . ',"children": [{'  ;
    
            foreach ($headeri->answers as $childid)
            {
                if ($siblings > 0)
                {
                    $jsontree .= "},{";
                }
                $header = $threads[$childid];
    
                $statusread = @loadMessageStatus($header->number);
                $userinfo = @getUserIdByEmail($header->from);


                $header->subject = addcslashes(utf8_encode($header->subject), "\"");
                $jsontree = $jsontree . '"name":"'.$header->subject.'",';
                $jsontree = $jsontree . '"messageid":"'.$header->number.'",';
                $jsontree = $jsontree . '"personal":"'.$header->name.'",';
            
                $jsontree = $jsontree . '"sender":"'.addcslashes(str_replace('\\', '', $header->from), "\"").'",';
                $jsontree = $jsontree . '"messagestatus":"'. $statusread->readstatus .'",';
                $jsontree = $jsontree . '"markedstatus":"'. $statusread->marked .'",';
                $jsontree = $jsontree . '"picturestatus":"'. $userinfo->picture .'",';
                $jsontree = $jsontree . '"user_id":"'.$userinfo->id.'",';
                $jsontree = $jsontree . '"date":"'.$header->displaydate.'"';
    

                $siblings++;
    
                $jsontree .= getchildren($header, $threads);
    
                
            }
    
            
            
        }
    
        if ($siblings > 0)
        {
         $jsontree = $jsontree . "}]";
        }
    
        
        
        return $jsontree;
        
    
    }

    

/*
    function generateJsonFromNews($journal)
    {
        global $CFG;
        $localconfig = get_config('newsmod');
        $nntp = imap_open("{". $localconfig->newsgroupserver . "/nntp}".$journal->newsgroup, $localconfig->newsgroupusername, $localconfig->newsgrouppassword)
        or die("kann nicht verbinden: " . imap_last_error());
        $cacheddata = loadCachedData($journal);
        //$header = imap_headers($nntp);
        $mc = imap_check($nntp);
        $threads = imap_thread($nntp, SE_UID);
        //print_r($threads);
        //$headers = imap_headers($nntp);
        //$header = imap_fetch_overview($nntp,"1:100");
        if ($mc == false) {
            echo "Abruf fehlgeschlagen<br />\n";
        } else {
        };

        $jsontree = '{"name":"'. $journal->newsgroup. '/Aktivitätslog", "moodleurl":"'. new moodle_url("/") .'","children":[{';
        $treend =0;
        $last = "";
        foreach ($threads as $key => $val) {
            $tree = explode('.', $key);
            if ($tree[1] == 'num') {
                //echo $last;
                if ($last == 'branch') {
                    $jsontree = $jsontree . "},{";
                }
                $tempheader="";

                if ($cacheddata) {
                    $key = array_search($val, array_column($cacheddata, 'uid'));
                } else {
                    $key ="";
                }

                if ($key!= "") {
                    $tempheader=$cacheddata[$key];
                    $tempheader->sender[0]= new \stdClass();
                    $tempheader->sender=imap_rfc822_parse_adrlist($cacheddata[$key]->from, '');
                    //$tempheader->subject=stripslashes(imap_utf8($tempheader->subject));
                    $tempheader->subject=addcslashes(imap_utf8($tempheader->subject), "\"");
                //print_r($tempheader->subject);
                //$tempheader->subject ='Nachrichtenknoten gelöscht';
                } else {
                    $tempheader=headersubject($nntp, $val);
                    if (@$tempheader->subject) {
                        $tempheader->subject=imap_utf8($tempheader->subject);
                    }
                }
                if (!is_object($tempheader)) {
                    $tempheader= new \stdClass();
                    $tempheader->subject ='Nachrichtenknoten gelöscht';
                    $tempheader->sender[0] = new \stdClass();
                    $tempheader->sender[0]->mailbox= 'nicht vorhanden';
                    $tempheader->sender[0]->host= 'nicht vorhanden';
                    $tempheader->date= 'Mon, 1 Jan 2019 11:28:23';
                }
                $statusread = @loadMessageStatus($val);
                $userinfo = @getUserIdByEmail($tempheader->sender[0]->mailbox."@".$tempheader->sender[0]->host);
                //print_r(getUserIdByEmail($tempheader->sender[0]->mailbox."@".$tempheader->sender[0]->host));
                //$jsontree = $jsontree . '"name":"'. $tempheader->subject .'",';
                $jsontree = $jsontree . '"name":"'.addcslashes(str_replace('\\', '', $tempheader->subject), "\"").'",';
                $jsontree = $jsontree . '"messageid":"'.$val.'",';
                $jsontree = $jsontree . '"personal":"'.$tempheader->sender[0]->personal.'",';
                $escaped_hostdata = addcslashes(str_replace('\\', '', $tempheader->sender[0]->host), "\"");
                $escaped_mailboxdata = addcslashes(str_replace('\\', '', $tempheader->sender[0]->mailbox), "\"");

                $jsontree = $jsontree . '"sender":"'.$escaped_mailboxdata."@".$escaped_hostdata.'",';
                $jsontree = $jsontree . '"messagestatus":"'. $statusread->readstatus .'",';
                $jsontree = $jsontree . '"markedstatus":"'. $statusread->marked .'",';
                $jsontree = $jsontree . '"picturestatus":"'. $userinfo->picture .'",';
                $jsontree = $jsontree . '"user_id":"'.$userinfo->id.'",';
                $jsontree = $jsontree . '"date":"'.$tempheader->date.'"';
                if ($threads[$tree[0] . ".next"]!=0) 
                {
                    $jsontree = $jsontree . ',"children": [{'  ;
                    $treend= '1';
                } 
                else 
                {
                    //$jsontree = $jsontree . '}]';
                }
            } 
            elseif ($tree[1] == 'branch') 
            {
                if ($last=='branch') 
                {
                    $jsontree = $jsontree . "}]";
                } 
                else 
                {
                    $treend ='0';
                }
            }
            $last = $tree[1];
        }
        $jsontree = $jsontree . "}]}";
        //debug2c($jsontree);
        return $jsontree;
    }
*/


    function headersubject($nntp, $val)
    {
        if ($val==0) {
            return;
        }

        $header = imap_headerinfo($nntp, imap_msgno($nntp, $val));
        //$tempheader = stripslashes($header->subject);
        //print_r("test");
        //addcslashes(imap_utf8($header->subject),'\"');

        //$tempheaderdecoded =imap_mime_header_decode($header->subject);

        //$tempheader="";
        //foreach ($tempheaderdecoded as $key=>$val){
        // $tempheader = $tempheader . $val->text;
        //}

        //$header->tempheader = "";
        //print_r($header->tempheader);

        return $header;
    }

    function markMessageRead($msgnr)
    {
        global $DB,$USER,$id;
        if ($messageid = $DB->record_exists('newsmod__messagestatus', array('userid' => $USER->id, 'messageid' => $msgnr))) {
        } else {
            $moduleinstanl = new stdClass();
            //$moduleinstanl->id = "3";
            $moduleinstanl->userid     = $USER->id;
            $moduleinstanl->messageid  = $msgnr;
            $moduleinstanl->courseid   = $id;
            $moduleinstanl->readstatus = true;
            $moduleinstanl->marked     = false;
            $DB->insert_record('newsmod__messagestatus', $moduleinstanl);
        }
    }
    function loadMessageStatus($msgnr)
    {
        global $DB,$USER;
        if ($messageid = $DB->record_exists('newsmod__messagestatus', array('userid' => $USER->id, 'messageid' => $msgnr))) {
            $moduleinstan = new stdClass();
            $moduleinstan = $DB->get_record('newsmod__messagestatus', array('userid' => $USER->id, 'messageid' => $msgnr), '*', IGNORE_MISSING);
            if (!$moduleinstan->readstatus) {
                $moduleinstan->readstatus=false;
            }
            if (!$moduleinstan->marked) {
                $moduleinsta->marked=false;
            }
        } else {
            $moduleinstan = new stdClass();
            $moduleinstan->readstatus = "0";
            $moduleinstan->marked = "0";
        }
        return  $moduleinstan;
    }

    function loadCachedData($journal)
    {
        global $CFG;
        //file_put_contents($CFG->dataroot."/cache/".$journal->newsgroup.".txt", serialize($result));
        //try {
        if (!$string_data = @file_get_contents($CFG->dataroot."/cache/".$journal->newsgroup.".txt")) {
            buildCache($journal);
        } else {
            $result = unserialize($string_data);
            return $result;
        }
        return;
    }

    function msgSearch($nntp, $param)
    {
        $some   = imap_search($nntp, 'TEXT "'. $param . '"', SE_UID);
        return $some;
    }
