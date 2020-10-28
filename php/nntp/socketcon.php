<?php

/*
        ///useful ressources/guides:
        ///nntp:        https://tools.ietf.org/html/rfc3977
        ///php sockets: https://www.php.net/manual/en/function.socket-recv.php
*/

//error_reporting(E_ALL);

function error_catalogue($err_num) {

    switch ($err_num) {

        case 400:
            $errorinfo = [
                0 => 'Service temporarily unavailable',
                1 => -400,
                2 => 'Wir können uns nicht mit dem Newsgroup-Server verbinden (Code 400). Versuche die Seite neu zu laden oder probiere es später noch einmal.'
            ];
        break;

        case 411:
            $errorinfo = [
                0 => 'No such newsgroup',
                1 => -411,
                2 => 'Die ausgewählte Newsgroup existiert leider nicht (Code 411).'            
            ];
        break;

        case 412:
            $errorinfo = [
                0 => 'No newsgroup selected',
                1 => -412,
                2 => 'Es wurde keine Newsgroup angegeben (Code 412).'
            ];
        break;

        case 420:
            $errorinfo = [
                0 => 'No article with that number',
                1 => -420,
                2 => 'Es existiert kein Beitrag mit der gegebenen ID-Nummer (Code 420).'            
            ];
        break;

        case 423:
            $errorinfo = [
                0 => 'No article(s) with that number',
                1 => -423,
                2 => 'Es existieren keine Beiträge mit der gegebenen ID-Nummer (Code 423).'            
            ];
        break;

        case 430:
            $errorinfo = [
                0 => 'No article with that message-id',
                1 => -430,
                2 => 'Es konnte keine Nachricht mit dieser Nummer gefunden werden (Code 430)'            
            ];
        break;

        case 440:
            $errorinfo = [
                0 => 'Posting not permitted',
                1 => -440,
                2 => 'Es ist Ihnen nicht gestattet, Nachrichten zu versenden (Code 440).'            
            ];
        break;

        case 441:
            $errorinfo = [
                0 => 'Posting failed',
                1 => -441,
                2 => 'Das Versenden der Nachricht ist leider fehlgeschlagen (441)'            
            ];
        break;

        case 481:
            $errorinfo = [
                0 => 'Username/Password not recognized',
                1 => -481,
                2 => 'Upps. Wir haben Probleme die Nachrichten in dieser Newsgroup abzurufen (Code 481). Kannst du bitte einen Kursbetreuenden per E-Mail informieren.'            
            ];
        break;

        case 501:
            $errorinfo = [
                0 => 'Unknown command',
                1 => -501,
                2 => 'Upps, der Newsgroup-Server konnte uns leider nicht weiterhelfen (Code 501).'            
            ];
        break;

        case 502:
            $errorinfo = [
                0 => 'Service permamently unavailable',
                1 => -502,
                2 => 'Es gibt ein Problem mit dem Newsgroup-Server (Code 502). Bitte probiere es später noch einmal.'                            
            ];
        break;

        case 600:
            $errorinfo = [
                0 => 'No results found',
                1 => -600,
                2 => 'Für den Suchbergiff konnten keine Beiträge gefunden werden.'            
            ];
        break;

        case 601:
            $errorinfo = [
                0 => 'No posts in newsgroup',
                1 => -601,
                2 => 'In dieser Newsgroup hat noch niemand eine Nachricht geschrieben.'            
            ];
        break;

        default:
            $errorinfo = [
                0 => 'Unknown command',
                1 => -501,
                2 => 'Upps, der Newsgroup-Server konnte uns leider nicht weiterhelfen (Code 501).'                            
            ];
        break;
    }
    return $errorinfo;
}

function debug2c($data)
{
    $output = $data;
    if (is_array($output)) {
        $output = implode(',', $output);
    }

    echo "<script>console.log('Debug Objects: " . $output . "' );</script>";
}


function line_read(&$socket)
{
    if ($socket != false) {
        $t=str_replace("\n", "", str_replace("\r", "", fgets($socket, 1200)));
        return $t;
    }
}


function line_read_nl(&$socket)
{
    if ($socket != false) {
        $t=str_replace("\r", "", fgets($socket, 1200));
        return $t;
    }
}

//line read unformated
function line_read_uf(&$socket)
{
    if ($socket != false) {
        $t= fgets($socket, 1200);
        return $t;
    }
}




