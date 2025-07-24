-- Insert sample users (you may need to adjust this based on your auth setup)
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at) VALUES
    ('11111111-2222-4333-8444-555555555555', 'user1@example.com', now(), now(), now()),
    ('22222222-3333-4444-9555-666666666666', 'user2@example.com', now(), now(), now()),
    ('33333333-4444-4555-a666-777777777777', 'user3@example.com', now(), now(), now()),
    ('44444444-5555-4666-b777-888888888888', 'user4@example.com', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert sample thoughts
INSERT INTO public.thoughts (id, content, created_at, created_by) VALUES
    ('a1b2c3d4-e5f6-4890-abcd-ef1234567890', 'Just had the best coffee of my life! ☕ Sometimes it''s the little things that make your day.', '2025-01-15T10:30:00Z', '11111111-2222-4333-8444-555555555555'),
    ('b2c3d4e5-f6a7-4901-bcde-f23456789012', 'Working on a new project and feeling excited about the possibilities ahead. Innovation never stops!', '2025-01-15T09:15:00Z', '22222222-3333-4444-9555-666666666666'),
    ('c3d4e5f6-a7b8-4012-cdef-345678901234', 'Beautiful sunset today. Nature always has a way of putting things in perspective.', '2025-01-15T08:45:00Z', '33333333-4444-4555-a666-777777777777');

-- Insert sample reactions
INSERT INTO public.reactions (id, thought_id, user_id, emoji, created_at) VALUES
    ('d4e5f6a7-b8c9-4123-def4-567890123456', 'a1b2c3d4-e5f6-4890-abcd-ef1234567890', '22222222-3333-4444-9555-666666666666', '❤️', '2025-01-15T10:35:00Z'),
    ('e5f6a7b8-c9d0-4234-eaf5-678901234567', 'a1b2c3d4-e5f6-4890-abcd-ef1234567890', '33333333-4444-4555-a666-777777777777', '🚀', '2025-01-15T10:40:00Z'),
    ('f6a7b8c9-d0e1-4345-fab6-789012345678', 'a1b2c3d4-e5f6-4890-abcd-ef1234567890', '44444444-5555-4666-b777-888888888888', '❤️', '2025-01-15T10:45:00Z'),
    ('a7b8c9d0-e1f2-4456-abc7-890123456789', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '11111111-2222-4333-8444-555555555555', '🚀', '2025-01-15T09:20:00Z'),
    ('b8c9d0e1-f2a3-4567-bcd8-901234567890', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '33333333-4444-4555-a666-777777777777', '💡', '2025-01-15T09:25:00Z'),
    ('c9d0e1f2-a3b4-4678-cde9-012345678901', 'c3d4e5f6-a7b8-4012-cdef-345678901234', '11111111-2222-4333-8444-555555555555', '🌅', '2025-01-15T08:50:00Z'),
    ('d0e1f2a3-b4c5-4789-def0-123456789012', 'c3d4e5f6-a7b8-4012-cdef-345678901234', '22222222-3333-4444-9555-666666666666', '🌅', '2025-01-15T08:55:00Z'),
    ('e1f2a3b4-c5d6-4890-efa1-234567890123', 'c3d4e5f6-a7b8-4012-cdef-345678901234', '44444444-5555-4666-b777-888888888888', '❤️', '2025-01-15T09:00:00Z');