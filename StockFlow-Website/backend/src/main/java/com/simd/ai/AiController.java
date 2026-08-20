package com.simd.ai;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final InventoryAiService inventoryAiService;

    @PostMapping("/chat")
    public AiChatResponse chat(@Valid @RequestBody AiChatRequest request) {
        return inventoryAiService.answer(request.message());
    }
}
