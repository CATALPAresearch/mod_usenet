# newsmod #

This plugin is for reading newsgroups.

After installation:
add connection informations to plugin settings in your moodle
admin ui. Whenever possible use ip adresses instead of dns-name for performance
reasons.

After adding an instance of this plugin to your course enter correct newsgroup
name.

required moodle 3.29, php-imap

NEWSGROUP SERVER

feunews.fernuni-hagen.de


Newsgroups tested with
1.  misc.test
2.  feu.cafe
3.  feu.informatik.kurs.1678


resolution >1440x900 is optimal for now
time to send summary to e-mail can be changed under task options in moodle ui


TODO
* [X]  implement send button for new threads
* [X]  design improvements
* [X]  change send summary function
* [X]  caching implemented runs after first summary run
* [X]  partially exported functions to own library file



##  Conversion: socket- in place of imap functions  ##

Rewrite of php_imap functions to low level socket functions

Compatibility for servers which do not have the php_imap lib installed

Corresponding socket functions are called: nntp_xxxxx()


TODO:

*   [ ] library file / socket function collection (socketcon.php)
    *   [ ] error handling on all new functions
    *   [ ] article body formating
    *   [ ] thread sort (partialy done)
    *   [ ] search function
* [ ] replace imap functions with nntp functions
* [ ] clean up code and add comments

Additional TODO:

set up session/connection monitor. reason: right now each imap/nntp function opens up a new connection to the server

## License ##

Rudolf Patzer <rpatzer@gmx.de>

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program.  If not, see <http://www.gnu.org/licenses/>.
