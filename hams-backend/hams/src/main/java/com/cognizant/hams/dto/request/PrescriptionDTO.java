package com.cognizant.hams.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDTO {
    @NotBlank
    private String medicationName;
    @NotBlank
    private String dosage;
    private String instructions;
}