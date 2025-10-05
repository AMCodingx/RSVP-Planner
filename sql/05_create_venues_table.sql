-- Create venues table
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_name_en TEXT NOT NULL,
    venue_name_es TEXT,
    venue_name_nl TEXT,
    venue_address_en TEXT NOT NULL,
    venue_address_es TEXT,
    venue_address_nl TEXT,
    country TEXT NOT NULL DEFAULT 'Curacao',
    ceremony_time TIMESTAMPTZ,
    ceremony_details_en TEXT,
    ceremony_details_es TEXT,
    ceremony_details_nl TEXT,
    reception_time TIMESTAMPTZ,
    reception_details_en TEXT,
    reception_details_es TEXT,
    reception_details_nl TEXT,
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    special_instructions_en TEXT,
    special_instructions_es TEXT,
    special_instructions_nl TEXT,
    transportation_info_en TEXT,
    transportation_info_es TEXT,
    transportation_info_nl TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on venues table
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Create policy for venues (all authenticated users can read/write)
CREATE POLICY "Allow all operations for authenticated users" ON venues
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert a default venue for Curacao March 2027 wedding
INSERT INTO venues (
    venue_name_en,
    venue_name_es,
    venue_name_nl,
    venue_address_en,
    venue_address_es,
    venue_address_nl,
    country,
    ceremony_time,
    ceremony_details_en,
    ceremony_details_es,
    ceremony_details_nl,
    reception_time,
    reception_details_en,
    reception_details_es,
    reception_details_nl,
    transportation_info_en,
    transportation_info_es,
    transportation_info_nl,
    contact_name,
    contact_phone,
    contact_email
) VALUES (
    'Sunset Paradise Resort',
    'Resort Paraíso del Atardecer',
    'Zonsondergang Paradijs Resort',
    'Playa Sunset, West Coast, Curacao',
    'Playa Sunset, Costa Oeste, Curazao',
    'Playa Sunset, Westkust, Curaçao',
    'Curacao',
    '2027-03-15 17:00:00-04:00',
    'Beach ceremony overlooking the Caribbean Sea. Please arrive 30 minutes early for seating.',
    'Ceremonia en la playa con vista al Mar Caribe. Por favor llegue 30 minutos antes para tomar asiento.',
    'Strandceremonie met uitzicht op de Caribische Zee. Kom 30 minuten eerder voor de zitplaatsen.',
    '2027-03-15 19:00:00-04:00',
    'Reception at the resort''s oceanfront pavilion with dinner, dancing, and Caribbean sunset views.',
    'Recepción en el pabellón frente al mar del resort con cena, baile y vistas al atardecer caribeño.',
    'Receptie in het oceanfront paviljoen van het resort met diner, dansen en uitzicht op de Caribische zonsondergang.',
    'Transportation will be arranged from major hotels to the venue. Details will be provided closer to the wedding date.',
    'Se organizará transporte desde los principales hoteles hasta el lugar del evento. Los detalles se proporcionarán más cerca de la fecha de la boda.',
    'Vervoer wordt geregeld vanaf grote hotels naar de locatie. Details worden dichter bij de trouwdatum verstrekt.',
    'Maria Gonzalez',
    '+599 9 123-4567',
    'events@sunsetparadise.cw'
);