package com.simd.settings;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class AppSettingsController {
    private final AppSettingsService service;

    @GetMapping
    public AppSettings getSettings() { return service.get(); }

    @PutMapping
    public AppSettings saveSettings(@RequestBody AppSettings settings) { return service.save(settings); }
}
