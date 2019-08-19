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
require_once($CFG->dirroot . '/mod/newsmod/libconn.php');
$jsontree = generateJsonFromNews();
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