//empty the tcp buffer
function flush_buf($socket)
{
    $lines_deleted = 0;
    $limiter = 100;
    $i = 0;
    if ($socket) {
        while (fgets($socket, 1200) !== false || $i < $limiter) {
            $lines_deleted++;
        }

        if ($i == $limiter -1) {
            return -1;
        }
    }
    return $lines_deleted;
}

function thread_overview_read(&$socket)
{
    $overviewfmt=array();
    fputs($socket, "LIST overview.fmt\r\n");  // find out the format of the
    $tmp=line_read($socket);                 // xover-command
    if (substr($tmp, 0, 3)=="215") {
        $line=line_read($socket);
        while (strcmp($line, ".") != 0) {
            // workaround for braindead CLNews newsserver
            if ($line=="Author:") {
                $overviewfmt[]="From:";
            } else {
                $overviewfmt[]=$line;
            }
            $line=line_read($socket);
        }
    } else {
        // some stupid newsservers, like changi, don't send their overview
        // format
        // let's hope, that the format is like that from INN
        $overviewfmt=array("Subject:","From:","Date:","Message-ID:",
                            "References:","Bytes:");
    }
    $overviewformat=implode("\t", $overviewfmt);
    return $overviewformat;
}

function splitSubject(&$subject)
{
    //todo preg_replace
    //$s=preg_replace('^(odp:|aw:|re:|re\[2\]:| )+','',$subject);
    $s=preg_replace('/^(odp:|aw:|re:|re\[2\]:| )+/i', '', $subject);
    $return=($s != $subject);
    $subject=$s;
    return $return;
}

  function getTimestamp($value)
  {
      $timezone = +1 ;
      $months=array("Jan"=>1,"Feb"=>2,"Mar"=>3,"Apr"=>4,"May"=>5,"Jun"=>6,"Jul"=>7,"Aug"=>8,"Sep"=>9,"Oct"=>10,"Nov"=>11,"Dec"=>12);
      $value=str_replace("  ", " ", $value);
      $d=explode(" ", $value, 6);
      if (strcmp(substr($d[0], strlen($d[0])-1, 1), ",") == 0) {
          $date[0]=$d[1];  // day
      $date[1]=$d[2];  // month
      $date[2]=$d[3];  // year
      $date[3]=$d[4];  // hours:minutes:seconds
      $gmt=$d[5];      // timezone
      } else {
          $date[0]=$d[0];  // day
      $date[1]=$d[1];  // month
      $date[2]=$d[2];  // year
      $date[3]=$d[3];  // hours:minutes:seconds
      $gmt=$d[4];      // timezone
      }
      $time=explode(":", $date[3]);
      // timezone handling
      $msgtimezone=0;
      if ($gmt[0]=='-') {
          $msgtimezone=-substr($gmt, 1, 2);
          $msgminzone=-substr($gmt, 3, 2);
      } elseif ($gmt[0]=='+') {
          $msgtimezone=+substr($gmt, 1, 2);
          $msgminzone=+substr($gmt, 3, 2);
      }
      $time[0]=$time[0]-$msgtimezone+$timezone;
      $time[1]=$time[1]-$msgminzone+$timezone; // removed $minzone which was not defined
      $timestamp=mktime($time[0], $time[1], $time[2], $months[$date[1]], $date[0], $date[2]);
      return $timestamp;
  }

