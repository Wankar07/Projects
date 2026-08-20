package com.simd.auth;

import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public List<UserSummary> getUsers() {
        return userRepository.findAll().stream()
                .map(UserSummary::from)
                .toList();
    }

    @PutMapping("/{id}/role")
    public UserSummary updateRole(@PathVariable Long id, @Valid @RequestBody UserRoleRequest request,
                                  Authentication authentication) {
        User target = findUser(id);
        protectCurrentAccount(target, authentication, "change your own role");
        target.setRole(request.role());
        return UserSummary.from(userRepository.save(target));
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteUser(@PathVariable Long id, Authentication authentication) {
        User target = findUser(id);
        protectCurrentAccount(target, authentication, "delete your own account");
        userRepository.delete(target);
        return Map.of("message", "User deleted successfully");
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private void protectCurrentAccount(User target, Authentication authentication, String action) {
        if (authentication != null && target.getUsername().equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot " + action);
        }
    }
}
