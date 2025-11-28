# Harmony Hub - Financial Planner

A comprehensive financial planning application built with React, TypeScript, Firebase, and shadcn-ui.

## Features

- 🔐 **Authentication:** Secure login with email/password and Google OAuth
- 💰 **Account Management:** Track savings and debt accounts
- 📊 **Transaction History:** Complete audit trail of all financial activities
- 📈 **Financial Reports:** Visual analytics with charts and graphs
- 🧮 **Cost Calculator:** Multi-step calculator for tuition and expenses
- 📅 **Payment Calendar:** View scheduled debt payments
- ⚙️ **Settings:** Customize your profile and preferences

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **UI Framework:** shadcn-ui + Tailwind CSS
- **Backend:** Firebase (Authentication + Firestore)
- **Charts:** Recharts
- **Routing:** React Router v6
- **Build Tool:** Vite

## Getting Started

### Quick Start

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Set up Firebase:**
   - Follow the [Quick Start Guide](./QUICK_START.md) or
   - See detailed instructions in [Firebase Setup Guide](./FIREBASE_SETUP.md)

3. **Create `.env` file:**
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn-ui components
│   ├── AccountCard.tsx  # Account display card
│   ├── FinancialSummary.tsx
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useAccounts.ts   # Account management
│   ├── useTransactions.ts
│   └── useFinancialSummary.ts
├── lib/                 # Utilities
│   ├── firebase-config.ts
│   ├── formatters.ts
│   └── utils.ts
├── pages/               # Page components
│   ├── Index.tsx        # Home/Dashboard
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Accounts.tsx
│   ├── TransactionHistory.tsx
│   ├── AddTransaction.tsx
│   ├── Reports.tsx
│   ├── CostCalculator.tsx
│   ├── Calendar.tsx
│   └── Settings.tsx
└── types/               # TypeScript definitions
    └── index.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Firebase Setup

This application requires Firebase for:
- **Authentication:** User sign-in and registration
- **Firestore:** Database for accounts and transactions

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed setup instructions.

## Features in Detail

### Account Management
- Create savings and debt accounts
- Set monthly payment schedules
- Link debt payments to savings accounts
- Track due dates and balances

### Transaction Tracking
- Automatic transaction creation on account changes
- Manual transaction entry
- Filter and search transactions
- View transaction history by account

### Financial Reports
- Net worth calculation
- Asset vs. liability breakdown
- Account balance trends over time
- Visual charts and graphs

### Cost Calculator
- Step-by-step tuition cost calculation
- Room and board options
- Meal plan selection
- Scholarship tracking
- Create debt account from calculated total

### Payment Calendar
- Visual calendar with payment dates
- Click dates to view scheduled payments
- Track multiple debt accounts

## Security

- Firestore security rules protect user data
- Authentication required for all protected routes
- User data isolated by user ID
- Environment variables for sensitive configuration

## Development

### Adding New Features

1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Create hooks in `src/hooks/` for data management
4. Update types in `src/types/index.ts`

### Styling

- Uses Tailwind CSS utility classes
- shadcn-ui components for consistent UI
- Custom components follow design system

## Deployment

### Firebase Hosting (Recommended)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login:
   ```bash
   firebase login
   ```

3. Initialize:
   ```bash
   firebase init hosting
   ```

4. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

### Other Platforms

- **Vercel:** Connect GitHub repo, set environment variables
- **Netlify:** Drag and drop `dist` folder, set environment variables
- **Any static host:** Upload `dist` folder after `npm run build`

## Environment Variables

Required environment variables (in `.env`):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for setup help
2. Review browser console for errors
3. Check Firebase Console for backend issues

## Acknowledgments

- Built with [shadcn-ui](https://ui.shadcn.com/)
- Powered by [Firebase](https://firebase.google.com/)
- Charts by [Recharts](https://recharts.org/)
