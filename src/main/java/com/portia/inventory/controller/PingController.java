package com.portia.inventory.controller;   // must match YOUR package and folder names

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Our first endpoint. It only proves that the application is running and
 * that HTTP requests reach a controller. We will replace nothing here;
 * it simply stays as a handy "is the server alive?" check.
 */
@RestController                 // this class handles web requests and returns data (JSON)
@RequestMapping("/api")         // every URL in this class starts with /api
public class PingController {

    @GetMapping("/ping")        // responds to: GET http://localhost:8080/api/ping
    public Map<String, String> ping() {
        return Map.of("status", "UP");
    }
}
