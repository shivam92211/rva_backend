-- Admin Dummy Data Insert Script
-- Password for all admins: 123abc (hashed with bcrypt)

-- Insert Admin Records
INSERT INTO "Admin" (id, name, email, password, role, permissions, "isActive", "lastLoginAt", "failedAttempts", "lockedUntil", "profilePicture", phone, department, "createdBy", "deletedAt", "createdAt", "updatedAt") VALUES
(
    'admin_001',
    'Super Admin',
    'superadmin@rva.com',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'SUPER_ADMIN',
    ARRAY['*'],
    true,
    NOW() - INTERVAL '1 hour',
    0,
    NULL,
    NULL,
    '+1234567800',
    'IT Department',
    NULL,
    NULL,
    NOW() - INTERVAL '30 days',
    NOW()
),
(
    'admin_002',
    'John Admin',
    'admin@rva.com',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN',
    ARRAY['users.read', 'users.update', 'kyc.read', 'kyc.approve', 'kyc.reject', 'trades.read', 'deposits.read', 'withdrawals.read'],
    true,
    NOW() - INTERVAL '2 hours',
    0,
    NULL,
    NULL,
    '+1234567801',
    'Operations',
    'admin_001',
    NULL,
    NOW() - INTERVAL '20 days',
    NOW()
),
(
    'admin_003',
    'Jane Support',
    'support@rva.com',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'SUPPORT',
    ARRAY['users.read', 'kyc.read', 'tickets.read', 'tickets.update', 'notifications.send'],
    true,
    NOW() - INTERVAL '3 hours',
    0,
    NULL,
    NULL,
    '+1234567802',
    'Customer Support',
    'admin_001',
    NULL,
    NOW() - INTERVAL '15 days',
    NOW()
);

-- Insert Admin Activity Logs
INSERT INTO "AdminLog" (id, "adminId", action, resource, "resourceId", details, "ipAddress", "userAgent", "createdAt") VALUES
(
    'log_001',
    'admin_001',
    'LOGIN',
    'SYSTEM',
    NULL,
    '{"success": true, "sessionDuration": "2h"}',
    '192.168.1.200',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    NOW() - INTERVAL '1 hour'
),
(
    'log_002',
    'admin_002',
    'KYC_APPROVE',
    'KYC',
    'kyc_001',
    '{"userId": "user_001", "level": 2, "reason": "All documents verified"}',
    '192.168.1.201',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    NOW() - INTERVAL '2 hours'
),
(
    'log_003',
    'admin_002',
    'KYC_REJECT',
    'KYC',
    'kyc_005',
    '{"userId": "user_006", "level": 2, "reason": "Document quality insufficient"}',
    '192.168.1.201',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    NOW() - INTERVAL '8 days'
),
(
    'log_004',
    'admin_003',
    'LOGIN',
    'SYSTEM',
    NULL,
    '{"success": true, "sessionDuration": "4h"}',
    '192.168.1.202',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
    NOW() - INTERVAL '3 hours'
),
(
    'log_005',
    'admin_001',
    'USER_FREEZE',
    'USER',
    'user_009',
    '{"reason": "Suspicious activity detected", "duration": "7days"}',
    '192.168.1.200',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    NOW() - INTERVAL '5 days'
),
(
    'log_006',
    'admin_002',
    'SYSTEM_CONFIG_UPDATE',
    'SYSTEM_CONFIG',
    'config_001',
    '{"key": "trading_fee_rate", "oldValue": "0.001", "newValue": "0.0015"}',
    '192.168.1.201',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    NOW() - INTERVAL '10 days'
),
(
    'log_007',
    'admin_003',
    'NOTIFICATION_SENT',
    'NOTIFICATION',
    'notif_006',
    '{"userId": "user_005", "type": "LOGIN_ALERT", "channel": "email"}',
    '192.168.1.202',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
    NOW() - INTERVAL '4 hours'
);

-- Update existing KYC submissions to link to admin reviewers
UPDATE "KycSubmission" SET "reviewedByAdminId" = 'admin_002' WHERE id = 'kyc_001';
UPDATE "KycSubmission" SET "reviewedByAdminId" = 'admin_002' WHERE id = 'kyc_002';
UPDATE "KycSubmission" SET "reviewedByAdminId" = 'admin_002' WHERE id = 'kyc_003';
UPDATE "KycSubmission" SET "reviewedByAdminId" = 'admin_002' WHERE id = 'kyc_005';
UPDATE "KycSubmission" SET "reviewedByAdminId" = 'admin_002' WHERE id = 'kyc_006';

-- Final status message
SELECT 'Admin dummy data insertion completed!' as status,
       'Created 3 admin accounts with password: 123abc' as note,
       'Roles: SUPER_ADMIN, ADMIN, SUPPORT' as roles;