function thread_overview_interpret($line, $overviewformat, $groupname)
{
    $return="";
    
    $overviewfmt=explode("\t", $overviewformat);
    //echo " ";                // keep the connection to the webbrowser alive
    flush();                 // while generating the message-tree
  //  $over=split("\t",$line,count($overviewfmt)-1);
    $over=explode("\t", $line);
    //$article=new headerType;
    $article = new \stdClass;
    for ($i=0; $i<count($overviewfmt)-1; $i++) {
        if ($overviewfmt[$i]=="Subject:") {
            //todo preg_replace
          
            //$subject=preg_replace('/\[doctalk\]/i','',headerDecode($over[$i+1]));
            //$article->isReply=splitSubject($subject);
                $article->isReply=splitSubject($over[$i+1]);
                $article->subject=headerdecode($over[$i+1]);
            //$article->subject=$subject;
        }
        if ($overviewfmt[$i]=="Date:") {
            $article->displaydate = $over[$i+1];
            $article->date=getTimestamp($over[$i+1]);
        }
        if ($overviewfmt[$i]=="From:") {
            $fromline=address_decode(headerDecode($over[$i+1]), "nirgendwo");
            $article->from=$fromline[0]["mailbox"]."@".$fromline[0]["host"];
            $article->username=$fromline[0]["mailbox"];
            if (!isset($fromline[0]["personal"])) {
                $article->name=$fromline[0]["mailbox"];
                if (strpos($article->name, '%')) {
                    $article->name=substr($article->name, 0, strpos($article->name, '%'));
                }
                $article->name=strtr($article->name, '_', ' ');
            } else {
                $article->name=$fromline[0]["personal"];
            }
        }
        if ($overviewfmt[$i]=="Message-ID:") {
            $article->id=$over[$i+1];
        }
        if (($overviewfmt[$i]=="References:") && ($over[$i+1] != "")) {
            $article->references=explode(" ", $over[$i+1]);
        }
    }
    $article->number=$over[0];
    $article->threadsize = 0;
    $article->isAnswer=false;
    return($article);
}


  function address_decode($adrstring, $defaulthost)
  {
      $parsestring=trim($adrstring);
      $len=strlen($parsestring);
      $at_pos=strpos($parsestring, '@');     // find @
    $ka_pos=strpos($parsestring, "(");     // find (
    $kz_pos=strpos($parsestring, ')');     // find )
    $ha_pos=strpos($parsestring, '<');     // find <
    $hz_pos=strpos($parsestring, '>');     // find >
    $space_pos=strpos($parsestring, ')');  // find ' '
    $email="";
      $mailbox="";
      $host="";
      $personal="";
      if ($space_pos != false) {
          if (($ka_pos != false) && ($kz_pos != false)) {
              $personal=substr($parsestring, $ka_pos+1, $kz_pos-$ka_pos-1);
              $email=trim(substr($parsestring, 0, $ka_pos-1));
          }
      } else {
          $email=$adrstring;
      }
      if (($ha_pos != false) && ($hz_pos != false)) {
          $email=trim(substr($parsestring, $ha_pos+1, $hz_pos-$ha_pos-1));
          $personal=substr($parsestring, 0, $ha_pos-1);
      }
      if ($at_pos != false) {
          $mailbox=substr($email, 0, strpos($email, '@'));
          $host=substr($email, strpos($email, '@')+1);
      } else {
          $mailbox=$email;
          $host=$defaulthost;
      }
      $personal=trim($personal);
      if (substr($personal, 0, 1) == '"') {
          $personal=substr($personal, 1);
      }
      if (substr($personal, strlen($personal)-1, 1) == '"') {
          $personal=substr($personal, 0, strlen($personal)-1);
      }
      $result["mailbox"]=trim($mailbox);
      $result["host"]=trim($host);
      if ($personal!="") {
          $result["personal"]=$personal;
      }
      $complete[]=$result;
      return ($complete);
  }

  function headerDecode($value)
  {
      if (preg_match('/=\?.*\?.\?.*\?=/i', $value)) { // is there anything encoded?
      if (preg_match('/=\?.*\?Q\?.*\?=/i', $value)) {  // quoted-printable decoding
  
        $charset=preg_replace('/(.*)=\?(.*)\?Q\?(.*)\?=(.*)/i', '\2', $value);
          $result1=preg_replace('/(.*)=\?.*\?Q\?(.*)\?=(.*)/i', '\1', $value);
          $result2=preg_replace('/(.*)=\?.*\?Q\?(.*)\?=(.*)/i', '\2', $value);
          $result3=preg_replace('/(.*)=\?.*\?Q\?(.*)\?=(.*)/i', '\3', $value);
          $result2=str_replace("_", " ", quoted_printable_decode($result2));
          $newvalue=$result1.recode_charset($result2, $charset).$result3;
      }
          if (preg_match('/=\?.*\?B\?.*\?=/i', $value)) {  // base64 decoding
              $result1=preg_replace('/(.*)=\?.*\?B\?(.*)\?=(.*)/i', '\1', $value);
              $result2=preg_replace('/(.*)=\?.*\?B\?(.*)\?=(.*)/i', '\2', $value);
              $result3=preg_replace('/(.*)=\?.*\?B\?(.*)\?=(.*)/i', '\3', $value);
              $result2=base64_decode($result2);
              $newvalue=$result1.$result2.$result3;
          }
          if (!isset($newvalue)) { // nothing of the above, must be an unknown encoding...
              $newvalue=$value;
          } else {
              $newvalue=headerDecode($newvalue);
          }  // maybe there are more encoded
      return($newvalue);                    // parts
      } else {   // there wasn't anything encoded, return the original string
      return($value);
      }
  }

  function recode_charset($text, $source=false, $dest=false)
  {
      // website charset, "koi8-r" for example
      $www_charset = "utf-8";
      // Use the iconv extension for improved charset conversions
      $iconv_enable=true;
      if ($dest==false) {
          $dest=$www_charset;
      }
      if (($iconv_enable) && ($source!=false)) {
          $return=iconv(
              $source,
              $dest."//TRANSLIT",
              $text
          );
          if ($return!="") {
              return $return;
          } else {
              return $text;
          }
      } else {
          return $text;
      }
  }

  function thread_mycompare($a, $b)
  {
      $thread_sort_order=-1;
      $thread_sort_type="thread";
      if ($thread_sort_type!="thread") {
          $r=($a->date<$b->date) ? -1 : 1;
          if ($a->date==$b->date) {
              $r=0;
          }
      } else {
          $r=($a->date_thread<$b->date_thread) ? -1 : 1;
          if ($a->date_thread==$b->date_thread) {
              $r=0;
          }
      }
      return $r*$thread_sort_order;
  }


  function thread_load_newsserver(&$ns, $groupname)
  {
      $overviewformat=thread_overview_read($ns);
      fputs($ns, "GROUP $groupname\r\n");   // select a group
      $groupinfo=explode(" ", line_read($ns));
      if (substr($groupinfo[0], 0, 1) != 2) {
          //echo "<p>".$text_error["error:"]."</p>";
          //echo "<p>".$text_thread["no_such_group"]."</p>";
          return error_handler(substr($groupinfo[0], 0, 3));
      } else {
          $firstarticle=$groupinfo[2];
          $lastarticle=$groupinfo[3];

          // order the article overviews from the newsserver
          fputs($ns, "XOVER ".$firstarticle."-".$lastarticle."\r\n");
          $tmp=line_read($ns);
          // have the server accepted our order?
          if (substr($tmp, 0, 3) == "224") {
              $line=line_read($ns);
              // read overview by overview until the data ends
              while ($line != ".") {
                  // parse the output of the server...
                  $article=thread_overview_interpret($line, $overviewformat, $groupname);
                  // ... and save it in our data structure
                  $article->threadsize++;
                  $article->date_thread=$article->date;
                  $headers[$article->id]=$article;
                  // if we are in poll-mode: print status information and
                  // decode the article itself, so it can be saved in the article
                  // cache
            
                  // read the next line from the newsserver
                  $line=line_read($ns);
              }
          } else {
              return error_handler(substr($tmp, 0, 3));
          }
          // make function of code below
          if ((isset($headers)) && (count($headers)>0)) {
              foreach ($headers as $c) {
                  if (($c->isAnswer == false) &&
               (isset($c->references))) {   // is the article an answer to an
                      // other article?
                      // try to find a matching article to one of the references
                      $refmatch=false;
                      foreach ($c->references as $reference) {
                          if (isset($headers[$reference])) {
                              $refmatch=$reference;
                          } else {
                              //load missing header, restart procedure
                          }
                      }
                      // have we found an article, to which this article is an answer?
                      if ($refmatch!=false) {
                          $c->isAnswer=true;
                          $c->bestreference=$refmatch;
                          $headers[$c->id]=$c;
                          // the referenced article get the ID af this article as in
                          // its answers-array
                          $headers[$refmatch]->answers[]=$c->id;
                          // propagate down the number of articles in this thread
                          $d =& $headers[$c->bestreference];
                          do {
                              $d->threadsize+=$c->threadsize;
                              $d->date_thread=max($c->date, $d->date_thread);
                          } while ((isset($d->bestreference)) && ($headers[$d->bestreference]) && ($d =& $headers[$d->bestreference]));
                      }
                  }
              }
              reset($headers);
              // sort the articles
              $thread_sort_order=-1;
              if (($thread_sort_order != 0) && (count($headers)>0)) {
                  uasort($headers, 'thread_mycompare');
              }
          }
          if (isset($headers)) {
              return $headers;
          } else {
              return error_handler(601);
          }
        
      
          //return((isset($headers)) ? $headers : false);
      }
  }

