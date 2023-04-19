<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

// author: Marc Burchart <marc.burchart@fernuni-hagen.de>

namespace mod_usenet;

defined('MOODLE_INTERNAL') || die();

class blocking
{
    const policy_version = 6; // local_niels: 11  aple: 3 marc: 1
    const disable_blocking = false;
    const disable_whitelist = false;
    const whitelist = array(
        '127.0.0.1',
        '::1',
        'localhost',
        //'132.176.117.197' reverse setting for testing
    );

    public static function tool_policy_accepted()
    {
        global $DB, $USER;
        if (self::disable_blocking === true || (self::disable_whitelist === false && in_array($_SERVER['REMOTE_ADDR'], self::whitelist))) {
            return true;
        }
        $res = $DB->get_record("tool_policy_acceptances", array("policyversionid" => self::policy_version, "userid" => (int)$USER->id ), "status");
        if (isset($res->status) && $res->status == 1) {
            return true;
        }
        return false;
    }
}
