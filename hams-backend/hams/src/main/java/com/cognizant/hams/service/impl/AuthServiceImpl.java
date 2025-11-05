package com.cognizant.hams.service.impl;

import com.cognizant.hams.config.RoleConstants;
import com.cognizant.hams.dto.request.AdminUserRequestDTO;
import com.cognizant.hams.dto.request.AuthRequest;
import com.cognizant.hams.entity.Doctor;
import com.cognizant.hams.entity.Patient;
import com.cognizant.hams.entity.Role;
import com.cognizant.hams.entity.User;
import com.cognizant.hams.exception.APIException;
import com.cognizant.hams.exception.InvalidCredentialsException;
import com.cognizant.hams.exception.UserAlreadyExistsException;
import com.cognizant.hams.repository.DoctorRepository;
import com.cognizant.hams.repository.PatientRepository;
import com.cognizant.hams.repository.RoleRepository;
import com.cognizant.hams.repository.UserRepository;
import com.cognizant.hams.security.JwtTokenUtil;
import com.cognizant.hams.service.AuthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final PatientRepository patientRepository;


    @Override
    public String createAuthenticationToken(String username, String password) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        } catch (DisabledException e) {
            throw new InvalidCredentialsException("USER_DISABLED");
        } catch (BadCredentialsException e) {
            throw new InvalidCredentialsException("INVALID_CREDENTIALS");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        return jwtTokenUtil.generateToken(userDetails);
    }

    @Override
    public Patient registerNewUser(AuthRequest requestedUser) {
        Optional<User> existingUser = userRepository.findByUsername(requestedUser.getUsername());
        if (existingUser.isPresent()) {
            throw new UserAlreadyExistsException("User with this username already exists.");
        }

        Role role = roleRepository.findByName("PATIENT")
                .orElseThrow(() -> new APIException("Default role 'PATIENT' not found. Please seed the database."));
        User newUser = new User();
        newUser.setUsername(requestedUser.getUsername());
        newUser.setPassword(requestedUser.getPassword());
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        newUser.setRole(role);
        User savedUser=userRepository.save(newUser);
        Patient patient=new Patient();
        patient.setUser(newUser);
        patient.setEmail(requestedUser.getEmail());
        patient.setContactNumber(requestedUser.getContactNumber());
        patient.setAddress(requestedUser.getAddress());
        patient.setName(requestedUser.getName());
        patient.setGender(requestedUser.getGender());
        patient.setBloodGroup(requestedUser.getBloodGroup());
        patient.setDateOfBirth(requestedUser.getDateOfBirth());
        return patientRepository.save(patient);
    }

    @Transactional
    @Override
    // Ensures both User and Doctor are created atomically
    public Doctor createPrivilegedUser(AdminUserRequestDTO request) {
        // 1. Check if the username already exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Username '" + request.getUsername() + "' is already taken.");
        }

        // 2. Fetch the 'DOCTOR' role
        Role doctorRole = roleRepository.findByName(RoleConstants.ROLE_DOCTOR)
                .orElseThrow(() -> new APIException(HttpStatus.INTERNAL_SERVER_ERROR, "Required role DOCTOR not found in database."));

        // 3. Create and persist the User entity
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(doctorRole);
        User savedUser = userRepository.save(user);

        // 4. Create and persist the Doctor entity linked to the new User
        Doctor doctor = new Doctor();
        doctor.setUser(savedUser); // Link the new User to the Doctor profile
        doctor.setDoctorName(request.getDoctorName());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setQualification(request.getQualification());
        doctor.setClinicAddress(request.getClinicAddress());
        doctor.setYearOfExperience(request.getYearOfExperience());
        doctor.setContactNumber(request.getContactNumber());
        doctor.setEmail(request.getEmail());

        return doctorRepository.save(doctor);
    }
}