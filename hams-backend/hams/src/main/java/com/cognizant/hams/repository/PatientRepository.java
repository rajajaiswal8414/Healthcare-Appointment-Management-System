package com.cognizant.hams.repository;

import com.cognizant.hams.entity.Patient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Object> findByUser_Username(String currentUsername);

    Optional<Patient> findByEmail(String email);

    List<Patient> findByNameContainingIgnoreCase(String name);

    @Query("SELECT DISTINCT p FROM Patient p " +
            "JOIN Appointment a ON p.patientId = a.patient.patientId " +
            "WHERE a.doctor.doctorId = :doctorId")
    List<Patient> findPatientsByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT p FROM Patient p " +
            "JOIN Appointment a ON p.patientId = a.patient.patientId " +
            "WHERE a.doctor.doctorId = :doctorId " +
            "AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Patient> searchPatientsByDoctorId(@Param("doctorId") Long doctorId,
                                           @Param("searchTerm") String searchTerm);

}
