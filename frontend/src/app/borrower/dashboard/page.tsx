"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Plus, Clock, CheckCircle2, XCircle, Banknote, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Loan {
  _id: string;
  loanAmount: number;
  tenureDays: number;
  status: string;
  totalRepayment: number;
  outstandingBalance: number;
  createdAt: string;
  rejectionReason?: string;
}

export default function BorrowerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await api.get("/loans/my-loans");
        setLoans(res.data.loans);
      } catch (error) {
        toast.error("Failed to load loans");
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchLoans();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'APPROVED': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'DISBURSED': return <Banknote className="h-5 w-5 text-indigo-500" />;
      case 'REJECTED': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DISBURSED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}. Here is your loan history.</p>
        </div>
        <Link href="/borrower/apply">
          <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Apply for New Loan
          </Button>
        </Link>
      </div>

      {loans.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center rounded-3xl border-dashed">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Banknote className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No loans found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">You haven't applied for any loans yet. Click the button below to get started in minutes.</p>
          <Link href="/borrower/apply">
            <Button>Apply Now</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loans.map((loan) => (
            <div key={loan._id} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                {getStatusIcon(loan.status)}
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(loan.status)}`}>
                  {loan.status}
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(loan.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-1">Loan Amount</p>
                <h2 className="text-3xl font-bold">₹{loan.loanAmount.toLocaleString()}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" /> Tenure
                  </div>
                  <p className="font-medium">{loan.tenureDays} Days</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Banknote className="h-4 w-4" /> Total Repayment
                  </div>
                  <p className="font-medium text-primary">₹{loan.totalRepayment.toLocaleString()}</p>
                </div>
              </div>

              {loan.status === 'REJECTED' && loan.rejectionReason && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <strong>Reason for Rejection:</strong> {loan.rejectionReason}
                </div>
              )}
              {['DISBURSED', 'CLOSED'].includes(loan.status) && (
                <div className="mt-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm flex justify-between">
                  <strong>Outstanding:</strong> 
                  <span className="font-mono">₹{loan.outstandingBalance.toLocaleString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
