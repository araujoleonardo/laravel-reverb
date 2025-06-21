<?php

namespace App\Jobs;

use App\DTO\BroadcastUsersDTO;
use App\Events\UsersUpdatedEvent;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Exception;
use Throwable;

class UsersIfChanged implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    private string $cacheKey;

    public function __construct(public BroadcastUsersDTO $params)
    {
        $this->cacheKey = 'users_snapshot_' . $params->idNotification;
    }

    public function handle(): void
    {
        $users = User::select('id', 'name', 'email', 'updated_at')->get()->toArray();

        $lastSnapshot = Cache::get($this->cacheKey);

        if (md5(json_encode($lastSnapshot)) !== md5(json_encode($users))) {
            Cache::put($this->cacheKey, $users, 300);

            broadcast(new UsersUpdatedEvent(true, $users));
        }

        $this->finishEvent(true, $users);
    }

    public function failed(Throwable $exception): void
    {
        Log::error($exception);
        $this->finishEvent(false, []);
    }

    private function finishEvent(bool $isSuccess, array $users): void
    {
        try {
            broadcast(new UsersUpdatedEvent($isSuccess, $users));
        } catch (Exception $e) {
            Log::error("Erro ao emitir UsersUpdatedEvent: " . $e->getMessage());
        }
    }
}
