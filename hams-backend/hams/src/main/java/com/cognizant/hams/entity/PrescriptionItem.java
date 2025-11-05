package com.cognizant.hams.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "prescription_items")
@Data
public class PrescriptionItem {
    @Id
    private String prescriptionItemId;

    @ManyToOne
    @JoinColumn(name = "prescriptionId")
    private Prescription prescription;

    @ManyToOne
    @JoinColumn(name = "medicationId")
    private Medication medication;

    private String dosage;
    private String instructions;
}