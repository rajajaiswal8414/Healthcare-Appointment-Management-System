---
## Roles
---

INSERT INTO roles (role_id, description, name) VALUES
('role-1', 'Admin has full control over the system.', 'Admin'),
('role-2', 'Doctor can manage appointments and medical records.', 'Doctor'),
('role-3', 'Patient can book appointments and view their records.', 'Patient');

---
## Users
---

INSERT INTO users (user_id, password, username, role_id) VALUES
('user-1', 'pass123', 'john_doe', 'role-3'),
('user-2', 'pass123', 'jane_smith', 'role-3'),
('user-3', 'pass123', 'robert_brown', 'role-2'),
('user-4', 'pass123', 'susan_davis', 'role-2'),
('user-5', 'pass123', 'admin', 'role-1'),
('user-6', 'pass123', 'david_wilson', 'role-3'),
('user-7', 'pass123', 'emily_jones', 'role-3'),
('user-8', 'pass123', 'michael_miller', 'role-2'),
('user-9', 'pass123', 'lisa_white', 'role-3'),
('user-10', 'pass123', 'peter_moore', 'role-2'),
('user-11', 'pass123', 'mary_clark', 'role-3'),
('user-12', 'pass123', 'james_taylor', 'role-3'),
('user-13', 'pass123', 'olivia_hall', 'role-2');

---
## Patients
---

INSERT INTO patients (patient_id, address, contact_number, date_of_birth, email, gender, name, status, user_id) VALUES
('pat-1', '123 Main St, Anytown, USA', '555-1234', '1990-05-15 00:00:00', 'john.doe@example.com', 'Male', 'John Doe', 'Active', 'user-1'),
('pat-2', '456 Oak Ave, Anytown, USA', '555-5678', '1985-11-20 00:00:00', 'jane.smith@example.com', 'Female', 'Jane Smith', 'Active', 'user-2'),
('pat-3', '789 Pine Ln, Anytown, USA', '555-9012', '1978-02-10 00:00:00', 'david.wilson@example.com', 'Male', 'David Wilson', 'Active', 'user-6'),
('pat-4', '101 Elm Dr, Anytown, USA', '555-3456', '1992-07-25 00:00:00', 'emily.jones@example.com', 'Female', 'Emily Jones', 'Active', 'user-7'),
('pat-5', '202 Maple Rd, Anytown, USA', '555-7890', '1980-09-03 00:00:00', 'lisa.white@example.com', 'Female', 'Lisa White', 'Inactive', 'user-9'),
('pat-6', '303 Birch Pl, Anytown, USA', '555-2345', '1995-12-12 00:00:00', 'mary.clark@example.com', 'Female', 'Mary Clark', 'Active', 'user-11'),
('pat-7', '404 Cedar St, Anytown, USA', '555-6789', '1988-04-30 00:00:00', 'james.taylor@example.com', 'Male', 'James Taylor', 'Active', 'user-12');

---
## Doctors
---

INSERT INTO doctors (doctor_id, contact_number, email, name, user_id) VALUES
('doc-1', '555-4321', 'robert.brown@example.com', 'Dr. Robert Brown', 'user-3'),
('doc-2', '555-8765', 'susan.davis@example.com', 'Dr. Susan Davis', 'user-4'),
('doc-3', '555-1122', 'michael.miller@example.com', 'Dr. Michael Miller', 'user-8'),
('doc-4', '555-3344', 'peter.moore@example.com', 'Dr. Peter Moore', 'user-10'),
('doc-5', '555-5566', 'olivia.hall@example.com', 'Dr. Olivia Hall', 'user-13');

---
## Specializations
---

INSERT INTO specializations (specialization_id, description, name, doctor_id) VALUES
('spec-1', 'Expert in heart-related conditions', 'Cardiology', 'doc-1'),
('spec-2', 'Specialist in skin disorders', 'Dermatology', 'doc-2'),
('spec-3', 'Focuses on the nervous system', 'Neurology', 'doc-3'),
('spec-4', 'Provides care for children', 'Pediatrics', 'doc-4'),
('spec-5', 'General medical practitioner', 'General Practice', 'doc-5'),
('spec-6', 'Focuses on the nervous system', 'Neurology', 'doc-1'),
('spec-7', 'Provides care for children', 'Pediatrics', 'doc-2');

---
## Doctor_Availability
---

