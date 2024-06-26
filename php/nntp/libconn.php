<?php
defined('MOODLE_INTERNAL')|| die;

//error_reporting(E_ALL);

require_once($CFG->dirroot . '/mod/usenet/php/nntp/socketcon.php');

    function summary($journal, $timetosearch)
    {
        global $CFG, $DB;
        $localconfig = get_config('usenet');
        
        $nntp = nntp_open($localconfig->newsgroupserver, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);
        $result = nntp_headers_all($nntp, $journal->newsgroup);
        file_put_contents($CFG->dataroot."/cache/".$journal->newsgroup.".txt", serialize($result));

        /*
        $email = imap_search($nntp, 'SINCE "'.Date("d M Y", $timetosearch).'"', SE_UID);
        $tmp =@imap_fetch_overview($nntp, implode(',', $email), FT_UID);
        return($tmp);
        */
        return $result;
    }
/* 
    function buildCache($journal)
    {
        global $CFG;
        $localconfig = get_config('usenet');
        $nntp = nntp_open($localconfig->newsgroupserver, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);
        $result = nntp_headers_all($nntp, $journal->newsgroup);
        file_put_contents($CFG->dataroot."/cache/".$journal->newsgroup.".txt", serialize($result));
    } */

    function sendemail($email, $content)
    {
        global $USER;
        $message = new \core\message\message();
        $message->component = 'mod_usenet'; // Name of your local plugin.
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
    

    // builds up a JSON object representing message threads:
    //  threadopener
    //      Re: answer1
    //      Re: answer2
    //          Re: answer to answer2
    //  another threadopener
    //      Re: etc..
    //
    // this function is a recursion head
    // recursion body: function getchildren(...)
    function generateJsonFromNews($journal)
    {
        global $CFG;
        $localconfig = get_config('usenet');
        $nntp = nntp_open($localconfig->newsgroupserver, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);
        
        if (is_array($nntp) && array_key_exists('is_error', $nntp)) {    //error detected, theres error_feedback data structure here!
            return json_encode($nntp);
        }

        //$cacheddata = loadCachedData($journal);

        
        $threads = thread_load_newsserver($nntp, $journal->newsgroup);
        
        if (is_array($threads) && array_key_exists('is_error', $threads)) {    //error detected, theres error_feedback data structure here!
            return json_encode($threads);
        }

        $jsontree = '{"name":"'. $journal->newsgroup. '/Aktivitätslog", "moodleurl":"'. new moodle_url("/") .'","children":[{';
        $treend =0;
        $last = "";
        $siblings = 0;
       
        /**
         * This foreach-loop checks the threads for orphaned posts 
         */
        foreach ($threads as $header) {
        
            if (isset($header->references))    // Is this post a child post ?
            {
                    if (!isset($threads[$header->references[0]]))  // Is the father post NOT in the array ?
                    {
                        if (count($header->references) == 1) {   // Is this child post a direct descendant of father post ?
                        $header->isReply = false;                   // Change child post to father post by setting the flags
                        unset($header->references);                 // Problem: a father post may have many direct descendants
                        }                                           // so the structure of a thread may become unorganized and confusing
                    }                                               
            }
        }

    
    foreach ($threads as $header) {
        
      if (!$header->isReply && !isset($header->references))
            {
              if ($siblings > 0)
            {
                $jsontree .= "},{";
            }

            // cache operations below - disabled for now
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

            
            $header->subject = addcslashes($header->subject, "\"");
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

    
    // recursion body
    function getchildren($headeri, $threads)
    {
        $siblings = 0;
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


                $header->subject = addcslashes($header->subject, "\"");
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

    //used in conjunction with cache functions
    function headersubject($nntp, $groupname, $val)
    {
        if ($val==0) {
            return;
        }

        //$header = nntp_header($nntp, $groupname, $val);



        return $header;
    }

    function markMessageRead($msgnr)
    {
        global $DB,$USER,$id;
        if ($messageid = $DB->record_exists('usenet__messagestatus', array('userid' => $USER->id, 'messageid' => $msgnr))) {
        } else {
            $moduleinstanl = new stdClass();
            //$moduleinstanl->id = "3";
            $moduleinstanl->userid     = $USER->id;
            $moduleinstanl->messageid  = $msgnr;
            $moduleinstanl->courseid   = $id;
            $moduleinstanl->readstatus = true;
            $moduleinstanl->marked     = false;
            $DB->insert_record('usenet__messagestatus', $moduleinstanl);
        }
    }
   /*  function loadMessageStatus($msgnr)
    {
        global $DB,$USER;
        if ($messageid = $DB->record_exists('usenet__messagestatus', array('userid' => $USER->id, 'messageid' => $msgnr))) {
            $moduleinstan = new stdClass();
            $moduleinstan = $DB->get_record('usenet__messagestatus', array('userid' => $USER->id, 'messageid' => $msgnr), '*', IGNORE_MISSING);
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

    function getUserIdByEmail($sender)
    {
        global $DB,$CFG;
        if (!$user = $DB->get_record('user', ['email' => $sender])) {
            //echo "User Information not found";
            $user = new \stdClass();
            $user->id = "-99";
            $user->firstname = $sender;
            $user->lastname = "";
            $user->picture = 0;
        }
        return $user;
    } */

  /*   function loadCachedData($journal)
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
    } */

    
    function msgSearch($journal, $param)
    {
        global $CFG;
        $localconfig = get_config('usenet');
        $nntp = nntp_open($localconfig->newsgroupserver, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);
        
        return nntp_search($nntp, $journal->newsgroup, $param);
    }
