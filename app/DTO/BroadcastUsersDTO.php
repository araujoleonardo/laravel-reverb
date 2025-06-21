<?php

namespace App\DTO;

readonly class BroadcastUsersDTO
{
    public function __construct(
        public string $idNotification
    ) {}
}
