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
$journal = $DB->get_record("newsmod", array("id" => $cm->instance));


$context = context_module::instance($cm->id);
require_login($course, false, $cm);
//require_capability('mod/newsmod:addentries', $context);

if (! $journal = $DB->get_record("newsmod", array("id" => $cm->instance))) {
    print_error("Course module is incorrect");
}
$localconfig = get_config('newsmod');


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
    //print_r($tempheader->tempheader);
    //if ($last != "branch"){$jsontree = $jsontree .",";}
    //$jsontree = $jsontree . '"children": [{' . '"name":"' .$tempheader->tempheader.'"';//. '"from":"' .$tempheader->sender[0]->mailbox."@".$tempheader->sender[0]->host.'",';
    // ,"children": [
    //     {
    //
    //     }
    //   ]
    if (!is_object($tempheader)){
	$tempheader= new \stdClass();
	$tempheader->tempheader ='Nachrichtenknoten gelöscht';
	$tempheader->sender[0] = new \stdClass();
	$tempheader->sender[0]->mailbox= 'nicht vorhanden';
	$tempheader->sender[0]->host= 'nicht vorhanden';
	$tempheader->date= '0';
	}
    $jsontree = $jsontree . '"name":"'.$tempheader->tempheader.'",';
    $jsontree = $jsontree . '"messageid":"'.$val.'",';
    $jsontree = $jsontree . '"sender":"'.$tempheader->sender[0]->mailbox."@".$tempheader->sender[0]->host.'",';
    $jsontree = $jsontree . '"date":"'.$tempheader->date.'"';
    if($threads[$tree[0] . ".next"]!=0){
      $jsontree = $jsontree . ',"children": [{'  ;//. '"from":"' .$tempheader->sender[0]->mailbox."@".$tempheader->sender[0]->host.'",';
      $treend= '1';
    }else {
      //$jsontree = $jsontree . '}]';
    }
  } elseif ($tree[1] == 'branch') {
    //echo $treend;
    //if($treend == 0){$jsontree = $jsontree . "true}]";}
    if($last=='branch'){
      $jsontree = $jsontree . "}]";
    }else{

      $treend ='0';
    }



  }
  $last = $tree[1];

}
$jsontree = $jsontree . "}]}";
header('Content-Type: application/json');
//echo "<body>";
echo $jsontree;
//print_r(imap_headerinfo($nntp,1));
//print_r( $threads);
//echo "</body>";
 $fp = fopen('results.json', 'w');
 fwrite($fp, $jsontree);
//
 fclose($fp);

//echo "<script type='text/javascript' src='jquery-3.4.1.min.js'></script>";
