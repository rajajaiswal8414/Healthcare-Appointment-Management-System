package com.cognizant.hams.repository;

import com.cognizant.hams.entity.Appointment;
import com.cognizant.hams.entity.AppointmentStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatient_PatientId(Long patientId);

    List<Appointment> findByDoctor_DoctorId(Long doctorId);

    List<Appointment> findByDoctorDoctorId(Long doctorId);

    List<Appointment> findByDoctorDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.doctorId = :doctorId AND a.patient.patientId = :patientId")
    List<Appointment> findByDoctorIdAndPatientId(@Param("doctorId") Long doctorId,
                                                 @Param("patientId") Long patientId);

    long countByAppointmentDate(LocalDate date);
    long countByDoctor_DoctorIdAndStatusAndAppointmentDateGreaterThanEqual(
            Long doctorId,
            AppointmentStatus status,
            LocalDate date
    );

    List<Appointment> findByDoctor_DoctorIdAndAppointmentDate(Long doctorId, LocalDate now);

    @Query("SELECT COUNT(DISTINCT a.patient.patientId) FROM Appointment a WHERE a.doctor.doctorId = :doctorId AND a.status IN ('PENDING', 'CONFIRMED', 'COMPLETED')")
    Long countDistinctPatientByDoctorId(@Param("doctorId") Long doctorId);

    boolean existsByDoctorDoctorIdAndAppointmentDateAndStartTimeAndStatusIn(
            Long doctorId,
            LocalDate appointmentDate,
            LocalTime startTime,
            Collection<AppointmentStatus> statuses // Parameter must be a Collection/List
    );

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN TRUE ELSE FALSE END " +
            "FROM Appointment a " +
            "WHERE a.doctor.doctorId = :doctorId " +
            "AND a.appointmentDate = :appointmentDate " +
            "AND a.startTime = :startTime " +
            "AND a.status <> :status " +
            "AND a.id <> :excludeAppointmentId")
    boolean existsByDoctorIdAndDateTimeAndStatusNotExcludingId(
            @Param("doctorId") Long doctorId,
            @Param("appointmentDate") LocalDate appointmentDate,
            @Param("startTime") LocalTime startTime,
            @Param("status") AppointmentStatus status,
            @Param("excludeAppointmentId") Long excludeAppointmentId
    );

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate = :date AND a.doctor.doctorId = :doctorId")
    long countAppointmentsByDateAndDoctor(@Param("date") LocalDate appointmentDate, @Param("doctorId") Long doctorId);
}
