package com.cognizant.hams.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponseDTO {
    private Long prescriptionId;
    private String medicationName;
    private String dosage;
    private String instructions;
    private LocalDateTime prescribedAt;
}