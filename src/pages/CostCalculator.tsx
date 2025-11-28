import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const FEES = [
  { name: 'Infrastructure and Tech Fee', amount: 432.00 },
  { name: 'Student Activity Fee', amount: 78.00 },
  { name: 'Academic Materials Program', amount: 239.99 }
];

const roomRates = [
  { type: 'Double', rate: 3477 },
  { type: 'Single', rate: 4428 },
  { type: 'Small Single', rate: 3973 },
  { type: 'Double Single', rate: 4685 },
];

const mealPlans = [
  { type: 'Unlimited Basic', rate: 3430 },
  { type: 'Unlimited Flex', rate: 3580 },
  { type: 'Unlimited Flex Plus', rate: 3780 },
  { type: 'H2O Plan', rate: 3050 },
  { type: 'Junior-Senior Flex', rate: 2900 },
  { type: 'Senior Flex', rate: 2850 },
  { type: '85 Flex', rate: 2000 },
  { type: '50 Plan', rate: 650 },
  { type: '25 Plan', rate: 325 },
  { type: 'Graduate/DTAV Plan', rate: 640 }
];

const CostCalculator = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [residencyStatus, setResidencyStatus] = useState<'in-state' | 'out-of-state' | ''>('');
  const [creditHours, setCreditHours] = useState('');
  const [housingType, setHousingType] = useState<'on-campus' | 'off-campus' | ''>('');
  const [roomType, setRoomType] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [wantsMealPlan, setWantsMealPlan] = useState<boolean | null>(null);
  const [selectedMealPlan, setSelectedMealPlan] = useState('');
  const [additionalFoodCost, setAdditionalFoodCost] = useState('');
  const [scholarships, setScholarships] = useState('');
  const [totalCost, setTotalCost] = useState<number>(0);

  useEffect(() => {
    calculateTotalCost();
  }, [roomType, monthlyRent, selectedMealPlan, additionalFoodCost, residencyStatus, creditHours, scholarships]);

  const calculateTotalCost = () => {
    let total = 0;

    if (residencyStatus && creditHours) {
      const creditHourRate = residencyStatus === 'in-state' ? 412 : 1108;
      total += parseFloat(creditHours) * creditHourRate;
    }

    if (housingType === 'on-campus' && roomType) {
      const selectedRoom = roomRates.find(room => room.type === roomType);
      if (selectedRoom) {
        total += selectedRoom.rate;
      }
    } else if (housingType === 'off-campus' && monthlyRent) {
      total += parseFloat(monthlyRent) * 4;
    }

    if (selectedMealPlan) {
      const selectedPlan = mealPlans.find(plan => plan.type === selectedMealPlan);
      if (selectedPlan) {
        total += selectedPlan.rate;
      }
    }

    if (additionalFoodCost) {
      total += parseFloat(additionalFoodCost) * 4;
    }

    if (scholarships) {
      total -= parseFloat(scholarships);
    }

    setTotalCost(total);
  };

  const calculateTotalWithFees = () => {
    const feesTotal = FEES.reduce((sum, fee) => sum + fee.amount, 0);
    return totalCost + feesTotal;
  };

  const handleCreateDebtAccount = () => {
    localStorage.setItem('pendingDebtAmount', calculateTotalWithFees().toString());
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tuition Cost Calculator</CardTitle>
          <CardDescription>Calculate your semester costs step by step</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>What year of school will you be entering?</Label>
                <Select value={yearOfStudy} onValueChange={setYearOfStudy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Year</SelectItem>
                    <SelectItem value="2">Second Year</SelectItem>
                    <SelectItem value="3">Third Year</SelectItem>
                    <SelectItem value="4">Fourth Year</SelectItem>
                    <SelectItem value="4+">Fourth Year+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setStep(2)} disabled={!yearOfStudy} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Are you an in-state or out-of-state student?</Label>
                <RadioGroup value={residencyStatus} onValueChange={(value) => setResidencyStatus(value as 'in-state' | 'out-of-state')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="in-state" id="in-state" />
                    <Label htmlFor="in-state">In-State Resident</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="out-of-state" id="out-of-state" />
                    <Label htmlFor="out-of-state">Out-of-State Student</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!residencyStatus} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>How many credit hours will you be taking this semester?</Label>
                <Input
                  type="number"
                  value={creditHours}
                  onChange={(e) => setCreditHours(e.target.value)}
                  placeholder="Enter credit hours (0-24)"
                  min={0}
                  max={24}
                />
                <p className="text-sm text-muted-foreground">
                  Tuition rate: ${residencyStatus === 'in-state' ? '412' : '1,108'} per credit hour
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (yearOfStudy === '1') {
                      setHousingType('on-campus');
                      setWantsMealPlan(true);
                      setStep(5);
                    } else {
                      setStep(4);
                    }
                  }}
                  disabled={!creditHours || parseFloat(creditHours) < 0 || parseFloat(creditHours) > 24}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 4 && yearOfStudy !== '1' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Will you be living on or off campus?</Label>
                <RadioGroup value={housingType} onValueChange={(value) => setHousingType(value as 'on-campus' | 'off-campus')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="on-campus" id="on-campus" />
                    <Label htmlFor="on-campus">On Campus</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="off-campus" id="off-campus" />
                    <Label htmlFor="off-campus">Off Campus</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(5)} disabled={!housingType} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 5 && housingType === 'on-campus' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select your room type:</Label>
                <Select value={roomType} onValueChange={setRoomType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomRates.map((room) => (
                      <SelectItem key={room.type} value={room.type}>
                        {room.type} - ${room.rate}/semester
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(4)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (yearOfStudy === '1') {
                      setStep(7);
                    } else {
                      setStep(6);
                    }
                  }}
                  disabled={!roomType}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 5 && housingType === 'off-campus' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Estimated monthly rent:</Label>
                <Input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  placeholder="Enter monthly rent"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(4)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(6)} disabled={!monthlyRent} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 6 && yearOfStudy !== '1' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Will you be purchasing a meal plan?</Label>
                <RadioGroup value={wantsMealPlan ? 'yes' : 'no'} onValueChange={(value) => setWantsMealPlan(value === 'yes')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">No</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(5)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(7)} disabled={wantsMealPlan === null} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 7 && (wantsMealPlan || yearOfStudy === '1') && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select your meal plan:</Label>
                <Select value={selectedMealPlan} onValueChange={setSelectedMealPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealPlans
                      .filter(plan => yearOfStudy === '1' ? plan.type.startsWith('Unlimited') : true)
                      .map((plan) => (
                        <SelectItem key={plan.type} value={plan.type}>
                          {plan.type} - ${plan.rate}/semester
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(6)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(8)} disabled={!selectedMealPlan} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {wantsMealPlan ? "Estimated monthly spending on food outside of meal plan:" : "Estimated monthly spending on groceries:"}
                </Label>
                <Input
                  type="number"
                  value={additionalFoodCost}
                  onChange={(e) => setAdditionalFoodCost(e.target.value)}
                  placeholder="Enter monthly food cost"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(7)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(9)} disabled={!additionalFoodCost} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Estimated total scholarships for the semester:</Label>
                <Input
                  type="number"
                  value={scholarships}
                  onChange={(e) => setScholarships(e.target.value)}
                  placeholder="Enter scholarship amount"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(8)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(10)} className="flex-1">
                  Finish
                </Button>
              </div>
            </div>
          )}

          {step === 10 && (
            <div className="space-y-4">
              <div className="p-4 bg-primary text-primary-foreground rounded-lg">
                <h3 className="text-lg font-bold mb-2">Final Cost Breakdown</h3>
                <p className="text-2xl font-bold">${calculateTotalWithFees().toLocaleString()}</p>
                <p className="text-sm mt-2">Subtotal: ${totalCost.toLocaleString()}</p>
                <p className="text-sm">Fees: ${FEES.reduce((sum, fee) => sum + fee.amount, 0).toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(9)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleCreateDebtAccount} className="flex-1">
                  Create Bill Account
                </Button>
                <Button onClick={() => setStep(1)} className="flex-1">
                  Start Over
                </Button>
              </div>
            </div>
          )}

          {step < 10 && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Estimated Semester Cost:</p>
              <p className="text-2xl font-bold">${totalCost.toLocaleString()}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CostCalculator;

