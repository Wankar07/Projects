package com.simd.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String username = request.getUsername().trim();

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username is already registered"));
        }

        User user = userRepository.save(User.builder()
                .username(username)
                .fullName(request.getFullName().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STAFF)
                .active(true)
                .build());

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.status(HttpStatus.CREATED).body(new LoginResponse(
                token, user.getUsername(), user.getFullName(), user.getRole().name()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }

        CustomUserDetails userDetails =
                (CustomUserDetails) userDetailsService.loadUserByUsername(request.getUsername());
        User user = userDetails.getUser();

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        return ResponseEntity.ok(new LoginResponse(
                token, user.getUsername(), user.getFullName(), user.getRole().name()
        ));
    }

    // Lets the frontend verify an existing token on page load and re-fetch user info
    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);
        User user = ((CustomUserDetails) userDetailsService.loadUserByUsername(username)).getUser();
        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "fullName", user.getFullName(),
                "role", user.getRole().name()
        ));
    }
}
