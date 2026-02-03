<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // positions.department_id -> departments.id
        Schema::table('positions', function (Blueprint $table) {
            $table->foreign('department_id', 'positions_department_id_fk')
                ->references('id')->on('departments')
                ->restrictOnDelete()
                ->cascadeOnUpdate();
        });

        // users.position_id -> positions.id
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('position_id', 'users_position_id_fk')
                ->references('id')->on('positions')
                ->nullOnDelete()
                ->cascadeOnUpdate();
        });

        // payroll_records.employee_id/hr_worker_id -> users.id
        Schema::table('payroll_records', function (Blueprint $table) {
            $table->foreign('employee_id', 'payroll_records_employee_id_fk')
                ->references('id')->on('users')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->foreign('hr_worker_id', 'payroll_records_hr_worker_id_fk')
                ->references('id')->on('users')
                ->restrictOnDelete()
                ->cascadeOnUpdate();
        });

        // performance_reviews.employee_id/hr_worker_id -> users.id
        // performance_reviews.payroll_record_id -> payroll_records.id
        Schema::table('performance_reviews', function (Blueprint $table) {
            $table->foreign('employee_id', 'performance_reviews_employee_id_fk')
                ->references('id')->on('users')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->foreign('hr_worker_id', 'performance_reviews_hr_worker_id_fk')
                ->references('id')->on('users')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->foreign('payroll_record_id', 'performance_reviews_payroll_record_id_fk')
                ->references('id')->on('payroll_records')
                ->restrictOnDelete()
                ->cascadeOnUpdate();
        });

        // sessions.user_id -> users.id (nullable, set null on delete)
        Schema::table('sessions', function (Blueprint $table) {
            $table->foreign('user_id', 'sessions_user_id_fk')
                ->references('id')->on('users')
                ->nullOnDelete()
                ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::table('sessions', function (Blueprint $table) {
            $table->dropForeign('sessions_user_id_fk');
        });

        Schema::table('performance_reviews', function (Blueprint $table) {
            $table->dropForeign('performance_reviews_employee_id_fk');
            $table->dropForeign('performance_reviews_hr_worker_id_fk');
            $table->dropForeign('performance_reviews_payroll_record_id_fk');
        });

        Schema::table('payroll_records', function (Blueprint $table) {
            $table->dropForeign('payroll_records_employee_id_fk');
            $table->dropForeign('payroll_records_hr_worker_id_fk');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign('users_position_id_fk');
        });

        Schema::table('positions', function (Blueprint $table) {
            $table->dropForeign('positions_department_id_fk');
        });
    }
};
