<?php

function preview_get_personal(PDO $pdo, int $user_id): array|false {
    $stmt = $pdo->prepare("
        SELECT full_name, email, phone, linkedin_url, address, template_choice
        FROM   personal
        WHERE  user_id = ?
        LIMIT  1
    ");
    $stmt->execute([$user_id]);
    return $stmt->fetch();
}

function preview_get_summary(PDO $pdo, int $user_id): array|false {
    $stmt = $pdo->prepare("
        SELECT professional_summary
        FROM   summaries
        WHERE  user_id = ?
        LIMIT  1
    ");
    $stmt->execute([$user_id]);
    return $stmt->fetch();
}

function preview_get_education(PDO $pdo, int $user_id): array {
    $stmt = $pdo->prepare("
        SELECT institution, degree, field_of_study,
               start_date, end_date, grade_cgpa,
               relevant_courses, honors_achievements, societies
        FROM   education
        WHERE  user_id = ?
        LIMIT  1
    ");
    $stmt->execute([$user_id]);
    return $stmt->fetchAll();
}

function preview_get_experience(PDO $pdo, int $user_id): array {
    $stmt = $pdo->prepare("
        SELECT company, job_title, start_date, end_date, description
        FROM   experience
        WHERE  user_id = ?
        ORDER  BY start_date DESC
    ");
    $stmt->execute([$user_id]);
    return $stmt->fetchAll();
}

function preview_get_skills(PDO $pdo, int $user_id): array {
    $stmt = $pdo->prepare("
        SELECT skill_name
        FROM   skills
        WHERE  user_id = ?
        ORDER  BY id ASC
    ");
    $stmt->execute([$user_id]);
    return $stmt->fetchAll();
}

function preview_get_volunteer(PDO $pdo, int $user_id): array {
    $stmt = $pdo->prepare("
        SELECT organization, role_title, start_date, end_date, description
        FROM   volunteer_experience
        WHERE  user_id = ?
    ");
    $stmt->execute([$user_id]);
    return $stmt->fetchAll();
}