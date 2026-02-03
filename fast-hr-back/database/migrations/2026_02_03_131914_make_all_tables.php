<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /**
         * DEPARTMENTS
         */
        Schema::create('departments', function (Blueprint $table) {
            $table->comment('Organizational departments (e.g., HR, Finance, IT).');

            $table->id()->comment('Primary key.');
            $table->string('name')->comment('Department name (e.g., Human Resources, Finance, IT).');
            $table->text('description')->nullable()->comment('Optional description of purpose/responsibilities.');

            $table->timestamps();
        });

        /**
         * POSITIONS
         */
        Schema::create('positions', function (Blueprint $table) {
            $table->comment('Job positions within departments.');

            $table->id()->comment('Primary key.');
            $table->unsignedBigInteger('department_id')->index()->comment('FK to departments.id (logical department link).');

            $table->string('name')->comment('Position title/name.');
            $table->string('seniority_level')->comment('Seniority level (e.g., junior, mid, senior, lead).');

            $table->decimal('min_salary', 12, 2)->comment('Typical minimum salary for the position.');
            $table->decimal('max_salary', 12, 2)->comment('Typical maximum salary for the position.');

            $table->json('default_benefits')->nullable()->comment('Default benefits package (JSON).');

            $table->timestamps();
        });

        /**
         * USERS (Aligned to your User model)
         * Keep remember_token + timestamps (standard auth usage).
         */
        Schema::create('users', function (Blueprint $table) {
            $table->comment('System users; also represents people in the organization (employees, hr_workers, admins).');

            $table->id()->comment('Primary key.');
            $table->string('email')->comment('User email (unique constraint added in separate migration).');
            $table->string('password')->comment('Hashed password.');

            $table->string('role')->comment('User role (e.g., employee, hr_worker, admin).');
            $table->boolean('status')->default(true)->comment('Account status (active/inactive).');

            $table->string('image_url')->nullable()->comment('Profile image URL for visual identification.');
            $table->unsignedBigInteger('position_id')->nullable()->index()->comment('FK to positions.id (required for employees, nullable otherwise).');

            $table->rememberToken()->comment('Remember token for authentication.');
            $table->timestamps();
        });

        /**
         * PAYROLL RECORDS
         */
        Schema::create('payroll_records', function (Blueprint $table) {
            $table->comment('Payroll calculations per employee per period (salary, bonus, overtime, benefits, deductions, net).');

            $table->id()->comment('Primary key.');

            $table->unsignedBigInteger('employee_id')->index()->comment('FK to users.id (employee).');
            $table->unsignedBigInteger('hr_worker_id')->index()->comment('FK to users.id (HR worker who processed/approved).');

            $table->unsignedSmallInteger('period_year')->comment('Payroll year (e.g., 2026).');
            $table->unsignedTinyInteger('period_month')->comment('Payroll month (1-12).');

            $table->decimal('base_salary', 12, 2)->comment('Base salary amount.');
            $table->decimal('bonus_amount', 12, 2)->default(0)->comment('Bonus amount (0 if none).');
            $table->decimal('overtime_amount', 12, 2)->default(0)->comment('Overtime amount (0 if none).');

            $table->string('status')->default('draft')->comment('Payroll status (e.g., draft, approved, paid).');

            $table->decimal('benefits_amount', 12, 2)->default(0)->comment('Additional benefits value (monetary).');
            $table->decimal('deductions_amount', 12, 2)->default(0)->comment('Total deductions amount.');

            $table->decimal('net_amount', 12, 2)->nullable()->comment('Final net amount (optional; can be computed/stored).');

            $table->timestamps();
        });

        /**
         * PERFORMANCE REVIEWS
         */
        Schema::create('performance_reviews', function (Blueprint $table) {
            $table->comment('Formal performance evaluations for employees, created by HR workers.');

            $table->id()->comment('Primary key.');

            $table->unsignedBigInteger('employee_id')->index()->comment('FK to users.id (employee being reviewed).');
            $table->unsignedBigInteger('hr_worker_id')->index()->comment('FK to users.id (HR worker who created the review).');

            $table->unsignedBigInteger('payroll_record_id')->index()->comment('FK to payroll_records.id (payroll record linked to the review).');

            $table->date('period_start')->comment('Review period start date.');
            $table->date('period_end')->comment('Review period end date.');

            $table->decimal('overall_score', 5, 2)->comment('Numeric score for the review.');
            $table->text('comments')->nullable()->comment('Qualitative feedback / comments.');
            $table->text('goals')->nullable()->comment('Goals for next period.');

            $table->boolean('hasSalaryImpact')->default(false)->comment('Whether this review impacts salary/bonus.');

            $table->timestamps();
        });

        /**
         * DEFAULT LARAVEL TABLES (kept)
         */
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->comment('Password reset tokens (Laravel default).');

            $table->string('email')->primary()->comment('User email (primary key).');
            $table->string('token')->comment('Reset token.');
            $table->timestamp('created_at')->nullable()->comment('Token creation timestamp.');
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->comment('Sessions table (Laravel default).');

            $table->string('id')->primary()->comment('Session id.');
            $table->unsignedBigInteger('user_id')->nullable()->index()->comment('FK to users.id (nullable).');

            $table->string('ip_address', 45)->nullable()->comment('IP address.');
            $table->text('user_agent')->nullable()->comment('User agent string.');
            $table->longText('payload')->comment('Session payload.');
            $table->integer('last_activity')->index()->comment('Last activity timestamp (int).');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');

        Schema::dropIfExists('performance_reviews');
        Schema::dropIfExists('payroll_records');

        Schema::dropIfExists('users');
        Schema::dropIfExists('positions');
        Schema::dropIfExists('departments');
    }
};
