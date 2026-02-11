-- Insert monthly treatment records for all three categories
INSERT INTO public.treatment_records (beneficiary_id, beneficiary_name, beneficiary_type, treatment_type, diagnosis, prescription, date_given, doctor_name, notes)
VALUES 
-- Pregnant monthly records
('85977c72-7d81-4f09-887d-07b00bff88f1', 'gguyf', 'pregnant', 'Prenatal Care', 'Routine ANC Checkup - Month 1', 'Folic Acid 5mg daily, Iron tablets 60mg daily', '2025-10-15', 'Dr. Anita Singh', 'First trimester screening done. Normal vitals.'),
('85977c72-7d81-4f09-887d-07b00bff88f1', 'gguyf', 'pregnant', 'Prenatal Care', 'Routine ANC Checkup - Month 2', 'Continue Folic Acid, Calcium 500mg daily', '2025-11-15', 'Dr. Anita Singh', 'Ultrasound normal. Weight gain on track.'),
('85977c72-7d81-4f09-887d-07b00bff88f1', 'gguyf', 'pregnant', 'Prenatal Care', 'Routine ANC Checkup - Month 3', 'Iron + Folic Acid, Calcium supplements', '2025-12-15', 'Dr. Anita Singh', 'Blood sugar normal. BP 110/70.'),
('b26eaaab-681f-42f2-9af3-94d96820741e', '1627288', 'pregnant', 'Prenatal Care', 'Gestational Diabetes Screening', 'Metformin 500mg if needed, diet control', '2026-01-10', 'Dr. Meera Patel', 'GDM screening borderline. Monitor closely.'),
('b26eaaab-681f-42f2-9af3-94d96820741e', '1627288', 'pregnant', 'Prenatal Care', 'Anemia Management', 'Iron Sucrose IV, Folic Acid 5mg', '2026-02-05', 'Dr. Meera Patel', 'Hb improved to 10.2 g/dL from 8.5.'),
-- Elderly monthly records  
('f2f14753-64fe-4c9c-99be-fa98c12df89e', 'Ramchandra Yadav', 'elderly', 'Cardiology', 'Hypertension Follow-up - Dec', 'Amlodipine 5mg, Losartan 50mg', '2025-12-10', 'Dr. Suresh Patel', 'BP controlled at 130/80. Continue meds.'),
('7b082b1a-adae-478a-8b82-3b18480f328b', 'Savitri Bai', 'elderly', 'Orthopedic', 'Osteoarthritis Follow-up - Dec', 'Diclofenac gel, Calcium + Vit D', '2025-12-15', 'Dr. Rajesh Kumar', 'Joint stiffness improved with physiotherapy.'),
('f2f14753-64fe-4c9c-99be-fa98c12df89e', 'Ramchandra Yadav', 'elderly', 'Endocrinology', 'Diabetes Review - Nov', 'Metformin 500mg BD, Glimepiride 1mg', '2025-11-10', 'Dr. Suresh Patel', 'HbA1c 7.2%. Diet compliance good.'),
('7b082b1a-adae-478a-8b82-3b18480f328b', 'Savitri Bai', 'elderly', 'General Medicine', 'Respiratory Infection', 'Azithromycin 500mg x 3 days, Cough syrup', '2025-11-20', 'Dr. Rajesh Kumar', 'Chest X-ray clear. Viral URTI.'),
-- Infant monthly records
('2a9b9ac7-2aad-4179-854b-931afa936569', 'Baby Verma', 'infant', 'Pediatrics', 'Growth Monitoring - Dec', 'Vitamin D drops, Iron syrup 1ml daily', '2025-12-08', 'Dr. Priya Sharma', 'Weight 7.2kg (50th percentile). Growth normal.'),
('cec4b543-805f-4e99-b380-dd23707d2a7a', 'Baby Sunita', 'infant', 'Pediatrics', 'Diarrhea Treatment - Nov', 'ORS sachets, Zinc syrup 10mg x 14 days', '2025-11-15', 'Dr. Priya Sharma', 'Mild dehydration. Breastfeeding continued.'),
('2a9b9ac7-2aad-4179-854b-931afa936569', 'Baby Verma', 'infant', 'Pediatrics', 'Immunization Visit - Nov', 'Post-vaccination paracetamol if fever', '2025-11-05', 'Dr. Priya Sharma', 'Pentavalent dose 2 given. No adverse reaction.'),
('cec4b543-805f-4e99-b380-dd23707d2a7a', 'Baby Sunita', 'infant', 'Pediatrics', 'Growth Monitoring - Dec', 'Multivitamin drops, Continue breastfeeding', '2025-12-12', 'Dr. Priya Sharma', 'Weight 6.8kg. Introducing complementary foods.');

