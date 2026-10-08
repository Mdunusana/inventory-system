package com.portia.inventory.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * The wrapper around a report:
 * its title, when it was made,
 * the settings used,
 * and the rows.
 */
public record ReportResponse<T>(
        String title,
        LocalDateTime generatedAt,
        Map<String, String> parameters,
        List<T> rows
) {
}