function nntp_open($host, $user, $pass, $port = 119)
{
    $ipaddress = gethostbyname($host);

    $user_msg = "AUTHINFO USER ".$user."\r\n"; // fill in your ldap name here
    $pass_msg = "AUTHINFO PASS ".$pass."\r\n"; // enter your password here


    $sock = @fsockopen($ipaddress, $port);

    $tmp = line_read($sock);

    if (substr($tmp, 0, 1) == "2") {
        fputs($sock, $user_msg);
        fputs($sock, $pass_msg);
    } else {
        return error_handler(substr($tmp, 0, 3));
    }

    line_read($sock);
    $tmp = line_read($sock);

    if (substr($tmp, 0, 3) == "281") {
        return $sock;
    } else {
        return error_handler(substr($tmp, 0, 3));
    }
}

function getgroupinfo($journal)
{
    $localconfig = get_config('usenet');
    $groupname = $journal->newsgroup;
    $nntp = nntp_open($localconfig->newsgroupserver, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);


    if (is_array($nntp) && array_key_exists('is_error', $nntp)) {    //error detected, theres error_feedback data structure here!
        return $nntp;
    }

    fputs($nntp, "GROUP $groupname\r\n");   // select a group
    $groupinfo=explode(" ", line_read($nntp));
    if (substr($groupinfo[0], 0, 1) != 2) {     // error: no such group
    return error_handler(substr($groupinfo[0], 0, 3));  // error_handler returns error_feedback "data structure", also used on $nntp check at beginning
    }


    $returnmsg = [
    "quantity"      => $groupinfo[1],
    "firstarticle"  => $groupinfo[2],
    "lastarticle"   => $groupinfo[3],
    "groupname"     => $groupinfo[4]
  ];

    return $returnmsg;
}

