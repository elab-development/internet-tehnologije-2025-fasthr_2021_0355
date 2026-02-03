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
            $table->string('name')->comment('Department name.');
            $table->text('description')->nullable()->comment('Optional department description.');
            $table->timestamps();
        });

        /**
         * POSITIONS
         */
        Schema::create('positions', function (Blueprint $table) {
            $table->comment('Job positions within departments.');

            $table->id()->comment('Primary key.');
            $table->unsignedBigInteger('department_id')->index()->comment('FK to departments.id.');

            $table->string('name')->comment('Position name/title.');
            $table->string('seniority_level')->comment('Seniority level (junior/mid/senior/lead).');

            $table->decimal('min_salary', 12, 2)->comment('Typical min salary.');
            $table->decimal('max_salary', 12, 2)->comment('Typical max salary.');

            $table->json('default_benefits')->nullable()->comment('Default benefits JSON.');

            $table->timestamps();
        });

        /**
         * USERS (DEFAULT TABELA VEĆ POSTOJI) -> samo dodajemo kolone da se poklopi sa modelom.
         * Ne diramo postojeće default kolone (name, email_verified_at) da ostane lagano.
         */
        Schema::table('users', function (Blueprint $table) {
            $table->comment('System users; also represents employees/hr/admins.');

            $table->string('role')->after('password')->comment('User role (employee/hr_worker/admin).');
            $table->boolean('status')->default(true)->after('role')->comment('Active/inactive account.');
            $table->string('image_url')->nullable()->after('status')->comment('Profile image URL.');
            $table->unsignedBigInteger('position_id')->nullable()->after('image_url')->index()->comment('FK to positions.id (required for employees).');
        });

        /**
         * PAYROLL RECORDS
         */
        Schema::create('payroll_records', function (Blueprint $table) {
            $table->comment('Payroll calculations per employee per period.');

            $table->id()->comment('Primary key.');

            $table->unsignedBigInteger('employee_id')->index()->comment('FK to users.id (employee).');
            $table->unsignedBigInteger('hr_worker_id')->index()->comment('FK to users.id (HR worker).');

            $table->unsignedSmallInteger('period_year')->comment('Payroll year.');
            $table->unsignedTinyInteger('period_month')->comment('Payroll month (1-12).');

            $table->decimal('base_salary', 12, 2)->comment('Base salary.');
            $table->decimal('bonus_amount', 12, 2)->default(0)->comment('Bonus amount.');
            $table->decimal('overtime_amount', 12, 2)->default(0)->comment('Overtime amount.');

            $table->string('status')->default('draft')->comment('draft/approved/paid.');

            $table->decimal('benefits_amount', 12, 2)->default(0)->comment('Benefits amount.');
            $table->decimal('deductions_amount', 12, 2)->default(0)->comment('Deductions amount.');
            $table->decimal('net_amount', 12, 2)->nullable()->comment('Net salary.');

            $table->timestamps();
        });

        /**
         * PERFORMANCE REVIEWS
         */
        Schema::create('performance_reviews', function (Blueprint $table) {
            $table->comment('Performance reviews for employees, created by HR workers.');

            $table->id()->comment('Primary key.');

            $table->unsignedBigInteger('employee_id')->index()->comment('FK to users.id (employee).');
            $table->unsignedBigInteger('hr_worker_id')->index()->comment('FK to users.id (HR worker).');

            $table->unsignedBigInteger('payroll_record_id')->index()->comment('FK to payroll_records.id.');

            $table->date('period_start')->comment('Review period start.');
            $table->date('period_end')->comment('Review period end.');

            $table->decimal('overall_score', 5, 2)->comment('Numeric score.');
            $table->text('comments')->nullable()->comment('Comments.');
            $table->text('goals')->nullable()->comment('Goals.');

            $table->boolean('hasSalaryImpact')->default(false)->comment('Salary impact flag.');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_reviews');
        Schema::dropIfExists('payroll_records');

        // Ne dropujemo users jer je default Laravel tabela.
        // Samo uklanjamo kolone koje smo dodali.
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'status', 'image_url', 'position_id']);
        });

        Schema::dropIfExists('positions');
        Schema::dropIfExists('departments');
    }
};
