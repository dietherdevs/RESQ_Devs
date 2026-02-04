<!DOCTYPE html>
<html>
<head>
    <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px;">
        <h2 style="color: #0ea5e9;">Password Reset Request</h2>
        <p>You requested to reset your password. Use the code below to verify your identity:</p>
        
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0284c7;">
                {{ $code }}
            </span>
        </div>
        
        <p>This code will expire in 10 minutes.</p>
        <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
    </div>
</body>
</html>