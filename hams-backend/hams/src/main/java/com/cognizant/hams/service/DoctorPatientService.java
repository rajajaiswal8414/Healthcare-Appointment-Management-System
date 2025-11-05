package com.cognizant.hams.service;

import com.cognizant.hams.dto.response.MedicalRecordResponseDTO;
import com.cognizant.hams.dto.response.PatientResponseDTO;
import com.cognizant.hams.entity.MedicalRecord;
import com.cognizant.hams.entity.Patient;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface DoctorPatientService {
    @Transactional(readOnly = true)
    List<PatientResponseDTO> getPatientsForDoctor(Long doctorId);

    @Transactional(readOnly = true)
    PatientResponseDTO getPatientById(Long doctorId, Long patientId);

    @Transactional(readOnly = true)
    List<MedicalRecordResponseDTO> getPatientMedicalRecords(Long doctorId, Long patientId);

    @Transactional(readOnly = true)
    List<PatientResponseDTO> searchPatients(Long doctorId, String searchTerm);

    PatientResponseDTO convertToPatientResponseDTO(Patient patient);

    MedicalRecordResponseDTO convertToMedicalRecordResponseDTO(MedicalRecord medicalRecord);

    Long getDoctorIdByUsername(String username);
}