function gettree($journal, $start, $end) {

    global $CFG;
    //require_once($CFG->dirroot . '/mod/newsmod/php/nntp/socketcon.php');
    $enable_cache = false;

    $localconfig = get_config('usenet');

    $groupname = $journal->newsgroup;

    if ($enable_cache) {
        $cacheddata = loadCachedData($journal);

        if (is_array($cacheddata) && array_key_exists('is_error', $cacheddata)) {    //error detected, theres error_feedback data structure here!
            return $cacheddata;
        }
    }

    if (isset($cacheddata)) {
        $CacheNumberList = array_column($cacheddata, 'number');
        $CacheNumberListLast = array_slice($CacheNumberList, -1, 1)[0];
        $CacheNumberListFirst = array_slice($CacheNumberList, 0, 1)[0];

        

        if ($CacheNumberListLast < $end) {
            $newadditons = buildCache_partial($journal, $CacheNumberListLast[0] + 1, $end);
            if (is_array($newadditons) && array_key_exists('is_error', $newadditons)) {    //error detected, theres error_feedback data structure here!
                return $newadditons;
            }
            $cacheddata = array_merge($cacheddata, $newadditons);
        }



        if ($CacheNumberListFirst < $start) {       // nothing to be downloaded, just delete old entries in cache
            $key = array_search($start, $CacheNumberList);
            $cacheddata = array_slice($cacheddata, $key);
            setCache($journal, $cacheddata);
        }



        $headers = process_headers($cacheddata);

    } else {        // cache failed, open up connection and download it all
        $socket = nntp_open($localconfig->newsgroupserver, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);
    
        if (is_array($socket) && array_key_exists('is_error', $socket)) {    //error detected, theres error_feedback data structure here!
            return $socket;
        }

        $headers = nntp_headers($socket, $groupname, $start, $end);

        $headers = process_headers($headers);
    }
  

    $siblings = [];
    $tree = [
        "children" => []
    ];

    /**
     * This foreach-loop checks the threads for orphaned posts 
     */
    foreach ($headers as $header) {
    
        if (isset($header->references))    // Is this post a child post ?
        {
                if (!isset($headers[$header->references[0]]))  // Is the father post NOT in the array ?
                {
                    if (count($header->references) == 1) {   // Is this child post a direct descendant of father post ?
                    $header->isReply = false;                   // Change child post to father post by setting the flags
                    unset($header->references);                 // Problem: a father post may have many direct descendants
                    }                                           // so the structure of a thread may become unorganized and confusing
                }                                               
        }
    }

    foreach ($headers as $header) {
        
        if (!$header->isReply && !isset($header->references))
        {
            
            $statusread = @loadMessageStatus($header->number);
            $userinfo = @getUserIdByEmail($header->from);

            $self = [];

            $self["name"] = $header->subject;
            $self["number"] = $header->number;
            $self["messageid"] = $header->id;
            $self["threadhead"] = true;
            $self["personal"] = $header->name;
            $self["sender"] = addcslashes(str_replace('\\', '', $header->from), "\"");
            $self["messagestatus"] = $statusread->readstatus;
            $self["markedstatus"] = $statusread->marked;
            $self["picturestatus"] = $userinfo->picture;
            $self["user_id"] = $userinfo->id;
            $self["date"] = $header->displaydate;
            $self["timestamp"] = $header->date;

            if (isset($header->answers)) {
                $self["children"] = agetchildren($header, $headers);
            }
            
            $siblings[] = $self;

        }
    }
    $tree["children"] = $siblings;
    return $tree;
}

