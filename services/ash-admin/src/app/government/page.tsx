"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Calculator,
  Download,
  Building2, Users,
  Receipt,
} from "lucide-react";

export default function GovernmentReportsPage() {
  const [loading, setLoading] = useState(false);
  const [contributionCalc, setContributionCalc] = useState<any>(null);
  const [vatCalc, setVatCalc] = useState<any>(null);

  const calculateContributions = async () => {
    setLoading(true);
    try {
      const salary = (document.getElementById("salary") as HTMLInputElement)
        .value;
      const res = await fetch(
        `/api/government/reports?monthly_salary=${salary}`
      );
      const data = await res.json();
      setContributionCalc(data);
    } catch (error) {
      console.error("Error calculating contributions:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateVAT = async () => {
    setLoading(true);
    try {
      const amount = (document.getElementById("vat_amount") as HTMLInputElement)
        .value;
      const operation = (
        document.getElementById("vat_operation") as HTMLSelectElement
      ).value;
      const res = await fetch(
        `/api/government/bir?operation=${operation}&amount=${amount}`
      );
      const data = await res.json();
      setVatCalc(data);
    } catch (error) {
      console.error("Error calculating VAT:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (agency: string) => {
    setLoading(true);
    try {
      const period = (
        document.getElementById("report_period") as HTMLInputElement
      ).value;
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
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Government Compliance</h1>
          <p className="text-muted-foreground">
            BIR, SSS, PhilHealth, and Pag-IBIG reports
          </p>
        </div>
      </div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calculator">
            <Calculator className="mr-2 h-4 w-4" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="bir">
            <Receipt className="mr-2 h-4 w-4" />
            BIR Tax
          </TabsTrigger>
        </TabsList>

        {/* CALCULATOR TAB */}
        <TabsContent value="calculator">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contribution Calculator</CardTitle>
                <CardDescription>
                  Calculate SSS, PhilHealth, and Pag-IBIG contributions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Monthly Salary (₱)</Label>
                  <Input id="salary" type="number" placeholder="25000" />
                </div>
                <Button
                  onClick={calculateContributions}
                  disabled={loading}
                  className="w-full"
                >
                  Calculate Contributions
                </Button>

                {contributionCalc && (
                  <div className="space-y-4 border-t pt-4">
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
                          {
                            contributionCalc.contributions.philhealth
                              .ee_contribution
                          }
                        </div>
                        <div>Employer Share:</div>
                        <div className="font-medium">
                          ₱
                          {
                            contributionCalc.contributions.philhealth
                              .er_contribution
                          }
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
                          {
                            contributionCalc.contributions.pagibig
                              .ee_contribution
                          }
                        </div>
                        <div>
                          Employer Share (
                          {contributionCalc.contributions.pagibig.er_rate * 100}
                          %):
                        </div>
                        <div className="font-medium">
                          ₱
                          {
                            contributionCalc.contributions.pagibig
                              .er_contribution
                          }
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
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>VAT Calculator</CardTitle>
                <CardDescription>Calculate or extract 12% VAT</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vat_operation">Operation</Label>
                  <select
                    id="vat_operation"
                    className="w-full rounded border p-2"
                  >
                    <option value="calculate_vat">
                      Extract VAT from Gross
                    </option>
                    <option value="add_vat">Add VAT to Net</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat_amount">Amount (₱)</Label>
                  <Input id="vat_amount" type="number" placeholder="11200" />
                </div>
                <Button
                  onClick={calculateVAT}
                  disabled={loading}
                  className="w-full"
                >
                  Calculate VAT
                </Button>

                {vatCalc && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Net Amount:</div>
                      <div className="font-medium">₱{vatCalc.result.net}</div>
                      <div>VAT (12%):</div>
                      <div className="font-medium">₱{vatCalc.result.vat}</div>
                      <div className="font-semibold">Gross Amount:</div>
                      <div className="font-bold">₱{vatCalc.result.gross}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* REPORTS TAB */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Government Remittance Reports</CardTitle>
              <CardDescription>
                Generate monthly remittance reports for government agencies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="report_period">Period (YYYY-MM)</Label>
                <Input id="report_period" type="month" />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card
                  className="cursor-pointer hover:border-primary"
                  onClick={() => generateReport("SSS")}
                >
                  <CardHeader className="pb-3">
                    <Building2 className="mb-2 h-8 w-8 text-primary" />
                    <CardTitle className="text-lg">SSS Report</CardTitle>
                    <CardDescription>
                      Social Security System remittance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={loading}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Generate
                    </Button>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:border-primary"
                  onClick={() => generateReport("PHILHEALTH")}
                >
                  <CardHeader className="pb-3">
                    <Building2 className="mb-2 h-8 w-8 text-primary" />
                    <CardTitle className="text-lg">PhilHealth Report</CardTitle>
                    <CardDescription>
                      Health insurance remittance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={loading}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Generate
                    </Button>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:border-primary"
                  onClick={() => generateReport("PAGIBIG")}
                >
                  <CardHeader className="pb-3">
                    <Building2 className="mb-2 h-8 w-8 text-primary" />
                    <CardTitle className="text-lg">Pag-IBIG Report</CardTitle>
                    <CardDescription>Housing fund remittance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={loading}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Generate
                    </Button>
                  </CardContent>
                </Card>
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
                    • Reports are generated in JSON format - Copy data to Excel for filing
                  </li>
                  <li>
                    • Ensure employee government numbers are updated before
                    generating
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BIR TAB */}
        <TabsContent value="bir">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>BIR Tax Reports</CardTitle>
                <CardDescription>
                  Sales Book, Purchase Book, and Form 2307
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="cursor-pointer hover:border-primary">
                    <CardHeader className="pb-3">
                      <Receipt className="mb-2 h-8 w-8 text-primary" />
                      <CardTitle className="text-lg">Sales Book</CardTitle>
                      <CardDescription>VAT sales register</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:border-primary">
                    <CardHeader className="pb-3">
                      <Receipt className="mb-2 h-8 w-8 text-primary" />
                      <CardTitle className="text-lg">Purchase Book</CardTitle>
                      <CardDescription>VAT purchase register</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:border-primary">
                    <CardHeader className="pb-3">
                      <Receipt className="mb-2 h-8 w-8 text-primary" />
                      <CardTitle className="text-lg">Form 2307</CardTitle>
                      <CardDescription>
                        Withholding tax certificate
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
