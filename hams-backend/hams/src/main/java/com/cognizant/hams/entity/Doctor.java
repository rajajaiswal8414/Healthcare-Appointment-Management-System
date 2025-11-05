package com.cognizant.hams.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long doctorId;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "userId")
    private User user;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private Set<Appointment> appointments = new HashSet<>();

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MedicalRecord> medicalRecords = new ArrayList<>();

    @NotBlank(message = "Doctor name is required")
    @Size(min = 3, max = 25, message = "Name must be between 3 and 25 characters")
    private String doctorName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits")
    @Column(unique = true)
    private String contactNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid Email")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Specialization of a doctor is required")
    @Size(max = 30, message = "Specialization must not exceed 30 characters")
    private String specialization;

    @NotNull(message = "Year of experience is required")
    private Integer yearOfExperience;

    @NotBlank(message = "Medical Qualification is required")
    @Size(max = 60, message = "Qualification should not exceed 100 characters")
    private String qualification;

    @NotBlank(message = "Clinic address is required")
    @Size(max = 255, message = "Address cannot exceed 255 characters")
    private String clinicAddress;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private DoctorStatus status = DoctorStatus.ACTIVE;

    @PrePersist
    protected void onCreate(){
        createdAt = LocalDateTime.now();
    }

    public enum DoctorStatus{
        ACTIVE, INACTIVE, PENDING;
    }
}
