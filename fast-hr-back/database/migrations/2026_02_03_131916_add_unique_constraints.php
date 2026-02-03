<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // users.email unique
        Schema::table('users', function (Blueprint $table) {
            $table->unique('email', 'users_email_unique');
        });

        // departments.name unique (department names should be distinct)
        Schema::table('departments', function (Blueprint $table) {
            $table->unique('name', 'departments_name_unique');
        });

        // positions unique within a department by name
        Schema::table('positions', function (Blueprint $table) {
            $table->unique(['department_id', 'name'], 'positions_department_name_unique');
        });

        // payroll unique per employee per period (one payroll record per month per employee)
        Schema::table('payroll_records', function (Blueprint $table) {
            $table->unique(['employee_id', 'period_year', 'period_month'], 'payroll_employee_period_unique');
        });
    }

    public function down(): void
    {
        Schema::table('payroll_records', function (Blueprint $table) {
            $table->dropUnique('payroll_employee_period_unique');
        });

        Schema::table('positions', function (Blueprint $table) {
            $table->dropUnique('positions_department_name_unique');
        });

        Schema::table('departments', function (Blueprint $table) {
            $table->dropUnique('departments_name_unique');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_email_unique');
        });
    }
};
