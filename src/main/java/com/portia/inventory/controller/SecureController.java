package com.portia.inventory.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SecureController {

    @GetMapping("/api/secure")
    public String secure() {
        return "JWT Authentication Working!";
    }
}