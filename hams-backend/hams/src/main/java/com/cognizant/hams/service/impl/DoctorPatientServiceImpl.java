package com.cognizant.hams.service.impl;

// DoctorPatientService.java

import com.cognizant.hams.dto.response.MedicalRecordResponseDTO;
import com.cognizant.hams.dto.response.PatientResponseDTO;
import com.cognizant.hams.entity.Doctor;
import com.cognizant.hams.entity.MedicalRecord;
import com.cognizant.hams.entity.Patient;
import com.cognizant.hams.exception.APIException;
import com.cognizant.hams.repository.AppointmentRepository;
import com.cognizant.hams.repository.DoctorRepository;
import com.cognizant.hams.repository.MedicalRecordRepository;
import com.cognizant.hams.repository.PatientRepository;
import com.cognizant.hams.service.DoctorPatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorPatientServiceImpl implements DoctorPatientService {

    private final PatientRepository patientRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    @Transactional(readOnly = true)
    @Override
    public List<PatientResponseDTO> getPatientsForDoctor(Long doctorId) {
        log.info("Fetching patients for doctor ID: {}", doctorId);

        // Verify doctor exists
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        List<Patient> patients = patientRepository.findPatientsByDoctorId(doctorId);

        return patients.stream()
                .map(this::convertToPatientResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Override
    public PatientResponseDTO getPatientById(Long doctorId, Long patientId) {
        log.info("Fetching patient ID: {} for doctor ID: {}", patientId, doctorId);

        // Verify the patient belongs to this doctor (has appointments with this doctor)
        boolean hasAppointmentWithDoctor = appointmentRepository
                .findByDoctorIdAndPatientId(doctorId, patientId)
                .size() > 0;

        if (!hasAppointmentWithDoctor) {
            throw new RuntimeException("Patient not found or not associated with this doctor");
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));

        return convertToPatientResponseDTO(patient);
    }

    @Transactional(readOnly = true)
    @Override
    public List<MedicalRecordResponseDTO> getPatientMedicalRecords(Long doctorId, Long patientId) {
        log.info("Fetching medical records for patient ID: {} by doctor ID: {}", patientId, doctorId);

        // Verify the patient belongs to this doctor
        boolean hasAppointmentWithDoctor = appointmentRepository
                .findByDoctorIdAndPatientId(doctorId, patientId)
                .size() > 0;

        if (!hasAppointmentWithDoctor) {
            throw new RuntimeException("Patient not found or not associated with this doctor");
        }

        List<MedicalRecord> medicalRecords = medicalRecordRepository
                .findByPatientIdAndDoctorId(patientId, doctorId);

        return medicalRecords.stream()
                .map(this::convertToMedicalRecordResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Override
    public List<PatientResponseDTO> searchPatients(Long doctorId, String searchTerm) {
        log.info("Searching patients for doctor ID: {} with term: {}", doctorId, searchTerm);

        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getPatientsForDoctor(doctorId);
        }

        List<Patient> patients = patientRepository.searchPatientsByDoctorId(doctorId, searchTerm.trim());

        return patients.stream()
                .map(this::convertToPatientResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PatientResponseDTO convertToPatientResponseDTO(Patient patient) {
        PatientResponseDTO dto = new PatientResponseDTO();
        dto.setPatientId(patient.getPatientId());
        dto.setName(patient.getName());
        dto.setEmail(patient.getEmail());
        dto.setContactNumber(patient.getContactNumber());
        dto.setAddress(patient.getAddress());
        dto.setGender(patient.getGender() != null ? patient.getGender() : null);
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setBloodGroup(patient.getBloodGroup());
        return dto;
    }

    @Override
    public MedicalRecordResponseDTO convertToMedicalRecordResponseDTO(MedicalRecord medicalRecord) {
        MedicalRecordResponseDTO dto = new MedicalRecordResponseDTO();
        dto.setRecordId(medicalRecord.getRecordId());
        dto.setPatientId(medicalRecord.getPatient().getPatientId());
        dto.setPatientName(medicalRecord.getPatient().getName());
        dto.setDoctorId(medicalRecord.getDoctor().getDoctorId());
        dto.setDoctorName(medicalRecord.getDoctor().getDoctorName());
        dto.setDiagnosis(medicalRecord.getDiagnosis());
        dto.setNotes(medicalRecord.getNotes());
        return dto;
    }

    @Override
    public Long getDoctorIdByUsername(String username) {
        // 1. Look up the Doctor entity using the username stored in the JWT/SecurityContext.
        // Ensure DoctorRepository has a findByUser_Username method or a query for this.
        Doctor doctor = doctorRepository.findByUser_Username(username)
                .orElseThrow(() -> new APIException("Authenticated user is not a registered doctor."));

        // 2. Return the doctorId
        return doctor.getDoctorId();
    }
}
