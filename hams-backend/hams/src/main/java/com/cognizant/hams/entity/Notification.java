package com.cognizant.hams.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @Column(name = "recipient_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private RecipientType recipientType;

    @Column(name = "recipient_id", nullable = false)
    private Long recipientId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false, length = 1000)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "isread", nullable = false)
    private boolean read = false;

    public enum RecipientType{
        DOCTOR,
        PATIENT
    }
}
