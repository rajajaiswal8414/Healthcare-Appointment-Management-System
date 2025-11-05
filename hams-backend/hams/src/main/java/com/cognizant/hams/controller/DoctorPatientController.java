package com.cognizant.hams.controller;// DoctorPatientController.java
import com.cognizant.hams.dto.response.MedicalRecordResponseDTO;
import com.cognizant.hams.dto.response.PatientResponseDTO;
import com.cognizant.hams.exception.APIException;
import com.cognizant.hams.service.DoctorPatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors/me/patients")
@RequiredArgsConstructor
@Slf4j
public class DoctorPatientController {

    private final DoctorPatientService doctorPatientService;

    @GetMapping
    public ResponseEntity<List<PatientResponseDTO>> getPatients(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long doctorId = getDoctorIdFromUserDetails(userDetails);
            List<PatientResponseDTO> patients = doctorPatientService.getPatientsForDoctor(doctorId);
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            log.error("Error fetching patients for doctor", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{patientId}")
    public ResponseEntity<PatientResponseDTO> getPatientById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long patientId) {
        try {
            Long doctorId = getDoctorIdFromUserDetails(userDetails);
            PatientResponseDTO patient = doctorPatientService.getPatientById(doctorId, patientId);
            return ResponseEntity.ok(patient);
        } catch (RuntimeException e) {
            log.error("Error fetching patient: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching patient", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{patientId}/medical-records")
    public ResponseEntity<List<MedicalRecordResponseDTO>> getPatientMedicalRecords(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long patientId) {
        try {
            Long doctorId = getDoctorIdFromUserDetails(userDetails);
            List<MedicalRecordResponseDTO> medicalRecords =
                    doctorPatientService.getPatientMedicalRecords(doctorId, patientId);
            return ResponseEntity.ok(medicalRecords);
        } catch (RuntimeException e) {
            log.error("Error fetching medical records: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching medical records", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<PatientResponseDTO>> searchPatients(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String q) {
        try {
            Long doctorId = getDoctorIdFromUserDetails(userDetails);
            List<PatientResponseDTO> patients = doctorPatientService.searchPatients(doctorId, q);
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            log.error("Error searching patients", e);
            return ResponseEntity.badRequest().build();
        }
    }

    // Inside DoctorPatientController.java
// (Assuming you have access to the DoctorService or DoctorRepository)

    // ... injections (already handled by @RequiredArgsConstructor) ..
// private final DoctorRepository doctorRepository; // If not using a dedicated service method

    // Helper method to extract doctor ID from authenticated user
    private Long getDoctorIdFromUserDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new APIException("User is not authenticated. Cannot extract Doctor ID.");
        }

        // The username here should correspond to the 'User.username' field
        String username = userDetails.getUsername();

        // Delegate the database lookup to the service layer
        // You need to add this method to your DoctorPatientService or a separate DoctorService
        return doctorPatientService.getDoctorIdByUsername(username);
    }
}