function agetchildren($header, $headers) {

    $siblings = [];

    if (isset($header->answers)) {

        foreach ($header->answers as $childid)
        {

            
            $child = $headers[$childid];

            $self = [];

            $statusread = @loadMessageStatus($child->number);
            $userinfo = @getUserIdByEmail($child->from);


            $self["name"] = $child->subject;
            $self["number"] = $child->number;
            $self["messageid"] = $child->id;
            $self["threadhead"] = false;
            $self["personal"] = $child->name;
            $self["sender"] = addcslashes(str_replace('\\', '', $child->from), "\"");
            $self["messagestatus"] = $statusread->readstatus;
            $self["markedstatus"] = $statusread->marked;
            $self["picturestatus"] = $userinfo->picture;
            $self["user_id"] = $userinfo->id;
            $self["date"] = $child->displaydate;
            $self["timestamp"] = $header->date;


            if (isset($child->answers)) {
                $self["children"] = agetchildren($child, $headers);
            }
            
            $siblings[] = $self;

        }
        return $siblings;
    }
}

function nntp_headers($socket, $groupname, $start, $end) {

    $overviewformat=thread_overview_read($socket);
    fputs($socket, "GROUP $groupname\r\n");   // select a group
    $groupinfo=explode(" ", line_read($socket));

    if (substr($groupinfo[0], 0, 1) != 2) {

        return error_handler(substr($groupinfo[0], 0, 3));

    } else {
        $firstarticle=$start;
        $lastarticle=$end;

        // order the article overviews from the newsserver
        fputs($socket, "XOVER ".$firstarticle."-".$lastarticle."\r\n");
        $tmp=line_read($socket);
        // have the server accepted our order?
        if (substr($tmp, 0, 3) == "224") {
            $line=line_read($socket);
            // read overview by overview until the data ends
            while ($line != ".") {
                
                // parse the output of the server...
                $article=thread_overview_interpret($line, $overviewformat, $groupname);
                // ... and save it in our data structure
                $article->threadsize++;
                $article->date_thread=$article->date;
                $headers[$article->id]=$article;
                // if we are in poll-mode: print status information and
                // decode the article itself, so it can be saved in the article
                // cache
                
                // read the next line from the newsserver
                $line=line_read($socket);
            }
        } else {
            return error_handler(substr($tmp, 0, 3));
        }
        // make function of code below
        
        if (isset($headers)) {
            return $headers;
        } else {
            return error_handler(601);
        }
        //return((isset($headers)) ? $headers : false);
    }
}

function process_headers($headers) {

    if ((isset($headers)) && (count($headers)>0)) {
        foreach ($headers as $c) {
            if (($c->isAnswer == false) &&
         (isset($c->references))) {   // is the article an answer to an
                // other article?
                // try to find a matching article to one of the references
                $refmatch=false;
                foreach ($c->references as $reference) {
                    if (isset($headers[$reference])) {
                        $refmatch=$reference;
                    } else {
                        //load missing header, restart procedure
                    }
                }
                // have we found an article, to which this article is an answer?
                if ($refmatch!=false) {
                    $c->isAnswer=true;
                    $c->bestreference=$refmatch;
                    $headers[$c->id]=$c;
                    // the referenced article get the ID af this article as in
                    // its answers-array
                    $headers[$refmatch]->answers[]=$c->id;
                    // propagate down the number of articles in this thread
                    $d =& $headers[$c->bestreference];
                    do {
                        $d->threadsize+=$c->threadsize;
                        $d->date_thread=max($c->date, $d->date_thread);
                    } while ((isset($d->bestreference)) && ($headers[$d->bestreference]) && ($d =& $headers[$d->bestreference]));
                }
            }
        }
        reset($headers);
        // sort the articles
        $thread_sort_order=-1;
        if (($thread_sort_order != 0) && (count($headers)>0)) {
            uasort($headers, 'thread_mycompare');
        }
    }
    if (isset($headers)) {
        return $headers;
    } else {
        return error_handler(601);
    }
}

