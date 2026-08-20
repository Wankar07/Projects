package com.simd.auth;

public record UserSummary(
        Long id,
        String username,
        String fullName,
        String role,
        Boolean active
) {
    public static UserSummary from(User user) {
        return new UserSummary(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getRole().name(),
                user.getActive()
        );
    }
}
