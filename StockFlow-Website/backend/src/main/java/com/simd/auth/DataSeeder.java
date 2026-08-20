package com.simd.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createIfMissing("admin", "Admin User", "admin123", Role.ADMIN);
        createIfMissing("manager", "Manager User", "manager123", Role.MANAGER);
        createIfMissing("staff", "Staff User", "staff123", Role.STAFF);
    }

    private void createIfMissing(String username, String fullName, String rawPassword, Role role) {
        if (userRepository.existsByUsername(username)) return;
        User user = User.builder()
                .username(username)
                .fullName(fullName)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .active(true)
                .build();
        userRepository.save(user);
        System.out.println("Seeded default user: " + username + " / " + rawPassword + " (" + role + ")");
    }
}