function parse_header ($header) {

    $header_arr = explode("\t", $header);
    $from = substr($header_arr[1], 6);
    $newsgroup = substr($header_arr[2], 12);
    $subject = substr($header_arr[3], 9);
    $date = substr($header_arr[4], 6);
    $organ = substr($header_arr[5], 14);
    $msgid = substr($header_arr[6], 12);
    print_r ($from."\n".$newsgroup."\n".$subject."\n".$date."\n".$organ."\n".$msgid);
}


function nntp_header($socket, $groupname, $msgno)
{
    //echo " ";
    $overviewformat=thread_overview_read($socket);
    fputs($socket, "GROUP $groupname\r\n");   // select a group
    $groupinfo=explode(" ", line_read($socket));
    if (substr($groupinfo[0], 0, 1) != 2) {
        //echo "<p>".$text_error["error:"]."</p>";
        //echo "<p>".$text_thread["no_such_group"]."</p>";
        return error_handler(substr($groupinfo[0], 0, 3));
    } else {

        // order the article overviews from the newsserver
        fputs($socket, "XOVER ".$msgno."\r\n");
        $tmp=line_read($socket);
        $checkret = substr($tmp, 0, 3);
        // have the server accepted our order?
        if ($checkret == "224" || $checkret == "221") {
            $line=line_read($socket);
            // read overview by overview until the data ends
          
            // parse the output of the server...
            $article=thread_overview_interpret($line, $overviewformat, $groupname);
            // ... and save it in our data structure
            $article->threadsize++;
            $article->date_thread=$article->date;
            $header=$article;
            
            //$headers[$article->id]=$article;
            // if we are in poll-mode: print status information and
            // decode the article itself, so it can be saved in the article
            // cache
            
            // read the next line from the newsserver
            line_read($socket);
        } else {
            return error_handler(substr($tmp, 0, 3));
        }
    }
    return $header;
}


function nntp_headers_all($socket, $groupname)
{
    $overviewformat=thread_overview_read($socket);
    fputs($socket, "GROUP $groupname\r\n");   // select a group
    $groupinfo=explode(" ", line_read($socket));
    if (substr($groupinfo[0], 0, 1) != 2) {
        //echo "<p>".$text_error["error:"]."</p>";
        //echo "<p>".$text_thread["no_such_group"]."</p>";
        return error_handler(substr($groupinfo[0], 0, 1));
        flush();
    } else {
        $firstarticle=$groupinfo[2];
        $lastarticle=$groupinfo[3];

        // order the article overviews from the newsserver
        fputs($socket, "XOVER ".$firstarticle."-".$lastarticle."\r\n");
        $tmp=line_read($socket);
        // have the server accepted our order?
        if (substr($tmp, 0, 3) == "224") {
            $line=line_read($socket);
            // read overview by overview until the data ends
            while ($line != ".") {
                
                // parse the output of the server...
                $article=thread_overview_interpret($line, $overviewformat, $groupname);
                // ... and save it in our data structure
                $article->threadsize++;
                $article->date_thread=$article->date;
                $headers[$article->id]=$article;
                // if we are in poll-mode: print status information and
                // decode the article itself, so it can be saved in the article
                // cache
                
                // read the next line from the newsserver
                $line=line_read($socket);
            }
        } else {
            return error_handler(substr($tmp, 0, 3));
        }
        // make function of code below
        
        if (isset($headers)) {
            return $headers;
        } else {
            return error_handler(601);
        }
        //return((isset($headers)) ? $headers : false);
    }
}


function nntp_fetchbody($socket, $groupname, $msgno)
{
    //echo " ";
    $body = "";
    fputs($socket, "GROUP ".$groupname."\r\n");   // select a group
    $groupinfo=explode(" ", line_read($socket));
    if (substr($groupinfo[0], 0, 1) != 2) {
        //echo "<p>".$text_error["error:"]."</p>";
        //echo "<p>".$text_thread["no_such_group"]."</p>";
        return error_handler(substr($groupinfo[0], 0, 3));
        flush();
    } else {
        fputs($socket, "BODY ".$msgno."\r\n");
        $line=line_read($socket);
        if (substr($line, 0, 3) != "222") {
            //debug2c("error fetchbody");
            return error_handler(substr($line, 0, 3));
        } else {
            $line = line_read_uf($socket);

            $formatedline = str_replace("\n", "", str_replace("\r", "", $line));

            while ($formatedline != ".") {
                $body .= $line;
                $line = line_read_uf($socket);

                $formatedline = str_replace("\n", "", str_replace("\r", "", $line));
            }
            //debug2c($body);
            return $body;
        }
    }
}

