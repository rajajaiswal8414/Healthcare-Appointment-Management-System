package com.cognizant.hams.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills")
@Data
public class Bill {
    @Id
    private Long billId;

    @OneToOne
    @JoinColumn(name = "appointmentId")
    private Appointment appointment;

    @ManyToOne
    @JoinColumn(name = "patientId")
    private Patient patient;

    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal total;
    private String paymentStatus;
    private LocalDateTime dateCreated;
}
