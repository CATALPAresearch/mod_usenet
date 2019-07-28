<?php
$x->{8179}[] = "179";
$x->{8179}[] = "2";
$y[]="2";
$y[]="3";

function x($counter, $naechste){
global $x,$f;
$counter--;
$counter1[] = $counter;
if($counter == 0){
 return; 
}
 return array('betreff'=>'nachrichtenname', 'nachricht'=>x($counter, $x));
}

$f = x(100, $x);
print_r(json_encode($f));