INSERT INTO doctor_availability (availability_id, day_of_week, end_time, is_booked, start_time, doctor_id) VALUES
('avail-1', 'Monday', '17:00:00', 0, '09:00:00', 'doc-1'),
('avail-2', 'Tuesday', '16:30:00', 0, '08:30:00', 'doc-2'),
('avail-3', 'Wednesday', '18:00:00', 1, '10:00:00', 'doc-3'),
('avail-4', 'Thursday', '17:00:00', 0, '09:00:00', 'doc-4'),
('avail-5', 'Friday', '15:00:00', 1, '09:00:00', 'doc-5'),
('avail-6', 'Monday', '16:00:00', 0, '10:00:00', 'doc-1'),
('avail-7', 'Tuesday', '17:00:00', 0, '09:00:00', 'doc-2'),
('avail-8', 'Thursday', '17:30:00', 1, '09:30:00', 'doc-3'),
('avail-9', 'Wednesday', '16:00:00', 0, '08:00:00', 'doc-4'),
('avail-10', 'Friday', '14:00:00', 0, '08:00:00', 'doc-5'),
('avail-11', 'Monday', '12:00:00', 1, '08:00:00', 'doc-1'),
('avail-12', 'Wednesday', '17:00:00', 0, '09:00:00', 'doc-2'),
('avail-13', 'Friday', '16:00:00', 1, '09:00:00', 'doc-3');

---
## Appointments
---

INSERT INTO appointments (appointment_id, duration, end_date_time, start_date_time, status, doctor_id, patient_id) VALUES
('app-1', 30, '2025-10-15 10:30:00', '2025-10-15 10:00:00', 'Completed', 'doc-1', 'pat-1'),
('app-2', 45, '2025-10-16 14:45:00', '2025-10-16 14:00:00', 'Completed', 'doc-2', 'pat-2'),
('app-3', 30, '2025-10-17 11:30:00', '2025-10-17 11:00:00', 'Completed', 'doc-3', 'pat-3'),
('app-4', 60, '2025-10-18 09:00:00', '2025-10-18 09:00:00', 'Scheduled', 'doc-4', 'pat-4'),
('app-5', 30, '2025-10-19 15:30:00', '2025-10-19 15:00:00', 'Scheduled', 'doc-5', 'pat-5'),
('app-6', 30, '2025-10-20 10:30:00', '2025-10-20 10:00:00', 'Completed', 'doc-1', 'pat-6'),
('app-7', 45, '2025-10-21 14:45:00', '2025-10-21 14:00:00', 'Completed', 'doc-2', 'pat-7'),
('app-8', 30, '2025-10-22 11:30:00', '2025-10-22 11:00:00', 'Completed', 'doc-3', 'pat-1'),
('app-9', 60, '2025-10-23 09:00:00', '2025-10-23 09:00:00', 'Scheduled', 'doc-4', 'pat-2'),
('app-10', 30, '2025-10-24 15:30:00', '2025-10-24 15:00:00', 'Scheduled', 'doc-5', 'pat-3'),
('app-11', 30, '2025-10-25 10:30:00', '2025-10-25 10:00:00', 'Completed', 'doc-1', 'pat-4'),
('app-12', 45, '2025-10-26 14:45:00', '2025-10-26 14:00:00', 'Scheduled', 'doc-2', 'pat-5'),
('app-13', 30, '2025-10-27 11:30:00', '2025-10-27 11:00:00', 'Scheduled', 'doc-3', 'pat-6');

---
## Bills
---

INSERT INTO bills (bill_id, date_created, discount, payment_status, subtotal, tax, total, appointment_id, patient_id) VALUES
('bill-1', '2025-10-15 11:00:00', 0.00, 'Paid', 100.00, 8.00, 108.00, 'app-1', 'pat-1'),
('bill-2', '2025-10-16 15:00:00', 5.00, 'Paid', 150.00, 12.00, 157.00, 'app-2', 'pat-2'),
('bill-3', '2025-10-17 12:00:00', 0.00, 'Paid', 120.00, 9.60, 129.60, 'app-3', 'pat-3'),
('bill-4', '2025-10-18 09:05:00', 0.00, 'Pending', 200.00, 16.00, 216.00, 'app-4', 'pat-4'),
('bill-5', '2025-10-19 15:35:00', 10.00, 'Pending', 80.00, 6.40, 76.40, 'app-5', 'pat-5'),
('bill-6', '2025-10-20 11:00:00', 0.00, 'Paid', 100.00, 8.00, 108.00, 'app-6', 'pat-6'),
('bill-7', '2025-10-21 15:00:00', 5.00, 'Paid', 150.00, 12.00, 157.00, 'app-7', 'pat-7'),
('bill-8', '2025-10-22 12:00:00', 0.00, 'Paid', 120.00, 9.60, 129.60, 'app-8', 'pat-1'),
('bill-9', '2025-10-23 09:05:00', 0.00, 'Pending', 200.00, 16.00, 216.00, 'app-9', 'pat-2'),
('bill-10', '2025-10-24 15:35:00', 10.00, 'Pending', 80.00, 6.40, 76.40, 'app-10', 'pat-3'),
('bill-11', '2025-10-25 11:00:00', 0.00, 'Paid', 100.00, 8.00, 108.00, 'app-11', 'pat-4'),
('bill-12', '2025-10-26 15:00:00', 5.00, 'Pending', 150.00, 12.00, 157.00, 'app-12', 'pat-5'),
('bill-13', '2025-10-27 12:00:00', 0.00, 'Pending', 120.00, 9.60, 129.60, 'app-13', 'pat-6');

