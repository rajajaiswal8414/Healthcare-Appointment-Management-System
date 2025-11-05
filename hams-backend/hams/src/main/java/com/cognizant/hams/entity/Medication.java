package com.cognizant.hams.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "medications")
@Data
public class Medication {
    @Id
    private String medicationId;
    private String name;
    private String description;
    private String image;
}
