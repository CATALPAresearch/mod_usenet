<?php

/*
        ///useful ressources/guides:
        ///nntp:        https://tools.ietf.org/html/rfc3977
        ///php sockets: https://www.php.net/manual/en/function.socket-recv.php
*/
defined('MOODLE_INTERNAL')|| die;

error_reporting(E_ALL);


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

            echo "ch sock: "."$changed_sockets<br>";
            

        } 
        $n = socket_recv($socket, $buf, 2048, MSG_DONTWAIT);

        //0 received bytes indicate a closed connection
        if ($n === 0)
        {
            $done = true;
            echo "connection widowed<br>";
        }

        $sum .= $buf;

        echo "bytes rec:"."$n<br>";
        
    }while(!$done);


    return $sum;
}

function line_read(&$socket) {
    if ($socket != false) {
      $t=str_replace("\n","",str_replace("\r","",fgets($socket,1200)));
      return $t;
    }
  }


//empty the tcp buffer
function flush_buf($socket)
{
    $lines_deleted = 0;
    if (socket != false)
    {
        while (fgets($socket, 1200) !== false)
        {
            $lines_deleted++;
        }
    }
    return $lines_deleted;
}

function thread_overview_read(&$socket) {
    $overviewfmt=array();
    fputs($socket,"LIST overview.fmt\r\n");  // find out the format of the
    $tmp=line_read($socket);                 // xover-command
    if(substr($tmp,0,3)=="215") {
      $line=line_read($socket);
      while (strcmp($line,".") != 0) {
        // workaround for braindead CLNews newsserver
        if($line=="Author:")
          $overviewfmt[]="From:";
        else
          $overviewfmt[]=$line;
        $line=line_read($socket);
      }
    } else {
      // some stupid newsservers, like changi, don't send their overview
      // format
      // let's hope, that the format is like that from INN
      $overviewfmt=array("Subject:","From:","Date:","Message-ID:",
                            "References:","Bytes:");
    }
    $overviewformat=implode("\t",$overviewfmt);
    return $overviewformat;
}

