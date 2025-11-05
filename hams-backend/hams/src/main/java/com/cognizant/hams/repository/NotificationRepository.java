package com.cognizant.hams.repository;

import com.cognizant.hams.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientTypeAndRecipientIdOrderByCreatedAtDesc(Notification.RecipientType recipientType, Long recipientId);

//    @Modifying
//    @Query("UPDATE Notification n SET n.read = true WHERE n.read = false AND n.patient.user.username = :username")
//    int markAllUnreadByUsername(@Param("username") String username);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipientType = 'DOCTOR' AND n.recipientId = :doctorId AND n.read = false")
    int markAllUnreadForDoctor(@Param("doctorId") Long doctorId);

    // NEW: Bulk update query for Patients
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipientType = 'PATIENT' AND n.recipientId = :patientId AND n.read = false")
    int markAllUnreadForPatient(@Param("patientId") Long patientId);

    long countByRecipientTypeAndRecipientIdAndReadFalse(Notification.RecipientType recipientType, Long recipientId);

}
