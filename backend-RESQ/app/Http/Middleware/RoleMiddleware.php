<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // 1. Check if user is logged in
        if (! $request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // 2. Check if the user's role is in the allowed list
        // Example usage in routes: middleware('role:admin,superadmin')
        if (! in_array($request->user()->role, $roles)) {
            return response()->json(['message' => 'Forbidden: You do not have permission.'], 403);
        }

        return $next($request);
    }
}