-- Insert meal menus for elderly and infants
INSERT INTO public.prescribed_meals (patient_id, patient_name, patient_type, meal_type, name, description, calories, protein, carbs, fat, ingredients, prescribed_by, prescribed_date, special_instructions)
VALUES 
-- Elderly meals
('200001', 'Ramchandra Yadav', 'elderly', 'breakfast', 'Oats Upma with Vegetables', 'Heart-healthy oats upma with mixed vegetables and minimal oil', 280, 8, 42, 6, '{"Oats","Onion","Carrot","Beans","Mustard seeds","Curry leaves"}', 'Dr. Suresh Patel', '2026-02-01', 'Low sodium. No added salt. Suitable for diabetics.'),
('200001', 'Ramchandra Yadav', 'elderly', 'lunch', 'Dal Khichdi with Curd', 'Easy-to-digest moong dal khichdi with low-fat curd', 350, 14, 55, 5, '{"Moong dal","Rice","Turmeric","Ghee","Curd","Cumin"}', 'Dr. Suresh Patel', '2026-02-01', 'Soft diet. Easy to chew and digest.'),
('200001', 'Ramchandra Yadav', 'elderly', 'dinner', 'Roti with Lauki Sabzi', 'Whole wheat roti with bottle gourd curry', 300, 10, 48, 6, '{"Whole wheat flour","Bottle gourd","Tomato","Onion","Turmeric"}', 'Dr. Suresh Patel', '2026-02-01', 'Light dinner. Avoid eating too late.'),
('200001', 'Ramchandra Yadav', 'elderly', 'snack', 'Ragi Porridge with Banana', 'Calcium-rich ragi porridge with mashed banana', 220, 6, 38, 3, '{"Ragi flour","Milk","Banana","Jaggery","Cardamom"}', 'Dr. Suresh Patel', '2026-02-01', 'Good source of calcium for bone health.'),
('200002', 'Savitri Bai', 'elderly', 'breakfast', 'Moong Dal Chilla', 'Protein-rich moong dal pancake with green chutney', 250, 12, 35, 5, '{"Moong dal","Onion","Green chili","Ginger","Coriander"}', 'Dr. Rajesh Kumar', '2026-02-01', 'High protein breakfast. Good for joint health.'),
('200002', 'Savitri Bai', 'elderly', 'lunch', 'Palak Dal with Brown Rice', 'Iron and protein-rich spinach lentil curry with brown rice', 380, 16, 58, 6, '{"Spinach","Toor dal","Brown rice","Garlic","Tomato","Turmeric"}', 'Dr. Rajesh Kumar', '2026-02-01', 'Rich in iron and fiber.'),
('200002', 'Savitri Bai', 'elderly', 'dinner', 'Vegetable Soup with Multigrain Bread', 'Warm vegetable soup with multigrain bread', 260, 8, 40, 5, '{"Mixed vegetables","Multigrain bread","Pepper","Salt","Olive oil"}', 'Dr. Rajesh Kumar', '2026-02-01', 'Light and nutritious. Easy to digest.'),
('200002', 'Savitri Bai', 'elderly', 'snack', 'Fruit Chaat with Seeds', 'Mixed seasonal fruits with pumpkin and flax seeds', 180, 4, 32, 4, '{"Apple","Pomegranate","Papaya","Pumpkin seeds","Flax seeds","Lemon"}', 'Dr. Rajesh Kumar', '2026-02-01', 'Rich in antioxidants and omega-3.'),
-- Infant meals (6+ months)
('300001', 'Baby Verma', 'infant', 'breakfast', 'Rice Cereal with Mashed Apple', 'Smooth rice cereal with steamed and mashed apple', 120, 2, 24, 1, '{"Rice cereal","Apple","Water"}', 'Dr. Priya Sharma', '2026-02-01', 'First foods. Smooth consistency. No added sugar.'),
('300001', 'Baby Verma', 'infant', 'lunch', 'Dal Water with Rice Mash', 'Thin moong dal water mixed with mashed rice', 100, 4, 18, 1, '{"Moong dal","Rice","Turmeric","Water"}', 'Dr. Priya Sharma', '2026-02-01', 'Easy to digest. Introduce slowly.'),
('300001', 'Baby Verma', 'infant', 'snack', 'Banana Mash', 'Ripe banana mashed to smooth consistency', 90, 1, 22, 0, '{"Banana"}', 'Dr. Priya Sharma', '2026-02-01', 'Natural sweetness. Rich in potassium.'),
('300001', 'Baby Verma', 'infant', 'dinner', 'Carrot Puree', 'Steamed and pureed carrot', 80, 1, 18, 0, '{"Carrot","Water"}', 'Dr. Priya Sharma', '2026-02-01', 'Rich in Vitamin A. Steam until very soft.'),
('300002', 'Baby Sunita', 'infant', 'breakfast', 'Ragi Porridge', 'Thin ragi porridge with breast milk', 110, 3, 20, 1, '{"Ragi flour","Breast milk","Water"}', 'Dr. Priya Sharma', '2026-02-01', 'Calcium-rich. Mix with breast milk for familiarity.'),
('300002', 'Baby Sunita', 'infant', 'lunch', 'Mashed Khichdi', 'Very soft moong dal khichdi mashed well', 130, 5, 22, 1, '{"Moong dal","Rice","Ghee","Turmeric","Water"}', 'Dr. Priya Sharma', '2026-02-01', 'Complete meal. Mash thoroughly.'),
('300002', 'Baby Sunita', 'infant', 'snack', 'Steamed Apple Puree', 'Steamed apple blended to puree', 85, 1, 20, 0, '{"Apple","Water"}', 'Dr. Priya Sharma', '2026-02-01', 'Natural sweetness. No added sugar or honey.'),
('300002', 'Baby Sunita', 'infant', 'dinner', 'Sweet Potato Mash', 'Steamed sweet potato mashed smooth', 95, 2, 20, 0, '{"Sweet potato","Water","Ghee"}', 'Dr. Priya Sharma', '2026-02-01', 'Rich in beta-carotene. Very soft texture.');