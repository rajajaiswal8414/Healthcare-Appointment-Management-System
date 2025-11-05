package com.cognizant.hams.repository;

import com.cognizant.hams.dto.response.DoctorAndAvailabilityResponseDTO;
import com.cognizant.hams.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByDoctorId(Long doctorId);

    boolean existsByDoctorNameAndSpecialization(String doctorName, String specialization);

    List<Doctor> findBySpecializationContainingIgnoreCase(String specialization);

    List<Doctor> findByDoctorNameContainingIgnoreCase(String name);

    @Query(value = "SELECT d.doctor_id, d.contact_number, d.doctor_name, d.email, d.clinic_address, " +
            "d.specialization, d.qualification, d.year_of_experience, a.start_time, a.end_time, " +
            "a.available_date, a.available " +
            "FROM doctors d " +
            "JOIN doctor_availability a ON d.doctor_id = a.doctor_id " +
            "WHERE doctor_name = :doctorName AND available = 1", nativeQuery = true)
    List<DoctorAndAvailabilityResponseDTO> findByAvailableDoctorNameAndAvailability(@Param("doctorName") String doctorName);

    @Query(value = "SELECT d.doctor_id, d.contact_number, d.doctor_name, d.email, d.clinic_address, " +
            "d.specialization, d.qualification, d.year_of_experience, a.start_time, a.end_time, " +
            "a.available_date, a.available " +
            "FROM doctors d " +
            "JOIN doctor_availability a ON d.doctor_id = a.doctor_id " +
            "WHERE doctor_name = :doctorName", nativeQuery = true)
    List<DoctorAndAvailabilityResponseDTO> findByDoctorNameAndAvailability(@Param("doctorName") String doctorName);

    // ✅ Correct version for fetching doctor by username
    Optional<Doctor> findByUser_Username(String username);

    @Query("SELECT d FROM Doctor d WHERE d.createdAt >= :startDate ORDER BY d.createdAt DESC")
    List<Doctor> findRecentDoctors(@Param("startDate") LocalDateTime startDate);

    long count();
}