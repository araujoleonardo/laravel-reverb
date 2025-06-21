<?php

use App\DTO\BroadcastUsersDTO;
use App\Jobs\UsersIfChanged;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Schedule;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('Processed.Report.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('users.channel', function () {
    return true;
});

Schedule::call(function () {
    dispatch(new UsersIfChanged(new BroadcastUsersDTO('users:job')));
})->everyMinute();
