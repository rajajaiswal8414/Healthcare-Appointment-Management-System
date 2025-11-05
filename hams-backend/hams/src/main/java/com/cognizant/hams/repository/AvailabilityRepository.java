package com.cognizant.hams.repository;

import com.cognizant.hams.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

}