function splitSubject(&$subject) {
    //todo preg_replace
    //$s=preg_replace('^(odp:|aw:|re:|re\[2\]:| )+','',$subject);
    $s=preg_replace('/^(odp:|aw:|re:|re\[2\]:| )+/i','',$subject);
    $return=($s != $subject);
    $subject=$s;
    return $return;
  }

  function getTimestamp($value) {
    $timezone = +1 ;
    $months=array("Jan"=>1,"Feb"=>2,"Mar"=>3,"Apr"=>4,"May"=>5,"Jun"=>6,"Jul"=>7,"Aug"=>8,"Sep"=>9,"Oct"=>10,"Nov"=>11,"Dec"=>12);
    $value=str_replace("  "," ",$value);
    $d=explode(" ",$value,6);
    if (strcmp(substr($d[0],strlen($d[0])-1,1),",") == 0) {
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
    $time=explode(":",$date[3]);
    // timezone handling
    $msgtimezone=0;
    if ($gmt[0]=='-') {
      $msgtimezone=-substr($gmt,1,2);
      $msgminzone=-substr($gmt,3,2);
    } else if ($gmt[0]=='+') {
      $msgtimezone=+substr($gmt,1,2);
      $msgminzone=+substr($gmt,3,2);
    }
    $time[0]=$time[0]-$msgtimezone+$timezone;
    $time[1]=$time[1]-$msgminzone+$minzone;
    $timestamp=mktime($time[0],$time[1],$time[2],$months[$date[1]],$date[0],$date[2]);
    return $timestamp;
  }

function thread_overview_interpret($line,$overviewformat,$groupname) {
    $return="";
    $overviewfmt=explode("\t",$overviewformat);
    echo " ";                // keep the connection to the webbrowser alive
    flush();                 // while generating the message-tree
  //  $over=split("\t",$line,count($overviewfmt)-1);
    $over=explode("\t",$line);
    //$article=new headerType;
    for ($i=0; $i<count($overviewfmt)-1; $i++) {
      if ($overviewfmt[$i]=="Subject:") {
          //todo preg_replace
        $subject=preg_replace('/\[doctalk\]/i','',headerDecode($over[$i+1]));
        $article->isReply=splitSubject($subject);
        $article->subject=$subject;
      }
      if ($overviewfmt[$i]=="Date:") {
        $article->date=getTimestamp($over[$i+1]);
      }
      if ($overviewfmt[$i]=="From:") {
        $fromline=address_decode(headerDecode($over[$i+1]),"nirgendwo");
        $article->from=$fromline[0]["mailbox"]."@".$fromline[0]["host"];
        $article->username=$fromline[0]["mailbox"];
        if (!isset($fromline[0]["personal"])) {
          $article->name=$fromline[0]["mailbox"];
          if (strpos($article->name,'%')) {
            $article->name=substr($article->name,0,strpos($article->name,'%'));
          }
          $article->name=strtr($article->name,'_',' ');
        } else {
          $article->name=$fromline[0]["personal"];
        }
      }
      if ($overviewfmt[$i]=="Message-ID:") $article->id=$over[$i+1];
      if (($overviewfmt[$i]=="References:") && ($over[$i+1] != "")) {
        $article->references=explode(" ",$over[$i+1]);
      }
    }
    $article->number=$over[0];
    $article->isAnswer=false;
    return($article);
  }


  function address_decode($adrstring,$defaulthost) {
    $parsestring=trim($adrstring);
    $len=strlen($parsestring);
    $at_pos=strpos($parsestring,'@');     // find @
    $ka_pos=strpos($parsestring,"(");     // find (
    $kz_pos=strpos($parsestring,')');     // find )
    $ha_pos=strpos($parsestring,'<');     // find <
    $hz_pos=strpos($parsestring,'>');     // find >
    $space_pos=strpos($parsestring,')');  // find ' '
    $email="";
    $mailbox="";
    $host="";
    $personal="";
    if ($space_pos != false) {
      if (($ka_pos != false) && ($kz_pos != false)) {
        $personal=substr($parsestring,$ka_pos+1,$kz_pos-$ka_pos-1);
        $email=trim(substr($parsestring,0,$ka_pos-1));
      }
    } else {
      $email=$adrstring;
    }
    if (($ha_pos != false) && ($hz_pos != false)) {
      $email=trim(substr($parsestring,$ha_pos+1,$hz_pos-$ha_pos-1));
      $personal=substr($parsestring,0,$ha_pos-1);
    }
    if ($at_pos != false) {
      $mailbox=substr($email,0,strpos($email,'@'));
      $host=substr($email,strpos($email,'@')+1);
    } else {
      $mailbox=$email;
      $host=$defaulthost;
    }
    $personal=trim($personal);
    if (substr($personal,0,1) == '"') $personal=substr($personal,1);
    if (substr($personal,strlen($personal)-1,1) == '"')
      $personal=substr($personal,0,strlen($personal)-1);
    $result["mailbox"]=trim($mailbox);
    $result["host"]=trim($host);
    if ($personal!="") $result["personal"]=$personal;
    $complete[]=$result;
    return ($complete);
  }

  function headerDecode($value) {
    if (preg_match('/=\?.*\?.\?.*\?=/i',$value)) { // is there anything encoded?
      if (preg_match('/=\?.*\?Q\?.*\?=/i',$value)) {  // quoted-printable decoding
  
        $charset=preg_replace('/(.*)=\?(.*)\?Q\?(.*)\?=(.*)/i','\2',$value);
        $result1=preg_replace('/(.*)=\?.*\?Q\?(.*)\?=(.*)/i','\1',$value);
        $result2=preg_replace('/(.*)=\?.*\?Q\?(.*)\?=(.*)/i','\2',$value);
        $result3=preg_replace('/(.*)=\?.*\?Q\?(.*)\?=(.*)/i','\3',$value);
        $result2=str_replace("_"," ",quoted_printable_decode($result2));
        $newvalue=$result1.recode_charset($result2,$charset).$result3;
      }
      if (preg_match('/=\?.*\?B\?.*\?=/i',$value)) {  // base64 decoding
        $result1=preg_replace('/(.*)=\?.*\?B\?(.*)\?=(.*)/i','\1',$value);
        $result2=preg_replace('/(.*)=\?.*\?B\?(.*)\?=(.*)/i','\2',$value);
        $result3=preg_replace('/(.*)=\?.*\?B\?(.*)\?=(.*)/i','\3',$value);
        $result2=base64_decode($result2);
        $newvalue=$result1.$result2.$result3;
      }
      if (!isset($newvalue)) // nothing of the above, must be an unknown encoding...
        $newvalue=$value;
      else
        $newvalue=headerDecode($newvalue);  // maybe there are more encoded
      return($newvalue);                    // parts
    } else {   // there wasn't anything encoded, return the original string
      return($value);
    }
  }
  function thread_mycompare($a,$b) {
    $thread_sort_order=-1;
    $thread_sort_type="thread";
    if($thread_sort_type!="thread") {
      $r=($a->date<$b->date) ? -1 : 1;
      if ($a->date==$b->date) $r=0;
    } else {
      $r=($a->date_thread<$b->date_thread) ? -1 : 1;
      if ($a->date_thread==$b->date_thread) $r=0;
    }
    return $r*$thread_sort_order;
}


  function thread_load_newsserver(&$ns,$groupname) {
    
    $overviewformat=thread_overview_read($ns);
    fputs($ns,"GROUP $groupname\r\n");   // select a group
    $groupinfo=explode(" ",line_read($ns));
    if (substr($groupinfo[0],0,1) != 2) {
      echo "<p>".$text_error["error:"]."</p>";
      echo "<p>".$text_thread["no_such_group"]."</p>";
      flush();
    } else {
      
        
        $firstarticle=$groupinfo[2];
        $lastarticle=$groupinfo[3];

        // order the article overviews from the newsserver
        fputs($ns,"XOVER ".$firstarticle."-".$lastarticle."\r\n");
        $tmp=line_read($ns);
        // have the server accepted our order?
        if (substr($tmp,0,3) == "224") {
          $line=line_read($ns);
          // read overview by overview until the data ends
          while ($line != ".") {
            // parse the output of the server...
            $article=thread_overview_interpret($line,$overviewformat,$groupname);
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
        
        }

        if ((isset($headers)) && (count($headers)>0)) {
          foreach($headers as $c) {
            if (($c->isAnswer == false) &&
               (isset($c->references))) {   // is the article an answer to an
                                            // other article?
              // try to find a matching article to one of the references
              $refmatch=false;
              foreach ($c->references as $reference) {
                if(isset($headers[$reference])) {
                  $refmatch=$reference;
                }
              }
              // have we found an article, to which this article is an answer?
              if($refmatch!=false) {
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
                  $d->date_thread=max($c->date,$d->date_thread);
                } while(($headers[$d->bestreference]) && 
                          (isset($d->bestreference)) &&
                          ($d =& $headers[$d->bestreference]));
              }
            }
          }
          reset($headers);
          // sort the articles
          $thread_sort_order=-1;
          if (($thread_sort_order != 0) && (count($headers)>0))
            uasort($headers,'thread_mycompare');

        }
      if(isset($headers))
        return $headers;
      return false;
      //return((isset($headers)) ? $headers : false);
    }
  }  


///evaluates a response coming from a nntp/nnrp server
///param:   response string from nntp/nnrp server in response to command
///returns: 
function formattree($headers)
{
    $size = sizeof($headers);

    $formatedtree = "";

    for ($i = 0; $i < $size; $i++)
    {
        if ($headers[$i]['isreply'] === true) $formatedtree .= "\t";
        $formatedtree .= $headers[$i]['subject'];


        $formatedtree .= "\n";
    }
    return $formatedtree;
}

//todo: error handling
function nntp_open($host, $user, $pass, $port = 119)
{
    $ipaddress = gethostbyname($host);

    $user_msg = "AUTHINFO USER ".$user."\r\n"; // fill in your ldap name here
    $pass_msg = "AUTHINFO PASS ".$pass."\r\n"; // enter your password here


    $sock = fsockopen($ipaddress, $port);

    line_read($sock);       //throw away server welcome message        

    fputs($sock, $user_msg);
    fputs($sock, $pass_msg);
    
    $line_del = flush_buf($sock);

    echo $line_del;



    return $sock;
}

function nntp_header($socket, $groupname, $msgno)
{
    $overviewformat=thread_overview_read($socket);
    fputs($socket,"GROUP $groupname\r\n");   // select a group
    $groupinfo=explode(" ",line_read($socket));
    if (substr($groupinfo[0],0,1) != 2) 
    {
      echo "<p>".$text_error["error:"]."</p>";
      echo "<p>".$text_thread["no_such_group"]."</p>";
      flush();
    } 
    else 
    {
      
        $firstarticle=$groupinfo[2];
        $lastarticle=$groupinfo[3];

        // order the article overviews from the newsserver
        fputs($socket,"XOVER ".$msgno."\r\n");
        $tmp=line_read($socket);
        // have the server accepted our order?
        if (substr($tmp,0,3) == "224") {
          $line=line_read($socket);
          // read overview by overview until the data ends
          
            // parse the output of the server...
            $article=thread_overview_interpret($line,$overviewformat,$groupname);
            // ... and save it in our data structure
            $article->threadsize++;
            $article->date_thread=$article->date;
            $header=$article;
            
            //$headers[$article->id]=$article;
            // if we are in poll-mode: print status information and
            // decode the article itself, so it can be saved in the article
            // cache
            
            // read the next line from the newsserver
            
          }
        
    }
    return $header;
}


function nntp_headers($socket, $groupname)
{
    $overviewformat=thread_overview_read($socket);
    fputs($socket,"GROUP $groupname\r\n");   // select a group
    $groupinfo=explode(" ",line_read($socket));
    if (substr($groupinfo[0],0,1) != 2) 
    {
      echo "<p>".$text_error["error:"]."</p>";
      echo "<p>".$text_thread["no_such_group"]."</p>";
      flush();
    } 
    else 
    {
      
        
        $firstarticle=$groupinfo[2];
        $lastarticle=$groupinfo[3];

        // order the article overviews from the newsserver
        fputs($socket,"XOVER ".$firstarticle."-".$lastarticle."\r\n");
        $tmp=line_read($socket);
        // have the server accepted our order?
        if (substr($tmp,0,3) == "224") {
          $line=line_read($socket);
          // read overview by overview until the data ends
          $i = 0;
          while($line != ".")
          {
            // parse the output of the server...
            $article=thread_overview_interpret($line,$overviewformat,$groupname);
            // ... and save it in our data structure
            $article->threadsize++;
            $article->date_thread=$article->date;
            $headers[$i]=$article;
            $i++;
            //$headers[$article->id]=$article;
            // if we are in poll-mode: print status information and
            // decode the article itself, so it can be saved in the article
            // cache
            
            // read the next line from the newsserver
            $line=line_read($socket);
          }
        }
    }
    return $headers;
}


function nntp_thread($socket, $groupname)
{
    
}

//todo: format the server response
function nntp_fetchbody($socket, $groupname, $msgno)
{
    fputs($socket,"GROUP $groupname\r\n");   // select a group
    $groupinfo=explode(" ",line_read($socket));
    if (substr($groupinfo[0],0,1) != 2) 
    {
      echo "<p>".$text_error["error:"]."</p>";
      echo "<p>".$text_thread["no_such_group"]."</p>";
      flush();
    } 
    else
    {
        $article = fputs($socket, "BODY ".$msgno."\r\n");
        $line=line_read($socket);
        if (substr($line,0,3) != "222") {
          echo "error";
          return 0;
        }

        return $article;
    }
}


$port = 119;
$address = gethostbyname('feunews.fernuni-hagen.de');
/*
    ///nntp commands must end with \r\n or \0
*/
$user = "AUTHINFO USER friedrichk\r\n"; // fill in your ldap name here
$pass = "AUTHINFO PASS 241d0HB3450\r\n"; // enter your password here


$sock = fsockopen($address, $port);
echo (line_read($sock)."<br>");

    $counter = 0;
  
        fputs($sock, $user);
        fputs($sock, $pass);

        echo (line_read($sock)."<br>");
        echo (line_read($sock)."<br>");

        $groupname = "feu.informatik.kurs.1515";


        $test = thread_load_newsserver($sock, $groupname);

        //echo (var_dump($test));

        //$a = formattree($test);

        
        echo ("<br>".var_dump($test));

    

        //$message = "list overview.fmt\r\n";

        //fputs($sock, $message);

        fclose($sock);


?>