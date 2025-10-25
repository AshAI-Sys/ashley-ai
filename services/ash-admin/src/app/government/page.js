"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GovernmentReportsPage;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
function GovernmentReportsPage() {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [contributionCalc, setContributionCalc] = (0, react_1.useState)(null);
    const [vatCalc, setVatCalc] = (0, react_1.useState)(null);
    const calculateContributions = async () => {
        setLoading(true);
        try {
            const salary = document.getElementById("salary")
                .value;
            const res = await fetch(`/api/government/reports?monthly_salary=${salary}`);
            const data = await res.json();
            setContributionCalc(data);
        }
        catch (error) {
            console.error("Error calculating contributions:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const calculateVAT = async () => {
        setLoading(true);
        try {
            const amount = document.getElementById("vat_amount")
                .value;
            const operation = document.getElementById("vat_operation").value;
            const res = await fetch(`/api/government/bir?operation=${operation}&amount=${amount}`);
            const data = await res.json();
            setVatCalc(data);
        }
        catch (error) {
            console.error("Error calculating VAT:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const generateReport = async (agency) => {
        setLoading(true);
        try {
            const period = document.getElementById("report_period").value;
            const res = await fetch("/api/government/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agency,
                    period,
                    workspace_id: "demo-workspace",
                }),
            });
            const data = await res.json();
            // Download as JSON for now (can be enhanced to CSV/Excel)
            const blob = new Blob([JSON.stringify(data.report, null, 2)], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${agency}_${period}_report.json`;
            a.click();
        }
        catch (error) {
            console.error("Error generating report:", error);
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Government Compliance</h1>
          <p className="text-muted-foreground">
            BIR, SSS, PhilHealth, and Pag-IBIG reports
          </p>
        </div>
      </div>

      <tabs_1.Tabs defaultValue="calculator" className="space-y-6">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="calculator">
            <lucide_react_1.Calculator className="mr-2 h-4 w-4"/>
            Calculator
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="reports">
            <lucide_react_1.FileText className="mr-2 h-4 w-4"/>
            Reports
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="bir">
            <lucide_react_1.Receipt className="mr-2 h-4 w-4"/>
            BIR Tax
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* CALCULATOR TAB */}
        <tabs_1.TabsContent value="calculator">
          <div className="grid gap-6 md:grid-cols-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Contribution Calculator</card_1.CardTitle>
                <card_1.CardDescription>
                  Calculate SSS, PhilHealth, and Pag-IBIG contributions
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="salary">Monthly Salary (₱)</label_1.Label>
                  <input_1.Input id="salary" type="number" placeholder="25000"/>
                </div>
                <button_1.Button onClick={calculateContributions} disabled={loading} className="w-full">
                  Calculate Contributions
                </button_1.Button>

                {contributionCalc && (<div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">SSS Contribution</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Employee Share:</div>
                        <div className="font-medium">
                          ₱{contributionCalc.contributions.sss.ee_contribution}
                        </div>
                        <div>Employer Share:</div>
                        <div className="font-medium">
                          ₱{contributionCalc.contributions.sss.er_contribution}
                        </div>
                        <div>EC Fund:</div>
                        <div className="font-medium">
                          ₱{contributionCalc.contributions.sss.ec_contribution}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">PhilHealth Contribution</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Employee Share:</div>
                        <div className="font-medium">
                          ₱
                          {contributionCalc.contributions.philhealth
                .ee_contribution}
                        </div>
                        <div>Employer Share:</div>
                        <div className="font-medium">
                          ₱
                          {contributionCalc.contributions.philhealth
                .er_contribution}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">Pag-IBIG Contribution</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          Employee Share (
                          {contributionCalc.contributions.pagibig.ee_rate * 100}
                          %):
                        </div>
                        <div className="font-medium">
                          ₱
                          {contributionCalc.contributions.pagibig
                .ee_contribution}
                        </div>
                        <div>
                          Employer Share (
                          {contributionCalc.contributions.pagibig.er_rate * 100}
                          %):
                        </div>
                        <div className="font-medium">
                          ₱
                          {contributionCalc.contributions.pagibig
                .er_contribution}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 border-t pt-4">
                      <h3 className="font-semibold">Totals</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Total Employee Deduction:</div>
                        <div className="font-bold text-red-600">
                          ₱{contributionCalc.totals.total_employee_deduction}
                        </div>
                        <div>Total Employer Contribution:</div>
                        <div className="font-bold text-blue-600">
                          ₱{contributionCalc.totals.total_employer_contribution}
                        </div>
                      </div>
                    </div>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>VAT Calculator</card_1.CardTitle>
                <card_1.CardDescription>Calculate or extract 12% VAT</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="vat_operation">Operation</label_1.Label>
                  <select id="vat_operation" className="w-full rounded border p-2">
                    <option value="calculate_vat">
                      Extract VAT from Gross
                    </option>
                    <option value="add_vat">Add VAT to Net</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label_1.Label htmlFor="vat_amount">Amount (₱)</label_1.Label>
                  <input_1.Input id="vat_amount" type="number" placeholder="11200"/>
                </div>
                <button_1.Button onClick={calculateVAT} disabled={loading} className="w-full">
                  Calculate VAT
                </button_1.Button>

                {vatCalc && (<div className="space-y-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Net Amount:</div>
                      <div className="font-medium">₱{vatCalc.result.net}</div>
                      <div>VAT (12%):</div>
                      <div className="font-medium">₱{vatCalc.result.vat}</div>
                      <div className="font-semibold">Gross Amount:</div>
                      <div className="font-bold">₱{vatCalc.result.gross}</div>
                    </div>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        {/* REPORTS TAB */}
        <tabs_1.TabsContent value="reports">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Government Remittance Reports</card_1.CardTitle>
              <card_1.CardDescription>
                Generate monthly remittance reports for government agencies
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              <div className="space-y-2">
                <label_1.Label htmlFor="report_period">Period (YYYY-MM)</label_1.Label>
                <input_1.Input id="report_period" type="month"/>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <card_1.Card className="cursor-pointer hover:border-primary" onClick={() => generateReport("SSS")}>
                  <card_1.CardHeader className="pb-3">
                    <lucide_react_1.Building2 className="mb-2 h-8 w-8 text-primary"/>
                    <card_1.CardTitle className="text-lg">SSS Report</card_1.CardTitle>
                    <card_1.CardDescription>
                      Social Security System remittance
                    </card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <button_1.Button variant="outline" className="w-full" disabled={loading}>
                      <lucide_react_1.Download className="mr-2 h-4 w-4"/>
                      Generate
                    </button_1.Button>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card className="cursor-pointer hover:border-primary" onClick={() => generateReport("PHILHEALTH")}>
                  <card_1.CardHeader className="pb-3">
                    <lucide_react_1.Building2 className="mb-2 h-8 w-8 text-primary"/>
                    <card_1.CardTitle className="text-lg">PhilHealth Report</card_1.CardTitle>
                    <card_1.CardDescription>
                      Health insurance remittance
                    </card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <button_1.Button variant="outline" className="w-full" disabled={loading}>
                      <lucide_react_1.Download className="mr-2 h-4 w-4"/>
                      Generate
                    </button_1.Button>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card className="cursor-pointer hover:border-primary" onClick={() => generateReport("PAGIBIG")}>
                  <card_1.CardHeader className="pb-3">
                    <lucide_react_1.Building2 className="mb-2 h-8 w-8 text-primary"/>
                    <card_1.CardTitle className="text-lg">Pag-IBIG Report</card_1.CardTitle>
                    <card_1.CardDescription>Housing fund remittance</card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <button_1.Button variant="outline" className="w-full" disabled={loading}>
                      <lucide_react_1.Download className="mr-2 h-4 w-4"/>
                      Generate
                    </button_1.Button>
                  </card_1.CardContent>
                </card_1.Card>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">Report Information</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>
                    • Reports include all active employees with registered
                    government numbers
                  </li>
                  <li>• Calculations use 2025 contribution rates and tables</li>
                  <li>
                    • Reports are generated in JSON format (CSV/Excel export
                    coming soon)
                  </li>
                  <li>
                    • Ensure employee government numbers are updated before
                    generating
                  </li>
                </ul>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* BIR TAB */}
        <tabs_1.TabsContent value="bir">
          <div className="grid gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>BIR Tax Reports</card_1.CardTitle>
                <card_1.CardDescription>
                  Sales Book, Purchase Book, and Form 2307
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <card_1.Card className="cursor-pointer hover:border-primary">
                    <card_1.CardHeader className="pb-3">
                      <lucide_react_1.Receipt className="mb-2 h-8 w-8 text-primary"/>
                      <card_1.CardTitle className="text-lg">Sales Book</card_1.CardTitle>
                      <card_1.CardDescription>VAT sales register</card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <button_1.Button variant="outline" className="w-full" disabled={loading}>
                        <lucide_react_1.Download className="mr-2 h-4 w-4"/>
                        Generate
                      </button_1.Button>
                    </card_1.CardContent>
                  </card_1.Card>

                  <card_1.Card className="cursor-pointer hover:border-primary">
                    <card_1.CardHeader className="pb-3">
                      <lucide_react_1.Receipt className="mb-2 h-8 w-8 text-primary"/>
                      <card_1.CardTitle className="text-lg">Purchase Book</card_1.CardTitle>
                      <card_1.CardDescription>VAT purchase register</card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <button_1.Button variant="outline" className="w-full" disabled={loading}>
                        <lucide_react_1.Download className="mr-2 h-4 w-4"/>
                        Generate
                      </button_1.Button>
                    </card_1.CardContent>
                  </card_1.Card>

                  <card_1.Card className="cursor-pointer hover:border-primary">
                    <card_1.CardHeader className="pb-3">
                      <lucide_react_1.Receipt className="mb-2 h-8 w-8 text-primary"/>
                      <card_1.CardTitle className="text-lg">Form 2307</card_1.CardTitle>
                      <card_1.CardDescription>
                        Withholding tax certificate
                      </card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <button_1.Button variant="outline" className="w-full" disabled={loading}>
                        <lucide_react_1.Download className="mr-2 h-4 w-4"/>
                        Generate
                      </button_1.Button>
                    </card_1.CardContent>
                  </card_1.Card>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <h3 className="mb-2 font-semibold">BIR Compliance</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>
                      • Sales Book: Generated from approved invoices with 12%
                      VAT breakdown
                    </li>
                    <li>
                      • Purchase Book: Generated from approved expenses with
                      input VAT
                    </li>
                    <li>
                      • Form 2307: Certificate of creditable tax withheld at
                      source
                    </li>
                    <li>
                      • All calculations follow BIR regulations and 2025 tax
                      rates
                    </li>
                  </ul>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
