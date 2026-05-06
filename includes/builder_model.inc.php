<?php

function save_cv_data(
    $pdo,
    $user_id,
    $full_name, $email, $phone, $linkedin, $address,
    $summary,
    $institution, $degree, $field, $edu_start, $edu_end, $cgpa,
    $company, $job_title, $exp_start, $exp_end, $description,
    $skills,
    $vol_org, $vol_role, $vol_start, $vol_end, $vol_description,
    $relevant_courses, $honors_achievements, $societies
) {
    $template = $_POST['template_choice'] ?? 'classic';

    // PERSONAL (PostgreSQL Upsert)
    $stmt = $pdo->prepare("INSERT INTO personal 
        (user_id, full_name, email, phone, linkedin_url, address, template_choice)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (user_id) DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        linkedin_url = EXCLUDED.linkedin_url,
        address = EXCLUDED.address,
        template_choice = EXCLUDED.template_choice");
    $stmt->execute([$user_id, $full_name, $email, $phone, $linkedin, $address, $template]);

    // SUMMARY
    $stmt = $pdo->prepare("INSERT INTO summaries 
        (user_id, professional_summary)
        VALUES (?, ?)
        ON CONFLICT (user_id) DO UPDATE SET 
        professional_summary = EXCLUDED.professional_summary");
    $stmt->execute([$user_id, $summary]);

    // EDUCATION
    $stmt = $pdo->prepare("INSERT INTO education 
        (user_id, institution, degree, field_of_study, start_date, end_date, grade_cgpa, 
         relevant_courses, honors_achievements, societies)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (user_id) DO UPDATE SET 
        institution = EXCLUDED.institution,
        degree = EXCLUDED.degree,
        field_of_study = EXCLUDED.field_of_study,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        grade_cgpa = EXCLUDED.grade_cgpa,
        relevant_courses = EXCLUDED.relevant_courses,
        honors_achievements = EXCLUDED.honors_achievements,
        societies = EXCLUDED.societies");
    $stmt->execute([$user_id, $institution, $degree, $field, $edu_start, $edu_end, $cgpa, 
                    $relevant_courses, $honors_achievements, $societies]);

    // EXPERIENCE
    $stmt = $pdo->prepare("INSERT INTO experience 
        (user_id, company, job_title, start_date, end_date, description)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT (user_id) DO UPDATE SET 
        company = EXCLUDED.company,
        job_title = EXCLUDED.job_title,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        description = EXCLUDED.description");
    $stmt->execute([$user_id, $company, $job_title, $exp_start, $exp_end, $description]);

    // SKILLS
    $stmt = $pdo->prepare("DELETE FROM skills WHERE user_id = ?");
    $stmt->execute([$user_id]);
    
    if (!empty($skills)) {
        $stmt = $pdo->prepare("INSERT INTO skills (user_id, skill_name) VALUES (?, ?)");
        foreach ($skills as $skill) {
            $stmt->execute([$user_id, $skill]);
        }
    }

    // VOLUNTEER EXPERIENCE
    $stmt = $pdo->prepare("DELETE FROM volunteer_experience WHERE user_id = ?");
    $stmt->execute([$user_id]);
    
    if (!empty($vol_org)) {
        $stmt = $pdo->prepare("INSERT INTO volunteer_experience 
            (user_id, organization, role_title, start_date, end_date, description)
            VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$user_id, $vol_org, $vol_role, $vol_start, $vol_end, $vol_description]);
    }
}