function nntp_search($nntp, $groupname, $param)
{
    $headers = nntp_headers_all($nntp, $groupname);

    foreach ($headers as $key => $header) {
        $currentbody = nntp_fetchbody($nntp, $groupname, $header->id);

        $paraminsubj = stripos($header->subject, $param);
        $paraminname = stripos($header->name, $param);
        $paraminbody = stripos($currentbody, $param);

        if (($paraminsubj !== false) || ($paraminname !== false) || ($paraminbody !== false)) {
            $headerdata = [
        "subject" => $header->subject,
        "from" => $header->name,
        "messageid" => $header->id,
        "messagenum" => $header->number,
        "sender" => addcslashes(str_replace('\\', '', $header->from), "\""),
        "date" => $header->displaydate,
      ];
            $matches[] = $headerdata;
        }
    }


    if (isset($matches)) {
        return $matches;
    } else {
        return error_handler(600);
    }
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
}


function loadMessageStatus($msgnr)
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

function loadCachedData($journal)
{
    global $CFG;
    //file_put_contents($CFG->dataroot."/cache/".$journal->newsgroup.".txt", serialize($result));
    //try {
    if (!$string_data = @file_get_contents($CFG->dataroot."/cache/".$journal->newsgroup.".txt")) {
        return buildCache_complete($journal);
    } else {
        $result = unserialize($string_data);
        return $result;
    }
    return;
}

function setCache($journal, $data)
{
    global $CFG;
    file_put_contents($CFG->dataroot."/cache/".$journal->newsgroup.".txt", serialize($data));
}

function buildCache_partial($journal, $start, $end) 
{
    global $CFG;
    $localconfig = get_config('usenet');

    $socket = nntp_open($localconfig->newsgroupserver, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);
    if (is_array($socket) && array_key_exists('is_error', $socket)) {    //error detected, theres error_feedback data structure here!
        return $socket;
    }

    $result = nntp_headers($socket, $journal->newsgroup, $start, $end);

    if (is_array($result) && array_key_exists('is_error', $result)) {    //error detected, theres error_feedback data structure here!
        return $result;
    }
    $olddata = loadCachedData($journal);
    $newdata = array_merge($olddata, $result);
    
    file_put_contents($CFG->dataroot."/cache/".$journal->newsgroup.".txt", serialize($newdata));
    return $result;
}

function buildCache_complete($journal)
{
    global $CFG;
    $localconfig = get_config('usenet');
    $socket = nntp_open($localconfig->newsgroupserver, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);
    if (is_array($socket) && array_key_exists('is_error', $socket)) {    //error detected, theres error_feedback data structure here!
        return $socket;
    }
    $result = nntp_headers_all($socket, $journal->newsgroup);
    if (is_array($result) && array_key_exists('is_error', $result)) {    //error detected, theres error_feedback data structure here!
        return $result;
    }
    file_put_contents($CFG->dataroot."/cache/".$journal->newsgroup.".txt", serialize($result));
    return $result;
}

// returns a message post (header and body) about an error
// this message can then be displayed by frontend
// param

function error_handler($err_num)
{
    $errorinfo = error_catalogue($err_num);

    $error_shortdescr = $errorinfo[0];      //error_shortdescription
    $feedback_num = $errorinfo[1];
    $error_longdescr = $errorinfo[2];
  
    if (!isset($error_shortdescr)) {
        $error_shortdescr = $err_num;
        $error_longdescr = $err_num;
    }
    

    $headerdata = [
        "name" => $error_shortdescr,
        "messageid" => $feedback_num,
        "errordescr" => $error_longdescr,
        "personal" => 'SystemMessage',
        "sender" => 'system@client',
        "messagestatus" => '0',
        "markedstatus" => '0',
        "picturestatus" => '0',
        "user_id" => -99,
        "date" => time(),
        "is_error" => true
  ];

    return $headerdata;
}
