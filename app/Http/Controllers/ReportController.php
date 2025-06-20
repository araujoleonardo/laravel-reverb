<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessReport;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function process(): JsonResponse
    {
        ProcessReport::dispatch();

        return response()->json(['message' => 'Processamento iniciado.']);
    }
}