---
## Medical_Records
---

INSERT INTO medical_records (record_id, diagnosis, notes, reason, doctor_id, patient_id) VALUES
('rec-1', 'Hypertension', 'Patient has high blood pressure, prescribed medication.', 'Routine check-up', 'doc-1', 'pat-1'),
('rec-2', 'Eczema', 'Skin rash on arm, recommended topical cream.', 'Dermatology consultation', 'doc-2', 'pat-2'),
('rec-3', 'Migraine', 'Frequent headaches, advised to avoid triggers.', 'Neurology consultation', 'doc-3', 'pat-3'),
('rec-4', 'Common cold', 'Cough and sore throat, prescribed rest and fluids.', 'Sickness visit', 'doc-4', 'pat-4'),
('rec-5', 'Allergy', 'Allergic reaction to pollen, prescribed antihistamines.', 'Allergy consultation', 'doc-5', 'pat-5'),
('rec-6', 'Anxiety', 'Experiencing panic attacks, referred to a specialist.', 'Mental health consultation', 'doc-1', 'pat-6'),
('rec-7', 'Mild concussion', 'Hit head during sports, advised to rest and monitor.', 'Injury follow-up', 'doc-2', 'pat-7'),
('rec-8', 'Insomnia', 'Difficulty sleeping, recommended sleep hygiene practices.', 'Sleep consultation', 'doc-3', 'pat-1');

---
## Medications
---

INSERT INTO medications (medication_id, description, image, name) VALUES
('med-1', 'Common pain reliever', NULL, 'Ibuprofen'),
('med-2', 'Antihistamine for allergies', NULL, 'Cetirizine'),
('med-3', 'Antibiotic for bacterial infections', NULL, 'Amoxicillin'),
('med-4', 'Blood pressure medication', NULL, 'Lisinopril'),
('med-5', 'Topical cream for skin rashes', NULL, 'Hydrocortisone'),
('med-6', 'Migraine relief', NULL, 'Sumatriptan'),
('med-7', 'Antidepressant', NULL, 'Sertraline');

---
## Prescriptions
---

INSERT INTO prescriptions (prescription_id, instructions, onset_date, doctor_id, record_id) VALUES
('pres-1', 'Take one tablet daily.', '2025-10-15 11:00:00', 'doc-1', 'rec-1'),
('pres-2', 'Apply thinly to affected area twice a day.', '2025-10-16 15:00:00', 'doc-2', 'rec-2'),
('pres-3', 'Take as needed for headaches.', '2025-10-17 12:00:00', 'doc-3', 'rec-3'),
('pres-4', 'Take one tablet daily, with food.', '2025-10-20 11:00:00', 'doc-1', 'rec-6'),
('pres-5', 'Take one tablet before bed.', '2025-10-22 12:00:00', 'doc-3', 'rec-8');

---
## Prescription_Items
---

INSERT INTO prescription_items (prescription_item_id, dosage, instructions, medication_id, prescription_id) VALUES
('pres-item-1', '10mg', 'Take one tablet in the morning.', 'med-4', 'pres-1'),
('pres-item-2', '2%', 'Apply to rash after cleaning.', 'med-5', 'pres-2'),
('pres-item-3', '50mg', 'Take at the onset of a migraine attack.', 'med-6', 'pres-3'),
('pres-item-4', '50mg', 'Take one tablet daily.', 'med-7', 'pres-4'),
('pres-item-5', '20mg', 'Take one tablet 30 minutes before sleep.', 'med-1', 'pres-5');