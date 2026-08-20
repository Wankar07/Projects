package com.simd.config;

import com.simd.auth.CustomUserDetailsService;
import com.simd.auth.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
                "http://127.0.0.1:*",
                "http://localhost:*",
                // LAN origins are needed when StockFlow is opened from a phone
                // or another device on the same Wi-Fi network.
                "http://192.168.*:*",
                "http://10.*:*",
                "http://172.16.*:*"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Public: login page/assets + the login endpoint itself
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/assets/**",
                                "/favicon.ico",
                                "/login",
                                "/register",
                                "/dashboard",
                                "/products",
                                "/sales",
                                "/inventory",
                                "/reports",
                                "/insights",
                                "/users",
                                "/settings"
                        ).permitAll()
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()

                        // Everything else under /api/auth requires a valid token (e.g. /api/auth/me)
                        .requestMatchers("/api/auth/**").authenticated()

                        // User management is admin-only.
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // Workspace settings are durable and can only be changed by an admin.
                        .requestMatchers("/api/settings/**").hasRole("ADMIN")

                        // Inventory AI insights are available to operational roles only
                        .requestMatchers("/api/ai/**").hasAnyRole("ADMIN", "MANAGER")

                        // Product management: ADMIN and MANAGER; deletion remains ADMIN only
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                        // Inventory management: ADMIN and MANAGER only
                        .requestMatchers("/api/inventory/**").hasAnyRole("ADMIN", "MANAGER")

                        // All authenticated roles (ADMIN, MANAGER, STAFF) can view data and create sales
                        .requestMatchers(HttpMethod.GET, "/api/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/sales").authenticated()

                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
