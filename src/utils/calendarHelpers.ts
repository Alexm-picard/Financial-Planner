import { parseISO, startOfDay, addWeeks, addMonths } from 'date-fns';
import { CalendarEvent } from '@/components/MonthlyCalendar';
import { Account } from '@/types';

/**
 * Convert account due dates to calendar events
 */
export function getDueDateEvents(accounts: Account[]): CalendarEvent[] {
  return accounts
    .filter(account => account.type === 'debt' && account.dueDate)
    .map(account => ({
      id: `due-${account.id}-${account.dueDate}`,
      title: `${account.name} Due`,
      date: startOfDay(parseISO(account.dueDate + 'T00:00:00')),
      type: 'due-date' as const,
      color: 'bg-red-100 text-red-700 border border-red-200',
      data: {
        account,
        amount: account.balance
      }
    }));
}

/**
 * Convert account pay dates to calendar events
 */
export function getPayDateEvents(accounts: Account[]): CalendarEvent[] {
  return accounts
    .filter(account => 
      account.type === 'debt' && 
      account.monthlyPayment && 
      account.monthlyPayment.nextPaymentDate
    )
    .map(account => ({
      id: `pay-${account.id}-${account.monthlyPayment!.nextPaymentDate}`,
      title: `Pay ${account.name}`,
      date: startOfDay(parseISO(account.monthlyPayment!.nextPaymentDate + 'T00:00:00')),
      type: 'pay-date' as const,
      color: 'bg-blue-100 text-blue-700 border border-blue-200',
      data: {
        account,
        amount: account.monthlyPayment!.amount
      }
    }));
}

/**
 * Convert income schedule pay dates to calendar events
 * Generates recurring events based on frequency
 */
export function getIncomeScheduleEvents(accounts: Account[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const now = new Date();
  const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, 0);

  accounts
    .filter(account => 
      account.type === 'savings' && 
      account.incomeSchedule && 
      account.incomeSchedule.payDayDate
    )
    .forEach(account => {
      const schedule = account.incomeSchedule!;
      const baseDate = startOfDay(parseISO(schedule.payDayDate + 'T00:00:00'));
      let currentDate = new Date(baseDate);

      // Generate events for the next 3 months
      while (currentDate <= threeMonthsFromNow) {
      events.push({
        id: `income-${account.id}-${currentDate.toISOString()}`,
        title: `${account.name} Payday`,
        date: currentDate,
        type: 'pay-date' as const, // Using pay-date type for consistency
        color: 'bg-purple-100 text-purple-700 border border-purple-200',
        data: {
          account,
          amount: account.balance, // Use balance as the amount per frequency
          frequency: schedule.frequency
        }
      });

        // Calculate next pay date based on frequency
        if (schedule.frequency === 'weekly') {
          currentDate = addWeeks(currentDate, 1);
        } else if (schedule.frequency === 'bi-weekly') {
          currentDate = addWeeks(currentDate, 2);
        } else if (schedule.frequency === 'monthly') {
          currentDate = addMonths(currentDate, 1);
        }
      }
    });

  return events;
}

/**
 * Combine all event types into a single array
 */
export function combineAllEvents(
  accounts: Account[],
  currentMonth: Date
): CalendarEvent[] {
  const dueDateEvents = getDueDateEvents(accounts);
  const payDateEvents = getPayDateEvents(accounts);
  const incomeScheduleEvents = getIncomeScheduleEvents(accounts);

  return [
    ...dueDateEvents,
    ...payDateEvents,
    ...incomeScheduleEvents
  ].sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Filter events for a specific month
 */
export function filterEventsForMonth(
  events: CalendarEvent[],
  monthDate: Date
): CalendarEvent[] {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

  return events.filter(event => {
    const eventDate = event.date;
    return eventDate >= monthStart && eventDate <= monthEnd;
  });
}

