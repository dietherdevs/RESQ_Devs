<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\FloodLevel;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class SyncPagasaFloodData extends Command
{
    protected $signature = 'flood:sync';
    protected $description = 'Fetch real-time Sto. Niño water level from official PAGASA JSON API';

    public function handle()
    {
        // Target the specific API endpoint discovered from your Network tab
        $apiUrl = 'https://pasig-marikina-tullahanffws.pagasa.dost.gov.ph/water/main_list.do';

        try {
            // Http request with SSL verification bypass to prevent cURL error 60
            $response = Http::timeout(20)
                ->withoutVerifying()
                ->withOptions(['verify' => false]) 
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36',
                ])
                ->get($apiUrl);
            
            if ($response->successful()) {
                $data = $response->json();
                
                // Retrieve Sto. Niño station by obscd
                $station = collect($data)->firstWhere('obscd', '11104201');

                if ($station) {
                    // Extract level: remove (*) symbol and cast to float
                    $cleanLevel = str_replace(['(*)'], '', $station['wl']);
                    $level = (float) $cleanLevel;
                    
                    // Create new database record
                    $flood = new FloodLevel();
                    $flood->obscd = $station['obscd'];
                    $flood->water_level = $level;
                    $flood->status = 'live_api';
                    
                    // Force Manila Timezone so it matches your local clock
                    $flood->fetched_at = Carbon::parse($station['timestr'], 'Asia/Manila');
                    
                    $flood->save();

                    $this->info("SUCCESS! Sto. Niño level is now: {$level}m at " . $flood->fetched_at);
                } else {
                    $this->error("API connected, but Station ID 11104201 was not found in the data.");
                }
            } else {
                $this->error("API returned error status: " . $response->status());
            }
        } catch (\Exception $e) {
            $this->error("Sync Error: " . $e->getMessage());
        }
    }
}