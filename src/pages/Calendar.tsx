import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { formatCurrency } from '@/lib/formatters';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { isSameDay } from 'date-fns';

interface Account {
  id?: string;
  name: string;
  balance: number;
  dueDate: string | null;
  type: 'savings' | 'debt';
  monthlyPayment?: {
    amount: number;
    linkedAccountId: string;
    nextPaymentDate: string;
  } | null;
}

const Calendar = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDayPayments, setSelectedDayPayments] = useState<Account[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!auth.currentUser) return;
      
      const accountsQuery = query(
        collection(db, 'accounts'),
        where('userId', '==', auth.currentUser.uid)
      );
      
      const querySnapshot = await getDocs(accountsQuery);
      const fetchedAccounts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Account[];
      
      setAccounts(fetchedAccounts);
    };

    fetchAccounts();
  }, []);

  const handleDateClick = (date: Date) => {
    const payments = accounts.filter(account => 
      account.type === 'debt' && 
      account.monthlyPayment && 
      isSameDay(new Date(account.monthlyPayment.nextPaymentDate + 'T00:00:00'), date)
    );
    
    if (payments.length > 0) {
      setSelectedDayPayments(payments);
      setOpenDialog(true);
    }
  };

  const getDatesWithPayments = () => {
    return accounts
      .filter(account => account.type === 'debt' && account.monthlyPayment)
      .map(account => new Date(account.monthlyPayment!.nextPaymentDate + 'T00:00:00'));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Calendar</CardTitle>
          <CardDescription>
            View scheduled debt payments on the calendar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  handleDateClick(date);
                }
              }}
              modifiers={{
                hasPayments: getDatesWithPayments(),
              }}
              modifiersClassNames={{
                hasPayments: 'bg-destructive/10 text-destructive font-bold',
              }}
              className="rounded-md border"
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payments Due</DialogTitle>
            <DialogDescription>
              Payments scheduled for {selectedDate.toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {selectedDayPayments.map((account) => (
              <div key={account.id} className="p-3 border rounded-lg">
                <p className="font-semibold">{account.name}</p>
                <p className="text-sm text-muted-foreground">
                  Amount: {formatCurrency(account.monthlyPayment?.amount || 0)}
                </p>
                {account.monthlyPayment?.linkedAccountId && (
                  <p className="text-sm text-muted-foreground">
                    From: {accounts.find(acc => acc.id === account.monthlyPayment?.linkedAccountId)?.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;

