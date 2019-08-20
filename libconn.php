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
	$a=email_to_user($email_user, $email_user, $subject, html_to_text($content),$content);

	}

	function generateJsonFromNews(){
		$nntp = imap_open("{". $localconfig->newsgroupserver . "/nntp}".$journal->newsgroup, $localconfig->newsgroupusername, $localconfig->newsgrouppassword);
		//$header = imap_headers($nntp);
		$mc = imap_check($nntp);
		$threads = imap_thread($nntp);
		$headers = imap_headers($nntp);
		//$header = imap_fetch_overview($nntp,"1:100");
		if ($mc == false) {
		    echo "Abruf fehlgeschlagen<br />\n";
		} else { };
		$jsontree = '{"name":"'. $journal->newsgroup. '/Aktivitätslog","children":[{';
		  $treend =0;
		$last = "";


		function headersubject ($val){
		  global $nntp;
		  if ($val==0){return;}

		  $header = imap_headerinfo($nntp,$val);
		  $tempheaderdecoded =imap_mime_header_decode($header->subject);
		  $tempheader="";
		  foreach ($tempheaderdecoded as $key=>$val){
		   $tempheader = $tempheader . $val->text;

		   }
		   $header->tempheader = addslashes($tempheader);
		  //print_r($header->tempheader);

		  return $header;
		}

		foreach ($threads as $key => $val) {
		  $tree = explode('.', $key);

		  if ($tree[1] == 'num') {
		    //echo $last;
		     if ($last == 'branch'){$jsontree = $jsontree . "},{";}
		    $tempheader="";
		    $tempheader=headersubject($val);
		    if (!is_object($tempheader)){
			$tempheader= new \stdClass();
			$tempheader->tempheader ='Nachrichtenknoten gelöscht';
			$tempheader->sender[0] = new \stdClass();
			$tempheader->sender[0]->mailbox= 'nicht vorhanden';
			$tempheader->sender[0]->host= 'nicht vorhanden';
			$tempheader->date= '0';
			}
		    $jsontree = $jsontree . '"name":"'.str_replace("\\", '' , str_replace("'",'',str_replace('"','',$tempheader->tempheader))).'",';
		    $jsontree = $jsontree . '"messageid":"'.$val.'",';
		    $jsontree = $jsontree . '"sender":"'.$tempheader->sender[0]->mailbox."@".$tempheader->sender[0]->host.'",';
		    $jsontree = $jsontree . '"date":"'.$tempheader->date.'"';
		    if($threads[$tree[0] . ".next"]!=0){
		      $jsontree = $jsontree . ',"children": [{'  ;
		      $treend= '1';
		    }else {
		      //$jsontree = $jsontree . '}]';
		    }
		  } elseif ($tree[1] == 'branch') {
		    if($last=='branch'){
		      $jsontree = $jsontree . "}]";
		    }else{
		      $treend ='0';
		    }
		  }
		  $last = $tree[1];
		}
		$jsontree = $jsontree . "}]}";
		return $jsontree;
	}
?>
