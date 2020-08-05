<?php

error_reporting(E_ALL);

require_once("../../../config.php");
//require_once('./conn_lib.php');
//require_once('./edit_form.php');

require_once($CFG->dirroot . '/mod/newsmod/php/nntp/socketcon.php');


$id = required_param('id', PARAM_INT);
$msgnr = required_param('msgnr', PARAM_RAW);
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


compose_mail($form, $msgnr);



function generate_msgid($identity) {
    
        return '<'.md5($identity).'$1@'.$msgid_fqdn.'>';
        
  }



function compose_mail($form, $msgnr)
{
    global $localconfig,$journal,$USER;

    $subject = $form->subject;
    $from = $USER->email;
    $newsgroups = $journal->newsgroup;

    $ref = $form->references;

    $uid = $form->uid;

    if (is_array($ref))
    {
      $ref = explode(" ",$ref);
    }

    $body = addslashes($form->userInput);

    $from = $USER->firstname." ".$USER->lastname." <".$from.">";  

    flush();
    $ns = nntp_open($localconfig->newsgroupserver, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);

  if ($ns != false) {
    fputs($ns,"POST\r\n");
    $weg=line_read($ns);
    if (substr($weg,0,3) != "440") {
      fputs($ns,'Subject: '.quoted_printable_encode($subject)."\r\n");
      fputs($ns,'From: '.$from."\r\n");
      fputs($ns,'Newsgroups: '.$newsgroups."\r\n");
      fputs($ns,"Mime-Version: 1.0\r\n");
      fputs($ns,"Content-Type: text/plain; charset=UTF-8; format=flowed\r\n");
      fputs($ns,"Content-Transfer-Encoding: 8bit\r\n");
      fputs($ns,"User-Agent: NewsgroupReader\r\n");

      //if ($send_poster_host)
        //@fputs($ns,'X-HTTP-Posting-Host: '.gethostbyaddr(getenv("REMOTE_ADDR"))."\r\n");

        /*
      if (($ref!=false) && (count($ref)>0)) {
        // strip references
        if(strlen(implode(" ",$ref))>900) {
          $ref_first=array_shift($ref);
          do {
            $ref=array_slice($ref,1);
          } while(strlen(implode(" ",$ref))>800);
          array_unshift($ref,$ref_first);
        }
      } 
      */
        if ($msgnr!="new") {
          //	echo "wo kommt das hin" . isset($msgnr);
          fputs($ns,'References: '.$uid."\r\n");
      }
        //fputs($ns,'References: '.implode(" ",$ref)."\r\n");
      
      if (isset($organization))
        fputs($ns,'Organization: '.quoted_printable_encode($organization)."\r\n");

        /*
      if ((isset($file_footer)) && ($file_footer!="")) {
        $footerfile=fopen($file_footer,"r");
        $body.="\n".fread($footerfile,filesize($file_footer));
        fclose($footerfile);
      }
      */
      /*
      if($msgid=generate_msgid(
                  $subject.",".$from.",".$newsgroups.",".$ref.",".$body))
        fputs($ns,'Message-ID: '.$msgid."\r\n");
        */

        /*
      $body=str_replace("\n.\r","\n..\r",$body);
      $body=str_replace("\r",'',$body);
      $b=preg_split("\n",$body);
      $body="";
      for ($i=0; $i<count($b); $i++) {
        if ((strpos(substr($b[$i],0,strpos($b[$i]," ")),">") != false) | (strcmp(substr($b[$i],0,1),">") == 0)) {
          $body .= textwrap(stripSlashes($b[$i]),78," \r\n")."\r\n";
        } else {
          $body .= textwrap(stripSlashes($b[$i]),74," \r\n")."\r\n";
        }
      }
      */
      fputs($ns,"\r\n".$body."\r\n.\r\n");
      //fputs($ns,"\r\nits me\r\n.\r\n");

      $message=line_read($ns);
      //nntp_close($ns);
      echo ($subject);
    } else {
      echo 'fail';
    }
  } else {
    echo 'fail';
    
  }
}

/*

function acompose_mail()
{
    global $form, $msgnr,$localconfig,$journal,$USER;

    

    $username = "AUTHINFO USER ". $localconfig->newsgroupusername ."\n";
    $eemail = explode("@", $USER->email);
    $from = imap_rfc822_write_address($eemail[0], $eemail[1], $USER->firstname ." ".$USER->lastname);
    $headers['from'] = $from;
    $headers['subject'] = $form->subject;
    $headers['custom_headers'][] = 'Newsgroups: ' . $journal->newsgroup;
    if ($msgnr!="new") {
        //	echo "wo kommt das hin" . isset($msgnr);
        $headers['custom_headers'][] = 'References: ' . $msgnr;
    }
    $body[0]['type'] = TYPETEXT;
    $body[0]['charset'] = 'UTF-8';
    $body[0]['subtype'] = 'plain';
    $body[0]['contents.data'] = $form->userInput;
    $post = imap_mail_compose($headers, $body);
    $server = $localconfig->newsgroupserver;
    $port = 119;
    $sh = fsockopen($server, $port) or die("Can't connect to $server.");
    //echo $sh;
    print_r($post);
    //fwrite($sh, "STARTTLS\n");
    if (fwrite($sh, $username)!=strlen($username)) {
        fclose($sh);
        return(null);
    }
    $st=fgets($sh, 512);
    if (substr($st, 0, 3)!="+OK") {
        //print_r($st);
        //fclose($sh);
        //return(NULL);
    } else {
        print_r($st);
    }
    $st="AUTHINFO PASS ".$localconfig->newsgrouppassword ."\n";
    if (fwrite($sh, $st)!=strlen($st)) {
        fclose($sh);
        return(null);
    }
    $st=fgets($sh, 512);
    if (substr($st, 0, 3)!="+OK") {
//        print_r($st);
//        fclose($sh);
//        return(NULL);
    } else {
        print_r($st);
    }
    fputs($sh, "POST\r\n");
    fputs($sh, $post);
    fputs($sh, ".\r\n");
    fclose($sh);
}


*/






function textwrap($text, $wrap=80, $break="\n",$maxlen=false){
    $len = strlen($text);
    if ($len > $wrap) {
      $h = '';        // massaged text
      $lastWhite = 0; // position of last whitespace char
      $lastChar = 0;  // position of last char
      $lastBreak = 0; // position of last break
      // while there is text to process
      while ($lastChar < $len && (($maxlen==false) || (strlen($h)<$maxlen))) {
        $char = substr($text, $lastChar, 1); // get the next character
        // if we are beyond the wrap boundry and there is a place to break
        if (($lastChar - $lastBreak > $wrap) && ($lastWhite > $lastBreak)) {
          $h .= substr($text, $lastBreak, ($lastWhite - $lastBreak)) . $break;
          $lastChar = $lastWhite + 1;
          $lastBreak = $lastChar;
        }
        // You may wish to include other characters as valid whitespace...
        if ($char == ' ' || $char == chr(13) || $char == chr(10)) {
          $lastWhite = $lastChar; // note the position of the last whitespace
        }
        $lastChar = $lastChar + 1; // advance the last character position by one
      }
      $h .= substr($text, $lastBreak); // build line
    } else {
      $h = $text; // in this case everything can fit on one line
    }
    return $h;
  }



//if (!$user = $DB->get_record('user', ['email' => $sender])) {
    //echo "User Information not found";
//    $user = new \stdClass();
//    $user->id = "1";
//    $user->firstname = $sender;
//    $user->lastname = "";
//}
