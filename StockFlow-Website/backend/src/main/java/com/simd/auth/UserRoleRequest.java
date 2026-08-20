package com.simd.auth;

import jakarta.validation.constraints.NotNull;

public record UserRoleRequest(@NotNull Role role) {
}
