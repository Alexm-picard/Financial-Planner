import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { accountService } from '@/services/accountService';
import { MonthlyCalendar, CalendarEvent } from '@/components/MonthlyCalendar';
import { combineAllEvents, filterEventsForMonth } from '@/utils/calendarHelpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Account } from '@/types';

const Calendar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  // Dialog state
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  // Combine all events (local only - no Google Calendar)
  const allEvents = useMemo(() => {
    return combineAllEvents(accounts, currentMonth);
  }, [accounts, currentMonth]);

  // Filter events for current month
  const monthEvents = useMemo(() => {
    return filterEventsForMonth(allEvents, currentMonth);
  }, [allEvents, currentMonth]);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user?.sub) return;
      
      try {
        const response = await accountService.getAll(user.sub);
        
        // Convert MongoDB _id to id
        const fetchedAccounts = response.map((account: any) => ({
          id: account.id || account._id,
          ...account
        })) as Account[];
        
        setAccounts(fetchedAccounts);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };

    fetchAccounts();
  }, [user]);

  const handleDateClick = (date: Date, events: CalendarEvent[]) => {
    setSelectedDayDate(date);
    setSelectedDayEvents(events);
    setDayDialogOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handleMonthChange = (newDate: Date) => {
    setCurrentMonth(newDate);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">
              View all your events, payments, and due dates in one place
            </p>
          </div>
        </div>
      </div>

      {/* Event Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
          <span className="text-sm">Due Dates</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
          <span className="text-sm">Pay Dates</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></div>
          <span className="text-sm">Income/Paydays</span>
        </div>
      </div>

      {/* Monthly Calendar */}
      <Card>
        <CardContent className="p-6">
          <MonthlyCalendar
            currentDate={currentMonth}
            events={monthEvents}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onMonthChange={handleMonthChange}
            maxEventsPerDay={3}
          />
        </CardContent>
      </Card>

      {/* Day Events Dialog */}
      <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDayDate && format(selectedDayDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
            <DialogDescription>
              {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'event' : 'events'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {selectedDayEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No events scheduled for this day
              </p>
            ) : (
              selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => {
                    setDayDialogOpen(false);
                    handleEventClick(event);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      event.type === 'due-date' ? 'bg-red-500' :
                      event.type === 'pay-date' ? (event.data?.frequency ? 'bg-purple-500' : 'bg-blue-500') :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{event.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {event.type === 'due-date' ? 'Due Date' :
                           event.type === 'pay-date' ? (event.data?.frequency ? 'Income' : 'Pay Date') :
                           'Event'}
                        </Badge>
                      </div>
                      {event.type === 'due-date' && event.data?.account && (
                        <p className="text-sm text-muted-foreground">
                          Amount: {formatCurrency(event.data.account.balance)}
                        </p>
                      )}
                      {event.type === 'pay-date' && event.data?.amount && (
                        <p className="text-sm text-muted-foreground">
                          {event.data?.frequency ? 'Earnings' : 'Amount'}: {formatCurrency(event.data.amount)}
                          {event.data?.frequency && (
                            <span className="ml-2 text-xs">({event.data.frequency === 'bi-weekly' ? 'Bi-Weekly' : event.data.frequency})</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Single Event Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              {selectedEvent && format(selectedEvent.date, 'EEEE, MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {selectedEvent.type === 'due-date' ? 'Due Date' :
                   selectedEvent.type === 'pay-date' ? 'Pay Date' :
                   'Event'}
                </Badge>
              </div>

              {selectedEvent.type === 'due-date' && selectedEvent.data?.account && (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium mb-1">Account</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.data.account.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Amount Due</p>
                    <p className="text-lg font-semibold text-red-600">
                      {formatCurrency(selectedEvent.data.account.balance)}
                    </p>
                  </div>
                </div>
              )}

              {selectedEvent.type === 'pay-date' && selectedEvent.data && (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium mb-1">Account</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.data.account.name}</p>
                  </div>
                  {selectedEvent.data.frequency ? (
                    // Income schedule event
                    <>
                      <div>
                        <p className="text-sm font-medium mb-1">Estimated Earnings</p>
                        <p className="text-lg font-semibold text-purple-600">
                          {formatCurrency(selectedEvent.data.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Frequency</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {selectedEvent.data.frequency === 'bi-weekly' ? 'Bi-Weekly' : selectedEvent.data.frequency}
                        </p>
                      </div>
                    </>
                  ) : (
                    // Regular payment event
                    <>
                      <div>
                        <p className="text-sm font-medium mb-1">Payment Amount</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {formatCurrency(selectedEvent.data.amount)}
                        </p>
                      </div>
                      {selectedEvent.data.account.monthlyPayment?.linkedAccountId && (
                        <div>
                          <p className="text-sm font-medium mb-1">From Account</p>
                          <p className="text-sm text-muted-foreground">
                            {accounts.find(acc => acc.id === selectedEvent.data.account.monthlyPayment?.linkedAccountId)?.name}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;

