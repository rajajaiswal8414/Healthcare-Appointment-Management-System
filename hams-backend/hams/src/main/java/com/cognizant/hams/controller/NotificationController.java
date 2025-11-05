package com.cognizant.hams.controller;

import com.cognizant.hams.dto.response.NotificationResponseDTO;
import com.cognizant.hams.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/patients/me/notifications")
    public ResponseEntity<List<NotificationResponseDTO>> getPatientNotifications(){
        return ResponseEntity.ok(notificationService.getNotificationForPatient());
    }

    @GetMapping("/doctors/me/notifications")
    public ResponseEntity<List<NotificationResponseDTO>> getNotificationsForDoctor() {
        List<NotificationResponseDTO> notifications = notificationService.getNotificationForDoctor();
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable("notificationId") Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

//    @PutMapping("notifications/read-all")
//    public ResponseEntity<Void> markAllAsRead() {
//        // We pass the currently authenticated user's ID/details to the service
//        // Assuming you have a utility to get the current authenticated patient ID or username
//        // For simplicity, we'll use SecurityContextHolder to get the username.
//        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
//
//        notificationService.markAllAsRead(currentUsername);
//        return ResponseEntity.ok().build();
//    }

    @PutMapping("/notifications/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/notifications/count")
    public ResponseEntity<Long> getUnreadNotificationCount() {
        long count = notificationService.getUnreadNotificationCount();
        return ResponseEntity.ok(count);
    }
}
