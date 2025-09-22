-- Device and RefreshToken Dummy Data Insert Script
-- This script inserts dummy device and refresh token data

-- Insert Device Records (linked to existing users)
INSERT INTO "Device" (id, "userId", "ipAddress", "userAgent", location, timezone, fingerprint, "createdAt", "updatedAt") VALUES
(
    'device_001',
    'user_001',
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    '{"lat": 40.7128, "lng": -74.0060, "city": "New York", "country": "US"}',
    'America/New_York',
    'win_chrome_192168100_001',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '1 hour'
),
(
    'device_002',
    'user_001',
    '10.0.0.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    '{"lat": 40.7589, "lng": -73.9851, "city": "New York", "country": "US"}',
    'America/New_York',
    'ios_safari_10015_001',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '2 hours'
),
(
    'device_003',
    'user_002',
    '192.168.1.105',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    '{"lat": 43.6532, "lng": -79.3832, "city": "Toronto", "country": "CA"}',
    'America/Toronto',
    'mac_chrome_192168105_002',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '30 minutes'
),
(
    'device_004',
    'user_003',
    '203.0.113.45',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    '{"lat": -33.8688, "lng": 151.2093, "city": "Sydney", "country": "AU"}',
    'Australia/Sydney',
    'linux_chrome_203011345_003',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '4 hours'
),
(
    'device_005',
    'user_004',
    '198.51.100.25',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
    '{"lat": 51.5074, "lng": -0.1278, "city": "London", "country": "GB"}',
    'Europe/London',
    'win_firefox_1985110025_004',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '6 hours'
),
(
    'device_006',
    'user_004',
    '172.16.0.10',
    'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    '{"lat": 51.5074, "lng": -0.1278, "city": "London", "country": "GB"}',
    'Europe/London',
    'ipad_safari_172160010_004',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
),
(
    'device_007',
    'user_005',
    '203.0.113.78',
    'Mozilla/5.0 (Android 14; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    '{"lat": -37.8136, "lng": 144.9631, "city": "Melbourne", "country": "AU"}',
    'Australia/Melbourne',
    'android_chrome_203011378_005',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '3 hours'
),
(
    'device_008',
    'user_006',
    '192.168.50.200',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    '{"lat": 40.7128, "lng": -74.0060, "city": "New York", "country": "US"}',
    'America/New_York',
    'mac_safari_19216850200_006',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '8 hours'
),
(
    'device_009',
    'user_007',
    '10.1.1.50',
    'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/119.0.0.0 Safari/537.36',
    '{"lat": 37.7749, "lng": -122.4194, "city": "San Francisco", "country": "US"}',
    'America/Los_Angeles',
    'win_edge_101150_007',
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '12 hours'
),
(
    'device_010',
    'user_008',
    '172.20.10.5',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    '{"lat": 52.5200, "lng": 13.4050, "city": "Berlin", "country": "DE"}',
    'Europe/Berlin',
    'ios_safari_172201050_008',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '2 days'
),
(
    'device_011',
    'user_009',
    '192.168.2.150',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0',
    '{"lat": -37.8136, "lng": 144.9631, "city": "Melbourne", "country": "AU"}',
    'Australia/Melbourne',
    'ubuntu_firefox_1921682150_009',
    NOW() - INTERVAL '9 days',
    NOW() - INTERVAL '5 days'
),
(
    'device_012',
    'user_010',
    '203.0.113.92',
    'Mozilla/5.0 (Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    '{"lat": 35.6762, "lng": 139.6503, "city": "Tokyo", "country": "JP"}',
    'Asia/Tokyo',
    'android_chrome_203011392_010',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '6 hours'
);

-- Insert RefreshToken Records (linked to devices)
INSERT INTO "RefreshToken" (id, "deviceId", token, "isActive", "expiresAt", "createdAt", "updatedAt") VALUES
-- Active tokens
(
    'token_001',
    'device_001',
    'hashed_refresh_token_001_' || MD5(RANDOM()::text),
    true,
    NOW() + INTERVAL '30 days',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
),
(
    'token_002',
    'device_002',
    'hashed_refresh_token_002_' || MD5(RANDOM()::text),
    true,
    NOW() + INTERVAL '25 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
),
(
    'token_003',
    'device_003',
    'hashed_refresh_token_003_' || MD5(RANDOM()::text),
    true,
    NOW() + INTERVAL '20 days',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days'
),
(
    'token_004',
    'device_004',
    'hashed_refresh_token_004_' || MD5(RANDOM()::text),
    true,
    NOW() + INTERVAL '22 days',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
),
(
    'token_005',
    'device_005',
    'hashed_refresh_token_005_' || MD5(RANDOM()::text),
    true,
    NOW() + INTERVAL '18 days',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '12 days'
),
(
    'token_006',
    'device_006',
    'hashed_refresh_token_006_' || MD5(RANDOM()::text),
    true,
    NOW() + INTERVAL '29 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
),
(
    'token_007',
    'device_007',
    'hashed_refresh_token_007_' || MD5(RANDOM()::text),
    true,
    NOW() + INTERVAL '23 days',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
),
(
    'token_008',
    'device_008',
    'hashed_refresh_token_008_' || MD5(RANDOM()::text),
    true,
    NOW() + INTERVAL '27 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
),
-- Expired/inactive tokens
(
    'token_009',
    'device_009',
    'hashed_refresh_token_009_' || MD5(RANDOM()::text),
    false,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '35 days',
    NOW() - INTERVAL '6 days'
),
(
    'token_010',
    'device_010',
    'hashed_refresh_token_010_' || MD5(RANDOM()::text),
    false,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '40 days',
    NOW() - INTERVAL '4 days'
),
(
    'token_011',
    'device_011',
    'hashed_refresh_token_011_' || MD5(RANDOM()::text),
    false,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '32 days',
    NOW() - INTERVAL '9 days'
),
(
    'token_012',
    'device_012',
    'hashed_refresh_token_012_' || MD5(RANDOM()::text),
    true,
    NOW() + INTERVAL '28 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
),
-- Additional tokens for users with multiple devices
(
    'token_013',
    'device_001',
    'hashed_refresh_token_013_' || MD5(RANDOM()::text),
    false,
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '15 days'
),
(
    'token_014',
    'device_004',
    'hashed_refresh_token_014_' || MD5(RANDOM()::text),
    false,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '37 days',
    NOW() - INTERVAL '12 days'
),
(
    'token_015',
    'device_005',
    'hashed_refresh_token_015_' || MD5(RANDOM()::text),
    true,
    NOW() + INTERVAL '26 days',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
);

-- Final status message
SELECT 'Device and RefreshToken dummy data insertion completed!' as status,
       'Created 12 devices and 15 refresh tokens' as note,
       'Mix of active/inactive tokens and various device types' as details;