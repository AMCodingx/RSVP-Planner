-- Sample couples for testing
INSERT INTO couples (id, auth_user_id, first_name, last_name, email) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000001', 'Emily', 'Johnson', 'emily.johnson@email.com'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000002', 'Michael', 'Davis', 'michael.davis@email.com'),
  ('52213718-2a11-461e-a443-3d77ae4fb37a', '00000000-0000-0000-0000-000000000003', 'Alex', 'Thompson', 'alex.thompson@email.com'),
  ('6217717f-699f-420a-bbd9-4a2c920e90bd', '00000000-0000-0000-0000-000000000004', 'Sam', 'Parker', 'sam.parker@email.com');

-- Sample addresses for testing
INSERT INTO addresses (id, street_address, city, state_province, postal_code, country, delivery_instructions) VALUES
  ('aa111111-1111-1111-1111-111111111111', '123 Main St', 'Anytown', 'ST', '12345', 'USA', 'Leave at front door if no answer'),
  ('bb222222-2222-2222-2222-222222222222', '456 Oak Ave', 'Somewhere', 'ST', '67890', 'USA', NULL),
  ('cc333333-3333-3333-3333-333333333333', '789 Pine Rd', 'Elsewhere', 'ST', '54321', 'USA', 'Ring doorbell twice'),
  ('dd444444-4444-4444-4444-444444444444', '321 Elm St', 'Newtown', 'ST', '98765', 'USA', 'Apartment 2B'),
  ('ee555555-5555-5555-5555-555555555555', '654 Maple Dr', 'Oldtown', 'Jalisco', '13579', 'Mexico', 'Casa azul con portón blanco');

-- Sample groups for testing (now with address_id references)
INSERT INTO groups (id, name, invitation_address, address_id, qr_code_generated) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Smith Family', '123 Main St, Anytown, ST 12345', 'aa111111-1111-1111-1111-111111111111', false),
  ('22222222-2222-2222-2222-222222222222', 'The Johnsons', '456 Oak Ave, Somewhere, ST 67890', 'bb222222-2222-2222-2222-222222222222', false),
  ('33333333-3333-3333-3333-333333333333', 'Anderson Couple', '789 Pine Rd, Elsewhere, ST 54321', 'cc333333-3333-3333-3333-333333333333', false),
  ('44444444-4444-4444-4444-444444444444', 'Williams Family', '321 Elm St, Newtown, ST 98765', 'dd444444-4444-4444-4444-444444444444', true),
  ('55555555-5555-5555-5555-555555555555', 'Garcia Household', '654 Maple Dr, Oldtown, Jalisco 13579, Mexico', 'ee555555-5555-5555-5555-555555555555', true);

