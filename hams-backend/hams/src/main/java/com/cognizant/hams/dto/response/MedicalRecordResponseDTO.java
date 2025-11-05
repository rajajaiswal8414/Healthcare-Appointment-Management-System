package com.cognizant.hams.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor

public class MedicalRecordResponseDTO {
    private Long recordId;
    private Long patientId;
    private Long doctorId;
    private String patientName;
    private String doctorName;
    private String reason;
    private String diagnosis;
    private String notes;
    private List<PrescriptionResponseDTO> prescriptions;
    private LocalDateTime createdAt;
}
