package com.simd.auth;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "app_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    private String fullName;

    @Column(nullable = false)
    private String password; // BCrypt-hashed, never store plain text

    @Enumerated(EnumType.STRING)
    private Role role;

    @Builder.Default
    private Boolean active = true;
}
