<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Auth\Notifications\ResetPassword; // <--- ADDED IMPORT

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        // <--- NEW: Overrides the default Laravel email link to point to your React app --->
        ResetPassword::createUrlUsing(function ($user, string $token) {
            return 'http://localhost:5173/reset-password?token=' . $token . '&email=' . urlencode($user->email);
        });
    }
}