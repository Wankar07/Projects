package com.simd.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendRouteController {

    @GetMapping({
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
    })
    public String forwardReactRoutes() {
        return "forward:/index.html";
    }
}
