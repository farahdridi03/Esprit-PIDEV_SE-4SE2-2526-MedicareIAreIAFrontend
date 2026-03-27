package com.aziz.demosec.dto;

import jakarta.validation.constraints.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabResultRequest {

    @NotNull(message = "Lab request ID is required")
    @Positive(message = "Lab request ID must be a positive number")
    @Min(value = 1, message = "Lab request ID must be at least 1")
    private Long labRequestId;

    @NotBlank(message = "Result data is required")
    @Size(min = 10, max = 2000, message = "Result data must be between 10 and 2000 characters")
    @Pattern(
        regexp = "^[\\s\\S]*[^\\s][\\s\\S]*$",
        message = "Result data cannot be only whitespace"
    )
    private String resultData;

    @NotBlank(message = "Technician name is required")
    @Size(min = 3, max = 100, message = "Technician name must be between 3 and 100 characters")
    @Pattern(
        regexp = "^[a-zA-Z\\s\\-']+$",
        message = "Technician name can only contain letters, spaces, hyphens, and apostrophes"
    )
    private String technicianName;

    @NotNull(message = "Is abnormal flag is required")
    @Builder.Default
    private Boolean isAbnormal = false;

    @NotBlank(message = "Status is required")
    @Pattern(
        regexp = "^(PENDING|COMPLETED|VERIFIED|ABNORMAL)$",
        message = "Status must be PENDING, COMPLETED, VERIFIED, or ABNORMAL"
    )
    @Builder.Default
    private String status = "PENDING";

    @Size(max = 1000, message = "Abnormal findings must not exceed 1000 characters")
    @Pattern(
        regexp = "^[\\s\\S]*[^\\s][\\s\\S]*$",
        message = "Abnormal findings cannot be only whitespace when provided"
    )
    private String abnormalFindings;

    @Size(max = 100, message = "Verified by must not exceed 100 characters")
    @Pattern(
        regexp = "^[a-zA-Z\\s\\-']*$",
        message = "Verified by can only contain letters, spaces, hyphens, and apostrophes"
    )
    private String verifiedBy;

    // Custom validation method for conditional fields
    @AssertTrue(message = "Abnormal findings are required when result is marked as abnormal")
    private boolean isAbnormalFindingsValid() {
        if (Boolean.TRUE.equals(isAbnormal)) {
            return abnormalFindings != null && !abnormalFindings.trim().isEmpty();
        }
        return true;
    }

    @AssertTrue(message = "Verified by is required when status is VERIFIED")
    private boolean isVerifiedByValid() {
        if ("VERIFIED".equals(status)) {
            return verifiedBy != null && !verifiedBy.trim().isEmpty();
        }
        return true;
    }
}
