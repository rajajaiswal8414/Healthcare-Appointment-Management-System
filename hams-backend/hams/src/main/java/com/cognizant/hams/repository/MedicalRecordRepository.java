package com.cognizant.hams.repository;

import com.cognizant.hams.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatient_PatientIdOrderByCreatedAtDesc(Long patientId);
    List<MedicalRecord> findByDoctor_DoctorIdOrderByCreatedAtDesc(Long doctorId);

    List<MedicalRecord> findByPatientPatientId(Long patientId);

    @Query("SELECT mr FROM MedicalRecord mr " +
            "WHERE mr.patient.patientId = :patientId " +
            "AND mr.doctor.doctorId = :doctorId")
    List<MedicalRecord> findByPatientIdAndDoctorId(@Param("patientId") Long patientId,
                                                   @Param("doctorId") Long doctorId);

    @Query("SELECT mr FROM MedicalRecord mr " +
            "WHERE mr.doctor.doctorId = :doctorId")
    List<MedicalRecord> findByDoctorId(@Param("doctorId") Long doctorId);
}