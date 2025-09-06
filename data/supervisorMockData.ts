// Types spécifiques au superviseur
export interface LoanRequest {
    id: string;
    clientId: string;
    clientName: string;
    clientPhone: string;
    clientProfession: string;
    savingsAccountId: string;
    reliabilityScore: number;
    requestedAmount: number;
    requestedDuration: number;
    purpose: string;
    monthlyIncome: number;
    monthlyExpenses: number;
    guaranteeType: string;
    guaranteeValue?: number;
    requestDate: string;
    status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'transferred';
    urgency: 'low' | 'medium' | 'high';
    documents: {
      identity: boolean;
      income: boolean;
      guarantee: boolean;
    };
    savingsHistory: {
      accountAge: number; // en mois
      totalDeposits: number;
      averageBalance: number;
      regularityScore: number;
    };
    tontineHistory?: {
      activeTontines: number;
      totalContributions: number;
      missedPayments: number;
    };
  }
  
  export interface LoanApproval {
    loanRequestId: string;
    approvedAmount: number;
    interestRate: number;
    duration: number; // en mois
    monthlyPayment: number;
    startDate: string;
    endDate: string;
    conditions: string[];
    supervisorNotes: string;
  }
  
  export interface ActiveLoan {
    id: string;
    clientId: string;
    clientName: string;
    approvedAmount: number;
    remainingAmount: number;
    interestRate: number;
    monthlyPayment: number;
    paymentsDue: number;
    paymentsTotal: number;
    startDate: string;
    endDate: string;
    status: 'current' | 'late' | 'defaulted' | 'completed';
    daysLate?: number;
    lastPaymentDate?: string;
    nextPaymentDate: string;
  }
  
  export interface ReliabilityScore {
    clientId: string;
    clientName: string;
    overallScore: number;
    savingsScore: number;
    tontineScore: number;
    paymentHistory: number;
    accountAge: number;
    lastUpdated: string;
    riskLevel: 'low' | 'medium' | 'high';
    details: {
      totalSavings: number;
      averageBalance: number;
      tontineParticipation: number;
      missedPayments: number;
      onTimePayments: number;
    };
  }
  
  // Données mockées
  export const mockLoanRequests: LoanRequest[] = [
    {
      id: "LR001",
      clientId: "CL001", 
      clientName: "Marie Adjovi",
      clientPhone: "+229 97 XX XX XX",
      clientProfession: "Vendeuse de tissus",
      savingsAccountId: "SA001",
      reliabilityScore: 85,
      requestedAmount: 500000,
      requestedDuration: 12,
      purpose: "Achat de marchandises pour boutique",
      monthlyIncome: 180000,
      monthlyExpenses: 120000,
      guaranteeType: "Caution solidaire",
      requestDate: "2025-06-28T10:30:00Z",
      status: "pending",
      urgency: "medium",
      documents: {
        identity: true,
        income: true,
        guarantee: false
      },
      savingsHistory: {
        accountAge: 8,
        totalDeposits: 1200000,
        averageBalance: 150000,
        regularityScore: 88
      },
      tontineHistory: {
        activeTontines: 2,
        totalContributions: 450000,
        missedPayments: 1
      }
    },
    {
      id: "LR002",
      clientId: "CL002",
      clientName: "Fatima Osseni",
      clientPhone: "+229 96 XX XX XX", 
      clientProfession: "Couturière",
      savingsAccountId: "SA002",
      reliabilityScore: 92,
      requestedAmount: 300000,
      requestedDuration: 8,
      purpose: "Achat machine à coudre industrielle",
      monthlyIncome: 150000,
      monthlyExpenses: 90000,
      guaranteeType: "Gage sur équipement",
      guaranteeValue: 400000,
      requestDate: "2025-06-27T14:15:00Z",
      status: "under_review",
      urgency: "low",
      documents: {
        identity: true,
        income: true,
        guarantee: true
      },
      savingsHistory: {
        accountAge: 15,
        totalDeposits: 2100000,
        averageBalance: 180000,
        regularityScore: 95
      },
      tontineHistory: {
        activeTontines: 1,
        totalContributions: 780000,
        missedPayments: 0
      }
    },
    {
      id: "LR003",
      clientId: "CL003",
      clientName: "Grace Kponou",
      clientPhone: "+229 94 XX XX XX",
      clientProfession: "Transformatrice de manioc", 
      savingsAccountId: "SA003",
      reliabilityScore: 76,
      requestedAmount: 750000,
      requestedDuration: 18,
      purpose: "Équipement transformation agricole",
      monthlyIncome: 200000,
      monthlyExpenses: 140000,
      guaranteeType: "Hypothèque terrain",
      guaranteeValue: 1200000,
      requestDate: "2025-06-26T09:45:00Z",
      status: "pending",
      urgency: "high",
      documents: {
        identity: true,
        income: false,
        guarantee: true
      },
      savingsHistory: {
        accountAge: 6,
        totalDeposits: 890000,
        averageBalance: 120000,
        regularityScore: 78
      },
      tontineHistory: {
        activeTontines: 3,
        totalContributions: 320000,
        missedPayments: 3
      }
    },
    {
      id: "LR004",
      clientId: "CL004",
      clientName: "Rachelle Bankole",
      clientPhone: "+229 98 XX XX XX",
      clientProfession: "Restauratrice",
      savingsAccountId: "SA004", 
      reliabilityScore: 88,
      requestedAmount: 400000,
      requestedDuration: 10,
      purpose: "Extension restaurant",
      monthlyIncome: 220000,
      monthlyExpenses: 160000,
      guaranteeType: "Caution solidaire",
      requestDate: "2025-06-25T16:20:00Z",
      status: "approved",
      urgency: "medium",
      documents: {
        identity: true,
        income: true,
        guarantee: true
      },
      savingsHistory: {
        accountAge: 12,
        totalDeposits: 1600000,
        averageBalance: 160000,
        regularityScore: 90
      },
      tontineHistory: {
        activeTontines: 2,
        totalContributions: 600000,
        missedPayments: 0
      }
    }
  ];
  
  export const mockActiveLoans: ActiveLoan[] = [
    {
      id: "AL001",
      clientId: "CL005",
      clientName: "Aimée Gbaguidi",
      approvedAmount: 600000,
      remainingAmount: 420000,
      interestRate: 2.5,
      monthlyPayment: 55000,
      paymentsDue: 8,
      paymentsTotal: 12,
      startDate: "2024-11-01",
      endDate: "2025-10-31",
      status: "current",
      lastPaymentDate: "2025-05-15",
      nextPaymentDate: "2025-07-01"
    },
    {
      id: "AL002", 
      clientId: "CL006",
      clientName: "Sandrine Azonhiho",
      approvedAmount: 350000,
      remainingAmount: 280000,
      interestRate: 2.0,
      monthlyPayment: 38000,
      paymentsDue: 8,
      paymentsTotal: 10,
      startDate: "2024-12-15",
      endDate: "2025-09-15",
      status: "late",
      daysLate: 12,
      lastPaymentDate: "2025-05-20",
      nextPaymentDate: "2025-06-15"
    },
    {
      id: "AL003",
      clientId: "CL007", 
      clientName: "Lucie Ayédoun",
      approvedAmount: 800000,
      remainingAmount: 560000,
      interestRate: 3.0,
      monthlyPayment: 68000,
      paymentsDue: 9,
      paymentsTotal: 15,
      startDate: "2024-10-01",
      endDate: "2025-12-31",
      status: "current",
      lastPaymentDate: "2025-06-01",
      nextPaymentDate: "2025-07-01"
    },
    {
      id: "AL004",
      clientId: "CL008",
      clientName: "Estelle Houngbo", 
      approvedAmount: 450000,
      remainingAmount: 180000,
      interestRate: 2.8,
      monthlyPayment: 48000,
      paymentsDue: 4,
      paymentsTotal: 12,
      startDate: "2024-08-01",
      endDate: "2025-07-31",
      status: "current",
      lastPaymentDate: "2025-06-01",
      nextPaymentDate: "2025-07-01"
    }
  ];
  
  export const mockReliabilityScores: ReliabilityScore[] = [
    {
      clientId: "CL001",
      clientName: "Marie Adjovi",
      overallScore: 85,
      savingsScore: 88,
      tontineScore: 82,
      paymentHistory: 85,
      accountAge: 8,
      lastUpdated: "2025-06-28T08:00:00Z",
      riskLevel: "low",
      details: {
        totalSavings: 1200000,
        averageBalance: 150000,
        tontineParticipation: 2,
        missedPayments: 1,
        onTimePayments: 47
      }
    },
    {
      clientId: "CL002", 
      clientName: "Fatima Osseni",
      overallScore: 92,
      savingsScore: 95,
      tontineScore: 90,
      paymentHistory: 92,
      accountAge: 15,
      lastUpdated: "2025-06-28T08:00:00Z",
      riskLevel: "low",
      details: {
        totalSavings: 2100000,
        averageBalance: 180000,
        tontineParticipation: 1,
        missedPayments: 0,
        onTimePayments: 78
      }
    },
    {
      clientId: "CL003",
      clientName: "Grace Kponou", 
      overallScore: 76,
      savingsScore: 78,
      tontineScore: 74,
      paymentHistory: 76,
      accountAge: 6,
      lastUpdated: "2025-06-28T08:00:00Z",
      riskLevel: "medium",
      details: {
        totalSavings: 890000,
        averageBalance: 120000,
        tontineParticipation: 3,
        missedPayments: 3,
        onTimePayments: 32
      }
    }
  ];
  
  // Statistiques pour le dashboard
  export const supervisorStats = {
    totalLoanRequests: 4,
    pendingRequests: 2,
    approvedThisMonth: 8,
    rejectedThisMonth: 2,
    activeLoans: 4,
    overdueLoans: 1,
    totalAmountManaged: 2400000,
    averageApprovalTime: 3.2, // en jours
    portfolioPerformance: 94.5, // en %
  };