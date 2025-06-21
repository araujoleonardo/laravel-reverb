<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UsersUpdatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public bool $success,
        public array $users
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('users.channel');
    }

    public function broadcastAs(): string
    {
        return 'UsersUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'success' => $this->success,
            'users' => $this->users
        ];
    }
}
