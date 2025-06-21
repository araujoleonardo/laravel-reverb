<?php

namespace App\Helper;

use App\Models\User;

class Report
{
    public function process()
    {
        return User::all();
    }
}
