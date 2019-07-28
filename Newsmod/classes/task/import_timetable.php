<?php

namespace mod_newsmod\task;

class import_timetable extends \core\task\scheduled_task{
public function get_name(){
return 'Send Summary';
   }

public function execute(){
$start = time();

      cli_heading('Timetable Importer');

$schedule = timetablerApiCall( 'fetchCalendar', array() );
if ( $schedule['status'] == 'fail' ){
         cli_writeln( 'Could Not Fetch Timetable: ' . $schedule['message'] );
return;
      }

$response = timetablerApiCall( 'fetchMoodleIds', array() );
foreach( $response['data']['event_ids'] as $id ){
try{
$event = calendar_event::load( $id );
$event->delete( true );
         } catch ( Exception $e ){
            cli_writeln( $e->getMessage() );
         }
         cli_writeln("Deleted Event $id");
      }

      timetablerApiCall( 'clearMoodleEvents', array() );
      cli_writeln('Delete Moodle events via API');


foreach( $schedule['data']['schedule'] as $event ){
         cli_writeln('Processing event from JSON');
         createEventFromJson($event);
      }

      cli_heading('Import Process Complete');

$end = time();

$executionTime = $end - $start;

      cli_writeln( 'Execution Took: ' . $executionTime . ' seconds' );
   }
}
