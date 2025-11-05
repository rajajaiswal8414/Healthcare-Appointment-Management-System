package com.cognizant.hams.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "roles")
@Data
public class Role {
    @Id
    private String roleId;
    private String name;
    private String description;
}