-- Sample guests for testing (updated with couple UUIDs)
INSERT INTO guests (first_name, last_name, email, phone, age_category, country, group_id, rsvp_status, invited_by, special_notes) VALUES
  -- Smith Family (invited by Emily)
  ('John', 'Smith', 'john.smith@email.com', '+1-555-0123', 'adult', 'USA', '11111111-1111-1111-1111-111111111111', 'pending', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Vegetarian meal'),
  ('Jane', 'Smith', 'jane.smith@email.com', '+1-555-0124', 'adult', 'USA', '11111111-1111-1111-1111-111111111111', 'pending', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL),
  ('Little', 'Smith', NULL, NULL, 'child', 'USA', '11111111-1111-1111-1111-111111111111', 'pending', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Age 8'),
  
  -- Johnson Family (invited by Michael)
  ('Bob', 'Johnson', 'bob.johnson@email.com', '+1-555-0125', 'adult', 'Canada', '22222222-2222-2222-2222-222222222222', 'confirmed', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL),
  ('Alice', 'Johnson', 'alice.johnson@email.com', '+1-555-0126', 'adult', 'Canada', '22222222-2222-2222-2222-222222222222', 'confirmed', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Gluten-free meal'),
  
  -- Anderson Couple (invited by Emily)
  ('Mike', 'Anderson', 'mike.anderson@email.com', '+1-555-0127', 'adult', 'USA', '33333333-3333-3333-3333-333333333333', 'declined', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Unable to attend due to work'),
  ('Sarah', 'Anderson', 'sarah.anderson@email.com', '+1-555-0128', 'adult', 'USA', '33333333-3333-3333-3333-333333333333', 'declined', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Unable to attend due to work'),
  
  -- Individual guests (various inviters)
  ('David', 'Wilson', 'david.wilson@email.com', '+1-555-0129', 'adult', 'UK', NULL, 'confirmed', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Flying in from London'),
  ('Emma', 'Davis', 'emma.davis@email.com', '+1-555-0130', 'adult', 'Australia', NULL, 'pending', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL),
  ('Tom', 'Brown', 'tom.brown@email.com', '+1-555-0131', 'adult', 'USA', NULL, 'confirmed', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL),
  
  -- Williams Family (invited by Alex) - QR code already generated
  ('Robert', 'Williams', 'rob.williams@email.com', '+1-555-0132', 'adult', 'USA', '44444444-4444-4444-4444-444444444444', 'confirmed', '52213718-2a11-461e-a443-3d77ae4fb37a', 'Best man'),
  ('Lisa', 'Williams', 'lisa.williams@email.com', '+1-555-0133', 'adult', 'USA', '44444444-4444-4444-4444-444444444444', 'confirmed', '52213718-2a11-461e-a443-3d77ae4fb37a', NULL),
  ('Tyler', 'Williams', NULL, NULL, 'child', 'USA', '44444444-4444-4444-4444-444444444444', 'pending', '52213718-2a11-461e-a443-3d77ae4fb37a', 'Age 16'),
  
  -- Garcia Household (invited by Sam) - QR code already generated
  ('Maria', 'Garcia', 'maria.garcia@email.com', '+1-555-0134', 'adult', 'Mexico', '55555555-5555-5555-5555-555555555555', 'confirmed', '6217717f-699f-420a-bbd9-4a2c920e90bd', 'Maid of honor'),
  ('Carlos', 'Garcia', 'carlos.garcia@email.com', '+1-555-0135', 'adult', 'Mexico', '55555555-5555-5555-5555-555555555555', 'confirmed', '6217717f-699f-420a-bbd9-4a2c920e90bd', NULL),
  
  -- Additional individual guests for Alex and Sam
  ('Kevin', 'Lee', 'kevin.lee@email.com', '+1-555-0136', 'adult', 'South Korea', NULL, 'pending', '52213718-2a11-461e-a443-3d77ae4fb37a', 'College roommate'),
  ('Rachel', 'Chen', 'rachel.chen@email.com', '+1-555-0137', 'adult', 'Taiwan', NULL, 'confirmed', '6217717f-699f-420a-bbd9-4a2c920e90bd', 'Work colleague'),
  ('James', 'Miller', 'james.miller@email.com', '+1-555-0138', 'adult', 'USA', NULL, 'declined', '52213718-2a11-461e-a443-3d77ae4fb37a', 'Schedule conflict'),
  
  -- Additional diverse guests for comprehensive testing
  ('Priya', 'Patel', 'priya.patel@email.com', '+91-98765-43210', 'adult', 'India', NULL, 'confirmed', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Vegetarian, traveling from Mumbai'),
  ('Ahmed', 'Hassan', 'ahmed.hassan@email.com', '+971-50-123-4567', 'adult', 'UAE', NULL, 'pending', '52213718-2a11-461e-a443-3d77ae4fb37a', 'Halal meal required'),
  ('Sophie', 'Dubois', 'sophie.dubois@email.com', '+33-6-12-34-56-78', 'adult', 'France', NULL, 'confirmed', '6217717f-699f-420a-bbd9-4a2c920e90bd', 'Emily\'s exchange student host sister');