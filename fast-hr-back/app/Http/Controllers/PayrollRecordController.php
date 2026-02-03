<?php

namespace App\Http\Controllers;

use App\Http\Resources\PayrollRecordResource;
use App\Models\PayrollRecord;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PayrollRecordController extends Controller
{
    private function ok(string $message, $data = null, int $code = 200)
    {
        return response()->json(['success' => true, 'message' => $message, 'data' => $data], $code);
    }

    public function index(Request $request)
    {
        $q = PayrollRecord::query()->with(['employee', 'hrWorker'])->orderByDesc('period_year')->orderByDesc('period_month');

        if ($request->filled('employee_id')) {
            $q->where('employee_id', $request->integer('employee_id'));
        }
        if ($request->filled('period_year')) {
            $q->where('period_year', $request->integer('period_year'));
        }
        if ($request->filled('period_month')) {
            $q->where('period_month', $request->integer('period_month'));
        }
        if ($request->filled('status')) {
            $q->where('status', $request->string('status'));
        }

        $items = $q->get();

        return $this->ok('Payroll records list.', [
            'items' => PayrollRecordResource::collection($items),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:users,id'],
            'hr_worker_id' => ['required', 'integer', 'exists:users,id'],

            'period_year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'period_month' => ['required', 'integer', 'min:1', 'max:12'],

            'base_salary' => ['required', 'numeric', 'min:0'],
            'bonus_amount' => ['nullable', 'numeric', 'min:0'],
            'overtime_amount' => ['nullable', 'numeric', 'min:0'],
            'benefits_amount' => ['nullable', 'numeric', 'min:0'],
            'deductions_amount' => ['nullable', 'numeric', 'min:0'],
            'net_amount' => ['nullable', 'numeric'],

            'status' => ['required', Rule::in(['draft', 'approved', 'paid'])],
        ]);

        // Lagano: ako net nije poslat, izračunaj.
        if (! isset($validated['net_amount'])) {
            $base = (float) $validated['base_salary'];
            $bonus = (float) ($validated['bonus_amount'] ?? 0);
            $ot = (float) ($validated['overtime_amount'] ?? 0);
            $ben = (float) ($validated['benefits_amount'] ?? 0);
            $ded = (float) ($validated['deductions_amount'] ?? 0);
            $validated['net_amount'] = ($base + $bonus + $ot + $ben) - $ded;
        }

        $record = PayrollRecord::create($validated);

        return $this->ok('Payroll record created.', [
            'payroll_record' => new PayrollRecordResource($record->load(['employee', 'hrWorker'])),
        ], 201);
    }

    public function show(PayrollRecord $payrollRecord)
    {
        return $this->ok('Payroll record details.', [
            'payroll_record' => new PayrollRecordResource($payrollRecord->load(['employee', 'hrWorker'])),
        ]);
    }

    public function update(Request $request, PayrollRecord $payrollRecord)
    {
        $validated = $request->validate([
            'employee_id' => ['sometimes', 'required', 'integer', 'exists:users,id'],
            'hr_worker_id' => ['sometimes', 'required', 'integer', 'exists:users,id'],

            'period_year' => ['sometimes', 'required', 'integer', 'min:2000', 'max:2100'],
            'period_month' => ['sometimes', 'required', 'integer', 'min:1', 'max:12'],

            'base_salary' => ['sometimes', 'required', 'numeric', 'min:0'],
            'bonus_amount' => ['nullable', 'numeric', 'min:0'],
            'overtime_amount' => ['nullable', 'numeric', 'min:0'],
            'benefits_amount' => ['nullable', 'numeric', 'min:0'],
            'deductions_amount' => ['nullable', 'numeric', 'min:0'],
            'net_amount' => ['nullable', 'numeric'],

            'status' => ['sometimes', 'required', Rule::in(['draft', 'approved', 'paid'])],
        ]);

        // Ako se menja neka stavka, a net nije eksplicitno poslat, preračunaj net.
        $touchesMoney =
            array_key_exists('base_salary', $validated) ||
            array_key_exists('bonus_amount', $validated) ||
            array_key_exists('overtime_amount', $validated) ||
            array_key_exists('benefits_amount', $validated) ||
            array_key_exists('deductions_amount', $validated);

        if ($touchesMoney && ! array_key_exists('net_amount', $validated)) {
            $base = (float) ($validated['base_salary'] ?? $payrollRecord->base_salary);
            $bonus = (float) ($validated['bonus_amount'] ?? $payrollRecord->bonus_amount);
            $ot = (float) ($validated['overtime_amount'] ?? $payrollRecord->overtime_amount);
            $ben = (float) ($validated['benefits_amount'] ?? $payrollRecord->benefits_amount);
            $ded = (float) ($validated['deductions_amount'] ?? $payrollRecord->deductions_amount);

            $validated['net_amount'] = ($base + $bonus + $ot + $ben) - $ded;
        }

        $payrollRecord->update($validated);

        return $this->ok('Payroll record updated.', [
            'payroll_record' => new PayrollRecordResource($payrollRecord->load(['employee', 'hrWorker'])),
        ]);
    }

    public function destroy(PayrollRecord $payrollRecord)
    {
        $payrollRecord->delete();

        return $this->ok('Payroll record deleted.', null);
    }

    public function stats(Request $request)
    {
        $year = $request->integer('year', now()->year);

        $baseSum = PayrollRecord::where('period_year', $year)->sum('base_salary');
        $netSum = PayrollRecord::where('period_year', $year)->sum('net_amount');
        $count = PayrollRecord::where('period_year', $year)->count();

        $byStatus = PayrollRecord::selectRaw('status, COUNT(*) as count')
            ->where('period_year', $year)
            ->groupBy('status')
            ->orderByDesc('count')
            ->get();

        return $this->ok('Payroll stats.', [
            'year' => $year,
            'records_count' => $count,
            'sum_base_salary' => $baseSum,
            'sum_net_amount' => $netSum,
            'records_by_status' => $byStatus,
        ]);
    }
}
