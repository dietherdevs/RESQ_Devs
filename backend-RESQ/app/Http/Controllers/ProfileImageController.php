<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileImageController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:4096', // Max 4MB
        ]);

        $user = Auth::user();

        if ($request->hasFile('image')) {
            // 1. Delete old image if it exists (to save space)
            if ($user->profile_image) {
                // Convert public URL back to storage path
                $oldPath = str_replace('/storage/', 'public/', $user->profile_image);
                Storage::delete($oldPath);
            }

            // 2. Store the new file in 'storage/app/public/avatars'
            $path = $request->file('image')->store('public/avatars');

            // 3. Generate the accessible URL (e.g., /storage/avatars/filename.jpg)
            $url = Storage::url($path);

            // 4. Save URL to database
            $user->profile_image = $url;
            $user->save();

            return response()->json(['message' => 'Image updated!', 'url' => $url]);
        }

        return response()->json(['message' => 'Upload failed'], 400);
    }
}