package com.simd.settings;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AppSettingsRepository extends JpaRepository<AppSettings, Long> {
}
