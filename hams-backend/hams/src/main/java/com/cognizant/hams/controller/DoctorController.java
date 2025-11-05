package com.cognizant.hams.controller;

import com.cognizant.hams.dto.response.DoctorResponseDTO;
import com.cognizant.hams.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorResponseDTO> getDoctor(){
        DoctorResponseDTO doctor = doctorService.getDoctor();
        return new ResponseEntity<>(doctor,HttpStatus.OK);
    }
}
