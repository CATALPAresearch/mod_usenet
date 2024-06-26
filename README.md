# usenet 

Usenet is a moodle plugin for reading and writing newsgroup messages. 

**TODO**

* [x] replace imap by low level socket communication
* [x] migrate to vue.js
* [x] integrate into production
* [x] redesign for mobile use
* [x] Preparations for production: code review, clean up, hardening, usability tests
* [ ] support usage by advanced message visualizations and NLP methods 

## Installation

* git clone ... to <your-local-moodle-path>/mod/usenet  
* Follow the install instruction at moodle
* change usenet username and password at ´http://<your-moodle-path>/admin/settings.php?section=modsettingusenet´ 

**Caution**

Currently we hardcoded a blocking mechanism which needs to be disabled in `view.php`, line 69 and 87, e.g. by returning `true` at the function `access_control()` on line 87. 

**Setup and configuration**

add connection informations to plugin settings in your moodle
admin ui. Whenever possible use ip adresses instead of dns-name for performance
reasons.

After adding an instance of this plugin to your course enter correct newsgroup
name.


NEWSGROUP SERVER

feunews.fernuni-hagen.de

Newsgroups tested with
1.  misc.test
2.  feu.cafe
3.  feu.informatik.kurs.1801


resolution <1440x900 is optimal for now
time to send summary to e-mail can be changed under task options in moodle ui


# Development

**Using grunt**

* `grunt plugin-build` transpiles all js code
* `grunt plugin-check` run js linter
* `grunt plugin-css` bundles and minifies css files
* `grunt plugin-all` handles css and build tasks mentioned above


##  Conversion: socket- in place of imap functions  ##

Rewrite of php_imap functions to low level socket functions

Compatibility for servers which do not have the php_imap lib installed

Corresponding socket functions are called: nntp_xxxxx()


TODO:

*   [ ] library file / socket function collection (socketcon.php)
    *   [ ] error handling on all new functions
        *   [ ] user feedback on error -> display message
    *   [X] article body formating
    *   [X] thread sort (partialy done)
    *   [X] search function
* [X] replace imap functions with nntp functions
* [ ] clean up code and add comments

Additional TODO:

set up session/connection monitor. reason: right now each imap/nntp function opens up a new connection to the server


## License

Rudolf Patzer <rpatzer@gmx.de>
Konstantin Friedrich <konstantfriedrich@gmail.com>
Niels Seidel <niels.seidel@fernuni-hagen.de>

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program.  If not, see <http://www.gnu.org/licenses/>.
